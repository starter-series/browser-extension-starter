/*
 * Store-asset config — the interface every consumer of this starter implements.
 *
 * `npm run capture:store` reads this file and produces CWS assets into outDir.
 * The shotkit engine (`@starter-series/shotkit`) owns build → launch → screenshot
 * → caption → promo → video → description; THIS file owns the project-specific
 * parts: which extension to load, how to set up the page environment, and the
 * "scenes" that drive the extension into each money-shot state.
 *
 * The scenes below are a working DEMO against this starter's own
 * <mark>-highlighter. When you scaffold a real extension, replace them with
 * scenes that drive your features (see skillBridge for a 5-scene example).
 *
 * Scene contract:
 *   run({ page, context, extensionId, env, baseUrl, flags }) => Promise<void>
 *     page        a fresh Playwright Page at the scene's viewport
 *     context     the persistent context (the extension is loaded into it)
 *     extensionId the loaded extension's dynamic id (for chrome-extension:// URLs)
 *     env         whatever setup() returned (e.g. { baseUrl })
 *     flags       { liveGt, freeze } from the CLI
 *   Drive the UI, wait until it's rendered, then return. The harness screenshots.
 */

const path = require('path');
const { stageExtension, patchManifestForLocalhost, serveDirectory } = require('@starter-series/shotkit');

const FIXTURES = path.join(__dirname, 'store-assets', 'fixtures');
const TEMPLATES = path.join(__dirname, 'store-assets', 'templates');

module.exports = {
  // Run before launch. The starter's capture path has nothing to compile; it
  // stages unpacked files in prepareExtension. The shipped-bundle smoke gate is
  // scripts/smoke-extension.mjs, which extracts and loads dist/extension.zip.
  // A real project could put e.g. 'npm run build:bundle' here.
  build: null,
  outDir: 'store-assets',

  // Persistent disclaimer composited onto every screenshot + promo tile, and
  // shown as a corner badge during the demo. Keeps trademark-safety structural.
  disclaimer: 'Demo extension · sample store assets',

  // Listing copy is extracted from this human-edited markdown.
  description: { from: 'store-assets/STORE_LISTING.md' },

  // Stage just the extension's own files into a temp dir and widen the manifest
  // so the content script also runs against the localhost fixture server.
  prepareExtension() {
    const dir = stageExtension(__dirname, ['manifest.json', 'src', 'assets']);
    patchManifestForLocalhost(dir);
    return dir;
  },

  // Serve the fixtures over http (content scripts won't inject on file://).
  // The single demo.html answers any path via the fallback.
  async setup() {
    const server = await serveDirectory(FIXTURES, { fallback: 'demo.html' });
    return { env: { baseUrl: server.baseUrl }, teardown: () => server.close() };
  },

  scenes: [
    {
      name: '01-popup',
      caption: 'One-click toggle from the toolbar popup',
      async run({ page, extensionId }) {
        await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`, { waitUntil: 'load' });
        await page.waitForSelector('#status');
        // The popup is a 320px card — center it on a clean backdrop so the
        // 1280×800 shot reads as an intentional product image, not a tiny
        // panel in the corner.
        await page.addStyleTag({
          content: `html{min-height:100%;display:grid;place-items:center;
            background:radial-gradient(circle at 50% 30%,#eef2ff,#dbe4ff)}
            body{box-shadow:0 18px 60px rgba(30,40,90,.25);border-radius:14px}`,
        });
      },
    },
    {
      name: '02-highlight',
      caption: 'Highlights marked text on the page automatically',
      async run({ page, baseUrl }) {
        await page.goto(`${baseUrl}/article`, { waitUntil: 'networkidle' });
        // The content script paints <mark> elements once settings load.
        await page.waitForSelector('mark[data-starter-highlight]', { timeout: 10_000 });
      },
    },
  ],

  promoTiles: [
    {
      name: 'promo-tile-440x280',
      template: path.join(TEMPLATES, 'promo-440x280.html'),
      width: 440,
      height: 280,
      replacements: {
        NAME: 'My Extension',
        TAGLINE: 'A vanilla-JS browser extension, built from the starter.',
        DISCLAIMER: 'Demo · sample store asset',
      },
    },
  ],

  demo: {
    name: 'demo',
    async run({ page, extensionId, baseUrl }) {
      await page.goto(`${baseUrl}/article`, { waitUntil: 'networkidle' });
      await page.waitForSelector('mark[data-starter-highlight]', { timeout: 10_000 });
      await page.waitForTimeout(1400);
      await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`, { waitUntil: 'load' });
      await page.waitForSelector('#status');
      await page.waitForTimeout(900);
      // The <input> is visually hidden (opacity:0); the visible control is the
      // slider inside the <label>, which toggles the checkbox when clicked.
      await page.click('.slider'); // flip the setting off
      await page.waitForTimeout(1200);
      await page.click('.slider'); // and back on
      await page.waitForTimeout(900);
    },
  },
};
