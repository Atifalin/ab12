import { FEED_FOODS } from '../content.js';
import { makeDraggable, flyFromDrop } from '../core/drag.js';
import { rand, rnd } from '../core/util.js';
import { setArt, artHtml } from '../core/art.js';
import { packTakeUrl } from '../core/voice.js';

// ---------- feed the monster (turned up to 11!) ----------
const MON_COLORS = { purple: '#a78bfa', green: '#6fd98a', blue: '#6fb8ff', pink: '#ff9fc7' };
const CRUMB_COLORS = {
  red: ['#ff4d6d', '#ff85a1', '#ffd23f'],
  yellow: ['#ffd23f', '#ffe94d', '#ff9f1c'],
  green: ['#4cd964', '#80ed99', '#d8f3dc'],
  orange: ['#ff922b', '#ff7b00', '#ffd8a8'],
  white: ['#ffffff', '#fff3b0', '#f4a261'],
  purple: ['#9c5cff', '#c77dff', '#ffc6ff'],
  pink: ['#ff5c8a', '#ff9ebb', '#ffd23f'],
};
const SLURP_IDS = new Set(['juice', 'milk', 'noodles', 'icecream', 'honey', 'watermelon']);

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
      <button class="feed-bubble" id="feed-bubble" aria-label="Hear request again">
        <span class="feed-spk">${artHtml('speaker')}</span>
        <span id="feed-say"></span>
      </button>
      <div class="feed-mon" id="feed-mon">
        <span class="ftuft" id="feed-tuft"></span>
        <span class="fhorn fh1" data-zone="head"></span><span class="fhorn fh2" data-zone="head"></span>
        <span class="farm fa1"></span><span class="farm fa2"></span>
        <span class="fcheek fc1"></span><span class="fcheek fc2"></span>
        <div class="feed-brows"><span class="fbrow fb1"></span><span class="fbrow fb2"></span></div>
        <div class="feed-eyes" data-zone="head"><span class="feye"><i></i></span><span class="feye"><i></i></span></div>
        <div class="feed-mouth" id="feed-mouth" data-zone="mouth">
          <span class="ftooth ft1"></span><span class="ftooth ft2"></span>
          <span class="ftooth ftb1"></span><span class="ftooth ftb2"></span>
          <span class="ftongue"></span>
        </div>
        <div class="feed-tummy" id="feed-tummy" data-zone="tummy">
          <div class="feed-tummy-items" id="feed-tummy-items"></div>
        </div>
        <span class="ffoot ff1" data-zone="foot"></span><span class="ffoot ff2" data-zone="foot"></span>
      </div>
      <div class="feed-table" id="feed-table"></div>
      <div class="feed-count" id="feed-count"></div>`;
    const { say, playSfx, effects, audio } = ctx;
    const { sparkleBurst, confettiBurst } = effects;
    const bubble = el.querySelector('#feed-bubble');
    const mon = el.querySelector('#feed-mon');
    const mouth = el.querySelector('#feed-mouth');
    const tummy = el.querySelector('#feed-tummy');
    const tummyItems = el.querySelector('#feed-tummy-items');
    const sayEl = el.querySelector('#feed-say');
    const table = el.querySelector('#feed-table');
    const countEl = el.querySelector('#feed-count');

    let timers = [];
    let drags = [];
    let items = [];
    let request = null;  // {kind:'letter'|'colour'|'counting', value, left}
    let wrong = 0;
    let fed = 0;
    let busy = false;
    let idleTimer = null;
    let lastTickle = 0;
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearT = () => { timers.forEach(clearTimeout); timers = []; clearTimeout(idleTimer); };

    function setMood(cls, ms = 750) {
      mon.classList.remove('sleepy', 'tickle', 'dizzy', 'hop', 'gulp', 'hungry');
      void mon.offsetWidth;
      if (cls) {
        mon.classList.add(cls);
        if (ms > 0) T(() => mon.classList.remove(cls), ms);
      }
    }

    function resetIdle() {
      mon.classList.remove('sleepy');
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!ctx.isActive() || busy) return;
        mon.classList.add('sleepy');
        playSfx('snore');
        spawnFloaters('💤', 3, 'zzz');
        if (packTakeUrl('feedsfx_snore')) say('', { clip: 'feedsfx_snore' });
      }, 9500);
    }

    function monColor() {
      const c = ctx.modeSettings.colour || 'random';
      const col = c === 'random' ? rand(Object.keys(MON_COLORS)) : c;
      mon.style.setProperty('--mc', MON_COLORS[col] || MON_COLORS.purple);
    }

    // spawn floating particles (crumbs, burp bubbles, hearts, zzz) relative to the monster
    function spawnFloaters(symbolOrColor, count = 5, kind = 'crumb') {
      const mr = mouth.getBoundingClientRect();
      const br = mon.getBoundingClientRect();
      const ox = mr.left - br.left + mr.width / 2;
      const oy = mr.top - br.top + mr.height / 2;
      for (let i = 0; i < count; i++) {
        const c = document.createElement('span');
        if (kind === 'crumb') {
          c.className = 'feed-crumb';
          const pal = Array.isArray(symbolOrColor) ? symbolOrColor : ['#d9a066', '#ffd23f'];
          c.style.background = pal[i % pal.length];
          const sz = rnd(1.1, 2.2);
          c.style.width = sz + 'vmin';
          c.style.height = sz + 'vmin';
          c.style.left = ox + rnd(-24, 24) + 'px';
          c.style.top = oy + rnd(-10, 10) + 'px';
          c.style.setProperty('--cx', rnd(-75, 75) + 'px');
          c.style.setProperty('--cy', rnd(25, 95) + 'px');
        } else if (kind === 'burp') {
          c.className = 'feed-burp-bub';
          const sz = rnd(2.2, 4.5);
          c.style.width = sz + 'vmin';
          c.style.height = sz + 'vmin';
          c.style.left = ox + rnd(-30, 30) + 'px';
          c.style.top = oy + rnd(-10, 8) + 'px';
          c.style.setProperty('--bx', rnd(-45, 45) + 'px');
        } else {
          c.className = 'feed-floater';
          c.textContent = symbolOrColor;
          c.style.left = br.width * 0.5 + rnd(-45, 45) + 'px';
          c.style.top = (kind === 'heart' ? br.height * 0.65 : br.height * 0.15) + rnd(-12, 12) + 'px';
        }
        mon.appendChild(c);
        T(() => c.remove(), 950);
      }
    }

    // Talking-Tom interactive reactions when tapping/rubbing the monster
    function tickleTummy(cx, cy) {
      const now = performance.now();
      if (now - lastTickle < 420 || busy) return;
      lastTickle = now;
      audio();
      resetIdle();
      // If tummy has food & every 3rd tickle, let out a funny burp!
      if (fed > 0 && Math.random() < 0.35) {
        setMood('gulp', 700);
        playSfx('burp');
        spawnFloaters('', 7, 'burp');
        say('Burp! Excuse me!', { clip: 'feedsfx_burp' });
        return;
      }
      setMood('tickle', 750);
      playSfx('giggle');
      spawnFloaters('💖', 4, 'heart');
      sparkleBurst(cx, cy, 5);
      say('Hehehe! That tickles!', { clip: 'feedsfx_giggle' });
    }

    function pokeHead(cx, cy) {
      if (busy) return;
      audio();
      resetIdle();
      setMood('dizzy', 850);
      playSfx('boing');
      sparkleBurst(cx, cy, 6);
      say("Boing! Hey, that's my silly head!", { clip: 'feedsfx_poke' });
    }

    function tapMouth() {
      if (busy) return;
      audio();
      resetIdle();
      setMood('hungry', 750);
      mouth.classList.add('open');
      T(() => mouth.classList.remove('open'), 650);
      playSfx('chomp');
      say('Aaaah! Feed me! Nom nom nom!', { clip: 'feedsfx_hungry' });
    }

    function tapFoot() {
      if (busy) return;
      audio();
      resetIdle();
      setMood('hop', 650);
      playSfx('boing');
    }

    mon.addEventListener('pointerdown', (e) => {
      const z = e.target.closest('[data-zone]');
      const zone = z ? z.dataset.zone : 'tummy';
      if (zone === 'head') pokeHead(e.clientX, e.clientY);
      else if (zone === 'mouth') tapMouth();
      else if (zone === 'foot') tapFoot();
      else tickleTummy(e.clientX, e.clientY);
    });

    // Rubbing across the tummy also tickles!
    tummy.addEventListener('pointermove', (e) => {
      if (e.buttons > 0 || e.pointerType === 'touch') tickleTummy(e.clientX, e.clientY);
    });

    bubble.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      audio();
      resetIdle();
      playSfx('pop');
      repeatRequest();
    });

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
      return Math.hypot(x - (mr.left + mr.width / 2), y - (mr.top + mr.height / 2)) < mr.width * 2.4;
    }
    el.addEventListener('pointermove', trackEyes);

    function repeatRequest() {
      if (!request) return;
      if (request.kind === 'letter') say('', { clip: 'feedq_l_' + request.value });
      else if (request.kind === 'colour') say('', { clip: 'feedq_c_' + request.value });
      else say('', { clip: 'feedq_n_' + request.value });
    }

    function pickRequest() {
      resetIdle();
      const kind = ctx.modeSettings.asks === 'mix' ? rand(['letter', 'colour', 'counting']) : (ctx.modeSettings.asks || 'letter');
      if (kind === 'letter') {
        const have = new Set(items.map((i) => i.name[0]));
        const ch = rand([...have]);
        request = { kind, value: ch };
        countEl.textContent = '';
        sayEl.textContent = `I want something that starts with ${ch.toUpperCase()}!`;
        say('', { clip: 'feedq_l_' + ch });
      } else if (kind === 'colour') {
        const have = new Set(items.map((i) => i.color));
        const c = rand([...have]);
        request = { kind, value: c };
        countEl.textContent = '';
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
      items.forEach((f) => {
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
          onPick: () => {
            resetIdle();
            mon.classList.add('excited');
          },
          onMove: (el2, x, y) => {
            const near = nearMouth(x, y);
            mouth.classList.toggle('open', near);
            mon.classList.toggle('wide-open', near);
          },
          onDrop: (el2, zone) => {
            mouth.classList.remove('open');
            mon.classList.remove('excited', 'wide-open');
            if (zone && isRight(f)) { eat(f, d); return true; }
            reject(d);
            return false;
          },
        });
        drags.push(drag);
      });
    }

    function addTummyFood(f) {
      while (tummyItems.children.length >= 6) tummyItems.firstElementChild.remove();
      const ti = document.createElement('span');
      ti.className = 'tummy-food';
      setArt(ti, f.emoji);
      tummyItems.appendChild(ti);
    }

    function eat(f, d) {
      busy = true;
      resetIdle();
      fed++;
      d.classList.add('eaten');
      const mr = mouth.getBoundingClientRect();
      const mx = mr.left + mr.width / 2;
      const my = mr.top + mr.height / 2;
      const pal = CRUMB_COLORS[f.color] || CRUMB_COLORS.yellow;
      const isSlurp = SLURP_IDS.has(f.id);

      // Multi-stage 3-bite chomp into the mouth!
      flyFromDrop(d, mx, my, { scale: 0.72, ms: 160, fade: false });
      mon.classList.add('chomp');
      playSfx(isSlurp ? 'slurp' : 'crunch');
      spawnFloaters(pal, 6, 'crumb');
      sparkleBurst(mx, my, 5);

      T(() => {
        flyFromDrop(d, mx, my, { scale: 0.42, ms: 150, fade: false });
        spawnFloaters(pal, 6, 'crumb');
      }, 180);

      T(() => {
        flyFromDrop(d, mx, my, { scale: 0.08, ms: 150, fade: true });
        spawnFloaters(pal, 5, 'crumb');
      }, 360);

      T(() => {
        mon.classList.remove('chomp');
        mon.classList.add('gulp');
        d.style.display = 'none';
        addTummyFood(f);
        tummy.style.transform = `translateX(-50%) scale(${Math.min(1.32, 1 + fed * 0.06)})`;
      }, 540);
      T(() => mon.classList.remove('gulp'), 950);

      // Play Studio-replaceable crunch/slurp clip if recorded, and always the yum clip
      const sfxClip = isSlurp ? 'feedsfx_slurp' : 'feedsfx_crunch';
      const hasCustomSfx = !!packTakeUrl(sfxClip);
      if (hasCustomSfx) say('', { clip: sfxClip });
      say('', { clip: 'feed_yum' + (1 + Math.floor(Math.random() * 3)), queue: hasCustomSfx });

      // Funny burp with rising green bubbles after every 2nd snack
      if (fed % 2 === 0) {
        T(() => {
          playSfx('burp', { overlay: true });
          spawnFloaters('', 6, 'burp');
          if (packTakeUrl('feedsfx_burp')) say('', { clip: 'feedsfx_burp', queue: true });
        }, 720);
      }

      if (request.kind === 'counting') {
        request.left--;
        countEl.textContent = (request.value - request.left) + ' / ' + request.value;
        say(String(request.value - request.left), { clip: 'num_' + (request.value - request.left), queue: true });
        if (request.left > 0) {
          // respawn the same food on the table
          T(() => { d.style.display = ''; d.style.transform = ''; d.style.opacity = ''; d.classList.remove('eaten'); busy = false; }, 780);
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
      resetIdle();
      playSfx('boing');
      mon.classList.add('blech');
      T(() => mon.classList.remove('blech'), 750);
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
      tummyItems.innerHTML = '';
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
