import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleMockUploadRequest } from './uploads.mock'

const { isMockUploadsEnabledMock } = vi.hoisted(() => ({
  isMockUploadsEnabledMock: vi.fn(),
}))

vi.mock('../../lib/s3', () => ({
  isMockUploadsEnabled: isMockUploadsEnabledMock,
}))

describe('mock uploads route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isMockUploadsEnabledMock.mockReturnValue(false)
  })

  it('hides mock upload endpoints unless the Playwright mock mode is enabled', async () => {
    const response = await handleMockUploadRequest('GET')

    expect(response.status).toBe(404)
    expect(await response.text()).toBe('Not Found')
  })

  it('serves mock attachment downloads in Playwright mock mode', async () => {
    isMockUploadsEnabledMock.mockReturnValue(true)

    const response = await handleMockUploadRequest('GET')

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('text/plain; charset=utf-8')
    expect(await response.text()).toBe('Mock upload content')
  })

  it('accepts mock uploads in Playwright mock mode', async () => {
    isMockUploadsEnabledMock.mockReturnValue(true)

    const response = await handleMockUploadRequest('PUT')

    expect(response.status).toBe(204)
  })
})
