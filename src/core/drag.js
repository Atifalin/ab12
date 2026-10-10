// Shared drag engine — used by Word Monsters, Sort it! and Feed the Monster.
//
// makeDraggable(el, {
//   zones:  () => Element[]          drop targets evaluated per drag
//   onPick: (el) => {}
//   onMove: (el, x, y, zone|null) => {}
//   onDrop: (el, zone|null) => bool  true = accepted, false = spring back home
// }) => { destroy(), flyTo(x, y, done) }
//
// Positions are tracked against the element's untransformed resting centre
// (measured once at pick-up with transforms/animations disabled), so the
// element follows the pointer exactly with no feedback between frames.
// Zone hit-testing uses the pointer position (what the child is touching).
// Animate a just-dropped element from where it was released to the screen
// point (x, y), e.g. into a slot, basket or mouth. Uses the resting centre
// recorded at pick-up so the transform maths is relative to the untransformed
// element (replacing the transform with a delta from the *transformed* rect
// would jump by the drag distance).
export function flyFromDrop(el, x, y, { scale = 1, ms = 280, fade = false } = {}) {
  const rest = el._rest || (() => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  })();
  void el.offsetWidth; // commit the drop-position transform before transitioning
  el.style.transition = `transform ${ms}ms ease${fade ? `, opacity ${ms}ms` : ''}`;
  el.style.transform = `translate3d(${x - rest.x}px, ${y - rest.y}px, 0) scale(${scale})`;
  if (fade) el.style.opacity = '0';
}

export function makeDraggable(el, { zones = () => [], onPick, onMove, onDrop } = {}) {
  el.style.touchAction = 'none';
  let pid = null;              // active pointer id
  let offX = 0, offY = 0;      // pointer offset from the element centre
  let baseX = 0, baseY = 0;    // untransformed resting centre
  let curX = 0, curY = 0;      // current centre being rendered
  let raf = 0, moveRaf = 0;
  let zone = null;
  let savedTransition = '';

  const restCentre = () => {
    const prevT = el.style.transform;
    el.style.transform = 'none';
    const r = el.getBoundingClientRect();
    el.style.transform = prevT;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const render = (lift) => {
    el.style.transform = `translate3d(${curX - baseX}px, ${curY - baseY}px, 0)${lift ? ' scale(1.15)' : ''}`;
  };

  function hitZone(px, py) {
    let best = null, bestD = Infinity;
    for (const z of zones() || []) {
      const r = z.getBoundingClientRect();
      const pad = Math.max(12, Math.min(r.width, r.height) * 0.25); // forgiving for small hands
      if (px >= r.left - pad && px <= r.right + pad && py >= r.top - pad && py <= r.bottom + pad) {
        const d = Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2));
        if (d < bestD) { bestD = d; best = z; }
      }
    }
    return best;
  }

  function settle() {
    el.style.transform = '';
    el.style.transition = savedTransition;
    el.classList.remove('dragging');
    el.style.zIndex = '';
  }

  function returnHome() {
    cancelAnimationFrame(raf);
    const fx = curX, fy = curY, t0 = performance.now();
    const anim = (t) => {
      const k = Math.min(1, (t - t0) / 380);
      const e = 1 + 2.2 * Math.pow(k - 1, 3) + 1.5 * Math.pow(k - 1, 2); // springy overshoot
      curX = fx + (baseX - fx) * e;
      curY = fy + (baseY - fy) * e;
      render(false);
      if (k < 1) raf = requestAnimationFrame(anim);
      else settle();
    };
    raf = requestAnimationFrame(anim);
  }

  function onDown(e) {
    if (pid !== null || (e.pointerType === 'mouse' && e.button !== 0)) return;
    cancelAnimationFrame(raf);
    pid = e.pointerId;
    try { el.setPointerCapture(pid); } catch (err) { /* synthetic pointers */ }
    savedTransition = el.style.transition;
    el.style.transition = 'none';
    el.classList.add('dragging'); // CSS: .dragging { animation: none }
    el.style.zIndex = 60;
    const c = restCentre();
    baseX = c.x; baseY = c.y;
    offX = e.clientX - c.x; offY = e.clientY - c.y;
    curX = c.x; curY = c.y;
    el._rest = { x: c.x, y: c.y };
    render(true);
    if (onPick) onPick(el);
    e.preventDefault();
  }
  function onPointerMove(e) {
    if (e.pointerId !== pid) return;
    const px = e.clientX, py = e.clientY;
    curX = px - offX; curY = py - offY;
    zone = hitZone(px, py);
    if (!moveRaf) moveRaf = requestAnimationFrame(() => { moveRaf = 0; if (pid !== null) render(true); });
    if (onMove) onMove(el, curX, curY, zone);
    e.preventDefault();
  }
  function finish(e, cancelled) {
    if (e.pointerId !== pid) return;
    pid = null;
    cancelAnimationFrame(moveRaf); moveRaf = 0;
    if (!cancelled) zone = hitZone(e.clientX, e.clientY);
    const z = cancelled ? null : zone;
    zone = null;
    // hand back to the mode at the drop position (transform kept) so it can
    // animate the element onward with flyFromDrop()
    el.style.transition = savedTransition;
    el.classList.remove('dragging');
    el.style.zIndex = '';
    render(false);
    const accepted = z && onDrop ? onDrop(el, z) : false;
    if (!accepted) {
      el.classList.add('dragging');
      el.style.transition = 'none';
      returnHome();
    }
  }
  const onUp = (e) => finish(e, false);
  const onCancel = (e) => finish(e, true);

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onCancel);
  el.addEventListener('lostpointercapture', onCancel);

  return {
    destroy() {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(moveRaf);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
      el.removeEventListener('lostpointercapture', onCancel);
    },
    // animate the element's centre to (x, y) — keyboard-driven placement
    flyTo(x, y, done) {
      cancelAnimationFrame(raf);
      savedTransition = el.style.transition;
      el.style.transition = 'none';
      const c = restCentre();
      baseX = c.x; baseY = c.y;
      const fx = c.x, fy = c.y, t0 = performance.now();
      const anim = (t) => {
        const k = Math.min(1, (t - t0) / 400);
        const e = 1 - Math.pow(1 - k, 3);
        curX = fx + (x - fx) * e; curY = fy + (y - fy) * e;
        render(false);
        if (k < 1) raf = requestAnimationFrame(anim);
        else { el.style.transform = ''; el.style.transition = savedTransition; if (done) done(); }
      };
      raf = requestAnimationFrame(anim);
    },
  };
}
