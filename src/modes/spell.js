import { LETTERS, NUMBER_WORDS, PHON, COUNT_EMOJI, slug } from '../content.js';
import { rand } from '../core/util.js';
import { artHtml } from '../core/art.js';

// ---------- spell it! mode ----------
const SPELL_TRACKS = {
  az: Object.entries(LETTERS).map(([ch, [w, e]]) => ({ word: w, pic: e, key: ch })),
  num: NUMBER_WORDS.slice(1).map((w, i) => ({ word: w, n: i + 1, key: String(i + 1) })),
};

export default {
  id: 'spell',
  title: 'Spell it!',
  emoji: '✏️',
  category: 'learn',
  settings: [
    { key: 'track', label: 'Default set', type: 'seg', default: 'az',
      options: [{ value: 'az', label: 'A–Z' }, { value: 'num', label: '1–10' }] },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="spell-picker" id="spell-picker">
        <button class="spell-track" data-track="az">
          <span class="st-icon">${artHtml('🔤')}</span>
          <span class="st-big">A to Z</span>
          <span class="st-prog" id="spell-prog-az"></span>
        </button>
        <button class="spell-track" data-track="num">
          <span class="st-icon">${artHtml('🔢')}</span>
          <span class="st-big">1 to 10</span>
          <span class="st-prog" id="spell-prog-num"></span>
        </button>
      </div>
      <div class="spell-game" id="spell-game" hidden>
        <div class="spell-top">
          <button class="spell-nav" id="spell-prev" aria-label="Previous word">◀</button>
          <button class="spell-nav" id="spell-tracks" aria-label="Pick a track">☰</button>
          <button class="spell-nav" id="spell-next" aria-label="Next word">▶</button>
          <div class="spell-count" id="spell-count"></div>
        </div>
        <button class="spell-pic" id="spell-pic" aria-label="Hear the word"></button>
        <div class="spell-word" id="spell-word"></div>
        <div class="pad" id="spell-pad"></div>
      </div>`;
    const spellPicker = el.querySelector('#spell-picker');
    const spellGame = el.querySelector('#spell-game');
    const spellPic = el.querySelector('#spell-pic');
    const spellWord = el.querySelector('#spell-word');
    const spellCount = el.querySelector('#spell-count');
    const { say, playSfx, effects, nextColor, buildPad, audio } = ctx;
    const { sparkleBurst } = effects;
    let spellProg = { az: { idx: 0, done: [] }, num: { idx: 0, done: [] } };
    try {
      const p = JSON.parse(localStorage.getItem('ab12-spell') || '{}');
      for (const t of ['az', 'num']) if (p[t]) spellProg[t] = { idx: p[t].idx | 0, done: Array.isArray(p[t].done) ? p[t].done : [] };
    } catch (e) {}
    const saveSpell = () => localStorage.setItem('ab12-spell', JSON.stringify(spellProg));
    let spellTrack = null, spellIdx = 0, spellSlots = [], spellCursor = 0;
    let spellWrong = 0, spellDone = false, spellLock = false;
    let spellIdleT = null, spellAdvT = null;
    const spellList = () => SPELL_TRACKS[spellTrack];

    function spellRenderPicker() {
      for (const t of ['az', 'num']) {
        const total = SPELL_TRACKS[t].length;
        el.querySelector('#spell-prog-' + t).textContent = `${spellProg[t].done.length} / ${total} ⭐`;
      }
    }
    function spellShowPicker() {
      spellTrack = null;
      spellLock = false;
      clearTimeout(spellIdleT);
      clearTimeout(spellAdvT);
      spellRenderPicker();
      spellGame.hidden = true;
      spellPicker.hidden = false;
    }
    function spellStart(track) {
      spellTrack = track;
      spellIdx = Math.min(spellProg[track].idx, spellList().length - 1);
      spellPicker.hidden = true;
      spellGame.hidden = false;
      spellShow();
    }
    function spellPadHint(ch) {
      const k = spellGame.querySelector(`.key[data-k="${ch}"]`);
      if (k) k.classList.add('hint');
    }
    function spellClearHints() {
      spellGame.querySelectorAll('.key.hint').forEach((k) => k.classList.remove('hint'));
      const cur = spellSlots[spellCursor];
      if (cur) cur.el.classList.remove('gold');
    }
    function spellIdleSoon() {
      clearTimeout(spellIdleT);
      spellIdleT = setTimeout(() => {
        const cur = spellSlots[spellCursor];
        if (ctx.isActive() && !spellDone && cur) spellPadHint(cur.ch);
      }, 5000);
    }
    function spellShow() {
      clearTimeout(spellAdvT);
      clearTimeout(spellIdleT);
      spellLock = false;
      spellDone = false;
      spellWrong = 0;
      spellClearHints();
      const list = spellList();
      const item = list[spellIdx];
      spellCount.textContent = `${spellProg[spellTrack].done.length} / ${list.length}`;
      if (spellTrack === 'num') {
        const n = item.n;
        const em = rand(COUNT_EMOJI).repeat(n);
        spellPic.innerHTML = `<span class="sp-digit">${n}</span><span class="sp-emoji${n > 3 ? ' many' : ''}" data-art="${em}">${artHtml(em)}</span>`;
      } else {
        spellPic.innerHTML = `<span class="sp-emoji" data-art="${item.pic}">${artHtml(item.pic)}</span>`;
      }
      spellWord.innerHTML = '';
      spellWord.style.setProperty('--slots', item.word.length);
      spellSlots = [];
      for (const c of item.word) {
        const s = document.createElement('span');
        s.className = 'slot';
        if (c === ' ') s.classList.add('gap');
        else if (c === '-') { s.classList.add('sep'); s.textContent = '-'; }
        else s.textContent = c.toUpperCase();
        spellWord.appendChild(s);
        spellSlots.push({ el: s, ch: /^[A-Z]$/i.test(c) ? c.toUpperCase() : null });
      }
      spellCursor = spellSlots.findIndex((s) => s.ch && !s.el.classList.contains('filled'));
      spellMarkCursor();
      say(`Let's spell ${item.word}!`, { clip: `sword_${slug(item.word)}` });
      spellIdleSoon();
    }
    function spellMarkCursor() {
      spellSlots.forEach((s, i) => s.el.classList.toggle('cur', i === spellCursor));
    }
    function spellNav(d) {
      if (!spellTrack) return;
      const list = spellList();
      spellIdx = (spellIdx + d + list.length) % list.length;
      spellProg[spellTrack].idx = spellIdx;
      saveSpell();
      playSfx('pop');
      spellShow();
    }
    function spellInput(k) {
      if (!spellTrack || spellLock || spellDone) return;
      k = String(k).toUpperCase();
      if (!/^[A-Z]$/.test(k)) return;
      spellClearHints();
      const cur = spellSlots[spellCursor];
      if (!cur) return;
      if (k === cur.ch) {
        spellWrong = 0;
        cur.el.classList.add('filled');
        cur.el.style.color = nextColor();
        playSfx('scaleNote');
        say(PHON[k], { clip: `letter_${k}` });
        const r = cur.el.getBoundingClientRect();
        sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 4);
        let next = -1;
        for (let i = spellCursor + 1; i < spellSlots.length; i++)
          if (spellSlots[i].ch && !spellSlots[i].el.classList.contains('filled')) { next = i; break; }
        spellCursor = next;
        if (next === -1) spellComplete();
        else spellMarkCursor();
      } else {
        cur.el.classList.remove('wobble');
        void cur.el.offsetWidth;
        cur.el.classList.add('wobble');
        playSfx('boing');
        spellWrong++;
        if (spellWrong >= 2) { spellPadHint(cur.ch); cur.el.classList.add('gold'); }
      }
      spellIdleSoon();
    }
    function spellComplete() {
      spellDone = true;
      spellLock = true;
      spellMarkCursor();
      const item = spellList()[spellIdx];
      spellSlots.forEach((s, i) => { s.el.style.animationDelay = (i * 0.07) + 's'; s.el.classList.add('win'); });
      playSfx('fanfare');
      const r = spellWord.getBoundingClientRect();
      sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 8);
      say(`${item.word}!`, { clip: `sdone_${slug(item.word)}` });
      const prog = spellProg[spellTrack];
      if (!prog.done.includes(item.key)) prog.done.push(item.key);
      spellCount.textContent = `${prog.done.length} / ${spellList().length}`;
      const last = spellIdx === spellList().length - 1;
      if (last) {
        sparkleBurst(r.left + r.width * 0.3, r.top + r.height / 2, 8);
        sparkleBurst(r.left + r.width * 0.7, r.top + r.height / 2, 8);
      }
      spellAdvT = setTimeout(() => {
        spellIdx = (spellIdx + 1) % spellList().length;
        spellProg[spellTrack].idx = spellIdx;
        saveSpell();
        spellShow();
      }, 3000);
    }
    spellPicker.querySelectorAll('.spell-track').forEach((b) =>
      b.addEventListener('click', () => { audio(); playSfx('ding'); spellStart(b.dataset.track); }));
    el.querySelector('#spell-prev').addEventListener('click', () => { audio(); spellNav(-1); });
    el.querySelector('#spell-next').addEventListener('click', () => { audio(); spellNav(1); });
    el.querySelector('#spell-tracks').addEventListener('click', () => { audio(); playSfx('pop'); spellShowPicker(); });
    spellPic.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!spellTrack) return;
      audio();
      const item = spellList()[spellIdx];
      say(`Let's spell ${item.word}!`, { clip: `sword_${slug(item.word)}` });
    });
    buildPad(el.querySelector('#spell-pad'), (k) => spellInput(k), { digits: false });

    this._enter = () => {
      // "Default set" only applies when no saved progress choice exists yet
      if (!localStorage.getItem('ab12-spell') && ctx.modeSettings.track) {
        spellStart(ctx.modeSettings.track);
        return;
      }
      spellShowPicker();
    };
    this._suspend = () => {
      clearTimeout(spellIdleT);
      clearTimeout(spellAdvT);
      spellLock = false;
    };
    this._onKey = (e) => {
      if (!spellTrack) return;
      if (e.key === 'Enter' || e.key === 'ArrowRight') { if (spellDone) spellNav(1); return; }
      if (e.key === 'ArrowLeft') { spellNav(-1); return; }
      spellInput(e.key);
    };
  },

  enter() { this._enter(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
