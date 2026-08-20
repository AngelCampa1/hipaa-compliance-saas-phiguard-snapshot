import { createElement } from "react";
import {
  PHIGUARD_EMAIL_PUBLIC_COPY as emailPublicCopy,
  PHIGUARD_PARTNER_PROGRAM_COPY as partnerProgramCopy,
} from "@phiguard/brand/public-copy";
import { SUPPORT_EMAIL } from "@phiguard/brand/contact";
import { isLeadMagnetSlug } from "@phiguard/lead-magnets";
import { sendEmail } from "./resend.js";
import { AiCsEscalationEmail } from "./templates/ai-cs-escalation.js";
import { LeadMagnetDeliveryEmail } from "./templates/lead-magnet-delivery.js";
import { OrgInviteEmail } from "./templates/org-invite.js";
import { PartnerApplicationEmail } from "./templates/partner-application.js";
import { PartnerMagicLinkEmail } from "./templates/partner-magic-link.js";
import { PasswordResetEmail } from "./templates/password-reset.js";
import { SignupConfirmationEmail } from "./templates/signup-confirmation.js";
import { TrialEndingSoonEmail } from "./templates/trial-ending-soon.js";
import { TrialStartedEmail } from "./templates/trial-started.js";

export { sendEmail } from "./resend.js";
export type { SendEmailOptions } from "./resend.js";

export interface SendPartnerMagicLinkEmailInput {
  toEmail: string;
  magicLinkUrl: string;
}

export interface SendPartnerApplicationEmailInput {
  toEmail: string;
  partnerName: string;
  company: string;
}

export interface SendLeadMagnetDeliveryEmailInput {
  toEmail: string;
  magnetTitle: string;
  magnetSlug: string;
  siteBaseUrl: string;
  unsubscribeUrl: string;
  downloadUrl: string;
  isPdf: boolean;
}

export interface SendPasswordResetEmailInput {
  toEmail: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface SendOrganizationInviteEmailInput {
  acceptUrl: string;
  expiresAt: Date;
  inviterName: string;
  organizationName: string;
  role: string;
  toEmail: string;
}

export interface SendTrialStartedEmailInput {
  toEmail: string;
  planName: string;
  priceMonthly: number;
  priceMonthlyNote?: string;
  trialStartedAt: Date;
  trialEndsAt: Date;
  billingUrl: string;
}

export interface SendTrialEndingSoonEmailInput {
  toEmail: string;
  planName: string;
  priceMonthly: number;
  priceMonthlyNote?: string;
  trialEndsAt: Date;
  billingUrl: string;
  hasPaymentMethodOnFile: boolean;
}

export interface SendSignupConfirmationEmailInput {
  toEmail: string;
  firstName?: string;
  appUrl: string;
  resendUrl: string;
  unsubscribeUrl: string;
}

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput,
): Promise<void> {
  await sendEmail({
    to: input.toEmail,
    subject: emailPublicCopy.passwordReset.preview,
    react: createElement(PasswordResetEmail, {
      resetUrl: input.resetUrl,
      expiresInMinutes: input.expiresInMinutes,
    }),
  });
}

export async function sendPartnerMagicLinkEmail(
  input: SendPartnerMagicLinkEmailInput,
): Promise<void> {
  await sendEmail({
    to: input.toEmail,
    subject: emailPublicCopy.partnerMagicLink.preview,
    react: createElement(PartnerMagicLinkEmail, {
      magicLinkUrl: input.magicLinkUrl,
    }),
  });
}

export async function sendPartnerApplicationEmail(
  input: SendPartnerApplicationEmailInput,
): Promise<void> {
  await sendEmail({
    to: input.toEmail,
    subject: partnerProgramCopy.preview,
    react: createElement(PartnerApplicationEmail, {
      partnerName: input.partnerName,
      company: input.company,
    }),
  });
}

export async function sendLeadMagnetDeliveryEmail(
  input: SendLeadMagnetDeliveryEmailInput,
): Promise<void> {
  const isResourceDelivery = isLeadMagnetSlug(input.magnetSlug);

  await sendEmail({
    to: input.toEmail,
    subject: isResourceDelivery
      ? `${emailPublicCopy.leadMagnet.resourcePreviewPrefix} ${input.magnetTitle}`
      : emailPublicCopy.leadMagnet.welcomeHeading,
    react: createElement(LeadMagnetDeliveryEmail, {
      magnetTitle: input.magnetTitle,
      downloadUrl: input.downloadUrl,
      unsubscribeUrl: input.unsubscribeUrl,
      isResourceDelivery,
      isPdf: input.isPdf,
    }),
  });
}

export async function sendSignupConfirmationEmail(
  input: SendSignupConfirmationEmailInput,
): Promise<void> {
  await sendEmail({
    to: input.toEmail,
    subject: emailPublicCopy.signupConfirmation.defaultGreeting,
    react: createElement(SignupConfirmationEmail, {
      firstName: input.firstName,
      appUrl: input.appUrl,
      resendUrl: input.resendUrl,
      unsubscribeUrl: input.unsubscribeUrl,
    }),
    tags: [{ name: "workflow", value: "signup-confirmation" }],
  });
}

export async function sendOrganizationInviteEmail(
  input: SendOrganizationInviteEmailInput,
): Promise<void> {
  await sendEmail({
    to: input.toEmail,
    subject: `${input.inviterName} ${emailPublicCopy.invite.previewJoin} ${input.organizationName} ${emailPublicCopy.invite.previewSuffix}`,
    react: createElement(OrgInviteEmail, {
      acceptUrl: input.acceptUrl,
      expiresAt: input.expiresAt,
      inviterName: input.inviterName,
      organizationName: input.organizationName,
      role: input.role,
    }),
  });
}

export async function sendTrialStartedEmail(
  input: SendTrialStartedEmailInput,
): Promise<void> {
  await sendEmail({
    to: input.toEmail,
    subject: `${input.planName} ${emailPublicCopy.trialStarted.subjectSuffix}`,
    react: createElement(TrialStartedEmail, {
      planName: input.planName,
      priceMonthly: input.priceMonthly,
      priceMonthlyNote: input.priceMonthlyNote,
      trialStartedAt: input.trialStartedAt,
      trialEndsAt: input.trialEndsAt,
      billingUrl: input.billingUrl,
    }),
  });
}

export async function sendTrialEndingSoonEmail(
  input: SendTrialEndingSoonEmailInput,
): Promise<void> {
  await sendEmail({
    to: input.toEmail,
    subject: input.hasPaymentMethodOnFile
      ? `${input.planName} ${emailPublicCopy.trialEndingSoon.headingSuffix} - ${emailPublicCopy.trialEndingSoon.reviewBillingCta}`
      : `${input.planName} ${emailPublicCopy.trialEndingSoon.headingSuffix} - ${emailPublicCopy.trialEndingSoon.addBillingCta}`,
    react: createElement(TrialEndingSoonEmail, {
      planName: input.planName,
      priceMonthly: input.priceMonthly,
      priceMonthlyNote: input.priceMonthlyNote,
      trialEndsAt: input.trialEndsAt,
      billingUrl: input.billingUrl,
      hasPaymentMethodOnFile: input.hasPaymentMethodOnFile,
    }),
  });
}

export interface SendAiCsEscalationNotificationInput {
  appId: string;
  organizationId: string;
  userId: string;
  sessionId: string;
  reason?: string | null;
  message?: string | null;
  contact?: string | null;
  currentPath?: string | null;
}

export async function sendAiCsEscalationNotification(
  input: SendAiCsEscalationNotificationInput,
): Promise<void> {
  const recipient =
    process.env.AI_CS_ESCALATION_NOTIFY_EMAIL?.trim() ||
    SUPPORT_EMAIL;

  if (!recipient) {
    return;
  }

  await sendEmail({
    to: recipient,
    subject: `AI-CS escalation - ${input.appId}`,
    react: createElement(AiCsEscalationEmail, {
      appId: input.appId,
      organizationId: input.organizationId,
      userId: input.userId,
      sessionId: input.sessionId,
      reason: input.reason,
      message: input.message,
      contact: input.contact,
      currentPath: input.currentPath,
    }),
  });
}
