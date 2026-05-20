# Browser Extension Starter

Vanilla JS Manifest V3 browser extension with CI/CD for Chrome Web Store + Firefox Add-ons.

## Project Structure

```
manifest.json       → MV3 manifest (Chrome + Firefox via browser_specific_settings.gecko)
src/
  popup/            → Popup UI (popup.html + popup.js)
  options/          → Options page (options.html + options.js)
  background/       → Service worker (background.js)
  content/          → Content script (content.js + content.css)
assets/icons/       → Extension icons (16/32/48/128 PNG)
scripts/
  bump-version.js   → Bumps version in manifest.json
docs/               → CWS, AMO, OAuth setup guides + privacy policy template
```

## CI/CD Pipeline

- **ci.yml**: Push/PR to main. Manifest validation + permission audit + npm audit + ESLint + Stylelint + Jest + build size check (<10MB). No secrets.
- **cd.yml**: Manual trigger. Build zip → upload to Chrome Web Store → GitHub Release.
- **cd-firefox.yml**: Manual trigger. Build with web-ext → submit to Firefox Add-ons.

## Secrets

| Secret | For | Required |
|--------|-----|----------|
| `CWS_EXTENSION_ID` | Chrome Web Store | For Chrome deploy |
| `CWS_CLIENT_ID` | Google OAuth | For Chrome deploy |
| `CWS_CLIENT_SECRET` | Google OAuth | For Chrome deploy |
| `CWS_REFRESH_TOKEN` | Google OAuth | For Chrome deploy |
| `AMO_JWT_ISSUER` | Firefox Add-ons | For Firefox deploy |
| `AMO_JWT_SECRET` | Firefox Add-ons | For Firefox deploy |

Setup guides: docs/CWS_SETUP.md, docs/OAUTH_SETUP.md, docs/AMO_SETUP.md

## What to Modify

- `manifest.json` → Extension name, description, permissions, gecko ID
- `src/popup/` → Popup UI and logic
- `src/options/` → Options page
- `src/background/` → Service worker logic
- `src/content/` → Content scripts (runs on web pages)
- `assets/icons/` → Replace with your icons (16/32/48/128px PNG)
- Version → `npm run version:patch|minor|major` (updates manifest.json)

## Do NOT Modify

- CI manifest validation logic
  - **Why**: CWS/AMO 제출 시 manifest 오류가 있으면 리뷰에서 거절됨. CI에서 미리 잡아야 배포 실패를 방지.
- CI permission audit
  - **Why**: `debugger`, `<all_urls>` 같은 권한은 스토어 리뷰를 느리게 하고 거절 사유가 됨. CI에서 경고해서 불필요한 권한을 인지시킴.
- Build script output path (dist/extension.zip)
  - **Why**: cd.yml이 이 경로에서 zip을 읽어 CWS에 업로드. 경로 변경 시 배포 실패.
- scripts/bump-version.js
  - **Why**: manifest.json의 version을 수정함 (package.json 아님). 브라우저 확장은 manifest.json이 버전의 source of truth.

## Key Patterns

- No bundler, no framework — plain JS files loaded directly
- manifest.json is the source of truth for version (not package.json)
- Permission audit in CI warns but doesn't block (informational)
- Chrome and Firefox share the same manifest.json (gecko settings in browser_specific_settings)
- `web-ext` used for dev (live reload) and Firefox builds
- **Telemetry seam**: if you add usage telemetry, `src/background/background.js` is the natural entry — it's the long-lived service worker that sees install/update lifecycle events and can fan out to a backend. The popup and content scripts are too short-lived to batch reliably. Whatever you do, document the data boundary in `docs/PRIVACY_POLICY_TEMPLATE.md`.
