# Chrome Web Store — Store Listing

Edit this file with your real listing copy. `npm run capture:store` extracts the
sections below into `store-assets/description.md` (copy/paste-ready) and flags any
field that exceeds a CWS length limit.

Keep claims honest — use the same discipline as the project README:
**Currently implemented** (backed by code) vs **Planned** (on a public roadmap).
Don't describe a planned feature as if it ships today.

## Title (max 75 chars)

My Extension — a short, specific value proposition

## Summary (max 132 chars)

The one-line pitch shown under your title in search results. Lead with the verb.

## Description (for Store listing)

What the extension does, who it's for, and how it works. A few short paragraphs
beat one long wall of text. Describe only what the installed code actually does.

If your extension interoperates with another product or brand, reference it
**nominatively** (descriptively) and add a disclaimer that you are an
independent, unaffiliated project — see the example consumer (skillBridge) for
wording.

## What's New

- The headline change in this version.
- The second-most-interesting change.

## Category

Productivity

## Permission Justifications

For each permission in manifest.json, one sentence on why it's needed. CWS review
asks for these; writing them here keeps them versioned alongside the code.

### storage
Saves user preferences (e.g. enabled state, highlight color) locally.
