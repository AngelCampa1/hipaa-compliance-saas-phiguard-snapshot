/**
 * Wave 1 Worker B — mobile coverage for Footer, Breadcrumbs, and cookie banner.
 *
 * Runs against the three mobile viewport projects (320, 375, 414).
 * Requires a built Astro preview server (pnpm exec astro preview).
 */

import { test, expect } from '@playwright/test'
import { waitForReady, noHorizontalScroll, touchTargets } from '../_helpers/mobile'

test.describe('Footer mobile', () => {
  test('footer is visible and has no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)

    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()
    await expect(footer).toBeVisible()

    await noHorizontalScroll(page)
  })

  test('footer columns stack vertically on narrow viewport', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)

    const { width } = page.viewportSize() ?? { width: 375 }

    const grid = page.locator('footer > div').first()
    const gridColumns = await grid.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('grid-template-columns')
    })

    if (width < 640) {
      const columnCount = gridColumns.trim().split(/\s+(?=\d|\()/).length
      expect(
        columnCount,
        `Expected ≤2 columns at ${width}px, got: ${gridColumns}`,
      ).toBeLessThanOrEqual(2)
    }
  })

  test('footer links pass touch target size', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)

    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()

    const violations = await page.evaluate(() => {
      const MIN_SIZE = 44
      const TOLERANCE = 2
      const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('footer a'))
      const issues: string[] = []
      for (const el of links) {
        if (el.offsetParent === null) continue
        const rect = el.getBoundingClientRect()
        if (rect.height < MIN_SIZE - TOLERANCE) {
          const label =
            el.getAttribute('aria-label') || el.textContent?.trim().slice(0, 40) || el.href
          issues.push(
            `footer <a> "${label}" height is ${Math.round(rect.height)}px (min ${MIN_SIZE}px)`,
          )
        }
      }
      return issues
    })

    expect(
      violations,
      `Footer link touch-target violations:\n${violations.join('\n')}`,
    ).toHaveLength(0)
  })
})

test.describe('Cookie banner mobile', () => {
  test('cookie banner does not overlap home-indicator area', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)

    const { height } = page.viewportSize() ?? { height: 812 }
    const banner = page.locator('#cookie-banner')
    await expect(banner).toBeVisible()

    const rect = await banner.boundingBox()
    if (!rect) return

    const safeAreaAllowance = 50
    expect(
      rect.y + rect.height,
      `Cookie banner bottom (${rect.y + rect.height}px) exceeds viewport height (${height}px) minus safe-area allowance (${safeAreaAllowance}px)`,
    ).toBeLessThanOrEqual(height + safeAreaAllowance)
  })

  test('cookie banner buttons pass touch target size', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)

    const banner = page.locator('#cookie-banner')
    await expect(banner).toBeVisible()

    const violations = await touchTargets(page)
    const bannerViolations = violations.filter(
      (v) =>
        v.includes('cookie-accept') ||
        v.includes('cookie-decline') ||
        v.includes('Accept') ||
        v.includes('Decline'),
    )
    expect(
      bannerViolations,
      `Cookie banner button violations:\n${bannerViolations.join('\n')}`,
    ).toHaveLength(0)
  })
})

test.describe('Breadcrumbs mobile', () => {
  test('alternatives page breadcrumbs do not cause horizontal scroll', async ({ page }) => {
    await page.goto('/alternatives/asana-alternative')
    await waitForReady(page)

    await noHorizontalScroll(page)
  })
})

test.describe('No horizontal scroll', () => {
  test('homepage has no horizontal scroll', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })
})

test.describe('No horizontal scroll — Wave 3 Worker B', () => {
  test('alternatives page has no horizontal scroll', async ({ page }) => {
    await page.goto('/alternatives/asana-alternative')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })
})
