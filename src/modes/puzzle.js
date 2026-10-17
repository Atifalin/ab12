import { PUZZLES } from '../content.js';
import { loadFamily, familyMembers, playLine } from '../core/family.js';
import { makeDraggable, flyFromDrop } from '../core/drag.js';
import { rand } from '../core/util.js';
import { artHtml, setArt } from '../core/art.js';

// ---------- picture puzzle mode ----------
const PUZ_KEY = 'ab12-puzzle';

export default {
  id: 'puzzle',
  title: 'Picture Puzzle',
  emoji: '🧩',
  category: 'think',
  settings: [
    { key: 'pieces', label: 'Pieces', type: 'seg', default: '4',
      options: [{ value: '2', label: '2 (Easy)' }, { value: '4', label: '4 (2×2)' }, { value: '6', label: '6 (3×2)' }] },
    { key: 'set', label: 'Pictures', type: 'seg', default: 'mix',
      options: [{ value: 'mix', label: 'Mix' }, { value: 'animals', label: 'Animals' },
                { value: 'vehicles', label: 'Vehicles' }, { value: 'fun', label: 'Fun & Family' }] },
    { key: 'ghost', label: 'Picture hint on board', type: 'toggle', default: true },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="puz-top">
        <button class="spell-nav" id="puz-prev" aria-label="Previous puzzle">◀</button>
        <div class="puz-title-pill" id="puz-title-pill">
          <span class="puz-mini-icon" id="puz-mini-icon"></span>
          <span class="puz-title" id="puz-title"></span>
        </div>
        <button class="spell-nav" id="puz-next" aria-label="Next puzzle">▶</button>
        <span class="spell-count" id="puz-count"></span>
      </div>
      <div class="puz-board-wrap">
        <div class="puz-board" id="puz-board"></div>
      </div>
      <div class="puz-tray" id="puz-tray"></div>
      <div class="pk-banner wm-banner puz-banner" id="puz-banner">
        <span class="pk-emoji"></span>
        <span class="pk-lines"><span class="pk-name"></span><span class="pk-title"></span></span>
      </div>`;

    const { say, playSfx, effects, audio } = ctx;
    const { sparkleBurst, confettiBurst } = effects;
    const board = el.querySelector('#puz-board');
    const tray = el.querySelector('#puz-tray');
    const titleEl = el.querySelector('#puz-title');
    const miniIcon = el.querySelector('#puz-mini-icon');
    const countEl = el.querySelector('#puz-count');
    const titlePill = el.querySelector('#puz-title-pill');
    const banner = el.querySelector('#puz-banner');
    const bEmoji = banner.querySelector('.pk-emoji');
    const bName = banner.querySelector('.pk-name');
    const bTitle = banner.querySelector('.pk-title');

    let list = [];
    let idx = 0;
    let done = new Set();
    let drags = [];
    let timers = [];
    let curPuz = null;
    let selectedPiece = null;
    let wrong = 0;
    let busy = false;
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearT = () => {
      timers.forEach(clearTimeout);
      timers = [];
      drags.forEach((d) => d.destroy());
      drags = [];
    };
    const save = () => localStorage.setItem(PUZ_KEY, JSON.stringify({ idx, done: [...done] }));

    function puzzleList() {
      const s = ctx.modeSettings.set || 'mix';
      let arr = s === 'mix' ? [...PUZZLES] : PUZZLES.filter((p) => p.set === s);
      if (!arr.length) arr = [...PUZZLES];
      if (s === 'mix' || s === 'fun') {
        for (const m of familyMembers()) {
          if (m.image) {
            arr.push({
              id: 'fam_' + m.id,
              title: m.name,
              emoji: '💖',
              member: m,
              bg1: '#ffe5ec', bg2: '#ffc2d1', ground: '#ff8fab', deco: ['⭐', '💖'],
            });
          }
        }
      }
      return arr;
    }

    function gridDims() {
      const p = String(ctx.modeSettings.pieces || '4');
      if (p === '2') return { cols: 2, rows: 1, total: 2 };
      if (p === '6') return { cols: 3, rows: 2, total: 6 };
      return { cols: 2, rows: 2, total: 4 };
    }

    // Build the full illustrated scene markup (sliced inside each piece & ghost board)
    function sceneMarkup(p) {
      const d1 = p.deco && p.deco[0] ? `<span class="puz-sc-d1">${artHtml(p.deco[0])}</span>` : '';
      const d2 = p.deco && p.deco[1] ? `<span class="puz-sc-d2">${artHtml(p.deco[1])}</span>` : '';
      const hero = p.member && mImg(p.member)
        ? `<img class="puz-sc-photo" src="${mImg(p.member)}" alt="" draggable="false"/>`
        : `<span class="puz-sc-hero">${artHtml(p.emoji)}</span>`;
      return `<div class="puz-scene" style="--bg1:${p.bg1};--bg2:${p.bg2};--grd:${p.ground}">
        <i class="puz-sc-hill h1"></i><i class="puz-sc-hill h2"></i>
        ${d1}${d2}${hero}
      </div>`;
    }
    function mImg(m) { return m && m.image ? `family/img/${m.image}` : null; }

    function sliceMarkup(p, col, row, cols, rows) {
      return `<div class="puz-slice" style="width:${cols * 100}%;height:${rows * 100}%;left:${-col * 100}%;top:${-row * 100}%">
        ${sceneMarkup(p)}
      </div>`;
    }

    function buildPuzzle() {
      clearT();
      busy = false;
      wrong = 0;
      selectedPiece = null;
      banner.classList.remove('show');
      board.classList.remove('completed');
      list = puzzleList();
      const p = list[idx % list.length];
      curPuz = p;
      setArt(miniIcon, p.emoji);
      titleEl.textContent = p.title;
      countEl.textContent = `${done.size} / ${list.length} ⭐`;

      const { cols, rows, total } = gridDims();
      board.style.setProperty('--cols', cols);
      board.style.setProperty('--rows', rows);
      board.classList.toggle('no-ghost', ctx.modeSettings.ghost === false);
      board.innerHTML = '';
      tray.innerHTML = '';

      const slots = [];
      for (let i = 0; i < total; i++) {
        const col = i % cols, row = Math.floor(i / cols);
        const s = document.createElement('div');
        s.className = 'puz-slot';
        s.dataset.idx = i;
        s.innerHTML = `<div class="puz-ghost">${sliceMarkup(p, col, row, cols, rows)}</div>`;
        s.addEventListener('pointerdown', (e) => {
          if (busy || s.classList.contains('filled')) return;
          if (selectedPiece && +selectedPiece.dataset.idx === i) {
            e.preventDefault();
            audio();
            snapPiece(selectedPiece, s);
          }
        });
        board.appendChild(s);
        slots.push(s);
      }

      const order = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
      order.forEach((pieceIdx) => {
        const col = pieceIdx % cols, row = Math.floor(pieceIdx / cols);
        const pc = document.createElement('div');
        pc.className = 'puz-piece';
        pc.dataset.idx = pieceIdx;
        pc.innerHTML = `${sliceMarkup(p, col, row, cols, rows)}<span class="puz-knob"></span>`;

        // Tap a piece: select it & pulse its target slot; tapping an already-selected piece auto-snaps it!
        let lastTap = 0;
        pc.addEventListener('click', () => {
          if (busy || pc._placed) return;
          audio();
          const now = performance.now();
          if (selectedPiece === pc && now - lastTap < 900) {
            snapPiece(pc, slots[pieceIdx]);
            return;
          }
          lastTap = now;
          selectedPiece = pc;
          tray.querySelectorAll('.puz-piece').forEach((x) => x.classList.toggle('sel', x === pc));
          slots.forEach((s, si) => s.classList.toggle('hint', si === pieceIdx));
          playSfx('pop');
        });

        tray.appendChild(pc);
        const drag = makeDraggable(pc, {
          zones: () => slots.filter((s) => !s.classList.contains('filled')),
          onPick: () => {
            audio();
            selectedPiece = pc;
            playSfx('pop');
          },
          onMove: (el2, x, y, zone) => {
            slots.forEach((s) => s.classList.toggle('hover', s === zone));
          },
          onDrop: (el2, zone) => {
            slots.forEach((s) => s.classList.remove('hover'));
            if (pc._placed) return true;
            if (zone && +zone.dataset.idx === pieceIdx) {
              snapPiece(pc, zone);
              return true;
            }
            wrong++;
            playSfx('boing');
            if (wrong >= 2) slots[pieceIdx].classList.add('hint');
            return false;
          },
        });
        drags.push(drag);
      });
    }

    function snapPiece(pc, slot) {
      if (pc._placed) return;
      pc._placed = true;
      selectedPiece = null;
      wrong = 0;
      board.querySelectorAll('.puz-slot').forEach((s) => s.classList.remove('hint', 'hover'));
      tray.querySelectorAll('.puz-piece').forEach((x) => x.classList.remove('sel'));

      const sr = slot.getBoundingClientRect();
      flyFromDrop(pc, sr.left + sr.width / 2, sr.top + sr.height / 2, { scale: 0.9, ms: 220, fade: true });
      slot.classList.add('filled', 'pop-in');
      playSfx('snap');
      playSfx('scaleNote', { overlay: true });
      sparkleBurst(sr.left + sr.width / 2, sr.top + sr.height / 2, 6);
      T(() => { pc.style.visibility = 'hidden'; }, 230);
      T(checkComplete, 280);
    }

    function checkComplete() {
      const slots = [...board.querySelectorAll('.puz-slot')];
      if (slots.some((s) => !s.classList.contains('filled')) || busy) return;
      busy = true;
      done.add(curPuz.id);
      save();
      countEl.textContent = `${done.size} / ${list.length} ⭐`;
      board.classList.add('completed');

      const br = board.getBoundingClientRect();
      const cx = br.left + br.width / 2, cy = br.top + br.height / 2;
      sparkleBurst(cx, cy, 12);
      confettiBurst(el, cx - el.getBoundingClientRect().left, cy - el.getBoundingClientRect().top);
      playSfx('fanfare');

      setArt(bEmoji, curPuz.emoji);
      bName.textContent = curPuz.title + '!';
      bTitle.textContent = 'Puzzle complete! ⭐';
      banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show');

      if (curPuz.member) playLine(curPuz.member, 'peekaboo');
      else say(`Hooray! You made the ${curPuz.title}!`, { clip: 'puz_' + curPuz.id });

      T(() => {
        idx = (idx + 1) % list.length;
        save();
        buildPuzzle();
      }, 3100);
    }

    // Tap the completed board or title pill to bounce & hear the title
    board.addEventListener('click', () => {
      if (!board.classList.contains('completed') || !curPuz) return;
      audio();
      board.classList.remove('completed'); void board.offsetWidth; board.classList.add('completed');
      const br = board.getBoundingClientRect();
      sparkleBurst(br.left + br.width / 2, br.top + br.height / 2, 8);
      playSfx('boing');
    });

    titlePill.addEventListener('click', () => {
      if (!curPuz) return;
      audio();
      playSfx('pop');
      if (curPuz.member) playLine(curPuz.member, 'name');
      else say(`You made the ${curPuz.title}!`, { clip: 'puz_' + curPuz.id });
    });

    el.querySelector('#puz-prev').addEventListener('click', () => {
      audio(); playSfx('pop');
      idx = (idx - 1 + list.length) % list.length;
      save(); buildPuzzle();
    });
    el.querySelector('#puz-next').addEventListener('click', () => {
      audio(); playSfx('pop');
      idx = (idx + 1) % list.length;
      save(); buildPuzzle();
    });

    this._start = async () => {
      await loadFamily();
      try {
        const j = JSON.parse(localStorage.getItem(PUZ_KEY) || '{}');
        idx = j.idx | 0;
        done = new Set(j.done || []);
      } catch (e) {}
      say('', { clip: 'puz_intro' });
      buildPuzzle();
    };
    this._suspend = () => { clearT(); };
    this._onKey = (e) => {
      if (e.key === 'ArrowLeft') el.querySelector('#puz-prev').click();
      else if (e.key === 'ArrowRight') el.querySelector('#puz-next').click();
      else if (/^[1-6]$/.test(e.key) || e.key === ' ' || e.key === 'Enter') {
        const nextPc = [...tray.querySelectorAll('.puz-piece')].find((p) => !p._placed);
        if (nextPc) {
          const slot = board.querySelector(`.puz-slot[data-idx="${nextPc.dataset.idx}"]`);
          if (slot) snapPiece(nextPc, slot);
        }
      }
    };
  },

  async enter() { await this._start(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
