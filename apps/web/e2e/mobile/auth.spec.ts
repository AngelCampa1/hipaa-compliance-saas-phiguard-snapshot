/**
 * Mobile spec — public/pre-auth pages in apps/web.
 *
 * Wave 3 Worker C owns these routes:
 *   - /login
 *   - /signup
 *   - /forgot-password
 *   - /signup/check-email
 *
 * Runs against all three mobile viewport projects (320, 375, 414).
 * Does NOT touch any route under /app/ (authed surfaces — out of scope).
 */

import { test, expect } from '@playwright/test'
import { waitForReady, noHorizontalScroll, touchTargets } from '../_helpers/mobile'

const AUTH_ROUTES = [
  { path: '/login', heading: /sign in/i },
  { path: '/forgot-password', heading: /reset your password/i },
] as const

for (const { path, heading } of AUTH_ROUTES) {
  test.describe(`${path} — mobile layout`, () => {
    test('page loads and renders heading', async ({ page }) => {
      await page.goto(path)
      await waitForReady(page)
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading)
    })

    test('no horizontal scroll', async ({ page }) => {
      await page.goto(path)
      await waitForReady(page)
      await noHorizontalScroll(page)
    })

    test('form inputs are not wider than viewport', async ({ page }) => {
      await page.goto(path)
      await waitForReady(page)
      const inputs = page.locator('input')
      const count = await inputs.count()
      const viewportWidth = page.viewportSize()?.width ?? 320
      for (let i = 0; i < count; i++) {
        const box = await inputs.nth(i).boundingBox()
        if (box) {
          expect(
            box.width,
            `input #${i} on ${path} should not exceed viewport width`,
          ).toBeLessThanOrEqual(viewportWidth + 1)
        }
      }
    })

    test('submit button is full-width and meets 44px height', async ({ page }) => {
      await page.goto(path)
      await waitForReady(page)
      const submitBtn = page.locator('button[type="submit"]').first()
      await expect(submitBtn).toBeVisible()
      const box = await submitBtn.boundingBox()
      expect(box, 'submit button bounding box should exist').not.toBeNull()
      if (box) {
        const viewportWidth = page.viewportSize()?.width ?? 320
        expect(box.height, 'submit button height should be ≥ 44px').toBeGreaterThanOrEqual(44)
        expect(box.width, 'submit button should be close to full-width').toBeGreaterThanOrEqual(viewportWidth * 0.8)
      }
    })

    test('touch targets meet 44×44 minimum', async ({ page }) => {
      await page.goto(path)
      await waitForReady(page)
      const violations = await touchTargets(page)
      expect(violations, `${path} touch target violations: ${violations.join('; ')}`).toHaveLength(0)
    })
  })
}

test.describe('/signup — mobile layout', () => {
  test('page loads and renders form without horizontal scroll', async ({ page }) => {
    await page.goto('/signup')
    await waitForReady(page)
    await expect(page.getByRole('heading', { name: /create your phiguard account/i })).toBeVisible()
    await noHorizontalScroll(page)
  })

  test('sell panel is hidden on mobile — form is the first visible content', async ({ page }) => {
    await page.goto('/signup')
    await waitForReady(page)
    const heading = page.getByRole('heading', { name: /create your phiguard account/i })
    const box = await heading.boundingBox()
    const viewportHeight = page.viewportSize()?.height ?? 700
    expect(box, 'signup heading bounding box should exist').not.toBeNull()
    if (box) {
      expect(
        box.y,
        'signup form heading should be visible in the first viewport (sell panel hidden on mobile)',
      ).toBeLessThan(viewportHeight)
    }
  })

  test('form inputs are not wider than viewport', async ({ page }) => {
    await page.goto('/signup')
    await waitForReady(page)
    const inputs = page.locator('input')
    const count = await inputs.count()
    const viewportWidth = page.viewportSize()?.width ?? 320
    for (let i = 0; i < count; i++) {
      const box = await inputs.nth(i).boundingBox()
      if (box) {
        expect(
          box.width,
          `signup input #${i} should not exceed viewport width`,
        ).toBeLessThanOrEqual(viewportWidth + 1)
      }
    }
  })

  test('submit button meets 44px height', async ({ page }) => {
    await page.goto('/signup')
    await waitForReady(page)
    const submitBtn = page.locator('button[type="submit"]').first()
    await expect(submitBtn).toBeVisible()
    const box = await submitBtn.boundingBox()
    if (box) {
      expect(box.height, 'signup submit button height should be ≥ 44px').toBeGreaterThanOrEqual(44)
    }
  })

  test('touch targets meet 44×44 minimum', async ({ page }) => {
    await page.goto('/signup')
    await waitForReady(page)
    const violations = await touchTargets(page)
    expect(violations, `signup touch target violations: ${violations.join('; ')}`).toHaveLength(0)
  })
})

test.describe('/signup/check-email — mobile layout', () => {
  test('page loads without horizontal scroll', async ({ page }) => {
    await page.goto('/signup/check-email?email=test%40example.com')
    await waitForReady(page)
    await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible()
    await noHorizontalScroll(page)
  })

  test('action buttons meet 44px height', async ({ page }) => {
    await page.goto('/signup/check-email?email=test%40example.com')
    await waitForReady(page)
    const buttons = page.locator('button, a[class*="button"]')
    const count = await buttons.count()
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox()
      if (box && box.width > 0 && box.height > 0) {
        expect(box.height, `check-email button #${i} height should be ≥ 44px`).toBeGreaterThanOrEqual(44)
      }
    }
  })
})
