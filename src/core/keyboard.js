import { activeMode, activeModeDef, suspend } from './screens.js';
import { audio } from './audio.js';
import { COLORS } from '../content.js';
import { $ } from './util.js';

// ---------- keyboard ----------
// Single global dispatcher: every key goes to the active mode's onKey().
export function initKeyboard() {
  window.addEventListener('keydown', (e) => {
    const m = activeModeDef();
    if (!m || !m.onKey) return;
    // stop the browser from doing anything with the smashed keys
    if (!(e.ctrlKey || e.metaKey) || e.key.length === 1) e.preventDefault();
    if (e.repeat) return;
    audio();
    m.onKey(e);
  });
  // block context menu / double-tap zoom on the whole app while playing
  document.addEventListener('contextmenu', (e) => { if (activeMode() !== 'home') e.preventDefault(); });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());
  window.addEventListener('beforeunload', (e) => { if (activeMode() !== 'home') { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('visibilitychange', () => { if (document.hidden) suspend(); });
  window.addEventListener('pagehide', suspend);
}

// touch pad for phones/tablets — learn gets digits + ⌫/⏎, spell gets letters only
export function buildPad(container, onKey, { digits = true, extras = [] } = {}) {
  const rows = [];
  if (digits) rows.push('1234567890'.split(''));
  rows.push('ABCDEFGHI'.split(''), 'JKLMNOPQR'.split(''), 'STUVWXYZ'.split(''));
  rows.forEach((keys, r) => {
    const row = document.createElement('div');
    row.className = 'row';
    keys.forEach((k, i) => {
      const b = document.createElement('button');
      b.className = 'key';
      b.dataset.k = k;
      b.textContent = k;
      b.style.setProperty('--k', COLORS[(i + r * 3) % COLORS.length]);
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); audio(); onKey(k); });
      row.appendChild(b);
    });
    container.appendChild(row);
  });
  for (const x of extras) {
    const b = document.createElement('button');
    b.className = 'key wide';
    b.textContent = x.text;
    b.setAttribute('aria-label', x.aria);
    b.style.setProperty('--k', x.color);
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); audio(); onKey(x.k); });
    container.lastElementChild.appendChild(b);
  }
}
