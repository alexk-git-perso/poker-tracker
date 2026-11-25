import test from 'node:test';
import assert from 'node:assert/strict';
import { summary, byGroup, byMonth, variance, cumulative } from '../js/stats.js';

const S = (date, buyin, cashout, o = {}) => ({ type: 'cash', date, buyin, cashout, duree: 2, lieu: 'A', jeu: 'NL2', ...o });
const L = [
  S('2026-01-05', 100, 250),
  S('2026-01-20', 100, 40),
  S('2026-03-02', 100, 0, { type: 'tournoi', lieu: 'B' }),
  S('2026-03-10', 200, 150, { lieu: 'B', duree: null }),
  S('2026-03-15', 100, 300),
];

test('summary', () => {
  const k = summary(L);
  assert.equal(k.n, 5);
  assert.equal(k.profit, 140);
  assert.equal(k.h, 8);
  assert.equal(k.hourly, 190 / 8);
  assert.equal(k.win, 2 / 5);
  assert.equal(k.roi, -1);
  assert.equal(k.best, 200);
  assert.equal(k.worst, -100);
  assert.equal(summary([]).hourly, null);
});

test('byGroup trie par bénéfice', () => {
  const g = byGroup(L, 'lieu');
  assert.deepEqual(g.map(x => [x.name, x.n, x.profit]), [['A', 3, 290], ['B', 2, -150]]);
  assert.equal(byGroup([S('2026-01-01', 1, 2, { lieu: '' })], 'lieu')[0].name, 'Non renseigné');
});

test('byMonth comble les mois vides', () => {
  assert.deepEqual(byMonth(L).map(m => [m.month, m.profit]), [['2026-01', 90], ['2026-02', 0], ['2026-03', 50]]);
  assert.deepEqual(byMonth([S('2025-12-30', 0, 10), S('2026-01-02', 0, 5)]).map(m => m.month), ['2025-12', '2026-01']);
});

test('variance', () => {
  const v = variance(L);
  // cumul : 150, 90, -10, -60, 140 → sommet 150, creux -60 → downswing 210 sur les sessions 2 à 4
  assert.equal(v.downswing, 210);
  assert.equal(v.ddFrom, 1);
  assert.equal(v.ddTo, 3);
  assert.equal(v.streak, 3);
  assert.ok(Math.abs(v.sd - 136.64) < 0.1);
  assert.equal(variance([]).sd, null);
});

test('cumulative', () => {
  assert.deepEqual(cumulative(L).map(p => p.v), [0, 150, 90, -10, -60, 140]);
});
