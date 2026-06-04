const Settings = require('../src/settings');

/**
 * Build a minimal chrome.storage.sync stand-in for tests.
 * Accepts an initial store and returns an object with `.get(keys, cb)`.
 */
function makeStubStorage(initialStore = {}, { failWith } = {}) {
  return {
    store: { ...initialStore },
    get(keys, callback) {
      if (failWith) {
        // Simulate chrome.runtime.lastError by storing it on the fake chrome.
        globalThis.chrome = { runtime: { lastError: { message: failWith } } };
        callback({});
        return;
      }
      globalThis.chrome = { runtime: { lastError: undefined } };
      const keyList = Array.isArray(keys) ? keys : Object.keys(keys || {});
      const out = {};
      for (const k of keyList) {
        if (k in this.store) out[k] = this.store[k];
      }
      callback(out);
    },
  };
}

afterEach(() => {
  delete globalThis.chrome;
});

describe('ExtSettings.getSettings', () => {
  test('returns defaults when storage is empty', async () => {
    const storage = makeStubStorage({});
    const result = await Settings.getSettings(storage);
    expect(result).toEqual(Settings.DEFAULTS);
  });

  test('returns stored values when present', async () => {
    const storage = makeStubStorage({
      highlightEnabled: false,
      highlightColor: '#123abc',
      blockedDomains: 'example.com\nnews.example.org',
    });
    const result = await Settings.getSettings(storage);
    expect(result.highlightEnabled).toBe(false);
    expect(result.highlightColor).toBe('#123abc');
    expect(result.blockedDomains).toBe('example.com\nnews.example.org');
  });

  test('coerces invalid color back to default', async () => {
    const storage = makeStubStorage({ highlightColor: 'not-a-color' });
    const result = await Settings.getSettings(storage);
    expect(result.highlightColor).toBe(Settings.DEFAULTS.highlightColor);
  });

  test('coerces non-string blockedDomains to the default empty string', async () => {
    // Someone stored a number / array by mistake — we should not throw.
    const storage = makeStubStorage({ blockedDomains: 42 });
    const result = await Settings.getSettings(storage);
    expect(result.blockedDomains).toBe(Settings.DEFAULTS.blockedDomains);
  });

  test('preserves a real boolean false for highlightEnabled', async () => {
    const storage = makeStubStorage({ highlightEnabled: false });
    const result = await Settings.getSettings(storage);
    expect(result.highlightEnabled).toBe(false);
  });

  test('rejects when storage reports lastError', async () => {
    const storage = makeStubStorage({}, { failWith: 'QUOTA_BYTES_PER_ITEM' });
    await expect(Settings.getSettings(storage)).rejects.toThrow(/QUOTA/);
  });
});

describe('ExtSettings.coerceBool — positive boolean check (not `!== false`)', () => {
  // This is the core regression guard for the audited defect. The old code
  // was `merged.highlightEnabled = merged.highlightEnabled !== false`, which:
  //   - turns 'false', 'no', 0, null, '' into `true` (truthy-garbage leak)
  //   - ignores the configured default entirely
  // The fix accepts ONLY a real boolean and otherwise returns the supplied
  // fallback. We test BOTH fallbacks, because the bug is only observable when
  // the fallback is `false`: `'false' !== false` === true would FAIL the
  // `fallback:false` cases below. (With a `true` default the two forms happen
  // to agree on output, so a true-only test would be a tautology — these are
  // not.)

  test('returns a real boolean unchanged, ignoring the fallback', () => {
    expect(Settings.coerceBool(true, false)).toBe(true);
    expect(Settings.coerceBool(false, true)).toBe(false);
  });

  describe.each([true, false])('with fallback = %s', (fallback) => {
    test.each([
      ['string "false"', 'false'],
      ['string "no"', 'no'],
      ['string "true"', 'true'],
      ['number 0', 0],
      ['number 1', 1],
      ['null', null],
      ['undefined', undefined],
      ['empty string', ''],
      ['an object', {}],
    ])('garbage %s falls back to the fallback (caught only by a positive check)', (_label, garbage) => {
      const out = Settings.coerceBool(garbage, fallback);
      expect(out).toBe(fallback);
      // Never a truthy/falsy passthrough of the garbage itself.
      expect(typeof out).toBe('boolean');
    });
  });
});

describe('ExtSettings.coerce — highlightEnabled end-to-end', () => {
  test('keeps a real boolean exactly (true stays true, false stays false)', () => {
    expect(Settings.coerce({ highlightEnabled: true }).highlightEnabled).toBe(true);
    expect(Settings.coerce({ highlightEnabled: false }).highlightEnabled).toBe(false);
  });

  test('routes garbage through the default (uses DEFAULTS as the fallback)', () => {
    for (const garbage of ['false', 'no', 0, null, '', {}]) {
      const out = Settings.coerce({ highlightEnabled: garbage }).highlightEnabled;
      expect(out).toBe(Settings.DEFAULTS.highlightEnabled);
      expect(typeof out).toBe('boolean');
    }
  });
});

describe('ExtSettings.parseBlockedDomains', () => {
  test('returns [] for invalid input types', () => {
    expect(Settings.parseBlockedDomains(undefined)).toEqual([]);
    expect(Settings.parseBlockedDomains(null)).toEqual([]);
    expect(Settings.parseBlockedDomains(42)).toEqual([]);
  });

  test('strips blank lines and rejects malformed entries', () => {
    const raw = '\nexample.com\n  not a domain  \nsub.example.co.kr\nhttps://foo.com\n';
    const out = Settings.parseBlockedDomains(raw);
    expect(out).toEqual(['example.com', 'sub.example.co.kr']);
  });

  test('lowercases domains for consistent matching', () => {
    expect(Settings.parseBlockedDomains('EXAMPLE.COM')).toEqual(['example.com']);
  });
});

describe('ExtSettings.isHostBlocked', () => {
  test('matches exact host and subdomains', () => {
    const blocked = 'example.com\nbanned.org';
    expect(Settings.isHostBlocked('example.com', blocked)).toBe(true);
    expect(Settings.isHostBlocked('www.example.com', blocked)).toBe(true);
    expect(Settings.isHostBlocked('api.banned.org', blocked)).toBe(true);
  });

  test('does not match unrelated hosts or partial overlaps', () => {
    const blocked = 'example.com';
    // Mutation-check: if .endsWith was used without the leading dot, this
    // "notexample.com" would be a false positive. Protect that edge.
    expect(Settings.isHostBlocked('notexample.com', blocked)).toBe(false);
    expect(Settings.isHostBlocked('other.org', blocked)).toBe(false);
    expect(Settings.isHostBlocked('', blocked)).toBe(false);
  });
});

describe('ExtSettings.isValidColor', () => {
  test('accepts 3- and 6-digit hex', () => {
    expect(Settings.isValidColor('#fff')).toBe(true);
    expect(Settings.isValidColor('#FFEB3B')).toBe(true);
  });

  test('rejects non-hex strings', () => {
    expect(Settings.isValidColor('red')).toBe(false);
    expect(Settings.isValidColor('#fffff')).toBe(false);
    expect(Settings.isValidColor(null)).toBe(false);
  });
});
