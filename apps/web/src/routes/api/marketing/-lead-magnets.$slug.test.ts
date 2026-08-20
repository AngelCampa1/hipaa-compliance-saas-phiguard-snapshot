import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getLeadMagnetObjectMock, getLeadMagnetHeadMock, captureServerExceptionMock } = vi.hoisted(() => ({
  getLeadMagnetObjectMock: vi.fn(),
  getLeadMagnetHeadMock: vi.fn(),
  captureServerExceptionMock: vi.fn(),
}))

vi.mock('../../../lib/s3.js', () => ({
  buildLeadMagnetKey: vi.fn((slug: string) =>
    slug === 'baa-template' ? 'lead-magnets/baa-template-pack.pdf' : `lead-magnets/${slug}.pdf`,
  ),
  getLeadMagnetHead: getLeadMagnetHeadMock,
  getLeadMagnetObject: getLeadMagnetObjectMock,
}))

vi.mock('../../../lib/sentry.js', () => ({
  captureServerException: captureServerExceptionMock,
}))

type LeadMagnetHandlers = {
  GET: (ctx: { params: { slug: string } }) => Promise<Response>
  HEAD: (ctx: { params: { slug: string } }) => Promise<Response>
}

async function getHandlers() {
  const { Route } = await import('./lead-magnets.$slug.js')
  return Route.options.server?.handlers as unknown as LeadMagnetHandlers
}

describe('lead magnet download route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 200 with download headers for GET', async () => {
    getLeadMagnetObjectMock.mockResolvedValue({
      body: new ReadableStream(),
      httpMetadata: { contentType: 'application/pdf' },
      writeHttpMetadata(headers: Headers) {
        headers.set('X-Test', 'ok')
      },
    })

    const handlers = await getHandlers()
    const response = await handlers.GET({ params: { slug: 'baa-template' } })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="baa-template.pdf"')
    expect(response.headers.get('Cache-Control')).toBe('private, no-store, max-age=0')
    expect(response.headers.get('X-Test')).toBe('ok')
    expect(getLeadMagnetObjectMock).toHaveBeenCalledWith('lead-magnets/baa-template-pack.pdf')
  })

  it('returns 200 with headers and no body for HEAD', async () => {
    getLeadMagnetHeadMock.mockResolvedValue({
      httpMetadata: { contentType: 'application/pdf' },
    })

    const handlers = await getHandlers()
    const response = await handlers.HEAD({ params: { slug: 'baa-template' } })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(await response.text()).toBe('')
    expect(getLeadMagnetHeadMock).toHaveBeenCalledWith('lead-magnets/baa-template-pack.pdf')
    expect(getLeadMagnetObjectMock).not.toHaveBeenCalled()
  })

  it('returns 404 when the object is missing', async () => {
    getLeadMagnetObjectMock.mockResolvedValue(null)

    const handlers = await getHandlers()
    const response = await handlers.GET({ params: { slug: 'baa-template' } })

    expect(response.status).toBe(404)
  })

  it('returns 404 for invalid slugs', async () => {
    const handlers = await getHandlers()
    const response = await handlers.GET({ params: { slug: '../bad' } })

    expect(response.status).toBe(404)
    expect(getLeadMagnetObjectMock).not.toHaveBeenCalled()
    expect(captureServerExceptionMock).not.toHaveBeenCalled()
  })

  it('captures unexpected storage failures before returning 500', async () => {
    const error = new Error('Object storage unavailable')
    getLeadMagnetObjectMock.mockRejectedValue(error)

    const handlers = await getHandlers()
    const response = await handlers.GET({ params: { slug: 'baa-template' } })

    expect(response.status).toBe(500)
    expect(captureServerExceptionMock).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        surface: 'api',
        route: '/api/marketing/lead-magnets/$slug',
        operation: 'lead-magnet.download',
        status: 500,
      }),
    )
  })
})
