import { createServerFn } from '@tanstack/react-start'

export type AiCsEndpoint = 'sessions' | 'chat' | 'escalations'

export const AI_CS_APP_ID = 'phiguard'
export const MAX_AI_CS_PATH_LENGTH = 512
export const MAX_AI_CS_SESSION_ID_LENGTH = 128
export const MAX_AI_CS_MESSAGE_LENGTH = 4000
export const MAX_AI_CS_ESCALATION_REASON_LENGTH = 2000
export const MAX_AI_CS_CONTACT_LENGTH = 512

function readAiCsConfig(env: NodeJS.ProcessEnv = process.env) {
  const secret = env.AI_CS_CLIENT_ASSERTION_SECRET?.trim()
  const workerOrigin = env.AI_CS_WORKER_ORIGIN?.trim().replace(/\/+$/, '')
  const freeTextEnabled = env.AI_CS_FREE_TEXT_ENABLED === 'true'
  if (!secret || !workerOrigin || !freeTextEnabled) return null
  return { secret, workerOrigin }
}

export function isAiCsConfigured(env: NodeJS.ProcessEnv = process.env) {
  return readAiCsConfig(env) !== null
}

export const getAiCsAvailabilityFn = createServerFn({ method: 'GET' }).handler(async () => ({
  aiCsConfigured: isAiCsConfigured(),
}))
