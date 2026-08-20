import { Bullets, Callout, P, PdfLayout, Section, Subsection, Table } from '../layout/PdfLayout.js'

export default function HipaaBreachNotificationLetterTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Breach Notification Letter Template"
      subtitle="Individual breach notification letter with all required elements under 45 CFR § 164.404 and § 164.412."
    >
      <Section title="Required elements and how to use this template">
        <P>
          Under 45 CFR § 164.404(c), each individual breach notification must include specific elements. This
          template contains all required elements. Fill in every bracketed field before sending. Do not send a
          partially completed letter. Review with legal counsel if more than 500 individuals are affected or if
          the breach involved sensitive categories of PHI (mental health, substance use, HIV status, genetic
          information).
        </P>
        <Table
          headers={['Required Element', 'Template Location', 'Regulatory Citation']}
          rows={[
            ['Brief description of what happened', 'Section 1', '§ 164.404(c)(1)(i)'],
            ['Description of PHI types involved', 'Section 2', '§ 164.404(c)(1)(ii)'],
            ['Steps individuals should take to protect themselves', 'Section 3', '§ 164.404(c)(1)(iii)'],
            ["Description of covered entity's investigation and mitigation steps", 'Section 4', '§ 164.404(c)(1)(iv)'],
            ['Contact information for questions', 'Section 5', '§ 164.404(c)(1)(v)'],
          ]}
        />
        <Callout label="Delivery method">
          First-class mail to the last known address is the default (§ 164.404(d)(1)). Email is permitted only if
          the individual agreed to electronic notice. If the address is unknown for 10 or more individuals, a
          substitute notice on the clinic website or prominent media is required (§ 164.404(d)(2)).
        </Callout>
      </Section>

      <Section title="Letter template - fill in all bracketed fields">
        <Subsection title="Letter header">
          <Table
            headers={['Field', 'Entry']}
            rows={[
              ['Date of letter', '[DATE - must be sent no later than 60 days after discovery of breach]'],
              ['Clinic name', '[CLINIC LEGAL NAME]'],
              ['Clinic address', '[STREET ADDRESS, CITY, STATE, ZIP]'],
              ['Recipient name', '[PATIENT FULL NAME]'],
              ['Recipient address', '[PATIENT STREET ADDRESS, CITY, STATE, ZIP]'],
            ]}
          />
        </Subsection>

        <Subsection title="Subject line">
          <P>
            Important Notice Regarding Your Health Information - [CLINIC NAME]
          </P>
        </Subsection>

        <Subsection title="Opening paragraph">
          <P>
            Dear [PATIENT NAME]:
          </P>
          <P>
            We are writing to inform you of an incident that may have affected the security and privacy of your
            personal health information that [CLINIC NAME] maintains. We take the protection of your health
            information very seriously, and we are providing this notice to you as required by the Health Insurance
            Portability and Accountability Act (HIPAA).
          </P>
        </Subsection>

        <Subsection title="Section 1 - What happened">
          <P>
            On or about [DATE OF INCIDENT], [DESCRIBE WHAT HAPPENED - e.g., "we discovered that a laptop computer
            belonging to our practice was stolen from a staff member's vehicle" / "we discovered that a file
            containing patient information was mistakenly sent to an incorrect email address" / "we were notified
            by our billing vendor that unauthorized access to their system may have exposed patient records"].
            We discovered this incident on [DATE OF DISCOVERY].
          </P>
          <P>
            [DESCRIBE WHAT OCCURRED BETWEEN INCIDENT AND DISCOVERY IF RELEVANT - e.g., "Upon discovery, we
            immediately secured the affected systems and began an investigation."]
          </P>
        </Subsection>

        <Subsection title="Section 2 - What information was involved">
          <P>
            The information that may have been involved includes your: [LIST ALL PHI TYPES THAT WERE INVOLVED -
            check each that applies]:
          </P>
          <Bullets
            items={[
              '[ ] Name',
              '[ ] Address',
              '[ ] Date of birth',
              '[ ] Social Security number',
              '[ ] Insurance information / member ID',
              '[ ] Health insurance claim information',
              '[ ] Medical record number',
              '[ ] Dates of service',
              '[ ] Diagnoses / medical conditions',
              '[ ] Treatment information',
              '[ ] Prescription information',
              '[ ] Financial / billing information',
              '[ ] Other: [SPECIFY]',
            ]}
          />
          <P>
            [IF SENSITIVE PHI WAS INVOLVED - mental health records, HIV status, substance use disorder treatment,
            genetic information - add specific language: "We recognize that some of this information is particularly
            sensitive. We are taking extra steps to protect affected individuals and have notified appropriate
            regulators as required by law."]
          </P>
        </Subsection>

        <Subsection title="Section 3 - What you should do">
          <P>
            We recommend you take the following steps to protect yourself:
          </P>
          <Bullets
            items={[
              'Review the Explanation of Benefits or any statements you receive from your health insurer and contact your insurer if you see any services you do not recognize.',
              'Monitor your credit report for any unusual activity. Under federal law, you are entitled to one free credit report per year from each of the three major credit reporting agencies at AnnualCreditReport.com.',
              '[IF SSN OR FINANCIAL DATA WAS INVOLVED: Consider placing a fraud alert or credit freeze with the three major credit reporting agencies: Equifax (1-800-685-1111), Experian (1-888-397-3742), and TransUnion (1-800-888-4213).]',
              'Be alert to unsolicited contact from individuals claiming to represent your insurance company or healthcare provider asking for personal information.',
              '[IF SSN WAS INVOLVED: You may also contact the Federal Trade Commission at 1-877-438-4338 or IdentityTheft.gov for additional guidance on steps you can take.]',
            ]}
          />
        </Subsection>

        <Subsection title="Section 4 - What we are doing">
          <P>
            Upon discovering this incident, we took the following steps to address it and protect your information:
          </P>
          <Bullets
            items={[
              '[DESCRIBE IMMEDIATE CONTAINMENT - e.g., "We immediately revoked access to the affected system and secured the affected data."]',
              '[DESCRIBE INVESTIGATION - e.g., "We engaged a forensic investigator to determine the scope of the breach and whether your information was accessed."]',
              '[DESCRIBE REMEDIATION - e.g., "We have implemented additional technical safeguards to prevent a recurrence, including encryption of all portable devices and enhanced access controls."]',
              '[DESCRIBE ANY ADDITIONAL PROTECTION OFFERED - e.g., "We are offering [X months] of free credit monitoring to affected individuals. Instructions for enrollment are enclosed."]',
            ]}
          />
          <P>
            We have also reported this incident to the U.S. Department of Health and Human Services Office for
            Civil Rights as required by federal law.
          </P>
        </Subsection>

        <Subsection title="Section 5 - For more information">
          <P>
            If you have questions about this incident, please contact:
          </P>
          <Table
            headers={['Field', 'Entry']}
            rows={[
              ['Contact name and title', '[PRIVACY OFFICER NAME, Privacy Officer]'],
              ['Telephone number', '[DIRECT PHONE NUMBER - toll-free preferred]'],
              ['Email address', '[HIPAA-COMPLIANT EMAIL ADDRESS]'],
              ['Mailing address', '[CLINIC ADDRESS]'],
              ['Hours available', '[DAYS AND HOURS - e.g., Monday-Friday, 8:00 AM - 5:00 PM]'],
              ['Dedicated website (if applicable)', '[URL OF BREACH NOTIFICATION PAGE IF ESTABLISHED]'],
            ]}
          />
          <P>
            We sincerely regret that this incident occurred. We are committed to protecting your personal health
            information and have taken steps to strengthen our security practices as a result of this event.
          </P>
          <P>
            Sincerely,
          </P>
          <P>
            [AUTHORIZED SIGNATORY NAME]
            [TITLE]
            [CLINIC NAME]
          </P>
        </Subsection>
      </Section>

      <Section title="Pre-send checklist">
        <Table
          headers={['Item', 'Completed?']}
          rows={[
            ['All bracketed fields filled in', ''],
            ['Date of letter is within 60 days of breach discovery', ''],
            ['All 5 required elements present (§ 164.404(c))', ''],
            ['Reviewed by Privacy Officer', ''],
            ['Reviewed by legal counsel (if 500 or more affected or sensitive PHI)', ''],
            ['Copy retained in breach notification file (6-year retention)', ''],
            ['HHS notification submitted or scheduled', ''],
            ['Media notification required and scheduled (if 500 or more in one state)', ''],
            ['State AG notification completed (if applicable)', ''],
            ['Delivery method documented (first-class mail, email - per individual agreement)', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard stores breach notification records - letters sent, HHS submissions, delivery documentation -
          attached to the incident record for 6-year retention. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
