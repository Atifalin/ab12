import { BG } from '../content.js';
import { rand } from './util.js';

// ---------- settings ----------
// Same localStorage key and defaults as always — saved settings must survive.
export const settings = {
  sfx: true, voice: true, words: true, volume: 0.8, theme: 'auto',
  voicePack: 'surprise', showAll: false, parentLock: true, modes: {},
};
try { Object.assign(settings, JSON.parse(localStorage.getItem('ab12-settings') || '{}')); } catch (e) {}
if (!settings.modes || typeof settings.modes !== 'object') settings.modes = {};
export const saveSettings = () => localStorage.setItem('ab12-settings', JSON.stringify(settings));

export const THEMES = {
  auto: BG,
  candy: ['#ff5c8a', '#ff77e9', '#f368e0', '#ff6b6b', '#ffb020', '#e5397a'],
  ocean: ['#2fb8ff', '#00c9a7', '#118ab2', '#5c7cfa', '#06d6a0', '#5468ff'],
  forest: ['#4cd964', '#20c997', '#3ddc84', '#a0d911', '#00c2a8', '#06d6a0'],
};
export const pickBg = () => rand(THEMES[settings.theme] || BG);
export const applyTheme = () => {
  ['auto', 'candy', 'ocean', 'forest'].forEach((t) => document.body.classList.remove('theme-' + t));
  document.body.classList.add('theme-' + (THEMES[settings.theme] ? settings.theme : 'auto'));
};
applyTheme();

// Per-mode settings live under settings.modes[modeId]; `enabled` hides a mode.
export function modeSettings(mode) {
  const m = settings.modes[mode.id] || (settings.modes[mode.id] = {});
  if (m.enabled === undefined && mode.defaultEnabled !== undefined) m.enabled = mode.defaultEnabled;
  for (const s of mode.settings || []) if (m[s.key] === undefined) m[s.key] = s.default;
  return m;
}
export const modeEnabled = (mode) => modeSettings(mode).enabled !== false;
