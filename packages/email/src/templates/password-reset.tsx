import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import { PHIGUARD_EMAIL_PUBLIC_COPY as emailPublicCopy } from '@phiguard/brand/public-copy'
import { EmailBrandHeader } from './brand.js'

export interface PasswordResetEmailProps {
  resetUrl: string
  expiresInMinutes?: number
}

export function PasswordResetEmail({
  resetUrl,
  expiresInMinutes = 60,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{emailPublicCopy.passwordReset.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailBrandHeader />
          <Heading style={heading}>{emailPublicCopy.passwordReset.heading}</Heading>
          <Text style={paragraph}>
            {emailPublicCopy.passwordReset.bodyPrefix}{' '}
            {emailPublicCopy.passwordReset.expiresPrefix} {expiresInMinutes}{' '}
            {emailPublicCopy.passwordReset.expiresSuffix}
          </Text>
          <Button href={resetUrl} style={button}>
            {emailPublicCopy.passwordReset.cta}
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            {emailPublicCopy.passwordReset.footer}
          </Text>
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
  marginBottom: '24px',
}

const button = {
  backgroundColor: '#0f766e',
  color: '#ffffff',
  borderRadius: '999px',
  padding: '12px 24px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0 24px',
}

const footer = {
  fontSize: '13px',
  color: '#9ca3af',
}
