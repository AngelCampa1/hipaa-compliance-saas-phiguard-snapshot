import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

describe('generated worker entrypoint', () => {
  it('keeps database access scoped to the Worker handler context', async () => {
    const source = await readFile(new URL('../scripts/vite-build.mjs', import.meta.url), 'utf8')

    expect(source).toContain("import { getDb, withDbContext } from '@phiguard/db/server'")
    expect(source).toContain('await withDbContext(() => runScheduledJob(cron))')
    expect(source).toContain('return withDbContext(() => server.fetch(request))')
  })

  it('retries the scheduled job three times on transient db connection errors', async () => {
    const source = await readFile(new URL('../scripts/vite-build.mjs', import.meta.url), 'utf8')

    expect(source).toContain("import { isTransientDbError } from '../src/lib/db-errors.ts'")
    expect(source).toContain('const SCHEDULED_DB_MAX_ATTEMPTS = 3')
    expect(source).toContain('if (!isTransientDbError(error) || attempt === SCHEDULED_DB_MAX_ATTEMPTS) {')
    expect(source).toContain('attempt: String(attempt)')
    expect(source).toContain('maxAttempts: String(SCHEDULED_DB_MAX_ATTEMPTS)')
    expect(source).toContain('retried: String(retried)')
  })

  it('injects non-empty Vite env vars from root wrangler config before building', async () => {
    const source = await readFile(new URL('../scripts/vite-build.mjs', import.meta.url), 'utf8')

    expect(source).toContain('readRootWranglerVars')
    expect(source).toContain('/"(VITE_[A-Z0-9_]+)"\\s*:\\s*"([^"]*)"/g')
    expect(source).toContain('if (!process.env[key])')
  })
})
