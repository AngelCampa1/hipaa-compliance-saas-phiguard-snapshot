import type { Page } from '@playwright/test'
import { createSessionBootstrapCookie } from '@phiguard/auth'
import { getStandardLegalDocuments, hashDocument } from '@phiguard/baa'
import { assignChecklistTemplateToLocations, runSeed } from '@phiguard/compliance'
import {
  getDb,
  legalAcceptances,
  locationGrants,
  locations,
  memberships,
  organizations,
  users,
} from '@phiguard/db/server'

export const E2E_PASSWORD = 'TestPassword123!'

const PLAYWRIGHT_APP_URL = process.env.PLAYWRIGHT_APP_URL ?? 'http://127.0.0.1:3210'
const STARTER_CHECKLIST_TEMPLATE_ID = '11111111-1111-4111-8111-111111111111'

type WorkspaceRole = 'org_owner' | 'org_admin' | 'location_manager' | 'location_staff' | 'auditor'
type WorkspacePlan = 'essentials' | 'clinic' | 'group' | 'compliance_ops'
type WorkspacePlanStatus =
  | 'selection_required'
  | 'trial_pending'
  | 'trialing'
  | 'active'
  | 'paused'
  | 'past_due'
  | 'canceled'

type WorkspaceOptions = {
  includeChecklist?: boolean
  role?: WorkspaceRole
  plan?: WorkspacePlan
  planStatus?: WorkspacePlanStatus
  legalAccepted?: boolean
  locationCount?: number
  grantedLocationIndexes?: number[]
  bootstrapPath?: string
}

function normalizeSeed(seed: string) {
  return (
    seed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'workspace'
  )
}

function extractCookieValue(setCookie: string, cookieName: string) {
  const escapedName = cookieName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = setCookie.match(new RegExp(`${escapedName}=([^;]+)`))

  if (!match?.[1]) {
    throw new Error(`Could not extract ${cookieName} from Set-Cookie header`)
  }

  return decodeURIComponent(match[1])
}

async function waitForHydratedApp(page: Page, context: string) {
  const body = page.locator('body')

  try {
    await body.waitFor({ state: 'attached', timeout: 20_000 })
    await body.waitFor({ state: 'visible', timeout: 20_000 })
    await body.waitFor({ state: 'attached', timeout: 20_000 })
    await page.locator('body[data-app-hydrated="true"]').waitFor({ timeout: 20_000 })
  } catch (error) {
    const alertText = await page.getByRole('alert').textContent().catch(() => null)
    const hydrationState = await body.getAttribute('data-app-hydrated').catch(() => null)

    throw new Error(
      `App did not hydrate during ${context}. Current URL: ${page.url()}. Hydration state: ${hydrationState ?? 'missing'}. Alert: ${alertText ?? 'none'}. Cause: ${error instanceof Error ? error.message : 'unknown'}`,
    )
  }
}

async function gotoWhenReady(page: Page, url: string) {
  let lastError: unknown

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      await page.goto(url)
      return
    } catch (error) {
      lastError = error
      await page.waitForTimeout(1_000)
    }
  }

  throw lastError
}

async function seedWorkspace(
  seed: string,
  options?: WorkspaceOptions,
) {
  const db = getDb()
  const normalizedSeed = normalizeSeed(seed)
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const email = `e2e+${normalizedSeed}-${suffix}@example.com`
  const clinicName = `E2E ${normalizedSeed} ${suffix}`.slice(0, 110)
  const organizationSlug = `${normalizedSeed}-${suffix}`
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)

  const [user] = await db.insert(users).values({
    email,
    emailVerified: true,
    emailVerifiedAt: new Date(),
    name: 'E2E Test User',
  }).returning()

  const [organization] = await db.insert(organizations).values({
    name: clinicName,
    slug: organizationSlug,
    plan: options?.plan ?? 'clinic',
    planStatus: options?.planStatus ?? 'active',
    termsAcceptedAt: options?.legalAccepted === false ? null : new Date(),
    baaSignedAt: options?.legalAccepted === false ? null : new Date(),
    baaSignedByUserId: user.id,
    termsAcceptedByUserId: user.id,
    maxMembers: 25,
  }).returning()

  const [membership] = await db.insert(memberships).values({
    userId: user.id,
    tenantId: organization.id,
    role: options?.role ?? 'org_owner',
    acceptedAt: new Date(),
  }).returning()

  const [primaryLocation] = await db.insert(locations).values({
    organizationId: organization.id,
    name: `${clinicName} Primary`,
    slug: 'primary',
    isPrimary: true,
  }).returning()
  const allLocations = [primaryLocation]

  const locationCount = Math.max(1, options?.locationCount ?? 1)
  for (let index = 1; index < locationCount; index += 1) {
    const [location] = await db.insert(locations).values({
      organizationId: organization.id,
      name: `${clinicName} Location ${index + 1}`,
      slug: `location-${index + 1}`,
      isPrimary: false,
    }).returning()
    allLocations.push(location)
  }

  if (options?.role === 'location_manager' || options?.role === 'location_staff') {
    const grantedIndexes = options.grantedLocationIndexes?.length
      ? options.grantedLocationIndexes
      : [0]
    await db.insert(locationGrants).values(
      grantedIndexes.map((index) => ({
        tenantId: organization.id,
        membershipId: membership.id,
        locationId: allLocations[index]?.id ?? primaryLocation.id,
      })),
    )
  }

  if (options?.legalAccepted !== false) {
    const acceptedAt = new Date()
    await db.insert(legalAcceptances).values(
      getStandardLegalDocuments().map((document) => ({
        tenantId: organization.id,
        documentType: document.type,
        documentVersion: document.version,
        documentTitle: document.title,
        contentHash: hashDocument(document),
        customerEntityName: clinicName,
        signerName: 'E2E Test User',
        signerTitle: 'Owner',
        signerEmail: email,
        acceptedByUserId: user.id,
        acceptedAt,
        snapshot: document,
      })),
    )
  }

  if (options?.includeChecklist) {
    await runSeed(db)
    await assignChecklistTemplateToLocations(db, {
      tenantId: organization.id,
      templateId: STARTER_CHECKLIST_TEMPLATE_ID,
      locationIds: allLocations.map((location) => location.id),
      actorId: user.id,
    })
  }

  const sessionCookie = await createSessionBootstrapCookie(user.id, {
    activeOrganizationId: organization.id,
  })

  return {
    clinicName,
    email,
    organizationId: organization.id,
    password: E2E_PASSWORD,
    locationIds: allLocations.map((location) => location.id),
    primaryLocationId: primaryLocation.id,
    sessionCookie,
  }
}

export async function provisionWorkspace(
  page: Page,
  seed: string,
  options?: WorkspaceOptions,
) {
  const workspace = await seedWorkspace(seed, options)
  const sessionToken = extractCookieValue(
    workspace.sessionCookie,
    'better-auth.session_token',
  )

  await page.context().clearCookies()
  await page.context().addCookies([
    {
      name: 'better-auth.session_token',
      value: sessionToken,
      url: PLAYWRIGHT_APP_URL,
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])

  const bootstrapPath = options?.bootstrapPath ?? '/app/dashboard'
  await gotoWhenReady(page, bootstrapPath)
  await page.waitForURL(new RegExp(bootstrapPath.split('?')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  await waitForHydratedApp(page, 'seeded dashboard bootstrap')
  const mobileMenuButton = page.getByRole('button', { name: 'Open navigation' })
  if (await mobileMenuButton.isVisible().catch(() => false)) {
    await mobileMenuButton.waitFor({ timeout: 10_000 })
  } else {
    await page.getByRole('link', { name: 'Dashboard', exact: true }).waitFor({ timeout: 10_000 })
    await page.getByRole('button', { name: 'Compliance', exact: true }).waitFor({ timeout: 10_000 })
    await page.getByRole('button', { name: 'Sign out (sidebar)' }).waitFor({ timeout: 10_000 })
  }

  return {
    clinicName: workspace.clinicName,
    email: workspace.email,
    locationIds: workspace.locationIds,
    password: workspace.password,
  }
}
