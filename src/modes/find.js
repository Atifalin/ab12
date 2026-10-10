import { NUMBER_WORDS, PHON, CHEERS } from '../content.js';
import { rand } from '../core/util.js';

// ---------- find it! mode ----------
const STEP = [3, 4, 6]; // choice-count ladder: start setting picks the first rung

export default {
  id: 'find',
  title: 'Find it!',
  emoji: '🔍',
  category: 'learn',
  settings: [
    { key: 'start', label: 'Start with', type: 'seg', default: 3,
      options: [{ value: 3, label: '3' }, { value: 4, label: '4' }, { value: 6, label: '6' }] },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="find-stars" id="find-stars"></div>
      <button class="find-prompt" id="find-prompt" aria-label="Hear it again">
        <span class="find-big">🔊</span><span class="find-target" id="find-target"></span>
      </button>
      <div class="find-bubbles" id="find-bubbles"></div>`;
    const findStars = el.querySelector('#find-stars');
    const findPrompt = el.querySelector('#find-prompt');
    const findTargetEl = el.querySelector('#find-target');
    const findBubblesEl = el.querySelector('#find-bubbles');
    const { say, playSfx, effects, nextColor, settings, audio } = ctx;
    const { sparkleBurst } = effects;
    const findBubbles = [];
    let findStreak = 0, findTarget = '', findPrev = '', findLocked = false, findWrong = 0, findTimer = null;
    for (let i = 0; i < 6; i++) {
      const b = document.createElement('button');
      b.className = 'find-bubble';
      b.hidden = true;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); audio(); findPick(b); });
      findBubblesEl.appendChild(b);
      findBubbles.push(b);
    }
    const findPool = () => {
      const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      if (findStreak >= 12) p.push(...'0123456789'.split(''));
      return p;
    };
    const findCount = () => {
      const i0 = Math.max(0, STEP.indexOf(+ctx.modeSettings.start || 3));
      const lvl = findStreak < 5 ? 0 : findStreak < 12 ? 1 : 2;
      return STEP[Math.max(i0, lvl)];
    };
    const findSpoken = (ch) => (/[0-9]/.test(ch) ? NUMBER_WORDS[+ch] : PHON[ch]);
    function renderStars() { findStars.textContent = '⭐'.repeat(findStreak % 10); }
    function findRound(queuePrompt = false) {
      clearTimeout(findTimer);
      findLocked = false;
      findWrong = 0;
      const pool = findPool();
      let target = rand(pool);
      while (target === findPrev) target = rand(pool);
      findPrev = findTarget = target;
      const choices = new Set([target]);
      while (choices.size < findCount()) choices.add(rand(pool));
      const arr = [...choices].sort(() => Math.random() - 0.5);
      findBubbles.forEach((b, i) => {
        if (i < arr.length) {
          b.hidden = false;
          b.textContent = arr[i];
          b.dataset.ch = arr[i];
          b.style.setProperty('--k', nextColor());
          b.classList.remove('correct', 'wobble', 'hint');
        } else b.hidden = true;
      });
      el.dataset.target = target;
      findTargetEl.textContent = 'Find: ' + target;
      findTargetEl.classList.toggle('show', !settings.voice);
      say('Find ' + findSpoken(target) + '!', { clip: 'find_' + target, queue: queuePrompt });
    }
    findPrompt.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      audio();
      if (!findTarget) findRound();
      else say('Find ' + findSpoken(findTarget) + '!', { clip: 'find_' + findTarget });
    });
    function findPick(b) {
      if (findLocked || b.hidden || !findTarget) return;
      if (b.dataset.ch === findTarget) {
        findLocked = true;
        b.classList.remove('wobble', 'hint');
        b.classList.add('correct');
        const r = b.getBoundingClientRect();
        sparkleBurst(r.left + r.width / 2, r.top + r.height / 2);
        playSfx('scaleNote');
        findStreak++;
        renderStars();
        if (findStreak % 10 === 0) {
          findStars.textContent = '';
          playSfx('fanfare');
          say('You found ten! Amazing!', { clip: 'find_ten' });
          sparkleBurst(window.innerWidth / 2, Math.max(60, window.innerHeight * 0.1), 8);
          findTimer = setTimeout(() => findRound(), 2200);
        } else {
          const ci = Math.floor(Math.random() * CHEERS.length);
          say(CHEERS[ci], { pitch: 1.4, rate: 1, queue: true, clip: `cheer_${ci}` });
          findTimer = setTimeout(() => findRound(), 1300);
        }
      } else {
        b.classList.remove('wobble');
        void b.offsetWidth;
        b.classList.add('wobble');
        playSfx('boing');
        say('Try again!', { clip: 'try_again' });
        findWrong++;
        if (findWrong >= 2) {
          const tb = findBubbles.find((x) => !x.hidden && x.dataset.ch === findTarget);
          if (tb) tb.classList.add('hint');
          findTargetEl.classList.add('show');
        }
      }
    }

    this._enter = () => {
      clearTimeout(findTimer);
      findLocked = false;
      findWrong = 0;
      findTarget = '';
      findTargetEl.classList.remove('show');
      renderStars();
    };
    this._round = findRound;
    this._suspend = () => { clearTimeout(findTimer); findLocked = false; };
    this._onKey = (e) => {
      if (e.key.length === 1) {
        const k = e.key.toUpperCase();
        const b = findBubbles.find((x) => !x.hidden && x.dataset.ch === k);
        if (b) findPick(b);
      }
    };
  },

  enter(ctx) {
    this._enter();
    ctx.say("Let's play find it!", { clip: 'find_intro' });
    this._round(true); // prompt queued behind the intro
  },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
