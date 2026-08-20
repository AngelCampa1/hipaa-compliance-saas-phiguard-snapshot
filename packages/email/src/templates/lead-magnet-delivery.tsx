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
import { unsubscribeLink } from './marketing-email-styles.js'

export interface LeadMagnetDeliveryEmailProps {
  magnetTitle: string
  downloadUrl: string
  unsubscribeUrl: string
  isResourceDelivery: boolean
  // True when downloadUrl points at a signed PDF.
  isPdf: boolean
}

export function LeadMagnetDeliveryEmail({
  magnetTitle,
  downloadUrl,
  unsubscribeUrl,
  isResourceDelivery,
  isPdf,
}: LeadMagnetDeliveryEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {isResourceDelivery
          ? `${emailPublicCopy.leadMagnet.resourcePreviewPrefix} ${magnetTitle}`
          : `${emailPublicCopy.leadMagnet.newsletterPreviewPrefix} ${magnetTitle}`}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <EmailBrandHeader />
          <Heading style={heading}>
            {isResourceDelivery ? emailPublicCopy.leadMagnet.resourceHeading : emailPublicCopy.leadMagnet.welcomeHeading}
          </Heading>
          {isResourceDelivery ? (
            <>
              <Text style={paragraph}>
                {emailPublicCopy.leadMagnet.requestedPrefix} <strong>{magnetTitle}</strong>.
                {isPdf
                  ? ` ${emailPublicCopy.leadMagnet.pdfReady}`
                  : ` ${emailPublicCopy.leadMagnet.resourcePageReady}`}
              </Text>
              <Button href={downloadUrl} style={button}>
                {isPdf
                  ? `${emailPublicCopy.leadMagnet.downloadPrefix} ${magnetTitle} ${emailPublicCopy.leadMagnet.pdfSuffix}`
                  : `${emailPublicCopy.leadMagnet.openPrefix} ${magnetTitle}`}
              </Button>
              <Text style={paragraph}>
                {emailPublicCopy.leadMagnet.resourceHelp}
              </Text>
            </>
          ) : (
            <>
              <Text style={paragraph}>
                {emailPublicCopy.leadMagnet.newsletterThanksPrefix} <strong>{magnetTitle}</strong>.{' '}
                {emailPublicCopy.leadMagnet.newsletterHelp}
              </Text>
              <Button href={downloadUrl} style={button}>
                {emailPublicCopy.leadMagnet.browseResourcesCta}
              </Button>
            </>
          )}
          <Hr style={hr} />
          <Text style={paragraph}>
            {emailPublicCopy.leadMagnet.productPitch}
          </Text>
          <Button href={emailPublicCopy.leadMagnet.signupUrl} style={buttonSecondary}>
            {emailPublicCopy.leadMagnet.trialCta}
          </Button>
          <Text style={paragraph}>{emailPublicCopy.leadMagnet.trialFinePrint}</Text>
          <Hr style={hr} />
          <Text style={footer}>
            {isResourceDelivery ? emailPublicCopy.footerReasons.leadMagnet : emailPublicCopy.footerReasons.newsletter}
          </Text>
          {/* Every recipient of this email is on ongoing marketing email -
              newsletter signups, and lead-magnet downloaders who are enrolled in
              the follow-up nurture flow on delivery. So the opt-out link is always
              shown; the /unsubscribe handler also suppresses the contact in the
              Sequencer, making the opt-out genuine for both audiences. */}
          <Text style={footer}>
            <Link href={unsubscribeUrl} style={unsubscribeLink}>
              {emailPublicCopy.unsubscribe.label}
            </Link>
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
  marginBottom: '16px',
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
  marginBottom: '24px',
}

const buttonSecondary = {
  backgroundColor: '#111827',
  color: '#ffffff',
  borderRadius: '999px',
  padding: '12px 24px',
  fontSize: '15px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
  marginBottom: '24px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0 24px',
}

const footer = {
  fontSize: '13px',
  color: '#9ca3af',
}
