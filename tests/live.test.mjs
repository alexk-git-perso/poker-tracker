import test from 'node:test';
import assert from 'node:assert/strict';
import { liveTotals, finishLive, clock } from '../js/live.js';

const start = new Date('2026-11-25T20:30:00').getTime();
const L = { id: 'x', type: 'cash', lieu: 'Casino', jeu: 'NL 1/2', start, buyins: [{ amount: 200, at: start }, { amount: 100, at: start + 36e5 }] };

test('totaux en cours', () => {
  const t = liveTotals(L, start + 2.5 * 36e5);
  assert.equal(t.buyin, 300);
  assert.equal(t.recaves, 1);
  assert.equal(t.hours, 2.5);
});

test('clôture', () => {
  const s = finishLive(L, 420, start + 3 * 36e5 + 20 * 6e4);
  assert.equal(s.buyin, 300);
  assert.equal(s.cashout, 420);
  assert.equal(s.duree, 3.33);
  assert.equal(s.recaves, 1);
  assert.equal(s.date, '2026-11-25');
  assert.equal(s.place, null);
});

test('chrono', () => {
  assert.equal(clock(65 * 6e4), '1 h 05');
  assert.equal(clock(0), '0 h 00');
});
