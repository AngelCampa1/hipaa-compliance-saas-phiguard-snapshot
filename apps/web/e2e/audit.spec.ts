/**
 * E2E: Audit log viewer golden path
 *
 * 1. Login
 * 2. Navigate to tasks → create a task
 * 3. Navigate to /app/audit
 * 4. Filter by the resource_id of the created task
 * 5. Assert the task.created event row is visible
 */

import { test, expect } from '@playwright/test'
import { provisionWorkspace } from './helpers/workspace'

test.describe('Audit log viewer', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title)
  })

  test('create a task then verify task.created audit event is visible', async ({ page }) => {
    // 1. Create a task
    await page.goto('/app/tasks/new')
    await page.waitForURL(/\/app\/tasks\/new/)
    await page.locator('body[data-app-hydrated="true"]').waitFor()
    await expect(page.getByRole('heading', { name: /new task/i })).toBeVisible()

    const taskTitle = `Audit E2E Test Task ${Date.now()}`
    await page.getByLabel(/title/i).fill(taskTitle)
    await page.getByRole('button', { name: /create task/i }).click()

    // 2. Wait for redirect to task detail and capture the task ID from the URL
    await page.waitForURL(/\/app\/tasks\/[a-f0-9-]+/)
    const taskUrl = page.url()
    const taskId = taskUrl.split('/app/tasks/')[1]?.split('?')[0]
    expect(taskId).toBeTruthy()

    // 3. Navigate to the audit log viewer
    await page.goto('/app/audit')
    await page.locator('body[data-app-hydrated="true"]').waitFor()
    await expect(page.getByRole('heading', { name: /audit log/i })).toBeVisible()

    // 4. Filter by resource_id (the task ID)
    await page.getByLabel(/resource id/i).fill(taskId)
    await page.getByRole('button', { name: /search/i }).click()

    // 5. Wait for results to load
    await page.waitForSelector('table[aria-label="Audit events"]', { timeout: 10_000 })

    // 6. Assert the task.created event row is visible
    const taskRow = page.locator(`tr[data-event-id]`).filter({
      has: page.locator('td', { hasText: taskId }),
    })

    await expect(taskRow).toBeVisible({ timeout: 5_000 })

    // Verify the action column shows task.created
    const actionCell = taskRow.locator('td').nth(2) // 0: timestamp, 1: actor, 2: action
    await expect(actionCell).toHaveText('task.created')
  })

  test('CSV export downloads a CSV file', async ({ page }) => {
    await page.goto('/app/audit/export')
    await page.locator('body[data-app-hydrated="true"]').waitFor()
    await expect(page.getByRole('heading', { name: /export audit log/i })).toBeVisible()
    await expect(page.getByLabel(/from/i)).toBeVisible()
    await expect(page.getByLabel(/to/i)).toBeVisible()

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /export csv/i }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/^audit-export-\d{4}-\d{2}-\d{2}\.csv$/)

    const downloadPath = await download.path()
    expect(downloadPath).toBeTruthy()
  })
})
