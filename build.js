// Build do site: lê o conteúdo em /content, gera /_site/index.html e copia /static.
// Sem dependências externas: roda com Node >= 20.
import {
  readFileSync,
  writeFileSync,
  rmSync,
  mkdirSync,
  readdirSync,
  copyFileSync,
  existsSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from './src/page.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, '_site');

// Categorias fixas: a ordem aqui é a ordem das seções no site.
// "menu" é o rótulo curto do cabeçalho; o título da seção vem do JSON (editável no CMS).
export const CATEGORIES = [
  { slug: 'educacionais', menu: 'Educacionais' },
  { slug: 'corporativo', menu: 'Corporativo' },
  { slug: 'cultura', menu: 'Cultura e Artes' },
  { slug: 'autorais', menu: 'Autorais' },
];

const warnings = [];
const warn = (msg) => warnings.push(msg);

function readJson(relPath) {
  const full = join(ROOT, relPath);
  try {
    return JSON.parse(readFileSync(full, 'utf8'));
  } catch (err) {
    throw new Error(`Falha ao ler ${relPath}: ${err.message}`);
  }
}

// Converte qualquer URL comum do YouTube em URL de embed (youtube-nocookie).
export function toYouTubeEmbed(rawUrl) {
  if (!rawUrl) return null;
  let url;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.)/, '');
  let id = null;
  if (host === 'youtu.be') {
    id = url.pathname.slice(1).split('/')[0];
  } else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v');
    if (!id) {
      const match = url.pathname.match(/^\/(embed|shorts|live)\/([^/?#]+)/);
      if (match) id = match[2];
    }
    const list = url.searchParams.get('list');
    if (!id && list && /^[\w-]+$/.test(list)) {
      return `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`;
    }
  }
  if (id && /^[\w-]{6,20}$/.test(id)) {
    return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
  }
  return null;
}

// Caminhos de mídia do Decap começam com "/" (ex.: /img/uploads/x.jpg).
// Removemos a barra para o site funcionar tanto na raiz do domínio quanto em subpasta (usuario.github.io/portfolio).
export function asset(path) {
  if (!path) return '';
  return path.startsWith('/') ? path.slice(1) : path;
}

function normalizeProject(raw, category, index) {
  const where = `${category.slug} › projeto ${index + 1}`;
  const title = (raw.title || '').trim();
  if (!title) warn(`${where}: sem título.`);
  const videos = (raw.videos || [])
    .map((v, i) => {
      const embed = toYouTubeEmbed(v.url);
      if (v.url && !embed) warn(`${where} (${title}): URL de vídeo não reconhecida: ${v.url}`);
      return embed ? { label: (v.label || '').trim() || `Vídeo ${i + 1}`, url: v.url.trim(), embed } : null;
    })
    .filter(Boolean);
  return {
    id: `${category.slug}-${index + 1}`,
    title: title || 'Projeto sem título',
    category: category.title,
    cover: asset(raw.cover),
    period: (raw.period || '').trim(),
    roles: (raw.roles || []).map((r) => String(r).trim()).filter(Boolean),
    description: (raw.description || '').trim(),
    notice: (raw.notice || '').trim(),
    videos,
  };
}

function loadContent() {
  const profile = readJson('content/profile.json');
  profile.photo = asset(profile.photo);
  profile.banner = asset(profile.banner);

  const categories = CATEGORIES.map((cat) => {
    const data = readJson(`content/categories/${cat.slug}.json`);
    const category = { ...cat, title: (data.title || cat.menu).trim() };
    category.projects = (data.projects || []).map((p, i) => normalizeProject(p, category, i));
    return category;
  });
  return { profile, categories };
}

function copyDirectory(source, destination) {
  mkdirSync(destination, { recursive: true });
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const sourcePath = join(source, entry.name);
    const destinationPath = join(destination, entry.name);
    if (entry.isDirectory()) copyDirectory(sourcePath, destinationPath);
    else if (entry.isFile()) copyFileSync(sourcePath, destinationPath);
  }
}

function build() {
  const content = loadContent();
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });
  if (existsSync(join(ROOT, 'static'))) copyDirectory(join(ROOT, 'static'), OUT);
  writeFileSync(join(OUT, 'index.html'), renderPage(content), 'utf8');
  writeFileSync(join(OUT, '.nojekyll'), '');

  const total = content.categories.reduce((n, c) => n + c.projects.length, 0);
  console.log(`✔ Site gerado em _site/ (${total} projetos em ${content.categories.length} categorias).`);
  for (const w of warnings) console.warn(`⚠ ${w}`);
}

// Executa só quando chamado diretamente (permite importar as funções em testes).
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    build();
  } catch (err) {
    console.error(`✖ ${err.message}`);
    process.exit(1);
  }
}
