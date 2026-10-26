# Darb Sennin brand

Sennin is a Darb product. It wears Darb's colours (night, forest, gold, ivory) and has its own mark: **an ensō, the Zen circle drawn in one gold stroke and left open, around a pair of code braces.** Practice is a circle that never closes; you come back tomorrow and draw it again. 仙人 (sennin) is the hermit master who never stops training.

Chosen by Nour from four directions (the summit, the island, the verdict seal, the ensō). The other three are kept in `concepts/`; the verdict seal is a candidate for the in-app "earned" moment.

## See it

```sh
cd brand && npm install
node scripts/serve.mjs          # http://127.0.0.1:4180/ : brand sheet with every asset
# open /render.html?variant=tile or ?variant=og&w=1200&h=630 to see the live 3D scene
```

## Rebuild every asset

```sh
PWEXE=/path/to/chromium-headless-shell npm run build
```

Nothing is drawn by hand and nothing is hardcoded in the build:

| File | Holds |
|---|---|
| `src/tokens.json` | colours and roles, type, the ensō's shape (start, sweep, brush width, tail), render settings, icon sizes, copy |
| `src/enso.js` | the brush path and width, shared by the 3D scene and the flat SVGs, so they always match |
| `src/scene.js` | Three.js scene: the ensō as a gold brush tube, Geist braces extruded in ivory, forest paper, bloom |
| `render.html` | renders one variant of the scene (`tile` for icons, `og` for social cards with the copy) |
| `scripts/build.mjs` | renders the masters, cuts every icon, writes the SVG marks, wordmarks, manifest and CSS tokens |

## What's in `exports/`

| Path | Use |
|---|---|
| `icons/icon-192.png`, `icon-512.png` | PWA icons, purpose `any` (squircle cut) |
| `icons/icon-maskable-192.png`, `-512.png` | PWA maskable (mark inside the 80% safe zone) |
| `icons/apple-touch-icon.png` | iOS home screen, 180 px, opaque |
| `icons/icon-desktop-1024.png` | Desktop: macOS grid, 824 px body with system shadow |
| `icons/favicon.ico`, `favicon.svg`, `favicon-16/32/48.png` | Browser tab: heavier stroke and bigger braces so both read at 16 px |
| `icons/badge-96.png` | Notification badge and Android monochrome icon |
| `svg/mark-on-forest.svg` | The full flat mark on its forest tile |
| `svg/mark-gold.svg`, `mark-ivory.svg`, `mark-ink.svg` | The mark alone, for any background |
| `svg/wordmark-on-dark.svg`, `-on-light.svg` | Lockup: mark, Darb, Sennin, 仙人 (text outlined, no font needed) |
| `social/og-image.png` | 1200 x 630 sharing card |
| `social/hero.png` | 2400 x 1260 README hero |
| `manifest.webmanifest`, `head.html` | Drop-in PWA manifest and `<head>` tags |
| `tokens.css` | CSS custom properties generated from `tokens.json` |

## Rules

- The ensō is always one open stroke, gold on forest or night (flat variants: ivory or ink). Never close the circle.
- Seal red (`vermilion`) is reserved for the earned-praise stamp in the app. It never appears in the mark.
- No martial-arts kitsch: no bamboo, belts or dragons. The ensō is the only brush element.
- Darb's doorway outline belongs to Darb itself; Sennin never uses it.
- Every visual is original and made in code. No official Dragon Ball art, logos, characters or audio.
- Fonts: Zen Antique (display), Geist (interface and the braces) and Yuji Boku (仙人 only), all under the SIL Open Font License (`fonts/`).
