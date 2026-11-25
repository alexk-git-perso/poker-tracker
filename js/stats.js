// Calculs purs sur une liste de sessions : { type, date, lieu, jeu, buyin, cashout, duree, place, joueurs }
export const profitOf = s => s.cashout - s.buyin;

export const sortByDate = L => L.slice().sort((a, b) => a.date.localeCompare(b.date));

export function summary(L) {
  const n = L.length;
  const ps = L.map(profitOf);
  const profit = ps.reduce((a, p) => a + p, 0);
  const timed = L.filter(s => s.duree > 0);
  const h = timed.reduce((a, s) => a + +s.duree, 0);
  const hp = timed.reduce((a, s) => a + profitOf(s), 0);
  const wins = ps.filter(p => p > 0).length;
  const T = L.filter(s => s.type === 'tournoi');
  const tb = T.reduce((a, s) => a + s.buyin, 0);
  const tp = T.reduce((a, s) => a + profitOf(s), 0);
  return {
    n, profit, h,
    hourly: h ? hp / h : null,
    win: n ? wins / n : null,
    roi: tb ? tp / tb : null,
    itm: T.length ? T.filter(s => s.cashout > 0).length / T.length : null,
    best: n ? Math.max(...ps) : 0,
    worst: n ? Math.min(...ps) : 0,
    nT: T.length,
  };
}

// Regroupe par clé (lieu, jeu…) : bénéfice, sessions, heures, bénéfice horaire. Trié du plus rentable au moins rentable.
export function byGroup(L, key, empty = 'Non renseigné') {
  const m = new Map();
  for (const s of L) {
    const k = (s[key] || '').trim() || empty;
    const g = m.get(k) || { name: k, n: 0, profit: 0, h: 0, hp: 0 };
    g.n++; g.profit += profitOf(s);
    if (s.duree > 0) { g.h += +s.duree; g.hp += profitOf(s); }
    m.set(k, g);
  }
  return [...m.values()].map(g => ({ name: g.name, n: g.n, profit: g.profit, h: g.h, hourly: g.h ? g.hp / g.h : null }))
    .sort((a, b) => b.profit - a.profit);
}

// Bénéfice par mois, du plus ancien au plus récent, mois vides compris.
export function byMonth(L) {
  if (!L.length) return [];
  const S = sortByDate(L), m = new Map();
  for (const s of S) {
    const k = s.date.slice(0, 7);
    const g = m.get(k) || { month: k, n: 0, profit: 0 };
    g.n++; g.profit += profitOf(s); m.set(k, g);
  }
  const out = [];
  let [y, mo] = S[0].date.slice(0, 7).split('-').map(Number);
  const last = S[S.length - 1].date.slice(0, 7);
  for (;;) {
    const k = `${y}-${String(mo).padStart(2, '0')}`;
    out.push(m.get(k) || { month: k, n: 0, profit: 0 });
    if (k === last) break;
    if (++mo > 12) { mo = 1; y++; }
  }
  return out;
}

// Variance : écart-type par session, pire downswing (plus forte baisse depuis un sommet du cumul), plus longue série de sessions perdantes.
export function variance(L) {
  const ps = sortByDate(L).map(profitOf), n = ps.length;
  if (!n) return { sd: null, downswing: 0, ddFrom: null, ddTo: null, streak: 0 };
  const mean = ps.reduce((a, p) => a + p, 0) / n;
  const sd = n > 1 ? Math.sqrt(ps.reduce((a, p) => a + (p - mean) ** 2, 0) / (n - 1)) : null;
  let cum = 0, peak = 0, peakI = -1, dd = 0, ddFrom = null, ddTo = null, run = 0, streak = 0;
  ps.forEach((p, i) => {
    cum += p;
    if (cum > peak) { peak = cum; peakI = i; }
    if (peak - cum > dd) { dd = peak - cum; ddFrom = peakI + 1; ddTo = i; }
    run = p < 0 ? run + 1 : 0;
    streak = Math.max(streak, run);
  });
  return { sd, downswing: dd, ddFrom, ddTo, streak };
}

// Points de la courbe cumulée : [{ d, v }], en partant de 0.
export function cumulative(L) {
  const S = sortByDate(L);
  if (!S.length) return [];
  let c = 0;
  return [{ d: S[0].date, v: 0 }].concat(S.map(s => ({ d: s.date, v: (c += profitOf(s)) })));
}
