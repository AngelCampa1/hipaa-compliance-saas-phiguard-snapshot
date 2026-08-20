import { beforeEach, describe, expect, it, vi } from 'vitest'

const drizzleMock = vi.fn()
const postgresMock = vi.fn()

vi.mock('drizzle-orm/postgres-js', () => ({
  drizzle: drizzleMock,
}))

vi.mock('postgres', () => ({
  default: postgresMock,
}))

describe('getDb', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.DATABASE_URL
    delete process.env.DATABASE_SSL
    delete process.env.NODE_ENV

    postgresMock.mockImplementation((connectionString: string, options: Record<string, unknown>) => ({
      connectionString,
      end: vi.fn(),
      options,
    }))
    drizzleMock.mockImplementation((client: unknown) => ({ client }))
  })

  it('reuses a singleton database client', async () => {
    process.env.DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/phiguard'
    const { getDb } = await import('./client.js')

    const first = getDb()
    const second = getDb()

    expect(first).toBe(second)
    expect(postgresMock).toHaveBeenCalledTimes(1)
  })

  it('keeps the singleton when running inside a database context', async () => {
    process.env.DATABASE_URL = 'postgres://postgres:postgres@127.0.0.1:5432/phiguard'
    const { getDb, withDbContext } = await import('./client.js')

    const result = await withDbContext(async () => getDb())
    const client = postgresMock.mock.results[0]?.value

    expect(client.end).not.toHaveBeenCalled()
    expect(getDb()).toBe(result)
  })
})

// Regression guard for the 2026-06-01 production outage: removing Hyperdrive
// request-scoping from this file (or auth.ts / rate-limit.ts) reused a single DB
// client across Worker requests, crashing later requests with cross-request I/O
// errors. Build/typecheck/unit tests did not catch it before — these do now.
// See docs/adr/0018-hyperdrive-request-scoped-db.md.
describe('getDb under Hyperdrive (request-scoped)', () => {
  const HYPERDRIVE_URL = 'postgres://user:pass@phiguard.hyperdrive.local:5432/phiguard'

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    delete process.env.DATABASE_URL
    delete process.env.DATABASE_SSL
    delete process.env.NODE_ENV

    postgresMock.mockImplementation((connectionString: string, options: Record<string, unknown>) => ({
      connectionString,
      end: vi.fn(),
      options,
    }))
    drizzleMock.mockImplementation((client: unknown) => ({ client }))
  })

  it('creates a fresh request-scoped client per withDbContext (no cross-request reuse)', async () => {
    process.env.DATABASE_URL = HYPERDRIVE_URL
    const { getDb, withDbContext } = await import('./client.js')

    const first = await withDbContext(async () => getDb())
    const second = await withDbContext(async () => getDb())

    expect(first).not.toBe(second)
    expect(postgresMock).toHaveBeenCalledTimes(2)
  })

  it('reuses one client within a single context but never a module singleton', async () => {
    process.env.DATABASE_URL = HYPERDRIVE_URL
    const { getDb, withDbContext } = await import('./client.js')

    const [a, b] = await withDbContext(async () => [getDb(), getDb()] as const)

    expect(a).toBe(b)
    expect(postgresMock).toHaveBeenCalledTimes(1)
  })

  it('closes the request-scoped client when the context settles', async () => {
    process.env.DATABASE_URL = HYPERDRIVE_URL
    const { getDb, withDbContext } = await import('./client.js')

    await withDbContext(async () => getDb())
    const client = postgresMock.mock.results[0]?.value

    expect(client.end).toHaveBeenCalledTimes(1)
  })

  it('configures the Hyperdrive client for Workers (no TLS, no prepare, capped pool)', async () => {
    process.env.DATABASE_URL = HYPERDRIVE_URL
    const { getDb, withDbContext } = await import('./client.js')

    await withDbContext(async () => getDb())
    const [connectionString, options] = postgresMock.mock.calls[0] ?? []

    expect(connectionString).toContain('.hyperdrive.local')
    expect(options).toMatchObject({ ssl: false, prepare: false, fetch_types: false, max: 5 })
  })
})
