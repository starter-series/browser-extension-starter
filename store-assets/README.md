# Store Assets Starter Pack

This folder contains the source inputs for `shotkit.config.js` plus generated
capture outputs.

Tracked source files:

- `STORE_LISTING.md` — human-edited listing copy.
- `fixtures/` — deterministic pages that the built extension can run against.
- `templates/` — promo tile HTML templates.

Generated files are ignored by git. The mp4 and handoff files are produced when
the configured `shotkit` dependency includes the handoff/video pipeline; older
package builds still produce the existing PNG/WEBM/listing outputs.

- CWS screenshots and promo tiles: `*.png`
- Source demo recordings: `*.webm`
- SNS-ready demo clips: `*.mp4`
- Handoff contract: `storyboard.json`, `captions.json`,
  `shotkit-manifest.json`
- Rendered listing copy: `description.md`

For external editing tools or MCP adapters, read `shotkit-manifest.json` first
and select files by `assets[].role` rather than guessing filenames. Use
`handoff.adapterHints[]` to see which downstream connector or editor is a good
next step for the assets that were generated.
