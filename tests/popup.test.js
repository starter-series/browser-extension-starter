/**
 * @jest-environment jsdom
 *
 * Behavioral tests for src/popup/popup.js.
 *
 * These exercise the actual code paths in a real DOM (jsdom) with a
 * behavioral chrome mock — NOT source greps. The save-failure path is the
 * one the audit flagged: when chrome.storage.sync.set triggers
 * chrome.runtime.lastError, popup.js must log the error and must NOT report
 * success. If someone deletes that lastError guard, these tests fail.
 */
const path = require('path');
const fs = require('fs');
const { makeChrome } = require('./helpers/chromeMock');

const POPUP_HTML = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'popup', 'popup.html'),
  'utf8',
);

/**
 * Load the real popup document and popup.js fresh against the current
 * document + global.chrome, then fire DOMContentLoaded so the controller runs.
 */
function loadPopup() {
  jest.isolateModules(() => {
    require('../src/popup/popup.js');
  });
  document.dispatchEvent(new window.Event('DOMContentLoaded'));
}

function renderPopupHtml() {
  const parsed = new window.DOMParser().parseFromString(POPUP_HTML, 'text/html');
  document.head.innerHTML = parsed.head.innerHTML;
  document.body.innerHTML = parsed.body.innerHTML;
}

function installChrome(chrome) {
  global.chrome = chrome;
  window.chrome = chrome;
}

let errorSpy;

beforeEach(() => {
  jest.resetModules();
  renderPopupHtml();
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
  delete global.chrome;
  delete window.chrome;
  jest.restoreAllMocks();
});

describe('popup.js — load path', () => {
  test('ships the expected first-open popup controls in the real HTML', () => {
    expect(document.querySelector('h1').textContent).toBe('My Extension');
    expect(document.querySelector('.description').textContent).toMatch(/running/i);
    expect(document.getElementById('toggle')).not.toBeNull();
    expect(document.getElementById('toggle').checked).toBe(true);
    expect(document.querySelector('.toggle-label').textContent).toBe('Enable extension');
    expect(document.getElementById('status').textContent).toBe('Active');
  });

  test('reflects a stored disabled state into the toggle and status', () => {
    const { chrome } = makeChrome({ initial: { highlightEnabled: false } });
    installChrome(chrome);

    loadPopup();

    const toggle = document.getElementById('toggle');
    const status = document.getElementById('status');
    expect(toggle.checked).toBe(false);
    expect(status.textContent).toBe('Inactive');
    expect(status.className).toBe('status inactive');
  });

  test('defaults to enabled when storage is empty (uses get default)', () => {
    const { chrome } = makeChrome({ initial: {} });
    installChrome(chrome);

    loadPopup();

    expect(document.getElementById('toggle').checked).toBe(true);
    expect(document.getElementById('status').textContent).toBe('Active');
  });

  test('handles a load-time lastError without throwing and logs it', () => {
    const { chrome } = makeChrome({ getError: 'STORAGE_READ_FAILED' });
    installChrome(chrome);

    expect(() => loadPopup()).not.toThrow();
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to load settings:',
      'STORAGE_READ_FAILED',
    );
  });
});

describe('popup.js — toggle save path', () => {
  test('persists the new value and updates status on success', () => {
    const { chrome, store } = makeChrome({ initial: { highlightEnabled: true } });
    installChrome(chrome);
    loadPopup();

    const toggle = document.getElementById('toggle');
    toggle.checked = false;
    toggle.dispatchEvent(new window.Event('change'));

    expect(store.highlightEnabled).toBe(false);
    expect(document.getElementById('status').textContent).toBe('Inactive');
  });

  test('SAVE-FAILURE PATH: lastError on set is handled — error logged and status NOT marked Active', () => {
    // Start disabled so the visible status is "Inactive"; the user flips the
    // toggle ON, but the write fails. A correct handler logs the error and
    // leaves the status unchanged (NOT "Active"). If the lastError guard in
    // the set() callback is removed, updateStatus() runs and this fails.
    const { chrome, store } = makeChrome({
      initial: { highlightEnabled: false },
      setError: 'QUOTA_BYTES_PER_ITEM',
    });
    installChrome(chrome);
    loadPopup();

    const status = document.getElementById('status');
    expect(status.textContent).toBe('Inactive'); // loaded state

    const toggle = document.getElementById('toggle');
    toggle.checked = true;
    toggle.dispatchEvent(new window.Event('change'));

    // The error must surface...
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to save setting:',
      'QUOTA_BYTES_PER_ITEM',
    );
    // ...the store must be untouched (set failed)...
    expect(store.highlightEnabled).toBe(false);
    // ...and the UI must NOT have been switched to the success ("Active")
    // state. updateStatus(true) would have produced 'status active'; the
    // failure path must leave the loaded 'status inactive' untouched.
    expect(status.textContent).toBe('Inactive');
    expect(status.className).toBe('status inactive');
    expect(status.className).not.toBe('status active');
  });
});
