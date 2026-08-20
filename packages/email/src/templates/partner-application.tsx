import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import { SUPPORT_EMAIL, SUPPORT_EMAIL_MAILTO } from '@phiguard/brand/contact'
import {
  PHIGUARD_EMAIL_PUBLIC_COPY as emailPublicCopy,
  PHIGUARD_PARTNER_PROGRAM_COPY as partnerProgramCopy,
} from '@phiguard/brand/public-copy'
import { EmailBrandHeader } from './brand.js'

export interface PartnerApplicationEmailProps {
  partnerName: string
  company: string
}

export function PartnerApplicationEmail({ partnerName, company }: PartnerApplicationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{partnerProgramCopy.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailBrandHeader />
          <Heading style={heading}>{partnerProgramCopy.receivedHeading}</Heading>
          <Text style={paragraph}>{partnerProgramCopy.greetingPrefix} {partnerName},</Text>
          <Text style={paragraph}>{partnerProgramCopy.thankYou}</Text>
          <Text style={paragraph}>
            {partnerProgramCopy.applicationForPrefix} {company}. {partnerProgramCopy.applicationForSuffix}
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            {partnerProgramCopy.supportQuestion}{' '}
            <Link href={SUPPORT_EMAIL_MAILTO} style={link}>
              {SUPPORT_EMAIL}
            </Link>
            .
          </Text>
          <Text style={footerSig}>{emailPublicCopy.common.teamSignature}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const body = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

const container = {
  maxWidth: '560px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '40px',
  border: '1px solid #e5e7eb',
}

const heading = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '16px',
}

const paragraph = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#374151',
  marginBottom: '16px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0 24px',
}

const footer = {
  fontSize: '13px',
  color: '#6b7280',
}

const footerSig = {
  fontSize: '13px',
  color: '#6b7280',
  marginTop: '8px',
}

const link = {
  color: '#0f766e',
}
