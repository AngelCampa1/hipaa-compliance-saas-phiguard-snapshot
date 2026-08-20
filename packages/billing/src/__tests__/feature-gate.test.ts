import { describe, it, expect } from 'vitest'
import {
  hasFeature,
  requireFeature,
  hasFeatureForOrg,
  requireFeatureForOrg,
  FeatureGateError,
  isFeatureGateError,
} from '../feature-gate.js'

describe('hasFeature', () => {
  it('returns true when plan includes feature', () => {
    expect(hasFeature('group', 'soc2_evidence')).toBe(true)
  })
  it('returns false when plan lacks feature', () => {
    expect(hasFeature('essentials', 'soc2_evidence')).toBe(false)
  })
  it('clinic has integrations_basic but not soc2_evidence', () => {
    expect(hasFeature('clinic', 'integrations_basic')).toBe(true)
    expect(hasFeature('clinic', 'soc2_evidence')).toBe(false)
  })
  it('compliance ops includes group-tier features', () => {
    expect(hasFeature('compliance_ops', 'soc2_evidence')).toBe(true)
    expect(hasFeature('compliance_ops', 'partner_portal')).toBe(true)
  })
  it('unknown/undefined plan defaults to essentials', () => {
    expect(hasFeature(undefined, 'tasks')).toBe(true)
    expect(hasFeature(undefined, 'soc2_evidence')).toBe(false)
    expect(hasFeature(null, 'tasks')).toBe(true)
  })
})

describe('requireFeature', () => {
  it('does not throw when plan has feature', () => {
    expect(() => requireFeature('group', 'soc2_evidence')).not.toThrow()
  })
  it('throws FeatureGateError when plan lacks feature', () => {
    expect(() => requireFeature('clinic', 'soc2_evidence')).toThrow(FeatureGateError)
  })
  it('error message includes feature key and plan', () => {
    expect(() => requireFeature('clinic', 'soc2_evidence'))
      .toThrowError(/soc2_evidence/)
  })
})

describe('requireFeature with null/undefined plan', () => {
  it('throws for feature not on essentials when plan is null', () => {
    expect(() => requireFeature(null, 'soc2_evidence')).toThrow(FeatureGateError)
  })
  it('does not throw for task feature when plan is undefined', () => {
    expect(() => requireFeature(undefined, 'tasks')).not.toThrow()
  })
  it('throws for empty string plan treated as essentials', () => {
    expect(() => requireFeature('', 'soc2_evidence')).toThrow(FeatureGateError)
  })
})

describe('FeatureGateError properties', () => {
  it('exposes feature and plan on the thrown error', () => {
    let caught: unknown
    try { requireFeature('clinic', 'soc2_evidence') } catch (e) { caught = e }
    expect(caught).toBeInstanceOf(FeatureGateError)
    const err = caught as FeatureGateError
    expect(err.feature).toBe('soc2_evidence')
    expect(err.plan).toBe('clinic')
  })
})

describe('isFeatureGateError', () => {
  it('detects a real FeatureGateError instance', () => {
    let caught: unknown
    try { requireFeature('clinic', 'soc2_evidence') } catch (e) { caught = e }
    expect(isFeatureGateError(caught)).toBe(true)
  })

  it('detects a plain Error deserialized across an RPC boundary', () => {
    // TanStack server functions reconstruct thrown errors as plain Error
    // instances, dropping the FeatureGateError prototype. Detection must still
    // succeed off the stable message shape so loaders render the upgrade gate.
    const deserialized = new Error(
      'Feature "compliance_addon" not available on plan "essentials"',
    )
    expect(deserialized).not.toBeInstanceOf(FeatureGateError)
    expect(isFeatureGateError(deserialized)).toBe(true)
  })

  it('returns false for unrelated errors and non-errors', () => {
    expect(isFeatureGateError(new Error('Unauthorized'))).toBe(false)
    expect(isFeatureGateError(new Error('Organization not found'))).toBe(false)
    expect(isFeatureGateError(null)).toBe(false)
    expect(isFeatureGateError(undefined)).toBe(false)
    expect(isFeatureGateError('Feature "x" not available on plan "y"')).toBe(false)
  })
})

describe('hasFeatureForOrg trial bypass', () => {
  const future = new Date('2099-01-01T00:00:00.000Z')
  const past = new Date('2020-01-01T00:00:00.000Z')

  it('grants any feature during an active trial regardless of plan', () => {
    expect(
      hasFeatureForOrg(
        { plan: 'essentials', planStatus: 'trialing', trialEndsAt: future },
        'soc2_evidence',
      ),
    ).toBe(true)
  })

  it('grants any feature during trial even when trialEndsAt is null', () => {
    expect(
      hasFeatureForOrg(
        { plan: 'essentials', planStatus: 'trialing', trialEndsAt: null },
        'partner_portal',
      ),
    ).toBe(true)
  })

  it('does not bypass for an expired trial', () => {
    expect(
      hasFeatureForOrg(
        { plan: 'essentials', planStatus: 'trialing', trialEndsAt: past },
        'soc2_evidence',
        { now: new Date('2026-01-01T00:00:00.000Z') },
      ),
    ).toBe(false)
  })

  it('falls through to plan check when not trialing', () => {
    expect(
      hasFeatureForOrg(
        { plan: 'group', planStatus: 'active', trialEndsAt: null },
        'soc2_evidence',
      ),
    ).toBe(true)
    expect(
      hasFeatureForOrg(
        { plan: 'clinic', planStatus: 'active', trialEndsAt: null },
        'soc2_evidence',
      ),
    ).toBe(false)
  })

  it('does not bypass for trial_pending status', () => {
    expect(
      hasFeatureForOrg(
        { plan: 'essentials', planStatus: 'trial_pending', trialEndsAt: future },
        'soc2_evidence',
      ),
    ).toBe(false)
  })
})

describe('requireFeatureForOrg', () => {
  const future = new Date('2099-01-01T00:00:00.000Z')

  it('does not throw during an active trial', () => {
    expect(() =>
      requireFeatureForOrg(
        { plan: 'essentials', planStatus: 'trialing', trialEndsAt: future },
        'soc2_evidence',
      ),
    ).not.toThrow()
  })

  it('throws after the trial ends without a qualifying plan', () => {
    expect(() =>
      requireFeatureForOrg(
        { plan: 'clinic', planStatus: 'active', trialEndsAt: null },
        'soc2_evidence',
      ),
    ).toThrow(FeatureGateError)
  })
})

