import { test, expect } from '@playwright/test'

test('public root entry page stays unauthenticated and renders calls to action', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/$/)

  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /run recurring hipaa work from one operations hub/i,
    }),
  ).toBeVisible()

  await expect(page.getByRole('link', { name: 'Start free trial' })).toHaveAttribute(
    'href',
    '/signup',
  )
  await expect(page.getByRole('link', { name: 'Sign in' }).first()).toHaveAttribute(
    'href',
    '/login',
  )
})

test('signup flow reaches billing through real auth and onboarding', async ({ page }) => {
  const email = `smoke-${Date.now()}@example.com`

  await page.goto('/signup')
  await expect(page.getByRole('heading', { name: /create your phiguard account/i })).toBeVisible()

  await page.getByLabel(/full name/i).fill('Smoke Test User')
  await page.getByLabel(/^work email$/i).fill(email)
  await page.getByLabel(/^password$/i).fill('TestPassword123!')
  await page.getByRole('button', { name: /create account/i }).click()

  await page.waitForURL(/\/signup\/check-email/)
  await expect(page.getByRole('heading', { name: /check your email/i })).toBeVisible()
  await page.getByRole('link', { name: /continue setup/i }).click()
  await page.waitForURL(/\/app\/onboarding/)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: /accept the baa\. start the trial/i,
    }),
  ).toBeVisible()

  const clinicNameInput = page.getByLabel(/clinic name/i)
  await clinicNameInput.fill('Smoke Test Clinic')
  await expect(clinicNameInput).toHaveValue('Smoke Test Clinic')
  await expect(page.getByLabel(/customer legal entity name/i)).toBeEnabled({ timeout: 15_000 })
  await page.getByLabel(/customer legal entity name/i).fill('Smoke Test Clinic')
  await page.getByLabel(/signer full name/i).fill('Smoke Test User')
  await page.getByLabel(/signer title/i).fill('Founder')
  await clinicNameInput.fill('Smoke Test Clinic')
  await expect(clinicNameInput).toHaveValue('Smoke Test Clinic')
  await page.getByLabel(/I accept the PHIGuard Terms of Service/i).check()
  await page.getByLabel(/I accept the PHIGuard Business Associate Agreement/i).check()
  await page.getByRole('button', { name: /accept and start 30-day trial/i }).click()
  await page.waitForURL(/\/app\/dashboard/, { timeout: 15_000 })

  await page.goto('/app/billing')
  await expect(
    page.getByRole('heading', { name: /manage billing, trial access, and plan details/i }),
  ).toBeVisible()
  await expect(page.getByText(/no credit card on file yet/i)).toBeVisible()
})

test('signup page returns a nonce-bearing CSP header under the production preview', async ({
  page,
}) => {
  const response = await page.goto('/signup')
  await expect(page.getByRole('heading', { name: /create your phiguard account/i })).toBeVisible()

  const csp = response?.headers()['content-security-policy']
  expect(csp).toMatch(/script-src 'self' 'nonce-[A-Za-z0-9+/=_-]+'/)
  const html = await response?.text()
  expect(html).toMatch(/<script nonce="[^"]+"/)
})

test('login page renders', async ({ page }) => {
  await page.goto('/app/dashboard')
  await page.waitForURL(/\/login/)
  await expect(page).toHaveTitle(/PHIGuard/)
  const h1 = page.getByRole('heading', { level: 1 })
  await expect(h1).toBeVisible()
  await expect(h1).toContainText(/sign in|log in|phiguard/i)
})

test('unauthenticated visit to /app redirects to login', async ({ page }) => {
  await page.goto('/app/dashboard')
  await expect(page).toHaveURL(/\/login/)
})
