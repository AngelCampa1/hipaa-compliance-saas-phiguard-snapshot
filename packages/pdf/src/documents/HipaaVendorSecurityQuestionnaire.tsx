import { Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaVendorSecurityQuestionnaireDocument() {
  return (
    <PdfLayout
      title="HIPAA Vendor Security Questionnaire"
      subtitle="30 questions across 6 sections for evaluating business associates before BAA execution and at annual renewal."
    >
      <Section title="How to use this questionnaire">
        <P>
          Send this questionnaire to any vendor that creates, receives, maintains, or transmits PHI on your behalf
          before executing a BAA and annually at contract renewal. The vendor should complete and return the
          questionnaire in writing - not verbally. Retain completed questionnaires for 6 years per 45 CFR
          § 164.530(j). A materially incomplete or unsatisfactory response is a reason to delay BAA execution and
          escalate to legal counsel.
        </P>
        <Callout label="Questionnaire header - complete for each vendor">
          Vendor name: ______________________________
          Date questionnaire issued: ______________________________
          Date questionnaire returned: ______________________________
          Completed by (vendor contact, title): ______________________________
          Reviewed by (clinic Privacy/Security Officer): ______________________________
        </Callout>
      </Section>

      <Section title="Section 1 - Corporate security program (Questions 1-5)">
        <Table
          headers={['#', 'Question', 'Vendor Response']}
          rows={[
            ['1', 'Does your organization maintain a written information security policy covering HIPAA-applicable safeguards? If yes, provide the policy title, version, and last review date.', ''],
            ['2', 'Has your organization designated a Security Officer (or equivalent) responsible for HIPAA Security Rule compliance? Provide name and title.', ''],
            ['3', 'Has your organization completed a formal risk analysis in the past 12 months? If yes, provide the date of the most recent risk analysis.', ''],
            ['4', 'Has your organization undergone a third-party security assessment, SOC 2 Type II audit, or penetration test in the past 12 months? If yes, are you willing to provide the executive summary under NDA?', ''],
            ['5', 'Has your organization had a confirmed PHI data breach in the past 24 months? If yes, describe the incident briefly, the number of individuals affected, and the corrective actions taken.', ''],
          ]}
        />
      </Section>

      <Section title="Section 2 - Data handling and storage (Questions 6-10)">
        <Table
          headers={['#', 'Question', 'Vendor Response']}
          rows={[
            ['6', 'Where is PHI stored geographically (data center locations, cloud regions)? Is all storage within the United States?', ''],
            ['7', 'Is PHI encrypted at rest? If yes, specify the encryption standard (e.g., AES-256) and whether encryption is applied to all storage types (databases, backups, file storage).', ''],
            ['8', 'Is PHI encrypted in transit? If yes, specify the protocol and minimum TLS version (TLS 1.2 or higher is required).', ''],
            ['9', 'Is PHI used to train, fine-tune, or improve AI/ML models, either internally or via subprocessors? If yes, describe the process and opt-out options.', ''],
            ['10', 'What is your organization\'s data retention policy for PHI? When and how is PHI deleted or returned to the covered entity upon contract termination?', ''],
          ]}
        />
      </Section>

      <Section title="Section 3 - BAA terms and subprocessors (Questions 11-15)">
        <Table
          headers={['#', 'Question', 'Vendor Response']}
          rows={[
            ['11', 'Is your organization willing to execute a Business Associate Agreement (BAA) as required under 45 CFR § 164.308(b)? If yes, provide the name of the authorized signatory.', ''],
            ['12', 'Does your BAA cover all subprocessors that may receive or process PHI on your behalf?', ''],
            ['13', 'Provide a current, complete list of all subprocessors (including cloud providers, AI services, and offshore contractors) that may have access to PHI.', ''],
            ['14', 'Do your subprocessors maintain HIPAA BAAs with your organization? Describe how subprocessor compliance is monitored.', ''],
            ['15', 'How will your organization notify the covered entity of material changes to subprocessors that may affect PHI handling? What is your advance notice period?', ''],
          ]}
        />
      </Section>

      <Section title="Section 4 - Access controls and authentication (Questions 16-21)">
        <Table
          headers={['#', 'Question', 'Vendor Response']}
          rows={[
            ['16', 'Does your platform support unique user identification? Are shared accounts prohibited for access to PHI?', ''],
            ['17', 'Does your platform require multi-factor authentication (MFA) for user accounts with access to PHI? Is MFA enforced or optional?', ''],
            ['18', 'Is access to PHI restricted by role (role-based access control)? Describe how access levels are defined and reviewed.', ''],
            ['19', 'Do your employees or support staff ever access customer PHI (for troubleshooting, support, or model quality review)? If yes, describe the approval process, frequency, and safeguards.', ''],
            ['20', 'How quickly is a terminated or de-provisioned employee\'s access to PHI-containing systems revoked? Who is responsible for access revocation?', ''],
            ['21', 'Does your system maintain audit logs of access to PHI? Are logs retained for at least 6 years? Are logs tamper-evident?', ''],
          ]}
        />
      </Section>

      <Section title="Section 5 - Incident response (Questions 22-26)">
        <Table
          headers={['#', 'Question', 'Vendor Response']}
          rows={[
            ['22', 'Does your organization have a documented security incident response plan that covers PHI breaches?', ''],
            ['23', 'What is your organization\'s breach notification timeline to covered entities? Does your BAA commit to notification within 24 hours of discovery?', ''],
            ['24', 'Describe your organization\'s process for breach investigation, including forensic analysis and documentation.', ''],
            ['25', 'Has your organization conducted a tabletop exercise or live simulation of a breach response in the past 12 months?', ''],
            ['26', 'Who is the designated point of contact at your organization for breach notification to covered entities? Provide name, title, and contact information.', ''],
          ]}
        />
      </Section>

      <Section title="Section 6 - Compliance history and attestation (Questions 27-30)">
        <Table
          headers={['#', 'Question', 'Vendor Response']}
          rows={[
            ['27', 'Has your organization ever been subject to a HIPAA enforcement action, OCR investigation, or state AG inquiry related to PHI? If yes, describe the outcome.', ''],
            ['28', 'Does your organization conduct annual HIPAA training for all workforce members who may access PHI? How is completion documented?', ''],
            ['29', 'Does your organization maintain and apply a workforce sanction policy for HIPAA violations?', ''],
            ['30', 'Please provide an attestation signed by your Security Officer or equivalent confirming that the responses above are accurate and that your organization is willing to execute a BAA consistent with HIPAA requirements.', ''],
          ]}
        />
      </Section>

      <Section title="Vendor attestation signature block">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['I attest that the responses above are accurate to the best of my knowledge.', ''],
            ['Authorized signatory name', ''],
            ['Title', ''],
            ['Organization', ''],
            ['Date', ''],
            ['Signature', ''],
          ]}
        />
      </Section>

      <Section title="Clinic review and disposition">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['Questionnaire reviewed by', ''],
            ['Review date', ''],
            ['Unsatisfactory responses identified (list question numbers)', ''],
            ['Follow-up questions required? (Yes / No)', ''],
            ['Follow-up completed date', ''],
            ['BAA executed? (Yes / No / Pending)', ''],
            ['BAA execution date', ''],
            ['Disposition (Approved / Conditional / Rejected)', ''],
            ['Next annual review date', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard stores completed vendor questionnaires alongside BAA records, renewal dates, and vendor risk
          status so nothing is lost between review cycles. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
