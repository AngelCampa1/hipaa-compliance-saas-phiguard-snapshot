/**
 * Wave 2 Worker A - mobile coverage for form components.
 *
 * Covers: LeadCapturePanel and LeadMagnetForm.
 * Runs against the three mobile viewport projects (320, 375, 414).
 * Requires a built Astro preview server (pnpm exec astro preview).
 */

import { test, expect } from '@playwright/test'
import { waitForReady, noHorizontalScroll } from '../_helpers/mobile'

test.describe('LeadCapturePanel mobile', () => {
  test('no horizontal scroll on page with LeadCapturePanel', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('LeadCapturePanel submit button meets 44x44 touch target', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)

    const button = page.locator('[data-lead-capture-submit]').first()
    await button.scrollIntoViewIfNeeded()
    await expect(button).toBeVisible()

    const box = await button.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width, `submit button width ${box!.width}px < 44px`).toBeGreaterThanOrEqual(44)
    expect(box!.height, `submit button height ${box!.height}px < 44px`).toBeGreaterThanOrEqual(44)
  })

  test('LeadCapturePanel email input does not overflow viewport', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)

    const { width: vpWidth } = page.viewportSize() ?? { width: 320 }
    const input = page.locator('[data-lead-capture-form] input[type="email"]').first()
    await input.scrollIntoViewIfNeeded()
    await expect(input).toBeVisible()

    const box = await input.boundingBox()
    expect(box).not.toBeNull()
    expect(
      box!.width,
      `email input width ${box!.width}px exceeds viewport ${vpWidth}px`,
    ).toBeLessThanOrEqual(vpWidth)
  })

  test('LeadCapturePanel form controls meet 44x44 touch target', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)

    const violations = await page.evaluate(() => {
      const MIN_SIZE = 44
      const TOLERANCE = 2
      const panel = document.querySelector('[data-lead-conversion]')
      if (!panel) return []
      const elements = Array.from(
        panel.querySelectorAll<HTMLElement>('a, button, input[type="submit"], [role="button"]'),
      )
      const issues: string[] = []
      for (const el of elements) {
        if (el.hasAttribute('data-decorative')) continue
        if (el.offsetParent === null && el.tagName !== 'BODY') continue
        const rect = el.getBoundingClientRect()
        const tooNarrow = rect.width < MIN_SIZE - TOLERANCE
        const tooShort = rect.height < MIN_SIZE - TOLERANCE
        if (tooNarrow || tooShort) {
          const label =
            el.getAttribute('aria-label') ||
            el.getAttribute('href') ||
            el.textContent?.trim().slice(0, 40) ||
            el.tagName
          issues.push(
            `<${el.tagName.toLowerCase()}> "${label}" is ${Math.round(rect.width)}x${Math.round(rect.height)}px (min ${MIN_SIZE}x${MIN_SIZE})`,
          )
        }
      }
      return issues
    })
    expect(violations, `Form touch target violations:\n${violations.join('\n')}`).toHaveLength(0)
  })
})

test.describe('LeadMagnetForm mobile', () => {
  // LeadMagnetForm wraps LeadCapturePanel (variant=sidebar) and is rendered on
  // resource detail pages (e.g. /resources/vendor-baa-tracker).
  test('no horizontal scroll on page with LeadMagnetForm', async ({ page }) => {
    await page.goto('/resources/vendor-baa-tracker')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })

  test('LeadMagnetForm submit button meets 44x44 touch target', async ({ page }) => {
    await page.goto('/resources/vendor-baa-tracker')
    await waitForReady(page)

    const button = page.locator('[data-lead-capture-submit]').first()
    await button.scrollIntoViewIfNeeded()
    await expect(button).toBeVisible()

    const box = await button.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width, `submit button width ${box!.width}px < 44px`).toBeGreaterThanOrEqual(44)
    expect(box!.height, `submit button height ${box!.height}px < 44px`).toBeGreaterThanOrEqual(44)
  })

  test('LeadMagnetForm email input does not overflow viewport', async ({ page }) => {
    await page.goto('/resources/vendor-baa-tracker')
    await waitForReady(page)

    const { width: vpWidth } = page.viewportSize() ?? { width: 320 }
    const input = page.locator('[data-lead-capture-form] input[type="email"]').first()
    await input.scrollIntoViewIfNeeded()
    await expect(input).toBeVisible()

    const box = await input.boundingBox()
    expect(box).not.toBeNull()
    expect(
      box!.width,
      `email input width ${box!.width}px exceeds viewport ${vpWidth}px`,
    ).toBeLessThanOrEqual(vpWidth)
  })
})
