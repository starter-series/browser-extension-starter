(() => {
  chrome.storage.local.get(['enabled'], (result) => {
    if (result.enabled !== false) {
      console.log('Extension is active on this page');
    }
  });
})();
