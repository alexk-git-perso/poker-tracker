// Session en direct : { id, type, lieu, jeu, start (ms), buyins: [{ amount, at }] }
const localDate = ms => { const d = new Date(ms); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };

export function liveTotals(L, now = Date.now()) {
  const ms = Math.max(0, now - L.start);
  return { ms, hours: ms / 36e5, buyin: L.buyins.reduce((a, b) => a + b.amount, 0), recaves: Math.max(0, L.buyins.length - 1) };
}

export const clock = ms => {
  const m = Math.floor(ms / 6e4);
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
};

// Transforme la session en direct en session terminée. Durée arrondie au centième d'heure.
export function finishLive(L, cashout, now = Date.now(), extra = {}) {
  const t = liveTotals(L, now);
  return {
    id: L.id, type: L.type, date: localDate(L.start), lieu: L.lieu || '', jeu: L.jeu || '',
    buyin: t.buyin, cashout, duree: Math.max(0.01, Math.round(t.hours * 100) / 100),
    recaves: t.recaves, notes: L.notes || '',
    place: L.type === 'tournoi' ? extra.place ?? null : null,
    joueurs: L.type === 'tournoi' ? extra.joueurs ?? null : null,
  };
}
