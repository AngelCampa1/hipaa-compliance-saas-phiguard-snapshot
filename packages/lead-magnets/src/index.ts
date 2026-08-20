export const LEAD_CAPTURE_CTA_CONTEXTS = [
  "popup-exit-intent",
  "popup-scroll-mobile",
  "popup-second-page",
  "inline-content-upgrade",
  "resource-sidebar",
  "newsletter-footer",
  "thank-you-download",
] as const;

export type LeadCaptureCtaContext = (typeof LEAD_CAPTURE_CTA_CONTEXTS)[number];

export const POPUP_PAGE_CLUSTERS = [
  "risk-analysis",
  "incident-response",
  "training",
  "vendor-management",
  "compliance-operations",
  "locations",
  "practice-types",
  "commercial",
  "general",
] as const;

export type PopupPageCluster = (typeof POPUP_PAGE_CLUSTERS)[number];

export const LEAD_MAGNET_STAGES = [
  "awareness",
  "consideration",
  "decision",
] as const;

export type LeadMagnetStage = (typeof LEAD_MAGNET_STAGES)[number];

export interface LeadMagnetInlineCopy {
  eyebrow: string;
  heading: string;
  body: string;
  buttonLabel: string;
}

export interface LeadMagnetDefinition {
  slug: string;
  title: string;
  stage: LeadMagnetStage;
  popupEligible: boolean;
  pickerPriority: number;
  storageKey: string;
  inlineCopy: LeadMagnetInlineCopy;
}

export interface LeadMagnetResourceMetadata {
  author: string;
  subject: string;
  keywords: string;
  language: string;
  canonicalResourceUrl: string;
}

function buildLeadMagnet(
  slug: string,
  title: string,
  description: string,
): LeadMagnetDefinition {
  return {
    slug,
    title,
    stage:
      slug === "incident-response-plan" ||
      slug === "hipaa-software-comparison-scorecard" ||
      slug === "hipaa-budget-calculator" ||
      slug === "ocr-inquiry-readiness-packet" ||
      slug === "multi-location-compliance-rollout-plan"
        ? "decision"
        : slug === "hipaa-risk-analysis-template" ||
            slug === "vendor-baa-tracker" ||
            slug === "hipaa-pm-tool-comparison-guide" ||
            slug === "hipaa-annual-review-calendar" ||
            slug === "hipaa-task-management-maturity-scorecard" ||
            slug === "hipaa-incident-triage-worksheet" ||
            slug === "hipaa-access-review-checklist" ||
            slug === "hipaa-offboarding-checklist" ||
            slug === "hipaa-state-law-overlay-matrix" ||
            slug === "tabletop-exercise-script" ||
            slug === "minimum-necessary-decision-log" ||
            slug === "vendor-renewal-review-checklist" ||
            slug === "hipaa-evidence-binder-checklist" ||
            slug === "telehealth-compliance-workflow-checklist" ||
            slug === "access-matrix-starter-template" ||
            slug === "policy-review-calendar" ||
            slug === "hipaa-social-media-policy-template" ||
            slug === "hipaa-ai-use-policy-template" ||
            slug === "hipaa-baa-termination-checklist" ||
            slug === "hipaa-complaint-response-template" ||
            slug === "hipaa-risk-remediation-tracker" ||
            slug === "hipaa-annual-training-log" ||
            slug === "hipaa-state-law-compliance-checklist" ||
            slug === "hipaa-medical-records-retention-schedule" ||
            slug === "hipaa-staff-training-quiz-template" ||
            slug === "hipaa-ai-tool-vetting-checklist" ||
            slug === "hipaa-gap-analysis-scorecard" ||
            slug === "hipaa-workforce-sanctions-log-template" ||
            slug === "hipaa-breach-notification-letter-template" ||
            slug === "hipaa-vendor-security-questionnaire" ||
            slug === "hipaa-incident-classification-decision-tree" ||
            slug === "hipaa-annual-compliance-program-audit"
          ? "consideration"
          : "awareness",
    popupEligible: true,
    pickerPriority:
      slug === "hipaa-compliance-self-assessment"
        ? 100
        : slug === "baa-template"
          ? 90
          : slug === "hipaa-risk-analysis-template"
            ? 80
            : slug === "incident-response-plan"
              ? 75
              : slug === "vendor-baa-tracker"
                ? 70
                : slug === "hipaa-pm-tool-comparison-guide"
                  ? 65
                  : slug === "hipaa-new-hire-checklist"
                    ? 60
                    : 55,
    storageKey:
      slug === "baa-template"
        ? "lead-magnets/baa-template-pack.pdf"
        : `lead-magnets/${slug}.pdf`,
    inlineCopy: {
      eyebrow: "Free clinic resource",
      heading: title,
      body: description,
      buttonLabel: "Send me the free resource",
    },
  };
}

export const LEAD_MAGNETS: LeadMagnetDefinition[] = [
  buildLeadMagnet(
    "baa-template",
    "Free BAA Template Pack",
    "Download a practical BAA starting point plus language and review prompts your clinic can use immediately.",
  ),
  buildLeadMagnet(
    "hipaa-breach-decision-tree",
    "HIPAA Breach Notification Decision Tree",
    "Get a plain-language decision tool for documenting whether an incident crosses the breach-notification threshold.",
  ),
  buildLeadMagnet(
    "hipaa-new-hire-checklist",
    "HIPAA New Hire Compliance Checklist",
    "Start workforce onboarding with a checklist small clinics can actually use during the first week.",
  ),
  buildLeadMagnet(
    "hipaa-compliance-self-assessment",
    "HIPAA Compliance Self-Assessment",
    "Download a practical self-assessment to spot the biggest control and workflow gaps before they become fire drills.",
  ),
  buildLeadMagnet(
    "hipaa-risk-analysis-template",
    "HIPAA Risk Analysis Worksheet",
    "Use a structured worksheet to document threats, current safeguards, and the follow-up work your clinic should prioritize.",
  ),
  buildLeadMagnet(
    "hipaa-pm-tool-comparison-guide",
    "HIPAA PM Tool Comparison Guide",
    "Compare task platforms through the lens that matters for clinics: BAA access, auditability, notification risk, and operating overhead.",
  ),
  buildLeadMagnet(
    "vendor-baa-tracker",
    "Vendor BAA Tracker",
    "Track which vendors have a signed BAA, which still need review, and where contract follow-up is stalled.",
  ),
  buildLeadMagnet(
    "incident-response-plan",
    "HIPAA Incident Response Plan Template",
    "Download a plan template for assigning roles, documenting timelines, and keeping breach-response work moving under pressure.",
  ),
  buildLeadMagnet(
    "hipaa-release-form-template",
    "HIPAA Authorization and Release Form Template",
    "Download a customizable authorization form template that meets the required elements under 45 CFR 164.508.",
  ),
  buildLeadMagnet(
    "hipaa-baa-template-clinic",
    "HIPAA BAA Template for Small Clinics",
    "Download a clinic-ready business associate agreement template with the required content under 45 CFR 164.308(b) and 164.314.",
  ),
  buildLeadMagnet(
    "notice-of-privacy-practices-template",
    "HIPAA Notice of Privacy Practices Template",
    "Download an NPP template with the required content under 45 CFR 164.520 and plain-language patient-facing language.",
  ),
  buildLeadMagnet(
    "hipaa-privacy-policy-template",
    "HIPAA Privacy Policy Template",
    "Download an internal privacy policy template covering minimum necessary, access, disclosure, and patient rights under the Privacy Rule.",
  ),
  buildLeadMagnet(
    "hipaa-security-policy-template",
    "HIPAA Security Policy Template",
    "Download a Security Rule policy template covering administrative, physical, and technical safeguard requirements under 45 CFR Part 164.",
  ),
  buildLeadMagnet(
    "hipaa-authorization-form-template",
    "HIPAA Authorization Form Template",
    "Download a HIPAA-compliant authorization form with all required elements under 45 CFR 164.508 for use and disclosure of PHI.",
  ),
  buildLeadMagnet(
    "hipaa-contingency-plan-template",
    "HIPAA Contingency Plan Template",
    "Download a contingency plan template covering data backup, disaster recovery, and emergency mode operations under 45 CFR 164.308(a)(7).",
  ),
  buildLeadMagnet(
    "hipaa-employee-acknowledgement-template",
    "HIPAA Employee Acknowledgement Template",
    "Download a workforce acknowledgement form that documents staff receipt of HIPAA training, policies, and notice of sanctions.",
  ),
  buildLeadMagnet(
    "hipaa-data-backup-plan-template",
    "HIPAA Data Backup Plan Template",
    "Download a backup plan template with the required elements under 45 CFR 164.308(a)(7)(ii)(A) for protecting and restoring ePHI.",
  ),
  buildLeadMagnet(
    "hipaa-access-log-template",
    "HIPAA Access Log Template",
    "Download an access log template for documenting ePHI system access, user activity reviews, and access anomaly tracking.",
  ),
  buildLeadMagnet(
    "hipaa-annual-review-calendar",
    "HIPAA Annual Review Calendar",
    "Download a 12-month compliance calendar with tasks, cadences, owner columns, and evidence fields your clinic can run on.",
  ),
  buildLeadMagnet(
    "hipaa-task-management-maturity-scorecard",
    "HIPAA Task Management Maturity Scorecard",
    "Score your compliance program across six dimensions and identify where to focus effort to move from reactive to routine.",
  ),
  buildLeadMagnet(
    "hipaa-incident-triage-worksheet",
    "HIPAA Incident Triage Worksheet",
    "Download a structured triage worksheet for intake, the 4-factor breach risk assessment, and incident evidence logging.",
  ),
  buildLeadMagnet(
    "hipaa-access-review-checklist",
    "HIPAA Access Review Checklist",
    "Download a system-by-system access review checklist with reviewer columns, excess access logging, and termination verification.",
  ),
  buildLeadMagnet(
    "hipaa-offboarding-checklist",
    "HIPAA Offboarding Checklist",
    "Download a same-day offboarding checklist covering system revocation, device recovery, email forwarding, and final attestation.",
  ),
  buildLeadMagnet(
    "hipaa-state-law-overlay-matrix",
    "HIPAA State-Law Overlay Matrix",
    "Download a side-by-side comparison of federal HIPAA and California, Texas, and New York state law requirements for training, breach, access, and retention.",
  ),
  buildLeadMagnet(
    "hipaa-software-comparison-scorecard",
    "HIPAA Software Comparison Scorecard",
    "Download a weighted scoring matrix to evaluate HIPAA compliance software across the dimensions that matter for small clinics.",
  ),
  buildLeadMagnet(
    "hipaa-budget-calculator",
    "Small Clinic HIPAA Compliance Budget Planner",
    "Download a line-item budget template with 5, 10, and 25-staff scenarios to plan your annual compliance spend.",
  ),
  buildLeadMagnet(
    "tabletop-exercise-script",
    "HIPAA Tabletop Exercise Script for Small Clinics",
    "Download a facilitated three-scenario tabletop exercise with discussion questions, participant roles, and an after-action template.",
  ),
  buildLeadMagnet(
    "phi-workflow-audit-worksheet",
    "PHI Workflow Audit Worksheet",
    "Download a five-workflow audit grid to document where PHI moves, who can access it, and where safeguards are missing.",
  ),
  buildLeadMagnet(
    "minimum-necessary-decision-log",
    "HIPAA Minimum Necessary Decision Log",
    "Download a decision log template with pre-filled examples for five common clinic roles to document minimum necessary access determinations.",
  ),
  buildLeadMagnet(
    "vendor-renewal-review-checklist",
    "Vendor BAA Renewal Review Checklist",
    "Download a vendor renewal checklist covering BAA expiry, subprocessor changes, AI tool updates, security posture, and renewal decision.",
  ),
  buildLeadMagnet(
    "ocr-inquiry-readiness-packet",
    "OCR Inquiry Readiness Packet",
    "Download an evidence binder structure, 24-hour preservation checklist, response roles guide, and counsel handoff memo template for OCR inquiries.",
  ),
  buildLeadMagnet(
    "hipaa-evidence-binder-checklist",
    "HIPAA Evidence Binder Checklist",
    "Download a seven-section binder structure with filename conventions, document types, and a six-year retention matrix.",
  ),
  buildLeadMagnet(
    "multi-location-compliance-rollout-plan",
    "Multi-Location HIPAA Compliance Rollout Plan",
    "Download a site-by-site rollout matrix, milestone tracker, and shared versus location-specific evidence framework for multi-site clinics.",
  ),
  buildLeadMagnet(
    "telehealth-compliance-workflow-checklist",
    "Telehealth Compliance Workflow Checklist",
    "Download a pre-session setup checklist, platform BAA verification, recording policy, cross-state guidance, and quarterly review framework for telehealth.",
  ),
  buildLeadMagnet(
    "access-matrix-starter-template",
    "HIPAA Role Access Matrix Starter Template",
    "Download an access matrix with six default roles, permission levels across seven systems, and a quarterly review cadence built in.",
  ),
  buildLeadMagnet(
    "hipaa-social-media-policy-template",
    "HIPAA Social Media Policy Template",
    "Download a one-page social media policy for clinic staff covering PHI prohibitions, patient photo consent, responding to patient comments, and enforcement.",
  ),
  buildLeadMagnet(
    "hipaa-ai-use-policy-template",
    "HIPAA AI Use Policy Template",
    "Download a ready-to-adapt AI use policy for clinical staff covering approved tools, PHI prohibitions, BAA requirements, and incident reporting.",
  ),
  buildLeadMagnet(
    "hipaa-baa-termination-checklist",
    "BAA Termination Checklist",
    "Download a step-by-step checklist for ending a business associate relationship compliantly, covering access revocation, PHI return and destruction, and written certification.",
  ),
  buildLeadMagnet(
    "stark-law-self-referral-checklist",
    "Stark Law Self-Referral Checklist",
    "Download a self-assessment for physician-owned clinics to identify referral arrangements that may raise Stark Law issues, with a reference guide to statutory exceptions.",
  ),
  buildLeadMagnet(
    "hipaa-complaint-response-template",
    "HIPAA Complaint Response Template",
    "Download a complete HIPAA complaint response package: intake form, acknowledgment letter, investigation documentation, outcome notice, and corrective action tracker.",
  ),
  buildLeadMagnet(
    "hipaa-risk-remediation-tracker",
    "HIPAA Risk Remediation Tracker",
    "Download a tracker template for converting HIPAA risk analysis findings into prioritized remediation tasks with owner, due date, status, and evidence documentation.",
  ),
  buildLeadMagnet(
    "hipaa-annual-training-log",
    "HIPAA Annual Training Log Template",
    "Download an OCR audit-ready training log with attendance table, attestation fields, topics-covered checklist, and 6-year retention guidance.",
  ),
  buildLeadMagnet(
    "policy-review-calendar",
    "HIPAA Policy Review Calendar",
    "Download a 12-month policy review calendar with pre-listed Security Rule policies, owner fields, attestation deadlines, and last-review dates.",
  ),
  buildLeadMagnet(
    "hipaa-state-law-compliance-checklist",
    "HIPAA State Law Compliance Checklist",
    "Download a state-by-state checklist covering breach deadlines, additional consent requirements, mental health protections, and AG contacts for 10 key states.",
  ),
  buildLeadMagnet(
    "hipaa-medical-records-retention-schedule",
    "HIPAA Medical Records Retention Schedule",
    "Download a records retention schedule covering federal minimums, state rules for 10 key states, and secure destruction requirements.",
  ),
  buildLeadMagnet(
    "hipaa-staff-training-quiz-template",
    "HIPAA Staff Training Quiz Template",
    "Download a 15-question quiz with answer key for annual HIPAA training, covering PHI basics, minimum necessary, breach identification, and reporting obligations.",
  ),
  buildLeadMagnet(
    "hipaa-ai-tool-vetting-checklist",
    "HIPAA AI Tool Vetting Checklist",
    "Download a 25-item checklist for evaluating AI tools before allowing them to process PHI, covering BAA, data residency, encryption, access controls, and incident response.",
  ),
  buildLeadMagnet(
    "hipaa-gap-analysis-scorecard",
    "HIPAA Gap Analysis Scorecard",
    "Download a scored self-assessment across 8 HIPAA program areas with prioritized remediation output, complete in approximately 2 hours.",
  ),
  buildLeadMagnet(
    "hipaa-workforce-sanctions-log-template",
    "HIPAA Workforce Sanctions Log Template",
    "Download a workforce sanctions log with a three-tier violation framework, per-incident documentation form, and annual summary table.",
  ),
  buildLeadMagnet(
    "hipaa-breach-notification-letter-template",
    "HIPAA Breach Notification Letter Template",
    "Download a complete fill-in-the-blank breach notification letter with all required elements under 45 CFR § 164.404, plus a pre-send checklist.",
  ),
  buildLeadMagnet(
    "hipaa-vendor-security-questionnaire",
    "HIPAA Vendor Security Questionnaire",
    "Download a 30-question vendor security questionnaire across 6 sections for evaluating business associates before BAA execution and at annual renewal.",
  ),
  buildLeadMagnet(
    "hipaa-incident-classification-decision-tree",
    "HIPAA Incident Classification Decision Tree",
    "Download a 6-step incident classification guide from initial report through Breach, Near-Miss, or No Action, with 4-factor LOPC documentation fields.",
  ),
  buildLeadMagnet(
    "hipaa-annual-compliance-program-audit",
    "HIPAA Annual Compliance Program Audit",
    "Download a 10-section scored annual audit covering the full HIPAA program, including governance, risk analysis, training, BAAs, incidents, access controls, physical and technical safeguards, policies, and contingency planning.",
  ),
  buildLeadMagnet(
    "hipaa-physical-security-audit-checklist",
    "HIPAA Physical Security Audit Checklist",
    "A 30-item physical safeguards audit checklist that walks small clinics through facility access, workstation security, device controls, and disposal practices required by 45 CFR 164.310.",
  ),
  buildLeadMagnet(
    "hipaa-remote-work-policy-template",
    "HIPAA Remote Work & BYOD Policy Template",
    "A formal policy template clinics can adapt to govern remote work and BYOD use, covering encryption, MFA, acceptable use, and incident reporting under 45 CFR 164.310 and 164.312.",
  ),
  buildLeadMagnet(
    "hipaa-texting-policy-template",
    "HIPAA Secure Messaging & Texting Policy Template",
    "A policy template covering approved messaging platforms, prohibited consumer apps, patient consent rules, and acceptable SMS content under 45 CFR 164.312(e).",
  ),
  buildLeadMagnet(
    "phi-disposal-log-template",
    "PHI Disposal & Destruction Tracking Log",
    "A tracking template clinics use to log every PHI destruction event with date, item, method, and witness, the documentation OCR expects under 45 CFR 164.310(d) and 164.530.",
  ),
  buildLeadMagnet(
    "hipaa-new-practice-startup-checklist",
    "HIPAA New Practice Startup Checklist",
    "A phased 60-item checklist for new covered entities covering pre-opening, 30-day, 60-day, and 90-day milestones to bring a brand-new practice into HIPAA compliance.",
  ),
  buildLeadMagnet(
    "hipaa-marketing-compliance-checklist",
    "HIPAA-Compliant Marketing Checklist for Clinics",
    "A practical checklist that walks clinic marketers through HIPAA marketing rules, authorization requirements for testimonials and photos, and the 2022/2024 tracking technology guidance.",
  ),
  buildLeadMagnet(
    "hipaa-ai-governance-framework",
    "HIPAA AI Governance Framework for Small Clinics",
    "A governance framework for clinics adopting AI tools, including risk analysis, BAA vetting, approved-tool list, prohibited uses, and audit logging for ambient AI scribes and other AI-enabled software.",
  ),
  buildLeadMagnet(
    "hipaa-patient-records-request-log",
    "HIPAA Patient Records Request Log",
    "A tracking template for patient access requests under 45 CFR 164.524 with required fields, sample entries, permissible fees, and denial reasons documentation.",
  ),
  buildLeadMagnet(
    "hipaa-covered-entity-determination-guide",
    "HIPAA Covered Entity Determination Guide",
    "A decision tree and explanations for determining whether a healthcare provider is a HIPAA covered entity under 45 CFR 160.103, including the electronic transactions trigger.",
  ),
  buildLeadMagnet(
    "hipaa-billing-compliance-checklist",
    "HIPAA Medical Billing Compliance Checklist",
    "A billing-specific HIPAA checklist covering TPO, BAAs for billing companies and clearinghouses, coding staff access, claims attachments, and offshore billing operations.",
  ),
];

export type LeadMagnetSlug = (typeof LEAD_MAGNETS)[number]["slug"];
export type LeadCaptureSlug = LeadMagnetSlug | "newsletter";

export const NEWSLETTER_SLUG = "newsletter" as const;

export const NEWSLETTER_TITLE = "PHIGuard Compliance Newsletter";

export const LEAD_MAGNETS_BY_SLUG = Object.fromEntries(
  LEAD_MAGNETS.map((magnet) => [magnet.slug, magnet]),
) as Record<LeadMagnetSlug, LeadMagnetDefinition>;

export const LEAD_MAGNET_TITLES = Object.freeze({
  ...Object.fromEntries(
    LEAD_MAGNETS.map((magnet) => [magnet.slug, magnet.title]),
  ),
  [NEWSLETTER_SLUG]: NEWSLETTER_TITLE,
}) as Record<LeadCaptureSlug, string>;

export function isLeadMagnetSlug(value: string): value is LeadMagnetSlug {
  return value in LEAD_MAGNETS_BY_SLUG;
}

export function isLeadCaptureSlug(value: string): value is LeadCaptureSlug {
  return value === NEWSLETTER_SLUG || isLeadMagnetSlug(value);
}

export function isLeadCaptureCtaContext(
  value: string,
): value is LeadCaptureCtaContext {
  return (LEAD_CAPTURE_CTA_CONTEXTS as readonly string[]).includes(value);
}

export function getLeadMagnetBySlug(slug: LeadMagnetSlug) {
  return LEAD_MAGNETS_BY_SLUG[slug];
}

export function getLeadMagnetResourceMetadata(
  magnet: LeadMagnetDefinition,
): LeadMagnetResourceMetadata {
  return {
    author: "PHIGuard",
    subject: magnet.inlineCopy.body,
    keywords: [magnet.title, "HIPAA", "compliance", "clinic resource"].join(
      ", ",
    ),
    language: "en-US",
    canonicalResourceUrl: `https://phiguard.app/resources/${magnet.slug}`,
  };
}

export const POPUP_EXCLUDED_PREFIXES = [
  "/privacy",
  "/terms",
  "/notice-of-privacy-practices",
  "/subprocessors",
  "/unsubscribe",
  "/resources/thank-you",
  "/404",
  "/500",
] as const;

export function isLeadMagnetDetailPath(pathname: string) {
  return (
    /^\/resources\/[a-z0-9-]+\/?$/.test(pathname) &&
    pathname !== "/resources/thank-you"
  );
}

export function isPopupExcludedPath(pathname: string) {
  const normalized = normalizePathname(pathname);

  if (
    POPUP_EXCLUDED_PREFIXES.some(
      (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
    )
  ) {
    return true;
  }

  return isLeadMagnetDetailPath(normalized);
}

export function getPopupPageCluster(pathname: string): PopupPageCluster {
  const normalized = normalizePathname(pathname);

  if (normalized.startsWith("/learn/risk-analysis")) {
    return "risk-analysis";
  }

  if (normalized.startsWith("/learn/incident-response")) {
    return "incident-response";
  }

  if (
    normalized.startsWith("/learn/workforce-training") ||
    normalized.startsWith("/learn/training")
  ) {
    return "training";
  }

  if (
    normalized.startsWith("/learn/vendor-management") ||
    normalized.startsWith("/resources/guides")
  ) {
    return "vendor-management";
  }

  if (normalized.startsWith("/learn/compliance-operations")) {
    return "compliance-operations";
  }

  if (normalized.startsWith("/locations")) {
    return "locations";
  }

  if (
    normalized.startsWith("/practice-types") ||
    normalized.startsWith("/personas")
  ) {
    return "practice-types";
  }

  if (
    normalized === "/pricing" ||
    normalized.startsWith("/compare") ||
    normalized.startsWith("/alternatives") ||
    normalized.startsWith("/hipaa-software") ||
    normalized.startsWith("/resources/best")
  ) {
    return "commercial";
  }

  return "general";
}

const POPUP_PICKER_BY_CLUSTER: Record<PopupPageCluster, LeadMagnetSlug[]> = {
  "risk-analysis": [
    "hipaa-risk-analysis-template",
    "hipaa-compliance-self-assessment",
    "incident-response-plan",
  ],
  "incident-response": [
    "incident-response-plan",
    "hipaa-breach-decision-tree",
    "hipaa-compliance-self-assessment",
  ],
  training: [
    "hipaa-new-hire-checklist",
    "hipaa-annual-training-log",
    "hipaa-staff-training-quiz-template",
  ],
  "vendor-management": [
    "vendor-baa-tracker",
    "hipaa-vendor-security-questionnaire",
    "baa-template",
  ],
  "compliance-operations": [
    "hipaa-annual-compliance-program-audit",
    "policy-review-calendar",
    "hipaa-evidence-binder-checklist",
  ],
  locations: [
    "hipaa-state-law-compliance-checklist",
    "hipaa-state-law-overlay-matrix",
    "hipaa-compliance-self-assessment",
  ],
  "practice-types": [
    "hipaa-compliance-self-assessment",
    "telehealth-compliance-workflow-checklist",
    "hipaa-risk-analysis-template",
  ],
  commercial: [
    "vendor-baa-tracker",
    "hipaa-pm-tool-comparison-guide",
    "hipaa-software-comparison-scorecard",
  ],
  general: [
    "hipaa-compliance-self-assessment",
    "baa-template",
    "hipaa-risk-analysis-template",
  ],
};

export function getPopupPickerSlugs(pathname: string): LeadMagnetSlug[] {
  return POPUP_PICKER_BY_CLUSTER[getPopupPageCluster(pathname)];
}

export function getDefaultPopupMagnetSlug(pathname: string): LeadMagnetSlug {
  return getPopupPickerSlugs(pathname)[0];
}

export function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/";
  }

  const trimmed = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return trimmed.length > 1 ? trimmed.replace(/\/+$/, "") : trimmed;
}

export interface PopupSuppressionStateInput {
  now: number;
  dismissedUntil?: number | null;
  submittedUntil?: number | null;
  sessionShown?: boolean;
}

export function shouldSuppressPopup(input: PopupSuppressionStateInput) {
  if (input.sessionShown) {
    return true;
  }

  if ((input.dismissedUntil ?? 0) > input.now) {
    return true;
  }

  if ((input.submittedUntil ?? 0) > input.now) {
    return true;
  }

  return false;
}
