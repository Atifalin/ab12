import { SORT_SETS } from '../content.js';
import { makeDraggable, flyFromDrop } from '../core/drag.js';
import { rand, rnd } from '../core/util.js';
import { setArt, artHtml } from '../core/art.js';

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
      <div class="sort-sky"><span class="sort-cloud" data-art="☁️">${artHtml('☁️')}</span><span class="sort-cloud c2" data-art="☁️">${artHtml('☁️')}</span></div>
      <div class="sort-stars" id="sort-stars"></div>
      <button class="sort-prompt" id="sort-prompt" aria-label="Hear prompt"></button>
      <div class="sort-drop" id="sort-drop"></div>
      <div class="sort-baskets" id="sort-baskets"></div>`;
    const { say, playSfx, effects, audio } = ctx;
    const { sparkleBurst, confettiBurst } = effects;
    const starsEl = el.querySelector('#sort-stars');
    const promptEl = el.querySelector('#sort-prompt');
    const dropEl = el.querySelector('#sort-drop');
    const basketsEl = el.querySelector('#sort-baskets');

    // Basket googly eyes track pointer/dragged item
    el.addEventListener('pointermove', (e) => {
      basketsEl.querySelectorAll('.sb-eye i').forEach((p) => {
        const r = p.parentElement.getBoundingClientRect();
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 140));
        const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 140));
        p.style.transform = `translate(${dx * 42}%, ${dy * 42}%)`;
      });
    });

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
      starsEl.innerHTML = '';
      promptEl.textContent = set.prompt;
      promptEl.onclick = () => { audio(); playSfx('pop'); say(set.prompt, { clip: 'sortq_' + set.id }); };
      say(set.prompt, { clip: 'sortq_' + set.id });

      basketsEl.innerHTML = '';
      for (const b of baskets) {
        const d = document.createElement('div');
        d.className = 'sort-basket';
        d.dataset.b = b.id;
        d.style.setProperty('--bc', b.color);
        d.innerHTML = `
          <div class="sb-eyes"><span class="sb-eye"><i></i></span><span class="sb-eye"><i></i></span></div>
          <span class="fill"></span>
          <div class="sb-items"></div>
          <span class="icon" data-art="${b.icon}">${artHtml(b.icon)}</span>
          <span class="blabel">${b.label}</span>`;
        d.addEventListener('click', () => {
          audio();
          d.classList.remove('wiggle'); void d.offsetWidth; d.classList.add('wiggle');
          playSfx('pop');
          say(b.label, { clip: 'sortb_' + b.id });
        });
        basketsEl.appendChild(d);
        b._el = d;
        b._count = 0;
      }
      nextItem();
    }

    function nextItem() {
      if (!queue.length) return setDone();
      curItem = queue.shift();
      wrong = 0;
      dropEl.innerHTML = '';
      const d = document.createElement('div');
      const isGlyph = /^[A-Z0-9]$/.test(curItem.emoji);
      d.className = 'sort-item' + (isGlyph ? ' sort-glyph' : '');
      if (isGlyph) d.textContent = curItem.emoji;
      else setArt(d, curItem.emoji);
      d.addEventListener('click', () => {
        audio();
        d.classList.remove('giggle'); void d.offsetWidth; d.classList.add('giggle');
        const r = d.getBoundingClientRect();
        sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 5);
        playSfx('pop');
        say('', { clip: 'sorti_' + curItem.id });
      });
      dropEl.appendChild(d);
      curEl = d;
      // drop-in bounce
      d.classList.add('dropping');
      const calm = ctx.modeSettings.speed === 'calm';
      T(() => d.classList.remove('dropping'), calm ? 900 : 550);
      const drag = makeDraggable(d, {
        zones: () => [...basketsEl.children],
        onPick: () => {
          audio();
          playSfx('pop');
          say('', { clip: 'sorti_' + curItem.id });
        },
        onMove: (el2, x, y, zone) => {
          [...basketsEl.children].forEach((z) => z.classList.toggle('hover', z === zone));
        },
        onDrop: (el, zone) => {
          [...basketsEl.children].forEach((z) => z.classList.remove('hover'));
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
      bk._fill = Math.min(85, (bk._fill || 8) + 16);
      bk._count = (bk._count || 0) + 1;
      zone.querySelector('.fill').style.height = bk._fill + '%';
      const sr = zone.getBoundingClientRect();
      sparkleBurst(sr.left + sr.width / 2, sr.top + sr.height * 0.4, 7);
      flyFromDrop(curEl, sr.left + sr.width / 2, sr.top + sr.height * 0.55, { scale: 0.35, ms: 280, fade: true });
      const item = curItem;
      // Add a visible mini-item inside the basket!
      T(() => {
        const sbItems = zone.querySelector('.sb-items');
        if (sbItems) {
          const mini = document.createElement('span');
          mini.className = 'sb-mini';
          if (/^[A-Z0-9]$/.test(item.emoji)) mini.textContent = item.emoji;
          else setArt(mini, item.emoji);
          sbItems.appendChild(mini);
        }
      }, 240);
      const totalSorted = baskets.reduce((s, x) => s + (x._count || 0), 0);
      setArt(starsEl, '⭐'.repeat(Math.min(8, totalSorted)));
      say('', { clip: 'sorti_' + item.id });
      const b = baskets.find((x) => x.id === item.b);
      say(b.label, { clip: 'sortb_' + b.id, queue: true });
      T(() => { drags.forEach((x) => x.destroy()); drags = []; nextItem(); busy = false; }, 1250);
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
