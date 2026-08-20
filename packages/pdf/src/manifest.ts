import { cloneElement, createElement, type ReactElement } from 'react'
import {
  LEAD_MAGNETS,
  getLeadMagnetResourceMetadata,
  type LeadMagnetResourceMetadata,
} from '@phiguard/lead-magnets'
import BaaTemplateDocument from './documents/BaaTemplate.js'
import HipaaBreachDecisionTreeDocument from './documents/HipaaBreachDecisionTree.js'
import HipaaNewHireChecklistDocument from './documents/HipaaNewHireChecklist.js'
import HipaaRiskAnalysisTemplateDocument from './documents/HipaaRiskAnalysisTemplate.js'
import HipaaComplianceSelfAssessmentDocument from './documents/HipaaComplianceSelfAssessment.js'
import HipaaPmToolComparisonGuideDocument from './documents/HipaaPmToolComparisonGuide.js'
import VendorBaaTrackerDocument from './documents/VendorBaaTracker.js'
import IncidentResponsePlanDocument from './documents/IncidentResponsePlan.js'
import HipaaReleaseFormTemplateDocument from './documents/HipaaReleaseFormTemplate.js'
import HipaaBaaTemplateClinicDocument from './documents/HipaaBaaTemplateClinic.js'
import NoticeOfPrivacyPracticesTemplateDocument from './documents/NoticeOfPrivacyPracticesTemplate.js'
import HipaaPrivacyPolicyTemplateDocument from './documents/HipaaPrivacyPolicyTemplate.js'
import HipaaSecurityPolicyTemplateDocument from './documents/HipaaSecurityPolicyTemplate.js'
import HipaaAuthorizationFormTemplateDocument from './documents/HipaaAuthorizationFormTemplate.js'
import HipaaContingencyPlanTemplateDocument from './documents/HipaaContingencyPlanTemplate.js'
import HipaaEmployeeAcknowledgementTemplateDocument from './documents/HipaaEmployeeAcknowledgementTemplate.js'
import HipaaDataBackupPlanTemplateDocument from './documents/HipaaDataBackupPlanTemplate.js'
import HipaaAccessLogTemplateDocument from './documents/HipaaAccessLogTemplate.js'
import HipaaAnnualReviewCalendarDocument from './documents/HipaaAnnualReviewCalendar.js'
import HipaaTaskManagementMaturityScorecardDocument from './documents/HipaaTaskManagementMaturityScorecard.js'
import HipaaIncidentTriageWorksheetDocument from './documents/HipaaIncidentTriageWorksheet.js'
import HipaaAccessReviewChecklistDocument from './documents/HipaaAccessReviewChecklist.js'
import HipaaOffboardingChecklistDocument from './documents/HipaaOffboardingChecklist.js'
import HipaaStateLawOverlayMatrixDocument from './documents/HipaaStateLawOverlayMatrix.js'
import HipaaSoftwareComparisonScorecardDocument from './documents/HipaaSoftwareComparisonScorecard.js'
import HipaaBudgetCalculatorDocument from './documents/HipaaBudgetCalculator.js'
import TabletopExerciseScriptDocument from './documents/TabletopExerciseScript.js'
import PhiWorkflowAuditWorksheetDocument from './documents/PhiWorkflowAuditWorksheet.js'
import MinimumNecessaryDecisionLogDocument from './documents/MinimumNecessaryDecisionLog.js'
import VendorRenewalReviewChecklistDocument from './documents/VendorRenewalReviewChecklist.js'
import OcrInquiryReadinessPacketDocument from './documents/OcrInquiryReadinessPacket.js'
import HipaaEvidenceBinderChecklistDocument from './documents/HipaaEvidenceBinderChecklist.js'
import MultiLocationComplianceRolloutPlanDocument from './documents/MultiLocationComplianceRolloutPlan.js'
import TelehealthComplianceWorkflowChecklistDocument from './documents/TelehealthComplianceWorkflowChecklist.js'
import AccessMatrixStarterTemplateDocument from './documents/AccessMatrixStarterTemplate.js'
import PolicyReviewCalendarDocument from './documents/PolicyReviewCalendar.js'
import HipaaSocialMediaPolicyTemplateDocument from './documents/HipaaSocialMediaPolicyTemplate.js'
import HipaaAiUsePolicyTemplateDocument from './documents/HipaaAiUsePolicyTemplate.js'
import HipaaBaaTerminationChecklistDocument from './documents/HipaaBaaTerminationChecklist.js'
import StarkLawSelfReferralChecklistDocument from './documents/StarkLawSelfReferralChecklist.js'
import HipaaComplaintResponseTemplateDocument from './documents/HipaaComplaintResponseTemplate.js'
import HipaaRiskRemediationTrackerDocument from './documents/HipaaRiskRemediationTracker.js'
import HipaaAnnualTrainingLogDocument from './documents/HipaaAnnualTrainingLog.js'
import HipaaStateLawComplianceChecklistDocument from './documents/HipaaStateLawComplianceChecklist.js'
import HipaaMedicalRecordsRetentionScheduleDocument from './documents/HipaaMedicalRecordsRetentionSchedule.js'
import HipaaStaffTrainingQuizTemplateDocument from './documents/HipaaStaffTrainingQuizTemplate.js'
import HipaaAiToolVettingChecklistDocument from './documents/HipaaAiToolVettingChecklist.js'
import HipaaGapAnalysisScorecardDocument from './documents/HipaaGapAnalysisScorecard.js'
import HipaaWorkforceSanctionsLogTemplateDocument from './documents/HipaaWorkforceSanctionsLogTemplate.js'
import HipaaBreachNotificationLetterTemplateDocument from './documents/HipaaBreachNotificationLetterTemplate.js'
import HipaaVendorSecurityQuestionnaireDocument from './documents/HipaaVendorSecurityQuestionnaire.js'
import HipaaIncidentClassificationDecisionTreeDocument from './documents/HipaaIncidentClassificationDecisionTree.js'
import HipaaAnnualComplianceProgramAuditDocument from './documents/HipaaAnnualComplianceProgramAudit.js'
import HipaaPhysicalSecurityAuditChecklistDocument from './documents/HipaaPhysicalSecurityAuditChecklist.js'
import HipaaRemoteWorkPolicyTemplateDocument from './documents/HipaaRemoteWorkPolicyTemplate.js'
import HipaaTextingPolicyTemplateDocument from './documents/HipaaTextingPolicyTemplate.js'
import PhiDisposalLogTemplateDocument from './documents/PhiDisposalLogTemplate.js'
import HipaaNewPracticeStartupChecklistDocument from './documents/HipaaNewPracticeStartupChecklist.js'
import HipaaMarketingComplianceChecklistDocument from './documents/HipaaMarketingComplianceChecklist.js'
import HipaaAiGovernanceFrameworkDocument from './documents/HipaaAiGovernanceFramework.js'
import HipaaPatientRecordsRequestLogDocument from './documents/HipaaPatientRecordsRequestLog.js'
import HipaaCoveredEntityDeterminationGuideDocument from './documents/HipaaCoveredEntityDeterminationGuide.js'
import HipaaBillingComplianceChecklistDocument from './documents/HipaaBillingComplianceChecklist.js'
import type { PdfLayoutProps } from './layout/PdfLayout.js'

export interface LeadMagnetEntry {
  slug: string
  title: string
  storageKey: string
  metadata: LeadMagnetResourceMetadata
  render: () => ReactElement
}

const DOCUMENT_RENDERERS: Record<string, () => ReactElement> = {
  'baa-template': () => createElement(BaaTemplateDocument),
  'hipaa-breach-decision-tree': () => createElement(HipaaBreachDecisionTreeDocument),
  'hipaa-new-hire-checklist': () => createElement(HipaaNewHireChecklistDocument),
  'hipaa-risk-analysis-template': () => createElement(HipaaRiskAnalysisTemplateDocument),
  'hipaa-compliance-self-assessment': () => createElement(HipaaComplianceSelfAssessmentDocument),
  'hipaa-pm-tool-comparison-guide': () => createElement(HipaaPmToolComparisonGuideDocument),
  'vendor-baa-tracker': () => createElement(VendorBaaTrackerDocument),
  'incident-response-plan': () => createElement(IncidentResponsePlanDocument),
  'hipaa-release-form-template': () => createElement(HipaaReleaseFormTemplateDocument),
  'hipaa-baa-template-clinic': () => createElement(HipaaBaaTemplateClinicDocument),
  'notice-of-privacy-practices-template': () => createElement(NoticeOfPrivacyPracticesTemplateDocument),
  'hipaa-privacy-policy-template': () => createElement(HipaaPrivacyPolicyTemplateDocument),
  'hipaa-security-policy-template': () => createElement(HipaaSecurityPolicyTemplateDocument),
  'hipaa-authorization-form-template': () => createElement(HipaaAuthorizationFormTemplateDocument),
  'hipaa-contingency-plan-template': () => createElement(HipaaContingencyPlanTemplateDocument),
  'hipaa-employee-acknowledgement-template': () => createElement(HipaaEmployeeAcknowledgementTemplateDocument),
  'hipaa-data-backup-plan-template': () => createElement(HipaaDataBackupPlanTemplateDocument),
  'hipaa-access-log-template': () => createElement(HipaaAccessLogTemplateDocument),
  'hipaa-annual-review-calendar': () => createElement(HipaaAnnualReviewCalendarDocument),
  'hipaa-task-management-maturity-scorecard': () => createElement(HipaaTaskManagementMaturityScorecardDocument),
  'hipaa-incident-triage-worksheet': () => createElement(HipaaIncidentTriageWorksheetDocument),
  'hipaa-access-review-checklist': () => createElement(HipaaAccessReviewChecklistDocument),
  'hipaa-offboarding-checklist': () => createElement(HipaaOffboardingChecklistDocument),
  'hipaa-state-law-overlay-matrix': () => createElement(HipaaStateLawOverlayMatrixDocument),
  'hipaa-software-comparison-scorecard': () => createElement(HipaaSoftwareComparisonScorecardDocument),
  'hipaa-budget-calculator': () => createElement(HipaaBudgetCalculatorDocument),
  'tabletop-exercise-script': () => createElement(TabletopExerciseScriptDocument),
  'phi-workflow-audit-worksheet': () => createElement(PhiWorkflowAuditWorksheetDocument),
  'minimum-necessary-decision-log': () => createElement(MinimumNecessaryDecisionLogDocument),
  'vendor-renewal-review-checklist': () => createElement(VendorRenewalReviewChecklistDocument),
  'ocr-inquiry-readiness-packet': () => createElement(OcrInquiryReadinessPacketDocument),
  'hipaa-evidence-binder-checklist': () => createElement(HipaaEvidenceBinderChecklistDocument),
  'multi-location-compliance-rollout-plan': () => createElement(MultiLocationComplianceRolloutPlanDocument),
  'telehealth-compliance-workflow-checklist': () => createElement(TelehealthComplianceWorkflowChecklistDocument),
  'access-matrix-starter-template': () => createElement(AccessMatrixStarterTemplateDocument),
  'policy-review-calendar': () => createElement(PolicyReviewCalendarDocument),
  'hipaa-social-media-policy-template': () => createElement(HipaaSocialMediaPolicyTemplateDocument),
  'hipaa-ai-use-policy-template': () => createElement(HipaaAiUsePolicyTemplateDocument),
  'hipaa-baa-termination-checklist': () => createElement(HipaaBaaTerminationChecklistDocument),
  'stark-law-self-referral-checklist': () => createElement(StarkLawSelfReferralChecklistDocument),
  'hipaa-complaint-response-template': () => createElement(HipaaComplaintResponseTemplateDocument),
  'hipaa-risk-remediation-tracker': () => createElement(HipaaRiskRemediationTrackerDocument),
  'hipaa-annual-training-log': () => createElement(HipaaAnnualTrainingLogDocument),
  'hipaa-state-law-compliance-checklist': () => createElement(HipaaStateLawComplianceChecklistDocument),
  'hipaa-medical-records-retention-schedule': () => createElement(HipaaMedicalRecordsRetentionScheduleDocument),
  'hipaa-staff-training-quiz-template': () => createElement(HipaaStaffTrainingQuizTemplateDocument),
  'hipaa-ai-tool-vetting-checklist': () => createElement(HipaaAiToolVettingChecklistDocument),
  'hipaa-gap-analysis-scorecard': () => createElement(HipaaGapAnalysisScorecardDocument),
  'hipaa-workforce-sanctions-log-template': () => createElement(HipaaWorkforceSanctionsLogTemplateDocument),
  'hipaa-breach-notification-letter-template': () => createElement(HipaaBreachNotificationLetterTemplateDocument),
  'hipaa-vendor-security-questionnaire': () => createElement(HipaaVendorSecurityQuestionnaireDocument),
  'hipaa-incident-classification-decision-tree': () => createElement(HipaaIncidentClassificationDecisionTreeDocument),
  'hipaa-annual-compliance-program-audit': () => createElement(HipaaAnnualComplianceProgramAuditDocument),
  'hipaa-physical-security-audit-checklist': () => createElement(HipaaPhysicalSecurityAuditChecklistDocument),
  'hipaa-remote-work-policy-template': () => createElement(HipaaRemoteWorkPolicyTemplateDocument),
  'hipaa-texting-policy-template': () => createElement(HipaaTextingPolicyTemplateDocument),
  'phi-disposal-log-template': () => createElement(PhiDisposalLogTemplateDocument),
  'hipaa-new-practice-startup-checklist': () => createElement(HipaaNewPracticeStartupChecklistDocument),
  'hipaa-marketing-compliance-checklist': () => createElement(HipaaMarketingComplianceChecklistDocument),
  'hipaa-ai-governance-framework': () => createElement(HipaaAiGovernanceFrameworkDocument),
  'hipaa-patient-records-request-log': () => createElement(HipaaPatientRecordsRequestLogDocument),
  'hipaa-covered-entity-determination-guide': () => createElement(HipaaCoveredEntityDeterminationGuideDocument),
  'hipaa-billing-compliance-checklist': () => createElement(HipaaBillingComplianceChecklistDocument),
}

function LeadMagnetPdfDocument({
  render,
  slug,
}: {
  render: () => ReactElement
  slug: string
}) {
  const documentComponent = render()
  const layoutElement = (documentComponent.type as (props: unknown) => ReactElement<PdfLayoutProps>)(
    documentComponent.props,
  )

  return cloneElement(layoutElement, { magnetSlug: slug })
}

export const LEAD_MAGNET_MANIFEST: LeadMagnetEntry[] = LEAD_MAGNETS.map((magnet) => {
  const render = DOCUMENT_RENDERERS[magnet.slug]

  if (!render) {
    throw new Error(`Missing PDF document renderer for lead magnet "${magnet.slug}"`)
  }

  return {
    slug: magnet.slug,
    title: magnet.title,
    storageKey: magnet.storageKey,
    metadata: getLeadMagnetResourceMetadata(magnet),
    render: () => createElement(LeadMagnetPdfDocument, { render, slug: magnet.slug }),
  }
})
