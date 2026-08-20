import postgres from 'postgres'
import type { FullConfig } from '@playwright/test'
import { stopPreviewServer } from './preview-server'
import { PLAYWRIGHT_ADMIN_URL, PLAYWRIGHT_DB_NAME } from './test-env'

const dbName = PLAYWRIGHT_DB_NAME
const adminUrl = PLAYWRIGHT_ADMIN_URL

export default async function globalTeardown(_config: FullConfig) {
  stopPreviewServer()

  const admin = postgres(adminUrl, { max: 1 })

  try {
    await admin.unsafe(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${dbName}'
        AND pid <> pg_backend_pid()
    `)
    await admin.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`)
  } finally {
    await admin.end().catch(() => {})
  }
}
