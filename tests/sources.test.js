const { pkg, readSrc } = require('./helpers');

describe('source files', () => {
  test('popup.js wires DOMContentLoaded and reads chrome.storage', () => {
    const src = readSrc('src/popup/popup.js');
    expect(src).toMatch(/addEventListener\(\s*['"]DOMContentLoaded['"]/);
    expect(src).toMatch(/chrome\.storage\.local\.get/);
  });

  test('options.js wires DOMContentLoaded and persists settings', () => {
    const src = readSrc('src/options/options.js');
    expect(src).toMatch(/addEventListener\(\s*['"]DOMContentLoaded['"]/);
    expect(src).toMatch(/chrome\.storage\.local\.set/);
  });

  test('background service worker is syntactically valid JS', () => {
    // MV3 service workers are classic scripts (no ES module top-level import/export),
    // so Function() can parse them. If you migrate to modules, replace with a real parser.
    const src = readSrc('src/background/background.js');
    expect(() => new Function(src)).not.toThrow();
  });

  test('content script is syntactically valid JS', () => {
    const src = readSrc('src/content/content.js');
    expect(() => new Function(src)).not.toThrow();
  });

  test('chrome.runtime.lastError is checked after storage callbacks', () => {
    // Common MV3 foot-gun: storage callbacks silently swallow errors when
    // lastError is not consulted.
    const popup = readSrc('src/popup/popup.js');
    const options = readSrc('src/options/options.js');
    expect(popup).toMatch(/chrome\.runtime\.lastError/);
    expect(options).toMatch(/chrome\.runtime\.lastError/);
  });
});

describe('package metadata', () => {
  test('is private (extensions are not published to npm)', () => {
    expect(pkg.private).toBe(true);
  });

  test('requires Node >=20', () => {
    expect(pkg.engines?.node).toMatch(/>=\s*(2[0-9]|[3-9]\d)/);
  });

  test('declares lint, test, and build:chrome scripts', () => {
    expect(pkg.scripts).toEqual(
      expect.objectContaining({
        lint: expect.any(String),
        test: expect.any(String),
        'build:chrome': expect.any(String),
      }),
    );
  });
});
