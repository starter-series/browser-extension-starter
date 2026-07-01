/*
 * shotkit starter-pack config — the interface every consumer can start from.
 *
 * `npm run capture:store` reads this file and produces CWS assets into outDir.
 * The optional SNS handoff fields below are forward-compatible with shotkit
 * releases that support manifest/video handoff output.
 * The shotkit engine (`shotkit`) owns build → launch → screenshot
 * → caption → promo → video → description. Newer shotkit releases may also
 * emit handoff JSON from the demo block. THIS file owns the
 * project-specific parts: which extension to load, how to set up deterministic
 * fixtures, and which screens/actions make a useful story.
 *
 * The scenes below are intentionally small: a working demo against this
 * starter's own <mark>-highlighter. Treat them as a starter pack for agents,
 * not final marketing creative. Real projects should replace the fixture and
 * story captions with their product's before → action → result → restore path.
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
const { stageExtension, patchManifestForLocalhost, serveDirectory } = require('shotkit');

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
    audience: 'sns',
    nextTool: 'screen-studio',
    guidance: 'Starter-pack smoke clip; use the generated webm and listing copy now, then use mp4, thumbnail, captions, storyboard, and manifest when the capture engine supports the full handoff bundle.',
    // Forward-compatible with shotkit builds that include the handoff/video
    // pipeline. These fields become active as soon as the capture engine
    // dependency resolves to that release. The explicit
    // 1280×720 viewport keeps this config runnable before the new sns-video
    // preset is published.
    viewport: { width: 1280, height: 720 },
    mp4: { crf: 18 },
    trim: { start: 0, duration: '00:14' },
    thumbnail: { at: 1.2 },
    // This starter clip is intentionally short for smoke testing. Real launch
    // demos should leave storyboard lint enabled and target 20-40 seconds.
    storyboardLint: false,
    captions: [
      { at: 0.5, text: 'Highlight important text automatically' },
      { at: 3.5, text: 'Open the toolbar control' },
      { at: 6.0, text: 'Toggle the behavior off and on' },
      { at: 10.0, text: 'Ship a clear demo clip with the store assets' },
    ],
    async run({ page, extensionId, baseUrl, demo }) {
      const story = demo || {
        step: async (_caption, action, options = {}) => {
          await action();
          if (options.holdMs) await page.waitForTimeout(options.holdMs);
        },
        wait: (ms) => page.waitForTimeout(ms),
        click: async (selector, options = {}) => {
          const { holdMs = 0, ...clickOptions } = options;
          await page.click(selector, clickOptions);
          if (holdMs) await page.waitForTimeout(holdMs);
        },
      };

      await story.step('Highlight important text automatically', async () => {
        await page.goto(`${baseUrl}/article`, { waitUntil: 'networkidle' });
        await page.waitForSelector('mark[data-starter-highlight]', { timeout: 10_000 });
      }, { holdMs: 1400 });
      await story.step('Open the toolbar control', async () => {
        await page.goto(`chrome-extension://${extensionId}/src/popup/popup.html`, { waitUntil: 'load' });
        await page.waitForSelector('#status');
      }, { holdMs: 900 });
      // The <input> is visually hidden (opacity:0); the visible control is the
      // slider inside the <label>, which toggles the checkbox when clicked.
      await story.click('.slider', { moveMs: 420, holdMs: 1200 }); // flip the setting off
      await story.click('.slider', { moveMs: 420, holdMs: 900 }); // and back on
      await story.wait(500);
    },
  },
};
