import { describe, it, expect } from 'vitest'
import {
  hasRole,
  isOwner,
  isAdmin,
  isStaff,
  canManageMembers,
  type Role,
} from '../permissions.js'

describe('hasRole', () => {
  it('org_owner meets org_owner', () => {
    expect(hasRole('org_owner', 'org_owner')).toBe(true)
  })

  it('org_admin meets org_admin', () => {
    expect(hasRole('org_admin', 'org_admin')).toBe(true)
  })

  it('location_staff meets location_staff', () => {
    expect(hasRole('location_staff', 'location_staff')).toBe(true)
  })

  it('org_owner meets org_admin', () => {
    expect(hasRole('org_owner', 'org_admin')).toBe(true)
  })

  it('org_owner meets location_staff', () => {
    expect(hasRole('org_owner', 'location_staff')).toBe(true)
  })

  it('org_admin meets location_manager', () => {
    expect(hasRole('org_admin', 'location_manager')).toBe(true)
  })

  it('location_staff does NOT meet location_manager', () => {
    expect(hasRole('location_staff', 'location_manager')).toBe(false)
  })

  it('location_staff does NOT meet org_owner', () => {
    expect(hasRole('location_staff', 'org_owner')).toBe(false)
  })

  it('location_manager does NOT meet org_admin', () => {
    expect(hasRole('location_manager', 'org_admin')).toBe(false)
  })

  it('same role on both sides returns true for all roles', () => {
    const roles: Role[] = ['org_owner', 'org_admin', 'location_manager', 'location_staff']
    for (const role of roles) {
      expect(hasRole(role, role)).toBe(true)
    }
  })
})

describe('isOwner', () => {
  it('returns true for org_owner', () => {
    expect(isOwner('org_owner')).toBe(true)
  })

  it('returns false for org_admin', () => {
    expect(isOwner('org_admin')).toBe(false)
  })

  it('returns false for location_staff', () => {
    expect(isOwner('location_staff')).toBe(false)
  })
})

describe('isAdmin', () => {
  it('returns true for org_owner', () => {
    expect(isAdmin('org_owner')).toBe(true)
  })

  it('returns true for org_admin', () => {
    expect(isAdmin('org_admin')).toBe(true)
  })

  it('returns false for location_manager', () => {
    expect(isAdmin('location_manager')).toBe(false)
  })
})

describe('isStaff', () => {
  it('returns true for org_owner', () => {
    expect(isStaff('org_owner')).toBe(true)
  })

  it('returns true for location_manager', () => {
    expect(isStaff('location_manager')).toBe(true)
  })

  it('returns true for location_staff', () => {
    expect(isStaff('location_staff')).toBe(true)
  })
})

describe('canManageMembers', () => {
  it('returns true for org_owner', () => {
    expect(canManageMembers('org_owner')).toBe(true)
  })

  it('returns true for location_manager', () => {
    expect(canManageMembers('location_manager')).toBe(true)
  })

  it('returns false for location_staff', () => {
    expect(canManageMembers('location_staff')).toBe(false)
  })
})

describe('auditor role - lateral read-only, outside hierarchy', () => {
  it('hasRole(location_staff, auditor) is false - staff is not an auditor', () => {
    expect(hasRole('location_staff', 'auditor')).toBe(false)
  })

  it('hasRole(org_owner, auditor) is false - owner is not an auditor', () => {
    expect(hasRole('org_owner', 'auditor')).toBe(false)
  })

  it('hasRole(org_admin, auditor) is false - admin is not an auditor', () => {
    expect(hasRole('org_admin', 'auditor')).toBe(false)
  })

  it('hasRole(auditor, auditor) is true - exact match', () => {
    expect(hasRole('auditor', 'auditor')).toBe(true)
  })

  it('hasRole(auditor, location_staff) is false - auditor cannot act as staff for write ops', () => {
    expect(hasRole('auditor', 'location_staff')).toBe(false)
  })

  it('hasRole(auditor, org_owner) is false - auditor cannot act as owner', () => {
    expect(hasRole('auditor', 'org_owner')).toBe(false)
  })

  it('existing hierarchy: hasRole(org_owner, org_admin) is true', () => {
    expect(hasRole('org_owner', 'org_admin')).toBe(true)
  })

  it('existing hierarchy: hasRole(location_staff, org_admin) is false', () => {
    expect(hasRole('location_staff', 'org_admin')).toBe(false)
  })
})
