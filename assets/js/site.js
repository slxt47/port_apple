// Portfolio: current section in the top bar, rise-in, card spotlight + tilt, timeline drawing, map trigger,
// scroll progress, hero parallax, magnetic buttons, ripples, pointer glow. Sky/stars: himmel.js.
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

  // ---- In-page links (nav, "See the projects", logo) scroll smoothly WITHOUT putting #… into the address bar,
  // so a reload starts at the top again. A reload that still carries a hash (older link) also starts at the top;
  // a fresh visit via a shared link like slxt.dev/#contact still jumps there.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const navTyp = (performance.getEntriesByType('navigation')[0] || {}).type;
  if (navTyp === 'reload' || navTyp === 'back_forward') {
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    scrollTo(0, 0);
    addEventListener('load', () => scrollTo(0, 0), { once: true });
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const id = a.getAttribute('href').slice(1);
    const ziel = id === 'top' || !id ? null : document.getElementById(id);
    if (id && id !== 'top' && !ziel) return;
    e.preventDefault();
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    const behavior = reduce ? 'auto' : 'smooth';
    if (!ziel) { scrollTo({ top: 0, behavior }); return; }
    ziel.scrollIntoView({ behavior, block: 'start' });
    // keyboard/screen reader users land in the section (skip link)
    if (!ziel.hasAttribute('tabindex')) ziel.setAttribute('tabindex', '-1');
    ziel.focus({ preventScroll: true });
  });

  if (reduce) return;

  // ---- Rise-in once while scrolling (safety net: everything visible after 2.5 s) ----
  document.documentElement.classList.add('js');
  const items = document.querySelectorAll('.section-head, .project, .skills, .contact .card');   // timeline: own animation below
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

  // ================= More motion (05.11.2026) – all per-frame work goes through one requestAnimationFrame =================
  const fein = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lerp = (a, b, k) => a + (b - a) * k;

  // Tag pop-in order (CSS reads --n); afterwards hovering reacts without delay
  document.querySelectorAll('.tags').forEach((ul) => [...ul.children].forEach((li, i) => li.style.setProperty('--n', i)));
  const tagsFertig = new MutationObserver((ms) => {
    for (const m of ms) if (m.target.classList.contains('in')) setTimeout(() => m.target.querySelectorAll('.tags li').forEach((li) => { li.style.transitionDelay = '0s'; }), 1400);
  });
  items.forEach((el) => tagsFertig.observe(el, { attributes: true, attributeFilter: ['class'] }));

  // Scroll progress in the top bar + hero drifting away
  const bar = document.querySelector('.topbar');
  const prog = document.createElement('div'); prog.className = 'fortschritt'; prog.setAttribute('aria-hidden', 'true'); bar.append(prog);
  const hero = document.querySelector('.hero');
  let sTick = false;
  const sFrame = () => {
    sTick = false;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    prog.style.transform = `scaleX(${Math.min(1, scrollY / max).toFixed(4)})`;
    const h = hero.offsetHeight, p = Math.min(1, Math.max(0, scrollY / h));
    hero.style.setProperty('--hy', (p * h * 0.18).toFixed(1) + 'px');
    hero.style.setProperty('--ho', Math.max(0, 1 - p * 1.35).toFixed(3));   // gone before it could overlap the projects
  };
  addEventListener('scroll', () => { if (!sTick) { sTick = true; requestAnimationFrame(sFrame); } }, { passive: true });
  sFrame();

  // Ripple on every button press
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.btn'); if (!b) return;
    const r = b.getBoundingClientRect(), d = Math.hypot(r.width, r.height) * 2;
    const w = document.createElement('span'); w.className = 'welle';
    Object.assign(w.style, { width: d + 'px', height: d + 'px', left: e.clientX - r.left - d / 2 + 'px', top: e.clientY - r.top - d / 2 + 'px' });
    b.append(w);
    w.animate([{ transform: 'scale(0)', opacity: 0.3 }, { transform: 'scale(1)', opacity: 0 }], { duration: 700, easing: 'cubic-bezier(.2, .8, .2, 1)' }).onfinish = () => w.remove();
  });

  if (fein) {
    // One loop eases everything that follows the pointer: glow, card tilt, magnetic buttons
    const licht = document.createElement('div'); licht.className = 'zeiger-licht'; licht.setAttribute('aria-hidden', 'true'); document.body.prepend(licht);
    const ziel = { x: innerWidth / 2, y: innerHeight / 3 }, ist = { ...ziel };
    const karten = [...document.querySelectorAll('.project')].map((el) => ({ el, tx: 0, ty: 0, x: 0, y: 0 }));
    const knoepfe = [...document.querySelectorAll('.btn, .modus-knopf')].map((el) => ({ el, tx: 0, ty: 0, x: 0, y: 0 }));
    let laeuft = false;
    const frame = () => {
      let ruhig = true;
      ist.x = lerp(ist.x, ziel.x, 0.12); ist.y = lerp(ist.y, ziel.y, 0.12);
      licht.style.transform = `translate3d(${ist.x.toFixed(1)}px, ${ist.y.toFixed(1)}px, 0)`;
      if (Math.abs(ist.x - ziel.x) + Math.abs(ist.y - ziel.y) > 0.3) ruhig = false;
      for (const k of karten) {
        k.x = lerp(k.x, k.tx, 0.14); k.y = lerp(k.y, k.ty, 0.14);
        const ang = Math.hypot(k.x, k.y);
        k.el.style.rotate = ang < 0.01 ? '' : `${(-k.y).toFixed(4)} ${k.x.toFixed(4)} 0 ${(ang * 7).toFixed(3)}deg`;
        if (Math.abs(k.x - k.tx) + Math.abs(k.y - k.ty) > 0.001) ruhig = false;
      }
      for (const k of knoepfe) {
        k.x = lerp(k.x, k.tx, 0.18); k.y = lerp(k.y, k.ty, 0.18);
        k.el.style.translate = Math.abs(k.x) + Math.abs(k.y) < 0.05 ? '' : `${k.x.toFixed(2)}px ${k.y.toFixed(2)}px`;
        if (Math.abs(k.x - k.tx) + Math.abs(k.y - k.ty) > 0.05) ruhig = false;
      }
      laeuft = !ruhig;
      if (laeuft) requestAnimationFrame(frame);
    };
    const wecken = () => { if (!laeuft) { laeuft = true; requestAnimationFrame(frame); } };
    addEventListener('pointermove', (e) => { ziel.x = e.clientX; ziel.y = e.clientY; licht.classList.add('an'); wecken(); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => licht.classList.remove('an'));
    for (const k of karten) {
      k.el.addEventListener('pointermove', (e) => {
        const r = k.el.getBoundingClientRect();
        k.tx = ((e.clientX - r.left) / r.width - 0.5) * 2 * (Math.min(1, 420 / r.width));   // wide cards tilt less
        k.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        k.tx *= 0.5; k.ty *= 0.5; wecken();
      });
      k.el.addEventListener('pointerleave', () => { k.tx = 0; k.ty = 0; wecken(); });
    }
    for (const k of knoepfe) {
      k.el.addEventListener('pointermove', (e) => {
        const r = k.el.getBoundingClientRect();
        k.tx = (e.clientX - r.left - r.width / 2) * 0.25; k.ty = (e.clientY - r.top - r.height / 2) * 0.35; wecken();
      });
      k.el.addEventListener('pointerleave', () => { k.tx = 0; k.ty = 0; wecken(); });
    }
  }

  // ---- Timeline: the line DRIVES down (time-based, never jumps – also after "Journey" in the top bar),
  // following the scroll position; every dot it passes pops, sends out a ring and reveals its entry ----
  const tl = document.querySelector('.timeline');
  const punkte = [...tl.children].map((li) => ({ li, an: false }));
  tl.classList.add('faehrt');
  let soll = 0, ist = 0, tlLauf = false, tlZeit = 0;
  const TOP = 6;                                        // line starts 6px below the top (CSS)
  const zielBerechnen = () => {
    const r = tl.getBoundingClientRect();
    soll = Math.max(soll, Math.min(1, Math.max(0, (innerHeight * 0.8 - r.top) / r.height)));   // only forward
  };
  const tlFrame = (now) => {
    const dt = Math.min(50, now - (tlZeit || now)); tlZeit = now;
    const diff = soll - ist;
    // ease out, but never faster than the whole line in 1.6 s – so it always visibly "drives"
    ist += Math.sign(diff) * Math.min(Math.abs(diff), Math.max(Math.abs(diff) * (1 - Math.exp(-dt / 220)), dt / 4000), dt / 1600);
    tl.style.setProperty('--p', ist.toFixed(4));
    const spitze = TOP + ist * (tl.offsetHeight - TOP);
    for (const pt of punkte) {
      if (!pt.an && spitze >= pt.li.offsetTop + 13) { pt.an = true; pt.li.classList.add('erreicht'); }
    }
    if (Math.abs(soll - ist) > 0.0005) requestAnimationFrame(tlFrame);
    else { tlLauf = false; tlZeit = 0; }
  };
  const tlWecken = () => { zielBerechnen(); if (!tlLauf && soll > ist) { tlLauf = true; requestAnimationFrame(tlFrame); } };
  addEventListener('scroll', tlWecken, { passive: true });
  addEventListener('resize', tlWecken);
  tlWecken();
})();
