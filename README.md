# Portfólio — Henrique Balleiras

Site-portfólio de página única: apresentação, quatro categorias de projetos em carrossel e vídeo do YouTube abrindo em modal. O conteúdo é editado pelo Henrique num painel web (`/admin`, Decap CMS) e o site é publicado automaticamente no GitHub Pages.

- **Status:** V1 — Fase 1 concluída e publicada. Fase 2 (login do painel) montada nas contas do Felipe: Worker publicado e `config.yml` apontando para ele; falta testar com a conta do Henrique e migrar. Pendente: Fase 3 (domínio).
- **Repositório:** https://github.com/HenriqueBall/portfolio
- **Site (provisório):** https://henriqueball.github.io/portfolio/  ·  **Painel:** https://henriqueball.github.io/portfolio/admin/
- **Responsável técnico:** Felipe Sardim
- **Dono do conteúdo:** Henrique Balleiras

---

## 1. Arquitetura

```
Henrique (navegador) ──► site/admin  (Decap CMS, carregado da CDN)
                              │  "Entrar com GitHub"
                              ▼
                   Cloudflare Worker (proxy OAuth, plano grátis)
                              │  token de acesso
                              ▼
     Repositório GitHub ── commit no main ──► GitHub Actions: node build.js
       content/*.json                                   │
       static/img/uploads/                              ▼
                                               GitHub Pages (_site/)
                                                        ▲
                                    DNS Registro.br (CNAME do subdomínio)
```

**Como uma edição chega ao ar:** o Henrique salva no `/admin` → o Decap grava um commit no repositório (JSON e/ou imagem) → o workflow `Publicar site` roda o build → o GitHub Pages publica. Leva de 1 a 2 minutos.

**Decisões de arquitetura**

| Decisão | Motivo | Trade-off aceito |
|---|---|---|
| Site estático, sem servidor | Custo zero, nada para atualizar por segurança | Toda mudança de layout é código |
| Decap CMS com backend GitHub | Painel gratuito; quem tem acesso ao repositório entra no painel | Henrique precisa de conta no GitHub |
| **Build em Node puro (`build.js`) em vez de Eleventy** | Zero dependências: nada para `npm install`, nada para atualizar, build testável em qualquer máquina com Node | Template em JavaScript (`src/page.js`) em vez de uma linguagem de template |
| Uma página, categorias fixas | Escopo da V1 | Criar uma categoria exige mudança de código (ver §6.3) |
| `<dialog>` nativo para o modal | Foco preso, ESC e fundo inerte nativos do navegador | Navegadores muito antigos (anteriores a 2022) não abrem o modal |
| YouTube via `youtube-nocookie.com`, carregado só ao abrir o modal | Página leve; sem cookies de rastreamento até o visitante dar play | — |

## 2. Dependências

| Item | Para quê | Custo |
|---|---|---|
| Node.js ≥ 20 | Rodar `build.js` (local e no GitHub Actions) | Grátis |
| Decap CMS 3.x (CDN unpkg) | Painel `/admin` | Grátis (MIT) |
| GitHub (conta do Henrique) | Repositório, Actions, Pages, login do painel | Grátis (repositório público) |
| Cloudflare Workers | Proxy OAuth do login do painel (`oauth-worker/worker.js`) | Grátis |
| Domínio no Registro.br | Endereço `portfolio.<dominio>.com.br` (opcional) | Já pago pelo Henrique |

Não há `node_modules` nem `package-lock.json`: o projeto não usa pacotes npm.

## 3. Estrutura de pastas

```
├─ build.js                  Lê content/, gera _site/index.html e copia static/
├─ serve.js                  Servidor local para revisar _site/
├─ src/page.js               Template HTML da página (cabeçalho, apresentação, carrosséis, modal)
├─ content/                  ← CONTEÚDO (editado pelo CMS)
│  ├─ profile.json           Nome, cargo, bio, destaques, contatos, foto, banner
│  └─ categories/
│     ├─ educacionais.json   { title, projects: [...] }
│     ├─ corporativo.json
│     ├─ cultura.json
│     └─ autorais.json
├─ static/                   Copiado como está para _site/
│  ├─ css/site.css           Estilos; cores e fontes nas variáveis do topo
│  ├─ js/site.js             Carrossel e modal
│  ├─ img/uploads/           Imagens enviadas pelo CMS
│  └─ admin/
│     ├─ index.html          Carrega o Decap CMS
│     └─ config.yml          Campos do painel
├─ .github/workflows/deploy.yml   Build + publicação no GitHub Pages
├─ oauth-worker/worker.js    Proxy OAuth do login do painel (roda na Cloudflare, não no site)
└─ _site/                    Saída do build (não versionada)
```

### Modelo de um projeto (`content/categories/*.json`)

```json
{
  "title": "Alura — Websérie LuchaDev",
  "cover": "/img/uploads/luchadev.jpg",
  "period": "02/01/2023 → 01/04/2023",
  "roles": ["Diretor Geral", "Produtor Audiovisual"],
  "description": "Texto curto. Linha em branco separa parágrafos.",
  "notice": "",
  "videos": [
    { "label": "Episódio 1", "url": "https://www.youtube.com/watch?v=XXXXXXXXXXX" }
  ]
}
```

- A **ordem do array** é a ordem do carrossel.
- `notice` preenchido mostra a etiqueta "Acesso restrito" e um aviso no modal (caso Inspirali).
- `videos` aceita links `youtube.com/watch?v=`, `youtu.be/`, `/shorts/`, `/embed/` e playlists (`?list=`). Links não reconhecidos são ignorados e geram aviso no build.
- A capa é decorativa (`alt=""`). O botão que abre o modal já é nomeado pelo título do projeto, então o Henrique não precisa escrever texto alternativo.

## 4. Rodar localmente

```bash
node build.js        # gera _site/ e lista avisos de conteúdo
node serve.js        # http://localhost:8080
# ou, os dois juntos:
npm run dev
```

### Testar o painel `/admin` localmente (opcional, precisa de internet)

O `config.yml` tem `local_backend: true`, que permite editar os arquivos locais sem login:

```bash
npx decap-server     # terminal 1 (porta 8081)
npm run dev          # terminal 2
# abrir http://localhost:8080/admin/
```

Depois de editar no painel local, rode `node build.js` de novo para ver o resultado.

## 5. Publicação

### Fase 2 — Login do painel (`/admin`)

O login usa três peças: **OAuth App** no GitHub (identifica o painel), **Worker** na Cloudflare (guarda o segredo e troca o código pelo token; código em `oauth-worker/worker.js`) e o **`config.yml`** apontando para o Worker.

> Plano: montar primeiro com o OAuth App e o Worker nas contas do Felipe, validar, e depois migrar para as contas do Henrique (ver "Migração" abaixo).

**1. Criar o Worker** (Cloudflare → *Workers & Pages* → *Create* → *Create Worker*)
- Nome: `decap-oauth-portfolio` → *Deploy* (com o código de exemplo mesmo).
- *Edit code* → apagar tudo, colar o conteúdo de `oauth-worker/worker.js` → *Deploy*.
- Anotar a URL: `https://decap-oauth-portfolio.<conta>.workers.dev` (hoje: `https://decap-oauth-portfolio.felipesardim.workers.dev`). Ao abrir no navegador deve aparecer "Proxy OAuth do Decap CMS: OK".

**2. Criar o OAuth App** (GitHub → *Settings* → *Developer settings* → *OAuth Apps* → *New OAuth App*)

| Campo | Valor |
|---|---|
| Application name | Portfólio Henrique — painel |
| Homepage URL | `https://henriqueball.github.io/portfolio/` |
| Authorization callback URL | `https://decap-oauth-portfolio.<conta>.workers.dev/callback` |

Depois de criar: copiar o **Client ID** e clicar em *Generate a new client secret* (o segredo aparece uma única vez).

**3. Configurar o Worker** (Worker → *Settings* → *Variables and Secrets* → *Add*)

| Nome | Tipo | Valor |
|---|---|---|
| `GITHUB_CLIENT_ID` | Text | Client ID do passo 2 |
| `GITHUB_CLIENT_SECRET` | **Secret** | Client Secret do passo 2 |
| `ALLOWED_ORIGINS` | Text | `https://henriqueball.github.io` |
| `GITHUB_SCOPE` | Text (opcional) | Não criar. Sem ela, o Worker usa `public_repo` |

`ALLOWED_ORIGINS` é a trava de segurança: o token só é entregue a páginas nessas origens (só protocolo + domínio, sem `/portfolio`). Quando o domínio próprio entrar (Fase 3), acrescentar separado por vírgula.

**4. Apontar o painel para o Worker**
- Em `static/admin/config.yml`, trocar `base_url` pela URL do Worker. Os demais campos do `backend` já estão prontos: `repo: HenriqueBall/portfolio`, `branch: main`, `auth_scope: public_repo`.
- Commit e push; aguardar o workflow "Publicar site" ficar verde.

**5. Testar**
- Abrir `https://henriqueball.github.io/portfolio/admin/` → *Login with GitHub* → autorizar o app no popup.
- Editar um projeto, publicar e conferir: commit novo no repositório, workflow verde, mudança no site em 1–2 min.
- Repetir com a conta do Henrique (ele precisa autorizar o app no primeiro acesso).

> Quem tem permissão de escrita no repositório consegue entrar no painel. Para dar acesso, adicione como colaborador; para tirar, remova. O escopo pedido ao GitHub é `public_repo` (não dá acesso a repositórios privados de quem entra).

**Migração para as contas do Henrique**
1. Henrique cria conta na Cloudflare e repete o passo 1 (mesmo código).
2. Henrique cria um OAuth App na conta dele (passo 2) com o callback do **novo** Worker.
3. Configura as variáveis no novo Worker (passo 3).
4. Trocar `base_url` no `config.yml` → commit → testar (passo 5).
5. Só depois de testado: apagar o Worker e o OAuth App do Felipe (GitHub → OAuth App → *Delete application* também revoga os tokens emitidos por ele).

### Fase 3 — Domínio próprio (subdomínio, sem afetar o e-mail)

1. **Onde editar o DNS:** confirmar onde o DNS do domínio é administrado. Se for o DNS do próprio Registro.br, edita-se lá. Se o provedor de e-mail pediu para trocar os servidores DNS, edita-se no painel do provedor.
2. **Registro novo:** criar **um** registro, sem alterar os de e-mail (MX, SPF, DKIM):

   | Tipo | Nome | Valor |
   |---|---|---|
   | CNAME | `portfolio` | `henriqueball.github.io` |

3. **No GitHub:** em *Settings → Pages → Custom domain*, informar `portfolio.<dominio>.com.br` (previsto: `portfolio.henriqueballeiras.com.br`). Como a publicação é feita pelo GitHub Actions, não é preciso criar arquivo `CNAME` no repositório. Depois, verificar o domínio na conta do Henrique (*Settings → Pages → Verified domains*) e ativar **Enforce HTTPS** quando o certificado for emitido. Pode levar algumas horas.
4. **Ajustes finais:**
   - OAuth App: trocar a Homepage URL pelo novo endereço. O callback continua o do Worker.
   - Worker: acrescentar `https://portfolio.<dominio>.com.br` em `ALLOWED_ORIGINS`, separado por vírgula. Sem isso, o login no painel pelo domínio novo trava em "Concluindo o login…".
   - Este README: atualizar os endereços do site e do painel no topo.

A barra de endereço mostra `portfolio.<dominio>.com.br`. Não é redirecionamento: o GitHub serve o site diretamente nesse endereço. O endereço `*.github.io` passa a redirecionar para o domínio.

## 6. Manutenção

### 6.1 Edição de conteúdo (Henrique, pelo `/admin`)

- **Perfil:** nome, cargo, bio, destaques, contatos, foto e banner.
- **Categorias:** editar o título da seção; incluir, remover, reordenar (arrastar) e editar projetos.
- **Imagens:** capas em 16:9 com até ~500 KB (JPG ou WebP). O site não reduz imagens automaticamente, então arquivos grandes deixam a página lenta e aumentam o repositório.

### 6.2 Visual (Felipe)

- **Cores e fontes:** variáveis no topo de `static/css/site.css` (`--color-*`, `--font-body`). Trocar ali vale para o site inteiro.
- **Estrutura da página:** `src/page.js`, incluindo o rodapé com a linha de créditos (© 2026 · by Felipe Sardim · São Paulo, com link para o LinkedIn do Felipe).
- **Comportamento** (carrossel e modal): `static/js/site.js`.
- **Quantos cards aparecem por largura de tela:** regras `.card { flex: ... }` em `site.css` (4 / 3 / 2 / 1,2).

### 6.3 Adicionar uma categoria (código)

1. Criar `content/categories/<slug>.json` com `{ "title": "...", "projects": [] }`.
2. Adicionar `{ slug, menu }` em `CATEGORIES`, no `build.js`. A ordem do array é a ordem das seções.
3. Adicionar um bloco em `static/admin/config.yml`, copiando um existente com `fields: *category_fields`.

### 6.4 Atualizar o Decap CMS

O `admin/index.html` carrega `decap-cms@^3.0.0`, ou seja, recebe correções da versão 3 automaticamente. Se um dia sair a versão 4, testar localmente antes de trocar a versão.

## 7. Acessibilidade

Meta da V1: **Lighthouse ≥ 95 em Acessibilidade, no mobile.** Como medir: Chrome → DevTools (F12) → aba *Lighthouse* → modo *Navigation*, dispositivo *Mobile*, categoria *Accessibility* → *Analyze page load*.

O Lighthouse só detecta parte dos problemas. Verificação manual:

- [ ] O primeiro Tab mostra "Pular para o conteúdo"
- [ ] Todo elemento interativo mostra o contorno de foco preto
- [ ] Setas do carrossel: rótulo lido pelo leitor de tela; ficam desativadas no início e no fim
- [ ] Enter ou Espaço numa capa abre o modal, com o foco no título do projeto
- [ ] Tab circula só dentro do modal
- [ ] ESC fecha o modal, o vídeo para e o foco volta para a capa
- [ ] Clicar no fundo escurecido fecha o modal
- [ ] Em 390 px de largura não há rolagem horizontal da página; os carrosséis rolam com o dedo

**Limitação conhecida:** quando o foco está dentro do player do YouTube, o ESC é capturado pelo próprio player. O visitante precisa sair do player com Tab ou usar o botão Fechar. É o comportamento padrão de iframes de terceiros.

A partir da entrega ao Henrique, manter a acessibilidade do conteúdo editado (texto das capas, descrições) é responsabilidade dele. O código não bloqueia publicações.

## 8. Pendências de conteúdo (Henrique)

O build lista avisos e o site mostra os marcadores `[... a preencher]`. Faltam:

- Períodos e descrições da maioria dos projetos
- Funções completas onde aparece `[Demais funções a preencher]`
- Links dos vídeos do YouTube e capas de todos os projetos
- Foto e banner do perfil
- Revisão do texto da bio (hoje é o texto do Notion)

## 9. Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| Edição salva no painel não aparece no site | Build ainda rodando ou falhou | Aba *Actions* do repositório; erro de JSON aparece no log como `Falha ao ler content/...` |
| `/admin` mostra erro de login | `base_url` errado, Worker fora do ar ou callback do OAuth App diferente | Conferir os passos 1 a 4 da Fase 2 |
| Popup de login abre e fica parado em "Concluindo o login…" | Origem do site não está em `ALLOWED_ORIGINS` | Incluir a origem exata (ex.: `https://henriqueball.github.io`) no Worker |
| Popup mostra "Sessão de login inválida ou expirada" | Login demorou mais de 10 min ou cookies bloqueados para `workers.dev` | Tentar de novo; liberar cookies do domínio do Worker |
| "Não tem permissão" no painel | Conta sem acesso de escrita ao repositório | Adicionar como colaboradora |
| Vídeo não aparece no modal | Link não reconhecido | Usar o link de compartilhar do YouTube; o build mostra o aviso |
| Site sem estilo em `usuario.github.io/portfolio` | — | Os caminhos são relativos; se acontecer, conferir se `css/` está em `_site/` |
