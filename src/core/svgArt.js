// Original storybook vector SVG illustrations for AB12.
// Every illustration uses a 100x100 viewBox, rounded #2b1b3d outlines,
// soft highlights and kawaii expressions so the whole game shares one
// cohesive illustrated art style (with zero dependency on OS emoji fonts).

const INK = '#2b1b3d';
const O = `stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"`;
const O3 = `stroke="${INK}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"`;

// Kawaii eyes + rosy cheeks helper
const eyes = (y = 48, dx = 15, r = 4.6) => `
  <circle cx="${50 - dx}" cy="${y}" r="${r + 2.2}" fill="#ff9ebb" opacity=".55" transform="translate(-4,7)"/>
  <circle cx="${50 + dx}" cy="${y}" r="${r + 2.2}" fill="#ff9ebb" opacity=".55" transform="translate(4,7)"/>
  <circle cx="${50 - dx}" cy="${y}" r="${r}" fill="${INK}"/>
  <circle cx="${50 + dx}" cy="${y}" r="${r}" fill="${INK}"/>
  <circle cx="${50 - dx - 1.4}" cy="${y - 1.6}" r="${r * 0.38}" fill="#fff"/>
  <circle cx="${50 + dx - 1.4}" cy="${y - 1.6}" r="${r * 0.38}" fill="#fff"/>`;

const smile = (y = 55, w = 7) =>
  `<path d="M${50 - w} ${y} Q50 ${y + w * 0.85} ${50 + w} ${y}" fill="none" ${O3}/>`;

// Cute round animal head template for fast, expressive animal portraits
function animalHead({ bg, ears, innerEar, muzzle, nose, extra = '', eyeY = 47, eyeDx = 15 }) {
  return `${ears || ''}${innerEar || ''}
    <ellipse cx="50" cy="54" rx="32" ry="29" fill="${bg}" ${O}/>
    <path d="M30 34 Q42 27 56 31" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55"/>
    ${muzzle || ''}${eyes(eyeY, eyeDx)}${nose || ''}${extra}`;
}

// Vehicle template (side-view chunky toy vehicle)
function toyVehicle({ body, roof, top = '', stripe = '', win = '#bfeaff' }) {
  return `
    ${top}
    <path d="M12 62 L16 44 Q18 38 25 38 L36 26 Q40 22 48 22 L70 22 Q78 22 81 30 L86 42 Q92 44 92 52 L92 64 Q92 68 87 68 L15 68 Q10 68 12 62 Z" fill="${body}" ${O}/>
    ${roof ? `<path d="M35 38 L42 26 L72 26 L77 38 Z" fill="${roof}" ${O3}/>` : `<path d="M38 38 L44 27 L69 27 L74 38 Z" fill="${win}" ${O3}/>`}
    ${stripe}
    <circle cx="20" cy="52" r="4" fill="#ffe94d" ${O3}/>
    <circle cx="30" cy="68" r="11" fill="#3b3355" ${O}/><circle cx="30" cy="68" r="4.8" fill="#d9e2ec"/>
    <circle cx="72" cy="68" r="11" fill="#3b3355" ${O}/><circle cx="72" cy="68" r="4.8" fill="#d9e2ec"/>`;
}

// ---------- Canonical SVG definitions keyed by item id ----------
export const SVG_BY_ID = {
  // === FRUITS & FOODS ===
  apple: `
    <path d="M50 24 Q52 12 60 10" fill="none" stroke="#7c4dff" ${O}/>
    <path d="M52 21 Q66 10 72 21 Q62 28 52 21 Z" fill="#4cd964" ${O}/>
    <path d="M50 26 C32 22 16 36 18 57 C20 76 35 88 46 86 C50 85 50 85 54 86 C65 88 80 76 82 57 C84 36 68 22 50 26 Z" fill="#ff4d6d" ${O}/>
    <path d="M28 38 Q24 50 28 62" fill="none" stroke="#ff9ebb" stroke-width="5" stroke-linecap="round" opacity=".75"/>
    ${eyes(54, 13, 4)}${smile(61, 6)}`,

  greenapple: `
    <path d="M50 24 Q52 12 60 10" fill="none" ${O}/>
    <path d="M52 21 Q66 10 72 21 Q62 28 52 21 Z" fill="#38b000" ${O}/>
    <path d="M50 26 C32 22 16 36 18 57 C20 76 35 88 46 86 C50 85 50 85 54 86 C65 88 80 76 82 57 C84 36 68 22 50 26 Z" fill="#80ed99" ${O}/>
    <path d="M28 38 Q24 50 28 62" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".65"/>
    ${eyes(54, 13, 4)}${smile(61, 6)}`,

  banana: `
    <path d="M22 72 C32 88 68 84 82 48 C88 32 82 18 76 16 C71 14 70 22 66 34 C56 60 36 66 24 62 C18 60 18 66 22 72 Z" fill="#ffe14d" ${O}/>
    <path d="M34 73 C50 76 68 64 76 40" fill="none" stroke="#fff5b8" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M74 15 L81 12 L82 19 Z" fill="#8a5a2b" ${O3}/>
    ${eyes(57, 10, 3.6)}${smile(63, 5)}`,

  strawberry: `
    <path d="M50 24 C26 24 20 46 28 66 C35 82 44 88 50 88 C56 88 65 82 72 66 C80 46 74 24 50 24 Z" fill="#ff4d6d" ${O}/>
    <path d="M32 24 L42 30 L50 22 L58 30 L68 24 L60 16 L50 20 L40 16 Z" fill="#4cd964" ${O3}/>
    <circle cx="37" cy="44" r="2" fill="#ffe94d"/><circle cx="63" cy="44" r="2" fill="#ffe94d"/>
    <circle cx="44" cy="72" r="2" fill="#ffe94d"/><circle cx="56" cy="72" r="2" fill="#ffe94d"/>
    ${eyes(53, 12, 3.8)}${smile(60, 5)}`,

  orange: `
    <circle cx="50" cy="54" r="32" fill="#ff922b" ${O}/>
    <path d="M52 22 Q64 11 70 21 Q60 28 52 22 Z" fill="#4cd964" ${O3}/>
    <path d="M28 38 Q24 48 27 58" fill="none" stroke="#ffd8a8" stroke-width="4.5" stroke-linecap="round"/>
    ${eyes(53, 13, 4)}${smile(60, 6)}`,

  lemon: `
    <path d="M14 52 Q20 26 50 26 Q80 26 86 52 Q80 78 50 78 Q20 78 14 52 Z" fill="#ffe94d" ${O}/>
    <path d="M28 38 Q42 31 58 34" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    ${eyes(51, 13, 4)}${smile(58, 5.5)}`,

  watermelon: `
    <path d="M14 38 A36 36 0 0 0 86 38 Z" fill="#38b000" ${O}/>
    <path d="M20 38 A30 30 0 0 0 80 38 Z" fill="#ff5c8a"/>
    <circle cx="38" cy="56" r="2.3" fill="${INK}"/><circle cx="50" cy="60" r="2.3" fill="${INK}"/><circle cx="62" cy="56" r="2.3" fill="${INK}"/>
    ${eyes(46, 13, 3.8)}${smile(52, 5)}`,

  grapes: `
    <path d="M46 22 Q50 10 58 12" fill="none" ${O}/>
    <path d="M52 18 Q66 10 68 20 Q58 25 52 18 Z" fill="#4cd964" ${O3}/>
    <circle cx="36" cy="36" r="12" fill="#9c5cff" ${O}/><circle cx="64" cy="36" r="12" fill="#9c5cff" ${O}/><circle cx="50" cy="34" r="12" fill="#b197fc" ${O}/>
    <circle cx="30" cy="52" r="12" fill="#8a63ff" ${O}/><circle cx="70" cy="52" r="12" fill="#8a63ff" ${O}/><circle cx="50" cy="52" r="13" fill="#9c5cff" ${O}/>
    <circle cx="40" cy="68" r="12" fill="#8a63ff" ${O}/><circle cx="60" cy="68" r="12" fill="#8a63ff" ${O}/><circle cx="50" cy="80" r="11" fill="#9c5cff" ${O}/>
    ${eyes(51, 10, 3.5)}${smile(57, 4.5)}`,

  pineapple: `
    <path d="M36 28 L30 12 L44 22 L50 8 L56 22 L70 12 L64 28 Z" fill="#38b000" ${O}/>
    <ellipse cx="50" cy="58" rx="26" ry="30" fill="#ffd23f" ${O}/>
    <path d="M30 44 L70 72 M28 58 L64 82 M36 34 L72 58 M70 44 L30 72 M72 58 L36 82" stroke="#e09f1f" stroke-width="3" opacity=".55"/>
    ${eyes(55, 11, 3.8)}${smile(62, 5)}`,

  avocado: `
    <path d="M50 14 C34 14 24 38 24 58 C24 78 36 88 50 88 C64 88 76 78 76 58 C76 38 66 14 50 14 Z" fill="#38b000" ${O}/>
    <path d="M50 20 C38 20 30 40 30 58 C30 74 39 82 50 82 C61 82 70 74 70 58 C70 40 62 20 50 20 Z" fill="#c7f9cc"/>
    <circle cx="50" cy="64" r="13" fill="#9c6644" ${O}/>
    <circle cx="46" cy="60" r="4" fill="#d4a373" opacity=".7"/>
    ${eyes(38, 10, 3.4)}${smile(44, 4.5)}`,

  cherries: `
    <path d="M34 56 Q38 24 54 16 Q62 34 68 56" fill="none" stroke="#38b000" ${O}/>
    <path d="M54 16 Q70 12 72 22 Q60 26 54 16 Z" fill="#4cd964" ${O3}/>
    <circle cx="32" cy="66" r="18" fill="#e63946" ${O}/>
    <circle cx="68" cy="66" r="18" fill="#ff4d6d" ${O}/>
    <circle cx="26" cy="59" r="4" fill="#fff" opacity=".65"/><circle cx="62" cy="59" r="4" fill="#fff" opacity=".65"/>
    ${eyes(66, 18, 3.2)}`,

  carrot: `
    <path d="M40 22 L32 8 M50 20 L50 6 M60 22 L68 8" stroke="#38b000" stroke-width="6" stroke-linecap="round"/>
    <path d="M30 24 Q50 18 70 24 L54 88 Q50 94 46 88 Z" fill="#ff7b00" ${O}/>
    <path d="M37 38 L47 38 M53 50 L62 50 M42 64 L52 64" stroke="#e85d04" stroke-width="3.5" stroke-linecap="round"/>
    ${eyes(42, 9, 3.4)}${smile(49, 4.5)}`,

  broccoli: `
    <path d="M40 54 L36 84 Q50 88 64 84 L60 54 Z" fill="#9ef01a" ${O}/>
    <circle cx="32" cy="42" r="16" fill="#38b000" ${O}/>
    <circle cx="68" cy="42" r="16" fill="#38b000" ${O}/>
    <circle cx="50" cy="32" r="19" fill="#4cd964" ${O}/>
    ${eyes(66, 7, 3.2)}${smile(73, 4)}`,

  corn: `
    <ellipse cx="50" cy="50" rx="18" ry="32" fill="#ffd23f" ${O}/>
    <path d="M24 82 Q16 54 32 38 Q36 62 46 84 Z" fill="#4cd964" ${O}/>
    <path d="M76 82 Q84 54 68 38 Q64 62 54 84 Z" fill="#4cd964" ${O}/>
    ${eyes(44, 8, 3.3)}${smile(51, 4.5)}`,

  tomato: `
    <circle cx="50" cy="56" r="31" fill="#ff3b30" ${O}/>
    <path d="M34 26 L44 32 L50 20 L56 32 L66 26 L56 24 L50 16 L44 24 Z" fill="#38b000" ${O3}/>
    <path d="M27 42 Q23 52 27 62" fill="none" stroke="#ff9ebb" stroke-width="4.5" stroke-linecap="round"/>
    ${eyes(55, 13, 4)}${smile(62, 6)}`,

  kiwi: `
    <circle cx="50" cy="52" r="33" fill="#9c6644" ${O}/>
    <circle cx="50" cy="52" r="26" fill="#70e000" ${O3}/>
    <circle cx="50" cy="52" r="11" fill="#e9ffdb"/>
    <circle cx="50" cy="35" r="1.8" fill="${INK}"/><circle cx="65" cy="44" r="1.8" fill="${INK}"/><circle cx="65" cy="60" r="1.8" fill="${INK}"/>
    <circle cx="50" cy="69" r="1.8" fill="${INK}"/><circle cx="35" cy="60" r="1.8" fill="${INK}"/><circle cx="35" cy="44" r="1.8" fill="${INK}"/>
    ${eyes(50, 7, 3.2)}${smile(55, 4)}`,

  melon: `
    <circle cx="50" cy="52" r="33" fill="#aacc00" ${O}/>
    <path d="M50 19 Q54 11 62 12" fill="none" ${O}/>
    <path d="M28 28 Q22 52 28 76 M50 19 L50 85 M72 28 Q78 52 72 76" fill="none" stroke="#d4f482" stroke-width="3.5"/>
    ${eyes(51, 13, 4)}${smile(58, 5.5)}`,

  blueberries: `
    <circle cx="36" cy="58" r="20" fill="#4361ee" ${O}/>
    <circle cx="64" cy="58" r="20" fill="#3a0ca3" ${O}/>
    <circle cx="50" cy="38" r="20" fill="#4cc9f0" ${O}/>
    <path d="M44 20 L50 25 L56 20" fill="none" ${O3}/>
    ${eyes(38, 8, 3.2)}${smile(44, 4)}`,

  donut: `
    <circle cx="50" cy="52" r="34" fill="#f4a261" ${O}/>
    <path d="M20 48 C18 28 36 18 52 20 C70 20 82 32 80 50 C78 60 70 56 64 62 C58 68 46 68 40 60 C32 54 22 60 20 48 Z" fill="#ff5c8a" ${O3}/>
    <circle cx="50" cy="52" r="11" fill="#fff6e8" ${O}/>
    <rect x="34" y="30" width="7" height="3" rx="1.5" fill="#ffe94d" transform="rotate(-20 37 31)"/>
    <rect x="60" y="32" width="7" height="3" rx="1.5" fill="#4cd964" transform="rotate(25 63 33)"/>
    <rect x="30" y="46" width="7" height="3" rx="1.5" fill="#2fb8ff" transform="rotate(15 33 47)"/>
    <rect x="64" y="48" width="7" height="3" rx="1.5" fill="#fff" transform="rotate(-15 67 49)"/>`,

  cookie: `
    <circle cx="50" cy="52" r="34" fill="#d49354" ${O}/>
    <circle cx="36" cy="36" r="4.5" fill="#5c3a21"/><circle cx="62" cy="34" r="4" fill="#5c3a21"/>
    <circle cx="30" cy="58" r="4" fill="#5c3a21"/><circle cx="68" cy="56" r="4.5" fill="#5c3a21"/>
    <circle cx="48" cy="70" r="4.5" fill="#5c3a21"/><circle cx="52" cy="46" r="3.5" fill="#5c3a21"/>
    ${eyes(50, 13, 3.8)}${smile(57, 5)}`,

  candy: `
    <path d="M12 36 L28 50 L12 64 L18 50 Z" fill="#ff5c8a" ${O}/>
    <path d="M88 36 L72 50 L88 64 L82 50 Z" fill="#ff5c8a" ${O}/>
    <circle cx="50" cy="50" r="24" fill="#ff85a1" ${O}/>
    <path d="M36 32 Q50 50 36 68 M64 32 Q50 50 64 68" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    ${eyes(49, 10, 3.4)}${smile(55, 4.5)}`,

  egg: `
    <path d="M50 14 C30 14 22 44 22 62 C22 80 34 88 50 88 C66 88 78 80 78 62 C78 44 70 14 50 14 Z" fill="#fffdf7" ${O}/>
    <circle cx="50" cy="60" r="14" fill="#ffd23f" opacity=".85"/>
    ${eyes(46, 11, 3.8)}${smile(53, 5)}`,

  fries: `
    <rect x="28" y="14" width="9" height="44" rx="3" fill="#ffd23f" ${O}/>
    <rect x="39" y="10" width="9" height="48" rx="3" fill="#ffe14d" ${O}/>
    <rect x="51" y="12" width="9" height="46" rx="3" fill="#ffd23f" ${O}/>
    <rect x="62" y="16" width="9" height="42" rx="3" fill="#ffe14d" ${O}/>
    <path d="M22 44 L78 44 L72 86 Q50 90 28 86 Z" fill="#e63946" ${O}/>
    <path d="M36 44 Q50 54 64 44" fill="#ffd23f" ${O3}/>
    ${eyes(65, 11, 3.6)}${smile(72, 5)}`,

  honey: `
    <ellipse cx="50" cy="58" rx="28" ry="26" fill="#f4a261" ${O}/>
    <rect x="30" y="24" width="40" height="11" rx="5" fill="#e76f51" ${O}/>
    <path d="M26 42 Q36 54 44 44 Q52 56 60 44 Q68 54 74 42 L74 34 L26 34 Z" fill="#ffd23f" ${O}/>
    ${eyes(62, 11, 3.6)}${smile(69, 5)}`,

  icecream: `
    <path d="M32 52 L50 90 L68 52 Z" fill="#f4a261" ${O}/>
    <path d="M37 60 L61 60 M41 70 L58 70" stroke="#c97a3d" stroke-width="3"/>
    <circle cx="38" cy="44" r="14" fill="#ff85a1" ${O}/>
    <circle cx="62" cy="44" r="14" fill="#9bf6ff" ${O}/>
    <circle cx="50" cy="30" r="16" fill="#fff6e8" ${O}/>
    <circle cx="50" cy="14" r="6" fill="#e63946" ${O3}/>
    ${eyes(30, 8, 3.2)}${smile(36, 4)}`,

  juice: `
    <path d="M58 12 L68 8" stroke="#ff5c8a" stroke-width="6" stroke-linecap="round"/>
    <path d="M58 12 L52 32" stroke="#ff5c8a" stroke-width="6" stroke-linecap="round"/>
    <path d="M26 30 L74 30 L68 86 Q50 90 32 86 Z" fill="#ff9f1c" ${O}/>
    <path d="M24 28 L76 28" stroke="#fff" stroke-width="7" stroke-linecap="round" ${O}/>
    <circle cx="64" cy="34" r="9" fill="#ffe94d" ${O3}/>
    ${eyes(56, 11, 3.8)}${smile(63, 5)}`,

  cup: `
    <path d="M26 26 L74 26 L68 84 Q50 88 32 84 Z" fill="#74c0fc" ${O}/>
    <ellipse cx="50" cy="26" rx="24" ry="6" fill="#fff" ${O}/>
    ${eyes(54, 11, 3.8)}${smile(61, 5)}`,

  milk: `
    <path d="M28 22 L72 22 L68 86 Q50 90 32 86 Z" fill="#e8f7ff" ${O}/>
    <path d="M30 36 Q50 42 70 36 L67 84 Q50 88 33 84 Z" fill="#ffffff"/>
    ${eyes(58, 11, 3.8)}${smile(65, 5)}`,

  noodles: `
    <path d="M22 24 L82 14 M22 32 L82 22" stroke="#c97a3d" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M34 22 Q30 38 36 50 M46 20 Q42 38 48 50 M58 18 Q54 38 60 50" fill="none" stroke="#ffd23f" stroke-width="5" stroke-linecap="round"/>
    <path d="M16 48 L84 48 A34 32 0 0 1 16 48 Z" fill="#e63946" ${O}/>
    <rect x="36" y="78" width="28" height="7" rx="3" fill="#e63946" ${O3}/>
    ${eyes(61, 12, 3.5)}${smile(67, 5)}`,

  pizza: `
    <path d="M20 24 Q50 12 80 24 L50 88 Z" fill="#f4a261" ${O}/>
    <path d="M25 30 Q50 20 75 30 L50 82 Z" fill="#ffd23f" ${O3}/>
    <circle cx="44" cy="42" r="6.5" fill="#e63946" ${O3}/>
    <circle cx="58" cy="46" r="6" fill="#e63946" ${O3}/>
    <circle cx="49" cy="60" r="6" fill="#e63946" ${O3}/>`,

  cheese: `
    <path d="M14 68 L54 22 L86 44 L86 68 Z" fill="#ffe14d" ${O}/>
    <path d="M14 44 L54 22 L86 44 Z" fill="#fff3b0" ${O}/>
    <rect x="14" y="44" width="72" height="28" rx="4" fill="#ffd23f" ${O}/>
    <circle cx="32" cy="58" r="5.5" fill="#f0a500"/><circle cx="66" cy="56" r="6.5" fill="#f0a500"/><circle cx="50" cy="63" r="4" fill="#f0a500"/>`,

  cake: `
    <rect x="20" y="46" width="60" height="38" rx="8" fill="#ffc6ff" ${O}/>
    <path d="M18 48 Q28 60 36 48 Q44 60 52 48 Q60 60 68 48 Q76 60 82 48 L82 42 Q50 38 18 42 Z" fill="#fff" ${O}/>
    <rect x="46" y="22" width="8" height="20" rx="3" fill="#74c0fc" ${O3}/>
    <path d="M50 10 Q58 18 50 22 Q42 18 50 10 Z" fill="#ffd23f" ${O3}/>
    ${eyes(65, 13, 3.6)}${smile(72, 5)}`,

  // === ANIMALS ===
  cat: animalHead({
    bg: '#ffb703',
    ears: `<path d="M20 42 L18 14 L42 28 Z M80 42 L82 14 L58 28 Z" fill="#ffb703" ${O}/>`,
    innerEar: `<path d="M23 36 L22 20 L36 28 Z M77 36 L78 20 L64 28 Z" fill="#ff85a1"/>`,
    nose: `<polygon points="46,52 54,52 50,57" fill="#ff5c8a" ${O3}/>`,
    extra: `<path d="M50 57 Q44 63 39 59 M50 57 Q56 63 61 59 M12 52 L28 54 M12 60 L28 59 M88 52 L72 54 M88 60 L72 59" fill="none" ${O3}/>`,
  }),

  dog: animalHead({
    bg: '#d49354',
    ears: `<ellipse cx="18" cy="48" rx="10" ry="20" transform="rotate(18 18 48)" fill="#8a5a2b" ${O}/>
           <ellipse cx="82" cy="48" rx="10" ry="20" transform="rotate(-18 82 48)" fill="#8a5a2b" ${O}/>`,
    muzzle: `<ellipse cx="50" cy="60" rx="16" ry="12" fill="#fff3e0"/>`,
    nose: `<ellipse cx="50" cy="54" rx="6" ry="4.5" fill="${INK}"/>`,
    extra: `<path d="M46 64 Q50 74 54 64 Z" fill="#ff5c8a" ${O3}/>${smile(61, 6)}`,
  }),

  cow: animalHead({
    bg: '#ffffff',
    ears: `<path d="M24 30 Q16 14 26 14 Q30 22 32 28 Z M76 30 Q84 14 74 14 Q70 22 68 28 Z" fill="#ffe169" ${O}/>
           <ellipse cx="16" cy="40" rx="10" ry="6" transform="rotate(-20 16 40)" fill="#fff" ${O}/>
           <ellipse cx="84" cy="40" rx="10" ry="6" transform="rotate(20 84 40)" fill="#fff" ${O}/>`,
    muzzle: `<ellipse cx="32" cy="38" rx="8" ry="6" fill="${INK}" opacity=".85"/>
             <ellipse cx="50" cy="63" rx="22" ry="13" fill="#ffb3c6" ${O}/>`,
    nose: `<circle cx="42" cy="62" r="3" fill="${INK}"/><circle cx="58" cy="62" r="3" fill="${INK}"/>`,
    eyeY: 44,
  }),

  pig: animalHead({
    bg: '#ff9ebb',
    ears: `<path d="M20 36 L14 14 L38 26 Z M80 36 L86 14 L62 26 Z" fill="#ff77a9" ${O}/>`,
    muzzle: `<ellipse cx="50" cy="58" rx="15" ry="11" fill="#ff5c8a" ${O}/>`,
    nose: `<circle cx="45" cy="58" r="3" fill="${INK}"/><circle cx="55" cy="58" r="3" fill="${INK}"/>`,
    eyeY: 43,
  }),

  sheep: `
    <ellipse cx="18" cy="46" rx="10" ry="6" transform="rotate(-25 18 46)" fill="#ffccd5" ${O}/>
    <ellipse cx="82" cy="46" rx="10" ry="6" transform="rotate(25 82 46)" fill="#ffccd5" ${O}/>
    <circle cx="32" cy="32" r="14" fill="#fff" ${O}/><circle cx="68" cy="32" r="14" fill="#fff" ${O}/>
    <circle cx="26" cy="54" r="15" fill="#fff" ${O}/><circle cx="74" cy="54" r="15" fill="#fff" ${O}/>
    <circle cx="36" cy="72" r="14" fill="#fff" ${O}/><circle cx="64" cy="72" r="14" fill="#fff" ${O}/>
    <ellipse cx="50" cy="54" rx="22" ry="20" fill="#ffe5ec" ${O}/>
    <circle cx="50" cy="28" r="15" fill="#fff" ${O}/>
    ${eyes(52, 10, 3.8)}${smile(60, 5)}`,

  goat: animalHead({
    bg: '#e6ccb2',
    ears: `<path d="M34 28 Q26 10 18 14 Q24 24 28 30 Z M66 28 Q74 10 82 14 Q76 24 72 30 Z" fill="#9c6644" ${O}/>`,
    muzzle: `<ellipse cx="50" cy="60" rx="13" ry="10" fill="#fff"/>`,
    nose: `<polygon points="46,56 54,56 50,61" fill="#9c6644"/>`,
    extra: `<path d="M44 82 L50 93 L56 82 Z" fill="#b08968" ${O3}/>${smile(64, 5)}`,
  }),

  horse: animalHead({
    bg: '#b07d4f',
    ears: `<path d="M26 30 L22 10 L38 24 Z M74 30 L78 10 L62 24 Z" fill="#b07d4f" ${O}/>
           <path d="M38 22 Q50 10 62 22 Z" fill="#5c3a21" ${O}/>`,
    muzzle: `<ellipse cx="50" cy="64" rx="18" ry="13" fill="#e6ccb2" ${O}/>
             <path d="M46 28 L54 28 L52 44 L48 44 Z" fill="#fff"/>`,
    nose: `<circle cx="43" cy="62" r="3" fill="${INK}"/><circle cx="57" cy="62" r="3" fill="${INK}"/>`,
    eyeY: 44,
  }),

  donkey: animalHead({
    bg: '#9aa5b1',
    ears: `<ellipse cx="28" cy="18" rx="8" ry="18" transform="rotate(-14 28 18)" fill="#9aa5b1" ${O}/>
           <ellipse cx="72" cy="18" rx="8" ry="18" transform="rotate(14 72 18)" fill="#9aa5b1" ${O}/>
           <ellipse cx="28" cy="19" rx="4" ry="12" transform="rotate(-14 28 19)" fill="#ffccd5"/>
           <ellipse cx="72" cy="19" rx="4" ry="12" transform="rotate(14 72 19)" fill="#ffccd5"/>`,
    muzzle: `<ellipse cx="50" cy="63" rx="17" ry="12" fill="#e4e7eb" ${O}/>`,
    nose: `<circle cx="44" cy="61" r="2.8" fill="${INK}"/><circle cx="56" cy="61" r="2.8" fill="${INK}"/>`,
    eyeY: 45,
  }),

  chicken: `
    <path d="M38 24 Q40 12 46 20 Q50 10 55 20 Q62 12 62 24 Z" fill="#e63946" ${O}/>
    <ellipse cx="50" cy="56" rx="30" ry="28" fill="#fffdf7" ${O}/>
    ${eyes(48, 14, 4.2)}
    <polygon points="43,52 57,52 50,62" fill="#ff9f1c" ${O3}/>
    <circle cx="50" cy="66" r="5" fill="#e63946" ${O3}/>`,

  rooster: `
    <path d="M34 26 Q36 8 45 18 Q50 6 56 18 Q66 8 66 26 Z" fill="#e63946" ${O}/>
    <ellipse cx="50" cy="56" rx="30" ry="28" fill="#ffd166" ${O}/>
    ${eyes(48, 14, 4.2)}
    <polygon points="42,52 58,52 50,63" fill="#ff7b00" ${O3}/>
    <path d="M45 63 Q44 74 50 72 Q56 74 55 63 Z" fill="#e63946" ${O3}/>`,

  chick: `
    <path d="M46 22 L50 12 L54 22" fill="none" stroke="#ffb703" ${O}/>
    <ellipse cx="50" cy="56" rx="31" ry="29" fill="#ffe14d" ${O}/>
    <ellipse cx="20" cy="56" rx="8" ry="13" fill="#ffd23f" ${O}/>
    <ellipse cx="80" cy="56" rx="8" ry="13" fill="#ffd23f" ${O}/>
    ${eyes(49, 13, 4.2)}
    <polygon points="44,54 56,54 50,63" fill="#ff7b00" ${O3}/>`,

  duck: `
    <ellipse cx="52" cy="66" rx="30" ry="20" fill="#ffe14d" ${O}/>
    <circle cx="38" cy="38" r="19" fill="#38b000" ${O}/>
    <path d="M12 38 Q22 30 28 36 L28 44 Q18 46 12 38 Z" fill="#ff9f1c" ${O}/>
    <ellipse cx="56" cy="64" rx="15" ry="9" fill="#ffd23f" ${O3}/>
    <circle cx="34" cy="35" r="4" fill="${INK}"/><circle cx="33" cy="33.5" r="1.5" fill="#fff"/>`,

  goose: `
    <ellipse cx="54" cy="68" rx="28" ry="18" fill="#ffffff" ${O}/>
    <path d="M36 62 L36 30 Q36 18 46 18 Q54 18 52 30 L48 62 Z" fill="#ffffff" ${O}/>
    <path d="M20 26 L38 22 L38 31 Z" fill="#ff7b00" ${O}/>
    <circle cx="43" cy="24" r="3.5" fill="${INK}"/>`,

  turkey: `
    <circle cx="50" cy="46" r="34" fill="#e76f51" ${O}/>
    <circle cx="50" cy="46" r="26" fill="#f4a261" ${O3}/>
    <ellipse cx="50" cy="60" rx="22" ry="22" fill="#8a5a2b" ${O}/>
    ${eyes(52, 10, 3.8)}
    <polygon points="45,56 55,56 50,64" fill="#ffd23f" ${O3}/>
    <path d="M53 58 Q58 66 53 70" fill="none" stroke="#e63946" stroke-width="5" stroke-linecap="round"/>`,

  bird: `
    <ellipse cx="50" cy="56" rx="28" ry="25" fill="#4cc9f0" ${O}/>
    <ellipse cx="50" cy="64" rx="18" ry="13" fill="#e0fbfc"/>
    <ellipse cx="22" cy="54" rx="9" ry="14" fill="#3a86ff" ${O}/>
    <ellipse cx="78" cy="54" rx="9" ry="14" fill="#3a86ff" ${O}/>
    ${eyes(47, 12, 4)}
    <polygon points="44,51 56,51 50,60" fill="#ffb703" ${O3}/>`,

  crow: `
    <ellipse cx="50" cy="56" rx="28" ry="25" fill="#4a4e69" ${O}/>
    <ellipse cx="22" cy="54" rx="9" ry="14" fill="#22223b" ${O}/>
    <ellipse cx="78" cy="54" rx="9" ry="14" fill="#22223b" ${O}/>
    <circle cx="38" cy="46" r="5.5" fill="#fff"/><circle cx="62" cy="46" r="5.5" fill="#fff"/>
    <circle cx="38" cy="46" r="3.2" fill="${INK}"/><circle cx="62" cy="46" r="3.2" fill="${INK}"/>
    <polygon points="42,51 58,51 50,63" fill="#ffb703" ${O3}/>`,

  parrot: `
    <path d="M44 22 Q48 8 58 16 Q54 10 64 20" fill="none" stroke="#ffd23f" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="50" cy="56" rx="27" ry="28" fill="#ff4d6d" ${O}/>
    <ellipse cx="23" cy="58" rx="9" ry="17" fill="#38b000" ${O}/>
    <ellipse cx="77" cy="58" rx="9" ry="17" fill="#2fb8ff" ${O}/>
    <circle cx="38" cy="45" r="7" fill="#fff"/><circle cx="62" cy="45" r="7" fill="#fff"/>
    <circle cx="38" cy="45" r="3.8" fill="${INK}"/><circle cx="62" cy="45" r="3.8" fill="${INK}"/>
    <path d="M43 50 Q50 46 57 50 L53 64 Q50 68 47 64 Z" fill="#ffd23f" ${O}/>`,

  owl: `
    <path d="M24 28 L18 14 L36 22 Z M76 28 L82 14 L64 22 Z" fill="#8a5a2b" ${O}/>
    <ellipse cx="50" cy="56" rx="30" ry="28" fill="#b07d4f" ${O}/>
    <ellipse cx="50" cy="66" rx="18" ry="14" fill="#f3d5b5"/>
    <circle cx="37" cy="46" r="12" fill="#fff" ${O}/><circle cx="63" cy="46" r="12" fill="#fff" ${O}/>
    <circle cx="37" cy="46" r="5.5" fill="${INK}"/><circle cx="63" cy="46" r="5.5" fill="${INK}"/>
    <circle cx="35" cy="44" r="2" fill="#fff"/><circle cx="61" cy="44" r="2" fill="#fff"/>
    <polygon points="45,53 55,53 50,61" fill="#ff9f1c" ${O3}/>`,

  penguin: `
    <ellipse cx="50" cy="54" rx="29" ry="32" fill="#3b3355" ${O}/>
    <ellipse cx="50" cy="58" rx="20" ry="24" fill="#ffffff"/>
    <ellipse cx="30" cy="84" rx="9" ry="5" fill="#ff9f1c" ${O3}/>
    <ellipse cx="70" cy="84" rx="9" ry="5" fill="#ff9f1c" ${O3}/>
    ${eyes(44, 11, 3.8)}
    <polygon points="44,49 56,49 50,57" fill="#ff9f1c" ${O3}/>`,

  lion: `
    <circle cx="50" cy="52" r="37" fill="#e85d04" ${O}/>
    <circle cx="24" cy="30" r="10" fill="#e85d04" ${O}/><circle cx="76" cy="30" r="10" fill="#e85d04" ${O}/>
    <circle cx="24" cy="30" r="5" fill="#ffd166"/><circle cx="76" cy="30" r="5" fill="#ffd166"/>
    <ellipse cx="50" cy="54" rx="25" ry="23" fill="#ffd166" ${O}/>
    <ellipse cx="50" cy="60" rx="12" ry="9" fill="#fff3e0"/>
    ${eyes(48, 12, 3.8)}
    <polygon points="46,55 54,55 50,60" fill="#9c6644"/>
    ${smile(61, 5)}`,

  tiger: animalHead({
    bg: '#ff922b',
    ears: `<circle cx="24" cy="26" r="11" fill="#ff922b" ${O}/><circle cx="76" cy="26" r="11" fill="#ff922b" ${O}/>`,
    muzzle: `<ellipse cx="50" cy="60" rx="15" ry="11" fill="#fff3e0"/>`,
    nose: `<polygon points="45,54 55,54 50,60" fill="#ff5c8a"/>`,
    extra: `<path d="M50 25 L50 35 M20 48 L30 50 M20 56 L29 56 M80 48 L70 50 M80 56 L71 56" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>${smile(61, 5)}`,
  }),

  elephant: `
    <ellipse cx="18" cy="52" rx="14" ry="22" fill="#90a4ae" ${O}/>
    <ellipse cx="82" cy="52" rx="14" ry="22" fill="#90a4ae" ${O}/>
    <ellipse cx="18" cy="54" rx="8" ry="14" fill="#ffccd5"/>
    <ellipse cx="82" cy="54" rx="8" ry="14" fill="#ffccd5"/>
    <ellipse cx="50" cy="50" rx="27" ry="25" fill="#b0bec5" ${O}/>
    ${eyes(45, 13, 3.8)}
    <path d="M44 52 Q44 78 56 78 Q62 78 60 70" fill="none" stroke="#b0bec5" stroke-width="12" stroke-linecap="round"/>
    <path d="M44 52 Q44 78 56 78 Q62 78 60 70" fill="none" ${O}/>`,

  monkey: `
    <circle cx="16" cy="52" r="11" fill="#9c6644" ${O}/><circle cx="84" cy="52" r="11" fill="#9c6644" ${O}/>
    <circle cx="16" cy="52" r="6" fill="#f3d5b5"/><circle cx="84" cy="52" r="6" fill="#f3d5b5"/>
    <ellipse cx="50" cy="52" rx="28" ry="26" fill="#9c6644" ${O}/>
    <circle cx="40" cy="46" r="12" fill="#f3d5b5"/><circle cx="60" cy="46" r="12" fill="#f3d5b5"/>
    <ellipse cx="50" cy="60" rx="18" ry="13" fill="#f3d5b5"/>
    ${eyes(46, 11, 3.8)}
    <circle cx="46" cy="55" r="2" fill="${INK}"/><circle cx="54" cy="55" r="2" fill="${INK}"/>
    ${smile(61, 7)}`,

  rabbit: animalHead({
    bg: '#ffffff',
    ears: `<ellipse cx="36" cy="20" rx="8" ry="18" transform="rotate(-8 36 20)" fill="#fff" ${O}/>
           <ellipse cx="64" cy="20" rx="8" ry="18" transform="rotate(8 64 20)" fill="#fff" ${O}/>`,
    innerEar: `<ellipse cx="36" cy="21" rx="4" ry="12" transform="rotate(-8 36 21)" fill="#ff9ebb"/>
               <ellipse cx="64" cy="21" rx="4" ry="12" transform="rotate(8 64 21)" fill="#ff9ebb"/>`,
    nose: `<polygon points="46,54 54,54 50,59" fill="#ff5c8a"/>`,
    extra: smile(60, 5),
  }),

  mouse: animalHead({
    bg: '#adb5bd',
    ears: `<circle cx="22" cy="28" r="15" fill="#adb5bd" ${O}/><circle cx="78" cy="28" r="15" fill="#adb5bd" ${O}/>`,
    innerEar: `<circle cx="22" cy="28" r="9" fill="#ffccd5"/><circle cx="78" cy="28" r="9" fill="#ffccd5"/>`,
    nose: `<circle cx="50" cy="56" r="4.5" fill="#ff5c8a"/>`,
    extra: `<path d="M16 56 L32 57 M84 56 L68 57" ${O3}/>${smile(62, 5)}`,
  }),

  fox: animalHead({
    bg: '#ff6b35',
    ears: `<path d="M18 40 L16 12 L42 28 Z M82 40 L84 12 L58 28 Z" fill="#ff6b35" ${O}/>`,
    innerEar: `<path d="M21 34 L20 18 L36 28 Z M79 34 L80 18 L64 28 Z" fill="#fff3e0"/>`,
    muzzle: `<path d="M20 56 Q36 52 50 76 Q64 52 80 56 Q72 80 50 82 Q28 80 20 56 Z" fill="#ffffff"/>`,
    nose: `<circle cx="50" cy="60" r="4.5" fill="${INK}"/>`,
  }),

  wolf: animalHead({
    bg: '#7b8794',
    ears: `<path d="M20 38 L18 12 L42 28 Z M80 38 L82 12 L58 28 Z" fill="#7b8794" ${O}/>`,
    muzzle: `<ellipse cx="50" cy="61" rx="15" ry="12" fill="#e4e7eb"/>`,
    nose: `<polygon points="45,55 55,55 50,61" fill="${INK}"/>`,
    extra: smile(63, 5),
  }),

  bear: animalHead({
    bg: '#9c6644',
    ears: `<circle cx="24" cy="26" r="12" fill="#9c6644" ${O}/><circle cx="76" cy="26" r="12" fill="#9c6644" ${O}/>`,
    innerEar: `<circle cx="24" cy="26" r="6" fill="#e6ccb2"/><circle cx="76" cy="26" r="6" fill="#e6ccb2"/>`,
    muzzle: `<ellipse cx="50" cy="60" rx="14" ry="11" fill="#e6ccb2"/>`,
    nose: `<ellipse cx="50" cy="55" rx="5.5" ry="4" fill="${INK}"/>`,
    extra: smile(61, 5),
  }),

  panda: `
    <circle cx="24" cy="26" r="12" fill="${INK}"/><circle cx="76" cy="26" r="12" fill="${INK}"/>
    <ellipse cx="50" cy="54" rx="32" ry="29" fill="#ffffff" ${O}/>
    <ellipse cx="35" cy="48" rx="9" ry="11" transform="rotate(-15 35 48)" fill="${INK}"/>
    <ellipse cx="65" cy="48" rx="9" ry="11" transform="rotate(15 65 48)" fill="${INK}"/>
    <circle cx="36" cy="47" r="3.5" fill="#fff"/><circle cx="64" cy="47" r="3.5" fill="#fff"/>
    <ellipse cx="50" cy="57" rx="5" ry="3.8" fill="${INK}"/>
    ${smile(63, 5)}`,

  koala: animalHead({
    bg: '#9aa5b1',
    ears: `<circle cx="18" cy="40" r="16" fill="#9aa5b1" ${O}/><circle cx="82" cy="40" r="16" fill="#9aa5b1" ${O}/>`,
    innerEar: `<circle cx="18" cy="40" r="9" fill="#f5f7fa"/><circle cx="82" cy="40" r="9" fill="#f5f7fa"/>`,
    nose: `<ellipse cx="50" cy="54" rx="6.5" ry="9" fill="#3b3355" ${O3}/>`,
    extra: smile(66, 5),
  }),

  frog: `
    <circle cx="32" cy="28" r="13" fill="#52b788" ${O}/>
    <circle cx="68" cy="28" r="13" fill="#52b788" ${O}/>
    <ellipse cx="50" cy="56" rx="34" ry="25" fill="#52b788" ${O}/>
    <ellipse cx="50" cy="64" rx="22" ry="12" fill="#d8f3dc"/>
    <circle cx="32" cy="28" r="6" fill="#fff"/><circle cx="68" cy="28" r="6" fill="#fff"/>
    <circle cx="32" cy="28" r="3.5" fill="${INK}"/><circle cx="68" cy="28" r="3.5" fill="${INK}"/>
    <circle cx="24" cy="54" r="5" fill="#ff9ebb" opacity=".6"/><circle cx="76" cy="54" r="5" fill="#ff9ebb" opacity=".6"/>
    ${smile(54, 11)}`,

  turtle: `
    <ellipse cx="28" cy="74" rx="7" ry="5" fill="#52b788" ${O}/><ellipse cx="64" cy="74" rx="7" ry="5" fill="#52b788" ${O}/>
    <circle cx="80" cy="54" r="13" fill="#74c69d" ${O}/>
    <path d="M16 64 A30 28 0 0 1 72 64 Z" fill="#2d6a4f" ${O}/>
    <path d="M14 64 L74 64" stroke="#ffd166" stroke-width="6" stroke-linecap="round"/>
    <circle cx="84" cy="51" r="3" fill="${INK}"/>`,

  giraffe: `
    <line x1="38" y1="24" x2="34" y2="10" ${O}/><circle cx="34" cy="10" r="4.5" fill="#9c6644" ${O3}/>
    <line x1="62" y1="24" x2="66" y2="10" ${O}/><circle cx="66" cy="10" r="4.5" fill="#9c6644" ${O3}/>
    <ellipse cx="22" cy="34" rx="9" ry="5" transform="rotate(-20 22 34)" fill="#ffd166" ${O}/>
    <ellipse cx="78" cy="34" rx="9" ry="5" transform="rotate(20 78 34)" fill="#ffd166" ${O}/>
    <ellipse cx="50" cy="54" rx="28" ry="27" fill="#ffd166" ${O}/>
    <circle cx="34" cy="40" r="5" fill="#b07d4f"/><circle cx="66" cy="42" r="4.5" fill="#b07d4f"/>
    <ellipse cx="50" cy="63" rx="18" ry="12" fill="#fffae5" ${O3}/>
    ${eyes(48, 12, 3.8)}
    <circle cx="44" cy="61" r="2.5" fill="#9c6644"/><circle cx="56" cy="61" r="2.5" fill="#9c6644"/>`,

  zebra: animalHead({
    bg: '#ffffff',
    ears: `<ellipse cx="26" cy="22" rx="7" ry="12" transform="rotate(-18 26 22)" fill="#fff" ${O}/>
           <ellipse cx="74" cy="22" rx="7" ry="12" transform="rotate(18 74 22)" fill="#fff" ${O}/>`,
    muzzle: `<ellipse cx="50" cy="64" rx="18" ry="12" fill="#3b3355" ${O}/>`,
    nose: `<circle cx="44" cy="62" r="2.5" fill="#fff"/><circle cx="56" cy="62" r="2.5" fill="#fff"/>`,
    extra: `<path d="M22 40 L34 44 M20 50 L32 52 M78 40 L66 44 M80 50 L68 52 M50 25 L50 36" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
  }),

  unicorn: animalHead({
    bg: '#ffffff',
    ears: `<path d="M24 32 L20 16 L36 26 Z M76 32 L80 16 L64 26 Z" fill="#fff" ${O}/>
           <path d="M44 26 L50 6 L56 26 Z" fill="#ffd23f" ${O}/>`,
    muzzle: `<path d="M22 30 Q30 18 42 26" fill="none" stroke="#ff5c8a" stroke-width="6" stroke-linecap="round"/>
             <ellipse cx="50" cy="63" rx="17" ry="11" fill="#ffc6ff" ${O3}/>`,
    nose: `<circle cx="44" cy="62" r="2.3" fill="${INK}"/><circle cx="56" cy="62" r="2.3" fill="${INK}"/>`,
  }),

  dino: `
    <path d="M28 24 L20 18 L28 32 L18 30 L28 42" fill="#ff9f1c" ${O3}/>
    <path d="M26 78 L26 36 Q26 18 48 18 L74 18 Q84 18 84 32 L84 44 Q84 52 72 52 L56 52 L56 78 Z" fill="#52b788" ${O}/>
    <circle cx="62" cy="30" r="4.5" fill="${INK}"/><circle cx="61" cy="28.5" r="1.6" fill="#fff"/>
    <path d="M56 42 L80 42" ${O3}/>`,

  sauropod: `
    <path d="M18 76 Q18 52 44 52 Q66 52 68 76 Z" fill="#4cc9f0" ${O}/>
    <path d="M56 60 L64 24 Q66 14 76 16 Q84 18 82 26 Q76 30 72 28 L66 64 Z" fill="#4cc9f0" ${O}/>
    <circle cx="74" cy="21" r="3" fill="${INK}"/>
    <circle cx="38" cy="62" r="4" fill="#3a86ff"/><circle cx="50" cy="60" r="3" fill="#3a86ff"/>`,

  fish: `
    <path d="M74 50 L92 32 L88 50 L92 68 Z" fill="#ff7b00" ${O}/>
    <ellipse cx="46" cy="50" rx="30" ry="22" fill="#2fb8ff" ${O}/>
    <path d="M36 29 Q48 18 56 30 Z" fill="#ff9f1c" ${O}/>
    <path d="M44 32 Q36 50 44 68" fill="none" stroke="#bfeaff" stroke-width="4" stroke-linecap="round"/>
    <circle cx="30" cy="46" r="4.5" fill="${INK}"/><circle cx="29" cy="44.5" r="1.6" fill="#fff"/>
    <path d="M22 54 Q28 59 33 54" fill="none" ${O3}/>`,

  dolphin: `
    <path d="M16 64 C20 34 52 22 78 38 C86 43 92 46 84 50 C74 52 66 48 56 54 C42 60 32 72 20 74 Z" fill="#4cc9f0" ${O}/>
    <path d="M48 28 L56 14 L60 30 Z" fill="#3a86ff" ${O}/>
    <circle cx="70" cy="42" r="3.5" fill="${INK}"/><circle cx="69" cy="41" r="1.2" fill="#fff"/>`,

  whale: `
    <path d="M46 22 Q46 10 36 12 M46 22 Q46 10 56 12" fill="none" stroke="#4cc9f0" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M14 58 C14 30 38 24 60 30 C74 34 80 48 88 38 L88 56 C82 64 74 68 62 68 L14 68 Z" fill="#3a86ff" ${O}/>
    <path d="M16 60 Q40 58 60 68 L16 68 Z" fill="#e0fbfc"/>
    <circle cx="32" cy="48" r="4" fill="${INK}"/><circle cx="31" cy="46.5" r="1.5" fill="#fff"/>`,

  octopus: `
    <path d="M20 62 Q14 78 24 80 Q32 80 34 66 M36 66 Q34 84 44 84 Q50 84 50 68 M52 68 Q54 84 62 84 Q70 84 66 66 M68 64 Q72 80 80 78 Q86 76 78 62" fill="none" stroke="#ff5c8a" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="50" cy="44" rx="28" ry="24" fill="#ff5c8a" ${O}/>
    ${eyes(46, 11, 4)}${smile(53, 5)}`,

  crab: `
    <path d="M22 40 C12 28 18 16 28 22 L24 30 L32 28 C34 36 28 42 22 40 Z M78 40 C88 28 82 16 72 22 L76 30 L68 28 C66 36 72 42 78 40 Z" fill="#e63946" ${O}/>
    <ellipse cx="50" cy="58" rx="26" ry="18" fill="#ff4d6d" ${O}/>
    ${eyes(52, 10, 3.8)}${smile(60, 5)}`,

  bee: `
    <ellipse cx="42" cy="28" rx="12" ry="16" transform="rotate(-20 42 28)" fill="#e0fbfc" ${O}/>
    <ellipse cx="58" cy="28" rx="12" ry="16" transform="rotate(20 58 28)" fill="#e0fbfc" ${O}/>
    <ellipse cx="50" cy="56" rx="28" ry="22" fill="#ffd23f" ${O}/>
    <path d="M42 35 L42 77 M58 35 L58 77" stroke="${INK}" stroke-width="7"/>
    <circle cx="28" cy="52" r="3.8" fill="${INK}"/>${smile(58, 4)}`,

  butterfly: `
    <ellipse cx="30" cy="38" rx="18" ry="16" fill="#ff5c8a" ${O}/>
    <ellipse cx="70" cy="38" rx="18" ry="16" fill="#ff5c8a" ${O}/>
    <ellipse cx="32" cy="64" rx="14" ry="13" fill="#ffd23f" ${O}/>
    <ellipse cx="68" cy="64" rx="14" ry="13" fill="#ffd23f" ${O}/>
    <circle cx="28" cy="38" r="6" fill="#fff" opacity=".75"/><circle cx="72" cy="38" r="6" fill="#fff" opacity=".75"/>
    <rect x="45" y="28" width="10" height="44" rx="5" fill="#3b3355" ${O}/>
    <path d="M47 28 Q40 16 34 18 M53 28 Q60 16 66 18" fill="none" ${O3}/>`,

  bug: `
    <circle cx="72" cy="56" r="14" fill="#70e000" ${O}/>
    <circle cx="54" cy="60" r="13" fill="#38b000" ${O}/>
    <circle cx="38" cy="58" r="12" fill="#70e000" ${O}/>
    <circle cx="22" cy="62" r="11" fill="#38b000" ${O}/>
    <circle cx="76" cy="53" r="3.2" fill="${INK}"/>
    <path d="M70 42 L66 32 M78 42 L82 32" ${O3}/>`,

  ant: `
    <circle cx="24" cy="58" r="13" fill="#5c3a21" ${O}/>
    <circle cx="48" cy="56" r="10" fill="#7f4f24" ${O}/>
    <circle cx="70" cy="52" r="14" fill="#5c3a21" ${O}/>
    <circle cx="74" cy="49" r="3.2" fill="#fff"/><circle cx="75" cy="49" r="1.8" fill="${INK}"/>
    <path d="M68 38 L62 26 M76 38 L82 26 M38 66 L32 78 M48 66 L48 78 M58 66 L64 78" ${O3}/>`,

  snail: `
    <path d="M14 72 Q46 72 84 72 Q88 72 86 64 Q82 54 74 58 L20 64 Z" fill="#ffe169" ${O}/>
    <circle cx="44" cy="48" r="22" fill="#ff9f1c" ${O}/>
    <path d="M44 48 m-12 0 a12 12 0 1 0 24 0 a8 8 0 1 0 -16 0" fill="none" ${O3}/>
    <line x1="76" y1="56" x2="80" y2="40" ${O3}/><circle cx="80" cy="38" r="3" fill="${INK}"/>`,

  // === VEHICLES ===
  car: toyVehicle({ body: '#ff4d6d', roof: '#bfeaff' }),
  taxi: toyVehicle({
    body: '#ffd23f',
    top: `<rect x="46" y="14" width="16" height="8" rx="3" fill="#fff" ${O3}/>`,
  }),
  police: toyVehicle({
    body: '#3a86ff',
    top: `<rect x="48" y="13" width="12" height="8" rx="4" fill="#e63946" ${O3}/>`,
    stripe: `<rect x="16" y="50" width="72" height="8" fill="#ffffff"/>`,
  }),
  bus: `
    <rect x="10" y="26" width="80" height="44" rx="10" fill="#ffd23f" ${O}/>
    <rect x="16" y="34" width="16" height="14" rx="3" fill="#bfeaff" ${O3}/>
    <rect x="37" y="34" width="16" height="14" rx="3" fill="#bfeaff" ${O3}/>
    <rect x="58" y="34" width="24" height="14" rx="3" fill="#bfeaff" ${O3}/>
    <circle cx="28" cy="70" r="10" fill="#3b3355" ${O}/><circle cx="28" cy="70" r="4.5" fill="#d9e2ec"/>
    <circle cx="72" cy="70" r="10" fill="#3b3355" ${O}/><circle cx="72" cy="70" r="4.5" fill="#d9e2ec"/>`,

  van: toyVehicle({ body: '#4cc9f0', roof: '#ffffff' }),
  ambulance: `
    <rect x="46" y="16" width="12" height="8" rx="3" fill="#e63946" ${O3}/>
    <rect x="12" y="24" width="76" height="44" rx="10" fill="#ffffff" ${O}/>
    <path d="M36 38 L48 38 M42 32 L42 44" stroke="#e63946" stroke-width="6" stroke-linecap="round"/>
    <rect x="60" y="32" width="20" height="14" rx="3" fill="#bfeaff" ${O3}/>
    <circle cx="28" cy="68" r="10" fill="#3b3355" ${O}/><circle cx="72" cy="68" r="10" fill="#3b3355" ${O}/>`,

  firetruck: `
    <rect x="16" y="16" width="52" height="7" rx="3" fill="#ffd23f" ${O3}/>
    <rect x="12" y="26" width="76" height="42" rx="8" fill="#e63946" ${O}/>
    <rect x="62" y="34" width="20" height="14" rx="3" fill="#bfeaff" ${O3}/>
    <circle cx="28" cy="68" r="10" fill="#3b3355" ${O}/><circle cx="72" cy="68" r="10" fill="#3b3355" ${O}/>`,

  truck: `
    <rect x="10" y="24" width="50" height="42" rx="6" fill="#ff9f1c" ${O}/>
    <path d="M60 36 L78 36 Q88 36 88 48 L88 66 L60 66 Z" fill="#2fb8ff" ${O}/>
    <rect x="65" y="41" width="16" height="12" rx="2" fill="#bfeaff" ${O3}/>
    <circle cx="28" cy="68" r="10" fill="#3b3355" ${O}/><circle cx="74" cy="68" r="10" fill="#3b3355" ${O}/>`,

  tractor: `
    <rect x="22" y="20" width="32" height="26" rx="5" fill="#38b000" ${O}/>
    <rect x="27" y="25" width="22" height="14" rx="3" fill="#bfeaff" ${O3}/>
    <rect x="18" y="42" width="62" height="22" rx="6" fill="#4cd964" ${O}/>
    <circle cx="32" cy="66" r="16" fill="#3b3355" ${O}/><circle cx="32" cy="66" r="7" fill="#ffd23f"/>
    <circle cx="72" cy="70" r="11" fill="#3b3355" ${O}/><circle cx="72" cy="70" r="4.5" fill="#ffd23f"/>`,

  racecar: `
    <path d="M10 60 L24 44 L64 42 L88 52 L90 64 L10 64 Z" fill="#e63946" ${O}/>
    <path d="M10 44 L20 44 L18 54 L10 54 Z" fill="#ffd23f" ${O3}/>
    <circle cx="30" cy="64" r="11" fill="#3b3355" ${O}/><circle cx="72" cy="64" r="11" fill="#3b3355" ${O}/>`,

  train: `
    <rect x="18" y="20" width="30" height="46" rx="5" fill="#3a86ff" ${O}/>
    <rect x="44" y="36" width="38" height="30" rx="6" fill="#e63946" ${O}/>
    <rect x="66" y="18" width="10" height="18" rx="3" fill="#ffd23f" ${O}/>
    <rect x="24" y="27" width="18" height="14" rx="3" fill="#bfeaff" ${O3}/>
    <circle cx="30" cy="70" r="10" fill="#3b3355" ${O}/><circle cx="56" cy="70" r="10" fill="#3b3355" ${O}/><circle cx="76" cy="70" r="8" fill="#3b3355" ${O}/>`,

  plane: `
    <path d="M36 22 L54 44 L40 44 Z" fill="#ff5c8a" ${O}/>
    <ellipse cx="50" cy="50" rx="38" ry="13" fill="#ffffff" ${O}/>
    <path d="M16 48 L24 30 L34 46 Z" fill="#2fb8ff" ${O}/>
    <path d="M38 52 L60 52 L44 78 L32 78 Z" fill="#ff5c8a" ${O}/>
    <circle cx="64" cy="48" r="3.5" fill="#2fb8ff"/><circle cx="52" cy="48" r="3.5" fill="#2fb8ff"/>`,

  helicopter: `
    <line x1="20" y1="20" x2="84" y2="20" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <line x1="52" y1="20" x2="52" y2="30" ${O}/>
    <path d="M12 48 L34 48" stroke="#ff5c8a" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="56" cy="50" rx="26" ry="18" fill="#2fb8ff" ${O}/>
    <path d="M58 36 A16 14 0 0 1 78 50 L58 50 Z" fill="#bfeaff" ${O3}/>
    <path d="M34 74 L76 74 M44 66 L44 74 M66 66 L66 74" ${O}/>`,

  rocket: `
    <path d="M50 86 L40 72 L60 72 Z" fill="#ff9f1c"/>
    <path d="M26 56 L16 72 L34 68 Z M74 56 L84 72 L66 68 Z" fill="#e63946" ${O}/>
    <path d="M50 12 C32 28 30 52 34 70 L66 70 C70 52 68 28 50 12 Z" fill="#ffffff" ${O}/>
    <path d="M50 12 C41 20 37 28 36 34 L64 34 C63 28 59 20 50 12 Z" fill="#e63946" ${O}/>
    <circle cx="50" cy="48" r="9" fill="#4cc9f0" ${O}/>`,

  bike: `
    <circle cx="26" cy="64" r="15" fill="none" ${O}/>
    <circle cx="74" cy="64" r="15" fill="none" ${O}/>
    <path d="M26 64 L44 40 L68 40 L50 64 Z M44 40 L38 30 M68 40 L74 64 M64 30 L74 30" fill="none" stroke="#ff5c8a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`,

  scooter: `
    <circle cx="26" cy="70" r="12" fill="#3b3355" ${O}/>
    <circle cx="74" cy="70" r="12" fill="#3b3355" ${O}/>
    <path d="M26 68 L68 68 L74 26 L62 26 M26 68 Q26 48 44 48 L44 68" fill="none" stroke="#2fb8ff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,

  boat: `
    <path d="M48 14 L48 60 L20 56 Z" fill="#ff5c8a" ${O}/>
    <path d="M52 20 L52 60 L80 56 Z" fill="#ffd23f" ${O}/>
    <path d="M14 62 L86 62 L74 82 L26 82 Z" fill="#3a86ff" ${O}/>`,

  ship: `
    <rect x="42" y="18" width="14" height="18" rx="3" fill="#e63946" ${O}/>
    <rect x="26" y="34" width="48" height="20" rx="4" fill="#ffffff" ${O}/>
    <path d="M12 52 L88 52 L76 78 L24 78 Z" fill="#3a86ff" ${O}/>
    <path d="M10 80 Q25 74 40 80 Q55 86 70 80 Q85 74 90 80" fill="none" stroke="#4cc9f0" stroke-width="5" stroke-linecap="round"/>`,

  // === OBJECTS, NATURE & SYMBOLS ===
  kite: `
    <polygon points="50,12 80,44 50,78 20,44" fill="#ff5c8a" ${O}/>
    <polygon points="50,12 80,44 50,44" fill="#ffd23f" ${O3}/>
    <polygon points="50,44 20,44 50,78" fill="#4cc9f0" ${O3}/>
    <path d="M50 78 Q60 86 52 94" fill="none" ${O}/>`,

  nest: `
    <ellipse cx="42" cy="48" rx="10" ry="13" fill="#9bf6ff" ${O}/>
    <ellipse cx="58" cy="48" rx="10" ry="13" fill="#9bf6ff" ${O}/>
    <path d="M16 52 C16 78 84 78 84 52 Z" fill="#b07d4f" ${O}/>
    <path d="M22 60 L78 60 M28 68 L72 68" stroke="#7f4f24" stroke-width="3.5" stroke-linecap="round"/>`,

  queen: `
    <circle cx="50" cy="58" r="24" fill="#ffccd5" ${O}/>
    <path d="M24 40 L28 16 L42 30 L50 14 L58 30 L72 16 L76 40 Z" fill="#ffd23f" ${O}/>
    <circle cx="50" cy="28" r="4" fill="#ff4d6d"/>
    ${eyes(56, 10, 3.6)}${smile(63, 5)}`,

  umbrella: `
    <path d="M50 48 L50 80 Q50 88 40 88 Q34 88 34 82" fill="none" ${O}/>
    <path d="M12 52 A38 36 0 0 1 88 52 Q76 46 64 52 Q50 46 36 52 Q24 46 12 52 Z" fill="#ff5c8a" ${O}/>
    <path d="M36 52 Q42 22 50 16 Q58 22 64 52 Z" fill="#ffd23f" ${O3}/>`,

  violin: `
    <rect x="46" y="10" width="8" height="32" rx="3" fill="#5c3a21" ${O}/>
    <path d="M34 44 C24 44 26 58 36 60 C22 64 24 86 50 86 C76 86 78 64 64 60 C74 58 76 44 66 44 C58 36 42 36 34 44 Z" fill="#c97a3d" ${O}/>
    <line x1="20" y1="74" x2="82" y2="28" stroke="#ffd23f" stroke-width="4" stroke-linecap="round"/>`,

  xylophone: `
    <rect x="14" y="24" width="12" height="54" rx="4" fill="#ff4d6d" ${O}/>
    <rect x="30" y="28" width="12" height="46" rx="4" fill="#ff9f1c" ${O}/>
    <rect x="46" y="32" width="12" height="38" rx="4" fill="#ffd23f" ${O}/>
    <rect x="62" y="36" width="12" height="30" rx="4" fill="#4cd964" ${O}/>
    <rect x="78" y="40" width="10" height="22" rx="4" fill="#2fb8ff" ${O}/>`,

  yoyo: `
    <path d="M50 50 Q76 32 82 12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    <path d="M50 50 Q76 32 82 12" fill="none" ${O3}/>
    <circle cx="46" cy="56" r="28" fill="#ff4d6d" ${O}/>
    <circle cx="46" cy="56" r="18" fill="#ffd23f" ${O3}/>
    <circle cx="46" cy="56" r="6" fill="#fff" ${O3}/>`,

  sun: `
    <g stroke="#ff9f1c" stroke-width="6" stroke-linecap="round">
      <line x1="50" y1="8" x2="50" y2="18"/><line x1="50" y1="82" x2="50" y2="92"/>
      <line x1="8" y1="50" x2="18" y2="50"/><line x1="82" y1="50" x2="92" y2="50"/>
      <line x1="20" y1="20" x2="27" y2="27"/><line x1="73" y1="73" x2="80" y2="80"/>
      <line x1="80" y1="20" x2="73" y2="27"/><line x1="27" y1="73" x2="20" y2="80"/>
    </g>
    <circle cx="50" cy="50" r="26" fill="#ffe14d" ${O}/>
    ${eyes(48, 10, 3.6)}${smile(55, 5)}`,

  moon: `
    <path d="M62 16 A34 34 0 1 0 84 68 A26 26 0 1 1 62 16 Z" fill="#ffe14d" ${O}/>
    <circle cx="40" cy="50" r="3.5" fill="${INK}"/>${smile(58, 5)}`,

  star: `
    <polygon points="50,10 61,35 88,38 67,56 73,84 50,69 27,84 33,56 12,38 39,35" fill="#ffe14d" ${O}/>
    ${eyes(48, 9, 3.4)}${smile(55, 4.5)}`,

  sparkle: `
    <path d="M50 8 Q54 44 90 50 Q54 56 50 92 Q46 56 10 50 Q46 44 50 8 Z" fill="#ffe14d" ${O}/>
    <circle cx="78" cy="22" r="5" fill="#fff"/>`,

  cloud: `
    <path d="M26 72 L74 72 A16 16 0 0 0 76 40 A22 22 0 0 0 34 34 A18 18 0 0 0 26 72 Z" fill="#ffffff" ${O}/>
    ${eyes(54, 11, 3.4)}${smile(60, 4.5)}`,

  rainbow: `
    <path d="M14 72 A36 36 0 0 1 86 72" fill="none" stroke="#ff4d6d" stroke-width="8" stroke-linecap="round"/>
    <path d="M21 72 A29 29 0 0 1 79 72" fill="none" stroke="#ffd23f" stroke-width="8" stroke-linecap="round"/>
    <path d="M28 72 A22 22 0 0 1 72 72" fill="none" stroke="#4cd964" stroke-width="8" stroke-linecap="round"/>
    <path d="M35 72 A15 15 0 0 1 65 72" fill="none" stroke="#2fb8ff" stroke-width="8" stroke-linecap="round"/>
    <circle cx="20" cy="72" r="11" fill="#fff" ${O3}/><circle cx="80" cy="72" r="11" fill="#fff" ${O3}/>`,

  wave: `
    <path d="M10 62 Q26 36 44 54 Q60 32 78 54 Q86 62 90 56 L90 80 L10 80 Z" fill="#2fb8ff" ${O}/>
    <path d="M18 52 Q30 38 42 50 M56 48 Q66 36 76 48" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,

  land: `
    <rect x="12" y="16" width="76" height="68" rx="14" fill="#9bf6ff" ${O}/>
    <circle cx="70" cy="30" r="8" fill="#ffe14d"/>
    <path d="M12 64 Q34 44 56 60 Q72 48 88 60 L88 84 L12 84 Z" fill="#52b788" ${O}/>`,

  sprout: `
    <path d="M50 82 L50 42" stroke="#38b000" stroke-width="6" stroke-linecap="round"/>
    <path d="M50 48 C26 48 20 26 42 26 C48 26 50 36 50 48 Z" fill="#4cd964" ${O}/>
    <path d="M50 42 C74 42 80 20 58 20 C52 20 50 30 50 42 Z" fill="#70e000" ${O}/>`,

  tree: `
    <rect x="42" y="54" width="16" height="32" rx="4" fill="#8a5a2b" ${O}/>
    <circle cx="34" cy="46" r="18" fill="#38b000" ${O}/>
    <circle cx="66" cy="46" r="18" fill="#38b000" ${O}/>
    <circle cx="50" cy="30" r="22" fill="#52b788" ${O}/>`,

  pine: `
    <rect x="43" y="68" width="14" height="18" rx="3" fill="#8a5a2b" ${O}/>
    <polygon points="50,14 22,46 78,46" fill="#2d6a4f" ${O}/>
    <polygon points="50,30 18,68 82,68" fill="#40916c" ${O}/>`,

  rose: `
    <path d="M50 52 L50 86" stroke="#38b000" stroke-width="6" stroke-linecap="round"/>
    <path d="M50 68 Q68 60 66 72 Q56 76 50 68 Z" fill="#4cd964" ${O3}/>
    <circle cx="50" cy="36" r="20" fill="#e63946" ${O}/>
    <path d="M38 34 Q50 22 62 34 Q50 46 38 34 Z" fill="#ff758f" ${O3}/>`,

  sunflower: `
    <path d="M50 56 L50 88" stroke="#38b000" stroke-width="6" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="24" fill="#ffd23f" stroke="#ff9f1c" stroke-width="6" stroke-dasharray="10 5"/>
    <circle cx="50" cy="34" r="22" fill="none" ${O}/>
    <circle cx="50" cy="34" r="13" fill="#6f4518" ${O}/>`,

  flower: `
    <circle cx="50" cy="26" r="12" fill="#fff" ${O}/><circle cx="72" cy="42" r="12" fill="#fff" ${O}/>
    <circle cx="64" cy="68" r="12" fill="#fff" ${O}/><circle cx="36" cy="68" r="12" fill="#fff" ${O}/>
    <circle cx="28" cy="42" r="12" fill="#fff" ${O}/>
    <circle cx="50" cy="48" r="14" fill="#ffe14d" ${O}/>`,

  clover: `
    <path d="M50 52 L56 86" stroke="#2d6a4f" stroke-width="5" stroke-linecap="round"/>
    <circle cx="36" cy="36" r="14" fill="#4cd964" ${O}/>
    <circle cx="64" cy="36" r="14" fill="#4cd964" ${O}/>
    <circle cx="36" cy="60" r="14" fill="#52b788" ${O}/>
    <circle cx="64" cy="60" r="14" fill="#52b788" ${O}/>`,

  ball: `
    <circle cx="50" cy="50" r="34" fill="#ffffff" ${O}/>
    <polygon points="50,36 63,45 58,60 42,60 37,45" fill="${INK}"/>
    <line x1="50" y1="36" x2="50" y2="16" ${O3}/><line x1="63" y1="45" x2="82" y2="38" ${O3}/>
    <line x1="37" y1="45" x2="18" y2="38" ${O3}/><line x1="58" y1="60" x2="70" y2="78" ${O3}/><line x1="42" y1="60" x2="30" y2="78" ${O3}/>`,

  book: `
    <path d="M14 26 Q32 20 50 28 L50 78 Q32 70 14 76 Z" fill="#ff5c8a" ${O}/>
    <path d="M86 26 Q68 20 50 28 L50 78 Q68 70 86 76 Z" fill="#2fb8ff" ${O}/>
    <path d="M20 24 Q35 19 50 26 Q65 19 80 24 L80 72 Q65 66 50 74 Q35 66 20 72 Z" fill="#fffdf7" ${O3}/>`,

  hat: `
    <ellipse cx="50" cy="70" rx="38" ry="10" fill="#3b3355" ${O}/>
    <path d="M26 70 L30 22 Q50 18 70 22 L74 70 Z" fill="#3b3355" ${O}/>
    <rect x="27" y="56" width="46" height="9" fill="#ff4d6d" ${O3}/>`,

  cap: `
    <path d="M20 56 A30 28 0 0 1 78 56 Z" fill="#2fb8ff" ${O}/>
    <path d="M50 56 L90 56 Q88 66 66 64 L20 56 Z" fill="#1c7ed6" ${O}/>`,

  bed: `
    <rect x="12" y="28" width="10" height="50" rx="4" fill="#8a5a2b" ${O}/>
    <rect x="22" y="38" width="22" height="14" rx="6" fill="#ffffff" ${O}/>
    <path d="M22 48 L84 48 Q88 48 88 66 L22 66 Z" fill="#74c0fc" ${O}/>
    <rect x="12" y="64" width="76" height="12" rx="3" fill="#b07d4f" ${O}/>`,

  box: `
    <polygon points="16,36 50,20 84,36 50,52" fill="#f4a261" ${O}/>
    <polygon points="16,36 50,52 50,84 16,68" fill="#e09f5a" ${O}/>
    <polygon points="84,36 50,52 50,84 84,68" fill="#c97a3d" ${O}/>`,

  teddy: animalHead({
    bg: '#c97a3d',
    ears: `<circle cx="24" cy="26" r="12" fill="#c97a3d" ${O}/><circle cx="76" cy="26" r="12" fill="#c97a3d" ${O}/>`,
    innerEar: `<circle cx="24" cy="26" r="6" fill="#ffccd5"/><circle cx="76" cy="26" r="6" fill="#ffccd5"/>`,
    muzzle: `<ellipse cx="50" cy="60" rx="14" ry="11" fill="#ffe5d9"/>`,
    nose: `<ellipse cx="50" cy="55" rx="5" ry="4" fill="#5c3a21"/>`,
    extra: `<path d="M38 82 L50 76 L62 82 L50 88 Z" fill="#ff4d6d" ${O3}/>${smile(61, 5)}`,
  }),

  balloon: `
    <path d="M50 70 Q56 80 48 90" fill="none" ${O3}/>
    <ellipse cx="50" cy="42" rx="25" ry="29" fill="#ff4d6d" ${O}/>
    <polygon points="46,71 54,71 50,76" fill="#ff4d6d" ${O3}/>
    <ellipse cx="38" cy="30" rx="5" ry="9" transform="rotate(-25 38 30)" fill="#fff" opacity=".65"/>`,

  party: `
    <polygon points="18,82 40,36 64,60" fill="#ffd23f" ${O}/>
    <circle cx="56" cy="26" r="5" fill="#ff5c8a"/><circle cx="74" cy="36" r="4.5" fill="#4cd964"/>
    <circle cx="68" cy="18" r="4" fill="#2fb8ff"/><circle cx="42" cy="18" r="4" fill="#8a63ff"/>`,

  gift: `
    <rect x="20" y="38" width="60" height="46" rx="6" fill="#ff5c8a" ${O}/>
    <rect x="16" y="28" width="68" height="14" rx="5" fill="#e63946" ${O}/>
    <rect x="44" y="28" width="12" height="56" fill="#ffd23f" ${O3}/>
    <path d="M50 28 C34 12 26 26 46 28 C66 26 58 12 50 28 Z" fill="#ffd23f" ${O}/>`,

  tent: `
    <polygon points="50,14 14,46 86,46" fill="#e63946" ${O}/>
    <polygon points="50,14 36,46 64,46" fill="#ffd23f" ${O3}/>
    <rect x="18" y="46" width="64" height="38" fill="#ffffff" ${O}/>
    <polygon points="38,84 50,54 62,84" fill="#3b3355" ${O}/>`,

  house: `
    <polygon points="50,14 14,46 86,46" fill="#e63946" ${O}/>
    <rect x="22" y="44" width="56" height="40" rx="4" fill="#fff3d6" ${O}/>
    <rect x="43" y="58" width="14" height="26" rx="3" fill="#8a5a2b" ${O}/>
    <rect x="28" y="52" width="11" height="11" rx="2" fill="#4cc9f0" ${O3}/>`,

  map: `
    <polygon points="14,24 38,18 38,76 14,82" fill="#ffe169" ${O}/>
    <polygon points="38,18 62,26 62,82 38,76" fill="#70e000" ${O}/>
    <polygon points="62,26 86,18 86,76 62,82" fill="#4cc9f0" ${O}/>
    <path d="M24 54 Q46 34 72 48" fill="none" stroke="#e63946" stroke-width="4" stroke-dasharray="6 5"/>`,

  net: `
    <line x1="22" y1="84" x2="48" y2="54" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="60" cy="36" rx="22" ry="14" transform="rotate(-25 60 36)" fill="none" ${O}/>
    <path d="M42 44 Q58 76 78 28" fill="#bfeaff" opacity=".65" ${O}/>`,

  web: `
    <g fill="none" ${O3}>
      <line x1="50" y1="10" x2="50" y2="90"/><line x1="10" y1="50" x2="90" y2="50"/>
      <line x1="22" y1="22" x2="78" y2="78"/><line x1="78" y1="22" x2="22" y2="78"/>
      <polygon points="50,24 68,32 76,50 68,68 50,76 32,68 24,50 32,32"/>
      <polygon points="50,36 60,40 64,50 60,60 50,64 40,60 36,50 40,40"/>
    </g>`,

  zip: `
    <rect x="26" y="14" width="48" height="72" rx="10" fill="#4cc9f0" ${O}/>
    <line x1="50" y1="14" x2="50" y2="86" stroke="#ffd23f" stroke-width="8" stroke-dasharray="6 5"/>
    <rect x="43" y="34" width="14" height="18" rx="4" fill="#fff" ${O3}/>`,

  mop: `
    <line x1="68" y1="14" x2="44" y2="62" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"/>
    <path d="M24 60 L64 60 L72 84 L16 84 Z" fill="#9bf6ff" ${O}/>`,

  bubbles: `
    <circle cx="38" cy="54" r="22" fill="#bfeaff" opacity=".8" ${O}/>
    <circle cx="68" cy="34" r="14" fill="#e0fbfc" opacity=".85" ${O}/>
    <circle cx="66" cy="70" r="10" fill="#bfeaff" opacity=".85" ${O}/>
    <circle cx="31" cy="46" r="5" fill="#fff"/>`,

  // === FACES, PEOPLE & MONSTERS ===
  ghost: `
    <path d="M22 82 L22 44 A28 28 0 0 1 78 44 L78 82 L68 72 L58 82 L50 72 L42 82 L32 72 Z" fill="#ffffff" ${O}/>
    ${eyes(44, 11, 4)}
    <ellipse cx="50" cy="56" rx="6" ry="8" fill="#ff5c8a"/>`,

  robot: `
    <line x1="50" y1="10" x2="50" y2="22" ${O}/><circle cx="50" cy="10" r="5" fill="#ff4d6d" ${O3}/>
    <rect x="20" y="24" width="60" height="54" rx="12" fill="#90e0ef" ${O}/>
    <circle cx="36" cy="46" r="7" fill="#ffe14d" ${O3}/><circle cx="64" cy="46" r="7" fill="#ffe14d" ${O3}/>
    <rect x="34" y="62" width="32" height="8" rx="4" fill="#fff" ${O3}/>`,

  monster: `
    <path d="M26 28 L18 12 L36 22 Z M74 28 L82 12 L64 22 Z" fill="#ffd23f" ${O}/>
    <ellipse cx="50" cy="54" rx="32" ry="28" fill="#9c5cff" ${O}/>
    <circle cx="37" cy="44" r="8" fill="#fff" ${O3}/><circle cx="63" cy="44" r="8" fill="#fff" ${O3}/>
    <circle cx="37" cy="44" r="4" fill="${INK}"/><circle cx="63" cy="44" r="4" fill="${INK}"/>
    <path d="M34 60 Q50 72 66 60" fill="none" ${O}/>
    <polygon points="38,62 42,69 46,63" fill="#fff"/><polygon points="54,63 58,69 62,62" fill="#fff"/>`,

  clown: `
    <circle cx="20" cy="42" r="14" fill="#ff4d6d" ${O}/><circle cx="80" cy="42" r="14" fill="#2fb8ff" ${O}/>
    <circle cx="50" cy="54" r="28" fill="#fff3e0" ${O}/>
    ${eyes(46, 12, 3.8)}
    <circle cx="50" cy="54" r="7" fill="#e63946" ${O3}/>
    ${smile(64, 9)}`,

  silly: `
    <circle cx="50" cy="50" r="34" fill="#ffe14d" ${O}/>
    <circle cx="36" cy="42" r="6" fill="#fff" ${O3}/><circle cx="36" cy="42" r="3" fill="${INK}"/>
    <path d="M58 42 Q64 36 70 42" fill="none" ${O}/>
    <path d="M34 58 Q50 72 66 58" fill="none" ${O}/>
    <path d="M46 63 Q50 78 58 63 Z" fill="#ff5c8a" ${O3}/>`,

  yum: `
    <circle cx="50" cy="50" r="34" fill="#ffe14d" ${O}/>
    ${eyes(43, 13, 4)}
    <path d="M32 56 Q50 72 68 56" fill="none" ${O}/>
    <path d="M52 62 Q64 74 66 58 Z" fill="#ff5c8a" ${O3}/>`,

  smileface: `
    <circle cx="50" cy="50" r="34" fill="#ffe14d" ${O}/>
    ${eyes(45, 13, 4.2)}${smile(57, 9)}`,

  dad: `
    <circle cx="50" cy="56" r="28" fill="#ffcdb2" ${O}/>
    <path d="M22 48 C22 24 78 24 78 48 C70 36 30 36 22 48 Z" fill="#3b3355" ${O}/>
    ${eyes(54, 11, 3.8)}${smile(64, 6)}`,

  mom: `
    <circle cx="50" cy="30" r="14" fill="#3b3355" ${O}/>
    <circle cx="50" cy="58" r="27" fill="#ffcdb2" ${O}/>
    <path d="M23 52 Q36 32 50 42 Q64 32 77 52" fill="#3b3355" ${O}/>
    ${eyes(56, 11, 3.8)}${smile(65, 6)}`,

  kid: `
    <circle cx="50" cy="56" r="27" fill="#ffcdb2" ${O}/>
    <path d="M26 44 Q50 20 74 44 Q60 34 46 38 Z" fill="#5c3a21" ${O}/>
    ${eyes(55, 11, 4)}${smile(64, 6)}`,

  baby: `
    <circle cx="50" cy="54" r="27" fill="#ffcdb2" ${O}/>
    <path d="M48 27 Q56 16 52 28" fill="none" ${O}/>
    ${eyes(50, 11, 3.8)}
    <circle cx="50" cy="64" r="7" fill="#ff5c8a" ${O3}/>`,

  family: `
    <circle cx="28" cy="48" r="15" fill="#5c7cfa" ${O}/>
    <circle cx="72" cy="48" r="15" fill="#ff5c8a" ${O}/>
    <circle cx="50" cy="58" r="16" fill="#ffd23f" ${O}/>
    ${eyes(57, 7, 2.8)}${smile(63, 4)}`,

  thumbsup: `
    <rect x="18" y="46" width="18" height="34" rx="5" fill="#4cc9f0" ${O}/>
    <path d="M36 48 L46 22 Q52 16 56 24 L54 42 L76 42 Q84 42 82 52 L78 74 Q76 80 68 80 L36 80 Z" fill="#ffd23f" ${O}/>`,

  // === HEARTS & COLOR ORBS ===
  heart: `
    <path d="M50 84 C20 64 12 42 22 26 C30 14 44 18 50 30 C56 18 70 14 78 26 C88 42 80 64 50 84 Z" fill="#ff4d6d" ${O}/>
    <path d="M28 32 Q24 40 28 48" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".7"/>`,
  yellowheart: `<path d="M50 84 C20 64 12 42 22 26 C30 14 44 18 50 30 C56 18 70 14 78 26 C88 42 80 64 50 84 Z" fill="#ffd23f" ${O}/>`,
  blueheart: `<path d="M50 84 C20 64 12 42 22 26 C30 14 44 18 50 30 C56 18 70 14 78 26 C88 42 80 64 50 84 Z" fill="#2fb8ff" ${O}/>`,
  redorb: `<circle cx="50" cy="50" r="32" fill="#ff4d6d" ${O}/><circle cx="38" cy="38" r="8" fill="#fff" opacity=".6"/>`,
  yelloworb: `<circle cx="50" cy="50" r="32" fill="#ffd23f" ${O}/><circle cx="38" cy="38" r="8" fill="#fff" opacity=".6"/>`,
  blueorb: `<circle cx="50" cy="50" r="32" fill="#2fb8ff" ${O}/><circle cx="38" cy="38" r="8" fill="#fff" opacity=".6"/>`,
  greenorb: `<circle cx="50" cy="50" r="32" fill="#4cd964" ${O}/><circle cx="38" cy="38" r="8" fill="#fff" opacity=".6"/>`,

  // === MODE & UI ICONS ===
  abc: `
    <rect x="14" y="14" width="72" height="72" rx="18" fill="#ff5c8a" ${O}/>
    <text x="50" y="62" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="34" fill="#fff">ABC</text>`,
  num123: `
    <rect x="14" y="14" width="72" height="72" rx="18" fill="#2fb8ff" ${O}/>
    <text x="50" y="62" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="36" fill="#fff">123</text>`,
  puzzle: `
    <path d="M24 24 L44 24 A8 8 0 1 1 56 24 L76 24 L76 44 A8 8 0 1 1 76 56 L76 76 L24 76 Z" fill="#4cd964" ${O}/>`,
  boom: `
    <polygon points="50,8 60,30 84,18 72,42 94,54 70,62 80,86 56,72 44,92 38,68 12,76 28,54 8,36 34,36" fill="#ffd23f" ${O}/>
    <polygon points="50,24 56,38 72,32 64,46 78,54 62,58 66,72 52,64 44,76 42,60 26,64 36,50 24,40 40,40" fill="#ff4d6d"/>`,
  search: `
    <line x1="62" y1="62" x2="86" y2="86" stroke="#ff9f1c" stroke-width="12" stroke-linecap="round"/>
    <line x1="62" y1="62" x2="86" y2="86" ${O}/>
    <circle cx="44" cy="44" r="26" fill="#bfeaff" ${O}/>
    <path d="M32 32 A14 14 0 0 1 52 28" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>`,
  pencil: `
    <g transform="rotate(-35 50 50)">
      <rect x="38" y="16" width="24" height="12" rx="4" fill="#ff85a1" ${O}/>
      <rect x="38" y="28" width="24" height="44" fill="#ffd23f" ${O}/>
      <polygon points="38,72 62,72 50,92" fill="#f3d5b5" ${O}/>
      <polygon points="46,84 54,84 50,92" fill="${INK}"/>
    </g>`,
  eyes: `
    <ellipse cx="32" cy="50" rx="18" ry="24" fill="#ffffff" ${O}/>
    <ellipse cx="68" cy="50" rx="18" ry="24" fill="#ffffff" ${O}/>
    <circle cx="36" cy="50" r="9" fill="${INK}"/><circle cx="72" cy="50" r="9" fill="${INK}"/>
    <circle cx="33" cy="46" r="3.5" fill="#fff"/><circle cx="69" cy="46" r="3.5" fill="#fff"/>`,
  basket: `
    <path d="M28 44 A22 22 0 0 1 72 44" fill="none" stroke="#b07d4f" stroke-width="7"/>
    <path d="M16 44 L84 44 L74 82 Q50 86 26 82 Z" fill="#e09f5a" ${O}/>
    <rect x="12" y="38" width="76" height="10" rx="5" fill="#f4a261" ${O}/>`,
  speaker: `
    <polygon points="18,38 36,38 56,20 56,80 36,62 18,62" fill="#ffd23f" ${O}/>
    <path d="M66 36 Q78 50 66 64 M74 26 Q92 50 74 74" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`,
  gear: `
    <circle cx="50" cy="50" r="28" fill="#e2e8f0" stroke="${INK}" stroke-width="8" stroke-dasharray="12 6"/>
    <circle cx="50" cy="50" r="22" fill="#cbd5e1" ${O}/>
    <circle cx="50" cy="50" r="9" fill="#64748b" ${O3}/>`,
  lock: `
    <path d="M34 44 L34 30 A16 16 0 0 1 66 30 L66 44" fill="none" stroke="#94a3b8" stroke-width="8"/>
    <rect x="24" y="42" width="52" height="42" rx="10" fill="#ffd23f" ${O}/>
    <circle cx="50" cy="62" r="5" fill="${INK}"/>`,
  bell: `
    <path d="M24 68 L76 68 L68 40 A18 18 0 0 0 32 40 Z" fill="#ffd23f" ${O}/>
    <circle cx="50" cy="74" r="7" fill="#ff9f1c" ${O3}/>`,
  dice: `
    <rect x="18" y="18" width="64" height="64" rx="14" fill="#ffffff" ${O}/>
    <circle cx="34" cy="34" r="5" fill="#ff4d6d"/><circle cx="66" cy="34" r="5" fill="#2fb8ff"/>
    <circle cx="50" cy="50" r="5" fill="#8a63ff"/>
    <circle cx="34" cy="66" r="5" fill="#4cd964"/><circle cx="66" cy="66" r="5" fill="#ff9f1c"/>`,
  palette: `
    <path d="M50 16 C26 16 14 34 14 54 C14 74 32 84 48 84 C56 84 60 76 56 68 C54 62 60 58 68 60 C80 62 86 52 86 42 C86 26 70 16 50 16 Z" fill="#f4a261" ${O}/>
    <circle cx="34" cy="38" r="6" fill="#ff4d6d"/><circle cx="52" cy="30" r="6" fill="#ffd23f"/>
    <circle cx="68" cy="40" r="6" fill="#2fb8ff"/><circle cx="30" cy="56" r="6" fill="#4cd964"/>`,
};

// Map every emoji used across AB12 (normalized without \uFE0F) to its SVG id
export const EMOJI_TO_ID = {
  '🍎': 'apple', '🍏': 'greenapple', '🍌': 'banana', '🍉': 'watermelon', '🍓': 'strawberry',
  '🥕': 'carrot', '🥦': 'broccoli', '🌽': 'corn', '🍇': 'grapes', '🍍': 'pineapple',
  '🥑': 'avocado', '🍋': 'lemon', '🍒': 'cherries', '🍊': 'orange', '🍅': 'tomato',
  '🥝': 'kiwi', '🍈': 'melon', '🫐': 'blueberries', '🍩': 'donut', '🍪': 'cookie',
  '🍬': 'candy', '🥚': 'egg', '🍟': 'fries', '🍯': 'honey', '🍦': 'icecream',
  '🍹': 'juice', '🥤': 'cup', '🥛': 'milk', '🍜': 'noodles', '🍕': 'pizza',
  '🧀': 'cheese', '🎂': 'cake',

  '🐱': 'cat', '🐶': 'dog', '🐕': 'dog', '🐮': 'cow', '🐄': 'cow', '🐷': 'pig',
  '🐑': 'sheep', '🐐': 'goat', '🐴': 'horse', '🫏': 'donkey', '🐔': 'chicken',
  '🐓': 'rooster', '🐥': 'chick', '🦆': 'duck', '🪿': 'goose', '🦃': 'turkey',
  '🐦': 'bird', '🐦‍⬛': 'crow', '🦜': 'parrot', '🦉': 'owl', '🐧': 'penguin',
  '🦁': 'lion', '🐯': 'tiger', '🐘': 'elephant', '🐵': 'monkey', '🐰': 'rabbit',
  '🐭': 'mouse', '🐁': 'mouse', '🐀': 'mouse', '🦊': 'fox', '🐺': 'wolf',
  '🐻': 'bear', '🐼': 'panda', '🐨': 'koala', '🐸': 'frog', '🐢': 'turtle',
  '🦒': 'giraffe', '🦓': 'zebra', '🦄': 'unicorn', '🦖': 'dino', '🦕': 'sauropod',
  '🐟': 'fish', '🐬': 'dolphin', '🐳': 'whale', '🐋': 'whale', '🐙': 'octopus',
  '🦀': 'crab', '🐝': 'bee', '🦋': 'butterfly', '🐛': 'bug', '🐜': 'ant', '🐌': 'snail',

  '🚗': 'car', '🚕': 'taxi', '🚓': 'police', '🚌': 'bus', '🚐': 'van',
  '🚑': 'ambulance', '🚒': 'firetruck', '🚚': 'truck', '🚜': 'tractor', '🏎': 'racecar',
  '🚂': 'train', '✈': 'plane', '🚁': 'helicopter', '🚀': 'rocket', '🚲': 'bike',
  '🛵': 'scooter', '⛵': 'boat', '🚢': 'ship',

  '🪁': 'kite', '🪺': 'nest', '👸': 'queen', '☂': 'umbrella', '🎻': 'violin',
  '🎼': 'xylophone', '🪀': 'yoyo', '☀': 'sun', '🌙': 'moon', '⭐': 'star',
  '✨': 'sparkle', '💫': 'sparkle', '☁': 'cloud', '🌈': 'rainbow', '🌊': 'wave',
  '🏞': 'land', '🌱': 'sprout', '🌳': 'tree', '🌲': 'pine', '🌹': 'rose',
  '🌻': 'sunflower', '🌼': 'flower', '🌿': 'sprout', '🍀': 'clover', '⚽': 'ball',
  '📖': 'book', '🎩': 'hat', '🧢': 'cap', '🛏': 'bed', '📦': 'box',
  '🧸': 'teddy', '🎈': 'balloon', '🎉': 'party', '🎁': 'gift', '🎪': 'tent',
  '🏠': 'house', '🏡': 'house', '🗺': 'map', '🥅': 'net', '🕸': 'web',
  '🤐': 'zip', '🧹': 'mop', '🫧': 'bubbles',

  '👻': 'ghost', '🤖': 'robot', '👾': 'monster', '🤡': 'clown',
  '🤪': 'silly', '😜': 'silly', '😋': 'yum', '🙂': 'smileface',
  '👨': 'dad', '👩': 'mom', '🧒': 'kid', '👶': 'baby', '👪': 'family', '👍': 'thumbsup',

  '❤': 'heart', '💖': 'heart', '💛': 'yellowheart', '💙': 'blueheart',
  '🔴': 'redorb', '🟡': 'yelloworb', '🔵': 'blueorb', '🟢': 'greenorb',

  '🔤': 'abc', '🔢': 'num123', '🧩': 'puzzle', '💥': 'boom', '🔍': 'search',
  '✏': 'pencil', '👀': 'eyes', '🧺': 'basket', '🔊': 'speaker', '🔉': 'speaker',
  '⚙': 'gear', '🔒': 'lock', '🔐': 'lock', '🔔': 'bell', '🎲': 'dice',
  '🎨': 'palette', '🎛': 'gear', '🃏': 'abc', '💬': 'cloud', '🗣': 'speaker',
};
