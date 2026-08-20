import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { is, Table } from 'drizzle-orm'
import * as schema from '../schema/index.js'

const {
  users,
  organizations,
  locations,
  locationGrants,
  partnerPayouts,
  referralRevenueEvents,
  partnerMagicLinkTokens,
  memberships,
  integrationConnections,
  integrationSyncRecords,
  rateLimitBuckets,
  roleEnum,
  planEnum,
  planStatusEnum,
} = schema

describe('users table', () => {
  it('is a valid Drizzle table', () => {
    expect(is(users, Table)).toBe(true)
  })

  it('has all expected columns', () => {
    const columns = Object.keys(users)
    expect(columns).toContain('id')
    expect(columns).toContain('email')
    expect(columns).toContain('emailVerifiedAt')
    expect(columns).toContain('name')
    expect(columns).toContain('createdAt')
    expect(columns).toContain('updatedAt')
  })
})

describe('organizations table', () => {
  it('is a valid Drizzle table', () => {
    expect(is(organizations, Table)).toBe(true)
  })

  it('has all expected columns', () => {
    const columns = Object.keys(organizations)
    expect(columns).toContain('id')
    expect(columns).toContain('name')
    expect(columns).toContain('slug')
    expect(columns).toContain('logo')
    expect(columns).toContain('plan')
    expect(columns).toContain('planStatus')
    expect(columns).toContain('planSelectedAt')
    expect(columns).toContain('interestedPlan')
    expect(columns).toContain('billingPriceMonthlyCents')
    expect(columns).toContain('trialStartedAt')
    expect(columns).toContain('trialEndsAt')
    expect(columns).toContain('baaSignedAt')
    expect(columns).toContain('termsAcceptedAt')
    expect(columns).not.toContain('baaEnvelopeId')
    expect(columns).toContain('maxMembers')
    expect(columns).toContain('createdAt')
    expect(columns).toContain('updatedAt')
  })
})

describe('featureUsage table', () => {
  it('is exported from the schema index', () => {
    expect(schema).toHaveProperty('featureUsage')
  })

  it('is a valid Drizzle table', () => {
    expect(is(schema.featureUsage, Table)).toBe(true)
  })

  it('has organization id, feature key, and usage tracking columns', () => {
    const columns = Object.keys(schema.featureUsage)
    expect(columns).toContain('organizationId')
    expect(columns).toContain('featureKey')
    expect(columns).toContain('firstUsedAt')
    expect(columns).toContain('lastUsedAt')
    expect(columns).toContain('useCount')
  })
})

describe('organizationInvitations table', () => {
  it('is exported from the schema index', () => {
    expect(schema).toHaveProperty('organizationInvitations')
  })

  it('is a valid Drizzle table', () => {
    expect(is(schema.organizationInvitations, Table)).toBe(true)
  })

  it('has all expected columns', () => {
    const columns = Object.keys(schema.organizationInvitations)
    expect(columns).toContain('id')
    expect(columns).toContain('organizationId')
    expect(columns).toContain('email')
    expect(columns).toContain('role')
    expect(columns).toContain('status')
    expect(columns).toContain('teamId')
    expect(columns).toContain('expiresAt')
    expect(columns).toContain('inviterId')
    expect(columns).toContain('createdAt')
    expect(columns).toContain('updatedAt')
  })

  it('uses a uuid id with a generated default', () => {
    const invitationId = schema.organizationInvitations.id as {
      hasDefault?: boolean
    }

    expect(invitationId.hasDefault).toBe(true)
  })
})

describe('auth tables', () => {
  it('exports accounts, sessions, and verifications tables', () => {
    expect(schema).toHaveProperty('accounts')
    expect(schema).toHaveProperty('sessions')
    expect(schema).toHaveProperty('verifications')
  })

  it('accounts table includes provider and user linkage columns', () => {
    const columns = Object.keys(schema.accounts)
    expect(columns).toContain('accountId')
    expect(columns).toContain('providerId')
    expect(columns).toContain('userId')
    expect(columns).toContain('password')
  })

  it('sessions table includes token, expiry, and active organization columns', () => {
    const columns = Object.keys(schema.sessions)
    expect(columns).toContain('token')
    expect(columns).toContain('expiresAt')
    expect(columns).toContain('userId')
    expect(columns).toContain('activeOrganizationId')
  })

  it('verifications table includes identifier, value, and expiry columns', () => {
    const columns = Object.keys(schema.verifications)
    expect(columns).toContain('identifier')
    expect(columns).toContain('value')
    expect(columns).toContain('expiresAt')
  })
})

describe('memberships table', () => {
  it('is a valid Drizzle table', () => {
    expect(is(memberships, Table)).toBe(true)
  })

  it('has all expected columns', () => {
    const columns = Object.keys(memberships)
    expect(columns).toContain('id')
    expect(columns).toContain('userId')
    expect(columns).toContain('tenantId')
    expect(columns).toContain('role')
    expect(columns).toContain('invitedBy')
    expect(columns).toContain('acceptedAt')
    expect(columns).toContain('createdAt')
    expect(columns).toContain('updatedAt')
  })
})

describe('locations table', () => {
  it('is a valid Drizzle table', () => {
    expect(is(locations, Table)).toBe(true)
  })

  it('has all expected columns', () => {
    const columns = Object.keys(locations)
    expect(columns).toContain('id')
    expect(columns).toContain('organizationId')
    expect(columns).toContain('name')
    expect(columns).toContain('slug')
    expect(columns).toContain('status')
    expect(columns).toContain('isPrimary')
    expect(columns).toContain('createdAt')
    expect(columns).toContain('updatedAt')
  })
})

describe('locationGrants table', () => {
  it('is a valid Drizzle table', () => {
    expect(is(locationGrants, Table)).toBe(true)
  })

  it('has all expected columns', () => {
    const columns = Object.keys(locationGrants)
    expect(columns).toContain('id')
    expect(columns).toContain('tenantId')
    expect(columns).toContain('membershipId')
    expect(columns).toContain('locationId')
    expect(columns).toContain('createdAt')
  })
})

describe('partnerMagicLinkTokens table', () => {
  it('tracks one-time partner magic-link token state without storing raw tokens', () => {
    expect(is(partnerMagicLinkTokens, Table)).toBe(true)
    const columns = Object.keys(partnerMagicLinkTokens)

    expect(columns).toContain('partnerUserId')
    expect(columns).toContain('tokenHash')
    expect(columns).toContain('expiresAt')
    expect(columns).toContain('usedAt')
    expect(columns).not.toContain('token')
  })
})

describe('partnerPayouts table', () => {
  it('tracks external payment references for paid payouts', () => {
    expect(is(partnerPayouts, Table)).toBe(true)
    const columns = Object.keys(partnerPayouts)

    expect(columns).toContain('externalReference')
    expect(columns).toContain('paidAt')
  })

  it('migrates a database check for paid payout reference evidence', () => {
    const migration = readFileSync(
      fileURLToPath(new URL('../../drizzle/0043_partner_payout_reference.sql', import.meta.url)),
      'utf-8',
    )

    expect(migration).toContain('partner_payouts_paid_reference_check')
    expect(migration).toContain('"status" != \'paid\'')
    expect(migration).toContain('length(btrim("external_reference")) > 0')
    expect(migration).toContain('"paid_at" IS NOT NULL')
    expect(migration).toContain('NOT VALID')
  })
})

describe('referralRevenueEvents table', () => {
  it('tracks invoice-level referral revenue for payout allocation', () => {
    expect(is(referralRevenueEvents, Table)).toBe(true)
    const columns = Object.keys(referralRevenueEvents)

    expect(columns).toContain('referralId')
    expect(columns).toContain('partnerId')
    expect(columns).toContain('organizationId')
    expect(columns).toContain('stripeInvoiceId')
    expect(columns).toContain('amountCents')
    expect(columns).toContain('paidAt')
    expect(columns).toContain('payoutId')
    expect(columns).toContain('payoutAllocatedAt')
  })

  it('migrates invoice-level referral revenue with idempotency and payout indexes', () => {
    const migration = readFileSync(
      fileURLToPath(new URL('../../drizzle/0049_referral_revenue_events.sql', import.meta.url)),
      'utf-8',
    )

    expect(migration).toContain('CREATE TABLE IF NOT EXISTS "referral_revenue_events"')
    expect(migration).toContain('"stripe_invoice_id" text NOT NULL')
    expect(migration).toContain('referral_revenue_events_stripe_invoice_id_unique')
    expect(migration).toContain('referral_revenue_events_partner_paid_at_idx')
    expect(migration).toContain('referral_revenue_events_payout_id_idx')
  })
})

describe('evidenceFileScans table', () => {
  it('is exported from the schema index', () => {
    expect(schema).toHaveProperty('evidenceFileScans')
  })

  it('is a valid Drizzle table with scan state columns', () => {
    expect(is(schema.evidenceFileScans, Table)).toBe(true)

    const columns = Object.keys(schema.evidenceFileScans)
    expect(columns).toContain('tenantId')
    expect(columns).toContain('s3Key')
    expect(columns).toContain('avStatus')
    expect(columns).toContain('uploadedBy')
    expect(columns).toContain('scannedAt')
  })

  it('migrates tenant/user foreign keys for PHI-adjacent evidence keys', () => {
    const migration = readFileSync(
      fileURLToPath(new URL('../../drizzle/0045_evidence_file_scans.sql', import.meta.url)),
      'utf8',
    )

    expect(migration).toContain(
      '"tenant_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE CASCADE',
    )
    expect(migration).toContain('"uploaded_by" uuid REFERENCES "users"("id")')
  })

  it('registers the evidence scan migration in the Drizzle journal', () => {
    const journal = readFileSync(
      fileURLToPath(new URL('../../drizzle/meta/_journal.json', import.meta.url)),
      'utf8',
    )

    expect(journal).toContain('"tag": "0045_evidence_file_scans"')
  })
})

describe('drizzle migration journal', () => {
  it('keeps journal indexes and timestamps monotonically ordered', () => {
    const journal = JSON.parse(
      readFileSync(
        fileURLToPath(new URL('../../drizzle/meta/_journal.json', import.meta.url)),
        'utf8',
      ),
    ) as { entries: Array<{ idx: number; tag: string; when: number }> }

    journal.entries.forEach((entry, index) => {
      expect(entry.idx, `${entry.tag} idx`).toBe(index)
      if (index > 0) {
        const previous = journal.entries[index - 1]!
        expect(
          entry.when,
          `${entry.tag} timestamp should be after ${previous.tag}`,
        ).toBeGreaterThan(previous.when)
      }
    })
  })

  it('keeps the Drizzle generation config aligned with schema index exports', () => {
    const configSource = readFileSync(
      fileURLToPath(new URL('../../drizzle.config.ts', import.meta.url)),
      'utf8',
    )
    const indexSource = readFileSync(
      fileURLToPath(new URL('../schema/index.ts', import.meta.url)),
      'utf8',
    )
    const exportedSchemaFiles = [...indexSource.matchAll(/export \* from '\.\/(.+)\.js'/g)]
      .map((match) => match[1])
      .filter((file) => file !== '_conventions')
      .sort()
    const configuredSchemaFiles = [...configSource.matchAll(/'\.\/src\/schema\/(.+)\.ts'/g)]
      .map((match) => match[1])
      .sort()

    expect(configuredSchemaFiles).toEqual(exportedSchemaFiles)
  })

  it('registers every SQL migration file intended for deployment', () => {
    const drizzleDir = fileURLToPath(new URL('../../drizzle/', import.meta.url))
    const migrationTags = readdirSync(drizzleDir)
      .filter((file) => file.endsWith('.sql'))
      .map((file) => file.replace(/\.sql$/, ''))
      .sort()
    const journal = JSON.parse(
      readFileSync(
        fileURLToPath(new URL('../../drizzle/meta/_journal.json', import.meta.url)),
        'utf8',
      ),
    ) as { entries: Array<{ tag: string }> }
    const journalTags = journal.entries.map((entry) => entry.tag).sort()

    expect(journalTags).toEqual(migrationTags)
  })
})

describe('legacy BAA envelope cleanup migration', () => {
  it('fails closed before dropping retained envelope evidence rows', () => {
    const migration = readFileSync(
      fileURLToPath(new URL('../../drizzle/0046_drop_baa_envelopes.sql', import.meta.url)),
      'utf8',
    )

    expect(migration).toContain('Refusing to drop baa_envelopes while rows exist')
    expect(migration).toContain(
      "EXECUTE 'SELECT EXISTS (SELECT 1 FROM public.baa_envelopes LIMIT 1)'",
    )
    expect(migration).toContain(
      'Refusing to drop organizations.baa_envelope_id while references exist',
    )
    expect(migration).toContain(
      'SELECT EXISTS (SELECT 1 FROM public.organizations WHERE baa_envelope_id IS NOT NULL LIMIT 1)',
    )
    expect(migration).toContain('DROP TABLE IF EXISTS "baa_envelopes"')
    expect(migration).toContain('DROP COLUMN IF EXISTS "baa_envelope_id"')
  })
})

describe('rateLimitBuckets table', () => {
  it('is a valid Drizzle table', () => {
    expect(is(rateLimitBuckets, Table)).toBe(true)
  })

  it('has all expected columns', () => {
    const columns = Object.keys(rateLimitBuckets)
    expect(columns).toContain('bucketKey')
    expect(columns).toContain('tokens')
    expect(columns).toContain('lastRefill')
    expect(columns).toContain('updatedAt')
  })
})

describe('integrationConnections table', () => {
  it('is exported from the schema index', () => {
    expect(schema).toHaveProperty('integrationConnections')
  })

  it('is a valid Drizzle table', () => {
    expect(is(integrationConnections, Table)).toBe(true)
  })

  it('has the provider, account, and status columns needed by the callback upsert', () => {
    const columns = Object.keys(integrationConnections)
    expect(columns).toContain('organizationId')
    expect(columns).toContain('provider')
    expect(columns).toContain('accountEmail')
    expect(columns).toContain('status')
    expect(columns).toContain('installStartedAt')
    expect(columns).toContain('installedByUserId')
  })
})

describe('integrationSyncRecords table', () => {
  it('is exported from the schema index', () => {
    expect(schema).toHaveProperty('integrationSyncRecords')
  })

  it('is a valid Drizzle table', () => {
    expect(is(integrationSyncRecords, Table)).toBe(true)
  })

  it('tracks provider event identity for synced resources', () => {
    const columns = Object.keys(integrationSyncRecords)
    expect(columns).toContain('organizationId')
    expect(columns).toContain('connectionId')
    expect(columns).toContain('resourceType')
    expect(columns).toContain('resourceId')
    expect(columns).toContain('providerEventId')
    expect(columns).toContain('providerUrl')
    expect(columns).toContain('status')
  })
})

describe('processedWebhookEvents table', () => {
  it('is exported from the schema index', () => {
    expect(schema).toHaveProperty('processedWebhookEvents')
  })

  it('is a valid Drizzle table', () => {
    expect(is(schema.processedWebhookEvents, Table)).toBe(true)
  })

  it('has provider, eventId, and createdAt columns', () => {
    const columns = Object.keys(schema.processedWebhookEvents)
    expect(columns).toContain('provider')
    expect(columns).toContain('eventId')
    expect(columns).toContain('createdAt')
  })
})

describe('taskAttachments table', () => {
  it('defaults unscanned attachments to pending malware scan status', () => {
    const schemaSource = readFileSync(
      fileURLToPath(new URL('../schema/task-attachments.phi.ts', import.meta.url)),
      'utf-8',
    )
    const migration = readFileSync(
      fileURLToPath(new URL('../../drizzle/0044_task_attachment_av_default.sql', import.meta.url)),
      'utf-8',
    )

    expect(schemaSource).toContain(".default('pending')")
    expect(migration).toContain('ALTER TABLE "task_attachments"')
    expect(migration).toContain('"av_status" SET DEFAULT \'pending\'')
  })
})

describe('legalAcceptances table', () => {
  it('is exported from the schema index', () => {
    expect(schema).toHaveProperty('legalAcceptances')
  })

  it('is a valid Drizzle table', () => {
    expect(is(schema.legalAcceptances, Table)).toBe(true)
  })

  it('has legal acceptance evidence columns', () => {
    const columns = Object.keys(schema.legalAcceptances)
    expect(columns).toContain('tenantId')
    expect(columns).toContain('documentType')
    expect(columns).toContain('documentVersion')
    expect(columns).toContain('contentHash')
    expect(columns).toContain('customerEntityName')
    expect(columns).toContain('signerName')
    expect(columns).toContain('signerTitle')
    expect(columns).toContain('signerEmail')
    expect(columns).toContain('acceptedAt')
    expect(columns).toContain('snapshot')
    expect(columns).toContain('executedPdfBase64')
    expect(columns).toContain('executedPdfSha256')
    expect(columns).toContain('executedPdfSizeBytes')
    expect(columns).toContain('executedPdfMimeType')
  })
})

describe('enums', () => {
  it('roleEnum has correct values', () => {
    expect(roleEnum.enumValues).toEqual([
      'org_owner',
      'org_admin',
      'location_manager',
      'location_staff',
      'auditor',
    ])
  })

  it('planEnum has correct values', () => {
    expect(planEnum.enumValues).toEqual(['essentials', 'clinic', 'group', 'compliance_ops'])
  })

  it('planStatusEnum has correct values', () => {
    expect(planStatusEnum.enumValues).toEqual([
      'selection_required',
      'trial_pending',
      'trialing',
      'active',
      'paused',
      'past_due',
      'canceled',
    ])
  })
})
