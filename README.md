# metaflush 🧻

**Strip metadata, keep your privacy.** Drop a photo or file on the mascot and it
wipes EXIF, GPS, camera/device info, and other tracking metadata — **losslessly**
(no re-encode, your pixels are untouched), 100% in your browser. Nothing is uploaded.

## Why
Photos quietly carry where you were, what device you used, and when. Posting them
leaks all of it. metaflush flushes it before you share — no sketchy upload site, no ads.

## How
Parses the binary file structure directly and removes the metadata segments
(EXIF/APP1/APP2/XMP/IPTC/comments), keeping the image data byte-for-byte. Verified:
a JPEG with GPS + Make/Model/Artist → all stripped, pixels identical.

## Stack
SvelteKit · Svelte 5 · Tailwind + DaisyUI · `@sveltejs/adapter-node`.
Core: `src/lib/services/metadataService.js` (client-side, zero deps).
Living mascot via the [softstack-mascot](https://github.com/pibulus/softstack-mascot) kit.

## Dev
```bash
npm install
npm run dev      # http://localhost:3004
npm run build
npm run check
```

## Themes
Four themes (clean / porcelain / kraft / lavender) via `html[data-theme]` + CSS vars.

## Deploy
Self-hosted on a Raspberry Pi (`pibulus-os` `deploy_app.sh` node-build pattern).
Target domain: **metaflush.app**.

---
Part of the drag-into-mascot micro-app family (DrShrink · metaflush · cryptkeep · iconmakeit).
