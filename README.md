# Portfólio — Henrique Balleiras

Site-portfólio de página única: apresentação, quatro categorias de projetos em carrossel e vídeo do YouTube abrindo em modal. O conteúdo é editado pelo Henrique num painel web (`/admin`, Decap CMS) e o site é publicado automaticamente no GitHub Pages, no domínio próprio.

> **Vai só editar textos, capas ou projetos?** Comece pelo [Guia de uso (docs/editar-portfolio.md)](docs/editar-portfolio.md). Este README é o manual técnico e de operação.

- **Status:** V1 no ar. Site, painel de edição e domínio próprio funcionando.
- **Site:** https://portfolio.henriqueballeiras.com.br
- **Painel:** https://portfolio.henriqueballeiras.com.br/admin/
- **Repositório:** https://github.com/HenriqueBall/portfolio
- **Dono do conteúdo e das contas:** Henrique Balleiras
- **Responsável técnico:** Felipe Sardim

---

## 1. Arquitetura

```
Henrique (navegador) ──► portfolio.henriqueballeiras.com.br/admin  (Decap CMS, carregado da CDN)
                              │  "Login with GitHub"
                              ▼
                   Cloudflare Worker (proxy OAuth, plano grátis)
                              │  token de acesso
                              ▼
     Repositório GitHub ── commit no main ──► GitHub Actions: node build.js
       content/*.json                                   │
       static/img/uploads/                              ▼
                                               GitHub Pages (_site/)
                                                        ▲
                              DNS na Hostinger (CNAME portfolio → henriqueball.github.io)
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
| Proxy OAuth próprio (`oauth-worker/worker.js`) | Cerca de 80 linhas auditáveis, sem dependência de terceiros; escopo travado em `public_repo` | Uma peça a mais para manter (Cloudflare) |

## 2. Dependências

| Item | Para quê | Custo |
|---|---|---|
| Node.js ≥ 20 | Rodar `build.js` (local e no GitHub Actions) | Grátis |
| Decap CMS 3.x (CDN unpkg) | Painel `/admin` | Grátis (MIT) |
| GitHub (conta `HenriqueBall`) | Repositório, Actions, Pages, login do painel | Grátis (repositório público) |
| Cloudflare Workers | Proxy OAuth do login do painel (`oauth-worker/worker.js`) | Grátis |
| Domínio `henriqueballeiras.com.br` na Hostinger | Endereço do site e DNS | Renovação anual do domínio |

Não há `node_modules` nem `package-lock.json`: o projeto não usa pacotes npm.

## 3. Estrutura de pastas

```
├─ README.md                 Este manual (técnico e de operação)
├─ docs/editar-portfolio.md  Guia de uso para o Henrique (painel, domínio, ReviverTaro)
├─ build.js                  Lê content/, gera _site/index.html e copia static/
├─ serve.js                  Servidor local para revisar _site/
├─ src/page.js               Template HTML da página (cabeçalho, apresentação, carrosséis, modal, rodapé)
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
│     └─ config.yml          Campos do painel e conexão com o GitHub/Worker
├─ .github/workflows/deploy.yml   Build + publicação no GitHub Pages
├─ oauth-worker/worker.js    Proxy OAuth do login do painel (roda na Cloudflare, não no site)
├─ CNAME                     Criado pelo GitHub quando o Pages estava em modo branch; sem efeito no modo Actions (ver §5.1)
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

O `config.yml` tem `local_backend: true`, que permite editar os arquivos locais sem login (só vale em `localhost`):

```bash
npx decap-server     # terminal 1 (porta 8081)
npm run dev          # terminal 2
# abrir http://localhost:8080/admin/
```

Depois de editar no painel local, rode `node build.js` de novo para ver o resultado.

## 5. Operação

Esta seção registra **como o site está configurado hoje** fora do código (GitHub, Hostinger, Cloudflare). O passo a passo tela a tela, para quem não é da área técnica, está no [guia de uso](docs/editar-portfolio.md).

### 5.1 GitHub Pages

| Configuração | Valor | Onde |
|---|---|---|
| Source | **GitHub Actions** | Repositório → Settings → Pages |
| Custom domain | `portfolio.henriqueballeiras.com.br` | Repositório → Settings → Pages |
| Enforce HTTPS | Ligado | Repositório → Settings → Pages |
| Domínio verificado | `henriqueballeiras.com.br` | Conta `HenriqueBall` → Settings → Pages → Verified domains |

> **Atenção:** se o Source voltar para *Deploy from a branch*, o GitHub ignora o workflow e publica a raiz do repositório. Como lá não há `index.html` (ele só existe em `_site/`), o site passa a mostrar **este README** formatado. Correção: Source → GitHub Actions e rodar de novo o último workflow em *Actions*.

O arquivo `CNAME` na raiz foi criado pelo GitHub numa fase em que o Pages estava em modo branch. No modo Actions o domínio vem da configuração acima, e o arquivo não tem efeito. Pode ser mantido ou removido.

### 5.2 DNS (Hostinger)

Painel: [hpanel.hostinger.com](https://hpanel.hostinger.com) → Domínios → `henriqueballeiras.com.br` → DNS / Nameservers. Os nameservers são os da Hostinger.

Registros criados para os sites (os demais são do e-mail e **não devem ser alterados**: MX, TXT de SPF e DKIM):

| Tipo | Nome | Aponta para | Para quê |
|---|---|---|---|
| TXT | `_github-pages-challenge-HenriqueBall` | código gerado pelo GitHub | Verificação do domínio na conta do GitHub |
| CNAME | `portfolio` | `henriqueball.github.io` | Este site |
| CNAME | `revivertaro` | `henriqueball.github.io` | Site ReviverTaro (repositório `HenriqueBall/ReviverTaro`, Pages em modo *Deploy from a branch*) |

Usar subdomínios (CNAME) em vez da raiz do domínio mantém os registros do e-mail intocados.

### 5.3 Login do painel

O login usa três peças que precisam estar coerentes entre si:

```
config.yml (base_url) ──► Worker na Cloudflare ──► OAuth App no GitHub
                          (ALLOWED_ORIGINS,        (callback = Worker/callback)
                           Client ID e Secret)
```

**`static/admin/config.yml` → `backend`**

| Campo | Valor |
|---|---|
| `name` | `github` |
| `repo` | `HenriqueBall/portfolio` |
| `branch` | `main` |
| `auth_scope` | `public_repo` (não dá acesso a repositórios privados de quem entra) |
| `base_url` | URL do Worker, sem barra no final |

**Worker (Cloudflare → Workers & Pages → `decap-oauth-portfolio` → Settings → Variables and Secrets)**

| Variável | Tipo | Valor |
|---|---|---|
| `GITHUB_CLIENT_ID` | Text | Client ID do OAuth App |
| `GITHUB_CLIENT_SECRET` | **Secret** | Client Secret do OAuth App (nunca no repositório) |
| `ALLOWED_ORIGINS` | Text | `https://henriqueball.github.io,https://portfolio.henriqueballeiras.com.br` |
| `GITHUB_SCOPE` | — | Não criar. Sem ela, o Worker usa `public_repo` |

`ALLOWED_ORIGINS` é a trava de segurança: o token só é entregue a páginas nessas origens (protocolo + domínio, sem caminho, sem barra final, separadas por vírgula). Se o endereço do site não estiver na lista, o login trava em "Concluindo o login…".

**OAuth App (GitHub → Settings → Developer settings → OAuth Apps)**

| Campo | Valor |
|---|---|
| Homepage URL | `https://portfolio.henriqueballeiras.com.br` |
| Authorization callback URL | URL do Worker + `/callback` |
| Enable Device Flow | Desmarcado |
| Expire user access tokens | **Desmarcado**: o Decap não usa refresh token, e com expiração o painel passa a dar erro ao salvar no dia seguinte |

**Acesso:** quem tem permissão de escrita no repositório entra no painel. Dar acesso: repositório → Settings → Collaborators → Add people. Tirar: Remove.

### 5.4 Inventário de contas

| Peça | Onde | Dono |
|---|---|---|
| Repositório | [github.com/HenriqueBall/portfolio](https://github.com/HenriqueBall/portfolio) | Henrique (Felipe como colaborador) |
| GitHub Pages + domínio verificado | Conta `HenriqueBall` | Henrique |
| Worker `decap-oauth-portfolio` | Cloudflare | Felipe até a migração (§5.5); depois, Henrique |
| OAuth App do painel | GitHub → Developer settings | Felipe até a migração (§5.5); depois, Henrique |
| Domínio, DNS e e-mail | Hostinger | Henrique |

### 5.5 Migração ou troca de responsável

Para passar o login do painel para outra conta (por exemplo, das contas do Felipe para as do Henrique), sem tirar o site do ar:

1. **Worker novo:** na Cloudflare da nova conta, criar `decap-oauth-portfolio` e colar `oauth-worker/worker.js`. Ao abrir a URL, deve aparecer "Proxy OAuth do Decap CMS: OK".
2. **OAuth App novo:** na conta GitHub nova, com o callback apontando para o **novo** Worker (§5.3). Gerar o Client Secret.
3. **Variáveis:** cadastrar as três variáveis no novo Worker (§5.3) e fazer *Deploy*.
4. **`base_url`:** trocar no `config.yml` pela URL do novo Worker, fazer commit e esperar o workflow ficar verde.
5. **Teste:** entrar no painel (o GitHub pede para autorizar o app novo), editar, publicar, conferir, desfazer.
6. **Só depois do teste:** apagar o Worker e o OAuth App antigos. Apagar o OAuth App também revoga os tokens que ele emitiu.

Passo a passo detalhado, tela a tela: [guia de uso, Parte 4](docs/editar-portfolio.md#parte-4--trazer-o-login-do-painel-para-as-suas-contas-40-min).

### 5.6 Custos

Nenhum além da renovação anual do domínio na Hostinger. GitHub (repositório público, Actions, Pages) e Cloudflare Workers estão no plano gratuito, com folga para este site.

## 6. Manutenção

### 6.1 Edição de conteúdo (Henrique, pelo `/admin`)

Tudo está no [guia de uso](docs/editar-portfolio.md#editar-o-portfólio). Resumo:

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

### 6.5 Atualizar o Worker

Se `oauth-worker/worker.js` mudar no repositório, a mudança **não** vai para a Cloudflare sozinha: abrir o Worker → *Edit code*, colar o arquivo novo e fazer *Deploy*. As variáveis não são afetadas.

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

A partir da entrega ao Henrique, manter a acessibilidade do conteúdo editado (descrições, textos) é responsabilidade dele. O código não bloqueia publicações.

## 8. Pendências de conteúdo (Henrique)

O build lista avisos e o site mostra os marcadores `[... a preencher]` enquanto houver campos pendentes, como:

- Períodos e descrições de projetos
- Funções completas onde aparece `[Demais funções a preencher]`
- Links dos vídeos do YouTube e capas
- Foto e banner do perfil

## 9. Problemas comuns

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| Edição salva no painel não aparece no site | Build ainda rodando, falhou, ou cache do navegador | Aba *Actions*; recarregar com Ctrl + F5. Erro de JSON aparece no log como `Falha ao ler content/...` |
| O site mostra o README em vez do portfólio | Pages em *Deploy from a branch* | Source → GitHub Actions e rodar de novo o workflow (§5.1) |
| Login trava em "Concluindo o login…" | Origem do site fora de `ALLOWED_ORIGINS` | Incluir a origem exata no Worker (§5.3). Conferir com `location.origin` no console do `/admin` |
| `/admin` mostra erro de login | `base_url` errado, Worker fora do ar ou callback do OAuth App diferente | Conferir as três peças (§5.3); abrir a URL do Worker deve mostrar "Proxy OAuth do Decap CMS: OK" |
| Janela de login mostra "Sessão de login inválida ou expirada" | Login demorou mais de 10 min ou cookies bloqueados para `workers.dev` | Tentar de novo; liberar cookies do domínio do Worker |
| Painel dá erro ao salvar, mesmo logado | Token revogado ou expirado | Avatar no painel → Log out → entrar de novo. Conferir se *Expire user access tokens* está desmarcado no OAuth App |
| "Não tem permissão" no painel | Conta sem acesso de escrita ao repositório | Adicionar como colaboradora |
| Vídeo não aparece no modal | Link não reconhecido | Usar o link de compartilhar do YouTube; o build mostra o aviso |
| Domínio não abre ou sem HTTPS | DNS propagando ou certificado em emissão | Esperar até 24 h; conferir o CNAME (§5.2) e o Enforce HTTPS (§5.1) |
| E-mail parou de funcionar | Registro MX/SPF/DKIM alterado no DNS | Restaurar os registros do e-mail na Hostinger imediatamente |
| Perdeu o Client Secret | Só aparece uma vez | OAuth App → Generate a new client secret → atualizar no Worker |
