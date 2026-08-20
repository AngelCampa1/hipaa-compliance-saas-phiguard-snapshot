import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { PHIGUARD_EMAIL_PUBLIC_COPY as emailPublicCopy } from '@phiguard/brand/public-copy'
import { EmailBrandHeader } from './brand.js'

export interface TrialStartedEmailProps {
  planName: string
  priceMonthly: number
  priceMonthlyNote?: string
  trialStartedAt: Date
  trialEndsAt: Date
  billingUrl: string
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(date)
}

export function TrialStartedEmail({
  planName,
  priceMonthly,
  priceMonthlyNote,
  trialStartedAt,
  trialEndsAt,
  billingUrl,
}: TrialStartedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{emailPublicCopy.trialStarted.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailBrandHeader />
          <Text style={eyebrow}>{emailPublicCopy.trialStarted.eyebrow}</Text>
          <Heading style={heading}>Your {planName} {emailPublicCopy.trialStarted.headingSuffix}</Heading>
          <Text style={paragraph}>
            {emailPublicCopy.trialStarted.bodyPrefix} {formatDate(trialStartedAt)}.{' '}
            {emailPublicCopy.trialStarted.noCardContinuation} {formatDate(trialEndsAt)}.
          </Text>

          <Section style={facts}>
            <Text style={factLabel}>{emailPublicCopy.trialStarted.planLabel}</Text>
            <Text style={factValue}>{planName}</Text>
            <Text style={factLabel}>{emailPublicCopy.trialStarted.trialEndsLabel}</Text>
            <Text style={factValue}>{formatDate(trialEndsAt)}</Text>
            <Text style={factLabel}>{emailPublicCopy.trialStarted.paidPlanLabel}</Text>
            <Text style={factValue}>
              ${priceMonthly}/month{priceMonthlyNote ? ` ${priceMonthlyNote}` : ''} {emailPublicCopy.trialStarted.paidPlanAmountSuffix}
            </Text>
          </Section>

          <Button href={billingUrl} style={button}>
            {emailPublicCopy.trialStarted.billingCta}
          </Button>

          <Hr style={hr} />
          <Text style={footer}>
            {emailPublicCopy.trialStarted.footer}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#f4f4ef',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: '#172426',
}

const container = {
  maxWidth: '560px',
  margin: '32px auto',
  backgroundColor: '#fffdf8',
  borderRadius: '20px',
  padding: '40px',
  border: '1px solid #d8d4c8',
}

const eyebrow = {
  fontSize: '12px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: '#6b6c60',
  marginBottom: '12px',
}

const heading = {
  fontSize: '28px',
  lineHeight: '1.2',
  fontWeight: '700',
  color: '#152123',
  margin: '0 0 16px',
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#324244',
  margin: '0 0 24px',
}

const facts = {
  backgroundColor: '#f0ede4',
  borderRadius: '16px',
  padding: '20px 22px',
  marginBottom: '24px',
}

const factLabel = {
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#76745f',
  margin: '0 0 4px',
}

const factValue = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#172426',
  margin: '0 0 14px',
  fontWeight: '600',
}

const button = {
  backgroundColor: '#0f766e',
  color: '#fffdf8',
  borderRadius: '999px',
  padding: '12px 24px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
}

const hr = {
  borderColor: '#ded8cb',
  margin: '32px 0 24px',
}

const footer = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#66685f',
}
