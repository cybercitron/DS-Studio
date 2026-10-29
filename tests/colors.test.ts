import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  baseColorGroups,
  isPrimitive,
  primitivePalettes,
  semanticColors,
  semanticGroupOf,
} from '../app/shared/colors.js';
import {
  baseTokenKeys,
  baseTokenTypes,
  tokensSchema,
  type Tokens,
} from '../app/shared/model.js';

const seed = tokensSchema.parse(
  JSON.parse(
    readFileSync(
      new URL('../workspace/design-system.tokens.json', import.meta.url),
      'utf8',
    ),
  ),
) as Tokens;
const c = (hex: string) => ({ $type: 'color' as const, $value: hex });

test('tri par le nom : un numéro final fait une primitive', () => {
  assert.ok(isPrimitive('color.rouge.500'));
  assert.ok(isPrimitive('color.rougePrimaire.050'));
  assert.ok(!isPrimitive('color.brand'));
  assert.ok(!isPrimitive('color.texte.titre'));
  assert.ok(!isPrimitive('color.rouge500'));
});

test('primitives : une rangée par palette, nuances dans l’ordre des numéros', () => {
  const tokens: Tokens = {
    ...seed,
    'color.rouge.900': c('#460010'),
    'color.rouge.050': c('#FFF8F7'),
    'color.rouge.500': c('#E2001A'),
    'color.bleu.100': c('#DDEEFF'),
    'space.4': { $type: 'dimension', $value: 4 },
  };
  assert.deepEqual(primitivePalettes(tokens), [
    { name: 'color.bleu', keys: ['color.bleu.100'] },
    {
      name: 'color.rouge',
      keys: ['color.rouge.050', 'color.rouge.500', 'color.rouge.900'],
    },
  ]);
  assert.deepEqual(primitivePalettes(seed), []);
});

test('sémantiques : chaque couleur de base a son groupe, aucun « Autres »', () => {
  const baseColors = baseTokenKeys.filter((k) => baseTokenTypes[k] === 'color');
  assert.deepEqual(Object.keys(baseColorGroups).sort(), [...baseColors].sort());
  const groups = semanticColors(seed);
  assert.deepEqual(
    groups.map((g) => g.label),
    ['Marque', 'Texte', 'Fonds', 'Bordures', 'États'],
  );
  assert.equal(
    groups.reduce((n, g) => n + g.keys.length, 0),
    baseColors.length,
  );
});

test('sémantiques : color.groupe.nom va dans son groupe, sinon Autres', () => {
  assert.equal(semanticGroupOf('color.texte.titre'), 'texte');
  assert.equal(semanticGroupOf('color.fond.carte'), 'fonds');
  assert.equal(semanticGroupOf('color.Bordure.forte'), 'bordures');
  assert.equal(semanticGroupOf('color.etat.alerte'), 'etats');
  assert.equal(semanticGroupOf('color.texte'), 'autres');
  assert.equal(semanticGroupOf('color.accent'), 'autres');
  const groups = semanticColors({
    ...seed,
    'color.accent': c('#123456'),
    'color.rouge.500': c('#E2001A'),
  });
  assert.deepEqual(groups.at(-1), {
    id: 'autres',
    label: 'Autres',
    keys: ['color.accent'],
  });
});
