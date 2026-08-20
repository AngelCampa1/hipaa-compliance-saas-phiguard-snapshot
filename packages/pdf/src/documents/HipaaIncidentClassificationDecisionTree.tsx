import { Bullets, Callout, P, PdfLayout, Section, Subsection, Table } from '../layout/PdfLayout.js'

export default function HipaaIncidentClassificationDecisionTreeDocument() {
  return (
    <PdfLayout
      title="HIPAA Incident Classification Decision Tree"
      subtitle="Step-by-step incident classification guide - from initial report through Breach, Near-Miss, or No Action determination."
    >
      <Section title="How to use this decision tree">
        <P>
          Work through each step in order. Document your answers at each decision point before moving to the next.
          Do not skip steps - OCR's guidance requires that each factor be evaluated and documented, even when the
          answer seems obvious. Retain completed determinations for 6 years per 45 CFR § 164.530(j).
        </P>
        <Callout label="Presumption of breach">
          Under the Omnibus Rule, an impermissible use or disclosure of unsecured PHI is presumed to be a reportable
          breach. The burden of proof is on the covered entity to demonstrate a low probability of compromise.
          Start from the presumption of breach and document your way to an exception - not the other way around.
        </Callout>
      </Section>

      <Section title="Step 1 - Was PHI involved?">
        <Subsection title="Question: Does the incident involve protected health information?">
          <P>
            PHI is individually identifiable health information - information that relates to the past, present, or
            future physical or mental health of an individual, the provision of health care, or payment for health
            care - that identifies the individual or provides a reasonable basis for identification (45 CFR § 160.103).
          </P>
          <Bullets
            items={[
              'Examples of PHI: patient names, medical record numbers, diagnoses, dates of service, billing information, email addresses linked to care.',
              'NOT PHI: fully de-identified data under 45 CFR § 164.514; employment records held in the employer capacity; information about deceased patients held beyond 50 years.',
            ]}
          />
          <Table
            headers={['Decision', 'Next Step']}
            rows={[
              ['YES - PHI was involved', 'Continue to Step 2'],
              ['NO - PHI was not involved', 'OUTCOME: No Action Required. Document the determination and reason.'],
            ]}
          />
        </Subsection>
        <P>Documentation: [Was PHI involved? Description of data involved:]</P>
      </Section>

      <Section title="Step 2 - Was the PHI secured?">
        <Subsection title="Question: Was the PHI encrypted or otherwise rendered unusable, unreadable, or indecipherable?">
          <P>
            Under 45 CFR § 164.402, breach notification requirements apply only to "unsecured PHI" - PHI that has
            not been rendered unusable, unreadable, or indecipherable through a technology or methodology specified
            by HHS guidance. Encrypted data that meets the HHS specification is not unsecured PHI.
          </P>
          <Bullets
            items={[
              'Secured PHI examples: data encrypted to NIST-approved standards (e.g., AES-256); data on a device that was remotely wiped before unauthorized access occurred; data that was destroyed per NIST SP 800-88.',
              'Unsecured PHI examples: unencrypted files on a stolen laptop; plaintext data in a misdirected email; paper records left in an accessible location.',
            ]}
          />
          <Table
            headers={['Decision', 'Next Step']}
            rows={[
              ['YES - PHI was secured (encrypted/destroyed)', 'OUTCOME: No Action Required under Breach Notification Rule. Document encryption evidence.'],
              ['NO - PHI was unsecured', 'Continue to Step 3'],
            ]}
          />
        </Subsection>
        <P>Documentation: [Was PHI secured? Evidence of encryption or destruction:]</P>
      </Section>

      <Section title="Step 3 - Was there an impermissible use or disclosure?">
        <Subsection title="Question: Was the access, use, or disclosure permitted under the Privacy Rule?">
          <P>
            Permitted uses and disclosures include: treatment, payment, healthcare operations (§ 164.506); public
            health (§ 164.512(b)); disclosures to individuals (§ 164.502(a)(1)(i)); uses and disclosures authorized
            by the individual (§ 164.508); required by law (§ 164.512(a)). If the access was permitted, it is not
            an impermissible disclosure.
          </P>
          <Table
            headers={['Decision', 'Next Step']}
            rows={[
              ['Permissible - the access/disclosure was authorized or falls within a Privacy Rule exception', 'OUTCOME: No Action Required. Document the permissible basis.'],
              ['Impermissible - the access/disclosure was not authorized and does not fall within a Privacy Rule exception', 'Continue to Step 4'],
            ]}
          />
        </Subsection>
        <P>Documentation: [Was the use/disclosure permissible? Basis for determination:]</P>
      </Section>

      <Section title="Step 4 - Does a statutory exception apply?">
        <Subsection title="Question: Does one of the three exceptions under 45 CFR § 164.402(1) apply?">
          <Bullets
            items={[
              'Exception A: Unintentional acquisition, access, or use by a workforce member or person acting under the authority of a covered entity or business associate, if made in good faith and within the scope of authority, and the information is not further used or disclosed in an impermissible manner.',
              'Exception B: Inadvertent disclosure from one person authorized to access PHI at a covered entity or business associate to another person authorized to access PHI at the same covered entity or business associate (or organized health care arrangement), and the information is not further used or disclosed in an impermissible manner.',
              'Exception C: A disclosure where the covered entity or business associate has a good faith belief that the unauthorized person to whom the impermissible disclosure was made would not reasonably have been able to retain the information (e.g., a misdirected letter returned unopened and destroyed).',
            ]}
          />
          <Table
            headers={['Decision', 'Next Step']}
            rows={[
              ['YES - a statutory exception applies and is documentable', 'OUTCOME: Near-Miss. Document which exception applies and the supporting facts. Retain for 6 years.'],
              ['NO - no statutory exception applies', 'Continue to Step 5'],
            ]}
          />
        </Subsection>
        <P>Documentation: [Which exception, if any, applies? Supporting facts:]</P>
      </Section>

      <Section title="Step 5 - Four-factor LOPC analysis (Low Probability of Compromise)">
        <P>
          For each factor below, document the analysis in writing. A low-probability determination that does not
          address all four factors will not survive OCR review. This is not a checklist to be completed quickly
          - it is a documented risk assessment.
        </P>
        <Subsection title="Factor 1 - Nature and extent of the PHI involved">
          <P>
            Consider: What types of PHI were involved? How many individuals? Does the PHI include identifiers that
            increase re-identification risk? Does it include sensitive categories (mental health, HIV, substance use,
            genetic information, financial information)?
          </P>
          <P>Documentation: [Factor 1 analysis:]</P>
        </Subsection>
        <Subsection title="Factor 2 - Who used the PHI or to whom was it disclosed">
          <P>
            Consider: Is the recipient another covered entity bound by HIPAA? An unknown third party? A prior
            patient? A known individual who provided a written attestation of destruction? An anonymous recipient
            whose identity cannot be determined?
          </P>
          <P>Documentation: [Factor 2 analysis:]</P>
        </Subsection>
        <Subsection title="Factor 3 - Whether the PHI was actually acquired or viewed">
          <P>
            Consider: Is there forensic evidence that the data was never opened or accessed? Was the email deleted
            without being read (and do you have confirmation from the recipient)? Was the device encrypted and the
            data never accessed? Speculation that data was not viewed is not sufficient - document the evidence.
          </P>
          <P>Documentation: [Factor 3 analysis and evidence:]</P>
        </Subsection>
        <Subsection title="Factor 4 - Extent to which the risk has been mitigated">
          <P>
            Consider: Did the recipient return the PHI or provide written attestation of destruction? Was a lost
            device remotely wiped? Was unauthorized access revoked before the data was used? Mitigation does not
            retroactively prevent a breach but can support a low-probability determination when combined with the
            other three factors.
          </P>
          <P>Documentation: [Factor 4 analysis and mitigation evidence:]</P>
        </Subsection>

        <Table
          headers={['LOPC Determination', 'Next Step']}
          rows={[
            ['Low probability demonstrated across all 4 factors - with documented evidence for each', 'OUTCOME: Near-Miss (No notification required). Retain LOPC analysis for 6 years. Add to breach log.'],
            ['Low probability NOT demonstrated - one or more factors unsatisfied or undocumented', 'OUTCOME: Reportable Breach. Proceed to Step 6.'],
          ]}
        />
        <P>Documentation: [Overall LOPC determination and conclusion:]</P>
      </Section>

      <Section title="Step 6 - Breach confirmed: notification planning">
        <Table
          headers={['Notification Required', 'Deadline', 'Responsible Party', 'Completed Date']}
          rows={[
            ['Affected individuals', '60 days from discovery', 'Privacy Officer', ''],
            ['HHS (if 500 or more affected)', '60 days from discovery', 'Privacy Officer', ''],
            ['HHS (if <500 affected)', 'Annual log - within 60 days of year-end', 'Privacy Officer', ''],
            ['Prominent media (if 500 or more in one state)', '60 days from discovery', 'Privacy Officer + Counsel', ''],
            ['Business Associate to Covered Entity notification', 'Per BAA (recommend 24 hours)', 'BA Security Officer', ''],
            ['State AG notification (if applicable)', 'Per state law', 'Privacy Officer + Counsel', ''],
          ]}
        />
      </Section>

      <Section title="Incident classification summary">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['Incident ID', ''],
            ['Date of incident or discovery', ''],
            ['Brief description', ''],
            ['Classification outcome', ''],
            ['Determination completed by', ''],
            ['Date of determination', ''],
            ['Reviewed / approved by Privacy Officer', ''],
            ['Notifications required', ''],
            ['Notifications sent (dates)', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard walks your team through this classification in the moment, captures each factor as you go, and
          keeps the determination attached to the incident record. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
