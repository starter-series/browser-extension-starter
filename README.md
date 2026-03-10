<div align="center">

# Browser Extension Starter

**Modern Manifest V3 starter with GitHub Actions CI/CD + Chrome Web Store auto-deploy.**

One click to start. One push to deploy.

[![CI](https://github.com/starter-series/browser-extension-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/starter-series/browser-extension-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest_V3-blue.svg)](https://developer.chrome.com/docs/extensions/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/starter-series/browser-extension-starter/pulls)

</div>

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

# 4. Build for store
npm run build:chrome
```

## What's Included

```
├── manifest.json                  # MV3 manifest
├── src/
│   ├── popup/                     # Extension popup (HTML + JS)
│   ├── background/                # Service worker
│   └── content/                   # Content script (JS + CSS)
├── assets/icons/                  # Extension icons (16/32/48/128)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Validate manifest, lint, test
│   │   └── cd.yml                 # Auto-deploy to Chrome Web Store
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   └── OAUTH_SETUP.md            # Step-by-step CWS OAuth guide
└── package.json
```

## Features

- **Manifest V3** — Chrome's current standard, ready for store submission
- **CI Pipeline** — Validates manifest JSON, lints JS, runs tests on every PR
- **CD Pipeline** — Auto-builds zip and publishes to Chrome Web Store on push to main
- **Minimal starter code** — Popup + background + content script, nothing extra
- **OAuth setup guide** — Step-by-step guide with screenshots for CWS API credentials

## CI/CD

### CI (every PR + push to main)

| Step | What it does |
|------|-------------|
| Validate manifest | Checks `manifest.json` is valid JSON |
| Lint | ESLint with browser/webextensions env |
| Test | Jest (passes with no tests by default) |

### CD (push to main, only when code changes)

| Step | What it does |
|------|-------------|
| Build | Zips manifest + src + assets |
| Upload | Publishes to Chrome Web Store via API |
| Artifact | Saves zip as GitHub Actions artifact |

Triggers only when `manifest.json`, `src/**`, or `assets/**` change.

### Required GitHub Secrets for CD

| Secret | Description |
|--------|-------------|
| `CWS_EXTENSION_ID` | Your Chrome Web Store extension ID |
| `CWS_CLIENT_ID` | Google OAuth2 client ID |
| `CWS_CLIENT_SECRET` | Google OAuth2 client secret |
| `CWS_REFRESH_TOKEN` | Google OAuth2 refresh token |

See **[docs/OAUTH_SETUP.md](docs/OAUTH_SETUP.md)** for a detailed setup guide.

## Customization

1. Edit `manifest.json` — name, description, permissions, match patterns
2. Replace icons in `assets/icons/`
3. Build your popup in `src/popup/`
4. Add background logic in `src/background/`
5. Add page injection in `src/content/`

> **Note:** The default content script matches `https://*/*` and `http://*/*`. If your extension only needs specific sites, narrow the `matches` in `manifest.json` to minimize permissions — Chrome Web Store review is stricter with broad host permissions.

## Part of Starter Series

This repo is part of [starter-series](https://github.com/starter-series) — a collection of modern dev starters with CI/CD included.

| Repo | Description | Status |
|------|-------------|--------|
| **browser-extension-starter** | MV3 + CWS auto-deploy | Available |
| nextjs-oauth-starter | Next.js + OAuth (Google/GitHub/Kakao) | Planned |
| docker-k8s-starter | Docker + Kubernetes deploy pipeline | Planned |
| nextjs-saas-starter | Full-stack SaaS boilerplate | Planned |

## Contributing

PRs welcome. Please use the [PR template](.github/PULL_REQUEST_TEMPLATE.md).

## License

[MIT](LICENSE)
