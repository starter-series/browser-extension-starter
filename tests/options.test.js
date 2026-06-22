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

const OPTIONS_HTML = fs.readFileSync(
  path.join(__dirname, '..', 'src', 'options', 'options.html'),
  'utf8',
);

async function loadOptions() {
  jest.isolateModules(() => {
    require('../src/options/options.js');
  });
  document.dispatchEvent(new window.Event('DOMContentLoaded'));
  await Promise.resolve();
  await Promise.resolve();
}

function renderOptionsHtml() {
  const parsed = new window.DOMParser().parseFromString(OPTIONS_HTML, 'text/html');
  document.head.innerHTML = parsed.head.innerHTML;
  document.body.innerHTML = parsed.body.innerHTML;
}

function installChrome(chrome) {
  global.chrome = chrome;
  window.chrome = chrome;
}

function submitForm() {
  document
    .getElementById('settings-form')
    .dispatchEvent(new window.Event('submit', { cancelable: true }));
}

let errorSpy;

beforeEach(() => {
  jest.resetModules();
  jest.useFakeTimers();
  renderOptionsHtml();
  self.ExtSettings = ExtSettings;
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  errorSpy.mockRestore();
  delete global.chrome;
  delete window.chrome;
  delete self.ExtSettings;
  jest.restoreAllMocks();
});

describe('options.js — load path', () => {
  test('ships the expected first-open options form in the real HTML', () => {
    expect(document.querySelector('h1').textContent).toBe('Settings');
    expect(document.getElementById('settings-form')).not.toBeNull();
    expect(document.getElementById('highlightEnabled')).not.toBeNull();
    expect(document.getElementById('highlightColor')).not.toBeNull();
    expect(document.getElementById('blockedDomains')).not.toBeNull();
    expect(document.getElementById('status').getAttribute('aria-live')).toBe('polite');
    expect(document.getElementById('save').textContent).toBe('Save');
  });

  test('populates the form from stored settings', async () => {
    const { chrome } = makeChrome({
      initial: {
        highlightEnabled: false,
        highlightColor: '#123abc',
        blockedDomains: 'example.com',
      },
    });
    installChrome(chrome);

    await loadOptions();

    expect(document.getElementById('highlightEnabled').checked).toBe(false);
    expect(document.getElementById('highlightColor').value).toBe('#123abc');
    expect(document.getElementById('blockedDomains').value).toBe('example.com');
  });

  test('shows a load error in the aria-live status when settings cannot load', async () => {
    const { chrome } = makeChrome({ getError: 'STORAGE_READ_FAILED' });
    installChrome(chrome);

    await loadOptions();

    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to load settings:',
      'STORAGE_READ_FAILED',
    );
    expect(document.getElementById('status').textContent).toBe('Failed to load settings.');
    expect(document.getElementById('status').className).toBe('status err');
  });
});

describe('options.js — save path', () => {
  test('blocks save and shows an error when the color is invalid', async () => {
    const { chrome, store } = makeChrome({ initial: {} });
    installChrome(chrome);
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
    installChrome(chrome);
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

  test('keeps save non-fatal when blocked-domain lines are invalid and reports what was ignored', async () => {
    const { chrome, store } = makeChrome({ initial: {} });
    installChrome(chrome);
    await loadOptions();

    document.getElementById('highlightColor').value = '#abcdef';
    document.getElementById('blockedDomains').value = 'example.com\nnot a domain';
    submitForm();

    expect(store.blockedDomains).toBe('example.com\nnot a domain');
    expect(document.getElementById('blockedDomains').getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById('blockedDomains-error').textContent).toMatch(/not a domain/);
    expect(document.getElementById('status').textContent).toBe('Saved');
  });

  test('SAVE-FAILURE PATH: lastError on set surfaces an error and does NOT report Saved', async () => {
    const { chrome } = makeChrome({
      initial: {},
      setError: 'QUOTA_BYTES_PER_ITEM',
    });
    installChrome(chrome);
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
