(() => {
  'use strict';

  // ---------- content ----------
  const LETTERS = {
    A: ['Apple', '🍎'], B: ['Banana', '🍌'], C: ['Cat', '🐱'], D: ['Dog', '🐶'], E: ['Elephant', '🐘'],
    F: ['Fish', '🐟'], G: ['Grapes', '🍇'], H: ['Horse', '🐴'], I: ['Ice cream', '🍦'], J: ['Juice', '🧃'],
    K: ['Kite', '🪁'], L: ['Lion', '🦁'], M: ['Monkey', '🐵'], N: ['Nest', '🪺'], O: ['Orange', '🍊'],
    P: ['Parrot', '🦜'], Q: ['Queen', '👸'], R: ['Rabbit', '🐰'], S: ['Ship', '🚢'], T: ['Tiger', '🐯'],
    U: ['Umbrella', '☂️'], V: ['Violin', '🎻'], W: ['Whale', '🐳'], X: ['Xylophone', '🎼'], Y: ['Yo-yo', '🪀'],
    Z: ['Zebra', '🦓'],
  };
  const NUMBER_WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  // Phonetic letter names — a lone "C" makes TTS say "capital C", "see" doesn't.
  const PHON = {
    A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee', H: 'aitch', I: 'eye',
    J: 'jay', K: 'kay', L: 'ell', M: 'em', N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'ar',
    S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double-you', X: 'ex', Y: 'why', Z: 'zee',
  };
  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
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

  // ---------- settings ----------
  const settings = { sfx: true, voice: true, words: true, volume: 0.8, theme: 'auto' };
  try { Object.assign(settings, JSON.parse(localStorage.getItem('ab12-settings') || '{}')); } catch (e) {}
  const saveSettings = () => localStorage.setItem('ab12-settings', JSON.stringify(settings));

  const THEMES = {
    auto: BG,
    candy: ['#ff5c8a', '#ff77e9', '#f368e0', '#ff6b6b', '#ffb020', '#e5397a'],
    ocean: ['#2fb8ff', '#00c9a7', '#118ab2', '#5c7cfa', '#06d6a0', '#5468ff'],
    forest: ['#4cd964', '#20c997', '#3ddc84', '#a0d911', '#00c2a8', '#06d6a0'],
  };
  const pickBg = () => rand(THEMES[settings.theme] || BG);
  const applyTheme = () => {
    ['auto', 'candy', 'ocean', 'forest'].forEach((t) => document.body.classList.remove('theme-' + t));
    document.body.classList.add('theme-' + settings.theme);
  };
  applyTheme();

  // ---------- audio ----------
  // All synth tones run through one lowpass-filtered master gain so they stay
  // soft, and every new sound stops the previous one — nothing ever overlaps.
  let ctx = null;
  let master = null;
  const live = new Set();
  function audio() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 3500;
      lp.Q.value = 0.4;
      master = ctx.createGain();
      master.gain.value = settings.volume;
      master.connect(lp).connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function stopSfx() {
    if (!ctx) return;
    const t = ctx.currentTime;
    for (const n of live) {
      try {
        n.g.gain.cancelScheduledValues(t);
        n.g.gain.setTargetAtTime(0.0001, t, 0.03);
        n.o.stop(t + 0.15);
      } catch (e) {}
    }
    live.clear();
  }
  function tone({ type = 'sine', f0 = 440, f1 = f0, dur = 0.25, gain = 0.25, delay = 0 }) {
    const ac = audio();
    const o = ac.createOscillator();
    const g = ac.createGain();
    const t = ac.currentTime + delay;
    const atk = Math.min(0.04, dur * 0.2);
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + atk);
    g.gain.setTargetAtTime(0.0001, t + dur * 0.6, dur * 0.25);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.3);
    const node = { o, g };
    live.add(node);
    o.onended = () => live.delete(node);
  }
  function playSfx(name) {
    if (!settings.sfx) return;
    stopSfx();
    SFX[name]();
  }
  const SFX = {
    pop: () => tone({ type: 'sine', f0: 550, f1: 1050, dur: 0.14, gain: 0.22 }),
    boing: () => tone({ type: 'triangle', f0: 750, f1: 160, dur: 0.42, gain: 0.18 }),
    slideUp: () => tone({ type: 'triangle', f0: 240, f1: 1200, dur: 0.45, gain: 0.1 }),
    honk: () => { tone({ type: 'triangle', f0: 220, f1: 200, dur: 0.28, gain: 0.13 }); tone({ type: 'triangle', f0: 277, f1: 260, dur: 0.28, gain: 0.11 }); },
    laser: () => tone({ type: 'sine', f0: 1400, f1: 140, dur: 0.32, gain: 0.1 }),
    bubbles: () => { for (let i = 0; i < 5; i++) tone({ type: 'sine', f0: rnd(450, 1300), f1: rnd(700, 1900), dur: 0.09, gain: 0.14, delay: i * 0.07 }); },
    quack: () => { tone({ type: 'triangle', f0: 480, f1: 290, dur: 0.15, gain: 0.11 }); tone({ type: 'triangle', f0: 460, f1: 270, dur: 0.15, gain: 0.11, delay: 0.18 }); },
    ding: () => { tone({ type: 'sine', f0: 880, f1: 880, dur: 0.55, gain: 0.18 }); tone({ type: 'sine', f0: 1320, f1: 1320, dur: 0.45, gain: 0.1, delay: 0.05 }); },
    fanfare: () => { [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', f0: f, f1: f, dur: 0.22, gain: 0.18, delay: i * 0.13 })); },
    // gentle pentatonic note — climbs the scale on consecutive letter presses
    scaleNote: () => {
      const i = noteIdx % SCALE.length;
      noteIdx++;
      clearTimeout(noteTimer);
      noteTimer = setTimeout(() => (noteIdx = 0), 2500);
      tone({ type: 'triangle', f0: SCALE[i], f1: SCALE[i], dur: 0.5, gain: 0.15 });
      tone({ type: 'sine', f0: SCALE[i] * 2, f1: SCALE[i] * 2, dur: 0.35, gain: 0.06 });
    },
  };
  const SILLY = ['boing', 'slideUp', 'honk', 'laser', 'bubbles', 'quack', 'pop', 'ding'];
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5];
  let noteIdx = 0, noteTimer = null;

  // ---------- speech ----------
  let voice = null;
  function pickVoice() {
    const vs = speechSynthesis.getVoices();
    if (!vs.length) return;
    const enIN = vs.filter((v) => v.lang.replace('_', '-').startsWith('en-IN'));
    const en = vs.filter((v) => v.lang.startsWith('en'));
    voice =
      enIN.find((v) => /natural|neural|premium|enhanced/i.test(v.name)) ||
      enIN[0] ||
      en.find((v) => /natural|neural|premium|enhanced/i.test(v.name)) ||
      en.find((v) => /Samantha|Google US English|Aria|Jenny|Karen|Zira|Susan|Female/i.test(v.name)) ||
      en[0] || vs[0];
  }
  if ('speechSynthesis' in window) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }
  // Voice = pre-recorded clips in audio/ (generated by tools/gen_audio.py),
  // Web Speech TTS only as fallback if a clip is missing. One voice at a
  // time: new speech stops the old; queue:true plays after, never on top.
  let clipEl = null;
  let ttsActive = false;
  const voiceQueue = [];
  const voiceBusy = () => ttsActive || !!clipEl;

  function speakTts(text, pitch, rate) {
    if (!('speechSynthesis' in window)) { flushQueue(); return; }
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.pitch = pitch;
    u.rate = rate;
    u.volume = settings.volume;
    ttsActive = true;
    u.onend = u.onerror = () => { ttsActive = false; flushQueue(); };
    speechSynthesis.speak(u);
  }
  function flushQueue() {
    const next = voiceQueue.shift();
    if (next) startVoice(next);
  }
  function startVoice({ text, clip, pitch, rate }) {
    if (clip) {
      const a = new Audio(`audio/${clip}.m4a`);
      a.volume = settings.volume;
      clipEl = a;
      a.onended = () => { clipEl = null; flushQueue(); };
      const fail = () => { clipEl = null; speakTts(text, pitch, rate); };
      a.onerror = fail;
      a.play().catch(fail);
    } else {
      speakTts(text, pitch, rate);
    }
  }
  function say(text, { pitch = 1.15, rate = 0.92, queue = false, clip = null } = {}) {
    if (!settings.voice) return;
    if (queue && voiceBusy()) { voiceQueue.push({ text, clip, pitch, rate }); return; }
    stopVoice();
    startVoice({ text, clip, pitch, rate });
  }
  function stopVoice() {
    voiceQueue.length = 0;
    if (clipEl) { clipEl.onended = clipEl.onerror = null; clipEl.pause(); clipEl = null; }
    ttsActive = false;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
  function stopAllAudio() {
    stopSfx();
    stopVoice();
  }

  // ---------- screens ----------
  let mode = 'home';
  const homeBtn = $('#home-btn');
  function show(next) {
    stopAllAudio();
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === next));
    mode = next;
    homeBtn.classList.toggle('visible', next !== 'home');
    document.body.style.background = next === 'home' ? '' : pickBg();
    if (next === 'smash') $('#smash-idle').classList.remove('hidden');
    if (next === 'learn') {
      $('#learn-idle').classList.remove('hidden');
      $('#hero').classList.remove('show');
      $('#trail').innerHTML = '';
      lastGlyph = '';
      lastSpeak = null;
    }
  }
  document.querySelectorAll('.mode-card').forEach((b) =>
    b.addEventListener('click', () => {
      audio();
      playSfx('fanfare');
      say(b.dataset.mode === 'learn' ? "Let's learn letters and numbers!" : 'Smash time!',
        { clip: b.dataset.mode === 'learn' ? 'intro_learn' : 'intro_smash' });
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
  let lastSpeak = null;
  let idleTimer = null;

  function sparkleBurst(cx, cy, n = 7) {
    for (let i = 0; i < n; i++) {
      const s = document.createElement('div');
      s.className = 'spark';
      s.textContent = rand(['✨', '⭐', '💫']);
      s.style.left = cx + 'px';
      s.style.top = cy + 'px';
      s.style.fontSize = rnd(2.5, 5) + 'vmin';
      s.style.setProperty('--sx', rnd(-18, 18) + 'vmin');
      s.style.setProperty('--sy', rnd(-16, 4) + 'vmin');
      s.style.setProperty('--sr', rnd(-180, 180) + 'deg');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 950);
    }
  }
  // subtle invitation to press something after a few quiet seconds
  function pokeIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (mode === 'learn' && hero.classList.contains('show')) {
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
    const color = COLORS[colorIdx++ % COLORS.length];
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
    $('#learn-idle').classList.add('hidden');
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
    while (trail.children.length > 60) trail.firstElementChild.remove();

    say(speakParts[0].text, { clip: speakParts[0].clip, pitch: rnd(1.05, 1.35), rate: 0.9 });
    for (const p of speakParts.slice(1)) say(p.text, { clip: p.clip, queue: true });
    // queued so it plays after the letter, never on top of it
    const ci = Math.floor(Math.random() * CHEERS.length);
    if (Math.random() < 0.3) say(CHEERS[ci], { pitch: 1.4, rate: 1, queue: true, clip: `cheer_${ci}` });
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
  let smashStreak = 0, streakTimer = null;
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
    document.body.style.background = pickBg();
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 200);

    // streak celebration — every 8th rapid smash gets a party
    smashStreak++;
    clearTimeout(streakTimer);
    streakTimer = setTimeout(() => (smashStreak = 0), 1500);
    if (smashStreak % 8 === 0) {
      confetti(x, y);
      confetti(x - 60, y - 40);
      confetti(x + 60, y - 40);
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

  // ---------- settings panel ----------
  const panel = $('#settings');
  const syncSettingsUI = () => {
    $('#set-sfx').setAttribute('aria-pressed', settings.sfx);
    $('#set-voice').setAttribute('aria-pressed', settings.voice);
    document.querySelectorAll('#set-words .seg-btn').forEach((b) =>
      b.classList.toggle('on', (b.dataset.words === '1') === settings.words));
    document.querySelectorAll('#set-theme .seg-btn').forEach((b) =>
      b.classList.toggle('on', b.dataset.theme === settings.theme));
    $('#set-volume').value = Math.round(settings.volume * 100);
  };
  $('#settings-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    syncSettingsUI();
    panel.hidden = false;
  });
  const closeSettings = () => { panel.hidden = true; };
  $('#settings-close').addEventListener('click', closeSettings);
  panel.addEventListener('pointerdown', (e) => { if (e.target === panel) closeSettings(); });

  $('#set-sfx').addEventListener('click', () => {
    settings.sfx = !settings.sfx;
    saveSettings();
    syncSettingsUI();
    if (settings.sfx) playSfx('ding');
    else stopSfx();
  });
  $('#set-voice').addEventListener('click', () => {
    settings.voice = !settings.voice;
    saveSettings();
    syncSettingsUI();
    if (settings.voice) say('Voice on!', { clip: 'voice_on' });
    else if ('speechSynthesis' in window) speechSynthesis.cancel();
  });
  document.querySelectorAll('#set-words .seg-btn').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      settings.words = b.dataset.words === '1';
      saveSettings();
      syncSettingsUI();
      say(settings.words ? 'ay! ay is for Apple!' : 'ay',
        { clip: settings.words ? 'phrase_A' : 'letter_A' });
    })
  );
  document.querySelectorAll('#set-theme .seg-btn').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      settings.theme = b.dataset.theme;
      saveSettings();
      applyTheme();
      syncSettingsUI();
      playSfx('pop');
    })
  );
  $('#set-volume').addEventListener('input', (e) => {
    settings.volume = e.target.value / 100;
    if (master) master.gain.value = settings.volume;
    saveSettings();
  });
  $('#set-volume').addEventListener('change', () => playSfx('ding'));
})();
