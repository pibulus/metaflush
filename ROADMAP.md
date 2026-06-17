# metaflush — Roadmap 🧻

Living candidate list. North star: **drop a file → metadata gone → still pixel-perfect,
all in your browser, nothing uploaded.**

## ✅ v1 (built + verified, not deployed yet)
- Lossless EXIF/XMP/IPTC/comment stripping for JPEG/PNG/WebP (segment-level, no re-encode)
- Verified: GPS/Make/Model/Artist removed, 46→23 tags, pixels identical
- Drop/batch, 4 themes, mascot (toiletroll), shell parity, supporter stub

## 🎯 v2 candidates
- **Deploy to metaflush.app** (register on Porkbun → Cloudflare → Pi `deploy_app.sh`)
- **Icons** — favicon/og-image/apple-touch from the toiletroll (rsvg-convert recipe)
- **Strict vs standard mode surfaced** — the service already has `strict` (also strips
  ICC); expose it as the one toggle ("nuke everything" vs "keep colour profile")
- **More formats** — strip metadata from PDF, mp4/mov (the moov atom), HEIC
- **"What was in it?" receipt** — show the user what got stripped (GPS, device, etc.) —
  makes the privacy win *visible*, great shareable moment
- **Contributor**: batch a whole folder, auto-strip-on-export presets
- Real checkout (shared with the family's supporter system)

## ✋ Not doing
Server upload, accounts, re-encoding (lossless is the whole point).

---
_Part of the drag-into-mascot family — see `apps/_ideas/`._
