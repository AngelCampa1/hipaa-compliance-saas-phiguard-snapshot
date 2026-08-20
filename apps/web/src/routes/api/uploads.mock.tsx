import { createFileRoute } from '@tanstack/react-router'
import { isMockUploadsEnabled } from '../../lib/s3'

export async function handleMockUploadRequest(method: 'GET' | 'PUT') {
  if (!isMockUploadsEnabled()) {
    return new Response('Not Found', { status: 404 })
  }

  if (method === 'GET') {
    return new Response('Mock upload content', {
      status: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  return new Response(null, {
    status: 204,
  })
}

export const Route = createFileRoute('/api/uploads/mock')({
  server: {
    handlers: {
      GET: async () => handleMockUploadRequest('GET'),
      PUT: async () => handleMockUploadRequest('PUT'),
    },
  },
})
