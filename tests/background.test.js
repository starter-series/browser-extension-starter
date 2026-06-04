/**
 * Behavioral tests for src/background/background.js.
 *
 * No DOM needed — the service worker only talks to chrome.runtime and
 * chrome.storage. The module is loaded via require() inside jest.isolateModules
 * (so it runs fresh per test AND is instrumented for coverage). We drive its
 * onInstalled listener with a behavioral chrome mock and assert real seeding:
 * seed only missing defaults, skip on non-install reasons, handle storage
 * lastError without throwing.
 */
const { makeChrome } = require('./helpers/chromeMock');

const BG_PATH = '../src/background/background';

/**
 * Set up the chrome mock as the global, then load background.js fresh so its
 * top-level chrome.runtime.onInstalled.addListener(...) runs against it.
 */
function loadBackground(ctl) {
  global.chrome = ctl.chrome;
  jest.isolateModules(() => {
    // eslint-disable-next-line global-require
    require(BG_PATH);
  });
}

let errorSpy;
let logSpy;

beforeEach(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  delete global.chrome;
  jest.restoreAllMocks();
});

describe('background.js — onInstalled seeding', () => {
  test('seeds all defaults into empty storage on fresh install', () => {
    const ctl = makeChrome({ initial: {} });
    loadBackground(ctl);

    ctl.fireInstalled({ reason: 'install' });

    expect(ctl.store).toEqual({
      highlightEnabled: true,
      highlightColor: '#FFEB3B',
      blockedDomains: '',
    });
    expect(logSpy).toHaveBeenCalled();
  });

  test('only fills MISSING keys, leaving existing user values intact', () => {
    const ctl = makeChrome({ initial: { highlightColor: '#000000' } });
    loadBackground(ctl);

    ctl.fireInstalled({ reason: 'install' });

    expect(ctl.store.highlightColor).toBe('#000000'); // preserved
    expect(ctl.store.highlightEnabled).toBe(true); // filled
    expect(ctl.store.blockedDomains).toBe(''); // filled
  });

  test('seeds nothing when all keys are already present', () => {
    const ctl = makeChrome({
      initial: { highlightEnabled: false, highlightColor: '#abcdef', blockedDomains: 'x.com' },
    });
    loadBackground(ctl);

    ctl.fireInstalled({ reason: 'install' });

    // Untouched user values.
    expect(ctl.store).toEqual({
      highlightEnabled: false,
      highlightColor: '#abcdef',
      blockedDomains: 'x.com',
    });
  });

  test('does NOT seed on a non-install reason (e.g. update)', () => {
    const ctl = makeChrome({ initial: {} });
    loadBackground(ctl);

    ctl.fireInstalled({ reason: 'update' });

    expect(ctl.store).toEqual({});
  });

  test('handles a storage read lastError without throwing and logs it', () => {
    const ctl = makeChrome({ initial: {}, getError: 'STORAGE_READ_FAILED' });
    loadBackground(ctl);

    expect(() => ctl.fireInstalled({ reason: 'install' })).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(
      'background: failed to read storage:',
      'STORAGE_READ_FAILED',
    );
    expect(ctl.store).toEqual({}); // nothing seeded after a failed read
  });

  test('handles a storage write lastError without throwing and logs it', () => {
    const ctl = makeChrome({ initial: {}, setError: 'QUOTA_BYTES' });
    loadBackground(ctl);

    expect(() => ctl.fireInstalled({ reason: 'install' })).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(
      'background: failed to seed defaults:',
      'QUOTA_BYTES',
    );
  });
});
