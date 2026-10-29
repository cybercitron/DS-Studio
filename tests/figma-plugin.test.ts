import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import {
  FIGMA_COLLECTION,
  FIGMA_FORMAT,
  figmaName,
  figmaVariablesFile,
  primitiveColors,
} from '../app/shared/figmaVariables.js';
import type { Tokens } from '../app/shared/model.js';

const c = (hex: string) => ({ $type: 'color' as const, $value: hex });

test('export : noms en dossiers Figma, valeurs en majuscules', () => {
  assert.equal(figmaName('color.rougePrimaire.050'), 'color/rougePrimaire/050');
  const file = figmaVariablesFile({ 'color.rouge.500': '#ff0000' });
  assert.deepEqual(file, {
    format: FIGMA_FORMAT,
    version: 1,
    collection: FIGMA_COLLECTION,
    variables: [{ name: 'color/rouge/500', type: 'COLOR', value: '#FF0000' }],
  });
  const tokens: Tokens = {
    'color.rouge.500': c('#ff0000'),
    'color.brand': c('#5d47ff'),
  } as Tokens;
  assert.deepEqual(primitiveColors(tokens, ['color.rouge.500']), {
    'color.rouge.500': '#ff0000',
  });
});

// Faux Figma : juste l'API des variables utilisée par le plugin.
function fakeFigma(seed: {
  collection?: string;
  vars?: Record<string, string>;
}) {
  const rgb = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
    a: 1,
  });
  const collections: { id: string; name: string; defaultModeId: string }[] = [];
  const variables: {
    id: string;
    name: string;
    variableCollectionId: string;
    resolvedType: string;
    valuesByMode: Record<string, unknown>;
    setValueForMode: (m: string, v: unknown) => void;
  }[] = [];
  const writes: string[] = [];
  const addCollection = (name: string) => {
    const col = { id: `col${collections.length}`, name, defaultModeId: 'm1' };
    collections.push(col);
    return col;
  };
  const addVariable = (name: string, col: { id: string }) => {
    const v = {
      id: `var${variables.length}`,
      name,
      variableCollectionId: col.id,
      resolvedType: 'COLOR',
      valuesByMode: {} as Record<string, unknown>,
      setValueForMode(m: string, val: unknown) {
        writes.push(`set ${name}`);
        this.valuesByMode[m] = { a: 1, ...(val as object) };
      },
    };
    variables.push(v);
    return v;
  };
  if (seed.collection) {
    const col = addCollection(seed.collection);
    for (const [name, hex] of Object.entries(seed.vars ?? {}))
      addVariable(name, col).valuesByMode.m1 = rgb(hex);
  }
  const sent: any[] = [];
  const figma: any = {
    root: { name: 'DS-Studio — essai' },
    showUI() {},
    closePlugin() {},
    // Copie comme le ferait postMessage (et hors du contexte vm).
    ui: {
      postMessage: (m: unknown) => sent.push(JSON.parse(JSON.stringify(m))),
      onmessage: null,
    },
    variables: {
      getLocalVariableCollectionsAsync: async () => [...collections],
      getLocalVariablesAsync: async () => [...variables],
      getVariableByIdAsync: async (id: string) =>
        variables.find((v) => v.id === id) ?? null,
      createVariableCollection(name: string) {
        writes.push(`collection ${name}`);
        return addCollection(name);
      },
      createVariable(name: string, col: { id: string }) {
        writes.push(`create ${name}`);
        return addVariable(name, col);
      },
    },
  };
  vm.runInNewContext(
    readFileSync(
      new URL('../connectors/figma/plugin/code.js', import.meta.url),
      'utf8',
    ),
    { figma, __html__: '', console },
  );
  const post = (m: unknown) => figma.ui.onmessage(m);
  return { post, sent, writes, variables };
}

const palette = figmaVariablesFile({
  'color.rouge.050': '#FFF0F0',
  'color.rouge.500': '#E00000',
});

test('plugin : aperçu sans écriture, puis refus sans validation', async () => {
  const f = fakeFigma({});
  await f.post({ type: 'preview', file: palette });
  const plan = f.sent.at(-1);
  assert.equal(plan.type, 'plan');
  assert.equal(plan.plan.document, 'DS-Studio — essai');
  assert.equal(plan.plan.collectionExists, false);
  assert.deepEqual(
    plan.plan.items.map((i: any) => i.status),
    ['create', 'create'],
  );
  assert.deepEqual(f.writes, []);
  // Mauvais identifiant de validation : refus, rien d'écrit.
  await f.post({ type: 'apply', id: 'inventé' });
  assert.equal(f.sent.at(-1).type, 'refused');
  // La validation est consommée par le refus : l'ancien id ne sert plus.
  await f.post({ type: 'apply', id: plan.id });
  assert.equal(f.sent.at(-1).type, 'refused');
  // Annuler après un aperçu : rien d'écrit non plus.
  await f.post({ type: 'preview', file: palette });
  await f.post({ type: 'cancel' });
  await f.post({ type: 'apply', id: f.sent.at(-2).id });
  assert.equal(f.sent.at(-1).type, 'refused');
  assert.deepEqual(f.writes, []);
});

test('plugin : écriture validée puis relue, une seule fois', async () => {
  const f = fakeFigma({});
  await f.post({ type: 'preview', file: palette });
  const { id } = f.sent.at(-1);
  await f.post({ type: 'apply', id });
  const done = f.sent.at(-1);
  assert.equal(done.type, 'done');
  assert.deepEqual(f.writes, [
    'collection Primitives',
    'create color/rouge/050',
    'set color/rouge/050',
    'create color/rouge/500',
    'set color/rouge/500',
  ]);
  assert.deepEqual(
    done.readback.map((r: any) => [r.name, r.read, r.ok]),
    [
      ['color/rouge/050', '#FFF0F0', true],
      ['color/rouge/500', '#E00000', true],
    ],
  );
  // Rejouer la même validation : refus, aucune écriture en double.
  await f.post({ type: 'apply', id });
  assert.equal(f.sent.at(-1).type, 'refused');
  assert.equal(f.writes.length, 5);
});

test('plugin : une variable existante n’est jamais remplacée', async () => {
  const f = fakeFigma({
    collection: 'Primitives',
    vars: { 'color/rouge/050': '#FFF0F0', 'color/Rouge/500': '#123456' },
  });
  await f.post({ type: 'preview', file: palette });
  const plan = f.sent.at(-1);
  assert.deepEqual(
    plan.plan.items.map((i: any) => [i.status, i.current]),
    [
      ['same', '#FFF0F0'],
      ['conflict', '#123456 (color/Rouge/500)'],
    ],
  );
  await f.post({ type: 'apply', id: plan.id });
  assert.equal(f.sent.at(-1).message, 'Rien à créer : rien n’a été écrit.');
  assert.deepEqual(f.writes, []);
});

test('plugin : le fichier Figma a changé entre l’aperçu et la validation', async () => {
  const f = fakeFigma({ collection: 'Primitives' });
  await f.post({ type: 'preview', file: palette });
  const { id } = f.sent.at(-1);
  f.variables.push({
    ...f.variables[0],
    id: 'x',
    name: 'color/rouge/050',
    variableCollectionId: 'col0',
    resolvedType: 'COLOR',
    valuesByMode: { m1: { r: 0, g: 0, b: 0, a: 1 } },
  } as any);
  await f.post({ type: 'apply', id });
  assert.match(f.sent.at(-1).message, /a changé/);
});

test('plugin : fichier invalide refusé avant toute lecture', async () => {
  const f = fakeFigma({});
  for (const file of [
    { ...palette, format: 'autre' },
    { ...palette, version: 2 },
    {
      ...palette,
      variables: [{ name: 'a b', type: 'COLOR', value: '#000000' }],
    },
    { ...palette, variables: [{ name: 'a', type: 'COLOR', value: 'red' }] },
    { ...palette, variables: [...palette.variables, palette.variables[0]] },
  ]) {
    await f.post({ type: 'preview', file });
    assert.equal(f.sent.at(-1).type, 'error');
  }
  assert.deepEqual(f.writes, []);
});
