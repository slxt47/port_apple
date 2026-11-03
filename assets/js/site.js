// Portfolio: current section in the top bar, rise-in, card spotlight, timeline drawing, map trigger.
// The page works without it; with "reduce motion" only the section marker stays.
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('.nav');
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map((a) => document.querySelector(a.hash)).filter(Boolean);

  // ---- Top bar: mark the section on screen, a pill slides to it ----
  if (reduce) document.documentElement.classList.add('no-pill');
  const pill = (a) => {
    if (!a) { nav.style.setProperty('--o', 0); return; }
    nav.style.setProperty('--x', a.offsetLeft + 'px');
    nav.style.setProperty('--w', a.offsetWidth + 'px');
    nav.style.setProperty('--o', 1);
  };
  const setCurrent = (id) => {
    let cur = null;
    for (const a of links) { const on = a.hash === '#' + id; a.setAttribute('aria-current', String(on)); if (on) cur = a; }
    pill(cur);
  };
  const seen = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => seen.observe(s));
  addEventListener('scroll', () => { if (scrollY < 200) setCurrent(null); }, { passive: true });
  addEventListener('resize', () => pill(links.find((a) => a.getAttribute('aria-current') === 'true')));

  if (reduce) return;

  // ---- Rise-in once while scrolling (safety net: everything visible after 2.5 s) ----
  document.documentElement.classList.add('js');
  const items = document.querySelectorAll('.section-head, .project, .timeline li, .skills, .contact .card');
  items.forEach((el) => el.classList.add('rise'));
  const rise = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); rise.unobserve(e.target); }
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => rise.observe(el));
  // Fallback without the observer (some browsers deliver it late): check positions on scroll
  const check = () => {
    for (const el of items) if (!el.classList.contains('in') && el.getBoundingClientRect().top < innerHeight * 0.92) { el.classList.add('in'); rise.unobserve(el); }
  };
  addEventListener('scroll', check, { passive: true });
  setTimeout(check, 2500);

  // Cards in one row arrive one after another
  document.querySelectorAll('.project').forEach((el, i) => { el.style.transitionDelay = (i % 3) * 70 + 'ms'; });
  // …but hovering later should react at once
  document.querySelectorAll('.project').forEach((el) => el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true }));

  // ---- Spotlight that follows the pointer on project cards ----
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    for (const card of document.querySelectorAll('.project')) {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - r.left + 'px');
        card.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    }
  }

  // ---- Map: starts on Europe, Austria lights up, then the view flies in to Austria ----
  const map = document.querySelector('.map');
  const svg = map && map.querySelector('.austria');
  const europe = svg && svg.querySelector('.europe');
  if (europe && window.DOMParser) {
    const START = [-5978.7, -4753.6, 12757.2, 6793.2], END = [0, 0, 800, 426];
    const setBox = (b) => svg.setAttribute('viewBox', b.map((v) => v.toFixed(2)).join(' '));
    const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const fly = () => {
      const w0 = START[2], w1 = END[2];
      const c0 = [START[0] + w0 / 2, START[1] + START[3] / 2], c1 = [END[0] + w1 / 2, END[1] + END[3] / 2];
      const dur = 2400; let t0;
      const step = (now) => {
        if (!t0) t0 = now;
        const k = ease(Math.min(1, (now - t0) / dur));
        const w = Math.exp(Math.log(w0) + (Math.log(w1) - Math.log(w0)) * k);   // even zoom speed
        const g = (w0 - w) / (w0 - w1);                                          // focus stays on Austria
        const h = w * 426 / 800, cx = c0[0] + (c1[0] - c0[0]) * g, cy = c0[1] + (c1[1] - c0[1]) * g;
        setBox([cx - w / 2, cy - h / 2, w, h]);
        if (k > 0.8) map.classList.add('zoomed');   // last stretch: Europe fades, the states start drawing
        if (k < 1) requestAnimationFrame(step);
        else { setBox(END); setTimeout(() => map.classList.add('fertig'), 1000); }
      };
      requestAnimationFrame(step);
    };
    const done = () => map.classList.add('zoomed', 'fertig');
    // Europe is a separate file, fetched only when the map comes near
    let loaded = null;
    const load = () => loaded || (loaded = fetch('./assets/images/europe.svg')
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((text) => {
        const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
        for (const el of doc.querySelectorAll('path')) europe.appendChild(document.importNode(el, true));
        if (!map.classList.contains('zoomed')) setBox(START);
      }));
    const near = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { near.disconnect(); load().catch(done); }
    }, { rootMargin: '600px 0px' });
    near.observe(map);
    const start = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      start.disconnect();
      load().then(() => setTimeout(fly, 900)).catch(done);
    }, { threshold: 0.5 });
    start.observe(map);
  } else if (map) {
    map.classList.add('zoomed', 'fertig');
  }

  // ---- Timeline line draws itself as you scroll past ----
  const tl = document.querySelector('.timeline');
  let ticking = false;
  const draw = () => {
    ticking = false;
    const r = tl.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / r.height));
    tl.style.setProperty('--p', p.toFixed(3));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
  draw();
})();
