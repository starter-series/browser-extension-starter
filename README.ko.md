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

## 빠른 시작

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

## 포함된 구성

```
├── manifest.json                  # MV3 매니페스트 (Chrome + Firefox)
├── src/
│   ├── popup/                     # 확장 팝업 (HTML + JS)
│   ├── options/                   # 옵션 페이지 (HTML + JS)
│   ├── background/                # 서비스 워커
│   └── content/                   # 콘텐츠 스크립트 (JS + CSS)
├── assets/icons/                  # 확장 아이콘 (16/32/48/128)
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
- **스토어 제출 지원** — OAuth 설정 가이드 + 개인정보처리방침 템플릿
- **템플릿 셋업** — 첫 사용 시 설정 체크리스트 이슈 자동 생성

## CI/CD

### CI (모든 PR + main push 시)

| 단계 | 역할 |
|------|------|
| 매니페스트 검증 | `manifest.json` 유효성 + 필수 필드 + 버전 형식 확인 |
| 권한 감사 | 위험한 권한, 넓은 호스트 접근 경고 |
| 보안 감사 | `npm audit`로 의존성 취약점 확인 |
| 린트 | ESLint (JS) + Stylelint (CSS) |
| 테스트 | Jest (기본적으로 테스트 없이도 통과) |
| 빌드 검증 | zip 빌드 후 크기 10 MB 이하 확인 |

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

# 린트 & 테스트
npm run lint        # JS
npm run lint:css    # CSS
npm test
```

## 커스터마이징

1. `manifest.json` 수정 — 이름, 설명, 권한, match 패턴
2. `assets/icons/`의 아이콘 교체
3. `src/popup/`에서 팝업 개발
4. `src/options/`에서 설정 페이지 구성
5. `src/background/`에서 백그라운드 로직 추가
6. `src/content/`에서 페이지 주입 스크립트 작성
7. `docs/PRIVACY_POLICY_TEMPLATE.md`를 복사해서 내용 작성

> **참고:** 기본 콘텐츠 스크립트는 `https://*/*`와 `http://*/*`에 매칭됩니다. 특정 사이트만 필요하다면 `manifest.json`의 `matches`를 좁혀서 권한을 최소화하세요. Chrome Web Store 심사에서 넓은 호스트 권한은 더 엄격하게 검토됩니다.

## WXT / Plasmo 대신 이걸 쓰는 이유

[WXT](https://github.com/wxt-dev/wxt)와 [Plasmo](https://github.com/PlasmoHQ/plasmo)는 브라우저 확장 내부를 추상화하는 **프레임워크**입니다. 이 템플릿은 근본적으로 다른 접근입니다:

|  | 이 템플릿 | WXT / Plasmo |
|---|---|---|
| 철학 | CI/CD를 갖춘 가벼운 스타터 | 런타임을 포함한 풀 프레임워크 |
| 빌드 시스템 | 없음 (원본 파일 그대로) | Vite / Parcel (필수) |
| 학습 곡선 | 브라우저 API를 직접 사용 | 프레임워크 추상화 학습 필요 |
| CI/CD | 풀 파이프라인 포함 | 미포함 |
| 의존성 | dev 7개, runtime 0개 | 100개+ |
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
