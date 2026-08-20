import { Resend } from "resend";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { logger } from "@phiguard/audit";
import { SUPPORT_EMAIL_FROM } from "@phiguard/brand/contact";
import nodemailer from "nodemailer";

export interface SendEmailOptions {
  to: string;
  from?: string; // defaults to EMAIL_FROM env var or PHIGuard support sender
  subject: string;
  react: ReactElement;
  tags?: Array<{ name: string; value: string }>;
}

const DEFAULT_FROM = SUPPORT_EMAIL_FROM;

let _resend: Resend | null = null;
let _resendApiKey: string | null = null;

function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }

  if (!_resend || _resendApiKey !== apiKey) {
    _resend = new Resend(apiKey);
    _resendApiKey = apiKey;
  }
  return _resend;
}

function isPlaceholderResendApiKey(apiKey: string): boolean {
  const normalized = apiKey.trim().toLowerCase();
  return (
    normalized.startsWith("re_placeholder") ||
    normalized.startsWith("replace_me")
  );
}

export async function sendEmail(
  opts: SendEmailOptions,
): Promise<{ messageId: string }> {
  if (process.env.NODE_ENV === "test") {
    const recipientDomain = opts.to.includes("@")
      ? opts.to.split("@")[1]
      : "[unknown]";
    logger.safe.info(
      { recipientDomain, subject: opts.subject, component: "resend" },
      "resend: test mode - email not sent",
    );
    return { messageId: "test-message-id" };
  }

  const from = opts.from ?? process.env.EMAIL_FROM ?? DEFAULT_FROM;
  const html = await render(opts.react);

  // Dev SMTP fallback: route to Mailpit when RESEND_API_KEY is absent or a placeholder
  const apiKey = process.env.RESEND_API_KEY;
  const hasRealApiKey = !!apiKey && !isPlaceholderResendApiKey(apiKey);
  if (process.env.NODE_ENV !== "production" && !hasRealApiKey) {
    const host = process.env.MAIL_SMTP_HOST ?? "localhost";
    const port = Number(process.env.MAIL_SMTP_PORT ?? 1025);
    const transport = nodemailer.createTransport({ host, port, secure: false });
    const info = await transport.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html,
    });
    const recipientDomain = opts.to.includes("@")
      ? opts.to.split("@")[1]
      : "[unknown]";
    logger.safe.info(
      { recipientDomain, subject: opts.subject, component: "resend" },
      "resend: dev smtp - email routed to mailpit",
    );
    return { messageId: info.messageId };
  }

  const resend = getResend();

  const { data, error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html,
    tags: opts.tags,
  });

  if (error || !data) {
    throw new Error(
      `Failed to send email: ${error?.message ?? "unknown error"}`,
    );
  }

  return { messageId: data.id };
}
