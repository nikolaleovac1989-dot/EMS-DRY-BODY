/* ===== X-BODY EXPERT – skripta ===== */
(() => {
  'use strict';

  /* ---------- PODEŠAVANJA ---------- */
  const CONFIG = {
    whatsappNumber: '381653354934',   // bez + i razmaka
    formEndpoint: '',                 // npr. Formspree URL; ako je prazno, zahtev se šalje preko WhatsApp-a
    autoFlipMs: 6000,                 // na koliko ms se mapa mišića sama okreće
  };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header, meni, baner ---------- */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('#burger'), nav = $('#nav');
  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Zatvori meni' : 'Otvori meni');
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  addEventListener('resize', () => { if (innerWidth > 980) setMenu(false); });

  const promo = $('#promo');
  if (promo) {
    try { if (sessionStorage.getItem('promoClosed')) promo.classList.add('is-hidden'); } catch (_) {}
    $('.promo__close', promo).addEventListener('click', () => {
      promo.classList.add('is-hidden');
      try { sessionStorage.setItem('promoClosed', '1'); } catch (_) {}
    });
  }
  $('#year').textContent = new Date().getFullYear();

  /* ---------- Reveal na skrol ---------- */
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  } else revealEls.forEach(el => el.classList.add('in'));

  /* ---------- Izbor paketa → forma ---------- */
  $$('[data-plan]').forEach(a => a.addEventListener('click', () => {
    const sel = $('#paket');
    const opt = [...sel.options].find(o => o.text === a.dataset.plan || o.value === a.dataset.plan);
    if (opt) sel.value = opt.value;
  }));

  /* ---------- Forma ---------- */
  const form = $('#form'), status = $('#formStatus');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    status.className = 'form__status';
    status.textContent = '';
    if (form.website.value) return; // honeypot
    const ime = form.ime.value.trim(), tel = form.telefon.value.trim();
    $$('input', form).forEach(i => i.classList.remove('bad'));
    if (!ime) { form.ime.classList.add('bad'); form.ime.focus(); status.classList.add('err'); status.textContent = 'Unesi svoje ime.'; return; }
    if (!/^[0-9+ /()\-]{6,}$/.test(tel)) { form.telefon.classList.add('bad'); form.telefon.focus(); status.classList.add('err'); status.textContent = 'Unesi ispravan broj telefona.'; return; }

    const data = { ime, telefon: tel, termin: form.termin.value.trim() || 'nije navedeno', paket: form.paket.value };
    const text = `Zdravo! Želim da zakažem besplatan probni trening.\nIme: ${data.ime}\nTelefon: ${data.telefon}\nŽeljeni termin: ${data.termin}\nPaket: ${data.paket}`;

    if (CONFIG.formEndpoint) {
      try {
        const r = await fetch(CONFIG.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error();
        status.textContent = 'Hvala! Javićemo ti se uskoro radi dogovora termina.';
        form.reset();
      } catch (_) {
        status.classList.add('err');
        status.textContent = 'Slanje nije uspelo. Pozovi nas na 065 3354 934.';
      }
      return;
    }
    window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    status.textContent = 'Otvaramo WhatsApp sa tvojim zahtevom – samo ga pošalji. Možeš i da nas pozoveš: 065 3354 934.';
  });

  /* =====================================================
     INTERAKTIVNA MAPA MIŠIĆA
     Koordinate: viewBox 0 0 440 480. Leva polovina figure je
     definisana ručno, desna se dobija ogledalom (mirror:true).
     ===================================================== */
  const NS = 'http://www.w3.org/2000/svg';
  const W = 736, H = 1288, MIR = `translate(${W} 0) scale(-1 1)`;
  const IMG = { front: 'img/mapa-spreda.jpg', back: 'img/mapa-pozadi.jpg' };
  // Zone su zadate u pikselima slike (736×1288); mirror:true dodaje ogledalsku polovinu oko x=368.
  const MUSCLES = {
    front: [
      { id: 'ramena', label: 'Ramena', text: 'Jačanje i stabilizacija ramenog pojasa. Doprinosi boljem držanju i može pomoći kod napetosti u ramenima.',
        zones: [{ d: 'M222 300C232 280 262 276 284 292L274 318C270 345 264 365 260 382L240 382C226 362 218 332 222 300Z', mirror: true }], dots: [[248, 322, true]] },
      { id: 'grudi', label: 'Grudi', text: 'Jačanje i zatezanje grudnih mišića.',
        zones: [{ d: 'M360 300C332 290 296 292 274 306C264 330 270 370 292 386C316 396 346 390 361 380Z', mirror: true }], dots: [[326, 342, true]] },
      { id: 'biceps', label: 'Ruke (biceps)', text: 'Doprinosi tonusu i definiciji ruku.',
        zones: [{ d: 'M232 374C242 368 258 370 268 378C268 412 260 442 246 470L220 472C212 442 220 402 232 374Z', mirror: true }], dots: [[242, 424, true]] },
      { id: 'stomak', label: 'Stomak', text: 'Jačanje trbušnog zida i dubokih mišića trupa (core). Doprinosi smanjenju masnih naslaga i ravnijem stomaku.',
        zones: [
          { d: 'M319 408L417 408L417 640L368 652L319 640Z', mirror: false },
          { d: 'M318 438C300 450 287 472 285 502C285 530 293 548 309 562L319 562Z', mirror: true },
        ], dots: [[368, 524, false]] },
      { id: 'prednja-loza', label: 'Prednja loža butina', text: 'Snaga i oblikovanje nogu, uz podršku kolenima.',
        zones: [{ d: 'M270 642C262 700 262 764 280 822L340 824C358 772 362 704 360 652C340 642 302 638 270 642Z', mirror: true }], dots: [[312, 734, true]] },
    ],
    back: [
      { id: 'gornja-ledja', label: 'Gornji deo leđa', text: 'Jačanje mišića leđa i doprinos boljem držanju tela.',
        zones: [
          { d: 'M298 404L438 404L420 462L368 546L316 462Z', mirror: false },
          { d: 'M304 466C290 516 300 574 322 600L350 592L338 524Z', mirror: true },
        ], dots: [[368, 470, false]] },
      { id: 'donja-ledja', label: 'Donji deo leđa', text: 'Jačanje dubokih leđnih mišića koji podržavaju kičmu. Može pomoći kod bolova u leđima izazvanih sedentarnim načinom života.',
        zones: [{ d: 'M342 548L394 548L410 608L326 608Z', mirror: false }], dots: [[368, 580, false]] },
      { id: 'triceps', label: 'Ruke (triceps)', text: 'Zatezanje zadnjeg dela nadlaktice.',
        zones: [{ d: 'M258 470C282 462 304 472 296 502C284 532 262 558 244 572C228 568 224 556 228 540C242 520 252 500 258 470Z', mirror: true }], dots: [[262, 516, true]] },
      { id: 'zadnja-loza', label: 'Zadnja loža i listovi', text: 'Snaga i oblikovanje nogu, podsticanje cirkulacije i limfne drenaže. Doprinosi smanjenju vidljivosti celulita.',
        zones: [
          { d: 'M294 716C286 766 290 832 302 872L352 870C364 822 366 764 364 722Z', mirror: true },
          { d: 'M300 882C288 932 292 1002 308 1060L336 1062C346 1000 352 932 352 882Z', mirror: true },
        ], dots: [[326, 792, true], [320, 962, true]] },
      { id: 'gluteus', label: 'Gluteus', text: 'Podizanje i oblikovanje zadnjice.',
        zones: [{ d: 'M298 626C292 662 302 700 332 716C350 722 362 712 366 700L366 630C340 614 314 612 298 626Z', mirror: true }], dots: [[332, 668, true]] },
    ],
  };

  const mk = (tag, attrs = {}, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };

  function buildFace(host, side) {
    const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, role: 'presentation', focusable: 'false' });
    const defs = mk('defs', {}, svg);
    // limeta "svetli" filter: pretvara sivu sliku mišića u limeta ton uz zadržane detalje vlakana
    const f = mk('filter', { id: `lime-${side}`, 'color-interpolation-filters': 'sRGB' }, defs);
    mk('feColorMatrix', { type: 'matrix', values: '.43 .84 .16 0 0  .58 1.12 .21 0 0  .14 .28 .05 0 0  0 0 0 1 0' }, f);
    const blur = mk('filter', { id: `soft-${side}`, x: '-10%', y: '-10%', width: '120%', height: '120%' }, defs);
    mk('feGaussianBlur', { stdDeviation: 4 }, blur);
    // zadnja slika je manja od prednje: uvećaj je oko središnje ose da figure budu iste visine (glava 88, tabani 1180)
    const root = side === 'back' ? mk('g', { transform: 'translate(368 88) scale(1.286) translate(-368 -266)' }, svg) : svg;
    mk('image', { href: IMG[side], width: W, height: H, preserveAspectRatio: 'xMidYMid slice' }, root);

    MUSCLES[side].forEach(m => {
      const mask = mk('mask', { id: `mk-${side}-${m.id}`, maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H }, defs);
      const mg = mk('g', { filter: `url(#soft-${side})`, fill: '#fff' }, mask);
      m.zones.forEach(z => { mk('path', { d: z.d }, mg); if (z.mirror) mk('path', { d: z.d, transform: MIR }, mg); });

      const g = mk('g', {
        class: 'muscle', 'data-id': m.id, 'data-side': side, role: 'button', tabindex: '0',
        'aria-pressed': 'false', 'aria-label': `${m.label} – prikaži opis`,
      }, root);
      const glow = mk('g', { class: 'litwrap' }, g);
      const lit = mk('g', { mask: `url(#mk-${side}-${m.id})` }, glow);
      mk('image', { href: IMG[side], width: W, height: H, filter: `url(#lime-${side})` }, lit);
      m.zones.forEach(z => {
        mk('path', { class: 'hit', d: z.d }, g);
        if (z.mirror) mk('path', { class: 'hit', d: z.d, transform: MIR }, g);
      });
      m.dots.forEach(([x, y, mir]) => {
        [x, ...(mir ? [W - x] : [])].forEach(cx => {
          const dg = mk('g', { class: 'dotg', 'pointer-events': 'none' }, g);
          mk('circle', { class: 'ring', cx, cy: y, r: 8 }, dg);
          mk('circle', { class: 'dotc', cx, cy: y, r: 7 }, dg);
        });
      });
    });
    host.appendChild(svg);
  }

  const flip = $('#flip'), faceF = $('#faceFront'), faceB = $('#faceBack');
  if (flip) {
    buildFace(faceF, 'front');
    buildFace(faceB, 'back');

    const card = $('#mcardBody'), chipsHost = $('#chips'), segBtns = $$('.seg__b'), flipBtn = $('#flipBtn');
    const hintHTML = '<p class="mcard__hint"><svg class="ic" aria-hidden="true"><use href="#i-bolt"/></svg> Klikni na deo tela i saznaj kako EMS deluje</p>';
    const state = { side: 'front', selected: null, auto: !reduceMotion, timer: null, visible: false };
    const find = id => [...MUSCLES.front, ...MUSCLES.back].find(m => m.id === id);
    const sideName = s => (s === 'front' ? 'Spreda' : 'Pozadi');

    function showCard(m) {
      const node = document.createElement('div');
      node.className = 'mcard__body';
      node.id = 'mcardBody';
      node.innerHTML = m
        ? `<span class="mcard__side">${sideName(m.side || state.side)}</span><h3></h3><p></p>`
        : hintHTML;
      if (m) { node.querySelector('h3').textContent = m.label; node.querySelector('p').textContent = m.text; }
      $('#mcardBody').replaceWith(node);
    }
    const current = () => (state.selected ? find(state.selected) : null);

    function renderChips() {
      chipsHost.innerHTML = '';
      MUSCLES[state.side].forEach(m => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'chip' + (state.selected === m.id ? ' is-on' : '');
        b.dataset.id = m.id;
        b.setAttribute('aria-pressed', state.selected === m.id);
        b.innerHTML = '<i><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg></i><span></span>';
        b.lastChild.textContent = m.label;
        chipsHost.appendChild(b);
      });
    }

    function select(id, user = true) {
      if (user) stopAuto();
      state.selected = id;
      $$('.muscle').forEach(g => {
        const on = g.dataset.id === id;
        g.classList.toggle('is-on', on);
        g.setAttribute('aria-pressed', on);
      });
      const m = id ? { ...find(id), side: MUSCLES.front.some(x => x.id === id) ? 'front' : 'back' } : null;
      showCard(m);
      renderChips();
    }

    function setSide(side, user = false) {
      if (user) stopAuto();
      if (side === state.side) return;
      state.side = side;
      flip.classList.toggle('is-back', side === 'back');
      faceF.toggleAttribute('inert', side === 'back');
      faceB.toggleAttribute('inert', side === 'front');
      segBtns.forEach(b => { const on = b.dataset.side === side; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); });
      select(null, false);
    }

    function stopAuto() { state.auto = false; clearInterval(state.timer); state.timer = null; }
    function startAuto() {
      if (!state.auto || state.timer || reduceMotion) return;
      state.timer = setInterval(() => {
        if (state.auto && state.visible && !document.hidden) setSide(state.side === 'front' ? 'back' : 'front');
      }, CONFIG.autoFlipMs);
    }

    // interakcija sa figurom
    [faceF, faceB].forEach(face => {
      face.addEventListener('click', e => {
        const g = e.target.closest('.muscle');
        if (!g) return;
        select(state.selected === g.dataset.id && matchMedia('(hover:none)').matches ? null : g.dataset.id);
      });
      face.addEventListener('keydown', e => {
        const g = e.target.closest('.muscle');
        if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(g.dataset.id); }
      });
      // hover pregled na računaru (miš) – kartica prikazuje opis dok se prelazi preko zone
      face.addEventListener('pointerover', e => {
        if (e.pointerType !== 'mouse') return;
        const g = e.target.closest('.muscle');
        if (g && g.dataset.id !== state.selected) showCard({ ...find(g.dataset.id), side: g.dataset.side });
      });
      face.addEventListener('pointerout', e => {
        if (e.pointerType !== 'mouse') return;
        const g = e.target.closest('.muscle');
        if (g && !(e.relatedTarget && g.contains(e.relatedTarget))) {
          const c = current();
          showCard(c ? { ...c, side: state.side } : null);
        }
      });
    });
    chipsHost.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      select(state.selected === b.dataset.id ? null : b.dataset.id);
    });
    segBtns.forEach(b => b.addEventListener('click', () => setSide(b.dataset.side, true)));
    flipBtn.addEventListener('click', () => {
      setSide(state.side === 'front' ? 'back' : 'front', true);
      flipBtn.classList.add('spin'); setTimeout(() => flipBtn.classList.remove('spin'), 800);
    });

    // okretanje samo dok je mapa u vidnom polju
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => { state.visible = es[0].isIntersecting; }, { threshold: .35 }).observe(flip);
    } else state.visible = true;

    renderChips();
    startAuto();
  }
})();


/* ===== Hero: pre/posle klizač ===== */
(() => {
  const ba = document.getElementById('ba');
  if (!ba) return;
  const handle = document.getElementById('baHandle');
  const sideBad = document.getElementById('sideBad'), sideGood = document.getElementById('sideGood');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let p = 50, dragging = false, anim = 0;

  // ako slika ne postoji, prikaži uredan placeholder
  ba.querySelectorAll('.ba__layer img').forEach(img => {
    const miss = () => img.closest('.ba__layer').classList.add('no-img');
    img.addEventListener('error', miss);
    if (img.complete && !img.naturalWidth) miss();
  });

  function set(v) {
    p = Math.max(0, Math.min(100, v));
    ba.style.setProperty('--p', p.toFixed(2));
    handle.setAttribute('aria-valuenow', Math.round(p));
    handle.setAttribute('aria-valuetext', `Prikazano ${Math.round(p)}% pre, ${100 - Math.round(p)}% posle`);
    // strana koja je više otkrivena dobija na isticanju
    const l = p / 100, r = 1 - l;
    sideBad.style.setProperty('--ol', (.3 + .7 * l).toFixed(2));
    sideGood.style.setProperty('--or', (.3 + .7 * r).toFixed(2));
    sideBad.style.transform = `scale(${(.94 + .12 * l).toFixed(3)})`;
    sideGood.style.transform = `scale(${(.94 + .12 * r).toFixed(3)})`;
  }
  const fromEvent = e => { const b = ba.getBoundingClientRect(); return (e.clientX - b.left) / b.width * 100; };
  const stopAnim = () => { cancelAnimationFrame(anim); anim = 0; };

  ba.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    stopAnim(); dragging = true; ba.classList.add('is-drag');
    ba.setPointerCapture(e.pointerId);
    set(fromEvent(e));
  });
  ba.addEventListener('pointermove', e => { if (dragging) set(fromEvent(e)); });
  const end = () => { dragging = false; ba.classList.remove('is-drag'); };
  ba.addEventListener('pointerup', end);
  ba.addEventListener('pointercancel', end);
  ba.addEventListener('lostpointercapture', end);

  handle.addEventListener('keydown', e => {
    const step = e.shiftKey ? 15 : 5;
    const map = { ArrowLeft: p - step, ArrowDown: p - step, ArrowRight: p + step, ArrowUp: p + step, Home: 0, End: 100 };
    if (e.key in map) { e.preventDefault(); stopAnim(); set(map[e.key]); }
  });

  // uvodna animacija levo-desno
  set(50);
  if (!reduce) {
    const keys = [50, 28, 72, 50], seg = 650;
    const t0 = performance.now() + 700;
    const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const tick = now => {
      if (now < t0) { anim = requestAnimationFrame(tick); return; }
      const t = (now - t0) / seg, i = Math.floor(t);
      if (i >= keys.length - 1) { set(50); anim = 0; return; }
      set(keys[i] + (keys[i + 1] - keys[i]) * ease(t - i));
      anim = requestAnimationFrame(tick);
    };
    anim = requestAnimationFrame(tick);
  }
})();

/* ===== Mobilno: traka "Pozovi / Zakaži" se prikazuje tek kad se hero napusti ===== */
(() => {
  const hero = document.querySelector('.hero');
  if (!hero || !('IntersectionObserver' in window)) { document.body.classList.add('dock-on'); return; }
  new IntersectionObserver(([e]) => {
    document.body.classList.toggle('dock-on', !e.isIntersecting && e.boundingClientRect.top < 0);
  }, { threshold: 0 }).observe(hero);
})();
