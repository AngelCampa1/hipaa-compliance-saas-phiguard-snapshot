# PHIGuard PostHog Startup Dashboards

PostHog project: `Phiguard` (`397280`).

This dashboard set is designed for a weekly founder operating review. It favors a small number
of activation, engagement, billing, and data-quality panels over a broad analytics warehouse.
The reviewable dashboard source of truth is `docs/posthog-dashboard-manifest.json`; keep it aligned
with the live PostHog dashboards when the PostHog API key has dashboard access.
Run `pnpm posthog:dashboards:validate` before changing analytics events or dashboard tiles. To
check the manifest dashboard IDs against live PostHog, set `POSTHOG_PERSONAL_API_KEY` with
`dashboard:read`, plus `POSTHOG_ENVIRONMENT_ID` when it differs from the manifest project id, then
run `pnpm posthog:dashboards:validate:live`.
Run `pnpm posthog:dashboards:sync:dry-run` to preview the API operations that would update
dashboard names/descriptions and upsert one PostHog insight per manifest tile. To apply the sync,
set `POSTHOG_PERSONAL_API_KEY` with `dashboard:write`, `insight:read`, and `insight:write`, confirm
`POSTHOG_HOST` and `POSTHOG_ENVIRONMENT_ID`, then run `pnpm posthog:dashboards:sync`.

## Dashboards

- `PHIGuard - Founder Weekly Health` (`1556997`): qualified visitors, CTA rate, activated organizations/users, WAO/MAO proxy, billing risk, exceptions, CSP issues, and tracking coverage.
- `PHIGuard - Acquisition & Conversion` (`1556999`): pageviews, unique visitors, landing pages, CTA clicks, pricing CTA clicks by plan, lead capture, and partner application coverage.
- `PHIGuard - Activation & Time to Value` (`1557000`): signup, plan selection, legal acceptance, BAA, trial start, and first core action coverage.
- `PHIGuard - Product Engagement & Retention` (`1557001`): WAO/MAO proxy, dashboard/app sessions, activated org/user trend, and core workflow action mix.
- `PHIGuard - Revenue & Billing Health` (`1557002`): checkout, trial, plan/cadence mix, billing portal opens, payment failures, past-due state, cancellations, and safe revenue amounts.
- `PHIGuard - Analytics Data Quality` (`1557003`): event volume, person and organization identity events, last-seen timestamps, acquisition/product/billing coverage, exceptions, and CSP violations.

## Event Dependencies

Live marketing events today:

- `marketing_page_viewed`
- `cta_clicked`
- `pricing_cta_clicked`
- `pricing_billing_toggled`
- `lead_popup_shown`
- `lead_popup_eligible`
- `lead_popup_suppressed`
- `lead_popup_dismissed`
- `lead_popup_close_clicked`
- `lead_popup_escape_closed`
- `lead_popup_backdrop_closed`
- `lead_popup_submitted`
- `lead_capture_started`
- `lead_capture_abandoned`
- `lead_magnet_choice_changed`
- `lead_capture_validation_failed`
- `lead_capture_submitted`
- `lead_captured`
- `lead_capture_failed`
- `form_retry_clicked`
- `internal_content_link_clicked`
- `article_read_progressed`
- `toc_link_clicked`
- `faq_opened`
- `source_link_clicked`
- `resource_download_clicked`
- `resource_resend_clicked`
- `post_capture_trial_cta_clicked`
- `dead_click_detected`
- `rapid_click_detected`
- `assistant_opened`
- `assistant_load_failed`
- `analytics_consent_updated`
- `mailto_clicked`
- `nav_link_clicked`
- `footer_link_clicked`
- `resource_link_clicked`
- `routing_card_clicked`
- `outbound_link_clicked`
- `post_capture_trial_cta_clicked`

Coded product and billing events require authenticated organization context. Product events also require `PRODUCT_ANALYTICS_ENABLED=true` and `VITE_POSTHOG_KEY`; the production Worker defaults the product proxy off until PHI-safe analytics processing is explicitly approved.

- `plan_selected`
- `onboarding_plan_selected`
- `onboarding_validation_failed`
- `onboarding_documents_load_failed`
- `onboarding_action_failed`
- `onboarding_continue_clicked`
- `legal_terms_accepted`
- `baa_signed`
- `trial_started`
- `app_session_started`
- `app_page_viewed`
- `app_navigation_clicked`
- `app_nav_section_toggled`
- `app_account_menu_opened`
- `app_account_action_clicked`
- `app_support_link_clicked`
- `app_task_create_opened`
- `app_help_opened`
- `app_organization_switched`
- `app_action_blocked`
- `app_support_session_started`
- `app_support_message_sent`
- `app_support_response_received`
- `app_support_escalated`
- `app_support_error_shown`
- `feature_gate_viewed`
- `feature_gate_upgrade_clicked`
- `app_error_boundary_viewed`
- `app_error_retry_clicked`
- `dashboard_viewed`
- `task_created`
- `task_empty_state_viewed`
- `task_completed`
- `task_assigned`
- `task_comment_added`
- `task_attachment_added`
- `task_list_viewed`
- `task_create_started`
- `task_filter_changed`
- `task_search_performed`
- `task_sort_changed`
- `task_page_changed`
- `task_selection_changed`
- `task_action_failed`
- `task_bulk_status_changed`
- `task_bulk_assigned`
- `task_status_changed`
- `task_due_date_updated`
- `task_updated`
- `task_archived`
- `checklist_assigned`
- `checklist_item_completed`
- `checklist_item_reopened`
- `checklist_evidence_uploaded`
- `checklist_evidence_downloaded`
- `checklist_completed`
- `checklist_archived`
- `checklist_location_filter_changed`
- `checklist_renamed`
- `checklist_deleted`
- `checklist_action_failed`
- `file_upload_completed`
- `file_upload_failed`
- `compliance_dashboard_viewed`
- `compliance_dashboard_section_opened`
- `compliance_program_dashboard_viewed`
- `compliance_program_section_opened`
- `incident_created`
- `incident_closed`
- `incident_updated`
- `incident_status_changed`
- `incident_update_added`
- `incident_list_viewed`
- `incident_report_started`
- `incident_filter_changed`
- `incident_search_performed`
- `incident_sort_changed`
- `incident_empty_state_viewed`
- `incident_exported`
- `policy_acknowledged`
- `policy_created`
- `policy_published`
- `policy_draft_updated`
- `policy_version_created`
- `policy_archived`
- `policy_restored`
- `policy_action_failed`
- `training_record_completed`
- `training_exported`
- `training_course_created`
- `training_course_status_changed`
- `training_assigned`
- `training_certificate_downloaded`
- `training_unassigned`
- `training_completion_reopened`
- `training_due_date_updated`
- `training_reassigned`
- `risk_assessment_created`
- `risk_item_created`
- `risk_item_updated`
- `risk_item_deleted`
- `risk_assessment_status_changed`
- `risk_assessment_reopened`
- `risk_assessment_renamed`
- `risk_assessment_deleted`
- `vendor_added`
- `vendor_baa_recorded`
- `vendor_updated`
- `vendor_status_changed`
- `vendor_baa_evidence_downloaded`
- `vendor_baa_history_opened`
- `vendor_baa_metadata_updated`
- `vendor_filter_changed`
- `vendor_sort_changed`
- `vendor_action_failed`
- `member_invited`
- `member_role_changed`
- `member_removed`
- `member_action_failed`
- `member_role_change_dialog_opened`
- `member_role_change_cancelled`
- `member_remove_dialog_opened`
- `member_remove_cancelled`
- `member_settings_retry_clicked`
- `invitation_resent`
- `invitation_cancelled`
- `invitation_link_opened`
- `location_created`
- `location_updated`
- `location_status_changed`
- `location_grants_updated`
- `location_action_failed`
- `location_settings_retry_clicked`
- `location_grant_update_blocked`
- `integration_connect_dialog_opened`
- `integration_connect_cancelled`
- `integration_compliance_acknowledged`
- `integration_connect_started`
- `integration_connect_completed`
- `integration_connect_failed`
- `integration_callback_completed`
- `integration_callback_failed`
- `integration_settings_load_failed`
- `integration_settings_retry_clicked`
- `integration_revoke_started`
- `integration_revoked`
- `integration_revoke_failed`
- `report_viewed`
- `report_exported`
- `report_export_failed`
- `report_drilldown_clicked`
- `report_sort_changed`
- `report_empty_state_viewed`
- `audit_search_performed`
- `audit_events_load_failed`
- `audit_events_retry_clicked`
- `audit_export_started`
- `audit_export_completed`
- `audit_export_failed`
- `access_reviews_viewed`
- `access_review_filter_changed`
- `access_review_sort_changed`
- `access_review_empty_state_viewed`
- `access_review_open_started`
- `access_review_open_cancelled`
- `access_review_action_failed`
- `access_review_feature_gate_viewed`
- `access_review_opened`
- `access_review_decision_recorded`
- `access_review_closed`
- `soc2_evidence_viewed`
- `soc2_evidence_filter_changed`
- `soc2_evidence_sort_changed`
- `soc2_evidence_empty_state_viewed`
- `soc2_evidence_action_failed`
- `soc2_evidence_feature_gate_viewed`
- `soc2_evidence_bundle_exported`
- `soc2_audit_evidence_collected`
- `soc2_evidence_downloaded`
- `soc2_evidence_recorded`
- `soc2_dashboard_viewed`
- `soc2_controls_viewed`
- `soc2_controls_filter_changed`
- `soc2_controls_search_performed`
- `soc2_controls_sort_changed`
- `soc2_control_evidence_opened`
- `soc2_auditor_viewed`
- `help_search_performed`
- `help_search_empty`
- `help_category_selected`
- `help_topic_opened`
- `dashboard_scope_changed`
- `dashboard_metric_clicked`
- `dashboard_action_clicked`
- `profile_viewed`
- `profile_section_started`
- `profile_display_name_updated`
- `profile_email_change_requested`
- `profile_password_updated`
- `profile_action_failed`
- `account_deletion_started`
- `account_deletion_requested`
- `security_keys_viewed`
- `security_key_enrollment_unavailable_viewed`
- `first_run_step_clicked`
- `first_run_banner_dismissed`
- `partner_admin_viewed`
- `partner_admin_filter_changed`
- `partner_admin_search_performed`
- `partner_admin_sort_changed`
- `partner_admin_exported`
- `partner_admin_empty_state_viewed`
- `partner_admin_payout_run_started`
- `partner_admin_payout_run_completed`
- `partner_admin_payout_run_failed`
- `partner_admin_partner_approved`
- `partner_admin_partner_approve_failed`
- `partner_admin_payout_marked_paid`
- `partner_admin_payout_mark_paid_failed`
- `partner_admin_access_denied_viewed`
- `partner_admin_load_retry_clicked`
- `billing_portal_opened`
- `checkout_started`
- `checkout_returned`
- `checkout_completed`
- `checkout_cancelled`
- `payment_failed`
- `subscription_past_due`
- `subscription_cancelled`
- `subscription_updated`
- `downgrade_warning_shown`
- `billing_plan_selected`
- `billing_cadence_changed`
- `billing_action_failed`
- `billing_invoice_opened`
- `billing_legal_document_downloaded`
- `billing_legal_document_download_failed`

Expected marketing conversion events that are consent-gated on the public marketing site and
may remain `coded_not_seen` until production traffic exercises them:

- `partner_application_submitted`
- `partner_application_failed`

Signup analytics now uses the product capture endpoint's public-safe signup path before an
organization exists:

- `signup_started`
- `signup_completed`
- `signup_failed`
- `signup_confirmation_resent`
- `signup_confirmation_resend_failed`
- `signup_continue_clicked`

Public auth funnel analytics uses the same unauthenticated public-safe product capture path:

- `login_started`
- `login_completed`
- `login_failed`
- `login_google_started`
- `login_google_failed`
- `password_reset_link_clicked`
- `signup_link_clicked`
- `password_reset_requested`
- `password_reset_request_failed`
- `password_reset_resent`
- `password_reset_resend_failed`
- `password_reset_email_changed`
- `login_link_clicked`
- `invite_viewed`
- `invite_accept_started`
- `invite_accept_completed`
- `invite_accept_failed`
- `invite_auth_redirect_clicked`
- `invite_signup_redirect_clicked`
- `partner_referral_opened`
- `partner_magic_link_requested`
- `partner_magic_link_request_failed`
- `partner_magic_link_check_email_viewed`
- `partner_magic_link_verified`
- `partner_magic_link_verify_failed`
- `partner_login_error_viewed`
- `partner_dashboard_viewed`
- `partner_dashboard_empty_state_viewed`
- `partner_dashboard_error_viewed`
- `partner_dashboard_retry_clicked`
- `partner_referral_link_copied`

Public marketing analytics stores first-touch attribution in local browser storage before consent
and registers it only after consent is accepted. Registered first-touch fields are limited to a
generated `first_touch_id`, landing path, referrer host, first UTM fields, and `first_touch_age_days`;
public signup/auth forwarding accepts only normalized landing paths, hostname-only referrers, and
short token-like UTM values that do not look like names, clinic labels, patient terms, phone numbers,
or email addresses.
Content journey tracking uses `internal_content_link_clicked`, `toc_link_clicked`,
`source_link_clicked`, `faq_opened`, and `article_read_progressed` with safe page/category,
destination path/category, source host, heading ID, FAQ index, and read-depth metadata. It does not
send link text, article body text, source titles, or query strings.

The public signup and auth paths use a generated anonymous `signup_*` distinct id. Public partner
portal events use a generated anonymous `public_*` distinct id. Both paths strip email, password,
name, organization, invite IDs, partner IDs, referral codes, referral URLs, redirect query strings,
raw errors, free text, and other sensitive fields before forwarding. Marketing lead and partner
application events must stay consent-gated on the public site. Do not send email, password, name,
clinic name, free text, patient data, filenames, Stripe customer IDs, invoice URLs, subscription
IDs, article body text, or non-UTM query strings to PostHog.
Authenticated product analytics allows only scalar sanitized event properties. Person profile
updates use the PostHog `$set` event with server-derived user, role, plan, and organization
properties. The app also sends a server-derived `$create_alias` handoff when a safe anonymous
`signup_*` ID exists, so pre-auth signup events and authenticated product usage can be analyzed as
one journey. Organization group identifiers are the intentional grouping exception; task, checklist,
policy, risk, training, location, user, and other operational object IDs must not be sent.

Authenticated task and incident lifecycle analytics use only normalized routes, coarse status,
priority, action, count, export format, active-filter flags, and row-count buckets. They must not
send task titles, descriptions, comments, assignee IDs, incident titles, summaries, update text,
object IDs, filenames, download URLs, names, emails, location names, or patient data.
Compliance program analytics uses the same coarse-property pattern for risk, training, policy, and
checklist actions. It must not send policy titles/body/version text, risk categories/descriptions,
mitigations, owner or trainee identifiers, course titles, certificate or evidence filenames, file
keys, download URLs, exact due dates, checklist IDs, item IDs, record IDs, assessment IDs, names,
emails, or patient data.
Help, dashboard, profile, and account-security analytics also use only coarse metadata: normalized
routes, destination routes, safe category/topic/metric IDs, status/action values, and counts. They
must not send help search queries, dashboard action text, location IDs/names, display names, email
addresses, passwords, confirmation text, or other free text.
Signup, public auth, onboarding, and billing friction analytics use only anonymous signup IDs,
opaque first-touch IDs, or authenticated organization grouping plus coarse enum/count properties.
They must not send submitted signup names or emails, passwords, invitation IDs, invited emails,
legal entity names, signer names/titles, legal document text, invoice IDs/numbers/URLs, document
filenames, raw auth or billing error messages, Stripe identifiers, or pricing free text.
Public partner portal analytics uses only anonymous public IDs, normalized partner routes, category
enums, source/status/reason/action values, destinations, and counts. It must not send submitted
partner emails, partner names, referral codes, referral URLs, partner IDs, payout IDs, payout
references, raw magic link errors, raw dashboard errors, or token values.
App shell and support analytics use only normalized routes, destination routes, action IDs,
support channel, trigger, operation, status, and error type. They must not send account display
names, emails, organization names, support draft text, support response text, mailto addresses,
session IDs, or raw support errors.
Shared app error-boundary analytics uses only normalized routes, boundary categories, retry action
IDs, status, and coarse error types. It must not send thrown error messages, component stacks,
route loader data, raw exception objects, names, emails, or patient data to PostHog.
Settings administration and report analytics use only normalized routes, provider/report enums,
role enums, action IDs, sort fields/directions, booleans, statuses, and counts. They must not send
member IDs, invitation IDs, location IDs, connection IDs, names, emails, location names/slugs,
integration account emails, report row labels, CSV contents, filenames, callback URLs, or raw
errors.
Partner administration analytics uses only normalized routes, table categories, action IDs, status
enums, sort fields/directions, row-count buckets, booleans, and payout counts. It must not send
partner IDs, partner names, partner emails, company names, referral codes, websites, payout IDs,
external payment references, CSV contents, or raw errors.

## Metric Definitions

- Qualified visitors: unique visitors with `marketing_page_viewed` in the selected period.
- CTA rate: `cta_clicked` plus `pricing_cta_clicked` divided by `marketing_page_viewed`.
- Content journey rate: `internal_content_link_clicked` divided by content page `marketing_page_viewed`.
- Content engagement depth: `article_read_progressed`, `toc_link_clicked`, `faq_opened`, and `source_link_clicked` by content page category.
- Marketing journey detail: `nav_link_clicked`, `footer_link_clicked`, `resource_link_clicked`, `routing_card_clicked`, `mailto_clicked`, `outbound_link_clicked`, `post_capture_trial_cta_clicked`, and `analytics_consent_updated`.
- Friction signals: `lead_capture_validation_failed`, `lead_capture_failed`, `form_retry_clicked`, `lead_capture_abandoned`, `dead_click_detected`, `rapid_click_detected`, and `assistant_load_failed`.
- Help friction: `help_search_empty` divided by `help_search_performed`, plus `help_topic_opened` and `help_category_selected` to identify where users seek guidance.
- Profile/account friction: `profile_action_failed`, `account_deletion_requested`, and `security_key_enrollment_unavailable_viewed`.
- Signup/auth/onboarding friction: `signup_failed`, `signup_confirmation_resend_failed`, `login_failed`, `login_google_failed`, `password_reset_request_failed`, `password_reset_resend_failed`, `invite_accept_failed`, `onboarding_validation_failed`, `onboarding_documents_load_failed`, and `onboarding_action_failed`.
- Public partner funnel friction: `partner_magic_link_request_failed`, `partner_magic_link_verify_failed`, `partner_login_error_viewed`, `partner_dashboard_empty_state_viewed`, `partner_dashboard_error_viewed`, `partner_dashboard_retry_clicked`, and `partner_referral_link_copied`.
- Billing friction: `billing_action_failed`, `billing_legal_document_download_failed`, `downgrade_warning_shown`, `checkout_cancelled`, and `billing_invoice_opened`.
- App shell/support friction: `app_action_blocked`, `app_support_error_shown`, `app_nav_section_toggled`, and `app_support_link_clicked`.
- Feature-gate friction: `feature_gate_viewed` and `feature_gate_upgrade_clicked` by `feature` and `minimum_plan` to show which plan gates create upgrade demand.
- Shared app error friction: `app_error_boundary_viewed` and `app_error_retry_clicked`.
- Settings administration friction: `member_action_failed`, `member_role_change_cancelled`, `member_remove_cancelled`, `member_settings_retry_clicked`, `location_action_failed`, `location_settings_retry_clicked`, `location_grant_update_blocked`, `integration_connect_cancelled`, `integration_settings_load_failed`, `integration_settings_retry_clicked`, and `integration_revoke_failed`.
- Integration callback health: `integration_callback_completed` and `integration_callback_failed` by `provider` and coarse `reason`, separate from UI-started connection attempts.
- Upload pipeline health: `file_upload_completed` and `file_upload_failed` by upload `category` and coarse `reason`.
- Report exploration and friction: `report_sort_changed`, `report_empty_state_viewed`, `report_export_failed`, `report_drilldown_clicked`, `audit_events_load_failed`, and `audit_events_retry_clicked`.
- Compliance and SOC 2 exploration: `compliance_dashboard_viewed`, `compliance_dashboard_section_opened`, `compliance_program_dashboard_viewed`, `compliance_program_section_opened`, `soc2_dashboard_viewed`, `soc2_controls_viewed`, `soc2_controls_filter_changed`, `soc2_controls_search_performed`, `soc2_controls_sort_changed`, `soc2_control_evidence_opened`, and `soc2_auditor_viewed`.
- Policy lifecycle health: `policy_created`, `policy_published`, `policy_acknowledged`, `policy_draft_updated`, `policy_version_created`, `policy_archived`, `policy_restored`, and `policy_action_failed`.
- Partner administration friction: `partner_admin_search_performed`, `partner_admin_empty_state_viewed`, `partner_admin_payout_run_failed`, `partner_admin_partner_approve_failed`, `partner_admin_payout_mark_paid_failed`, `partner_admin_access_denied_viewed`, and `partner_admin_load_retry_clicked`.
- First-run activation: `first_run_step_clicked` and `first_run_banner_dismissed`.
- Lead captures: `lead_capture_submitted` and `lead_captured`.
- Signup completions: `signup_completed`.
- Trial starts: `trial_started`.
- Activated organizations: organizations completing at least one core action in the last 7 days. Authenticated product events include `$groups.organization`, and the data-quality dashboard tracks `$create_alias`, `$set`, and `$groupidentify` volume to confirm anonymous-to-user, person, and organization profile coverage.
- Core actions: `task_created`, `task_empty_state_viewed`, `task_completed`, `task_bulk_status_changed`, `task_bulk_assigned`, `task_status_changed`, `task_due_date_updated`, `task_updated`, `task_archived`, `checklist_assigned`, `checklist_item_completed`, `checklist_item_reopened`, `checklist_evidence_uploaded`, `checklist_evidence_downloaded`, `checklist_completed`, `checklist_archived`, `file_upload_completed`, `compliance_dashboard_section_opened`, `compliance_program_section_opened`, `incident_created`, `incident_status_changed`, `incident_update_added`, `incident_exported`, `policy_acknowledged`, `policy_created`, `policy_published`, `policy_draft_updated`, `policy_version_created`, `policy_archived`, `policy_restored`, `training_record_completed`, `training_exported`, `training_course_created`, `training_course_status_changed`, `training_assigned`, `training_certificate_downloaded`, `training_unassigned`, `training_completion_reopened`, `training_due_date_updated`, `training_reassigned`, `risk_assessment_created`, `risk_item_created`, `risk_item_updated`, `risk_item_deleted`, `risk_assessment_status_changed`, `risk_assessment_reopened`, `risk_assessment_renamed`, `risk_assessment_deleted`, `vendor_added`, `member_invited`, `location_created`, `integration_connect_completed`, `integration_callback_completed`, `feature_gate_upgrade_clicked`, `app_account_action_clicked`, `app_task_create_opened`, `app_support_session_started`, `app_support_message_sent`, `app_support_response_received`, `app_support_escalated`, `dashboard_scope_changed`, `dashboard_metric_clicked`, `dashboard_action_clicked`, `onboarding_plan_selected`, `onboarding_continue_clicked`, `billing_plan_selected`, `billing_cadence_changed`, `first_run_step_clicked`, `first_run_banner_dismissed`, `profile_display_name_updated`, `profile_email_change_requested`, `profile_password_updated`, `profile_action_failed`, `account_deletion_requested`, `security_key_enrollment_unavailable_viewed`, `access_review_opened`, `access_review_decision_recorded`, `soc2_controls_filter_changed`, `soc2_controls_search_performed`, `soc2_control_evidence_opened`, `soc2_audit_evidence_collected`, and `soc2_evidence_recorded`.
- WAO/MAO: distinct organizations or users with app sessions, app page views, dashboard views, or core workflow events in the last 7 and 30 days.
- Billing risk: `payment_failed`, `subscription_past_due`, and `subscription_cancelled`.
- Revenue amount: safe `amount_cents` on webhook-owned `checkout_completed` and `subscription_updated`; no Stripe identifiers are captured.
- Checkout return page visibility: `checkout_returned` tracks the app return from Stripe without counting it as the authoritative conversion.
