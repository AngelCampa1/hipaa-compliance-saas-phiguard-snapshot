import { expect, test, type Page } from '@playwright/test'
import { provisionWorkspace } from './helpers/workspace'

test.describe('rendered app regressions', () => {
  test('mobile primary navigation is exposed only while the dialog is open', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await provisionWorkspace(page, testInfo.title)

    const menuButton = page.getByRole('button', { name: 'Open navigation' })
    await expect(menuButton).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'Navigation' })).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0)

    await menuButton.click()
    await expect(page.getByRole('dialog', { name: 'Navigation' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(1)

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Navigation' })).toHaveCount(0)
    await expect(page.getByRole('navigation', { name: 'Primary' })).toHaveCount(0)
    await expect(menuButton).toBeFocused()
  })

  test('compliance policies page has one h1 and no visible heading level skips', async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title, { includeChecklist: true })

    await page.goto('/app/compliance/policies')
    await waitForAppHydration(page)

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    const levels = await visibleHeadingLevels(page)

    expect(levels[0]).toBe(1)
    for (let index = 1; index < levels.length; index += 1) {
      expect(levels[index] - levels[index - 1]).toBeLessThanOrEqual(1)
    }
  })

  test('accepted legal state shows non-blocking trial start copy', async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title, {
      legalAccepted: true,
      plan: 'clinic',
      planStatus: 'trial_pending',
      bootstrapPath: '/app/onboarding?step=2&plan=clinic',
    })

    await page.goto('/app/onboarding?step=2&plan=clinic')
    await waitForAppHydration(page)

    await expect(page.getByRole('heading', { name: /terms and baa on file\. start your trial/i })).toBeVisible()
    await expect(page.getByText(/30-day trial activates once legal acceptance is complete/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /continue to dashboard/i })).toBeEnabled()
  })
})

async function waitForAppHydration(page: Page) {
  await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')
}

async function visibleHeadingLevels(page: Page) {
  return page.locator('h1,h2,h3,h4,h5,h6').evaluateAll((headings) =>
    headings
      .filter((heading) => {
        const style = window.getComputedStyle(heading)
        const rect = heading.getBoundingClientRect()
        return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0
      })
      .map((heading) => Number(heading.tagName.slice(1))),
  )
}
