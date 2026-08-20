import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  APPROVED_PRODUCT_ANALYTICS_EVENTS,
  PRODUCT_ANALYTICS_CAPTURE_PATH,
  captureServerProductAnalyticsEvent,
  createProductAnalytics,
  normalizeProductAnalyticsRoute,
  sanitizeProductAnalyticsProperties,
  sanitizePublicSignupAnalyticsProperties,
} from './product-analytics'

function createFetchResponse(status = 200) {
  return Promise.resolve(new Response('{}', { status }))
}

function createCaptureFetchMock() {
  return vi.fn((_url: string, _init: RequestInit) => createFetchResponse())
}

describe('product analytics', () => {
  beforeEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('strips PHI-like and unapproved properties before capture', async () => {
    const fetch = createCaptureFetchMock()
    const analytics = createProductAnalytics({
      apiKey: 'phc_test',
      distinctId: 'user_123',
      organization: {
        id: 'org_123',
        plan: 'clinic',
        planStatus: 'trialing',
        memberCount: 12,
        locationCount: 2,
      },
      fetch,
      now: () => new Date('2026-04-29T12:00:00.000Z'),
    })

    await analytics.capture('task_created', {
      task_title: 'Patient follow-up',
      body: 'Free-text note',
      filename: 'patient-record.pdf',
      email: 'admin@clinic.test',
      location_count_bucket: '2-5',
      priority: 'urgent',
      route: '/app/tasks/new',
      empty: '',
    })

    const payload = JSON.parse(fetch.mock.calls[0]![1]!.body as string)

    expect(fetch).toHaveBeenCalledWith(PRODUCT_ANALYTICS_CAPTURE_PATH, expect.anything())
    expect(payload.event).toBe('task_created')
    expect(payload.properties).toEqual(
      expect.objectContaining({
        organization_id: 'org_123',
        plan: 'clinic',
        plan_status: 'trialing',
        member_count_bucket: '11-30',
        location_count_bucket: '2-5',
        priority: 'urgent',
        route: '/app/tasks/new',
      }),
    )
    expect(payload.properties).not.toEqual(
      expect.objectContaining({
        task_title: expect.anything(),
        body: expect.anything(),
        filename: expect.anything(),
        email: expect.anything(),
      }),
    )
  })

  it('does not capture unknown events', async () => {
    const fetch = createCaptureFetchMock()
    const analytics = createProductAnalytics({
      apiKey: 'phc_test',
      distinctId: 'user_123',
      organization: { id: 'org_123', plan: 'essentials', planStatus: 'active' },
      fetch,
    })

    await expect(analytics.capture('free_text_note_added' as never, {})).rejects.toThrow(
      'Unsupported product analytics event',
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('does not capture without an api key or distinct id', async () => {
    const fetch = createCaptureFetchMock()
    const analytics = createProductAnalytics({
      apiKey: '',
      distinctId: '',
      organization: { id: 'org_123', plan: 'essentials', planStatus: 'active' },
      fetch,
    })

    await analytics.capture('dashboard_viewed', { route: '/app/dashboard' })

    expect(fetch).not.toHaveBeenCalled()
  })

  it('sends group identification without PHI', async () => {
    const fetch = createCaptureFetchMock()
    const analytics = createProductAnalytics({
      apiKey: 'phc_test',
      distinctId: 'user_123',
      organization: {
        id: 'org_123',
        plan: 'group',
        planStatus: 'active',
        memberCount: 34,
        locationCount: 8,
      },
      fetch,
      now: () => new Date('2026-04-29T12:00:00.000Z'),
    })

    await analytics.identifyOrganization()

    const payload = JSON.parse(fetch.mock.calls[0]![1]!.body as string)

    expect(payload.event).toBe('$groupidentify')
    expect(payload.properties).toEqual(
      expect.objectContaining({
        $group_type: 'organization',
        $group_key: 'org_123',
        $group_set: {
          plan: 'group',
          plan_status: 'active',
          member_count_bucket: '31-100',
          location_count_bucket: '6-10',
        },
      }),
    )
  })

  it('sends person profile properties without PHI', async () => {
    const fetch = createCaptureFetchMock()
    const analytics = createProductAnalytics({
      apiKey: 'phc_test',
      distinctId: 'user_123',
      organization: {
        id: 'org_123',
        plan: 'group',
        planStatus: 'active',
        memberCount: 34,
        locationCount: 8,
      },
      fetch,
      now: () => new Date('2026-04-29T12:00:00.000Z'),
    })

    await analytics.identifyUser()

    const payload = JSON.parse(fetch.mock.calls[0]![1]!.body as string)

    expect(payload.event).toBe('$set')
    expect(payload.distinct_id).toBe('user_123')
    expect(payload.properties).toEqual({
      $set: {
        organization_id: 'org_123',
        plan: 'group',
        plan_status: 'active',
        member_count_bucket: '31-100',
        location_count_bucket: '6-10',
      },
      $groups: { organization: 'org_123' },
    })
  })

  it('keeps the approved event list explicit', () => {
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).not.toContain('lead_created')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('signup_started')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('signup_completed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_referral_opened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_magic_link_requested')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_magic_link_request_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_magic_link_check_email_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_magic_link_verified')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_magic_link_verify_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_login_error_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_dashboard_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_dashboard_empty_state_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_dashboard_error_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_dashboard_retry_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('activation_completed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_page_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_navigation_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_help_opened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_organization_switched')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_action_blocked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).not.toContain('app_support_opened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).not.toContain('app_support_closed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_support_session_started')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_support_message_sent')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_support_response_received')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_support_escalated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_support_error_shown')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('feature_gate_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('feature_gate_upgrade_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_error_boundary_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('app_error_retry_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('subscription_started')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('subscription_cancelled')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('task_empty_state_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('task_bulk_status_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('task_bulk_assigned')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('task_status_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('task_due_date_updated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('task_updated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('task_archived')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('checklist_item_completed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('checklist_item_reopened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('checklist_evidence_uploaded')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('checklist_evidence_downloaded')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('checklist_archived')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('file_upload_completed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('file_upload_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('compliance_dashboard_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('compliance_dashboard_section_opened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('compliance_program_dashboard_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('compliance_program_section_opened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('incident_updated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('incident_status_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('incident_update_added')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('incident_exported')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('policy_created')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('policy_published')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('policy_draft_updated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('policy_version_created')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('policy_archived')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('policy_restored')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('policy_action_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('training_exported')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('training_course_created')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('training_course_status_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('training_assigned')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('training_certificate_downloaded')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('training_unassigned')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('training_completion_reopened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('training_due_date_updated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('training_reassigned')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('risk_item_created')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('risk_item_updated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('risk_item_deleted')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('risk_assessment_status_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('risk_assessment_reopened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('risk_assessment_renamed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('risk_assessment_deleted')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('member_invited')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('member_role_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('member_removed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('invitation_resent')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('invitation_cancelled')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('member_settings_retry_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('location_created')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('location_updated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('location_status_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('location_grants_updated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('location_settings_retry_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('integration_connect_started')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('integration_connect_completed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('integration_connect_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('integration_callback_completed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('integration_callback_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('integration_settings_load_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('integration_settings_retry_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('integration_revoked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('report_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('report_exported')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('report_drilldown_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('audit_search_performed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('audit_events_load_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('audit_events_retry_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('audit_export_started')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('audit_export_completed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('audit_export_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('access_review_opened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('access_review_decision_recorded')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('access_review_closed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('soc2_evidence_bundle_exported')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('soc2_audit_evidence_collected')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('soc2_evidence_downloaded')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('soc2_evidence_recorded')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('soc2_controls_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('soc2_controls_filter_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('soc2_controls_search_performed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('soc2_controls_sort_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('soc2_control_evidence_opened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('soc2_auditor_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('help_search_performed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('help_search_empty')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('help_category_selected')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('help_topic_opened')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('dashboard_scope_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('dashboard_metric_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('dashboard_action_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('profile_display_name_updated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('profile_email_change_requested')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('profile_password_updated')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('profile_action_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('account_deletion_requested')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain(
      'security_key_enrollment_unavailable_viewed',
    )
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('first_run_step_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('first_run_banner_dismissed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_filter_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_search_performed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_sort_changed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_exported')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_empty_state_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_payout_run_started')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_payout_run_completed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_payout_run_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_partner_approved')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_partner_approve_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_payout_marked_paid')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_payout_mark_paid_failed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_access_denied_viewed')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).toContain('partner_admin_load_retry_clicked')
    expect(APPROVED_PRODUCT_ANALYTICS_EVENTS).not.toContain('task_title_changed')
  })

  it('sanitizes direct property calls with the same allowlist', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/tasks/23c7f93d-0620-4b17-a178-a0ec146d9f91',
        source_app: 'web',
        page_path: '/app/tasks/new',
        landing_page: '/hipaa-checklist',
        utm_source: 'linkedin',
        utm_medium: 'social',
        utm_campaign: 'baa',
        referring_domain: 'example.com',
        country: 'US',
        lead_type: 'checklist',
        activation_type: 'baa',
        status: 'done',
        comment_body: 'contains PHI',
        note: 'contains PHI',
        due_at: '2026-05-01',
      }),
    ).toEqual({
      route: '/app/tasks/$taskId',
      source_app: 'web',
      page_path: '/app/tasks/new',
      landing_page: '/hipaa-checklist',
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'baa',
      referring_domain: 'example.com',
      country: 'US',
      lead_type: 'checklist',
      activation_type: 'baa',
      status: 'done',
    })
  })

  it('normalizes app routes before capture', () => {
    expect(normalizeProductAnalyticsRoute('/signup?plan=clinic')).toBe('/signup')
    expect(normalizeProductAnalyticsRoute('/app/tasks/23c7f93d-0620-4b17-a178-a0ec146d9f91')).toBe(
      '/app/tasks/$taskId',
    )
    expect(normalizeProductAnalyticsRoute('/app/compliance/program/vendors')).toBe(
      '/app/compliance/program/vendors',
    )
    expect(
      normalizeProductAnalyticsRoute('/app/compliance/incidents/incident-123?tab=activity'),
    ).toBe('/app/compliance/incidents/$incidentId')
    expect(normalizeProductAnalyticsRoute('/app/unknown/path')).toBe('/app/other')
  })

  it('normalizes all primary authenticated app routes for page analytics', () => {
    expect(normalizeProductAnalyticsRoute('/app/tasks')).toBe('/app/tasks')
    expect(normalizeProductAnalyticsRoute('/app/compliance')).toBe('/app/compliance')
    expect(normalizeProductAnalyticsRoute('/app/compliance/checklists')).toBe(
      '/app/compliance/checklists',
    )
    expect(normalizeProductAnalyticsRoute('/app/compliance/program')).toBe(
      '/app/compliance/program',
    )
    expect(normalizeProductAnalyticsRoute('/app/compliance/program/policies')).toBe(
      '/app/compliance/program/policies',
    )
    expect(normalizeProductAnalyticsRoute('/app/compliance/program/policies/policy-123')).toBe(
      '/app/compliance/program/policies/$policyId',
    )
    expect(normalizeProductAnalyticsRoute('/app/compliance/program/risk')).toBe(
      '/app/compliance/program/risk',
    )
    expect(normalizeProductAnalyticsRoute('/app/compliance/program/training')).toBe(
      '/app/compliance/program/training',
    )
    expect(normalizeProductAnalyticsRoute('/app/compliance/incidents')).toBe(
      '/app/compliance/incidents',
    )
    expect(normalizeProductAnalyticsRoute('/app/compliance/policies')).toBe(
      '/app/compliance/policies',
    )
    expect(normalizeProductAnalyticsRoute('/app/reports')).toBe('/app/reports')
    expect(normalizeProductAnalyticsRoute('/app/reports/compliance')).toBe(
      '/app/reports/compliance',
    )
    expect(normalizeProductAnalyticsRoute('/app/reports/tasks')).toBe('/app/reports/tasks')
    expect(normalizeProductAnalyticsRoute('/app/audit')).toBe('/app/audit')
    expect(normalizeProductAnalyticsRoute('/app/audit/export')).toBe('/app/audit/export')
    expect(normalizeProductAnalyticsRoute('/app/help')).toBe('/app/help')
    expect(normalizeProductAnalyticsRoute('/app/settings/members')).toBe('/app/settings/members')
    expect(normalizeProductAnalyticsRoute('/app/settings/locations')).toBe(
      '/app/settings/locations',
    )
    expect(normalizeProductAnalyticsRoute('/app/settings/integrations')).toBe(
      '/app/settings/integrations',
    )
    expect(normalizeProductAnalyticsRoute('/app/settings/profile')).toBe('/app/settings/profile')
    expect(normalizeProductAnalyticsRoute('/app/settings/security-keys')).toBe(
      '/app/settings/security-keys',
    )
    expect(normalizeProductAnalyticsRoute('/app/soc2')).toBe('/app/soc2')
    expect(normalizeProductAnalyticsRoute('/app/soc2/controls')).toBe('/app/soc2/controls')
    expect(normalizeProductAnalyticsRoute('/app/soc2/evidence')).toBe('/app/soc2/evidence')
    expect(normalizeProductAnalyticsRoute('/app/soc2/auditor')).toBe('/app/soc2/auditor')
    expect(normalizeProductAnalyticsRoute('/app/soc2/access-reviews')).toBe(
      '/app/soc2/access-reviews',
    )
    expect(normalizeProductAnalyticsRoute('/app/soc2/access-reviews/review-123')).toBe(
      '/app/soc2/access-reviews/$reviewId',
    )
    expect(normalizeProductAnalyticsRoute('/app/admin/partners')).toBe('/app/admin/partners')
  })

  it('keeps vendor analytics properties route-only and PHI-safe', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/compliance/program/vendors',
        status: 'active',
        vendorName: 'Acme Billing',
        contactEmail: 'billing@example.com',
        dataCategories: ['PHI'],
        documentFileKey: 'evidence/org-1/vendor-baas/vendor-1/baa.pdf',
      }),
    ).toEqual({
      route: '/app/compliance/program/vendors',
      status: 'active',
    })
  })

  it('keeps app interaction and support properties safe and route-normalized', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/dashboard',
        destination_route: '/app/tasks/23c7f93d-0620-4b17-a178-a0ec146d9f91',
        trigger: 'sidebar',
        support_channel: 'ai_cs',
        operation: 'chat',
        error_type: 'upstream_unavailable',
        reason: 'legal_onboarding_required',
        draft: 'patient name here',
      }),
    ).toEqual({
      route: '/app/dashboard',
      destination_route: '/app/tasks/$taskId',
      trigger: 'sidebar',
      support_channel: 'ai_cs',
      operation: 'chat',
      error_type: 'upstream_unavailable',
      reason: 'legal_onboarding_required',
    })
  })

  it('keeps admin, report, integration, and audit analytics properties PHI-safe', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/settings/members',
        provider: 'google',
        report_type: 'compliance_rollup',
        export_format: 'csv',
        filter_count: 3,
        row_count_bucket: '101-1000',
        has_active_filters: true,
        sort_key: 'overdue',
        sort_dir: 'desc',
        can_manage: false,
        role: 'org_admin',
        previous_role: 'location_staff',
        target_role: 'auditor',
        status: 'active',
        action: 'deactivate',
        reason: 'access_denied',
        memberEmail: 'staff@clinic.test',
        accountEmail: 'calendar@clinic.test',
        search: 'patient name',
        actorEmail: 'admin@clinic.test',
        invitationId: 'invite-123',
        memberId: 'member-123',
        locationName: 'Main Street Clinic',
      }),
    ).toEqual({
      route: '/app/settings/members',
      provider: 'google',
      report_type: 'compliance_rollup',
      export_format: 'csv',
      filter_count: 3,
      row_count_bucket: '101-1000',
      has_active_filters: true,
      sort_key: 'overdue',
      sort_dir: 'desc',
      can_manage: false,
      role: 'org_admin',
      previous_role: 'location_staff',
      target_role: 'auditor',
      status: 'active',
      action: 'deactivate',
      reason: 'access_denied',
    })
  })

  it('keeps direct upload analytics coarse and free of object keys', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt',
        category: 'task_attachment',
        status: 'failed',
        reason: 'invalid_capability',
        key: 'attachments/org-1/task-1/evidence.txt',
        fileName: 'evidence.txt',
        filename: 'evidence.txt',
        s3Key: 'attachments/org-1/task-1/evidence.txt',
        taskId: 'task-1',
        evidenceId: 'evidence-1',
      }),
    ).toEqual({
      route: '/api/uploads/direct',
      category: 'task_attachment',
      status: 'failed',
      reason: 'invalid_capability',
    })
  })

  it('captures server product analytics with trusted identity without awaiting delivery', async () => {
    vi.stubEnv('PRODUCT_ANALYTICS_ENABLED', 'true')
    vi.stubEnv('VITE_POSTHOG_KEY', 'phc_test')
    const fetch = vi.fn((_url: string, _init: RequestInit) => new Promise<Response>(() => undefined))
    vi.stubGlobal('fetch', fetch)

    captureServerProductAnalyticsEvent({
      userId: 'user-1',
      organizationId: 'org-1',
      eventName: 'file_upload_completed',
      properties: {
        route: '/api/uploads/direct?key=attachments/org-1/task-1/evidence.txt',
        category: 'task_attachment',
        status: 'completed',
        key: 'attachments/org-1/task-1/evidence.txt',
      },
    })

    expect(fetch).toHaveBeenCalledTimes(1)
    const [, init] = fetch.mock.calls[0]!
    const payload = JSON.parse(init.body as string)
    expect(payload).toEqual(
      expect.objectContaining({
        api_key: 'phc_test',
        event: 'file_upload_completed',
        distinct_id: 'user-1',
      }),
    )
    expect(payload.properties).toEqual({
      organization_id: 'org-1',
      member_count_bucket: '0',
      location_count_bucket: '0',
      $groups: { organization: 'org-1' },
      route: '/api/uploads/direct',
      category: 'task_attachment',
      status: 'completed',
    })
  })

  it('keeps integration callback analytics coarse and free of OAuth details', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/api/integrations/google/callback?code=auth-code&state=state-token',
        provider: 'google',
        status: 'failed',
        reason: 'token_exchange',
        code: 'auth-code',
        state: 'state-token',
        accountEmail: 'admin@example.com',
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        scopes: ['openid', 'email'],
        connectionId: 'connection-123',
      }),
    ).toEqual({
      route: '/api/integrations/$provider/callback',
      provider: 'google',
      status: 'failed',
      reason: 'token_exchange',
    })
  })

  it('keeps policy workflow analytics coarse and free of policy or location identifiers', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/compliance/program/policies/policy-123',
        destination_route: '/app/compliance/policies?locationId=location-123',
        status: 'completed',
        action: 'assign',
        count: 3,
        has_active_filters: true,
        error_type: 'validation',
        policyId: 'policy-123',
        policyTitle: 'Employee PHI policy',
        bodyMarkdown: 'Contains policy text',
        version: 'v1',
        locationId: 'location-123',
        locationIds: ['location-123'],
        locationName: 'Main Clinic',
        dueAt: '2026-06-09',
        effectiveDate: '2026-06-09',
      }),
    ).toEqual({
      route: '/app/compliance/program/policies/$policyId',
      destination_route: '/app/compliance/policies',
      status: 'completed',
      action: 'assign',
      count: 3,
      has_active_filters: true,
      error_type: 'validation',
    })
  })

  it('keeps task and incident lifecycle properties coarse and PHI-safe', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/compliance/incidents/incident-123',
        destination_route: '/app/tasks/23c7f93d-0620-4b17-a178-a0ec146d9f91',
        status: 'contained',
        priority: 'urgent',
        action: 'set',
        count: 4,
        export_format: 'csv',
        row_count_bucket: '2-5',
        visible_row_count_bucket: '6-20',
        open_row_count_bucket: '1',
        has_active_filters: true,
        can_write: true,
        filter_type: 'severity',
        filter_state: 'applied',
        query_length_bucket: 'medium',
        empty_state_type: 'no_matches',
        sort_key: 'reportedAt',
        sort_dir: 'desc',
        title: 'Patient disclosure',
        query: 'Patient disclosure',
        q: 'Patient disclosure',
        description: 'Contains PHI',
        summary: 'Affected patient system',
        body: 'Free text update',
        filename: 'incident-evidence.pdf',
        downloadUrl: 'https://example.com/evidence.pdf',
        taskId: '23c7f93d-0620-4b17-a178-a0ec146d9f91',
        incidentId: 'incident-123',
        userId: 'user-123',
        locationId: 'location-123',
        email: 'admin@clinic.test',
        patient: 'Jane Doe',
        evidence: 'Uploaded file',
      }),
    ).toEqual({
      route: '/app/compliance/incidents/$incidentId',
      destination_route: '/app/tasks/$taskId',
      status: 'contained',
      priority: 'urgent',
      action: 'set',
      count: 4,
      export_format: 'csv',
      row_count_bucket: '2-5',
      visible_row_count_bucket: '6-20',
      open_row_count_bucket: '1',
      has_active_filters: true,
      can_write: true,
      filter_type: 'severity',
      filter_state: 'applied',
      query_length_bucket: 'medium',
      empty_state_type: 'no_matches',
      sort_key: 'reportedAt',
      sort_dir: 'desc',
    })
  })

  it('keeps compliance program workflow properties coarse and PHI-safe', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/compliance/checklists/checklist-123',
        status: 'published',
        priority: 'high',
        action: 'deactivate',
        count: 1,
        export_format: 'csv',
        row_count_bucket: '1-100',
        has_active_filters: false,
        title: 'Workforce sanctions policy',
        bodyMarkdown: 'Policy body',
        version: 'contains text',
        description: 'Risk item description',
        mitigation: 'Free-text mitigation',
        courseTitle: 'Security training',
        userName: 'Staff Member',
        userEmail: 'staff@clinic.test',
        certificateFileKey: 'training/certificates/staff.pdf',
        evidenceFileName: 'evidence.pdf',
        downloadUrl: 'https://example.com/download',
        policyId: 'policy-123',
        assessmentId: 'assessment-123',
        itemId: 'item-123',
        recordId: 'record-123',
        userId: 'user-123',
        patient: 'Jane Doe',
      }),
    ).toEqual({
      route: '/app/compliance/checklists/$checklistId',
      status: 'published',
      priority: 'high',
      action: 'deactivate',
      count: 1,
      export_format: 'csv',
      row_count_bucket: '1-100',
      has_active_filters: false,
    })
  })

  it('drops free-text values on coarse string properties', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/compliance/program/training',
        status: 'closed',
        action: 'reactivate',
        provider: 'google workspace account for Main Street Clinic',
        reason: 'Failed because patient Jane Doe was in the note',
        operation: 'task.due_date.update',
        error_type: 'upstream_unavailable',
      }),
    ).toEqual({
      route: '/app/compliance/program/training',
      status: 'closed',
      action: 'reactivate',
      operation: 'task.due_date.update',
      error_type: 'upstream_unavailable',
    })
  })

  it('keeps help, dashboard, and profile analytics properties coarse and PHI-safe', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/help',
        destination_route: '/app/tasks/23c7f93d-0620-4b17-a178-a0ec146d9f91',
        category: 'getting-started',
        topic: 'open-pdf-download',
        metric: 'open_tasks',
        status: 'results',
        action: 'all_locations',
        count: 3,
        query: 'patient name',
        search_text: 'billing for Jane Doe',
        locationId: 'location-123',
        userId: 'user-123',
        name: 'Staff Member',
        email: 'staff@clinic.test',
        password: 'secret',
      }),
    ).toEqual({
      route: '/app/help',
      destination_route: '/app/tasks/$taskId',
      category: 'getting-started',
      topic: 'open-pdf-download',
      metric: 'open_tasks',
      status: 'results',
      action: 'all_locations',
      count: 3,
    })
  })

  it('keeps signup, onboarding, and billing friction properties coarse and PHI-safe', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/billing',
        destination_route: '/app/onboarding',
        selected_plan: 'clinic',
        billing_cadence: 'annual',
        document_type: 'baa',
        operation: 'billing.checkout',
        error_type: 'client_error',
        reason: 'weak_password',
        count: 2,
        email: 'owner@clinic.test',
        name: 'Clinic Owner',
        customerEntityName: 'Main Street Clinic PLLC',
        signerTitle: 'Practice Manager',
        filename: 'executed-baa.pdf',
        raw_error: 'Patient Jane Doe was included',
      }),
    ).toEqual({
      route: '/app/billing',
      destination_route: '/app/onboarding',
      selected_plan: 'clinic',
      billing_cadence: 'annual',
      document_type: 'baa',
      operation: 'billing.checkout',
      error_type: 'client_error',
      reason: 'weak_password',
      count: 2,
    })
  })

  it('keeps partner admin analytics coarse and free of partner identity', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/admin/partners?partnerId=secret',
        category: 'partners',
        action: 'approve',
        status: 'failed',
        operation: 'partners.approve',
        error_type: 'client_error',
        row_count_bucket: '1-100',
        has_active_filters: true,
        sort_key: 'totalReferrals',
        sort_dir: 'desc',
        email: 'partner@example.com',
        partnerId: 'partner_123',
        externalReference: 'ACH-123',
        partnerName: 'Jane Partner',
        raw_error: 'Partner Jane failed',
      }),
    ).toEqual({
      route: '/app/admin/partners',
      category: 'partners',
      action: 'approve',
      status: 'failed',
      operation: 'partners.approve',
      error_type: 'client_error',
      row_count_bucket: '1-100',
      has_active_filters: true,
      sort_key: 'totalReferrals',
      sort_dir: 'desc',
    })
  })

  it('keeps public signup friction analytics strict and free of submitted identity', () => {
    expect(
      sanitizePublicSignupAnalyticsProperties({
        route: '/signup/check-email',
        destination_route: '/app/onboarding?plan=clinic&invite=secret',
        selected_plan: 'clinic',
        source: 'email',
        status: 'failed',
        reason: 'auth_error',
        email: 'owner@clinic.test',
        name: 'Clinic Owner',
        password: 'secret',
        raw_error: 'OAuth error for owner@clinic.test',
      }),
    ).toEqual({
      route: '/signup/check-email',
      destination_route: '/app/onboarding',
      selected_plan: 'clinic',
      source: 'email',
      status: 'failed',
      reason: 'auth_error',
    })
  })

  it('keeps public auth funnel analytics strict and free of submitted identity', () => {
    expect(
      sanitizePublicSignupAnalyticsProperties({
        route: '/accept-invite/invite-123',
        destination_route: '/app/dashboard?locationId=secret',
        source: 'email',
        provider: 'google',
        status: 'failed',
        reason: 'email_mismatch',
        action: 'accept_invite',
        email: 'owner@clinic.test',
        name: 'Clinic Owner',
        invitationId: 'invite-123',
        invitedEmail: 'owner@clinic.test',
        raw_error: 'Invalid invite for owner@clinic.test',
      }),
    ).toEqual({
      route: '/accept-invite/$invitationId',
      destination_route: '/app/dashboard',
      source: 'email',
      provider: 'google',
      status: 'failed',
      reason: 'email_mismatch',
      action: 'accept_invite',
    })
  })

  it('keeps public partner analytics anonymous and free of submitted identity', () => {
    expect(
      sanitizePublicSignupAnalyticsProperties({
        route: '/partner/abc123',
        destination_route: '/signup?ref=secret',
        category: 'referrals',
        action: 'magic_link',
        source: 'email',
        status: 'failed',
        reason: 'invalid_link',
        count: 2,
        email: 'partner@example.com',
        partnerCode: 'abc123',
        partnerName: 'Jane Partner',
        raw_error: 'Partner Jane failed',
      }),
    ).toEqual({
      route: '/partner/$code',
      destination_route: '/signup',
      category: 'referrals',
      action: 'magic_link',
      source: 'email',
      status: 'failed',
      reason: 'invalid_link',
      count: 2,
    })
  })

  it('drops public attribution values that look like identity or free text', () => {
    expect(
      sanitizePublicSignupAnalyticsProperties({
        route: '/signup',
        landing_path: '/resources/guides/hipaa?patient=Jane',
        initial_referrer_host: 'main-street-clinic.example.com/path',
        initial_utm_source: 'Jane Doe',
        initial_utm_medium: '555-1212',
        initial_utm_campaign: 'main_street_clinic',
        initial_utm_content: 'patient_follow_up',
        initial_utm_term: 'hipaa',
        first_touch_id: 'ft_lwm6mj4w_ab12cd34',
        cta_location: 'pricing-card',
      }),
    ).toEqual({
      route: '/signup',
      landing_path: '/resources/guides/hipaa',
      initial_utm_term: 'hipaa',
      first_touch_id: 'ft_lwm6mj4w_ab12cd34',
      cta_location: 'pricing-card',
    })
  })

  it('drops nested values even when the property key is approved', () => {
    expect(
      sanitizeProductAnalyticsProperties({
        route: '/app/dashboard',
        status: { patient: 'Jane Doe' },
        count: { value: 3 },
        category: { email: 'staff@clinic.test' },
        missing_features: ['patient name'],
        has_active_filters: true,
        trial_day: 7,
      }),
    ).toEqual({
      route: '/app/dashboard',
      has_active_filters: true,
      trial_day: 7,
    })
  })
})
