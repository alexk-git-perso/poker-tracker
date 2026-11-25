import { lang, t } from './i18n.js';
// Cartes : 'As' = As de pique. Valeurs A K Q J T 9…2, couleurs s (pique) h (cœur) d (carreau) c (trèfle).
export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
export const SUITS = [
  { k: 's', sym: '♠', name: 'Pique', red: false },
  { k: 'h', sym: '♥', name: 'Cœur', red: true },
  { k: 'd', sym: '♦', name: 'Carreau', red: true },
  { k: 'c', sym: '♣', name: 'Trèfle', red: false },
];
export const suitOf = c => SUITS.find(s => s.k === c[1]);
export const rankLabel = r => (r === 'T' ? '10' : r);
export const isCard = c => typeof c === 'string' && c.length === 2 && RANKS.includes(c[0]) && SUITS.some(s => s.k === c[1]);
const VAL = r => 14 - RANKS.indexOf(r); // A=14 … 2=2
const NAMES = { 14: 'As', 13: 'Rois', 12: 'Dames', 11: 'Valets', 10: '10', 9: '9', 8: '8', 7: '7', 6: '6', 5: '5', 4: '4', 3: '3', 2: '2' };
const ONE = { 14: 'As', 13: 'Roi', 12: 'Dame', 11: 'Valet' };
const one = v => ONE[v] || String(v);
const aux = v => (v === 14 ? 'aux As' : v >= 11 ? 'aux ' + NAMES[v] : 'aux ' + v);
const de = v => (v === 14 ? "d'As" : v >= 11 ? 'de ' + NAMES[v] : 'de ' + v);

// Nom de la main pour 2 à 5 cartes, ou '' si rien de notable.
export function handName(cards) {
  if (lang === 'en') return handNameEn(cards);
  const C = (cards || []).filter(isCard);
  if (C.length < 2) return '';
  const vals = C.map(c => VAL(c[0])).sort((a, b) => b - a);
  const cnt = new Map(); vals.forEach(v => cnt.set(v, (cnt.get(v) || 0) + 1));
  const groups = [...cnt.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  if (C.length === 5) {
    const flush = new Set(C.map(c => c[1])).size === 1;
    const uniq = [...cnt.keys()].sort((a, b) => b - a);
    let high = 0;
    if (uniq.length === 5) {
      if (uniq[0] - uniq[4] === 4) high = uniq[0];
      else if (uniq.join() === '14,5,4,3,2') high = 5; // roue A-2-3-4-5
    }
    if (high && flush) return high === 14 ? 'Quinte flush royale' : 'Quinte flush hauteur ' + one(high);
    if (groups[0][1] === 4) return 'Carré ' + de(groups[0][0]);
    if (groups[0][1] === 3 && groups[1][1] === 2) return 'Full ' + aux(groups[0][0]) + ' par les ' + NAMES[groups[1][0]];
    if (flush) return 'Couleur hauteur ' + one(vals[0]);
    if (high) return 'Quinte hauteur ' + one(high);
  }
  if (groups[0][1] === 4) return 'Carré ' + de(groups[0][0]);
  if (groups[0][1] === 3) return 'Brelan ' + de(groups[0][0]);
  if (groups[0][1] === 2 && groups[1]?.[1] === 2) return 'Double paire ' + NAMES[groups[0][0]] + ' et ' + NAMES[groups[1][0]];
  if (groups[0][1] === 2) return 'Paire ' + de(groups[0][0]);
  return C.length === 5 ? 'Hauteur ' + one(vals[0]) : '';
}

// Carte en HTML (taille via --cw)
export const cardHTML = (c, extra = '') => {
  const s = suitOf(c);
  return `<span class="pc${s.red ? ' red' : ''}${extra}" aria-label="${t('{r} de {s}', { r: rankLabel(c[0]), s: t(s.name).toLowerCase() })}"><b>${rankLabel(c[0])}</b><i>${s.sym}</i></span>`;
};

// Carte sur un canvas : coin haut-gauche (x, y), largeur w (hauteur 1,4 w)
export function drawCard(x, c, px, py, w) {
  const h = w * 1.4, r = w * 0.1, s = suitOf(c), col = s.red ? '#c8202f' : '#16201b';
  x.save();
  x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = w * 0.12; x.shadowOffsetY = w * 0.05;
  x.fillStyle = '#fdfbf6'; x.beginPath(); x.roundRect(px, py, w, h, r); x.fill();
  x.restore();
  x.fillStyle = col; x.textAlign = 'left';
  x.font = `800 ${Math.round(w * 0.34)}px Rubik, sans-serif`; x.fillText(rankLabel(c[0]), px + w * 0.1, py + w * 0.38);
  x.font = `${Math.round(w * 0.26)}px sans-serif`; x.fillText(s.sym, px + w * 0.1, py + w * 0.66);
  x.font = `${Math.round(w * 0.62)}px sans-serif`; x.textAlign = 'center'; x.fillText(s.sym, px + w * 0.58, py + h * 0.8);
}

// Noms anglais
const EN1 = { 14: 'Ace', 13: 'King', 12: 'Queen', 11: 'Jack' };
const en1 = v => EN1[v] || String(v);
const enN = v => (EN1[v] ? EN1[v] + 's' : v + 's');
function handNameEn(cards) {
  const C = (cards || []).filter(isCard);
  if (C.length < 2) return '';
  const vals = C.map(c => VAL(c[0])).sort((a, b) => b - a);
  const cnt = new Map(); vals.forEach(v => cnt.set(v, (cnt.get(v) || 0) + 1));
  const g = [...cnt.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  if (C.length === 5) {
    const flush = new Set(C.map(c => c[1])).size === 1, u = [...cnt.keys()].sort((a, b) => b - a);
    let high = 0;
    if (u.length === 5) { if (u[0] - u[4] === 4) high = u[0]; else if (u.join() === '14,5,4,3,2') high = 5; }
    if (high && flush) return high === 14 ? 'Royal flush' : 'Straight flush, ' + en1(high) + ' high';
    if (g[0][1] === 4) return 'Four ' + enN(g[0][0]);
    if (g[0][1] === 3 && g[1][1] === 2) return 'Full house, ' + enN(g[0][0]) + ' full of ' + enN(g[1][0]);
    if (flush) return 'Flush, ' + en1(vals[0]) + ' high';
    if (high) return 'Straight, ' + en1(high) + ' high';
  }
  if (g[0][1] === 4) return 'Four ' + enN(g[0][0]);
  if (g[0][1] === 3) return 'Three ' + enN(g[0][0]);
  if (g[0][1] === 2 && g[1]?.[1] === 2) return 'Two pair, ' + enN(g[0][0]) + ' and ' + enN(g[1][0]);
  if (g[0][1] === 2) return 'Pair of ' + enN(g[0][0]);
  return C.length === 5 ? en1(vals[0]) + ' high' : '';
}
