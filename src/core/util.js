import { COLORS } from '../content.js';

export const $ = (s) => document.querySelector(s);
export const rand = (a) => a[Math.floor(Math.random() * a.length)];
export const rnd = (min, max) => min + Math.random() * (max - min);

export const isTouch = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
if (isTouch) document.body.classList.add('touch');

// shared color cursor so chips/bubbles keep cycling the palette across modes
let colorIdx = 0;
export const nextColor = () => COLORS[colorIdx++ % COLORS.length];
