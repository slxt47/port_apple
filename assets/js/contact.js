// Contact form: fetches a one-time form token, checks the fields, sends them to /api/contact
// and shows the result in place. The server checks everything again.
(() => {
  'use strict';
  const form = document.getElementById('kontakt');
  const status = document.getElementById('status');
  const button = form.querySelector('button[type="submit"]');
  const label = button.querySelector('span');
  const message = form.elements.message;
  const count = document.getElementById('c-message');

  const TEXT = {
    required: { name: 'Please tell me your name.', email: 'I need your email address to answer you.',
      message: 'Please write a short message.', consent: 'Please tick the box so I may answer you.' },
    invalid: { email: 'This doesn’t look like an email address.', phone: 'Only digits, spaces and + ( ) - / . please.',
      website: 'This doesn’t look like a web address.' },
    'too-short': { message: 'A little more, please – at least 10 characters.' },
    'too-long': 'This is too long.',
  };
  const errorText = (field, code) => {
    const t = TEXT[code];
    return (t && typeof t === 'object' ? t[field] : t) || 'Please check this field.';
  };

  // ---- spotlight on the form card, like the project cards on the main page ----
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    form.addEventListener('pointermove', (e) => {
      const r = form.getBoundingClientRect();
      form.style.setProperty('--mx', e.clientX - r.left + 'px');
      form.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  }

  // ---- one-time token (proves the form was loaded and not filled in by a script within a second) ----
  let tokenTime = 0;
  const getToken = async () => {
    try {
      const r = await fetch('/api/contact/token', { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      form.elements.token.value = (await r.json()).token;
      tokenTime = Date.now();
    } catch {
      form.elements.token.value = '';
    }
  };
  getToken();

  // ---- character counter ----
  const updateCount = () => {
    const n = message.value.length;
    count.textContent = `${n.toLocaleString('en')} / 5,000`;
    count.classList.toggle('near', n > 4500);
  };
  message.addEventListener('input', updateCount);
  updateCount();

  // ---- errors ----
  const setError = (name, text) => {
    const el = document.getElementById('e-' + name);
    const input = form.elements[name];
    if (el) el.textContent = text || '';
    if (input && input.setAttribute) input.setAttribute('aria-invalid', text ? 'true' : 'false');
  };
  const clearErrors = () => {
    for (const el of form.querySelectorAll('.err')) el.textContent = '';
    for (const el of form.querySelectorAll('[aria-invalid]')) el.removeAttribute('aria-invalid');
  };

  const check = () => {
    const errs = {};
    const v = (n) => form.elements[n].value.trim();
    if (!v('name')) errs.name = 'required';
    if (!v('email')) errs.email = 'required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) errs.email = 'invalid';
    if (!v('message')) errs.message = 'required';
    else if (v('message').length < 10) errs.message = 'too-short';
    if (v('phone') && !/^[0-9+()./ -]{4,40}$/.test(v('phone'))) errs.phone = 'invalid';
    if (v('website') && !/^(https?:\/\/)?[^\s/$.?#][^\s]*\.[^\s]{2,}$/.test(v('website'))) errs.website = 'invalid';
    if (!form.elements.consent.checked) errs.consent = 'required';
    return errs;
  };

  const showErrors = (errs) => {
    const names = Object.keys(errs);
    for (const n of names) setError(n, errorText(n, errs[n]));
    if (names.some((n) => ['company', 'phone', 'website'].includes(n))) form.querySelector('.more').open = true;
    const first = form.elements[names[0]];
    if (first && first.focus) first.focus();
  };

  // live: format fields (email, phone, website) are checked as soon as you leave them;
  // while you fix one, the hint stays until the value is valid. Empty fields are only flagged on send.
  const FORMAT = ['email', 'phone', 'website'];
  const formatError = (n) => (form.elements[n].value.trim() ? check()[n] : undefined);
  form.addEventListener('focusout', (e) => {
    const n = e.target.name;
    if (!FORMAT.includes(n)) return;
    const err = formatError(n);
    setError(n, err ? errorText(n, err) : '');
  });
  form.addEventListener('input', (e) => {
    const n = e.target.name;
    if (!n || e.target.getAttribute('aria-invalid') !== 'true') return;
    if (FORMAT.includes(n)) {
      const err = formatError(n);
      if (!err) setError(n, '');
      else setError(n, errorText(n, err));
    } else {
      setError(n, '');
    }
  });

  // if sending fails, offer the address itself (built from parts, not in the HTML)
  const fallback = (text) => {
    const addr = ['fneubauer', 'slxt.org'].join('@');
    const a = document.createElement('a');
    a.href = 'mailto:' + addr;
    a.textContent = addr;
    status.replaceChildren(text, a, '.');
  };

  const busy = (on) => {
    button.disabled = on;
    button.classList.toggle('busy', on);
    label.textContent = on ? 'Sending …' : 'Send message';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    status.textContent = '';
    status.className = 'status';

    const errs = check();
    if (Object.keys(errs).length) { showErrors(errs); return; }

    // someone very fast (or the token failed): wait the last moment instead of failing
    if (!form.elements.token.value) await getToken();
    const wait = 3200 - (Date.now() - tokenTime);
    busy(true);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));

    const data = Object.fromEntries(new FormData(form));
    data.consent = form.elements.consent.checked ? '1' : '';
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const res = await r.json().catch(() => ({}));
      if (r.ok && res.ok) {
        document.getElementById('fertig-mail').textContent = data.email;
        form.hidden = true;
        const done = document.getElementById('fertig');
        done.hidden = false;
        done.focus();
        scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        return;
      }
      if (res.error === 'fields' && res.fields) { showErrors(res.fields); busy(false); return; }
      if (['token', 'abgelaufen', 'doppelt', 'zu-schnell'].includes(res.error)) {
        await getToken();
        status.textContent = 'The form was open for a long time – please press “Send message” once more.';
      } else if (res.error === 'rate') {
        status.textContent = 'You’ve sent a few messages already – please try again in an hour.';
      } else {
        fallback('Your message couldn’t be sent right now. Please try again later, or email me directly at ');
      }
      status.classList.add('bad');
    } catch {
      status.textContent = 'No connection – please check your internet and try again.';
      status.classList.add('bad');
    }
    busy(false);
  });
})();
