import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  enrollSequencerSequence,
  unsubscribeSequencerContact,
  upsertSequencerContact,
} from './sequencer.js'

const ORIGINAL_ENV = { ...process.env }

function readLastFetchBody(fetchMock: ReturnType<typeof vi.fn>) {
  const lastCall = fetchMock.mock.calls.at(-1)
  if (!lastCall) throw new Error('fetch was not called')
  const init = lastCall[1] as RequestInit
  return JSON.parse(init.body as string) as Record<string, unknown>
}

describe('sequencer client', () => {
  beforeEach(() => {
    process.env.SEQUENCER_BASE_URL = 'https://sequencer.test'
    process.env.SEQUENCER_CF_ACCESS_CLIENT_ID = 'client-id'
    process.env.SEQUENCER_CF_ACCESS_CLIENT_SECRET = 'client-secret'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
    )
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
    vi.unstubAllGlobals()
  })

  it('sends the product slug under the "product" field the Sequencer requires', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    await upsertSequencerContact({ email: 'admin@clinic.com' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://sequencer.test/api/v1/contacts')
    const body = readLastFetchBody(fetchMock)
    expect(body.product).toBe('phiguard')
    expect(body.email).toBe('admin@clinic.com')
    expect(body).not.toHaveProperty('productId')
  })

  it('enrolls using the "product" field on the enrollments call', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    await enrollSequencerSequence({
      email: 'admin@clinic.com',
      sequenceSlug: 'phiguard-lead-magnet-nurture',
      externalId: 'lead-1:baa-template',
    })

    // First call is the contact upsert, second is the enrollment.
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [contactUrl, contactInit] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(contactUrl).toBe('https://sequencer.test/api/v1/contacts')
    const contactBody = JSON.parse(contactInit.body as string) as Record<string, unknown>
    expect(contactBody.product).toBe('phiguard')
    expect(contactBody.email).toBe('admin@clinic.com')
    expect(contactBody).not.toHaveProperty('productId')

    const [enrollUrl, enrollInit] = fetchMock.mock.calls[1] as [string, RequestInit]
    expect(enrollUrl).toBe('https://sequencer.test/api/v1/enrollments')
    const enrollBody = JSON.parse(enrollInit.body as string) as Record<string, unknown>
    expect(enrollBody.product).toBe('phiguard')
    expect(enrollBody.email).toBe('admin@clinic.com')
    expect(enrollBody.sequence_slug).toBe('phiguard-lead-magnet-nurture')
    expect(enrollBody.source).toBe('lead-1:baa-template')
    expect(enrollBody).not.toHaveProperty('sequenceSlug')
    expect(enrollBody).not.toHaveProperty('externalId')
    expect(enrollBody).not.toHaveProperty('productId')
  })

  it('unsubscribes using the "product" field', async () => {
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>

    await unsubscribeSequencerContact('admin@clinic.com')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://sequencer.test/api/v1/unsubscribe')
    const body = readLastFetchBody(fetchMock)
    expect(body.product).toBe('phiguard')
    expect(body.email).toBe('admin@clinic.com')
    expect(body.scope).toBe('product')
    expect(body).not.toHaveProperty('productId')
  })
})
