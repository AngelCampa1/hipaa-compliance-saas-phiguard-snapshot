import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@phiguard/audit', () => ({
  setObjectStorageBindings: vi.fn(),
}))

const stripeRuntimeKeys = [
  'STRIPE_PRICE_ESSENTIALS_MONTHLY',
  'STRIPE_PRICE_ESSENTIALS_ANNUAL',
  'STRIPE_PRICE_CLINIC_MONTHLY',
  'STRIPE_PRICE_CLINIC_ANNUAL',
  'STRIPE_PRICE_GROUP_MONTHLY',
  'STRIPE_PRICE_GROUP_ANNUAL',
  'STRIPE_M80OFF_COUPON_ID',
  'STRIPE_Y80OFF_COUPON_ID',
] as const

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
  vi.resetModules()
})

describe('syncRuntimeEnv', () => {
  it('syncs cadence-specific Stripe price and limited offer bindings', async () => {
    const { syncRuntimeEnv } = await import('./runtime-env.js')
    const bindings = Object.fromEntries(
      stripeRuntimeKeys.map((key) => [key, `test_${key.toLowerCase()}`]),
    )

    syncRuntimeEnv(bindings)

    for (const key of stripeRuntimeKeys) {
      expect(process.env[key]).toBe(`test_${key.toLowerCase()}`)
    }
  })

  it('syncs emergency read-only mode from runtime bindings', async () => {
    const { syncRuntimeEnv } = await import('./runtime-env.js')

    syncRuntimeEnv({ PHIGUARD_READ_ONLY_MODE: 'true' })

    expect(process.env.PHIGUARD_READ_ONLY_MODE).toBe('true')
  })

  it('syncs runtime feature and secret bindings used by server code', async () => {
    const { syncRuntimeEnv } = await import('./runtime-env.js')

    syncRuntimeEnv({
      AI_CS_CLIENT_ASSERTION_SECRET: 'client-assertion-secret',
      AI_CS_FREE_TEXT_ENABLED: 'true',
      AI_CS_WORKER_ORIGIN: 'https://ai-cs.phiguard.app',
      DIRECT_UPLOAD_SECRET: 'direct-upload-secret',
      INTEGRATION_KMS_KEY_ID: 'legacy-integration-key',
      PRODUCT_ANALYTICS_ENABLED: 'true',
      SCHEDULED_JOBS_ENABLED: 'true',
    })

    expect(process.env.AI_CS_CLIENT_ASSERTION_SECRET).toBe('client-assertion-secret')
    expect(process.env.AI_CS_FREE_TEXT_ENABLED).toBe('true')
    expect(process.env.AI_CS_WORKER_ORIGIN).toBe('https://ai-cs.phiguard.app')
    expect(process.env.DIRECT_UPLOAD_SECRET).toBe('direct-upload-secret')
    expect(process.env.INTEGRATION_KMS_KEY_ID).toBe('legacy-integration-key')
    expect(process.env.PRODUCT_ANALYTICS_ENABLED).toBe('true')
    expect(process.env.SCHEDULED_JOBS_ENABLED).toBe('true')
  })
})
