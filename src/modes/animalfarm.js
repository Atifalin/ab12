import { ANIMALS } from '../content.js';
import { sayUrls, packTakeUrl } from '../core/voice.js';
import { rand, rnd } from '../core/util.js';

// ---------- animal farm ----------
const SCENE_DECO = {
  farm: { cls: 'af-farm', deco: ['🏡', '🌾', '🚜'], prompt: 'The farm' },
  zoo: { cls: 'af-zoo', deco: ['🎪', '🌳', '🎈'], prompt: 'The zoo' },
  sea: { cls: 'af-sea', deco: ['🌊', '⛵', '🐚'], prompt: 'The sea' },
  jungle: { cls: 'af-jungle', deco: ['🌴', '🍃', '🌺'], prompt: 'The jungle' },
  mix: { cls: 'af-mix', deco: ['🌍', '🌈', '⭐'], prompt: 'Everywhere' },
};

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
      options: [{ value: 'free', label: 'Free play' }, { value: 'quiz', label: 'Who says…?' }] },
    { key: 'sounds', label: 'Animal sounds', type: 'seg', default: 'family',
      options: [{ value: 'family', label: 'Family voice when recorded' }, { value: 'real', label: 'Real only' }] },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="af-sky"></div>
      <div class="af-hills"><i></i><i></i><i></i></div>
      <div class="af-deco" id="af-deco"></div>
      <div class="af-ground"></div>
      <div class="af-animals" id="af-animals"></div>
      <div class="pk-banner wm-banner af-banner" id="af-banner">
        <span class="pk-emoji"></span>
        <span class="pk-lines"><span class="pk-name"></span><span class="pk-title"></span></span>
      </div>
      <div class="af-prompt" id="af-prompt" hidden></div>`;
    const { say, playSfx, effects } = ctx;
    const { sparkleBurst, confettiBurst } = effects;
    const field = el.querySelector('#af-animals');
    const deco = el.querySelector('#af-deco');
    const promptEl = el.querySelector('#af-prompt');
    const banner = el.querySelector('#af-banner');
    const bEmoji = banner.querySelector('.pk-emoji');
    const bName = banner.querySelector('.pk-name');
    const bTitle = banner.querySelector('.pk-title');

    let timers = [];
    let animals = [];
    let quiz = null;   // { target, wrong, streak }
    let shown = [];
    let hilite = 0;
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearT = () => { timers.forEach(clearTimeout); timers = []; };

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
      // session voice pack take ("Daddy moo") > real CC0 file > TTS noise word
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
      bEmoji.textContent = a.emoji;
      bName.textContent = a.name + '!';
      bTitle.textContent = line || '';
      bTitle.style.display = line ? '' : 'none';
      banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show');
      T(() => banner.classList.remove('show'), 2600);
    }

    function pickShown(n) {
      const p = [...pool()];
      shown = [];
      if (quiz && !p.includes(quiz.target)) p.splice(Math.floor(Math.random() * p.length), 1, quiz.target);
      while (shown.length < n && p.length) {
        const a = p.splice(Math.floor(Math.random() * p.length), 1)[0];
        if (!shown.includes(a)) shown.push(a);
      }
    }

    function layout() {
      const s = sceneId();
      el.className = 'screen active ' + SCENE_DECO[s].cls;
      deco.innerHTML = SCENE_DECO[s].deco.map((e) => `<span>${e}</span>`).join('');
      field.innerHTML = '';
      const n = shown.length;
      const cols = n <= 3 ? n : (n <= 6 ? 3 : 4);
      const rows = Math.ceil(n / cols);
      shown.forEach((a, i) => {
        const d = document.createElement('div');
        d.className = 'af-ani';
        d.dataset.id = a.id;
        const col = i % cols, row = Math.floor(i / cols);
        d.style.left = ((col + 0.5) / cols * 88 + rnd(-3, 3)) + '%';
        d.style.top = ((row + 0.55) / (rows + 0.4) * 82 + rnd(-2, 2)) + '%';
        d.innerHTML = `<span class="af-emoji">${a.emoji}</span><span class="af-shadow"></span>`;
        d.addEventListener('click', () => tapAnimal(d, a));
        field.appendChild(d);
        a._el = d;
      });
      hilite = 0;
      markHilite();
    }

    function markHilite() {
      field.querySelectorAll('.af-ani').forEach((d, i) => d.classList.toggle('hilite', i === hilite));
    }

    function tapAnimal(d, a) {
      d.classList.remove('hop'); void d.offsetWidth; d.classList.add('hop');
      const r = d.getBoundingClientRect();
      sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 5);
      if (quiz) return tapQuiz(d, a);
      playSound(a);
      sayName(a);
      showBanner(a, `The ${a.name.toLowerCase()} says ${a.sound}!`);
    }

    function tapQuiz(d, a) {
      if (a === quiz.target) {
        quiz.wrong = 0;
        quiz.streak++;
        playSfx('ding');
        confettiBurst(el, d.offsetLeft + d.offsetWidth / 2, d.offsetTop);
        playSound(a);
        say(`The ${a.name.toLowerCase()} says ${a.sound}!`, { clip: 'anisay_' + a.id, queue: true });
        showBanner(a, `The ${a.name.toLowerCase()} says ${a.sound}!`);
        T(newRound, 2400);
      } else {
        quiz.wrong++;
        playSfx('boing');
        d.classList.add('shake');
        T(() => d.classList.remove('shake'), 500);
        playSound(a); // the wrong animal makes its own sound — never punishing
        if (quiz.wrong >= 2 && quiz.target._el) quiz.target._el.classList.add('hint');
      }
    }

    function newRound() {
      const streak = quiz.streak;
      const n = streak >= 8 ? 6 : (streak >= 3 ? 4 : 3);
      quiz.wrong = 0;
      const p = pool();
      quiz.target = rand(p);
      pickShown(n);
      if (!shown.includes(quiz.target)) shown[Math.floor(Math.random() * shown.length)] = quiz.target;
      layout();
      promptEl.hidden = false;
      promptEl.textContent = `Who says ${quiz.target.sound}?`;
      say(`Who says ${quiz.target.sound}?`, { clip: 'aniq_' + quiz.target.id });
    }

    function startFree() {
      quiz = null;
      promptEl.hidden = true;
      pickShown(Math.min(10, pool().length));
      layout();
    }
    function startQuiz() {
      quiz = { target: null, wrong: 0, streak: 0 };
      newRound();
    }

    this._start = () => {
      clearT();
      say('', { clip: 'farm_intro' });
      if (ctx.modeSettings.game === 'quiz') startQuiz(); else startFree();
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
      }
    };
  },

  enter() { this._start(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
