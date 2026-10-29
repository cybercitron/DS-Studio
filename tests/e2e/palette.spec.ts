import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('générateur de palettes : jaune vif, règle impossible, retouche, export', async ({
  page,
}) => {
  await page.goto('/');
  const before = (await page.request.get('/api/state')).json();
  // Le générateur s'ouvre depuis la Boîte à outils de la barre latérale.
  await page.getByRole('button', { name: 'Créateur de palettes' }).click();
  const view = page.locator('#palette-view');
  await expect(
    view.getByRole('heading', { name: 'Générateur de palettes accessibles' }),
  ).toBeFocused();

  await view.getByLabel('Couleur de départ en hexadécimal').fill('#FFFF0A');
  await view.getByLabel('Nom de la palette').fill('Jaune Capc');
  const swatches = view.getByRole('list', { name: 'Nuances de la palette' });
  await expect(swatches.getByRole('listitem')).toHaveCount(10);
  await expect(
    view.getByRole('button', {
      name: /Nuance 500, #FFFF0A, couleur de départ/,
    }),
  ).toBeVisible();

  // La couleur reste intacte : la règle 500 ≥ 3:1 est signalée impossible.
  const rules = view.locator('.palette-rules li');
  await expect(rules.nth(1)).toContainText('impossible avec la couleur');
  await expect(rules.nth(2)).toHaveAttribute('data-ok', 'true');

  // Une retouche sous le seuil déclenche l'alerte, puis revient au calcul.
  await view.getByRole('button', { name: /^Nuance 700/ }).click();
  await view.getByLabel('Nuance 700 en hexadécimal').fill('#B5A800');
  await expect(rules.nth(2)).toHaveAttribute('data-ok', 'false');
  await expect(rules.nth(2)).toContainText('nuance retouchée');
  await view
    .getByRole('button', { name: 'Revenir au calcul automatique' })
    .click();
  await expect(rules.nth(2)).toHaveAttribute('data-ok', 'true');

  // Nombre de nuances réglable ; une règle ajoutée est évaluée.
  await view.getByLabel('Nombre de nuances').fill('6');
  await expect(swatches.getByRole('listitem')).toHaveCount(6);
  await view.getByRole('button', { name: 'Ajouter une règle' }).click();
  await expect(rules.last()).toHaveAttribute('data-ok', 'true');

  const download = page.waitForEvent('download');
  await view
    .getByRole('button', { name: 'Exporter la palette (JSON)' })
    .click();
  const file = await download;
  expect(file.suggestedFilename()).toBe('palette-jauneCapc.tokens.json');
  const tokens = JSON.parse(await readFile((await file.path())!, 'utf8'));
  expect(Object.keys(tokens)).toHaveLength(6);
  expect(tokens['color.jauneCapc.400']).toEqual({
    $type: 'color',
    $value: '#FFFF0A',
  });

  // Export pour le plugin Figma : collection Primitives, noms en dossiers.
  const figmaDownload = page.waitForEvent('download');
  await view.getByRole('button', { name: 'Exporter pour Figma' }).click();
  const figmaFile = await figmaDownload;
  expect(figmaFile.suggestedFilename()).toBe('jauneCapc.figma-variables.json');
  const variables = JSON.parse(
    await readFile((await figmaFile.path())!, 'utf8'),
  );
  expect(variables.format).toBe('ds-studio.figma-variables');
  expect(variables.collection).toBe('Primitives');
  expect(variables.variables).toHaveLength(6);
  expect(variables.variables).toContainEqual({
    name: 'color/jauneCapc/400',
    type: 'COLOR',
    value: '#FFFF0A',
  });

  // Rien n'est écrit dans le Design System.
  const after = await (await page.request.get('/api/state')).json();
  expect(after.revision).toBe((await before).revision);
});

test('générateur de palettes : ajout comme tokens primitives via le diff', async ({
  page,
}) => {
  await page.goto('/');
  const state = async () => (await page.request.get('/api/state')).json();
  const start = await state();
  const dialog = page.locator('dialog[aria-labelledby="diff-title"]');
  const view = page.locator('#palette-view');
  const add = view.getByRole('button', {
    name: 'Ajouter comme tokens primitives',
  });
  const openTool = async () => {
    await page.getByRole('button', { name: 'Créateur de palettes' }).click();
    await view.getByLabel('Couleur de départ en hexadécimal').fill('#E2001A');
    await view.getByLabel('Nom de la palette').fill('Rouge primaire');
  };

  // Les noms complets apparaissent dans le diff ; rien n'est écrit avant validation.
  await openTool();
  await expect(view).toContainText('color.rougePrimaire.050 à .900');
  await add.click();
  await expect(dialog).toBeVisible();
  for (const n of ['050', '500', '900'])
    await expect(
      dialog.getByRole('rowheader', { name: `color.rougePrimaire.${n}` }),
    ).toBeVisible();
  await expect(dialog.locator('tbody tr')).toHaveCount(10);
  await expect(dialog.getByText('Nouveau token')).toHaveCount(10);
  expect((await state()).revision).toBe(start.revision);
  await dialog.getByRole('button', { name: 'Valider et enregistrer' }).click();
  await expect(dialog).not.toBeVisible();

  // Présente après rechargement ; le même nom est refusé au lieu d'écraser.
  await page.reload();
  const added = await state();
  expect(added.tokens['color.rougePrimaire.500']).toEqual({
    $type: 'color',
    $value: '#E2001A',
  });
  await openTool();
  await expect(view.getByRole('alert')).toContainText('existe déjà');
  await expect(add).toBeDisabled();
  await view.getByLabel('Nom de la palette').fill('Rouge secondaire');
  await expect(add).toBeEnabled();

  // Annuler la révision retire les 10 tokens.
  await page.getByRole('button', { name: /Historique/ }).click();
  await page
    .getByRole('button', { name: `Annuler la révision ${added.revision}` })
    .click();
  await expect(dialog.getByText('Supprimé')).toHaveCount(10);
  await dialog.getByRole('button', { name: 'Valider et enregistrer' }).click();
  await expect(dialog).not.toBeVisible();
  const undone = await state();
  expect(
    Object.keys(undone.tokens).filter((k) => k.startsWith('color.rouge')),
  ).toEqual([]);
});
