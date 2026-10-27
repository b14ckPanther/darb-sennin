// Captures the Phase 2 comps at desktop and 390 px, light and dark, into docs/screenshots/phase-02.
// Usage: npm run build && npx vite preview --port 4173 & node scripts/screenshots.mjs [baseUrl]
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(here, '../../../docs/screenshots/phase-02')
const base = process.argv[2] ?? 'http://localhost:4173'
mkdirSync(out, { recursive: true })

const views = ['verdict', 'verdict-earned', 'today', 'catalogue']
const viewports = {
    desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
    phone: { width: 390, height: 844, deviceScaleFactor: 2 },
}

const browser = await chromium.launch()
for (const scheme of ['light', 'dark']) {
    for (const [device, viewport] of Object.entries(viewports)) {
        const context = await browser.newContext({
            viewport: { width: viewport.width, height: viewport.height },
            deviceScaleFactor: viewport.deviceScaleFactor,
            colorScheme: scheme,
            reducedMotion: 'reduce',
        })
        const page = await context.newPage()
        for (const view of views) {
            await page.goto(`${base}/?view=${view}`)
            // Screens load on demand after the demo backend; wait for one before capturing.
            await page.locator('h1').first().waitFor({ state: 'attached' })
            await page.waitForLoadState('networkidle')
            await page.evaluate(() => document.fonts.ready)
            // Phones: the first screen as the user sees it (fixed bars in place), then the full length.
            // Full-page captures draw fixed elements where the viewport was, so the tab bar can float.
            const file = resolve(out, `${view}-${device}-${scheme}.png`)
            await page.screenshot({ path: file, fullPage: device === 'desktop' })
            if (device === 'phone') {
                await page.screenshot({
                    path: resolve(out, `${view}-${device}-${scheme}-full.png`),
                    fullPage: true,
                })
            }
            console.log(file)
        }
        await context.close()
    }
}
await browser.close()
