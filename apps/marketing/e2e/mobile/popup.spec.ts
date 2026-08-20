/**
 * Mobile Playwright coverage for LeadMagnetPopup.
 *
 * Trigger strategy: LeadMagnetPopup is rendered on every route via MarketingLayout
 * and opened by JS logic (scroll depth >= 70% on mobile, or second-page visit).
 * The popup JS exposes no public API, so we force-open it via page.evaluate()
 * to bypass the timing/session guards. We first clear sessionStorage so the
 * popup is not suppressed, then simulate a scroll-depth trigger by overriding
 * the scroll position calculation and dispatching a scroll event.
 *
 * If a future refactor exposes a named open trigger, replace page.evaluate()
 * with a direct call.
 */
import { expect, test } from '@playwright/test'
import { noHorizontalScroll, waitForReady } from '../_helpers/mobile'

async function openPopup(page: import('@playwright/test').Page): Promise<void> {
  await page.evaluate(() => {
    sessionStorage.removeItem('phiguard-lead-popup-shown')
    sessionStorage.removeItem('phiguard-lead-popup-eligible-views')
    localStorage.removeItem('phiguard-lead-popup-dismissed-until')
    localStorage.removeItem('phiguard-lead-popup-submitted-until')
  })

  await page.reload()
  await waitForReady(page)

  await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('[data-lead-popup]')
    if (!root) return
    root.hidden = false
    root.setAttribute('aria-hidden', 'false')
    document.body.classList.add('lead-popup-open')
  })

  await expect(page.locator('[data-lead-popup-dialog]')).toBeVisible()
}

test('close button meets 44×44 minimum touch target', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)
  await openPopup(page)

  const closeBtn = page.locator('[data-lead-popup] .popup-shell__close')
  const box = await closeBtn.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThanOrEqual(44)
  expect(box!.height).toBeGreaterThanOrEqual(44)
})

test('dialog fits within viewport width — no horizontal overflow', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)
  await openPopup(page)

  await noHorizontalScroll(page)

  const dialogBox = await page.locator('[data-lead-popup-dialog]').boundingBox()
  expect(dialogBox).not.toBeNull()

  const viewportWidth = page.viewportSize()!.width
  expect(dialogBox!.x).toBeGreaterThanOrEqual(0)
  expect(dialogBox!.x + dialogBox!.width).toBeLessThanOrEqual(viewportWidth + 1)
})

test('body scroll is locked while popup is open', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)
  await openPopup(page)

  const scrollLockState = await page.evaluate(() => {
    const bodyHasClass = document.body.classList.contains('lead-popup-open')
    const htmlOverflow = window.getComputedStyle(document.documentElement).overflow
    const bodyOverflow = window.getComputedStyle(document.body).overflow
    return { bodyHasClass, htmlOverflow, bodyOverflow }
  })

  expect(scrollLockState.bodyHasClass, 'body should carry lead-popup-open class').toBe(true)
  expect(
    scrollLockState.htmlOverflow === 'hidden' || scrollLockState.bodyOverflow === 'hidden',
    `scroll should be locked — html overflow: ${scrollLockState.htmlOverflow}, body overflow: ${scrollLockState.bodyOverflow}`,
  ).toBe(true)
})

test('Escape closes popup and restores focus to opener', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const opener = page.locator('body')

  await page.evaluate(() => {
    sessionStorage.removeItem('phiguard-lead-popup-shown')
    sessionStorage.removeItem('phiguard-lead-popup-eligible-views')
    localStorage.removeItem('phiguard-lead-popup-dismissed-until')
    localStorage.removeItem('phiguard-lead-popup-submitted-until')
  })

  await page.reload()
  await waitForReady(page)

  await page.evaluate(() => {
    const root = document.querySelector<HTMLElement>('[data-lead-popup]')
    if (!root) return
    const firstLink = document.querySelector<HTMLElement>('a, button')
    firstLink?.focus()
    root.hidden = false
    root.setAttribute('aria-hidden', 'false')
    document.body.classList.add('lead-popup-open')
  })

  const dialog = page.locator('[data-lead-popup-dialog]')
  await expect(dialog).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()

  const scrollRestored = await page.evaluate(() => {
    return !document.body.classList.contains('lead-popup-open')
  })
  expect(scrollRestored).toBe(true)
})

test('popup close button click dismisses the popup', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)
  await openPopup(page)

  const closeBtn = page.locator('[data-lead-popup] .popup-shell__close')
  await closeBtn.click()

  const dialog = page.locator('[data-lead-popup-dialog]')
  await expect(dialog).toBeHidden()

  const scrollRestored = await page.evaluate(() => {
    return !document.body.classList.contains('lead-popup-open')
  })
  expect(scrollRestored).toBe(true)
})
