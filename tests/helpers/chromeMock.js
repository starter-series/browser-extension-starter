/**
 * Behavioral chrome.* mock for runtime-file tests.
 *
 * This is NOT a structural stub — it actually models chrome.storage.sync
 * (an in-memory store with get/set callbacks) and chrome.runtime.lastError
 * the way Chrome does: lastError is set *only* for the duration of the
 * callback, then cleared. That lets tests exercise the real success and
 * failure branches of the runtime files (popup/options/content/background)
 * instead of grepping their source.
 *
 * Usage:
 *   const { chrome, store } = makeChrome({ initial: { highlightEnabled: false } });
 *   global.chrome = chrome;
 *   // ...load the script under test, then assert on DOM / store / console.
 */
function makeChrome({ initial = {}, getError = null, setError = null } = {}) {
  const store = { ...initial };

  // Listener registries so tests can fire onInstalled / onChanged.
  const onChangedListeners = [];
  const onInstalledListeners = [];

  // chrome.runtime.lastError is a getter that is non-null only while a
  // storage callback that "failed" is executing. We flip a private flag
  // around each callback invocation to mimic that lifetime exactly.
  let activeError = null;
  const runtime = {
    get lastError() {
      return activeError;
    },
    onInstalled: {
      addListener(fn) {
        onInstalledListeners.push(fn);
      },
    },
  };

  function invokeWithError(errMessage, callback, arg) {
    // Replicate Chrome semantics: lastError is readable inside the callback
    // and undefined/null everywhere else. We set it, run the callback, then
    // clear it synchronously after the callback returns.
    activeError = errMessage ? { message: errMessage } : null;
    try {
      callback(arg);
    } finally {
      activeError = null;
    }
  }

  const storage = {
    sync: {
      get(keys, callback) {
        if (getError) {
          invokeWithError(getError, callback, {});
          return;
        }
        const keyList = Array.isArray(keys)
          ? keys
          : (keys && typeof keys === 'object' ? Object.keys(keys) : [keys]);
        const defaults = (keys && typeof keys === 'object' && !Array.isArray(keys))
          ? keys
          : {};
        const out = {};
        for (const k of keyList) {
          if (k in store) {
            out[k] = store[k];
          } else if (k in defaults) {
            // chrome.storage.sync.get({key: default}) returns the default
            // for missing keys — model that so popup's get({highlightEnabled:true})
            // behaves like the real API.
            out[k] = defaults[k];
          }
        }
        invokeWithError(null, callback, out);
      },
      set(items, callback) {
        if (setError) {
          // On failure Chrome does NOT mutate the store.
          if (callback) invokeWithError(setError, callback, undefined);
          return;
        }
        Object.assign(store, items);
        const changes = {};
        for (const [k, v] of Object.entries(items)) {
          changes[k] = { newValue: v };
        }
        if (callback) invokeWithError(null, callback, undefined);
        // Fire onChanged like the real API does after a successful set.
        onChangedListeners.forEach((fn) => fn(changes, 'sync'));
      },
    },
    onChanged: {
      addListener(fn) {
        onChangedListeners.push(fn);
      },
    },
  };

  const chrome = { runtime, storage };

  return {
    chrome,
    store,
    fireInstalled(details) {
      onInstalledListeners.forEach((fn) => fn(details));
    },
    fireChanged(changes, areaName) {
      onChangedListeners.forEach((fn) => fn(changes, areaName));
    },
    _listenerCounts() {
      return {
        onChanged: onChangedListeners.length,
        onInstalled: onInstalledListeners.length,
      };
    },
  };
}

module.exports = { makeChrome };
