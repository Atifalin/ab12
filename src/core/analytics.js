// ---------- privacy-friendly analytics ----------
// No cookies, no IDs, no third-party scripts. Events are fired as sendBeacon
// GETs to /a.gif (nginx returns 204); they land in the access log where the
// nightly server report mines them. Params:
//   e=s session (d=device class, n=1 first ever visit)
//   e=o mode open (m=mode id)
//   e=x mode close (m=mode id, t=seconds inside)
const ping = (q) => {
  try {
    const url = `/a.gif?${q}`;
    if (navigator.sendBeacon) navigator.sendBeacon(url);
    else fetch(url, { keepalive: true, cache: 'no-store' }).catch(() => {});
  } catch (e) {}
};

export function trackSession() {
  const w = Math.min(screen.width, screen.height) || 0;
  const d = w < 600 ? 'phone' : w < 1024 ? 'tablet' : 'desk';
  let fresh = false;
  try {
    fresh = !localStorage.getItem('ab12-seen');
    if (fresh) localStorage.setItem('ab12-seen', '1');
  } catch (e) {}
  ping(`e=s&d=${d}${fresh ? '&n=1' : ''}`);
}

let openSince = 0;
export function trackModeOpen(id) {
  openSince = Date.now();
  ping(`e=o&m=${encodeURIComponent(id)}`);
}
export function trackModeClose(id) {
  if (!openSince) return;
  const t = Math.round((Date.now() - openSince) / 1000);
  openSince = 0;
  if (t > 0 && t < 3600) ping(`e=x&m=${encodeURIComponent(id)}&t=${t}`);
}
