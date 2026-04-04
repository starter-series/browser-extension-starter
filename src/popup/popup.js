document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const status = document.getElementById('status');

  // Load saved state
  chrome.storage.local.get(['enabled'], (result) => {
    if (chrome.runtime.lastError) {
      console.error('Failed to load settings:', chrome.runtime.lastError.message);
      return;
    }
    const enabled = result.enabled !== false;
    toggle.checked = enabled;
    updateStatus(enabled);
  });

  // Handle toggle
  toggle.addEventListener('change', () => {
    const enabled = toggle.checked;
    chrome.storage.local.set({ enabled });
    updateStatus(enabled);
  });

  function updateStatus(enabled) {
    status.textContent = enabled ? 'Active' : 'Inactive';
    status.className = 'status ' + (enabled ? 'active' : 'inactive');
  }
});
