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
