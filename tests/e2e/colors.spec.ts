import { test, expect } from '@playwright/test';

test('page Couleurs : onglets Primitives et Semantic, repli, clic vers Modifier', async ({
  page,
}) => {
  await page.goto('/');
  const state = async () => (await page.request.get('/api/state')).json();
  const dialog = page.locator('dialog[aria-labelledby="diff-title"]');
  const openColors = () =>
    page.locator('#ds-panel .nav-item', { hasText: 'Couleurs' }).click();
  const tab = (name: string) =>
    page.getByRole('tab', { name: new RegExp(`^${name}`) });
  await openColors();

  // Semantic par défaut : les couleurs de base rangées par rôle.
  await expect(tab('Semantic')).toHaveAttribute('aria-selected', 'true');
  const semantic = page.getByRole('tabpanel', { name: /Semantic/ });
  for (const name of ['Marque', 'Texte', 'Fonds', 'Bordures', 'États'])
    await expect(semantic.getByRole('button', { name })).toBeVisible();
  await expect(semantic.getByRole('button', { name: /^Autres/ })).toHaveCount(
    0,
  );
  const brand = semantic.getByRole('button', {
    name: 'Sélectionner color.brand',
    exact: true,
  });
  await expect(brand).toContainText('Carte atelier');

  // Repli et dépli au clavier.
  const marque = semantic.getByRole('button', { name: /^Marque/ });
  await marque.focus();
  await page.keyboard.press('Enter');
  await expect(marque).toHaveAttribute('aria-expanded', 'false');
  await expect(brand).toBeHidden();
  await page.keyboard.press('Space');
  await expect(brand).toBeVisible();

  // Un clic ouvre le panneau Modifier sur ce token.
  await semantic
    .getByRole('button', { name: 'Sélectionner color.text', exact: true })
    .click();
  await expect(page.locator('#agent-panel')).toBeVisible();
  await expect(
    page.getByRole('combobox', { name: 'Token', exact: true }),
  ).toHaveValue('color.text');

  // Onglets au clavier ; sans palette, l'état vide mène au générateur.
  await tab('Semantic').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(tab('Primitives')).toBeFocused();
  await expect(tab('Primitives')).toHaveAttribute('aria-selected', 'true');
  const primitives = page.getByRole('tabpanel', { name: /Primitives/ });
  const start = await state();
  expect(
    Object.keys(start.tokens).some((k) => /^color\..*\.[0-9]+$/.test(k)),
  ).toBe(false);
  await expect(primitives).toContainText('Aucune palette');
  await primitives.getByRole('button', { name: 'Créer une palette' }).click();
  const view = page.locator('#palette-view');
  await expect(
    view.getByRole('heading', { name: 'Générateur de palettes accessibles' }),
  ).toBeFocused();

  // Une palette ajoutée depuis le générateur apparaît dans Primitives.
  await view.getByLabel('Couleur de départ en hexadécimal').fill('#1F3A93');
  await view.getByLabel('Nom de la palette').fill('Bleu nuit');
  await view
    .getByRole('button', { name: 'Ajouter comme tokens primitives' })
    .click();
  await dialog.getByRole('button', { name: 'Valider et enregistrer' }).click();
  await expect(dialog).not.toBeVisible();
  const added = await state();
  await openColors();
  await tab('Primitives').click();
  const palette = primitives.getByRole('region', {
    name: 'Palette color.bleuNuit',
  });
  await expect(palette.getByRole('listitem')).toHaveCount(10);
  await expect(palette.getByRole('listitem').first()).toContainText('050');
  await expect(palette.getByRole('listitem').last()).toContainText('900');
  await palette
    .getByRole('button', { name: 'Sélectionner color.bleuNuit.500' })
    .click();
  await expect(
    page.getByRole('combobox', { name: 'Token', exact: true }),
  ).toHaveValue('color.bleuNuit.500');
  // Les primitives ne se mêlent pas aux sémantiques.
  await expect(semantic.getByText('bleuNuit')).toHaveCount(0);

  // Nettoyage : annulation de l'ajout.
  await page.getByRole('button', { name: /Historique/ }).click();
  await page
    .getByRole('button', { name: `Annuler la révision ${added.revision}` })
    .click();
  await dialog.getByRole('button', { name: 'Valider et enregistrer' }).click();
  await expect(dialog).not.toBeVisible();
  await page.getByRole('button', { name: 'Fermer l’historique' }).click();
  await expect(primitives).toContainText('Aucune palette');
});
