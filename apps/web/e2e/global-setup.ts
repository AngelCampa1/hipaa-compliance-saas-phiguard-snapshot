import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'
import type { FullConfig } from '@playwright/test'
import { startPreviewServer } from './preview-server'
// Shared with `node scripts/reset-local-db.mjs` so local setup and CI apply
// migrations through exactly one code path.
import { applyMigrations, recreateDatabase } from '../../../scripts/reset-local-db.mjs'
import {
  PLAYWRIGHT_ADMIN_URL,
  PLAYWRIGHT_AUTH_SECRET,
  PLAYWRIGHT_DATABASE_URL,
  PLAYWRIGHT_DB_NAME,
} from './test-env'

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, '../../..')
const webRoot = join(repoRoot, 'apps/web')
const dbName = PLAYWRIGHT_DB_NAME
const adminUrl = PLAYWRIGHT_ADMIN_URL
const databaseUrl = PLAYWRIGHT_DATABASE_URL
const POSTGRES_START_TIMEOUT_MS = 120_000

function startPostgresContainer() {
  execFileSync('docker', ['compose', 'up', '-d', 'postgres'], {
    cwd: repoRoot,
    stdio: 'inherit',
    timeout: POSTGRES_START_TIMEOUT_MS,
  })
}

function buildWebApp() {
  execFileSync('pnpm', ['--filter', '@phiguard/web', 'build'], {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true,
  })
}

function hasBuiltWebApp() {
  const candidatePaths = [
    join(webRoot, 'dist', 'server', 'server.js'),
    join(webRoot, 'dist', 'server.js'),
  ]
  const hasServerBundle = candidatePaths.some((path) => existsSync(path))
  const hasClientAssets =
    existsSync(join(webRoot, 'dist', 'client', 'assets')) || existsSync(join(webRoot, 'dist', 'assets'))

  return hasServerBundle && hasClientAssets
}

async function waitForPostgres() {
  let lastError: unknown

  for (let attempt = 0; attempt < 30; attempt += 1) {
    const client = postgres(adminUrl, { max: 1 })

    try {
      await client`select 1`
      await client.end()
      return
    } catch (error) {
      lastError = error
      await client.end().catch(() => {})
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Postgres did not become ready for Playwright')
}

async function warmPreviewRoute(url: string, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  let lastError: unknown

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        redirect: 'manual',
      })

      if (response.ok || [301, 302, 303, 307, 308].includes(response.status)) {
        return
      }

      lastError = new Error(`Warmup request returned HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Route warmup failed for ${url}`)
}

export default async function globalSetup(_config: FullConfig) {
  process.env.DATABASE_URL = databaseUrl
  process.env.BETTER_AUTH_SECRET ??= PLAYWRIGHT_AUTH_SECRET
  startPostgresContainer()
  await waitForPostgres()
  await recreateDatabase(dbName, adminUrl)
  await applyMigrations(databaseUrl)
  if (!hasBuiltWebApp()) {
    buildWebApp()
  }
  await startPreviewServer()
  await warmPreviewRoute(`${process.env.PLAYWRIGHT_APP_URL ?? 'http://127.0.0.1:3210'}/signup`)
}
