/**
 * Wave 3 Worker A — mobile coverage for root marketing pages.
 *
 * Scope: pages/index.astro, pages/pricing.astro, pages/404.astro.
 * Pages hipaa-compliance, soc-2-compliant, data-security, ai-detection,
 * pii-detection, compliance-operations, solutions, technology, get-started,
 * schedule-demo, and contact do not exist in this codebase — skipped.
 *
 * Runs against the three mobile viewport projects (320, 375, 414).
 * Requires a built Astro preview server (pnpm exec astro preview).
 */

import { test, expect } from '@playwright/test'
import { waitForReady, noHorizontalScroll, touchTargets } from '../_helpers/mobile'

const ROUTES_200 = ['/', '/pricing'] as const

for (const route of ROUTES_200) {
  test.describe(`${route} — mobile`, () => {
    test(`${route} returns 200`, async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status(), `${route} should return HTTP 200`).toBe(200)
    })

    test(`${route} has no horizontal scroll`, async ({ page }) => {
      await page.goto(route)
      await waitForReady(page)
      await noHorizontalScroll(page)
    })

    test(`${route} interactive elements meet 44×44 touch target`, async ({ page }) => {
      await page.goto(route)
      await waitForReady(page)
      const violations = await touchTargets(page)
      expect(
        violations,
        `${route} touch-target violations at ${page.viewportSize()?.width}px:\n${violations.join('\n')}`,
      ).toHaveLength(0)
    })
  })
}

test.describe('/404 — mobile', () => {
  test('unknown path returns 404 page with no horizontal scroll', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('unknown path 404 page interactive elements meet 44×44 touch target', async ({ page }) => {
    await page.goto('/this-page-does-not-exist')
    await waitForReady(page)
    const violations = await touchTargets(page)
    expect(
      violations,
      `404 page touch-target violations at ${page.viewportSize()?.width}px:\n${violations.join('\n')}`,
    ).toHaveLength(0)
  })
})
