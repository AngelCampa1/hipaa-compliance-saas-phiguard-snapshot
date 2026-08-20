import { describe, expect, it } from 'vitest'
import { isTransientDbError } from './db-errors'

describe('isTransientDbError', () => {
  it('returns false for null/undefined', () => {
    expect(isTransientDbError(null)).toBe(false)
    expect(isTransientDbError(undefined)).toBe(false)
  })

  it('detects postgres.js CONNECTION_CLOSED by code', () => {
    const err = Object.assign(new Error('write CONNECTION_CLOSED host:5432'), {
      code: 'CONNECTION_CLOSED',
    })
    expect(isTransientDbError(err)).toBe(true)
  })

  it('detects transient errors by message when code is absent', () => {
    const err = new Error('Failed query: ...\nwrite CONNECTION_CLOSED abc.hyperdrive.local:5432')
    expect(isTransientDbError(err)).toBe(true)
  })

  it('unwraps the cause chain', () => {
    const cause = Object.assign(new Error('socket ended'), { code: 'ECONNRESET' })
    const err = new Error('Failed query') as Error & { cause?: unknown }
    err.cause = cause
    expect(isTransientDbError(err)).toBe(true)
  })

  it('returns false for unrelated errors', () => {
    expect(isTransientDbError(new Error('boom'))).toBe(false)
    expect(isTransientDbError(Object.assign(new Error('boom'), { code: '42P01' }))).toBe(false)
  })
})
