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

export interface TrialEndingSoonEmailProps {
  planName: string
  priceMonthly: number
  priceMonthlyNote?: string
  trialEndsAt: Date
  billingUrl: string
  hasPaymentMethodOnFile: boolean
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(date)
}

export function TrialEndingSoonEmail({
  planName,
  priceMonthly,
  priceMonthlyNote,
  trialEndsAt,
  billingUrl,
  hasPaymentMethodOnFile,
}: TrialEndingSoonEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{emailPublicCopy.trialEndingSoon.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailBrandHeader />
          <Text style={eyebrow}>{emailPublicCopy.trialEndingSoon.eyebrow}</Text>
          <Heading style={heading}>Your {planName} {emailPublicCopy.trialEndingSoon.headingSuffix}</Heading>
          <Text style={paragraph}>
            {hasPaymentMethodOnFile
              ? `${emailPublicCopy.trialEndingSoon.withPaymentPrefix} ${formatDate(trialEndsAt)}. ${emailPublicCopy.trialEndingSoon.withPaymentSuffix}`
              : `${emailPublicCopy.trialEndingSoon.withoutPaymentPrefix} ${formatDate(trialEndsAt)}. ${emailPublicCopy.trialEndingSoon.withoutPaymentSuffix}`}
          </Text>

          <Section style={facts}>
            <Text style={factLabel}>{emailPublicCopy.trialEndingSoon.trialEndDateLabel}</Text>
            <Text style={factValue}>{formatDate(trialEndsAt)}</Text>
            <Text style={factLabel}>{emailPublicCopy.trialEndingSoon.planLabel}</Text>
            <Text style={factValue}>{planName}</Text>
            <Text style={factLabel}>{emailPublicCopy.trialEndingSoon.paidPlanAmountLabel}</Text>
            <Text style={factValue}>${priceMonthly}/month{priceMonthlyNote ? ` ${priceMonthlyNote}` : ''}</Text>
          </Section>

          <Button href={billingUrl} style={button}>
            {hasPaymentMethodOnFile
              ? emailPublicCopy.trialEndingSoon.reviewBillingCta
              : emailPublicCopy.trialEndingSoon.addBillingCta}
          </Button>

          <Hr style={hr} />
          <Text style={footer}>
            {hasPaymentMethodOnFile
              ? emailPublicCopy.trialEndingSoon.withPaymentFooter
              : emailPublicCopy.trialEndingSoon.withoutPaymentFooter}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#f5f1eb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: '#241b16',
}

const container = {
  maxWidth: '560px',
  margin: '32px auto',
  backgroundColor: '#fffaf5',
  borderRadius: '20px',
  padding: '40px',
  border: '1px solid #e1d6c9',
}

const eyebrow = {
  fontSize: '12px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: '#816a5e',
  marginBottom: '12px',
}

const heading = {
  fontSize: '28px',
  lineHeight: '1.2',
  fontWeight: '700',
  color: '#2b211b',
  margin: '0 0 16px',
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.7',
  color: '#54453a',
  margin: '0 0 24px',
}

const facts = {
  backgroundColor: '#f3e9df',
  borderRadius: '16px',
  padding: '20px 22px',
  marginBottom: '24px',
}

const factLabel = {
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.08em',
  color: '#8f6d58',
  margin: '0 0 4px',
}

const factValue = {
  fontSize: '16px',
  lineHeight: '1.5',
  color: '#2b211b',
  margin: '0 0 14px',
  fontWeight: '600',
}

const button = {
  backgroundColor: '#0f766e',
  color: '#fffaf5',
  borderRadius: '999px',
  padding: '12px 24px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
}

const hr = {
  borderColor: '#e7dbcf',
  margin: '32px 0 24px',
}

const footer = {
  fontSize: '13px',
  lineHeight: '1.6',
  color: '#7a6658',
}
