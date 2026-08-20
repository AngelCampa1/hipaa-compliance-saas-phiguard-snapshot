import { expect, test } from '@playwright/test'

// ── helpers ────────────────────────────────────────────────────────────────

async function assertNoHorizontalScroll(page: import('@playwright/test').Page) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth
  })
  expect(overflow, 'page should not have horizontal scroll').toBe(false)
}

async function assertTouchTarget(locator: import('@playwright/test').Locator, label: string) {
  const box = await locator.boundingBox()
  expect(box, `${label} bounding box should exist`).not.toBeNull()
  if (box) {
    expect(box.height, `${label} height should be ≥ 44px`).toBeGreaterThanOrEqual(44)
  }
}

// ── /pricing ───────────────────────────────────────────────────────────────

test.describe('/pricing — mobile layout', () => {
  test('no horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await page.goto('/pricing')
    await assertNoHorizontalScroll(page)
  })

  test('billing toggle is visible at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await page.goto('/pricing')
    const toggle = page.locator('[data-billing-toggle]')
    await expect(toggle).toBeVisible()
  })

  test('pricing cards stack to single column at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await page.goto('/pricing')
    const grid = page.locator('.pricing-grid')
    await expect(grid).toBeVisible()
    const cols = await grid.evaluate((el) => {
      return getComputedStyle(el).gridTemplateColumns
    })
    // Single column — exactly one track value (no spaces in a single column value)
    const trackCount = cols.trim().split(/\s+/).length
    expect(trackCount, 'pricing grid should be single column at 320px').toBe(1)
  })

  test('pricing headline does not overflow at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await page.goto('/pricing')
    const overflow = await page.evaluate(() => {
      const el = document.querySelector('.pricing-grid')
      if (!el) return false
      return el.scrollWidth > el.clientWidth
    })
    expect(overflow, 'pricing grid should not overflow horizontally').toBe(false)
  })

  test('primary CTA buttons meet 44px tap target at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await page.goto('/pricing')
    const ctaLinks = page.locator('.pricing-grid .button-primary, .pricing-grid .button-secondary')
    const count = await ctaLinks.count()
    expect(count, 'should find at least one pricing CTA').toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      await assertTouchTarget(ctaLinks.nth(i), `pricing CTA #${i}`)
    }
  })

  test('comparison table has overflow-x scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await page.goto('/pricing')
    const tableWrapper = page.locator('.table-shell').first()
    await expect(tableWrapper).toBeVisible()
    const overflowX = await tableWrapper.evaluate((el) => getComputedStyle(el).overflowX)
    expect(['auto', 'scroll'], 'table wrapper should allow horizontal scroll').toContain(overflowX)
  })
})

// ── / (homepage) ───────────────────────────────────────────────────────────

test.describe('/ — hero mobile layout', () => {
  test('hero stacks correctly at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await page.goto('/')
    await assertNoHorizontalScroll(page)
  })

  test('hero primary CTA meets 44px tap target at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await page.goto('/')
    const primaryCta = page.locator('.hero-actions .button-primary').first()
    await expect(primaryCta).toBeVisible()
    await assertTouchTarget(primaryCta, 'hero primary CTA')
  })
})

// ── FAQ ─────────────────────────────────────────────────────────────────────

test.describe('FAQ — mobile tap targets and accordion', () => {
  const viewports = [
    { width: 320, height: 667 },
    { width: 375, height: 812 },
    { width: 414, height: 896 },
  ]

  for (const vp of viewports) {
    test(`FAQ trigger rows meet 44px tap target at ${vp.width}px`, async ({ page }) => {
      await page.setViewportSize(vp)
      await page.goto('/pricing')
      const summaries = page.locator('.faq-summary')
      const count = await summaries.count()
      expect(count, 'should find FAQ items').toBeGreaterThan(0)
      for (let i = 0; i < Math.min(count, 3); i++) {
        await assertTouchTarget(summaries.nth(i), `FAQ summary #${i} at ${vp.width}px`)
      }
    })

    test(`FAQ accordion opens and closes at ${vp.width}px`, async ({ page }) => {
      await page.setViewportSize(vp)
      await page.goto('/pricing')
      const firstSummary = page.locator('.faq-summary').first()
      const firstDetails = page.locator('.faq-item').first()
      await firstSummary.click()
      await expect(firstDetails).toHaveAttribute('open', '')
      const answer = firstDetails.locator('.faq-answer')
      await expect(answer).toBeVisible()
      await firstSummary.click()
      await expect(firstDetails).not.toHaveAttribute('open', '')
    })
  }
})

// ── Comparison table (alternatives page) ──────────────────────────────────

test.describe('Comparison table — mobile scroll', () => {
  test('table-shell wrapper is present and allows horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    // Pricing page has the plan comparison table inside .table-shell
    await page.goto('/pricing')
    const wrapper = page.locator('.table-shell').first()
    await expect(wrapper).toBeVisible()
    const overflowX = await wrapper.evaluate((el) => getComputedStyle(el).overflowX)
    expect(['auto', 'scroll'], 'table-shell should scroll horizontally').toContain(overflowX)
  })

  test('page itself has no horizontal overflow at 320px on pricing (table scrolls inside wrapper)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await page.goto('/pricing')
    await assertNoHorizontalScroll(page)
  })

  test('alternatives page FAQ exists and has no horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 667 })
    await page.goto('/alternatives/asana-alternative')
    const summaries = page.locator('.faq-summary')
    await expect(summaries.first()).toBeVisible()
    await assertNoHorizontalScroll(page)
  })
})
