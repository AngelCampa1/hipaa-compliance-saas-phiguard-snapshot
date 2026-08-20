import { Bullets, Callout, P, PdfLayout, Section, Subsection, Table } from '../layout/PdfLayout.js'

export default function HipaaBreachDecisionTreeDocument() {
  return (
    <PdfLayout
      title="HIPAA Breach Notification Decision Tree"
      subtitle="A step-by-step determination guide, the four LOPC factors, timelines, and four worked examples."
    >
      <Section title="How to use this guide">
        <P>
          When something goes wrong - a laptop disappears, a fax misroutes, a ransomware alert fires - the first job is
          not to panic and it is not to notify. The first job is to determine whether what happened meets the HIPAA
          definition of a Breach. That determination sits in §164.402 and governs every notification downstream. Use
          the four-step path below, document each step in writing, and keep that documentation for six years per
          §164.530(j).
        </P>
      </Section>

      <Section title="The four-step determination">
        <Subsection title="Step 1 - Was PHI involved?">
          <P>
            Confirm that the information at issue is protected health information under §160.103: individually
            identifiable health information held or transmitted by a covered entity or business associate. If the data
            was fully de-identified under §164.514 or was limited to employment records held in the clinic's role as
            employer, stop here.
          </P>
        </Subsection>
        <Subsection title="Step 2 - Was there an impermissible acquisition, access, use, or disclosure?">
          <P>
            Compare what happened against what is permitted under Subpart E of Part 164. Permitted disclosures include
            treatment, payment, healthcare operations, and disclosures authorized by the individual. If the disclosure
            was permitted, it is not a breach. If it was not permitted, continue.
          </P>
        </Subsection>
        <Subsection title="Step 3 - Apply the LOPC analysis under §164.402">
          <P>
            Under the Omnibus Rule, an impermissible use or disclosure is presumed to be a breach unless the covered
            entity or business associate demonstrates a low probability that the PHI has been compromised based on a
            risk assessment of the four factors below. The burden of proof is on the clinic. The analysis must be
            documented in writing.
          </P>
        </Subsection>
        <Subsection title="Step 4 - Does an exception apply?">
          <P>The three statutory exceptions in §164.402(1) are narrow:</P>
          <Bullets
            items={[
              'Unintentional acquisition by a workforce member acting in good faith within the scope of authority, with no further impermissible use or disclosure.',
              'Inadvertent disclosure between authorized persons at the same covered entity or business associate, again with no further impermissible use or disclosure.',
              'A good-faith belief that the unauthorized person to whom PHI was disclosed would not reasonably have been able to retain it (for example, a misdirected letter returned unopened).',
            ]}
          />
        </Subsection>
      </Section>

      <Section title="The four LOPC factors">
        <P>
          Each factor must be evaluated and documented. A low-probability conclusion that skips a factor will not
          survive OCR review.
        </P>
        <Bullets
          items={[
            'Nature and extent of the PHI involved - including the types of identifiers and the likelihood of re-identification. A spreadsheet with names, diagnoses, and dates is higher risk than a billing code alone.',
            'Identity of the unauthorized person who used the PHI or to whom the disclosure was made - a disclosure to another covered entity carries different risk than disclosure to an unknown third party.',
            'Whether the PHI was actually acquired or viewed - forensic evidence that a file was never opened can support a low-probability determination. Mere theoretical access is not the same as actual viewing.',
            'Extent to which the risk has been mitigated - for example, written assurances that the recipient destroyed the PHI, or remote-wipe confirmation on a lost device.',
          ]}
        />
      </Section>

      <Section title="Notification timelines">
        <Table
          headers={['Audience', 'Deadline', 'Citation']}
          rows={[
            ['Affected individuals', 'Within 60 days of discovery', '§164.404'],
            ['HHS - if 500 or more individuals', 'Within 60 days of discovery', '§164.408(b)'],
            ['HHS - if <500 individuals', 'Annual log, within 60 days of year-end', '§164.408(c)'],
            ['Media - if 500 or more in a state or jurisdiction', 'Within 60 days of discovery', '§164.406'],
            ['Business Associate to Covered Entity', 'Per BAA (recommend 24 hours)', '§164.410'],
          ]}
        />
        <Callout label="Discovery clock">
          The 60-day clock starts on the first day the breach is known, or by exercising reasonable diligence would have
          been known, to any workforce member other than the person who caused it. Delay in escalation does not delay
          the clock.
        </Callout>
      </Section>

      <Section title="Four worked examples">
        <Subsection title="Example 1 - Stolen laptop with unencrypted PHI">
          <P>
            A provider's laptop is stolen from a car. The laptop stored an unencrypted export of 1,200 patient records.
            Because the data was not encrypted to the §164.304 standard, it is Unsecured PHI. LOPC cannot reasonably be
            established - the identity of the thief is unknown and mitigation is not possible. This is a reportable
            breach: notify individuals, HHS, and (because 500 or more are in one state) the media within 60 days.
          </P>
        </Subsection>
        <Subsection title="Example 2 - Misdirected fax to a known provider">
          <P>
            A referral fax goes to the wrong specialist's office in the same city. The receiving office calls, confirms
            the fax has been shredded, and provides a written attestation. LOPC analysis: the recipient is another
            covered entity bound by HIPAA, the PHI was limited to one referral page, and mitigation is documented. This
            may support a low-probability determination and thus no notification - but the assessment and the
            attestation must be retained.
          </P>
        </Subsection>
        <Subsection title="Example 3 - Ransomware with confirmed data exfiltration">
          <P>
            An endpoint is infected with ransomware that the forensic investigator confirms exfiltrated a database
            backup before encrypting it. The 2016 HHS ransomware guidance is clear: the presence of ransomware on a
            system containing PHI is presumptively a breach unless LOPC is demonstrated. With confirmed exfiltration,
            LOPC cannot be demonstrated. Notify.
          </P>
        </Subsection>
        <Subsection title="Example 4 - Email to the wrong patient">
          <P>
            A billing clerk emails an invoice containing a diagnosis to the wrong patient in the practice. The clinic
            contacts the wrong recipient, who confirms deletion and signs an attestation. One patient is affected, the
            recipient is known, and mitigation is documented. This can often qualify for a low-probability finding
            under the four factors - but the determination must be written and the breach log updated.
          </P>
        </Subsection>
      </Section>

      <Section title="Breach determination log template">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['Incident ID', ''],
            ['Date discovered', ''],
            ['Description of what happened', ''],
            ['Number of individuals affected', ''],
            ['Types of PHI involved', ''],
            ['Factor 1 - Nature and extent', ''],
            ['Factor 2 - Identity of recipient', ''],
            ['Factor 3 - Was PHI actually viewed', ''],
            ['Factor 4 - Mitigation', ''],
            ['Exception applied?', ''],
            ['Conclusion (breach / no breach)', ''],
            ['Signed by (privacy officer)', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard walks your team through this determination in the moment, captures the LOPC analysis as you go, and
          keeps the six-year retention clock. If you want the decision tree embedded in your incident flow, see
          phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
