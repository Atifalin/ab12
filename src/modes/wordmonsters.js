import { WM_WORDS, LETTER_SOUNDS } from '../content.js';
import { loadFamily, familyMembers, playLine } from '../core/family.js';
import { makeDraggable } from '../core/drag.js';
import { rand, rnd } from '../core/util.js';

// ---------- word monsters ----------
const PASTELS = ['#ffb3c6', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];
const WM_KEY = 'ab12-wm';

export default {
  id: 'wordmonsters',
  title: 'Word Monsters',
  emoji: '👾',
  category: 'learn',
  settings: [
    { key: 'letters', label: 'Letters say', type: 'seg', default: 'sounds',
      options: [{ value: 'sounds', label: 'Sounds' }, { value: 'names', label: 'Names' }] },
    { key: 'words', label: 'Words', type: 'seg', default: 'cvc',
      options: [{ value: 'cvc', label: '3-letter' }, { value: 'all', label: '3–4 letters' }] },
    { key: 'order', label: 'Order', type: 'seg', default: 'any',
      options: [{ value: 'any', label: 'Any slot' }, { value: 'ltr', label: 'Left to right' }] },
    { key: 'family', label: 'Family names', type: 'toggle', default: false },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="wm-top">
        <div class="wm-emoji" id="wm-emoji"></div>
        <div class="wm-word" id="wm-word"></div>
      </div>
      <div class="wm-slots" id="wm-slots"></div>
      <div class="wm-field" id="wm-field"></div>
      <div class="wm-nav">
        <button id="wm-prev" class="pad-btn" aria-label="Previous word">◀</button>
        <span id="wm-count" class="wm-count"></span>
        <button id="wm-next" class="pad-btn" aria-label="Next word">▶</button>
      </div>
      <div class="pk-banner wm-banner" id="wm-banner">
        <span class="pk-emoji"></span>
        <span class="pk-lines"><span class="pk-name"></span><span class="pk-title"></span></span>
      </div>`;
    const emojiEl = el.querySelector('#wm-emoji');
    const wordEl = el.querySelector('#wm-word');
    const slotsEl = el.querySelector('#wm-slots');
    const field = el.querySelector('#wm-field');
    const countEl = el.querySelector('#wm-count');
    const banner = el.querySelector('#wm-banner');
    const bannerEmoji = banner.querySelector('.pk-emoji');
    const bannerName = banner.querySelector('.pk-name');
    const bannerTitle = banner.querySelector('.pk-title');

    const { say, playSfx, effects } = ctx;
    const { sparkleBurst, confettiBurst } = effects;

    let words = [];
    let wi = 0;
    let done = new Set();
    let drags = [];
    let timers = [];
    let curWord = null;
    let wrong = 0;
    let busy = false;
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearT = () => { timers.forEach(clearTimeout); timers = []; };

    const save = () => localStorage.setItem(WM_KEY, JSON.stringify({ i: wi, done: [...done] }));

    function wordList() {
      let list = WM_WORDS.filter((w) => w.w.length === 3);
      const cvcDone = list.every((w) => done.has(w.w));
      if (ctx.modeSettings.words === 'all' || cvcDone) list = WM_WORDS;
      if (ctx.modeSettings.family) {
        for (const m of familyMembers()) {
          const w = (m.name || '').toLowerCase().replace(/[^a-z]/g, '');
          if (w.length >= 3) list = [...list, { w, emoji: '💛', act: 'bounce', line: '', member: m }];
        }
      }
      return list;
    }

    function letterClip(ch) {
      if (ctx.modeSettings.letters === 'names')
        return { text: ch.toUpperCase(), clip: 'letter_' + ch.toUpperCase() };
      return { text: LETTER_SOUNDS[ch] || ch, clip: 'snd_' + ch };
    }
    function squeak(ch) {
      const c = letterClip(ch);
      say(c.text, { clip: c.clip });
    }

    function buildWord() {
      clearT();
      drags.forEach((d) => d.destroy());
      drags = [];
      wrong = 0;
      busy = false;
      banner.classList.remove('show');
      const w = words[wi % words.length];
      curWord = w;
      emojiEl.textContent = w.emoji;
      emojiEl.className = 'wm-emoji';
      wordEl.textContent = w.w;
      countEl.textContent = `${wi % words.length + 1} / ${words.length}`;

      // slots
      slotsEl.innerHTML = '';
      const slots = [...w.w].map((ch, i) => {
        const s = document.createElement('div');
        s.className = 'wm-slot';
        s.dataset.ch = ch;
        s.dataset.i = i;
        slotsEl.appendChild(s);
        return s;
      });

      // monsters scattered in the field
      field.innerHTML = '';
      const letters = [...w.w].sort(() => Math.random() - 0.5);
      const fr = () => field.getBoundingClientRect();
      letters.forEach((ch, i) => {
        const m = document.createElement('div');
        m.className = 'wm-mon wm-in';
        m.dataset.ch = ch;
        m.style.setProperty('--c', PASTELS[(i + wi) % PASTELS.length]);
        m.style.left = (8 + (i % 5) * 19 + rnd(-2, 2)) + '%';
        m.style.top = (10 + Math.floor(i / 5) * 52 + rnd(-4, 10)) + '%';
        m.innerHTML = `<span class="eye e1"><i></i></span><span class="eye e2"><i></i></span>
          <span class="foot f1"></span><span class="foot f2"></span>
          <span class="letter">${ch.toUpperCase()}</span>`;
        // tap = squeak (only when not dragged — pointerup without move fires click)
        m.addEventListener('click', () => { if (!m._placed) { m.classList.add('jiggle'); setTimeout(() => m.classList.remove('jiggle'), 400); squeak(ch); } });
        field.appendChild(m);
        const drag = makeDraggable(m, {
          zones: () => {
            const list = [...slots];
            if (ctx.modeSettings.order === 'ltr') {
              const next = slots.find((s) => !s.classList.contains('filled'));
              return next ? [next] : [];
            }
            return slots.filter((s) => !s.classList.contains('filled'));
          },
          onPick: () => m.classList.add('lifted'),
          onDrop: (el, zone) => {
            if (m._placed) return true;
            if (zone && zone.dataset.ch === ch) {
              lockLetter(m, zone);
              return true;
            }
            wrongDrop(m);
            return false;
          },
        });
        drags.push(drag);
        m._drag = drag;
        m._slotFor = slots;
        T(() => m.classList.remove('wm-in'), 60 + i * 90);
      });
    }

    function wrongDrop(m) {
      wrong++;
      playSfx('boing');
      if (m) { m.classList.add('giggle'); setTimeout(() => m.classList.remove('giggle'), 500); }
      if (wrong >= 2) {
        const next = curWord && [...slotsEl.children].find((s) => !s.classList.contains('filled'));
        if (next) next.classList.add('pulse');
      }
    }

    function lockLetter(m, slot) {
      m._placed = true;
      slot.classList.add('filled', 'light');
      slot.classList.remove('pulse');
      slot.textContent = slot.dataset.ch.toUpperCase();
      // snap monster exactly onto the slot, then hide it (slot shows the letter)
      const sr = slot.getBoundingClientRect(), mr = m.getBoundingClientRect();
      m.style.transition = 'transform .25s ease';
      m.style.transform = `translate(${sr.left + sr.width / 2 - (mr.left + mr.width / 2)}px, ${sr.top + sr.height / 2 - (mr.top + mr.height / 2)}px) scale(.6)`;
      T(() => { m.style.display = 'none'; m.style.transition = ''; }, 260);
      const c = letterClip(slot.dataset.ch);
      say(c.text, { clip: c.clip });
      playSfx('ding');
      const r = slot.getBoundingClientRect();
      sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 4);
      T(checkDone, 500);
    }

    function typeLetter(ch) {
      if (busy || !curWord) return;
      const slots = [...slotsEl.children];
      const open = ctx.modeSettings.order === 'ltr'
        ? [slots.find((s) => !s.classList.contains('filled'))].filter(Boolean)
        : slots.filter((s) => !s.classList.contains('filled'));
      const slot = open.find((s) => s.dataset.ch === ch);
      if (!slot) { wrongDrop(null); return; }
      const m = [...field.querySelectorAll('.wm-mon')].find((x) => x.dataset.ch === ch && !x._placed);
      if (!m) return;
      lockLetter(m, slot); // snap transform inside lockLetter is the animation
    }

    function checkDone() {
      const slots = [...slotsEl.children];
      if (slots.some((s) => !s.classList.contains('filled')) || busy) return;
      busy = true;
      done.add(curWord.w);
      save();
      const r = slotsEl.getBoundingClientRect();
      // light letters left to right, playing sounds queued one at a time
      slots.forEach((s, i) => {
        T(() => {
          s.classList.add('glow');
          const c = letterClip(s.dataset.ch);
          say(c.text, { clip: c.clip, queue: i > 0 });
        }, 350 * i + 300);
      });
      const n = slots.length;
      T(() => {
        if (curWord.member) playLine(curWord.member, 'name');
        else say(curWord.w, { clip: 'wm_' + curWord.w });
      }, 350 * n + 600);
      T(() => {
        emojiEl.classList.add('act-' + curWord.act);
        confettiBurst(el, r.left - el.getBoundingClientRect().left + r.width / 2, r.top - el.getBoundingClientRect().top);
        sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 10);
        playSfx('fanfare');
        bannerEmoji.textContent = curWord.emoji;
        bannerName.textContent = curWord.member ? curWord.member.name + '!' : curWord.w + '!';
        bannerTitle.textContent = curWord.line || '';
        bannerTitle.style.display = curWord.line ? '' : 'none';
        banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show');
        if (curWord.member) playLine(curWord.member, 'peekaboo');
        else say(curWord.line, { clip: 'wmact_' + curWord.w });
        if ((done.size % 5) === 0) {
          T(() => { playSfx('cheer'); confettiBurst(el, r.width / 2, r.top); }, 700);
        }
      }, 350 * n + 1300);
      T(() => { wi = (wi + 1) % words.length; save(); buildWord(); }, 350 * n + 3400);
    }

    el.querySelector('#wm-prev').addEventListener('click', (e) => {
      e.target.blur();
      wi = (wi - 1 + words.length) % words.length; save(); buildWord();
    });
    el.querySelector('#wm-next').addEventListener('click', (e) => {
      e.target.blur();
      wi = (wi + 1) % words.length; save(); buildWord();
    });

    this._start = async () => {
      await loadFamily();
      try { const j = JSON.parse(localStorage.getItem(WM_KEY) || '{}'); wi = j.i || 0; done = new Set(j.done || []); } catch (e) {}
      words = wordList();
      wi = wi % words.length;
      say('', { clip: 'wm_intro' });
      buildWord();
    };
    this._suspend = () => {
      clearT();
      drags.forEach((d) => d.destroy());
      drags = [];
    };
    this._onKey = (e) => {
      if (/^[a-zA-Z]$/.test(e.key)) typeLetter(e.key.toLowerCase());
      else if (e.key === 'ArrowLeft') el.querySelector('#wm-prev').click();
      else if (e.key === 'ArrowRight') el.querySelector('#wm-next').click();
    };
  },

  async enter() { await this._start(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
