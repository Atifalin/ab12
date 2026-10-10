import { SORT_SETS } from '../content.js';
import { makeDraggable } from '../core/drag.js';
import { rand, rnd } from '../core/util.js';

// ---------- sort it ----------
const SET_ORDER = { colours: 'colour', kinds: 'kind', size: 'size', where: 'where', letters: 'letters' };

export default {
  id: 'sortit',
  title: 'Sort it!',
  emoji: '🧺',
  category: 'think',
  settings: [
    { key: 'sorting', label: 'Sorting', type: 'seg', default: 'mix',
      options: [{ value: 'mix', label: 'Mix' }, { value: 'colour', label: 'Colours' },
                { value: 'kind', label: 'Kinds' }, { value: 'size', label: 'Big & small' },
                { value: 'where', label: 'Where they live' }, { value: 'letters', label: 'Letters & numbers' }] },
    { key: 'baskets', label: 'Baskets', type: 'seg', default: '2',
      options: [{ value: '2', label: '2' }, { value: '3', label: '3' }] },
    { key: 'speed', label: 'Speed', type: 'seg', default: 'normal',
      options: [{ value: 'calm', label: 'Calm' }, { value: 'normal', label: 'Normal' }] },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="sort-sky"><span class="sort-cloud">☁️</span><span class="sort-cloud c2">☁️</span></div>
      <div class="sort-prompt" id="sort-prompt"></div>
      <div class="sort-drop" id="sort-drop"></div>
      <div class="sort-baskets" id="sort-baskets"></div>`;
    const { say, playSfx, effects } = ctx;
    const { sparkleBurst, confettiBurst } = effects;
    const promptEl = el.querySelector('#sort-prompt');
    const dropEl = el.querySelector('#sort-drop');
    const basketsEl = el.querySelector('#sort-baskets');

    let timers = [];
    let drags = [];
    let queue = [];
    let baskets = [];
    let curItem = null;
    let curEl = null;
    let wrong = 0;
    let setsDone = 0;
    let busy = false;
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearT = () => { timers.forEach(clearTimeout); timers = []; };

    function pickSet() {
      const s = ctx.modeSettings.sorting || 'mix';
      if (s !== 'mix') return SORT_SETS.find((x) => x.id === s) || rand(SORT_SETS);
      return rand(SORT_SETS);
    }
    function basketCount(set) {
      const want = ctx.modeSettings.baskets === '3' || (ctx.modeSettings.baskets !== '2' && setsDone >= 3) ? 3 : 2;
      return Math.min(want, set.baskets.length);
    }

    function newRound() {
      const set = pickSet();
      const nB = basketCount(set);
      baskets = [...set.baskets].sort(() => Math.random() - 0.5).slice(0, nB);
      const bids = new Set(baskets.map((b) => b.id));
      const pool = set.items.filter((i) => bids.has(i.b)).sort(() => Math.random() - 0.5);
      queue = pool.slice(0, Math.min(pool.length, 6 + (ctx.modeSettings.speed === 'calm' ? -2 : 2)));
      if (queue.length < 4) queue = pool.slice(0, pool.length);
      wrong = 0;
      promptEl.textContent = set.prompt;
      say(set.prompt, { clip: 'sortq_' + set.id });

      basketsEl.innerHTML = '';
      for (const b of baskets) {
        const d = document.createElement('div');
        d.className = 'sort-basket';
        d.dataset.b = b.id;
        d.style.setProperty('--bc', b.color);
        d.innerHTML = `<span class="fill"></span><span class="icon">${b.icon}</span><span class="blabel">${b.label}</span>`;
        basketsEl.appendChild(d);
        b._el = d;
      }
      nextItem();
    }

    function nextItem() {
      if (!queue.length) return setDone();
      curItem = queue.shift();
      wrong = 0;
      dropEl.innerHTML = '';
      const d = document.createElement('div');
      d.className = 'sort-item' + (/^[A-Z0-9]$/.test(curItem.emoji) ? ' sort-glyph' : '');
      d.textContent = curItem.emoji;
      dropEl.appendChild(d);
      curEl = d;
      // drop-in bounce
      d.classList.add('dropping');
      const calm = ctx.modeSettings.speed === 'calm';
      T(() => d.classList.remove('dropping'), calm ? 900 : 550);
      const drag = makeDraggable(d, {
        zones: () => [...basketsEl.children],
        onDrop: (el, zone) => {
          if (zone && zone.dataset.b === curItem.b) {
            accept(zone);
            return true;
          }
          reject();
          return false;
        },
      });
      drags.push(drag);
    }

    function accept(zone) {
      busy = true;
      playSfx('ding');
      zone.classList.add('wiggle');
      T(() => zone.classList.remove('wiggle'), 600);
      const bk = baskets.find((x) => x._el === zone);
      bk._fill = Math.min(85, (bk._fill || 8) + 14);
      zone.querySelector('.fill').style.height = bk._fill + '%';
      const sr = zone.getBoundingClientRect(), mr = curEl.getBoundingClientRect();
      curEl.style.transition = 'transform .3s ease, opacity .3s';
      curEl.style.transform = `translate(${sr.left + sr.width / 2 - (mr.left + mr.width / 2)}px, ${sr.top + sr.height * 0.6 - (mr.top + mr.height / 2)}px) scale(.4)`;
      curEl.style.opacity = '0';
      const item = curItem;
      say('', { clip: 'sorti_' + item.id });
      const b = baskets.find((x) => x.id === item.b);
      say(b.label, { clip: 'sortb_' + b.id, queue: true });
      T(() => { drags.forEach((x) => x.destroy()); drags = []; nextItem(); busy = false; }, 1300);
    }

    function reject() {
      wrong++;
      playSfx('boing');
      say('', { clip: 'sort_try' });
      if (wrong >= 2) {
        const right = baskets.find((b) => b.id === curItem.b);
        if (right) right._el.classList.add('hint');
        T(() => right && right._el.classList.remove('hint'), 1600);
      }
    }

    function sendTo(i) {
      if (busy || !curItem || !curEl) return;
      const zone = basketsEl.children[i];
      if (!zone) return;
      if (zone.dataset.b === curItem.b) accept(zone);
      else {
        reject();
        curEl.classList.add('giggle');
        T(() => curEl && curEl.classList.remove('giggle'), 500);
      }
    }

    function setDone() {
      busy = true;
      basketsEl.querySelectorAll('.sort-basket').forEach((b) => b.classList.add('dance'));
      const r = basketsEl.getBoundingClientRect();
      confettiBurst(el, r.width / 2, r.top);
      playSfx('fanfare');
      say('', { clip: 'sort_done' });
      setsDone++;
      T(() => { basketsEl.querySelectorAll('.dance').forEach((b) => b.classList.remove('dance')); newRound(); busy = false; }, 2600);
    }

    this._start = () => {
      clearT();
      drags.forEach((d) => d.destroy());
      drags = [];
      setsDone = 0;
      say('', { clip: 'sort_intro' });
      newRound();
    };
    this._suspend = () => {
      clearT();
      drags.forEach((d) => d.destroy());
      drags = [];
    };
    this._onKey = (e) => {
      if (['1', '2', '3'].includes(e.key)) sendTo(+e.key - 1);
    };
  },

  enter() { this._start(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
