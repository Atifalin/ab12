import { loadFamily, familyMembers, playLine } from '../core/family.js';
import { rand, rnd } from '../core/util.js';
import { CHEERS } from '../content.js';

// ---------- peekaboo mode ----------
// three.js is dynamically imported so it stays a separate chunk and only
// loads when the mode is opened. WebGL failure falls back to a DOM game.
const SPOT_EMOJI = ['🌳', '🎁', '🎪', '🌲'];
const PLACEHOLDERS = [
  { id: '_daddy', name: 'Daddy', title: '', emoji: '👨', color: '#5c7cfa' },
  { id: '_mommy', name: 'Mommy', title: '', emoji: '👩', color: '#ff5c8a' },
  { id: '_ezdan', name: 'Ezdan', title: '', emoji: '🧒', color: '#2fb8ff' },
];

export default {
  id: 'peekaboo',
  title: 'Peekaboo!',
  emoji: '👀',
  category: 'family',
  settings: [
    { key: 'game', label: 'Game', type: 'seg', default: 'free',
      options: [{ value: 'free', label: 'Free play' }, { value: 'where', label: "Where's…?" }] },
    { key: 'spots', label: 'Hiding spots', type: 'seg', default: 3,
      options: [{ value: 2, label: '2' }, { value: 3, label: '3' }, { value: 4, label: '4' }] },
  ],

  mount(el, ctx) {
    el.innerHTML = `
      <div class="pk-stage" id="pk-stage"></div>
      <button class="pk-prompt" id="pk-prompt" hidden aria-label="Hear it again">
        <span class="pk-big">🔊</span><span class="pk-who" id="pk-who"></span>
      </button>
      <div class="pk-banner" id="pk-banner">
        <span class="pk-emoji"></span>
        <span class="pk-lines"><span class="pk-name"></span><span class="pk-title"></span></span>
      </div>`;
    const stage = el.querySelector('#pk-stage');
    const promptBtn = el.querySelector('#pk-prompt');
    const whoEl = el.querySelector('#pk-who');
    const banner = el.querySelector('#pk-banner');
    const bannerEmoji = banner.querySelector('.pk-emoji');
    const bannerName = banner.querySelector('.pk-name');
    const bannerTitle = banner.querySelector('.pk-title');

    const { say, playSfx, effects, nextColor } = ctx;
    const { sparkleBurst, confettiBurst } = effects;

    let members = [];
    let spots = [];        // [{i}] mirrors view order
    let assigned = [];     // member per spot
    let view = null;
    let openSpot = -1;
    let hideT = null, roundT = null, bannerT = null;
    let target = null, targetSpot = -1, wrong = 0, locked = false;
    let destroyed = false;

    function showBanner(member) {
      bannerEmoji.textContent = member.emoji || '💖';
      bannerName.textContent = member.name + '!';
      bannerTitle.textContent = member.title || '';
      bannerTitle.style.display = member.title ? '' : 'none';
      banner.classList.remove('show');
      void banner.offsetWidth;
      banner.classList.add('show');
      clearTimeout(bannerT);
      bannerT = setTimeout(() => banner.classList.remove('show'), 2400);
    }

    function reshuffle() {
      const pool = [...members].sort(() => Math.random() - 0.5);
      assigned = spots.map((_, i) => pool[i % pool.length]);
    }

    function spotCenter(i) {
      const s = spots[i];
      if (s && view && view.screenPos) return view.screenPos(i);
      const r = stage.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }

    function celebrate(i, member) {
      const c = spotCenter(i);
      const r = stage.getBoundingClientRect();
      sparkleBurst(c.x, c.y, 8);
      confettiBurst(stage, c.x - r.left, c.y - r.top);
      playSfx('fanfare');
      showBanner(member);
    }

    function reveal(i) {
      if (openSpot >= 0 && openSpot !== i) hideSpot(openSpot);
      openSpot = i;
      const m = assigned[i];
      view.open(spots[i], m);
      playSfx('ding');
      showBanner(m);
      playLine(m, 'peekaboo');
      const c = spotCenter(i);
      sparkleBurst(c.x, c.y, 6);
      clearTimeout(hideT);
      hideT = setTimeout(() => { hideSpot(i); reshuffle(); }, 3000);
    }
    function hideSpot(i) {
      if (openSpot !== i) return;
      openSpot = -1;
      view.close(spots[i]);
    }

    function newWhereRound() {
      clearTimeout(roundT);
      wrong = 0;
      locked = false;
      reshuffle();
      targetSpot = Math.floor(Math.random() * spots.length);
      target = assigned[targetSpot];
      promptBtn.hidden = false;
      whoEl.textContent = `Where's ${target.name}?`;
      playLine(target, 'where');
    }

    function tap(i) {
      if (!view || locked) return;
      ctx.audio();
      if (ctx.modeSettings.game === 'where') {
        if (!target) return;
        if (i === targetSpot) {
          locked = true;
          openSpot = i;
          const m = assigned[i];
          view.open(spots[i], m);
          celebrate(i, m);
          playLine(m, 'fun');
          promptBtn.hidden = true;
          roundT = setTimeout(() => { hideSpot(i); newWhereRound(); }, 2600);
        } else {
          wrong++;
          view.peek(spots[i], assigned[i]);
          playLine(assigned[i], 'name');
          playSfx('boing');
          if (wrong >= 2) view.hintSpot(spots[targetSpot]);
        }
      } else {
        if (openSpot === i) { hideSpot(i); return; }
        reveal(i);
      }
    }

    promptBtn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (target) playLine(target, 'where');
    });

    // ==================== three.js view ====================
    async function initGL(n) {
      const THREE = await import('three');
      const { RoundedBoxGeometry } = await import('three/examples/jsm/geometries/RoundedBoxGeometry.js');
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      // size from the window box — iOS visual-viewport quirks can leave the
      // screen container taller/shorter than the visible area
      const viewW = () => Math.max(stage.clientWidth, window.innerWidth);
      const viewH = () => Math.max(stage.clientHeight, window.innerHeight);
      const W = viewW(), H = viewH();
      renderer.setSize(W, H);
      renderer.domElement.className = 'pk-canvas';
      stage.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      renderer.setClearColor('#a8e0ff'); // safety: never show black below the horizon
      scene.fog = new THREE.Fog(0xbfe8ff, 16, 34);
      const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);

      const disposables = [];
      const track = (o) => { disposables.push(o); return o; };

      // soft toon look: 4-step gradient map on every material
      const gradMap = track(new THREE.DataTexture(new Uint8Array([90, 150, 210, 255]), 4, 1, THREE.RedFormat));
      gradMap.minFilter = gradMap.magFilter = THREE.NearestFilter;
      gradMap.needsUpdate = true;
      const mat = (c) => track(new THREE.MeshToonMaterial({ color: c, gradientMap: gradMap }));
      const basicMat = (o) => track(new THREE.MeshBasicMaterial(o));
      const geo = (g) => track(g);
      // inverted-hull white outline for the glossy sticker feel —
      // added as a child so it follows its mesh automatically
      function outline(mesh, s = 1.06) {
        const o = new THREE.Mesh(mesh.geometry, basicMat({ color: '#ffffff', side: THREE.BackSide }));
        o.scale.setScalar(s);
        o.renderOrder = -1;
        mesh.add(o);
        return o;
      }

      // warm key + cool fill; no shadow maps (blob decals only)
      scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x6fbf4a, 1.15));
      const sun = new THREE.DirectionalLight(0xffeebb, 1.5);
      sun.position.set(5, 9, 6);
      scene.add(sun);
      const fill = new THREE.DirectionalLight(0x99ccff, 0.5);
      fill.position.set(-6, 4, 5);
      scene.add(fill);

      // sky gradient backdrop
      const skyCv = document.createElement('canvas');
      skyCv.width = 4; skyCv.height = 256;
      const sc = skyCv.getContext('2d');
      const sg = sc.createLinearGradient(0, 0, 0, 256);
      sg.addColorStop(0, '#63c1ff'); sg.addColorStop(0.55, '#a8e0ff'); sg.addColorStop(1, '#eafbe0');
      sc.fillStyle = sg; sc.fillRect(0, 0, 4, 256);
      const sky = new THREE.Mesh(geo(new THREE.PlaneGeometry(80, 40)),
        basicMat({ map: track(new THREE.CanvasTexture(skyCv)), fog: false }));
      sky.position.set(0, 10, -16);
      scene.add(sky);

      // soft sun disc
      const sunDisc = new THREE.Mesh(geo(new THREE.CircleGeometry(1.6, 32)),
        basicMat({ color: '#fff3b0', fog: false }));
      sunDisc.position.set(-8, 9.5, -14.5);
      scene.add(sunDisc);

      // drifting puffy clouds (flattened sphere clusters)
      const clouds = [];
      for (let i = 0; i < 3; i++) {
        const cl = new THREE.Group();
        const cm = basicMat({ color: '#ffffff', fog: false });
        for (const [dx, dy, s] of [[0, 0, 1], [-0.8, -0.15, 0.7], [0.8, -0.1, 0.75]]) {
          const b = new THREE.Mesh(geo(new THREE.SphereGeometry(s * 0.55, 16, 12)), cm);
          b.position.set(dx, dy, 0);
          b.scale.z = 0.5;
          cl.add(b);
        }
        cl.position.set(rnd(-9, 9), rnd(5.5, 8.5), -13 + i * 0.5);
        cl.userData.speed = rnd(0.15, 0.4);
        scene.add(cl);
        clouds.push(cl);
      }

      // rolling-hill ground: displaced plane with vertex-colour gradient
      {
        const g = geo(new THREE.PlaneGeometry(80, 30, 80, 30));
        const pos = g.attributes.position;
        const cols = [];
        const c1 = new THREE.Color('#57b83f'), c2 = new THREE.Color('#8fdc63');
        for (let i = 0; i < pos.count; i++) {
          const x = pos.getX(i), y = pos.getY(i);
          const h = Math.max(0, Math.sin(x * 0.16) * 0.5 + Math.cos(x * 0.07 + y * 0.3) * 0.4 - (y + 15) * 0.03);
          pos.setZ(i, h);
          const c = c1.clone().lerp(c2, Math.min(1, h * 1.4 + (y + 15) / 30 * 0.4));
          cols.push(c.r, c.g, c.b);
        }
        g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
        g.computeVertexNormals();
        const ground = new THREE.Mesh(g, track(new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: gradMap })));
        ground.rotation.x = -Math.PI / 2;
        // extends well past the camera so the bottom edge of frame is always grass
        ground.position.set(0, -0.05, 4);
        scene.add(ground);
      }

      // scattered flowers + grass tufts
      {
        const stemG = geo(new THREE.CylinderGeometry(0.025, 0.035, 0.35, 5));
        const headG = geo(new THREE.SphereGeometry(0.11, 10, 8));
        const leafG = geo(new THREE.ConeGeometry(0.09, 0.35, 5));
        const stemM = mat('#3d9e46');
        const petals = ['#ff77b9', '#ffe94d', '#ffffff', '#ff9f1c', '#b197fc'].map(mat);
        for (let i = 0; i < 10; i++) {
          const x = rnd(-6.5, 6.5), z = rnd(-1.5, 1.8);
          if (Math.abs(x) < 1.2 && z > -0.5) continue;
          const f = new THREE.Group();
          const st = new THREE.Mesh(stemG, stemM);
          st.position.y = 0.17;
          const hd = new THREE.Mesh(headG, petals[i % petals.length]);
          hd.position.y = 0.4;
          f.add(st, hd);
          f.position.set(x, 0, z);
          f.scale.setScalar(rnd(0.7, 1.2));
          scene.add(f);
        }
        for (let i = 0; i < 8; i++) {
          const t = new THREE.Mesh(leafG, stemM);
          t.position.set(rnd(-7, 7), 0.16, rnd(-2, 2));
          t.rotation.z = rnd(-0.3, 0.3);
          t.scale.setScalar(rnd(0.8, 1.5));
          scene.add(t);
        }
      }

      const blobTex = (() => {
        const cv = document.createElement('canvas');
        cv.width = cv.height = 64;
        const g = cv.getContext('2d');
        const gr = g.createRadialGradient(32, 32, 4, 32, 32, 30);
        gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
        return track(new THREE.CanvasTexture(cv));
      })();
      function blobShadow(x, z, w = 2.6) {
        const p = new THREE.Mesh(geo(new THREE.PlaneGeometry(w, w * 0.38)),
          basicMat({ map: blobTex, transparent: true, depthWrite: false }));
        p.rotation.x = -Math.PI / 2;
        p.position.set(x, 0.02, z + 0.5);
        scene.add(p);
      }

      // ---------- members ----------
      const texLoader = new THREE.TextureLoader();
      function memberTexture(m) {
        return new Promise((res) => {
          if (m.image) {
            texLoader.load(`family/img/${m.image}`,
              (t) => { t.colorSpace = THREE.SRGBColorSpace; res(track(t)); },
              undefined,
              () => res(avatarTexture(m)));
          } else res(avatarTexture(m));
        });
      }
      function avatarTexture(m) {
        const c = document.createElement('canvas');
        c.width = c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = m.color || '#8a63ff';
        g.beginPath(); g.arc(128, 128, 120, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fff';
        g.beginPath(); g.arc(128, 128, 104, 0, Math.PI * 2); g.fill();
        g.fillStyle = m.color || '#8a63ff';
        g.beginPath(); g.arc(128, 128, 92, 0, Math.PI * 2); g.fill();
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '110px Fredoka, sans-serif';
        g.fillStyle = '#fff';
        g.fillText(m.emoji || (m.name || '?')[0].toUpperCase(), 128, 140);
        return track(new THREE.CanvasTexture(c));
      }
      const backTex = (() => {
        const c = document.createElement('canvas');
        c.width = c.height = 256;
        const g = c.getContext('2d');
        g.fillStyle = '#fff';
        g.beginPath();
        g.roundRect(10, 10, 236, 236, 70);
        g.fill();
        return track(new THREE.CanvasTexture(c));
      })();
      function makeMember(tex) {
        const grp = new THREE.Group();
        // always on top of the hiding spot: no depth test, late render order
        const back = new THREE.Mesh(geo(new THREE.PlaneGeometry(2.05, 2.05)),
          basicMat({ map: backTex, transparent: true, depthTest: false, depthWrite: false }));
        back.position.z = -0.01;
        back.renderOrder = 10;
        const face = new THREE.Mesh(geo(new THREE.PlaneGeometry(1.9, 1.9)),
          basicMat({ map: tex, transparent: true, alphaTest: 0.05, depthTest: false, depthWrite: false }));
        face.renderOrder = 11;
        grp.add(back, face);
        grp.scale.setScalar(0.001);
        return grp;
      }

      // ---------- spots ----------
      function makeBush() {
        const g = new THREE.Group();
        const greens = ['#3d9e46', '#4cb355', '#2f8f3e', '#59c465', '#45a84e'];
        const blobs = [[-0.55, 0.55, 0, 0.62], [0.45, 0.6, 0.1, 0.68], [0, 0.95, -0.1, 0.6], [-0.9, 0.3, 0.15, 0.42], [0.95, 0.32, 0, 0.45]];
        for (let i = 0; i < blobs.length; i++) {
          const [x, y, z, r] = blobs[i];
          const s = new THREE.Mesh(geo(new THREE.SphereGeometry(r, 20, 14)), mat(greens[i % greens.length]));
          s.position.set(x, y, z);
          g.add(s);
          outline(s, 1.07);
        }
        // berries
        const berryM = mat('#ff5c8a');
        for (const [x, y, z] of [[-0.35, 0.85, 0.55], [0.55, 0.5, 0.6], [0.1, 0.45, 0.7]]) {
          const b = new THREE.Mesh(geo(new THREE.SphereGeometry(0.09, 10, 8)), berryM);
          b.position.set(x, y, z);
          g.add(b);
        }
        return { group: g, kind: 'bush', height: 1.6, parts: g.children.filter((c) => c.geometry && c.geometry.type === 'SphereGeometry' && c.geometry.parameters.radius > 0.3) };
        // (berry spheres have radius 0.09 and stay put)
      }
      function makeGift() {
        const g = new THREE.Group();
        const body = new THREE.Mesh(geo(new RoundedBoxGeometry(1.5, 1.1, 1.2, 4, 0.12)), mat('#ff5c8a'));
        body.position.y = 0.55;
        outline(body, 1.05);
        const ribbonV = new THREE.Mesh(geo(new THREE.BoxGeometry(0.24, 1.12, 1.22)), mat('#ffe94d'));
        ribbonV.position.y = 0.55;
        const ribbonH = new THREE.Mesh(geo(new THREE.BoxGeometry(1.52, 1.12, 0.24)), mat('#ffe94d'));
        ribbonH.position.y = 0.55;
        const lid = new THREE.Mesh(geo(new RoundedBoxGeometry(1.66, 0.34, 1.32, 4, 0.1)), mat('#e63946'));
        lid.position.y = 1.24;
        outline(lid, 1.05);
        // bow: two torus loops + knot
        const bow = new THREE.Group();
        const bl = new THREE.Mesh(geo(new THREE.TorusGeometry(0.16, 0.055, 10, 18)), mat('#ffe94d'));
        bl.rotation.y = 0.6; bl.position.x = -0.16;
        const br = bl.clone(); br.rotation.y = -0.6; br.position.x = 0.16;
        const knot = new THREE.Mesh(geo(new THREE.SphereGeometry(0.09, 10, 8)), mat('#f0c020'));
        bow.add(bl, br, knot);
        bow.position.y = 0.22;
        lid.add(bow);
        g.add(body, ribbonV, ribbonH, lid);
        return { group: g, kind: 'gift', height: 1.75, lid };
      }
      function makeCurtain() {
        const g = new THREE.Group();
        const frameM = mat('#8a5a2b');
        const post = geo(new RoundedBoxGeometry(0.22, 2.7, 0.24, 3, 0.07));
        const pl = new THREE.Mesh(post, frameM); pl.position.set(-1.05, 1.35, 0);
        const pr = new THREE.Mesh(post, frameM); pr.position.set(1.05, 1.35, 0);
        const beam = new THREE.Mesh(geo(new RoundedBoxGeometry(2.4, 0.3, 0.3, 3, 0.08)), frameM);
        beam.position.y = 2.75;
        g.add(pl, pr, beam);
        // scalloped valance: row of flattened spheres along the beam
        const valM = mat('#c92a42');
        for (let i = 0; i < 5; i++) {
          const s = new THREE.Mesh(geo(new THREE.SphereGeometry(0.28, 14, 10)), valM);
          s.position.set(-0.8 + i * 0.4, 2.62, 0.1);
          s.scale.set(1, 0.72, 0.4);
          g.add(s);
        }
        // curtains with wave folds (displaced plane)
        const mkCurtain = (side) => {
          const cg = geo(new THREE.PlaneGeometry(0.72, 2.4, 8, 1));
          const p = cg.attributes.position;
          for (let i = 0; i < p.count; i++)
            p.setZ(i, Math.sin((p.getX(i) + 0.36) * 9) * 0.09);
          cg.computeVertexNormals();
          const m = new THREE.Mesh(cg, mat('#e63946'));
          m.position.set(side * 0.62, 1.25, 0.12);
          return m;
        };
        const left = mkCurtain(-1), right = mkCurtain(1);
        g.add(left, right);
        return { group: g, kind: 'curtain', height: 2.9, left, right };
      }
      function makeTree() {
        const g = new THREE.Group();
        const trunk = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.26, 0.42, 1.7, 10)), mat('#8a5a2b'));
        trunk.position.y = 0.85;
        outline(trunk, 1.06);
        const greens = ['#3d9e46', '#4cb355', '#2f8f3e'];
        const crown = new THREE.Group();
        [[0, 2.2, 0, 1.0], [-0.7, 1.95, 0.1, 0.62], [0.65, 2.0, -0.05, 0.66]].forEach(([x, y, z, r], i) => {
          const s = new THREE.Mesh(geo(new THREE.SphereGeometry(r, 20, 14)), mat(greens[i % 3]));
          s.position.set(x, y, z);
          crown.add(s);
          outline(s, 1.07);
        });
        // little hollow in the trunk
        const hole = new THREE.Mesh(geo(new THREE.SphereGeometry(0.14, 10, 8)), mat('#5d3a1a'));
        hole.position.set(0.12, 0.8, 0.3);
        hole.scale.z = 0.4;
        g.add(trunk, crown, hole);
        return { group: g, kind: 'tree', height: 3.3, crown };
      }
      const BUILDERS = [makeBush, makeGift, makeCurtain, makeTree];

      // simple tween engine
      const tweens = [];
      function tween(dur, apply, done) {
        tweens.push({ t: 0, dur, apply, done });
      }
      const easeOut = (k) => 1 - Math.pow(1 - k, 3);
      const easeBack = (k) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };

      // aspect-aware layout: rows of spots positioned + camera fitted so ALL
      // spots (and a popping member above them) always fit with margin.
      const spotDefs = [];
      let memberGroups = [];
      function computeLayout() {
        const w = viewW(), h = viewH();
        const aspect = w / h;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
        const portrait = aspect < 0.95;
        // All spots stand on the ground at y=0. Portrait camera sits higher and
        // pitches down so depth reads naturally: further = higher + smaller.
        // n=4 portrait gets a 2x2 ground grid; 2-3 spots = one row.
        const rows = portrait && n === 4 ? [2, 2] : [n];
        const positions = [];
        let rowIdx = 0;
        for (const count of rows) {
          const back = rows.length === 2 && rowIdx === 0;
          const z = back ? -4.5 : 0;
          const sc = back ? 0.95 : 1;
          const gap = rows.length === 2 ? 3.6 : 3.1;
          for (let i = 0; i < count; i++) {
            const x = (i - (count - 1) / 2) * gap;
            positions.push({ x, z, y: 0, sc });
          }
          rowIdx++;
        }
        // fit: required camera distance so the widest row fits with margin
        const fovY = camera.fov * Math.PI / 180;
        const halfW = Math.max(...positions.map((p) => Math.abs(p.x) + 1.5 * p.sc));
        const tanH = Math.tan(fovY / 2) * aspect;
        const needZ = halfW / tanH + 1.2;
        const camZ = Math.max(portrait ? 8.5 : 8.2, needZ);
        camera.position.set(0, portrait ? 3.4 : 2.2, camZ);
        scene.fog.near = camZ + 6;
        scene.fog.far = camZ + 40;
        // pitch the camera so the front row's base sits ~72% down the frame
        const front = positions[positions.length - 1];
        let lookY = 1.15;
        for (let i = 0; i < 8; i++) {
          camera.lookAt(0, lookY, 0);
          const v = new THREE.Vector3(front.x, 0, front.z).project(camera);
          const err = (1 - v.y) / 2 - 0.72;
          if (Math.abs(err) < 0.005) break;
          lookY -= err * (Math.tan(fovY / 2) * (camZ - front.z)) * 1.1;
        }
        camera.lookAt(0, lookY, 0);
        positions.forEach((p, i) => {
          const def = spotDefs[i];
          if (!def) return;
          def.group.position.set(p.x, p.y || 0, p.z);
          def.baseScale = p.sc;
          def.baseY = p.y || 0;
          def.group.scale.setScalar(p.sc);
          def.hit.position.set(p.x, (p.y || 0) + 1.3 * p.sc, p.z + 0.3);
          def.hit.scale.setScalar(p.sc);
          def.memberHolder.position.set(p.x, (p.y || 0) + 0.2 * p.sc, p.z + 0.9);
          // member size from its real distance to the camera: ~30% of screen
          // height in portrait (42% landscape), never wider than 48% of the width
          const dist = camera.position.distanceTo(def.memberHolder.position);
          const viewHW = 2 * Math.tan(fovY / 2) * dist;
          def.memberScale = Math.min(viewHW * (portrait ? 0.3 : 0.42), viewHW * aspect * 0.48) / 2.05;
          // shift the sprite toward the centre if it would hang off a side edge
          const halfW = (2.05 * def.memberScale) / 2;
          const maxX = (viewHW * aspect) / 2 * 0.96 - halfW;
          def.popX = Math.max(-maxX, Math.min(maxX, p.x)) - p.x;
          // pop height: above the spot, but keep the sprite inside the viewport —
          // project the would-be top edge and lower it if it clips
          const worldH = 1.9 * def.memberScale;
          let popH = 1.15 * p.sc;
          const v = new THREE.Vector3(p.x, (p.y || 0) + 0.2 * p.sc + popH + worldH / 2, p.z + 0.9).project(camera);
          const topPx = (1 - v.y) / 2;
          if (topPx < 0.03) popH = Math.max(0.55 * p.sc, popH - (0.03 - topPx) * 2 * Math.tan(fovY / 2) * (camZ - p.z - 0.9));
          def.popH = popH;
          if (def.current >= 0 && def.sprites[def.current])
            def.sprites[def.current].scale.setScalar(def.memberScale);
        });
        renderer.setSize(w, h);
      }

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const xs = [0]; // positions come from computeLayout

      async function build() {
        const textures = await Promise.all(members.map(memberTexture));
        // order: portrait 2x2 puts the tall spots (theatre, tree) in the back row
        // and the short ones (bush, gift) in front so screen rects never overlap
        const order_ = (viewW() / viewH() < 0.95 && n === 4) ? [2, 3, 0, 1] : [0, 1, 2, 3];
        for (let i = 0; i < n; i++) {
          const def = BUILDERS[order_[i % 4]]();
          scene.add(def.group);
          const hit = new THREE.Mesh(geo(new THREE.BoxGeometry(2.6, 3.4, 2.4)),
            basicMat({ visible: false }));
          hit.userData.spot = i;
          scene.add(hit);
          def.hit = hit;
          def.memberHolder = new THREE.Group();
          scene.add(def.memberHolder);
          def.sprites = members.map((m, j) => {
            const s = makeMember(textures[j]);
            s.visible = false;
            def.memberHolder.add(s);
            return s;
          });
          def.current = -1;
          def.hintT = 0;
          spotDefs.push(def);
        }
        computeLayout();
        // per-spot shadows follow layout
        spotDefs.forEach((d) => blobShadow(d.group.position.x, d.group.position.z));
      }

      function spotOpen(def, mi) {
        if (def.current >= 0) def.sprites[def.current].visible = false;
        def.current = mi;
        const s = def.sprites[mi];
        const base = def.memberScale || 1;
        s.visible = true;
        s.rotation.z = 0;
        s.position.x = def.popX || 0;
        // springy overshoot pop, rising to popH above the holder
        const popY = def.popH ?? 0.9;
        tween(0.55, (k) => {
          const e = easeBack(k);
          s.scale.set(base * e, base * e, 1);
          s.position.y = -0.7 + (popY + 0.7) * easeOut(k);
        }, () => { s.userData.baseY = s.position.y; });
        if (def.kind === 'bush') {
          def.parts.forEach((p) => {
            p.userData.bx = p.userData.bx ?? p.position.x;
            const dir = p.userData.bx >= 0 ? 1 : -1;
            tween(0.4, (k) => { p.position.x = p.userData.bx + dir * k * 0.4; });
          });
        } else if (def.kind === 'gift') {
          tween(0.5, (k) => {
            const e = easeBack(Math.min(1, k * 1.1));
            def.lid.rotation.z = -e * 1.7;
            def.lid.rotation.x = e * 0.4;
            def.lid.position.y = 1.24 + e * 0.9;
          });
        } else if (def.kind === 'curtain') {
          tween(0.55, (k) => { def.left.position.x = -0.62 - easeOut(k) * 0.8; def.right.position.x = 0.62 + easeOut(k) * 0.8; });
        } else {
          tween(0.5, (k) => { def.crown.position.x = easeBack(k) * 0.6; def.crown.rotation.z = easeOut(k) * 0.25; });
        }
      }
      function spotClose(def) {
        if (def.current < 0) return;
        const s = def.sprites[def.current];
        const base = def.memberScale || 1;
        tween(0.3, (k) => { s.scale.set(base * (1 - k * 0.9), base * (1 - k * 0.95), 1); s.position.y = (s.position.y || 0) * (1 - k) - 0.7 * k; },
          () => { s.visible = false; def.current = -1; });
        if (def.kind === 'bush') {
          def.parts.forEach((p) => tween(0.35, (k) => {
            const dir = (p.userData.bx || 1) >= 0 ? 1 : -1;
            p.position.x = (p.userData.bx || 0) + dir * 0.4 * (1 - k);
          }));
        } else if (def.kind === 'gift') {
          tween(0.35, (k) => {
            const e = 1 - k;
            def.lid.rotation.z = -e * 1.7; def.lid.rotation.x = e * 0.4;
            def.lid.position.y = 1.24 + e * 0.9;
          });
        } else if (def.kind === 'curtain') {
          tween(0.35, (k) => { def.left.position.x = -0.62 - (1 - k) * 0.8; def.right.position.x = 0.62 + (1 - k) * 0.8; });
        } else {
          tween(0.35, (k) => { def.crown.position.x = (1 - k) * 0.6; def.crown.rotation.z = (1 - k) * 0.25; });
        }
      }
      function spotPeek(def) {
        if (def.current < 0) return;
        const s = def.sprites[def.current];
        const base = (def.memberScale || 1) * 0.62;
        s.visible = true;
        s.scale.set(base, base, 1);
        s.position.y = -0.4;
        tween(0.5, (k) => { s.position.x = Math.sin(k * Math.PI) * 0.9; });
        setTimeout(() => {
          if (!destroyed) tween(0.35, (k) => { s.scale.setScalar(base * (1 - k) + 0.001); s.position.y = -0.4 * (1 - k) - 0.4 * k; },
            () => { s.visible = false; s.position.x = 0; });
        }, 900);
      }
      function spotHint(def) {
        def.hintT = 1.6;
      }

      let raf = 0, last = 0, elapsed = 0;
      function loop(t) {
        if (destroyed) return;
        raf = requestAnimationFrame(loop);
        const dt = Math.min(0.05, (t - last) / 1000 || 0);
        last = t;
        elapsed += dt;
        for (let i = tweens.length - 1; i >= 0; i--) {
          const tw = tweens[i];
          tw.t += dt;
          const k = Math.min(1, tw.t / tw.dur);
          tw.apply(k);
          if (k >= 1) { tweens.splice(i, 1); if (tw.done) tw.done(); }
        }
        for (const cl of clouds) {
          cl.position.x += cl.userData.speed * dt;
          if (cl.position.x > 14) cl.position.x = -14;
        }
        for (const def of spotDefs) {
          if (def.hintT > 0) {
            def.hintT -= dt;
            def.group.rotation.z = Math.sin(elapsed * 14) * 0.07;
          } else def.group.rotation.z = 0;
          // gentle idle motion
          if (def.kind === 'bush') {
            const b = 1 + Math.sin(elapsed * 1.5 + def.group.position.x) * 0.025;
            def.group.scale.setScalar((def.baseScale || 1) * b);
          } else if (def.kind === 'curtain') {
            def.left.rotation.z = Math.sin(elapsed * 1.2) * 0.04;
            def.right.rotation.z = -Math.sin(elapsed * 1.2 + 1) * 0.04;
          } else if (def.kind === 'tree') {
            def.crown.rotation.y = Math.sin(elapsed * 0.7) * 0.05;
          }
          // head-tilt wobble on the visible member
          if (def.current >= 0) {
            const s = def.sprites[def.current];
            s.rotation.z = Math.sin(elapsed * 5) * 0.07;
            if (s.userData.baseY != null) s.position.y = s.userData.baseY + Math.sin(elapsed * 4) * 0.02;
          }
        }
        renderer.render(scene, camera);
      }

      function onPointer(e) {
        const r = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(spotDefs.map((d) => d.hit));
        if (hits.length) tap(hits[0].object.userData.spot);
      }
      const onResize = () => computeLayout();
      const onVis = () => { if (document.hidden) destroy(); };

      await build();
      reshuffle();
      renderer.domElement.addEventListener('pointerdown', onPointer);
      window.addEventListener('resize', onResize);
      window.addEventListener('orientationchange', onResize);
      if (window.visualViewport) window.visualViewport.addEventListener('resize', onResize);
      document.addEventListener('visibilitychange', onVis);
      raf = requestAnimationFrame(loop);

      function project(x, y, z) {
        const v = new THREE.Vector3(x, y, z).project(camera);
        const r = stage.getBoundingClientRect();
        return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
      }

      function destroy() {
        destroyed = true;
        cancelAnimationFrame(raf);
        renderer.domElement.removeEventListener('pointerdown', onPointer);
        window.removeEventListener('resize', onResize);
        window.removeEventListener('orientationchange', onResize);
        if (window.visualViewport) window.visualViewport.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVis);
        scene.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
              if (m.map) m.map.dispose();
              m.dispose();
            });
          }
        });
        disposables.forEach((d) => { if (d.dispose) d.dispose(); });
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
        spotDefs.length = 0;
        memberGroups = [];
      }

      return {
        open(spot, member) { spotOpen(spotDefs[spot.i], members.indexOf(member)); },
        close(spot) { spotClose(spotDefs[spot.i]); },
        peek(spot) {
          const def = spotDefs[spot.i];
          if (def.current < 0) def.current = members.indexOf(assigned[spot.i]);
          spotPeek(def);
        },
        hintSpot(spot) { spotHint(spotDefs[spot.i]); },
        screenPos(i) { const d = spotDefs[i]; return project(d.group.position.x, 2.2 * d.group.scale.y, d.group.position.z); },
        assign() {},
        dispose: destroy,
        info() { return { calls: renderer.info.render.calls, tris: renderer.info.render.triangles }; },
        debug() {
          const w = viewW(), h = viewH();
          return spotDefs.map((d) => {
            const p = d.group.position, s = d.group.scale.x;
            // project the spot's bounding box to screen fractions
            const corners = [
              new THREE.Vector3(p.x - 1.3 * s, p.y, p.z),
              new THREE.Vector3(p.x + 1.3 * s, p.y, p.z),
              new THREE.Vector3(p.x - 1.3 * s, p.y + (d.height || 3) * s, p.z),
              new THREE.Vector3(p.x + 1.3 * s, p.y + (d.height || 3) * s, p.z),
            ].map((v) => v.project(camera));
            const xs2 = corners.map((v) => (v.x + 1) / 2), ys = corners.map((v) => (1 - v.y) / 2);
            let mrect = null;
            if (d.current >= 0 && d.sprites[d.current].visible) {
              const s = d.sprites[d.current];
              const hp = d.memberHolder.position;
              const half = 1.0 * s.scale.x;
              const mc = [
                new THREE.Vector3(hp.x - half, hp.y + s.position.y - half, hp.z),
                new THREE.Vector3(hp.x + half, hp.y + s.position.y + half, hp.z),
              ].map((v) => v.project(camera));
              const mx = mc.map((v) => (v.x + 1) / 2), my = mc.map((v) => (1 - v.y) / 2);
              mrect = { l: mx[0], r: mx[1], t: my[1], b: my[0] };
            }
            return {
              cur: d.current,
              vis: d.current >= 0 && d.sprites[d.current].visible,
              scale: d.current >= 0 ? d.sprites[d.current].scale.x : 0,
              x: p.x, z: p.z,
              rect: { l: Math.min(...xs2), r: Math.max(...xs2), t: Math.min(...ys), b: Math.max(...ys) },
              mrect,
            };
          });
        },
      };
    }

    // ---------- DOM fallback view ----------
    function initDom(n) {
      const xs = n === 2 ? [25, 75] : n === 3 ? [18, 50, 82] : [12, 38, 62, 88];
      const els = xs.map((x, i) => {
        const b = document.createElement('button');
        b.className = 'pk-dom-spot pk-' + ['bush', 'gift', 'curtain', 'tree'][i % 4];
        b.style.left = x + '%';
        const e = document.createElement('span');
        e.className = 'pk-emoji-spot';
        e.textContent = SPOT_EMOJI[i % 4];
        const mm = document.createElement('span');
        mm.className = 'pk-member';
        b.append(e, mm);
        b.addEventListener('pointerdown', (ev) => { ev.preventDefault(); tap(i); });
        stage.appendChild(b);
        return { el: b, mm, i };
      });
      return {
        open(spot, member) {
          spot.mm.textContent = member.emoji || '🙂';
          spot.el.classList.add('open');
        },
        close(spot) { spot.el.classList.remove('open', 'peeking'); },
        peek(spot) {
          const m = assigned[spot.i];
          spot.mm.textContent = (m && m.emoji) || '🙂';
          spot.el.classList.add('peeking');
          setTimeout(() => spot.el.classList.remove('peeking'), 900);
        },
        hintSpot(spot) {
          spot.el.classList.add('hinted');
          setTimeout(() => spot.el.classList.remove('hinted'), 1600);
        },
        screenPos(i) { const r = els[i].el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top }; },
        assign() {},
        dispose() { els.forEach((s) => s.el.remove()); },
        info() { return { calls: 0, tris: 0 }; },
      };
    }

    async function start() {
      destroyed = false;
      await loadFamily();
      members = familyMembers();
      if (!members.length) members = PLACEHOLDERS;
      const n = Math.min(4, Math.max(2, +ctx.modeSettings.spots || 3));
      try {
        view = await initGL(n);
      } catch (e) {
        view = initDom(n);
      }
      spots = Array.from({ length: n }, (_, i) => ({ i }));
      reshuffle();
      if (view.assign) view.assign();
      if (ctx.modeSettings.game === 'where') newWhereRound();
      else promptBtn.hidden = true;
      window.__pkInfo = () => view && view.info ? view.info() : null;
      window.__pkDebug = () => view && view.debug ? view.debug() : null;
    }

    this._start = start;
    this._tap = tap;
    this._suspend = () => {
      destroyed = true;
      clearTimeout(hideT); clearTimeout(roundT); clearTimeout(bannerT);
      if (view) { try { view.dispose(); } catch (e) {} view = null; }
      promptBtn.hidden = true;
      openSpot = -1; target = null;
    };
    this._onKey = (e) => {
      if (/^[1-4]$/.test(e.key)) { const i = +e.key - 1; if (i < spots.length) tap(i); }
      else if (e.key === ' ') tap(Math.floor(Math.random() * spots.length));
    };
  },

  async enter() { await this._start(); },
  exit() { this._suspend(); },
  suspend() { this._suspend(); },
  onKey(e) { this._onKey(e); },
};
