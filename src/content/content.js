(() => {
  chrome.storage.local.get(['enabled'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Failed to access storage:', chrome.runtime.lastError.message);
      return;
    }
    if (result.enabled !== false) {
      console.log('Extension is active on this page');
    }
  });
})();
