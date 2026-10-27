// Captures every Phase 3 screen at 1440 px and 390 px, light and dark, into docs/screenshots/phase-03.
// Usage: npm run build && npx vite preview --port 4173 & node scripts/screenshots-phase3.mjs [baseUrl]
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'

const here = dirname(fileURLToPath(import.meta.url))
const out = resolve(here, '../../../docs/screenshots/phase-03')
const base = process.argv[2] ?? 'http://localhost:4173'
mkdirSync(out, { recursive: true })

// [file name, path, optional action that brings the screen to the state worth showing]
const only = process.argv[3]
const all = [
  ['01-workspace', '/problems/ledger-reconciliation'],
  ['02-verdict-live', '/problems/ledger-reconciliation', 'submit'],
  ['03-verdict-stored', '/submissions/sub-040'],
  ['04-verdict-earned', '/submissions/sub-038'],
  ['05-today', '/'],
  ['06-library', '/library'],
  ['07-weakness', '/weakness'],
  ['08-boss', '/boss'],
  ['09-boss-verdict', '/submissions/sub-034'],
  ['10-history', '/history'],
  ['11-ranks', '/ranks'],
  ['12-settings', '/settings'],
  ['13-profile', '/profile'],
  ['14-pseudo-verdict', '/submissions/sub-039'],
  ['15-state-offline', '/library', { offline: true }],
  ['16-state-new-account', '/history', { newAccount: true }],
  ['17-state-reviewer-unavailable', '/problems/fewest-coins', { reviewerDown: true }, 'submit'],
  ['18-state-judge-paused', '/problems/fewest-coins', { judgePaused: true }, 'submit'],
]
const screens = only ? all.filter(([n]) => n.startsWith(only)) : all

const viewports = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  phone: { width: 390, height: 844, deviceScaleFactor: 2 },
}

const browser = await chromium.launch()
for (const scheme of ['light', 'dark']) {
  for (const [device, viewport] of Object.entries(viewports)) {
    for (const [name, path, ...rest] of screens) {
      const demo = rest.find((r) => typeof r === 'object')
      const submit = rest.includes('submit')
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: viewport.deviceScaleFactor,
        colorScheme: scheme,
        hasTouch: device === 'phone',
      })
      const page = await context.newPage()
      if (demo) {
        await page.goto(`${base}/settings`)
        await page.evaluate((d) => localStorage.setItem('sennin.settings', JSON.stringify({ demo: d })), demo)
      }
      await page.goto(`${base}${path}`)
      await page.locator('h1').first().waitFor({ state: 'attached' })
      await page.waitForLoadState('networkidle')
      if (submit) {
        await page.getByRole('button', { name: 'Submit' }).click()
        await page.waitForTimeout(device === 'phone' ? 2600 : 7000)
      }
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(400)
      const file = resolve(out, `${name}-${device}-${scheme}.png`)
      await page.screenshot({ path: file, fullPage: device === 'desktop' && !path.startsWith('/problems') })
      console.log(file)
      await context.close()
    }
  }
}
await browser.close()
