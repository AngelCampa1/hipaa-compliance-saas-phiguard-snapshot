// Phase 1 exit gate - runs the full MVP scenario end-to-end

import { test, expect } from '@playwright/test'
import { provisionWorkspace } from './helpers/workspace'

test.describe('Phase 1 exit gate', () => {
  test('full MVP scenario: auth -> task -> incident -> audit', async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title)

    await page.goto('/app/tasks/new')
    await page.waitForURL(/\/app\/tasks\/new/)
    await waitForAppHydration(page)

    await page.getByLabel(/title/i).fill('Phase 1 Exit Gate Test Task')
    await page.getByLabel(/description/i).fill('Automated exit gate verification')
    await page.getByRole('button', { name: /create task/i }).click()
    await page.waitForURL(/\/app\/tasks\/[a-f0-9-]+/)

    await page.goto('/app/tasks')
    await expect(page.getByText('Phase 1 Exit Gate Test Task')).toBeVisible()

    await page.goto('/app/compliance/incidents/new')
    await page.waitForURL(/\/app\/compliance\/incidents\/new/)
    await waitForAppHydration(page)

    await page.getByLabel(/incident category/i).selectOption({ index: 1 })
    await page.getByLabel(/severity/i).selectOption({ index: 1 })

    const today = new Date().toISOString().slice(0, 16)
    await page.getByLabel(/date\/time discovered/i).fill(today)
    await page.getByLabel(/incident title/i).fill('Automated compliance incident for exit gate test')
    await page.getByLabel(/email/i).check()
    await page.getByRole('button', { name: /file incident report/i }).click()
    await page.waitForURL(/\/app\/compliance\/incidents\/[^/]+$/)

    await page.goto('/app/compliance/incidents')
    await expect(page.getByText('Automated compliance incident for exit gate test')).toBeVisible()

    await page.goto('/app/audit')
    await expect(page.getByRole('heading', { name: /audit log/i })).toBeVisible()
    await waitForAppHydration(page)

    const auditTable = page.locator('table[aria-label="Audit events"]')
    await page.getByRole('button', { name: /search/i }).click()
    await expect(auditTable).toBeVisible({ timeout: 10_000 })
    await expect(auditTable.locator('tbody tr[data-event-id]').first()).toBeVisible({
      timeout: 5_000,
    })

    await expect(page.getByRole('textbox', { name: /actor id/i })).toBeVisible()
    await expect(page.getByLabel(/resource type/i)).toBeVisible()
    await expect(page.getByLabel(/resource id/i)).toBeVisible()
    await expect(page.locator('input[type="date"], input[type="datetime-local"]').first()).toBeVisible()

    await page.goto('/app/audit/export')
    await expect(page.getByRole('heading', { name: /export audit log/i })).toBeVisible()
    await expect(page.getByLabel(/from/i)).toBeVisible()
    await expect(page.getByLabel(/to/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /export csv/i })).toBeVisible()
  })
})

async function waitForAppHydration(page: import('@playwright/test').Page) {
  await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')
}
