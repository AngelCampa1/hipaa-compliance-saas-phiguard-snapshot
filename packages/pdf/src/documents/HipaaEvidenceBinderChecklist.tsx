import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaEvidenceBinderChecklistDocument() {
  return (
    <PdfLayout
      title="HIPAA Evidence Binder Checklist"
      subtitle="A 7-section compliance evidence structure with filename conventions and a 6-year retention matrix."
    >
      <Section title="Why the binder matters">
        <P>
          The evidence binder is not an audit-prep exercise - it is the ongoing compliance record
          that demonstrates your program is functioning. OCR asks for these documents in every
          investigation. Clinics that can produce them in 48 hours are in a fundamentally different
          position than clinics that reconstruct them over two weeks.
        </P>
      </Section>

      <Section title="Filename convention">
        <P>
          Use this format for all compliance documents:
          [SECTION]_[document-name]_v[version]_[YYYY-MM-DD].pdf. Example:
          02_TRAINING_hipaa-annual-training-log_v1_2026-01-15.pdf. Version and date allow you to
          confirm which document was current at any given time.
        </P>
      </Section>

      <Section title="Section 1: Policies and procedures">
        <Table
          headers={['Document', 'Required? (Y/N)', 'File name pattern', 'Retention']}
          rows={[
            ['Privacy policy', 'Y', '01_POLICY_privacy-policy_v#_YYYY-MM-DD', '6 years from creation or last effective date'],
            ['Security policy', 'Y', '01_POLICY_security-policy_v#_YYYY-MM-DD', '6 years'],
            ['Access control policy', 'Y', '01_POLICY_access-control_v#_YYYY-MM-DD', '6 years'],
            ['Sanctions policy', 'Y', '01_POLICY_sanctions_v#_YYYY-MM-DD', '6 years'],
            ['Breach response policy', 'Y', '01_POLICY_breach-response_v#_YYYY-MM-DD', '6 years'],
            ['NPP (current and all prior versions)', 'Y', '01_POLICY_npp_v#_YYYY-MM-DD', '6 years'],
            ['Privacy Officer designation memo', 'Y', '01_POLICY_privacy-officer-designation_YYYY-MM-DD', '6 years'],
          ]}
        />
      </Section>

      <Section title="Section 2: Training records">
        <Table
          headers={['Document', 'File name pattern', 'Retention']}
          rows={[
            ['Annual training log (signatures)', '02_TRAINING_annual-log_YYYY', '6 years'],
            ['Training content used', '02_TRAINING_content_YYYY', '6 years'],
            ['New hire onboarding training records', '02_TRAINING_newhire_[name]_YYYY-MM-DD', '6 years'],
            ['Sanctions applied (if any)', '02_TRAINING_sanctions_[name]_YYYY-MM-DD', '6 years'],
          ]}
        />
      </Section>

      <Section title="Section 3: Risk analysis">
        <Table
          headers={['Document', 'File name pattern', 'Retention']}
          rows={[
            ['Annual risk analysis worksheet', '03_RISK_analysis-worksheet_YYYY', '6 years'],
            ['Risk register with findings and ratings', '03_RISK_register_YYYY', '6 years'],
            ['Remediation plan and status', '03_RISK_remediation_YYYY', '6 years'],
          ]}
        />
      </Section>

      <Section title="Section 4: Vendor BAAs">
        <Table
          headers={['Document', 'File name pattern', 'Retention']}
          rows={[
            ['Signed BAA for each business associate', '04_BAA_[vendor-name]_YYYY-MM-DD', '6 years after relationship ends'],
            ['BAA inventory spreadsheet or tracker', '04_BAA_inventory_YYYY', '6 years'],
            ['Vendor renewal review records', '04_BAA_renewal_[vendor]_YYYY', '6 years'],
          ]}
        />
      </Section>

      <Section title="Section 5: Incident log">
        <Table
          headers={['Document', 'File name pattern', 'Retention']}
          rows={[
            ['Running incident log', '05_INCIDENT_log_YYYY', '6 years'],
            ['Individual incident files (4-factor assessments, determination memos)', '05_INCIDENT_[date]_[description]', '6 years'],
            ['HHS breach submission confirmations', '05_INCIDENT_hhs-submission_YYYY', '6 years'],
          ]}
        />
      </Section>

      <Section title="Section 6: Access reviews">
        <Table
          headers={['Document', 'File name pattern', 'Retention']}
          rows={[
            ['Quarterly or semi-annual access review records', '06_ACCESS_review_YYYY-[Q1/Q2/Q3/Q4]', '6 years'],
            ['Termination access revocation records', '06_ACCESS_termination_[name]_YYYY-MM-DD', '6 years'],
          ]}
        />
      </Section>

      <Section title="Section 7: Audit logs">
        <Table
          headers={['Document', 'File name pattern', 'Retention']}
          rows={[
            ['EHR audit log exports (periodic)', '07_AUDIT_ehr_YYYY-MM', '6 years'],
            ['Billing system access logs', '07_AUDIT_billing_YYYY-MM', '6 years'],
            ['Anomaly review records', '07_AUDIT_anomaly_[date]_[description]', '6 years'],
          ]}
        />
        <Callout label="Six-year retention rule">
          Under §164.530(j), covered entities must retain documentation of policies, procedures, and
          actions for 6 years from the date of creation or the date it was last in effect -
          whichever is later. This means a 2020 policy still in effect in 2026 must be retained
          until at least 2032.
        </Callout>
      </Section>

      <Section title="Annual maintenance checklist">
        <Bullets
          items={[
            'Review all sections - remove expired documents that have passed their retention deadline',
            'Add new versions of any policies updated during the year',
            'Confirm the training log is complete for all staff',
            'Confirm the risk analysis for the year is filed',
            'Confirm all BAA renewals for the year are filed',
            'Confirm the incident log is current through December 31',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard organizes compliance evidence into these same sections automatically - policies,
          training, risk analysis, BAAs, incidents, access reviews, and audit logs - with timestamps
          and retention tracking built in. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
