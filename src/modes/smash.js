import { SMASH, CHEERS, COLORS, slug } from '../content.js';
import { rand, rnd } from '../core/util.js';
import { SILLY } from '../core/audio.js';

// ---------- smash mode ----------
export default {
  id: 'smash',
  title: 'Smash!',
  emoji: '💥',
  category: 'play',
  settings: [],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="smash-idle" id="smash-idle">Tap or smash the keys!</div>
      <div id="smash-layer"></div>`;
    const layer = el.querySelector('#smash-layer');
    const idle = el.querySelector('#smash-idle');
    const ringLive = layer.getElementsByClassName('ring');
    const { say, playSfx, effects, pickBg, audio } = ctx;
    const { confettiBurst, sparkleBurst } = effects;
    let smashStreak = 0, streakTimer = null;
    let lastSmash = 0;

    function smashAt(x, y, label) {
      const now = performance.now();
      if (now - lastSmash < 60) return;
      lastSmash = now;
      idle.classList.add('hidden');
      const [emoji, name] = rand(SMASH);
      const size = rnd(16, 30);
      const half = (size / 100) * Math.min(window.innerWidth, window.innerHeight) * 0.55;
      x = Math.min(Math.max(x, half), window.innerWidth - half);
      y = Math.min(Math.max(y, half), window.innerHeight - half * 1.4);
      const p = document.createElement('div');
      p.className = 'pop';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.fontSize = size + 'vmin';
      p.style.rotate = rnd(-20, 20) + 'deg';
      p.innerHTML = `${emoji}<span class="name">${label ? label + ' · ' : ''}${name}</span>`;
      layer.appendChild(p);
      setTimeout(() => p.remove(), 3100);
      while (layer.querySelectorAll('.pop').length > 8) layer.querySelector('.pop').remove();

      if (ringLive.length <= 4) {
        const ring = document.createElement('div');
        ring.className = 'ring';
        ring.style.left = x + 'px';
        ring.style.top = y + 'px';
        ring.style.borderColor = rand(COLORS);
        layer.appendChild(ring);
        setTimeout(() => ring.remove(), 800);
      }

      if (Math.random() < 0.35) confettiBurst(layer, x, y);
      document.body.style.background = pickBg();
      document.body.classList.add('shake');
      setTimeout(() => document.body.classList.remove('shake'), 200);

      // streak celebration — every 8th rapid smash gets a party
      smashStreak++;
      clearTimeout(streakTimer);
      streakTimer = setTimeout(() => (smashStreak = 0), 1500);
      if (smashStreak % 8 === 0) {
        confettiBurst(layer, x, y);
        confettiBurst(layer, x - 60, y - 40);
        confettiBurst(layer, x + 60, y - 40);
        playSfx('fanfare');
        const ci = Math.floor(Math.random() * CHEERS.length);
        say(CHEERS[ci], { pitch: 1.4, rate: 1, queue: true, clip: `cheer_${ci}` });
      } else {
        playSfx(rand(SILLY));
        if (Math.random() < 0.6) say(name + '!', { pitch: rnd(0.9, 1.4), rate: rnd(0.9, 1.1), clip: `smash_${slug(name)}` });
      }
    }
    function smashRandom(label) {
      const W = window.innerWidth, H = window.innerHeight;
      smashAt(rnd(W * 0.15, W * 0.85), rnd(H * 0.15, H * 0.85), label);
    }
    el.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.home-btn')) return;
      e.preventDefault();
      audio();
      smashAt(e.clientX, e.clientY);
    });

    this._enter = () => idle.classList.remove('hidden');
    this._onKey = (e) => {
      const label = /^[a-z0-9]$/i.test(e.key) ? e.key.toUpperCase() : '';
      smashRandom(label);
    };
    this._suspend = () => { layer.replaceChildren(); clearTimeout(streakTimer); };
  },

  enter(ctx) {
    this._enter();
    ctx.say('Smash time!', { clip: 'intro_smash' });
  },
  exit() {},
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
