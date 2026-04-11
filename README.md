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

## Quick Start

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

## What's Included

```
├── manifest.json                  # MV3 manifest (Chrome + Firefox)
├── src/
│   ├── popup/                     # Extension popup (HTML + JS)
│   ├── options/                   # Options page (HTML + JS)
│   ├── background/                # Service worker
│   └── content/                   # Content script (JS + CSS)
├── assets/icons/                  # Extension icons (16/32/48/128)
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
- **Store-ready** — OAuth setup guide + privacy policy template
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
```

## Customization

1. Edit `manifest.json` — name, description, permissions, match patterns
2. Replace icons in `assets/icons/`
3. Build your popup in `src/popup/`
4. Configure settings in `src/options/`
5. Add background logic in `src/background/`
6. Add page injection in `src/content/`
7. Copy `docs/PRIVACY_POLICY_TEMPLATE.md` and fill in your details

> **Note:** The default content script matches `https://*/*` and `http://*/*`. If your extension only needs specific sites, narrow the `matches` in `manifest.json` to minimize permissions — Chrome Web Store review is stricter with broad host permissions.

## Why This Over WXT / Plasmo?

[WXT](https://github.com/wxt-dev/wxt) and [Plasmo](https://github.com/PlasmoHQ/plasmo) are excellent **frameworks** that abstract away browser extension internals. This template takes a fundamentally different approach:

|  | This template | WXT / Plasmo |
|---|---|---|
| Philosophy | Thin starter with CI/CD | Full framework with runtime |
| Build system | None (raw files) | Vite / Parcel (required) |
| Learning curve | Read the browser APIs directly | Learn the framework's abstractions |
| CI/CD | Full pipeline included | Not included |
| Dependencies | 7 dev, 0 runtime | 100+ |
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
