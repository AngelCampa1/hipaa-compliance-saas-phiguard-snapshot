/**
 * Mobile spec — legal pages and lead-magnet thank-you page.
 *
 * Wave 3 Worker C owns these pages:
 *   - /terms
 *   - /privacy
 *   - /resources/thank-you  (lead-magnet redemption landing)
 *
 * Runs against all three mobile viewport projects (320, 375, 414).
 */

import { test, expect } from '@playwright/test'
import { waitForReady, noHorizontalScroll, touchTargets } from '../_helpers/mobile'

const LEGAL_ROUTES = ['/terms', '/privacy'] as const

for (const route of LEGAL_ROUTES) {
  test.describe(`${route} — mobile layout`, () => {
    test('page loads with HTTP 200', async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status()).toBe(200)
    })

    test('no horizontal scroll', async ({ page }) => {
      await page.goto(route)
      await waitForReady(page)
      await noHorizontalScroll(page)
    })

    test('long URLs and email addresses do not overflow', async ({ page }) => {
      await page.goto(route)
      await waitForReady(page)
      const main = page.locator('main')
      const overflow = await main.evaluate((el) => el.scrollWidth > el.clientWidth)
      expect(overflow, `${route} main content should not overflow horizontally`).toBe(false)
    })

    test('touch targets meet 44×44 minimum', async ({ page }) => {
      await page.goto(route)
      await waitForReady(page)
      const violations = await touchTargets(page)
      expect(violations, `${route} has touch target violations: ${violations.join('; ')}`).toHaveLength(0)
    })
  })
}

test.describe('/resources/thank-you — lead-magnet landing', () => {
  const THANK_YOU_URL = '/resources/thank-you?slug=hipaa-risk-analysis-worksheet'

  test('page loads with HTTP 200', async ({ page }) => {
    const response = await page.goto(THANK_YOU_URL)
    expect(response?.status()).toBe(200)
  })

  test('no horizontal scroll', async ({ page }) => {
    await page.goto(THANK_YOU_URL)
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('download CTA is visible above the fold at test viewport', async ({ page }) => {
    await page.goto(THANK_YOU_URL)
    await waitForReady(page)
    const downloadLink = page.locator('#ty-download-link')
    await expect(downloadLink).toBeVisible()
    const box = await downloadLink.boundingBox()
    expect(box, 'download link bounding box should exist').not.toBeNull()
    if (box) {
      const viewportHeight = page.viewportSize()?.height ?? 700
      expect(box.y + box.height, 'download CTA bottom should be above the fold').toBeLessThanOrEqual(viewportHeight)
    }
  })

  test('download button meets 44×44 touch target', async ({ page }) => {
    await page.goto(THANK_YOU_URL)
    await waitForReady(page)
    const downloadLink = page.locator('#ty-download-link')
    await expect(downloadLink).toBeVisible()
    const box = await downloadLink.boundingBox()
    expect(box, 'download link bounding box should exist').not.toBeNull()
    if (box) {
      expect(box.height, 'download button height should be ≥ 44px').toBeGreaterThanOrEqual(44)
      expect(box.width, 'download button width should be ≥ 44px').toBeGreaterThanOrEqual(44)
    }
  })

  test('touch targets meet 44×44 minimum', async ({ page }) => {
    await page.goto(THANK_YOU_URL)
    await waitForReady(page)
    const violations = await touchTargets(page)
    expect(violations, `thank-you has touch target violations: ${violations.join('; ')}`).toHaveLength(0)
  })
})
