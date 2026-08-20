import { drizzle } from 'drizzle-orm/d1'
import * as schema from './schema.js'

export type MarketingD1Database = {
  prepare(query: string): unknown
  batch?(statements: unknown[]): Promise<unknown[]>
  exec?(query: string): Promise<unknown>
}

const MARKETING_DB_BINDING_KEY = Symbol.for('phiguard.marketingDbBinding')

type MarketingDbGlobal = typeof globalThis & {
  [MARKETING_DB_BINDING_KEY]?: MarketingD1Database
}

function getBindingGlobal() {
  return globalThis as MarketingDbGlobal
}

export function setMarketingDbBinding(nextBinding?: MarketingD1Database) {
  getBindingGlobal()[MARKETING_DB_BINDING_KEY] = nextBinding
}

export function getMarketingDbBinding() {
  const binding = getBindingGlobal()[MARKETING_DB_BINDING_KEY]
  if (!binding) throw new Error('MARKETING_DB D1 binding is not configured')
  return binding
}

export function getMarketingDb() {
  return drizzle(getMarketingDbBinding() as never, { schema })
}

export type MarketingDB = ReturnType<typeof getMarketingDb>

export * from './schema.js'
