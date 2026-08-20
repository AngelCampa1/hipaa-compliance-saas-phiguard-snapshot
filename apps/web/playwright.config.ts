import { defineConfig, devices } from '@playwright/test'
import {
  PLAYWRIGHT_AUTH_SECRET,
  PLAYWRIGHT_DATABASE_URL,
} from './e2e/test-env'

const PLAYWRIGHT_APP_URL = process.env.PLAYWRIGHT_APP_URL ?? 'http://127.0.0.1:3210'

process.env.DATABASE_URL ??= PLAYWRIGHT_DATABASE_URL
process.env.BETTER_AUTH_SECRET ??= PLAYWRIGHT_AUTH_SECRET

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  retries: process.env.CI ? 2 : 0,
  timeout: 60 * 1000,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: PLAYWRIGHT_APP_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/e2e/mobile/**/*.spec.ts',
    },
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
