import { FEED_FOODS } from '../content.js';
import { makeDraggable, flyFromDrop } from '../core/drag.js';
import { rand, rnd } from '../core/util.js';
import { setArt } from '../core/art.js';

// ---------- feed the monster ----------
const MON_COLORS = { purple: '#a78bfa', green: '#6fd98a', blue: '#6fb8ff', pink: '#ff9fc7' };
const COUNTS = { two: 2, three: 3, four: 4, five: 5 };

export default {
  id: 'feed',
  title: 'Feed the Monster',
  emoji: '😋',
  category: 'think',
  settings: [
    { key: 'asks', label: 'Asks for', type: 'seg', default: 'mix',
      options: [{ value: 'mix', label: 'Mix' }, { value: 'letter', label: 'First letter' },
                { value: 'colour', label: 'Colour' }, { value: 'counting', label: 'Counting' }] },
    { key: 'choices', label: 'Choices', type: 'seg', default: '3',
      options: [{ value: '3', label: '3' }, { value: '4', label: '4' }] },
    { key: 'colour', label: 'Monster colour', type: 'seg', default: 'random',
      options: [{ value: 'random', label: 'Random' }, { value: 'purple', label: 'Purple' },
                { value: 'green', label: 'Green' }, { value: 'blue', label: 'Blue' },
                { value: 'pink', label: 'Pink' }] },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="feed-bubble" id="feed-bubble"><span id="feed-say"></span></div>
      <div class="feed-mon" id="feed-mon">
        <span class="fhorn fh1"></span><span class="fhorn fh2"></span>
        <span class="fcheek fc1"></span><span class="fcheek fc2"></span>
        <div class="feed-eyes"><span class="feye"><i></i></span><span class="feye"><i></i></span></div>
        <div class="feed-mouth" id="feed-mouth"><span class="ftooth ft1"></span><span class="ftooth ft2"></span><span class="ftongue"></span></div>
        <div class="feed-tummy" id="feed-tummy"></div>
        <span class="ffoot ff1"></span><span class="ffoot ff2"></span>
      </div>
      <div class="feed-table" id="feed-table"></div>
      <div class="feed-count" id="feed-count"></div>`;
    const { say, playSfx, effects } = ctx;
    const { sparkleBurst, confettiBurst } = effects;
    const mon = el.querySelector('#feed-mon');
    const mouth = el.querySelector('#feed-mouth');
    const tummy = el.querySelector('#feed-tummy');
    const sayEl = el.querySelector('#feed-say');
    const table = el.querySelector('#feed-table');
    const countEl = el.querySelector('#feed-count');

    let timers = [];
    let drags = [];
    let items = [];
    let request = null;  // {kind:'letter'|'colour'|'count', value, left}
    let wrong = 0;
    let fed = 0;
    let busy = false;
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearT = () => { timers.forEach(clearTimeout); timers = []; };

    function monColor() {
      const c = ctx.modeSettings.colour || 'random';
      const col = c === 'random' ? rand(Object.keys(MON_COLORS)) : c;
      mon.style.setProperty('--mc', MON_COLORS[col] || MON_COLORS.purple);
    }

    // eyes follow pointer
    function trackEyes(e) {
      const pr = mon.getBoundingClientRect();
      const cx = pr.left + pr.width / 2, cy = pr.top + pr.height * 0.32;
      const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (pr.width / 2)));
      const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (pr.height / 2)));
      mon.querySelectorAll('.feye i').forEach((p) => {
        p.style.transform = `translate(${dx * 45}%, ${dy * 45}%)`;
      });
    }
    function nearMouth(x, y) {
      const mr = mouth.getBoundingClientRect();
      return Math.hypot(x - (mr.left + mr.width / 2), y - (mr.top + mr.height / 2)) < mr.width * 2.2;
    }
    el.addEventListener('pointermove', trackEyes);

    function pickRequest() {
      const kind = ctx.modeSettings.asks === 'mix' ? rand(['letter', 'colour', 'counting']) : (ctx.modeSettings.asks || 'letter');
      if (kind === 'letter') {
        const have = new Set(items.map((i) => i.name[0]));
        const ch = rand([...have]);
        request = { kind, value: ch };
        sayEl.textContent = `I want something that starts with ${ch.toUpperCase()}!`;
        say('', { clip: 'feedq_l_' + ch });
      } else if (kind === 'colour') {
        const have = new Set(items.map((i) => i.color));
        const c = rand([...have]);
        request = { kind, value: c };
        sayEl.textContent = `Feed me something ${c}!`;
        say('', { clip: 'feedq_c_' + c });
      } else {
        const n = 2 + Math.floor(Math.random() * 3);
        request = { kind: 'counting', value: n, left: n };
        sayEl.textContent = `Feed me ${['', 'one', 'two', 'three', 'four', 'five'][n]}!`;
        say('', { clip: 'feedq_n_' + n });
        countEl.textContent = '0 / ' + n;
      }
    }

    function isRight(item) {
      if (request.kind === 'letter') return item.name[0] === request.value;
      if (request.kind === 'colour') return item.color === request.value;
      return true; // counting: any food counts
    }

    function buildItems() {
      table.innerHTML = '';
      drags.forEach((d) => d.destroy());
      drags = [];
      const n = ctx.modeSettings.choices === '4' ? 4 : 3;
      items = [...FEED_FOODS].sort(() => Math.random() - 0.5).slice(0, n);
      items.forEach((f, i) => {
        const d = document.createElement('div');
        d.className = 'feed-food';
        d.dataset.id = f.id;
        const sp = document.createElement('span');
        sp.className = 'feed-plate';
        setArt(sp, f.emoji);
        d.appendChild(sp);
        table.appendChild(d);
        f._el = d;
        const drag = makeDraggable(d, {
          zones: () => [mon],
          onMove: (el, x, y) => mouth.classList.toggle('open', nearMouth(x, y)),
          onDrop: (el, zone) => {
            mouth.classList.remove('open');
            if (zone && isRight(f)) { eat(f, d); return true; }
            reject(d);
            return false;
          },
        });
        drags.push(drag);
      });
    }

    function eat(f, d) {
      busy = true;
      fed++;
      d.classList.add('eaten');
      const mr = mouth.getBoundingClientRect();
      flyFromDrop(d, mr.left + mr.width / 2, mr.top + mr.height / 2, { scale: 0.1, ms: 280, fade: true });
      mon.classList.add('chomp');
      T(() => { mon.classList.remove('chomp'); d.style.display = 'none'; }, 500);
      // crumbs
      for (let i = 0; i < 4; i++) {
        const c = document.createElement('span');
        c.className = 'feed-crumb';
        c.style.left = mr.left - mon.getBoundingClientRect().left + rnd(-30, 30) + 'px';
        c.style.top = mr.top - mon.getBoundingClientRect().top + 'px';
        mon.appendChild(c);
        T(() => c.remove(), 800);
      }
      playSfx('chomp');
      T(() => playSfx('burp'), 600);
      say('', { clip: 'feed_yum' + (1 + Math.floor(Math.random() * 3)) });
      tummy.style.transform = `scale(${Math.min(1.5, 1 + fed * 0.08)})`;
      if (request.kind === 'counting') {
        request.left--;
        countEl.textContent = (request.value - request.left) + ' / ' + request.value;
        say(String(request.value - request.left), { clip: 'num_' + (request.value - request.left), queue: true });
        if (request.left > 0) {
          // respawn the same food on the table
          T(() => { d.style.display = ''; d.style.transform = ''; d.style.opacity = ''; d.classList.remove('eaten'); busy = false; }, 700);
          return;
        }
      }
      wrong = 0;
      if (fed % 5 === 0) {
        mon.classList.add('dance');
        const r = mon.getBoundingClientRect();
        confettiBurst(el, r.left - el.getBoundingClientRect().left + r.width / 2, r.top);
        say('', { clip: 'feed_dance', queue: true });
        T(() => mon.classList.remove('dance'), 1800);
      }
      T(() => { buildItems(); pickRequest(); busy = false; }, 2200);
    }

    function reject(d) {
      wrong++;
      playSfx('boing');
      mon.classList.add('blech');
      T(() => mon.classList.remove('blech'), 700);
      say('', { clip: 'feed_blech' });
      if (wrong >= 2) {
        const right = items.find(isRight);
        if (right && right._el) { right._el.classList.add('wiggle'); T(() => right._el && right._el.classList.remove('wiggle'), 1400); }
      }
    }

    function feedByIndex(i) {
      if (busy) return;
      const f = items[i];
      if (!f || !f._el || f._el.style.display === 'none') return;
      if (isRight(f)) eat(f, f._el);
      else reject(f._el);
    }
    function feedByLetter(ch) {
      if (busy) return;
      const f = items.find((x) => x.name[0] === ch && x._el && x._el.style.display !== 'none');
      if (f) { if (isRight(f)) eat(f, f._el); else reject(f._el); }
    }

    this._start = () => {
      clearT();
      drags.forEach((d) => d.destroy());
      drags = [];
      fed = 0; wrong = 0; busy = false;
      tummy.style.transform = '';
      monColor();
      say('', { clip: 'feed_intro' });
      buildItems();
      pickRequest();
    };
    this._suspend = () => {
      clearT();
      drags.forEach((d) => d.destroy());
      drags = [];
    };
    this._onKey = (e) => {
      if (/^[1-4]$/.test(e.key)) feedByIndex(+e.key - 1);
      else if (/^[a-zA-Z]$/.test(e.key)) feedByLetter(e.key.toLowerCase());
    };
  },

  enter() { this._start(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
