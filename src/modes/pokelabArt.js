import { audio, tone } from '../core/audio.js';
import { settings } from '../core/settings.js';

// ---------- PokéLab: Procedural Code-Art Creature & Shader Engine ----------
// 100% original code-generated SVG + filter shaders + procedural DNA fusion +
// retro chiptune cries. Zero external image dependencies.

export const ELEMENT_TYPES = {
  electric: { label: 'ELECTRIC', icon: '⚡', bg: '#facc15', fg: '#1e1b4b', glow: '#fef08a', beat: ['water', 'flying'], weak: ['grass', 'dragon'] },
  fire:     { label: 'FIRE',     icon: '🔥', bg: '#ef4444', fg: '#ffffff', glow: '#fca5a5', beat: ['grass', 'ice'],    weak: ['water', 'dragon'] },
  water:    { label: 'WATER',    icon: '💧', bg: '#3b82f6', fg: '#ffffff', glow: '#93c5fd', beat: ['fire', 'electric'],weak: ['grass', 'electric'] },
  grass:    { label: 'GRASS',    icon: '🌿', bg: '#22c55e', fg: '#ffffff', glow: '#86efac', beat: ['water', 'electric'],weak: ['fire', 'ice'] },
  psychic:  { label: 'COSMIC',   icon: '🔮', bg: '#a855f7', fg: '#ffffff', glow: '#e9d5ff', beat: ['ghost', 'fighting'],weak: ['ghost', 'dark'] },
  ghost:    { label: 'SHADOW',   icon: '👻', bg: '#6366f1', fg: '#ffffff', glow: '#c7d2fe', beat: ['psychic', 'normal'],weak: ['psychic', 'dragon'] },
  dragon:   { label: 'DRAGON',   icon: '🐉', bg: '#ec4899', fg: '#ffffff', glow: '#fbcfe8', beat: ['fire', 'water', 'electric', 'grass'], weak: ['ice', 'dragon'] },
  ice:      { label: 'FROST',    icon: '❄️', bg: '#06b6d4', fg: '#ffffff', glow: '#a5f3fc', beat: ['dragon', 'grass'], weak: ['fire'] },
};

// 16 iconic base creatures with composable genetic traits
export const BASE_CREATURES = [
  {
    id: 'pikavolt', dex: 1, name: 'Pikavolt', prefix: 'Pika', suffix: 'volt',
    type1: 'electric', hp: 95, atk: 28, spd: 36, rarity: 2,
    bodyShape: 'biped', earType: 'volt', tailType: 'bolt', wingType: 'none', eyeType: 'cute', markings: 'cheeks',
    c1: '#facc15', c2: '#ef4444', c3: '#fef08a', cryPitch: 680,
    moves: [{ name: 'Volt Tackle', type: 'electric', pwr: 34 }, { name: 'Thunder Spark', type: 'electric', pwr: 24 }],
    lore: 'Stores crackling static in its rosy cheeks and releases lightning arcs when happy.',
  },
  {
    id: 'charflare', dex: 2, name: 'Charflare', prefix: 'Char', suffix: 'flare',
    type1: 'fire', hp: 115, atk: 36, spd: 30, rarity: 3,
    bodyShape: 'drake', earType: 'horns', tailType: 'flame', wingType: 'dragon', eyeType: 'fierce', markings: 'belly',
    c1: '#f97316', c2: '#fde047', c3: '#ef4444', cryPitch: 240,
    moves: [{ name: 'Inferno Blast', type: 'fire', pwr: 38 }, { name: 'Dragon Claw', type: 'dragon', pwr: 28 }],
    lore: 'Soars above volcanic peaks; the flame on its tail burns brighter against strong rivals.',
  },
  {
    id: 'bulbasprout', dex: 3, name: 'Bulbasprout', prefix: 'Bulba', suffix: 'sprout',
    type1: 'grass', hp: 110, atk: 27, spd: 25, rarity: 2,
    bodyShape: 'quad', earType: 'leaf', tailType: 'vine', wingType: 'leaf', eyeType: 'happy', markings: 'spots',
    c1: '#4ade80', c2: '#16a34a', c3: '#bef264', cryPitch: 360,
    moves: [{ name: 'Solar Beam', type: 'grass', pwr: 36 }, { name: 'Vine Whip', type: 'grass', pwr: 24 }],
    lore: 'A glowing emerald seed-bud on its back drinks in sunlight and blooms with healing pollen.',
  },
  {
    id: 'squirtwave', dex: 4, name: 'Squirtwave', prefix: 'Squirt', suffix: 'wave',
    type1: 'water', hp: 108, atk: 28, spd: 28, rarity: 2,
    bodyShape: 'turtle', earType: 'fins', tailType: 'wave', wingType: 'none', eyeType: 'cute', markings: 'shell',
    c1: '#38bdf8', c2: '#0284c7', c3: '#bae6fd', cryPitch: 440,
    moves: [{ name: 'Hydro Cannon', type: 'water', pwr: 35 }, { name: 'Bubble Jet', type: 'water', pwr: 24 }],
    lore: 'Tucks into its hydrodynamic shell and surfs across tidal waves at supersonic speed.',
  },
  {
    id: 'gengashade', dex: 5, name: 'Gengashade', prefix: 'Genga', suffix: 'shade',
    type1: 'ghost', hp: 100, atk: 35, spd: 34, rarity: 3,
    bodyShape: 'phantom', earType: 'pointed', tailType: 'shadow', wingType: 'shadow', eyeType: 'glow', markings: 'runes',
    c1: '#6366f1', c2: '#312e81', c3: '#f43f5e', cryPitch: 195,
    moves: [{ name: 'Shadow Ball', type: 'ghost', pwr: 36 }, { name: 'Nightmare Grin', type: 'psychic', pwr: 26 }],
    lore: 'Hides inside moonlit shadows and giggles with a mischievous ruby-eyed grin.',
  },
  {
    id: 'mewcosmo', dex: 6, name: 'Mewcosmo', prefix: 'Mew', suffix: 'cosmo',
    type1: 'psychic', hp: 120, atk: 38, spd: 38, rarity: 3,
    bodyShape: 'celestial', earType: 'pointed', tailType: 'comet', wingType: 'plasma', eyeType: 'mystic', markings: 'star',
    c1: '#f472b6', c2: '#c084fc', c3: '#fef08a', cryPitch: 820,
    moves: [{ name: 'Psystrike Nova', type: 'psychic', pwr: 40 }, { name: 'Starlight Pulse', type: 'dragon', pwr: 28 }],
    lore: 'Said to carry the genetic code of every creature inside its stardust DNA.',
  },
  {
    id: 'dragoking', dex: 7, name: 'Dragoking', prefix: 'Drago', suffix: 'king',
    type1: 'dragon', hp: 125, atk: 37, spd: 31, rarity: 3,
    bodyShape: 'drake', earType: 'crown', tailType: 'dragon', wingType: 'dragon', eyeType: 'cute', markings: 'belly',
    c1: '#fb923c', c2: '#14b8a6', c3: '#fef08a', cryPitch: 290,
    moves: [{ name: 'Draco Meteor', type: 'dragon', pwr: 39 }, { name: 'Thunder Wing', type: 'electric', pwr: 27 }],
    lore: 'A gentle guardian of the skies that guides lost ships safely through ocean storms.',
  },
  {
    id: 'eeveefox', dex: 8, name: 'Eeveefox', prefix: 'Eevee', suffix: 'fox',
    type1: 'electric', hp: 96, atk: 27, spd: 35, rarity: 2,
    bodyShape: 'fox', earType: 'fluffy', tailType: 'plume', wingType: 'none', eyeType: 'cute', markings: 'belly',
    c1: '#d97706', c2: '#fef3c7', c3: '#fde047', cryPitch: 610,
    moves: [{ name: 'Swift Star', type: 'electric', pwr: 28 }, { name: 'Adapt Dash', type: 'fire', pwr: 26 }],
    lore: 'Its unstable crystalline genes let it harmonize with any elemental energy around it.',
  },
  {
    id: 'lapraskate', dex: 9, name: 'Lapraskate', prefix: 'Lapra', suffix: 'skate',
    type1: 'ice', hp: 122, atk: 30, spd: 26, rarity: 3,
    bodyShape: 'turtle', earType: 'horns', tailType: 'wave', wingType: 'crystal', eyeType: 'happy', markings: 'shell',
    c1: '#38bdf8', c2: '#e0f2fe', c3: '#67e8f9', cryPitch: 520,
    moves: [{ name: 'Blizzard Beam', type: 'ice', pwr: 35 }, { name: 'Ocean Aria', type: 'water', pwr: 27 }],
    lore: 'Sings enchanting melodies across frozen seas while ferrying friends on its crystal shell.',
  },
  {
    id: 'gyaraqueous', dex: 10, name: 'Gyaraqueous', prefix: 'Gyara', suffix: 'queous',
    type1: 'water', hp: 124, atk: 38, spd: 29, rarity: 3,
    bodyShape: 'serpent', earType: 'crest', tailType: 'wave', wingType: 'fins', eyeType: 'fierce', markings: 'stripes',
    c1: '#2563eb', c2: '#fde047', c3: '#60a5fa', cryPitch: 175,
    moves: [{ name: 'Hyper Whirlpool', type: 'water', pwr: 38 }, { name: 'Dragon Tempest', type: 'dragon', pwr: 30 }],
    lore: 'Leaps over waterfalls in a golden flash and commands the seven seas.',
  },
  {
    id: 'zapwing', dex: 11, name: 'Zapwing', prefix: 'Zap', suffix: 'wing',
    type1: 'electric', hp: 116, atk: 37, spd: 37, rarity: 3,
    bodyShape: 'bird', earType: 'crest', tailType: 'bolt', wingType: 'plasma', eyeType: 'fierce', markings: 'stripes',
    c1: '#eab308', c2: '#1e1b4b', c3: '#fef08a', cryPitch: 740,
    moves: [{ name: 'Thunderbird Dive', type: 'electric', pwr: 38 }, { name: 'Sky Shock', type: 'electric', pwr: 28 }],
    lore: 'Every flap of its jagged wings summons summer lightning across the clouds.',
  },
  {
    id: 'articfrost', dex: 12, name: 'Articfrost', prefix: 'Artic', suffix: 'frost',
    type1: 'ice', hp: 118, atk: 34, spd: 33, rarity: 3,
    bodyShape: 'bird', earType: 'crown', tailType: 'comet', wingType: 'crystal', eyeType: 'mystic', markings: 'star',
    c1: '#0ea5e9', c2: '#e0f2fe', c3: '#a5f3fc', cryPitch: 790,
    moves: [{ name: 'Diamond Dust', type: 'ice', pwr: 37 }, { name: 'Aurora Gale', type: 'psychic', pwr: 27 }],
    lore: 'Freezes moisture in the air into shimmering diamond snow as it glides.',
  },
  {
    id: 'snorbliss', dex: 13, name: 'Snorbliss', prefix: 'Snor', suffix: 'bliss',
    type1: 'grass', hp: 140, atk: 29, spd: 18, rarity: 2,
    bodyShape: 'titan', earType: 'pointed', tailType: 'plume', wingType: 'none', eyeType: 'happy', markings: 'belly',
    c1: '#0f766e', c2: '#fef3c7', c3: '#5eead4', cryPitch: 145,
    moves: [{ name: 'Belly Bounce', type: 'grass', pwr: 33 }, { name: 'Mega Yawn', type: 'psychic', pwr: 25 }],
    lore: 'Eats 900 pounds of berries a day, then naps so soundly children use its belly as a trampoline.',
  },
  {
    id: 'umbreluna', dex: 14, name: 'Umbreluna', prefix: 'Umbre', suffix: 'luna',
    type1: 'ghost', hp: 112, atk: 31, spd: 33, rarity: 2,
    bodyShape: 'fox', earType: 'pointed', tailType: 'comet', wingType: 'none', eyeType: 'glow', markings: 'runes',
    c1: '#1e293b', c2: '#facc15', c3: '#38bdf8', cryPitch: 490,
    moves: [{ name: 'Moonlight Pulse', type: 'ghost', pwr: 33 }, { name: 'Eclipse Fang', type: 'psychic', pwr: 26 }],
    lore: 'The golden rings on its midnight fur glow softly whenever the full moon rises.',
  },
  {
    id: 'rayquazoid', dex: 15, name: 'Rayquazoid', prefix: 'Rayqua', suffix: 'zoid',
    type1: 'dragon', hp: 130, atk: 40, spd: 37, rarity: 3,
    bodyShape: 'serpent', earType: 'horns', tailType: 'dragon', wingType: 'plasma', eyeType: 'glow', markings: 'runes',
    c1: '#10b981', c2: '#facc15', c3: '#f43f5e', cryPitch: 215,
    moves: [{ name: 'Dragon Ascent', type: 'dragon', pwr: 42 }, { name: 'Ozone Beam', type: 'electric', pwr: 30 }],
    lore: 'Lives in the ozone layer far above the clouds, feeding on falling meteors.',
  },
  {
    id: 'arcanblaze', dex: 16, name: 'Arcanblaze', prefix: 'Arcan', suffix: 'blaze',
    type1: 'fire', hp: 118, atk: 35, spd: 35, rarity: 2,
    bodyShape: 'fox', earType: 'fluffy', tailType: 'flame', wingType: 'none', eyeType: 'fierce', markings: 'stripes',
    c1: '#ea580c', c2: '#fef3c7', c3: '#facc15', cryPitch: 310,
    moves: [{ name: 'Flare Blitz', type: 'fire', pwr: 36 }, { name: 'Extreme Dash', type: 'electric', pwr: 27 }],
    lore: 'Runs as if on wings, leaving a trail of golden embers across the prairie.',
  },
];

// Deterministic color rotation for Shiny mutations
function shinyPalette(c1, c2, c3) {
  const map = {
    '#facc15': '#f472b6', '#f97316': '#1e293b', '#4ade80': '#facc15',
    '#38bdf8': '#a855f7', '#6366f1': '#f8fafc', '#f472b6': '#38bdf8',
    '#fb923c': '#4ade80', '#d97706': '#e2e8f0', '#2563eb': '#ef4444',
    '#eab308': '#fb7185', '#0ea5e9': '#c084fc', '#0f766e': '#3b82f6',
    '#1e293b': '#0f172a', '#10b981': '#1e1b4b', '#ea580c': '#eab308',
  };
  return {
    c1: map[c1] || '#fde047',
    c2: c1 === '#1e293b' ? '#38bdf8' : '#fef08a',
    c3: '#ffffff',
  };
}

export function cloneCreature(base, { shiny = false } = {}) {
  const c = JSON.parse(JSON.stringify(base));
  c.shiny = !!shiny;
  c.uid = `${c.id}${shiny ? '_shiny' : ''}`;
  if (shiny) {
    const sp = shinyPalette(c.c1, c.c2, c.c3);
    c.c1 = sp.c1; c.c2 = sp.c2; c.c3 = sp.c3;
    c.hp = Math.round(c.hp * 1.1);
    c.atk = Math.round(c.atk * 1.1);
  }
  return c;
}

// Splice two creatures into a procedural DNA Fusion!
export function fuseCreatures(a, b, { shiny = false } = {}) {
  if (!a || !b) return cloneCreature(BASE_CREATURES[0], { shiny });
  if (a.id === b.id) return cloneCreature(a, { shiny });
  const name = a.prefix + b.suffix;
  const id = `fus_${a.id}_${b.id}`;
  let c1 = a.c1, c2 = b.c1, c3 = b.c3;
  if (shiny) {
    const sp = shinyPalette(c1, c2, c3);
    c1 = sp.c1; c2 = sp.c2; c3 = sp.c3;
  }
  return {
    id,
    uid: `${id}${shiny ? '_s' : ''}`,
    dex: `${a.dex}×${b.dex}`,
    name,
    prefix: a.prefix,
    suffix: b.suffix,
    type1: a.type1,
    type2: b.type1 !== a.type1 ? b.type1 : null,
    hp: Math.round((a.hp + b.hp) * 0.58),
    atk: Math.round((a.atk + b.atk) * 0.58),
    spd: Math.round((a.spd + b.spd) * 0.58),
    rarity: 3,
    shiny: !!shiny,
    fusion: true,
    parentA: a.id,
    parentB: b.id,
    bodyShape: b.bodyShape,
    earType: a.earType,
    tailType: b.tailType,
    wingType: b.wingType !== 'none' ? b.wingType : a.wingType,
    eyeType: a.eyeType,
    markings: b.markings,
    c1, c2, c3,
    cryPitch: Math.round((a.cryPitch + b.cryPitch) / 2),
    moves: [a.moves[0], b.moves[0]],
    lore: `A DNA fusion combining ${a.name}'s ${a.type1} instincts with ${b.name}'s ${b.type1} power.`,
  };
}

// Synthesize an authentic retro GameBoy/GBA creature cry using Web Audio
export function playCreatureCry(spec) {
  if (!settings.sfx || !spec) return;
  audio();
  const base = spec.cryPitch || 440;
  const isHeavy = spec.bodyShape === 'drake' || spec.bodyShape === 'titan' || spec.bodyShape === 'serpent';
  const wave = isHeavy ? 'sawtooth' : 'square';
  const steps = [1, 1.26, 0.92, 1.42, 1.15, 1.55];
  steps.forEach((mult, i) => {
    tone({
      type: wave,
      f0: base * mult,
      f1: base * (steps[i + 1] || 0.85),
      dur: isHeavy ? 0.095 : 0.065,
      gain: 0.14,
      delay: i * (isHeavy ? 0.065 : 0.045),
    });
  });
  if (spec.shiny) {
    [1046, 1318, 1568, 2093].forEach((f, i) =>
      tone({ type: 'sine', f0: f, f1: f * 1.05, dur: 0.1, gain: 0.11, delay: 0.28 + i * 0.05 }));
  }
}

// ---------- Procedural Vector + Shader SVG Renderer ----------
// shader: 'holo' | 'neon' | 'mosaic' | 'pixel' | 'silhouette'
let svgSeq = 0;
export function renderCreatureSvg(spec, { shader = 'holo' } = {}) {
  const uid = 'pk' + (++svgSeq);
  const tInfo = ELEMENT_TYPES[spec.type1] || ELEMENT_TYPES.electric;
  const t2Info = spec.type2 ? ELEMENT_TYPES[spec.type2] : null;
  const ink = shader === 'neon' ? '#38bdf8' : '#1e1b4b';
  const sw = shader === 'neon' ? 2.8 : 4.2;
  const O = `stroke="${ink}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;

  const fill1 = shader === 'neon' ? 'rgba(15,23,42,.85)' : `url(#${uid}-g1)`;
  const fill2 = shader === 'neon' ? 'rgba(30,27,75,.85)' : `url(#${uid}-g2)`;
  const fill3 = shader === 'neon' ? '#f472b6' : spec.c3;

  // 1. Background Sacred Geometry + Elemental Aura
  const auraHtml = buildAura(spec, tInfo, t2Info, shader);

  // 2. Wings / Back Attachments
  const wingsHtml = buildWings(spec.wingType, fill2, fill3, O);

  // 3. Tail
  const tailHtml = buildTail(spec.tailType, fill1, fill2, fill3, O);

  // 4. Ears / Horns / Crown
  const earsHtml = buildEars(spec.earType, fill1, fill2, fill3, O);

  // 5. Main Body + Markings + Limbs
  const bodyHtml = buildBody(spec.bodyShape, spec.markings, fill1, fill2, fill3, O);

  // 6. Expressive Face & Eyes
  const faceHtml = buildFace(spec.eyeType, spec.markings, spec.c2, ink, O);

  // 7. Foreground Shader Overlays (Mosaic facets, Shiny stars, Neon scanlines)
  const overlayHtml = buildShaderOverlay(spec, shader);

  const filterAttr = shader === 'pixel'
    ? `filter="url(#${uid}-px)"`
    : shader === 'silhouette'
      ? `filter="url(#${uid}-sil)"`
      : shader === 'neon'
        ? `filter="url(#${uid}-neon)"`
        : '';

  return `<svg class="pkl-svg shader-${shader}" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="${uid}-g1" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${spec.c1}"/>
        <stop offset="100%" stop-color="${spec.c2}"/>
      </linearGradient>
      <linearGradient id="${uid}-g2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${spec.c2}"/>
        <stop offset="100%" stop-color="${spec.c3}"/>
      </linearGradient>
      <radialGradient id="${uid}-aura" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${tInfo.glow}" stop-opacity="0.78"/>
        <stop offset="65%" stop-color="${t2Info ? t2Info.bg : tInfo.bg}" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="${tInfo.bg}" stop-opacity="0"/>
      </radialGradient>
      <filter id="${uid}-px" x="0%" y="0%" width="100%" height="100%">
        <feFlood x="2" y="2" height="2" width="2"/>
        <feComposite width="6" height="6"/>
        <feTile result="a"/>
        <feComposite in="SourceGraphic" in2="a" operator="in"/>
        <feMorphology operator="dilate" radius="3"/>
      </filter>
      <filter id="${uid}-sil">
        <feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.06  0 0 0 0 0.22  0 0 0 1 0"/>
      </filter>
      <filter id="${uid}-neon">
        <feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="#38bdf8" flood-opacity="0.9"/>
      </filter>
    </defs>
    ${auraHtml}
    <g class="pkl-creature-rig" ${filterAttr}>
      ${wingsHtml}
      ${tailHtml}
      ${earsHtml}
      ${bodyHtml}
      ${faceHtml}
    </g>
    ${overlayHtml}
  </svg>`;
}

function buildAura(spec, tInfo, t2Info, shader) {
  if (shader === 'neon') {
    return `
      <rect width="200" height="200" rx="24" fill="#090d16"/>
      <g stroke="rgba(56,189,248,.22)" stroke-width="1">
        <line x1="0" y1="40" x2="200" y2="40"/><line x1="0" y1="80" x2="200" y2="80"/>
        <line x1="0" y1="120" x2="200" y2="120"/><line x1="0" y1="160" x2="200" y2="160"/>
        <line x1="40" y1="0" x2="40" y2="200"/><line x1="80" y1="0" x2="80" y2="200"/>
        <line x1="120" y1="0" x2="120" y2="200"/><line x1="160" y1="0" x2="160" y2="200"/>
      </g>
      <circle cx="100" cy="100" r="76" fill="none" stroke="#f472b6" stroke-width="2" stroke-dasharray="10 6"/>`;
  }
  if (shader === 'silhouette') {
    return `
      <circle cx="100" cy="105" r="88" fill="#fde047" opacity=".9"/>
      <g stroke="#f59e0b" stroke-width="6" opacity=".45">
        <line x1="100" y1="8" x2="100" y2="192"/><line x1="8" y1="105" x2="192" y2="105"/>
        <line x1="30" y1="35" x2="170" y2="175"/><line x1="170" y1="35" x2="30" y2="175"/>
      </g>`;
  }
  return `
    <circle cx="100" cy="105" r="88" fill="url(#pk${svgSeq}-aura)"/>
    <circle cx="100" cy="105" r="72" fill="none" stroke="${tInfo.glow}" stroke-width="2.2" stroke-dasharray="8 8" opacity=".7"/>
    <polygon points="100,18 122,82 186,105 122,128 100,192 78,128 14,105 78,82" fill="${tInfo.glow}" opacity=".18"/>`;
}

function buildWings(wingType, fill2, fill3, O) {
  if (wingType === 'dragon') {
    return `<g class="pkl-wings">
      <path d="M68 92 C32 42 10 56 16 96 C26 90 42 102 52 114 Z" fill="${fill2}" ${O}/>
      <path d="M132 92 C168 42 190 56 184 96 C174 90 158 102 148 114 Z" fill="${fill2}" ${O}/>
      <path d="M62 96 C36 62 22 70 24 94 M138 96 C164 62 178 70 176 94" fill="none" stroke="${fill3}" stroke-width="3"/>
    </g>`;
  }
  if (wingType === 'plasma') {
    return `<g class="pkl-wings">
      <polygon points="68,94 12,50 28,88 8,108 58,116" fill="${fill3}" ${O}/>
      <polygon points="132,94 188,50 172,88 192,108 142,116" fill="${fill3}" ${O}/>
    </g>`;
  }
  if (wingType === 'crystal' || wingType === 'feathered') {
    return `<g class="pkl-wings">
      <path d="M68 94 Q16 54 20 88 Q12 108 58 116 Z" fill="${fill3}" ${O}/>
      <path d="M132 94 Q184 54 180 88 Q188 108 142 116 Z" fill="${fill3}" ${O}/>
    </g>`;
  }
  if (wingType === 'leaf') {
    return `<g class="pkl-wings">
      <path d="M68 78 C58 34 142 34 132 78 Z" fill="#16a34a" ${O}/>
      <path d="M100 44 L100 76" stroke="#bef264" stroke-width="4" stroke-linecap="round"/>
    </g>`;
  }
  if (wingType === 'shadow') {
    return `<g class="pkl-wings">
      <path d="M62 76 L34 48 L56 64 L44 36 L78 62 M138 76 L166 48 L144 64 L156 36 L122 62" fill="${fill2}" ${O}/>
    </g>`;
  }
  return '';
}

function buildTail(tailType, fill1, fill2, fill3, O) {
  if (tailType === 'bolt') {
    return `<polygon class="pkl-tail" points="132,134 166,108 152,98 186,66 170,114 182,122 140,148" fill="${fill3}" ${O}/>`;
  }
  if (tailType === 'flame') {
    return `<g class="pkl-tail">
      <path d="M132 138 Q166 136 172 104 Q158 118 128 124 Z" fill="${fill1}" ${O}/>
      <path d="M172 108 C160 84 176 62 184 78 C194 64 196 96 172 108 Z" fill="#ef4444" ${O}/>
      <circle cx="177" cy="92" r="7" fill="#fef08a"/>
    </g>`;
  }
  if (tailType === 'wave') {
    return `<path class="pkl-tail" d="M130 136 C168 142 188 102 162 86 C144 76 142 98 156 102 C148 118 136 122 128 124 Z" fill="${fill2}" ${O}/>`;
  }
  if (tailType === 'plume') {
    return `<path class="pkl-tail" d="M130 134 C166 142 190 104 172 80 C154 76 138 96 126 122 Z" fill="${fill2}" ${O}/>`;
  }
  if (tailType === 'comet' || tailType === 'dragon') {
    return `<g class="pkl-tail">
      <path d="M130 138 C176 144 184 82 156 64 C170 86 160 122 128 126 Z" fill="${fill1}" ${O}/>
      <polygon points="156,64 144,52 162,46 170,62" fill="${fill3}" ${O}/>
    </g>`;
  }
  return `<path class="pkl-tail" d="M130 132 Q168 120 162 96 Q146 106 126 120 Z" fill="${fill2}" ${O}/>`;
}

function buildEars(earType, fill1, fill2, fill3, O) {
  if (earType === 'volt') {
    return `<g>
      <path d="M72 68 L44 18 L86 54 Z M128 68 L156 18 L114 54 Z" fill="${fill1}" ${O}/>
      <polygon points="44,18 56,38 64,32" fill="#1e1b4b"/>
      <polygon points="156,18 144,38 136,32" fill="#1e1b4b"/>
    </g>`;
  }
  if (earType === 'horns') {
    return `<path d="M74 64 Q54 26 42 32 Q54 52 66 68 Z M126 64 Q146 26 158 32 Q146 52 134 68 Z" fill="${fill3}" ${O}/>`;
  }
  if (earType === 'crown' || earType === 'crest') {
    return `<polygon points="68,66 56,28 84,48 100,20 116,48 144,28 132,66" fill="${fill3}" ${O}/>`;
  }
  if (earType === 'fluffy') {
    return `<g>
      <ellipse cx="64" cy="46" rx="14" ry="28" transform="rotate(-24 64 46)" fill="${fill1}" ${O}/>
      <ellipse cx="136" cy="46" rx="14" ry="28" transform="rotate(24 136 46)" fill="${fill1}" ${O}/>
      <ellipse cx="64" cy="46" rx="7" ry="17" transform="rotate(-24 64 46)" fill="${fill2}"/>
      <ellipse cx="136" cy="46" rx="7" ry="17" transform="rotate(24 136 46)" fill="${fill2}"/>
    </g>`;
  }
  return `<path d="M68 68 L52 30 L88 54 Z M132 68 L148 30 L112 54 Z" fill="${fill1}" ${O}/>`;
}

function buildBody(shape, markings, fill1, fill2, fill3, O) {
  let torso = '';
  if (shape === 'serpent') {
    torso = `
      <path d="M62 158 C42 132 64 102 84 96 C64 78 72 48 100 48 C128 48 136 78 116 96 C136 102 158 132 138 158 C118 176 82 176 62 158 Z" fill="${fill1}" ${O}/>
      <ellipse cx="100" cy="128" rx="22" ry="26" fill="${fill2}"/>`;
  } else if (shape === 'phantom') {
    torso = `
      <path d="M52 156 C44 110 56 54 100 54 C144 54 156 110 148 156 L132 144 L116 158 L100 144 L84 158 L68 144 Z" fill="${fill1}" ${O}/>`;
  } else if (shape === 'titan') {
    torso = `
      <ellipse cx="54" cy="116" rx="16" ry="12" fill="${fill1}" ${O}/>
      <ellipse cx="146" cy="116" rx="16" ry="12" fill="${fill1}" ${O}/>
      <ellipse cx="74" cy="162" rx="16" ry="11" fill="${fill2}" ${O}/>
      <ellipse cx="126" cy="162" rx="16" ry="11" fill="${fill2}" ${O}/>
      <ellipse cx="100" cy="112" rx="52" ry="50" fill="${fill1}" ${O}/>
      <ellipse cx="100" cy="124" rx="36" ry="32" fill="${fill2}"/>`;
  } else {
    // Classic biped / drake / fox / turtle / bird silhouette with paws & feet
    torso = `
      <ellipse cx="58" cy="114" rx="14" ry="10" transform="rotate(-20 58 114)" fill="${fill1}" ${O}/>
      <ellipse cx="142" cy="114" rx="14" ry="10" transform="rotate(20 142 114)" fill="${fill1}" ${O}/>
      <ellipse cx="76" cy="160" rx="14" ry="10" fill="${fill1}" ${O}/>
      <ellipse cx="124" cy="160" rx="14" ry="10" fill="${fill1}" ${O}/>
      <ellipse cx="100" cy="124" rx="38" ry="36" fill="${fill1}" ${O}/>
      <ellipse cx="100" cy="130" rx="24" ry="24" fill="${fill2}"/>
      <ellipse cx="100" cy="82" rx="36" ry="32" fill="${fill1}" ${O}/>`;
  }

  let markHtml = '';
  if (markings === 'stripes') {
    markHtml = `<path d="M72 114 L86 118 M128 114 L114 118 M70 128 L86 130 M130 128 L114 130" stroke="#1e1b4b" stroke-width="4" stroke-linecap="round"/>`;
  } else if (markings === 'spots') {
    markHtml = `<circle cx="76" cy="118" r="6" fill="${fill2}"/><circle cx="124" cy="122" r="7" fill="${fill2}"/><circle cx="84" cy="142" r="5" fill="${fill2}"/>`;
  } else if (markings === 'runes' || markings === 'star') {
    markHtml = `<circle cx="100" cy="64" r="6" fill="none" stroke="${fill3}" stroke-width="3.5"/>`;
  }
  return torso + markHtml;
}

function buildFace(eyeType, markings, cheekCol, ink, O) {
  const cy = 82;
  const cheeks = markings === 'cheeks'
    ? `<circle cx="73" cy="91" r="7.5" fill="#ef4444" ${O}/><circle cx="127" cy="91" r="7.5" fill="#ef4444" ${O}/>`
    : `<ellipse cx="74" cy="90" rx="6.5" ry="4" fill="#fb7185" opacity=".6"/><ellipse cx="126" cy="90" rx="6.5" ry="4" fill="#fb7185" opacity=".6"/>`;

  let eyes = '';
  if (eyeType === 'glow') {
    eyes = `
      <polygon points="74,76 92,82 76,88" fill="#f43f5e" ${O}/>
      <polygon points="126,76 108,82 124,88" fill="#f43f5e" ${O}/>
      <circle cx="82" cy="81" r="2.2" fill="#fff"/><circle cx="118" cy="81" r="2.2" fill="#fff"/>`;
  } else if (eyeType === 'fierce') {
    eyes = `
      <circle cx="82" cy="${cy}" r="7.5" fill="${ink}"/><circle cx="118" cy="${cy}" r="7.5" fill="${ink}"/>
      <circle cx="80" cy="${cy - 2.5}" r="3" fill="#fff"/><circle cx="116" cy="${cy - 2.5}" r="3" fill="#fff"/>
      <line x1="72" y1="72" x2="90" y2="77" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>
      <line x1="128" y1="72" x2="110" y2="77" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`;
  } else {
    eyes = `
      <circle cx="82" cy="${cy}" r="7.5" fill="${ink}"/><circle cx="118" cy="${cy}" r="7.5" fill="${ink}"/>
      <circle cx="79.5" cy="${cy - 2.5}" r="3.2" fill="#fff"/><circle cx="115.5" cy="${cy - 2.5}" r="3.2" fill="#fff"/>
      <circle cx="84" cy="${cy + 2.5}" r="1.5" fill="#fff"/><circle cx="120" cy="${cy + 2.5}" r="1.5" fill="#fff"/>`;
  }

  const mouth = eyeType === 'glow'
    ? `<path d="M82 94 Q100 108 118 94 Z" fill="#fff" ${O}/>`
    : `<path d="M91 92 Q96 97 100 92 Q104 97 109 92" fill="none" stroke="${ink}" stroke-width="3.6" stroke-linecap="round"/>`;

  return `${cheeks}${eyes}${mouth}`;
}

function buildShaderOverlay(spec, shader) {
  let out = '';
  if (shader === 'mosaic') {
    out += `<g stroke="rgba(255,255,255,.55)" stroke-width="1.6" fill="none" opacity=".65">
      <polygon points="100,20 145,55 100,90 55,55" fill="rgba(255,255,255,.08)"/>
      <polygon points="55,55 100,90 60,135 25,95" fill="rgba(56,189,248,.1)"/>
      <polygon points="145,55 175,95 140,135 100,90" fill="rgba(244,114,182,.1)"/>
      <polygon points="60,135 100,90 140,135 100,175" fill="rgba(250,204,21,.1)"/>
    </g>`;
  }
  if (spec.shiny && shader !== 'silhouette') {
    out += `<g class="pkl-shiny-stars" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5">
      <polygon points="34,30 37,39 46,42 37,45 34,54 31,45 22,42 31,39"/>
      <polygon points="166,36 168,43 175,45 168,47 166,54 164,47 157,45 164,43"/>
      <polygon points="40,152 42,158 48,160 42,162 40,168 38,162 32,160 38,158"/>
    </g>`;
  }
  return out;
}
