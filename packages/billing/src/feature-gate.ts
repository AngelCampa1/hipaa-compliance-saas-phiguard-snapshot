import { PLANS, toStoredPlanId, type StoredPlanId, type FeatureKey } from './plans.js'
import type { CommercialPlanStatus } from './entitlements.js'

export class FeatureGateError extends Error {
  constructor(public readonly feature: FeatureKey, public readonly plan: StoredPlanId) {
    super(`Feature "${feature}" not available on plan "${plan}"`)
    this.name = 'FeatureGateError'
  }
}

// Matches the message produced by the FeatureGateError constructor. Server
// functions deserialize thrown errors into plain Error instances on the client,
// so `instanceof FeatureGateError` is unreliable across that boundary — detect
// the gate off the stable message shape instead.
const FEATURE_GATE_MESSAGE = /^Feature ".+" not available on plan ".+"$/

export function isFeatureGateError(err: unknown): boolean {
  if (err instanceof FeatureGateError) return true
  return err instanceof Error && FEATURE_GATE_MESSAGE.test(err.message)
}

function resolvePlan(plan: string | null | undefined): StoredPlanId {
  return plan ? toStoredPlanId(plan) : 'essentials'
}

export function hasFeature(plan: string | null | undefined, feature: FeatureKey): boolean {
  return PLANS[resolvePlan(plan)].features.includes(feature)
}

export function requireFeature(plan: string | null | undefined, feature: FeatureKey): void {
  const resolved = resolvePlan(plan)
  if (!PLANS[resolved].features.includes(feature)) {
    throw new FeatureGateError(feature, resolved)
  }
}

export interface OrgFeatureContext {
  plan: string | null | undefined
  planStatus: CommercialPlanStatus | null | undefined
  trialEndsAt?: Date | string | null | undefined
}

export function isTrialAllAccess(org: OrgFeatureContext, now: Date = new Date()): boolean {
  if (org.planStatus !== 'trialing') return false
  // null/undefined trialEndsAt means no expiry has been set yet - treat as unexpired.
  if (!org.trialEndsAt) return true
  const ends = org.trialEndsAt instanceof Date ? org.trialEndsAt : new Date(org.trialEndsAt)
  // Guard against malformed date strings - treat Invalid Date as expired.
  if (isNaN(ends.getTime())) return false
  return ends.getTime() > now.getTime()
}

export function hasFeatureForOrg(
  org: OrgFeatureContext,
  feature: FeatureKey,
  options: { now?: Date } = {},
): boolean {
  const now = options.now ?? new Date()
  if (isTrialAllAccess(org, now)) return true
  return hasFeature(org.plan, feature)
}

export function requireFeatureForOrg(
  org: OrgFeatureContext,
  feature: FeatureKey,
  options: { now?: Date } = {},
): void {
  const now = options.now ?? new Date()
  if (isTrialAllAccess(org, now)) return
  requireFeature(org.plan, feature)
}
