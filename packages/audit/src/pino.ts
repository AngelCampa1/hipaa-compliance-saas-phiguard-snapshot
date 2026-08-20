/**
 * Canonical import path for the PHI-redacting structured logger.
 *
 * Server code that needs the pino logger should import from this file.
 * The pino instance in logger.ts already applies redact() to every log call -
 * there is no way to accidentally log PHI through this export.
 *
 * @example
 *   import { logger } from '@phiguard/audit/pino'
 *   logger.info({ taskId }, 'Task created')
 */
export { logger, redact } from './logger.js'
