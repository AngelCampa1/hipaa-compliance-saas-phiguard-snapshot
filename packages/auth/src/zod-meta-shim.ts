import { z } from 'zod'

type ZodSchemaWithOptionalMeta = z.ZodTypeAny & {
  meta?: (metadata?: { description?: string }) => z.ZodTypeAny
  describe: (description?: string) => z.ZodTypeAny
}

const sampleSchema = z.string() as ZodSchemaWithOptionalMeta

if (typeof sampleSchema.meta !== 'function') {
  Object.defineProperty(Object.getPrototypeOf(sampleSchema), 'meta', {
    configurable: true,
    writable: true,
    value(this: ZodSchemaWithOptionalMeta, metadata?: { description?: string }) {
      if (metadata?.description) {
        return this.describe(metadata.description)
      }

      return this
    },
  })
}
