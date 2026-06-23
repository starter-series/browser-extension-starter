/**
 * @jest-environment jsdom
 *
 * Behavioral tests for src/content/content.js.
 *
 * The module is loaded via require() (so Jest instruments it for coverage)
 * and exercised against a real jsdom DOM, the real settings helper, and a
 * behavioral chrome mock. Focus (per audit): the highlight BAIL-OUT logic —
 * paint <mark> only when enabled AND the host is not blocklisted, and strip
 * highlights when settings flip to a bail-out state. No source greps.
 */
const Content = require('../src/content/content');
const ExtSettings = require('../src/settings');
const { makeChrome } = require('./helpers/chromeMock');

const COLOR = '#FFEB3B';
const { HIGHLIGHT_ATTR } = Content;

function setReadyState(value) {
  Object.defineProperty(document, 'readyState', { value, configurable: true });
}

function settings(overrides = {}) {
  return {
    highlightEnabled: true,
    highlightColor: COLOR,
    blockedDomains: '',
    ...overrides,
  };
}

function marksHighlighted() {
  return [...document.querySelectorAll('mark')].filter(
    (el) => el.getAttribute(HIGHLIGHT_ATTR) === '1',
  );
}

beforeEach(() => {
  document.body.innerHTML = '<mark id="m1">one</mark><p id="p1">plain</p><mark id="m2">two</mark>';
  self.ExtSettings = ExtSettings;
  setReadyState('complete');
});

afterEach(() => {
  delete global.chrome;
  delete self.ExtSettings;
  jest.restoreAllMocks();
});

describe('content.js — highlight gate (run)', () => {
  test('highlights every <mark> when enabled and host not blocked', () => {
    const hl = Content.createHighlighter();
    hl.run(settings(), 'example.com');

    const lit = marksHighlighted();
    expect(lit).toHaveLength(2);
    expect(hl.isActive()).toBe(true);
    expect(document.getElementById('m1').style.background).toBeTruthy();
    // Only <mark> got painted — the <p> is untouched.
    expect(document.getElementById('p1').getAttribute(HIGHLIGHT_ATTR)).toBeNull();
  });

  test('BAIL-OUT: does nothing when highlightEnabled is false', () => {
    const hl = Content.createHighlighter();
    hl.run(settings({ highlightEnabled: false }), 'example.com');

    expect(marksHighlighted()).toHaveLength(0);
    expect(hl.isActive()).toBe(false);
  });

  test('BAIL-OUT: does nothing when the current host is blocklisted', () => {
    const hl = Content.createHighlighter();
    hl.run(settings({ blockedDomains: 'example.com' }), 'blocked.example.com');

    expect(marksHighlighted()).toHaveLength(0);
    expect(hl.isActive()).toBe(false);
  });

  test('runs on a sibling host that is NOT a subdomain of a blocked entry', () => {
    const hl = Content.createHighlighter();
    // notexample.com must NOT be treated as blocked by example.com.
    hl.run(settings({ blockedDomains: 'example.com' }), 'notexample.com');

    expect(marksHighlighted()).toHaveLength(2);
  });

  test('removes existing highlights when a later run flips to a bail-out state', () => {
    const hl = Content.createHighlighter();
    hl.run(settings(), 'example.com');
    expect(marksHighlighted()).toHaveLength(2);

    // Settings change: highlighting turned off → highlights must be stripped.
    hl.run(settings({ highlightEnabled: false }), 'example.com');
    expect(marksHighlighted()).toHaveLength(0);
    expect(document.getElementById('m1').style.background).toBe('');
  });

  test('repaints existing highlights when the configured color changes', () => {
    const hl = Content.createHighlighter();
    hl.run(settings(), 'example.com');
    expect(document.getElementById('m1').style.background).toBeTruthy();

    hl.run(settings({ highlightColor: '#00ff88' }), 'example.com');

    expect(marksHighlighted()).toHaveLength(2);
    expect(document.getElementById('m1').style.background).toMatch(/rgb\(0,\s*255,\s*136\)|#00ff88/i);
  });

  test('defers painting until DOMContentLoaded when document is still loading', () => {
    setReadyState('loading');
    const hl = Content.createHighlighter();
    hl.run(settings(), 'example.com');

    // Nothing painted yet — it is queued for DOMContentLoaded.
    expect(marksHighlighted()).toHaveLength(0);

    document.dispatchEvent(new window.Event('DOMContentLoaded'));
    expect(marksHighlighted()).toHaveLength(2);
  });
});

describe('content.js — bootstrap wiring (getSettings + storage.onChanged)', () => {
  test('paints on initial load using stored settings', async () => {
    const ctl = makeChrome({ initial: settings() });
    global.chrome = ctl.chrome;

    Content.bootstrap();
    await Promise.resolve();
    await Promise.resolve();

    expect(marksHighlighted()).toHaveLength(2);
  });

  test('strips highlights when storage flips highlightEnabled to false', async () => {
    const ctl = makeChrome({ initial: settings() });
    global.chrome = ctl.chrome;

    Content.bootstrap();
    await Promise.resolve();
    await Promise.resolve();
    expect(marksHighlighted()).toHaveLength(2);

    // User disables highlighting → storage.set fires onChanged → re-run strips.
    ctl.chrome.storage.sync.set({ highlightEnabled: false }, () => {});
    await Promise.resolve();
    await Promise.resolve();

    expect(marksHighlighted()).toHaveLength(0);
  });

  test('ignores changes from a non-sync storage area', async () => {
    const ctl = makeChrome({ initial: settings() });
    global.chrome = ctl.chrome;

    Content.bootstrap();
    await Promise.resolve();
    await Promise.resolve();
    expect(marksHighlighted()).toHaveLength(2);

    // A 'local' area change must be ignored (areaName guard).
    ctl.fireChanged({ highlightEnabled: { newValue: false } }, 'local');
    await Promise.resolve();
    await Promise.resolve();

    expect(marksHighlighted()).toHaveLength(2);
  });

  test('logs (without throwing) when initial getSettings rejects', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const ctl = makeChrome({ getError: 'STORAGE_READ_FAILED' });
    global.chrome = ctl.chrome;

    expect(() => Content.bootstrap()).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();

    expect(errorSpy).toHaveBeenCalledWith(
      'Highlight content script failed to load settings:',
      'STORAGE_READ_FAILED',
    );
    expect(marksHighlighted()).toHaveLength(0);
  });
});
