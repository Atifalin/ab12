import { rand, rnd } from '../core/util.js';

// ---------- PokéLab: Code-Art Creature Studio, Holo-Dex & Battle Arena ----------
// Lazy-loads pokelabArt.js on first entry so initial bundle stays fast.

const SAVE_KEY = 'ab12-pokelab-v1';
const SHADERS = [
  ['holo', '✨ Holo Vector'],
  ['neon', '🔮 Neon Wire'],
  ['mosaic', '💎 Mosaic'],
  ['pixel', '👾 16-Bit'],
  ['silhouette', '❓ Shadow'],
];

export default {
  id: 'pokelab',
  title: 'PokéLab',
  emoji: '⚡',
  category: 'play',
  settings: [
    { key: 'tab', label: 'Start tab', type: 'seg', default: 'pack',
      options: [
        { value: 'pack', label: '🎴 Holo-Dex' },
        { value: 'fusion', label: '🧬 DNA Lab' },
        { value: 'safari', label: '🎯 Safari' },
        { value: 'battle', label: '⚔️ Battle' },
      ] },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="pkl-top">
        <div class="pkl-tabs" id="pkl-tabs">
          <button class="pkl-tab on" data-t="pack">🎴 Packs &amp; Dex</button>
          <button class="pkl-tab" data-t="fusion">🧬 DNA &amp; Shaders</button>
          <button class="pkl-tab" data-t="safari">🎯 Catch Safari</button>
          <button class="pkl-tab" data-t="battle">⚔️ Battle Arena</button>
        </div>
        <div class="pkl-dex- pill" id="pkl-dex-count">0 Cards</div>
      </div>
      <div class="pkl-body" id="pkl-body"></div>`;

    const { playSfx, effects, audio } = ctx;
    const { sparkleBurst, confettiBurst } = effects;
    const body = el.querySelector('#pkl-body');
    const countEl = el.querySelector('#pkl-dex-count');
    const tabBtns = [...el.querySelectorAll('.pkl-tab')];

    let art = null; // pokelabArt module
    let curTab = 'pack';
    let collection = []; // array of creature specs
    let selectedCard = null;
    let curShader = 'holo';
    let fusA = 0, fusB = 1, fusShiny = false;
    let safariState = null;
    let battleState = null;
    let timers = [];
    const T = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
    const clearT = () => { timers.forEach(clearTimeout); timers = []; };

    function loadSave() {
      try {
        const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
        if (raw && Array.isArray(raw.cards) && raw.cards.length) {
          collection = raw.cards;
          selectedCard = collection[0];
          return;
        }
      } catch (e) {}
      // Seed 3 iconic starters
      collection = [
        art.cloneCreature(art.BASE_CREATURES[0]),
        art.cloneCreature(art.BASE_CREATURES[1]),
        art.cloneCreature(art.BASE_CREATURES[2]),
      ];
      selectedCard = collection[0];
      saveDex();
    }

    function saveDex() {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({ cards: collection.slice(0, 48) }));
      } catch (e) {}
      countEl.textContent = `${collection.length} Card${collection.length === 1 ? '' : 's'}`;
    }

    function addCardToDex(spec) {
      const idx = collection.findIndex((c) => c.uid === spec.uid);
      if (idx >= 0) collection.splice(idx, 1);
      collection.unshift(spec);
      selectedCard = spec;
      saveDex();
    }

    // Build an interactive 3D-tilting Holographic Trading Card element
    function buildHoloCard(spec, { shader = 'holo', interactive = true } = {}) {
      const t1 = art.ELEMENT_TYPES[spec.type1] || art.ELEMENT_TYPES.electric;
      const t2 = spec.type2 ? art.ELEMENT_TYPES[spec.type2] : null;
      const stars = '★'.repeat(spec.rarity || 2);
      const wrap = document.createElement('div');
      wrap.className = `pkl-card${spec.shiny ? ' is-shiny' : ''}${spec.fusion ? ' is-fusion' : ''}`;
      wrap.style.setProperty('--tc1', t1.bg);
      wrap.style.setProperty('--tc2', t2 ? t2.bg : spec.c2);
      wrap.innerHTML = `
        <div class="pkl-card-glare"></div>
        <div class="pkl-card-foil"></div>
        <div class="pkl-card-head">
          <span class="pkl-card-dex">#${spec.dex}</span>
          <span class="pkl-card-name">${spec.name}</span>
          <span class="pkl-card-hp"><span>HP</span>${spec.hp}</span>
        </div>
        <div class="pkl-card-art">
          ${art.renderCreatureSvg(spec, { shader })}
          <div class="pkl-card-badges">
            <span class="pkl-type-pill" style="background:${t1.bg};color:${t1.fg}">${t1.icon} ${t1.label}</span>
            ${t2 ? `<span class="pkl-type-pill" style="background:${t2.bg};color:${t2.fg}">${t2.icon} ${t2.label}</span>` : ''}
            ${spec.shiny ? `<span class="pkl-type-pill shiny">✨ SHINY</span>` : ''}
            ${spec.fusion ? `<span class="pkl-type-pill fusion">🧬 FUSION</span>` : ''}
          </div>
        </div>
        <div class="pkl-card-moves">
          ${(spec.moves || []).map((m) => {
            const mt = art.ELEMENT_TYPES[m.type] || t1;
            return `<div class="pkl-move-row">
              <span class="pkl-move-ico">${mt.icon}</span>
              <span class="pkl-move-name">${m.name}</span>
              <span class="pkl-move-pwr">${m.pwr}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="pkl-card-foot">
          <span class="pkl-lore">${spec.lore || ''}</span>
          <span class="pkl-stars">${stars}</span>
        </div>`;

      if (interactive) {
        wrap.addEventListener('pointermove', (e) => {
          const r = wrap.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width;
          const py = (e.clientY - r.top) / r.height;
          const rx = (0.5 - py) * 22;
          const ry = (px - 0.5) * 24;
          wrap.style.setProperty('--rx', rx.toFixed(1) + 'deg');
          wrap.style.setProperty('--ry', ry.toFixed(1) + 'deg');
          wrap.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
          wrap.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        });
        wrap.addEventListener('pointerleave', () => {
          wrap.style.setProperty('--rx', '0deg');
          wrap.style.setProperty('--ry', '0deg');
        });
        wrap.addEventListener('click', (e) => {
          audio();
          const r = wrap.getBoundingClientRect();
          sparkleBurst(e.clientX || (r.left + r.width / 2), e.clientY || (r.top + r.height / 2), 7);
          art.playCreatureCry(spec);
        });
      }
      return wrap;
    }

    // ==================== TAB 1: BOOSTER PACKS & HOLO-DEX ====================
    function renderPackTab() {
      body.innerHTML = `
        <div class="pkl-split">
          <div class="pkl-left-col">
            <div class="pkl-pack-box" id="pkl-pack-box">
              <div class="pkl-booster" id="pkl-booster">
                <div class="pkl-booster-top" id="pkl-seal">✂️ TAP OR SWIPE TO RIP PACK</div>
                <div class="pkl-booster-art">${art.renderCreatureSvg(art.BASE_CREATURES[5], { shader: 'holo' })}</div>
                <div class="pkl-booster-title">POKÉLAB HOLO PACK</div>
                <div class="pkl-booster-sub">3 Procedural Cards · Shiny &amp; Fusion Odds!</div>
              </div>
              <div class="pkl-pack-pulls" id="pkl-pulls" hidden></div>
            </div>
            <div class="pkl-dex-strip" id="pkl-dex-strip"></div>
          </div>
          <div class="pkl-right-col" id="pkl-inspector"></div>
        </div>`;

      const booster = body.querySelector('#pkl-booster');
      const pullsEl = body.querySelector('#pkl-pulls');
      const stripEl = body.querySelector('#pkl-dex-strip');
      const inspector = body.querySelector('#pkl-inspector');

      function updateInspector() {
        inspector.innerHTML = '';
        if (!selectedCard && collection.length) selectedCard = collection[0];
        if (selectedCard) {
          inspector.appendChild(buildHoloCard(selectedCard, { shader: 'holo', interactive: true }));
        }
      }

      function updateStrip() {
        stripEl.innerHTML = collection.map((c, i) => `
          <button class="pkl-mini-card ${selectedCard && c.uid === selectedCard.uid ? 'on' : ''}${c.shiny ? ' shiny' : ''}" data-i="${i}">
            <div class="pkl-mini-art">${art.renderCreatureSvg(c, { shader: 'holo' })}</div>
            <span>${c.name}</span>
          </button>`).join('');
        stripEl.querySelectorAll('.pkl-mini-card').forEach((b) => {
          b.addEventListener('click', () => {
            audio();
            selectedCard = collection[+b.dataset.i];
            art.playCreatureCry(selectedCard);
            updateInspector();
            updateStrip();
          });
        });
      }

      booster.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (booster.classList.contains('ripping')) return;
        audio();
        booster.classList.add('ripping');
        const r = booster.getBoundingClientRect();
        sparkleBurst(r.left + r.width / 2, r.top + 30, 12);
        confettiBurst(el, r.left + r.width / 2, r.top + r.height / 2);
        playSfx('fanfare');

        T(() => {
          // Roll 3 procedural cards (1st = base, 2nd = base or shiny, 3rd = guaranteed rare/fusion/shiny!)
          const pulls = [];
          for (let i = 0; i < 3; i++) {
            const isShiny = Math.random() < (i === 2 ? 0.45 : 0.18);
            if (i === 2 && Math.random() < 0.55) {
              const pa = rand(art.BASE_CREATURES);
              let pb = rand(art.BASE_CREATURES);
              while (pb.id === pa.id) pb = rand(art.BASE_CREATURES);
              pulls.push(art.fuseCreatures(pa, pb, { shiny: isShiny }));
            } else {
              pulls.push(art.cloneCreature(rand(art.BASE_CREATURES), { shiny: isShiny }));
            }
          }
          pulls.forEach((c) => addCardToDex(c));
          booster.hidden = true;
          pullsEl.hidden = false;
          pullsEl.innerHTML = `
            <div class="pkl-pulls-row">
              ${pulls.map((c, pi) => `
                <div class="pkl-pull-chip ${c.shiny ? 'shiny' : ''}" data-pi="${pi}">
                  <div class="pkl-pull-svg">${art.renderCreatureSvg(c, { shader: 'holo' })}</div>
                  <strong>${c.name}</strong>
                  <small>${c.shiny ? '✨ SHINY' : c.fusion ? '🧬 FUSION' : '★ NEW'}</small>
                </div>`).join('')}
            </div>
            <button class="pkl-btn primary" id="pkl-another">🎴 Rip Another Pack!</button>`;

          art.playCreatureCry(pulls[0]);
          updateInspector();
          updateStrip();

          pullsEl.querySelectorAll('.pkl-pull-chip').forEach((ch) => {
            ch.addEventListener('click', () => {
              selectedCard = pulls[+ch.dataset.pi];
              art.playCreatureCry(selectedCard);
              updateInspector();
              updateStrip();
            });
          });
          pullsEl.querySelector('#pkl-another').addEventListener('click', () => {
            playSfx('pop');
            booster.classList.remove('ripping');
            booster.hidden = false;
            pullsEl.hidden = true;
          });
        }, 520);
      });

      updateInspector();
      updateStrip();
    }

    // ==================== TAB 2: DNA FUSION & SHADER STUDIO ====================
    function renderFusionTab() {
      body.innerHTML = `
        <div class="pkl-split">
          <div class="pkl-left-col">
            <div class="pkl-lab-panel">
              <div class="pkl-lab-row">
                <div class="pkl-parent-col">
                  <label>🧬 DNA Parent A (Head &amp; Type)</label>
                  <select id="pkl-pa"></select>
                </div>
                <div class="pkl-parent-col">
                  <label>🧬 DNA Parent B (Body &amp; Tail)</label>
                  <select id="pkl-pb"></select>
                </div>
              </div>
              <div class="pkl-lab-actions">
                <button class="pkl-btn" id="pkl-rnd-fus">🎲 Random Splice</button>
                <button class="pkl-btn" id="pkl-shiny-tog">${fusShiny ? '✨ Shiny: ON' : '✨ Shiny: OFF'}</button>
                <button class="pkl-btn primary" id="pkl-mint">⚡ Mint Card to Dex</button>
              </div>
              <div class="pkl-shader-bar">
                <span>Code-Art Shader:</span>
                <div class="pkl-shader-btns" id="pkl-shaders">
                  ${SHADERS.map(([s, label]) => `<button class="pkl-sh-btn ${s === curShader ? 'on' : ''}" data-sh="${s}">${label}</button>`).join('')}
                </div>
              </div>
            </div>
          </div>
          <div class="pkl-right-col" id="pkl-fus-preview"></div>
        </div>`;

      const selA = body.querySelector('#pkl-pa');
      const selB = body.querySelector('#pkl-pb');
      const preview = body.querySelector('#pkl-fus-preview');

      art.BASE_CREATURES.forEach((c, i) => {
        selA.add(new Option(`#${c.dex} ${c.name} (${c.type1.toUpperCase()})`, i, i === fusA, i === fusA));
        selB.add(new Option(`#${c.dex} ${c.name} (${c.type1.toUpperCase()})`, i, i === fusB, i === fusB));
      });

      let currentHybrid = null;
      function updateFusion() {
        const pa = art.BASE_CREATURES[fusA];
        const pb = art.BASE_CREATURES[fusB];
        currentHybrid = art.fuseCreatures(pa, pb, { shiny: fusShiny });
        preview.innerHTML = '';
        preview.appendChild(buildHoloCard(currentHybrid, { shader: curShader, interactive: true }));
      }

      selA.addEventListener('change', () => { fusA = +selA.value; updateFusion(); art.playCreatureCry(currentHybrid); });
      selB.addEventListener('change', () => { fusB = +selB.value; updateFusion(); art.playCreatureCry(currentHybrid); });

      body.querySelector('#pkl-rnd-fus').addEventListener('click', () => {
        audio();
        fusA = Math.floor(Math.random() * art.BASE_CREATURES.length);
        do { fusB = Math.floor(Math.random() * art.BASE_CREATURES.length); } while (fusB === fusA);
        fusShiny = Math.random() < 0.35;
        selA.value = fusA; selB.value = fusB;
        body.querySelector('#pkl-shiny-tog').textContent = fusShiny ? '✨ Shiny: ON' : '✨ Shiny: OFF';
        updateFusion();
        art.playCreatureCry(currentHybrid);
      });

      body.querySelector('#pkl-shiny-tog').addEventListener('click', (e) => {
        audio();
        fusShiny = !fusShiny;
        e.currentTarget.textContent = fusShiny ? '✨ Shiny: ON' : '✨ Shiny: OFF';
        updateFusion();
        playSfx('ding');
      });

      body.querySelector('#pkl-mint').addEventListener('click', (e) => {
        audio();
        addCardToDex(currentHybrid);
        const r = e.currentTarget.getBoundingClientRect();
        sparkleBurst(r.left + r.width / 2, r.top, 10);
        confettiBurst(el, r.left + r.width / 2, r.top);
        playSfx('fanfare');
        e.currentTarget.textContent = '✓ Minted to Holo-Dex!';
        T(() => { e.currentTarget.textContent = '⚡ Mint Card to Dex'; }, 1400);
      });

      body.querySelector('#pkl-shaders').addEventListener('click', (e) => {
        const b = e.target.closest('[data-sh]');
        if (!b) return;
        audio();
        curShader = b.dataset.sh;
        body.querySelectorAll('.pkl-sh-btn').forEach((x) => x.classList.toggle('on', x === b));
        playSfx('pop');
        updateFusion();
      });

      updateFusion();
    }

    // ==================== TAB 3: WHO'S THAT? + SAFARI CATCH ====================
    function renderSafariTab() {
      const isShiny = Math.random() < 0.25;
      const wildBase = rand(art.BASE_CREATURES);
      const wild = art.cloneCreature(wildBase, { shiny: isShiny });
      const choices = new Set([wildBase]);
      while (choices.size < 4) choices.add(rand(art.BASE_CREATURES));
      const choiceArr = [...choices].sort(() => Math.random() - 0.5);

      safariState = { wild, revealed: false, caught: false };

      body.innerHTML = `
        <div class="pkl-safari">
          <div class="pkl-safari-banner" id="pkl-saf-msg">❓ Who's That Creature?</div>
          <div class="pkl-safari-stage" id="pkl-saf-stage">
            <div class="pkl-saf-mon" id="pkl-saf-mon">
              ${art.renderCreatureSvg(wild, { shader: 'silhouette' })}
            </div>
          </div>
          <div class="pkl-saf-controls" id="pkl-saf-ctrl">
            <div class="pkl-saf-choices">
              ${choiceArr.map((c) => `<button class="pkl-btn" data-cid="${c.id}">${c.name}</button>`).join('')}
            </div>
          </div>
        </div>`;

      const msgEl = body.querySelector('#pkl-saf-msg');
      const monEl = body.querySelector('#pkl-saf-mon');
      const ctrlEl = body.querySelector('#pkl-saf-ctrl');

      function revealWild(guessedRight) {
        if (safariState.revealed) return;
        safariState.revealed = true;
        monEl.innerHTML = art.renderCreatureSvg(wild, { shader: 'holo' });
        monEl.classList.add('reveal-pop');
        const r = monEl.getBoundingClientRect();
        sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 10);
        art.playCreatureCry(wild);
        msgEl.textContent = `${guessedRight ? 'Spot on!' : "It's"} ${wild.shiny ? '✨ SHINY ' : ''}${wild.name}! Tap the Poké-Orb to catch!`;

        ctrlEl.innerHTML = `
          <button class="pkl-orb-btn" id="pkl-throw-orb">
            <span class="pkl-orb-svg">${art.renderCreatureSvg(wild, { shader: 'holo' }).slice(0, 0)}</span>
            <span class="pkl-orb-ball"></span>
            <span>Throw Poké-Orb!</span>
          </button>`;

        ctrlEl.querySelector('#pkl-throw-orb').addEventListener('pointerdown', (ev) => {
          ev.preventDefault();
          throwOrb();
        });
      }

      function throwOrb() {
        if (safariState.caught) return;
        safariState.caught = true;
        audio();
        playSfx('slideUp');
        msgEl.textContent = ' Throwing Poké-Orb…';
        monEl.innerHTML = `<div class="pkl-catch-ball shaking"></div>`;
        T(() => playSfx('pop'), 550);
        T(() => playSfx('pop'), 1100);
        T(() => {
          const b = monEl.querySelector('.pkl-catch-ball');
          if (b) b.classList.remove('shaking');
          const r = monEl.getBoundingClientRect();
          sparkleBurst(r.left + r.width / 2, r.top + r.height / 2, 12);
          confettiBurst(el, r.left + r.width / 2, r.top + r.height / 2);
          playSfx('fanfare');
          addCardToDex(wild);
          msgEl.textContent = `🎉 Gotcha! ${wild.name} was added to your Holo-Dex!`;
          ctrlEl.innerHTML = `<button class="pkl-btn primary" id="pkl-next-saf">🔍 Find Next Wild Creature</button>`;
          ctrlEl.querySelector('#pkl-next-saf').addEventListener('click', renderSafariTab);
        }, 1650);
      }

      monEl.addEventListener('click', () => { audio(); revealWild(true); });
      ctrlEl.querySelectorAll('[data-cid]').forEach((b) => {
        b.addEventListener('click', () => {
          audio();
          if (b.dataset.cid === wild.id) {
            playSfx('ding');
            revealWild(true);
          } else {
            playSfx('boing');
            b.disabled = true;
            b.style.opacity = '.45';
          }
        });
      });
    }

    // ==================== TAB 4: 1v1 ELEMENTAL BATTLE ARENA ====================
    function renderBattleTab() {
      const playerCard = selectedCard || collection[0] || art.cloneCreature(art.BASE_CREATURES[0]);
      let foeBase = rand(art.BASE_CREATURES);
      while (foeBase.id === playerCard.id) foeBase = rand(art.BASE_CREATURES);
      const foeCard = art.cloneCreature(foeBase, { shiny: Math.random() < 0.2 });

      battleState = {
        p: { ...playerCard, curHp: playerCard.hp, maxHp: playerCard.hp },
        e: { ...foeCard, curHp: foeCard.hp, maxHp: foeCard.hp },
        busy: false,
      };

      body.innerHTML = `
        <div class="pkl-arena">
          <div class="pkl-combatants">
            <div class="pkl-fighter ally" id="pkl-ally">
              <div class="pkl-hud">
                <div class="pkl-hud-top"><strong>${battleState.p.name}</strong><span id="pkl-p-hp">${battleState.p.curHp}/${battleState.p.maxHp}</span></div>
                <div class="pkl-hp-bar"><i id="pkl-p-bar" style="width:100%"></i></div>
              </div>
              <div class="pkl-sprite" id="pkl-p-spr">${art.renderCreatureSvg(battleState.p, { shader: 'holo' })}</div>
            </div>
            <div class="pkl-vs">VS</div>
            <div class="pkl-fighter foe" id="pkl-foe">
              <div class="pkl-hud">
                <div class="pkl-hud-top"><strong>Wild ${battleState.e.name}</strong><span id="pkl-e-hp">${battleState.e.curHp}/${battleState.e.maxHp}</span></div>
                <div class="pkl-hp-bar"><i id="pkl-e-bar" style="width:100%"></i></div>
              </div>
              <div class="pkl-sprite" id="pkl-e-spr">${art.renderCreatureSvg(battleState.e, { shader: 'holo' })}</div>
            </div>
          </div>
          <div class="pkl-battle-log" id="pkl-blog">Choose a move for ${battleState.p.name}!</div>
          <div class="pkl-battle-moves" id="pkl-bmoves">
            ${(battleState.p.moves || []).map((m, mi) => {
              const mt = art.ELEMENT_TYPES[m.type] || art.ELEMENT_TYPES.electric;
              return `<button class="pkl-btn primary" data-mi="${mi}" style="background:${mt.bg};color:${mt.fg}">${mt.icon} ${m.name} (${m.pwr})</button>`;
            }).join('')}
            <button class="pkl-btn" id="pkl-heal">🧪 Potion (+45 HP)</button>
            <button class="pkl-btn" id="pkl-new-foe">🔄 New Challenger</button>
          </div>
        </div>`;

      const logEl = body.querySelector('#pkl-blog');
      const pSpr = body.querySelector('#pkl-p-spr');
      const eSpr = body.querySelector('#pkl-e-spr');

      function updateHpBars() {
        const pPct = Math.max(0, Math.round(battleState.p.curHp / battleState.p.maxHp * 100));
        const ePct = Math.max(0, Math.round(battleState.e.curHp / battleState.e.maxHp * 100));
        body.querySelector('#pkl-p-hp').textContent = `${Math.max(0, battleState.p.curHp)}/${battleState.p.maxHp}`;
        body.querySelector('#pkl-e-hp').textContent = `${Math.max(0, battleState.e.curHp)}/${battleState.e.maxHp}`;
        body.querySelector('#pkl-p-bar').style.width = pPct + '%';
        body.querySelector('#pkl-e-bar').style.width = ePct + '%';
      }

      function calcMult(moveType, defType) {
        const t = art.ELEMENT_TYPES[moveType];
        if (t && t.beat && t.beat.includes(defType)) return 1.5;
        if (t && t.weak && t.weak.includes(defType)) return 0.75;
        return 1;
      }

      function enemyTurn() {
        if (battleState.e.curHp <= 0) return;
        const em = rand(battleState.e.moves);
        const mult = calcMult(em.type, battleState.p.type1);
        const dmg = Math.max(8, Math.round(em.pwr * mult * rnd(0.85, 1.1)));
        eSpr.classList.add('lunge');
        T(() => eSpr.classList.remove('lunge'), 360);
        pSpr.classList.add('hit');
        T(() => pSpr.classList.remove('hit'), 400);
        playSfx('laser');
        battleState.p.curHp = Math.max(0, battleState.p.curHp - dmg);
        updateHpBars();
        logEl.textContent = `Wild ${battleState.e.name} used ${em.name}! (${dmg} dmg${mult > 1 ? ' · Super effective!' : ''})`;

        if (battleState.p.curHp <= 0) {
          T(() => {
            battleState.p.curHp = battleState.p.maxHp;
            updateHpBars();
            logEl.textContent = ` Nurse healed ${battleState.p.name} back to full HP! Your turn!`;
            battleState.busy = false;
          }, 1100);
        } else {
          battleState.busy = false;
        }
      }

      body.querySelectorAll('[data-mi]').forEach((b) => {
        b.addEventListener('click', () => {
          if (battleState.busy) return;
          battleState.busy = true;
          audio();
          const m = battleState.p.moves[+b.dataset.mi];
          const mult = calcMult(m.type, battleState.e.type1);
          const dmg = Math.max(10, Math.round(m.pwr * mult * rnd(0.9, 1.15)));
          pSpr.classList.add('lunge');
          T(() => pSpr.classList.remove('lunge'), 360);
          eSpr.classList.add('hit');
          T(() => eSpr.classList.remove('hit'), 400);
          const er = eSpr.getBoundingClientRect();
          sparkleBurst(er.left + er.width / 2, er.top + er.height / 2, 8);
          art.playCreatureCry(battleState.p);

          battleState.e.curHp = Math.max(0, battleState.e.curHp - dmg);
          updateHpBars();
          logEl.textContent = `${battleState.p.name} used ${m.name}! (${dmg} dmg${mult > 1 ? ' · SUPER EFFECTIVE! 🔥' : ''})`;

          if (battleState.e.curHp <= 0) {
            T(() => {
              confettiBurst(el, er.left + er.width / 2, er.top + er.height / 2);
              playSfx('fanfare');
              addCardToDex(foeCard);
              logEl.textContent = `🏆 Victory! Wild ${battleState.e.name} joined your Holo-Dex!`;
              battleState.busy = false;
            }, 600);
          } else {
            T(enemyTurn, 950);
          }
        });
      });

      body.querySelector('#pkl-heal').addEventListener('click', () => {
        if (battleState.busy) return;
        audio();
        playSfx('ding');
        battleState.p.curHp = Math.min(battleState.p.maxHp, battleState.p.curHp + 45);
        updateHpBars();
        logEl.textContent = `🧪 Restored +45 HP to ${battleState.p.name}!`;
      });

      body.querySelector('#pkl-new-foe').addEventListener('click', () => {
        audio();
        playSfx('pop');
        renderBattleTab();
      });
    }

    function switchTab(t) {
      clearT();
      curTab = t;
      tabBtns.forEach((b) => b.classList.toggle('on', b.dataset.t === t));
      if (t === 'fusion') renderFusionTab();
      else if (t === 'safari') renderSafariTab();
      else if (t === 'battle') renderBattleTab();
      else renderPackTab();
    }

    tabBtns.forEach((b) => b.addEventListener('click', () => {
      audio();
      playSfx('pop');
      switchTab(b.dataset.t);
    }));

    this._start = async () => {
      if (!art) art = await import('./pokelabArt.js');
      loadSave();
      switchTab(ctx.modeSettings.tab || 'pack');
    };
    this._suspend = () => { clearT(); };
    this._onKey = (e) => {
      if (e.key === '1') switchTab('pack');
      else if (e.key === '2') switchTab('fusion');
      else if (e.key === '3') switchTab('safari');
      else if (e.key === '4') switchTab('battle');
    };
  },

  async enter() { await this._start(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
