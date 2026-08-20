import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { logger } from '@phiguard/audit'

const FailedLoginAttemptInput = z.object({
  route: z.string().min(1),
  reason: z.string().min(1),
})

export async function recordFailedLoginAttempt(input: {
  route: string
  reason: string
}) {
  logger.safe.warn(
    {
      route: input.route,
      reason: input.reason,
    },
    'Failed login',
  )
}

export const recordFailedLoginAttemptFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => FailedLoginAttemptInput.parse(data))
  .handler(async ({ data }) => recordFailedLoginAttempt(data))
