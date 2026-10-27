import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('home has no serious or critical axe violations', async ({ page }) => {
  await page.goto('/')
  const results = await new AxeBuilder({ page }).analyze()
  const blocking = results.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(blocking).toEqual([])
})

test('home has a document title and language', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Darb Sennin$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
})
