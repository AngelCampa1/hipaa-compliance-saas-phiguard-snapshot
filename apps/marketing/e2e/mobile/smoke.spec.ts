/**
 * Mobile smoke test — homepage horizontal scroll check.
 *
 * This spec runs against all three mobile viewport projects (320, 375, 414).
 * It asserts that the homepage has no horizontal overflow.
 */

import { test, expect } from '@playwright/test'
import { waitForReady, noHorizontalScroll } from '../_helpers/mobile'

test.describe('Homepage mobile smoke', () => {
  test('/ loads and has no horizontal scroll', async ({ page }) => {
    await page.goto('/')
    await waitForReady(page)
    await noHorizontalScroll(page)
  })
})

test('/ returns HTTP 200', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
})
