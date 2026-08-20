import { test, expect } from '@playwright/test'
import { provisionWorkspace } from './helpers/workspace'

test.skip(
  process.env.PLAYWRIGHT_DIRECT_UPLOADS !== 'true',
  'Direct upload smoke requires PLAYWRIGHT_DIRECT_UPLOADS=true',
)

test.describe('Direct uploads', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title)
  })

  test('uploads a task attachment through the same-origin direct upload route', async ({ page }) => {
    const mockUploadRequests: string[] = []
    const directUploadRequest = page.waitForRequest((request) => {
      const url = new URL(request.url())
      return request.method() === 'PUT' && url.pathname === '/api/uploads/direct'
    })
    const directUploadResponse = page.waitForResponse((response) => {
      const request = response.request()
      const url = new URL(response.url())
      return request.method() === 'PUT' && url.pathname === '/api/uploads/direct'
    })

    page.on('request', (request) => {
      if (new URL(request.url()).pathname === '/api/uploads/mock') {
        mockUploadRequests.push(request.url())
      }
    })

    await page.goto('/app/tasks')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')

    await page.getByRole('link', { name: 'Create new task' }).click()
    await page.waitForURL(/\/app\/tasks\/new/)
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')

    const taskTitle = `Direct upload smoke ${Date.now()}`
    await page.getByLabel(/title/i).fill(taskTitle)
    await page.getByLabel(/description/i).fill('Direct upload smoke test. No PHI.')
    await page.getByRole('button', { name: /create task/i }).click()

    await expect(page).toHaveURL(/\/app\/tasks\/[a-f0-9-]+/)
    await expect(page.getByRole('heading', { name: taskTitle })).toBeVisible()

    await page.locator('#file-upload').setInputFiles({
      name: 'direct-evidence.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('direct upload smoke body'),
    })

    const [request, response] = await Promise.all([
      directUploadRequest,
      directUploadResponse,
    ])
    expect(new URL(request.url()).pathname).toBe('/api/uploads/direct')
    expect(response.status()).toBe(204)
    expect(mockUploadRequests).toEqual([])

    const attachmentRow = page.locator('[data-attachment-id]').last()
    await expect(attachmentRow).toBeVisible()
    await expect(attachmentRow).toContainText(/direct-evidence\.txt/i)
    await expect(attachmentRow).toContainText(/text\/plain/i)
  })
})
