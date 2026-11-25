import test from 'node:test';
import assert from 'node:assert/strict';
import { handName, isCard } from '../js/cards.js';

test('noms des mains', () => {
  assert.equal(handName(['As', 'Ks', 'Qs', 'Js', 'Ts']), 'Quinte flush royale');
  assert.equal(handName(['9h', '8h', '7h', '6h', '5h']), 'Quinte flush hauteur 9');
  assert.equal(handName(['Ah', 'Ad', 'Ac', 'As', '2h']), "Carré d'As");
  assert.equal(handName(['Kh', 'Kd', 'Kc', '7s', '7h']), 'Full aux Rois par les 7');
  assert.equal(handName(['Ah', '9h', '7h', '4h', '2h']), 'Couleur hauteur As');
  assert.equal(handName(['Ah', '2d', '3c', '4s', '5h']), 'Quinte hauteur 5');
  assert.equal(handName(['Th', 'Jd', 'Qc', 'Ks', 'Ah']), 'Quinte hauteur As');
  assert.equal(handName(['Qh', 'Qd', 'Qc', '4s', '2h']), 'Brelan de Dames');
  assert.equal(handName(['Jh', 'Jd', '3c', '3s', '2h']), 'Double paire Valets et 3');
  assert.equal(handName(['Ah', 'Ad']), "Paire d'As");
  assert.equal(handName(['Ah', 'Kd']), '');
  assert.equal(handName(['Ah', 'Jd', '8c', '4s', '2h']), 'Hauteur As');
});

test('validation', () => {
  assert.ok(isCard('Td'));
  assert.ok(!isCard('1d'));
  assert.ok(!isCard('Ax'));
});
