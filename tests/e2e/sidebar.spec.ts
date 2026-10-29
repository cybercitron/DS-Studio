import { test, expect } from '@playwright/test';

// Barre latérale du 29/10 : la flèche replie, le titre ouvre la vue d'ensemble,
// le choix est retenu, le générateur de composants est annoncé mais inactif.
test('barre latérale : repli mémorisé, vues d’ensemble, boîte à outils', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.removeItem('ds-studio-sidebar-v1'));
  await page.reload();
  const sidebar = page.locator('#ds-panel');
  const tokensToggle = sidebar.getByRole('button', { name: 'Liste Tokens' });
  const componentsToggle = sidebar.getByRole('button', {
    name: 'Liste Composants',
  });
  // Ouvertes au premier lancement.
  await expect(tokensToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(componentsToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(
    sidebar.getByRole('button', { name: /^Couleurs/ }),
  ).toBeVisible();

  // Repli au clavier, sans changer la page affichée.
  await tokensToggle.focus();
  await page.keyboard.press('Enter');
  await expect(tokensToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(sidebar.getByRole('button', { name: /^Couleurs/ })).toBeHidden();
  await expect(
    page.locator('.canvas-document-heading h3', { hasText: 'Composants' }),
  ).toBeVisible();

  // Le choix survit au rechargement, puis se déplie à la souris.
  await page.reload();
  await expect(tokensToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(componentsToggle).toHaveAttribute('aria-expanded', 'true');
  await tokensToggle.click();
  await expect(
    sidebar.getByRole('button', { name: /^Couleurs/ }),
  ).toBeVisible();

  // Le titre ouvre la vue d'ensemble : toutes les familles de tokens.
  await sidebar
    .getByRole('button', { name: /^Tokens · vue d’ensemble/ })
    .click();
  const canvas = page.locator('.canvas-view:not([hidden])');
  await expect(
    canvas.locator('.canvas-document-heading h3', { hasText: 'Tokens' }),
  ).toBeVisible();
  for (const name of ['Couleurs', 'Typographie', 'Espacements', 'Rayons'])
    await expect(canvas.getByRole('heading', { name })).toBeVisible();
  await canvas
    .getByRole('button', { name: 'Sélectionner color.brand', exact: true })
    .click();
  await expect(page.locator('#agent-panel')).toBeVisible();

  await sidebar
    .getByRole('button', { name: /^Composants · vue d’ensemble/ })
    .click();
  await expect(page.getByRole('list', { name: 'Composants' })).toBeVisible();

  // Design / Aperçu n'existent que sur la page d'un composant.
  const tabs = page.locator('.canvas-tabs');
  await expect(tabs).toHaveCount(0);
  await sidebar.getByRole('button', { name: 'Bouton', exact: true }).click();
  await expect(tabs).toBeVisible();
  await sidebar.getByRole('button', { name: /^Rayons/ }).click();
  await expect(tabs).toHaveCount(0);

  // Le bouton Palette a quitté la barre du haut.
  await expect(
    page.locator('.studio-header').getByRole('button', { name: /Palette/ }),
  ).toHaveCount(0);
  await sidebar.getByRole('button', { name: 'Créateur de palettes' }).click();
  await expect(page.locator('#palette-view')).toBeVisible();

  // Générateur WIP : focusable, annoncé désactivé, sans effet.
  const wip = sidebar.getByRole('button', { name: /Générateur de composants/ });
  await expect(wip).toHaveAttribute('aria-disabled', 'true');
  await expect(wip).toHaveAccessibleDescription('Bientôt disponible');
  await sidebar.getByRole('button', { name: 'Créateur de palettes' }).focus();
  await page.keyboard.press('Tab');
  await expect(wip).toBeFocused();
  await expect(page.locator('#wip-hint')).toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');
  await expect(page.locator('#palette-view')).toBeVisible();
});
