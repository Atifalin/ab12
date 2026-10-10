// Shared drag engine — reusable across modes (Word Monsters now;
// Sort it! and Feed the Monster later).
//
// makeDraggable(el, {
//   zones:  () => Element[]          drop targets evaluated per drag
//   onPick: (el) => {}
//   onMove: (el, x, y, zone|null) => {}
//   onDrop: (el, zone|null) => bool  true = accepted, false = spring back home
//   home:   () => {x, y}             optional, defaults to pick-up point
// }) => { destroy() }
//
// Pointer events + setPointerCapture, touch-action:none, transform-only
// movement, ignore secondary pointers, springy return animation.
export function makeDraggable(el, { zones = () => [], onPick, onMove, onDrop, home } = {}) {
  el.style.touchAction = 'none';
  let pid = null;              // active pointer id
  let offX = 0, offY = 0;      // grab offset inside the element
  let baseX = 0, baseY = 0;    // pick-up centre (the "home" position)
  let raf = 0;
  let zone = null;

  const centre = () => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const moveTo = (x, y) => {
    const c = centre();
    const dx = x - c.x, dy = y - c.y;
    el.style.transform = `translate(${dx}px, ${dy}px)${el._lift || ''}`;
  };

  function hitZone(x, y) {
    for (const z of zones() || []) {
      const r = z.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return z;
    }
    return null;
  }

  function returnHome(fromX, fromY) {
    cancelAnimationFrame(raf);
    const t0 = performance.now();
    const hx = (home ? home() : baseX).x, hy = (home ? home() : baseX).y;
    const anim = (t) => {
      const k = Math.min(1, (t - t0) / 380);
      const e = 1 + 2.2 * Math.pow(k - 1, 3) + 1.5 * Math.pow(k - 1, 2); // springy
      moveTo(fromX + (hx - fromX) * e, fromY + (hy - fromY) * e);
      if (k < 1) raf = requestAnimationFrame(anim);
      else { moveTo(hx, hy); el.style.transform = ''; el._lift = ''; }
    };
    raf = requestAnimationFrame(anim);
  }

  function onDown(e) {
    if (pid !== null) return;
    pid = e.pointerId;
    try { el.setPointerCapture(pid); } catch (e) { /* synthetic pointers */ }
    const c = centre();
    baseX = c.x; baseY = c.y;
    offX = e.clientX - c.x; offY = e.clientY - c.y;
    el._lift = ' scale(1.15)';
    el.classList.add('dragging');
    el.style.zIndex = 60;
    if (onPick) onPick(el);
    e.preventDefault();
  }
  function onMove(e) {
    if (e.pointerId !== pid) return;
    const x = e.clientX - offX, y = e.clientY - offY;
    zone = hitZone(x, y);
    moveTo(x, y);
    if (onMove) onMove(el, x, y, zone);
  }
  function finish(e, cancelled) {
    if (e.pointerId !== pid) return;
    pid = null;
    const x = e.clientX - offX, y = e.clientY - offY;
    const z = cancelled ? null : zone;
    zone = null;
    el.classList.remove('dragging');
    el.style.zIndex = '';
    el._lift = '';
    const accepted = !cancelled && onDrop ? onDrop(el, z) : false;
    if (!accepted) returnHome(x, y);
  }
  const onUp = (e) => finish(e, false);
  const onCancel = (e) => finish(e, true);

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onCancel);
  el.addEventListener('lostpointercapture', onCancel);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      el.removeEventListener('lostpointercapture', onCancel);
    },
    // teleport helper for keyboard-driven placement
    flyTo(x, y, done) {
      const c = centre();
      const t0 = performance.now();
      const anim = (t) => {
        const k = Math.min(1, (t - t0) / 400);
        const e = 1 - Math.pow(1 - k, 3);
        moveTo(c.x + (x - c.x) * e, c.y + (y - c.y) * e);
        if (k < 1) requestAnimationFrame(anim);
        else { el.style.transform = ''; if (done) done(); }
      };
      requestAnimationFrame(anim);
    },
  };
}
