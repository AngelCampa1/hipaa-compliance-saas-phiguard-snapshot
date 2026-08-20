import { describe, expect, it, vi } from 'vitest'

describe('plan display names', () => {
  it('derives public plan display names from the billing plan catalog', async () => {
    vi.resetModules()
    vi.doMock('@phiguard/billing/plans', () => ({
      PLANS: {
        essentials: { name: 'Source Essentials' },
        clinic: { name: 'Source Clinic' },
        group: { name: 'Source Group' },
        compliance_ops: { name: 'Source Ops' },
      },
    }))

    const { PLAN_DISPLAY_NAMES, formatPlanLabel } = await import('./plan-display.js')

    expect(PLAN_DISPLAY_NAMES).toEqual({
      essentials: 'Source Essentials',
      clinic: 'Source Clinic',
      group: 'Source Group',
      compliance_ops: 'Source Ops',
    })
    expect(formatPlanLabel('clinic', 'active')).toBe('Source Clinic / Active')

    vi.doUnmock('@phiguard/billing/plans')
  })
})
