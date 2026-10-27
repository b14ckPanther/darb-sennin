import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const views = ['catalogue', 'verdict', 'verdict-earned', 'today'] as const

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} scheme`, () => {
    test.use({ colorScheme: scheme })

    for (const view of views) {
      test(`${view} has no serious or critical axe violations`, async ({ page }) => {
        await page.goto(`/?view=${view}`)
        await page.evaluate(() => document.fonts.ready)
        // Scan settled pages: a fade caught halfway is not the colour the user reads.
        await page.evaluate(() =>
          Promise.allSettled(document.getAnimations().map((a) => a.finished)),
        )
        const results = await new AxeBuilder({ page }).analyze()
        const blocking = results.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical',
        )
        expect(
          blocking.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
        ).toEqual([])
      })
    }
  })
}

for (const view of views) {
  test(`${view} never scrolls sideways`, async ({ page }) => {
    await page.goto(`/?view=${view}`)
    await page.evaluate(() => document.fonts.ready)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('evidence chips jump to their source by keyboard', async ({ page }) => {
  await page.goto('/?view=verdict')
  const chip = page.getByRole('button', { name: 'Show lines 11-15' })
  await chip.focus()
  await expect(page.locator('#code-line-12')).toHaveClass(/bg-highlight/)
  await page.keyboard.press('Enter')
  await expect(page.locator('#code-line-11')).toBeInViewport()
})

test('the catalogue sheet opens, traps focus and closes on Escape', async ({ page }) => {
  await page.goto('/?view=catalogue')
  await page.getByRole('button', { name: 'Open sheet' }).click()
  const dialog = page.getByRole('dialog', { name: 'Filter problems' })
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('the earned stamp is in place on first paint', async ({ page }) => {
    await page.goto('/?view=verdict-earned')
    const stamp = page.getByText('Earned', { exact: true })
    await expect(stamp).toBeVisible()
    expect(await stamp.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  })
})

test('the open sheet and a shown toast have no serious or critical axe violations', async ({
  page,
}) => {
  await page.goto('/?view=catalogue')
  await page.getByRole('button', { name: 'Show toast' }).click()
  await page.getByRole('button', { name: 'Open sheet' }).click()
  await page.evaluate(() => Promise.allSettled(document.getAnimations().map((a) => a.finished)))
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(blocking.map((v) => v.id)).toEqual([])
})

test('a swipe on a list row does not open the item', async ({ page }) => {
  await page.goto('/?view=today')
  const row = page.getByRole('button', { name: /Sliding window maximum/ })
  const box = await row.boundingBox()
  if (!box) throw new Error('row not visible')
  const y = box.y + box.height / 2
  await page.mouse.move(box.x + box.width - 20, y)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width - 200, y, { steps: 8 })
  await page.mouse.up()
  await expect(page.locator('li[data-open="true"]')).toHaveCount(1)
  await expect(page).toHaveURL(/view=today$/)
})
