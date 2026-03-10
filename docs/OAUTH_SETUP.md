# Chrome Web Store OAuth Setup Guide

Step-by-step guide to set up Google OAuth credentials for automated Chrome Web Store deployment.

## Prerequisites

- A Google account
- A Chrome extension already uploaded to CWS (at least as a draft)
- Access to your GitHub repository settings

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown (top bar) → **New Project**
3. Name it (e.g., `My Extension CD`) → **Create**

## Step 2: Enable Chrome Web Store API

1. Go to **APIs & Services** → **Library**
2. Search for `Chrome Web Store API`
3. Click **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** → **Create**
3. Fill in:
   - App name: `My Extension CD`
   - User support email: your email
   - Developer contact email: your email
4. Click **Save and Continue** through Scopes (skip)
5. Add your Gmail as a **test user** → **Save**

> **Important:** You must add yourself as a test user, otherwise you'll get "access_denied" when authorizing.

## Step 4: Create OAuth Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `My Extension CD`
5. Under **Authorized redirect URIs**, add:
   ```
   https://developers.google.com/oauthplayground
   ```
6. Click **Create**
7. Copy **Client ID** and **Client Secret**

> **Note:** You must select "Web application", not "Desktop app". Desktop app type does not support redirect URIs, which are required for the OAuth Playground.

## Step 5: Get Refresh Token

1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click the gear icon (top right) → Check **Use your own OAuth credentials**
3. Enter your **Client ID** and **Client Secret**
4. In Step 1, enter this scope in the input box:
   ```
   https://www.googleapis.com/auth/chromewebstore
   ```
5. Click **Authorize APIs**
6. Sign in with your Google account
7. If you see "Google hasn't verified this app":
   - Click **Advanced** → **Go to [App Name] (unsafe)**
8. Click **Allow**
9. In Step 2, click **Exchange authorization code for tokens**
10. Copy the **Refresh token**

## Step 6: Add GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Add these 4 secrets:

| Secret Name | Value |
|-------------|-------|
| `CWS_EXTENSION_ID` | Your extension ID from CWS dashboard URL |
| `CWS_CLIENT_ID` | Client ID from Step 4 |
| `CWS_CLIENT_SECRET` | Client Secret from Step 4 |
| `CWS_REFRESH_TOKEN` | Refresh token from Step 5 |

### Finding your Extension ID

Your extension ID is in the Chrome Web Store Developer Dashboard URL:
```
https://chrome.google.com/webstore/devconsole/.../[EXTENSION_ID]/...
```

Or in the published extension URL:
```
https://chromewebstore.google.com/detail/my-extension/[EXTENSION_ID]
```

## Done

Once secrets are configured, go to **Actions** tab → **Deploy to Chrome Web Store** → **Run workflow** to:

1. Build the extension zip
2. Upload to Chrome Web Store
3. Submit for review

You can choose between `default` (public) and `trustedTesters` publish targets.

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure you added `https://developers.google.com/oauthplayground` as an authorized redirect URI in Step 4.

### "access_denied" error
- Make sure you added yourself as a test user in Step 3.

### "access_blocked: app has not completed verification"
- Same as above — add yourself as a test user in the OAuth consent screen.

### Token expired
- Refresh tokens don't expire unless you revoke them or change your password. If it stops working, repeat Step 5.

### Upload succeeds but publish fails
- Your extension must have been manually uploaded to CWS at least once before automated publishing works.
- Check that the version in `manifest.json` is higher than the currently published version.
