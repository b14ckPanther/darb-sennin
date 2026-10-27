# Third-party assets

Every third-party font, icon set, image, sound or other asset in this repo, with its licence (CLAUDE.md 1.4). The Ensō mark, wordmarks and icons in `brand/` are original, made in code.

| Asset | Source | Licence | Where used | Added |
|---|---|---|---|---|
| Zen Antique | Google Fonts via `@fontsource/zen-antique`; also `brand/fonts/` | SIL OFL 1.1 (`brand/fonts/OFL-ZenAntique.txt`) | Display type in the app; wordmark | 2026-10-26 |
| Geist, Geist Mono | Vercel, via `@fontsource-variable/geist`, `@fontsource-variable/geist-mono`; Geist also in `brand/fonts/` | SIL OFL 1.1 (`brand/fonts/OFL-Geist.txt`) | Interface text, code and evidence; braces in the mark | 2026-10-26 |
| Yuji Boku | Google Fonts, `brand/fonts/` | SIL OFL 1.1 (`brand/fonts/OFL-YujiBoku.txt`) | 仙人 in the wordmark only | 2026-10-26 |
| Solar icon set | 480 Design, via `@iconify-json/solar` (subset generated into `web/sennin-web/src/design/icons/solar.generated.json`) | CC BY 4.0 | Every icon in the app, through `<Icon>` | 2026-10-26 |

Fonts are bundled and self-hosted; nothing loads from a font CDN at runtime.
