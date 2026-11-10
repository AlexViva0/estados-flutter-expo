/* Utilidades compartidas por las animaciones SVG de las láminas (se cargan dentro de cada <x-embed>).
   Los tiempos se llevan con setTimeout y lo visual con la Web Animations API. */
var NS = 'http://www.w3.org/2000/svg';
var EASE = 'cubic-bezier(.2,.8,.2,1)', POP = 'cubic-bezier(.34,1.56,.64,1)', IO = 'cubic-bezier(.65,0,.35,1)';
var AMB = '#F2A93B', BLU = '#2F5BFF', INK = '#23262F', RED = '#E5484D', GRN = '#16A37B';

function $(i) { return typeof i === 'string' ? document.getElementById(i) : i; }
function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
function root() { return document.querySelector('svg'); }

/* Crea un elemento SVG. */
function el(tag, attrs, text, parent) {
  var e = document.createElementNS(NS, tag);
  for (var k in attrs) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  (parent || root()).appendChild(e);
  return e;
}

function on(i, v) { $(i).classList.toggle('on', v !== false); }
function show(i, v) { $(i).classList.toggle('off', v === false); }
function txt(i, t) { $(i).textContent = t; }
function pop(i, s) { $(i).animate([{ transform: 'scale(1)' }, { transform: 'scale(' + (s || 1.4) + ')' }, { transform: 'scale(1)' }], { duration: 460, easing: POP }); }
function press(i) { $(i).animate([{ transform: 'scale(1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'ease-out' }); }
/* Destello de un elemento que en reposo es invisible (clase hl). */
function flash(i, max) { $(i).animate([{ opacity: 0 }, { opacity: max || 1 }, { opacity: 0 }], { duration: 750, easing: 'ease-out' }); }

/* El "dedo" viaja a (x, y) y toca. */
var _fg = null;
async function tap(x, y) {
  var first = !_fg;
  if (first) {
    _fg = el('g', { id: 'fg' });
    el('circle', { id: 'rip', r: 26, fill: 'none', stroke: AMB, 'stroke-width': 4, opacity: 0 }, null, _fg);
    el('circle', { id: 'fd', r: 22, fill: AMB, 'fill-opacity': .3, stroke: AMB, 'stroke-width': 4 }, null, _fg);
  }
  if (first) _fg.style.transition = 'none';
  _fg.style.transform = 'translate(' + x + 'px,' + y + 'px)';
  if (first) { await wait(60); _fg.style.transition = ''; }
  _fg.style.opacity = 1;
  await wait(720);
  $('fd').animate([{ transform: 'scale(1)' }, { transform: 'scale(.72)' }, { transform: 'scale(1)' }], { duration: 300, easing: 'ease-out' });
  $('rip').animate([{ transform: 'scale(.7)', opacity: .9 }, { transform: 'scale(2.4)', opacity: 0 }], { duration: 560, easing: EASE });
  await wait(160);
}

/* Puntos de un recorrido: lista [[x,y],…] o el id de un <path>. */
function pts(p) {
  if (Array.isArray(p)) return p;
  var e = $(p), L = e.getTotalLength(), a = [], n = 32;
  for (var i = 0; i <= n; i++) { var q = e.getPointAtLength(L * i / n); a.push([q.x, q.y]); }
  return a;
}

/* Envía un paquete por un recorrido. Opciones: label, color, ink, mono, rev, r, ease.
   Ámbar = acción o evento; azul (color: BLU) = estado o datos. */
async function send(p, ms, o) {
  o = o || {};
  var a = pts(p);
  if (o.rev) a = a.slice().reverse();
  var col = o.color || AMB;
  var g = el('g', {});
  if (o.label != null) {
    var t = el('text', { y: 8, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: o.ink || (col === AMB ? INK : '#FFFFFF'), 'class': o.mono ? 'mono' : '' }, o.label, g);
    var w = 0;
    try { w = t.getComputedTextLength(); } catch (e) {}
    if (!w) w = String(o.label).length * 13.5;
    w += 40;
    g.insertBefore(el('rect', { x: -w / 2, y: -24, width: w, height: 48, rx: 24, fill: col }, null, g), t);
  } else {
    el('circle', { r: o.r || 12, fill: col }, null, g);
  }
  g.style.filter = 'drop-shadow(0 0 8px ' + col + 'AA)';
  var d = [0], tot = 0, i;
  for (i = 1; i < a.length; i++) { tot += Math.hypot(a[i][0] - a[i - 1][0], a[i][1] - a[i - 1][1]); d.push(tot); }
  var keys = a.map(function (q, j) { return { transform: 'translate(' + q[0] + 'px,' + q[1] + 'px)', offset: tot ? d[j] / tot : j / (a.length - 1) }; });
  g.animate(keys, { duration: ms, easing: o.ease || IO, fill: 'forwards' });
  await wait(ms);
  g.remove();
}

/* Indicador de carga. */
function spinner(cx, cy, r, parent) {
  var g = el('g', { 'class': 'spin' }, null, parent);
  el('circle', { cx: cx, cy: cy, r: r, fill: 'none', stroke: '#DCE0E7', 'stroke-width': r / 4 }, null, g);
  el('path', { d: 'M' + cx + ' ' + (cy - r) + 'a' + r + ' ' + r + ' 0 0 1 ' + r + ' ' + r, fill: 'none', stroke: BLU, 'stroke-width': r / 4, 'stroke-linecap': 'round' }, null, g);
  return g;
}

/* Lámina que contiene la animación y cuántos pasos (data-build-in) lleva revelados. */
function section() { try { return frameElement ? frameElement.closest('section') : null; } catch (e) { return null; } }
function builds() { var s = section(); return s ? s.querySelectorAll('.build.shown').length : 0; }

/* Repite una secuencia asíncrona para siempre. */
function loop(fn, delay) {
  (async function () { await wait(delay == null ? 500 : delay); for (var i = 0; ; i++) await fn(i); })();
}

/* Punta de flecha gris: marker-end="url(#ar)". */
document.addEventListener('DOMContentLoaded', function () {
  var s = root();
  if (!s) return;
  var d = el('defs', {}, null, s);
  var m = el('marker', { id: 'ar', markerUnits: 'userSpaceOnUse', markerWidth: 18, markerHeight: 18, refX: 14, refY: 9, orient: 'auto' }, null, d);
  el('path', { d: 'M0 0L18 9L0 18z', fill: '#9A9EAC' }, null, m);
});
