/**
 * Wave 3 Worker B -- mobile coverage for dynamic [slug] template pages.
 *
 * Runs against the three mobile viewport projects (320, 375, 414).
 * Requires a built Astro preview server (pnpm exec astro preview).
 */

import { test } from '@playwright/test'
import { waitForReady, noHorizontalScroll, touchTargets } from '../_helpers/mobile'

const BREADCRUMB = "nav[aria-label=\"Breadcrumb\"]";

// suppress unused import warning
void touchTargets;
test.describe('alternatives/[slug] mobile', () => {
  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/alternatives/asana-alternative')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('breadcrumb present', async ({ page }) => {
    await page.goto('/alternatives/asana-alternative')
    await waitForReady(page)
    await page.locator(BREADCRUMB).waitFor({ state: "visible" })
  })
})
test.describe('compare/[slug] mobile', () => {
  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/compare/phiguard-vs-compliancy-group')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('breadcrumb present', async ({ page }) => {
    await page.goto('/compare/phiguard-vs-compliancy-group')
    await waitForReady(page)
    await page.locator(BREADCRUMB).waitFor({ state: "visible" })
  })
})
test.describe('learn/[...slug] mobile', () => {
  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/learn/compliance-operations/42-cfr-part-2-vs-hipaa')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('breadcrumb present', async ({ page }) => {
    await page.goto('/learn/compliance-operations/42-cfr-part-2-vs-hipaa')
    await waitForReady(page)
    await page.locator(BREADCRUMB).waitFor({ state: "visible" })
  })

  test('TOC sidebar hidden at 320px', async ({ page }) => {
    await page.goto('/learn/compliance-operations/42-cfr-part-2-vs-hipaa')
    await waitForReady(page)
    const { width } = page.viewportSize() ?? { width: 375 }
    if (width <= 320) {
      const toc = page.locator('.toc-sidebar-card')
      const count = await toc.count()
      if (count > 0) {
        const display = await toc.evaluate((el) => window.getComputedStyle(el).display)
        if (display !== 'none') throw new Error('TOC sidebar visible at 320px: display=' + display)
      }
    }
  })
})
test.describe('contributors/[slug] mobile', () => {
  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/contributors/angel-campa')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('breadcrumb present', async ({ page }) => {
    await page.goto('/contributors/angel-campa')
    await waitForReady(page)
    await page.locator(BREADCRUMB).waitFor({ state: "visible" })
  })
})
test.describe('practice-types/[slug] mobile', () => {
  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/practice-types/cardiology-practice')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('breadcrumb present', async ({ page }) => {
    await page.goto('/practice-types/cardiology-practice')
    await waitForReady(page)
    await page.locator(BREADCRUMB).waitFor({ state: "visible" })
  })
})
test.describe('resources/[slug] mobile', () => {
  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/resources/baa-template')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('breadcrumb present', async ({ page }) => {
    await page.goto('/resources/baa-template')
    await waitForReady(page)
    await page.locator(BREADCRUMB).waitFor({ state: "visible" })
  })
})
test.describe('hipaa-software/[slug] mobile', () => {
  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/hipaa-software/behavioral-health-practices')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('breadcrumb present', async ({ page }) => {
    await page.goto('/hipaa-software/behavioral-health-practices')
    await waitForReady(page)
    await page.locator(BREADCRUMB).waitFor({ state: "visible" })
  })
})
test.describe('locations/hipaa-compliance/[slug] mobile', () => {
  test('no horizontal scroll', async ({ page }) => {
    await page.goto('/locations/hipaa-compliance/albuquerque-nm')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('breadcrumb present', async ({ page }) => {
    await page.goto('/locations/hipaa-compliance/albuquerque-nm')
    await waitForReady(page)
    await page.locator(BREADCRUMB).waitFor({ state: "visible" })
  })
})
