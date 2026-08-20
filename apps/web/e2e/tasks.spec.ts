/**
 * E2E: Tasks golden path
 *
 * Covers: login → create task → update status → add comment → verify audit trail
 *
 * NOTE: Attachment upload uses the explicit ENABLE_MOCK_UPLOADS route in
 * Playwright so production never silently falls back to a fake upload target.
 * The direct upload route itself is covered by API tests for capability,
 * content type, size limit, and object-write behavior.
 */

import { test, expect } from '@playwright/test'
import { provisionWorkspace } from './helpers/workspace'

test.describe('Tasks golden path', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title)
  })

  test('create a task, update status, add comment, upload attachment, verify audit trail', async ({ page }) => {
    // 1. Navigate to tasks
    await page.goto('/app/tasks')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')
    await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible()

    // 2. Create a new task
    await page.getByRole('link', { name: 'Create new task' }).click()
    await page.waitForURL(/\/app\/tasks\/new/)
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')

    const taskTitle = `HIPAA Policy Review ${Date.now()}`
    await page.getByLabel(/title/i).fill(taskTitle)
    await page.getByLabel(/description/i).fill('Annual HIPAA policy review for clinic compliance program.')
    await page.getByLabel(/priority/i).selectOption('high')
    await page.getByRole('button', { name: /create task/i }).click()

    // 3. Should redirect to task detail
    await expect(page).toHaveURL(/\/app\/tasks\/[a-f0-9-]+/)
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible()

    // 4. Update status to in_progress
    await page.getByLabel(/task status/i).selectOption('in_progress')
    // Give the server function time to complete
    await page.waitForTimeout(500)
    await expect(page.getByLabel(/task status/i)).toHaveValue('in_progress')

    // 5. Add a comment
    const commentInput = page.getByPlaceholder(/add a comment/i)
    await commentInput.click()
    await commentInput.pressSequentially('Reviewed and updated HIPAA Notice of Privacy Practices.')
    await expect(page.getByRole('button', { name: /add comment/i })).toBeEnabled()
    await page.getByRole('button', { name: /add comment/i }).click()
    await page.waitForTimeout(500)
    await expect(page.getByText('Reviewed and updated HIPAA Notice of Privacy Practices.')).toBeVisible()

    // 6. Upload an attachment
    await page.locator('#file-upload').setInputFiles({
      name: 'evidence.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('mock attachment body'),
    })
    const attachmentRow = page.locator('[data-attachment-id]').last()
    await expect(attachmentRow).toBeVisible()
    await expect(attachmentRow).toContainText(/evidence\.txt/i)
    await expect(attachmentRow).toContainText(/Text/i)
    const attachmentId = await attachmentRow.getAttribute('data-attachment-id')
    expect(attachmentId).toBeTruthy()

    // 7. Navigate to audit trail and verify the attachment upload event exists
    await page.goto('/app/audit')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')
    await expect(page.getByRole('heading', { name: /audit log/i })).toBeVisible()
    await page.getByLabel(/resource type/i).click()
    await page.keyboard.type('task_attachment')
    await page.keyboard.press('Enter')
    await page.getByLabel(/resource id/i).fill(attachmentId ?? '')

    const auditRow = page.locator('tr[data-event-id]').filter({
      has: page.locator('td', { hasText: attachmentId ?? '' }),
    })

    for (let attempt = 0; attempt < 10; attempt += 1) {
      await page.getByRole('button', { name: /search/i }).click()

      if (await auditRow.isVisible().catch(() => false)) {
        break
      }

      await page.waitForTimeout(1_000)
    }

    await expect(auditRow).toBeVisible()
    await expect(auditRow.locator('td').nth(2)).toHaveText('task.attachment.uploaded')
  })
})
