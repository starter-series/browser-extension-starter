# Firefox Add-ons (AMO) Publishing Setup

Step-by-step guide to set up Firefox Add-ons publishing for the CD pipeline.

---

## 1. Create a Firefox Add-ons Developer Account

1. Go to [Firefox Add-on Developer Hub](https://addons.mozilla.org/developers/)
2. Sign in with your Firefox account (or create one)
3. No registration fee required

## 2. Submit Your Add-on

1. Go to [Submit a New Add-on](https://addons.mozilla.org/developers/addon/submit/distribution)
2. Choose distribution:
   - **On this site** — listed on AMO, reviewed by Mozilla
   - **On your own** — self-distributed, signed by Mozilla but not listed
3. Upload your extension zip (`npx web-ext build` to generate)
4. Fill in the required fields:
   - **Name** and **Summary**
   - **Description**
   - **Category**
   - At least one **screenshot**
5. Submit for review

> Firefox add-on reviews typically take 1-5 days for the initial submission. Updates are usually faster.

## 3. Get API Credentials

The CD pipeline uses the AMO API to submit updates via `web-ext sign`.

1. Go to [AMO API Keys](https://addons.mozilla.org/en-US/developers/addon/api/key/)
2. Sign in with your Firefox account
3. Generate API credentials
4. Note the two values:
   - **JWT issuer** (API key) — looks like `user:12345678:901`
   - **JWT secret** — a long alphanumeric string

> These credentials do not expire, but you can regenerate them at any time.

## 4. Add GitHub Secrets

Go to your GitHub repo > **Settings** > **Secrets and variables** > **Actions** > **New repository secret** and add:

| Secret | Value | Where to find it |
|--------|-------|-------------------|
| `AMO_JWT_ISSUER` | `user:12345678:901` | AMO API Keys page |
| `AMO_JWT_SECRET` | `long-alphanumeric-string` | AMO API Keys page |

## 5. Deploy

1. Bump version: `npm run version:patch`
2. Commit and push
3. Go to **Actions** tab > **Deploy to Firefox Add-ons** > **Run workflow**
4. Choose release channel:
   - `listed` — public listing on AMO (requires Mozilla review)
   - `unlisted` — self-distributed, signed but not listed
5. Click **Run workflow**

The workflow will build the extension, submit it to AMO via `web-ext sign`, and save the artifact.

---

## Manifest Compatibility Notes

This template uses Manifest V3 which works in both Chrome and Firefox. A few things to note:

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Service workers | Supported | Supported (Firefox 121+) |
| `browser_specific_settings` | Ignored | Required for AMO |
| Content script world | `MAIN` / `ISOLATED` | `ISOLATED` only |
| Promise-based APIs | `chrome.*` namespace | `browser.*` or `chrome.*` |

If your extension needs Firefox-specific manifest fields, add them under `browser_specific_settings` in `manifest.json`:

```json
{
  "browser_specific_settings": {
    "gecko": {
      "id": "your-extension@example.com",
      "strict_min_version": "109.0"
    }
  }
}
```

---

## Troubleshooting

### "JWT authentication failed" error

- Double-check your `AMO_JWT_ISSUER` and `AMO_JWT_SECRET` secrets match the values on the AMO API Keys page
- If you regenerated your keys, update the GitHub Secrets with the new values

### "Version already exists" error

- Bump the version in `manifest.json` with `npm run version:patch`
- AMO does not allow re-uploading the same version number

### "Add-on not found" error

- For `listed` submissions, you must have an existing add-on listing on AMO (Step 2)
- For `unlisted` submissions, the add-on is created automatically on first sign

### Review takes too long

- Initial submissions typically take 1-5 days
- Updates to existing add-ons are usually faster
- If your add-on uses broad permissions (e.g., `<all_urls>`), expect longer review times
- Check the [AMO Review Policies](https://extensionworkshop.com/documentation/publish/add-on-policies/) for guidelines

### Build fails

- Make sure `web-ext` is installed: `npm install` (it is a dev dependency)
- Run `npx web-ext lint` locally to catch validation errors before submitting
- Check that your `manifest.json` has all required fields for Firefox
