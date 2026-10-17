import { ANIMALS } from '../content.js';
import { sayUrls, packTakeUrl } from '../core/voice.js';
import { makeDraggable, flyFromDrop } from '../core/drag.js';
import { rand, rnd } from '../core/util.js';
import { setArt, artHtml } from '../core/art.js';

// ---------- animal farm (3-in-1 interactive playground!) ----------
const SCENE_DECO = {
  farm: { cls: 'af-farm' }, zoo: { cls: 'af-zoo' }, sea: { cls: 'af-sea' },
  jungle: { cls: 'af-jungle' }, mix: { cls: 'af-mix' },
};
const BUB_COLORS = ['#ff5c8a', '#ff9f1c', '#ffd23f', '#4cd964', '#2fb8ff', '#8a63ff', '#00c9a7'];
const HATS = ['👑', '🎩', '🧢', '⭐', '🎈', '🌸'];
const TREATS = ['🍎', '🥕', '🍌', '🍓', '🐟', '🍪'];

export default {
  id: 'animalfarm',
  title: 'Animal Farm',
  emoji: '🐮',
  category: 'play',
  settings: [
    { key: 'scene', label: 'Scene', type: 'seg', default: 'farm',
      options: [{ value: 'farm', label: 'Farm' }, { value: 'zoo', label: 'Zoo' },
                { value: 'sea', label: 'Sea' }, { value: 'jungle', label: 'Jungle' },
                { value: 'mix', label: 'Mix' }] },
    { key: 'game', label: 'Game', type: 'seg', default: 'free',
      options: [{ value: 'free', label: '🎈 Pop & Parade' }, { value: 'treat', label: '🍎 Feed & Tickle' }, { value: 'quiz', label: '🔍 Who says…?' }] },
    { key: 'sounds', label: 'Animal sounds', type: 'seg', default: 'family',
      options: [{ value: 'family', label: 'Family voice when recorded' }, { value: 'real', label: 'Real only' }] },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="af-sky"></div>
      <div class="af-hills"><i></i><i></i><i></i></div>
      <div class="af-ground"></div>
      <div class="af-topbar">
        <button class="af-mode-btn on" data-m="free">${artHtml('🎈')}<span>Pop!</span></button>
        <button class="af-mode-btn" data-m="treat">${artHtml('🍎')}<span>Feed!</span></button>
        <button class="af-mode-btn" data-m="quiz">${artHtml('🔍')}<span>Quiz!</span></button>
      </div>
      <div class="af-stars" id="af-stars"></div>
      <button class="af-prompt" id="af-prompt" hidden aria-label="Hear question again">
        <span class="af-spk">${artHtml('speaker')}</span>
        <span id="af-prompt-txt"></span>
      </button>
      <div class="af-animals" id="af-animals"></div>
      <div class="af-parade" id="af-parade"></div>
      <div class="pk-banner wm-banner af-banner" id="af-banner">
        <span class="pk-emoji"></span>
        <span class="pk-lines"><span class="pk-name"></span><span class="pk-title"></span></span>
      </div>`;
    const { say, playSfx, effects, audio } = ctx;
    const { sparkleBurst, confettiBurst } = effects;
    const field = el.querySelector('#af-animals');
    const parade = el.querySelector('#af-parade');
    const starsEl = el.querySelector('#af-stars');
    const promptEl = el.querySelector('#af-prompt');
    const promptTxt = el.querySelector('#af-prompt-txt');
    const banner = el.querySelector('#af-banner');
    const bEmoji = banner.querySelector('.pk-emoji');
    const bName = banner.querySelector('.pk-name');
    const bTitle = banner.querySelector('.pk-title');
    const modeBtns = [...el.querySelectorAll('.af-mode-btn')];

    let timers = [];
    let drags = [];
    let curMode = 'free'; // 'free' (Pop & Parade) | 'treat' (Feed & Tickle) | 'quiz' (Who says?)
    let quiz = null;
    let shown = [];
    let paradeList = [];
    let poppedCount = 0;
    let treatAnimal = null;
    let treatCount = 0;
    let hilite = 0;
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearT = () => {
      timers.forEach(clearTimeout);
      timers = [];
      drags.forEach((d) => d.destroy());
      drags = [];
    };

    function sceneId() {
      const s = ctx.modeSettings.scene || 'farm';
      return s === 'mix' ? 'mix' : s;
    }
    function pool() {
      const s = sceneId();
      if (s === 'mix') return ANIMALS;
      const list = ANIMALS.filter((a) => a.scenes.includes(s));
      return list.length ? list : ANIMALS;
    }

    function playSound(a) {
      const urls = [];
      if (ctx.modeSettings.sounds !== 'real') {
        const take = packTakeUrl('anisnd_' + a.id);
        if (take) urls.push(take);
      }
      urls.push(`audio/animals/${a.id}.m4a`);
      sayUrls(a.sound, urls, { pitch: 1 });
    }
    function sayName(a, queued = true) {
      say(a.name, { clip: 'ani_' + a.id, queue: queued });
    }

    function showBanner(a, line) {
      setArt(bEmoji, a.emoji);
      bName.textContent = a.name + '!';
      bTitle.textContent = line || '';
      bTitle.style.display = line ? '' : 'none';
      banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show');
      T(() => banner.classList.remove('show'), 2400);
    }

    function syncModeButtons() {
      modeBtns.forEach((b) => b.classList.toggle('on', b.dataset.m === curMode));
    }

    modeBtns.forEach((b) => b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      audio();
      playSfx('pop');
      curMode = b.dataset.m;
      ctx.modeSettings.game = curMode;
      switchMode(curMode);
    }));

    promptEl.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      audio();
      if (quiz && quiz.target) {
        playSfx('pop');
        say(`Who says ${quiz.target.sound}?`, { clip: 'aniq_' + quiz.target.id });
      }
    });

    function pickShown(n) {
      const p = [...pool()];
      shown = [];
      if (quiz && !p.includes(quiz.target)) p.splice(Math.floor(Math.random() * p.length), 1, quiz.target);
      while (shown.length < n && p.length) {
        const a = p.splice(Math.floor(Math.random() * p.length), 1)[0];
        if (!shown.includes(a)) shown.push(a);
      }
    }

    // ==================== MODE 1: POP & PARADE ====================
    function spawnBubble(a, i, total) {
      const fr = field.getBoundingClientRect();
      const vmin = Math.min(innerWidth, innerHeight) / 100;
      const cell = 24 * vmin;
      const cols = Math.max(2, Math.min(total, Math.floor(fr.width / cell)));
      const rows = Math.ceil(total / cols);
      const cellH = rows > 1 ? Math.min(cell, (fr.height * 0.78) / rows) : cell;
      const col = i % cols, row = Math.floor(i / cols);
      const rowN = row === rows - 1 ? total - row * cols : cols;
      const rowW = rowN * cell;
      const x = (fr.width - rowW) / 2 + col * cell + cell / 2;
      const y = Math.min(fr.height * 0.72, cellH * 0.52 + row * cellH + rnd(-1, 1) * vmin);

      const d = document.createElement('div');
      d.className = 'af-ani af-bubble';
      d.dataset.id = a.id;
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      d.style.setProperty('--bc', BUB_COLORS[i % BUB_COLORS.length]);
      d.style.animationDelay = (i * -0.45) + 's';
      d.innerHTML = `<span class="af-bub-ring"></span><span class="af-emoji" data-art="${a.emoji}">${artHtml(a.emoji)}</span><span class="af-label">${a.name}</span>`;
      d.addEventListener('click', () => popBubble(d, a, i, total));
      field.appendChild(d);
      a._el = d;
    }

    function popBubble(d, a, slotIdx, total) {
      if (d.classList.contains('popping')) return;
      audio();
      d.classList.add('popping');
      const r = d.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      playSfx('pop');
      sparkleBurst(cx, cy, 8);
      confettiBurst(el, cx - el.getBoundingClientRect().left, cy - el.getBoundingClientRect().top);
      playSound(a);
      sayName(a, true);
      showBanner(a, `${a.sound.toUpperCase()}! The ${a.name.toLowerCase()} says ${a.sound}!`);

      poppedCount++;
      setArt(starsEl, '⭐'.repeat(poppedCount % 5 || (poppedCount > 0 ? 5 : 0)));
      addToParade(a);

      // Every 5th pop -> Big Animal Parade Dance!
      if (poppedCount % 5 === 0) {
        T(() => {
          playSfx('fanfare', { overlay: true });
          parade.querySelectorAll('.af-parade-item').forEach((pi) => {
            pi.classList.remove('party'); void pi.offsetWidth; pi.classList.add('party');
          });
          confettiBurst(el, innerWidth * 0.3, innerHeight * 0.5);
          confettiBurst(el, innerWidth * 0.7, innerHeight * 0.5);
        }, 450);
      }

      // Respawn a fresh animal bubble in this spot
      T(() => {
        if (curMode !== 'free') return;
        d.remove();
        const nextA = rand(pool());
        shown[slotIdx] = nextA;
        spawnBubble(nextA, slotIdx, total);
      }, 420);
    }

    function addToParade(a) {
      if (paradeList.length >= 6) {
        paradeList.shift();
        if (parade.firstElementChild) parade.firstElementChild.remove();
      }
      paradeList.push(a);
      const p = document.createElement('button');
      p.className = 'af-parade-item';
      const hat = rand(HATS);
      p.innerHTML = `<span class="af-hat">${artHtml(hat)}</span><span class="af-p-art" data-art="${a.emoji}">${artHtml(a.emoji)}</span>`;
      p.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        audio();
        p.classList.remove('bounce'); void p.offsetWidth; p.classList.add('bounce');
        const newHat = rand(HATS);
        setArt(p.querySelector('.af-hat'), newHat);
        const r = p.getBoundingClientRect();
        sparkleBurst(r.left + r.width / 2, r.top, 6);
        playSfx('boing');
        playSound(a);
        say(`The ${a.name.toLowerCase()} says ${a.sound}!`, { clip: 'anisay_' + a.id, queue: true });
      });
      parade.appendChild(p);
    }

    function startPopMode() {
      quiz = null;
      promptEl.hidden = true;
      parade.hidden = false;
      parade.innerHTML = '';
      paradeList = [];
      poppedCount = 0;
      starsEl.innerHTML = '';
      const s = sceneId();
      el.className = 'screen active ' + SCENE_DECO[s].cls;
      field.innerHTML = '';
      const count = Math.min(6, pool().length);
      pickShown(count);
      shown.forEach((a, i) => spawnBubble(a, i, shown.length));
      // Seed 2 friendly animals on the trampoline parade bar right away
      addToParade(shown[0]);
      if (shown[1]) addToParade(shown[1]);
      hilite = 0;
      markHilite();
    }

    // ==================== MODE 2: FEED & TICKLE PET ====================
    function startTreatMode() {
      quiz = null;
      promptEl.hidden = true;
      parade.hidden = false;
      starsEl.innerHTML = '';
      const s = sceneId();
      el.className = 'screen active ' + SCENE_DECO[s].cls;
      const p = pool();
      if (!treatAnimal || !p.includes(treatAnimal)) treatAnimal = rand(p);
      treatCount = 0;
      renderTreatStage();
    }

    function renderTreatStage() {
      clearT();
      field.innerHTML = '';
      parade.innerHTML = '';
      const a = treatAnimal;
      const stageWrap = document.createElement('div');
      stageWrap.className = 'af-pet-stage';
      stageWrap.innerHTML = `
        <button class="af-pet-nav prev" aria-label="Previous animal">◀</button>
        <div class="af-ani af-pet" id="af-pet" data-id="${a.id}">
          <span class="af-pet-hat" id="af-pet-hat"></span>
          <span class="af-emoji" data-art="${a.emoji}">${artHtml(a.emoji)}</span>
          <span class="af-pet-name">${a.name} · "${a.sound}!"</span>
          <span class="af-trampoline"></span>
        </div>
        <button class="af-pet-nav next" aria-label="Next animal">▶</button>`;
      field.appendChild(stageWrap);
      shown = [a];
      const petEl = stageWrap.querySelector('#af-pet');
      const hatEl = stageWrap.querySelector('#af-pet-hat');
      a._el = petEl;

      // Tap the big pet -> tickle, jump on trampoline, put on a funny hat, make animal noise!
      petEl.addEventListener('click', (e) => {
        audio();
        petEl.classList.remove('flip', 'hop');
        void petEl.offsetWidth;
        petEl.classList.add('hop');
        setArt(hatEl, rand(HATS));
        const r = petEl.getBoundingClientRect();
        sparkleBurst(r.left + r.width / 2, r.top + r.height * 0.3, 7);
        playSfx('boing');
        playSound(a);
        sayName(a, true);
        showBanner(a, `The ${a.name.toLowerCase()} says ${a.sound}!`);
      });

      const cyclePet = (dir) => {
        audio();
        playSfx('pop');
        const p = pool();
        const idx = Math.max(0, p.indexOf(treatAnimal));
        treatAnimal = p[(idx + dir + p.length) % p.length];
        treatCount = 0;
        renderTreatStage();
        playSound(treatAnimal);
        sayName(treatAnimal, true);
      };
      stageWrap.querySelector('.prev').addEventListener('click', () => cyclePet(-1));
      stageWrap.querySelector('.next').addEventListener('click', () => cyclePet(1));

      // 4 draggable & tappable treats along the bottom bar
      const picks = [...TREATS].sort(() => Math.random() - 0.5).slice(0, 4);
      picks.forEach((em) => {
        const tb = document.createElement('div');
        tb.className = 'af-treat';
        tb.innerHTML = `<span class="af-treat-plate" data-art="${em}">${artHtml(em)}</span>`;
        parade.appendChild(tb);

        const feedPet = () => {
          if (tb.classList.contains('eaten')) return;
          tb.classList.add('eaten');
          audio();
          treatCount++;
          const pr = petEl.getBoundingClientRect();
          const cx = pr.left + pr.width / 2, cy = pr.top + pr.height * 0.42;
          flyFromDrop(tb, cx, cy, { scale: 0.15, ms: 260, fade: true });
          playSfx('crunch');
          sparkleBurst(cx, cy, 8);
          petEl.classList.remove('hop', 'flip');
          void petEl.offsetWidth;
          petEl.classList.add('flip');
          setArt(hatEl, rand(HATS));
          T(() => {
            playSound(a);
            say(`The ${a.name.toLowerCase()} says ${a.sound}!`, { clip: 'anisay_' + a.id, queue: true });
            showBanner(a, `Yum! The ${a.name.toLowerCase()} says ${a.sound}!`);
          }, 260);
          if (treatCount % 3 === 0) {
            T(() => {
              confettiBurst(el, cx - el.getBoundingClientRect().left, cy - el.getBoundingClientRect().top);
              playSfx('fanfare', { overlay: true });
            }, 500);
          }
          T(() => {
            tb.style.transform = '';
            tb.style.opacity = '';
            tb.style.transition = '';
            tb.classList.remove('eaten');
          }, 900);
        };

        tb.addEventListener('click', feedPet);
        const drag = makeDraggable(tb, {
          zones: () => [petEl],
          onDrop: (el2, zone) => {
            if (zone) { feedPet(); return true; }
            return false;
          },
        });
        drags.push(drag);
      });
    }

    // ==================== MODE 3: WHO SAYS...? QUIZ ====================
    function layoutQuiz() {
      const s = sceneId();
      el.className = 'screen active ' + SCENE_DECO[s].cls;
      field.innerHTML = '';
      parade.hidden = true;
      const n = shown.length;
      const fr = field.getBoundingClientRect();
      const vmin = Math.min(innerWidth, innerHeight) / 100;
      const cell = 26 * vmin;
      const cols = Math.max(1, Math.min(n, Math.floor(fr.width / cell)));
      const rows = Math.ceil(n / cols);
      const cellH = rows > 1 ? Math.min(cell, fr.height / rows) : cell;
      shown.forEach((a, i) => {
        const d = document.createElement('div');
        d.className = 'af-ani af-quiz-card';
        d.dataset.id = a.id;
        const col = i % cols, row = Math.floor(i / cols);
        const rowN = row === rows - 1 ? n - row * cols : cols;
        const rowW = rowN * cell;
        const x = (fr.width - rowW) / 2 + col * cell + cell / 2;
        const y = Math.min(fr.height - cellH / 2, cellH / 2 + row * cellH);
        d.style.left = x + 'px';
        d.style.top = y + 'px';
        d.innerHTML = `<span class="af-emoji" data-art="${a.emoji}">${artHtml(a.emoji)}</span><span class="af-label">${a.name}</span><span class="af-shadow"></span>`;
        d.addEventListener('click', () => tapQuiz(d, a));
        field.appendChild(d);
        a._el = d;
      });
      hilite = 0;
      markHilite();
    }

    function markHilite() {
      field.querySelectorAll('.af-ani').forEach((d, i) => d.classList.toggle('hilite', i === hilite));
    }

    function tapQuiz(d, a) {
      if (!quiz || quiz.locked) return;
      audio();
      const r = d.getBoundingClientRect();
      sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 6);
      if (a === quiz.target) {
        quiz.locked = true;
        quiz.wrong = 0;
        quiz.streak++;
        setArt(starsEl, '⭐'.repeat(quiz.streak % 5 || 5));
        d.classList.remove('hop'); void d.offsetWidth; d.classList.add('hop');
        playSfx('ding');
        confettiBurst(el, d.offsetLeft + d.offsetWidth / 2, d.offsetTop);
        playSound(a);
        say(`The ${a.name.toLowerCase()} says ${a.sound}!`, { clip: 'anisay_' + a.id, queue: true });
        showBanner(a, `The ${a.name.toLowerCase()} says ${a.sound}!`);
        T(newQuizRound, 2400);
      } else {
        quiz.wrong++;
        playSfx('boing');
        d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake');
        playSound(a);
        if (quiz.wrong >= 2 && quiz.target._el) quiz.target._el.classList.add('hint');
      }
    }

    function newQuizRound() {
      const streak = quiz.streak;
      const n = streak >= 8 ? 6 : (streak >= 3 ? 4 : 3);
      quiz.wrong = 0;
      quiz.locked = false;
      const p = pool();
      quiz.target = rand(p);
      pickShown(n);
      if (!shown.includes(quiz.target)) shown[Math.floor(Math.random() * shown.length)] = quiz.target;
      layoutQuiz();
      promptEl.hidden = false;
      promptTxt.textContent = `Who says "${quiz.target.sound}"?`;
      say(`Who says ${quiz.target.sound}?`, { clip: 'aniq_' + quiz.target.id });
    }

    function startQuiz() {
      quiz = { target: null, wrong: 0, streak: 0, locked: false };
      starsEl.innerHTML = '';
      newQuizRound();
    }

    function switchMode(m) {
      clearT();
      banner.classList.remove('show');
      curMode = m === 'quiz' ? 'quiz' : (m === 'treat' ? 'treat' : 'free');
      syncModeButtons();
      if (curMode === 'quiz') startQuiz();
      else if (curMode === 'treat') startTreatMode();
      else startPopMode();
    }

    this._start = () => {
      clearT();
      say('', { clip: 'farm_intro' });
      switchMode(ctx.modeSettings.game || 'free');
    };
    this._suspend = () => { clearT(); };
    this._onKey = (e) => {
      const els = [...field.querySelectorAll('.af-ani')];
      if (!els.length) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { hilite = (hilite + 1) % els.length; markHilite(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { hilite = (hilite - 1 + els.length) % els.length; markHilite(); }
      else if (e.key === 'Enter' || e.key === ' ') els[hilite].click();
      else if (/^[a-zA-Z]$/.test(e.key)) {
        const a = shown.find((x) => x.name.toLowerCase().startsWith(e.key.toLowerCase()));
        if (a && a._el) a._el.click();
        else els[Math.floor(Math.random() * els.length)].click();
      }
    };
  },

  enter() { this._start(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
