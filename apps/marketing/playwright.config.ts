import { defineConfig, devices } from '@playwright/test'

const PLAYWRIGHT_MARKETING_URL = process.env.PLAYWRIGHT_MARKETING_URL ?? 'http://127.0.0.1:4322'
const MARKETING_E2E_ENV: Record<string, string> = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  ),
)

MARKETING_E2E_ENV.PUBLIC_APP_URL = process.env.PUBLIC_APP_URL ?? 'http://127.0.0.1:3000'
MARKETING_E2E_ENV.PUBLIC_POSTHOG_KEY = process.env.PUBLIC_POSTHOG_KEY ?? 'phc_test_playwright'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60 * 1000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: PLAYWRIGHT_MARKETING_URL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm exec astro build && pnpm exec astro preview --host 127.0.0.1 --port 4322',
    env: MARKETING_E2E_ENV,
    url: PLAYWRIGHT_MARKETING_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile project — three canonical test viewports used across Wave 1–3.
    // Specs in e2e/**/*.spec.ts tagged with `--project=mobile` run against all three.
    {
      name: 'mobile-320',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 320, height: 700 },
        isMobile: true,
        hasTouch: true,
      },
      testMatch: '**/e2e/mobile/**/*.spec.ts',
    },
    {
      name: 'mobile-375',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
      testMatch: '**/e2e/mobile/**/*.spec.ts',
    },
    {
      name: 'mobile-414',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 414, height: 896 },
        isMobile: true,
        hasTouch: true,
      },
      testMatch: '**/e2e/mobile/**/*.spec.ts',
    },
  ],
})
