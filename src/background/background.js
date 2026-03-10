chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true });
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'TOGGLE':
      console.log('Extension ' + (message.enabled ? 'enabled' : 'disabled'));
      sendResponse({ status: 'ok' });
      break;

    case 'GET_STATE':
      chrome.storage.local.get(['enabled'], (result) => {
        sendResponse({ enabled: result.enabled !== false });
      });
      return true; // keep channel open for async response
  }
});
