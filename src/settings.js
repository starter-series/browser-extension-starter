/* global module */
/*
 * Shared settings helper.
 *
 * Used by: options page, content script, background service worker, and tests.
 *
 * Why UMD and not ESM? Extension classic scripts (content scripts, MV3
 * service workers loaded as classic, options pages) can't import ESM
 * without `type="module"` gymnastics and web_accessible_resources. A tiny
 * UMD wrapper keeps this file usable everywhere with zero build step.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ExtSettings = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  const DEFAULTS = Object.freeze({
    highlightEnabled: true,
    highlightColor: '#FFEB3B',
    blockedDomains: '',
  });

  const HEX_COLOR_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
  // Accepts plain host labels like `example.com` or `sub.example.co.kr`.
  // Deliberately conservative — port numbers, schemes, and paths are rejected.
  const DOMAIN_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

  function isValidColor(value) {
    return typeof value === 'string' && HEX_COLOR_RE.test(value);
  }

  function parseBlockedDomains(raw) {
    if (typeof raw !== 'string') return [];
    return raw
      .split(/\r?\n/)
      .map((line) => line.trim().toLowerCase())
      .filter((line) => line.length > 0 && DOMAIN_RE.test(line));
  }

  function coerce(stored) {
    const merged = { ...DEFAULTS, ...(stored || {}) };
    merged.highlightEnabled = merged.highlightEnabled !== false;
    merged.highlightColor = isValidColor(merged.highlightColor)
      ? merged.highlightColor
      : DEFAULTS.highlightColor;
    merged.blockedDomains = typeof merged.blockedDomains === 'string'
      ? merged.blockedDomains
      : DEFAULTS.blockedDomains;
    return merged;
  }

  function getSettings(storage) {
    // Allow dependency injection for tests. In the extension runtime we
    // default to chrome.storage.sync, which is the store that roams with
    // the user's browser profile (8 KB per item, 100 KB total in Chrome).
    const area = storage
      || (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync)
      || null;

    if (!area) {
      return Promise.resolve({ ...DEFAULTS });
    }

    return new Promise((resolve, reject) => {
      try {
        area.get(Object.keys(DEFAULTS), (items) => {
          const lastError = typeof chrome !== 'undefined'
            && chrome.runtime
            && chrome.runtime.lastError;
          if (lastError) {
            reject(new Error(lastError.message || 'storage.get failed'));
            return;
          }
          resolve(coerce(items));
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  function isHostBlocked(host, blockedDomainsRaw) {
    if (!host) return false;
    const h = host.toLowerCase();
    const blocked = parseBlockedDomains(blockedDomainsRaw);
    return blocked.some((d) => h === d || h.endsWith('.' + d));
  }

  return {
    DEFAULTS,
    HEX_COLOR_RE,
    DOMAIN_RE,
    isValidColor,
    parseBlockedDomains,
    coerce,
    getSettings,
    isHostBlocked,
  };
}));
