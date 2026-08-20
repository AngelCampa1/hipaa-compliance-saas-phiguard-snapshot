import { PLANS, type StoredPlanId } from '@phiguard/billing/plans'

/**
 * Human-readable labels for plan IDs, matching marketing copy.
 */
export const PLAN_DISPLAY_NAMES: Record<StoredPlanId, string> = {
  essentials: PLANS.essentials.name,
  clinic: PLANS.clinic.name,
  group: PLANS.group.name,
  compliance_ops: PLANS.compliance_ops.name,
}

/**
 * Human-readable labels for plan status values.
 */
export const PLAN_STATUS_DISPLAY_NAMES = {
  selection_required: 'Select a Plan',
  trial_pending: 'Trial Pending',
  trialing: 'Trialing',
  active: 'Active',
  paused: 'Paused',
  past_due: 'Past Due',
  canceled: 'Canceled',
} as const

type PlanStatusDisplayName = keyof typeof PLAN_STATUS_DISPLAY_NAMES

/**
 * Format a plan + status pair as "Plan Name / Status Label".
 * Gracefully handles unknown plan or status values.
 */
export function formatPlanLabel(
  plan: string | null | undefined,
  planStatus: string | null | undefined,
): string {
  const planLabel =
    plan && plan in PLAN_DISPLAY_NAMES
      ? PLAN_DISPLAY_NAMES[plan as StoredPlanId]
      : (plan ?? 'Unknown plan')

  const statusLabel =
    planStatus && planStatus in PLAN_STATUS_DISPLAY_NAMES
      ? PLAN_STATUS_DISPLAY_NAMES[planStatus as PlanStatusDisplayName]
      : (planStatus ?? 'Unknown status')

  return `${planLabel} / ${statusLabel}`
}
