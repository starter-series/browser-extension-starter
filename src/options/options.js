/*
 * Options page controller.
 *
 * Loads settings on DOMContentLoaded via the shared ExtSettings helper,
 * validates the form inputs, and persists to chrome.storage.sync.
 *
 * All error reporting goes through console.error (surfaces in the Options
 * page devtools) plus an inline aria-live status region for sighted and
 * screen-reader users.
 */
(() => {
  const { DEFAULTS, HEX_COLOR_RE, parseBlockedDomains, getSettings } = self.ExtSettings;

  const STATUS_TIMEOUT_MS = 1800;

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('settings-form');
    const enabled = document.getElementById('highlightEnabled');
    const color = document.getElementById('highlightColor');
    const colorPreview = document.getElementById('colorPreview');
    const domains = document.getElementById('blockedDomains');
    const status = document.getElementById('status');
    const colorError = document.getElementById('highlightColor-error');
    const domainsError = document.getElementById('blockedDomains-error');

    let statusTimer;

    getSettings()
      .then((settings) => {
        enabled.checked = settings.highlightEnabled;
        color.value = settings.highlightColor;
        domains.value = settings.blockedDomains;
        updatePreview();
      })
      .catch((err) => {
        console.error('Failed to load settings:', err.message);
        showStatus('Failed to load settings.', 'err');
      });

    color.addEventListener('input', updatePreview);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      save();
    });

    function updatePreview() {
      const v = color.value.trim();
      if (HEX_COLOR_RE.test(v)) {
        colorPreview.style.background = v;
        color.setAttribute('aria-invalid', 'false');
        colorError.textContent = '';
      } else {
        colorPreview.style.background = 'transparent';
      }
    }

    function validate() {
      let ok = true;

      const colorValue = color.value.trim();
      if (!HEX_COLOR_RE.test(colorValue)) {
        color.setAttribute('aria-invalid', 'true');
        colorError.textContent = 'Must be a hex color like #FFEB3B.';
        ok = false;
      } else {
        color.setAttribute('aria-invalid', 'false');
        colorError.textContent = '';
      }

      // Parse domains and report any lines that were rejected. We still
      // persist — parseBlockedDomains strips invalid lines — but we tell
      // the user which lines were dropped so they can correct them.
      const raw = domains.value;
      const rawLines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const kept = new Set(parseBlockedDomains(raw));
      const rejected = rawLines.filter((l) => !kept.has(l.toLowerCase()));
      if (rejected.length) {
        domains.setAttribute('aria-invalid', 'true');
        domainsError.textContent = 'Invalid domain(s) will be ignored: '
          + rejected.slice(0, 3).join(', ')
          + (rejected.length > 3 ? ` (+${rejected.length - 3} more)` : '');
        // Non-fatal: we still allow save. Invalid lines get coerced out.
      } else {
        domains.setAttribute('aria-invalid', 'false');
        domainsError.textContent = '';
      }

      return ok;
    }

    function save() {
      if (!validate()) {
        showStatus('Please fix the highlighted field.', 'err');
        return;
      }

      const payload = {
        highlightEnabled: !!enabled.checked,
        highlightColor: color.value.trim(),
        blockedDomains: domains.value,
      };

      chrome.storage.sync.set(payload, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to save settings:', chrome.runtime.lastError.message);
          showStatus('Save failed: ' + chrome.runtime.lastError.message, 'err');
          return;
        }
        showStatus('Saved', 'ok');
      });
    }

    function showStatus(text, kind) {
      status.textContent = text;
      status.className = 'status ' + (kind || '');
      clearTimeout(statusTimer);
      if (kind === 'ok') {
        statusTimer = setTimeout(() => {
          status.textContent = '';
          status.className = 'status';
        }, STATUS_TIMEOUT_MS);
      }
    }

    // Defensive: fall back to DEFAULTS on the form if the settings helper
    // hasn't resolved by the time the user interacts. Prevents `undefined`
    // appearing in input boxes during a cold load.
    if (!color.value) color.value = DEFAULTS.highlightColor;
    if (!enabled.checked && !enabled.dataset.touched) enabled.checked = DEFAULTS.highlightEnabled;
  });
})();
