/*
 * Content script.
 *
 * Loads settings from chrome.storage.sync via the shared helper, bails out
 * when the extension is disabled or the host is blocklisted, and applies
 * a minimal highlight to <mark> elements. Reacts live to setting changes.
 */
(() => {
  const { getSettings, isHostBlocked, coerce } = self.ExtSettings;

  const HIGHLIGHT_ATTR = 'data-starter-highlight';
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

  function run(settings) {
    if (chrome.runtime.lastError) {
      console.error('Highlight content script storage error:', chrome.runtime.lastError.message);
      return;
    }
    const host = location.hostname;
    const shouldRun = settings.highlightEnabled && !isHostBlocked(host, settings.blockedDomains);

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

  getSettings()
    .then(run)
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
        run(coerce(fresh));
      })
      .catch((err) => console.error('Highlight content script change-handler failed:', err.message));
    void changes;
  });
})();
