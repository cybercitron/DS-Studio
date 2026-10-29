import { test, expect } from '@playwright/test';
import { openCreator, openEditor } from './editor.js';

test('ajout et suppression de tokens : diff, rechargement, annulation, alerte', async ({
  page,
}) => {
  await page.goto('/');
  await openCreator(page);
  const state = async () => (await page.request.get('/api/state')).json();
  const start = await state();
  const dialog = page.locator('dialog[aria-labelledby="diff-title"]');
  const closeHistory = () =>
    page.getByRole('button', { name: 'Fermer l’historique' }).click();

  // Ajout d'une primitive de couleur, rien n'est écrit avant validation.
  await page.getByLabel('Nom', { exact: true }).fill('rouge.500');
  await page.locator('#new-token-value').fill('#E2001A');
  await page.getByRole('button', { name: 'Proposer l’ajout' }).click();
  await expect(dialog).toContainText('color.rouge.500');
  await expect(dialog).toContainText('Nouveau token');
  expect((await state()).revision).toBe(start.revision);
  await dialog.getByRole('button', { name: 'Valider et enregistrer' }).click();
  await expect(dialog).not.toBeVisible();

  await page.reload();
  await page.locator('#ds-panel .nav-item', { hasText: 'Couleurs' }).click();
  await expect(
    page.getByRole('button', { name: 'Sélectionner color.rouge.500' }),
  ).toContainText('#E2001A');
  const added = await state();
  expect(added.tokens['color.rouge.500']).toEqual({
    $type: 'color',
    $value: '#E2001A',
  });

  // Annuler l'ajout supprime le token.
  await page.getByRole('button', { name: /Historique/ }).click();
  await page
    .getByRole('button', { name: `Annuler la révision ${added.revision}` })
    .click();
  await expect(dialog).toContainText('Supprimé');
  await dialog.getByRole('button', { name: 'Valider et enregistrer' }).click();
  await expect(dialog).not.toBeVisible();
  await closeHistory();
  expect((await state()).tokens['color.rouge.500']).toBeUndefined();

  // Supprimer un token de base : alerte, composants listés, fuchsia par défaut.
  await openEditor(page);
  await page
    .getByRole('combobox', { name: 'Token', exact: true })
    .selectOption('color.success');
  await page.getByRole('button', { name: 'Supprimer color.success…' }).click();
  await expect(dialog.locator('.removal-warning')).toContainText(
    'Carte atelier',
  );
  await expect(dialog.locator('.removal-warning')).toContainText('#FF00FF');
  await dialog.getByRole('button', { name: 'Valider et enregistrer' }).click();
  await expect(dialog).not.toBeVisible();
  const removed = await state();
  expect(removed.tokens['color.success']).toBeUndefined();
  await page
    .locator('#ds-panel .nav-section-title', { hasText: 'Composants' })
    .click();
  expect(
    await page
      .locator('.ds')
      .first()
      .evaluate((el) =>
        getComputedStyle(el).getPropertyValue('--color-success'),
      ),
  ).toBe('#FF00FF');

  // Annuler la suppression recrée la valeur d'origine.
  await page.getByRole('button', { name: /Historique/ }).click();
  await page
    .getByRole('button', { name: `Annuler la révision ${removed.revision}` })
    .click();
  await dialog.getByRole('button', { name: 'Valider et enregistrer' }).click();
  await expect(dialog).not.toBeVisible();
  await closeHistory();
  expect((await state()).tokens['color.success']).toEqual(
    start.tokens['color.success'],
  );

  // Police libre : une police absente est signalée avant toute proposition.
  await openCreator(page);
  await page.locator('.add-token select').selectOption({ index: 1 });
  await page.locator('#new-token-value').fill('Police Inexistante Test');
  await expect(page.locator('.add-token')).toContainText(
    'Police introuvable sur cet ordinateur',
  );
});
