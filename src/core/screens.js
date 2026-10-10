import { settings, modeSettings, pickBg } from './settings.js';
import { audio, playSfx, suspendAudio } from './audio.js';
import { say, stopAllAudio, stopVoice } from './voice.js';
import * as effects from './effects.js';
import { isTouch, nextColor } from './util.js';
import { buildPad } from './keyboard.js';

// ---------- screens ----------
// One <section class="screen"> per mode, created at init and filled lazily by
// the mode's own mount(). 'home' is a screen like any other.
let mode = 'home';
const modes = new Map();   // id -> mode def
const mounted = new Set(); // ids whose mount() has run
const homeBtn = () => document.getElementById('home-btn');

export const activeMode = () => mode;
export const activeModeDef = () => modes.get(mode) || null;

function ctxFor(m) {
  return {
    settings,
    modeSettings: modeSettings(m),
    say, stopVoice, stopAllAudio,
    playSfx, audio, effects,
    show, isTouch, buildPad, pickBg, nextColor,
    isActive: () => mode === m.id,
  };
}

export function show(next) {
  const prev = modes.get(mode);
  if (prev && prev.exit) prev.exit();
  stopAllAudio();
  if (next !== 'home' && modes.has(next)) {
    const m = modes.get(next);
    if (!mounted.has(next)) {
      m.mount(document.getElementById(next), ctxFor(m));
      mounted.add(next);
    }
  }
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === next));
  mode = next;
  homeBtn().classList.toggle('visible', next !== 'home');
  document.body.style.background = next === 'home' ? '' : pickBg();
  const m = modes.get(next);
  if (m && m.enter) m.enter(ctxFor(m));
}

export function initScreens(list) {
  for (const m of list) modes.set(m.id, m);
  // hold ⭐ for 2s to exit (so a toddler can't leave by accident)
  let holdTimer = null;
  const btn = homeBtn();
  const startHold = (e) => {
    e.preventDefault();
    btn.classList.add('holding');
    holdTimer = setTimeout(() => { btn.classList.remove('holding'); show('home'); }, 2000);
  };
  const cancelHold = () => { clearTimeout(holdTimer); btn.classList.remove('holding'); };
  btn.addEventListener('pointerdown', startHold);
  btn.addEventListener('pointerup', cancelHold);
  btn.addEventListener('pointerleave', cancelHold);
  btn.addEventListener('pointercancel', cancelHold);
  btn.addEventListener('contextmenu', (e) => e.preventDefault());
}

// release audio + DOM when the app is backgrounded (iOS PWA suspends us otherwise)
export function suspend() {
  stopAllAudio();
  suspendAudio();
  effects.clearEffects();
  for (const id of mounted) {
    const m = modes.get(id);
    if (m && m.suspend) m.suspend();
  }
}
