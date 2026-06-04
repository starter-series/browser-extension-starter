/**
 * @jest-environment jsdom
 *
 * Behavioral tests for src/options/options.js — real DOM + behavioral chrome
 * mock + real settings helper. Covers the load path, color validation
 * blocking a save, a successful save, and the SAVE-FAILURE path where
 * chrome.storage.sync.set raises lastError (must surface an error status and
 * not claim success).
 */
const fs = require('fs');
const path = require('path');
const { makeChrome } = require('./helpers/chromeMock');
const ExtSettings = require('../src/settings');

const OPTIONS_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'options', 'options.js'),
  'utf8',
);

// The subset of options.html that options.js queries by id.
const OPTIONS_DOM = `
  <form id="settings-form" novalidate>
    <input type="checkbox" id="highlightEnabled">
    <span class="color-preview" id="colorPreview"></span>
    <input type="text" id="highlightColor">
    <span class="error" id="highlightColor-error"></span>
    <textarea id="blockedDomains"></textarea>
    <span class="error" id="blockedDomains-error"></span>
    <button type="submit" id="save">Save</button>
    <span class="status" id="status"></span>
  </form>
`;

async function loadOptions() {
  // eslint-disable-next-line no-new-func
  new Function(OPTIONS_SRC)();
  document.dispatchEvent(new window.Event('DOMContentLoaded'));
  await Promise.resolve();
  await Promise.resolve();
}

function submitForm() {
  document
    .getElementById('settings-form')
    .dispatchEvent(new window.Event('submit', { cancelable: true }));
}

let errorSpy;

beforeEach(() => {
  jest.useFakeTimers();
  document.body.innerHTML = OPTIONS_DOM;
  self.ExtSettings = ExtSettings;
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  errorSpy.mockRestore();
  delete global.chrome;
  delete self.ExtSettings;
  jest.restoreAllMocks();
});

describe('options.js — load path', () => {
  test('populates the form from stored settings', async () => {
    const { chrome } = makeChrome({
      initial: {
        highlightEnabled: false,
        highlightColor: '#123abc',
        blockedDomains: 'example.com',
      },
    });
    global.chrome = chrome;

    await loadOptions();

    expect(document.getElementById('highlightEnabled').checked).toBe(false);
    expect(document.getElementById('highlightColor').value).toBe('#123abc');
    expect(document.getElementById('blockedDomains').value).toBe('example.com');
  });
});

describe('options.js — save path', () => {
  test('blocks save and shows an error when the color is invalid', async () => {
    const { chrome, store } = makeChrome({ initial: {} });
    global.chrome = chrome;
    await loadOptions();

    document.getElementById('highlightColor').value = 'not-a-color';
    submitForm();

    // Validation failed → nothing persisted, error status shown.
    expect(store.highlightColor).toBeUndefined();
    expect(document.getElementById('status').textContent).toMatch(/fix/i);
    expect(document.getElementById('highlightColor').getAttribute('aria-invalid')).toBe('true');
  });

  test('persists a valid payload and reports success', async () => {
    const { chrome, store } = makeChrome({ initial: {} });
    global.chrome = chrome;
    await loadOptions();

    document.getElementById('highlightEnabled').checked = true;
    document.getElementById('highlightColor').value = '#abcdef';
    document.getElementById('blockedDomains').value = 'foo.com';
    submitForm();

    expect(store).toMatchObject({
      highlightEnabled: true,
      highlightColor: '#abcdef',
      blockedDomains: 'foo.com',
    });
    expect(document.getElementById('status').textContent).toBe('Saved');
  });

  test('SAVE-FAILURE PATH: lastError on set surfaces an error and does NOT report Saved', async () => {
    const { chrome } = makeChrome({
      initial: {},
      setError: 'QUOTA_BYTES_PER_ITEM',
    });
    global.chrome = chrome;
    await loadOptions();

    document.getElementById('highlightColor').value = '#abcdef';
    submitForm();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to save settings:',
      'QUOTA_BYTES_PER_ITEM',
    );
    const status = document.getElementById('status');
    expect(status.textContent).toMatch(/Save failed/);
    expect(status.textContent).not.toBe('Saved');
  });
});
