import { settings } from './settings.js';
import { rnd } from './util.js';

// ---------- audio ----------
// All synth tones run through one lowpass-filtered master gain so they stay
// soft, and every new sound stops the previous one — nothing ever overlaps.
export let ctx = null;
export let master = null;
export let voiceGain = null;
const live = new Set();
export function audio() {
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
export function stopSfx() {
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
export function tone({ type = 'sine', f0 = 440, f1 = f0, dur = 0.25, gain = 0.25, delay = 0 }) {
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
export function playSfx(name, { overlay = false } = {}) {
  if (!settings.sfx || !SFX[name]) return;
  if (!overlay) stopSfx();
  SFX[name]();
}
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5];
let noteIdx = 0, noteTimer = null;
export const SFX = {
  pop: () => tone({ type: 'sine', f0: 550, f1: 1050, dur: 0.14, gain: 0.22 }),
  boing: () => tone({ type: 'triangle', f0: 750, f1: 160, dur: 0.42, gain: 0.18 }),
  chomp: () => {
    tone({ type: 'square', f0: 190, f1: 68, dur: 0.13, gain: 0.22 });
    tone({ type: 'sawtooth', f0: 320, f1: 95, dur: 0.1, gain: 0.14, delay: 0.03 });
    tone({ type: 'square', f0: 165, f1: 60, dur: 0.14, gain: 0.19, delay: 0.18 });
  },
  crunch: () => {
    // 3 crispy multi-layered bites + swallow gulp
    [0, 0.22, 0.44].forEach((d, i) => {
      tone({ type: 'sawtooth', f0: 260 - i * 25, f1: 65, dur: 0.13, gain: 0.2, delay: d });
      tone({ type: 'square', f0: 520 - i * 40, f1: 120, dur: 0.08, gain: 0.14, delay: d + 0.02 });
    });
    tone({ type: 'sine', f0: 320, f1: 110, dur: 0.22, gain: 0.18, delay: 0.68 });
  },
  slurp: () => {
    tone({ type: 'sine', f0: 260, f1: 980, dur: 0.36, gain: 0.18 });
    tone({ type: 'triangle', f0: 420, f1: 1280, dur: 0.28, gain: 0.14, delay: 0.12 });
    tone({ type: 'sine', f0: 760, f1: 220, dur: 0.2, gain: 0.16, delay: 0.44 });
  },
  gulp: () => {
    tone({ type: 'sine', f0: 380, f1: 110, dur: 0.22, gain: 0.2 });
    tone({ type: 'triangle', f0: 180, f1: 340, dur: 0.15, gain: 0.14, delay: 0.16 });
  },
  burp: () => {
    tone({ type: 'sawtooth', f0: 145, f1: 58, dur: 0.52, gain: 0.18, delay: 0.05 });
    tone({ type: 'square', f0: 98, f1: 72, dur: 0.38, gain: 0.12, delay: 0.12 });
  },
  giggle: () => {
    [580, 720, 640, 820, 760, 940].forEach((f, i) =>
      tone({ type: 'triangle', f0: f, f1: f * 1.18, dur: 0.09, gain: 0.16, delay: i * 0.08 }));
  },
  snore: () => {
    tone({ type: 'sawtooth', f0: 110, f1: 85, dur: 0.45, gain: 0.1 });
    tone({ type: 'sine', f0: 320, f1: 540, dur: 0.35, gain: 0.09, delay: 0.48 });
  },
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
export const SILLY = ['boing', 'slideUp', 'honk', 'laser', 'bubbles', 'quack', 'pop', 'ding'];

export function setVolume(v) {
  settings.volume = v;
  if (master) master.gain.value = v;
  if (voiceGain) voiceGain.gain.value = v;
}
export function suspendAudio() {
  if (ctx) ctx.suspend();
}
