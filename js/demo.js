// Sessions fictives affichées tant que l'utilisateur n'a rien saisi.
const base = [
  ['cash', 'Casino', 'NL 1/2', 200, 340, 4], ['cash', 'Home game', 'NL 1/2', 200, 95, 3.5],
  ['tournoi', 'Casino', 'Deepstack 100 €', 100, 0, 3], ['cash', 'En ligne', 'NL10', 100, 162, 2],
  ['cash', 'Casino', 'NL 1/2', 300, 510, 5], ['tournoi', 'En ligne', 'Sunday 20 €', 20, 185, 4.5],
  ['cash', 'Home game', 'NL 2/4', 400, 220, 4], ['cash', 'En ligne', 'NL10', 100, 131, 1.5],
  ['tournoi', 'Home game', 'Freeze 50 €', 60, 0, 2.5], ['cash', 'Casino', 'NL 1/2', 200, 415, 6],
  ['cash', 'En ligne', 'NL25', 150, 98, 2], ['cash', 'Casino', 'NL 2/4', 400, 690, 5],
];
const t0 = new Date(); t0.setDate(t0.getDate() - base.length * 6);
export const DEMO = base.map((b, i) => {
  const d = new Date(t0); d.setDate(d.getDate() + i * 6);
  const t = b[0] === 'tournoi';
  return { id: 'demo' + i, type: b[0], date: d.toISOString().slice(0, 10), lieu: b[1], jeu: b[2], buyin: b[3], cashout: b[4], duree: b[5], notes: '',
    place: t ? (b[4] ? 3 : 41) : null, joueurs: t ? (b[1] === 'En ligne' ? 212 : 88) : null, demo: true };
});
