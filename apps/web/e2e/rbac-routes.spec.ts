import { expect, test } from '@playwright/test'
import { provisionWorkspace } from './helpers/workspace'

test.describe('RBAC rendered route access', () => {
  test('auditor can read SOC 2 but cannot open task creation', async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title, { role: 'auditor' })

    await page.goto('/app/soc2')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')
    await expect(page.getByRole('heading', { name: /soc 2/i })).toBeVisible()

    await page.goto('/app/tasks/new')
    await expect(page.getByText('Read-only access')).toBeVisible()
    await expect(page.getByText('You cannot create tasks in this workspace.')).toBeVisible()
  })

  test('location staff cannot access organization-wide location settings', async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title, {
      role: 'location_staff',
      locationCount: 2,
      grantedLocationIndexes: [0],
    })

    await page.goto('/app/settings/locations')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add location' })).toBeDisabled()
  })

  test('location manager can access member settings with location-scoped management controls', async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title, {
      role: 'location_manager',
      locationCount: 2,
      grantedLocationIndexes: [0],
    })

    await page.goto('/app/settings/members')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')
    await expect(page.getByRole('heading', { name: 'Members', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send invitation' })).toBeDisabled()
    await expect(page.locator('#member-role option[value="location_staff"]')).toHaveCount(1)
    await expect(page.locator('#member-role option[value="location_manager"]')).toHaveCount(0)
    await expect(page.locator('#member-role option[value="org_admin"]')).toHaveCount(0)
    await expect(page.locator('#member-role option[value="auditor"]')).toHaveCount(0)
  })

  test('organization admin can access location settings', async ({ page }, testInfo) => {
    await provisionWorkspace(page, testInfo.title, { role: 'org_admin', locationCount: 2 })

    await page.goto('/app/settings/locations')
    await expect(page.locator('body')).toHaveAttribute('data-app-hydrated', 'true')
    await expect(page.getByRole('heading', { name: /locations/i })).toBeVisible()
  })
})
