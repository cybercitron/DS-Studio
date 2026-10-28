import { test, expect, chromium } from '@playwright/test';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

test('zoom navigateur réel 100–200 %, sans zoom CSS ni simple redimensionnement du viewport', async ({}, info) => {
  const temporary = await mkdtemp(path.join(tmpdir(), 'ds-zoom-'));
  const extension = path.join(temporary, 'extension');
  await mkdir(extension);
  await writeFile(
    path.join(extension, 'manifest.json'),
    JSON.stringify({
      manifest_version: 3,
      name: 'DS-Studio isolated zoom test',
      version: '1.0',
      permissions: ['tabs'],
      background: { service_worker: 'background.js' },
    }),
  );
  await writeFile(
    path.join(extension, 'background.js'),
    'chrome.runtime.onInstalled.addListener(() => {});',
  );
  const context = await chromium.launchPersistentContext(
    path.join(temporary, 'profile'),
    {
      channel: 'chromium',
      headless: true,
      viewport: null,
      args: [
        '--window-size=1440,1000',
        `--disable-extensions-except=${extension}`,
        `--load-extension=${extension}`,
      ],
    },
  );
  try {
    const worker =
      context.serviceWorkers()[0] ||
      (await context.waitForEvent('serviceworker'));
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4318');
    await page
      .getByRole('heading', { name: 'Tokens sémantiques', exact: true })
      .waitFor();
    const measurements = [];
    for (const factor of [1, 1.25, 1.5, 2]) {
      const actual = await worker.evaluate(async (factor) => {
        const { chrome } = globalThis as typeof globalThis & {
          chrome: {
            tabs: {
              query: (query: object) => Promise<{ id: number }[]>;
              setZoom: (id: number, factor: number) => Promise<void>;
              getZoom: (id: number) => Promise<number>;
            };
          };
        };
        const [tab] = await chrome.tabs.query({
          url: 'http://127.0.0.1:4318/*',
        });
        await chrome.tabs.setZoom(tab.id, factor);
        return chrome.tabs.getZoom(tab.id);
      }, factor);
      expect(actual).toBe(factor);
      await expect
        .poll(() => page.evaluate(() => devicePixelRatio))
        .toBe(factor);
      const size = await page.evaluate(() => ({
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        cssZoom: getComputedStyle(document.documentElement).zoom,
      }));
      expect(size.documentWidth).toBe(size.width);
      expect(size.documentHeight).toBe(size.height);
      expect(size.cssZoom).toBe('1');
      measurements.push({ factor, ...size });
    }
    expect(measurements[3].width).toBeCloseTo(measurements[0].width / 2, 0);
    await page.getByLabel('Valeur du token').fill('#504030');
    await page.getByRole('button', { name: 'Proposer', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Ne pas appliquer' }),
    ).toBeFocused();
    const cdp = await context.newCDPSession(page);
    async function captureZoom(name: string) {
      // Sans clip CSS : le zoom natif exige une capture de toute la surface.
      const capture = await cdp.send('Page.captureScreenshot', {
        format: 'png',
        fromSurface: true,
        captureBeyondViewport: false,
      });
      await writeFile(
        info.outputPath(name),
        Buffer.from(capture.data, 'base64'),
      );
    }
    await captureZoom('real-zoom-200-diff.png');
    await page.keyboard.press('Escape');
    await page
      .getByRole('navigation', { name: 'Panneaux de l’atelier' })
      .getByRole('button', { name: 'Aperçu', exact: true })
      .click();
    await page
      .getByRole('combobox', { name: 'Viewport', exact: true })
      .selectOption('0');
    await expect
      .poll(() =>
        page
          .locator('iframe')
          .evaluate(
            (frame: HTMLIFrameElement) => frame.contentWindow!.innerWidth,
          ),
      )
      .toBe(320);
    await captureZoom('real-zoom-200-preview.png');
    await info.attach('real-browser-zoom', {
      body: JSON.stringify(measurements, null, 2),
      contentType: 'application/json',
    });
  } finally {
    await context.close();
    await rm(temporary, { recursive: true, force: true });
  }
});
