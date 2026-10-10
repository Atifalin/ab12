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
export function playSfx(name) {
  if (!settings.sfx) return;
  stopSfx();
  SFX[name]();
}
const SCALE = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.7, 1318.5];
let noteIdx = 0, noteTimer = null;
export const SFX = {
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
export const SILLY = ['boing', 'slideUp', 'honk', 'laser', 'bubbles', 'quack', 'pop', 'ding'];

export function setVolume(v) {
  settings.volume = v;
  if (master) master.gain.value = v;
  if (voiceGain) voiceGain.gain.value = v;
}
export function suspendAudio() {
  if (ctx) ctx.suspend();
}
