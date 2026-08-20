import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaAiUsePolicyTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA AI Use Policy Template"
      subtitle="A ready-to-adapt policy for clinical staff covering approved tools, PHI prohibitions, BAA requirements, and incident reporting."
    >
      <Section title="Policy scope">
        <P>
          This policy applies to all workforce members who use any artificial intelligence tool - including large
          language models, AI writing assistants, transcription tools, coding assistants, and image generation tools -
          for any work-related task.
        </P>
        <P>
          This policy applies regardless of whether the tool is accessed on a clinic-owned or personal device and
          regardless of whether the task is directly clinical, administrative, or operational.
        </P>
      </Section>

      <Callout label="Core rule - no PHI in unapproved tools">
        No workforce member may input, paste, dictate, or otherwise transmit any patient name, condition, date of
        service, provider information, or any other PHI into any AI tool that is not on the Approved Tools Registry
        and does not have a signed BAA with this clinic.
      </Callout>

      <Section title="Section 1: Approved Tools Registry">
        <P>
          The following AI tools are approved for use by clinic staff. Only tools listed here with a confirmed BAA
          status may be used for tasks involving patient-adjacent content. This registry must be reviewed and updated
          at least annually or when a new tool is being considered.
        </P>
        <Table
          headers={['Tool Name', 'Vendor', 'BAA in Place (Y/N)', 'BAA Date', 'Permitted Uses', 'Prohibited Uses']}
          rows={[
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
            ['', '', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section 2: What staff may not input into any AI tool without BAA coverage">
        <Bullets
          items={[
            'Patient names, dates of birth, or contact information',
            'Diagnosis codes, procedure codes, or clinical notes',
            'Insurance IDs, claim information, or billing records',
            'Any description of a patient case, even when names are omitted, if the description could re-identify the individual',
            'Scheduling information linked to a patient identity',
            'Any screenshot or document containing PHI',
          ]}
        />
      </Section>

      <Section title="Section 3: What staff may use AI tools for (without BAA, when de-identified)">
        <Bullets
          items={[
            'Drafting general communications, policies, or training materials that contain no patient data',
            'Summarizing regulatory guidance, HIPAA requirements, or non-clinical research',
            'Generating template language for forms, letters, or checklists - without inserting real patient data',
            'Administrative tasks with no PHI involvement (meeting notes, scheduling that does not reference patients)',
          ]}
        />
      </Section>

      <Section title="Section 4: BAA requirement for new AI tools">
        <P>
          Before any AI tool may be added to the Approved Tools Registry, the following steps must be completed:
        </P>
        <Bullets
          items={[
            'Review the vendor\'s privacy policy and terms of service for data use and training opt-out options',
            'Confirm whether the vendor offers a HIPAA BAA and at which plan tier',
            'Request and execute the BAA before any patient-adjacent use begins',
            'Add the tool to the Approved Tools Registry with BAA date and permitted use scope',
            'Notify relevant staff of the approved tool and any use restrictions',
          ]}
        />
      </Section>

      <Section title="Section 5: Incident reporting">
        <P>
          If a workforce member believes PHI was inadvertently input into an unapproved AI tool, they must report the
          incident to the Privacy Officer immediately - not after consulting with colleagues or attempting to determine
          whether it was a breach.
        </P>
        <P>
          The Privacy Officer will apply the four-factor breach risk assessment under 45 CFR §164.402 to determine
          whether the disclosure constitutes a reportable breach.
        </P>
      </Section>

      <Section title="Section 6: Sanctions">
        <P>
          Violations of this policy are subject to the clinic's workforce sanction policy. Intentional input of PHI
          into an unapproved AI tool will be treated as an unauthorized disclosure of PHI.
        </P>
      </Section>

      <Section title="Policy acknowledgement">
        <Table
          headers={['Item', 'Detail']}
          rows={[
            ['Policy effective date', ''],
            ['Reviewed by (Privacy Officer)', ''],
            ['Staff member name', ''],
            ['Staff member role', ''],
            ['Date acknowledged', ''],
            ['Signature', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks AI tool approvals in the vendor registry, records BAA execution dates, and schedules annual
          Approved Tools Registry reviews. Policy acknowledgement is tracked per staff member. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
