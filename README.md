# Portfólio — Henrique Balleiras

Site-portfólio de página única: apresentação, quatro categorias de projetos em carrossel e vídeo do YouTube abrindo em modal. O conteúdo é editado pelo Henrique num painel web (`/admin`, Decap CMS) e o site é publicado automaticamente no GitHub Pages.

- **Status:** V1 — Fase 1 concluída (site + CMS configurado). Pendente: Fase 2 (repositório, login do painel) e Fase 3 (domínio).
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
| Cloudflare Workers | Proxy OAuth do login do painel | Grátis |
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

## 5. Publicação (Fases 2 e 3 — a fazer)

### Fase 2 — Repositório e login do painel

1. **Conta do Henrique:** criar a conta no GitHub e ativar a verificação em duas etapas por app autenticador.
2. **Repositório:** criar `portfolio` (público) na conta do Henrique e convidar o Felipe como colaborador.
3. **Primeiro envio:** subir esta pasta (o `.gitignore` já exclui `_site/`).
4. **Pages:** em *Settings → Pages → Build and deployment*, escolher **Source: GitHub Actions**. O workflow publica a cada push no `main`.
5. **OAuth App:** na conta do Henrique, em *Settings → Developer settings → OAuth Apps → New*:
   - Homepage URL: endereço do site
   - Authorization callback URL: `https://<worker>.workers.dev/callback`
6. **Proxy OAuth:** publicar um Worker na Cloudflare com o Client ID e o Client Secret do passo 5, guardados como *secrets* do Worker e nunca no repositório. Referência: projeto `sterlingwes/decap-proxy` no GitHub, ou equivalente.
7. **Painel:** em `static/admin/config.yml`, trocar `repo:` por `<usuario-do-henrique>/portfolio` e `base_url:` pela URL do Worker.
8. **Testar:** abrir `/admin`, entrar com a conta do Henrique e com a do Felipe, editar um projeto e conferir o site publicado.

> Quem tem permissão de escrita no repositório consegue entrar no painel. Para dar acesso a alguém, adicione a pessoa como colaboradora. Para tirar o acesso, remova.

### Fase 3 — Domínio próprio (subdomínio, sem afetar o e-mail)

1. **Onde editar o DNS:** confirmar onde o DNS do domínio é administrado. Se for o DNS do próprio Registro.br, edita-se lá. Se o provedor de e-mail pediu para trocar os servidores DNS, edita-se no painel do provedor.
2. **Registro novo:** criar **um** registro, sem alterar os de e-mail (MX, SPF, DKIM):

   | Tipo | Nome | Valor |
   |---|---|---|
   | CNAME | `portfolio` | `<usuario-do-henrique>.github.io` |

3. **No GitHub:** em *Settings → Pages → Custom domain*, informar `portfolio.<dominio>.com.br`. Depois, verificar o domínio na conta do Henrique (*Settings → Pages → Verified domains*) e ativar **Enforce HTTPS** quando o certificado for emitido. Pode levar algumas horas.
4. **Ajustes finais:** atualizar a Homepage URL do OAuth App.

A barra de endereço mostra `portfolio.<dominio>.com.br`. Não é redirecionamento: o GitHub serve o site diretamente nesse endereço. O endereço `*.github.io` passa a redirecionar para o domínio.

## 6. Manutenção

### 6.1 Edição de conteúdo (Henrique, pelo `/admin`)

- **Perfil:** nome, cargo, bio, destaques, contatos, foto e banner.
- **Categorias:** editar o título da seção; incluir, remover, reordenar (arrastar) e editar projetos.
- **Imagens:** capas em 16:9 com até ~500 KB (JPG ou WebP). O site não reduz imagens automaticamente, então arquivos grandes deixam a página lenta e aumentam o repositório.

### 6.2 Visual (Felipe)

- **Cores e fontes:** variáveis no topo de `static/css/site.css` (`--color-*`, `--font-body`). Trocar ali vale para o site inteiro.
- **Estrutura da página:** `src/page.js`.
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
| `/admin` mostra erro de login | `base_url` errado, Worker fora do ar ou callback do OAuth App diferente | Conferir os passos 5 a 7 da Fase 2 |
| "Não tem permissão" no painel | Conta sem acesso de escrita ao repositório | Adicionar como colaboradora |
| Vídeo não aparece no modal | Link não reconhecido | Usar o link de compartilhar do YouTube; o build mostra o aviso |
| Site sem estilo em `usuario.github.io/portfolio` | — | Os caminhos são relativos; se acontecer, conferir se `css/` está em `_site/` |
