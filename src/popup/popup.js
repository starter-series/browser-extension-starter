document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');

  // Popup reads/writes the same chrome.storage.sync key as the options page
  // so toggling from the popup stays in lockstep with the full settings UI.
  chrome.storage.sync.get({ highlightEnabled: true }, (result) => {
    if (chrome.runtime.lastError) {
      console.error('Failed to load settings:', chrome.runtime.lastError.message);
      return;
    }
    const enabled = result.highlightEnabled !== false;
    toggle.checked = enabled;
    updateStatus(enabled);
  });

  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.sync.set({ highlightEnabled: enabled }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to save setting:', chrome.runtime.lastError.message);
        return;
      }
      updateStatus(enabled);
    });
  });

  function updateStatus(enabled) {
    status.textContent = enabled ? 'Active' : 'Inactive';
    status.className = 'status ' + (enabled ? 'active' : 'inactive');
  }
});
