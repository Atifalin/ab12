import { BUILD_VEHICLES } from '../content.js';
import { loadFamily, familyMembers, playLine } from '../core/family.js';
import { sayUrls } from '../core/voice.js';
import { makeDraggable, flyFromDrop } from '../core/drag.js';
import { rand, rnd } from '../core/util.js';
import { artHtml, setArt } from '../core/art.js';

// ---------- build & go! (toddler garage + interactive launch ride) ----------
let customRecipes = [];
function loadCustomRecipes() {
  return fetch(`recipes/recipes.json?v=${Date.now()}`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => { if (j && Array.isArray(j.recipes)) customRecipes = j.recipes; })
    .catch(() => {});
}
const INK = '#2b1b3d';
const O = `stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"`;

// Custom 3-part SVG artwork for each vehicle: [part0 (top/front), part1 (cabin), part2 (wheels/thrusters)]
const VEHICLE_PARTS_SVG = {
  rocket: [
    `<svg viewBox="0 0 120 90"><path d="M60 8 C38 28 32 54 32 78 L88 78 C88 54 82 28 60 8 Z" fill="#e63946" ${O}/><circle cx="60" cy="54" r="10" fill="#ffd23f" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><rect x="28" y="8" width="64" height="74" rx="12" fill="#ffffff" ${O}/><rect x="28" y="64" width="64" height="14" fill="#3a86ff" ${O}/><circle cx="60" cy="40" r="21" fill="#bfeaff" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><path d="M28 12 L10 56 L36 48 Z M92 12 L110 56 L84 48 Z" fill="#e63946" ${O}/><rect x="38" y="8" width="44" height="28" rx="6" fill="#64748b" ${O}/><path d="M44 36 L36 82 L60 66 L84 82 L76 36 Z" fill="#ff9f1c" ${O}/></svg>`,
  ],
  firetruck: [
    `<svg viewBox="0 0 120 90"><rect x="14" y="42" width="92" height="18" rx="6" fill="#ffd23f" ${O}/><line x1="26" y1="42" x2="26" y2="60" ${O}/><line x1="50" y1="42" x2="50" y2="60" ${O}/><line x1="74" y1="42" x2="74" y2="60" ${O}/><rect x="76" y="18" width="20" height="18" rx="8" fill="#2fb8ff" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><path d="M12 18 L86 18 Q106 18 108 42 L108 78 L12 78 Z" fill="#e63946" ${O}/><rect x="12" y="54" width="96" height="10" fill="#ffffff"/><circle cx="72" cy="44" r="20" fill="#bfeaff" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><rect x="14" y="14" width="92" height="22" rx="8" fill="#cbd5e1" ${O}/><circle cx="34" cy="52" r="24" fill="#3b3355" ${O}/><circle cx="34" cy="52" r="10" fill="#ffd23f"/><circle cx="86" cy="52" r="24" fill="#3b3355" ${O}/><circle cx="86" cy="52" r="10" fill="#ffd23f"/></svg>`,
  ],
  train: [
    `<svg viewBox="0 0 120 90"><path d="M28 22 L52 22 L46 74 L34 74 Z" fill="#e63946" ${O}/><ellipse cx="40" cy="20" rx="16" ry="7" fill="#ffd23f" ${O}/><circle cx="76" cy="24" r="14" fill="#fff" ${O}/><circle cx="94" cy="16" r="10" fill="#fff" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><rect x="14" y="30" width="46" height="48" rx="8" fill="#3a86ff" ${O}/><rect x="54" y="12" width="54" height="66" rx="10" fill="#e63946" ${O}/><circle cx="81" cy="42" r="19" fill="#bfeaff" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><polygon points="6,66 24,36 24,66" fill="#ffd23f" ${O}/><rect x="20" y="20" width="88" height="18" rx="6" fill="#3b3355" ${O}/><circle cx="36" cy="54" r="22" fill="#e63946" ${O}/><circle cx="68" cy="56" r="18" fill="#ffd23f" ${O}/><circle cx="96" cy="56" r="18" fill="#e63946" ${O}/><line x1="36" y1="54" x2="96" y2="56" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>`,
  ],
  monstertruck: [
    `<svg viewBox="0 0 120 90"><rect x="30" y="36" width="60" height="28" rx="8" fill="#ff9f1c" ${O}/><circle cx="42" cy="24" r="10" fill="#ffe14d" ${O}/><circle cx="78" cy="24" r="10" fill="#ffe14d" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><path d="M12 76 L18 32 L38 14 L84 14 L106 40 L108 76 Z" fill="#38b000" ${O}/><path d="M22 54 L46 42 L42 58 L66 46" fill="none" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"/><circle cx="64" cy="42" r="20" fill="#bfeaff" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><path d="M28 16 L44 38 M92 16 L76 38" stroke="#ff4d6d" stroke-width="8" stroke-linecap="round"/><circle cx="34" cy="52" r="28" fill="#3b3355" ${O}/><circle cx="34" cy="52" r="12" fill="#70e000" ${O}/><circle cx="86" cy="52" r="28" fill="#3b3355" ${O}/><circle cx="86" cy="52" r="12" fill="#70e000" ${O}/></svg>`,
  ],
  submarine: [
    `<svg viewBox="0 0 120 90"><path d="M54 74 L54 24 L78 24" fill="none" stroke="#ff9f1c" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="M54 74 L54 24 L78 24" fill="none" ${O}/><circle cx="80" cy="24" r="9" fill="#bfeaff" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><ellipse cx="60" cy="46" rx="48" ry="32" fill="#ffd23f" ${O}/><circle cx="64" cy="46" r="20" fill="#bfeaff" ${O}/><circle cx="28" cy="46" r="7" fill="#ff9f1c" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><ellipse cx="22" cy="30" rx="10" ry="22" fill="#ff5c8a" ${O}/><ellipse cx="22" cy="64" rx="10" ry="22" fill="#ff5c8a" ${O}/><rect x="28" y="34" width="68" height="24" rx="10" fill="#ff9f1c" ${O}/></svg>`,
  ],
  plane: [
    `<svg viewBox="0 0 120 90"><polygon points="36,74 60,16 84,74" fill="#ff5c8a" ${O}/><ellipse cx="60" cy="22" rx="28" ry="7" fill="#ffd23f" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><ellipse cx="60" cy="46" rx="48" ry="28" fill="#ffffff" ${O}/><path d="M18 46 L102 46" stroke="#2fb8ff" stroke-width="8"/><circle cx="64" cy="42" r="20" fill="#bfeaff" ${O}/></svg>`,
    `<svg viewBox="0 0 120 90"><path d="M8 22 L112 22 L96 50 L24 50 Z" fill="#ff5c8a" ${O}/><circle cx="42" cy="68" r="14" fill="#3b3355" ${O}/><circle cx="78" cy="68" r="14" fill="#3b3355" ${O}/></svg>`,
  ],
};

const DEFAULT_DRIVERS = [
  { id: '_ezdan', name: 'Ezdan', emoji: '🧒' },
  { id: '_daddy', name: 'Daddy', emoji: '👨' },
  { id: '_mommy', name: 'Mommy', emoji: '👩' },
  { id: '_dog',   name: 'Puppy', emoji: '🐶' },
  { id: '_cat',   name: 'Kitty', emoji: '🐱' },
  { id: '_lion',  name: 'Lion',  emoji: '🦁' },
];

export default {
  id: 'buildgo',
  title: 'Build & Go!',
  emoji: '🚀',
  category: 'play',
  settings: [
    { key: 'parts', label: 'Parts to snap', type: 'seg', default: '3',
      options: [{ value: '2', label: '2 (Easy)' }, { value: '3', label: '3 (Full)' }] },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="bg-sky" id="bg-sky"></div>
      <div class="bg-topbar">
        <button class="spell-nav" id="bg-prev" aria-label="Previous vehicle">◀</button>
        <div class="bg-vtabs" id="bg-vtabs"></div>
        <button class="spell-nav" id="bg-next" aria-label="Next vehicle">▶</button>
      </div>
      <div class="bg-drivers" id="bg-drivers"></div>
      <div class="bg-stage" id="bg-stage">
        <div class="bg-craft" id="bg-craft"></div>
        <button class="bg-go-btn" id="bg-go-btn" hidden>GO! 🚀</button>
      </div>
      <div class="bg-tray" id="bg-tray"></div>
      <div class="bg-targets" id="bg-targets"></div>
      <div class="pk-banner wm-banner bg-banner" id="bg-banner">
        <span class="pk-emoji"></span>
        <span class="pk-lines"><span class="pk-name"></span><span class="pk-title"></span></span>
      </div>`;

    const { say, playSfx, effects, audio } = ctx;
    const { sparkleBurst, confettiBurst } = effects;
    const vtabs = el.querySelector('#bg-vtabs');
    const driversEl = el.querySelector('#bg-drivers');
    const craft = el.querySelector('#bg-craft');
    const goBtn = el.querySelector('#bg-go-btn');
    const tray = el.querySelector('#bg-tray');
    const targetsEl = el.querySelector('#bg-targets');
    const banner = el.querySelector('#bg-banner');
    const bEmoji = banner.querySelector('.pk-emoji');
    const bName = banner.querySelector('.pk-name');
    const bTitle = banner.querySelector('.pk-title');

    let vIdx = 0;
    let drivers = [];
    let curDriver = null;
    let drags = [];
    let timers = [];
    let riding = false;
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearT = () => {
      timers.forEach(clearTimeout);
      timers = [];
      drags.forEach((d) => d.destroy());
      drags = [];
    };

    function driverHtml(d) {
      if (d && d.image) return `<img class="bg-drv-img" src="family/img/${d.image}" alt="" draggable="false"/>`;
      return `<span class="bg-drv-art">${artHtml((d && d.emoji) || '🧒')}</span>`;
    }

    function renderDrivers() {
      const fam = familyMembers().map((m) => ({ id: m.id, name: m.name, image: m.image, emoji: '💖', member: m }));
      drivers = [...fam, ...DEFAULT_DRIVERS];
      if (!curDriver || !drivers.find((x) => x.id === curDriver.id)) curDriver = drivers[0];
      driversEl.innerHTML = drivers.slice(0, 7).map((d) => `
        <button class="bg-drv-btn ${d.id === curDriver.id ? 'on' : ''}" data-did="${d.id}" title="${d.name}">
          ${driverHtml(d)}
        </button>`).join('');
      driversEl.querySelectorAll('.bg-drv-btn').forEach((b) => {
        b.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          audio();
          const d = drivers.find((x) => x.id === b.dataset.did);
          if (!d) return;
          curDriver = d;
          renderDrivers();
          const win = craft.querySelector('.bg-cockpit');
          if (win) win.innerHTML = driverHtml(curDriver);
          playSfx('pop');
          if (d.member) playLine(d.member, 'name');
        });
      });
    }

    function allVehicles() {
      const custom = customRecipes.map((r) => ({
        id: 'rc_' + r.id,
        rawId: r.id,
        name: r.name,
        emoji: '🚀',
        sfx: r.sfx || 'vroom',
        go: r.go || `Go ${r.name}!`,
        env: r.env || 'road',
        targets: ['⭐', '🎈', '☁️', '🫧'],
        customImg: r.image ? `recipes/img/${r.image}` : null,
        customParts: (r.parts || []).map((p) => `recipes/img/${p}`),
        lines: r.lines || {},
      }));
      return [...custom, ...BUILD_VEHICLES];
    }

    function speakVehicle(v, kind) {
      if (v.rawId) {
        const line = kind === 'go' ? 'go' : 'name';
        const text = kind === 'go' ? v.go : `${v.name}!`;
        const urls = [];
        const takes = (v.lines || {})[line] || [];
        if (takes.length) urls.push(`recipes/audio/${v.rawId}/${rand(takes)}`);
        urls.push(`recipes/audio/${v.rawId}/tara_${line}.m4a`);
        sayUrls(text, urls);
        return;
      }
      if (kind === 'go') say(v.go, { clip: 'bg_go_' + v.id });
      else say(v.name + '!', { clip: 'bg_v_' + v.id });
    }

    function partHtmlFor(v, pi) {
      if (v.customParts && v.customParts[pi]) {
        return `<img class="bg-part-img" src="${v.customParts[pi]}" alt="" draggable="false"/>`;
      }
      if (v.customImg) {
        return `<div class="bg-slice-wrap"><img class="bg-slice-img" style="top:${-pi * 100}%" src="${v.customImg}" alt="" draggable="false"/></div>`;
      }
      const partsSvg = VEHICLE_PARTS_SVG[v.id] || VEHICLE_PARTS_SVG.rocket;
      return partsSvg[pi];
    }

    function renderVTabs() {
      const list = allVehicles();
      vtabs.innerHTML = list.map((v, i) => `
        <button class="bg-vtab ${i === vIdx ? 'on' : ''}" data-vi="${i}" title="${v.name}">
          ${v.customImg ? `<img src="${v.customImg}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" alt=""/>` : artHtml(v.emoji)}
        </button>`).join('');
      vtabs.querySelectorAll('.bg-vtab').forEach((b) => {
        b.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          audio();
          vIdx = +b.dataset.vi;
          playSfx('pop');
          buildGarage();
        });
      });
    }

    function buildGarage() {
      clearT();
      riding = false;
      const list = allVehicles();
      const v = list[vIdx % list.length];
      el.className = `screen active bg-env-${v.env}`;
      goBtn.hidden = true;
      tray.hidden = false;
      driversEl.hidden = false;
      targetsEl.innerHTML = '';
      banner.classList.remove('show');
      craft.className = 'bg-craft';
      renderVTabs();
      renderDrivers();

      speakVehicle(v, 'name');

      const easy2 = ctx.modeSettings.parts === '2';
      craft.innerHTML = '';
      tray.innerHTML = '';

      const slots = [0, 1, 2].map((pi) => {
        const s = document.createElement('div');
        s.className = 'bg-slot bg-slot-' + pi;
        s.dataset.pi = pi;
        s.innerHTML = `<div class="bg-slot-art">${partHtmlFor(v, pi)}</div>${pi === 1 ? `<div class="bg-cockpit">${driverHtml(curDriver)}</div>` : ''}`;
        if (easy2 && pi === 1) s.classList.add('filled');
        craft.appendChild(s);
        return s;
      });

      const order = [0, 1, 2].filter((pi) => !(easy2 && pi === 1)).sort(() => Math.random() - 0.5);
      order.forEach((pi) => {
        const p = document.createElement('div');
        p.className = 'bg-part';
        p.dataset.pi = pi;
        p.innerHTML = partHtmlFor(v, pi);

        // Tap OR drag a part to snap it right onto the blueprint!
        p.addEventListener('click', () => {
          if (p._placed || riding) return;
          audio();
          snapPart(p, slots[pi]);
        });

        tray.appendChild(p);
        const drag = makeDraggable(p, {
          zones: () => slots.filter((s) => !s.classList.contains('filled')),
          onPick: () => { audio(); playSfx('pop'); },
          onMove: (el2, x, y, zone) => {
            slots.forEach((s) => s.classList.toggle('hover', s === zone));
          },
          onDrop: (el2, zone) => {
            slots.forEach((s) => s.classList.remove('hover'));
            if (p._placed) return true;
            if (zone && (+zone.dataset.pi === pi || slots.includes(zone))) {
              snapPart(p, slots[pi]);
              return true;
            }
            playSfx('boing');
            return false;
          },
        });
        drags.push(drag);
      });
    }

    function snapPart(p, slot) {
      if (p._placed) return;
      p._placed = true;
      const sr = slot.getBoundingClientRect();
      flyFromDrop(p, sr.left + sr.width / 2, sr.top + sr.height / 2, { scale: 0.9, ms: 220, fade: true });
      slot.classList.add('filled', 'snap-pop');
      playSfx('snap');
      sparkleBurst(sr.left + sr.width / 2, sr.top + sr.height / 2, 7);
      T(() => { p.style.visibility = 'hidden'; }, 220);

      const allFilled = [...craft.querySelectorAll('.bg-slot')].every((s) => s.classList.contains('filled'));
      if (allFilled) {
        T(() => {
          tray.hidden = true;
          goBtn.hidden = false;
          playSfx('ding');
          say('All built! Press the big GO button!', { clip: 'bg_ready' });
        }, 320);
      } else {
        say('Click! That fits!', { clip: 'bg_snap' });
      }
    }

    function launchRide() {
      if (riding) return;
      riding = true;
      audio();
      goBtn.hidden = true;
      driversEl.hidden = true;
      const list = allVehicles();
      const v = list[vIdx % list.length];
      craft.classList.add('riding', 'ride-' + v.env);
      playSfx(v.sfx || 'vroom');
      speakVehicle(v, 'go');

      setArt(bEmoji, v.emoji);
      bName.textContent = v.name + '!';
      bTitle.textContent = v.go;
      banner.classList.remove('show'); void banner.offsetWidth; banner.classList.add('show');

      const cr = craft.getBoundingClientRect();
      sparkleBurst(cr.left + cr.width / 2, cr.top + cr.height / 2, 10);
      confettiBurst(el, cr.left + cr.width / 2, cr.top + cr.height / 2);

      // Spawn interactive floating targets to pop during the ride!
      for (let i = 0; i < 7; i++) {
        T(() => {
          if (!riding) return;
          const t = document.createElement('button');
          t.className = 'bg-target';
          const em = rand(v.targets);
          t.style.top = rnd(18, 68) + '%';
          t.innerHTML = artHtml(em);
          t.addEventListener('pointerdown', (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            audio();
            const tr = t.getBoundingClientRect();
            sparkleBurst(tr.left + tr.width / 2, tr.top + tr.height / 2, 7);
            confettiBurst(el, tr.left + tr.width / 2, tr.top + tr.height / 2);
            playSfx('pop');
            t.remove();
          });
          targetsEl.appendChild(t);
          T(() => t.remove(), 3400);
        }, i * 550);
      }

      T(() => {
        playSfx('fanfare');
        confettiBurst(el, innerWidth * 0.3, innerHeight * 0.35);
        confettiBurst(el, innerWidth * 0.7, innerHeight * 0.35);
      }, 4200);

      T(() => {
        const list = allVehicles();
        vIdx = (vIdx + 1) % list.length;
        buildGarage();
      }, 5800);
    }

    // Tapping the assembled vehicle during the ride does a stunt jump/spin + horn!
    craft.addEventListener('pointerdown', (e) => {
      if (!riding) return;
      e.preventDefault();
      audio();
      craft.classList.remove('stunt'); void craft.offsetWidth; craft.classList.add('stunt');
      const list = allVehicles();
      const v = list[vIdx % list.length];
      const cr = craft.getBoundingClientRect();
      sparkleBurst(cr.left + cr.width / 2, cr.top + cr.height / 2, 8);
      playSfx(v.sfx || 'honk');
      if (curDriver && curDriver.member) playLine(curDriver.member, 'fun');
    });

    goBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      launchRide();
    });

    el.querySelector('#bg-prev').addEventListener('click', () => {
      audio(); playSfx('pop');
      const list = allVehicles();
      vIdx = (vIdx - 1 + list.length) % list.length;
      buildGarage();
    });
    el.querySelector('#bg-next').addEventListener('click', () => {
      audio(); playSfx('pop');
      const list = allVehicles();
      vIdx = (vIdx + 1) % list.length;
      buildGarage();
    });

    this._start = async () => {
      await Promise.all([loadFamily(), loadCustomRecipes()]);
      say('', { clip: 'bg_intro' });
      buildGarage();
    };
    this._suspend = () => { clearT(); riding = false; };
    this._onKey = (e) => {
      if (e.key === 'ArrowLeft') el.querySelector('#bg-prev').click();
      else if (e.key === 'ArrowRight') el.querySelector('#bg-next').click();
      else if (e.key === ' ' || e.key === 'Enter' || /^[1-3]$/.test(e.key)) {
        if (!goBtn.hidden) { launchRide(); return; }
        if (riding) { craft.dispatchEvent(new PointerEvent('pointerdown')); return; }
        const nextPart = [...tray.querySelectorAll('.bg-part')].find((p) => !p._placed);
        if (nextPart) {
          const slot = craft.querySelector(`.bg-slot[data-pi="${nextPart.dataset.pi}"]`);
          if (slot) snapPart(nextPart, slot);
        }
      }
    };
  },

  async enter() { await this._start(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
