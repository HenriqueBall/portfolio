# Guia: portfólio e ReviverTaro no ar

Última atualização: 26/11/2026 · Responsável técnico: Felipe Sardim · Manual técnico: [README](../README.md)

**Sumário:** [Antes de começar](#antes-de-começar) · [Parte 1](#parte-1--ligar-o-site-do-portfólio-10-min) · [Parte 2](#parte-2--testar-o-painel-de-edição-15-min) · [Parte 3](#parte-3--endereço-próprio-portfoliohenriqueballeirascombr-30-min--espera) · [Parte 4](#parte-4--trazer-o-login-do-painel-para-as-suas-contas-40-min) · [Parte 5](#parte-5--publicar-o-revivertaro-30-min--espera) · [Editar o portfólio](#editar-o-portfólio) · [Se algo der errado](#se-algo-der-errado) · [Onde está cada coisa](#onde-está-cada-coisa)

Este guia coloca no ar o portfólio em **portfolio.henriqueballeiras.com.br** e o ReviverTaro em **revivertaro.henriqueballeiras.com.br**, e explica como cuidar dos dois sozinho depois. Siga as partes na ordem: cada uma depende da anterior. O passo a passo de edição do portfólio fica na seção [Editar o portfólio](#editar-o-portfólio).

## Antes de começar

### O que ter em mãos

- [ ] Computador com navegador (Chrome ou Edge) e o celular com o **app autenticador** do GitHub (o mesmo usado no login com dois fatores)
- [ ] Login do **GitHub** (conta `HenriqueBall`)
- [ ] Login da **Hostinger** (onde o domínio henriqueballeiras.com.br e o DNS são administrados)
- [ ] Os **arquivos do ReviverTaro** numa pasta do computador (pelo menos um arquivo chamado `index.html`)
- [ ] Um e-mail para criar a conta na **Cloudflare** (só se for fazer a Parte 4)
- [ ] Um lugar seguro para anotar senhas e códigos (de preferência um gerenciador de senhas)

### Glossário

| Palavra | O que significa, em português simples |
|---|---|
| Repositório | A pasta online, no GitHub, onde ficam todos os arquivos do site |
| Commit | Uma alteração salva no repositório, com data e autor. Funciona como um histórico |
| GitHub Pages | O serviço gratuito do GitHub que mostra os arquivos do repositório como um site |
| Actions | Os robôs do GitHub que montam e publicam o site sempre que algo muda. Ficam numa aba chamada *Actions* |
| Painel (`/admin`) | A tela onde você edita textos, capas e projetos do portfólio, sem mexer em código |
| DNS | A "lista telefônica" do domínio: diz para qual serviço cada endereço aponta. Fica no painel da Hostinger |
| CNAME | Um tipo de linha dessa lista que diz: "este endereço é um apelido daquele outro" |
| Worker | Um pequeno programa na Cloudflare que só faz o login do painel funcionar com segurança |
| OAuth App | O "crachá" do painel no GitHub. É o que aparece quando o GitHub pergunta se você autoriza o acesso |
| Client Secret | Uma senha do OAuth App. **Nunca envie a ninguém nem cole em arquivos do site** |

> Regra de ouro: no painel da Hostinger, **nunca altere nem apague** linhas do tipo MX, TXT com "spf" ou "dkim". Elas fazem o seu e-mail funcionar. Neste guia você só **adiciona** linhas novas.

## Parte 1 — Ligar o site do portfólio (10 min)

Ao final, o portfólio abre em **https://henriqueball.github.io/portfolio/**. Só o dono do repositório (você) consegue fazer esta parte.

1. Entre em [github.com](https://github.com) com a conta `HenriqueBall`.
2. Abra o repositório: [github.com/HenriqueBall/portfolio](https://github.com/HenriqueBall/portfolio).
3. Clique na aba **Settings** (ícone de engrenagem, no topo do repositório).
4. No menu da esquerda, clique em **Pages**.
5. Em **Build and deployment → Source**, escolha **GitHub Actions**. Não precisa salvar: a escolha vale na hora.
6. Clique na aba **Actions** (no topo do repositório).
7. Clique no item mais recente chamado **Publicar site** e depois no botão **Re-run all jobs** (canto superior direito). Confirme.
8. Espere 1 a 2 minutos. O item fica com um **sinal verde** quando termina.
9. Abra [henriqueball.github.io/portfolio](https://henriqueball.github.io/portfolio/) e confira se o portfólio aparece.

**Deu certo se:** o site abre com seu nome, foto (ou espaço cinza) e os carrosséis de projetos.

## Parte 2 — Testar o painel de edição (15 min)

Ao final, você terá entrado no painel, alterado um texto, conferido no site e desfeito o teste. O passo a passo completo fica na seção [Editar o portfólio](#editar-o-portfólio), que vale também para o dia a dia.

1. Abra [portfolio.henriqueballeiras.com.br/admin/](https://portfolio.henriqueballeiras.com.br/admin/) e entre com o GitHub, como em **Entrar no painel**, na seção [Editar o portfólio](#editar-o-portfólio).
2. Faça uma alteração de teste: em **Categorias do portfólio → Corporativo e institucional**, abra o projeto **Summit DPFL 2023 — Sede do Google** e troque a **Descrição curta** por `Teste do painel`.
3. Publique e confira no site, como em **Alterar, publicar e conferir**.
4. Desfaça: volte a descrição ao texto original (ou escreva a descrição de verdade) e publique de novo.

**Deu certo se:** "Teste do painel" apareceu no site e, na aba **Actions** do repositório, os itens ficaram verdes.

## Parte 3 — Endereço próprio: portfolio.henriqueballeiras.com.br (30 min + espera)

Ao final, o portfólio abre em **https://portfolio.henriqueballeiras.com.br**, com https e cadeado de segurança.

### 3.1 Descobrir onde o DNS é editado (5 min)

1. Entre em [hpanel.hostinger.com](https://hpanel.hostinger.com) com o login da Hostinger.
2. No menu, clique em **Domínios** e escolha **henriqueballeiras.com.br**.
3. Abra **DNS / Nameservers** (ou **Gerenciar DNS**) e veja os **nameservers** listados no topo.
4. Siga conforme o que aparecer:
    - Nameservers da própria Hostinger (geralmente `ns1.dns-parking.com` e `ns2.dns-parking.com`) → você edita **ali mesmo**, na lista **Registros DNS** logo abaixo. Siga para o 3.2.
    - Nameservers de outra empresa (por exemplo, Cloudflare) → as linhas são adicionadas **no painel dessa empresa**. Os passos são os mesmos, só muda o site.

**Como adicionar uma linha na Hostinger** (vale para todas as linhas deste guia): na seção **Gerenciar registros DNS**, escolha o **Tipo**, preencha **Nome** e **Aponta para** (ou **Conteúdo**, no caso de TXT), deixe o **TTL** como está e clique em **Adicionar registro**. No campo Nome, escreva só o início (ex.: `portfolio`): a Hostinger completa com `.henriqueballeiras.com.br` sozinha.

> **Atenção:** não troque os nameservers e não crie um registro se já existir outro com o mesmo **Nome** (`portfolio` ou `revivertaro`): nos dois casos, peça ajuda antes. Nunca mexa nas linhas MX, nem nas TXT que contenham `spf` ou `dkim`: são do e-mail.

### 3.2 Provar ao GitHub que o domínio é seu (10 min)

Isso impede que outra pessoa use o seu domínio no GitHub.

1. No GitHub, clique na sua foto (canto superior direito) → **Settings** → no menu da esquerda, **Pages**.
2. Clique em **Add a domain**, digite `henriqueballeiras.com.br` e confirme.
3. O GitHub mostra uma linha do tipo **TXT** com um **nome** (começa com `_github-pages-challenge-`) e um **valor** (um código). Deixe essa tela aberta.
4. Em outra aba, no painel de DNS (passo 3.1), clique em **Adicionar registro** (ou nome parecido) e preencha:

| Tipo | Nome | Valor |
|---|---|---|
| TXT | o nome que o GitHub mostrou (ex.: `_github-pages-challenge-HenriqueBall`) | o código que o GitHub mostrou |

5. Salve. Volte à aba do GitHub e clique em **Verify**. Se disser que não encontrou, espere 15 minutos e tente de novo (pode levar algumas horas).

### 3.3 Apontar o endereço para o portfólio (5 min)

1. No painel de DNS, adicione mais uma entrada:

| Tipo | Nome | Valor |
|---|---|---|
| CNAME | `portfolio` | `henriqueball.github.io` |

2. Salve. Alguns painéis pedem o valor com um ponto no final (`henriqueball.github.io.`); se pedir, coloque.

### 3.4 Avisar o GitHub do novo endereço (5 min + espera)

1. No repositório [portfolio](https://github.com/HenriqueBall/portfolio) → **Settings → Pages**.
2. Em **Custom domain**, digite `portfolio.henriqueballeiras.com.br` e clique em **Save**.
3. O GitHub faz uma verificação. Quando aparecer **DNS check successful**, marque **Enforce HTTPS**. Se a caixa estiver cinza, o certificado ainda está sendo criado: volte em 30 minutos a algumas horas.
4. Abra [portfolio.henriqueballeiras.com.br](https://portfolio.henriqueballeiras.com.br) e confira o cadeado na barra de endereço.

**Deu certo se:** o site abre em [portfolio.henriqueballeiras.com.br](https://portfolio.henriqueballeiras.com.br) com cadeado na barra de endereço, e o endereço antigo (henriqueball.github.io/portfolio) leva para o novo.

## Parte 4 — Trazer o login do painel para as suas contas (40 min)

Hoje o login do painel passa pelas contas do Felipe (Cloudflare e GitHub). Ao final desta parte, tudo fica no seu nome e o site não depende mais dele. O site continua no ar o tempo todo: as peças do Felipe só são apagadas depois que as suas forem testadas.

### 4.1 Criar a conta e o Worker na Cloudflare (15 min)

1. Crie uma conta gratuita em [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) e confirme o e-mail.
2. No menu da esquerda, clique em **Workers & Pages**. Se pedir para escolher um **subdomínio**, use algo como `henriqueballeiras`. Anote o endereço que aparecer (termina em `.workers.dev`).
3. Clique em **Create** → **Create Worker** (modelo "Hello World"). Nome: `decap-oauth-portfolio` → **Deploy**.
4. Em outra aba, abra o arquivo [oauth-worker/worker.js no GitHub](https://github.com/HenriqueBall/portfolio/blob/main/oauth-worker/worker.js) e clique no botão **Copy raw file** (ícone de duas folhas, acima do código).
5. Volte à Cloudflare, clique em **Edit code**, apague todo o texto que estiver lá, cole o que você copiou e clique em **Deploy**.
6. Anote o endereço do Worker, algo como `https://decap-oauth-portfolio.henriqueballeiras.workers.dev`. Ao abrir, deve aparecer "Proxy OAuth do Decap CMS: OK".

### 4.2 Criar o "crachá" do painel no GitHub (10 min)

1. No GitHub (conta `HenriqueBall`), abra [github.com/settings/applications/new](https://github.com/settings/applications/new).
2. Preencha:

| Campo | O que colocar |
|---|---|
| Application name | `Portfólio Henrique - painel` |
| Homepage URL | `https://portfolio.henriqueballeiras.com.br` |
| Authorization callback URL | o endereço do **seu** Worker + `/callback` (ex.: `https://decap-oauth-portfolio.henriqueballeiras.workers.dev/callback`) |
| Enable Device Flow | desmarcado |
| Expire user access tokens | **desmarcado** (se ficar marcado, o painel dá erro no dia seguinte) |

3. Clique em **Register application**.
4. Copie o **Client ID** e anote.
5. Clique em **Generate a new client secret** e copie **na hora**: ele só aparece uma vez. Guarde no gerenciador de senhas.

### 4.3 Ligar as duas peças (5 min)

1. Cloudflare → **Workers & Pages** → **decap-oauth-portfolio** → **Settings** → **Variables and Secrets** → **Add**. Cadastre as três, uma por vez:

| Tipo | Nome (exatamente assim) | Valor |
|---|---|---|
| Text | `GITHUB_CLIENT_ID` | o Client ID do passo 4.2 |
| **Secret** | `GITHUB_CLIENT_SECRET` | o Client Secret do passo 4.2 |
| Text | `ALLOWED_ORIGINS` | `https://henriqueball.github.io,https://portfolio.henriqueballeiras.com.br` |

2. Clique em **Deploy**. Se aparecer um aviso laranja sobre "Wrangler configuration", pode fechar: não se aplica.

> `ALLOWED_ORIGINS` é a lista de endereços que podem usar o login. Sem o endereço do site nela, a janela de login abre e fica parada em "Concluindo o login…". Escreva sem espaços e sem barra no final.

### 4.4 Apontar o painel para o seu Worker (5 min)

1. No GitHub, abra [static/admin/config.yml](https://github.com/HenriqueBall/portfolio/blob/main/static/admin/config.yml) e clique no **lápis** (Edit this file).
2. Na linha que começa com `base_url:`, troque só o endereço pelo do **seu** Worker, **sem barra no final**. Exemplo: `base_url: https://decap-oauth-portfolio.henriqueballeiras.workers.dev`
3. Clique em **Commit changes**, escreva `Aponta o painel para o Worker da conta do Henrique` e confirme. Espere a aba **Actions** ficar verde.

### 4.5 Testar e encerrar (5 min)

1. Abra o painel e entre de novo. O GitHub vai pedir para autorizar o **seu** app: clique em **Authorize**.
2. Faça o mesmo teste da Parte 2 (alterar, publicar, conferir e desfazer), seguindo a seção [Editar o portfólio](#editar-o-portfólio).
3. Só depois de tudo funcionar: o **Felipe** apaga o Worker dele na Cloudflare e o OAuth App dele no GitHub. Apagar o app antigo também cancela os acessos que ele tinha emitido.

**Deu certo se:** o login e a publicação funcionam com tudo no seu nome, e continuam funcionando depois que o Felipe apaga as peças dele.

## Parte 5 — Publicar o ReviverTaro (30 min + espera)

Ao final, a página abre em **https://revivertaro.henriqueballeiras.com.br**. É mais simples que o portfólio: não tem painel, e o GitHub mostra os arquivos exatamente como você enviar. O repositório é o [ReviverTaro](https://github.com/HenriqueBall/ReviverTaro) (público).

### 5.1 Conferir os arquivos antes de enviar (5 min)

- [ ] A página principal se chama exatamente `index.html` (tudo minúsculo) e fica na **raiz** da pasta, não dentro de outra pasta
- [ ] Nomes de arquivos **sem espaços e sem acentos** (ex.: `carta-o-louco.jpg`, não `Carta O Louco.JPG`)
- [ ] Maiúsculas importam: se o HTML chama `foto.jpg`, o arquivo não pode ser `Foto.JPG`
- [ ] A página abre direito com dois cliques no `index.html`, no seu computador
- [ ] Imagens com até cerca de 500 KB cada
- [ ] Só HTML, CSS, JavaScript e imagens. Formulário de contato, PHP ou banco de dados não funcionam no GitHub Pages sem ajustes

### 5.2 Primeiro envio dos arquivos (5 min)

1. Abra o repositório [ReviverTaro](https://github.com/HenriqueBall/ReviverTaro).
2. Se ele estiver vazio, clique no link **uploading an existing file**. Se já tiver algum arquivo, clique em **Add file → Upload files**.
3. No computador, abra a pasta da página, selecione **todo o conteúdo** (Ctrl + A) e arraste para a área indicada. Subpastas (como `img`) vão junto.
4. Escreva a mensagem do commit (veja **Como escrever a mensagem do commit**, abaixo), por exemplo `Primeira versão do ReviverTaro`.
5. Clique em **Commit changes**. Confira se o `index.html` aparece na lista principal do repositório.

### 5.3 Ligar o site (5 min + espera)

1. No repositório `ReviverTaro` → **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**. Em **Branch**, escolha `main` e a pasta `/ (root)` → **Save**.
3. Espere 1 a 2 minutos e abra [henriqueball.github.io/ReviverTaro](https://henriqueball.github.io/ReviverTaro/).

> **Atenção:** aqui o modo é **Deploy from a branch**. No portfólio é o contrário, **GitHub Actions**. Se os dois forem trocados, o portfólio passa a mostrar o texto do README no lugar do site.

### 5.4 Endereço próprio (10 min + espera)

O domínio já foi verificado na Parte 3.2, então são dois passos:

1. No painel de DNS da Hostinger, adicione:

| Tipo | Nome | Aponta para |
|---|---|---|
| CNAME | `revivertaro` | `henriqueball.github.io` |

2. No repositório `ReviverTaro` → **Settings → Pages → Custom domain**: digite `revivertaro.henriqueballeiras.com.br` → **Save**. Quando a opção liberar, marque **Enforce HTTPS**.

> O GitHub cria sozinho um arquivo chamado `CNAME` no repositório. **Não apague esse arquivo**: é ele que guarda o endereço próprio.

**Deu certo se:** [revivertaro.henriqueballeiras.com.br](https://revivertaro.henriqueballeiras.com.br) abre com cadeado, com imagens e estilos aparecendo.

### 5.5 Alterar a página depois

Toda alteração feita no Github aparece no site em 1 a 2 minutos. Para ver, recarregue com **Ctrl + F5**, que faz a limpeza de cache e atualiza a página. 

| Quero… | Como |
|---|---|
| Substituir um arquivo (imagem, HTML, CSS) | **Add file → Upload files** → arraste o arquivo novo **com o mesmo nome**. Ele substitui o antigo. Se o arquivo fica numa subpasta (ex.: `img`), abra essa pasta no repositório antes de clicar em *Add file* |
| Incluir arquivos novos | O mesmo caminho: **Add file → Upload files**, na pasta certa |
| Corrigir um texto pequeno | Clique no arquivo (ex.: `index.html`) → ícone do **lápis** → altere → **Commit changes** |
| Renomear um arquivo | Clique no arquivo → **lápis** → mude o nome no campo do topo → **Commit changes**. Lembre de atualizar o HTML que chama esse arquivo |
| Apagar um arquivo | Clique no arquivo → **três pontinhos** → **Delete file** → **Commit changes**. Nunca apague o `CNAME` |
| Desfazer uma alteração | Envie de novo a versão anterior do arquivo. Todas as versões ficam em **Commits** (link no topo da lista de arquivos) |

**Como escrever a mensagem do commit:** cada envio pede uma frase curta, que vira o histórico do site. Diga **o que mudou**, começando com um verbo: `Troca a imagem da carta O Louco`, `Corrige erro de digitação na página inicial`. Evite mensagens vagas como `update` ou `alterações`: daqui a seis meses, é essa frase que vai te ajudar a achar a versão certa.

## No dia a dia

- **Portfólio:** tudo pelo painel. O passo a passo, a lista do que dá para fazer e as boas práticas estão na seção [Editar o portfólio](#editar-o-portfólio).
- **ReviverTaro:** envio e substituição de arquivos direto no GitHub, como no passo 5.5 deste guia.

## Editar o portfólio

Todas as mudanças no portfólio são feitas pelo painel, sem mexer em código. Cada publicação aparece no site em 1 a 2 minutos, e dá para desfazer.

### Entrar no painel

1. Abra [portfolio.henriqueballeiras.com.br/admin/](https://portfolio.henriqueballeiras.com.br/admin/).
2. Clique em **Login with GitHub**. Abre uma janela do GitHub sobre a página.
3. No primeiro acesso, o GitHub pergunta se você autoriza o app **Portfólio Henrique - painel**: clique em **Authorize**.
4. A janela de autorização fecha sozinha e o painel abre, com **Perfil** e **Categorias do portfólio** à esquerda.

> Se o navegador bloquear a janela de login, clique no ícone de pop-up bloqueado na barra de endereço e permita para este site.

### Alterar, publicar e conferir

1. No painel, abra o que quer mudar: **Perfil** ou uma das **Categorias** → o projeto na lista.
2. Altere os campos.
3. Clique em **Publish** (topo da tela) → **Publish now**.
4. Acompanhe em [github.com/HenriqueBall/portfolio/actions](https://github.com/HenriqueBall/portfolio/actions): aparece um item novo, que fica **verde** em 1 a 2 minutos.
5. Abra [portfolio.henriqueballeiras.com.br](https://portfolio.henriqueballeiras.com.br) e confira. Se a mudança não aparecer, recarregue com **Ctrl + F5**.

### Desfazer

- Abra o mesmo item no painel, volte o texto ou a imagem ao que era e publique de novo.
- Todo o histórico fica no repositório, em **Commits** (link no topo da lista de arquivos). A partir dali dá para recuperar qualquer versão antiga.

### O que dá para fazer

| Quero… | Onde no painel | Como |
|---|---|---|
| Mudar bio, cargo, foto, banner ou contatos | Perfil → Apresentação e contatos | Altere os campos e publique |
| Incluir um projeto | Categorias → a categoria → Projetos → **Add projeto** | Preencha título, capa, período, funções, descrição e vídeos e publique |
| Mudar a ordem no carrossel | Lista de projetos da categoria | Arraste pelo ícone de seis pontinhos e publique |
| Remover um projeto | Lista de projetos da categoria | Clique no **X** do item e publique |
| Trocar a capa | Campo **Capa** do projeto | **Choose different image**, envie a nova e publique |
| Colocar vídeos | Campo **Vídeos do YouTube** | **Add** → nome do vídeo + link do botão *Compartilhar* do YouTube. O primeiro da lista é o que abre primeiro |
| Avisar que o conteúdo não é público | Campo **Aviso** do projeto | Escreva o aviso (ex.: "exclusivo para alunos") |

### Boas práticas

- Capas na proporção **16:9** (ex.: 1280 × 720 pixels) e com até **500 KB**. Para reduzir uma imagem, use um site gratuito como [squoosh.app](https://squoosh.app).
- Descrição curta: 1 a 3 frases. No card aparecem só as 3 primeiras linhas; o texto completo aparece ao abrir o projeto.
- Revise os textos antes de publicar: cada publicação vira um registro no histórico.

## Se algo der errado

O site publicado só muda quando um item da aba **Actions** fica verde. Se algo der errado, a versão anterior continua no ar.

| O que acontece | Causa provável | O que fazer |
|---|---|---|
| Publiquei e o site não mudou | O robô ainda está trabalhando, ou o navegador guardou a versão antiga | Espere 2 min, veja a aba **Actions** e recarregue com **Ctrl + F5** |
| X vermelho na aba Actions do portfólio | Algum texto ficou com formato inválido | Clique no item vermelho e mande um print para quem cuida do código. O site anterior continua no ar |
| O portfólio mostra o texto do README no lugar do site | O GitHub Pages do `portfolio` está em *Deploy from a branch* | **Settings → Pages → Source: GitHub Actions** e rode de novo o último item da aba Actions (Parte 1) |
| A janela de login fica parada em "Concluindo o login…" | O endereço do site não está em `ALLOWED_ORIGINS` no Worker | Confira a lista do passo 4.3: sem espaços, sem barra no final, com `https://` |
| Login mostra "Sessão de login inválida ou expirada" | Demorou mais de 10 min ou o navegador bloqueou cookies | Feche a janela de login e tente de novo |
| O painel dá erro ao salvar, mesmo logado | O acesso expirou ou foi cancelado | No painel, clique no seu avatar → **Log out** e entre de novo |
| O vídeo não aparece ao abrir o projeto | Link do YouTube em formato estranho | Use o link do botão *Compartilhar* do YouTube (`https://youtu.be/...`) |
| O ReviverTaro abre sem imagens ou sem estilo | Nome de arquivo diferente do que o HTML chama (maiúsculas, acentos, espaços) ou arquivo na pasta errada | Confira o checklist do passo 5.1 |
| O endereço próprio não abre | DNS ainda se espalhando, ou linha errada | Espere até 24 h e confira a linha CNAME (nome e valor) |
| "Enforce HTTPS" não dá para marcar | Certificado ainda em criação | Volte em algumas horas |
| O e-mail parou de funcionar | Alguma linha de e-mail foi alterada ou apagada no DNS | Peça ajuda **imediatamente** |
| Perdi o Client Secret | Ele só aparece uma vez | GitHub → OAuth App → **Generate a new client secret** → troque no Worker (passo 4.3) |

## Onde está cada coisa

### Portfólio

| O quê | Onde | Dono |
|---|---|---|
| Site no ar | [portfolio.henriqueballeiras.com.br](https://portfolio.henriqueballeiras.com.br) | GitHub Pages (gratuito), modo **GitHub Actions** |
| Painel de edição | [portfolio.henriqueballeiras.com.br/admin/](https://portfolio.henriqueballeiras.com.br/admin/) | Quem for colaborador do repositório |
| Código e conteúdo | [github.com/HenriqueBall/portfolio](https://github.com/HenriqueBall/portfolio) | Henrique (Felipe como colaborador) |
| Manual técnico | Arquivo `README.md` no repositório `portfolio` | Para quem for mexer no código |
| Worker do login | Cloudflare → Workers & Pages → `decap-oauth-portfolio` | Felipe até a Parte 4; depois, Henrique |
| OAuth App (crachá do painel) | GitHub → Settings → Developer settings → OAuth Apps | Felipe até a Parte 4; depois, Henrique |

### ReviverTaro

| O quê | Onde | Dono |
|---|---|---|
| Site no ar | [revivertaro.henriqueballeiras.com.br](https://revivertaro.henriqueballeiras.com.br) | GitHub Pages (gratuito), modo **Deploy from a branch** |
| Arquivos da página | [github.com/HenriqueBall/ReviverTaro](https://github.com/HenriqueBall/ReviverTaro) | Henrique |

### Domínio e e-mail (vale para os dois)

| O quê | Onde | Dono |
|---|---|---|
| Domínio, DNS e e-mail | [hpanel.hostinger.com](https://hpanel.hostinger.com) → Domínios → DNS / Nameservers | Henrique |
| Verificação do domínio no GitHub | GitHub → sua foto → Settings → Pages | Henrique |

**Custos:** nenhum além da renovação anual do domínio na Hostinger.

**Segurança:**

- Mantenha a verificação em duas etapas ligada no GitHub e na Cloudflare.
- Para dar acesso ao painel a alguém: repositório `portfolio` → **Settings → Collaborators → Add people**. Para tirar: o mesmo lugar → **Remove**.
- O Client Secret e as senhas nunca vão para arquivos do site, e-mail ou mensagem.
