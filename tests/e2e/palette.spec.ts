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

  // Rien n'est écrit dans le Design System.
  const after = await (await page.request.get('/api/state')).json();
  expect(after.revision).toBe((await before).revision);
});
