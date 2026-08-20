import type { ObjectStorageObject } from '@phiguard/audit'

export function applyObjectStorageHttpMetadata(headers: Headers, object: Pick<ObjectStorageObject, 'httpMetadata' | 'writeHttpMetadata'>) {
  if (object.httpMetadata?.contentType && !headers.has('Content-Type')) {
    headers.set('Content-Type', object.httpMetadata.contentType)
  }

  if (object.httpMetadata?.contentEncoding && !headers.has('Content-Encoding')) {
    headers.set('Content-Encoding', object.httpMetadata.contentEncoding)
  }

  const writer = object.writeHttpMetadata
  if (typeof writer === 'function') {
    try {
      writer.call(object, headers)
    } catch (error) {
      if (!object.httpMetadata?.contentType && !object.httpMetadata?.contentEncoding) {
        throw error
      }
    }
  }
}
