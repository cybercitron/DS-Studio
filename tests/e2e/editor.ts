import { expect, type Page } from '@playwright/test';

// Le panneau Modifier est replié par défaut : bouton flottant en large,
// destination « Modifier » sous 1100 px.
export async function openEditor(page: Page) {
  await page.locator('#ds-panel').waitFor();
  const panel = page.locator('#agent-panel');
  if (await panel.isVisible()) return;
  const fab = page.locator('.edit-fab');
  if (await fab.isVisible()) await fab.click();
  else
    await page
      .getByRole('navigation', { name: 'Panneaux de l’atelier' })
      .getByRole('button', { name: 'Modifier', exact: true })
      .click();
  await expect(panel).toBeVisible();
}

// La vue d'ensemble montre des vignettes inertes : on ouvre la page du
// composant depuis la barre de gauche (largeur desktop).
export async function openComponent(page: Page, name: string) {
  await page
    .locator('#ds-panel .nav-item')
    .filter({ hasText: new RegExp(`^${name}$`) })
    .click();
  await expect(
    page.locator('.canvas-document-heading h3', { hasText: name }),
  ).toBeVisible();
}
