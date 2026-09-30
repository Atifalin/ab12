(() => {
  'use strict';

  // ---------- content ----------
  const LETTERS = {
    A: ['Apple', '🍎'], B: ['Banana', '🍌'], C: ['Cat', '🐱'], D: ['Dog', '🐶'], E: ['Elephant', '🐘'],
    F: ['Fish', '🐟'], G: ['Grapes', '🍇'], H: ['Horse', '🐴'], I: ['Ice cream', '🍦'], J: ['Juice', '🍹'],
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
  const WORDS = [
    ['Cat','🐱'],['Dog','🐶'],['Cow','🐮'],['Pig','🐷'],['Hen','🐔'],['Fox','🦊'],['Bee','🐝'],['Owl','🦉'],
    ['Fish','🐟'],['Duck','🦆'],['Frog','🐸'],['Bus','🚌'],['Car','🚗'],['Sun','☀️'],['Moon','🌙'],['Star','⭐'],
    ['Ball','⚽'],['Book','📖'],['Cake','🎂'],['Milk','🥛'],['Egg','🥚'],['Apple','🍎'],['Hat','🎩'],['Bed','🛏️'],
    ['Box','📦'],['Toy','🧸'],['Red','🔴'],['Blue','🔵'],['Mom','👩'],['Mama','👩'],['Dad','👨'],['Dada','👨'],
    ['Baby','👶'],['Love','❤️'],['Zoo','🦁'],['Yes','👍'],
  ];
  const FAMILY = ['Ezdan','Zohaan','Ahad','Ayat','Ayzal','Ali','Atif','Salma','Saqib','Heena','Aqib','Wasif','Tahreen','Arif','Noor Jahan'];
  const WORD_MAP = new Map();
  for (const [w, e] of WORDS)
    WORD_MAP.set(w.toUpperCase().replace(/\s+/g, ''), { display: w, emoji: e, family: false, clip: 'word_' + slug(w) });
  for (const w of FAMILY)
    WORD_MAP.set(w.toUpperCase().replace(/\s+/g, ''), { display: w, emoji: '💖', family: true, clip: 'word_' + slug(w) });

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
  let voiceGain = null;
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
      voiceGain = ctx.createGain();
      voiceGain.gain.value = settings.volume;
      voiceGain.connect(ctx.destination);
    }
    if (ctx.state !== 'running') ctx.resume();
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
    o.onended = () => { live.delete(node); o.disconnect(); g.disconnect(); };
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
  let curSrc = null;
  let ttsActive = false;
  let voiceActive = false;
  let voiceToken = 0; // bumped on every new voice action — stale callbacks are ignored
  const voiceQueue = [];
  const voiceBusy = () => voiceActive;
  const bufCache = new Map(); // LRU of decoded AudioBuffers, max 30
  const inflight = new Map(); // dedupe concurrent loads
  function loadClip(name) {
    const hit = bufCache.get(name);
    if (hit) {
      bufCache.delete(name);
      bufCache.set(name, hit);
      return Promise.resolve(hit);
    }
    if (inflight.has(name)) return inflight.get(name);
    const p = fetch(`audio/${name}.m4a`)
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); })
      .then((ab) => new Promise((res, rej) => audio().decodeAudioData(ab, res, rej)))
      .then((buf) => {
        inflight.delete(name);
        bufCache.set(name, buf);
        if (bufCache.size > 30) bufCache.delete(bufCache.keys().next().value);
        return buf;
      })
      .catch((e) => { inflight.delete(name); throw e; });
    inflight.set(name, p);
    return p;
  }

  function speakTts(text, pitch, rate, my) {
    if (!('speechSynthesis' in window)) { if (voiceToken === my) { voiceActive = false; flushQueue(); } return; }
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.pitch = pitch;
    u.rate = rate;
    u.volume = settings.volume;
    ttsActive = true;
    u.onend = u.onerror = () => { if (voiceToken === my) { ttsActive = false; voiceActive = false; flushQueue(); } };
    speechSynthesis.speak(u);
  }
  function flushQueue() {
    const next = voiceQueue.shift();
    if (next) startVoice(next);
  }
  function startVoice({ text, clip, pitch, rate }) {
    const my = ++voiceToken;
    voiceActive = true;
    if (clip) {
      loadClip(clip).then((buf) => {
        if (voiceToken !== my) return;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(voiceGain);
        src.onended = () => {
          src.disconnect();
          if (voiceToken === my) { curSrc = null; voiceActive = false; flushQueue(); }
        };
        curSrc = src;
        src.start();
      }).catch(() => { if (voiceToken === my) speakTts(text, pitch, rate, my); });
    } else {
      speakTts(text, pitch, rate, my);
    }
  }
  function say(text, { pitch = 1.15, rate = 0.92, queue = false, clip = null } = {}) {
    if (!settings.voice) return;
    audio();
    if (queue && voiceBusy()) { voiceQueue.push({ text, clip, pitch, rate }); return; }
    stopVoice();
    startVoice({ text, clip, pitch, rate });
  }
  function stopVoice() {
    voiceToken++;
    voiceQueue.length = 0;
    if (curSrc) {
      curSrc.onended = null;
      try { curSrc.stop(); } catch (e) {}
      curSrc.disconnect();
      curSrc = null;
    }
    if (ttsActive && 'speechSynthesis' in window) speechSynthesis.cancel();
    ttsActive = false;
    voiceActive = false;
  }
  function stopAllAudio() {
    stopSfx();
    stopVoice();
  }

  // ---------- screens ----------
  let mode = 'home';
  const homeBtn = $('#home-btn');
  const undoBtn = $('#undo-btn');
  function show(next) {
    stopAllAudio();
    document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === next));
    mode = next;
    homeBtn.classList.toggle('visible', next !== 'home');
    undoBtn.classList.toggle('visible', next === 'learn');
    document.body.style.background = next === 'home' ? '' : pickBg();
    if (next === 'smash') $('#smash-idle').classList.remove('hidden');
    if (next === 'learn') {
      $('#learn-idle').classList.remove('hidden');
      $('#hero').classList.remove('show');
      $('#trail').innerHTML = '';
      lastGlyph = '';
      lastSpeak = null;
    }
    if (next === 'find') {
      clearTimeout(findTimer);
      findLocked = false;
      findWrong = 0;
      findTarget = '';
      findTargetEl.classList.remove('show');
      renderStars();
    }
    if (next === 'spell') spellShowPicker();
  }
  document.querySelectorAll('.mode-card').forEach((b) =>
    b.addEventListener('click', () => {
      b.blur(); // keep Enter from re-triggering the card on a physical keyboard
      audio();
      playSfx('fanfare');
      if (b.dataset.mode === 'find') {
        show('find');
        say("Let's play find it!", { clip: 'find_intro' });
        findRound(true); // prompt queued behind the intro
      } else if (b.dataset.mode === 'spell') {
        show('spell');
      } else {
        say(b.dataset.mode === 'learn' ? "Let's learn letters and numbers!" : 'Smash time!',
          { clip: b.dataset.mode === 'learn' ? 'intro_learn' : 'intro_smash' });
        show(b.dataset.mode);
      }
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
  undoBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); audio(); undoLast(); });

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

  const wordBanner = $('#word-banner');
  const wbEmoji = wordBanner.querySelector('.wb-emoji');
  const wbText = wordBanner.querySelector('.wb-text');
  let wbTimer = null;
  let wordIdCtr = 0;
  function showWordBanner(entry) {
    wbEmoji.textContent = entry.emoji;
    wbText.textContent = entry.display === 'Ezdan' ? 'Ezdan! 💖' : entry.display + '!';
    wordBanner.classList.toggle('family', entry.family);
    wordBanner.classList.remove('show');
    void wordBanner.offsetWidth;
    wordBanner.classList.add('show');
    clearTimeout(wbTimer);
    wbTimer = setTimeout(() => wordBanner.classList.remove('show'), 2200);
  }
  // did the trailing letters just complete a known word/name?
  function checkWordHit() {
    const chips = [];
    for (let el = trail.lastElementChild;
         el && el.classList.contains('chip') && el._data && /^[A-Z]$/.test(el._data.display) && chips.length < 10;
         el = el.previousElementSibling)
      chips.unshift(el);
    for (let len = Math.min(chips.length, 10); len >= 3; len--) {
      const s = chips.slice(-len).map((c) => c._data.display).join('');
      const entry = WORD_MAP.get(s);
      if (entry) return { entry, chips: chips.slice(-len) };
    }
    return null;
  }
  function celebrateWord(hit) {
    const wid = ++wordIdCtr;
    for (const c of hit.chips) { c.classList.add('word-hit'); c._wordId = wid; }
    playSfx('fanfare');
    showWordBanner(hit.entry);
    const r = wordBanner.getBoundingClientRect();
    sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 8);
    say(hit.entry.display, { clip: hit.entry.clip });
  }
  function trimTrail() {
    while (trail.children.length > 60) trail.firstElementChild.remove();
    // a trailing .break adds an invisible empty flex line — exclude it from the height check
    let tail = null;
    if (trail.lastElementChild && trail.lastElementChild.classList.contains('break')) {
      tail = trail.lastElementChild;
      tail.remove();
    }
    // offsetTop/offsetHeight are pure layout — scrollHeight also counts animating
    // transforms, which would fake an overflow mid-animation
    const base = trail.offsetTop;
    while (trail.children.length > 1 &&
           trail.lastElementChild.offsetTop + trail.lastElementChild.offsetHeight - base > trail.clientHeight)
      trail.firstElementChild.remove();
    if (tail) trail.appendChild(tail);
    if (trail.firstElementChild && trail.firstElementChild.classList.contains('break')) trail.firstElementChild.remove();
  }
  function newLine() {
    const last = trail.lastElementChild;
    if (!last || last.classList.contains('break')) { playSfx('pop'); return; }
    const b = document.createElement('div');
    b.className = 'break';
    trail.appendChild(b);
    trimTrail();
    lastGlyph = '';
    playSfx('slideUp');
    stopVoice();
  }

  const sparkLive = document.getElementsByClassName('spark');
  function sparkleBurst(cx, cy, n = 5) {
    if (sparkLive.length > 15) return;
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
    chip._data = { display, word, pic, many: picEl.classList.contains('many'),
      text: speakParts[0].text, clip: speakParts[0].clip };
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
    trimTrail();

    const hit = /[A-Z]/.test(ch) ? checkWordHit() : null;
    if (hit) {
      celebrateWord(hit);
    } else {
      say(speakParts[0].text, { clip: speakParts[0].clip, pitch: rnd(1.05, 1.35), rate: 0.9 });
      for (const p of speakParts.slice(1)) say(p.text, { clip: p.clip, queue: true });
      // queued so it plays after the letter, never on top of it
      const ci = Math.floor(Math.random() * CHEERS.length);
      if (Math.random() < 0.3) say(CHEERS[ci], { pitch: 1.4, rate: 1, queue: true, clip: `cheer_${ci}` });
    }
  }

  // ⌫ undo — drop the last trail chip and revert the hero to the previous entry
  function undoLast() {
    stopVoice();
    const last = trail.lastElementChild;
    if (!last) { playSfx('boing'); return; }
    last.remove();
    playSfx('pop');
    if (last.classList.contains('break')) return;
    if (last._wordId)
      trail.querySelectorAll('.chip.word-hit').forEach((c) => {
        if (c._wordId === last._wordId) c.classList.remove('word-hit');
      });
    let prev = trail.lastElementChild;
    while (prev && !prev._data) prev = prev.previousElementSibling;
    if (prev) {
      const d = prev._data;
      hero.classList.remove('show');
      void hero.offsetWidth;
      hero.classList.add('show');
      glyphEl.textContent = d.display;
      picEl.textContent = d.pic;
      wordEl.textContent = d.word;
      picEl.classList.toggle('many', d.many);
      lastGlyph = d.display;
      lastSpeak = { text: d.text, clip: d.clip };
    } else {
      hero.classList.remove('show');
      $('#learn-idle').classList.remove('hidden');
      lastGlyph = '';
      lastSpeak = null;
    }
  }

  // touch pad for phones/tablets — learn gets digits + ⌫/⏎, spell gets letters only
  function buildPad(container, onKey, { digits = true, extras = [] } = {}) {
    const rows = [];
    if (digits) rows.push('1234567890'.split(''));
    rows.push('ABCDEFGHI'.split(''), 'JKLMNOPQR'.split(''), 'STUVWXYZ'.split(''));
    rows.forEach((keys, r) => {
      const row = document.createElement('div');
      row.className = 'row';
      keys.forEach((k, i) => {
        const b = document.createElement('button');
        b.className = 'key';
        b.dataset.k = k;
        b.textContent = k;
        b.style.setProperty('--k', COLORS[(i + r * 3) % COLORS.length]);
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); audio(); onKey(k); });
        row.appendChild(b);
      });
      container.appendChild(row);
    });
    for (const x of extras) {
      const b = document.createElement('button');
      b.className = 'key wide';
      b.textContent = x.text;
      b.setAttribute('aria-label', x.aria);
      b.style.setProperty('--k', x.color);
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); audio(); onKey(x.k); });
      container.lastElementChild.appendChild(b);
    }
  }
  buildPad($('#pad'), (k) => {
    if (k === 'Backspace') undoLast();
    else if (k === 'Enter') newLine();
    else learnInput(k);
  }, { extras: [
    { text: '⌫', aria: 'Backspace', k: 'Backspace', color: '#8892b0' },
    { text: '⏎', aria: 'New line', k: 'Enter', color: '#5c7cfa' },
  ] });

  // ---------- smash mode ----------
  const layer = $('#smash-layer');
  const confettiLive = layer.getElementsByClassName('confetti');
  const ringLive = layer.getElementsByClassName('ring');
  let smashStreak = 0, streakTimer = null;
  let lastSmash = 0;
  function confetti(x, y) {
    if (confettiLive.length > 60) return;
    for (let i = 0; i < 10; i++) {
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
    const now = performance.now();
    if (now - lastSmash < 60) return;
    lastSmash = now;
    $('#smash-idle').classList.add('hidden');
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

  // ---------- find it! mode ----------
  const findEl = $('#find');
  const findStars = $('#find-stars');
  const findPrompt = $('#find-prompt');
  const findTargetEl = $('#find-target');
  const findBubblesEl = $('#find-bubbles');
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
  const findCount = () => (findStreak < 5 ? 3 : findStreak < 12 ? 4 : 6);
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
        b.style.setProperty('--k', COLORS[colorIdx++ % COLORS.length]);
        b.classList.remove('correct', 'wobble', 'hint');
      } else b.hidden = true;
    });
    findEl.dataset.target = target;
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

  // ---------- spell it! mode ----------
  const SPELL_TRACKS = {
    az: Object.entries(LETTERS).map(([ch, [w, e]]) => ({ word: w, pic: e, key: ch })),
    num: NUMBER_WORDS.slice(1).map((w, i) => ({ word: w, n: i + 1, key: String(i + 1) })),
  };
  const spellEl = $('#spell');
  const spellPicker = $('#spell-picker');
  const spellGame = $('#spell-game');
  const spellPic = $('#spell-pic');
  const spellWord = $('#spell-word');
  const spellCount = $('#spell-count');
  let spellProg = { az: { idx: 0, done: [] }, num: { idx: 0, done: [] } };
  try {
    const p = JSON.parse(localStorage.getItem('ab12-spell') || '{}');
    for (const t of ['az', 'num']) if (p[t]) spellProg[t] = { idx: p[t].idx | 0, done: Array.isArray(p[t].done) ? p[t].done : [] };
  } catch (e) {}
  const saveSpell = () => localStorage.setItem('ab12-spell', JSON.stringify(spellProg));
  let spellTrack = null, spellIdx = 0, spellSlots = [], spellCursor = 0;
  let spellWrong = 0, spellDone = false, spellLock = false;
  let spellIdleT = null, spellAdvT = null;
  const spellList = () => SPELL_TRACKS[spellTrack];

  function spellRenderPicker() {
    for (const t of ['az', 'num']) {
      const total = SPELL_TRACKS[t].length;
      $('#spell-prog-' + t).textContent = `${spellProg[t].done.length} / ${total} ⭐`;
    }
  }
  function spellShowPicker() {
    spellTrack = null;
    spellLock = false;
    clearTimeout(spellIdleT);
    clearTimeout(spellAdvT);
    spellRenderPicker();
    spellGame.hidden = true;
    spellPicker.hidden = false;
  }
  function spellStart(track) {
    spellTrack = track;
    spellIdx = Math.min(spellProg[track].idx, spellList().length - 1);
    spellPicker.hidden = true;
    spellGame.hidden = false;
    spellShow();
  }
  function spellPadHint(ch) {
    const k = spellGame.querySelector(`.key[data-k="${ch}"]`);
    if (k) k.classList.add('hint');
  }
  function spellClearHints() {
    spellGame.querySelectorAll('.key.hint').forEach((k) => k.classList.remove('hint'));
    const cur = spellSlots[spellCursor];
    if (cur) cur.el.classList.remove('gold');
  }
  function spellIdleSoon() {
    clearTimeout(spellIdleT);
    spellIdleT = setTimeout(() => {
      const cur = spellSlots[spellCursor];
      if (mode === 'spell' && !spellDone && cur) spellPadHint(cur.ch);
    }, 5000);
  }
  function spellShow() {
    clearTimeout(spellAdvT);
    clearTimeout(spellIdleT);
    spellLock = false;
    spellDone = false;
    spellWrong = 0;
    spellClearHints();
    const list = spellList();
    const item = list[spellIdx];
    spellCount.textContent = `${spellProg[spellTrack].done.length} / ${list.length}`;
    if (spellTrack === 'num') {
      const n = item.n;
      spellPic.innerHTML = `<span class="sp-digit">${n}</span><span class="sp-emoji${n > 3 ? ' many' : ''}">${rand(COUNT_EMOJI).repeat(n)}</span>`;
    } else {
      spellPic.innerHTML = `<span class="sp-emoji">${item.pic}</span>`;
    }
    spellWord.innerHTML = '';
    spellWord.style.setProperty('--slots', item.word.length);
    spellSlots = [];
    for (const c of item.word) {
      const s = document.createElement('span');
      s.className = 'slot';
      if (c === ' ') s.classList.add('gap');
      else if (c === '-') { s.classList.add('sep'); s.textContent = '-'; }
      else s.textContent = c.toUpperCase();
      spellWord.appendChild(s);
      spellSlots.push({ el: s, ch: /^[A-Z]$/i.test(c) ? c.toUpperCase() : null });
    }
    spellCursor = spellSlots.findIndex((s) => s.ch && !s.el.classList.contains('filled'));
    spellMarkCursor();
    say(`Let's spell ${item.word}!`, { clip: `sword_${slug(item.word)}` });
    spellIdleSoon();
  }
  function spellMarkCursor() {
    spellSlots.forEach((s, i) => s.el.classList.toggle('cur', i === spellCursor));
  }
  function spellNav(d) {
    if (!spellTrack) return;
    const list = spellList();
    spellIdx = (spellIdx + d + list.length) % list.length;
    spellProg[spellTrack].idx = spellIdx;
    saveSpell();
    playSfx('pop');
    spellShow();
  }
  function spellInput(k) {
    if (!spellTrack || spellLock || spellDone) return;
    k = String(k).toUpperCase();
    if (!/^[A-Z]$/.test(k)) return;
    spellClearHints();
    const cur = spellSlots[spellCursor];
    if (!cur) return;
    if (k === cur.ch) {
      spellWrong = 0;
      cur.el.classList.add('filled');
      cur.el.style.color = COLORS[colorIdx++ % COLORS.length];
      playSfx('scaleNote');
      say(PHON[k], { clip: `letter_${k}` });
      const r = cur.el.getBoundingClientRect();
      sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 4);
      let next = -1;
      for (let i = spellCursor + 1; i < spellSlots.length; i++)
        if (spellSlots[i].ch && !spellSlots[i].el.classList.contains('filled')) { next = i; break; }
      spellCursor = next;
      if (next === -1) spellComplete();
      else spellMarkCursor();
    } else {
      cur.el.classList.remove('wobble');
      void cur.el.offsetWidth;
      cur.el.classList.add('wobble');
      playSfx('boing');
      spellWrong++;
      if (spellWrong >= 2) { spellPadHint(cur.ch); cur.el.classList.add('gold'); }
    }
    spellIdleSoon();
  }
  function spellComplete() {
    spellDone = true;
    spellLock = true;
    spellMarkCursor();
    const item = spellList()[spellIdx];
    spellSlots.forEach((s, i) => { s.el.style.animationDelay = (i * 0.07) + 's'; s.el.classList.add('win'); });
    playSfx('fanfare');
    const r = spellWord.getBoundingClientRect();
    sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 8);
    say(`${item.word}!`, { clip: `sdone_${slug(item.word)}` });
    const prog = spellProg[spellTrack];
    if (!prog.done.includes(item.key)) prog.done.push(item.key);
    spellCount.textContent = `${prog.done.length} / ${spellList().length}`;
    const last = spellIdx === spellList().length - 1;
    if (last) {
      sparkleBurst(r.left + r.width * 0.3, r.top + r.height / 2, 8);
      sparkleBurst(r.left + r.width * 0.7, r.top + r.height / 2, 8);
    }
    spellAdvT = setTimeout(() => {
      spellIdx = (spellIdx + 1) % spellList().length;
      spellProg[spellTrack].idx = spellIdx;
      saveSpell();
      spellShow();
    }, 3000);
  }
  spellPicker.querySelectorAll('.spell-track').forEach((b) =>
    b.addEventListener('click', () => { audio(); playSfx('ding'); spellStart(b.dataset.track); }));
  $('#spell-prev').addEventListener('click', () => { audio(); spellNav(-1); });
  $('#spell-next').addEventListener('click', () => { audio(); spellNav(1); });
  $('#spell-tracks').addEventListener('click', () => { audio(); playSfx('pop'); spellShowPicker(); });
  spellPic.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (!spellTrack) return;
    audio();
    const item = spellList()[spellIdx];
    say(`Let's spell ${item.word}!`, { clip: `sword_${slug(item.word)}` });
  });
  buildPad($('#spell-pad'), (k) => spellInput(k), { digits: false });

  // ---------- keyboard ----------
  window.addEventListener('keydown', (e) => {
    if (mode === 'home') return;
    // stop the browser from doing anything with the smashed keys
    if (!(e.ctrlKey || e.metaKey) || e.key.length === 1) e.preventDefault();
    if (e.repeat) return;
    audio();
    if (mode === 'learn') {
      if (e.key === 'Backspace' || e.key === 'Delete') { undoLast(); return; }
      if (e.key === 'Enter') { newLine(); return; }
      learnInput(e.key.length === 1 ? e.key : ' ');
    } else if (mode === 'find') {
      if (e.key.length === 1) {
        const k = e.key.toUpperCase();
        const b = findBubbles.find((x) => !x.hidden && x.dataset.ch === k);
        if (b) findPick(b);
      }
    } else if (mode === 'spell') {
      if (!spellTrack) return;
      if (e.key === 'Enter' || e.key === 'ArrowRight') { if (spellDone) spellNav(1); return; }
      if (e.key === 'ArrowLeft') { spellNav(-1); return; }
      spellInput(e.key);
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

  // release audio + DOM when the app is backgrounded (iOS PWA suspends us otherwise)
  function suspend() {
    stopAllAudio();
    if (ctx) ctx.suspend();
    clearTimeout(findTimer);
    findLocked = false;
    clearTimeout(spellIdleT);
    clearTimeout(spellAdvT);
    spellLock = false;
    layer.replaceChildren();
    document.querySelectorAll('.spark').forEach((s) => s.remove());
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) suspend(); });
  window.addEventListener('pagehide', suspend);

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
    if (voiceGain) voiceGain.gain.value = settings.volume;
    saveSettings();
  });
  $('#set-volume').addEventListener('change', () => playSfx('ding'));
})();
