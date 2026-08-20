import { and, eq } from 'drizzle-orm'
import { getMarketingDb, emailSubscriptions } from '@phiguard/marketing-db/server'
import { unsubscribeSequencerContact } from './sequencer.js'
import { captureServerException } from '../lib/sentry.js'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface UnsubscribeResult {
  success: boolean
  alreadyUnsubscribed: boolean
}

/**
 * Processes an unsubscribe request identified by a one-time token.
 *
 * - Validates the token format (UUID) before any DB access.
 * - Honours idempotency: returns success if already unsubscribed.
 * - Forwards the suppression to the central Sequencer when configured.
 */
export async function processUnsubscribe(token: string): Promise<UnsubscribeResult> {
  if (!token || !UUID_RE.test(token)) {
    return { success: false, alreadyUnsubscribed: false }
  }

  const db = getMarketingDb()

  const rows = await db
    .select()
    .from(emailSubscriptions)
    .where(eq(emailSubscriptions.unsubscribeToken, token))
    .limit(1)

  if (rows.length === 0) {
    return { success: false, alreadyUnsubscribed: false }
  }

  const subscription = rows[0]
  const alreadyUnsubscribed = !subscription.subscribed

  if (!alreadyUnsubscribed) {
    const updated = await db
      .update(emailSubscriptions)
      .set({ subscribed: false, unsubscribedAt: new Date().toISOString() })
      .where(
        and(
          eq(emailSubscriptions.unsubscribeToken, token),
          eq(emailSubscriptions.subscribed, true),
        ),
      )
      .returning({ id: emailSubscriptions.id })

    if (updated.length === 0) {
      return { success: true, alreadyUnsubscribed: true }
    }

    try {
      await unsubscribeSequencerContact(subscription.email, { source: 'phiguard-unsubscribe' })
    } catch (err) {
      captureServerException(err, {
        surface: 'api',
        route: '/api/marketing/unsubscribe',
        operation: 'marketing.unsubscribe.sequencer',
        tags: { sink: 'sequencer' },
      })
    }
  }

  return { success: true, alreadyUnsubscribed }
}
