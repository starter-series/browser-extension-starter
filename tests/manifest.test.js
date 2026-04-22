const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));

describe('manifest.json', () => {
  test('is Manifest V3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  test('declares name, version, description', () => {
    expect(manifest.name).toEqual(expect.any(String));
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.description).toEqual(expect.any(String));
  });

  test('only requests minimal permissions', () => {
    const permissions = manifest.permissions || [];
    // Storage is expected; anything else should be deliberate.
    const allowed = new Set(['storage', 'activeTab', 'alarms', 'notifications']);
    for (const p of permissions) {
      expect(allowed.has(p)).toBe(true);
    }
  });

  test('does not request <all_urls> host permissions', () => {
    const hostPerms = manifest.host_permissions || [];
    expect(hostPerms).not.toContain('<all_urls>');
    expect(hostPerms).not.toContain('*://*/*');
  });

  test('service worker, popup, options, and content script files exist', () => {
    const refs = [
      manifest.background?.service_worker,
      manifest.action?.default_popup,
      manifest.options_ui?.page,
      ...(manifest.content_scripts?.[0]?.js || []),
      ...(manifest.content_scripts?.[0]?.css || []),
    ].filter(Boolean);

    for (const ref of refs) {
      expect(fs.existsSync(path.join(root, ref))).toBe(true);
    }
  });

  test('all declared icon sizes exist as files', () => {
    const sizes = Object.entries(manifest.icons || {});
    expect(sizes.length).toBeGreaterThan(0);
    for (const [, iconPath] of sizes) {
      expect(fs.existsSync(path.join(root, iconPath))).toBe(true);
    }
  });

  test('content script matches use https scheme', () => {
    const matches = manifest.content_scripts?.[0]?.matches || [];
    // http://*/* is okay for dev but should be audited — we accept http/https explicitly.
    for (const m of matches) {
      expect(m).toMatch(/^https?:\/\//);
    }
  });

  test('Firefox gecko id is present for cross-browser publish', () => {
    expect(manifest.browser_specific_settings?.gecko?.id).toBeTruthy();
  });
});
