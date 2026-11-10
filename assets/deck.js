/* Motor de diapositivas: carga deck.json y slides/*.html, escala 1920×1080,
   builds, transiciones, notas, vista del orador sincronizada y vista general. */
(function () {
  'use strict';
  var W = 1920, H = 1080;
  var params = new URLSearchParams(location.search);
  var PRESENTER = params.has('presenter');
  var channel = 'BroadcastChannel' in window ? new BroadcastChannel('estados-flutter-deck') : null;

  var ICONS = {
    PhoneSilent: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M11 18h2"/><path d="M3 4l18 17"/>',
    Hand: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    Dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/>',
    LaptopOff: '<rect x="4" y="4" width="16" height="11" rx="1.5"/><path d="M2 19h20"/><path d="M3 3l18 18"/>',
    Lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    Chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    Users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    Code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    Lightning: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    Link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    Settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    CheckCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    Wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    Verified: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
    Search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    Lightbulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    Warning: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    Home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    Book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'
  };

  var $ = function (s) { return document.querySelector(s); };
  var stage = $('#stage'), viewport = $('#viewport');
  var slides = [], idx = 0, step = 0, sections = {};

  /* ---------- carga ---------- */
  function parseSlide(id, text) {
    var embeds = [];
    // Los x-embed traen una página completa: se guardan como texto antes de parsear.
    var html = text.replace(/<x-embed([^>]*)>([\s\S]*?)<\/x-embed>/g, function (m, attrs, body) {
      embeds.push(body);
      return '<div class="x-embed"' + attrs + ' data-embed="' + (embeds.length - 1) + '"></div>';
    });
    var tpl = document.createElement('template');
    tpl.innerHTML = html;
    var sec = tpl.content.querySelector('section');
    if (!sec) { sec = document.createElement('section'); sec.textContent = 'No se pudo leer ' + id; }
    var aside = sec.querySelector('aside');
    var notes = aside ? aside.textContent.trim() : '';
    if (aside) aside.remove();
    sec.querySelectorAll('x-icon').forEach(function (el) {
      var span = document.createElement('span');
      span.className = 'x-icon';
      span.setAttribute('style', el.getAttribute('style') || '');
      span.setAttribute('aria-hidden', 'true');
      span.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[el.getAttribute('name')] || ICONS.Star) + '</svg>';
      el.replaceWith(span);
    });
    var builds = Array.prototype.slice.call(sec.querySelectorAll('[data-build-in]'));
    builds.sort(function (a, b) { return order(a) - order(b); });
    builds.forEach(function (b) { b.classList.add('build'); });
    var t = sec.querySelector('h1, h2');
    return {
      id: id, section: sec, embeds: embeds, notes: notes, builds: builds,
      title: t ? t.textContent.trim() : id,
      transition: sec.getAttribute('data-transition') || 'fade'
    };
  }
  function order(el) {
    var m = /order\s+(\d+)/.exec(el.getAttribute('data-build-in') || '');
    return m ? +m[1] : 0;
  }

  function load() {
    return fetch('deck.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (deck) {
      document.title = (deck.title || 'Presentación') + ' · Equipo 2';
      var secStart = {};
      Object.keys(deck.sections || {}).forEach(function (k) { secStart[deck.sections[k].start] = deck.sections[k].description; });
      // Bloques de la exposición: [inicio, fin) dentro de deck.order, para la franja de avance.
      var starts = deck.order.map(function (id, i) { return secStart[id] ? i : -1; }).filter(function (i) { return i >= 0; });
      if (starts[0] !== 0) starts.unshift(0);
      var blocks = starts.map(function (st, k) { return [st, k + 1 < starts.length ? starts[k + 1] : deck.order.length]; });
      return Promise.all(deck.order.map(function (id) {
        return fetch('slides/' + id + '.html', { cache: 'no-cache' }).then(function (r) { return r.text(); });
      })).then(function (texts) {
        texts.forEach(function (txt, i) {
          var s = parseSlide(deck.order[i], txt);
          if (i > 0) {
            var pg = document.createElement('div');
            pg.className = 'pg';
            pg.textContent = (i + 1 < 10 ? '0' : '') + (i + 1);
            s.section.appendChild(pg);
          }
          s.sectionStart = secStart[s.id] || null;
          decorate(s, i, blocks, deck.order.length);
          slides.push(s);
          stage.appendChild(s.section);
        });
      });
    });
  }

  function isAbs(el) { return /position:\s*absolute/.test(el.getAttribute('style') || ''); }

  /* ---------- decoración: fondo, franjas y franja de avance por bloques ---------- */
  function kindOf(s, i) {
    var st = s.section.getAttribute('style') || '';
    if (i === 0) return 'cover';
    if (s.section.getAttribute('data-num') === 'top') return 'board';
    if (/background:\s*#23262F/i.test(st)) return 'dark';
    if (/background:\s*#2F5BFF/i.test(st)) return 'blue';
    if (s.transition === 'push') return 'opener';
    return 'content';
  }
  // Franja diagonal que corta una esquina: va del borde horizontal al vertical, a distancias a1..a2 del vértice.
  function band(corner, a1, a2, cls) {
    var x = corner.charAt(1) === 'r' ? W : 0, y = corner.charAt(0) === 'b' ? H : 0;
    var sx = x ? -1 : 1, sy = y ? -1 : 1;
    var p = [[x + sx * a2, y], [x + sx * a1, y], [x, y + sy * a1], [x, y + sy * a2]];
    return '<polygon class="' + cls + '" points="' + p.map(function (q) { return q.join(','); }).join(' ') + '"/>';
  }
  function decorate(s, i, blocks, total) {
    var kind = kindOf(s, i);
    s.kind = kind;
    s.section.setAttribute('data-kind', kind);
    var g = '';
    if (kind === 'content' || kind === 'dark' || kind === 'cover') {
      g += band('tr', 0, 70, 'f-ink') + band('tr', 100, 236, 'f-soft') + band('tr', 262, 296, 'f-blue') + band('tr', 318, 324, 'f-line');
      g += '<rect class="f-pulse" x="-34" y="-7" width="68" height="14" rx="7" transform="translate(1641 0) rotate(45)"/>';
    } else if (kind === 'opener' || kind === 'blue') {
      g += band('br', 150, 330, 'f-soft') + band('br', 366, 414, 'f-blue') + band('br', 444, 452, 'f-line');
      g += band('tl', 0, 46, 'f-blue') + band('tl', 70, 76, 'f-line');
    } else if (kind === 'board') {
      g += '<rect class="f-grid" x="128" y="420" width="1664" height="560"/>';
    }
    // franja de avance: un tramo por bloque; el actual se llena según la lámina
    var gap = 8, x = 0, usable = W - gap * (blocks.length - 1);
    blocks.forEach(function (b) {
      var w = usable * (b[1] - b[0]) / total;
      var st = i >= b[1] ? 'done' : i < b[0] ? 'todo' : 'now';
      g += '<rect class="r-' + (st === 'now' ? 'track' : st) + '" x="' + x.toFixed(1) + '" y="1070" width="' + w.toFixed(1) + '" height="10"/>';
      if (st === 'now') g += '<rect class="r-now" x="' + x.toFixed(1) + '" y="1070" width="' + (w * (i - b[0] + 1) / (b[1] - b[0])).toFixed(1) + '" height="10"/>';
      x += w + gap;
    });
    var k = s.section.querySelector('p[style*="letter-spacing:4px"]');
    if (k && kind !== 'board') k.classList.add('kicker');
    var d = document.createElement('div');
    d.className = 'deco';
    d.setAttribute('aria-hidden', 'true');
    d.setAttribute('style', 'position:absolute;inset:0');
    d.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' +
      '<defs><pattern id="dots-' + i + '" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="2.2"/></pattern></defs>' +
      g.replace('class="f-grid"', 'class="f-grid" fill="url(#dots-' + i + ')"') + '</svg>';
    s.section.insertBefore(d, s.section.firstChild);
  }

  /* ---------- equilibrio vertical ----------
     Si el contenido termina muy arriba, el cuerpo baja un poco para repartir el aire
     entre el título y el pie. No se toca nada con animación o con piezas en posición fija. */
  function balance(s) {
    var sec = s.section;
    if (s.kind !== 'content' || sec.querySelector('.x-embed')) return;
    var flow = [], fixed = false;
    Array.prototype.forEach.call(sec.children, function (c) {
      if (c.classList.contains('deco') || c.classList.contains('pg')) return;
      if (isAbs(c)) { if (!/bottom:/.test(c.getAttribute('style'))) fixed = true; return; }
      flow.push(c);
    });
    if (fixed || flow.length < 2) return;
    var h = -1;
    flow.forEach(function (c, i) { if (h < 0 && (/^H[12]$/.test(c.tagName) || c.querySelector('h1, h2'))) h = i; });
    var b = h + 1;
    while (b < flow.length && flow[b].tagName === 'P') b++;
    if (h < 0 || b >= flow.length) return;
    sec.classList.add('measuring');
    var last = flow[flow.length - 1];
    var free = H - parseFloat(getComputedStyle(sec).paddingBottom) - (last.offsetTop + last.offsetHeight);
    sec.classList.remove('measuring');
    if (free >= 90) flow[b].style.marginTop = Math.round(Math.min(free * 0.42, 120)) + 'px';
  }

  /* ---------- embeds: se montan solo en la lámina visible ---------- */
  function mountEmbeds(s) {
    s.section.querySelectorAll('.x-embed').forEach(function (box) {
      if (box.firstChild) return;
      var f = document.createElement('iframe');
      f.setAttribute('title', 'animación');
      f.setAttribute('loading', 'eager');
      f.setAttribute('scrolling', 'no');
      var src = box.getAttribute('src');
      if (src) f.src = src; else f.srcdoc = s.embeds[+box.getAttribute('data-embed')];
      box.appendChild(f);
    });
  }
  function unmountEmbeds(s) {
    s.section.querySelectorAll('.x-embed').forEach(function (box) { box.innerHTML = ''; });
  }

  /* ---------- escala ---------- */
  function fit(el, box) {
    var r = box.getBoundingClientRect();
    var k = Math.min(r.width / W, r.height / H);
    el.style.transform = 'translate(-50%,-50%) scale(' + k + ')';
  }
  function fitAll() {
    fit(stage, viewport);
    if (PRESENTER) fit($('#next-stage'), $('.pp-next'));
  }

  /* ---------- navegación ---------- */
  var anim = 380;
  function setBuilds(s, n, animate) {
    s.builds.forEach(function (b, i) {
      var show = i < n;
      if (show && !b.classList.contains('shown') && animate) revealAnim(b);
      b.classList.toggle('shown', show);
    });
  }
  function revealAnim(b) {
    var kind = (b.getAttribute('data-build-in') || 'fade').split(/\s+/)[0];
    var base = b.style.transform || '';
    var from = { opacity: 0, transform: base };
    if (kind === 'rise') from.transform = base + ' translateY(40px)';
    if (kind === 'drop') from.transform = base + ' translateY(-40px)';
    if (kind === 'left') from.transform = base + ' translateX(-60px)';
    if (kind === 'right') from.transform = base + ' translateX(60px)';
    if (kind === 'pop' || kind === 'scale') from.transform = base + ' scale(.6)';
    b.animate([from, { opacity: 1, transform: base || 'none' }],
      { duration: kind === 'pop' ? 420 : 520, easing: kind === 'pop' ? 'cubic-bezier(.34,1.56,.64,1)' : 'cubic-bezier(.2,.8,.2,1)' });
  }

  /* ---------- entrada escalonada del contenido ---------- */
  var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var OUT = 'cubic-bezier(.16,1,.3,1)', IO = 'cubic-bezier(.65,0,.35,1)';
  var live = null; // transición en curso: { anims, timers, done }
  // Piezas de la lámina en el orden en que entran: título, animación, contenido y al final el pie.
  function pieces(sec) {
    var head = [], body = [], tail = [];
    Array.prototype.forEach.call(sec.children, function (c) {
      if (c.classList.contains('deco')) return;
      if (c.classList.contains('build') && !c.classList.contains('shown')) return;
      if (c.classList.contains('x-embed')) { body.unshift({ el: c, rise: !/fx\//.test(c.getAttribute('src') || '') }); return; }
      if (c.classList.contains('pg') || isAbs(c)) { tail.push({ el: c, rise: false }); return; }
      var list = head.length ? body : head;
      var kids = c.children, d = getComputedStyle(c).display;
      // un grupo (encabezado, rejilla o fila de tarjetas) entra pieza por pieza
      if (c.tagName === 'DIV' && kids.length > 1 && kids.length <= 12 && (d === 'grid' || d === 'flex')) {
        Array.prototype.forEach.call(kids, function (k) { list.push({ el: k, rise: true }); });
      } else list.push({ el: c, rise: true });
    });
    return head.concat(body, tail);
  }
  function enter(s, delay, quick) {
    if (REDUCED) return [];
    var items = pieces(s.section);
    var gap = Math.min(quick ? 45 : 75, 620 / Math.max(1, items.length));
    return items.map(function (it, i) {
      var base = it.el.style.transform || '';
      var from = { opacity: 0 }, to = { opacity: 1 };
      if (it.rise) { from.transform = (base + ' translateY(' + (quick ? 16 : 30) + 'px)').trim(); to.transform = base || 'none'; }
      return it.el.animate([from, to], { duration: quick ? 420 : 720, delay: delay + i * gap, easing: OUT, fill: 'backwards' });
    });
  }
  function settle() {
    if (!live) return;
    var l = live; live = null;
    l.timers.forEach(clearTimeout);
    l.anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
    l.done();
  }

  function show(n, st, opts) {
    opts = opts || {};
    n = Math.max(0, Math.min(slides.length - 1, n));
    var prev = slides[idx], next = slides[n];
    var forward = n > idx;
    if (prev !== next || !next.section.classList.contains('active')) {
      settle();
      if (prev && prev !== next && !opts.instant) {
        // Un bloque nuevo se abre con el barrido de franjas; su portada se va deslizándose.
        var kind = REDUCED ? 'fade' : forward ? (next.kind === 'opener' || next.kind === 'blue' ? 'wipe' : prev.transition)
          : (prev.kind === 'opener' || prev.kind === 'blue' ? 'wipe' : next.transition);
        transition(prev, next, kind, forward);
      } else {
        slides.forEach(function (s) { if (s !== next) { s.section.classList.remove('active', 'leaving'); unmountEmbeds(s); } });
        next.section.classList.add('active');
        if (!opts.remote) { var first = enter(next, 150, false); live = { anims: first, timers: [], done: function () {} }; }
      }
      mountEmbeds(next);
    }
    idx = n;
    step = st == null ? 0 : Math.max(0, Math.min(next.builds.length, st));
    setBuilds(next, step, !opts.instant && !opts.remote);
    update();
    if (!opts.remote && channel) channel.postMessage({ idx: idx, step: step });
  }

  function transition(a, b, kind, forward) {
    var A = a.section, B = b.section, d = forward ? 1 : -1;
    slides.forEach(function (s) { if (s !== a && s !== b) { s.section.classList.remove('active', 'leaving'); unmountEmbeds(s); } });
    A.classList.remove('active'); A.classList.add('leaving');
    B.classList.add('active');
    var exits = [], timers = [], wipe = null, enters;
    function done() {
      exits.forEach(function (x) { try { x.cancel(); } catch (e) {} });
      A.classList.remove('leaving'); A.style.zIndex = ''; B.style.zIndex = ''; A.style.visibility = '';
      if (wipe) wipe.remove();
      if (!A.classList.contains('active')) unmountEmbeds(a);
    }
    function finish() { if (live && live.done === done) { live = null; done(); } }
    var last;
    if (kind === 'wipe') {
      // Franjas (ámbar, tinta, azul) cruzan la pantalla; el cambio de lámina ocurre cuando la cubren.
      A.style.zIndex = 2; B.style.zIndex = 1;
      wipe = document.createElement('div');
      wipe.className = 'wipe';
      wipe.innerHTML = '<div class="wipe-g"><i class="w-amb"></i><i class="w-ink"></i><i class="w-blue"></i><i class="w-ink"></i><i class="w-amb"></i></div>';
      if (!forward) wipe.style.transform = 'scaleX(-1)';
      stage.appendChild(wipe);
      var g = wipe.firstChild;
      var cover = g.animate([{ transform: 'translateX(2140px)' }, { transform: 'translateX(-520px)' }], { duration: 520, easing: 'cubic-bezier(.5,0,.85,.55)', fill: 'forwards' });
      exits.push(cover);
      var swapped = false;
      var swap = function () {
        if (swapped) return; swapped = true;
        A.style.visibility = 'hidden';
        last = g.animate([{ transform: 'translateX(-520px)' }, { transform: 'translateX(-3200px)' }], { duration: 600, easing: 'cubic-bezier(.15,.45,.5,1)', fill: 'forwards' });
        exits.push(last);
        last.onfinish = finish;
        timers.push(setTimeout(finish, 900));
      };
      cover.onfinish = swap;
      timers.push(setTimeout(swap, 700));
      enters = enter(b, 640, false);
    } else if (kind === 'push') {
      exits.push(A.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: 'translateX(' + (-d * 40) + '%)', opacity: 0 }], { duration: 640, easing: IO, fill: 'forwards' }));
      last = B.animate([{ transform: 'translateX(' + (d * 100) + '%)' }, { transform: 'translateX(0)' }], { duration: 640, easing: IO });
      B.style.zIndex = 2; A.style.zIndex = 1;
      exits.push(last);
      enters = enter(b, 300, false);
      last.onfinish = finish;
      timers.push(setTimeout(finish, 1000));
    } else {
      // Mismo lienzo: el contenido anterior se desvanece y el nuevo sube en cascada.
      A.style.zIndex = 2; B.style.zIndex = 1;
      last = A.animate([{ opacity: 1 }, { opacity: 0 }], { duration: REDUCED ? 200 : 300, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });
      exits.push(last);
      enters = enter(b, 170, !forward);
      last.onfinish = finish;
      timers.push(setTimeout(finish, 650));
    }
    live = { anims: enters, timers: timers, done: done };
  }

  function next() {
    var s = slides[idx];
    if (step < s.builds.length) { step++; setBuilds(s, step, true); update(); if (channel) channel.postMessage({ idx: idx, step: step }); }
    else if (idx < slides.length - 1) show(idx + 1, 0);
  }
  function prev() {
    var s = slides[idx];
    if (step > 0) { step--; setBuilds(s, step, false); update(); if (channel) channel.postMessage({ idx: idx, step: step }); }
    else if (idx > 0) show(idx - 1, slides[idx - 1].builds.length);
  }

  /* ---------- HUD, notas y orador ---------- */
  var t0 = Date.now();
  function update() {
    var s = slides[idx];
    $('#counter').textContent = (idx + 1) + ' / ' + slides.length;
    $('#progress-bar').style.width = ((idx + 1) / slides.length * 100) + '%';
    history.replaceState(null, '', location.pathname + location.search + '#' + (idx + 1));
    var no = $('#notes-overlay');
    no.textContent = s.notes || 'Esta lámina no tiene notas.';
    if (PRESENTER) {
      $('#pp-notes').textContent = s.notes || '—';
      $('#pp-count').textContent = 'Lámina ' + (idx + 1) + ' de ' + slides.length + (s.builds.length ? ' · paso ' + step + '/' + s.builds.length : '');
      var ns = $('#next-stage');
      ns.innerHTML = '';
      var nx = s.builds.length > step ? null : slides[idx + 1];
      if (s.builds.length > step) {
        ns.appendChild(stillClone(s, step + 1));
      } else if (nx) {
        ns.appendChild(stillClone(nx, 0));
      } else {
        ns.innerHTML = '<section style="background:#0F1B2D;color:#8FA3BF;display:flex;align-items:center;justify-content:center;font-size:64px">Fin</section>';
      }
    }
  }
  function stillClone(s, nBuilds) {
    var c = s.section.cloneNode(true);
    c.classList.remove('active', 'leaving');
    c.style.display = '';
    c.querySelectorAll('.x-embed').forEach(function (e) { e.innerHTML = '<div class="embed-ph"></div>'; });
    c.querySelectorAll('.build').forEach(function (b, i) { b.classList.toggle('shown', i < nBuilds); });
    return c;
  }
  setInterval(function () {
    if (!PRESENTER) return;
    var sec = Math.floor((Date.now() - t0) / 1000);
    var m = Math.floor(sec / 60), ss = sec % 60;
    $('#pp-timer').textContent = (m < 10 ? '0' : '') + m + ':' + (ss < 10 ? '0' : '') + ss;
  }, 500);

  var ovBuilt = false;
  function buildOverview() {
    var g = $('#overview-grid');
    if (!ovBuilt) {
      ovBuilt = true;
      slides.forEach(function (s, i) {
        if (s.sectionStart) {
          var h = document.createElement('div'); h.className = 'ov-sec'; h.textContent = s.sectionStart; g.appendChild(h);
        }
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'ov-card';
        b.innerHTML = '<div class="ov-thumb"><div class="ov-stage"></div></div><div class="ov-cap"><b>' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</b><span></span></div>';
        b.querySelector('.ov-stage').appendChild(stillClone(s, s.builds.length));
        b.querySelector('.ov-cap span').textContent = s.title;
        b.onclick = function () { toggle('#overview', false); show(i, 0); };
        g.appendChild(b);
      });
    }
    var cards = g.querySelectorAll('.ov-card');
    Array.prototype.forEach.call(cards, function (c, i) { c.classList.toggle('current', i === idx); });
    fitOverview();
  }
  function fitOverview() {
    var t = document.querySelector('.ov-thumb');
    if (!t || $('#overview').hidden) return;
    var k = t.clientWidth / W;
    document.querySelectorAll('.ov-stage').forEach(function (e) { e.style.transform = 'scale(' + k + ')'; });
  }
  function toggle(sel, force) {
    var el = $(sel);
    var open = force == null ? el.hidden : force;
    el.hidden = !open;
    if (sel === '#overview' && open) { buildOverview(); var c = el.querySelector('.current'); if (c) c.scrollIntoView({ block: 'center' }); }
  }
  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen().catch(function () {});
  }
  function openPresenter() {
    window.open(location.pathname + '?presenter#' + (idx + 1), 'orador-estados-flutter', 'width=1400,height=820');
  }

  function act(a) {
    if (a === 'next') next();
    else if (a === 'prev') prev();
    else if (a === 'overview') toggle('#overview');
    else if (a === 'presenter') openPresenter();
    else if (a === 'fullscreen') fullscreen();
    else if (a === 'help') toggle('#help', true);
  }

  /* ---------- eventos ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!$('#help').hidden) { toggle('#help', false); e.preventDefault(); return; }
    var k = e.key;
    if (!$('#overview').hidden && k !== 'o' && k !== 'O' && k !== 'Escape') return;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'PageDown' || k === 'Enter') { next(); e.preventDefault(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { prev(); e.preventDefault(); }
    else if (k === 'Home') show(0, 0);
    else if (k === 'End') show(slides.length - 1, 0);
    else if (k === 'f' || k === 'F') fullscreen();
    else if (k === 'n' || k === 'N') toggle('#notes-overlay');
    else if (k === 'o' || k === 'O') toggle('#overview');
    else if (k === 'p' || k === 'P') openPresenter();
    else if (k === '?') toggle('#help', true);
    else if (k === 'Escape') { toggle('#overview', false); toggle('#notes-overlay', false); }
  });
  viewport.addEventListener('click', function (e) {
    var r = viewport.getBoundingClientRect();
    if (e.clientX - r.left < r.width * 0.25) prev(); else next();
  });
  var tx = null;
  viewport.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', function (e) {
    if (tx == null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) { if (dx < 0) next(); else prev(); }
  }, { passive: true });
  $('#hud-controls').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (b) act(b.getAttribute('data-act'));
  });
  $('#help').addEventListener('click', function () { toggle('#help', false); });
  $('#overview').addEventListener('click', function (e) { if (e.target.id === 'overview') toggle('#overview', false); });
  $('#pp-reset').addEventListener('click', function () { t0 = Date.now(); });
  window.addEventListener('resize', function () { fitAll(); fitOverview(); });
  document.addEventListener('fullscreenchange', function () { setTimeout(fitAll, 50); });
  window.addEventListener('hashchange', function () {
    var n = parseInt(location.hash.slice(1), 10);
    if (n && n - 1 !== idx) show(n - 1, 0);
  });
  if (channel) channel.onmessage = function (m) {
    var d = m.data || {};
    if (d.hello) { channel.postMessage({ idx: idx, step: step }); return; }
    if (typeof d.idx === 'number' && (d.idx !== idx || d.step !== step)) show(d.idx, d.step, { remote: true });
  };
  var idleT;
  function wake() { document.body.classList.remove('idle'); clearTimeout(idleT); idleT = setTimeout(function () { document.body.classList.add('idle'); }, 2500); }
  document.addEventListener('mousemove', wake); wake();

  /* ---------- inicio ---------- */
  if (PRESENTER) { document.body.classList.add('presenter'); $('#presenter-panel').hidden = false; }
  fitAll();
  load().then(function () {
    var n = parseInt(location.hash.slice(1), 10);
    show(n ? n - 1 : 0, 0, { instant: true });
    fitAll();
    // con las fuentes ya cargadas, las medidas son las definitivas
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { slides.forEach(balance); });
    if (channel && PRESENTER) channel.postMessage({ hello: true });
  }).catch(function (err) {
    stage.innerHTML = '<section style="background:#0F1B2D;color:#F5F3EE;display:flex;align-items:center;justify-content:center;padding:128px;font-size:40px;text-align:center">No se pudieron cargar las láminas. Ábrelo desde un servidor web (no como archivo local).<br>' + String(err) + '</section>';
    stage.firstChild.classList.add('active');
    fitAll();
  });
})();
