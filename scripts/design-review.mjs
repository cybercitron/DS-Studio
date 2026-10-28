// Revue reproductible sur le serveur de fixtures uniquement. Aucun appel IA réel.
import { chromium } from '@playwright/test';
import { mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
const output = process.argv[2] || 'docs/design-reboot/pass-1';
await mkdir(output, { recursive: true });
const data = await mkdtemp(path.join(tmpdir(), 'ds-design-review-'));
const child = spawn(
  process.execPath,
  ['--import', 'tsx', 'app/server/index.ts'],
  {
    env: { ...process.env, PORT: '4324', DS_STUDIO_DATA_DIR: data },
    stdio: ['ignore', 'pipe', 'inherit'],
  },
);
let browser;
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('Serveur de revue indisponible')),
      10000,
    );
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Serveur de revue arrêté : ${code}`));
    });
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.stdout.on('data', (chunk) => {
      if (String(chunk).includes('http://127.0.0.1:4324')) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
  browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const base = 'http://127.0.0.1:4324';
  await page.goto(base);
  await page
    .getByRole('heading', { name: 'Tokens sémantiques', exact: true })
    .waitFor();
  await page.evaluate(() => document.fonts.ready);
  async function shot(name) {
    await page.screenshot({ path: `${output}/${name}.png` });
  }
  await shot('desktop');
  await page.getByLabel('Valeur du token').fill('#5145C9');
  await shot('token-edit');
  await page.getByRole('button', { name: 'Proposer', exact: true }).click();
  await shot('proposal-diff');
  await page.getByRole('button', { name: 'Valider et enregistrer' }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: /Historique/ }).click();
  await shot('history');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Aperçu', exact: true }).click();
  await page
    .frameLocator('iframe')
    .getByRole('heading', { name: /De petites idées/ })
    .waitFor();
  await shot('preview');
  await page.getByRole('button', { name: 'Agrandir le canevas' }).click();
  await shot('preview-focus');
  await page.getByRole('button', { name: 'Agrandir le canevas' }).click();
  await page.getByRole('button', { name: 'Composants', exact: true }).click();
  await page.getByText('Mon PFE · brief privé', { exact: true }).click();
  await page
    .getByLabel('Nom du PFE', { exact: true })
    .fill('Atelier partagé · fixture de revue');
  await page
    .getByLabel('Public concerné', { exact: true })
    .fill('Étudiants UX/UI');
  await page
    .getByLabel('Objectif et critères de réussite', { exact: true })
    .fill(
      'Comprendre et valider une évolution du système sans perdre le contexte.',
    );
  await shot('brief');
  await page.getByText('Mon PFE · brief privé', { exact: true }).click();
  await page.route('**/api/agents', (route) =>
    route.fulfill({
      json: [
        {
          id: 'codex',
          available: true,
          detail: 'Fixture de revue locale · aucun envoi cloud',
        },
      ],
    }),
  );
  await page.route('**/api/agent', (route) =>
    route.fulfill({
      json: {
        message:
          'Fixture de revue : comparez le contraste de la marque avant de valider. Aucun changement n’a été appliqué.',
        proposal: null,
      },
    }),
  );
  await page
    .getByRole('combobox', { name: 'Mode de travail' })
    .selectOption('codex');
  await page
    .getByLabel('Votre demande', { exact: true })
    .fill('Fixture : comment améliorer le contraste de la marque ?');
  await page
    .getByRole('button', { name: 'Envoyer à Codex', exact: true })
    .click();
  await page
    .getByText('Fixture de revue : comparez', { exact: false })
    .waitFor();
  await shot('chat-fixture');
  const metrics = [];
  for (const [width, height] of [
    [1920, 1080],
    [1280, 720],
    [1100, 700],
    [1024, 768],
    [700, 900],
    [375, 812],
    [320, 568],
    [844, 390],
    [720, 450],
  ]) {
    await page.setViewportSize({ width, height });
    if (width < 1100)
      await page
        .getByRole('navigation', { name: 'Panneaux de l’atelier' })
        .getByRole('button', { name: 'Tokens', exact: true })
        .click();
    metrics.push(
      await page.evaluate(() => ({
        width: innerWidth,
        height: innerHeight,
        docW: document.documentElement.scrollWidth,
        docH: document.documentElement.scrollHeight,
        bodyW: document.body.scrollWidth,
        bodyH: document.body.scrollHeight,
      })),
    );
    if ([1280, 375, 320, 844, 720].includes(width))
      await shot(`window-${width}x${height}`);
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page
    .getByRole('navigation', { name: 'Panneaux de l’atelier' })
    .getByRole('button', { name: 'Aperçu', exact: true })
    .click();
  await page
    .getByRole('combobox', { name: 'Viewport', exact: true })
    .selectOption('0');
  await shot('mobile-preview');
  await writeFile(
    `${output}/measurements.json`,
    JSON.stringify(
      { metrics, errors, chat: 'Intercepted local fixture; no cloud request' },
      null,
      2,
    ),
  );
} finally {
  await browser?.close();
  if (child.exitCode === null) {
    const stopped = once(child, 'exit');
    child.kill('SIGTERM');
    await stopped;
  }
  await rm(data, { recursive: true, force: true });
}
