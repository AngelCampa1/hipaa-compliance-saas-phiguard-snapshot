import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createEvidenceBundleDownloadResponseMock, captureServerExceptionMock } = vi.hoisted(() => ({
  createEvidenceBundleDownloadResponseMock: vi.fn(),
  captureServerExceptionMock: vi.fn(),
}))

vi.mock('../../../server/soc2.js', () => ({
  createEvidenceBundleDownloadResponse: createEvidenceBundleDownloadResponseMock,
}))

vi.mock('../../../lib/sentry.js', () => ({
  captureServerException: captureServerExceptionMock,
}))

type BundleHandlers = {
  GET: (ctx: { request: Request }) => Promise<Response>
}

async function getHandlers() {
  const { Route } = await import('./bundles.js')
  return Route.options.server?.handlers as unknown as BundleHandlers
}

describe('SOC 2 bundle download API route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not capture expected authorization failures', async () => {
    createEvidenceBundleDownloadResponseMock.mockRejectedValueOnce(new Error('Unauthorized'))

    const handlers = await getHandlers()
    const response = await handlers.GET({
      request: new Request('https://app.phiguard.test/api/soc2/bundles'),
    })

    expect(response.status).toBe(401)
    expect(captureServerExceptionMock).not.toHaveBeenCalled()
  })

  it('captures unexpected failures before returning 500', async () => {
    const error = new Error('Object storage unavailable')
    createEvidenceBundleDownloadResponseMock.mockRejectedValueOnce(error)

    const handlers = await getHandlers()
    const response = await handlers.GET({
      request: new Request('https://app.phiguard.test/api/soc2/bundles'),
    })

    expect(response.status).toBe(500)
    expect(captureServerExceptionMock).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        surface: 'api',
        route: '/api/soc2/bundles',
        operation: 'soc2.bundle.download',
        status: 500,
      }),
    )
  })
})
