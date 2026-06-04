/* global module, require */
/*
 * Content script.
 *
 * Loads settings from chrome.storage.sync via the shared helper, bails out
 * when the extension is disabled or the host is blocklisted, and applies
 * a minimal highlight to <mark> elements. Reacts live to setting changes.
 *
 * Structure: the DOM/gate logic lives in a factory (createHighlighter) so it
 * can be unit-tested under jsdom with a real document and an injectable host.
 * The browser entry point at the bottom wires it to chrome.* and self-invokes.
 * Under Node/Jest (module.exports present) we export the factory instead, so
 * tests `require()` this file directly — keeping coverage instrumentation.
 */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) {
    // Test / Node context: export the testable internals.
    module.exports = api;
  } else {
    // Browser content-script context: bootstrap immediately.
    api.bootstrap();
  }
}(typeof self !== 'undefined' ? self : this, function (root) {
  const HIGHLIGHT_ATTR = 'data-starter-highlight';

  // The shared settings helper. In the browser this is set on `self` by the
  // settings.js classic script loaded before us; in tests we require it.
  function getExtSettings() {
    if (root && root.ExtSettings) return root.ExtSettings;
    return require('../settings');
  }

  function createHighlighter() {
    let active = false;
    let currentColor = null;

    function applyHighlight(color) {
      // Minimal behavior: paint any <mark> element with the configured color.
      // Intentionally tiny — this is a settings-flow demo, not a feature.
      const marks = document.querySelectorAll('mark:not([' + HIGHLIGHT_ATTR + '])');
      marks.forEach((el) => {
        el.setAttribute(HIGHLIGHT_ATTR, '1');
        el.style.background = color;
      });
    }

    function removeHighlight() {
      document.querySelectorAll('[' + HIGHLIGHT_ATTR + ']').forEach((el) => {
        el.removeAttribute(HIGHLIGHT_ATTR);
        el.style.background = '';
      });
    }

    // run(settings, host): host defaults to the live location so the browser
    // bootstrap stays a no-arg call; tests pass an explicit host string.
    //
    // No chrome.runtime.lastError check here: run() is only ever reached via
    // getSettings(), which already rejects on chrome.runtime.lastError (see
    // settings.js). The bootstrap's .catch() handlers surface any storage
    // failure. A guard here would be dead code.
    function run(settings, host) {
      const { isHostBlocked } = getExtSettings();
      const effectiveHost = host !== undefined
        ? host
        : (typeof location !== 'undefined' ? location.hostname : '');
      const shouldRun = settings.highlightEnabled
        && !isHostBlocked(effectiveHost, settings.blockedDomains);

      if (!shouldRun) {
        if (active) removeHighlight();
        active = false;
        currentColor = null;
        return;
      }

      active = true;
      currentColor = settings.highlightColor;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyHighlight(currentColor), { once: true });
      } else {
        applyHighlight(currentColor);
      }
    }

    return {
      run,
      applyHighlight,
      removeHighlight,
      isActive: () => active,
    };
  }

  // Browser entry point: build a highlighter, load settings, react to changes.
  function bootstrap() {
    const { getSettings, coerce } = getExtSettings();
    const hl = createHighlighter();

    getSettings()
      .then((settings) => hl.run(settings))
      .catch((err) => console.error('Highlight content script failed to load settings:', err.message));

    // Live-update: when the options page writes new values, content scripts
    // running in already-open tabs pick them up without a reload.
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== 'sync') return;
      // Merge the delta with current storage, then re-run.
      getSettings()
        .then((fresh) => {
          // coerce() is idempotent; guards against race conditions where
          // another writer stored a malformed value we haven't caught yet.
          hl.run(coerce(fresh));
        })
        .catch((err) => console.error('Highlight content script change-handler failed:', err.message));
      void changes;
    });

    return hl;
  }

  return { createHighlighter, bootstrap, HIGHLIGHT_ATTR };
}));
