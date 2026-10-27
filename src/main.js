import './style.css';
import { GAMES } from './games.js';


function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
function scene(kind) {
  var s = el('div', 'scene');
  if (kind === 'road' || kind === 'danfo') { s.className = 'scene road' + (kind === 'danfo' ? ' danfo' : ''); s.appendChild(el('div', 'lane')); s.appendChild(el('div', 'car')); }
  else if (kind === 'sky') { s.className = 'scene sky'; for (var i = 0; i < 14; i++) { var st = el('div', 'star'); st.style.left = (i * 37 % 100) + '%'; st.style.top = (i * 23 % 100) + '%'; st.style.animationDelay = (-i * 0.12) + 's'; s.appendChild(st); } s.appendChild(el('div', 'rocket')); }
  else if (kind === 'hide') { s.className = 'scene hide'; s.appendChild(el('div', 'eyes', '<i></i><i></i>')); var b1 = el('div', 'bush'); b1.style.left = '-6%'; s.appendChild(b1); var b2 = el('div', 'bush'); b2.style.right = '-6%'; s.appendChild(b2); }
  else if (kind === 'runner') { s.className = 'scene runner'; s.appendChild(el('div', 'ground')); s.appendChild(el('div', 'hero-px')); s.appendChild(el('div', 'block')); }
  else if (kind === 'blocks') { s.className = 'scene blocks'; var c = ['#5ee6ff', '#ff5fa2', '#d6f45b', '#e8b64c']; for (var j = 0; j < 7; j++) { var b = el('div', 'b'); b.style.left = (6 + j * 13) + '%'; b.style.background = c[j % 4]; b.style.animationDelay = (-j * 0.35) + 's'; s.appendChild(b); } }
  else if (kind === 'ink') { s.className = 'scene ink'; [[20, 30, 16], [58, 44, 22], [40, 66, 12], [76, 18, 10]].forEach(function (p, k) { var o = el('div', 'blob'); o.style.left = p[0] + '%'; o.style.top = p[1] + '%'; o.style.width = p[2] + '%'; o.style.aspectRatio = '1'; o.style.animationDelay = (-k * 0.45) + 's'; s.appendChild(o); }); }
  else if (kind === 'party') { s.className = 'scene party'; var h = ['#e8b64c', '#ff5fa2', '#5ee6ff', '#d6f45b', '#c9a6ff']; for (var m = 0; m < 5; m++) { var hd = el('div', 'head'); hd.style.left = (12 + m * 16) + '%'; hd.style.background = h[m]; hd.style.animationDelay = (-m * 0.16) + 's'; s.appendChild(hd); } }
  return s;
}

var grid = document.getElementById('games');
GAMES.forEach(function (g) {
  var card = el('article', 'game');
  var cov = el('div', 'cover'); cov.appendChild(scene(g.scene)); card.appendChild(cov);
  var body = el('div', 'game-body');
  body.appendChild(el('h3', null, g.name));
  body.appendChild(el('p', 'by', 'by ' + g.by));
  body.appendChild(el('p', 'addr', g.addr));
  var a = el('a', 'play', 'Play'); a.href = g.url; a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', 'Play ' + g.name);
  body.appendChild(a); card.appendChild(body); grid.appendChild(card);
});
var more = el('a', 'game more', '<div><strong>+180</strong><span>more games, A to Z</span></div>');
more.href = 'https://start.ng'; grid.appendChild(more);

/* curtain behaviour */
var stage = document.getElementById('stage');
var billing = document.getElementById('billing');
var sides = {};
['left', 'right'].forEach(function (k) {
  sides[k] = {
    el: document.getElementById('curtain-' + k),
    rope: document.getElementById('rope-' + k),
    holder: document.getElementById('holder-' + k),
    hint: document.getElementById('hint-' + k),
    state: 'closed'
  };
});
function tieWidth() { return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tie')) || 72; }

function render(k) {
  var s = sides[k], c = s.el;
  c.classList.toggle('tied', s.state === 'tied');
  c.classList.toggle('loose', s.state === 'loose');
  if (s.state === 'closed') c.style.width = 'calc(50vw + 2px)';
  else if (s.state === 'tied') c.style.width = tieWidth() + 'px';
  s.rope.classList.toggle('off', s.state !== 'tied');
  s.holder.classList.toggle('off', s.state === 'closed');
  s.holder.setAttribute('aria-label', (s.state === 'tied' ? 'Untie the ' : 'Tie back the ') + k + ' curtain');
  s.el.querySelector('.tassel').tabIndex = s.state === 'loose' ? 0 : -1;
}
function syncStage() {
  var closed = sides.left.state === 'closed' && sides.right.state === 'closed';
  billing.classList.toggle('off', !closed);
  document.body.classList.toggle('closed', closed);
  if (closed) stage.setAttribute('inert', ''); else stage.removeAttribute('inert');
}
function set(k, state, width) {
  sides[k].state = state;
  if (state === 'loose' && width != null) sides[k].el.style.width = width + 'px';
  render(k); syncStage();
}

document.getElementById('start').addEventListener('click', function () {
  set('left', 'tied'); set('right', 'tied');
  ['left', 'right'].forEach(function (k) {
    var h = sides[k].hint;
    setTimeout(function () { h.classList.remove('off'); }, 1300);
    setTimeout(function () { h.classList.add('off'); }, 5200);
  });
});

['left', 'right'].forEach(function (k) {
  var s = sides[k];
  s.holder.addEventListener('click', function () {
    s.hint.classList.add('off');
    if (s.state === 'tied') set(k, 'loose', Math.round(window.innerWidth * 0.3));
    else set(k, 'tied');
  });

  var dragging = false, startX = 0, startW = 0;
  s.el.addEventListener('pointerdown', function (e) {
    if (s.state !== 'loose') return;
    dragging = true; startX = e.clientX; startW = s.el.getBoundingClientRect().width;
    s.el.classList.add('dragging'); s.el.setPointerCapture(e.pointerId);
  });
  s.el.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    var w = k === 'left' ? startW + dx : startW - dx;
    w = Math.max(tieWidth(), Math.min(window.innerWidth, w));
    s.el.style.width = w + 'px';
  });
  function end() {
    if (!dragging) return;
    dragging = false; s.el.classList.remove('dragging');
    settle(k);
  }
  s.el.addEventListener('pointerup', end);
  s.el.addEventListener('pointercancel', end);

  s.el.querySelector('.tassel').addEventListener('keydown', function (e) {
    if (s.state !== 'loose') return;
    var step = window.innerWidth * 0.05, w = s.el.getBoundingClientRect().width;
    var grow = (k === 'left' && e.key === 'ArrowRight') || (k === 'right' && e.key === 'ArrowLeft');
    var shrink = (k === 'left' && e.key === 'ArrowLeft') || (k === 'right' && e.key === 'ArrowRight');
    if (!grow && !shrink) return;
    e.preventDefault();
    s.el.style.width = Math.max(tieWidth(), Math.min(window.innerWidth, w + (grow ? step : -step))) + 'px';
    settle(k);
  });
});

function settle(k) {
  var vw = window.innerWidth;
  var lw = sides.left.el.getBoundingClientRect().width, rw = sides.right.el.getBoundingClientRect().width;
  var w = k === 'left' ? lw : rw;
  if (w < vw * 0.12) { set(k, 'tied'); return; }
  if (lw + rw >= vw * 0.97) { set('left', 'closed'); set('right', 'closed'); }
}

window.addEventListener('resize', function () { render('left'); render('right'); });
render('left'); render('right'); syncStage();

function nextUtc(hour) { var n = new Date(); var t = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate(), hour)); if (t <= n) t = new Date(t.getTime() + 86400000); return t; }
function fmt(ms) { var s = Math.max(0, Math.floor(ms / 1000)); return [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(function (v) { return (v < 10 ? '0' : '') + v; }).join(':'); }
var tEl = document.getElementById('tourney'), dEl = document.getElementById('dare');
function tick() { var now = Date.now(); tEl.textContent = fmt(nextUtc(17) - now); dEl.textContent = fmt(nextUtc(23) - now); }
tick(); setInterval(tick, 1000);
