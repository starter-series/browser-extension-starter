/**
 * Structural smoke tests.
 *
 * These tests read src/*.js as strings and check for required
 * substrings or parse them via `new Function(src)`. They catch
 * obviously-broken files (missing storage calls, missing lastError
 * handling, syntax errors) but do NOT verify the matched code paths
 * actually run correctly. Real behavior coverage lives in
 * tests/settings.test.js (unit tests on src/settings.js).
 *
 * KNOWN LIMITATION — `new Function(src)` parses as a function body,
 * which rejects top-level `import`/`export`. If you ever migrate
 * `background.js` (or any other src/*.js) to MV3 ESM service-worker
 * mode (`"type": "module"` in manifest.json), the parse-only checks
 * below will fail on perfectly valid code. Replace them with a real
 * parser (acorn / @babel/parser) at that point.
 *
 * If you add real chrome-API mocking later, migrate the checks here
 * into proper unit tests and shrink this file.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function readSrc(p) {
  return fs.readFileSync(path.join(root, p), 'utf8');
}

describe('source files (structural)', () => {
  test('popup.js wires DOMContentLoaded and reads chrome.storage.sync', () => {
    const src = readSrc('src/popup/popup.js');
    expect(src).toMatch(/addEventListener\(\s*['"]DOMContentLoaded['"]/);
    expect(src).toMatch(/chrome\.storage\.sync\.get/);
  });

  test('options.js persists settings via chrome.storage.sync', () => {
    const src = readSrc('src/options/options.js');
    expect(src).toMatch(/addEventListener\(\s*['"]DOMContentLoaded['"]/);
    expect(src).toMatch(/chrome\.storage\.sync\.set/);
  });

  test('background service worker is syntactically valid JS', () => {
    const src = readSrc('src/background/background.js');
    // See KNOWN LIMITATION at top of file — this will break if the
    // service worker migrates to ESM module mode.
    expect(() => new Function(src)).not.toThrow();
  });

  test('content script is syntactically valid JS', () => {
    const src = readSrc('src/content/content.js');
    expect(() => new Function(src)).not.toThrow();
  });

  test('shared settings module is syntactically valid JS', () => {
    const src = readSrc('src/settings.js');
    expect(() => new Function(src)).not.toThrow();
  });

  test('chrome.runtime.lastError is checked after storage callbacks', () => {
    // Common MV3 foot-gun: silent failures when lastError is not consulted.
    const popup = readSrc('src/popup/popup.js');
    const options = readSrc('src/options/options.js');
    const background = readSrc('src/background/background.js');
    expect(popup).toMatch(/chrome\.runtime\.lastError/);
    expect(options).toMatch(/chrome\.runtime\.lastError/);
    expect(background).toMatch(/chrome\.runtime\.lastError/);
  });

  test('content script listens for storage changes', () => {
    const src = readSrc('src/content/content.js');
    expect(src).toMatch(/chrome\.storage\.onChanged\.addListener/);
  });
});

// These are real assertions on package.json + .nvmrc + workflow YAML,
// not structural file-grep — keep distinct from the `(structural)`
// suite above.
describe('package and workspace metadata', () => {
  let pkg;

  beforeAll(() => {
    // Read inside beforeAll so a malformed package.json surfaces as a
    // named-test failure (`● package metadata > is private`) rather
    // than killing the whole describe at module-load time with no
    // attribution.
    pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  });

  test('is private (extensions are not published to npm)', () => {
    expect(pkg.private).toBe(true);
  });

  test('engines.node floor is >= 22 (Node 22 Maintenance LTS through 2027-04)', () => {
    // Catches:
    //   - downgrade to EOL Node (Node 20 reached EOL 2026-04-30; engines `>=20` should fail)
    //   - sneaky disjunction (`>=20 || >=22` effectively means >=20 — first match wins, < 22 → fails)
    //   - typo'd majors (`>=222` — boundary in the regex rejects 3+ digit majors)
    // Accepts:
    //   - `>=22`, `>=22.0.0`, `^22.x`, `~22.x`
    //   - legitimate forward bumps (`>=24`, etc.)
    const constraint = pkg.engines?.node || '';
    const match = constraint.match(/(?:>=|\^|~)\s*(\d{1,2})(?:[.\s|]|$)/);
    expect(match).not.toBeNull();
    const major = parseInt(match[1], 10);
    expect(major).toBeGreaterThanOrEqual(22);
  });

  test('declares lint, test, and verified build:chrome scripts', () => {
    expect(pkg.scripts).toEqual(
      expect.objectContaining({
        lint: expect.any(String),
        test: expect.any(String),
        'build:chrome': expect.any(String),
      }),
    );
    expect(pkg.scripts['build:chrome']).toContain('scripts/check-extension-zip.js');
    expect(fs.existsSync(path.join(root, 'scripts', 'check-extension-zip.js'))).toBe(true);
  });

  test('Node version is consistent across .nvmrc and CI/CD workflows', () => {
    // Silent-divergence guard: someone bumps package.json + .nvmrc
    // but forgets to update the workflow YAMLs (or vice versa) and
    // CI keeps running on the old Node major for months. Every
    // pinned `node-version:` line under .github/workflows/ must
    // equal .nvmrc.
    const nvmrc = fs.readFileSync(path.join(root, '.nvmrc'), 'utf8').trim();
    const workflows = ['ci.yml', 'cd.yml', 'cd-firefox.yml'];

    for (const name of workflows) {
      const src = fs.readFileSync(
        path.join(root, '.github/workflows', name),
        'utf8',
      );
      // Quote-tolerant: matches `node-version: 22`, `node-version: '22'`, `node-version: "22"`.
      const matches = [...src.matchAll(/node-version:\s*['"]?(\d+)/g)].map(
        (m) => m[1],
      );
      // Workflows that don't set up node won't match — only assert on
      // those that do. Don't require every workflow to pin node.
      for (const v of matches) {
        expect({ file: name, nodeVersion: v }).toEqual({
          file: name,
          nodeVersion: nvmrc,
        });
      }
    }
  });
});
