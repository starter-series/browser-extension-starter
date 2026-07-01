<div align="center">

# Browser Extension Starter

**Manifest V3 + GitHub Actions CI/CD + Chrome & Firefox 배포.**

확장 프로그램을 만들고, push로 배포하세요.

[![CI](https://github.com/starter-series/browser-extension-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/starter-series/browser-extension-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest_V3-blue.svg)](https://developer.chrome.com/docs/extensions/)
[![Firefox MV3](https://img.shields.io/badge/Firefox-Manifest_V3-orange.svg)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)

[English](README.md) | **한국어**

</div>

---

> **[Starter Series](https://github.com/starter-series/starter-series)** — 매번 AI한테 CI/CD 설명하지 마세요. clone하고 바로 시작하세요.
>
> [Docker Deploy](https://github.com/starter-series/docker-deploy-starter) · [Discord Bot](https://github.com/starter-series/discord-bot-starter) · [Telegram Bot](https://github.com/starter-series/telegram-bot-starter) · **Browser Extension** · [Electron App](https://github.com/starter-series/electron-app-starter) · [npm Package](https://github.com/starter-series/npm-package-starter) · [React Native](https://github.com/starter-series/react-native-starter) · [VS Code Extension](https://github.com/starter-series/vscode-extension-starter) · [MCP Server](https://github.com/starter-series/mcp-server-starter) · [Python MCP Server](https://github.com/starter-series/python-mcp-server-starter) · [Cloudflare Pages](https://github.com/starter-series/cloudflare-pages-starter)

---

## 상태와 범위 (Status & Scope)

- **현재 구현된 것 (Currently implemented)** — MV3 매니페스트(Chrome + Firefox), CI(validate · permission audit · `npm audit` · lint · test · build · built-zip extension smoke), CD(Chrome Web Store + Firefox Add-ons + GitHub Release), CodeQL 워크플로, `chrome.storage.sync` 기반의 옵션 페이지 ↔ 콘텐츠 스크립트 ↔ 백그라운드 설정 예제와 settings/popup/options/content/background 흐름을 다루는 Jest 동작 테스트, `.nvmrc` ↔ 워크플로 YAML 사이의 Node 버전 일관성 테스트, 버전 범프 스크립트, `web-ext` 라이브 리로드, 프라이버시 정책 템플릿, `npm pack --dry-run --json`으로 검증 가능한 패키지 메타데이터, 그리고 확장 파일을 Playwright로 staging해 CWS 스크린샷 + 프로모 타일 + 데모 스크린캐스트를 만들고 `store-assets/STORE_LISTING.md`에서 리스팅 문구를 추출하는 단일 커맨드 **스토어 자산 생성기**(`npm run capture:store`).
- **계획된 것 (Planned)** — 공개 로드맵 없음. 이 저장소는 프로덕트가 아니라 스타터입니다. 하위 확장 프로그램에서 필요해질 때 기능을 추가합니다.
- **설계 의도 (Design intent)** — 빌드 단계 없음, 바닐라 JS, 브라우저 API 직접 사용. 목표는 첫날부터 동작하는 확장을 출하하는 것, 그리고 LLM이 프레임워크를 먼저 배우지 않고도 코드를 읽을 수 있게 하는 것입니다. 커버리지 게이트는 현재 베이스라인을 기준으로 잡은 baseline-aware 방식이며, 회귀를 잡기 위한 장치이지 저자에게 부담을 주려는 목적은 아닙니다.
- **하지 않기로 한 것 (Non-goals)** — 번들러(Vite/Parcel/webpack), 기본 TypeScript, UI 프레임워크(React/Vue/Svelte), SPA 라우팅, 상태 관리 라이브러리. 이런 요구가 실재한다는 점은 인정합니다 — 그 경우 [WXT](https://github.com/wxt-dev/wxt)나 [Plasmo](https://github.com/PlasmoHQ/plasmo)를 사용하시기 바랍니다. 아래 비교표를 참고하십시오.
- **공개하지 않음 (Redacted)** — 없음. 이 템플릿은 개인 데이터, 내장 자격증명, 제3자 식별자를 포함하지 않습니다.

---

## 빠른 시작

**[create-starter](https://github.com/starter-series/create-starter) 사용** (권장):

```bash
gh repo create my-extension --template starter-series/browser-extension-starter --clone
cd my-extension && npm install && npm run dev
```

**또는 직접 clone:**

```bash
git clone https://github.com/starter-series/browser-extension-starter my-extension
cd my-extension && npm install && npm run dev
```

템플릿을 수정하기 전에 저장소 표면을 먼저 검증하십시오:

```bash
npm test
npm run lint
npm run lint:css
npm run build:chrome
npm run smoke:extension
npm audit --audit-level=high
npm pack --dry-run --json
```

<details>
<summary>수동 설정 (단계별)</summary>

```bash
# 1. GitHub에서 "Use this template" 클릭 (또는 clone)
git clone https://github.com/starter-series/browser-extension-starter.git my-extension
cd my-extension

# 2. 의존성 설치
npm install

# 3. Chrome에 로드
#    → chrome://extensions → 개발자 모드 켜기 → 압축 해제된 확장 프로그램 로드 → 프로젝트 루트 선택

# 4. 스토어용 zip 빌드
npm run build:chrome
```

</details>

## 포함된 구성

```
├── manifest.json                  # MV3 매니페스트 (Chrome + Firefox)
├── src/
│   ├── popup/                     # 확장 팝업 (HTML + JS)
│   ├── options/                   # 옵션 페이지 (HTML + JS)
│   ├── background/                # 서비스 워커
│   └── content/                   # 콘텐츠 스크립트 (JS + CSS)
├── assets/icons/                  # 확장 아이콘 (16/32/48/128)
├── shotkit.config.js              # 스토어 자산 scene (shotkit가 소비)
├── store-assets/                  # 리스팅 문구 + fixtures/templates (출력물은 gitignore)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # 검증, 감사, 린트, 테스트, 빌드
│   │   ├── cd.yml                 # Chrome Web Store 배포
│   │   ├── cd-firefox.yml         # Firefox Add-ons 배포
│   │   └── setup.yml              # 첫 사용 시 자동 설정 체크리스트
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── CWS_SETUP.md              # Chrome Web Store 퍼블리싱 가이드
│   ├── AMO_SETUP.md              # Firefox Add-ons 퍼블리싱 가이드
│   └── PRIVACY_POLICY_TEMPLATE.md # 스토어 제출용 개인정보처리방침
└── package.json
```

## 주요 기능

- **Manifest V3** — Chrome + Firefox 크로스 브라우저 지원
- **CI 파이프라인** — 매니페스트 검증, 권한 감사, 보안 감사, 린트, 테스트, 빌드 검증
- **CD 파이프라인** — 원클릭 Chrome Web Store 또는 Firefox Add-ons 배포 + GitHub Release
- **버전 관리** — `npm run version:patch/minor/major`로 `manifest.json` 버전 업
- **보안** — 위험 권한, 넓은 호스트 접근, 의존성 취약점 경고
- **개발 모드** — `npm run dev`로 `web-ext` 라이브 리로드
- **스타터 코드** — 토글 팝업 + 옵션 페이지 + 백그라운드 + 콘텐츠 스크립트
- **설정 저장 예제** — `chrome.storage.sync`로 옵션 페이지 → 콘텐츠 스크립트 → 실시간 업데이트까지 완전 연결
- **스토어 제출 지원** — OAuth 설정 가이드 + 개인정보처리방침 템플릿
- **스토어 자산 생성기** — `npm run capture:store`가 staging된 확장 파일을 Playwright로 구동해 CWS 스크린샷·프로모 타일·데모 스크린캐스트를 캡처합니다 (수동 스크린샷 불필요)
- **템플릿 셋업** — 첫 사용 시 설정 체크리스트 이슈 자동 생성

## CI/CD

### CI (모든 PR + main push 시)

| 단계 | 역할 |
|------|------|
| 매니페스트 검증 | `manifest.json` 유효성 + 필수 필드 + 버전 형식 확인 |
| 권한 감사 | 위험한 권한, 넓은 호스트 접근 경고 |
| 보안 감사 | `npm audit`로 의존성 취약점 확인 |
| 린트 | ESLint (JS) + Stylelint (CSS) |
| 테스트 | settings, popup, options, content, background 흐름을 검증하는 Jest 동작 테스트 |
| 빌드 검증 | zip 빌드 후 필수 entry와 크기 확인 |
| 확장 smoke | `dist/extension.zip`을 임시 디렉터리에 풀고 해당 빌드 산출물을 Chromium에 로드한 뒤 install defaults ↔ popup ↔ options ↔ content-script 동작 확인 |

### 보안 & 유지보수

| 워크플로우 | 역할 |
|-----------|------|
| CodeQL (`codeql.yml`) | 보안 취약점 정적 분석 (push/PR + 주간) |
| Maintenance (`maintenance.yml`) | 주간 CI 헬스 체크 — 실패 시 이슈 자동 생성 |
| Stale (`stale.yml`) | 비활성 이슈/PR 30일 후 라벨링, 7일 후 자동 종료 |

### CD (Actions 탭에서 수동 실행)

| 단계 | 역할 |
|------|------|
| 버전 가드 | 해당 버전의 git 태그가 이미 있으면 실패 |
| 빌드 | manifest + src + assets를 zip으로 패키징 |
| 업로드 | Chrome Web Store API로 배포 |
| GitHub Release | 태그 생성 + zip 첨부된 릴리즈 자동 생성 |
| 아티팩트 | zip을 GitHub Actions 아티팩트로 저장 |

**배포 방법:**

1. GitHub Secrets 설정 (아래 참조)
2. 버전 업: `npm run version:patch` (또는 `version:minor` / `version:major`)
3. **Actions** 탭 → **Deploy to Chrome Web Store** → **Run workflow**
4. 배포 대상 선택 (`default` 또는 `trustedTesters`) → **Run**

### GitHub Secrets

#### Chrome Web Store (`cd.yml`)

| Secret | 설명 |
|--------|------|
| `CWS_EXTENSION_ID` | Chrome Web Store 확장 프로그램 ID |
| `CWS_CLIENT_ID` | Google OAuth2 클라이언트 ID |
| `CWS_CLIENT_SECRET` | Google OAuth2 클라이언트 시크릿 |
| `CWS_REFRESH_TOKEN` | Google OAuth2 리프레시 토큰 |

자세한 설정 방법은 **[docs/CWS_SETUP.md](docs/CWS_SETUP.md)**를 참고하세요.

#### Firefox Add-ons (`cd-firefox.yml`)

| Secret | 설명 |
|--------|------|
| `AMO_JWT_ISSUER` | AMO API 키 (JWT issuer) |
| `AMO_JWT_SECRET` | AMO API 시크릿 |

자세한 설정 방법은 **[docs/AMO_SETUP.md](docs/AMO_SETUP.md)**를 참고하세요.

## 개발

```bash
# Chromium에서 라이브 리로드
npm run dev

# 버전 업 (manifest.json 자동 업데이트)
npm run version:patch   # 1.0.0 → 1.0.1
npm run version:minor   # 1.0.0 → 1.1.0
npm run version:major   # 1.0.0 → 2.0.0

# 스토어용 zip 빌드
npm run build:chrome

# 빌드된 zip 산출물을 Chromium에 로드하고 install/defaults/popup/options/content 경로 smoke
npm run smoke:extension

# 린트 & 테스트
npm run lint        # JS
npm run lint:css    # CSS
npm test

# 릴리스/패키지 검증
npm audit --audit-level=high
npm pack --dry-run --json
```

## 패키지 경계

npm 패키지 메타데이터는 `npm pack --dry-run --json`을 템플릿 경계 검증으로
사용할 수 있도록 유지합니다. tarball allowlist에는 하위 프로젝트가 스타터를
유용하게 복제하는 데 필요한 파일만 포함됩니다: 확장 런타임 파일, 문서, 버전
스크립트, GitHub 워크플로, 그리고 추적되는 스토어 자산 원본
(`STORE_LISTING.md`, fixture, 프로모 템플릿)입니다.

생성물은 이 경계 밖에 둡니다. `dist/`, `coverage/`, 스크린샷, 데모 영상,
`store-assets/description.md`는 빌드 또는 캡처 결과물이므로 git에서 무시합니다.

## 설정 저장

이 템플릿은 옵션 페이지 · 콘텐츠 스크립트 · 백그라운드 서비스 워커를 하나로 묶는 **`chrome.storage.sync`** 예제를 포함합니다. "설정을 저장하고 콘텐츠 스크립트에서 읽으려면 어떻게 해야 하나요?"에 대한 기본형 답입니다.

**파일 구성:**

| 파일 | 역할 |
|------|------|
| `src/settings.js` | 공유 UMD 모듈: `DEFAULTS`, `getSettings()`, 검증 함수. 옵션 페이지 · 콘텐츠 스크립트 · 테스트에서 동일한 코드를 사용합니다. |
| `src/options/options.html` + `options.js` + `options.css` | 설정 3개 (불리언 토글, HEX 색상, 줄바꿈 구분 차단 도메인)를 가진 옵션 페이지. HEX/도메인 검증 + `aria-live` 상태 표시. |
| `src/content/content.js` | 설정 로드 후 비활성/차단 도메인이면 즉시 종료. `chrome.storage.onChanged`로 실시간 반영. |
| `src/background/background.js` | `onInstalled` (reason `install`) 때 사용자가 설정하지 않은 키에만 기본값을 주입. |
| `tests/settings.test.js` | 기본값, 저장값, 잘못된 값 교정, 호스트 매칭 엣지 케이스를 Jest로 검증. |

**옵션 페이지를 탭으로 열기:** `options_ui.open_in_tab`이 `true`여서 크롬이 전체 탭으로 엽니다 (확장 아이콘 우클릭 → **Options**, 또는 `chrome://extensions` → **상세정보** → **확장 프로그램 옵션**).

**왜 sync? local은?** [`chrome.storage.sync`](https://developer.chrome.com/docs/extensions/reference/api/storage)는 사용자의 Google/Firefox 프로필을 따라 설정이 동기화됩니다. `local`은 캐시나 기기별 상태에, `session`은 브라우저 세션이 끝나면 사라져도 되는 값에 쓰세요.

**Firefox 호환성.** 이 템플릿이 타겟하는 Firefox 109+ (`browser_specific_settings.gecko.strict_min_version` 기준)는 `chrome.storage.sync`를 네이티브로 지원하므로 [`webextension-polyfill`](https://github.com/mozilla/webextension-polyfill)은 **불필요**합니다. Promise 반환 API가 필요하거나 Firefox < 109를 지원해야 한다면 그때 추가하세요.

## 스토어 자산

Chrome Web Store 자산 — 스크린샷 다섯 장, 프로모 타일, 데모 영상, 리스팅 문구 — 을 매번 손으로 만드는 일은 릴리스를 조용히 늦추는 잡일입니다. 이 템플릿은 단일 커맨드로 생성합니다:

```bash
npm run capture:install   # 최초 1회: Playwright Chromium 다운로드
npm run capture:store      # store-assets/ 에 자산 생성
```

출력물은 `store-assets/`에 생성됩니다: scene별 PNG(1280×800), 프로모 타일(440×280), `demo.webm`, 그리고 `STORE_LISTING.md`에서 추출한 `description.md`(복붙용 리스팅 문구). 플래그: `--scene <name>`(하나만 캡처), `--no-video`, `--live-gt`, `--freeze` (자세한 내용은 `shotkit.config.js` 참고).

**동작 방식.** `shotkit.config.js`가 이음새입니다. `shotkit` 엔진이 빌드 → 실행 → 스크린샷 → 캡션 → 프로모 → 영상 → 설명을 담당하고, 프로젝트의 `shotkit.config.js`는 프로젝트별 부분만 정의합니다: 어떤 확장 디렉터리를 로드할지, 선택적 `setup()`(예: 픽스처 HTTP 서버), 그리고 확장을 각 "money shot" 상태로 몰아넣는 `scenes`. scene은 다음과 같이 단순합니다:

`capture:store` 스크립트는 unscoped npm 패키지가 게시되기 전까지 공개 GitHub
source package에서 shotkit을 해석합니다. 그래서 새 템플릿 clone이 scoped npm
패키지나 아직 게시되지 않은 registry 이름에 의존하지 않습니다.

```js
{ name: '01-feature', caption: '무엇을 보여주는지',
  async run({ page, context, extensionId, env }) {
    await page.goto(`${env.baseUrl}/some-page`);
    // …UI를 구동하고, 렌더가 끝날 때까지 대기…
  } }
```

기본 제공되는 scene은 이 스타터 자체의 하이라이터를 대상으로 한 동작 데모입니다. scaffold를 복사한 뒤에는 실제 확장 프로그램에 맞는 scene으로 교체하십시오.

- **설계 의도 (Design intent)** — Playwright가 `launchPersistentContext(--load-extension)`로 staging된 unpacked extension을 로드하고, 콘텐츠가 렌더된 뒤 고정 뷰포트를 캡처합니다. 이는 데스크톱 스크린샷 도구가 겪는 로딩-vs-캡처 경합(화면 일부가 fetch 안 된 채 찍히는 문제)을 구조적으로 없앱니다. 별도의 `npm run smoke:extension` 명령이 출하 번들 게이트입니다: `dist/extension.zip`을 풀어 설치된 확장 산출물을 직접 구동합니다. 캡처는 결정적(로그인 불필요 픽스처, freeze된 번역/데이터)이므로 CI에서도 재현됩니다.
- **상표 안전성** — 하니스는 모든 스크린샷과 프로모 타일에 설정 가능한 면책 문구 밴드를 합성합니다(`shotkit.config.js`의 `disclaimer`). 제3자 브랜드와 상호작용하는 확장에서 "비제휴(not affiliated)" 문구를 빠뜨릴 수 없게 만듭니다.
- **하지 않는 것 (Non-goals)** — 이것은 *깔끔한 자동 스크린캐스트와 단정한 프로모 그래픽*이지, 보이스오버 광고나 에이전시급 아트워크가 아닙니다. 실제 UI를 캡처할 뿐, 과장하지 않습니다.

> 캡처는 실제 Chromium을 구동합니다 — 로컬 기본은 headed(`HEADED=0`로 headless 실행, 검증됨)이며, **CI에서 전부 실행**할 수도 있습니다: Actions → **"Capture store assets"** → Run workflow가 전체 자산을 재생성해 `store-assets` artifact로 업로드합니다. 빌드 zip smoke gate는 `npm run smoke:extension`으로 확인하십시오.

## 커스터마이징

1. `manifest.json` 수정 — 이름, 설명, 권한, match 패턴
2. `assets/icons/`의 아이콘 교체
3. `src/popup/`에서 팝업 개발
4. `src/options/`에서 설정 페이지 구성
5. `src/background/`에서 백그라운드 로직 추가
6. `src/content/`에서 페이지 주입 스크립트 작성
7. `docs/PRIVACY_POLICY_TEMPLATE.md`를 복사해서 내용 작성

> **참고:** 기본 콘텐츠 스크립트는 안전한 placeholder로 `https://example.com/*`에만 매칭됩니다. 실제 확장이 필요한 사이트로 바꾸되, 넓은 호스트 접근은 `optional_host_permissions`에 남겨 사용자가 승인한 뒤 확장하는 방식이 더 안전합니다. 스토어 심사에서도 처음부터 넓은 `content_scripts.matches`를 요구하면 더 엄격하게 검토됩니다.

## WXT / Plasmo 대신 이걸 쓰는 이유

[WXT](https://github.com/wxt-dev/wxt)와 [Plasmo](https://github.com/PlasmoHQ/plasmo)는 브라우저 확장 내부를 추상화하는 **프레임워크**입니다. 이 템플릿은 근본적으로 다른 접근입니다:

|  | 이 템플릿 | WXT / Plasmo |
|---|---|---|
| 철학 | CI/CD를 갖춘 가벼운 스타터 | 런타임을 포함한 풀 프레임워크 |
| 빌드 시스템 | 없음 (원본 파일 그대로) | Vite / Parcel (필수) |
| 학습 곡선 | 브라우저 API를 직접 사용 | 프레임워크 추상화 학습 필요 |
| CI/CD | 풀 파이프라인 포함 | 미포함 |
| 의존성 | dev-only toolchain, runtime 0개 | 100개+ |
| AI/바이브코딩 | LLM이 깔끔한 vanilla JS 생성 | LLM이 프레임워크 규칙을 이해해야 함 |
| 적합한 용도 | 유틸리티 확장, 스크립트, 간단한 도구 | 멀티 페이지 UI의 복잡한 앱 |

**이 템플릿을 선택하세요:**
- 확장 프로그램이 실제로 뭘 하는지 한 줄 한 줄 이해하고 싶을 때
- 프로덕션 CI/CD가 바로 필요할 때 (이걸 제공하는 다른 템플릿은 없습니다)
- AI 도구로 확장 코드를 생성할 때 — vanilla JS가 가장 깔끔한 AI 출력을 만듭니다
- 풀 앱이 아니라 유틸리티를 만들 때

**WXT/Plasmo를 선택하세요:**
- 확장 UI에 React/Vue/Svelte 컴포넌트가 필요할 때
- 파일 기반 라우팅과 자동 임포트가 필요할 때
- 복잡한 멀티 페이지 아키텍처를 만들 때

### TypeScript는?

이 템플릿은 빌드 단계 없는 철학을 유지하기 위해 의도적으로 vanilla JavaScript를 사용합니다. TypeScript가 필요하면:

1. `devDependencies`에 `typescript` 추가
2. `tsconfig.json` 추가
3. `package.json`에 `tsc` 빌드 스텝 추가
4. `.js` 파일을 `.ts`로 변경

TypeScript는 강제가 아니라 선택입니다. 많은 확장 프로그램 (콘텐츠 스크립트, 간단한 팝업, 백그라운드 리스너)에는 vanilla JS만으로 충분합니다.

## 기여

PR 환영합니다. [PR 템플릿](.github/PULL_REQUEST_TEMPLATE.md)을 사용해 주세요.

## 라이선스

[MIT](LICENSE)
