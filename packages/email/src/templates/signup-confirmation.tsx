import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Text,
} from '@react-email/components'
import { PHIGUARD_EMAIL_PUBLIC_COPY as emailPublicCopy } from '@phiguard/brand/public-copy'
import { EmailBrandHeader } from './brand.js'

export interface SignupConfirmationEmailProps {
  firstName?: string
  appUrl: string
  resendUrl: string
  unsubscribeUrl: string
}

export function SignupConfirmationEmail({
  firstName,
  appUrl,
  resendUrl,
  unsubscribeUrl,
}: SignupConfirmationEmailProps) {
  const greeting = firstName
    ? `${emailPublicCopy.signupConfirmation.personalGreetingPrefix}, ${firstName}`
    : emailPublicCopy.signupConfirmation.defaultGreeting

  return (
    <Html>
      <Head />
      <Preview>{emailPublicCopy.signupConfirmation.preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailBrandHeader />
          <Text style={eyebrow}>{emailPublicCopy.signupConfirmation.eyebrow}</Text>
          <Heading style={heading}>{greeting}</Heading>
          <Text style={paragraph}>{emailPublicCopy.signupConfirmation.body}</Text>
          <Button href={appUrl} style={button}>
            {emailPublicCopy.signupConfirmation.cta}
          </Button>
          <Text style={paragraph}>{emailPublicCopy.signupConfirmation.resendHelp}</Text>
          <Text style={smallText}>
            <Link href={resendUrl} style={textLink}>{emailPublicCopy.signupConfirmation.resendLink}</Link>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            {emailPublicCopy.footerReasons.accountCreated}{' '}
            <Link href={unsubscribeUrl} style={footerLink}>{emailPublicCopy.unsubscribe.label}</Link>
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

const smallText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#324244',
  margin: '0 0 24px',
}

const textLink = {
  color: '#0f766e',
  textDecoration: 'underline',
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

const footerLink = {
  color: '#66685f',
  textDecoration: 'underline',
}
