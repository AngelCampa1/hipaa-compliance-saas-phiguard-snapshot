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

export interface OrgInviteEmailProps {
  acceptUrl: string
  expiresAt: Date
  inviterName: string
  organizationName: string
  role: string
}

export function OrgInviteEmail({
  acceptUrl,
  expiresAt,
  inviterName,
  organizationName,
  role,
}: OrgInviteEmailProps) {
  const expiresAtStr = expiresAt.toUTCString()

  return (
    <Html>
      <Head />
      <Preview>
        {inviterName} {emailPublicCopy.invite.previewJoin} {organizationName} {emailPublicCopy.invite.previewSuffix}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailBrandHeader />
          <Heading style={heading}>{emailPublicCopy.invite.heading}</Heading>
          <Text style={paragraph}>
            <strong>{inviterName}</strong> {emailPublicCopy.invite.bodyJoin}{' '}
            <strong>{organizationName}</strong> {emailPublicCopy.invite.rolePrefix} <strong>{role}</strong>.
          </Text>
          <Button href={acceptUrl} style={button}>
            {emailPublicCopy.invite.cta}
          </Button>
          <Hr style={hr} />
          <Text style={footer}>{emailPublicCopy.invite.expiresPrefix} {expiresAtStr}.</Text>
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
