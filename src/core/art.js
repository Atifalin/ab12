import { SVG_BY_ID, EMOJI_TO_ID } from './svgArt.js';

// ---------- Art & Custom Picture Override System ----------
// Renders original vector SVG illustrations (from svgArt.js) across the whole
// game, while letting the user replace any item with a custom picture in
// AB12 Studio (stored in public/pics/pics.json + public/pics/img/<file>).

let customPics = {}; // { [id]: "apple~a1b2c3.png" }
let loaded = null;

const normEmoji = (s) => String(s || '').replace(/\uFE0F/g, '').trim();

export function artId(emojiOrId) {
  if (!emojiOrId) return null;
  const raw = String(emojiOrId).trim();
  if (SVG_BY_ID[raw]) return raw;
  const n = normEmoji(raw);
  return EMOJI_TO_ID[n] || EMOJI_TO_ID[raw] || null;
}

function splitGraphemes(str) {
  const s = String(str || '');
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)].map((x) => x.segment);
  }
  return Array.from(s);
}

function singleArtHtml(id, extraClass = '') {
  const cls = ('art-svg ' + extraClass).trim();
  const custom = customPics[id];
  if (custom) {
    return `<img class="${cls} art-custom" src="pics/img/${custom}" alt="" draggable="false" />`;
  }
  const body = SVG_BY_ID[id];
  if (!body) return '';
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">${body}</svg>`;
}

export function artHtml(emojiOrId, { className = '' } = {}) {
  if (emojiOrId == null || emojiOrId === '') return '';
  const str = String(emojiOrId).trim();
  // Plain ASCII single letter/number (e.g. Sort it! letters/numbers) stays text
  if (/^[A-Za-z0-9]$/.test(str)) return str;

  const direct = artId(str);
  if (direct) return singleArtHtml(direct, className);

  // Multi-emoji strings (e.g. counting "🍎🍎🍎") -> render each grapheme as SVG/custom art
  const parts = splitGraphemes(str).filter((g) => g.trim());
  if (parts.length > 1) {
    return parts.map((g) => {
      const id = artId(g);
      return id
        ? `<span class="art-unit">${singleArtHtml(id, className)}</span>`
        : `<span class="art-unit">${g}</span>`;
    }).join('');
  }
  return str;
}

export function setArt(el, emojiOrId, opts = {}) {
  if (!el) return;
  if (!emojiOrId) {
    delete el.dataset.art;
    el.innerHTML = '';
    return;
  }
  el.dataset.art = String(emojiOrId);
  if (opts.className) el.dataset.artClass = opts.className;
  el.innerHTML = artHtml(emojiOrId, opts);
}

export function refreshMountedArt() {
  if (typeof document === 'undefined') return;
  document.querySelectorAll('[data-art]').forEach((el) => {
    const key = el.dataset.art;
    const className = el.dataset.artClass || '';
    if (key) el.innerHTML = artHtml(key, { className });
  });
}

export function loadPics() {
  if (loaded) return loaded;
  if (typeof fetch === 'undefined') return Promise.resolve();
  loaded = fetch(`pics/pics.json?v=${Date.now()}`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => {
      if (j && j.pics && typeof j.pics === 'object') {
        customPics = j.pics;
        refreshMountedArt();
      }
    })
    .catch(() => {});
  return loaded;
}
loadPics();

export const getCustomPic = (idOrEmoji) => {
  const id = artId(idOrEmoji);
  return id && customPics[id] ? `pics/img/${customPics[id]}` : null;
};

export function svgMarkupFor(idOrEmoji) {
  const id = artId(idOrEmoji);
  if (!id || !SVG_BY_ID[id]) return null;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${SVG_BY_ID[id]}</svg>`;
}
