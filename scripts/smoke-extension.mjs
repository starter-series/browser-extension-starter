import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname, '..');
const zipPath = path.join(root, 'dist', 'extension.zip');
const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'browser-extension-starter-'));
const extensionDir = path.join(tmpDir, 'extension');
const userDataDir = path.join(tmpDir, 'profile');
const DEFAULTS = {
  highlightEnabled: true,
  highlightColor: '#FFEB3B',
  blockedDomains: '',
};
const routeHtml = `<!doctype html>
<html>
  <head><title>Extension smoke target</title></head>
  <body>
    <main>
      <mark>one</mark>
      <mark>two</mark>
      <mark>three</mark>
      <mark>four</mark>
      <mark>five</mark>
    </main>
  </body>
</html>`;

async function extractBuiltExtension() {
  try {
    await fs.access(zipPath);
  } catch {
    throw new Error('dist/extension.zip is missing. Run npm run build:chrome before npm run smoke:extension.');
  }

  await fs.mkdir(extensionDir, { recursive: true });
  await fs.mkdir(userDataDir, { recursive: true });

  const extracted = spawnSync('unzip', ['-q', zipPath, '-d', extensionDir], {
    cwd: root,
    encoding: 'utf8',
  });
  if (extracted.status !== 0) {
    throw new Error(
      (extracted.stderr || extracted.stdout || 'could not extract dist/extension.zip; install unzip and retry.').trim(),
    );
  }

  await fs.access(path.join(extensionDir, 'manifest.json'));
  return extensionDir;
}

async function readSyncStorage(page, keys) {
  return page.evaluate((requestedKeys) => new Promise((resolve, reject) => {
    chrome.storage.sync.get(requestedKeys, (items) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(items);
    });
  }), keys);
}

async function waitForSyncStorage(page, expected) {
  await page.waitForFunction(({ keys, values }) => new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(keys.every((key) => items[key] === values[key]));
    });
  }), { keys: Object.keys(expected), values: expected }, { timeout: 10000 });
}

let context;
try {
  const builtExtensionDir = await extractBuiltExtension();

  context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${builtExtensionDir}`,
      `--load-extension=${builtExtensionDir}`,
    ],
  });

  let [serviceWorker] = context.serviceWorkers();
  if (!serviceWorker) {
    serviceWorker = await context.waitForEvent('serviceworker', { timeout: 15000 });
  }
  const extensionId = serviceWorker.url().split('/')[2];
  assert.match(extensionId, /^[a-z]{32}$/);

  const popup = await context.newPage();
  await popup.goto(`chrome-extension://${extensionId}/src/popup/popup.html`);
  await popup.waitForSelector('#status.active', { timeout: 10000 });
  assert.equal(await popup.locator('h1').textContent(), 'My Extension');
  assert.equal(await popup.locator('#status').textContent(), 'Active');
  await waitForSyncStorage(popup, DEFAULTS);

  await context.route('https://example.com/*', (route) => route.fulfill({
    status: 200,
    contentType: 'text/html',
    body: routeHtml,
  }));
  const contentPage = await context.newPage();
  await contentPage.goto('https://example.com/smoke');
  await contentPage.waitForFunction(() => (
    document.querySelectorAll('mark[data-starter-highlight="1"]').length === 5
  ), { timeout: 10000 });
  const markStyle = await contentPage.locator('mark').first().evaluate((el) => el.style.background);
  assert.match(markStyle, /rgb\(255,\s*235,\s*59\)|#ffeb3b/i);

  await popup.locator('.slider').click();
  await popup.waitForSelector('#status.inactive', { timeout: 10000 });
  assert.deepEqual(await readSyncStorage(popup, ['highlightEnabled']), {
    highlightEnabled: false,
  });
  await contentPage.waitForFunction(() => (
    document.querySelectorAll('mark[data-starter-highlight="1"]').length === 0
  ), { timeout: 10000 });

  await popup.locator('.slider').click();
  await popup.waitForSelector('#status.active', { timeout: 10000 });
  await contentPage.waitForFunction(() => (
    document.querySelectorAll('mark[data-starter-highlight="1"]').length === 5
  ), { timeout: 10000 });

  const options = await context.newPage();
  await options.goto(`chrome-extension://${extensionId}/src/options/options.html`);
  await options.waitForSelector('#settings-form', { timeout: 10000 });
  await options.locator('#highlightEnabled').setChecked(true);
  await options.locator('#highlightColor').fill('#00ff88');
  await options.locator('#blockedDomains').fill('');
  await options.locator('#save').click();
  await options.waitForSelector('#status.ok', { timeout: 10000 });
  assert.equal(await options.locator('#status').textContent(), 'Saved');
  await waitForSyncStorage(options, {
    highlightEnabled: true,
    highlightColor: '#00ff88',
    blockedDomains: '',
  });
  await contentPage.waitForFunction(() => {
    const first = document.querySelector('mark[data-starter-highlight="1"]');
    return first && /rgb\(0,\s*255,\s*136\)|#00ff88/i.test(first.style.background);
  }, { timeout: 10000 });

  console.log(`extension artifact smoke ok (${extensionId})`);
} catch (err) {
  console.error('extension smoke failed:', err.message);
  process.exitCode = 1;
} finally {
  if (context) await context.close();
  await fs.rm(tmpDir, { recursive: true, force: true });
}
