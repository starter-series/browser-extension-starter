const defaults = { enabled: true, greeting: 'Hello from My Extension!' };

document.addEventListener('DOMContentLoaded', () => {
  const enabled = document.getElementById('enabled');
  const greeting = document.getElementById('greeting');
  const toast = document.getElementById('toast');
  let toastTimer;

  chrome.storage.local.get(defaults, (items) => {
    if (chrome.runtime.lastError) {
      console.error('Failed to load settings:', chrome.runtime.lastError.message);
      return;
    }
    enabled.checked = items.enabled;
    greeting.value = items.greeting;
  });

  document.querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', save);
  });

  function save() {
    chrome.storage.local.set({
      enabled: enabled.checked,
      greeting: greeting.value,
    }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to save settings:', chrome.runtime.lastError.message);
        return;
      }
      clearTimeout(toastTimer);
      toast.classList.add('show');
      toastTimer = setTimeout(() => toast.classList.remove('show'), 1500);
    });
  }
});
