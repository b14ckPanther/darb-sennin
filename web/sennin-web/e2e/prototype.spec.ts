import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

const onPhone = () => test.info().project.name === 'phone'

// Phase 3 flows on demo data (docs/PLAN.md Phase 3, task 5). Nothing here reaches a network.

const screens = [
  ['today', '/'],
  ['library', '/library'],
  ['workspace', '/problems/ledger-reconciliation'],
  ['verdict', '/submissions/sub-040'],
  ['verdict earned', '/submissions/sub-038'],
  ['pseudo verdict', '/submissions/sub-039'],
  ['boss verdict', '/submissions/sub-034'],
  ['weakness', '/weakness'],
  ['boss', '/boss'],
  ['history', '/history'],
  ['ranks', '/ranks'],
  ['settings', '/settings'],
  ['profile', '/profile'],
  ['not found', '/nowhere'],
] as const

async function settled(page: Page) {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)))
}

async function blocking(page: Page) {
  const results = await new AxeBuilder({ page }).analyze()
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
}

async function setDemo(page: Page, demo: Record<string, boolean>) {
  await page.goto('/settings')
  await page.evaluate((d) => {
    localStorage.setItem('sennin.settings', JSON.stringify({ demo: d }))
  }, demo)
}

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} scheme`, () => {
    test.use({ colorScheme: scheme })
    for (const [name, path] of screens) {
      test(`${name} has no serious or critical axe violations`, async ({ page }) => {
        await page.goto(path)
        await expect(page.locator('h1').first()).toBeAttached()
        await settled(page)
        expect(await blocking(page)).toEqual([])
      })
    }
  })
}

for (const [name, path] of screens) {
  test(`${name} never scrolls sideways`, async ({ page }) => {
    await page.goto(path)
    await settled(page)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('submit and watch the verdict resolve, evidence before the score', async ({ page }) => {
  await page.goto('/problems/ledger-reconciliation')
  await page.getByRole('button', { name: 'Submit' }).click()
  const sheet = page
    .getByRole('article')
    .filter({ has: page.getByRole('heading', { name: 'Hidden tests' }) })
  await expect(
    sheet.locator('p:not(.sr-only)', { hasText: 'Queued. Waiting for a judge.' }),
  ).toBeVisible()
  // Cases resolve one by one; the score is not on screen while they do.
  await expect(sheet.locator('span', { hasText: /^[1-9] of 12 resolved$/ })).toBeVisible()
  await expect(sheet.getByRole('heading', { name: 'Score' })).toHaveCount(0)
  await expect(sheet.locator('span', { hasText: '12 of 12 resolved' })).toBeVisible({
    timeout: 10_000,
  })
  await expect(sheet.locator('li[data-status="fail"]').first()).toContainText('Input that broke it')
  await expect(sheet.getByRole('heading', { name: 'Findings' })).toBeVisible({ timeout: 10_000 })
  await expect(sheet.getByRole('heading', { name: 'Score' })).toBeVisible()
  await expect(sheet.getByText('47', { exact: true })).toBeVisible()
  await expect(sheet.getByText('Earned', { exact: true })).toHaveCount(0)
})

test('fixed code earns the stamp, and the new attempt lands in history', async ({ page }) => {
  test.skip(onPhone(), 'covered on desktop; the editor input is the same on phones')
  await page.goto('/problems/ledger-reconciliation')
  const editor = page.locator('.cm-content')
  await editor.click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.type('from collections import Counter\n')
  await page.keyboard.press('ControlOrMeta+Enter')
  await expect(page.getByText('Earned', { exact: true })).toBeVisible({ timeout: 15_000 })
  // The demo backend lives in memory, so move within the app rather than reloading it.
  await page.getByRole('link', { name: 'History', exact: true }).click()
  await expect(page.getByRole('button', { name: /Ledger reconciliation/ }).first()).toContainText(
    'Accepted',
  )
})

test('jump from a finding chip to its evidence by keyboard', async ({ page }) => {
  await page.goto('/submissions/sub-040')
  const chip = page.getByRole('button', { name: 'Show case 04' })
  await chip.focus()
  await expect(page.locator('#case-04')).toHaveAttribute('data-lit', 'true')
  await page.keyboard.press('Enter')
  await expect(page.locator('#case-04')).toBeFocused()
  await expect(page.locator('#case-04')).toBeInViewport()

  const lines = page.getByRole('button', { name: 'Show lines 11-15' })
  await lines.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#code-line-11')).toBeFocused()
  await expect(page.locator('#code-line-12')).toHaveClass(/bg-highlight/)
})

test('J and K walk the findings, E opens the evidence', async ({ page }) => {
  await page.goto('/submissions/sub-040')
  await page.getByRole('button', { name: 'Show case 04' }).focus()
  await page.keyboard.press('j')
  await expect(page.locator('[data-finding]').nth(1)).toBeFocused()
  await page.keyboard.press('k')
  await expect(page.locator('[data-finding]').nth(0)).toBeFocused()
  await page.keyboard.press('e')
  await expect(page.locator('#case-04')).toBeFocused()
})

test('keyboard only: skip link, nav, shortcut sheet and the G then L jump', async ({ page }) => {
  test.skip(onPhone(), 'desktop navigation')
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Today' }).first()).toBeVisible()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('#content')).toBeFocused()
  await page.keyboard.press('?')
  await expect(page.getByRole('dialog', { name: 'Keyboard shortcuts' })).toBeVisible()
  await page.keyboard.press('Escape')
  await page.keyboard.press('g')
  await page.keyboard.press('l')
  await expect(page).toHaveURL(/\/library$/)
  await page.getByRole('searchbox', { name: 'Search titles' }).focus()
  await page.keyboard.type('coins')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: /Fewest coins for change/ })).toBeVisible()
})

test('the editor never traps Tab: Escape then Tab leaves it', async ({ page }) => {
  test.skip(onPhone(), 'hardware keyboard path')
  await page.goto('/problems/fewest-coins')
  await page.locator('.cm-content').click()
  await page.keyboard.press('Tab')
  await expect(page.locator('.cm-content')).toBeFocused()
  await page.keyboard.press('Escape')
  await page.keyboard.press('Tab')
  await expect(page.locator('.cm-content')).not.toBeFocused()
})

test('run samples reports each sample in words', async ({ page }) => {
  await page.goto('/problems/ledger-reconciliation')
  await page.getByRole('button', { name: 'Run samples' }).click()
  await expect(page.getByText('1 of 2 samples pass')).toBeVisible()
})

test('library filters live in the URL and the filter sheet opens on phones', async ({ page }) => {
  await page.goto('/library?status=clean')
  await expect(page.getByRole('button', { name: /Ledger reconciliation/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Fewest coins for change/ })).toBeVisible()
  if (onPhone()) {
    await page.getByRole('button', { name: /Filters/ }).click()
    await expect(page.getByRole('dialog', { name: 'Filters' })).toBeVisible()
  }
})

test.describe('empty and error states', () => {
  test('a paused judge queues the run and says so', async ({ page }) => {
    await setDemo(page, { judgePaused: true })
    await page.goto('/problems/fewest-coins')
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(page.getByText('Submission queued. It runs when the judge is back.')).toBeVisible()
    await expect(
      page.locator('p:not(.sr-only)', { hasText: 'Queued. Waiting for a judge.' }),
    ).toBeVisible()
  })

  test('a reviewer outage keeps the grade and says why there are no findings', async ({ page }) => {
    await setDemo(page, { reviewerDown: true })
    await page.goto('/problems/fewest-coins')
    await page.getByRole('button', { name: 'Submit' }).click()
    await expect(
      page
        .getByRole('article')
        .getByText('Review unavailable: grade based on tests and measurements only.'),
    ).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('article').getByRole('heading', { name: 'Score' })).toBeVisible()
  })

  test('a new account sees invitations, not blank pages', async ({ page }) => {
    await setDemo(page, { newAccount: true })
    await page.goto('/history')
    await expect(page.getByRole('heading', { name: 'No submissions yet' })).toBeVisible()
    await page.goto('/weakness')
    await expect(page.getByRole('heading', { name: 'No weaknesses yet' })).toBeVisible()
    expect(await blocking(page)).toEqual([])
  })

  test('offline shows a plain error with a retry', async ({ page }) => {
    await setDemo(page, { offline: true })
    await page.goto('/library')
    await expect(page.getByRole('heading', { name: 'Cannot reach Sennin' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
  })
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the verdict opens split at once and rows switch without transitions', async ({ page }) => {
    test.skip(onPhone(), 'the split layout is desktop')
    await page.goto('/problems/ledger-reconciliation')
    await page.getByRole('button', { name: 'Submit' }).click()
    const verdict = page.getByRole('region', { name: 'Verdict' })
    await expect(verdict).toBeVisible()
    expect(await verdict.evaluate((el) => getComputedStyle(el).transform)).toMatch(
      /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/,
    )
    await expect(page.locator('span', { hasText: '12 of 12 resolved' })).toBeVisible({
      timeout: 10_000,
    })
    const mark = page.locator('li[data-status="pass"] svg').first()
    expect(await mark.evaluate((el) => getComputedStyle(el).animationDuration)).toBe('1e-05s')
  })

  test('boss segments are simply empty, not mid-fall', async ({ page }) => {
    await page.goto('/boss')
    const fallen = page.locator('[data-fallen="true"] > span').first()
    expect(await fallen.evaluate((el) => getComputedStyle(el).opacity)).toBe('0')
  })
})

test('every target on a phone is at least 44 points', async ({ page }) => {
  test.skip(!onPhone(), 'touch targets are a phone check')
  for (const path of ['/', '/library', '/profile', '/settings', '/history']) {
    await page.goto(path)
    await settled(page)
    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('main button, main a, main select, nav button')]
        .filter((el) => el.offsetParent !== null && !el.closest('.sr-only'))
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.height < 44 && r.width > 0)
        .map(
          ({ el, r }) =>
            `${el.tagName} "${el.textContent.trim().slice(0, 30)}" ${String(Math.round(r.height))}px`,
        ),
    )
    expect(small, path).toEqual([])
  }
})
