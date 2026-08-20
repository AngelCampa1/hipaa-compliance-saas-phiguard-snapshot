/**
 * Captures the product screenshot archive used in the portfolio README.
 *
 *   pnpm --filter @phiguard/web exec playwright test portfolio-screenshots
 *
 * This is not a test — nothing here asserts product behaviour. It rides the
 * existing Playwright harness because that harness already does the hard parts:
 * `global-setup.ts` starts Postgres, rebuilds the database, applies all 62
 * migrations, builds the app, and boots a preview server.
 *
 * Data comes from `scripts/demo-seed.ts`, so every screen shows a clinic with
 * real history rather than an empty state. Screens are captured under three
 * roles to show what RBAC actually changes.
 *
 * A page that fails to load is recorded as a failure rather than saved as a
 * broken screenshot — a portfolio archive full of error pages is worse than no
 * archive.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test, type Page } from '@playwright/test'
import sharp from 'sharp'
import { createSessionBootstrapCookie } from '@phiguard/auth'
import { getDb } from '@phiguard/db/server'
import { seedDemoWorkspace, type DemoSeedResult } from '../scripts/demo-seed'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '../../..')
const outDir = join(repoRoot, 'portfolio', 'screenshots', 'app')
const manifestPath = join(outDir, 'manifest.json')

const APP_URL = process.env.PLAYWRIGHT_APP_URL ?? 'http://127.0.0.1:3210'

const DESKTOP = { width: 1440, height: 900 }
const MOBILE = { width: 375, height: 812 }

type Shot = { file: string; path: string; caption: string; role: string; viewport: string; bytes: number }

const manifest: Shot[] = []
const failures: { path: string; role: string; reason: string }[] = []
let demo: DemoSeedResult

/** Screens captured as the practice administrator — the full-access view. */
const OWNER_SCREENS = [
  { path: '/app/dashboard', name: 'dashboard', caption: 'Operations dashboard with multi-location rollup' },
  { path: '/app/tasks', name: 'tasks-list', caption: 'Task list with overdue, priority and assignment state' },
  { path: '/app/tasks/new', name: 'tasks-new', caption: 'New task form' },
  { path: '/app/compliance', name: 'compliance-overview', caption: 'Compliance overview' },
  { path: '/app/compliance/checklists', name: 'checklists', caption: 'Recurring checklists across locations' },
  { path: '/app/compliance/incidents', name: 'incidents', caption: 'Incident register by severity and status' },
  { path: '/app/compliance/incidents/new', name: 'incidents-new', caption: 'Incident intake form' },
  { path: '/app/compliance/policies', name: 'policies-rollout', caption: 'Policy rollout by location' },
  { path: '/app/compliance/program', name: 'program-overview', caption: 'Compliance program overview' },
  { path: '/app/compliance/program/policies', name: 'program-policies', caption: 'Policy library with acknowledgement tracking' },
  { path: '/app/compliance/program/risk', name: 'program-risk', caption: 'Risk register scored by likelihood and impact' },
  { path: '/app/compliance/program/training', name: 'program-training', caption: 'Workforce training records' },
  { path: '/app/compliance/program/vendors', name: 'program-vendors', caption: 'Vendor register with BAA expiry tracking' },
  { path: '/app/soc2', name: 'soc2-overview', caption: 'SOC 2 control coverage' },
  { path: '/app/soc2/controls', name: 'soc2-controls', caption: 'SOC 2 controls with evidence counts' },
  { path: '/app/soc2/evidence', name: 'soc2-evidence', caption: 'Evidence register' },
  { path: '/app/soc2/access-reviews', name: 'soc2-access-reviews', caption: 'Periodic access reviews' },
  { path: '/app/audit', name: 'audit-log', caption: 'Immutable audit trail' },
  { path: '/app/audit/export', name: 'audit-export', caption: 'Audit log export' },
  { path: '/app/reports', name: 'reports', caption: 'Reporting overview' },
  { path: '/app/settings', name: 'settings', caption: 'Organization settings' },
  { path: '/app/settings/members', name: 'settings-members', caption: 'Members and role assignment' },
  { path: '/app/settings/locations', name: 'settings-locations', caption: 'Location management' },
  { path: '/app/settings/profile', name: 'settings-profile', caption: 'User profile' },
  { path: '/app/settings/integrations', name: 'settings-integrations', caption: 'Calendar integrations' },
  { path: '/app/settings/security-keys', name: 'settings-security-keys', caption: 'Passkey and security key enrolment' },
  { path: '/app/billing', name: 'billing', caption: 'Plan and billing' },
  { path: '/app/help', name: 'help', caption: 'In-app help' },
]

/** Same core screens under restricted roles, to show the RBAC difference. */
const AUDITOR_SCREENS = [
  { path: '/app/dashboard', name: 'auditor-dashboard', caption: 'Dashboard as an external auditor' },
  { path: '/app/soc2/auditor', name: 'auditor-soc2', caption: 'Read-only auditor view of SOC 2 evidence' },
  { path: '/app/audit', name: 'auditor-audit-log', caption: 'Audit trail as an external auditor' },
]

const STAFF_SCREENS = [
  { path: '/app/dashboard', name: 'staff-dashboard', caption: 'Dashboard as location staff — scoped to one location' },
  { path: '/app/tasks', name: 'staff-tasks', caption: 'Task list as location staff' },
  { path: '/app/compliance', name: 'staff-compliance', caption: 'Compliance as location staff' },
]

/** Unauthenticated surfaces. */
const PUBLIC_SCREENS = [
  { path: '/', name: 'public-entry', caption: 'Unauthenticated entry page' },
  { path: '/login', name: 'login', caption: 'Sign in' },
  { path: '/signup', name: 'signup', caption: 'Create account' },
  { path: '/forgot-password', name: 'forgot-password', caption: 'Password reset request' },
]

/** Screens worth showing at a phone width. */
const MOBILE_SCREENS = [
  { path: '/app/dashboard', name: 'dashboard', caption: 'Dashboard at 375px' },
  { path: '/app/tasks', name: 'tasks-list', caption: 'Task list at 375px' },
  { path: '/app/compliance/program/risk', name: 'program-risk', caption: 'Risk register at 375px' },
  { path: '/app/soc2', name: 'soc2-overview', caption: 'SOC 2 overview at 375px' },
  { path: '/app/audit', name: 'audit-log', caption: 'Audit trail at 375px' },
]

// ── helpers ─────────────────────────────────────────────────────────────────

async function signInAs(page: Page, roleKey: string) {
  const person = demo.people.find((candidate) => candidate.key === roleKey)
  if (!person) throw new Error(`Demo seed produced no user for role "${roleKey}"`)

  const cookie = await createSessionBootstrapCookie(person.id, {
    activeOrganizationId: demo.organizationId,
  })
  const token = cookie.match(/better-auth\.session_token=([^;]+)/)?.[1]
  if (!token) throw new Error('Could not extract session token from bootstrap cookie')

  await page.context().clearCookies()
  await page.context().addCookies([
    {
      name: 'better-auth.session_token',
      value: decodeURIComponent(token),
      url: APP_URL,
      httpOnly: true,
      sameSite: 'Lax',
    },
  ])
}

/**
 * The app sets `data-app-hydrated` on <body> once the client has taken over.
 * Screenshotting before that yields a half-rendered shell.
 */
async function waitForHydration(page: Page) {
  await page.locator('body[data-app-hydrated="true"]').waitFor({ timeout: 30_000 })
}

async function capture(
  page: Page,
  target: { path: string; name: string; caption: string },
  role: string,
  viewport: 'desktop' | 'mobile',
) {
  const fileName = `${target.name}${viewport === 'mobile' ? '.mobile' : ''}.png`

  try {
    const response = await page.goto(target.path, { waitUntil: 'domcontentloaded', timeout: 45_000 })
    if (response && response.status() >= 400) {
      throw new Error(`HTTP ${response.status()}`)
    }

    await waitForHydration(page)
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {})
    await page.evaluate(() => document.fonts?.ready)
    // Let skeletons resolve into loaded content.
    await page.waitForTimeout(700)

    // The router redirects client-side, so a screen the account cannot reach
    // still resolves HTTP 200 and would be written to disk under the requested
    // screen's name. That is how an entire archive of onboarding-gate captures
    // once passed this spec while every assertion was green. Compare the final
    // URL with the one asked for and fail loudly instead.
    const landedOn = new URL(page.url()).pathname.replace(/\/$/, '')
    const asked = target.path.replace(/\/$/, '')
    if (landedOn !== asked) {
      throw new Error(`redirected to ${landedOn} — the account cannot reach this screen`)
    }

    const buffer = await page.screenshot({ fullPage: true, animations: 'disabled' })
    const optimized = await sharp(buffer)
      .png({ compressionLevel: 9, effort: 10, palette: true, quality: 90 })
      .toBuffer()

    writeFileSync(join(outDir, fileName), optimized)
    manifest.push({
      file: fileName,
      path: target.path,
      caption: target.caption,
      role,
      viewport,
      bytes: optimized.length,
    })
  } catch (error) {
    failures.push({
      path: target.path,
      role,
      reason: error instanceof Error ? error.message : String(error),
    })
  }
}

// ── capture run ─────────────────────────────────────────────────────────────

// Serial because every test shares one seeded workspace and one browser.
//
// The 60s per-test default in `playwright.config.ts` is sized for functional
// specs that touch one or two pages. A capture pass walks ~30 screens, waiting
// for hydration, network idle, fonts and animations on each, so it needs a
// budget an order of magnitude larger. Without this the run is killed
// mid-capture and serial mode then skips every remaining role.
const CAPTURE_TIMEOUT_MS = 15 * 60 * 1000

test.describe.configure({ mode: 'serial', timeout: CAPTURE_TIMEOUT_MS })

test.beforeAll(async () => {
  test.setTimeout(CAPTURE_TIMEOUT_MS)
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  demo = await seedDemoWorkspace(getDb())
})

test('capture unauthenticated screens', async ({ page }) => {
  await page.setViewportSize(DESKTOP)
  await page.context().clearCookies()

  for (const target of PUBLIC_SCREENS) {
    await capture(page, target, 'anonymous', 'desktop')
  }
})

test('capture practice administrator screens', async ({ page }) => {
  await page.setViewportSize(DESKTOP)
  await signInAs(page, 'owner')

  for (const target of OWNER_SCREENS) {
    await capture(page, target, 'org_owner', 'desktop')
  }

  // Detail views need a real record id, so reach them by following the list.
  await page.goto('/app/tasks')
  await waitForHydration(page)
  const firstTask = page.locator('a[href^="/app/tasks/"]').first()
  if (await firstTask.count()) {
    const href = await firstTask.getAttribute('href')
    if (href) {
      await capture(page, { path: href, name: 'task-detail', caption: 'Task detail with comments and audit history' }, 'org_owner', 'desktop')
    }
  }

  await page.goto('/app/compliance/incidents')
  await waitForHydration(page)
  const firstIncident = page.locator('a[href^="/app/compliance/incidents/"]').first()
  if (await firstIncident.count()) {
    const href = await firstIncident.getAttribute('href')
    if (href && !href.endsWith('/new')) {
      await capture(page, { path: href, name: 'incident-detail', caption: 'Incident detail with status timeline' }, 'org_owner', 'desktop')
    }
  }

  await page.goto('/app/compliance/checklists')
  await waitForHydration(page)
  const firstChecklist = page.locator('a[href^="/app/compliance/checklists/"]').first()
  if (await firstChecklist.count()) {
    const href = await firstChecklist.getAttribute('href')
    if (href) {
      await capture(page, { path: href, name: 'checklist-detail', caption: 'Checklist detail with item completion' }, 'org_owner', 'desktop')
    }
  }
})

test('capture auditor screens', async ({ page }) => {
  await page.setViewportSize(DESKTOP)
  await signInAs(page, 'auditor')

  for (const target of AUDITOR_SCREENS) {
    await capture(page, target, 'auditor', 'desktop')
  }
})

test('capture location staff screens', async ({ page }) => {
  await page.setViewportSize(DESKTOP)
  await signInAs(page, 'staff')

  for (const target of STAFF_SCREENS) {
    await capture(page, target, 'location_staff', 'desktop')
  }
})

test('capture mobile screens', async ({ page }) => {
  await page.setViewportSize(MOBILE)
  await signInAs(page, 'owner')

  for (const target of MOBILE_SCREENS) {
    await capture(page, target, 'org_owner', 'mobile')
  }
})

test.afterAll(async () => {
  writeFileSync(
    manifestPath,
    `${JSON.stringify(
      {
        generatedBy: 'apps/web/e2e/portfolio-screenshots.spec.ts',
        seededBy: 'apps/web/scripts/demo-seed.ts',
        organization: demo?.organizationName,
        counts: demo?.counts,
        shots: manifest,
      },
      null,
      2,
    )}\n`,
  )

  const totalBytes = manifest.reduce((sum, shot) => sum + shot.bytes, 0)
  console.log(`\nCaptured ${manifest.length} screenshots (${(totalBytes / 1024 / 1024).toFixed(1)} MB) → ${outDir}`)

  if (failures.length > 0) {
    console.log('\nFailed to capture:')
    for (const failure of failures) {
      console.log(`  - [${failure.role}] ${failure.path}: ${failure.reason}`)
    }
  }

  // Surface capture failures instead of shipping a half-empty archive.
  expect(failures, `${failures.length} screen(s) failed to capture`).toEqual([])
})
