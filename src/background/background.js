/*
 * Background service worker.
 *
 * On fresh install, seed chrome.storage.sync with defaults so the options
 * page and content script have something to read even before the user
 * opens the options page. On update, we leave existing settings alone.
 */

// Keep these in sync with src/settings.js DEFAULTS. We don't import the
// module here because MV3 service workers load as classic scripts and
// importScripts() in Firefox service workers is still partial — inlining
// is simpler and the defaults rarely change.
const DEFAULTS = {
  highlightEnabled: true,
  highlightColor: '#FFEB3B',
  blockedDomains: '',
};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason !== 'install') return;

  chrome.storage.sync.get(Object.keys(DEFAULTS), (stored) => {
    if (chrome.runtime.lastError) {
      console.error('background: failed to read storage:', chrome.runtime.lastError.message);
      return;
    }
    const missing = {};
    for (const [k, v] of Object.entries(DEFAULTS)) {
      if (stored[k] === undefined) missing[k] = v;
    }
    if (!Object.keys(missing).length) {
      console.log('Extension installed (settings already present from sync)');
      return;
    }
    chrome.storage.sync.set(missing, () => {
      if (chrome.runtime.lastError) {
        console.error('background: failed to seed defaults:', chrome.runtime.lastError.message);
        return;
      }
      console.log('Extension installed, defaults seeded:', Object.keys(missing).join(', '));
    });
  });
});
