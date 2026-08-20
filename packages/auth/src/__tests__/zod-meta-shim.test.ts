import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import '../zod-meta-shim'

describe('zod meta shim', () => {
  it('supports Better Auth style metadata calls on zod v3', () => {
    const schemaWithMeta = (z.coerce.boolean() as z.ZodTypeAny & {
      meta: (metadata?: { description?: string }) => z.ZodTypeAny
    }).meta({
      description: 'Boolean flag',
    })

    expect(schemaWithMeta.description).toBe('Boolean flag')
  })
})
