import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { EmailBrandHeader } from './brand.js'

export interface AiCsEscalationEmailProps {
  appId: string
  organizationId: string
  userId: string
  sessionId: string
  reason?: string | null
  message?: string | null
  contact?: string | null
  currentPath?: string | null
}

export function AiCsEscalationEmail({
  appId,
  organizationId,
  userId,
  sessionId,
  reason,
  message,
  contact,
  currentPath,
}: AiCsEscalationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>AI-CS escalation - {appId} - session {sessionId}</Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailBrandHeader />
          <Heading style={heading}>AI-CS escalation - {appId}</Heading>
          <Section>
            <Text style={label}>App</Text>
            <Text style={value}>{appId}</Text>

            <Text style={label}>Organization</Text>
            <Text style={value}>{organizationId}</Text>

            <Text style={label}>User</Text>
            <Text style={value}>{userId}</Text>

            <Text style={label}>Session</Text>
            <Text style={value}>{sessionId}</Text>

            <Text style={label}>Reason</Text>
            <Text style={value}>{reason ?? 'Not provided'}</Text>

            <Text style={label}>Contact</Text>
            <Text style={value}>{contact ?? 'Not provided'}</Text>

            <Text style={label}>Path</Text>
            <Text style={value}>{currentPath ?? 'Not provided'}</Text>

            <Text style={label}>Message</Text>
            <Text style={value}>{message ?? 'Not provided'}</Text>
          </Section>
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
  fontSize: '20px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '24px',
}

const label = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  margin: '0 0 2px',
}

const value = {
  fontSize: '14px',
  color: '#111827',
  margin: '0 0 16px',
  wordBreak: 'break-all' as const,
}
