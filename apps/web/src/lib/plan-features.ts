import { marketingPlans } from '@phiguard/knowledge/marketing'

export const PLAN_FEATURES: Record<string, string[]> = Object.fromEntries(
  marketingPlans.map((plan) => [
    plan.id,
    [
      `Up to ${plan.maxMembers} staff members`,
      ...plan.capabilities,
      ...plan.advanced,
    ],
  ]),
)
