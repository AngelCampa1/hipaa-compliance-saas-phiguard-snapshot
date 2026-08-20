const PRODUCT_ID = 'phiguard'

type SequenceSlug =
  | 'phiguard-fulfillment-welcome'
  | 'phiguard-nurture-value-1'
  | 'phiguard-lead-magnet-nurture'

function getSequencerConfig() {
  const baseUrl = process.env.SEQUENCER_BASE_URL?.trim().replace(/\/+$/, '')
  const clientId = process.env.SEQUENCER_CF_ACCESS_CLIENT_ID?.trim()
  const clientSecret = process.env.SEQUENCER_CF_ACCESS_CLIENT_SECRET?.trim()

  if (!baseUrl || !clientId || !clientSecret) return null
  return { baseUrl, clientId, clientSecret }
}

async function callSequencer(path: string, body: Record<string, unknown>) {
  const config = getSequencerConfig()
  if (!config) return false

  const res = await fetch(`${config.baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CF-Access-Client-Id': config.clientId,
      'CF-Access-Client-Secret': config.clientSecret,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const responseBody = await res.text().catch(() => '')
    throw new Error(
      `Sequencer request failed: ${res.status} ${res.statusText} ${responseBody}`.trim(),
    )
  }

  return true
}

export async function upsertSequencerContact(input: {
  email: string
  firstName?: string
  metadata?: Record<string, unknown>
}) {
  return callSequencer('/api/v1/contacts', {
    product: PRODUCT_ID,
    email: input.email,
    first_name: input.firstName,
    properties: input.metadata ?? {},
  })
}

export async function enrollSequencerSequence(input: {
  email: string
  sequenceSlug: SequenceSlug
  externalId: string
  metadata?: Record<string, unknown>
}) {
  await upsertSequencerContact({
    email: input.email,
    metadata: input.metadata,
  })

  return callSequencer('/api/v1/enrollments', {
    product: PRODUCT_ID,
    email: input.email,
    sequence_slug: input.sequenceSlug,
    source: input.externalId,
    properties: input.metadata ?? {},
  })
}

export async function unsubscribeSequencerContact(
  email: string,
  metadata: Record<string, unknown> = {},
) {
  return callSequencer('/api/v1/unsubscribe', {
    product: PRODUCT_ID,
    email,
    scope: 'product',
    reason: typeof metadata.source === 'string' ? metadata.source : undefined,
  })
}
