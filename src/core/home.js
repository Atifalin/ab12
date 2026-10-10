import { settings, modeEnabled } from './settings.js';
import { audio, playSfx } from './audio.js';
import { show, activeMode } from './screens.js';
import { isTouch } from './util.js';
import { holdToActivate, toast } from './effects.js';
import { openSettings } from './settingsPanel.js';

// ---------- home ----------
export const CATEGORIES = [
  { id: 'learn', emoji: '🔤', title: 'Learn' },
  { id: 'think', emoji: '🧩', title: 'Think' },
  { id: 'play', emoji: '🎉', title: 'Play' },
  { id: 'family', emoji: '💛', title: 'Family' },
];

let allModes = [];
let currentCat = null; // category id while its mode-card view is open, else null

const visibleModes = () => allModes.filter(modeEnabled);
const catModes = (id) => allModes.filter((m) => m.category === id && modeEnabled(m));

function openMode(b, m) {
  b.blur(); // keep Enter from re-triggering the card on a physical keyboard
  audio();
  playSfx('fanfare');
  show(m.id);
  if (!isTouch && document.documentElement.requestFullscreen)
    document.documentElement.requestFullscreen().catch(() => {});
}

function modeCard(m) {
  const b = document.createElement('button');
  b.className = 'mode-card ' + m.id;
  b.dataset.mode = m.id;
  if (m.color) b.style.background = m.color;
  const big = document.createElement('div');
  big.className = 'big';
  big.innerHTML = m.cardHtml || m.emoji;
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = m.title;
  b.append(big, label);
  b.addEventListener('click', () => openMode(b, m));
  return b;
}

function catCard(c, count) {
  const b = document.createElement('button');
  b.className = 'mode-card cat-card cat-' + c.id;
  b.dataset.cat = c.id;
  const big = document.createElement('div');
  big.className = 'big';
  big.textContent = c.emoji;
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = c.title;
  b.append(big, label);
  b.addEventListener('click', () => {
    const ms = catModes(c.id);
    b.blur();
    audio();
    playSfx('pop');
    if (ms.length === 1) { openMode(b, ms[0]); return; }
    currentCat = c.id;
    renderHome();
  });
  return b;
}

export function renderHome() {
  const view = document.getElementById('home-view');
  view.innerHTML = '';
  view.className = 'home-view';
  const menu = document.createElement('div');
  menu.className = 'menu';
  if (settings.showAll) {
    currentCat = null;
    view.classList.add('flat');
    for (const m of visibleModes()) menu.appendChild(modeCard(m));
  } else if (currentCat) {
    view.classList.add('cat-open');
    const back = document.createElement('button');
    back.className = 'cat-back';
    back.setAttribute('aria-label', 'Back');
    back.textContent = '◀';
    back.addEventListener('click', () => { playSfx('pop'); currentCat = null; renderHome(); });
    view.appendChild(back);
    for (const m of catModes(currentCat)) menu.appendChild(modeCard(m));
  } else {
    for (const c of CATEGORIES) {
      if (catModes(c.id).length) menu.appendChild(catCard(c));
    }
  }
  view.appendChild(menu);
}

export function initHome(modes) {
  allModes = modes;
  renderHome();
  // Escape/back returns from a category's mode-card view
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeMode() === 'home' && currentCat) {
      currentCat = null;
      renderHome();
    }
  });
  // ⚙️ gear: 2s hold with progress ring when the parent lock is on
  const gear = document.getElementById('settings-btn');
  gear.addEventListener('click', (e) => e.stopPropagation());
  holdToActivate(gear, 2000, openSettings, () => {
    if (settings.parentLock) toast('Hold to open settings');
  });
  gear.addEventListener('pointerdown', (e) => {
    if (!settings.parentLock) { e.stopImmediatePropagation(); openSettings(); }
  }, true);
}
