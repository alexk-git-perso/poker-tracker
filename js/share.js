// Carte 1080×1350 dessinée sur un canvas, puis partage natif (WhatsApp, Messages…) ou téléchargement.
import { summary, cumulative, profitOf } from './stats.js';
import { eur, fmtD } from './format.js';
import { theme, initials, loadImage } from './profile.js';

// style : 'detail' (infos complètes) ou 'poster' (grande photo, résultat en très grand)
export async function card(kind, payload, P = {}, style = 'detail') {
  const th = theme(P), photo = await loadImage(P.photo), name = (P.name || '').trim();
  try { await Promise.all(['800 120px Rubik', '700 40px Rubik', '500 34px Inter'].map(f => document.fonts.load(f))); } catch (e) { /* polices système */ }
  const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(320, 0, 80, 540, 500, 1300);
  g.addColorStop(0, th.felt2); g.addColorStop(1, th.felt);
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(230,195,106,.5)'; x.lineWidth = 6; x.strokeRect(40, 40, W - 80, H - 80);
  const chip = (cx, cy, r, col) => {
    x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = r * .18; x.setLineDash([r * .42, r * .36]);
    x.beginPath(); x.arc(cx, cy, r * .82, 0, 7); x.stroke(); x.setLineDash([]);
    x.fillStyle = 'rgba(255,255,255,.9)'; x.beginPath(); x.arc(cx, cy, r * .5, 0, 7); x.fill();
    x.fillStyle = col; x.beginPath(); x.arc(cx, cy, r * .4, 0, 7); x.fill();
  };
  const T = (t, px, py, f, col, al) => { x.font = f; x.fillStyle = col; x.textAlign = al || 'left'; x.fillText(t, px, py); };
  const fit = (t, f0, max, w) => { let z = max; do { x.font = f0.replace('SZ', z); } while (x.measureText(t).width > w && (z -= 4) > 40); return f0.replace('SZ', z); };
  const rowsAt = (rows, y0, gap, big) => rows.forEach((r, i) => {
    const yy = y0 + i * gap;
    x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(100, yy + (big ? 36 : 28), 880, 2);
    T(r[0], 100, yy, big ? '500 44px Inter' : '500 36px Inter', '#cfe3d7'); T(r[1], 980, yy, big ? '700 60px Rubik' : '700 42px Rubik', '#f3efe4', 'right');
  });

  if (style === 'poster') { poster(x, kind, payload, { th, photo, name, chip, T, fit }); return new Promise(ok => c.toBlob(ok, 'image/png')); }
  if (photo) {
    // Photo du joueur en médaillon, cerclée de laiton
    x.save(); x.beginPath(); x.arc(860, 230, 126, 0, 7); x.clip(); x.drawImage(photo, 734, 104, 252, 252); x.restore();
    x.strokeStyle = '#e6c36a'; x.lineWidth = 8; x.beginPath(); x.arc(860, 230, 130, 0, 7); x.stroke();
    chip(975, 340, 40, th.accent);
  } else if (initials(name)) {
    chip(860, 230, 126, th.accent);
    x.font = '800 84px Rubik, sans-serif'; x.fillStyle = th.accent; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(initials(name), 860, 236); x.textBaseline = 'alphabetic';
  } else { chip(930, 180, 70, th.accent); chip(860, 250, 46, '#1f3a8a'); }
  if (kind === 'one') {
    const s = payload, p = profitOf(s), t = s.type === 'tournoi';
    T(t ? 'Tournoi' : 'Cash game', 100, 170, '600 38px Inter', '#e6c36a');
    const title = s.lieu || 'Session de poker';
    T(title, 100, 240, fit(title, '700 SZpx Rubik', 64, 580), '#f3efe4');
    T((s.jeu ? s.jeu + ' · ' : '') + fmtD(s.date), 100, 300, '500 34px Inter', '#cfe3d7');
    if (s.duree) T(dur(s), 100, 350, '500 30px Inter', 'rgba(207,227,215,.75)');
    const big = eur(p, true); T(big, 100, 620, fit(big, '800 SZpx Rubik', 200, 880), p >= 0 ? '#e6c36a' : '#ff8a8f');
    const rows = [['Buy-in', eur(s.buyin)], ['Cash-out', eur(s.cashout)]];
    if (s.recaves) rows.push(['Recaves', String(s.recaves)]);
    if (t && s.place) rows.push(['Place', s.place + 'e' + (s.joueurs ? ' sur ' + s.joueurs : '')]);
    rowsAt(rows, 800, 125, true);
  } else {
    const { list: L, label } = payload, k = summary(L);
    const head = name ? 'Bilan de ' + name + (label.startsWith('Bilan ') ? ' · ' + label.slice(6) : '') : label;
    T(head, 100, 170, fit(head, '600 SZpx Inter', 38, 600), '#e6c36a');
    if (L.length) T(fmtD(L[0].date) + ' → ' + fmtD(L[L.length - 1].date), 100, 230, fit(fmtD(L[0].date) + ' → ' + fmtD(L[L.length - 1].date), '500 SZpx Inter', 34, 600), '#cfe3d7');
    const big = eur(k.profit, true); T(big, 100, 520, fit(big, '800 SZpx Rubik', 190, 880), k.profit >= 0 ? '#e6c36a' : '#ff8a8f');
    const v = cumulative(L).map(q => q.v);
    if (v.length) {
      const lo = Math.min(0, ...v), hi = Math.max(0, ...v), sp = hi - lo || 1;
      const X = i => 100 + 880 * i / (v.length - 1 || 1), Y = q => 600 + 260 * (hi - q) / sp;
      x.strokeStyle = 'rgba(255,255,255,.4)'; x.lineWidth = 2; x.beginPath(); x.moveTo(100, Y(0)); x.lineTo(980, Y(0)); x.stroke();
      const path = () => { x.beginPath(); x.moveTo(X(0), Y(0)); v.forEach((q, i) => { if (i) { x.lineTo(X(i), Y(v[i - 1])); x.lineTo(X(i), Y(q)); } }); };
      path(); x.lineTo(X(v.length - 1), Y(0)); x.closePath(); x.fillStyle = 'rgba(230,195,106,.3)'; x.fill();
      path(); x.strokeStyle = '#e6c36a'; x.lineWidth = 7; x.lineJoin = 'round'; x.stroke();
    }
    rowsAt([['Sessions', String(k.n)], ['Bénéfice horaire', k.hourly == null ? '—' : eur(k.hourly, true) + '/h'], ['Sessions gagnantes', k.win == null ? '—' : Math.round(k.win * 100) + ' %']], 960, 90);
  }
  if (name && kind === 'one') T(name, 100, H - 90, fit(name, '700 SZpx Rubik', 40, 880), 'rgba(243,239,228,.8)');
  return new Promise(ok => c.toBlob(ok, 'image/png'));
}

export const canShareFiles = blob => {
  try { return !!navigator.canShare?.({ files: [new File([blob], 'x.png', { type: 'image/png' })] }); } catch (e) { return false; }
};

// 'shared' | 'cancelled' | 'downloaded'
export async function shareImage(blob, name) {
  if (canShareFiles(blob)) {
    try { await navigator.share({ files: [new File([blob], name, { type: 'image/png' })] }); return 'shared'; }
    catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
  }
  download(blob, name);
  return 'downloaded';
}

export function download(blob, name) {
  const a = document.createElement('a'), u = URL.createObjectURL(blob);
  a.href = u; a.download = name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 4000);
}

function poster(x, kind, payload, { th, photo, name, chip, T, fit }) {
  const cx = 540, cy = 290, r = 185;
  if (photo) {
    x.save(); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.clip(); x.drawImage(photo, cx - r, cy - r, 2 * r, 2 * r); x.restore();
    x.strokeStyle = '#e6c36a'; x.lineWidth = 10; x.beginPath(); x.arc(cx, cy, r + 6, 0, 7); x.stroke();
    chip(cx + 150, cy + 150, 52, th.accent);
  } else if (initials(name)) {
    chip(cx, cy, r, th.accent);
    x.font = '800 140px Rubik, sans-serif'; x.fillStyle = th.accent; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(initials(name), cx, cy + 8); x.textBaseline = 'alphabetic';
  } else { chip(cx - 60, cy, 150, th.accent); chip(cx + 120, cy + 70, 100, '#1f3a8a'); }
  let sub, big, cols, foot = '', date = '', small = '';
  if (kind === 'one') {
    const s = payload, p = profitOf(s), t = s.type === 'tournoi';
    sub = [t ? 'Tournoi' : 'Cash game', s.lieu, s.jeu].filter(Boolean).join(' · ');
    date = fmtD(s.date); small = s.duree ? dur(s) : '';
    big = [eur(p, true), p];
    cols = [['Buy-in', eur(s.buyin)], ['Cash-out', eur(s.cashout)]];
    foot = t && s.place ? s.place + 'e' + (s.joueurs ? ' sur ' + s.joueurs : '') : '';
  } else {
    const { list: L, label } = payload, k = summary(L);
    sub = label.replace('Mon bilan poker', 'Bilan');
    date = L.length ? fmtD(L[0].date) + ' → ' + fmtD(L[L.length - 1].date) : '';
    big = [eur(k.profit, true), k.profit];
    cols = [['Sessions', String(k.n)], ['Bénéfice horaire', k.hourly == null ? '—' : eur(k.hourly, true) + '/h']];
  }
  let y = 580;
  if (name) { T(name, cx, y, fit(name, '800 SZpx Rubik', 72, 880), '#f3efe4', 'center'); y += 60; }
  T(sub, cx, y, fit(sub, '500 SZpx Inter', 36, 900), '#cfe3d7', 'center');
  if (date) T(date, cx, y + 50, '500 34px Inter', '#cfe3d7', 'center');
  if (small) T(small, cx, y + 94, '500 28px Inter', 'rgba(207,227,215,.75)', 'center');
  T(big[0], cx, 960, fit(big[0], '800 SZpx Rubik', 260, 920), big[1] >= 0 ? '#e6c36a' : '#ff8a8f', 'center');
  x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(540, 1030, 2, 150);
  cols.forEach((c, i) => { const px = i ? 790 : 290; T(c[0], px, 1070, '500 38px Inter', '#cfe3d7', 'center'); T(c[1], px, 1150, fit(c[1], '700 SZpx Rubik', 68, 440), '#f3efe4', 'center'); });
  if (foot) T(foot, cx, 1250, fit(foot, '500 SZpx Inter', 34, 900), '#cfe3d7', 'center');
}

const dur = s => String(s.duree).replace('.', ',') + ' h de jeu';
