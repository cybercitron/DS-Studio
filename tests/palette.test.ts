import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  applyChanges,
  contrast,
  tokenNamePattern,
  tokensSchema,
  type Tokens,
} from '../app/shared/model.js';
import {
  defaultRules,
  generatePalette,
  hueFamily,
  paletteAdditions,
  paletteSlug,
  paletteTokens,
  shadeNames,
  validatePalette,
} from '../app/shared/palette.js';

// Du plus clair au plus foncé : chaque nuance contraste davantage avec le blanc.
function assertOrdered(hexes: string[]) {
  const ratios = hexes.map((h) => contrast(h, '#FFFFFF'));
  for (let i = 1; i < ratios.length; i++)
    assert.ok(
      ratios[i] >= ratios[i - 1],
      `ordre clair → foncé rompu entre ${hexes[i - 1]} et ${hexes[i]}`,
    );
}

test('numérotation : 050 → 900 pour 10 nuances, sinon de 100 en 100', () => {
  assert.deepEqual(shadeNames(10), [
    '050',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
  ]);
  assert.deepEqual(shadeNames(3), ['100', '200', '300']);
  assert.equal(shadeNames(12).at(-1), '1200');
});

test('la couleur de départ reste intacte au 500, quelle que soit la couleur', () => {
  for (const base of ['#FFFF0A', '#5D47FF', '#E2001A', '#18734B', '#19243D']) {
    const p = generatePalette({ base, count: 10 });
    const s500 = p.shades.find((s) => s.name === '500')!;
    assert.equal(s500.hex, base);
    assert.equal(s500.fixed, 'base');
    assertOrdered(p.shades.map((s) => s.hex));
  }
});

test('nombre de nuances réglable de 3 à 12, ordre respecté', () => {
  for (let count = 3; count <= 12; count++) {
    const p = generatePalette({ base: '#5D47FF', count });
    assert.equal(p.shades.length, count);
    assert.equal(p.shades.filter((s) => s.fixed === 'base').length, 1);
    assertOrdered(p.shades.map((s) => s.hex));
  }
});

test('règles par défaut atteintes sur une couleur moyenne', () => {
  const p = generatePalette({ base: '#5D47FF', count: 10 });
  assert.ok(p.rules.length >= 4);
  for (const r of p.rules)
    assert.ok(r.ok, `${r.shade}/${r.against} : ${r.ratio}`);
});

test('jaune vif : règle impossible signalée, couleur intacte, texte lisible', () => {
  const p = generatePalette({ base: '#FFFF0A', count: 10 });
  const solid = p.rules.find((r) => r.shade === '500')!;
  assert.equal(solid.ok, false);
  assert.ok(solid.best < 3);
  assert.ok(solid.ratio <= solid.best);
  for (const r of p.rules.filter((r) => r.shade !== '500' && r.shade !== '400'))
    assert.ok(r.ok, `${r.shade}/${r.against} : ${r.ratio}`);
});

test('règle choisie par l’utilisatrice : le moteur ajuste les nuances libres', () => {
  const rules = [
    { shade: '300', against: '050', min: 4.5 },
    { shade: '700', against: '100', min: 7 },
  ];
  const p = generatePalette({ base: '#E2001A', count: 10, rules });
  const hex = Object.fromEntries(p.shades.map((s) => [s.name, s.hex]));
  assert.ok(contrast(hex['300'], hex['050']) >= 4.5);
  assert.ok(contrast(hex['700'], hex['100']) >= 7);
  assert.ok(p.rules.every((r) => r.ok));
  assert.equal(hex['500'], '#E2001A');
  assertOrdered(p.shades.map((s) => s.hex));
});

test('une nuance retouchée est gardée et l’alerte suit la retouche', () => {
  const p = generatePalette({
    base: '#5D47FF',
    count: 10,
    rules: [{ shade: '700', against: '050', min: 4.5 }],
    overrides: { '700': '#B0A8FF' },
  });
  const s700 = p.shades.find((s) => s.name === '700')!;
  assert.equal(s700.hex, '#B0A8FF');
  assert.equal(s700.fixed, 'override');
  assert.equal(p.rules[0].ok, false);
});

test('les règles par défaut s’adaptent au nombre de nuances', () => {
  for (let count = 3; count <= 12; count++) {
    const names = shadeNames(count);
    for (const r of defaultRules(count)) {
      assert.ok(names.includes(r.shade) && names.includes(r.against));
      assert.notEqual(r.shade, r.against);
    }
  }
});

test('entrées invalides refusées avec un message clair', () => {
  assert.ok(validatePalette({ base: 'violet', count: 10 }).length);
  assert.ok(validatePalette({ base: '#5D47FF', count: 2 }).length);
  assert.ok(validatePalette({ base: '#5D47FF', count: 13 }).length);
  assert.ok(
    validatePalette({
      base: '#5D47FF',
      count: 10,
      rules: [{ shade: '950', against: '050', min: 3 }],
    }).length,
  );
  assert.throws(() => generatePalette({ base: '#5D47FF', count: 2 }));
});

test('export : noms de tokens valides à partir d’un nom libre', () => {
  assert.equal(paletteSlug('Rouge primaire'), 'rougePrimaire');
  assert.equal(paletteSlug('Jaune Capc ÉTÉ'), 'jauneCapcEte');
  assert.equal(paletteSlug('2e bleu'), 'palette2eBleu');
  assert.equal(paletteSlug(''), 'palette');
  const p = generatePalette({ base: '#5D47FF', count: 10 });
  const tokens = paletteTokens('Violet', p.shades);
  assert.deepEqual(tokens['color.violet.500'], {
    $type: 'color',
    $value: '#5D47FF',
  });
  for (const key of Object.keys(tokens)) assert.match(key, tokenNamePattern);
});

test('ajout comme primitives : 050 → 900, noms valides, jamais d’écrasement', () => {
  const seed = tokensSchema.parse(
    JSON.parse(
      readFileSync(
        new URL('../workspace/design-system.tokens.json', import.meta.url),
        'utf8',
      ),
    ),
  ) as Tokens;
  const p = generatePalette({ base: '#E2001A', count: 10 });
  const add = paletteAdditions('Rouge primaire', p.shades, seed);
  assert.equal(add.problem, '');
  assert.deepEqual(
    add.changes.map((c) => c.key),
    shadeNames(10).map((n) => `color.rougePrimaire.${n}`),
  );
  // Tous finissent par un numéro : la future vue Couleurs les range en primitives.
  for (const c of add.changes) assert.match(c.key, /\.[0-9]+$/);
  const next = applyChanges(seed, add.changes);
  assert.deepEqual(next['color.rougePrimaire.500'], {
    $type: 'color',
    $value: '#E2001A',
  });

  // Palette déjà présente, même avec une autre casse ou d'autres nuances.
  const again = paletteAdditions('ROUGE  Primaire', p.shades.slice(0, 3), next);
  assert.equal(again.taken.length, 10);
  assert.match(again.problem, /existe déjà/);
  const partial = {
    ...seed,
    'color.rougeprimaire.700': next['color.rougePrimaire.700'],
  };
  assert.deepEqual(
    paletteAdditions('Rouge primaire', p.shades, partial).taken,
    ['color.rougeprimaire.700'],
  );
  // Un token voisin au nom plus long n'est pas confondu avec la palette.
  const neighbour = {
    ...seed,
    'color.rougePrimaireFonce.500': next['color.rougePrimaire.500'],
  };
  assert.equal(
    paletteAdditions('Rouge primaire', p.shades, neighbour).problem,
    '',
  );

  // Limite de 500 tokens signalée avant la proposition.
  const full = Object.fromEntries(
    Array.from({ length: 495 }, (_, i) => [
      `color.gris.${i}`,
      { $type: 'color', $value: '#808080' },
    ]),
  ) as Tokens;
  assert.match(paletteAdditions('Bleu', p.shades, full).problem, /500 tokens/);
});

// Teinte sur le cercle classique (TSL), de -180 à 180 autour de la référence.
function hslHue(hex: string, around: number) {
  const [r, g, b] = hex
    .slice(1)
    .match(/../g)!
    .map((x) => parseInt(x, 16) / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  const h =
    max === r
      ? ((g - b) / d + 6) % 6
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
  return ((h * 60 - around + 540) % 360) - 180;
}
test('décalage de teinte selon la famille de la couleur de départ', () => {
  assert.equal(hueFamily('#E2001A')?.name, 'Rouge');
  assert.equal(hueFamily('#FFFF0A')?.name, 'Jaune');
  assert.equal(hueFamily('#3154C4')?.name, 'Bleu');
  assert.equal(hueFamily('#808080'), null);
  const at = (base: string, name: string) =>
    generatePalette({ base, count: 10 }).shades.find((s) => s.name === name)!
      .hex;
  // Rouge : vers l'orange en clair, vers le pourpre en foncé.
  assert.ok(hslHue(at('#FF0000', '300'), 0) > 0);
  assert.ok(hslHue(at('#FF0000', '800'), 0) < 0);
  // Jaune : vers le vert en clair, vers l'orange en foncé.
  assert.ok(hslHue(at('#FFFF0A', '300'), 60) > 0);
  assert.ok(hslHue(at('#FFFF0A', '800'), 60) < 0);
  // Bleu : vers le bleu clair en clair, vers le violet en foncé.
  assert.ok(hslHue(at('#3154C4', '300'), 226) < 0);
  assert.ok(hslHue(at('#3154C4', '800'), 226) > 0);
  // Le réglage pilote l'ampleur : sans décalage, le 300 tire moins vers l'orange.
  const flat = generatePalette({ base: '#FF0000', count: 10, hueShift: 0 });
  assert.ok(hslHue(flat.shades[3].hex, 0) < hslHue(at('#FF0000', '300'), 0));
});
