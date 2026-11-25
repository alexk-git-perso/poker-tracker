import * as db from './db.js';
import { summary, byGroup, byMonth, variance, cumulative, sortByDate, profitOf } from './stats.js';
import { esc, eur, fmtD, fmtM, today, uid } from './format.js';
import { card, shareImage, canShareFiles, download } from './share.js';
import { THEMES, applyTheme, initials, sourceFromFile, defaultCrop, clampCrop, drawCrop, cropToPhoto, loadImage } from './profile.js';
import { liveTotals, finishLive, clock } from './live.js';
import { RANKS, SUITS, suitOf, rankLabel, isCard, handName, cardHTML } from './cards.js';

const $ = id => document.getElementById(id);
const APP_VERSION = self.APP_VERSION || '?';
let P = {}, LIVE = null, S = [], filter = 'all', editing = null, ftype = 'cash', lastDel = null, tt, shot = null, stored = true;
const data = () => S;
const view = () => sortByDate(data().filter(s => filter === 'all' || s.type === filter));
const label = () => (filter === 'cash' ? 'Bilan cash game' : filter === 'tournoi' ? 'Bilan tournois' : 'Mon bilan poker');
const cls = v => (v == null ? '' : v >= 0 ? 'pos' : 'neg');

/* ---------- Rendu ---------- */
function render() {
  const L = view(), k = summary(L), all = data();
  $('tot').textContent = eur(k.profit, true);
  $('sub').textContent = k.n ? `sur ${k.n} session${k.n > 1 ? 's' : ''}${k.h ? ' · ' + k.h.toLocaleString('fr-FR') + ' h jouées' : ''}` : 'aucune session';

  const cards = [
    ['Bénéfice horaire', k.hourly == null ? '—' : eur(k.hourly, true) + '/h', k.hourly],
    ['Sessions gagnantes', k.win == null ? '—' : Math.round(k.win * 100) + ' %', null],
    ['Plus gros gain', k.n ? eur(k.best, true) : '—', k.n ? k.best : null],
    ['Plus grosse perte', k.n ? eur(k.worst, true) : '—', k.n ? k.worst : null],
  ];
  if (filter !== 'cash' && k.nT) cards.push(['ROI tournois', (k.roi > 0 ? '+' : '') + Math.round(k.roi * 100) + ' %', k.roi], ['Places payées', Math.round(k.itm * 100) + ' %', null]);
  $('stats').innerHTML = cards.map(c => `<div class="st"><small>${c[0]}</small><b class="${cls(c[2])}">${esc(c[1])}</b></div>`).join('');

  const rev = L.slice().reverse();
  $('list').innerHTML = rev.length ? rev.map(s => {
    const p = profitOf(s), t = s.type === 'tournoi';
    const meta = fmtD(s.date) + (s.duree ? ' · ' + String(s.duree).replace('.', ',') + ' h' : '') + (t && s.place ? ' · ' + s.place + 'e' + (s.joueurs ? '/' + s.joueurs : '') : '') + (s.recaves ? ' · ' + s.recaves + ' recave' + (s.recaves > 1 ? 's' : '') : '');
    return `<button class="row" data-id="${esc(s.id)}"><span class="chipi ${t ? 't' : ''}">${t ? 'MTT' : 'CG'}</span><span><span class="d">${esc(s.lieu || 'Session')}</span> <span class="m">· ${esc(s.jeu || (t ? 'Tournoi' : 'Cash game'))}</span><br><span class="m">${esc(meta)}</span>${s.hand?.length ? `<span class="cards" title="${esc(handName(s.hand))}">${s.hand.filter(isCard).map(c => cardHTML(c)).join('')}</span>` : ''}</span><span class="p ${cls(p)}">${eur(p, true)}<small>${eur(s.buyin)} → ${eur(s.cashout)}</small></span></button>`;
  }).join('') : '<div class="empty">Aucune session pour ce filtre. Ajoutez-en une avec « + Session ».</div>';

  const opts = k2 => [...new Set(all.map(s => s[k2]).filter(Boolean))].map(v => `<option value="${esc(v)}">`).join('');
  $('lieux').innerHTML = opts('lieu'); $('jeux').innerHTML = opts('jeu');
  renderAnalyse(L);
  draw();
}

function renderAnalyse(L) {
  const v = variance(L);
  const ddTxt = v.downswing && v.ddFrom != null ? `sur ${v.ddTo - v.ddFrom + 1} session${v.ddTo > v.ddFrom ? 's' : ''}` : '';
  $('var').innerHTML = [
    ['Écart-type par session', v.sd == null ? '—' : '± ' + eur(v.sd), ''],
    ['Pire downswing', v.downswing ? eur(-v.downswing) : '0 €', ddTxt],
    ['Plus longue série perdante', v.streak + ' session' + (v.streak > 1 ? 's' : ''), ''],
  ].map(c => `<div class="st"><small>${c[0]}</small><b>${esc(c[1])}</b>${c[2] ? `<small>${esc(c[2])}</small>` : ''}</div>`).join('');

  const M = byMonth(L).slice(-12), mx = Math.max(1, ...M.map(m => Math.abs(m.profit)));
  $('months').innerHTML = M.length ? M.map(m => {
    const w = Math.abs(m.profit) / mx * 50, pos = m.profit >= 0;
    return `<span>${esc(fmtM(m.month))}</span><span class="bw"><i style="${pos ? 'left:50%' : 'right:50%'};width:${w}%;background:var(${pos ? '--gain' : '--loss'})"></i></span><b class="${m.n ? cls(m.profit) : ''}">${m.n ? eur(m.profit, true) : '—'}</b>`;
  }).join('') : '<span class="note">Pas encore de données.</span>';

  const table = rows => rows.length ? `<table><thead><tr><th></th><th>Sessions</th><th>Bénéfice</th><th>€/h</th></tr></thead><tbody>${rows.map(r =>
    `<tr><td>${esc(r.name)}</td><td>${r.n}</td><td class="${cls(r.profit)}">${eur(r.profit, true)}</td><td>${r.hourly == null ? '—' : esc(eur(r.hourly, true))}</td></tr>`).join('')}</tbody></table>` : '<p class="note">Pas encore de données.</p>';
  $('bylieu').innerHTML = table(byGroup(L, 'lieu'));
  $('byjeu').innerHTML = table(byGroup(L, 'jeu'));
}

const svg = $('svg');
function draw() {
  const L = view(), W = svg.clientWidth, H = svg.clientHeight;
  if (!W || !H) return;
  if (!L.length) { svg.innerHTML = `<text x="${W / 2}" y="${H / 2}" text-anchor="middle">La courbe apparaîtra après votre première session</text>`; return; }
  const pts = cumulative(L);
  const ml = W < 520 ? 6 : 56, mr = W < 520 ? 70 : 90, mt = 24, mb = 26;
  const vs = pts.map(p => p.v), lo = Math.min(0, ...vs), hi = Math.max(0, ...vs), span = hi - lo || 1;
  const x = i => ml + (W - ml - mr) * i / (pts.length - 1 || 1), y = v => mt + (H - mt - mb) * (hi - v) / span;
  const step = 10 ** Math.floor(Math.log10(span)), st = span / step > 5 ? step * 2 : span / step > 2.5 ? step : step / 2;
  let g = '';
  for (let v = Math.ceil(lo / st) * st; v <= hi; v += st) {
    g += `<line x1="${ml}" x2="${W - mr}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,${v === 0 ? .45 : .12})" ${v === 0 ? '' : 'stroke-dasharray="2 4"'}/>`;
    if (W >= 520) g += `<text x="${ml - 8}" y="${y(v) + 4}" text-anchor="end">${esc(eur(v))}</text>`;
  }
  let d = `M${x(0)},${y(0)}`;
  pts.forEach((p, i) => { if (i) d += `H${x(i)}V${y(p.v)}`; });
  const last = pts[pts.length - 1], lx = x(pts.length - 1), ly = y(last.v), mid = Math.floor((pts.length - 1) / 2);
  svg.innerHTML = `<defs><linearGradient id="gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6c36a" stop-opacity=".55"/><stop offset="1" stop-color="#e6c36a" stop-opacity=".05"/></linearGradient></defs>${g}
  <path d="${d}V${y(0)}H${x(0)}Z" fill="url(#gA)"/><path d="${d}" fill="none" stroke="#e6c36a" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="${lx}" cy="${ly}" r="6" fill="#e6c36a" stroke="var(--felt)" stroke-width="3"/><text x="${lx + 10}" y="${ly + 5}" style="font:700 15px Rubik,sans-serif;fill:#f3efe4">${esc(eur(last.v, true))}</text>
  <text x="${ml}" y="${H - 6}">${esc(fmtD(L[0].date))}</text>${W >= 520 && pts.length > 4 ? `<text x="${x(mid)}" y="${H - 6}" text-anchor="middle">${esc(fmtD(pts[mid].d))}</text>` : ''}<text x="${W - mr}" y="${H - 6}" text-anchor="end">${esc(fmtD(last.d))}</text>`;
}
new ResizeObserver(draw).observe(svg);

/* ---------- Stockage ---------- */
const fail = () => { stored = false; $('sync').textContent = 'Attention : ce navigateur bloque le stockage local. Vos sessions seront perdues en fermant l’appli : faites une sauvegarde.'; };
const persistOne = s => db.put(s).catch(fail);
const persistAll = () => db.replaceAll(S).catch(fail);

/* ---------- Filtres et onglets ---------- */
document.querySelectorAll('#flt button').forEach(b => b.onclick = () => {
  filter = b.dataset.f;
  document.querySelectorAll('#flt button').forEach(o => o.setAttribute('aria-pressed', o === b));
  render();
});
const tabs = [...document.querySelectorAll('[role=tab]')];
function showTab(id) {
  tabs.forEach(t => { const on = t.id === id; t.setAttribute('aria-selected', on); $(t.getAttribute('aria-controls')).hidden = !on; });
  try { localStorage.setItem('poker-tab', id); } catch (e) { /* facultatif */ }
}
tabs.forEach(t => t.onclick = () => showTab(t.id));
try { const t = localStorage.getItem('poker-tab'); if (t && $(t)) showTab(t); } catch (e) { /* facultatif */ }

/* ---------- Formulaire ---------- */
const F = ['date', 'duree', 'lieu', 'jeu', 'buyin', 'cashout', 'place', 'joueurs', 'notes'];
const NUM = ['duree', 'buyin', 'cashout', 'place', 'joueurs'];
function setType(t) {
  ftype = t;
  document.querySelectorAll('#ty button').forEach(b => b.setAttribute('aria-pressed', b.dataset.t === t));
  $('tsec').hidden = t !== 'tournoi'; live();
}
document.querySelectorAll('#ty button').forEach(b => b.onclick = () => setType(b.dataset.t));
function live() {
  const el = $('live');
  if (!$('f-buyin').value && !$('f-cashout').value) { el.textContent = ''; return; }
  const p = (+$('f-cashout').value || 0) - (+$('f-buyin').value || 0);
  el.textContent = 'Résultat : ' + eur(p, true); el.className = 'live ' + cls(p);
}
['f-buyin', 'f-cashout'].forEach(i => $(i).oninput = live);
function openForm(s) {
  editing = s ? s.id : null;
  $('ft').textContent = editing ? 'Modifier la session' : 'Nouvelle session';
  $('del').hidden = $('shareOne').hidden = !editing;
  $('golive').hidden = $('golivehint').hidden = !!editing || !!LIVE;
  const last = sortByDate(S).pop();
  const v = s || { date: today(), lieu: last?.lieu || '', jeu: last?.jeu || '', type: last?.type || 'cash' };
  F.forEach(f => $('f-' + f).value = v[f] ?? '');
  setType(v.type || 'cash');
  formHand = (v.hand || []).filter(isCard); renderHandBtn();
  $('sh').classList.add('on');
}
const closeForm = () => { $('sh').classList.remove('on'); };
$('add').onclick = () => openForm();
$('cancel').onclick = closeForm;
$('list').onclick = e => {
  const r = e.target.closest('.row'); if (!r) return;
  const s = S.find(x => x.id === r.dataset.id);
  openForm(s || null);
};
$('frm').onsubmit = e => {
  e.preventDefault();
  const o = { id: editing || uid(), type: ftype };
  F.forEach(f => { const v = $('f-' + f).value.trim(); o[f] = NUM.includes(f) ? (v === '' ? null : +v) : v; });
  o.buyin ||= 0; o.cashout ||= 0;
  const prev = editing && S.find(s => s.id === editing);
  if (prev?.recaves) o.recaves = prev.recaves;
  if (formHand.length) o.hand = formHand.slice();
  if (ftype !== 'tournoi') { o.place = null; o.joueurs = null; }
  S = editing ? S.map(s => (s.id === editing ? o : s)) : S.concat(o);
  persistOne(o); closeForm();
  // Montrer la session enregistrée : onglet Sessions, filtre compatible, ligne mise en évidence
  showTab('tab-sessions');
  if (filter !== 'all' && filter !== o.type) document.querySelector('#flt [data-f=all]').click(); else render();
  const row = [...document.querySelectorAll('.row')].find(r => r.dataset.id === o.id);
  if (row) { row.classList.add('new'); row.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); setTimeout(() => row.classList.remove('new'), 2000); }
  toast(editing ? 'Session modifiée.' : 'Session ajoutée.');
  if (S.length === 1) db.persist();
};
function toast(m, undo) {
  $('tmsg').textContent = m; $('undo').hidden = !undo; $('toast').classList.add('on');
  clearTimeout(tt); tt = setTimeout(() => $('toast').classList.remove('on'), 6000);
}
$('del').onclick = () => {
  lastDel = S.find(s => s.id === editing);
  S = S.filter(s => s.id !== editing); db.remove(editing).catch(fail);
  closeForm(); render(); toast('Session supprimée.', true);
};
$('undo').onclick = () => { if (lastDel) { S = S.concat(lastDel); persistOne(lastDel); lastDel = null; render(); } $('toast').classList.remove('on'); };

/* ---------- Fenêtres : fermeture ---------- */
const sheets = ['sh', 'bks', 'shs'];
sheets.forEach(id => $(id).addEventListener('click', e => { if (e.target.id === id) id === 'sh' ? closeForm() : $(id).classList.remove('on'); }));
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if ($('sh').classList.contains('on')) closeForm(); ['bks', 'shs', 'pfs', 'crs', 'hds'].forEach(id => $(id).classList.remove('on')); } });

/* ---------- Sauvegarde ---------- */
$('bk').onclick = () => { $('bktxt').value = JSON.stringify(S, null, 1); $('bkmsg').textContent = ''; $('bks').classList.add('on'); };
$('bkclose').onclick = () => $('bks').classList.remove('on');
$('bksave').onclick = () => { download(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }), 'poker-sauvegarde-' + today() + '.json'); $('bkmsg').textContent = 'Fichier téléchargé.'; };
$('bkcopy').onclick = async () => {
  try { await navigator.clipboard.writeText($('bktxt').value); $('bkmsg').textContent = 'Copié.'; }
  catch (e) { $('bktxt').select(); $('bkmsg').textContent = 'Sélectionné : copiez avec Ctrl+C ou un appui long.'; }
};
$('bkfile').onchange = async () => { const f = $('bkfile').files[0]; if (f) { $('bktxt').value = await f.text(); $('bkmsg').textContent = 'Fichier chargé : appuyez sur Importer.'; } };
const clean = s => ({
  id: String(s.id || uid()), type: s.type === 'tournoi' ? 'tournoi' : 'cash', date: String(s.date).slice(0, 10),
  lieu: String(s.lieu || ''), jeu: String(s.jeu || ''), buyin: +s.buyin, cashout: +s.cashout,
  duree: s.duree == null ? null : +s.duree, place: s.place == null ? null : +s.place, joueurs: s.joueurs == null ? null : +s.joueurs, recaves: +s.recaves || 0, notes: String(s.notes || ''), ...(Array.isArray(s.hand) && s.hand.every(isCard) && s.hand.length ? { hand: s.hand.slice(0, 5) } : {}),
});
$('bkimp').onclick = () => {
  try {
    const a = JSON.parse($('bktxt').value); if (!Array.isArray(a)) throw 0;
    S = a.filter(s => s && /^\d{4}-\d{2}-\d{2}/.test(s.date) && isFinite(s.buyin) && isFinite(s.cashout)).map(clean);
    persistAll(); render(); $('bkmsg').textContent = S.length + ' sessions importées.';
  } catch (e) { $('bkmsg').textContent = 'Ce texte n’est pas une sauvegarde valide.'; }
};

/* ---------- Partage en image ---------- */
let shots = {}, pickSt = 'detail';
try { pickSt = localStorage.getItem('poker-card') === 'poster' ? 'poster' : 'detail'; } catch (e) { /* facultatif */ }
function pick(st) {
  pickSt = st; shot = shots[st];
  document.querySelectorAll('#shpick [data-st]').forEach(b => b.setAttribute('aria-checked', b.dataset.st === st));
  try { localStorage.setItem('poker-card', st); } catch (e) { /* facultatif */ }
}
$('shpick').onclick = e => { const b = e.target.closest('[data-st]'); if (b && shots[b.dataset.st]) pick(b.dataset.st); };
async function share(kind, s) {
  const payload = kind === 'one' ? s : { list: view(), label: label() };
  const [d, p] = await Promise.all([card(kind, payload, P, 'detail'), card(kind, payload, P, 'poster')]);
  if (!d || !p) { toast('Image impossible à créer sur cet appareil.'); return; }
  const base = kind === 'one' ? 'poker-' + s.date : 'poker-bilan-' + today();
  shots = { detail: { blob: d, name: base + '.png' }, poster: { blob: p, name: base + '-photo.png' } };
  document.querySelectorAll('#shpick [data-st]').forEach(b => { const im = b.querySelector('img'); if (im.src) URL.revokeObjectURL(im.src); im.src = URL.createObjectURL(shots[b.dataset.st].blob); });
  pick(pickSt);
  const native = canShareFiles(d);
  $('shgot').textContent = native ? 'Partager' : 'Télécharger';
  $('shcopy').hidden = !(window.ClipboardItem && navigator.clipboard?.write);
  $('shmsg').textContent = native ? 'Envoyez-la directement à vos amis (WhatsApp, Messages…).' : 'Téléchargez l’image, puis envoyez-la à vos amis.';
  $('shs').classList.add('on');
}
$('shareOne').onclick = () => { const s = S.find(q => q.id === editing); if (s) { closeForm(); share('one', s); } };
$('shareAll').onclick = () => share('all');
$('shclose').onclick = () => $('shs').classList.remove('on');
$('shgo').onclick = async () => {
  const r = await shareImage(shot.blob, shot.name);
  $('shmsg').textContent = r === 'shared' ? 'Partagé.' : r === 'cancelled' ? 'Partage annulé.' : 'Image téléchargée.';
};
$('shcopy').onclick = async () => {
  try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': shot.blob })]); $('shmsg').textContent = 'Image copiée : collez-la dans votre messagerie.'; }
  catch (e) { $('shmsg').textContent = 'Copie refusée par ce navigateur : utilisez Partager.'; }
};

/* ---------- Paramètres du joueur ---------- */
const GEAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
function avatar(el) {
  el.replaceChildren();
  if (P.photo) { const i = new Image(); i.src = P.photo; i.alt = ''; el.append(i); }
  else if (initials(P.name)) el.textContent = initials(P.name);
  else el.innerHTML = GEAR;
}
function renderProfile() {
  applyTheme(P);
  avatar($('avimg')); avatar($('pfav'));
  $('pname').textContent = P.name || '';
  $('pname').hidden = !P.name;
  $('pfnophoto').hidden = $('pfcrop').hidden = !P.photo;
  $('pffav').innerHTML = handBtnHTML((P.fav || []).filter(isCard), 'Choisir 2 cartes');
  $('pfthemes').innerHTML = Object.entries(THEMES).map(([k, t]) =>
    `<button role="radio" data-k="${k}" aria-checked="${(P.theme || 'vert') === k}" style="--a:${t.accent}"><i style="background:linear-gradient(135deg,${t.felt2},${t.felt})"></i>${esc(t.name)}</button>`).join('');
  draw();
}
const saveProfile = () => { db.setProfile(P).catch(() => toast('Paramètres non enregistrés sur cet appareil.')); renderProfile(); };
$('prof').onclick = () => { $('pfname').value = P.name || ''; $('pfver').textContent = 'Version ' + APP_VERSION; $('pfs').classList.add('on'); };
$('pfclose').onclick = () => $('pfs').classList.remove('on');
$('pfs').addEventListener('click', e => { if (e.target.id === 'pfs') $('pfs').classList.remove('on'); });
$('pfname').onchange = () => { P = { ...P, name: $('pfname').value.trim() }; saveProfile(); };
$('pfname').oninput = () => { $('pname').textContent = $('pfname').value.trim(); $('pname').hidden = !$('pfname').value.trim(); };
$('pfphoto').onchange = async () => {
  const f = $('pfphoto').files[0]; if (!f) return;
  try { const src = await sourceFromFile(f); await openCrop(src, null); } catch (e) { toast('Cette image n’a pas pu être lue.'); }
  $('pfphoto').value = '';
};
$('pfnophoto').onclick = () => { const { photo, photoSrc, crop, ...rest } = P; P = rest; saveProfile(); };

/* Recadrage : glisser pour déplacer, curseur / pincement / molette pour zoomer */
let CR = null; // { img, src, c }
const cv = $('crcv');
function crDraw() {
  if (!CR) return;
  const N = Math.round(cv.clientWidth * (devicePixelRatio || 1)) || 600;
  if (cv.width !== N) { cv.width = cv.height = N; }
  const ctx = cv.getContext('2d'); ctx.clearRect(0, 0, N, N); drawCrop(ctx, CR.img, CR.c, N);
  $('crz').value = CR.c.zoom;
}
async function openCrop(src, crop) {
  const img = await loadImage(src); if (!img) throw new Error('image');
  CR = { img, src, c: clampCrop(img, crop || defaultCrop(img)) };
  $('crs').classList.add('on'); requestAnimationFrame(crDraw);
}
$('pfcrop').onclick = () => openCrop(P.photoSrc || P.photo, P.photoSrc ? P.crop : null).catch(() => toast('Cette image n’a pas pu être lue.'));
$('crz').oninput = () => { if (CR) { CR.c = clampCrop(CR.img, { ...CR.c, zoom: +$('crz').value }); crDraw(); } };
$('crx').onclick = () => { CR = null; $('crs').classList.remove('on'); };
$('crok').onclick = () => {
  if (!CR) return;
  P = { ...P, photoSrc: CR.src, crop: CR.c, photo: cropToPhoto(CR.img, CR.c) };
  CR = null; $('crs').classList.remove('on'); saveProfile();
};
const pts = new Map(); let pinch = null;
const per = () => Math.min(CR.img.naturalWidth, CR.img.naturalHeight) / CR.c.zoom / $('crbox').clientWidth; // pixels source par pixel écran
$('crbox').addEventListener('pointerdown', e => { if (!CR) return; $('crbox').setPointerCapture(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), z: CR.c.zoom }; } });
$('crbox').addEventListener('pointermove', e => {
  if (!CR || !pts.has(e.pointerId)) return;
  const prev = pts.get(e.pointerId); pts.set(e.pointerId, [e.clientX, e.clientY]);
  if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; CR.c = clampCrop(CR.img, { ...CR.c, zoom: pinch.z * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch.d }); }
  else if (pts.size === 1) { const k = per(); CR.c = clampCrop(CR.img, { ...CR.c, cx: CR.c.cx - (e.clientX - prev[0]) * k, cy: CR.c.cy - (e.clientY - prev[1]) * k }); }
  crDraw();
});
const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; };
$('crbox').addEventListener('pointerup', up); $('crbox').addEventListener('pointercancel', up);
$('crbox').addEventListener('wheel', e => { if (!CR) return; e.preventDefault(); CR.c = clampCrop(CR.img, { ...CR.c, zoom: CR.c.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08) }); crDraw(); }, { passive: false });
$('pfthemes').onclick = e => { const b = e.target.closest('[data-k]'); if (b) { P = { ...P, theme: b.dataset.k }; saveProfile(); } };

/* ---------- Session en direct ---------- */
let tick = null;
const saveLive = () => (LIVE ? db.setLive(LIVE) : db.clearLive()).catch(() => toast('Session en cours non enregistrée sur cet appareil.'));
function renderLive() {
  $('lv').hidden = !LIVE;
  clearInterval(tick); tick = null;
  if (!LIVE) return;
  const t = liveTotals(LIVE);
  $('lv-where').textContent = [LIVE.type === 'tournoi' ? 'Tournoi' : 'Cash game', LIVE.lieu, LIVE.jeu].filter(Boolean).join(' · ');
  $('lv-in').textContent = eur(t.buyin);
  $('lv-n').textContent = String(t.recaves);
  $('lv-undo').hidden = !t.recaves;
  $('lv-tsec').hidden = LIVE.type !== 'tournoi';
  const upd = () => { $('lv-time').textContent = clock(liveTotals(LIVE).ms); liveResult(); };
  upd(); tick = setInterval(upd, 15000);
}
function liveResult() {
  const el = $('lv-res'), v = $('lv-out').value;
  if (!LIVE || v === '') { el.textContent = ''; return; }
  const t = liveTotals(LIVE), p = +v - t.buyin, h = t.hours;
  el.textContent = eur(p, true) + (h >= 0.05 ? ' · ' + eur(p / h, true) + '/h' : '');
  el.style.color = p >= 0 ? '#e6c36a' : '#ffb3b6';
}
const lvShow = which => { $('lv-main').hidden = which !== 'main'; $('lv-fr').hidden = which !== 'rebuy'; $('lv-fe').hidden = which !== 'end'; };
$('golive').onclick = () => {
  const amt = +$('f-buyin').value;
  if (!(amt > 0)) { $('f-buyin').focus(); $('f-buyin').reportValidity?.(); toast('Indiquez le buy-in de départ.'); return; }
  const now = Date.now();
  LIVE = { id: uid(), type: ftype, lieu: $('f-lieu').value.trim(), jeu: $('f-jeu').value.trim(), notes: $('f-notes').value.trim(), start: now, buyins: [{ amount: amt, at: now }] };
  saveLive(); closeForm(); lvShow('main'); renderLive(); scrollTo({ top: 0 });
  toast('Session démarrée. Bonne partie !');
};
$('lv-rebuy').onclick = () => { const last = LIVE.buyins[LIVE.buyins.length - 1]; $('lv-amt').value = last ? last.amount : ''; lvShow('rebuy'); };
$('lv-frx').onclick = () => lvShow('main');
$('lv-fr').onsubmit = e => {
  e.preventDefault(); const a = +$('lv-amt').value; if (!(a > 0)) return;
  LIVE.buyins.push({ amount: a, at: Date.now() }); saveLive(); lvShow('main'); renderLive();
  toast('Recave de ' + eur(a) + ' ajoutée.');
};
$('lv-undo').onclick = () => { if (LIVE.buyins.length > 1) { const r = LIVE.buyins.pop(); saveLive(); renderLive(); toast('Recave de ' + eur(r.amount) + ' retirée.'); } };
$('lv-end').onclick = () => { $('lv-out').value = ''; $('lv-place').value = ''; $('lv-joueurs').value = ''; lvShow('end'); liveResult(); };
$('lv-out').oninput = liveResult;
$('lv-fex').onclick = () => lvShow('main');
$('lv-fe').onsubmit = e => {
  e.preventDefault();
  const num = id => ($(id).value === '' ? null : +$(id).value);
  const s = finishLive(LIVE, +$('lv-out').value || 0, Date.now(), { place: num('lv-place'), joueurs: num('lv-joueurs') });
  S = S.concat(s); persistOne(s); LIVE = null; saveLive(); lvShow('main'); renderLive();
  showTab('tab-sessions'); if (filter !== 'all' && filter !== s.type) document.querySelector('#flt [data-f=all]').click(); else render();
  toast('Session enregistrée : ' + eur(profitOf(s), true) + '.');
};
let dropArmed = false;
$('lv-drop').onclick = () => {
  if (!dropArmed) { dropArmed = true; $('lv-drop').textContent = 'Confirmer l’abandon'; setTimeout(() => { dropArmed = false; $('lv-drop').textContent = 'Abandonner la session'; }, 4000); return; }
  dropArmed = false; $('lv-drop').textContent = 'Abandonner la session';
  LIVE = null; saveLive(); lvShow('main'); renderLive(); toast('Session en cours abandonnée.');
};
document.addEventListener('visibilitychange', () => { if (!document.hidden && LIVE) renderLive(); });

/* ---------- Meilleure main ---------- */
let formHand = [], pickHand = [], pickSuit = 's', pickMax = 5, onPicked = null;
const handBtnHTML = (H, empty) => H.length ? `<span class="cards">${H.map(c => cardHTML(c)).join('')}</span>${handName(H) ? `<span>${esc(handName(H))}</span>` : ''}` : `<span>${empty}</span>`;
function renderHandBtn() {
  $('f-hand').innerHTML = handBtnHTML(formHand, 'Choisir les cartes');
}
function renderPicker() {
  $('hdslots').style.gridTemplateColumns = `repeat(${pickMax},minmax(0,1fr))`;
  $('hdslots').style.maxWidth = pickMax * 66 + 'px';
  $('hdslots').innerHTML = [...Array(pickMax).keys()].map(i => pickHand[i]
    ? cardHTML(pickHand[i]).replace('<span class="pc', `<span role="button" tabindex="0" data-i="${i}" class="pc`)
    : '<span class="empty-slot" aria-hidden="true"></span>').join('');
  $('hdname').textContent = handName(pickHand);
  $('hdsuits').innerHTML = SUITS.map(s => `<button role="radio" data-s="${s.k}" class="${s.red ? 'red' : ''}" aria-checked="${s.k === pickSuit}" aria-label="${s.name}">${s.sym}</button>`).join('');
  const full = pickHand.length >= pickMax, red = suitOf('A' + pickSuit).red;
  $('hdranks').innerHTML = RANKS.map(r => `<button data-r="${r}" class="${red ? 'red' : ''}" ${full || pickHand.includes(r + pickSuit) ? 'disabled' : ''}>${rankLabel(r)}</button>`).join('');
}
function openPicker(title, cards, max, done) {
  $('hdt').textContent = title; pickMax = max; pickHand = cards.slice(0, max); onPicked = done;
  $('hdhelp').textContent = `Choisissez la couleur, puis touchez les valeurs. ${max} cartes au plus ; touchez une carte en haut pour la retirer.`;
  renderPicker(); $('hds').classList.add('on');
}
$('f-hand').onclick = () => openPicker('Meilleure main', formHand, 5, H => { formHand = H; renderHandBtn(); });
$('pffav').onclick = () => openPicker('Main de départ préférée', P.fav || [], 2, H => { P = { ...P, fav: H }; saveProfile(); });
$('hdsuits').onclick = e => { const b = e.target.closest('[data-s]'); if (b) { pickSuit = b.dataset.s; renderPicker(); } };
$('hdranks').onclick = e => { const b = e.target.closest('[data-r]'); if (b && !b.disabled && pickHand.length < pickMax) { pickHand.push(b.dataset.r + pickSuit); renderPicker(); } };
const unpick = e => { const c = e.target.closest('[data-i]'); if (c) { pickHand.splice(+c.dataset.i, 1); renderPicker(); } };
$('hdslots').onclick = unpick;
$('hdslots').onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); unpick(e); } };
$('hdclear').onclick = () => { pickHand = []; renderPicker(); };
$('hdx').onclick = () => $('hds').classList.remove('on');
$('hdok').onclick = () => { onPicked?.(pickHand.slice()); $('hds').classList.remove('on'); };

/* ---------- Fenêtres : glisser vers le bas pour fermer ---------- */
function closeSheet(id) {
  if (id === 'sh') return closeForm();
  if (id === 'crs') CR = null;
  $(id).classList.remove('on');
}
document.querySelectorAll('.sheet').forEach(sh => {
  const panel = sh.querySelector('.panel');
  panel.insertAdjacentHTML('afterbegin', '<div class="grab" aria-hidden="true"></div>');
  let y0 = null, dy = 0, t0 = 0;
  panel.addEventListener('touchstart', e => {
    const t = e.target;
    // Pas de glissement depuis un champ, le curseur de zoom ou la zone de recadrage, ni si le contenu est défilé
    if (e.touches.length !== 1 || panel.scrollTop > 0 || t.closest('input,textarea,select,.crop,.pick')) { y0 = null; return; }
    y0 = e.touches[0].clientY; dy = 0; t0 = Date.now(); panel.style.transition = 'none';
  }, { passive: true });
  panel.addEventListener('touchmove', e => {
    if (y0 == null) return;
    dy = Math.max(0, e.touches[0].clientY - y0);
    if (dy > 0) { panel.style.transform = `translateY(${dy}px)`; sh.style.background = `rgba(0,0,0,${0.45 * Math.max(0, 1 - dy / 400)})`; }
  }, { passive: true });
  const end = () => {
    if (y0 == null) return;
    const fast = dy > 40 && dy / Math.max(1, Date.now() - t0) > 0.6;
    panel.style.transition = 'transform .2s ease'; y0 = null;
    if (dy > 120 || fast) {
      panel.style.transform = 'translateY(100%)';
      setTimeout(() => { closeSheet(sh.id); panel.style.transition = panel.style.transform = sh.style.background = ''; }, 180);
    } else { panel.style.transform = ''; sh.style.background = ''; }
  };
  panel.addEventListener('touchend', end); panel.addEventListener('touchcancel', end);
});

/* ---------- Android : bouton Retour et défilement ---------- */
// Chaque fenêtre ouverte ajoute une étape d'historique : le bouton Retour la ferme au lieu de quitter l'appli.
// Une seule étape d'historique tant qu'au moins une fenêtre est ouverte.
let fromPop = false, backTimer = null;
const anyOpen = () => !!document.querySelector('.sheet.on');
const sheetObs = new MutationObserver(() => {
  const open = anyOpen();
  // Bloque le défilement et le « tirer pour actualiser » de la page derrière une fenêtre
  document.documentElement.classList.toggle('modal', open);
  if (open) {
    clearTimeout(backTimer); backTimer = null;
    if (!history.state?.modal) history.pushState({ modal: 1 }, '');
  } else if (!fromPop && history.state?.modal && !backTimer) {
    // Léger délai : si une autre fenêtre s'ouvre juste après (ex. partage), on garde l'étape
    backTimer = setTimeout(() => { backTimer = null; if (!anyOpen() && history.state?.modal) history.back(); }, 400);
  }
});
document.querySelectorAll('.sheet').forEach(sh => sheetObs.observe(sh, { attributes: true, attributeFilter: ['class'] }));
addEventListener('popstate', () => {
  const top = [...document.querySelectorAll('.sheet.on')].pop();
  if (!top) return;
  fromPop = true; closeSheet(top.id);
  setTimeout(() => { fromPop = false; if (anyOpen()) history.pushState({ modal: 1 }, ''); });
});

/* ---------- Installation ---------- */
let deferred = null;
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('instbtn').hidden = false; $('inst').classList.add('on'); });
$('instbtn').onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('inst').classList.remove('on'); };
if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
  $('instmsg').textContent = 'Pour l’installer : touchez Partager, puis « Sur l’écran d’accueil ».';
  $('instbtn').hidden = true; $('inst').classList.add('on');
}
if ('serviceWorker' in navigator) {
  // Quand une nouvelle version prend la main, on recharge une fois pour l'afficher tout de suite
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !reloaded && !LIVE_EDITING()) { reloaded = true; location.reload(); } });
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').then(r => r.update()).catch(() => {}));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) navigator.serviceWorker.getRegistration().then(r => r?.update()).catch(() => {}); });
}
// Ne pas recharger pendant une saisie
function LIVE_EDITING() { return [...document.querySelectorAll('.sheet.on')].length > 0 || !$('lv-fr').hidden || !$('lv-fe').hidden; }

/* ---------- Démarrage ---------- */
$('ver').textContent = 'Version ' + APP_VERSION;
renderProfile();
render();
db.getLive().then(l => { LIVE = l || null; renderLive(); }).catch(() => {});
db.getProfile().then(p => { P = p; if ($('pfs').classList.contains('on')) $('pfname').value = P.name || ''; renderProfile(); }).catch(() => {});
db.all().then(rows => {
  // Ancienne version : retire toute session d'exemple qui aurait été enregistrée, sans toucher aux vraies
  const demo = rows.filter(s => s.demo || /^demo\d+$/.test(s.id));
  S = rows.filter(s => !demo.includes(s));
  if (demo.length) demo.forEach(s => db.remove(s.id).catch(fail));
  render();
}).catch(fail);
