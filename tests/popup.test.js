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
const fs = require('fs');
const path = require('path');
const { makeChrome } = require('./helpers/chromeMock');

const POPUP_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'popup', 'popup.js'),
  'utf8',
);

// Minimal DOM mirroring the live nodes popup.js touches in popup.html.
const POPUP_DOM = `
  <input type="checkbox" id="toggle" checked>
  <div class="status active" id="status">Active</div>
`;

/**
 * Load popup.js fresh against the current document + global.chrome, then
 * fire DOMContentLoaded so the IIFE's handler runs. Returning a function and
 * eval-ing per test avoids require() caching the IIFE's single execution.
 */
function loadPopup() {
  // eslint-disable-next-line no-new-func
  new Function(POPUP_SRC)();
  document.dispatchEvent(new window.Event('DOMContentLoaded'));
}

let errorSpy;

beforeEach(() => {
  document.body.innerHTML = POPUP_DOM;
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
  delete global.chrome;
  jest.restoreAllMocks();
});

describe('popup.js — load path', () => {
  test('reflects a stored disabled state into the toggle and status', () => {
    const { chrome } = makeChrome({ initial: { highlightEnabled: false } });
    global.chrome = chrome;

    loadPopup();

    const toggle = document.getElementById('toggle');
    const status = document.getElementById('status');
    expect(toggle.checked).toBe(false);
    expect(status.textContent).toBe('Inactive');
    expect(status.className).toBe('status inactive');
  });

  test('defaults to enabled when storage is empty (uses get default)', () => {
    const { chrome } = makeChrome({ initial: {} });
    global.chrome = chrome;

    loadPopup();

    expect(document.getElementById('toggle').checked).toBe(true);
    expect(document.getElementById('status').textContent).toBe('Active');
  });

  test('handles a load-time lastError without throwing and logs it', () => {
    const { chrome } = makeChrome({ getError: 'STORAGE_READ_FAILED' });
    global.chrome = chrome;

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
    global.chrome = chrome;
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
    global.chrome = chrome;
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
