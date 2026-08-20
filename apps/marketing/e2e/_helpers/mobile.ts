/**
 * Shared helpers for mobile Playwright tests.
 *
 * Used by Wave 1–3 spec files in e2e/mobile/*.spec.ts.
 * Do not import from production code paths — test utilities only.
 */

import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * waitForReady — waits for fonts to load before taking assertions or
 * screenshots, ensuring deterministic snapshots across CI and local runs.
 */
export async function waitForReady(page: Page): Promise<void> {
  await page.waitForFunction(() => document.fonts.ready)
}

/**
 * noHorizontalScroll — asserts that the page has no horizontal overflow.
 * Passes when scrollWidth <= innerWidth + 1 (1 px tolerance for sub-pixel
 * rounding in some browsers).
 *
 * If this assertion fails on a page that is not yet fixed, mark the calling
 * test with `test.fixme()` and add a comment pointing to the wave that owns
 * the fix.
 */
export async function noHorizontalScroll(page: Page): Promise<void> {
  const hasOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth + 1
  })
  expect(hasOverflow, 'Page has unexpected horizontal scroll overflow').toBe(false)
}

/**
 * touchTargets — asserts that all interactive elements on the page meet the
 * WCAG 2.5.5 minimum touch target size of 44×44 px.
 *
 * Elements marked with [data-decorative] are skipped (e.g. icon-only visual
 * flourishes that are intentionally not interactive).
 *
 * Returns an array of violation strings (selector + measured size) so the
 * caller can decide whether to hard-fail or soft-report.
 */
export async function touchTargets(page: Page): Promise<string[]> {
  const violations = await page.evaluate(() => {
    const MIN_SIZE = 44
    const TOLERANCE = 2 // px rounding tolerance
    const selectors = 'a, button, input[type="submit"], [role="button"]'
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors))
    const issues: string[] = []

    for (const el of elements) {
      // Skip elements explicitly tagged as decorative / non-interactive
      if (el.hasAttribute('data-decorative')) continue
      // Skip hidden elements
      if (el.offsetParent === null && el.tagName !== 'BODY') continue
      // WCAG 2.5.5 Inline exception: skip links inside flow prose (paragraphs,
      // list items, table cells, blockquotes). Their tap area is bound by the
      // surrounding line-box, which is correct for reading text.
      if (el.tagName === 'A' && el.closest('p, li, td, dd, blockquote')) continue

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
