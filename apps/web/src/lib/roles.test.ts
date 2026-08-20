import { describe, expect, it } from 'vitest'

import { leastPrivilegedInviteRole, roleLabel } from './roles'

describe('roleLabel', () => {
  it('maps known roles to friendly labels', () => {
    expect(roleLabel('org_owner')).toBe('Owner')
    expect(roleLabel('location_staff')).toBe('Location staff')
  })

  it('falls back to the raw value for unknown roles', () => {
    expect(roleLabel('mystery_role')).toBe('mystery_role')
  })
})

describe('leastPrivilegedInviteRole', () => {
  it('defaults an owner (all roles inviteable) to location_staff, not org_admin', () => {
    // Server sends roles most → least privileged; the old code took [0] = org_admin.
    expect(
      leastPrivilegedInviteRole(['org_admin', 'auditor', 'location_manager', 'location_staff']),
    ).toBe('location_staff')
  })

  it('picks the least-privileged available role when location_staff is not inviteable', () => {
    expect(leastPrivilegedInviteRole(['org_admin', 'auditor', 'location_manager'])).toBe(
      'location_manager',
    )
    expect(leastPrivilegedInviteRole(['org_admin', 'auditor'])).toBe('auditor')
  })

  it('handles a single-role actor (location_manager can only invite location_staff)', () => {
    expect(leastPrivilegedInviteRole(['location_staff'])).toBe('location_staff')
  })

  it('falls back to location_staff for an empty or unrecognized set', () => {
    expect(leastPrivilegedInviteRole([])).toBe('location_staff')
    expect(leastPrivilegedInviteRole(['totally_unknown'])).toBe('totally_unknown')
  })
})
