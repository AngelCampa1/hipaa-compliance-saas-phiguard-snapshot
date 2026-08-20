import { expect, test } from '@playwright/test'
import { noHorizontalScroll, touchTargets, waitForReady } from '../_helpers/mobile'

test('hamburger is visible and meets minimum touch target size', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const hamburger = page.locator('#nav-hamburger')
  await expect(hamburger).toBeVisible()

  const box = await hamburger.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThanOrEqual(44)
  expect(box!.height).toBeGreaterThanOrEqual(44)
})

test('mobile menu opens, locks scroll, traps focus; Escape closes and restores focus', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const hamburger = page.locator('#nav-hamburger')
  const sheet = page.locator('#mobile-menu')

  await hamburger.click()
  await expect(sheet).toBeVisible()

  const scrollLocked = await page.evaluate(() => document.body.style.overflow === 'hidden')
  expect(scrollLocked).toBe(true)

  const focusInSheet = await page.evaluate(() => {
    const sheet = document.getElementById('mobile-menu')
    return sheet ? sheet.contains(document.activeElement) : false
  })
  expect(focusInSheet).toBe(true)

  await page.keyboard.press('Escape')
  await expect(sheet).toBeHidden()

  const scrollRestored = await page.evaluate(() => document.body.style.overflow === '')
  expect(scrollRestored).toBe(true)

  const focusOnHamburger = await page.evaluate(() => {
    return document.activeElement?.id === 'nav-hamburger'
  })
  expect(focusOnHamburger).toBe(true)
})

test('clicking an internal link from the sheet closes the menu', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const hamburger = page.locator('#nav-hamburger')
  const sheet = page.locator('#mobile-menu')

  await hamburger.click()
  await expect(sheet).toBeVisible()

  const firstLink = sheet.locator('a[data-mobile-link]').first()
  const href = await firstLink.getAttribute('href')
  await firstLink.click()

  await page.waitForURL(`**${href}`)
  await expect(sheet).toBeHidden()
})

test('no horizontal scroll on home route', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)
  await noHorizontalScroll(page)
})

test('visible nav interactive controls meet 44×44 touch target minimum', async ({ page }) => {
  await page.goto('/')
  await waitForReady(page)

  const hamburger = page.locator('#nav-hamburger')
  await hamburger.click()
  const sheet = page.locator('#mobile-menu')
  await expect(sheet).toBeVisible()

  const failing = await page.evaluate(() => {
    const MIN = 44
    const nav = document.getElementById('mobile-menu')
    const header = document.querySelector('header')
    const roots = [nav, header].filter(Boolean) as HTMLElement[]
    const elements: HTMLElement[] = roots.flatMap((root) =>
      Array.from(root.querySelectorAll<HTMLElement>('a, button')),
    )
    return elements
      .filter((el) => {
        const style = window.getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden') return false
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) return false
        return rect.width < MIN || rect.height < MIN
      })
      .map((el) => ({
        tag: el.tagName,
        text: el.textContent?.trim().slice(0, 40),
        w: Math.round(el.getBoundingClientRect().width),
        h: Math.round(el.getBoundingClientRect().height),
      }))
  })
  expect(failing, `Nav touch targets below 44×44: ${JSON.stringify(failing)}`).toHaveLength(0)
})
