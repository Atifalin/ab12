#!/usr/bin/env python3
"""AB12 daily fun report — mines nginx access logs + docker stats and emails
a colourful HTML digest. Zero third-party deps (stdlib only). Cron it.

Usage: server_report.py [--print] [--hours N]
"""
import re, sys, html, json, subprocess, smtplib, ssl
from collections import Counter, defaultdict
from datetime import datetime, timezone
from email.mime.text import MIMEText
from urllib.parse import urlparse, parse_qs

EMAIL_TO = 'atifalin09@gmail.com'
EMAIL_FROM = 'AB12 Stats <stats@ezypath.in>'
GAME_NAMES = {
    'learn': '🔤 Letters & Numbers', 'smash': '💥 Smash!', 'find': '🔍 Find it!',
    'spell': '✏️ Spell it!', 'peekaboo': '👀 Peekaboo', 'wordmonsters': '👾 Word Monsters',
    'animalfarm': '🐮 Animal Farm', 'buildgo': '🚀 Build & Go', 'sortit': '🧺 Sort It!',
    'feed': '😋 Feed the Monster', 'puzzle': '🧩 Picture Puzzle',
}
AUDIO_GAMES = [
    ('voices', '🔤 Voice packs'), ('smash', '💥 Smash!'), ('snd', '🔤 Letters & Numbers'),
    ('wmact', '👾 Word Monsters'), ('wm', '👾 Word Monsters'),
    ('sorti', '🧺 Sort It!'), ('sortb', '🧺 Sort It!'), ('sortq', '🧺 Sort It!'), ('sort', '🧺 Sort It!'),
    ('feedsfx', '😋 Feed the Monster'), ('feedq', '😋 Feed the Monster'), ('feed', '😋 Feed the Monster'),
    ('animals', '🐮 Animal Farm'), ('anisay', '🐮 Animal Farm'), ('aniq', '🐮 Animal Farm'),
    ('ani', '🐮 Animal Farm'), ('farm', '🐮 Animal Farm'),
    ('bg', '🚀 Build & Go'), ('puz', '🧩 Picture Puzzle'), ('pv', '👀 Peekaboo'),
]
LINE = re.compile(r'"GET (\S+) HTTP/[^"]*" (\d{3}) (\d+) "[^"]*" "([^"]*)" "([^"]+)"')
HOUR = re.compile(r'\[\d+/\w+/\d+:(\d+)')
TS = re.compile(r'\[(\d{2}/\w{3}/\d{4}:\d{2}:\d{2}:\d{2}) ([+\-]\d{4})\]')


def sh(cmd):
    try:
        return subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=60).stdout
    except Exception:
        return ''


def collect(hours):
    # docker logs --since is unreliable with this log driver, so we pull the
    # whole buffer and cut on nginx's own [dd/Mon/yyyy:hh:mm:ss +0000] stamp.
    from datetime import timedelta
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=hours)
    d = {'req': 0, 'bytes': 0, 'ips': Counter(), 'hours': Counter(), 'sessions': Counter(),
         'new_users': 0, 'opens': Counter(), 'play_secs': defaultdict(int), 'longest': (None, 0),
         'audio': Counter(), 'devices': Counter(), 'nf': Counter(), 'paths': Counter()}
    for line in sh('docker logs ab12 2>&1').splitlines():
        ts = TS.search(line)
        if not ts:
            continue
        try:
            when = datetime.strptime(ts.group(1) + ' ' + ts.group(2), '%d/%b/%Y:%H:%M:%S %z')
        except ValueError:
            continue
        if when < cutoff:
            continue
        m = LINE.search(line)
        if not m:
            continue
        path, code, size, ua, ip = m.group(1), m.group(2), int(m.group(3) or 0), m.group(4), m.group(5).strip('"')
        d['req'] += 1
        d['bytes'] += size
        d['ips'][ip] += 1
        h = HOUR.search(line)
        if h:
            d['hours'][int(h.group(1))] += 1
        if code == '404':
            d['nf'][path] += 1
        if path.startswith('/a.gif'):
            q = parse_qs(urlparse(path).query)
            ev = (q.get('e') or [''])[0]
            if ev == 's':
                d['sessions'][(q.get('d') or ['?'])[0]] += 1
                if q.get('n'):
                    d['new_users'] += 1
            elif ev == 'o':
                d['opens'][(q.get('m') or ['?'])[0]] += 1
            elif ev == 'x':
                mid, t = (q.get('m') or ['?'])[0], int((q.get('t') or ['0'])[0] or 0)
                d['play_secs'][mid] += t
                if t > d['longest'][1]:
                    d['longest'] = (mid, t)
        elif path.startswith('/audio/'):
            pre = re.match(r'/audio/([a-z]+)', path)
            if pre:
                for k, name in AUDIO_GAMES:
                    if pre.group(1) == k:
                        d['audio'][name] += 1
                        break
        ual = ua.lower()
        if 'iphone' in ual:
            d['devices']['📱 iPhone'] += 1
        elif 'ipad' in ual:
            d['devices']['📱 iPad'] += 1
        elif 'android' in ual:
            d['devices']['🤖 Android'] += 1
        elif 'macintosh' in ual:
            d['devices']['💻 Mac'] += 1
        elif 'windows' in ual:
            d['devices']['💻 Windows'] += 1
        elif 'bot' in ual or 'crawler' in ual or 'curl' in ual:
            d['devices']['🤖 Bots'] += 1
        else:
            d['devices']['❓ Other'] += 1
        d['paths'][path.split('?')[0]] += 1
    return d


def containers():
    rows = []
    for l in sh("docker stats --no-stream --format '{{.Name}}|{{.CPUPerc}}|{{.MemUsage}}|{{.MemPerc}}'").splitlines():
        p = l.split('|')
        if len(p) == 4:
            rows.append((p[0], p[1], p[2], p[3]))
    return rows


def bar(frac, color, width=100):
    w = max(2, min(width, int(frac * width)))
    return (f'<div style="background:#e5e7eb;border-radius:99px;height:12px;width:{width}%">'
            f'<div style="background:{color};border-radius:99px;height:12px;width:{w}%"></div></div>')


def tile(label, val, color='#6366f1'):
    return (f'<td style="padding:6px"><div style="background:#f8fafc;border-radius:12px;padding:14px 10px;'
            f'text-align:center;border:1px solid #e5e7eb"><div style="font-size:22px;font-weight:800;color:{color}">{val}</div>'
            f'<div style="font-size:11px;color:#64748b;margin-top:2px">{label}</div></div></td>')


def build(d, hours):
    total_secs = sum(d['play_secs'].values())
    fav = d['opens'].most_common(1)
    fav_name = GAME_NAMES.get(fav[0][0], fav[0][0]) if fav else '—'
    uptime = sh("cut -d' ' -f1 /proc/uptime").strip()
    up_days = float(uptime) / 86400 if uptime else 0
    load = sh('cat /proc/loadavg').split()[:3]
    mem = sh("free -m | awk '/^Mem:/{print $2\"|\"$3}'").strip().split('|')
    disk = sh("df -h / | tail -1 | awk '{print $3\"|\"$2\"|\"$5}'").strip().split('|')
    mem_pct = int(mem[1]) / int(mem[0]) * 100 if len(mem) == 2 and int(mem[0]) else 0
    peak = d['hours'].most_common(1)
    plays = sum(d['opens'].values())
    sess = sum(d['sessions'].values())
    audio_hits = sum(d['audio'].values())
    bw = d['bytes'] / 1048576

    rows = ''
    for name, cnt in sorted(d['devices'].items(), key=lambda x: -x[1])[:5]:
        frac = cnt / max(1, d['req'])
        rows += (f'<tr><td style="padding:4px 8px;font-size:13px;width:110px">{name}</td>'
                 f'<td style="padding:4px 8px;width:60%">{bar(frac, "#0ea5e9")}</td>'
                 f'<td style="padding:4px 8px;font-size:12px;color:#64748b;text-align:right">{cnt}</td></tr>')

    game_rows = ''
    for mid, cnt in d['opens'].most_common(8):
        name = GAME_NAMES.get(mid, mid)
        mins = d['play_secs'].get(mid, 0) / 60
        frac = cnt / max(1, plays)
        game_rows += (f'<tr><td style="padding:4px 8px;font-size:13px;width:150px">{name}</td>'
                      f'<td style="padding:4px 8px;width:55%">{bar(frac, "#f59e0b")}</td>'
                      f'<td style="padding:4px 8px;font-size:12px;color:#64748b;text-align:right">{cnt} opens · {mins:.0f}m</td></tr>')
    if not game_rows:
        for name, cnt in d['audio'].most_common(8):
            frac = cnt / max(1, audio_hits)
            game_rows += (f'<tr><td style="padding:4px 8px;font-size:13px;width:150px">{name}</td>'
                          f'<td style="padding:4px 8px;width:55%">{bar(frac, "#f59e0b")}</td>'
                          f'<td style="padding:4px 8px;font-size:12px;color:#64748b;text-align:right">{cnt} sounds</td></tr>')
    if not game_rows:
        game_rows = '<tr><td style="padding:10px;font-size:13px;color:#94a3b8">No plays recorded yet — analytics just went live! 🐣</td></tr>'

    cont_rows = ''
    for name, cpu, memu, memp in sorted(containers(), key=lambda r: -float(r[1].rstrip('%') or 0))[:8]:
        try:
            cf = min(1.0, float(cpu.rstrip('%')) / 100)
        except ValueError:
            cf = 0
        cont_rows += (f'<tr><td style="padding:4px 8px;font-size:12px;font-family:monospace;width:150px">🐳 {html.escape(name)}</td>'
                      f'<td style="padding:4px 8px;width:45%">{bar(cf, "#8b5cf6")}</td>'
                      f'<td style="padding:4px 8px;font-size:11px;color:#64748b;text-align:right">CPU {cpu} · RAM {html.escape(memu.split("/")[0].strip())}</td></tr>')

    shame = ''.join(f'<li style="font-size:12px;color:#94a3b8;font-family:monospace">{html.escape(p)} <b>×{c}</b></li>'
                    for p, c in d['nf'].most_common(5)) or '<li style="font-size:12px;color:#94a3b8">Clean sheet — no 404s! 🎉</li>'
    longest = f"{GAME_NAMES.get(d['longest'][0], d['longest'][0])} for {d['longest'][1]//60}m {d['longest'][1]%60}s" if d['longest'][0] else '—'
    mood = '😴 deeply bored' if load and float(load[0]) < 0.5 else ('🙂 cruising' if load and float(load[0]) < 1.5 else '🥵 working hard')
    disk_pct = int(disk[2].rstrip('%')) if len(disk) == 3 else 0

    return f"""<html><body style="margin:0;background:#f1f5f9;font-family:-apple-system,Segoe UI,Roboto,sans-serif">
<div style="max-width:640px;margin:0 auto;padding:16px">
  <div style="background:linear-gradient(135deg,#ff5c8a,#7c3aed);border-radius:20px;padding:24px;color:#fff;text-align:center">
    <div style="font-size:30px;font-weight:900">📊 AB12 Daily Digest</div>
    <div style="font-size:13px;opacity:.9;margin-top:4px">{datetime.now(timezone.utc).strftime('%A, %d %b %Y')} · last {hours}h · ab12.ezypath.in</div>
  </div>
  <div style="background:#fff;border-radius:20px;padding:18px;margin-top:12px">
    <div style="font-size:16px;font-weight:800;margin-bottom:8px">🎮 Play Report</div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      {tile('game opens', plays)}
      {tile('sessions', sess, '#0ea5e9')}
      {tile('total playtime', f'{total_secs//60}m', '#f59e0b')}
      {tile('new installs', d['new_users'], '#10b981')}
    </tr></table>
    <div style="font-size:13px;margin:10px 8px 4px">🏆 <b>Game of the day:</b> {html.escape(str(fav_name))} &nbsp;·&nbsp; ⏱️ <b>Longest streak:</b> {html.escape(longest)} &nbsp;·&nbsp; 🕐 <b>Peak hour:</b> {f'{peak[0][0]:02d}:00 UTC' if peak else '—'}</div>
    <table width="100%" cellpadding="0" cellspacing="0">{game_rows}</table>
    <div style="font-size:12px;color:#64748b;margin-top:8px">🔊 {audio_hits} sound clips played · 📡 {d['req']} requests · {bw:.1f} MB served · 👥 {len(d['ips'])} unique IPs</div>
  </div>
  <div style="background:#fff;border-radius:20px;padding:18px;margin-top:12px">
    <div style="font-size:16px;font-weight:800;margin-bottom:8px">📱 Device Battle</div>
    <table width="100%" cellpadding="0" cellspacing="0">{rows}</table>
  </div>
  <div style="background:#fff;border-radius:20px;padding:18px;margin-top:12px">
    <div style="font-size:16px;font-weight:800;margin-bottom:8px">🖥️ Server Vitals <span style="font-size:12px;font-weight:400;color:#64748b">— the server is {mood}</span></div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      {tile('uptime streak 🔥', f'{up_days:.0f} days', '#ef4444')}
      {tile('load average', ' '.join(load), '#8b5cf6')}
      {tile('disk used', f'{disk[0]}/{disk[1]} ({disk[2]})' if len(disk) == 3 else '—', '#0ea5e9')}
    </tr></table>
    <div style="padding:4px 8px"><div style="font-size:12px;color:#64748b;margin-bottom:4px">RAM {html.escape(mem[1])}MB / {html.escape(mem[0])}MB ({mem_pct:.0f}%)</div>{bar(mem_pct/100, '#10b981')}
    <div style="font-size:12px;color:#64748b;margin:8px 0 4px">Disk ({disk_pct}%)</div>{bar(disk_pct/100, '#f59e0b')}</div>
    <div style="font-size:14px;font-weight:700;margin:12px 0 4px">🐳 Container Leaderboard <span style="font-size:11px;font-weight:400;color:#94a3b8">(by CPU right now)</span></div>
    <table width="100%" cellpadding="0" cellspacing="0">{cont_rows}</table>
  </div>
  <div style="background:#fff;border-radius:20px;padding:18px;margin-top:12px">
    <div style="font-size:16px;font-weight:800;margin-bottom:6px">👻 404 Hall of Shame</div>
    <ul style="margin:4px 0 0 18px;padding:0">{shame}</ul>
  </div>
  <div style="text-align:center;font-size:11px;color:#94a3b8;padding:16px">Sent with ❤️ by your own server · zero cookies were harmed making this report</div>
</div></body></html>"""


def smtp_creds():
    env = sh("docker inspect supabase-auth --format '{{json .Config.Env}}'")
    get = lambda k: (re.search(rf'{k}=([^"]+)', env) or [None, None])[1]
    return get('GOTRUE_SMTP_HOST'), int(get('GOTRUE_SMTP_PORT') or 465), get('GOTRUE_SMTP_USER'), get('GOTRUE_SMTP_PASS')


def main():
    hours = 25
    if '--hours' in sys.argv:
        hours = int(sys.argv[sys.argv.index('--hours') + 1])
    d = collect(hours)
    body = build(d, hours)
    if '--print' in sys.argv:
        print(body)
        return
    plays = sum(d['opens'].values())
    fav = d['opens'].most_common(1)
    fav_name = GAME_NAMES.get(fav[0][0], 'the quiet home screen').split(' ', 1)[-1] if fav else 'a quiet day'
    msg = MIMEText(body, 'html', 'utf-8')
    msg['Subject'] = f'📊 AB12 Daily: {plays} game opens · {fav_name} 🏆 · {d["req"]} requests'
    msg['From'], msg['To'] = EMAIL_FROM, EMAIL_TO
    host, port, user, pw = smtp_creds()
    if not (host and pw):
        sys.exit('no smtp creds found on supabase-auth')
    with smtplib.SMTP_SSL(host, port, context=ssl.create_default_context(), timeout=30) as s:
        s.login(user, pw)
        s.sendmail(EMAIL_FROM, [EMAIL_TO], msg.as_string())
    print(f'report sent to {EMAIL_TO}')


if __name__ == '__main__':
    main()
