import { test, expect, type Page } from '@playwright/test'
import { provisionWorkspace } from './helpers/workspace'

/**
 * Compliance E2E tests.
 *
 * These tests provision their own tenant state through the app:
 * signup -> bootstrap org -> assign starter checklist template.
  */

test.describe('Compliance module', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title, { includeChecklist: true })
  })

  test('compliance dashboard loads and shows sections', async ({ page }) => {
    await page.goto('/app/compliance/')
    await waitForAppHydration(page)
    await expect(page.getByRole('heading', { name: /compliance program/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /checklists/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /open incidents/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /policies/i })).toBeVisible()
  })

  test('checklist list page shows seeded checklists', async ({ page }) => {
    await page.goto('/app/compliance/')
    await waitForAppHydration(page)
    // Navigate via the "View all" link
    const checklistsLink = page.getByRole('link', { name: /view all/i }).first()
    await checklistsLink.click()
    await page.waitForURL(/\/app\/compliance\/checklists/)
    // Page should load without error
    await expect(page).not.toHaveURL(/error/)
  })

  test('checklist detail page allows completing and reopening an item', async ({ page }) => {
    // Navigate directly to checklists list
    await page.goto('/app/compliance/')
    await waitForAppHydration(page)

    // If there are checklists, click the first one
    const firstChecklistLink = page.locator('a[href*="/app/compliance/checklists/"]').first()
    await expect(firstChecklistLink).toBeVisible()
    await firstChecklistLink.click()
    await page.waitForURL(/\/app\/compliance\/checklists\//)
    await waitForAppHydration(page)

    await page.getByRole('button', { name: /yes.*set up/i }).click()
    await expect(page.getByText(/Item 2 of 3/i)).toBeVisible()

    await page.getByRole('button', { name: /previous/i }).click()
    await expect(page.getByText(/Item 1 of 3/i)).toBeVisible()
    await page.getByRole('button', { name: /not yet/i }).click()
    await expect(page.getByText(/want to track this as a follow-up task/i)).toBeVisible()
  })

  test('checklist detail page allows attaching evidence to an item', async ({ page }) => {
    await page.goto('/app/compliance/')
    await waitForAppHydration(page)

    const firstChecklistLink = page.locator('a[href*="/app/compliance/checklists/"]').first()
    await expect(firstChecklistLink).toBeVisible()
    await firstChecklistLink.click()
    await page.waitForURL(/\/app\/compliance\/checklists\//)
    await waitForAppHydration(page)

    await page.getByRole('button', { name: /skip/i }).click()
    await expect(page.getByText(/Item 2 of 3/i)).toBeVisible()
    await page.getByRole('button', { name: /skip/i }).click()
    await expect(page.getByText(/Item 3 of 3/i)).toBeVisible()

    await page.getByRole('button', { name: /yes.*set up/i }).click()
    await expect(page.getByText(/attach evidence file/i)).toBeVisible()

    const fileInput = page.locator('input[type="file"]').first()
    await fileInput.setInputFiles({
      name: 'evidence.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('documented evidence'),
    })

    await expect(page.getByText(/evidence attached/i).first()).toBeVisible({ timeout: 10_000 })
  })

  test('file a new incident and verify it appears in the list', async ({ page }) => {
    const title = `E2E Test Incident ${Date.now()}`

    await page.goto('/app/compliance/incidents/new')
    await waitForAppHydration(page)
    await expect(page.getByRole('heading', { name: /report security incident/i })).toBeVisible()

    // Verify PHI warning is displayed
    await expect(page.getByRole('note')).toBeVisible()
    await expect(page.getByRole('note')).toContainText(/do not include patient names/i)

    // Fill out the form
    await page.getByLabel(/incident title/i).fill(title)
    await page.getByLabel(/severity/i).selectOption('low')
    await page.getByLabel(/incident category/i).selectOption('workforce_violation')

    // Set discovered at (yesterday)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateTimeLocal = yesterday.toISOString().slice(0, 16)
    await page.getByLabel(/date\/time discovered/i).fill(dateTimeLocal)

    // Select an affected system
    await page.getByLabel(/email/i).check()

    // Submit
    await page.getByRole('button', { name: /file incident report/i }).click()

    // Should redirect to the incident detail page
    await page.waitForURL(/\/app\/compliance\/incidents\/[a-f0-9-]+$/)
    await expect(page.getByRole('heading', { name: title })).toBeVisible()
    await expect(page.getByText(/^reported$/i).first()).toBeVisible()

    await page.goto('/app/compliance/incidents')
    await waitForAppHydration(page)
    await expect(page.getByRole('link', { name: title })).toBeVisible()
  })

  test('incident detail page shows valid transition buttons', async ({ page }) => {
    // First create an incident to test transitions on
    await page.goto('/app/compliance/incidents/new')
    await waitForAppHydration(page)

    await page.getByLabel(/incident title/i).fill('E2E Test: Transition test incident')
    await page.getByLabel(/severity/i).selectOption('medium')
    await page.getByLabel(/incident category/i).selectOption('phishing')

    const now = new Date()
    await page.getByLabel(/date\/time discovered/i).fill(now.toISOString().slice(0, 16))

    await page.getByRole('button', { name: /file incident report/i }).click()
    await page.waitForURL(/\/app\/compliance\/incidents\/[a-f0-9-]+$/)

    // Should have a "Begin triage" button (reported → triaging)
    const triagebtn = page.getByRole('button', { name: /begin triage/i })
    await expect(triagebtn).toBeVisible()

    // Should NOT have a "Mark resolved" button (reported → resolved is invalid)
    await expect(page.getByRole('button', { name: /mark resolved/i })).not.toBeVisible()

    // Transition to triaging
    await triagebtn.click()
    await expect(page.getByText('triaging')).toBeVisible()

    // Now should show "Mark contained"
    await expect(page.getByRole('button', { name: /mark contained/i })).toBeVisible()
  })

  test('audit log shows the actual checklist completion event', async ({ page }) => {
    await page.goto('/app/compliance/')
    await waitForAppHydration(page)

    const firstChecklistLink = page.locator('a[href*="/app/compliance/checklists/"]').first()
    await expect(firstChecklistLink).toBeVisible()
    await firstChecklistLink.click()
    await page.waitForURL(/\/app\/compliance\/checklists\//)
    await waitForAppHydration(page)

    const firstItem = page.locator('[data-checklist-item-id]').first()
    await firstItem.waitFor({ state: 'visible' })
    const checklistItemId = await firstItem.getAttribute('data-checklist-item-id')
    expect(checklistItemId).toBeTruthy()

    await firstItem.getByRole('button', { name: /yes.*set up/i }).click()
    await expect(page.getByText(/Item 2 of 3/i)).toBeVisible()

    await page.goto('/app/audit')
    await waitForAppHydration(page)
    await expect(page.getByRole('heading', { name: /audit log/i })).toBeVisible()
    const auditRow = await waitForAuditEvent(page, {
      action: 'checklist_item.completed',
      resourceId: checklistItemId ?? '',
      resourceType: 'checklist_item',
    })
    await expect(auditRow.locator('td').nth(2)).toHaveText('checklist_item.completed')
  })

  test('audit log shows the actual incident creation event', async ({ page }) => {
    await page.goto('/app/compliance/incidents/new')
    await waitForAppHydration(page)
    await expect(page.getByRole('heading', { name: /report security incident/i })).toBeVisible()

    await page.getByLabel(/incident title/i).fill(`E2E Audit Incident ${Date.now()}`)
    await page.getByLabel(/severity/i).selectOption('low')
    await page.getByLabel(/incident category/i).selectOption('workforce_violation')

    const discoveredAt = new Date().toISOString().slice(0, 16)
    await page.getByLabel(/date\/time discovered/i).fill(discoveredAt)
    await page.getByLabel(/email/i).check()
    await page.getByRole('button', { name: /file incident report/i }).click()

    await page.waitForURL(/\/app\/compliance\/incidents\/[a-f0-9-]+$/)
    const incidentId = page.url().split('/app/compliance/incidents/')[1]?.split('?')[0]
    expect(incidentId).toBeTruthy()

    await page.goto('/app/audit')
    await waitForAppHydration(page)
    await expect(page.getByRole('heading', { name: /audit log/i })).toBeVisible()
    const auditRow = await waitForAuditEvent(page, {
      action: 'incident.created',
      resourceId: incidentId ?? '',
      resourceType: 'incident',
    })
    await expect(auditRow.locator('td').nth(2)).toHaveText('incident.created')
  })
})

async function waitForAppHydration(page: Page) {
  await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')
}

async function waitForAuditEvent(
  page: Page,
  {
    action,
    resourceId,
    resourceType,
  }: {
    action: string
    resourceId: string
    resourceType: string
  },
) {
  const auditTable = page.locator('table[aria-label="Audit events"]')

  for (let attempt = 0; attempt < 10; attempt += 1) {
    await page.getByLabel(/resource type/i).fill(resourceType)
    await page.getByLabel(/resource id/i).fill(resourceId)
    await page.getByRole('button', { name: /search/i }).click()
    await auditTable.waitFor({ state: 'visible' })

    const auditRow = page
      .locator('tr[data-event-id]')
      .filter({ hasText: resourceId })
      .filter({ hasText: action })
      .first()

    if (await auditRow.isVisible().catch(() => false)) {
      await expect(auditRow.locator('td').nth(2)).toHaveText(action)
      return auditRow
    }

    await page.waitForTimeout(1_000)
  }

  throw new Error(`Audit event ${action} for ${resourceType}:${resourceId} did not appear in time`)
}
