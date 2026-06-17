# TODO before launch: generate icons

app.html + manifest.webmanifest reference these, which don't exist yet
(mascot art is being finalized separately):

- icon-192.png  (192×192, mascot on default-theme bg, rounded)
- icon-512.png  (512×512, same)
- og-image.png  (1200×630 social card, mascot + title + tagline)

Generate from the final mascot SVG with rsvg-convert (handles gradients;
ImageMagick does NOT render SVG gradients — falls back to black).
See dr_shrink/static for the reference set + the render approach.
