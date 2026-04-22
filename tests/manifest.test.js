const { manifest, ALLOWED_PERMISSIONS, exists } = require('./helpers');

describe('manifest.json', () => {
  test('is Manifest V3', () => {
    expect(manifest.manifest_version).toBe(3);
  });

  test('declares name, version, description', () => {
    expect(manifest.name).toEqual(expect.any(String));
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.description).toEqual(expect.any(String));
  });

  test('only requests permissions from the allowlist', () => {
    const allowed = new Set(ALLOWED_PERMISSIONS);
    for (const p of manifest.permissions || []) {
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
      expect(exists(ref)).toBe(true);
    }
  });

  test('all declared icon sizes exist as files', () => {
    const sizes = Object.entries(manifest.icons || {});
    expect(sizes.length).toBeGreaterThan(0);
    for (const [, iconPath] of sizes) {
      expect(exists(iconPath)).toBe(true);
    }
  });

  test('content script matches use http or https scheme', () => {
    for (const m of manifest.content_scripts?.[0]?.matches || []) {
      expect(m).toMatch(/^https?:\/\//);
    }
  });

  test('Firefox gecko id is present for cross-browser publish', () => {
    expect(manifest.browser_specific_settings?.gecko?.id).toBeTruthy();
  });
});
