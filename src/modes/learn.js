import {
  LETTERS, NUMBER_WORDS, PHON, COUNT_EMOJI, WORD_MAP, CHEERS,
} from '../content.js';
import { rand, rnd } from '../core/util.js';
import { SILLY } from '../core/audio.js';
import { playLine } from '../core/family.js';

// ---------- learn mode ----------
export default {
  id: 'learn',
  title: 'Letters & Numbers',
  emoji: '🔤',
  cardHtml: '123<br/>ABC',
  category: 'learn',
  settings: [],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="trail" id="trail"></div>
      <div class="stage" id="learn-stage">
        <div id="word-banner" class="word-banner"><span class="wb-emoji"></span><span class="wb-text"></span></div>
        <div class="hero" id="hero">
          <div class="glyph" id="glyph">A</div>
          <div class="pic" id="pic">🍎</div>
          <div class="word" id="word">Apple</div>
        </div>
        <div class="idle" id="learn-idle">Press any letter or number!</div>
      </div>
      <div class="pad" id="pad"></div>
      <button id="undo-btn" class="undo-btn" aria-label="Undo last letter">⌫</button>`;

    const trail = el.querySelector('#trail');
    const hero = el.querySelector('#hero');
    const glyphEl = el.querySelector('#glyph');
    const picEl = el.querySelector('#pic');
    const wordEl = el.querySelector('#word');
    const idleEl = el.querySelector('#learn-idle');
    const undoBtn = el.querySelector('#undo-btn');
    const wordBanner = el.querySelector('#word-banner');
    const wbEmoji = wordBanner.querySelector('.wb-emoji');
    const wbText = wordBanner.querySelector('.wb-text');
    let wbTimer = null;
    let wordIdCtr = 0;
    let lastGlyph = '';
    let lastSpeak = null;
    let idleTimer = null;

    const { say, playSfx, stopVoice, effects, buildPad, pickBg, nextColor, settings } = ctx;
    const { sparkleBurst } = effects;

    function showWordBanner(entry) {
      wbEmoji.textContent = entry.emoji;
      wbText.textContent = entry.display === 'Ezdan' ? 'Ezdan! 💖' : entry.display + '!';
      wordBanner.classList.toggle('family', entry.family);
      wordBanner.classList.remove('show');
      void wordBanner.offsetWidth;
      wordBanner.classList.add('show');
      clearTimeout(wbTimer);
      wbTimer = setTimeout(() => wordBanner.classList.remove('show'), 2200);
    }
    // did the trailing letters just complete a known word/name?
    function checkWordHit() {
      const chips = [];
      for (let el2 = trail.lastElementChild;
           el2 && el2.classList.contains('chip') && el2._data && /^[A-Z]$/.test(el2._data.display) && chips.length < 10;
           el2 = el2.previousElementSibling)
        chips.unshift(el2);
      for (let len = Math.min(chips.length, 10); len >= 3; len--) {
        const s = chips.slice(-len).map((c) => c._data.display).join('');
        const entry = WORD_MAP.get(s);
        if (entry) return { entry, chips: chips.slice(-len) };
      }
      return null;
    }
    function celebrateWord(hit) {
      const wid = ++wordIdCtr;
      for (const c of hit.chips) { c.classList.add('word-hit'); c._wordId = wid; }
      playSfx('fanfare');
      showWordBanner(hit.entry);
      const r = wordBanner.getBoundingClientRect();
      sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 8);
      if (hit.entry.member) playLine(hit.entry.member, 'name');
      else say(hit.entry.display, { clip: hit.entry.clip });
    }
    function trimTrail() {
      while (trail.children.length > 60) trail.firstElementChild.remove();
      // a trailing .break adds an invisible empty flex line — exclude it from the height check
      let tail = null;
      if (trail.lastElementChild && trail.lastElementChild.classList.contains('break')) {
        tail = trail.lastElementChild;
        tail.remove();
      }
      // offsetTop/offsetHeight are pure layout — scrollHeight also counts animating
      // transforms, which would fake an overflow mid-animation
      const base = trail.offsetTop;
      while (trail.children.length > 1 &&
             trail.lastElementChild.offsetTop + trail.lastElementChild.offsetHeight - base > trail.clientHeight)
        trail.firstElementChild.remove();
      if (tail) trail.appendChild(tail);
      if (trail.firstElementChild && trail.firstElementChild.classList.contains('break')) trail.firstElementChild.remove();
    }
    function newLine() {
      const last = trail.lastElementChild;
      if (!last || last.classList.contains('break')) { playSfx('pop'); return; }
      const b = document.createElement('div');
      b.className = 'break';
      trail.appendChild(b);
      trimTrail();
      lastGlyph = '';
      playSfx('slideUp');
      stopVoice();
    }

    // subtle invitation to press something after a few quiet seconds
    function pokeIdle() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (ctx.isActive() && hero.classList.contains('show')) {
          hero.classList.remove('wiggle');
          void hero.offsetWidth;
          hero.classList.add('wiggle');
        }
      }, 6000);
    }
    // tap the hero to hear it again
    hero.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!lastSpeak) return;
      hero.classList.remove('wiggle');
      void hero.offsetWidth;
      hero.classList.add('wiggle');
      playSfx('pop');
      say(lastSpeak.text, { clip: lastSpeak.clip });
    });

    function learnInput(ch) {
      ch = ch.toUpperCase();
      let display = ch;
      let word, pic;
      const speakParts = [];
      const color = nextColor();
      document.body.style.background = pickBg();

      if (/[0-9]/.test(ch)) {
        let n = +ch;
        if (ch === '0' && lastGlyph === '1') {
          n = 10;
          display = '10';
          const prev = trail.lastElementChild;
          if (prev) prev.remove();
        }
        word = NUMBER_WORDS[n];
        pic = n === 0 ? '🫧' : rand(COUNT_EMOJI).repeat(n);
        picEl.classList.toggle('many', n > 3);
        speakParts.push({ text: `${word}!`, clip: `num_${n}` });
        if (settings.words && n > 1 && n <= 5)
          speakParts.push({ text: `${NUMBER_WORDS.slice(1, n + 1).join(', ')}!`, clip: `count_${n}` });
        playSfx('ding');
      } else if (/[A-Z]/.test(ch)) {
        [word, pic] = LETTERS[ch];
        picEl.classList.remove('many');
        speakParts.push(settings.words
          ? { text: `${PHON[ch]}! ${PHON[ch]} is for ${word}!`, clip: `phrase_${ch}` }
          : { text: PHON[ch], clip: `letter_${ch}` });
        playSfx('scaleNote');
      } else {
        playSfx(rand(SILLY));
        return;
      }

      lastGlyph = display;
      lastSpeak = speakParts[0];
      idleEl.classList.add('hidden');
      hero.classList.remove('show');
      void hero.offsetWidth; // restart animations
      hero.classList.add('show');
      glyphEl.textContent = display;
      glyphEl.style.color = '#fff';
      picEl.textContent = pic;
      wordEl.textContent = word;
      const hr = hero.getBoundingClientRect();
      sparkleBurst(hr.left + hr.width / 2, hr.top + hr.height / 2);
      pokeIdle();

      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.style.setProperty('--chip', color);
      chip.textContent = display;
      chip._data = { display, word, pic, many: picEl.classList.contains('many'),
        text: speakParts[0].text, clip: speakParts[0].clip };
      const chipSpeak = speakParts[0];
      chip.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        chip.style.transform = 'scale(1.3) rotate(8deg)';
        setTimeout(() => (chip.style.transform = ''), 200);
        playSfx('pop');
        say(chipSpeak.text, { clip: chipSpeak.clip });
      });
      trail.appendChild(chip);
      trimTrail();

      const hit = /[A-Z]/.test(ch) ? checkWordHit() : null;
      if (hit) {
        celebrateWord(hit);
      } else {
        say(speakParts[0].text, { clip: speakParts[0].clip, pitch: rnd(1.05, 1.35), rate: 0.9 });
        for (const p of speakParts.slice(1)) say(p.text, { clip: p.clip, queue: true });
        // queued so it plays after the letter, never on top of it
        const ci = Math.floor(Math.random() * CHEERS.length);
        if (Math.random() < 0.3) say(CHEERS[ci], { pitch: 1.4, rate: 1, queue: true, clip: `cheer_${ci}` });
      }
    }

    // ⌫ undo — drop the last trail chip and revert the hero to the previous entry
    function undoLast() {
      stopVoice();
      const last = trail.lastElementChild;
      if (!last) { playSfx('boing'); return; }
      last.remove();
      playSfx('pop');
      if (last.classList.contains('break')) return;
      if (last._wordId)
        trail.querySelectorAll('.chip.word-hit').forEach((c) => {
          if (c._wordId === last._wordId) c.classList.remove('word-hit');
        });
      let prev = trail.lastElementChild;
      while (prev && !prev._data) prev = prev.previousElementSibling;
      if (prev) {
        const d = prev._data;
        hero.classList.remove('show');
        void hero.offsetWidth;
        hero.classList.add('show');
        glyphEl.textContent = d.display;
        picEl.textContent = d.pic;
        wordEl.textContent = d.word;
        picEl.classList.toggle('many', d.many);
        lastGlyph = d.display;
        lastSpeak = { text: d.text, clip: d.clip };
      } else {
        hero.classList.remove('show');
        idleEl.classList.remove('hidden');
        lastGlyph = '';
        lastSpeak = null;
      }
    }

    undoBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); ctx.audio(); undoLast(); });
    buildPad(el.querySelector('#pad'), (k) => {
      if (k === 'Backspace') undoLast();
      else if (k === 'Enter') newLine();
      else learnInput(k);
    }, { extras: [
      { text: '⌫', aria: 'Backspace', k: 'Backspace', color: '#8892b0' },
      { text: '⏎', aria: 'New line', k: 'Enter', color: '#5c7cfa' },
    ] });

    this._enter = () => {
      idleEl.classList.remove('hidden');
      hero.classList.remove('show');
      trail.innerHTML = '';
      lastGlyph = '';
      lastSpeak = null;
    };
    this._exit = () => { clearTimeout(idleTimer); clearTimeout(wbTimer); };
    this._onKey = (e) => {
      if (e.key === 'Backspace' || e.key === 'Delete') { undoLast(); return; }
      if (e.key === 'Enter') { newLine(); return; }
      learnInput(e.key.length === 1 ? e.key : ' ');
    };
  },

  enter(ctx) {
    this._enter();
    ctx.say("Let's learn letters and numbers!", { clip: 'intro_learn' });
  },
  exit() { this._exit(); },
  suspend() { this._exit(); },
  onKey(e) { this._onKey(e); },
};
