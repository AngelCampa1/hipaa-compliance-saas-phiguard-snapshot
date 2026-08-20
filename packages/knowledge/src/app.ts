export { SUPPORT_EMAIL, SUPPORT_PHI_WARNING } from "./support.js";
import { SUPPORT_EMAIL } from "./support.js";
import { TRIAL_DAYS } from "@phiguard/billing/plans";

export const appPublicGuidanceCopy = {
  legalOnboardingRequiredMessage:
    "You need to accept the Terms and BAA before using PHIGuard.",
  noPhiTaskWarning:
    "Task names, dates, and notes can become part of the audit trail. Do not include patient names, dates of birth, medical record numbers, or clinical details.",
  taskTitleHelp:
    "Use a short action phrase like Review privacy notice. Keep patient identifiers out.",
  taskDescriptionHelp:
    "Describe the work to be done, the owner, and the completion criteria without patient identifiers.",
  taskPriorityHelp:
    "Use High only when compliance timing or patient-adjacent operational risk needs faster review.",
  taskDueDateHelp: "Choose the date the work should be reviewed or completed.",
  commentNoPhiWarning:
    "Avoid pasting patient identifiers or clinical details. Comments are retained with the task history.",
  evidenceNoPhiWarning:
    "Upload only evidence needed for the checklist item. Do not include patient identifiers unless your clinic has approved that procedure.",
  incidentNoPhiWarning:
    "Describe the event without patient names, dates of birth, medical record numbers, or other direct identifiers.",
  integrationNoPhiWarning:
    "PHIGuard creates generic calendar reminders only. Do not add patient identifiers or clinical details to connected calendar events.",
  vendorBaaGuidance:
    "A vendor needs BAA review when it creates, receives, maintains, or transmits PHI for your clinic.",
  support: {
    sidebarLabel: "Support",
    sidebarDescription: "Email product support without sending PHI.",
    securityIssueLabel: "Security issue",
    securityIssueDescription:
      "Report security concerns without patient identifiers.",
    emptySearchTitle: "No guide matched that search",
    emptySearchBody:
      "Try a simpler word like task, checklist, PDF, billing, or invite.",
    errorEscalation:
      "Contact support with this error ID and the action you were trying to complete.",
  },
  signup: {
    eyebrow: "Secure account access",
    heading: "Create your PHIGuard account",
    nameLabel: "Full name",
    emailLabel: "Work email",
    passwordLabel: "Password",
    pendingCta: "Creating account...",
    submitCta: "Create account",
    googlePendingCta: "Redirecting to Google...",
    googleCta: "Continue with Google",
    existingAccount: "Already have an account?",
    signIn: "Sign in",
    encryptedSession: "Encrypted session",
    checkEmailHeading: "Check your email",
    sentToLabel: "Sent to",
    continueSetup: "Continue setup",
    resending: "Sending...",
    resendConfirmation: "Resend confirmation",
  },
  onboardingTrial: {
    readyLabel: "Ready",
    readyHeading: "Terms and BAA on file. Start your trial.",
    readyBody: `Your ${TRIAL_DAYS}-day trial activates once legal acceptance is complete.`,
    lastStepLabel: "Last step",
    lastStepHeading: "Accept the BAA. Start the trial.",
    legalAcceptanceBody:
      `Terms of Service and a Business Associate Agreement are required before any clinic data lands in PHIGuard. After acceptance, your ${TRIAL_DAYS}-day trial starts immediately with every feature available.`,
    includesHeading: "What the trial includes",
    includes: [
      "No credit card required.",
      `All features are available for ${TRIAL_DAYS} days.`,
      "Pick a plan before the trial ends to keep the workspace running.",
    ],
    legalGateLabel: "Legal gate",
    legalGateHeading: "Accept the current Terms and BAA",
    acceptBothCta: "Accept Terms and the Business Associate Agreement",
    incompleteHeading: "Complete these items before continuing:",
    adminOnly:
      "Only an organization administrator can accept the Terms and BAA.",
  },
  billing: {
    title: "Billing",
    description:
      "Review trial status, plan fit, billing details, and legal acceptance for this clinic.",
    currentPlan: "Current plan",
    annualPrice: "Annual price",
    monthlyPrice: "Monthly price",
    nextAction: "Next action",
    recommendedStep: "One recommended step",
    trialNotStarted: "Trial not started",
    trialNotStartedBody: `Finish onboarding to start the ${TRIAL_DAYS}-day free trial.`,
    trialActive: "Trial active",
    noCardOnFile:
      "No credit card on file yet. Add billing details before the trial ends to keep PHIGuard running.",
    trialPaused: "Trial paused",
    pastDue: "Past due",
    canceled: "Canceled",
    legalRequired: "Legal acceptance required",
    returnToLegal: "Return to legal acceptance",
    choosePlan: "Choose a plan",
    planPickerBody:
      "All plans use flat clinic pricing and include the same baseline BAA and audit posture.",
    planPickerTrialBody:
      "Plans are flat per clinic. The plan you pick determines what remains available once the trial ends.",
    confirmPlan: "Confirm your plan",
    acceptLegalToUnlock: "Accept legal docs to continue",
    stripePending: "Redirecting to Stripe...",
    checkoutCta: "Continue to Stripe checkout",
    startTrialCta: "Start free trial",
  },
  firstRun: {
    eyebrow: "Welcome to PHIGuard",
    heading: "Here's how to get your compliance program started",
    steps: [
      {
        number: 1,
        title: "Open your first HIPAA checklist",
        detail: "Takes ~20 min. Creates your first audit trail.",
        href: "/app/compliance/checklists",
        active: true,
      },
      {
        number: 2,
        title: "Invite a teammate",
        detail: "Compliance works better when shared.",
        href: "/app/settings/members",
        active: false,
      },
      {
        number: 3,
        title: "Review your Privacy Policy",
        detail: "Required for HIPAA compliance.",
        href: "/app/compliance/policies",
        active: false,
      },
    ],
  },
  legalValidation: {
    clinicName: {
      label: "Clinic name",
      message: "Enter the clinic name.",
    },
    customerEntityName: {
      label: "Customer legal entity name",
      message: "Enter the customer legal entity name.",
    },
    signerName: {
      label: "Signer full name",
      message: "Enter the signer full name.",
    },
    signerTitle: {
      label: "Signer title",
      message: "Enter the signer title.",
    },
    acceptTerms: {
      label: "Terms of Service acceptance",
      message: "Accept the Terms of Service.",
    },
    acceptBaa: {
      label: "Business Associate Agreement acceptance",
      message: "Accept the Business Associate Agreement.",
    },
  },
} as const;

export type HelpCategory =
  | "getting-started"
  | "tasks"
  | "checklists"
  | "program"
  | "reports"
  | "settings"
  | "support";

export type HelpTopicLink = {
  label: string;
  to: string;
  search?: Record<string, unknown>;
};

export type HelpTopic = {
  id: string;
  category: HelpCategory;
  title: string;
  summary: string;
  audience: string;
  estimatedTime: string;
  steps: string[];
  relatedLinks: HelpTopicLink[];
  keywords?: string[];
  supportCta?: boolean;
};

export type HelpTooltipContent = {
  label: string;
  body: string;
};

export type RouteHelpContent = {
  title: string;
  summary: string;
  primaryAction: string;
  relatedTopicIds: string[];
  tooltips: HelpTooltipContent[];
  warnings?: string[];
};

export const HELP_CATEGORIES: Array<{
  id: HelpCategory;
  label: string;
  description: string;
}> = [
  {
    id: "getting-started",
    label: "Getting started",
    description: "The first few clicks a clinic should take after signing in.",
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Create, find, update, and finish work without guessing.",
  },
  {
    id: "checklists",
    label: "Checklists",
    description: "Start a HIPAA checklist and understand what each item means.",
  },
  {
    id: "program",
    label: "Policies and program",
    description:
      "Use policies, training, risk, and vendor pages with confidence.",
  },
  {
    id: "reports",
    label: "Reports and PDFs",
    description:
      "Find reports, export files, and open downloads on your computer.",
  },
  {
    id: "settings",
    label: "Members and settings",
    description:
      "Invite teammates, choose roles, locations, integrations, and billing.",
  },
  {
    id: "support",
    label: "Support",
    description:
      "Know when to ask PHIGuard for help and what not to send by email.",
  },
];

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: "first-day",
    category: "getting-started",
    title: "Your first day in PHIGuard",
    summary:
      "A short path for a clinic administrator who has never used PHIGuard before.",
    audience: "Clinic owners, practice administrators, and first-time users",
    estimatedTime: "10 minutes",
    steps: [
      "Open Dashboard. This is the home base that shows what needs attention.",
      "Open Checklists and assign the starter HIPAA checklist to your clinic location.",
      "Open Members and invite one trusted teammate, such as your office manager or compliance lead.",
      "Open Tasks to see work that came from checklists or to create a one-off follow-up.",
      "Open Help any time you are unsure what a page is asking you to do.",
    ],
    relatedLinks: [
      {
        label: "Open dashboard",
        to: "/app/dashboard",
        search: { locationId: undefined },
      },
      {
        label: "Open checklists",
        to: "/app/compliance/checklists",
        search: { locationId: undefined },
      },
      { label: "Invite a teammate", to: "/app/settings/members" },
    ],
    supportCta: true,
  },
  {
    id: "create-first-task",
    category: "tasks",
    title: "Create your first task",
    summary:
      "Use a task when someone needs to do a specific piece of work and mark it done.",
    audience: "Anyone who assigns or completes clinic work",
    estimatedTime: "3 minutes",
    steps: [
      "Open Tasks from the left menu.",
      "Choose Create new task.",
      'Write a short title, such as "Review privacy notice."',
      "Add only the details the teammate needs. Avoid putting patient details in the title.",
      "Choose a priority and due date if the work has a deadline.",
      "Choose Create task. PHIGuard saves the task and keeps an audit trail.",
    ],
    relatedLinks: [
      {
        label: "Open tasks",
        to: "/app/tasks",
        search: { status: undefined, locationId: undefined },
      },
      {
        label: "Create a task",
        to: "/app/tasks/new",
        search: { status: undefined, locationId: undefined },
      },
    ],
  },
  {
    id: "find-update-task",
    category: "tasks",
    title: "Find and update a task",
    summary: "Search for a task, change its status, and leave a short note.",
    audience: "Staff members completing assigned work",
    estimatedTime: "2 minutes",
    steps: [
      "Open Tasks.",
      "Use the status tabs to show All, Open, In Progress, Blocked, or Done work.",
      "Use the search box if you know part of the task title.",
      "Open the task you want.",
      "Change the status when the work starts, gets blocked, or is finished.",
      "Add a comment if the next person needs context.",
    ],
    relatedLinks: [
      {
        label: "Open tasks",
        to: "/app/tasks",
        search: { status: undefined, locationId: undefined },
      },
    ],
  },
  {
    id: "start-checklist",
    category: "checklists",
    title: "Start a HIPAA checklist",
    summary:
      "Assign a starter template so your clinic has a clear list of compliance work.",
    audience: "Organization owners and admins",
    estimatedTime: "5 minutes",
    steps: [
      "Open Checklists from the left menu.",
      "Find Assign starter checklist near the top of the page.",
      "Choose the template you want to use.",
      "Choose a due date if your clinic has a target date.",
      "Select the clinic locations that should receive the checklist.",
      "Choose Assign starter checklist. PHIGuard creates the checklist items for those locations.",
    ],
    relatedLinks: [
      {
        label: "Open checklists",
        to: "/app/compliance/checklists",
        search: { locationId: undefined },
      },
    ],
    supportCta: true,
  },
  {
    id: "finish-checklist-item",
    category: "checklists",
    title: "Complete a checklist item",
    summary:
      "Mark an item done only after the clinic has actually completed the work.",
    audience: "Admins and assigned staff",
    estimatedTime: "2 minutes",
    steps: [
      "Open Checklists.",
      "Choose the checklist for the right location.",
      "Read the item carefully.",
      "Attach evidence if the item asks for documentation.",
      "Check the box when the item is complete.",
      "If you checked it by mistake, uncheck it and add a note if needed.",
    ],
    relatedLinks: [
      {
        label: "Open checklists",
        to: "/app/compliance/checklists",
        search: { locationId: undefined },
      },
    ],
  },
  {
    id: "program-overview",
    category: "program",
    title: "Understand the compliance program page",
    summary: "Know what policies, training, risk, and vendors are for.",
    audience: "Clinic leaders and compliance owners",
    estimatedTime: "4 minutes",
    steps: [
      "Open Program from the Compliance section.",
      "Use Policies to publish documents staff must acknowledge.",
      "Use Training to see who is due or overdue.",
      "Use Risk Assessments to track larger compliance risks.",
      "Use Vendors to track outside companies and their BAA status.",
      "Open the area with the highest overdue or urgent count first.",
    ],
    relatedLinks: [
      { label: "Open program", to: "/app/compliance/program" },
      { label: "Open policies", to: "/app/compliance/program/policies" },
    ],
  },
  {
    id: "open-pdf-download",
    category: "reports",
    title: "Open a downloaded file or PDF",
    summary:
      "Find a downloaded report and open it even if you are not comfortable with files.",
    audience: "Anyone downloading reports, CSVs, evidence, or PDFs",
    estimatedTime: "3 minutes",
    steps: [
      "Choose the download or export button in PHIGuard.",
      "Look at the top-right or bottom-left of your browser for the downloaded file.",
      "If you do not see it, open the Downloads folder on your computer.",
      "Double-click the file. PDFs usually open in your browser or a PDF reader.",
      "If the browser says the download was blocked, choose Keep only if you expected the file from PHIGuard.",
      "If the file still will not open, email support and describe what you clicked. Do not attach PHI.",
    ],
    relatedLinks: [
      { label: "Open reports", to: "/app/reports" },
      { label: "Export audit log", to: "/app/audit/export" },
    ],
    supportCta: true,
  },
  {
    id: "invite-members",
    category: "settings",
    title: "Invite a teammate",
    summary:
      "Add another person without giving them more access than they need.",
    audience: "Organization owners and admins",
    estimatedTime: "4 minutes",
    steps: [
      "Open Members from Settings.",
      "Type the teammate's work email address.",
      "Choose a role. Use Location staff for everyday work, Auditor for read-only review, and Org admin only for people who help manage the clinic workspace.",
      "Choose Send invitation.",
      "Tell the teammate to check their email and accept the invitation.",
      "If they cannot find the email, return to Members and resend the invitation.",
    ],
    relatedLinks: [{ label: "Open members", to: "/app/settings/members" }],
    keywords: ["least privilege", "roles", "permissions", "access", "teammate"],
    supportCta: true,
  },
  {
    id: "billing-help",
    category: "settings",
    title: "Understand billing and trial status",
    summary:
      "Know what your billing page is telling you before you change anything.",
    audience: "Clinic owners and organization admins",
    estimatedTime: "3 minutes",
    steps: [
      "Open Billing from Settings.",
      "Read the status box at the top first. It says whether your trial, subscription, or legal acceptance needs attention.",
      "If the trial is active, check the trial end date.",
      "If PHIGuard asks for legal acceptance, return to onboarding before trying Stripe again.",
      "Use Manage billing only when you are ready to open Stripe billing settings.",
    ],
    relatedLinks: [
      { label: "Open billing", to: "/app/billing" },
      {
        label: "Continue onboarding",
        to: "/app/onboarding",
        search: { step: 2 },
      },
    ],
  },
  {
    id: "contact-support",
    category: "support",
    title: "Ask PHIGuard for help",
    summary:
      "What to send support when you need a person to look at the issue.",
    audience: "Anyone who feels stuck",
    estimatedTime: "2 minutes",
    steps: [
      `Email ${SUPPORT_EMAIL}.`,
      "Tell us what page you were on, what you clicked, and what you expected to happen.",
      "Include the clinic workspace name if that is safe to share.",
      "Do not include patient names, dates of birth, medical record numbers, screenshots with PHI, or clinical details.",
      `For security concerns, use ${SUPPORT_EMAIL} instead.`,
    ],
    relatedLinks: [{ label: "Open help center", to: "/app/help" }],
    supportCta: true,
  },
];

export const ROUTE_HELP: Record<string, RouteHelpContent> = {
  "/app/dashboard": {
    title: "Dashboard",
    summary:
      "Your home base. Start with the items that need attention, then move into the matching page.",
    primaryAction: "Open the first action item or start the welcome checklist.",
    relatedTopicIds: ["first-day", "start-checklist", "create-first-task"],
    tooltips: [
      {
        label: "Needs your attention",
        body: "These are the safest next clicks for the clinic. They usually point to overdue work, incomplete setup, or compliance records that need review.",
      },
      {
        label: "Location scope",
        body: "Use this when your organization has more than one clinic location. All locations shows the big picture; one location narrows the page.",
      },
      {
        label: "Legal agreements",
        body: "PHIGuard needs the Terms and BAA accepted before protected app access and billing can fully run.",
      },
    ],
  },
  "/app/onboarding": {
    title: "Onboarding",
    summary:
      "A step-by-step setup path for plan choice, legal acceptance, trial start, teammate invite, and first checklist.",
    primaryAction:
      "Complete the current highlighted step before moving forward.",
    relatedTopicIds: [
      "first-day",
      "billing-help",
      "invite-members",
      "start-checklist",
    ],
    warnings: [
      "Only accept legal documents if you have authority to bind the clinic or organization.",
    ],
    tooltips: [
      {
        label: "BAA",
        body: "A Business Associate Agreement is the HIPAA contract PHIGuard signs with your clinic before PHI-related procedures are used.",
      },
      {
        label: "No-card trial",
        body: "The trial can start without entering a credit card. Billing details can be added later from Billing.",
      },
      {
        label: "Invite a teammate",
        body: "A second admin helps avoid one person being the only person who can manage setup.",
      },
    ],
  },
  "/app/tasks": {
    title: "Tasks",
    summary:
      "Tasks are the clinic follow-up list. Use them when one person needs to do work and leave a record.",
    primaryAction:
      "Create a task, open a task, or filter to the status you need.",
    relatedTopicIds: ["create-first-task", "find-update-task"],
    warnings: [
      "Avoid patient names, MRNs, dates of birth, or clinical details in task titles and comments.",
    ],
    tooltips: [
      {
        label: "Open",
        body: "The work exists, but nobody has started it yet.",
      },
      {
        label: "In progress",
        body: "Someone is actively working on it.",
      },
      {
        label: "Blocked",
        body: "The work cannot move forward until another question, person, or dependency is resolved.",
      },
      {
        label: "Done",
        body: "The work is complete and remains in the record.",
      },
      {
        label: "Priority",
        body: "Priority tells teammates what to handle first. Use Urgent only when delay creates real compliance or operational risk.",
      },
    ],
  },
  "/app/tasks/new": {
    title: "New task",
    summary:
      "Create one clear piece of follow-up work for a teammate or clinic location.",
    primaryAction:
      "Write a short task name, choose priority, choose a due date if needed, then save.",
    relatedTopicIds: ["create-first-task"],
    warnings: [
      "Task names and descriptions are part of the audit record, so keep patient identifiers out.",
    ],
    tooltips: [
      {
        label: "Task name",
        body: 'Use a short action phrase like "Review privacy notice" or "Confirm vendor BAA."',
      },
      {
        label: "Due date",
        body: "Use a due date when a teammate needs a clear deadline. Leave it blank if there is no deadline.",
      },
    ],
  },
  "/app/tasks/": {
    title: "Task details",
    summary:
      "This page shows the work, status, owner, comments, attachments, and audit activity for one task.",
    primaryAction:
      "Update the status or add a short comment when something meaningful changes.",
    relatedTopicIds: ["find-update-task", "create-first-task"],
    warnings: [
      "Comments and uploads can become audit evidence. Do not paste or upload PHI unless your clinic policy allows it.",
    ],
    tooltips: [
      {
        label: "Activity",
        body: "Activity is the history of important changes. It helps show who did what and when.",
      },
      {
        label: "Assignee",
        body: "The assignee is the person expected to own the next step.",
      },
      {
        label: "Attachment",
        body: "Attach supporting evidence only when it is safe to store in PHIGuard under your clinic policy.",
      },
    ],
  },
  "/app/compliance": {
    title: "Compliance overview",
    summary:
      "A map of the clinic compliance program: checklists, incidents, policies, and program records.",
    primaryAction:
      "Start with checklists if you are new, or open the area with open work.",
    relatedTopicIds: [
      "start-checklist",
      "finish-checklist-item",
      "program-overview",
    ],
    tooltips: [
      {
        label: "Checklist",
        body: "A checklist breaks a larger HIPAA compliance task into smaller items you can complete one at a time.",
      },
      {
        label: "Incident",
        body: "Use incidents for privacy, security, or compliance events that need a structured response record.",
      },
    ],
  },
  "/app/compliance/checklists": {
    title: "Checklists",
    summary:
      "Assign starter templates and track compliance work by clinic location.",
    primaryAction:
      "Assign a starter checklist, then open it and review each item.",
    relatedTopicIds: ["start-checklist", "finish-checklist-item"],
    tooltips: [
      {
        label: "Starter template",
        body: "A starter template creates checklist items for you so the clinic does not start from a blank page.",
      },
      {
        label: "Assign to locations",
        body: "Choose the clinic locations that should receive this checklist. Each location gets its own work list.",
      },
      {
        label: "Due date",
        body: "A target date helps staff know when the checklist should be reviewed or completed.",
      },
    ],
  },
  "/app/compliance/checklists/": {
    title: "Checklist details",
    summary:
      "Guided mode walks through one safeguard at a time. List mode shows everything at once.",
    primaryAction: "Answer each item honestly: yes, not yet, or not sure.",
    relatedTopicIds: ["finish-checklist-item", "create-first-task"],
    warnings: [
      "Do not upload patient identifiers as evidence unless your clinic has confirmed the file is safe to store.",
    ],
    tooltips: [
      {
        label: "Yes, it is set up",
        body: "Choose this only when the clinic has actually completed the safeguard.",
      },
      {
        label: "Not yet",
        body: "Choose this when the work still needs to happen. PHIGuard can help turn it into a follow-up task.",
      },
      {
        label: "Not sure",
        body: "Choose this when you need a manager, privacy officer, or outside advisor to confirm.",
      },
      {
        label: "Evidence",
        body: "Evidence is a file or record that supports why an item was marked complete.",
      },
    ],
  },
  "/app/compliance/incidents": {
    title: "Incidents",
    summary:
      "Track privacy, security, and compliance events from initial report through resolution.",
    primaryAction:
      "Open unresolved incidents first or create a new incident if something happened.",
    relatedTopicIds: ["contact-support", "create-first-task"],
    warnings: [
      "Incident records may involve sensitive information. Follow clinic policy before entering patient details.",
    ],
    tooltips: [
      {
        label: "Severity",
        body: "Severity helps the team decide how quickly to respond. Use higher severity when risk or urgency is higher.",
      },
      {
        label: "Status",
        body: "Status shows whether the incident is new, being reviewed, resolved, or closed.",
      },
    ],
  },
  "/app/compliance/policies": {
    title: "Policies",
    summary:
      "Policies are documents the clinic publishes and staff may need to acknowledge.",
    primaryAction:
      "Review published policies and handle any pending acknowledgement.",
    relatedTopicIds: ["program-overview"],
    tooltips: [
      {
        label: "Acknowledgement",
        body: "An acknowledgement records that a staff member saw and accepted a policy.",
      },
    ],
  },
  "/app/compliance/program": {
    title: "Compliance program",
    summary:
      "A broader program view for policies, training, risk assessments, and vendors.",
    primaryAction:
      "Open the card with overdue, high-risk, or expiring items first.",
    relatedTopicIds: ["program-overview"],
    tooltips: [
      {
        label: "Training",
        body: "Training tracks whether staff have completed required learning by the due date.",
      },
      {
        label: "Risk assessment",
        body: "Risk assessments help the clinic document larger compliance risks and planned fixes.",
      },
      {
        label: "Vendor",
        body: "A vendor is an outside company that may support clinic operations. Some vendors need a BAA.",
      },
    ],
  },
  "/app/compliance/program/policies": {
    title: "Program policies",
    summary:
      "Create, publish, and review policy documents for the organization.",
    primaryAction: "Review draft or pending policies before publishing.",
    relatedTopicIds: ["program-overview"],
    tooltips: [
      {
        label: "Published",
        body: "Published policies are visible as the current policy record for the organization.",
      },
    ],
  },
  "/app/compliance/program/training": {
    title: "Training",
    summary:
      "Track workforce training assignments, due dates, and completion state.",
    primaryAction: "Start with overdue training, then review due-soon items.",
    relatedTopicIds: ["program-overview"],
    tooltips: [
      {
        label: "Overdue",
        body: "Overdue means the due date has passed and the training still needs completion.",
      },
    ],
  },
  "/app/compliance/program/risk": {
    title: "Risk assessments",
    summary: "Document larger risks, scoring, owners, and follow-up work.",
    primaryAction: "Review high-risk open items first.",
    relatedTopicIds: ["program-overview", "create-first-task"],
    tooltips: [
      {
        label: "High risk",
        body: "High risk means the clinic should review the item soon and decide what action is needed.",
      },
    ],
  },
  "/app/compliance/program/vendors": {
    title: "Vendors",
    summary:
      "Track outside companies and whether a Business Associate Agreement is needed or expiring.",
    primaryAction: "Review vendors with missing or expiring BAAs first.",
    relatedTopicIds: ["program-overview"],
    tooltips: [
      {
        label: "BAA status",
        body: "BAA status shows whether the vendor agreement is on file, missing, not needed, or expiring.",
      },
      {
        label: "Contact email",
        body: "Use a general business contact when possible. Do not enter patient information here.",
      },
    ],
  },
  "/app/reports": {
    title: "Reports",
    summary:
      "Reports help you review progress and export records for internal review.",
    primaryAction:
      "Choose the report that matches the question you are trying to answer.",
    relatedTopicIds: ["open-pdf-download"],
    tooltips: [
      {
        label: "Export",
        body: "Export downloads a file to your computer. Look in your browser downloads or Downloads folder.",
      },
      {
        label: "CSV",
        body: "A CSV is a spreadsheet-style file that opens in Excel, Google Sheets, or similar tools.",
      },
    ],
  },
  "/app/audit": {
    title: "Audit log",
    summary:
      "The audit log records important actions so the clinic can review who did what and when.",
    primaryAction:
      "Filter or export the log when you need to answer an audit question.",
    relatedTopicIds: ["open-pdf-download", "contact-support"],
    tooltips: [
      {
        label: "Append-only",
        body: "Audit records should not be edited casually. They exist to preserve history.",
      },
      {
        label: "User agent",
        body: "User agent is technical browser/device information. Support may use it to troubleshoot.",
      },
    ],
  },
  "/app/settings/members": {
    title: "Members",
    summary: "Invite teammates and manage what each person can access.",
    primaryAction:
      "Use the least powerful role that still lets the person do their work.",
    relatedTopicIds: ["invite-members"],
    warnings: [
      "Changing roles can change access to billing, members, and clinic-wide settings.",
    ],
    tooltips: [
      {
        label: "Least privilege",
        body: "Least privilege means giving someone only the access they need, not extra admin power.",
      },
      {
        label: "Org admin",
        body: "Org admins can help manage members, billing, and clinic-wide settings. Use this role carefully.",
      },
      {
        label: "Auditor",
        body: "Auditors can review records without changing everyday clinic work.",
      },
      {
        label: "Location staff",
        body: "Location staff is the safest starting role for people doing routine work in one clinic area.",
      },
    ],
  },
  "/app/settings/locations": {
    title: "Locations",
    summary:
      "Locations separate work by clinic site, department, or operating unit.",
    primaryAction:
      "Create or edit locations only when work needs to be tracked separately.",
    relatedTopicIds: ["first-day"],
    tooltips: [
      {
        label: "Location scope",
        body: "Location scope controls which clinic area a person or report is focused on.",
      },
    ],
  },
  "/app/settings/integrations": {
    title: "Integrations",
    summary:
      "Connect Google Workspace or Microsoft 365 for supported integration features.",
    primaryAction: "Connect only accounts approved for clinic operations.",
    relatedTopicIds: ["contact-support"],
    warnings: [
      "PHIGuard does not send PHI to these integrations. Keep connected calendars and accounts appropriate for clinic use.",
    ],
    tooltips: [
      {
        label: "Revoke",
        body: "Revoking disconnects the integration so PHIGuard can no longer use that connection.",
      },
      {
        label: "Encrypted tokens",
        body: "Tokens are stored in encrypted form so PHIGuard can keep the connection working without storing your password.",
      },
    ],
  },
  "/app/billing": {
    title: "Billing",
    summary:
      "Billing shows trial, subscription, legal acceptance, and Stripe account status.",
    primaryAction: "Read the status box before clicking a billing action.",
    relatedTopicIds: ["billing-help"],
    warnings: [
      "If legal acceptance is required, finish onboarding before trying Stripe again.",
    ],
    tooltips: [
      {
        label: "Trialing",
        body: "Trialing means the free trial is active. Add billing details before the trial ends to avoid service pause.",
      },
      {
        label: "Hard locked",
        body: "Hard locked means access is paused until a billing or legal requirement is resolved.",
      },
    ],
  },
  "/app/soc2": {
    title: "SOC 2",
    summary:
      "Advanced evidence, controls, and access review programs for organizations that need stronger governance records.",
    primaryAction:
      "Open controls, evidence, or access reviews based on the review you are preparing for.",
    relatedTopicIds: ["program-overview", "open-pdf-download"],
    tooltips: [
      {
        label: "Control",
        body: "A control is a documented practice or safeguard the organization wants evidence for.",
      },
      {
        label: "Evidence",
        body: "Evidence is a file, note, or record that supports a control or review.",
      },
      {
        label: "Access review",
        body: "An access review checks whether people still have the right level of access.",
      },
    ],
  },
  "/app/admin/partners": {
    title: "Partner admin",
    summary: "Administrative partner review tools for PHIGuard operators.",
    primaryAction:
      "Review pending partner records carefully before taking action.",
    relatedTopicIds: ["contact-support"],
    tooltips: [
      {
        label: "Admin action",
        body: "Admin actions can affect external partner access or records. Confirm the target before saving.",
      },
    ],
  },
};

export function getHelpTopic(id: string | undefined) {
  if (!id) return undefined;
  return HELP_TOPICS.find((topic) => topic.id === id);
}

export function getHelpTopicsByCategory(category: HelpCategory | undefined) {
  if (!category) return HELP_TOPICS;
  return HELP_TOPICS.filter((topic) => topic.category === category);
}

export function searchHelpTopics(
  query: string,
  topics: HelpTopic[] = HELP_TOPICS,
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return topics;
  const tokens = normalized.split(/\s+/).filter(Boolean);

  return topics.filter((topic) => {
    const routeHelpText = Object.values(ROUTE_HELP)
      .filter((routeHelp) => routeHelp.relatedTopicIds.includes(topic.id))
      .flatMap((routeHelp) => [
        routeHelp.title,
        routeHelp.summary,
        routeHelp.primaryAction,
        ...(routeHelp.warnings ?? []),
        ...routeHelp.tooltips.flatMap((tooltip) => [
          tooltip.label,
          tooltip.body,
        ]),
      ]);

    const haystack = [
      topic.title,
      topic.summary,
      topic.audience,
      topic.category,
      ...(topic.keywords ?? []),
      ...topic.steps,
      ...topic.relatedLinks.map((link) => link.label),
      ...routeHelpText,
    ]
      .join(" ")
      .toLowerCase();

    return tokens.every((token) => haystack.includes(token));
  });
}

export function getRouteHelp(pathname: string) {
  const normalized =
    pathname.endsWith("/") && pathname !== "/"
      ? pathname.slice(0, -1)
      : pathname;
  const exact = ROUTE_HELP[normalized];

  if (exact) return exact;

  const candidates = Object.keys(ROUTE_HELP)
    .filter((route) => {
      if (route.endsWith("/")) return normalized.startsWith(route);
      return normalized.startsWith(`${route}/`);
    })
    .sort((a, b) => b.length - a.length);

  return candidates.length > 0 ? ROUTE_HELP[candidates[0]!] : undefined;
}
