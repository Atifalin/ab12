(() => {
  'use strict';

  // ---------- content ----------
  const LETTERS = {
    A: ['Apple', '🍎'], B: ['Banana', '🍌'], C: ['Cat', '🐱'], D: ['Dog', '🐶'], E: ['Elephant', '🐘'],
    F: ['Fish', '🐟'], G: ['Grapes', '🍇'], H: ['Horse', '🐴'], I: ['Ice cream', '🍦'], J: ['Jellyfish', '🪼'],
    K: ['Kite', '🪁'], L: ['Lion', '🦁'], M: ['Monkey', '🐵'], N: ['Nest', '🪺'], O: ['Orange', '🍊'],
    P: ['Pig', '🐷'], Q: ['Queen', '👸'], R: ['Rocket', '🚀'], S: ['Sun', '☀️'], T: ['Truck', '🚚'],
    U: ['Umbrella', '☂️'], V: ['Violin', '🎻'], W: ['Whale', '🐳'], X: ['Xylophone', '🎼'], Y: ['Yo-yo', '🪀'],
    Z: ['Zebra', '🦓'],
  };
  const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  const COUNT_EMOJI = ['🍎', '⭐', '🎈', '🍓', '🐥', '🚗', '🍪', '🐸', '🌼', '🦆', '🍩'];

  const SMASH = [
    ['🍎', 'Apple'], ['🍌', 'Banana'], ['🍉', 'Watermelon'], ['🍓', 'Strawberry'], ['🥕', 'Carrot'], ['🥦', 'Broccoli'],
    ['🌽', 'Corn'], ['🍇', 'Grapes'], ['🍍', 'Pineapple'], ['🥑', 'Avocado'], ['🍋', 'Lemon'], ['🍒', 'Cherries'],
    ['🐶', 'Dog'], ['🐱', 'Cat'], ['🐭', 'Mouse'], ['🐰', 'Bunny'], ['🦊', 'Fox'], ['🐻', 'Bear'], ['🐼', 'Panda'],
    ['🐨', 'Koala'], ['🐯', 'Tiger'], ['🦁', 'Lion'], ['🐮', 'Cow'], ['🐷', 'Pig'], ['🐸', 'Frog'], ['🐵', 'Monkey'],
    ['🐔', 'Chicken'], ['🐧', 'Penguin'], ['🦆', 'Duck'], ['🦉', 'Owl'], ['🐝', 'Bee'], ['🦋', 'Butterfly'],
    ['🐢', 'Turtle'], ['🐙', 'Octopus'], ['🦀', 'Crab'], ['🐳', 'Whale'], ['🦒', 'Giraffe'], ['🦓', 'Zebra'],
    ['🦄', 'Unicorn'], ['🐘', 'Elephant'], ['🦖', 'Dinosaur'],
    ['🚗', 'Car'], ['🚕', 'Taxi'], ['🚌', 'Bus'], ['🚑', 'Ambulance'], ['🚒', 'Fire truck'], ['🚚', 'Truck'],
    ['🚜', 'Tractor'], ['🏎️', 'Race car'], ['🚂', 'Train'], ['✈️', 'Airplane'], ['🚁', 'Helicopter'], ['🚀', 'Rocket'],
    ['🛵', 'Scooter'], ['🚲', 'Bicycle'], ['⛵', 'Boat'], ['🚓', 'Police car'],
    ['🤪', 'Silly face'], ['😜', 'Wink'], ['🤡', 'Clown'], ['👻', 'Ghost'], ['🤖', 'Robot'], ['👾', 'Monster'],
    ['🎈', 'Balloon'], ['🌈', 'Rainbow'], ['⭐', 'Star'], ['🎉', 'Party'], ['🧸', 'Teddy bear'], ['🦕', 'Dino'],
  ];

  const COLORS = ['#ff5c8a', '#ff9f1c', '#ffe94d', '#4cd964', '#2fb8ff', '#8a63ff', '#ff6b6b', '#00c9a7', '#ff77e9', '#5c7cfa', '#f77f00', '#06d6a0', '#e63946', '#118ab2'];
  const BG = ['#ff5c8a', '#ff8c42', '#ffd23f', '#3ddc84', '#2fb8ff', '#8a63ff', '#ff4f79', '#00c2a8', '#f368e0', '#5468ff', '#ff6f3c', '#20c997'];
  const CHEERS = ['Yay!', 'Wow!', 'Great job!', 'Woohoo!', 'Awesome!', 'Hooray!', 'Super!', 'You did it!'];

  const $ = (s) => document.querySelector(s);
  const rand = (a) => a[Math.floor(Math.random() * a.length)];
  const rnd = (min, max) => min + Math.random() * (max - min);

  const isTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  if (isTouch) document.body.classList.add('touch');

  // ---------- audio ----------
  let ctx = null;
  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone({ type = 'sine', f0 = 440, f1 = f0, dur = 0.25, gain = 0.25, delay = 0 }) {
    const ac = audio();
    const o = ac.createOscillator();
    const g = ac.createGain();
    const t = ac.currentTime + delay;
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  const SFX = {
    pop: () => tone({ type: 'sine', f0: 600, f1: 1200, dur: 0.12, gain: 0.3 }),
    boing: () => tone({ type: 'triangle', f0: 900, f1: 150, dur: 0.4 }),
    slideUp: () => tone({ type: 'square', f0: 200, f1: 1400, dur: 0.45, gain: 0.12 }),
    honk: () => { tone({ type: 'sawtooth', f0: 220, f1: 200, dur: 0.3, gain: 0.15 }); tone({ type: 'sawtooth', f0: 277, f1: 260, dur: 0.3, gain: 0.15 }); },
    laser: () => tone({ type: 'sawtooth', f0: 1800, f1: 100, dur: 0.3, gain: 0.12 }),
    bubbles: () => { for (let i = 0; i < 5; i++) tone({ type: 'sine', f0: rnd(500, 1500), f1: rnd(800, 2200), dur: 0.08, gain: 0.2, delay: i * 0.07 }); },
    quack: () => { tone({ type: 'square', f0: 500, f1: 300, dur: 0.15, gain: 0.12 }); tone({ type: 'square', f0: 480, f1: 280, dur: 0.15, gain: 0.12, delay: 0.18 }); },
    ding: () => { tone({ type: 'sine', f0: 880, f1: 880, dur: 0.5, gain: 0.25 }); tone({ type: 'sine', f0: 1320, f1: 1320, dur: 0.4, gain: 0.15, delay: 0.05 }); },
    fanfare: () => { [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', f0: f, f1: f, dur: 0.18, gain: 0.25, delay: i * 0.12 })); },
  };
  const SILLY = ['boing', 'slideUp', 'honk', 'laser', 'bubbles', 'quack', 'pop', 'ding'];

  // ---------- speech ----------
  let voice = null;
  function pickVoice() {
    const vs = speechSynthesis.getVoices();
    if (!vs.length) return;
    const en = vs.filter((v) => v.lang.startsWith('en'));
    voice = en.find((v) => /Samantha|Karen|Google US English|Zira|Female/i.test(v.name)) || en[0] || vs[0];
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  function say(text, { pitch = 1.4, rate = 0.95, interrupt = true } = {}) {
    if (!('speechSynthesis' in window)) return;
    if (interrupt) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.pitch = pitch;
    u.rate = rate;
    u.volume = 1;
    speechSynthesis.speak(u);
  }

  // ---------- screens ----------
  let mode = 'home';
  const homeBtn = $('#home-btn');
  function show(next) {
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === next));
    mode = next;
    homeBtn.classList.toggle('visible', next !== 'home');
    document.body.style.background = next === 'home' ? '' : rand(BG);
    if (next === 'smash') $('#smash-idle').classList.remove('hidden');
    if (next === 'learn') {
      $('#learn-idle').classList.remove('hidden');
      $('#hero').classList.remove('show');
      $('#trail').innerHTML = '';
      lastGlyph = '';
    }
  }
  document.querySelectorAll('.mode-card').forEach((b) =>
    b.addEventListener('click', () => {
      audio();
      SFX.fanfare();
      say(b.dataset.mode === 'learn' ? "Let's learn letters and numbers!" : 'Smash time!');
      show(b.dataset.mode);
      if (!isTouch && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    })
  );

  // hold ⭐ for 2s to exit (so a toddler can't leave by accident)
  let holdTimer = null;
  const startHold = (e) => {
    e.preventDefault();
    homeBtn.classList.add('holding');
    holdTimer = setTimeout(() => { homeBtn.classList.remove('holding'); show('home'); }, 2000);
  };
  const cancelHold = () => { clearTimeout(holdTimer); homeBtn.classList.remove('holding'); };
  homeBtn.addEventListener('pointerdown', startHold);
  homeBtn.addEventListener('pointerup', cancelHold);
  homeBtn.addEventListener('pointerleave', cancelHold);
  homeBtn.addEventListener('pointercancel', cancelHold);
  homeBtn.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---------- learn mode ----------
  const trail = $('#trail');
  const hero = $('#hero');
  const glyphEl = $('#glyph');
  const picEl = $('#pic');
  const wordEl = $('#word');
  let lastGlyph = '';
  let colorIdx = 0;

  function learnInput(ch) {
    ch = ch.toUpperCase();
    let display = ch;
    let word, pic, speech;
    const color = COLORS[colorIdx++ % COLORS.length];
    document.body.style.background = rand(BG.filter((c) => c !== color));

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
      const count = n > 0 ? ' ' + NUMBER_WORDS.slice(1, n + 1).join(', ') + '!' : '';
      speech = `${word}!${n > 1 && n <= 5 ? count : ''}`;
      SFX.ding();
    } else if (/[A-Z]/.test(ch)) {
      [word, pic] = LETTERS[ch];
      picEl.classList.remove('many');
      speech = `${ch}! ${ch} is for ${word}!`;
      SFX.pop();
    } else {
      SFX[rand(SILLY)]();
      return;
    }

    lastGlyph = display;
    $('#learn-idle').classList.add('hidden');
    hero.classList.remove('show');
    void hero.offsetWidth; // restart animations
    hero.classList.add('show');
    glyphEl.textContent = display;
    glyphEl.style.color = '#fff';
    picEl.textContent = pic;
    wordEl.textContent = word;

    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.style.setProperty('--chip', color);
    chip.textContent = display;
    trail.appendChild(chip);
    while (trail.children.length > 60) trail.firstElementChild.remove();

    const pitch = rnd(1.2, 1.8);
    say(speech, { pitch, rate: 0.9 });
    if (Math.random() < 0.3) say(rand(CHEERS), { pitch: 1.7, rate: 1.05, interrupt: false });
  }

  // touch pad for phones/tablets
  function buildPad() {
    const pad = $('#pad');
    const rows = [
      '1234567890'.split(''),
      'ABCDEFGHI'.split(''),
      'JKLMNOPQR'.split(''),
      'STUVWXYZ'.split(''),
    ];
    rows.forEach((keys, r) => {
      const row = document.createElement('div');
      row.className = 'row';
      keys.forEach((k, i) => {
        const b = document.createElement('button');
        b.className = 'key';
        b.textContent = k;
        b.style.setProperty('--k', COLORS[(i + r * 3) % COLORS.length]);
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); audio(); learnInput(k); });
        row.appendChild(b);
      });
      pad.appendChild(row);
    });
  }
  buildPad();

  // ---------- smash mode ----------
  const layer = $('#smash-layer');
  function confetti(x, y) {
    for (let i = 0; i < 14; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = x + 'px';
      c.style.top = y + 'px';
      c.style.background = rand(COLORS);
      c.style.setProperty('--dx', rnd(-40, 40) + 'vmin');
      c.style.animationDelay = rnd(0, 0.15) + 's';
      layer.appendChild(c);
      setTimeout(() => c.remove(), 1600);
    }
  }
  function smashAt(x, y, label) {
    $('#smash-idle').classList.add('hidden');
    const [emoji, name] = rand(SMASH);
    const size = rnd(22, 42);
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
    while (layer.querySelectorAll('.pop').length > 12) layer.querySelector('.pop').remove();

    const ring = document.createElement('div');
    ring.className = 'ring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    ring.style.borderColor = rand(COLORS);
    layer.appendChild(ring);
    setTimeout(() => ring.remove(), 800);

    if (Math.random() < 0.35) confetti(x, y);
    document.body.style.background = rand(BG);
    SFX[rand(SILLY)]();
    if (Math.random() < 0.6) say(name + '!', { pitch: rnd(0.6, 2), rate: rnd(0.8, 1.3) });
  }
  function smashRandom(label) {
    const W = window.innerWidth, H = window.innerHeight;
    smashAt(rnd(W * 0.15, W * 0.85), rnd(H * 0.15, H * 0.85), label);
  }
  $('#smash').addEventListener('pointerdown', (e) => {
    if (e.target === homeBtn) return;
    e.preventDefault();
    audio();
    smashAt(e.clientX, e.clientY);
  });

  // ---------- keyboard ----------
  window.addEventListener('keydown', (e) => {
    if (mode === 'home') return;
    // stop the browser from doing anything with the smashed keys
    if (!(e.ctrlKey || e.metaKey) || e.key.length === 1) e.preventDefault();
    if (e.repeat) return;
    audio();
    if (mode === 'learn') {
      learnInput(e.key.length === 1 ? e.key : ' ');
    } else if (mode === 'smash') {
      const label = /^[a-z0-9]$/i.test(e.key) ? e.key.toUpperCase() : '';
      smashRandom(label);
    }
  });
  // block context menu / double-tap zoom on the whole app while playing
  document.addEventListener('contextmenu', (e) => { if (mode !== 'home') e.preventDefault(); });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());
  window.addEventListener('beforeunload', (e) => { if (mode !== 'home') { e.preventDefault(); e.returnValue = ''; } });
})();
