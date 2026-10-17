import { settings, saveSettings, applyTheme, modeSettings, modeEnabled } from './settings.js';
import { audio, playSfx, stopSfx, setVolume } from './audio.js';
import { say, onVoiceManifest, pickSessionVoice, packsWithTakes, packName, todayVoiceName } from './voice.js';
import { renderHome } from './home.js';
import { activeModeDef } from './screens.js';
import { $ } from './util.js';

// ---------- settings panel ----------
// Generic, sectioned panel — sections render rows built from small schemas.
let allModes = [];
let built = false;
let packSeg = null;
let packNote = null;
let shelfEl = null;

function row(labelText, control) {
  const r = document.createElement('div');
  r.className = 'set-row';
  const l = document.createElement('span');
  l.className = 'set-label';
  l.textContent = labelText;
  r.append(l, control);
  return r;
}

function pillRow(labelText, get, set) {
  const b = document.createElement('button');
  b.className = 'set-row';
  const l = document.createElement('span');
  l.className = 'set-label';
  l.textContent = labelText;
  const p = document.createElement('span');
  p.className = 'pill';
  b.append(l, p);
  const sync = () => b.setAttribute('aria-pressed', get());
  sync();
  b.addEventListener('click', () => { set(!get()); saveSettings(); sync(); });
  b._sync = sync;
  return b;
}

function seg(opts, get, set) {
  const s = document.createElement('span');
  s.className = 'seg';
  const sync = () => s.querySelectorAll('.seg-btn').forEach((b) =>
    b.classList.toggle('on', String(b.dataset.v) === String(get())));
  for (const [v, label] of opts) {
    const b = document.createElement('button');
    b.className = 'seg-btn';
    b.dataset.v = v;
    b.textContent = label;
    b.addEventListener('click', (e) => { e.stopPropagation(); set(v); saveSettings(); sync(); });
    s.appendChild(b);
  }
  s._sync = sync;
  sync();
  return s;
}

function rangeRow(labelText, get, onInput, onDone) {
  const r = document.createElement('div');
  r.className = 'set-row set-vol';
  const l = document.createElement('span');
  l.className = 'set-label';
  l.textContent = labelText;
  const i = document.createElement('input');
  i.type = 'range';
  i.min = 0; i.max = 100;
  i.value = Math.round(get() * 100);
  i.addEventListener('input', () => onInput(i.value / 100));
  if (onDone) i.addEventListener('change', onDone);
  r.append(l, i);
  return r;
}

function section(title) {
  const d = document.createElement('div');
  d.className = 'set-section';
  const h = document.createElement('h3');
  h.textContent = title;
  d.appendChild(h);
  return d;
}

function schemaControl(m, s) {
  const ms = modeSettings(m);
  if (s.type === 'toggle') {
    return pillRow(s.label, () => ms[s.key] !== false, (v) => { ms[s.key] = v; });
  }
  if (s.type === 'range') {
    const wrap = document.createElement('div');
    wrap.className = 'set-row set-vol';
    const l = document.createElement('span');
    l.className = 'set-label';
    l.textContent = s.label;
    const i = document.createElement('input');
    i.type = 'range';
    i.min = s.min ?? 0; i.max = s.max ?? 100; i.step = s.step ?? 1;
    i.value = ms[s.key];
    i.addEventListener('input', () => { ms[s.key] = +i.value; saveSettings(); });
    wrap.append(l, i);
    return wrap;
  }
  // 'seg'
  const opts = (s.options || []).map((o) => [o.value, o.label]);
  const segEl = seg(opts, () => ms[s.key], (v) => {
    ms[s.key] = s.options.find((o) => String(o.value) === String(v)).value;
    playSfx('pop');
  });
  return row(s.label, segEl);
}

function renderPackPicker() {
  if (!packSeg) return;
  packSeg.innerHTML = '';
  const opts = [['surprise', '🎲'], ...packsWithTakes().map((s) => [s, packName(s)])];
  for (const [v, n] of opts) {
    const b = document.createElement('button');
    b.className = 'seg-btn' + (v === settings.voicePack ? ' on' : '');
    b.dataset.v = v;
    b.textContent = n;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      settings.voicePack = v;
      saveSettings();
      pickSessionVoice();
      renderPackPicker();
      playSfx('pop');
    });
    packSeg.appendChild(b);
  }
  packNote.textContent = 'Today: ' + todayVoiceName();
}

function renderShelf() {
  shelfEl.innerHTML = '';
  for (const m of allModes) {
    shelfEl.appendChild(pillRow(`${m.emoji} ${m.title}`, () => modeEnabled(m), (v) => {
      const enabled = allModes.filter(modeEnabled).length;
      if (!v && enabled <= 1) { playSfx('boing'); return; } // at least one stays on
      modeSettings(m).enabled = v;
      renderHome();
      renderShelf();
      playSfx('pop');
    }));
  }
}

export function openSettings() {
  const panel = $('#settings');
  syncPanel();
  panel.hidden = false;
}

export function closeSettings() {
  $('#settings').hidden = true;
}

function syncPanel() {
  renderPackPicker();
}

export function initSettingsPanel(modes) {
  if (built) return;
  built = true;
  allModes = modes;
  const card = $('#settings .settings-card');

  // Top tab bar inside settings so mobile screens stay compact and organized
  const tabBar = document.createElement('div');
  tabBar.className = 'set-tabs';
  const panes = {};
  const tabDefs = [
    ['general', '🔊 Sound & Voice'],
    ['modes', '🎮 Games'],
    ['look', '🎨 Look & Parent'],
  ];
  for (const [id, label] of tabDefs) {
    const p = document.createElement('div');
    p.className = 'set-pane';
    p.dataset.pane = id;
    if (id !== 'general') p.hidden = true;
    panes[id] = p;
    const tb = document.createElement('button');
    tb.className = 'set-tab' + (id === 'general' ? ' on' : '');
    tb.dataset.tab = id;
    tb.textContent = label;
    tb.addEventListener('click', () => {
      tabBar.querySelectorAll('.set-tab').forEach((x) => x.classList.toggle('on', x === tb));
      Object.entries(panes).forEach(([k, el]) => { el.hidden = k !== id; });
      playSfx('pop');
    });
    tabBar.appendChild(tb);
  }
  card.appendChild(tabBar);

  // Sound
  const snd = section('🔊 Sound');
  snd.appendChild(pillRow('🔔 Sound effects', () => settings.sfx, (v) => {
    settings.sfx = v;
    if (v) playSfx('ding'); else stopSfx();
  }));
  snd.appendChild(rangeRow('🔉 Volume', () => settings.volume,
    (v) => { setVolume(v); saveSettings(); }, () => playSfx('ding')));
  panes.general.appendChild(snd);

  // Voice
  const voc = section('🗣️ Voice');
  voc.appendChild(pillRow('🗣️ Voice', () => settings.voice, (v) => {
    settings.voice = v;
    if (v) say('Voice on!', { clip: 'voice_on' });
    else if ('speechSynthesis' in window) speechSynthesis.cancel();
  }));
  voc.appendChild(row('💬 Voice says', seg(
    [[1, 'A is for 🍎'], [0, 'A only']],
    () => (settings.words ? 1 : 0),
    (v) => {
      settings.words = v === 1 || v === '1';
      say(settings.words ? 'ay! ay is for Apple!' : 'ay',
        { clip: settings.words ? 'phrase_A' : 'letter_A' });
    })));
  const packRow = document.createElement('div');
  packRow.className = 'set-row set-seg';
  packRow.id = 'set-voicepack';
  const pl = document.createElement('span');
  pl.className = 'set-label';
  pl.textContent = '👪 Voice pack';
  packSeg = document.createElement('span');
  packSeg.className = 'seg';
  packRow.append(pl, packSeg);
  voc.appendChild(packRow);
  packNote = document.createElement('p');
  packNote.className = 'seg-note';
  voc.appendChild(packNote);
  panes.general.appendChild(voc);

  // Look
  const look = section('🎨 Look');
  look.appendChild(row('🎨 Theme', seg(
    [['auto', '🌈 Mix'], ['candy', '🍬'], ['ocean', '🌊'], ['forest', '🌿']],
    () => settings.theme,
    (v) => { settings.theme = v; applyTheme(); playSfx('pop'); })));
  panes.look.appendChild(look);

  // Home
  const hom = section('🏠 Home');
  hom.appendChild(pillRow('🃏 Show all modes on home', () => settings.showAll, (v) => {
    settings.showAll = v;
    renderHome();
    playSfx('pop');
  }));
  panes.look.appendChild(hom);

  // Parent
  const par = section('🔒 Parent');
  par.appendChild(pillRow('🔐 Parent lock (hold ⚙️ 2s)', () => settings.parentLock, (v) => {
    settings.parentLock = v;
    playSfx('pop');
  }));
  panes.look.appendChild(par);

  // Modes: shelf + per-mode schema sections
  const mod = section('🎛️ Active Games');
  shelfEl = document.createElement('div');
  shelfEl.className = 'mode-shelf';
  renderShelf();
  mod.appendChild(shelfEl);
  const rulesSec = section('⚙️ Game Rules');
  for (const m of allModes) {
    if (!m.settings || !m.settings.length) continue;
    const sub = document.createElement('div');
    sub.className = 'set-subsection';
    const h = document.createElement('h4');
    h.textContent = `${m.emoji} ${m.title}`;
    sub.appendChild(h);
    for (const s of m.settings) sub.appendChild(schemaControl(m, s));
    rulesSec.appendChild(sub);
  }
  panes.modes.append(mod, rulesSec);

  card.append(panes.general, panes.modes, panes.look);

  const done = document.createElement('button');
  done.className = 'set-close';
  done.id = 'settings-close';
  done.textContent = 'Done';
  done.addEventListener('click', closeSettings);
  card.appendChild(done);

  const panel = $('#settings');
  panel.addEventListener('pointerdown', (e) => { if (e.target === panel) closeSettings(); });

  onVoiceManifest(renderPackPicker);
  renderPackPicker();
}
