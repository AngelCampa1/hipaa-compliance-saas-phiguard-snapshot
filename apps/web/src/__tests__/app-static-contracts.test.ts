import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import {
  BILLING_CADENCES,
  PLANS,
  PROMOTIONS,
  PUBLIC_PLAN_IDS,
} from '@phiguard/billing/plans'
import { describe, expect, it } from 'vitest'
import { APPROVED_PRODUCT_ANALYTICS_EVENTS } from '../lib/product-analytics'

const root = resolve(__dirname, '..')
const workspaceRoot = resolve(root, '..', '..', '..')

function readSource(relativePath: string) {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

function readProjectSource(relativePath: string) {
  return readFileSync(resolve(workspaceRoot, relativePath), 'utf8')
}

function collectFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? collectFiles(path) : [path]
  })
}

describe('app route source contracts', () => {
  it('keeps route-adjacent tests ignored by the TanStack route generator', () => {
    const routesDir = resolve(root, 'routes')
    const routeTestFiles = collectFiles(routesDir).filter((file) =>
      /\.(test|spec)\.[cm]?[jt]sx?$/.test(file),
    )
    const unignoredTestFiles = routeTestFiles
      .map((file) => relative(routesDir, file))
      .filter((file) => !file.split(sep).at(-1)?.startsWith('-'))

    expect(unignoredTestFiles).toEqual([])
  })

  it('documents dash-prefixed route-adjacent test paths', () => {
    const phaseTwoEvidence = readProjectSource('docs/hipaa/phase-2-evidence.md')

    expect(phaseTwoEvidence).toContain('apps/web/src/routes/api/webhooks/-stripe.test.ts')
    expect(phaseTwoEvidence).toContain(
      'pnpm --filter @phiguard/web test -- src/lib/sentry.test.ts src/routes/api/webhooks/-stripe.test.ts src/server/baa.test.ts src/server/billing.test.ts src/server/auth-log.test.ts src/lib/phase-two-flow.test.ts',
    )
    expect(phaseTwoEvidence).not.toContain('apps/web/src/routes/api/webhooks/stripe.test.ts')
    expect(phaseTwoEvidence).not.toContain('src/routes/api/webhooks/stripe.test.ts')
  })

  it('ships an app-domain robots.txt that blocks private and utility routes', () => {
    const source = readSource('../public/robots.txt')

    expect(source).toContain('User-agent: *')
    expect(source).toContain('Disallow: /app')
    expect(source).toContain('Disallow: /api')
    expect(source).toContain('Disallow: /api/auth')
    expect(source).toContain('Disallow: /partner')
    expect(source).toContain('Disallow: /partner/dashboard')
    expect(source).toContain('Disallow: /partner/verify')
    expect(source).toContain('Disallow: /accept-invite')
    expect(source).toContain('Disallow: /signup/check-email')
    expect(source).not.toContain('Allow: /app')
    expect(source).not.toContain('Sitemap:')
  })

  it('does not keep the closed mobile navigation dialog in the accessibility tree', () => {
    const source = readSource('routes/app.tsx')

    expect(source).toContain('{isMobileNavOpen && (')
    expect(source).not.toContain('aria-hidden={!isMobileNavOpen}')
    expect(source).not.toContain('isMobileNavOpen ? "translate-x-0" : "-translate-x-full"')
  })

  it('mounts the shared @ventora/ai-cs widget as the authenticated support entrypoint', () => {
    const appSource = readSource('routes/app.tsx')
    const widgetSource = readSource('components/ai-cs-support-widget.tsx')

    // The app shell mounts the shared widget wrapper (not the retired in-house client).
    expect(appSource).toContain("from '../components/ai-cs-support-widget'")
    expect(appSource).toContain('<AiCsSupportWidget')
    expect(appSource).not.toContain("from '../components/ai-cs-support'")

    // The wrapper renders the shared widget and talks to the same-origin BFF.
    expect(widgetSource).toContain("from '@ventora/ai-cs/react'")
    expect(widgetSource).toContain('<AiCsWidget')
    expect(widgetSource).toContain("baseUrl: '/api/ai-cs'")
    expect(widgetSource).toContain("credentials: 'include'")
  })

  it('does not duplicate the policies page heading for screen readers', () => {
    const source = readSource('routes/app/compliance/policies/index.tsx')

    expect(source).not.toMatch(/<div className="sr-only">[\s\S]*?<h1\b/)
  })

  it('onboarding accepts BAA and starts the trial in a single step', () => {
    const source = readSource('routes/app/onboarding.tsx')

    expect(source).toContain('Accept and start ${TRIAL_DAYS}-day trial')
    expect(source).toContain('startTrialFn')
    expect(source).toContain('acceptLegalDocumentsFn')
    expect(source).not.toMatch(/step\s*===\s*1[\s\S]*Choose your plan/)
  })

  it('onboarding applies a selected plan before starting the trial for existing orgs', () => {
    const source = readSource('routes/app/onboarding.tsx')

    expect(source).toContain('selectPlanFn')
    expect(source).toMatch(/selectPlanFn[\s\S]*startTrialFn/)
  })

  it('preserves first-touch attribution through Google signup completion', () => {
    const signupSource = readSource('routes/signup.tsx')
    const onboardingSource = readSource('routes/app/onboarding.tsx')

    expect(signupSource).toContain('newUserOnboardingParams.set(key, value)')
    expect(onboardingSource).toContain('SIGNUP_ATTRIBUTION_KEYS')
    expect(onboardingSource).toContain('first_touch_id: z.string().optional()')
    expect(onboardingSource).toContain('...signupAttribution')
    expect(onboardingSource).toMatch(/trackPublicSignupEvent\('signup_completed'[\s\S]*\.\.\.signupAttribution/)
  })

  it('onboarding submit stays clickable so missing legal fields can show feedback', () => {
    const source = readSource('routes/app/onboarding.tsx')

    expect(source).toContain('validateOnboardingLegalStep')
    expect(source).toContain('aria-invalid')
    expect(source).toContain('role="alert"')
    expect(source).toContain('validationSummaryRef')
    expect(source).not.toContain("legalStatus !== 'accepted' && !formReady")
  })

  it('new task action is gated during legal onboarding', () => {
    const source = readSource('routes/app.tsx')

    expect(source).toContain('LEGAL_ONBOARDING_REQUIRED_MESSAGE')
    expect(source).toContain('isOnboardingRoute')
    expect(source).toContain('setLegalGateMessage(LEGAL_ONBOARDING_REQUIRED_MESSAGE)')
    expect(source).toContain('role="alert"')
    expect(source).not.toContain('onClick={() => setIsTaskModalOpen(true)}')
  })

  it('captures normalized page views for every authenticated app route', () => {
    const source = readSource('routes/app.tsx')

    expect(source).toContain("capture('app_page_viewed'")
    expect(source).toContain('normalizeProductAnalyticsRoute(pathname)')
    expect(source).toContain("capture('app_session_started'")
  })

  it('captures authenticated shell navigation, help, organization, and blocked-action intent', () => {
    const source = readSource('routes/app.tsx')

    expect(source).toContain("trackProductEvent('app_navigation_clicked'")
    expect(source).toContain("trackProductEvent('app_nav_section_toggled'")
    expect(source).toContain("trackProductEvent('app_account_menu_opened'")
    expect(source).toContain("trackProductEvent('app_account_action_clicked'")
    expect(source).toContain("trackProductEvent('app_support_link_clicked'")
    expect(source).toContain("trackProductEvent('app_task_create_opened'")
    expect(source).toContain('destination_route')
    expect(source).toContain("trackProductEvent('app_help_opened'")
    expect(source).toContain("trackProductEvent('app_organization_switched'")
    expect(source).toContain("trackProductEvent('app_action_blocked'")
    expect(source).toContain("reason: 'legal_onboarding_required'")
  })

  it('keeps the support surface free of message text and client-held secrets', () => {
    const source = readSource('components/ai-cs-support-widget.tsx')

    // The shared widget posts only to the same-origin BFF; the wrapper must not
    // capture, log, or forward message/draft text, and must never hold the HMAC
    // secret in the browser.
    expect(source).not.toContain('message_text')
    expect(source).not.toContain('draft_text')
    expect(source).not.toContain('signRequest')
    expect(source).not.toContain('clientAssertion')
    expect(source).not.toContain('console.')
  })

  it('keeps app sessions separate from authenticated route page views', () => {
    const source = readSource('routes/app.tsx')

    expect(source).toMatch(
      /capture\('app_session_started'[\s\S]*?\}, \[analyticsOrgId, navState\?\.analyticsContext, navState\?\.session\.organization\?\.role\]\)/,
    )
    expect(source).toMatch(
      /capture\('app_page_viewed'[\s\S]*?\}, \[analyticsOrgId, navState\?\.analyticsContext, navState\?\.session\.organization\?\.role, pathname\]\)/,
    )
  })

  it('captures core compliance lifecycle events in product analytics', () => {
    const policyDetail = readSource('routes/app/compliance/program.policies.$policyId.tsx')
    const training = readSource('routes/app/compliance/program.training.tsx')
    const risk = readSource('routes/app/compliance/program.risk.tsx')
    const checklistDetail = readSource('routes/app/compliance/checklists.$checklistId.tsx')

    expect(policyDetail).toMatch(/trackProductEvent\(['"]policy_acknowledged['"]/)
    expect(training).toMatch(/trackProductEvent\(['"]training_record_completed['"]/)
    expect(risk).toMatch(/trackProductEvent\(['"]risk_assessment_created['"]/)
    expect(checklistDetail).toMatch(/trackProductEvent\(['"]checklist_completed['"]/)
  })

  it('captures compliance overview navigation without identifiers or free text', () => {
    const compliance = readSource('routes/app/compliance/index.tsx')
    const program = readSource('routes/app/compliance/program.index.tsx')
    const combined = [compliance, program].join('\n')

    expect(compliance).toContain("trackProductEvent('compliance_dashboard_viewed'")
    expect(compliance).toContain("trackProductEvent('compliance_dashboard_section_opened'")
    expect(program).toContain("trackProductEvent('compliance_program_dashboard_viewed'")
    expect(program).toContain("trackProductEvent('compliance_program_section_opened'")

    const analyticsCallBlocks = combined.match(/trackProductEvent\([\s\S]*?\n\s*}\)/g) ?? []
    for (const unsafeProperty of [
      'checklist_id:',
      'checklistId:',
      'checklist_name:',
      'policy_id:',
      'policyId:',
      'policy_title:',
      'title:',
      'description:',
      'name:',
      'query:',
    ]) {
      for (const callBlock of analyticsCallBlocks) {
        expect(callBlock).not.toContain(unsafeProperty)
      }
    }
  })

  it('integrations read-only users can see active connections without manage controls', () => {
    const source = readSource('routes/app/settings.integrations.tsx')

    expect(source).toContain('const conns = await listConnectionsFn()')
    expect(source).not.toContain('if (!canManage) {\n      setConnections([])')
    expect(source).toContain('Active connections (')
    expect(source).toContain('canManageIntegrations ? (')
    expect(source).toContain('Read only')
    expect(source).toContain('!connectedProviders.has(provider) && canManageIntegrations')
  })

  it('member settings only renders role actions the server says the actor can use', () => {
    const routeSource = readSource('routes/app/settings.members.tsx')
    const serverSource = readSource('server/organizations.ts')

    expect(serverSource).toContain('inviteableRoles')
    expect(serverSource).toContain('assignableRoles')
    expect(serverSource).toContain('manageableRoles')
    expect(routeSource).toContain('membersState?.inviteableRoles')
    expect(routeSource).toContain('membersState?.assignableRoles')
    expect(routeSource).toContain('membersState?.manageableRoles')
    expect(routeSource).toContain('member.canManage === true')
    expect(routeSource).toMatch(/canManageMemberRole\(\s*invitation\.role\s*,?\s*\)/)
    expect(routeSource).not.toContain('<option value="org_admin">Org admin</option>')
  })

  it('integration setup requires the calendar compliance acknowledgment before OAuth', () => {
    const source = readSource('routes/app/settings.integrations.tsx')

    expect(source).toContain('CALENDAR_COMPLIANCE_ACKNOWLEDGMENT')
    expect(source).toContain('Google Workspace / Microsoft 365 agreement includes a BAA')
    expect(source).toContain('calendarComplianceAcknowledged')
    expect(source).toContain('confirmDisabled={!calendarComplianceAcknowledged}')
    expect(source).toContain('acknowledgedCalendarCompliance: true')
  })

  it('captures admin settings changes without target names or emails', () => {
    const members = readSource('routes/app/settings.members.tsx')
    const locations = readSource('routes/app/settings.locations.tsx')
    const integrations = readSource('routes/app/settings.integrations.tsx')

    expect(members).toContain("trackProductEvent('member_invited'")
    expect(members).toContain("trackProductEvent('member_role_changed'")
    expect(members).toContain("trackProductEvent('member_removed'")
    expect(members).toContain("trackProductEvent('invitation_resent'")
    expect(members).toContain("trackProductEvent('invitation_cancelled'")
    expect(members).toContain("trackProductEvent('member_action_failed'")
    expect(members).toContain("trackProductEvent('member_settings_retry_clicked'")
    expect(members).toContain("trackProductEvent('member_role_change_dialog_opened'")
    expect(members).toContain("trackProductEvent('member_role_change_cancelled'")
    expect(members).toContain("trackProductEvent('member_remove_dialog_opened'")
    expect(members).toContain("trackProductEvent('member_remove_cancelled'")
    expect(members).toContain("trackProductEvent('invitation_link_opened'")
    expect(members).not.toContain('target_email')
    expect(members).not.toContain('member_name')

    expect(locations).toContain("trackProductEvent('location_created'")
    expect(locations).toContain("trackProductEvent('location_updated'")
    expect(locations).toContain("trackProductEvent('location_status_changed'")
    expect(locations).toContain("trackProductEvent('location_grants_updated'")
    expect(locations).toContain("trackProductEvent('location_action_failed'")
    expect(locations).toContain("trackProductEvent('location_settings_retry_clicked'")
    expect(locations).toContain("trackProductEvent('location_grant_update_blocked'")
    expect(locations).not.toContain('location_name')

    expect(integrations).toContain("trackProductEvent('integration_connect_started'")
    expect(integrations).toContain("trackProductEvent('integration_connect_completed'")
    expect(integrations).toContain("trackProductEvent('integration_connect_failed'")
    expect(integrations).toContain("trackProductEvent('integration_settings_load_failed'")
    expect(integrations).toContain("trackProductEvent('integration_settings_retry_clicked'")
    expect(integrations).toContain("trackProductEvent('integration_revoked'")
    expect(integrations).toContain("trackProductEvent('integration_connect_dialog_opened'")
    expect(integrations).toContain("trackProductEvent('integration_connect_cancelled'")
    expect(integrations).toContain("trackProductEvent('integration_compliance_acknowledged'")
    expect(integrations).toContain("trackProductEvent('integration_revoke_started'")
    expect(integrations).toContain("trackProductEvent('integration_revoke_failed'")
    expect(integrations).not.toContain('account_email')
  })

  it('captures report and audit workflows with safe metadata only', () => {
    const reportsIndex = readSource('routes/app/reports.index.tsx')
    const complianceReport = readSource('routes/app/reports.compliance.tsx')
    const taskReport = readSource('routes/app/reports.tasks.tsx')
    const auditIndex = readSource('routes/app/audit/index.tsx')
    const auditExport = readSource('routes/app/audit/export.tsx')

    expect(reportsIndex).toContain("trackProductEvent('report_viewed'")
    expect(complianceReport).toContain("trackProductEvent('report_viewed'")
    expect(complianceReport).toContain("trackProductEvent('report_exported'")
    expect(complianceReport).toContain("trackProductEvent('report_export_failed'")
    expect(complianceReport).toContain("trackProductEvent('report_sort_changed'")
    expect(complianceReport).toContain("trackProductEvent('report_empty_state_viewed'")
    expect(complianceReport).toContain("trackProductEvent('report_drilldown_clicked'")
    expect(taskReport).toContain("trackProductEvent('report_viewed'")
    expect(taskReport).toContain("trackProductEvent('report_exported'")
    expect(taskReport).toContain("trackProductEvent('report_export_failed'")
    expect(taskReport).toContain("trackProductEvent('report_sort_changed'")
    expect(taskReport).toContain("trackProductEvent('report_empty_state_viewed'")
    expect(taskReport).toContain("trackProductEvent('report_drilldown_clicked'")
    expect(reportsIndex).toMatch(/report_drilldown_clicked[\s\S]*destination_route: '\/app\/tasks'/)
    expect(auditIndex).toContain("trackProductEvent('audit_search_performed'")
    expect(auditIndex).toContain("trackProductEvent('audit_events_load_failed'")
    expect(auditIndex).toContain("trackProductEvent('audit_events_retry_clicked'")
    expect(auditIndex).toContain("trackProductEvent('report_drilldown_clicked'")
    expect(auditExport).toContain("trackProductEvent('audit_export_started'")
    expect(auditExport).toContain("trackProductEvent('audit_export_completed'")
    expect(auditExport).toContain("trackProductEvent('audit_export_failed'")
    expect(auditIndex).not.toContain('actor_email:')
    expect(auditIndex).not.toContain('search_text:')
  })

  it('captures SOC 2 access review and evidence workflows without sensitive identifiers', () => {
    const accessReviews = readSource('routes/app/soc2.access-reviews.index.tsx')
    const accessReviewDetail = readSource('routes/app/soc2.access-reviews.$reviewId.tsx')
    const evidence = readSource('routes/app/soc2.evidence.tsx')
    const combined = [accessReviews, accessReviewDetail, evidence].join('\n')

    expect(accessReviews).toContain("trackProductEvent('access_reviews_viewed'")
    expect(accessReviews).toContain("trackProductEvent('access_review_filter_changed'")
    expect(accessReviews).toContain("trackProductEvent('access_review_sort_changed'")
    expect(accessReviews).toContain("trackProductEvent('access_review_empty_state_viewed'")
    expect(accessReviews).toContain("trackProductEvent('access_review_open_started'")
    expect(accessReviews).toContain("trackProductEvent('access_review_open_cancelled'")
    expect(accessReviews).toContain("trackProductEvent('access_review_action_failed'")
    expect(accessReviews).toContain("trackProductEvent('access_review_feature_gate_viewed'")
    expect(accessReviews).toContain("trackProductEvent('access_review_opened'")
    expect(accessReviewDetail).toContain("trackProductEvent('access_review_decision_recorded'")
    expect(accessReviewDetail).toContain("trackProductEvent('access_review_closed'")
    expect(evidence).toMatch(/trackProductEvent\(["']soc2_evidence_viewed["']/)
    expect(evidence).toMatch(/trackProductEvent\(["']soc2_evidence_filter_changed["']/)
    expect(evidence).toMatch(/trackProductEvent\(["']soc2_evidence_sort_changed["']/)
    expect(evidence).toMatch(/trackProductEvent\(["']soc2_evidence_empty_state_viewed["']/)
    expect(evidence).toMatch(/trackProductEvent\(["']soc2_evidence_action_failed["']/)
    expect(evidence).toMatch(/trackProductEvent\(["']soc2_evidence_feature_gate_viewed["']/)
    expect(evidence).toMatch(/trackProductEvent\(["']soc2_evidence_bundle_exported["']/)
    expect(evidence).toMatch(/trackProductEvent\(["']soc2_audit_evidence_collected["']/)
    expect(evidence).toMatch(/trackProductEvent\(["']soc2_evidence_downloaded["']/)
    expect(evidence).toMatch(/trackProductEvent\(["']soc2_evidence_recorded["']/)

    const analyticsCallBlocks = combined.match(/trackProductEvent\([\s\S]*?\n\s*}\)/g) ?? []
    for (const unsafeProperty of [
      'review_id:',
      'item_id:',
      'evidence_id:',
      'filename:',
      'download_url:',
      'summary:',
      'member_email:',
      'member_name:',
    ]) {
      for (const callBlock of analyticsCallBlocks) {
        expect(callBlock).not.toContain(unsafeProperty)
      }
    }
  })

  it('captures SOC 2 controls and auditor exploration without control identifiers or titles', () => {
    const overview = readSource('routes/app/soc2.index.tsx')
    const controls = readSource('routes/app/soc2.controls.tsx')
    const auditor = readSource('routes/app/soc2.auditor.tsx')
    const combined = [overview, controls, auditor].join('\n')

    expect(overview).toContain("trackProductEvent('soc2_dashboard_viewed'")
    expect(controls).toContain("trackProductEvent('soc2_controls_viewed'")
    expect(controls).toContain("trackProductEvent('soc2_controls_filter_changed'")
    expect(controls).toContain("trackProductEvent('soc2_controls_search_performed'")
    expect(controls).toContain("trackProductEvent('soc2_controls_sort_changed'")
    expect(controls).toContain("trackProductEvent('soc2_control_evidence_opened'")
    expect(auditor).toContain("trackProductEvent('soc2_auditor_viewed'")

    const analyticsCallBlocks = combined.match(/trackProductEvent\([\s\S]*?\n\s*}\)/g) ?? []
    for (const unsafeProperty of [
      'control_id:',
      'controlId:',
      'control_title:',
      'title:',
      'description:',
      'evidence_id:',
      'evidence_count:',
    ]) {
      for (const callBlock of analyticsCallBlocks) {
        expect(callBlock).not.toContain(unsafeProperty)
      }
    }
  })

  it('captures task and incident lifecycle workflows without sensitive identifiers', () => {
    const taskList = readSource('routes/app/tasks.tsx')
    const taskDetail = readSource('routes/app/tasks.$taskId.tsx')
    const incidentList = readSource('routes/app/compliance/incidents/index.tsx')
    const incidentDetail = readSource('routes/app/compliance/incidents/$incidentId.tsx')
    const combined = [taskList, taskDetail, incidentList, incidentDetail].join('\n')

    expect(taskList).toMatch(/trackProductEvent\(['"]task_list_viewed['"]/)
    expect(taskList).toMatch(/trackProductEvent\(['"]task_create_started['"]/)
    expect(taskList).toMatch(/trackProductEvent\(['"]task_filter_changed['"]/)
    expect(taskList).toMatch(/trackProductEvent\(['"]task_search_performed['"]/)
    expect(taskList).toMatch(/trackProductEvent\(['"]task_sort_changed['"]/)
    expect(taskList).toMatch(/trackProductEvent\(['"]task_page_changed['"]/)
    expect(taskList).toMatch(/trackProductEvent\(['"]task_selection_changed['"]/)
    expect(taskList).toMatch(/trackProductEvent\(['"]task_action_failed['"]/)
    expect(taskList).toMatch(/trackProductEvent\(['"]task_empty_state_viewed['"]/)
    expect(taskList).toMatch(/trackProductEvent\(['"]task_bulk_status_changed['"]/)
    expect(taskList).toMatch(/trackProductEvent\(['"]task_bulk_assigned['"]/)
    expect(taskList).toMatch(/route: TASK_LIST_ANALYTICS_ROUTE/)
    expect(taskDetail).toMatch(/trackProductEvent\(['"]task_status_changed['"]/)
    expect(taskDetail).toMatch(/trackProductEvent\(['"]task_due_date_updated['"]/)
    expect(taskDetail).toMatch(/trackProductEvent\(['"]task_updated['"]/)
    expect(taskDetail).toMatch(/trackProductEvent\(['"]task_archived['"]/)
    expect(incidentList).toMatch(/trackProductEvent\(['"]incident_list_viewed['"]/)
    expect(incidentList).toMatch(/trackProductEvent\(['"]incident_report_started['"]/)
    expect(incidentList).toMatch(/trackProductEvent\(['"]incident_filter_changed['"]/)
    expect(incidentList).toMatch(/trackProductEvent\(['"]incident_search_performed['"]/)
    expect(incidentList).toMatch(/trackProductEvent\(['"]incident_sort_changed['"]/)
    expect(incidentList).toMatch(/trackProductEvent\(['"]incident_empty_state_viewed['"]/)
    expect(incidentList).toMatch(/trackProductEvent\(['"]incident_exported['"]/)
    expect(incidentList).toMatch(/route: INCIDENT_LIST_ANALYTICS_ROUTE/)
    expect(incidentDetail).toMatch(/trackProductEvent\(['"]incident_updated['"]/)
    expect(incidentDetail).toMatch(/trackProductEvent\(['"]incident_status_changed['"]/)
    expect(incidentDetail).toMatch(/trackProductEvent\(['"]incident_update_added['"]/)

    const analyticsCallBlocks = combined.match(/trackProductEvent\([\s\S]*?\n\s*}\)/g) ?? []
    for (const unsafeProperty of [
      'taskId:',
      'incidentId:',
      'policyId:',
      'recordId:',
      'userId:',
      'locationId:',
      'filename:',
      'downloadUrl:',
      'download_url:',
      'title:',
      'summary:',
      'description:',
      'comment:',
      'body:',
      'email:',
      'name:',
    ]) {
      for (const callBlock of analyticsCallBlocks) {
        expect(callBlock).not.toContain(unsafeProperty)
      }
    }
  })

  it('captures compliance program workflows without sensitive identifiers', () => {
    const risk = readSource('routes/app/compliance/program.risk.tsx')
    const training = readSource('routes/app/compliance/program.training.tsx')
    const checklistIndex = readSource('routes/app/compliance/checklists.index.tsx')
    const checklistDetail = readSource('routes/app/compliance/checklists.$checklistId.tsx')
    const policies = readSource('routes/app/compliance/program.policies.index.tsx')
    const policyDetail = readSource('routes/app/compliance/program.policies.$policyId.tsx')
    const combined = [
      risk,
      training,
      checklistIndex,
      checklistDetail,
      policies,
      policyDetail,
    ].join('\n')

    for (const [source, eventName] of [
      [risk, 'risk_item_created'],
      [risk, 'risk_item_updated'],
      [risk, 'risk_item_deleted'],
      [risk, 'risk_assessment_status_changed'],
      [risk, 'risk_assessment_reopened'],
      [risk, 'risk_assessment_renamed'],
      [risk, 'risk_assessment_deleted'],
      [training, 'training_exported'],
      [training, 'training_course_created'],
      [training, 'training_course_status_changed'],
      [training, 'training_assigned'],
      [training, 'training_certificate_downloaded'],
      [training, 'training_unassigned'],
      [training, 'training_completion_reopened'],
      [training, 'training_due_date_updated'],
      [training, 'training_reassigned'],
      [checklistIndex, 'checklist_location_filter_changed'],
      [checklistIndex, 'checklist_renamed'],
      [checklistIndex, 'checklist_archived'],
      [checklistIndex, 'checklist_deleted'],
      [checklistIndex, 'checklist_action_failed'],
      [checklistDetail, 'checklist_item_reopened'],
      [checklistDetail, 'checklist_evidence_uploaded'],
      [checklistDetail, 'checklist_evidence_downloaded'],
      [checklistDetail, 'checklist_archived'],
      [policies, 'policy_created'],
      [policies, 'policy_published'],
      [policyDetail, 'policy_draft_updated'],
      [policyDetail, 'policy_version_created'],
      [policyDetail, 'policy_archived'],
      [policyDetail, 'policy_restored'],
      [policyDetail, 'policy_action_failed'],
    ] as const) {
      expect(source).toMatch(new RegExp(`trackProductEvent\\(['"]${eventName}['"]`))
    }

    const analyticsCallBlocks = combined.match(/trackProductEvent\([\s\S]*?\n\s*}\)/g) ?? []
    const checklistItemCompletedCall = analyticsCallBlocks.find((callBlock) =>
      callBlock.includes('checklist_item_completed'),
    )
    expect(checklistItemCompletedCall).toContain(
      'route: "/app/compliance/checklists/$checklistId"',
    )
    expect(checklistIndex).toContain('route: CHECKLIST_INDEX_ANALYTICS_ROUTE')

    for (const unsafeProperty of [
      'policyId:',
      'assessmentId:',
      'itemId:',
      'recordId:',
      'userId:',
      'courseId:',
      'checklistId:',
      'filename:',
      'fileName:',
      's3Key:',
      'downloadUrl:',
      'download_url:',
      'title:',
      'bodyMarkdown:',
      'body:',
      'version:',
      'description:',
      'mitigation:',
      'courseTitle:',
      'userName:',
      'userEmail:',
      'locationId:',
      'locationIds:',
      'locationName:',
      'dueAt:',
      'effectiveDate:',
      'email:',
      'name:',
    ]) {
      for (const callBlock of analyticsCallBlocks) {
        expect(callBlock).not.toContain(unsafeProperty)
      }
    }
  })

  it('captures help, dashboard, and profile journeys without sensitive identifiers', () => {
    const help = readSource('routes/app/help.tsx')
    const dashboard = readSource('routes/app/dashboard.tsx')
    const profile = readSource('routes/app/settings.profile.tsx')
    const securityKeys = readSource('routes/app/settings.security-keys.tsx')
    const helpGuidance = readSource('components/help-guidance.tsx')
    const combined = [help, dashboard, profile, securityKeys, helpGuidance].join('\n')

    for (const [source, eventName] of [
      [help, 'help_search_performed'],
      [help, 'help_search_empty'],
      [help, 'help_category_selected'],
      [help, 'help_topic_opened'],
      [dashboard, 'dashboard_scope_changed'],
      [dashboard, 'dashboard_metric_clicked'],
      [dashboard, 'dashboard_action_clicked'],
      [profile, 'profile_viewed'],
      [profile, 'profile_section_started'],
      [profile, 'profile_display_name_updated'],
      [profile, 'profile_email_change_requested'],
      [profile, 'profile_password_updated'],
      [profile, 'profile_action_failed'],
      [profile, 'account_deletion_started'],
      [profile, 'account_deletion_requested'],
      [securityKeys, 'security_keys_viewed'],
      [securityKeys, 'security_key_enrollment_unavailable_viewed'],
      [helpGuidance, 'first_run_step_clicked'],
      [helpGuidance, 'first_run_banner_dismissed'],
    ] as const) {
      expect(source).toMatch(new RegExp(`trackProductEvent\\(['"]${eventName}['"]`))
    }

    const analyticsCallBlocks = combined.match(/trackProductEvent\([\s\S]*?\n\s*}\)/g) ?? []
    for (const unsafeProperty of [
      'query:',
      'search_text:',
      'searchText:',
      'locationId:',
      'location_id:',
      'userId:',
      'user_id:',
      'email:',
      'newEmail:',
      'name:',
      'password:',
      'currentPassword:',
      'newPassword:',
      'confirmPassword:',
      'confirmation:',
      'title:',
      'detail:',
      'cta:',
    ]) {
      for (const callBlock of analyticsCallBlocks) {
        expect(callBlock).not.toContain(unsafeProperty)
      }
    }
  })

  it('calendar token refreshes only persist to active integration connections', () => {
    const source = readSource('server/tasks.ts')

    expect(source).toContain("eq(integrationConnections.status, 'active')")
    expect(source).toContain(
      'eq(integrationConnections.refreshTokenCiphertext, connection.refreshTokenCiphertext)',
    )
    expect(source).toContain('eq(integrationConnections.expiresAt, connection.expiresAt)')
    expect(source).toContain('isNull(integrationConnections.expiresAt)')
  })

  it('integration callback errors map to specific user-facing messages', () => {
    const source = readSource('routes/app/settings.integrations.tsx')

    expect(source).toContain('getIntegrationCallbackFeedback')
    expect(source).toContain("params.get('error')")
    expect(source).toContain("params.get('reason')")
    expect(source).toContain('encryption_not_configured')
    expect(source).toContain('access_denied')
    expect(source).toContain('plan_required')
    expect(source).toContain('stale_state')
    expect(source).toContain('token_exchange')
    expect(source).toContain('Integration connected successfully.')
  })

  it('integration feature gate waits for real organization context before rendering', () => {
    const source = readSource('routes/app/settings.integrations.tsx')

    expect(source).toContain('setIsLoadingIntegrations(false)')
    expect(source).toContain('if (isLoadingIntegrations)')
    expect(source).toContain('if (hasNoOrg || !orgContext)')
    expect(source).toContain('<FeatureGate feature="integrations_basic" org={orgContext}>')
    expect(source).not.toContain('}>({ plan: null, planStatus: null, trialEndsAt: null })')
  })

  it('reports index gates report cards behind the multi-location feature', () => {
    const source = readSource('routes/app/reports.index.tsx')

    expect(source).toContain('getRollupOrgPlanFn')
    expect(source).toContain('getComplianceRollupFn')
    expect(source).toContain('getTaskRollupFn')
    expect(source).toContain("hasFeatureForOrg(org, 'multi_location_rollup')")
    expect(source).toContain('<FeatureGate feature="multi_location_rollup" org={org}>')
    expect(source).toContain('Average compliance')
    expect(source).toContain('Open tasks')
    expect(source).toContain('to="/app/reports/compliance"')
    expect(source).toContain('to="/app/reports/tasks"')
  })

  it('task detail reports member load failures instead of showing an empty assignee control', () => {
    const source = readSource('routes/app/tasks.$taskId.tsx')

    expect(source).toContain('membersLoadFailed')
    expect(source).toContain('Could not load team members')
    expect(source).toContain('Assignment is off until the member list loads.')
    expect(source).toMatch(/disabled=\{[\s\S]*assigning[\s\S]*membersLoadFailed[\s\S]*!assigneeId/)
    expect(source).toContain('disabled={membersLoadFailed}')
    expect(source).not.toContain('getMembersAndInvitationsFn().catch(() => null)')
  })

  it('feature gated app routes do not render fallback gates with fake organization context', () => {
    const routesDir = resolve(root, 'routes/app')
    const routeFiles = collectFiles(routesDir).filter((file) => file.endsWith('.tsx'))

    const offenders = routeFiles
      .filter((file) => readFileSync(file, 'utf8').includes('org={{ plan: null'))
      .map((file) => relative(routesDir, file).replaceAll('\\', '/'))

    expect(offenders).toEqual([])
  })

  it('HIPAA safeguards map resolves workforce policy placeholders to a concrete policy document', () => {
    const safeguards = readProjectSource('docs/hipaa/safeguards-map.md')
    const workforcePolicy = readProjectSource('docs/hipaa/workforce-security.md')

    expect(safeguards).toContain('docs/hipaa/workforce-security.md')
    expect(safeguards).not.toContain('Employee handbook section on PHI violations (TBD)')
    expect(safeguards).not.toContain('Onboarding checklist template (TBD)')
    expect(safeguards).not.toContain('Periodic security bulletin (TBD frequency)')
    expect(safeguards).not.toContain('endpoint policy TBD')
    expect(workforcePolicy).toContain('Sanction Policy')
    expect(workforcePolicy).toContain('Workforce Clearance')
    expect(workforcePolicy).toContain('Termination Procedures')
    expect(workforcePolicy).toContain('Security Reminders')
    expect(workforcePolicy).toContain('Endpoint and Workstation Requirements')
  })

  it('production smoke script checks the app health endpoint before authenticated flows', () => {
    const source = readProjectSource('scripts/prod-smoke.mjs')
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')

    expect(source).toContain('app healthz responds')
    expect(source).toContain('`${appBaseUrl}/healthz`')
    // /healthz is liveness-only (DB-free); database reachability is asserted via /readyz.
    expect(source).toContain('app readyz reports database health')
    expect(source).toContain('`${appBaseUrl}/readyz`')
    expect(goLiveChecklist).toContain('`pnpm smoke:prod` passes, including `/healthz`')
    expect(goLiveChecklist).not.toContain('`https://my.phiguard.app/healthz` returns `200`')
  })

  it('exposes the AI-CS proxy helper through authenticated API routes', () => {
    const sessionsRoute = readSource('routes/api/ai-cs/v1/sessions.tsx')
    const chatRoute = readSource('routes/api/ai-cs/v1/chat.tsx')
    const escalationsRoute = readSource('routes/api/ai-cs/v1/escalations.tsx')
    const supportWidget = readSource('components/ai-cs-support-widget.tsx')
    const appRoute = readSource('routes/app.tsx')
    const aiCsSource = readSource('server/ai-cs.ts')
    const proxySource = readSource('server/ai-cs-proxy.server.ts')
    const vendors = readProjectSource('docs/hipaa/vendors.md')
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')
    const goLiveSteps = readProjectSource('docs/runbooks/go-live-step-by-step.md')

    // The shared @ventora/ai-cs client appends `/v1/{sessions,chat,escalations}`
    // to the configured baseUrl, so the BFF proxy routes live under /api/ai-cs/v1.
    expect(sessionsRoute).toContain("createFileRoute('/api/ai-cs/v1/sessions')")
    expect(sessionsRoute).toContain("handleAiCsProxyRequest(request, 'sessions')")
    expect(chatRoute).toContain("createFileRoute('/api/ai-cs/v1/chat')")
    expect(chatRoute).toContain("handleAiCsProxyRequest(request, 'chat')")
    expect(escalationsRoute).toContain("createFileRoute('/api/ai-cs/v1/escalations')")
    expect(escalationsRoute).toContain("handleAiCsProxyRequest(request, 'escalations')")
    expect(appRoute).toContain('getAiCsAvailabilityFn')
    expect(appRoute).toContain('aiCsConfigured && !isOnboardingRoute')
    expect(goLiveChecklist).toContain('set `AI_CS_WORKER_ORIGIN`')
    expect(goLiveChecklist).toContain('set `AI_CS_CLIENT_ASSERTION_SECRET`')
    expect(goLiveSteps).toContain('AI_CS_WORKER_ORIGIN')
    expect(supportWidget).toContain('No patient information, please.')
    expect(aiCsSource).toContain('MAX_AI_CS_MESSAGE_LENGTH')
    expect(aiCsSource).toContain('isAiCsConfigured')
    expect(proxySource).toContain('Invalid AI-CS payload')
    expect(vendors).toContain('PHIGuard AI-CS Worker')
    expect(vendors).toContain('No patient PHI may be entered')
    // The downstream LLM provider that the AI-CS Worker calls is a PHI
    // sub-processor and must be inventoried with a BAA gate.
    expect(vendors).toContain('OpenRouter (AI-CS LLM provider)')
    expect(vendors).toContain('REQUIRED BEFORE LIVE PHI')
    // The escalation email path (Resend) carries user free-text and is gated too.
    expect(vendors).toContain('AI-CS escalation notification')
    // Every PHI-table write leaves an audit trail in the same transaction.
    expect(proxySource).toContain('writeAuditEvent')
    expect(proxySource).toContain('ai_cs.escalation.created')
  })

  it('configures Sentry source-map uploads for the web build', () => {
    const packageJson = readProjectSource('package.json')
    const webPackageJson = readProjectSource('apps/web/package.json')
    const viteConfig = readProjectSource('apps/web/vite.config.ts')
    const goLiveSteps = readProjectSource('docs/runbooks/go-live-step-by-step.md')
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')
    const envExample = readProjectSource('.env.example')

    expect(packageJson).toContain('"@sentry/vite-plugin"')
    expect(webPackageJson).toContain('"SENTRY_PROJECT": "phiguard-app-client"')
    expect(viteConfig).toContain("import { sentryVitePlugin } from '@sentry/vite-plugin'")
    expect(viteConfig).toContain('buildSentryVitePlugin')
    expect(viteConfig).toContain('SENTRY_AUTH_TOKEN')
    expect(viteConfig).toContain('sourcemap: hasSentryUploadConfig()')
    expect(viteConfig).toContain('assets: [')
    expect(viteConfig).toContain('filesToDeleteAfterUpload')
    expect(goLiveSteps).toContain(
      'source map upload is configured for the web and marketing builds',
    )
    expect(goLiveSteps).toContain('SENTRY_AUTH_TOKEN')
    expect(goLiveSteps).toContain('SENTRY_ORG')
    expect(goLiveSteps).toContain('SENTRY_RELEASE')
    expect(goLiveSteps).toContain('delete generated `.map` files after Sentry upload')
    expect(goLiveChecklist).toContain('set `SENTRY_AUTH_TOKEN`')
    expect(goLiveChecklist).toContain('set `SENTRY_ORG`')
    expect(goLiveChecklist).toContain('set `SENTRY_RELEASE`')
    expect(envExample).toContain('SENTRY_AUTH_TOKEN=')
    expect(envExample).toContain('SENTRY_ORG=')
    expect(envExample).toContain('SENTRY_RELEASE=')
    expect(goLiveSteps).not.toContain('source map upload is not configured yet')
  })

  it('documents Stripe checkout secrets from the generated billing checklist', () => {
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')
    const envExample = readProjectSource('.env.example')
    const packageJson = readProjectSource('package.json')

    const stripePriceEnvKeys = PUBLIC_PLAN_IDS.flatMap((planId) =>
      BILLING_CADENCES.map((cadence) => PLANS[planId].stripePriceEnvKeys[cadence]),
    )
    const promotionCouponEnvKeys = Object.values(PROMOTIONS).map(
      (promotion) => promotion.stripeCouponEnvKey,
    )

    expect(packageJson).toContain('"billing:env-checklist"')
    expect(goLiveChecklist).toContain('pnpm billing:env-checklist')

    for (const envName of [...stripePriceEnvKeys, ...promotionCouponEnvKeys]) {
      expect(goLiveChecklist).not.toContain(`set \`${envName}\``)
      expect(envExample).toContain(`${envName}=`)
    }
  })

  it('go-live checklist tracks implemented calendar integration OAuth secrets', () => {
    const checklist = readProjectSource('docs/runbooks/go-live-checklist.md')
    const oauth = readProjectSource('packages/integration/src/oauth.ts')

    for (const envName of [
      'GOOGLE_OAUTH_CLIENT_ID',
      'GOOGLE_OAUTH_CLIENT_SECRET',
      'GOOGLE_OAUTH_REDIRECT_URI',
      'MICROSOFT_OAUTH_CLIENT_ID',
      'MICROSOFT_OAUTH_CLIENT_SECRET',
      'MICROSOFT_OAUTH_REDIRECT_URI',
    ]) {
      expect(oauth).toContain(`process.env.${envName}`)
      expect(checklist).toContain(`set \`${envName}\``)
    }
  })

  it('production smoke script verifies the 15-minute session cookie max age', () => {
    const source = readProjectSource('scripts/prod-smoke.mjs')

    expect(source).toContain('app session cookie uses 15-minute max age')
    expect(source).toContain('expectSessionCookieMaxAge')
    expect(source).toContain('maxAgeSeconds > 900')
    expect(source).toContain('better-auth.session_token')
  })

  it('documents and wires emergency read-only mode for database failover', () => {
    const server = readSource('server.tsx')
    const runtimeEnv = readSource('lib/runtime-env.ts')
    const safeguards = readProjectSource('docs/hipaa/safeguards-map.md')
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')

    expect(server).toContain('PHIGUARD_READ_ONLY_MODE')
    expect(server).toContain('makeReadOnlyModeResponse')
    expect(runtimeEnv).toContain('PHIGUARD_READ_ONLY_MODE')
    expect(safeguards).toContain('PHIGUARD_READ_ONLY_MODE')
    expect(safeguards).toContain('| IMPLEMENTED')
    expect(safeguards).not.toContain(
      'Read-only mode during managed PostgreSQL failover (in progress)',
    )
    expect(goLiveChecklist).toContain('optional emergency: set `PHIGUARD_READ_ONLY_MODE=true`')
  })

  it('wires account-level login lockout for repeated email sign-in failures', () => {
    const server = readSource('server.tsx')
    const lockout = readSource('server/auth-lockout.ts')
    const threatModel = readProjectSource('docs/hipaa/threat-model.md')

    expect(server).toContain('getLoginLockoutState')
    expect(server).toContain('recordFailedLoginForIdentifier')
    expect(server).toContain('resetLoginLockoutForIdentifier')
    expect(server).toContain('/api/auth/sign-in/email')
    expect(lockout).toContain('AUTH_LOCKOUT_THRESHOLD')
    expect(lockout).toContain('auth-lockout:')
    expect(threatModel).toContain('account-level lockout')
    expect(threatModel).not.toContain('account lockout not yet implemented')
  })

  it('Playwright has an opt-in non-mock direct-upload smoke harness', () => {
    const packageJson = readProjectSource('apps/web/package.json')
    const globalSetup = readProjectSource('apps/web/e2e/global-setup.ts')
    const previewServer = readProjectSource('apps/web/e2e/preview-server.ts')
    const previewScript = readProjectSource('apps/web/scripts/playwright-preview-server.mjs')
    const directUploadRunner = readProjectSource('apps/web/scripts/playwright-direct-uploads.mjs')
    const directUploadSpec = readProjectSource('apps/web/e2e/uploads.direct.spec.ts')

    expect(packageJson).toContain('"test:e2e:direct-uploads"')
    expect(packageJson).toContain('playwright-direct-uploads.mjs')
    expect(globalSetup).toContain('POSTGRES_START_TIMEOUT_MS')
    expect(globalSetup).toContain('timeout: POSTGRES_START_TIMEOUT_MS')
    expect(previewServer).toContain('PLAYWRIGHT_DIRECT_UPLOADS')
    expect(previewServer).toContain('DIRECT_UPLOAD_SECRET')
    expect(previewServer).toContain("ENABLE_MOCK_UPLOADS: directUploadsEnabled ? 'false' : 'true'")
    expect(previewServer).toContain('ATTACHMENT_SCAN_REQUEST_URL')
    expect(previewServer).toContain('isPreviewServerProcess')
    expect(previewScript).toContain('createMemoryObjectStorageBucket')
    expect(previewScript).toContain('setObjectStorageBindings')
    expect(previewScript).toContain('/__playwright/attachment-scan')
    expect(previewScript).toContain('relative(clientRoot, assetPath)')
    expect(directUploadRunner).toContain("PLAYWRIGHT_DIRECT_UPLOADS: 'true'")
    expect(directUploadRunner).toContain('e2e/uploads.direct.spec.ts')
    expect(directUploadSpec).toContain("process.env.PLAYWRIGHT_DIRECT_UPLOADS !== 'true'")
    expect(directUploadSpec).toContain('/api/uploads/direct')
    expect(directUploadSpec).toContain('/api/uploads/mock')
    expect(directUploadSpec).toContain('expect(response.status()).toBe(204)')
    expect(directUploadSpec).toContain('expect(mockUploadRequests).toEqual([])')
  })

  it('access review decisions submit reviewer notes to the server', () => {
    const source = readSource('routes/app/soc2.access-reviews.$reviewId.tsx')

    expect(source).toContain('decisionNotes')
    expect(source).toContain('notes: decisionNotes[itemId] ??')
    expect(source).toContain('Reviewer notes')
    expect(source).toContain('item.notes')
  })

  it('access reviews can be closed even when they opened with no scoped members', () => {
    const source = readSource('routes/app/soc2.access-reviews.$reviewId.tsx')

    expect(source).toContain('canAdmin && allDecided')
    expect(source).not.toContain('canAdmin && allDecided && items.length > 0')
    expect(source).toContain('This review has no members.')
  })

  it('access review items show member identity instead of raw IDs when available', () => {
    const serverSource = readSource('server/soc2.ts')
    const routeSource = readSource('routes/app/soc2.access-reviews.$reviewId.tsx')

    expect(serverSource).toContain('memberName: users.name')
    expect(serverSource).toContain('memberEmail: users.email')
    expect(serverSource).toContain('eq(memberships.tenantId, access.organizationId)')
    expect(serverSource).toMatch(
      /listAccessReviewItemsFn[\s\S]*leftJoin\(users, eq\(memberships\.userId, users\.id\)\)/,
    )
    expect(routeSource).toContain("item.memberName ?? item.memberEmail ?? 'Unknown member'")
    expect(routeSource.indexOf('item.memberName ?? item.memberEmail')).toBeLessThan(
      routeSource.indexOf('User ID:'),
    )
  })

  it('manual SOC 2 evidence uses known controls instead of free-text control IDs', () => {
    const source = readSource('routes/app/soc2.evidence.tsx')

    expect(source).toContain('listControlsFn')
    expect(source).toContain('controlOptions')
    expect(source).toContain('router.invalidate()')
    expect(source).toContain('controlIsKnown')
    expect(source).toMatch(/controlIsKnown[\s\S]*presignSoc2EvidenceUploadFn/)
    expect(source).toContain('hasInvalidControlFilter')
    expect(source).toContain('clear the filter')
    expect(source).toContain('selectedControl?.controlId')
    expect(source).toContain('<select')
    expect(source).toContain('No controls available')
    expect(source).not.toContain('placeholder="CC6.1"')
  })

  it('SOC 2 audit-log evidence collection is wired into the evidence page', () => {
    const routeSource = readSource('routes/app/soc2.evidence.tsx')
    const serverSource = readSource('server/soc2.ts')

    expect(serverSource).toContain('collectAuditEvidenceFn')
    expect(serverSource).toContain('collectAuditEvidence')
    expect(serverSource).toContain('CONTROL_AUDIT_MAP')
    expect(serverSource).toContain('hasAuditEvidenceMapping')
    expect(serverSource).toContain('Object.hasOwn(CONTROL_AUDIT_MAP')
    expect(serverSource).toContain('Only administrators can collect audit evidence')
    expect(serverSource).toContain('tenantId: access.organizationId')
    expect(serverSource).toMatch(
      /collectAuditEvidenceFn[\s\S]*CONTROL_AUDIT_MAP\[data\.controlId\][\s\S]*collectAuditEvidence/,
    )
    expect(routeSource).toContain('collectAuditEvidenceFn')
    expect(routeSource).toContain('handleCollectAuditEvidence')
    expect(routeSource).toContain('selectedControl?.hasAuditEvidenceMapping')
    expect(routeSource).toContain('Collect audit evidence')
  })

  it('SOC 2 manual evidence artifacts can be downloaded from the evidence page', () => {
    const routeSource = readSource('routes/app/soc2.evidence.tsx')
    const serverSource = readSource('server/soc2.ts')

    expect(routeSource).toContain('downloadSoc2EvidenceFn')
    expect(routeSource).toContain('handleDownloadEvidence')
    expect(routeSource).toContain('Download artifact')
    expect(routeSource).toMatch(/ev\.hasArtifact[\s\S]*handleDownloadEvidence\(ev\.id\)/)
    expect(serverSource).toContain('downloadSoc2EvidenceFn')
    expect(serverSource).toContain('generatePresignedDownloadUrl')
    expect(serverSource).toContain('artifactScanStatus')
    expect(serverSource).toContain('evidenceFileScans')
    expect(serverSource).toContain("artifactScanStatus === 'clean'")
    expect(serverSource).toContain("artifactScanStatus === 'skipped'")
    expect(routeSource).toContain('Scan pending')
    expect(routeSource).toContain('Blocked')
    expect(serverSource).toMatch(
      /downloadSoc2EvidenceFn[\s\S]*eq\(soc2Evidence\.tenantId, access\.organizationId\)/,
    )
    expect(serverSource).toMatch(
      /downloadSoc2EvidenceFn[\s\S]*validateManualEvidenceFileKey\(evidence\.fileKey, access\.organizationId\)/,
    )
  })

  it('SOC 2 evidence mutations refresh server data instead of keeping optimistic rows', () => {
    const source = readSource('routes/app/soc2.evidence.tsx')

    expect(source).toContain('useRouter')
    expect(source).toContain('router.invalidate()')
    expect(source).toContain('hasInvalidControlFilter')
    expect(source).toMatch(
      /hasInvalidControlFilter[\s\S]*The control in this URL is not available[\s\S]*canAdmin/,
    )
    expect(source).toMatch(/useEffect\(\(\) => \{\s*setRecordError\(null\);?\s*\}, \[evidence\]\);?/)
    expect(source).not.toContain("tenantId: ''")
    expect(source).not.toContain('setEvidenceRows((current) =>')
  })

  it('SOC 2 bundle export copy does not claim expiring links without expiring tokens', () => {
    const routeSource = readSource('routes/app/soc2.evidence.tsx')
    const serverSource = readSource('server/soc2.ts')
    const s3Source = readSource('lib/s3.ts')

    expect(serverSource).toContain('buildSoc2BundleDownloadUrl(result.key)')
    expect(s3Source).toContain('/api/soc2/bundles?key=')
    expect(routeSource).toContain('You must be signed in as a SOC 2 admin to download.')
    expect(routeSource).not.toContain('link valid 24 hours')
  })

  it('partner payout admin copy reflects the advertised payout minimum', () => {
    const source = readSource('routes/app/admin.partners.tsx')

    expect(source).toContain('We hold balances under $50 until the partner reaches the $50 minimum')
    expect(source).toContain('reached the $50 payout minimum')
  })

  it('vendor actions emit PHI-safe product analytics events', () => {
    const source = readSource('routes/app/compliance/program.vendors.tsx')

    expect(source).toContain('trackProductEvent')
    expect(source).toContain('const VENDOR_ANALYTICS_ROUTE = "/app/compliance/program/vendors"')
    expect(source).toMatch(
      /trackProductEvent\(['"]vendor_added['"],\s*{\s*route: VENDOR_ANALYTICS_ROUTE,\s*}\s*\)/,
    )
    expect(source).toMatch(
      /trackProductEvent\(['"]vendor_baa_recorded['"],\s*{\s*route: VENDOR_ANALYTICS_ROUTE,\s*status: ['"]active['"],\s*}\s*\)/,
    )
    for (const eventName of [
      'vendor_updated',
      'vendor_status_changed',
      'vendor_baa_evidence_downloaded',
      'vendor_baa_history_opened',
      'vendor_baa_metadata_updated',
      'vendor_filter_changed',
      'vendor_sort_changed',
      'vendor_action_failed',
    ]) {
      expect(source).toMatch(new RegExp(`trackProductEvent\\(['"]${eventName}['"]`))
    }
    const analyticsCallBlocks = source.match(/trackProductEvent\([\s\S]*?\n\s*}\)/g) ?? []
    for (const unsafeProperty of ['vendor_name:', 'signerName:', 'signerEmail:', 'website:', 'contactEmail:']) {
      for (const callBlock of analyticsCallBlocks) {
        expect(callBlock).not.toContain(unsafeProperty)
      }
    }
  })

  it('vendor BAA evidence can be downloaded from the vendor program page', () => {
    const routeSource = readSource('routes/app/compliance/program.vendors.tsx')
    const serverSource = readSource('server/program.ts')

    expect(routeSource).toContain('downloadVendorBaaEvidenceFn')
    expect(routeSource).toContain('handleDownloadBaaEvidence')
    expect(routeSource).toContain('Download evidence')
    expect(serverSource).toContain('downloadVendorBaaEvidenceFn')
    expect(serverSource).toMatch(
      /downloadVendorBaaEvidenceFn[\s\S]*innerJoin\(vendors[\s\S]*eq\(vendors\.tenantId, access\.organizationId\)/,
    )
    expect(serverSource).toMatch(
      /downloadVendorBaaEvidenceFn[\s\S]*assertVendorBaaDocumentKey\(access\.organizationId, baa\.vendorId, baa\.documentFileKey\)/,
    )
  })

  it('expired vendor BAAs count as compliance program attention', () => {
    const dashboardSource = readSource('server/program.ts')
    const programRouteSource = readSource('routes/app/compliance/program.index.tsx')
    const vendorsRouteSource = readSource('routes/app/compliance/program.vendors.tsx')

    expect(dashboardSource).toContain('listExpired')
    expect(dashboardSource).toContain('expiredBaaCount: expired.length')
    expect(programRouteSource).toContain('vendors.expiredBaaCount')
    expect(programRouteSource).toContain('expired or expiring BAAs')
    expect(vendorsRouteSource).toContain('expiredBaaCount')
    expect(vendorsRouteSource).toMatch(/vendor\.latestBaa\?\.baaState === ['"]expired['"]/)
    expect(vendorsRouteSource).toMatch(/vendor\.latestBaa\?\.baaState === ['"]expiring['"]/)
    expect(dashboardSource).toContain('selectLatestBaasByVendor')
    expect(dashboardSource).toContain('baaState: getVendorBaaState')
    expect(vendorsRouteSource).toContain('Upload the signed BAA file when you have it.')
  })

  it('training certificate evidence can be downloaded after completion', () => {
    const source = readSource('routes/app/compliance/program.training.tsx')

    expect(source).toContain('downloadTrainingCertificateFn')
    expect(source).toContain('handleDownloadCertificate')
    expect(source).toContain('canDownloadCertificates')
    expect(source).toContain('record.hasCertificateFile')
    expect(source).toContain('Download certificate')
    expect(source).toMatch(
      /canDownloadCertificates[\s\S]*record\.hasCertificateFile[\s\S]*Download certificate/,
    )
  })

  it('training certificate downloads stay tenant-scoped on the server', () => {
    const source = readSource('server/program.ts')

    expect(source).toContain('downloadTrainingCertificateFn')
    expect(source).toMatch(
      /downloadTrainingCertificateFn[\s\S]*innerJoin\(trainingCourses[\s\S]*eq\(trainingCourses\.tenantId, access\.organizationId\)/,
    )
    expect(source).toMatch(
      /downloadTrainingCertificateFn[\s\S]*assertTrainingCertificateKey\(access\.organizationId, data\.recordId, record\.certificateFileKey\)/,
    )
  })

  it('task attachments expose malware scan status in storage and UI', () => {
    const serverSource = readSource('server/tasks.ts')
    const routeSource = readSource('routes/app/tasks.$taskId.tsx')

    expect(serverSource).toMatch(/avStatus:\s*mockUploadsEnabled \? 'skipped' : 'pending'/)
    expect(serverSource).toContain('dispatchAttachmentScanRequest')
    expect(routeSource).toContain('ATTACHMENT_SCAN_BADGE')
    expect(routeSource).toContain('Scan pending')
    expect(routeSource).toContain('Blocked')
    expect(routeSource).toContain('a.avStatus')
  })

  it('task attachments can only be downloaded after malware scan clearance', () => {
    const serverSource = readSource('server/tasks.ts')
    const routeSource = readSource('routes/app/tasks.$taskId.tsx')

    expect(serverSource).toContain('downloadTaskAttachmentFn')
    expect(serverSource).toContain('generatePresignedDownloadUrl')
    expect(serverSource).toMatch(
      /downloadTaskAttachmentFn[\s\S]*getTaskAttachment[\s\S]*avStatus[\s\S]*generatePresignedDownloadUrl/,
    )
    expect(routeSource).toContain('downloadTaskAttachmentFn')
    expect(routeSource).toContain('Download attachment')
    expect(routeSource).toMatch(/a\.avStatus === ['"]clean['"]/)
    expect(routeSource).not.toMatch(
      /a\.avStatus === ['"]clean['"] \|\| a\.avStatus === ['"]skipped['"]/,
    )
  })

  it('non-task evidence downloads require shared malware scan clearance', () => {
    const complianceSource = readSource('server/compliance.ts')
    const soc2Source = readSource('server/soc2.ts')
    const programSource = readSource('server/program.ts')
    const scanResultRoute = readSource('routes/api/uploads.scan-result.tsx')
    const uploadKeySource = readSource('lib/upload-keys.ts')
    const scanSchema = readProjectSource('packages/db/src/schema/evidence-file-scans.phi.ts')

    for (const source of [complianceSource, soc2Source, programSource]) {
      expect(source).toContain('recordEvidenceFileScanPending')
      expect(source).toContain('assertEvidenceFileScanClean')
      expect(source).toContain('dispatchAttachmentScanRequest')
    }

    expect(scanResultRoute).toContain('updateEvidenceFileScanResult')
    expect(scanResultRoute).toContain('getUploadKeyTarget')
    expect(uploadKeySource).toContain('EVIDENCE_UPLOAD_NAMESPACE_PREFIXES')
    expect(uploadKeySource).toContain('evidence/${organizationId}/${prefix}/')
    expect(scanSchema).toContain("'evidence_file_scans'")
    expect(scanSchema).toContain("avStatus: avStatusEnum('av_status')")
  })

  it('documents production CAPTCHA missing-secret behavior as fail-closed', () => {
    const CAPTCHASource = readSource('lib/captcha.ts')
    const runbook = readProjectSource('docs/runbooks/public-form-abuse-hardening.md')

    expect(CAPTCHASource).toContain("process.env.NODE_ENV === 'production'")
    expect(CAPTCHASource).toContain('return { success: false, bypassed: false }')
    expect(runbook).toContain('If the secret is unset in **production**, fail closed')
    expect(runbook).toContain('fail-closed with one-time warning when unset in production')
    expect(runbook).not.toContain('bypass when `CAPTCHA_SECRET_KEY` unset or `NODE_ENV=test`')
  })

  it('task attachment scan status can be refreshed without leaving the task detail page', () => {
    const routeSource = readSource('routes/app/tasks.$taskId.tsx')

    expect(routeSource).toContain('handleRefreshAttachments')
    expect(routeSource).toContain('listTaskAttachmentsFn')
    expect(routeSource).toContain('Refresh scan status')
    expect(routeSource).toMatch(
      /handleRefreshAttachments[\s\S]*listTaskAttachmentsFn\({\s*data: { taskId: task\.id }/,
    )
  })

  it('task activity includes task, comment, and attachment audit events scoped to the task', () => {
    const serverSource = readSource('server/tasks.ts')
    const routeSource = readSource('routes/app/tasks.$taskId.tsx')

    expect(serverSource).toMatch(
      /listTaskActivityFn[\s\S]*resourceType,\s*'task'[\s\S]*resourceId,\s*data\.taskId/,
    )
    expect(serverSource).toMatch(
      /listTaskActivityFn[\s\S]*resourceType,\s*'task_comment'[\s\S]*after}->>'taskId'/,
    )
    expect(serverSource).toMatch(
      /listTaskActivityFn[\s\S]*resourceType,\s*'task_attachment'[\s\S]*after}->>'taskId'/,
    )
    expect(routeSource).toContain('task.attachment.scan_completed')
    expect(serverSource).not.toContain('`${task.id}:current-status`')
    expect(serverSource).not.toContain('`${task.id}:created`')
    expect(serverSource).not.toContain('events.length === 0')
    expect(routeSource).toContain('No activity recorded yet.')
    expect(routeSource).not.toContain('Legacy static entries')
    expect(routeSource).not.toContain('all tenants have at least one audit event')
  })

  it('task attachment malware scan results have a signed callback path', () => {
    const serverSource = readSource('routes/api/uploads.scan-result.tsx')
    const scanSource = readSource('lib/attachment-scan.ts')
    const runtimeEnvSource = readSource('lib/runtime-env.ts')
    const taskDbSource = readSource('../../../packages/db/src/tasks/index.ts')
    const envExample = readSource('../../../.env.example')
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')

    expect(serverSource).toContain('handleAttachmentScanResult')
    expect(serverSource).toContain('x-phiguard-scan-signature')
    expect(serverSource).toContain('updateTaskAttachmentScanResult')
    expect(serverSource).toContain('getUploadKeyTarget')
    expect(scanSource).toContain('ATTACHMENT_SCAN_REQUEST_URL')
    expect(scanSource).toContain('ATTACHMENT_SCAN_REQUEST_SECRET')
    expect(scanSource).toContain('ATTACHMENT_SCAN_WEBHOOK_SECRET')
    expect(scanSource).toContain('x-phiguard-scan-request-signature')
    expect(runtimeEnvSource).toContain('ATTACHMENT_SCAN_REQUEST_URL')
    expect(runtimeEnvSource).toContain('ATTACHMENT_SCAN_REQUEST_SECRET')
    expect(runtimeEnvSource).toContain('ATTACHMENT_SCAN_WEBHOOK_SECRET')
    expect(taskDbSource).toContain('updateTaskAttachmentScanResult')
    expect(taskDbSource).toContain('task.attachment.scan_completed')
    for (const envName of [
      'ATTACHMENT_SCAN_REQUEST_URL',
      'ATTACHMENT_SCAN_REQUEST_SECRET',
      'ATTACHMENT_SCAN_WEBHOOK_SECRET',
    ]) {
      expect(envExample).toContain(`${envName}=`)
      expect(goLiveChecklist).toContain(`set \`${envName}\``)
    }
    expect(goLiveChecklist).toContain(
      '[x] automated regression: scanner callback signatures are verified',
    )
    expect(goLiveChecklist).toContain(
      'pnpm --filter @phiguard/web test -- src/routes/api/-uploads.scan-result.test.ts',
    )
    expect(goLiveChecklist).toContain(
      '[x] automated regression: infected attachments stay blocked from download',
    )
    expect(goLiveChecklist).toContain(
      'pnpm --filter @phiguard/web test -- src/server/tasks.test.ts',
    )
    expect(goLiveChecklist).toContain(
      '[ ] BLOCKER: verify a production infected scanner result leaves the attachment blocked from download',
    )
  })

  it('keeps lead-magnet launch docs aligned with current seed and verification scripts', () => {
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')
    const goLiveSteps = readProjectSource('docs/runbooks/go-live-step-by-step.md')
    const prodSeed = readProjectSource('apps/web/scripts/prod-seed.ts')
    const verifyLeadMagnets = readProjectSource('apps/web/scripts/verify-lead-magnets.ts')
    const webPackage = readProjectSource('apps/web/package.json')

    expect(prodSeed).toContain('runSeed')
    expect(prodSeed).toContain('seedSoc2Controls')
    expect(prodSeed).not.toMatch(/nurture|lead magnet/i)
    expect(verifyLeadMagnets).toContain('MARKETING_SITE_URL')
    expect(verifyLeadMagnets).toContain('APP_URL')
    expect(verifyLeadMagnets).not.toMatch(/Sequencer|sequenceSlug|nurture/i)

    for (const source of [goLiveChecklist, goLiveSteps]) {
      expect(source).toContain('Sequencer')
      expect(source).toContain('phiguard-fulfillment-welcome')
      expect(source).toContain('phiguard-nurture-value-1')
      expect(source).toContain('phiguard-lead-magnet-nurture')
      expect(source).not.toContain('seed:prod` so every lead magnet')
      expect(source).not.toContain('configured nurture sequence')
      expect(source).not.toContain('Seed production nurture definitions')
    }

    expect(goLiveSteps).not.toContain(
      'pnpm --filter @phiguard/web marketing:backfill -- --remote',
    )
    expect(webPackage).toContain('Legacy marketing backfill has been removed; use Sequencer.')
  })

  it('keeps root operational command docs aligned with package scripts', () => {
    const readme = readProjectSource('README.md')
    const goLiveSteps = readProjectSource('docs/runbooks/go-live-step-by-step.md')
    const migrationNumberingAdr = readProjectSource(
      'docs/adr/0017-migration-numbering-discipline.md',
    )
    const hipaaArchitectureAdr = readProjectSource('docs/adr/0002-hipaa-architecture.md')
    const marketingEmailAdr = readProjectSource('docs/adr/0016-marketing-email-architecture.md')
    const dbPackage = readProjectSource('packages/db/package.json')

    expect(dbPackage).toContain('"migrate": "drizzle-kit migrate --config=drizzle.config.ts"')
    expect(readme).toContain('pnpm --filter @phiguard/db migrate')
    expect(readme).not.toContain('pnpm --filter @phiguard/db db:migrate')
    expect(migrationNumberingAdr).toContain('pnpm --filter @phiguard/db migrate')
    expect(migrationNumberingAdr).not.toContain('pnpm --filter @phiguard/db db:migrate')
    expect(hipaaArchitectureAdr).toContain('Historical status:')
    expect(hipaaArchitectureAdr).toContain('not the current production operating model')
    expect(marketingEmailAdr).toContain('Historical status:')
    expect(marketingEmailAdr).toContain('not the current production marketing email operating model')
    expect(marketingEmailAdr).toContain('Sequencer')
    expect(marketingEmailAdr).toContain('phiguard-fulfillment-welcome')
    expect(marketingEmailAdr).toContain('phiguard-nurture-value-1')
    expect(marketingEmailAdr).toContain('phiguard-lead-magnet-nurture')
    for (const source of [readme, goLiveSteps]) {
      expect(source).not.toContain('By default this compares `HEAD~1...HEAD`, which works')
      expect(source).not.toContain('By default, `pnpm deploy:touched` compares `HEAD~1...HEAD`, which makes')
    }
  })

  it('task detail can update due dates through the calendar-aware server flow', () => {
    const serverSource = readSource('server/tasks.ts')
    const routeSource = readSource('routes/app/tasks.$taskId.tsx')

    expect(serverSource).toContain('updateDueAtFn')
    expect(serverSource).toContain('updateTaskCalendarEvent')
    expect(serverSource).toContain('updateTaskDueAtInCalendars')
    expect(routeSource).toContain('updateDueAtFn')
    expect(routeSource).toContain('handleDueAtUpdate')
    expect(routeSource).toContain('task-dueAt')
    expect(routeSource).toContain('Clear due date')
  })

  it('checklist evidence can be downloaded from the checklist detail page', () => {
    const serverSource = readSource('server/compliance.ts')
    const routeSource = readSource('routes/app/compliance/checklists.$checklistId.tsx')
    const wizardSource = routeSource.slice(
      routeSource.indexOf('function WizardView'),
      routeSource.indexOf('function ChecklistDetailPage'),
    )

    expect(serverSource).toContain('downloadChecklistEvidenceFn')
    expect(serverSource).toContain('downloadChecklistEvidence')
    expect(serverSource).toMatch(
      /downloadChecklistEvidence\(itemId: string\)[\s\S]*requireScopedChecklistItem\(itemId\)[\s\S]*generatePresignedDownloadUrl/,
    )
    expect(routeSource).toContain('downloadChecklistEvidenceFn')
    expect(routeSource).toContain('handleEvidenceDownload')
    expect(routeSource).toContain('Download evidence')
    expect(wizardSource.indexOf('currentItem.evidence')).toBeLessThan(
      wizardSource.indexOf('{canWrite && ('),
    )
  })

  it('billing exposes executed legal document downloads when legal docs are on file', () => {
    const source = readSource('routes/app/billing.tsx')

    expect(source).toContain('const currentPlan = org.plan as PublicPlanId | null')
    expect(source).toContain('value={currentPlanName}')
    expect(source).not.toContain('appPublicGuidanceCopy.billing.currentPlan} value={PLANS[selectedPlan].name')
    expect(source).toContain('downloadExecutedLegalDocumentFn')
    expect(source).toContain('handleLegalDocumentDownload')
    expect(source).toContain("documentType: 'terms'")
    expect(source).toContain("handleLegalDocumentDownload('baa')")
    expect(source).toContain('Download Terms')
    expect(source).toContain('Download BAA')
    expect(source).toMatch(
      /canManageBilling && org\.baaSignedAt && org\.termsAcceptedAt[\s\S]*Download Terms[\s\S]*Download BAA/,
    )
  })

  it('uses Stripe webhooks as the only checkout completion conversion source', () => {
    const billingRoute = readSource('routes/app/billing.tsx')
    const billingWebhook = readSource('../../../packages/billing/src/webhook.ts')

    expect(billingRoute).toContain("trackProductEvent('checkout_returned'")
    expect(billingRoute).not.toContain("trackProductEvent('checkout_completed'")
    expect(billingWebhook).toContain("captureStripeBillingAnalytics('checkout_completed'")
  })

  it('captures billing selection, document download, and failure friction without invoice details', () => {
    const billingRoute = readSource('routes/app/billing.tsx')

    expect(billingRoute).toContain("trackProductEvent('billing_plan_selected'")
    expect(billingRoute).toContain("trackProductEvent('billing_cadence_changed'")
    expect(billingRoute).toContain("trackProductEvent('billing_legal_document_downloaded'")
    expect(billingRoute).toContain("trackProductEvent('billing_legal_document_download_failed'")
    expect(billingRoute).toContain("trackProductEvent('billing_action_failed'")
    expect(billingRoute).toContain("trackProductEvent('billing_invoice_opened'")
    expect(billingRoute).not.toContain('invoice_id')
    expect(billingRoute).not.toContain('invoice_number')
  })

  it('records a single activation completion milestone when onboarding finishes', () => {
    const onboardingRoute = readSource('routes/app/onboarding.tsx')

    expect(onboardingRoute).toContain("trackProductEvent('activation_completed'")
    expect(onboardingRoute).toMatch(
      /trackProductEvent\(['"]activation_completed['"],\s*{\s*route: ['"]\/app\/onboarding['"],\s*activation_type: ['"]trial_started['"],/,
    )
  })

  it('captures signup and onboarding friction without names, emails, or legal text', () => {
    const signupRoute = readSource('routes/signup.tsx')
    const checkEmailRoute = readSource('routes/signup.check-email.tsx')
    const onboardingRoute = readSource('routes/app/onboarding.tsx')

    expect(signupRoute).toContain("trackPublicSignupEvent('signup_failed'")
    expect(signupRoute).toContain('first_touch_id')
    expect(signupRoute).toContain('SIGNUP_ATTRIBUTION_KEYS')
    expect(checkEmailRoute).toContain("trackPublicSignupEvent('signup_confirmation_resent'")
    expect(checkEmailRoute).toContain("trackPublicSignupEvent('signup_confirmation_resend_failed'")
    expect(checkEmailRoute).toContain("trackPublicSignupEvent('signup_continue_clicked'")
    expect(onboardingRoute).toContain("trackProductEvent('onboarding_plan_selected'")
    expect(onboardingRoute).toContain("trackProductEvent('onboarding_validation_failed'")
    expect(onboardingRoute).toContain("trackProductEvent('onboarding_documents_load_failed'")
    expect(onboardingRoute).toContain("trackProductEvent('onboarding_action_failed'")
    expect(onboardingRoute).toContain("trackProductEvent('onboarding_continue_clicked'")
    expect(signupRoute).not.toContain('email: email')
    expect(signupRoute).not.toContain('name: name')
    expect(onboardingRoute).not.toContain('customer_entity_name')
    expect(onboardingRoute).not.toContain('signer_name')
  })

  it('captures public auth funnel actions without submitted identity', () => {
    const login = readSource('routes/login.tsx')
    const forgotPassword = readSource('routes/forgot-password.tsx')
    const acceptInvite = readSource('routes/accept-invite.$invitationId.tsx')

    expect(login).toContain("trackPublicAuthEvent('login_started'")
    expect(login).toContain("trackPublicAuthEvent('login_completed'")
    expect(login).toContain("trackPublicAuthEvent('login_failed'")
    expect(login).toContain("trackPublicAuthEvent('login_google_started'")
    expect(login).toContain("trackPublicAuthEvent('login_google_failed'")
    expect(login).toContain("trackPublicAuthEvent('password_reset_link_clicked'")
    expect(login).toContain("trackPublicAuthEvent('signup_link_clicked'")
    expect(forgotPassword).toContain("trackPublicAuthEvent('password_reset_requested'")
    expect(forgotPassword).toContain("trackPublicAuthEvent('password_reset_request_failed'")
    expect(forgotPassword).toContain("trackPublicAuthEvent('password_reset_resent'")
    expect(forgotPassword).toContain("trackPublicAuthEvent('password_reset_resend_failed'")
    expect(forgotPassword).toContain("trackPublicAuthEvent('password_reset_email_changed'")
    expect(forgotPassword).toContain("trackPublicAuthEvent('login_link_clicked'")
    expect(acceptInvite).toContain("trackPublicAuthEvent('invite_viewed'")
    expect(acceptInvite).toContain("trackPublicAuthEvent('invite_accept_started'")
    expect(acceptInvite).toContain("trackPublicAuthEvent('invite_accept_completed'")
    expect(acceptInvite).toContain("trackPublicAuthEvent('invite_accept_failed'")
    expect(acceptInvite).toContain("trackPublicAuthEvent('invite_auth_redirect_clicked'")
    expect(acceptInvite).toContain("trackPublicAuthEvent('invite_signup_redirect_clicked'")
    expect([login, forgotPassword, acceptInvite].join('\n')).not.toContain('email:')
    expect([login, forgotPassword, acceptInvite].join('\n')).not.toContain('password:')
    expect(acceptInvite).not.toContain('invitationId:')
    expect(acceptInvite).not.toContain('invitedEmail:')
  })

  it('captures partner administration flow and friction without partner identifiers', () => {
    const source = readSource('routes/app/admin.partners.tsx')

    expect(source).toContain("trackProductEvent('partner_admin_viewed'")
    expect(source).toContain("trackProductEvent('partner_admin_filter_changed'")
    expect(source).toContain("trackProductEvent('partner_admin_search_performed'")
    expect(source).toContain("trackProductEvent('partner_admin_sort_changed'")
    expect(source).toContain("trackProductEvent('partner_admin_exported'")
    expect(source).toContain("trackProductEvent('partner_admin_empty_state_viewed'")
    expect(source).toContain("trackProductEvent('partner_admin_payout_run_started'")
    expect(source).toContain("trackProductEvent('partner_admin_payout_run_completed'")
    expect(source).toContain("trackProductEvent('partner_admin_payout_run_failed'")
    expect(source).toContain("trackProductEvent('partner_admin_partner_approved'")
    expect(source).toContain("trackProductEvent('partner_admin_partner_approve_failed'")
    expect(source).toContain("trackProductEvent('partner_admin_payout_marked_paid'")
    expect(source).toContain("trackProductEvent('partner_admin_payout_mark_paid_failed'")
    expect(source).toContain("trackProductEvent('partner_admin_access_denied_viewed'")
    expect(source).toContain("trackProductEvent('partner_admin_load_retry_clicked'")
    expect(source).not.toContain('partner_id')
    expect(source).not.toContain('external_reference')
    expect(source).not.toContain('partner_email')
  })

  it('captures public partner funnel actions without submitted identity or referral codes', () => {
    const login = readSource('routes/partner.login.tsx')
    const referral = readSource('routes/partner.$code.tsx')
    const verify = readSource('routes/partner.verify.tsx')
    const dashboard = readSource('routes/partner.dashboard.tsx')

    expect(login).toContain("trackPublicPartnerEvent('partner_magic_link_requested'")
    expect(login).toContain("trackPublicPartnerEvent('partner_magic_link_request_failed'")
    expect(login).toContain("trackPublicPartnerEvent('partner_magic_link_check_email_viewed'")
    expect(login).toContain("trackPublicPartnerEvent('partner_login_error_viewed'")
    expect(referral).toContain("capturePublicProductAnalyticsEvent({")
    expect(referral).toContain("eventName: 'partner_referral_opened'")
    expect(verify).toContain("eventName: 'partner_magic_link_verified'")
    expect(verify).toContain("eventName: 'partner_magic_link_verify_failed'")
    expect(dashboard).toContain("trackPublicPartnerEvent('partner_dashboard_viewed'")
    expect(dashboard).toContain("trackPublicPartnerEvent('partner_dashboard_empty_state_viewed'")
    expect(dashboard).toContain("trackPublicPartnerEvent('partner_dashboard_error_viewed'")
    expect(dashboard).toContain("trackPublicPartnerEvent('partner_dashboard_retry_clicked'")
    expect([login, referral, verify, dashboard].join('\n')).not.toContain('email:')
    expect([login, referral, verify, dashboard].join('\n')).not.toContain('referral_code')
    expect([login, referral, verify, dashboard].join('\n')).not.toContain('partner_id')
    expect(verify).not.toContain('properties: { token')
  })

  it('captures shared app error boundaries without raw errors', () => {
    const routeBoundary = readSource('components/compliance-error-boundary.tsx')
    const fallback = readSource('components/error-fallback.tsx')

    expect(routeBoundary).toContain("trackProductEvent('app_error_boundary_viewed'")
    expect(routeBoundary).toContain("trackProductEvent('app_error_retry_clicked'")
    expect(fallback).toContain("trackProductEvent('app_error_boundary_viewed'")
    expect(fallback).toContain("trackProductEvent('app_error_retry_clicked'")
    expect([routeBoundary, fallback].join('\n')).not.toContain('raw_error')
    expect([routeBoundary, fallback].join('\n')).not.toContain('properties: { message')
    expect([routeBoundary, fallback].join('\n')).not.toContain('properties: { stack')
  })

  it('keeps the PostHog dashboard plan aligned with the product analytics event taxonomy', () => {
    const dashboardPlan = readProjectSource('docs/posthog-startup-dashboards.md')
    const dashboardManifest = JSON.parse(
      readProjectSource('docs/posthog-dashboard-manifest.json'),
    ) as {
      dashboards: Array<{
        name: string
        tiles: Array<{ title: string; events: string[] }>
      }>
    }
    const productionAnalyticsSources = [
      ...collectFiles(resolve(root, 'routes')).filter(
        (file) => !/\.(test|spec)\.[cm]?[jt]sx?$/.test(file),
      ),
      ...collectFiles(resolve(root, 'components')).filter(
        (file) => !/\.(test|spec)\.[cm]?[jt]sx?$/.test(file),
      ),
      ...collectFiles(resolve(workspaceRoot, 'apps/marketing/src')).filter(
        (file) => !/\.(test|spec)\.[cm]?[jt]sx?$/.test(file),
      ),
      ...collectFiles(resolve(workspaceRoot, 'packages/billing/src')).filter(
        (file) => !/\.(test|spec)\.[cm]?[jt]sx?$/.test(file),
      ),
    ]
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n')

    for (const eventName of [
      'feature_gate_viewed',
      'feature_gate_upgrade_clicked',
      'file_upload_completed',
      'file_upload_failed',
      'integration_callback_completed',
      'integration_callback_failed',
      'compliance_dashboard_viewed',
      'compliance_dashboard_section_opened',
      'compliance_program_dashboard_viewed',
      'compliance_program_section_opened',
      'soc2_controls_viewed',
      'soc2_controls_filter_changed',
      'soc2_controls_search_performed',
      'soc2_controls_sort_changed',
      'soc2_control_evidence_opened',
      'soc2_auditor_viewed',
    ]) {
      expect(dashboardPlan).toContain(`- \`${eventName}\``)
    }

    expect(dashboardManifest.dashboards.map((dashboard) => dashboard.name)).toEqual([
      'PHIGuard - Founder Weekly Health',
      'PHIGuard - Acquisition & Conversion',
      'PHIGuard - Activation & Time to Value',
      'PHIGuard - Product Engagement & Retention',
      'PHIGuard - Revenue & Billing Health',
      'PHIGuard - Analytics Data Quality',
    ])
    const manifestEvents = new Set(
      dashboardManifest.dashboards.flatMap((dashboard) =>
        dashboard.tiles.flatMap((tile) => tile.events),
      ),
    )
    for (const eventName of APPROVED_PRODUCT_ANALYTICS_EVENTS) {
      expect(manifestEvents).toContain(eventName)
    }
    for (const eventName of [
      'lead_captured',
      'signup_completed',
      'trial_started',
      'app_page_viewed',
      'feature_gate_upgrade_clicked',
      'app_support_link_clicked',
      'file_upload_failed',
      'integration_callback_failed',
      'policy_action_failed',
      'soc2_controls_search_performed',
      'checkout_completed',
      'subscription_cancelled',
    ]) {
      expect(manifestEvents).toContain(eventName)
    }
    for (const eventName of manifestEvents) {
      expect(productionAnalyticsSources).toMatch(
        new RegExp(`['"]${eventName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`),
      )
    }

    expect(dashboardPlan).toContain('Feature-gate friction')
    expect(dashboardPlan).toContain('Upload pipeline health')
    expect(dashboardPlan).toContain('Integration callback health')
    expect(dashboardPlan).toContain('Compliance and SOC 2 exploration')
  })

  it('does not describe best-effort calendar sync or risk-item import as stronger than implemented', () => {
    const integrationsSource = readSource('routes/app/settings.integrations.tsx')
    const riskSource = readSource('routes/app/compliance/program.risk.tsx')

    expect(integrationsSource).toContain('Calendar updates can fail on their own without affecting your tasks')
    expect(riskSource).toContain('Name the assessment first, then add risk items to it.')
    expect(riskSource).not.toContain('adding or importing risk items')
  })

  it('help surfaces do not duplicate fallback topics or link inactive first-run steps', () => {
    const source = readSource('components/help-guidance.tsx')

    expect(source).toContain('const relatedTopicIds = help?.relatedTopicIds ?? fallbackTopicIds')
    expect(source).toContain('const uniqueRelatedTopicIds = [...new Set(relatedTopicIds)]')
    expect(source).toContain('uniqueRelatedTopicIds.map((topicId)')
    expect(source).not.toContain('!help &&')
    expect(source).not.toContain('fallbackTopics.map')
    expect(source).toContain('step.active ? (')
    expect(source).toContain('<Link')
    expect(source).toContain('<div')
    expect(source).toContain('aria-disabled="true"')
  })

  it('operational docs do not describe completed app surfaces as unfinished', () => {
    const legalRunbook = readProjectSource('docs/runbooks/customer-legal-acceptance.md')
    const roadmap = readProjectSource('docs/roadmap.md')
    const claude = readProjectSource('CLAUDE.md')
    const envExample = readProjectSource('.env.example')
    const verification = readProjectSource('docs/roadmap-verification.md')
    const prodBugReport = readProjectSource('docs/qa/prod-e2e-bug-report-2026-05-07.md')
    const safeguards = readProjectSource('docs/hipaa/safeguards-map.md')
    const riskAnalysis = readProjectSource('docs/hipaa/risk-analysis-template.md')
    const threatModel = readProjectSource('docs/hipaa/threat-model.md')
    const vendors = readProjectSource('docs/hipaa/vendors.md')
    const accessReview = readProjectSource('docs/hipaa/access-review.md')
    const incidentResponse = readProjectSource('docs/runbooks/incident-response.md')
    const breachDecisionTree = readProjectSource('docs/runbooks/breach-decision-tree.md')
    const keyRotation = readProjectSource('docs/runbooks/key-rotation.md')
    const databaseRestore = readProjectSource('docs/runbooks/database-restore.md')
    const calendarIntegrations = readProjectSource('docs/runbooks/integrations-calendar.md')
    const phaseTwoEvidence = readProjectSource('docs/hipaa/phase-2-evidence.md')
    const officers = readProjectSource('docs/hipaa/officers.md')
    const goLiveSteps = readProjectSource('docs/runbooks/go-live-step-by-step.md')
    const goLiveSimple = readProjectSource('docs/runbooks/go-live-dumbed-down.md')
    const goLiveChecklist = readProjectSource('docs/runbooks/go-live-checklist.md')
    const riskRegister = readProjectSource('docs/hipaa/risk-analysis-register-2026.md')
    const soc2Readme = readProjectSource('docs/soc2/README.md')
    const albWafAdr = readProjectSource('docs/adr/0010-alb-waf-provisioning.md')
    const marketingStrategy = readProjectSource('docs/marketing/phiguard.md')
    const legacyAuditExportScriptPath = resolve(workspaceRoot, 'apps/web/scripts/export-audit-logs.js')

    expect(legalRunbook).toContain('billing page exposes self-serve downloads')
    expect(legalRunbook).not.toContain(
      'customer self-serve document download is not yet documented as a stable billing or settings UI flow',
    )
    expect(legalRunbook).not.toContain('until a self-serve UI is finalized')

    expect(roadmap).not.toContain('dashboard stub')
    expect(roadmap).not.toContain('placeholder homepage')
    expect(roadmap).not.toContain('status page stub')
    expect(roadmap).not.toContain('## Phase 3 - Expansion (post-launch)')
    expect(roadmap).toContain('## Phase 3 - Expansion Tracks')
    expect(roadmap).toContain('Several Phase 3 expansion tracks are already implemented')
    expect(roadmap).toContain('Current status is reconciled in `docs/roadmap-verification.md`')
    expect(roadmap).not.toContain('Sequencing flexible - driven by early customer demand signals.')
    expect(roadmap).not.toContain('pricing-breakdowns, listicles')
    expect(roadmap).toContain('Legacy `pricing-breakdowns` and `listicles` URLs redirect')
    expect(roadmap).not.toContain(
      'authenticated product analytics stays disabled by default',
    )
    expect(readProjectSource('wrangler.jsonc')).toContain(
      '"PRODUCT_ANALYTICS_ENABLED": "true"',
    )
    expect(claude).not.toContain('PostHog is allowed on `apps/marketing` only.')
    expect(claude).toContain('same-origin `/api/analytics/product` proxy')
    expect(envExample).toContain('PRODUCT_ANALYTICS_ENABLED=')
    expect(envExample).toContain('VITE_POSTHOG_KEY=')
    expect(envExample).toContain('VITE_POSTHOG_HOST=')
    expect(envExample).toContain('PUBLIC_POSTHOG_KEY=')
    expect(envExample).toContain('PUBLIC_POSTHOG_HOST=')

    expect(verification).not.toContain('Repo-wide `@phiguard/web` typecheck remains red')
    expect(verification).not.toContain('pre-existing route/export/SOC2 issues')
    expect(verification).not.toContain(
      'Current targeted checks green; repo-wide sweep still requires a fresh final gate',
    )
    expect(verification).not.toContain(
      'Fresh `pnpm --filter @phiguard/web typecheck` runs completed successfully',
    )
    expect(verification).toContain('Repo-wide lint/typecheck/test green')
    expect(verification).toContain('`pnpm lint`')
    expect(verification).toContain('`pnpm typecheck`')
    expect(verification).toContain('`pnpm test`')
    expect(verification).toContain('`git diff --check`')
    expect(prodBugReport).not.toContain('Attachment download/open remains an unverified capability')

    expect(safeguards).not.toContain('legacy cloud provider data center procedures')
    expect(safeguards).not.toContain('RDS automated backups')
    expect(safeguards).not.toContain('CloudWatch')
    expect(safeguards).not.toContain('All data in RDS')
    expect(safeguards).not.toContain('legacy object-lock audit export')
    expect(safeguards).not.toContain('bcrypt hashing')
    expect(safeguards).not.toContain('TLS 1.2+ at ALB')
    expect(safeguards).toContain('WebCrypto PBKDF2-SHA-256 password hashing')
    expect(safeguards).not.toContain('legacy runtime provider')
    expect(safeguards).toContain('packages/db/src/schema/users.phi.ts')
    expect(safeguards).toContain('packages/db/src/schema/legal-acceptances.phi.ts')
    expect(safeguards).toContain('packages/db/src/schema/vendor-baas.phi.ts')
    expect(safeguards).toContain('packages/db/src/schema/training-records.phi.ts')
    expect(safeguards).toContain('packages/compliance/src/schema/incidents.phi.ts')

    for (const source of [riskAnalysis, threatModel]) {
      expect(source).not.toContain('legacy cloud provider ECS Fargate')
      expect(source).not.toContain('RDS Postgres')
      expect(source).not.toContain('RDS automated backups')
      expect(source).not.toContain('legacy object-storage audit export')
      expect(source).not.toContain('object-lock retention')
      expect(source).not.toContain('TLS 1.2+ at ALB')
      expect(source).not.toContain('CloudWatch')
      expect(source).not.toContain('apps/web/src/server/object storage.ts')
    }

    expect(riskAnalysis).not.toContain('legacy runtime provider')
    expect(riskAnalysis).not.toContain('R2')
    expect(riskAnalysis).toContain('Managed PostgreSQL')
    expect(threatModel).not.toContain('R2-backed signed URLs')
    expect(threatModel).toContain('x-phiguard-scan-signature')
    expect(vendors).toContain('Attachment malware scanner')
    expect(vendors).not.toContain('R2 bucket/key metadata')

    expect(accessReview).not.toContain('application runtime account access')
    expect(accessReview).not.toContain('R2 evidence bucket access')
    expect(accessReview).toContain('database-provider access')
    expect(accessReview).not.toContain('legacy cloud provider Infrastructure Access')
    expect(accessReview).not.toContain('legacy cloud provider IAM')
    expect(accessReview).not.toContain('object-storage audit bucket')
    expect(accessReview).not.toContain('SSM Session Manager')

    expect(incidentResponse).not.toContain('application runtime account')
    expect(incidentResponse).not.toContain('R2 bucket')
    expect(incidentResponse).toContain('managed PostgreSQL')
    expect(incidentResponse).not.toContain('CloudWatch')
    expect(incidentResponse).not.toContain('legacy cloud provider access key')
    expect(incidentResponse).not.toContain('RDS snapshot')
    expect(incidentResponse).not.toContain('object-storage bucket')
    expect(incidentResponse).not.toContain('ECS task')

    expect(breachDecisionTree).toContain('managed PostgreSQL provider encryption')
    expect(breachDecisionTree).not.toContain('legacy object storage encryption')
    expect(breachDecisionTree).not.toContain('TLS 1.2+ at legacy runtime provider edge')
    expect(breachDecisionTree).not.toContain('RDS KMS')
    expect(breachDecisionTree).not.toContain('object-storage encryption')
    expect(breachDecisionTree).not.toContain('ALB')
    expect(breachDecisionTree).not.toContain('KMS CMK')
    expect(breachDecisionTree).not.toContain('legacy cloud provider Support')

    expect(keyRotation).not.toContain('legacy runtime provider secrets')
    expect(keyRotation).toContain('Managed PostgreSQL credential')
    expect(keyRotation).not.toContain('runtime secret set')
    expect(keyRotation).not.toContain('legacy cloud provider secretsmanager put-secret-value')
    expect(keyRotation).not.toContain('legacy cloud provider ecs update-service')
    expect(keyRotation).not.toContain('alias/phiguard-rds-prod')

    expect(databaseRestore).toContain('Managed PostgreSQL Restore')
    expect(databaseRestore).not.toContain('legacy database connector')
    expect(databaseRestore).not.toContain('pnpm deploy:web')
    expect(databaseRestore).not.toContain('legacy cloud provider rds restore-db-instance-from-db-snapshot')
    expect(databaseRestore).not.toContain('Secrets Manager')
    expect(databaseRestore).not.toContain('ECS service')

    expect(albWafAdr).toContain('Historical status:')
    expect(albWafAdr).toContain('not the current production edge security model')
    expect(albWafAdr).not.toContain('edge controls')

    expect(calendarIntegrations).toContain('application-level token encryption')
    expect(calendarIntegrations).not.toContain('RDS KMS')

    expect(verification).not.toContain('legacy cloud provider Artifact')
    expect(verification).not.toContain('CloudWatch')
    expect(phaseTwoEvidence).not.toContain('legacy cloud provider Artifact')
    expect(phaseTwoEvidence).not.toContain('CloudWatch')
    expect(phaseTwoEvidence).not.toContain('removed CI workflow')
    expect(phaseTwoEvidence).toContain('Sentry/application alerts')
    expect(phaseTwoEvidence).toContain('apps/web/src/lib/sentry.ts')
    expect(phaseTwoEvidence).not.toContain('apps/web/src/lib/sentry.server.ts')
    expect(threatModel).not.toContain('OSV Scanner on every push and nightly')
    expect(threatModel).toContain('OSV scanning are not yet present')
    expect(threatModel).toContain('apps/web/src/lib/sentry.ts')
    expect(threatModel).not.toContain('apps/web/src/lib/sentry.server.ts')
    expect(goLiveSimple).not.toContain('Worker GitHub Builds')
    expect(goLiveSimple).not.toContain('Connect The Worker To GitHub Builds')
    expect(goLiveChecklist).toContain('set `DIRECT_UPLOAD_SECRET`')
    expect(goLiveSteps).toContain('apps/web/src/lib/sentry.ts')
    expect(goLiveSteps).not.toContain('apps/web/src/lib/sentry.server.ts')
    expect(existsSync(legacyAuditExportScriptPath)).toBe(false)

    expect(soc2Readme).toContain("requireFeatureForOrg(org, 'soc2_evidence')")
    expect(soc2Readme).not.toContain('JSON → object storage')
    expect(soc2Readme).not.toContain("requireFeature(org.plan, 'soc2_evidence')")
    expect(soc2Readme).not.toContain('removed infrastructure directory/')

    expect(officers).toContain('Privacy Officer: Angel')
    expect(officers).toContain('Security Officer: Angel')
    expect(officers).not.toContain('[assign before launch]')
    expect(accessReview).toContain('Security Officer - Angel')
    expect(safeguards).toContain('Security Officer assigned in `docs/hipaa/officers.md`')
    expect(threatModel).toContain('Review owner:** Security Officer - Angel')
    expect(threatModel).not.toContain('Risk analysis not yet completed')
    expect(safeguards).toContain('docs/hipaa/risk-analysis-register-2026.md')
    expect(safeguards).not.toContain('Complete risk analysis using template')
    expect(safeguards).not.toContain('Verify session inactivity timeout in production smoke tests')
    expect(riskRegister).toContain('Status: COMPLETED')
    expect(riskRegister).toContain('Security Officer: Angel')
    expect(riskRegister).not.toContain('legacy application runtime')
    expect(riskRegister).not.toContain('legacy object storage')
    expect(riskRegister).not.toContain('Hyperdrive')
    expect(riskRegister).toContain('Managed PostgreSQL')
    expect(riskRegister).not.toContain('removed CI workflow')
    expect(riskRegister).toContain('Manual `pnpm audit` output')
    expect(riskRegister).toContain(
      'Automated scanner request, callback signature, and infected-download regressions are implemented locally',
    )
    expect(riskRegister).toContain(
      'Production scanner dispatch, callback, clean sample, and infected sample smoke evidence remains required',
    )
    expect(riskRegister).not.toContain('[L/M/H]')
    expect(riskRegister).not.toContain('[owner]')
    expect(riskRegister).not.toContain('[OPEN/IN PROGRESS/COMPLETE]')
    expect(goLiveChecklist).toContain('[x] HIPAA risk analysis register is completed')
    expect(incidentResponse).toContain('Security Officer: Angel')
    expect(incidentResponse).not.toContain('ROLE: Security Officer - TBD')
    expect(incidentResponse).not.toContain('ROTATION - TBD')
    expect(breachDecisionTree).toContain('| Security Officer')
    expect(breachDecisionTree).toContain('| Angel (`@angel`)')
    expect(breachDecisionTree).not.toContain('ROLE: Legal Counsel - TBD')
    expect(goLiveChecklist).toContain(
      '[x] officers and operational placeholders are filled in docs',
    )
    expect(safeguards).not.toContain('Implement break-glass IAM role')
    expect(safeguards).not.toContain('not yet evaluated')
    expect(safeguards).not.toContain('runtime and database-provider break-glass access')
    expect(safeguards).toContain('Reconfirm Resend remains PHI-free')
    expect(marketingStrategy).not.toContain('current live pricing page presents')
    expect(marketingStrategy).not.toContain('The biggest missing lead magnets')
    expect(marketingStrategy).toContain(
      'Current canonical pricing is maintained from `packages/billing/src/plans.ts` and generated `apps/marketing/public/pricing.txt`.',
    )
    expect(marketingStrategy).not.toContain('Compliance Ops $1679/mo')
    expect(marketingStrategy).toContain('now exist in the repository')
  })

  it('does not embed third-party feedback widgets in authenticated app routes', () => {
    const source = readSource('routes/app.tsx')

    expect(source).not.toContain('widgets.example.com')
    expect(source).not.toContain('data-widget="feedback-button"')
  })
})
