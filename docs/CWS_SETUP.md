# Chrome Web Store Publishing Setup

Step-by-step guide to set up Chrome Web Store publishing for the CD pipeline.

---

## 1. Create a Chrome Web Store Developer Account

1. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Sign in with your Google account
3. Pay the one-time **$5 registration fee**
4. Accept the Developer Agreement

> The $5 fee is per Google account, one-time only. It covers all extensions you publish.

## 2. Create Your Extension Listing

1. In the Developer Dashboard, click **New Item**
2. Upload your extension zip (`npm run build:chrome` to generate)
3. Fill in the required fields:
   - **Name** and **Description**
   - **Category** (e.g., Productivity, Developer Tools)
   - **Language**
   - At least one **screenshot** (1280x800 or 640x400)
   - **Privacy policy URL** (use `docs/PRIVACY_POLICY_TEMPLATE.md` as a starting point)
4. Click **Save Draft** (do not publish yet)
5. Note your **Extension ID** from the URL — it looks like `abcdefghijklmnopabcdefghijklmnop`

## 3. Create Google OAuth2 Credentials

The CD pipeline uses the Chrome Web Store API, which requires OAuth2 credentials.

### 3.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** > **New Project**
3. Name it something like `my-extension-deploy` and click **Create**

### 3.2 Enable the Chrome Web Store API

1. Go to **APIs & Services** > **Library**
2. Search for **Chrome Web Store API**
3. Click **Enable**

### 3.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** and click **Create**
3. Fill in the required fields:
   - **App name**: e.g., `My Extension Deploy`
   - **User support email**: your email
   - **Developer contact email**: your email
4. Click **Save and Continue** through the remaining steps
5. Under **Test users**, add your own Google email
6. Click **Save and Continue**

### 3.4 Create OAuth Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Application type: **Web application**
4. Name: e.g., `CWS Deploy`
5. Under **Authorized redirect URIs**, add: `https://developers.google.com/oauthplayground`
6. Click **Create**
7. Note the **Client ID** and **Client Secret**

### 3.5 Get a Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (top right) and check **Use your own OAuth credentials**
3. Enter your **Client ID** and **Client Secret**
4. In the left panel under **Step 1**, find **Chrome Web Store API v1.1** and select `https://www.googleapis.com/auth/chromewebstore`
5. Click **Authorize APIs** and sign in with your Google account
6. Click **Exchange authorization code for tokens**
7. Copy the **Refresh token**

## 4. Add GitHub Secrets

Go to your GitHub repo > **Settings** > **Secrets and variables** > **Actions** > **New repository secret** and add:

| Secret | Value | Where to find it |
|--------|-------|-------------------|
| `CWS_EXTENSION_ID` | `abcdefghij...` | Developer Dashboard URL |
| `CWS_CLIENT_ID` | `123456...apps.googleusercontent.com` | Google Cloud Console > Credentials |
| `CWS_CLIENT_SECRET` | `GOCSPX-...` | Google Cloud Console > Credentials |
| `CWS_REFRESH_TOKEN` | `1//0e...` | OAuth Playground (Step 3.5) |

## 5. Deploy

1. Bump version: `npm run version:patch`
2. Commit and push
3. Go to **Actions** tab > **Deploy to Chrome Web Store** > **Run workflow**
4. Choose publish target:
   - `default` — public listing
   - `trustedTesters` — only trusted testers can see it
5. Click **Run workflow**

The workflow will build the zip, upload it to Chrome Web Store, and create a GitHub Release.

---

## Troubleshooting

### "The item is not found" error

- Double-check your `CWS_EXTENSION_ID` secret matches the ID in the Developer Dashboard URL
- Make sure you have saved a draft listing (Step 2)

### "Invalid client_id" or "Invalid client_secret"

- Verify the values in GitHub Secrets match exactly what Google Cloud Console shows
- Make sure the Chrome Web Store API is enabled (Step 3.2)

### "Invalid grant" or refresh token error

- Refresh tokens expire if the OAuth consent screen is in **Testing** mode and the token is older than 7 days
- To fix: go to **OAuth consent screen** > publish the app (or re-generate the refresh token in OAuth Playground)
- Make sure you added your email as a test user (Step 3.3)

### "This version already exists" error

- Bump the version in `manifest.json` with `npm run version:patch`
- The workflow checks for existing git tags to prevent duplicate deploys

### Build fails or zip is too large

- The CI pipeline enforces a 10 MB zip size limit
- Check that `node_modules/` and other large directories are not included in the build
- Review the `build:chrome` script in `package.json`
