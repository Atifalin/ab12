import { COLORS } from '../content.js';
import { rand, rnd } from './util.js';

// DOM caps keep iOS GPU/memory pressure bounded during long sessions.
const sparkLive = document.getElementsByClassName('spark');
export function sparkleBurst(cx, cy, n = 5) {
  if (sparkLive.length > 15) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.textContent = rand(['✨', '⭐', '💫']);
    s.style.left = cx + 'px';
    s.style.top = cy + 'px';
    s.style.fontSize = rnd(2.5, 5) + 'vmin';
    s.style.setProperty('--sx', rnd(-18, 18) + 'vmin');
    s.style.setProperty('--sy', rnd(-16, 4) + 'vmin');
    s.style.setProperty('--sr', rnd(-180, 180) + 'deg');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  }
}

export function confettiBurst(layer, x, y) {
  if (layer.getElementsByClassName('confetti').length > 60) return;
  for (let i = 0; i < 10; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = x + 'px';
    c.style.top = y + 'px';
    c.style.background = rand(COLORS);
    c.style.setProperty('--dx', rnd(-40, 40) + 'vmin');
    c.style.animationDelay = rnd(0, 0.15) + 's';
    layer.appendChild(c);
    setTimeout(() => c.remove(), 1600);
  }
}

export function clearEffects() {
  document.querySelectorAll('.spark').forEach((s) => s.remove());
}

let toastTimer = null;
export function toast(msg) {
  const el = document.getElementById('unlock-toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
}

// 2-second press-and-hold on a button with a progress ring (same feel as ⭐).
export function holdToActivate(btn, ms, onFire, onTap) {
  let t = null;
  const start = (e) => {
    e.preventDefault();
    btn.classList.add('holding');
    t = setTimeout(() => { btn.classList.remove('holding'); t = null; onFire(); }, ms);
  };
  const cancel = () => {
    if (t === null) return;
    clearTimeout(t);
    t = null;
    btn.classList.remove('holding');
    if (onTap) onTap();
  };
  btn.addEventListener('pointerdown', start);
  btn.addEventListener('pointerup', cancel);
  btn.addEventListener('pointerleave', cancel);
  btn.addEventListener('pointercancel', cancel);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}
