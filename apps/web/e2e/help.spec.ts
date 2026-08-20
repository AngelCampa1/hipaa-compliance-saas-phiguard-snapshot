import { test, expect } from '@playwright/test'
import { provisionWorkspace } from './helpers/workspace'

test.describe('Beginner help guidance', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title)
  })

  test('opens Help from navigation and shows major guide categories', async ({ page }) => {
    await page.goto('/app/dashboard')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')

    await page.getByRole('button', { name: /open page help and feedback/i }).click()

    await expect(
      page.getByRole('dialog', { name: /dashboard/i }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: /what this page is for/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /related guides/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /first day in phiguard/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /start a hipaa checklist/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /create your first task/i })).toBeVisible()
  })

  test('shows a beginner guide with numbered steps and support warning', async ({ page }) => {
    await page.goto('/app/help?topic=open-pdf-download')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')

    await expect(page.getByRole('heading', { name: /open a downloaded file or pdf/i })).toBeVisible()
    await expect(page.getByText(/^1$/)).toBeVisible()
    await expect(page.getByText(/open the downloads folder/i)).toBeVisible()
    await expect(
      page.getByRole('article').getByRole('link', { name: /angel\.campa@phiguard\.app/i }),
    ).toBeVisible()
    await expect(
      page.getByRole('article').getByText(/do not email patient names/i),
    ).toBeVisible()
  })

  test('keeps search text in sync when changing help categories', async ({ page }) => {
    await page.goto('/app/help?q=pdf')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')
    await expect(page.getByLabel(/search help/i)).toHaveValue('pdf')

    await page.getByLabel('Help categories').getByRole('link', { name: /^tasks$/i }).click()
    await page.waitForURL(/\/app\/help/)

    await expect(page.getByLabel(/search help/i)).toHaveValue('')
    await expect(page.getByRole('heading', { name: /create your first task/i })).toBeVisible()
  })

  test('dashboard first steps show the active next action', async ({ page }) => {
    await page.goto('/app/dashboard')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')

    await expect(
      page.getByRole('heading', { name: /here's how to get your compliance program started/i }),
    ).toBeVisible()

    await page.getByRole('link', { name: /open your first hipaa checklist/i }).click()
    await page.waitForURL(/\/app\/compliance\/checklists/)

    await page.goto('/app/dashboard')
    await expect(page.getByText(/invite a teammate/i)).toBeVisible()
    await expect(page.getByText(/review your privacy policy/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /invite a teammate/i })).not.toBeVisible()
    await expect(page.getByRole('link', { name: /review your privacy policy/i })).not.toBeVisible()
  })

  test('tasks and checklists include contextual step-by-step help', async ({ page }) => {
    await page.goto('/app/tasks')
    await expect(page.getByText(/tasks are your clinic follow-up list/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /show step-by-step guide/i })).toBeVisible()

    await page.goto('/app/compliance/checklists')
    await expect(page.getByText(/start here if compliance feels too broad/i)).toBeVisible()
    await expect(page.getByRole('link', { name: /show step-by-step guide/i })).toBeVisible()
  })
})
