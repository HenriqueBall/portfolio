// Comportamento da página: carrosséis por categoria e modal de projeto.
(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- Carrossel ---------------- */
  function setupCarousel(root) {
    const section = root.closest('.category');
    const track = root.querySelector('[data-track]');
    const prev = section.querySelector('[data-prev]');
    const next = section.querySelector('[data-next]');
    const status = section.querySelector('[data-status]');
    const items = Array.from(track.children);
    let statusTimer;

    const gapSize = () => parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = () => {
      if (!items[0]) return track.clientWidth;
      return items[0].getBoundingClientRect().width + gapSize();
    };

    const update = (announce) => {
      const max = track.scrollWidth - track.clientWidth;
      const atStart = track.scrollLeft <= 2;
      const atEnd = track.scrollLeft >= max - 2;
      section.classList.toggle('is-static', max <= 2);
      prev.setAttribute('aria-disabled', String(atStart));
      next.setAttribute('aria-disabled', String(atEnd));

      const s = step();
      const first = Math.min(items.length, Math.round(track.scrollLeft / s) + 1);
      const visible = Math.max(1, Math.floor((track.clientWidth + gapSize()) / s));
      const last = atEnd ? items.length : Math.min(items.length, first + visible - 1);
      const text = first === last ? `${first} de ${items.length}` : `${first}–${last} de ${items.length}`;
      clearTimeout(statusTimer);
      // Só atualiza a região "aria-live" depois que a rolagem para, para não ficar falando a cada pixel.
      statusTimer = setTimeout(() => { status.textContent = text; }, announce ? 0 : 250);
    };

    const go = (dir, btn) => {
      if (btn.getAttribute('aria-disabled') === 'true') return;
      track.scrollBy({ left: dir * step(), behavior: reducedMotion ? 'auto' : 'smooth' });
    };

    prev.addEventListener('click', () => go(-1, prev));
    next.addEventListener('click', () => go(1, next));
    track.addEventListener('scroll', () => update(false), { passive: true });
    window.addEventListener('resize', () => update(false));
    update(true);
  }

  document.querySelectorAll('[data-carousel]').forEach(setupCarousel);

  /* ---------------- Modal ---------------- */
  const dialog = document.getElementById('project-dialog');
  const dataEl = document.getElementById('projects-data');
  if (!dialog || !dataEl || typeof dialog.showModal !== 'function') return;

  const projects = JSON.parse(dataEl.textContent);
  const field = (name) => dialog.querySelector(`[data-field="${name}"]`);
  let opener = null;

  function setText(name, value) {
    const el = field(name);
    el.textContent = value || '';
    el.hidden = !value;
  }

  function showVideo(project, index) {
    const video = project.videos[index];
    const player = field('player');
    player.replaceChildren();
    if (!video) return;
    const iframe = document.createElement('iframe');
    iframe.src = video.embed;
    iframe.title = `${project.title} — ${video.label}`;
    iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    player.append(iframe);
    field('videos').querySelectorAll('button').forEach((b, i) => {
      b.setAttribute('aria-current', String(i === index));
    });
    const ext = field('external');
    ext.replaceChildren();
    const a = document.createElement('a');
    a.href = video.url;
    a.rel = 'noopener';
    a.target = '_blank';
    a.textContent = 'Abrir este vídeo no YouTube (nova aba)';
    ext.append(a);
    ext.hidden = false;
  }

  function open(id, trigger) {
    const p = projects[id];
    if (!p) return;
    opener = trigger;
    setText('category', p.category);
    field('title').textContent = p.title;
    setText('period', p.period);
    setText('notice', p.notice);

    const roles = field('roles');
    roles.replaceChildren(...p.roles.map((r) => Object.assign(document.createElement('li'), { textContent: r })));
    roles.hidden = p.roles.length === 0;

    const desc = field('description');
    desc.replaceChildren(
      ...p.description.split(/\n\s*\n/).filter((t) => t.trim()).map((t) => Object.assign(document.createElement('p'), { textContent: t.trim() }))
    );

    const list = field('videos');
    list.replaceChildren(
      ...p.videos.map((v, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = v.label;
        b.addEventListener('click', () => showVideo(p, i));
        return b;
      })
    );
    list.hidden = p.videos.length < 2;
    field('external').hidden = true;
    showVideo(p, 0);

    dialog.showModal();
    field('title').focus();
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-open-project]');
    if (trigger) open(trigger.dataset.openProject, trigger);
  });
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  // Clique fora do painel (no fundo escurecido) fecha.
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  // ESC já fecha nativamente; ao fechar, para o vídeo e devolve o foco ao card.
  dialog.addEventListener('close', () => {
    field('player').replaceChildren();
    if (opener) opener.focus();
  });
})();
