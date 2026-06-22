<div align="center">

# Browser Extension Starter

**Manifest V3 + GitHub Actions CI/CD + Chrome & Firefox deploy.**

Build your extension. Push to deploy.

[![CI](https://github.com/starter-series/browser-extension-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/starter-series/browser-extension-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest_V3-blue.svg)](https://developer.chrome.com/docs/extensions/)
[![Firefox MV3](https://img.shields.io/badge/Firefox-Manifest_V3-orange.svg)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

**English** | [한국어](README.ko.md)

</div>

---

> **Part of [Starter Series](https://github.com/starter-series/starter-series)** — Stop explaining CI/CD to your AI every time. Clone and start.
>
> [Docker Deploy](https://github.com/starter-series/docker-deploy-starter) · [Discord Bot](https://github.com/starter-series/discord-bot-starter) · [Telegram Bot](https://github.com/starter-series/telegram-bot-starter) · **Browser Extension** · [Electron App](https://github.com/starter-series/electron-app-starter) · [npm Package](https://github.com/starter-series/npm-package-starter) · [React Native](https://github.com/starter-series/react-native-starter) · [VS Code Extension](https://github.com/starter-series/vscode-extension-starter) · [MCP Server](https://github.com/starter-series/mcp-server-starter) · [Python MCP Server](https://github.com/starter-series/python-mcp-server-starter) · [Cloudflare Pages](https://github.com/starter-series/cloudflare-pages-starter)

---

## Status & Scope

- **Currently implemented** — MV3 manifest (Chrome + Firefox), CI (validate · permission audit · `npm audit` · lint · test · build), CD (Chrome Web Store + Firefox Add-ons + GitHub Release), CodeQL workflow, end-to-end `chrome.storage.sync` settings example (options page ↔ content script ↔ background) with a Jest unit-test gate on `src/settings.js` (other src/ files exercised only via structural smoke tests in `tests/sources.test.js`), Node-version lockstep test across `.nvmrc` + workflow YAMLs, version-bump scripts, live-reload via `web-ext`, privacy-policy template, package metadata that dry-runs cleanly with `npm pack --dry-run --json`, and a one-command **store-asset generator** (`npm run capture:store`) that drives the built extension with Playwright to produce CWS screenshots + promo tile + demo screencast and extract listing copy from `store-assets/STORE_LISTING.md`.
- **Planned** — none on a public roadmap. This is a starter, not a product; features land when a downstream extension needs them.
- **Design intent** — Zero build step, vanilla JS, raw browser APIs. The point is to ship a working extension on day one and let an LLM read the code without first learning a framework. Coverage gates are baseline-aware (anchored to the current baseline, not aspirational) — they catch regressions, not author shame.
- **Non-goals** — Bundling (Vite/Parcel/webpack), TypeScript by default, UI frameworks (React/Vue/Svelte), single-page-app routing, opinionated state libraries. Those are real needs — they belong in [WXT](https://github.com/wxt-dev/wxt) or [Plasmo](https://github.com/PlasmoHQ/plasmo). See the comparison table below.
- **Redacted** — none. Template ships no private data, no embedded credentials, no third-party identifiers.

---

## Quick Start

**Via [create-starter](https://github.com/starter-series/create-starter)** (recommended):

```bash
npx @starter-series/create my-extension --template browser-extension
cd my-extension && npm install && npm run dev
```

**Or clone directly:**

```bash
git clone https://github.com/starter-series/browser-extension-starter my-extension
cd my-extension && npm install && npm run dev
```

Before adapting the template, verify the repo surface:

```bash
npm test
npm run lint
npm run lint:css
npm run build:chrome
npm audit --audit-level=high
npm pack --dry-run --json
```

<details>
<summary>Manual setup (step-by-step)</summary>

```bash
# 1. Click "Use this template" on GitHub (or clone)
git clone https://github.com/starter-series/browser-extension-starter.git my-extension
cd my-extension

# 2. Install dependencies
npm install

# 3. Load in Chrome
#    → chrome://extensions → Enable Developer Mode → Load unpacked → select project root

# 4. Build zip for store
npm run build:chrome
```

</details>

## What's Included

```
├── manifest.json                  # MV3 manifest (Chrome + Firefox)
├── src/
│   ├── popup/                     # Extension popup (HTML + JS)
│   ├── options/                   # Options page (HTML + JS)
│   ├── background/                # Service worker
│   └── content/                   # Content script (JS + CSS)
├── assets/icons/                  # Extension icons (16/32/48/128)
├── shotkit.config.js              # Store-asset scenes (consumed by @starter-series/shotkit)
├── store-assets/                  # Listing copy + fixtures/templates (outputs gitignored)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Validate, audit, lint, test, build
│   │   ├── cd.yml                 # Deploy to Chrome Web Store
│   │   ├── cd-firefox.yml         # Deploy to Firefox Add-ons
│   │   └── setup.yml              # Auto setup checklist on first use
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── CWS_SETUP.md              # Chrome Web Store publishing guide
│   ├── AMO_SETUP.md              # Firefox Add-ons publishing guide
│   └── PRIVACY_POLICY_TEMPLATE.md # Privacy policy template for store
└── package.json
```

## Features

- **Manifest V3** — Chrome + Firefox cross-browser support
- **CI Pipeline** — Manifest validation, permission audit, security audit, lint, test, build verification
- **CD Pipeline** — One-click deploy to Chrome Web Store or Firefox Add-ons + auto GitHub Release
- **Version management** — `npm run version:patch/minor/major` to bump `manifest.json`
- **Security** — CI warns on risky permissions, broad host access, and dependency vulnerabilities
- **Dev mode** — `npm run dev` for live-reload with `web-ext`
- **Starter code** — Popup with toggle + options page + background + content script
- **Settings storage example** — `chrome.storage.sync` end-to-end: options form → content script → live updates
- **Store-ready** — OAuth setup guide + privacy policy template
- **Store-asset generator** — `npm run capture:store` captures CWS screenshots, a promo tile, and a demo screencast from the *built* extension via Playwright (no manual screenshotting)
- **Template setup** — Auto-creates setup checklist issue on first use

## CI/CD

### CI (every PR + push to main)

| Step | What it does |
|------|-------------|
| Validate manifest | Checks `manifest.json` is valid JSON with required fields + version format |
| Audit permissions | Warns on risky permissions and broad host access |
| Security audit | `npm audit` for dependency vulnerabilities |
| Lint | ESLint (JS) + Stylelint (CSS) |
| Test | Jest (passes with no tests by default) |
| Build verification | Builds zip and checks size stays under 10 MB |

### Security & Maintenance

| Workflow | What it does |
|----------|-------------|
| CodeQL (`codeql.yml`) | Static analysis for security vulnerabilities (push/PR + weekly) |
| Maintenance (`maintenance.yml`) | Weekly CI health check — auto-creates issue on failure |
| Stale (`stale.yml`) | Labels inactive issues/PRs after 30 days, auto-closes after 7 more |

### CD (manual trigger via Actions tab)

| Step | What it does |
|------|-------------|
| Version guard | Fails if git tag already exists for this version |
| Build | Zips manifest + src + assets |
| Upload | Publishes to Chrome Web Store via API |
| GitHub Release | Creates a tagged release with zip attached |
| Artifact | Saves zip as GitHub Actions artifact |

**How to deploy:**

1. Set up GitHub Secrets (see below)
2. Bump version: `npm run version:patch` (or `version:minor` / `version:major`)
3. Go to **Actions** tab → **Deploy to Chrome Web Store** → **Run workflow**
4. Choose publish target (`default` or `trustedTesters`) → **Run**

### GitHub Secrets

#### Chrome Web Store (`cd.yml`)

| Secret | Description |
|--------|-------------|
| `CWS_EXTENSION_ID` | Your Chrome Web Store extension ID |
| `CWS_CLIENT_ID` | Google OAuth2 client ID |
| `CWS_CLIENT_SECRET` | Google OAuth2 client secret |
| `CWS_REFRESH_TOKEN` | Google OAuth2 refresh token |

See **[docs/CWS_SETUP.md](docs/CWS_SETUP.md)** for a detailed setup guide.

#### Firefox Add-ons (`cd-firefox.yml`)

| Secret | Description |
|--------|-------------|
| `AMO_JWT_ISSUER` | AMO API key (JWT issuer) |
| `AMO_JWT_SECRET` | AMO API secret |

See **[docs/AMO_SETUP.md](docs/AMO_SETUP.md)** for a detailed setup guide.

## Development

```bash
# Live-reload in Chromium
npm run dev

# Bump version (updates manifest.json)
npm run version:patch   # 1.0.0 → 1.0.1
npm run version:minor   # 1.0.0 → 1.1.0
npm run version:major   # 1.0.0 → 2.0.0

# Build store zip
npm run build:chrome

# Lint & test
npm run lint        # JS
npm run lint:css    # CSS
npm test

# Release/package checks
npm audit --audit-level=high
npm pack --dry-run --json
```

## Package Boundary

The npm package metadata is present so `npm pack --dry-run --json` can be used as
a template-boundary check. The tarball allowlist includes the files a downstream
project needs to keep the starter useful: extension runtime files, docs, version
scripts, GitHub workflows, and the tracked store-asset sources
(`STORE_LISTING.md`, fixtures, and promo templates).

Generated files stay outside that boundary. `dist/`, `coverage/`, screenshots,
demo videos, and `store-assets/description.md` are build or capture outputs and
are ignored by git.

## Settings storage

The template ships with a small **`chrome.storage.sync`** example that wires an options page, a content script, and a background service worker together. It's the canonical answer to "how do I store settings and read them from a content script?"

**Where to look:**

| File | Role |
|------|------|
| `src/settings.js` | Shared UMD module: `DEFAULTS`, `getSettings()`, validators. Same code runs in the options page, content script, and tests. |
| `src/options/options.html` + `options.js` + `options.css` | Full options page with 3 settings (boolean toggle, hex color, newline-separated blocked-domains list), hex/domain validation, and an `aria-live` status region. |
| `src/content/content.js` | Loads settings, bails out if disabled or the host is blocklisted, and reacts live to `chrome.storage.onChanged`. |
| `src/background/background.js` | On `onInstalled` (reason `install`), seeds defaults into `chrome.storage.sync` only for keys the user hasn't already set. |
| `tests/settings.test.js` | Jest coverage for defaults, stored values, invalid-value coercion, and host-match edge cases. |

**Open the Options page in a tab:** `options_ui.open_in_tab` is set to `true`, so Chrome opens it as a full tab (right-click extension icon → **Options**, or `chrome://extensions` → **Details** → **Extension options**).

**Why sync and not local?** [`chrome.storage.sync`](https://developer.chrome.com/docs/extensions/reference/api/storage) roams the user's preferences with their Google/Firefox profile. Use `local` for caches or device-specific state, `session` for values that die with the browser session.

**Firefox compatibility.** Modern Firefox (109+, which this template targets via `browser_specific_settings.gecko.strict_min_version`) exposes `chrome.storage.sync` directly — no [`webextension-polyfill`](https://github.com/mozilla/webextension-polyfill) needed. Add the polyfill only if you need promise-returning APIs without callbacks, or if you must support Firefox < 109.

## Store assets

Producing Chrome Web Store assets by hand — five screenshots, a promo tile, a demo
clip, the listing copy — is the chore that quietly delays releases. This template
generates them from one command:

```bash
npm run capture:install   # one-time: download the Playwright Chromium
npm run capture:store      # produce assets into store-assets/
```

Outputs land in `store-assets/`: one PNG per scene (1280×800), a promo tile
(440×280), `demo.webm`, and `description.md` (listing copy extracted from
`STORE_LISTING.md`). Flags: `--scene <name>` (capture just one), `--no-video`,
`--live-gt`, `--freeze` (see `shotkit.config.js`).

**How it works.** `shotkit.config.js` is the seam. The shotkit engine
(`@starter-series/shotkit`) owns build → launch → screenshot → caption → promo →
video → description; your `shotkit.config.js` owns the project-specific parts: which
extension dir to load, an optional `setup()` (e.g. a fixture HTTP server), and the
`scenes` that drive the extension into each money-shot state. A scene is just:

```js
{ name: '01-feature', caption: 'What this shows',
  async run({ page, context, extensionId, env }) {
    await page.goto(`${env.baseUrl}/some-page`);
    // …drive the UI, wait until it has rendered…
  } }
```

The shipped scenes are a working demo against this starter's own highlighter; swap
in scenes for your own extension once the scaffold is copied.

- **Design intent** — Playwright loads the *built* extension via
  `launchPersistentContext(--load-extension)` and waits for content to render
  before capturing a fixed viewport. That removes the load-vs-capture race that
  desktop screenshotters hit (half-fetched UI). It also means the run **doubles as
  a real-bundle smoke test**: a screenshot appearing proves that feature works in
  the shipped bundle. Captures are deterministic (login-free fixtures, frozen
  translations/data) so they're reproducible in CI.
- **Trademark-safety** — shotkit composites a configurable disclaimer band
  onto every screenshot and the promo tile (`disclaimer` in `shotkit.config.js`), so
  a "not affiliated" line can't be forgotten when an extension interoperates with a
  third-party brand.
- **Non-goals** — this is a *clean automatic screencast and a tidy promo graphic*,
  not a voiceover ad or agency-grade artwork. It captures real UI; it does not
  embellish it.

> Capture runs a real Chromium — headed by default locally (`HEADED=0` runs
> headless; verified). It can also run **entirely in CI**: Actions →
> **"Capture store assets"** → Run workflow regenerates everything and uploads
> a `store-assets` artifact — no local browser or Node needed, and a green run
> doubles as a real-bundle smoke test.

## Customization

1. Edit `manifest.json` — name, description, permissions, match patterns
2. Replace icons in `assets/icons/`
3. Build your popup in `src/popup/`
4. Configure settings in `src/options/`
5. Add background logic in `src/background/`
6. Add page injection in `src/content/`
7. Copy `docs/PRIVACY_POLICY_TEMPLATE.md` and fill in your details

> **Note:** The default content script is scoped to `https://example.com/*` as a safe placeholder. Replace it with the sites your extension truly needs. Broad host access is kept in `optional_host_permissions` for user-granted expansion; Chrome Web Store review is stricter when `content_scripts.matches` starts broad.

## Why This Over WXT / Plasmo?

[WXT](https://github.com/wxt-dev/wxt) and [Plasmo](https://github.com/PlasmoHQ/plasmo) are excellent **frameworks** that abstract away browser extension internals. This template takes a fundamentally different approach:

|  | This template | WXT / Plasmo |
|---|---|---|
| Philosophy | Thin starter with CI/CD | Full framework with runtime |
| Build system | None (raw files) | Vite / Parcel (required) |
| Learning curve | Read the browser APIs directly | Learn the framework's abstractions |
| CI/CD | Full pipeline included | Not included |
| Dependencies | 9 dev, 0 runtime | 100+ |
| AI/vibe-coding | LLMs generate clean vanilla JS | LLMs must understand framework conventions |
| Best for | Utility extensions, scripts, simple tools | Complex apps with multi-page UIs |

**Choose this template if:**
- You want to understand what your extension actually does, line by line
- You need production CI/CD out of the box (no other template provides this)
- You're using AI tools to generate extension code — vanilla JS produces the cleanest AI output
- Your extension is a utility, not a full application

**Choose WXT/Plasmo if:**
- You need React/Vue/Svelte components in your extension UI
- You want file-based routing and auto-imports
- Your extension has complex multi-page architecture

### What about TypeScript?

This template intentionally uses vanilla JavaScript to keep the zero-build-step philosophy. If you need TypeScript:

1. Add `typescript` to devDependencies
2. Add a `tsconfig.json`
3. Add a `tsc` build step to `package.json`
4. Rename `.js` files to `.ts`

This keeps TypeScript opt-in rather than forcing a build pipeline on everyone. For many extensions (content scripts, simple popups, background listeners), vanilla JS is all you need.

## Contributing

PRs welcome. Please use the [PR template](.github/PULL_REQUEST_TEMPLATE.md).

## License

[MIT](LICENSE)
