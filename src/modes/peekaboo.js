import { loadFamily, familyMembers, playLine } from '../core/family.js';
import { rand } from '../core/util.js';
import { setArt, artHtml } from '../core/art.js';

// ---------- peekaboo mode (storybook animated SVG garden — zero overlap) ----------
const PLACEHOLDERS = [
  { id: '_daddy', name: 'Daddy', title: 'the Tickle Champion', emoji: '👨', color: '#5c7cfa' },
  { id: '_mommy', name: 'Mommy', title: 'the Hug Queen', emoji: '👩', color: '#ff5c8a' },
  { id: '_ezdan', name: 'Ezdan', title: 'the Little Superstar', emoji: '🧒', color: '#2fb8ff' },
];

const INK = '#2b1b3d';
const O = `stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"`;
const O3 = `stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`;

// Bespoke multi-part animated SVG hiding spots (parts animate open via CSS on .pk-spot.open)
const SPOT_SVGS = {
  bush: () => `
    <svg class="pk-spot-svg" viewBox="0 0 220 190" aria-hidden="true">
      <ellipse cx="110" cy="172" rx="86" ry="14" fill="rgba(0,0,0,.16)"/>
      <!-- Back bush puff -->
      <g class="pk-bush-back">
        <circle cx="110" cy="88" r="52" fill="#2d6a4f" ${O}/>
        <circle cx="72" cy="108" r="42" fill="#2d6a4f" ${O}/>
        <circle cx="148" cy="108" r="42" fill="#2d6a4f" ${O}/>
      </g>
      <!-- Left parting half -->
      <g class="pk-part-l">
        <circle cx="62" cy="126" r="40" fill="#40916c" ${O}/>
        <circle cx="88" cy="96" r="44" fill="#52b788" ${O}/>
        <circle cx="44" cy="142" r="28" fill="#52b788" ${O}/>
        <circle cx="92" cy="140" r="36" fill="#74c69d" ${O}/>
        <!-- Berries & flower -->
        <circle cx="66" cy="108" r="7" fill="#ff4d6d" ${O3}/>
        <circle cx="92" cy="78" r="7" fill="#ff4d6d" ${O3}/>
        <g transform="translate(52,134)">
          <circle cx="0" cy="-9" r="6" fill="#fff" ${O3}/><circle cx="9" cy="-3" r="6" fill="#fff" ${O3}/>
          <circle cx="6" cy="8" r="6" fill="#fff" ${O3}/><circle cx="-6" cy="8" r="6" fill="#fff" ${O3}/>
          <circle cx="-9" cy="-3" r="6" fill="#fff" ${O3}/><circle cx="0" cy="0" r="6" fill="#ffe14d" ${O3}/>
        </g>
      </g>
      <!-- Right parting half -->
      <g class="pk-part-r">
        <circle cx="158" cy="126" r="40" fill="#40916c" ${O}/>
        <circle cx="132" cy="96" r="44" fill="#52b788" ${O}/>
        <circle cx="176" cy="142" r="28" fill="#52b788" ${O}/>
        <circle cx="128" cy="140" r="36" fill="#74c69d" ${O}/>
        <circle cx="154" cy="108" r="7" fill="#ff4d6d" ${O3}/>
        <circle cx="128" cy="148" r="7" fill="#ff4d6d" ${O3}/>
        <g transform="translate(158,128)">
          <circle cx="0" cy="-9" r="6" fill="#ff9ebb" ${O3}/><circle cx="9" cy="-3" r="6" fill="#ff9ebb" ${O3}/>
          <circle cx="6" cy="8" r="6" fill="#ff9ebb" ${O3}/><circle cx="-6" cy="8" r="6" fill="#ff9ebb" ${O3}/>
          <circle cx="-9" cy="-3" r="6" fill="#ff9ebb" ${O3}/><circle cx="0" cy="0" r="6" fill="#ffe14d" ${O3}/>
        </g>
      </g>
    </svg>`,

  gift: () => `
    <svg class="pk-spot-svg" viewBox="0 0 220 190" aria-hidden="true">
      <ellipse cx="110" cy="174" rx="76" ry="13" fill="rgba(0,0,0,.16)"/>
      <!-- Inside dark box cavity -->
      <rect x="46" y="76" width="128" height="92" rx="12" fill="#7a1c3a" ${O}/>
      <!-- Front gift box body -->
      <g class="pk-box-body">
        <rect x="44" y="76" width="132" height="94" rx="14" fill="#ff5c8a" ${O}/>
        <circle cx="70" cy="104" r="8" fill="#ffc6ff"/><circle cx="150" cy="104" r="8" fill="#ffc6ff"/>
        <circle cx="70" cy="144" r="8" fill="#ffc6ff"/><circle cx="150" cy="144" r="8" fill="#ffc6ff"/>
        <rect x="96" y="76" width="28" height="94" fill="#ffe14d" ${O}/>
        <rect x="44" y="112" width="132" height="22" fill="#ffe14d" ${O}/>
      </g>
      <!-- Popping Hinged Lid + Plump Bow -->
      <g class="pk-lid">
        <path d="M110 54 C76 18 58 46 98 56 C62 52 72 68 110 56 Z" fill="#ffe14d" ${O}/>
        <path d="M110 54 C144 18 162 46 122 56 C158 52 148 68 110 56 Z" fill="#ffe14d" ${O}/>
        <circle cx="110" cy="52" r="11" fill="#ff9f1c" ${O}/>
        <rect x="36" y="54" width="148" height="28" rx="10" fill="#e63946" ${O}/>
        <rect x="95" y="54" width="30" height="28" fill="#ffe14d" ${O}/>
      </g>
    </svg>`,

  curtain: () => `
    <svg class="pk-spot-svg" viewBox="0 0 220 190" aria-hidden="true">
      <ellipse cx="110" cy="175" rx="84" ry="13" fill="rgba(0,0,0,.16)"/>
      <!-- Stage backdrop -->
      <rect x="38" y="34" width="144" height="132" rx="10" fill="#3b1d5e" ${O}/>
      <circle cx="110" cy="98" r="46" fill="#5e3582" opacity=".55"/>
      <!-- Left & Right Curtains (slide open on .open) -->
      <g class="pk-part-l">
        <path d="M40 38 L112 38 L104 162 Q72 168 40 160 Z" fill="#e63946" ${O}/>
        <path d="M58 40 Q52 100 60 160 M82 40 Q76 100 84 160" fill="none" stroke="#b91c1c" stroke-width="4" stroke-linecap="round"/>
        <path d="M40 118 Q74 128 106 114" fill="none" stroke="#ffe14d" stroke-width="6" stroke-linecap="round"/>
      </g>
      <g class="pk-part-r">
        <path d="M180 38 L108 38 L116 162 Q148 168 180 160 Z" fill="#e63946" ${O}/>
        <path d="M162 40 Q168 100 160 160 M138 40 Q144 100 136 160" fill="none" stroke="#b91c1c" stroke-width="4" stroke-linecap="round"/>
        <path d="M180 118 Q146 128 114 114" fill="none" stroke="#ffe14d" stroke-width="6" stroke-linecap="round"/>
      </g>
      <!-- Top scalloped valance & wooden pillars -->
      <rect x="30" y="30" width="16" height="140" rx="6" fill="#9c6644" ${O}/>
      <rect x="174" y="30" width="16" height="140" rx="6" fill="#9c6644" ${O}/>
      <circle cx="62" cy="44" r="18" fill="#c92a42" ${O}/><circle cx="94" cy="44" r="18" fill="#c92a42" ${O}/>
      <circle cx="126" cy="44" r="18" fill="#c92a42" ${O}/><circle cx="158" cy="44" r="18" fill="#c92a42" ${O}/>
      <rect x="26" y="20" width="168" height="20" rx="8" fill="#8a5a2b" ${O}/>
      <polygon points="110,6 115,18 128,19 118,27 121,39 110,32 99,39 102,27 92,19 105,18" fill="#ffe14d" ${O3}/>
      <rect x="24" y="158" width="172" height="16" rx="6" fill="#8a5a2b" ${O}/>
    </svg>`,

  tree: () => `
    <svg class="pk-spot-svg" viewBox="0 0 220 190" aria-hidden="true">
      <ellipse cx="110" cy="175" rx="78" ry="13" fill="rgba(0,0,0,.16)"/>
      <!-- Tree trunk & roots -->
      <path d="M62 170 Q76 140 76 88 L144 88 Q144 140 158 170 Z" fill="#9c6644" ${O}/>
      <path d="M88 96 L84 164 M132 96 L136 164" stroke="#7f4f24" stroke-width="3.5" stroke-linecap="round"/>
      <!-- Cozy dark hollow -->
      <path d="M84 166 L84 118 A26 26 0 0 1 136 118 L136 166 Z" fill="#3d2510" ${O}/>
      <!-- Swinging wooden hollow door -->
      <g class="pk-door">
        <path d="M84 166 L84 118 A26 26 0 0 1 136 118 L136 166 Z" fill="#e09f5a" ${O}/>
        <circle cx="110" cy="128" r="8" fill="#ffe14d" ${O3}/>
        <circle cx="126" cy="144" r="4" fill="${INK}"/>
      </g>
      <!-- Lush apple-tree canopy -->
      <g class="pk-crown">
        <circle cx="64" cy="74" r="38" fill="#38b000" ${O}/>
        <circle cx="156" cy="74" r="38" fill="#38b000" ${O}/>
        <circle cx="84" cy="46" r="40" fill="#52b788" ${O}/>
        <circle cx="136" cy="46" r="40" fill="#52b788" ${O}/>
        <circle cx="110" cy="58" r="44" fill="#70e000" ${O}/>
        <circle cx="68" cy="68" r="8" fill="#ff4d6d" ${O3}/>
        <circle cx="148" cy="64" r="8" fill="#ff4d6d" ${O3}/>
        <circle cx="110" cy="36" r="8" fill="#ff4d6d" ${O3}/>
      </g>
    </svg>`,
};
const SPOT_KINDS = ['bush', 'gift', 'curtain', 'tree'];

function chibiCardHtml(m) {
  const palette = ['#5c7cfa', '#ff5c8a', '#2fb8ff', '#8a63ff', '#20c997', '#ff9f1c'];
  let hash = 0;
  for (const ch of (m.id || m.name || 'a')) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  const col = m.color || palette[Math.abs(hash) % palette.length];
  if (m.image) {
    return `<div class="pk-card-inner" style="--mc:${col}">
      <img class="pk-card-photo" src="family/img/${m.image}" alt="" draggable="false"/>
      <span class="pk-card-tag">${m.name}</span>
    </div>`;
  }
  const fem = /mom|nani|dadi|khala|phupho|aunt|sis|heena|salma|tahreen|ayat|ayzal|noor/i.test(m.name || '');
  const kid = /ezdan|zohaan|ahad|baby|kid/i.test(m.name || '');
  return `<div class="pk-card-inner" style="--mc:${col}">
    <svg class="pk-chibi-svg" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="#fff5fa"/>
      <ellipse cx="60" cy="106" rx="34" ry="22" fill="${col}" ${O3}/>
      ${fem ? `<circle cx="60" cy="22" r="12" fill="#3b2847" ${O3}/>` : ''}
      <circle cx="32" cy="60" r="7" fill="#ffcdb2" ${O3}/><circle cx="88" cy="60" r="7" fill="#ffcdb2" ${O3}/>
      <circle cx="60" cy="58" r="28" fill="#ffcdb2" ${O3}/>
      <path d="M32 52 A28 26 0 0 1 88 52 Q72 40 60 44 Q46 40 32 52 Z" fill="#3b2847" ${O3}/>
      ${kid ? `<circle cx="60" cy="30" r="5.5" fill="#ffd23f" ${O3}/>` : ''}
      <ellipse cx="43" cy="65" rx="5.5" ry="3.5" fill="#ff7597" opacity=".65"/>
      <ellipse cx="77" cy="65" rx="5.5" ry="3.5" fill="#ff7597" opacity=".65"/>
      <circle cx="48" cy="58" r="4.6" fill="${INK}"/><circle cx="72" cy="58" r="4.6" fill="${INK}"/>
      <circle cx="46.5" cy="56.2" r="1.8" fill="#fff"/><circle cx="70.5" cy="56.2" r="1.8" fill="#fff"/>
      <path d="M53 66 Q60 73 67 66" fill="none" ${O3}/>
    </svg>
    <span class="pk-card-tag">${m.name}</span>
  </div>`;
}

export default {
  id: 'peekaboo',
  title: 'Peekaboo!',
  emoji: '👀',
  category: 'family',
  settings: [
    { key: 'game', label: 'Game', type: 'seg', default: 'free',
      options: [{ value: 'free', label: 'Free play' }, { value: 'where', label: "Where's…?" }] },
    { key: 'spots', label: 'Hiding spots', type: 'seg', default: 4,
      options: [{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }] },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="pk-backdrop">
        <div class="pk-sun"></div>
        <div class="pk-rainbow"></div>
        <span class="pk-cloud c1">${artHtml('☁️')}</span>
        <span class="pk-cloud c2">${artHtml('☁️')}</span>
        <div class="pk-hill h1"></div>
        <div class="pk-hill h2"></div>
        <div class="pk-fence"></div>
        <div class="pk-lawn"></div>
      </div>
      <div class="pk-stars" id="pk-stars"></div>
      <button class="pk-prompt" id="pk-prompt" hidden aria-label="Hear it again">
        <span class="pk-big">${artHtml('speaker')}</span><span class="pk-who" id="pk-who"></span>
      </button>
      <div class="pk-grid" id="pk-grid"></div>
      <div class="pk-banner" id="pk-banner">
        <span class="pk-emoji"></span>
        <span class="pk-lines"><span class="pk-name"></span><span class="pk-title"></span></span>
      </div>`;

    const gridEl = el.querySelector('#pk-grid');
    const starsEl = el.querySelector('#pk-stars');
    const promptBtn = el.querySelector('#pk-prompt');
    const whoEl = el.querySelector('#pk-who');
    const banner = el.querySelector('#pk-banner');
    const bannerEmoji = banner.querySelector('.pk-emoji');
    const bannerName = banner.querySelector('.pk-name');
    const bannerTitle = banner.querySelector('.pk-title');

    const { playSfx, effects } = ctx;
    const { sparkleBurst, confettiBurst } = effects;

    let members = [];
    let spotEls = [];
    let assigned = [];
    let openSpot = -1;
    let hideT = null, roundT = null, bannerT = null, idleT = null;
    let target = null, targetSpot = -1, wrong = 0, streak = 0, locked = false;
    let destroyed = false;

    function renderStars() {
      if (ctx.modeSettings.game !== 'where') { starsEl.innerHTML = ''; return; }
      setArt(starsEl, '⭐'.repeat(streak % 5));
    }

    function showBanner(member) {
      setArt(bannerEmoji, member.emoji || '💖');
      bannerName.textContent = member.name + '!';
      bannerTitle.textContent = member.title || '';
      bannerTitle.style.display = member.title ? '' : 'none';
      banner.classList.remove('show');
      void banner.offsetWidth;
      banner.classList.add('show');
      clearTimeout(bannerT);
      bannerT = setTimeout(() => banner.classList.remove('show'), 2500);
    }

    function scheduleIdleRustle() {
      clearTimeout(idleT);
      idleT = setTimeout(() => {
        if (destroyed || !ctx.isActive()) return;
        if (openSpot < 0 && spotEls.length) {
          const s = rand(spotEls);
          s.classList.add('peeking');
          setTimeout(() => s.classList.remove('peeking'), 1100);
        }
        scheduleIdleRustle();
      }, 3000);
    }

    function reshuffle() {
      const pool = [...members].sort(() => Math.random() - 0.5);
      assigned = spotEls.map((_, i) => pool[i % pool.length]);
      spotEls.forEach((s, i) => {
        const card = s.querySelector('.pk-char-card');
        if (card && assigned[i]) card.innerHTML = chibiCardHtml(assigned[i]);
      });
    }

    function spotCenter(i) {
      const s = spotEls[i];
      if (!s) return { x: innerWidth / 2, y: innerHeight / 2 };
      const r = s.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height * 0.35 };
    }

    function celebrate(i, member) {
      const c = spotCenter(i);
      sparkleBurst(c.x, c.y, 9);
      confettiBurst(el, c.x - el.getBoundingClientRect().left, c.y - el.getBoundingClientRect().top);
      playSfx('fanfare');
      showBanner(member);
    }

    function reveal(i) {
      if (openSpot >= 0 && openSpot !== i) hideSpot(openSpot);
      openSpot = i;
      const m = assigned[i];
      const s = spotEls[i];
      const card = s.querySelector('.pk-char-card');
      card.innerHTML = chibiCardHtml(m);
      s.classList.remove('shy-peek', 'peeking');
      s.classList.add('open');
      playSfx('ding');
      showBanner(m);
      playLine(m, 'peekaboo');
      const c = spotCenter(i);
      sparkleBurst(c.x, c.y, 7);
      clearTimeout(hideT);
      hideT = setTimeout(() => { hideSpot(i); reshuffle(); }, 3400);
    }

    function hideSpot(i) {
      if (openSpot !== i) return;
      openSpot = -1;
      if (spotEls[i]) spotEls[i].classList.remove('open', 'bounce-char');
    }

    function newWhereRound() {
      clearTimeout(roundT);
      wrong = 0;
      locked = false;
      reshuffle();
      targetSpot = Math.floor(Math.random() * spotEls.length);
      target = assigned[targetSpot];
      promptBtn.hidden = false;
      whoEl.textContent = `Where's ${target.name}?`;
      renderStars();
      playLine(target, 'where');
    }

    function tap(i) {
      if (locked || !spotEls[i]) return;
      ctx.audio();
      scheduleIdleRustle();
      const s = spotEls[i];
      if (ctx.modeSettings.game === 'where') {
        if (!target) return;
        if (i === targetSpot) {
          locked = true;
          openSpot = i;
          streak++;
          renderStars();
          const m = assigned[i];
          s.querySelector('.pk-char-card').innerHTML = chibiCardHtml(m);
          s.classList.remove('hint', 'shy-peek');
          s.classList.add('open');
          celebrate(i, m);
          playLine(m, 'fun');
          promptBtn.hidden = true;
          roundT = setTimeout(() => { hideSpot(i); newWhereRound(); }, 2700);
        } else {
          wrong++;
          const m = assigned[i];
          s.querySelector('.pk-char-card').innerHTML = chibiCardHtml(m);
          s.classList.remove('shy-peek');
          void s.offsetWidth;
          s.classList.add('shy-peek');
          setTimeout(() => s.classList.remove('shy-peek'), 950);
          playLine(m, 'name');
          playSfx('boing');
          if (wrong >= 2 && spotEls[targetSpot]) spotEls[targetSpot].classList.add('hint');
        }
      } else {
        if (openSpot === i) {
          const m = assigned[i];
          s.classList.remove('bounce-char');
          void s.offsetWidth;
          s.classList.add('bounce-char');
          const c = spotCenter(i);
          sparkleBurst(c.x, c.y, 8);
          playSfx('giggle');
          playLine(m, 'fun');
          clearTimeout(hideT);
          hideT = setTimeout(() => { hideSpot(i); reshuffle(); }, 2800);
          return;
        }
        reveal(i);
      }
    }

    promptBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (target) playLine(target, 'where');
    });

    async function start() {
      destroyed = false;
      streak = 0;
      openSpot = -1;
      locked = false;
      await loadFamily();
      members = familyMembers();
      if (!members.length) members = PLACEHOLDERS;
      const n = Math.min(4, Math.max(2, +ctx.modeSettings.spots || 4));
      gridEl.className = `pk-grid spots-${n}`;
      gridEl.innerHTML = '';
      spotEls = [];
      for (let i = 0; i < n; i++) {
        const kind = SPOT_KINDS[i % 4];
        const b = document.createElement('button');
        b.className = `pk-spot pk-${kind}`;
        b.dataset.spot = i;
        b.setAttribute('aria-label', `Hiding spot ${i + 1}`);
        b.innerHTML = `
          <span class="pk-peek-eyes">${artHtml('eyes')}</span>
          <div class="pk-char-card"></div>
          <div class="pk-spot-art">${SPOT_SVGS[kind]()}</div>`;
        b.addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          tap(i);
        });
        gridEl.appendChild(b);
        spotEls.push(b);
      }
      reshuffle();
      if (ctx.modeSettings.game === 'where') newWhereRound();
      else { promptBtn.hidden = true; starsEl.innerHTML = ''; }
      scheduleIdleRustle();
    }

    this._start = start;
    this._tap = tap;
    this._suspend = () => {
      destroyed = true;
      clearTimeout(hideT);
      clearTimeout(roundT);
      clearTimeout(bannerT);
      clearTimeout(idleT);
      openSpot = -1;
      locked = false;
      banner.classList.remove('show');
    };
    this._onKey = (e) => {
      if (['1', '2', '3', '4'].includes(e.key)) {
        const idx = +e.key - 1;
        if (idx < spotEls.length) tap(idx);
      } else if (e.key === ' ') {
        if (spotEls.length) tap(Math.floor(Math.random() * spotEls.length));
      }
    };
  },

  async enter() { await this._start(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
