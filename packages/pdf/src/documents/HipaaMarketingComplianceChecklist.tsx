import { Bullets, Callout, P, PdfLayout, Section } from '../layout/PdfLayout.js'

export default function HipaaMarketingComplianceChecklist() {
  return (
    <PdfLayout
      title="HIPAA-Compliant Marketing Checklist for Clinics"
      subtitle="What clinic marketers can and cannot do under the Privacy Rule"
    >
      <Section title="What HIPAA calls marketing">
        <P>
          45 CFR 164.501 defines marketing as a communication about a product or service that encourages
          recipients to purchase or use it. Treatment communications, case management, and certain
          health-related communications from the covered entity are excluded. The exclusions are narrower than
          most marketers assume. The moment a third party pays the clinic to promote a product, or the message
          is unrelated to current treatment, it is marketing under HIPAA.
        </P>
        <Callout label="Quick test">
          Is the clinic being paid by a third party to send this? Is the message unrelated to a current
          treatment relationship? If yes to either, it is marketing and authorization is required.
        </Callout>
      </Section>

      <Section title="Authorization requirements">
        <P>
          45 CFR 164.508(a)(3) requires a valid HIPAA authorization for marketing uses or disclosures of PHI,
          with limited face-to-face exceptions. The authorization must contain the core elements in 45 CFR
          164.508(c): description of information, named recipient, purpose, expiration, signature, and right
          to revoke.
        </P>
        <Bullets
          items={[
            'Verbal yes does not qualify. Get a written, signed authorization.',
            'A text message or DM agreement does not qualify.',
            'Authorization must include an expiration date or event.',
            'Patient must be told they may revoke in writing.',
            'If marketing involves third-party payment, authorization must disclose that fact.',
          ]}
        />
      </Section>

      <Section title="Treatment communications exception">
        <Bullets
          items={[
            'Appointment reminders are treatment communications, not marketing.',
            'Follow-up care instructions are treatment communications.',
            'Refill reminders are permitted only if any payment received is reasonable in amount.',
            'Recommendations of alternative treatments from the provider are not marketing.',
            'When in doubt, ask whether the message would still be sent if the third party were not paying.',
          ]}
        />
      </Section>

      <Section title="Patient testimonials">
        <P>
          A testimonial that identifies a patient or the clinical context is a use of PHI for marketing. Get a
          signed authorization that meets 45 CFR 164.508(c) before publishing - on the website, in social
          media, in an ad, or in a brochure. Keep the signed authorization on file for six years.
        </P>
        <Bullets
          items={[
            'A 5-star Google review is not an authorization. Do not republish without one.',
            'Initials only do not de-identify a testimonial that names the condition or provider.',
            'Authorization must be specific to the marketing use; a general consent does not cover it.',
          ]}
        />
      </Section>

      <Section title="Before/after photos">
        <Bullets
          items={[
            'Before/after images of identifiable patients require a signed authorization.',
            'Cropping the face does not de-identify if other features (tattoo, scar, location) could identify.',
            'Apply 45 CFR 164.514(a)-(b) de-identification rules and document the method used.',
            'Maintain a release log tying each image to its signed authorization.',
            'Honor revocation: remove images promptly when the patient revokes consent.',
          ]}
        />
      </Section>

      <Section title="De-identified content">
        <P>
          Content that meets the de-identification standard in 45 CFR 164.514(a)-(b) is no longer PHI and may
          be used in marketing without authorization. Use either the Expert Determination method or the Safe
          Harbor method, which removes 18 specified identifiers. Document which method was used and keep the
          documentation.
        </P>
      </Section>

      <Section title="Email marketing and patient lists">
        <Bullets
          items={[
            'Do not pull a marketing email list out of the EHR or scheduling system.',
            'Maintain a separate marketing list built from explicit opt-in.',
            'Newsletters about new services or seasonal offers are marketing, not treatment.',
            'Honor unsubscribe requests immediately and log the action.',
            'Confirm the email vendor has a signed BAA before any list contains PHI.',
          ]}
        />
      </Section>

      <Section title="Social media">
        <Bullets
          items={[
            'Never confirm in public that someone is a patient.',
            'Do not respond to public reviews with anything that acknowledges a treatment relationship.',
            'Do not post photos taken inside clinical areas without authorizations and screening.',
            'Train staff that liking, sharing, or quoting a patient post can constitute disclosure.',
            'Maintain a written social media policy and document workforce training on it.',
          ]}
        />
      </Section>

      <Section title="Website tracking pixels">
        <P>
          HHS December 2022 guidance on online tracking technologies, updated in March 2024, sets the current
          OCR position. Tracking technologies on user-authenticated pages and on pages that address specific
          conditions or providers can transmit PHI to the tracking vendor. That requires a BAA - or removal.
        </P>
        <Bullets
          items={[
            'No third-party tracking on the patient portal.',
            'No third-party tracking on appointment scheduling pages.',
            'No third-party tracking on condition-specific landing pages without a BAA in place.',
            'Audit Google Analytics, Meta Pixel, and similar tools against this guidance.',
            'Document removal or BAA status for each tracker on each route.',
          ]}
        />
      </Section>

      <Section title="Common mistakes that trigger OCR investigations">
        <Bullets
          items={[
            'Republishing a Google or Yelp review on the website without authorization.',
            'Posting before/after photos with cropped faces but identifiable context.',
            'Sending a clinic newsletter to the full EHR patient list.',
            'Running Meta Pixel on the patient portal or scheduling pages.',
            'Confirming a patient relationship in a public social media reply.',
            'Using a marketing vendor that does not have a signed BAA but receives PHI.',
          ]}
        />
      </Section>
    </PdfLayout>
  )
}
