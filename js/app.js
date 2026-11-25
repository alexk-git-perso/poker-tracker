import * as db from './db.js';
import { summary, byGroup, byMonth, variance, cumulative, sortByDate, profitOf } from './stats.js';
import { esc, eur, fmtD, fmtM, today, uid } from './format.js';
import { card, shareImage, canShareFiles, download } from './share.js';
import { DEMO } from './demo.js';

const $ = id => document.getElementById(id);
let S = [], filter = 'all', editing = null, ftype = 'cash', lastDel = null, tt, shot = null, stored = true;
const data = () => (S.length ? S : DEMO);
const view = () => sortByDate(data().filter(s => filter === 'all' || s.type === filter));
const label = () => (filter === 'cash' ? 'Bilan cash game' : filter === 'tournoi' ? 'Bilan tournois' : 'Mon bilan poker');
const cls = v => (v == null ? '' : v >= 0 ? 'pos' : 'neg');

/* ---------- Rendu ---------- */
function render() {
  const L = view(), k = summary(L), all = data();
  $('demo').hidden = !!S.length;
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
    const meta = fmtD(s.date) + (s.duree ? ' · ' + String(s.duree).replace('.', ',') + ' h' : '') + (t && s.place ? ' · ' + s.place + 'e' + (s.joueurs ? '/' + s.joueurs : '') : '');
    return `<button class="row" data-id="${esc(s.id)}"><span class="chipi ${t ? 't' : ''}">${t ? 'MTT' : 'CG'}</span><span><span class="d">${esc(s.lieu || 'Session')}</span> <span class="m">· ${esc(s.jeu || (t ? 'Tournoi' : 'Cash game'))}</span><br><span class="m">${esc(meta)}</span></span><span class="p ${cls(p)}">${eur(p, true)}<small>${eur(s.buyin)} → ${eur(s.cashout)}</small></span></button>`;
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
  <circle cx="${lx}" cy="${ly}" r="6" fill="#e6c36a" stroke="#0d4a33" stroke-width="3"/><text x="${lx + 10}" y="${ly + 5}" style="font:700 15px Rubik,sans-serif;fill:#f3efe4">${esc(eur(last.v, true))}</text>
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
  const last = sortByDate(S).pop();
  const v = s || { date: today(), lieu: last?.lieu || '', jeu: last?.jeu || '', type: last?.type || 'cash' };
  F.forEach(f => $('f-' + f).value = v[f] ?? '');
  setType(v.type || 'cash');
  $('sh').classList.add('on');
  setTimeout(() => $(editing ? 'f-cashout' : 'f-buyin').focus(), 50);
}
const closeForm = () => { $('sh').classList.remove('on'); $('add').focus(); };
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
  if (ftype !== 'tournoi') { o.place = null; o.joueurs = null; }
  S = editing ? S.map(s => (s.id === editing ? o : s)) : S.concat(o);
  persistOne(o); closeForm(); render();
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
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if ($('sh').classList.contains('on')) closeForm(); $('bks').classList.remove('on'); $('shs').classList.remove('on'); } });

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
  duree: s.duree == null ? null : +s.duree, place: s.place == null ? null : +s.place, joueurs: s.joueurs == null ? null : +s.joueurs, notes: String(s.notes || ''),
});
$('bkimp').onclick = () => {
  try {
    const a = JSON.parse($('bktxt').value); if (!Array.isArray(a)) throw 0;
    S = a.filter(s => s && /^\d{4}-\d{2}-\d{2}/.test(s.date) && isFinite(s.buyin) && isFinite(s.cashout)).map(clean);
    persistAll(); render(); $('bkmsg').textContent = S.length + ' sessions importées.';
  } catch (e) { $('bkmsg').textContent = 'Ce texte n’est pas une sauvegarde valide.'; }
};

/* ---------- Partage en image ---------- */
async function share(kind, s) {
  const b = await card(kind, kind === 'one' ? s : { list: view(), label: label() });
  if (!b) { toast('Image impossible à créer sur cet appareil.'); return; }
  shot = { blob: b, name: kind === 'one' ? 'poker-' + s.date + '.png' : 'poker-bilan-' + today() + '.png' };
  const im = $('shimg'); if (im.src) URL.revokeObjectURL(im.src); im.src = URL.createObjectURL(b);
  const native = canShareFiles(b);
  $('shgo').textContent = native ? 'Partager' : 'Télécharger';
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

/* ---------- Installation ---------- */
let deferred = null;
const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; $('instbtn').hidden = false; $('inst').classList.add('on'); });
$('instbtn').onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice; deferred = null; $('inst').classList.remove('on'); };
if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
  $('instmsg').textContent = 'Pour l’installer : touchez Partager, puis « Sur l’écran d’accueil ».';
  $('instbtn').hidden = true; $('inst').classList.add('on');
}
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

/* ---------- Démarrage ---------- */
render();
db.all().then(rows => { S = rows; render(); }).catch(fail);
