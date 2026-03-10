(() => {
  chrome.runtime.sendMessage({ type: 'GET_STATE' }, (response) => {
    if (response?.enabled) {
      console.log('Extension is active on this page');
    }
  });
})();
