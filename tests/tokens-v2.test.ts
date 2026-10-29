import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Store, restorePrevious } from '../app/server/store.js';
import { tokenCss, tokensSchema, type Tokens } from '../app/shared/model.js';
const seed = tokensSchema.parse(
  JSON.parse(
    await readFile(
      new URL('../workspace/design-system.tokens.json', import.meta.url),
      'utf8',
    ),
  ),
) as Tokens;
async function fixture(t: { after: (fn: () => Promise<void>) => void }) {
  const dir = await mkdtemp(path.join(tmpdir(), 'ds-tokens-v2-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const store = new Store(dir, seed);
  await store.init();
  return { dir, store };
}

test('ajout, rechargement, annulation puis suppression via le diff', async (t) => {
  const { dir, store } = await fixture(t);
  const before = await readFile(store.file, 'utf8');
  const add = store.propose(0, [
    { key: 'color.rouge.500', add: { $type: 'color', $value: '#E2001A' } },
    { key: 'space.xl', add: { $type: 'dimension', $value: 40 } },
    { key: 'font.titre', add: { $type: 'fontFamily', $value: 'Bagnard Sans' } },
  ]);
  assert.equal(add.patches.length, 3);
  assert.equal(add.patches[0].before, null);
  assert.equal(
    await readFile(store.file, 'utf8'),
    before,
    'Aucune écriture avant validation',
  );
  await store.commit(add.id);

  const reopened = new Store(dir, seed);
  await reopened.init();
  const state = reopened.snapshot();
  assert.equal(state.version, 2);
  assert.equal(state.tokens['color.rouge.500'].$value, '#E2001A');
  assert.equal(state.tokens['font.titre'].$value, 'Bagnard Sans');

  const undo = reopened.proposeUndo(1, state.history[0].id);
  assert.deepEqual(
    undo.patches.map((p) => [p.key, p.after]),
    [
      ['color.rouge.500', null],
      ['space.xl', null],
      ['font.titre', null],
    ],
  );
  await reopened.commit(undo.id);
  assert.deepEqual(reopened.snapshot().tokens, seed);

  const remove = reopened.propose(2, [{ key: 'color.brand', remove: true }]);
  assert.deepEqual(remove.patches, [
    { key: 'color.brand', before: seed['color.brand'], after: null },
  ]);
  await reopened.commit(remove.id);
  assert.equal(reopened.snapshot().tokens['color.brand'], undefined);
  const again = new Store(dir, seed);
  await again.init();
  // Annuler une suppression recrée le token avec sa valeur d'origine.
  const restore = again.proposeUndo(3, again.snapshot().history[2].id);
  await again.commit(restore.id);
  assert.deepEqual(again.snapshot().tokens['color.brand'], seed['color.brand']);
});

test('noms encadrés, familles, types et doublons refusés sans écriture', async (t) => {
  const { store } = await fixture(t);
  const raw = await readFile(store.file, 'utf8');
  const color = { $type: 'color', $value: '#123456' } as const;
  for (const key of [
    'rouge.500',
    'color',
    'color.Rouge',
    'color.rouge-500',
    'color..500',
    'color.rouge.500.',
    'shadow.sm',
    `color.${'a'.repeat(70)}`,
  ])
    assert.throws(() => store.propose(0, [{ key, add: color }]), key);
  assert.throws(() =>
    store.propose(0, [
      { key: 'space.xl', add: { $type: 'color', $value: '#123456' } },
    ]),
  );
  assert.throws(() =>
    store.propose(0, [
      { key: 'color.focus', remove: true },
      { key: 'color.focus', add: color },
    ]),
  );
  assert.throws(
    () => store.propose(0, [{ key: 'color.brandhover', add: color }]),
    /casse/,
  );
  assert.throws(
    () => store.propose(0, [{ key: 'color.brand', add: color }]),
    /existe déjà/,
  );
  assert.throws(
    () => store.propose(0, [{ key: 'color.inconnu', remove: true }]),
    /inconnu/,
  );
  assert.throws(
    () => store.propose(0, [{ key: 'color.inconnu', value: '#123456' }]),
    /inconnu/,
  );
  for (const value of [
    'url(evil)',
    'Arial; color: red',
    '"Arial"',
    ' Arial',
    '',
  ])
    assert.throws(() =>
      store.propose(0, [
        { key: 'font.titre', add: { $type: 'fontFamily', $value: value } },
      ]),
    );
  assert.equal(await readFile(store.file, 'utf8'), raw);
});

test('un token de base recréé garde le type lu par les composants', async (t) => {
  const { store } = await fixture(t);
  await store.commit(store.propose(0, [{ key: 'font.body', remove: true }]).id);
  assert.throws(() =>
    store.propose(1, [
      { key: 'font.body', add: { $type: 'fontFamily', $value: 'Arial' } },
    ]),
  );
  const p = store.propose(1, [
    { key: 'font.body', add: { $type: 'dimension', $value: 18 } },
  ]);
  await store.commit(p.id);
  assert.equal(store.snapshot().tokens['font.body'].$value, 18);
});

test('import : ajouts et suppressions montrés dans le même diff', async (t) => {
  const { store } = await fixture(t);
  const tokens: Tokens = structuredClone(seed);
  delete tokens['color.success'];
  tokens['color.vert.500'] = { $type: 'color', $value: '#00A651' };
  const p = store.proposeImport(0, tokens);
  assert.deepEqual(
    p.patches.map((x) => [x.key, !!x.before, !!x.after]),
    [
      ['color.success', true, false],
      ['color.vert.500', false, true],
    ],
  );
  assert.throws(() => store.proposeImport(0, {}));
});

test('variables CSS : valeur par défaut visible pour un token de base manquant', () => {
  const tokens: Tokens = structuredClone(seed);
  delete tokens['color.brand'];
  delete tokens['space.md'];
  delete tokens['font.family'];
  tokens['color.rouge.500'] = { $type: 'color', $value: '#E2001A' };
  tokens['font.titre'] = { $type: 'fontFamily', $value: 'Bagnard Sans' };
  const css = tokenCss(tokens);
  assert.equal(css['--color-brand'], '#FF00FF');
  assert.equal(css['--space-md'], '0px');
  assert.equal(css['--font-family'], 'system-ui');
  assert.equal(css['--color-rouge-500'], '#E2001A');
  assert.equal(css['--font-titre'], '"Bagnard Sans", system-ui, sans-serif');
  assert.equal(tokenCss(seed)['--font-family'], 'system-ui');
});

// État version 1 réaliste : quatre révisions manuelles, dont #5d47ff.
function v1State() {
  const tokens = structuredClone(seed) as Record<
    string,
    { $type: string; $value: string | number }
  >;
  const steps: [string, string | number][] = [
    ['color.brand', '#5d47ff'],
    ['color.brand', '#7a2bd1'],
    ['color.brand', '#F30039'],
    ['color.brandHover', '#B8002B'],
  ];
  const history = steps.map(([key, value], i) => {
    const before = tokens[key].$value;
    tokens[key].$value = value;
    return {
      id: randomUUID(),
      revision: i + 1,
      date: new Date(Date.UTC(2026, 9, 28, 14, i)).toISOString(),
      source: 'manual',
      patches: [{ key, before, after: value }],
    };
  });
  return { version: 1, revision: history.length, tokens, history };
}

test('migration version 1 → 2 au démarrage : sans perte, archivée, une seule fois', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ds-migration-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const v1 = v1State();
  const raw = JSON.stringify(v1, null, 2) + '\n';
  await writeFile(path.join(dir, 'state.json'), raw);
  await writeFile(path.join(dir, 'state.previous.json'), raw);

  const store = new Store(dir, seed);
  await store.init();
  const state = store.snapshot();
  assert.equal(state.version, 2);
  assert.equal(state.revision, 4);
  assert.deepEqual(state.tokens, v1.tokens);
  assert.deepEqual(state.history[0].patches[0], {
    key: 'color.brand',
    before: seed['color.brand'],
    after: { $type: 'color', $value: '#5d47ff' },
  });
  assert.deepEqual(
    state.history.map((r) => [r.id, r.date, r.source]),
    v1.history.map((r) => [r.id, r.date, r.source]),
  );
  const archives = (await readdir(dir)).filter((f) =>
    f.startsWith('state-v1-archive-'),
  );
  assert.equal(archives.length, 1);
  assert.equal(await readFile(path.join(dir, archives[0]), 'utf8'), raw);
  assert.equal(
    JSON.parse(await readFile(path.join(dir, 'state.json'), 'utf8')).version,
    2,
  );

  // Réouverture : déjà en version 2, aucune nouvelle archive.
  const reopened = new Store(dir, seed);
  await reopened.init();
  assert.deepEqual(reopened.snapshot(), state);
  assert.equal(
    (await readdir(dir)).filter((f) => f.startsWith('state-v1-archive-'))
      .length,
    1,
  );

  // Le journal migré reste annulable : revenir sur la révision 4 seule.
  const undo = reopened.proposeUndo(4, state.history[3].id);
  await reopened.commit(undo.id);
  assert.equal(
    reopened.snapshot().tokens['color.brandHover'].$value,
    seed['color.brandHover'].$value,
  );
  assert.equal(reopened.snapshot().tokens['color.brand'].$value, '#F30039');

  // Une copie précédente en version 1 reste restaurable, puis migrée au démarrage.
  await writeFile(path.join(dir, 'state.previous.json'), raw);
  const restored = await restorePrevious(dir);
  assert.equal(restored.revision, 4);
  const afterRestore = new Store(dir, seed);
  await afterRestore.init();
  assert.equal(afterRestore.snapshot().version, 2);
  assert.deepEqual(afterRestore.snapshot().tokens, v1.tokens);
});

test('migration refusée sur un journal v1 incohérent : original intact', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ds-migration-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const v1 = v1State();
  v1.history[0].patches[0].after = '#000000';
  const raw = JSON.stringify(v1);
  await writeFile(path.join(dir, 'state.json'), raw);
  await assert.rejects(() => new Store(dir, seed).init(), /original préservé/);
  assert.equal(await readFile(path.join(dir, 'state.json'), 'utf8'), raw);
  assert.deepEqual(await readdir(dir), ['state.json']);
});

test('alerte de suppression : chaque token de base a ses composants listés', async () => {
  const { tokenUsage } = await import('../app/client/tokenUsage.js');
  const { baseTokenKeys } = await import('../app/shared/model.js');
  const css = await readFile(
    new URL('../app/client/styles.css', import.meta.url),
    'utf8',
  );
  for (const key of baseTokenKeys) {
    assert.ok(tokenUsage[key]?.length, key);
    assert.ok(css.includes(`var(--${key.replaceAll('.', '-')})`), key);
  }
});
