/**
 * Shared helpers for mobile Playwright tests in apps/web.
 *
 * Mirrors the pattern from apps/marketing/e2e/_helpers/mobile.ts.
 * Used by Wave 3 spec files in e2e/mobile/*.spec.ts.
 */

import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export async function waitForReady(page: Page): Promise<void> {
  await page.waitForFunction(() => document.fonts.ready)
}

export async function noHorizontalScroll(page: Page): Promise<void> {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth + 1
  })
  expect(hasOverflow, 'Page has unexpected horizontal scroll overflow').toBe(false)
}

export async function touchTargets(page: Page): Promise<string[]> {
  const violations = await page.evaluate(() => {
    const MIN_SIZE = 44
    const TOLERANCE = 2
    const selectors = 'a, button, input[type="submit"], [role="button"]'
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors))
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
          `<${el.tagName.toLowerCase()}> "${label}" is ${Math.round(rect.width)}×${Math.round(rect.height)}px (min ${MIN_SIZE}×${MIN_SIZE})`,
        )
      }
    }

    return issues
  })

  return violations
}
