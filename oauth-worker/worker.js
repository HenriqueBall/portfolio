// Proxy OAuth do Decap CMS (backend GitHub) para Cloudflare Workers.
//
// Por que existe: o login com GitHub precisa trocar um "code" por um token usando o
// Client Secret do OAuth App. Esse segredo não pode ficar no navegador nem no repositório,
// e o GitHub Pages não roda código de servidor. Este Worker faz só essa troca.
//
// Variáveis do Worker (Settings → Variables and Secrets):
//   GITHUB_CLIENT_ID      (texto)   Client ID do OAuth App
//   GITHUB_CLIENT_SECRET  (secret)  Client Secret do OAuth App
//   ALLOWED_ORIGINS       (texto)   Origens do site, separadas por vírgula. Ex.:
//                                   https://henriqueball.github.io,https://portfolio.henriqueballeiras.com.br
//   GITHUB_SCOPE          (texto, opcional) Padrão: public_repo (basta para repositório público)
//
// Rotas: /auth (inicia o login) e /callback (URL de callback do OAuth App).

const AUTHORIZE_URL = 'https://github.com/login/oauth/authorize';
const TOKEN_URL = 'https://github.com/login/oauth/access_token';
const STATE_COOKIE = 'decap_oauth_state';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/auth') return startAuth(url, env);
    if (url.pathname === '/callback') return finishAuth(request, url, env);
    return new Response('Proxy OAuth do Decap CMS: OK', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  },
};

function startAuth(url, env) {
  if (!env.GITHUB_CLIENT_ID) return textError('GITHUB_CLIENT_ID não configurado no Worker.');
  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/callback`,
    // O escopo é definido aqui, não pelo navegador: menor privilégio garantido.
    scope: env.GITHUB_SCOPE || 'public_repo',
    state,
  });
  return new Response(null, {
    status: 302,
    headers: {
      Location: `${AUTHORIZE_URL}?${params}`,
      'Set-Cookie': `${STATE_COOKIE}=${state}; Path=/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      'Cache-Control': 'no-store',
    },
  });
}

async function finishAuth(request, url, env) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = request.headers.get('Cookie') || '';
  const savedState = cookie.match(new RegExp(`(?:^|;\\s*)${STATE_COOKIE}=([^;]+)`))?.[1];

  if (!code || !state || !savedState || state !== savedState) {
    return handshakePage('error', { message: 'Sessão de login inválida ou expirada. Feche esta janela e tente de novo.' }, env);
  }

  let data = {};
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'decap-oauth-worker' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/callback`,
      }),
    });
    data = await res.json();
  } catch {
    data = {};
  }

  if (!data.access_token) {
    return handshakePage('error', { message: data.error_description || 'Não foi possível obter o token do GitHub.' }, env);
  }
  return handshakePage('success', { token: data.access_token, provider: 'github' }, env);
}

// Página que roda no popup e entrega o resultado ao Decap via postMessage.
// O token só é enviado para origens listadas em ALLOWED_ORIGINS.
function handshakePage(status, content, env) {
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const safe = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
  const html = `<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Entrando…</title></head>
<body>
<p>Concluindo o login… Esta janela fecha sozinha.</p>
<script>
(() => {
  const allowed = ${safe(allowed)};
  const message = ${safe(message)};
  function receive(event) {
    if (!allowed.includes(event.origin)) return;
    window.removeEventListener('message', receive);
    window.opener.postMessage(message, event.origin);
  }
  window.addEventListener('message', receive);
  if (window.opener) window.opener.postMessage('authorizing:github', '*');
  else document.body.textContent = 'Abra o painel pelo endereço /admin do site.';
})();
</script>
</body>
</html>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${STATE_COOKIE}=; Path=/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    },
  });
}

function textError(message) {
  return new Response(message, { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
