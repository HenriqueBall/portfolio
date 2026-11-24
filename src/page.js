// Template da página única. Todo texto vindo do CMS passa por esc() antes de entrar no HTML.

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Texto com linhas em branco vira parágrafos.
function paragraphs(text, className = '') {
  const cls = className ? ` class="${className}"` : '';
  return String(text || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p${cls}>${esc(p)}</p>`)
    .join('\n');
}

const icon = {
  prev: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  next: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>',
  play: '<svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  close: '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
};

function badge(project) {
  if (project.notice) return 'Acesso restrito';
  if (project.videos.length > 1) return `${project.videos.length} vídeos`;
  if (project.videos.length === 1) return 'Vídeo';
  return '';
}

function renderCard(p, index, total) {
  const media = p.cover
    ? `<img src="${esc(p.cover)}" alt="" loading="lazy" decoding="async" width="640" height="360">`
    : '<span class="card__placeholder" aria-hidden="true"></span>';
  const b = badge(p);
  const roles = p.roles.length
    ? `<ul class="chips" aria-label="Funções">${p.roles.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`
    : '';
  return `
<li class="card" aria-roledescription="slide" aria-label="${index + 1} de ${total}">
  <button type="button" class="card__media" data-open-project="${esc(p.id)}" aria-haspopup="dialog" aria-label="Ver detalhes: ${esc(p.title)}">
    ${media}
    ${b ? `<span class="card__badge">${esc(b)}</span>` : ''}
    <span class="card__play">${icon.play}</span>
  </button>
  <div class="card__body">
    <h3 class="card__title">${esc(p.title)}</h3>
    ${p.period ? `<p class="card__period">${esc(p.period)}</p>` : ''}
    ${roles}
    ${p.description ? paragraphs(p.description, 'card__desc') : ''}
  </div>
</li>`;
}

function renderCategory(cat) {
  const n = cat.projects.length;
  const headingId = `h-${cat.slug}`;
  const cards = cat.projects.map((p, i) => renderCard(p, i, n)).join('');
  return `
<section id="${cat.slug}" class="category" aria-labelledby="${headingId}">
  <div class="container">
    <div class="category__head">
      <div>
        <h2 id="${headingId}">${esc(cat.title)}</h2>
        <p class="category__count">${n} ${n === 1 ? 'projeto' : 'projetos'}</p>
      </div>
      <div class="carousel__controls">
        <span class="carousel__status" data-status aria-live="polite"></span>
        <button type="button" class="icon-btn" data-prev aria-label="Projetos anteriores em ${esc(cat.title)}">${icon.prev}</button>
        <button type="button" class="icon-btn" data-next aria-label="Próximos projetos em ${esc(cat.title)}">${icon.next}</button>
      </div>
    </div>
    <div class="carousel" data-carousel role="region" aria-roledescription="carrossel" aria-label="${esc(cat.title)}">
      <ul class="carousel__track" data-track>${cards}
      </ul>
    </div>
  </div>
</section>`;
}

function renderHero(profile, firstSection) {
  const banner = profile.banner
    ? `<img class="hero__banner" src="${esc(profile.banner)}" alt="" width="1280" height="240">`
    : '<div class="hero__banner hero__banner--empty" aria-hidden="true"></div>';
  const photo = profile.photo
    ? `<img class="hero__photo" src="${esc(profile.photo)}" alt="Foto de ${esc(profile.name)}" width="168" height="168">`
    : '<div class="hero__photo hero__photo--empty" aria-hidden="true"></div>';
  const highlights = (profile.highlights || []).filter((h) => h.value || h.label);
  return `
<section id="sobre" class="hero" aria-labelledby="hero-title">
  <div class="container">
    ${banner}
    <div class="hero__main">
      ${photo}
      <div class="hero__text">
        ${profile.role ? `<p class="hero__role">${esc(profile.role)}</p>` : ''}
        <h1 id="hero-title">${esc(profile.name)}</h1>
        ${profile.specialties ? `<p class="hero__specialties">${esc(profile.specialties)}</p>` : ''}
        <div class="hero__bio">${paragraphs(profile.bio)}</div>
        <div class="actions">
          <a class="btn btn--solid" href="#${esc(firstSection)}">Ver portfólio</a>
          ${profile.linkedin ? `<a class="btn" href="${esc(profile.linkedin)}" rel="noopener">LinkedIn</a>` : ''}
          ${profile.email ? `<a class="btn" href="mailto:${esc(profile.email)}">Enviar e-mail</a>` : ''}
        </div>
      </div>
    </div>
    ${highlights.length ? `<ul class="highlights" aria-label="Destaques">${highlights
      .map((h) => `<li><strong>${esc(h.value)}</strong><span>${esc(h.label)}</span></li>`)
      .join('')}</ul>` : ''}
  </div>
</section>`;
}

function renderDialog() {
  return `
<dialog id="project-dialog" class="dialog" aria-labelledby="dialog-title">
  <div class="dialog__panel">
    <div class="dialog__head">
      <div>
        <p class="dialog__category" data-field="category"></p>
        <h2 id="dialog-title" tabindex="-1" data-field="title"></h2>
      </div>
      <button type="button" class="icon-btn" data-close aria-label="Fechar">${icon.close}</button>
    </div>
    <div class="dialog__player" data-field="player"></div>
    <div class="dialog__body">
      <nav class="dialog__videos" data-field="videos" aria-label="Vídeos do projeto" hidden></nav>
      <p class="dialog__period" data-field="period"></p>
      <ul class="chips" data-field="roles" aria-label="Funções"></ul>
      <div class="dialog__desc" data-field="description"></div>
      <p class="dialog__notice" data-field="notice" hidden></p>
      <p class="dialog__external" data-field="external" hidden></p>
    </div>
  </div>
</dialog>`;
}

// JSON embutido para o modal. "<" é escapado para não fechar a tag <script>.
function projectsJson(categories) {
  const map = {};
  for (const c of categories) for (const p of c.projects) map[p.id] = p;
  return JSON.stringify(map).replace(/</g, '\\u003c');
}

export function renderPage({ profile, categories }) {
  const description = [profile.role, profile.specialties].filter(Boolean).join(' — ');
  const nav = categories
    .map((c) => `<li><a href="#${c.slug}">${esc(c.menu)}</a></li>`)
    .join('');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(profile.name)} — Portfólio</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(profile.name)} — Portfólio">
<meta property="og:description" content="${esc(description)}">
<link rel="stylesheet" href="css/site.css">
<script src="js/site.js" defer></script>
</head>
<body>
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
<header class="site-header">
  <div class="container site-header__inner">
    <a class="site-header__name" href="#sobre">${esc(profile.name)}</a>
    <nav aria-label="Seções do portfólio">
      <ul class="site-nav">
        <li><a href="#sobre">Sobre</a></li>
        ${nav}
        <li><a class="site-nav__cta" href="#contato">Contato</a></li>
      </ul>
    </nav>
  </div>
</header>
<main id="conteudo" tabindex="-1">
${renderHero(profile, categories[0]?.slug || 'conteudo')}
${categories.map(renderCategory).join('\n')}
</main>
<footer id="contato" class="site-footer">
  <div class="container site-footer__inner">
    <div>
      <h2>Vamos produzir juntos?</h2>
      ${profile.email ? `<p>${esc(profile.email)}</p>` : ''}
    </div>
    <div class="actions">
      ${profile.email ? `<a class="btn btn--inverse" href="mailto:${esc(profile.email)}">Enviar e-mail</a>` : ''}
      ${profile.linkedin ? `<a class="btn btn--outline-inverse" href="${esc(profile.linkedin)}" rel="noopener">LinkedIn</a>` : ''}
    </div>
  </div>
  <div class="container site-footer__credits">
    <p>© 2026 · <a href="https://www.linkedin.com/in/felipesardim/" rel="noopener">by Felipe Sardim</a> · São Paulo</p>
  </div>
</footer>
${renderDialog()}
<script type="application/json" id="projects-data">${projectsJson(categories)}</script>
</body>
</html>
`;
}
