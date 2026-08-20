import { Bullets, Callout, P, PdfLayout, Section, Subsection, Table } from '../layout/PdfLayout.js'

export default function IncidentResponsePlanDocument() {
  return (
    <PdfLayout
      title="HIPAA Incident Response Plan Template"
      subtitle="Roles, severity classes, response playbook, and communication tree to satisfy §164.308(a)(6)(i) in a small clinic."
    >
      <Section title="Purpose">
        <P>
          This plan defines how the clinic identifies, responds to, documents, and learns from security incidents
          involving protected health information, as required by §164.308(a)(6)(i). The goal of incident response is
          not to avoid incidents - incidents happen in every clinic - it is to respond in a way that limits harm,
          preserves evidence, meets notification obligations under §§164.404, 164.406, and 164.408, and produces a
          defensible record for regulators and patients.
        </P>
      </Section>

      <Section title="Roles and responsibilities">
        <Table
          headers={['Role', 'Responsibility']}
          rows={[
            ['Incident Response Lead', 'Declares incidents, coordinates the response, owns the post-incident review'],
            ['Privacy Officer', 'Breach determination under §164.402, individual notification content, OCR reporting'],
            ['Security Officer', 'Technical containment, forensics coordination, evidence preservation'],
            ['Communications Lead', 'Internal updates, patient-facing language, media statements if applicable'],
            ['Legal Contact', 'Regulatory interpretation, law enforcement liaison, litigation hold decisions'],
          ]}
        />
        <P>
          In a small clinic, one person may hold multiple roles. That is acceptable, but each role must be named in
          writing, and no single person should be both declaring the incident and determining whether it constitutes a
          breach.
        </P>
      </Section>

      <Section title="Severity classification">
        <Subsection title="P1 - Confirmed PHI breach">
          <P>
            Evidence confirms PHI was impermissibly acquired, accessed, used, or disclosed, and LOPC cannot be
            established. Examples: stolen unencrypted laptop with PHI, confirmed exfiltration during a ransomware
            event, large misdirected mailing.
          </P>
          <P>Response timeline: immediate containment, 24-hour exec escalation, 60-day external notifications.</P>
        </Subsection>
        <Subsection title="P2 - Suspected breach">
          <P>
            An event that may be a breach pending investigation. Examples: unusual audit-log activity, phishing click
            with uncertain blast radius, lost device with unconfirmed encryption status.
          </P>
          <P>Response timeline: immediate containment, determination within 7 days or justification for extension.</P>
        </Subsection>
        <Subsection title="P3 - Security incident, no PHI impact">
          <P>
            A security event with no evidence of PHI impact. Examples: blocked phishing attempt, malware on a
            non-clinical workstation with no PHI, DDoS against the public website.
          </P>
          <P>Response timeline: standard response, logged but not escalated to privacy officer.</P>
        </Subsection>
        <Subsection title="P4 - Minor event">
          <P>
            Low-impact events handled through routine operations. Examples: a single password reset after a suspected
            compromise, a single piece of misdelivered mail returned unopened.
          </P>
          <P>Response timeline: logged, reviewed in aggregate monthly.</P>
        </Subsection>
      </Section>

      <Section title="Detection sources">
        <Bullets
          items={[
            'Endpoint protection and EDR alerts.',
            'EHR audit logs - off-hours access, access to records outside a workforce member\'s patient panel.',
            'Email security gateway - phishing reports, quarantine events.',
            'Workforce reports through the internal incident channel.',
            'Patient complaints about suspected privacy violations.',
            'Vendor notifications under BAA reporting obligations.',
            'Law enforcement notifications - sometimes the first indication of a breach.',
          ]}
        />
      </Section>

      <Section title="Response playbook - Identify, Contain, Eradicate, Recover, Document">
        <Subsection title="Identify">
          <P>
            Confirm the event, classify it by severity, and open a timestamped incident record. Do not share details
            outside the incident response team until the Incident Response Lead authorizes it.
          </P>
        </Subsection>
        <Subsection title="Contain">
          <P>
            Stop the bleeding. Disable compromised accounts, isolate affected endpoints from the network, revoke API
            tokens, and preserve snapshots before changes. Containment actions must be logged with timestamps and
            responsible parties.
          </P>
        </Subsection>
        <Subsection title="Eradicate">
          <P>
            Remove the cause. Remediate the vulnerability, reimage affected systems, rotate credentials for every
            account with exposure, and validate that the attacker path is closed before restoring services.
          </P>
        </Subsection>
        <Subsection title="Recover">
          <P>
            Restore services with enhanced monitoring. Validate data integrity before returning systems to production,
            and watch for re-entry attempts for at least 30 days.
          </P>
        </Subsection>
        <Subsection title="Document">
          <P>
            Maintain the written record throughout. The incident record, the LOPC analysis, the containment timeline,
            and the notifications sent must be retained for six years under §164.530(j).
          </P>
        </Subsection>
      </Section>

      <Section title="Communication tree">
        <Bullets
          items={[
            'Internal - Incident Response Lead notifies Privacy and Security Officers within 1 hour; practice leadership within 4 hours for P1/P2.',
            'HHS - required for breaches of 500 or more individuals within 60 days per §164.408(b); annual log by March 1 for smaller breaches.',
            'Affected individuals - required within 60 days of discovery per §164.404, delivered by first-class mail or email if prior authorization exists.',
            'Media - required if a breach affects 500 or more individuals in a state or jurisdiction, per §164.406, delivered to prominent media outlets.',
            'Business associate partners - notified if their PHI was potentially affected or if their systems may need attention.',
            'Law enforcement - only on advice of the Legal Contact, with a documented litigation-hold decision.',
          ]}
        />
        <Callout label="Media notification threshold">
          The 500-individual media notification under §164.406 is per state or jurisdiction, not total. A breach
          affecting 400 in one state and 400 in another may not trigger media notification; 500 in a single state
          does.
        </Callout>
      </Section>

      <Section title="Evidence preservation checklist">
        <Bullets
          items={[
            'Preserve system snapshots before remediation - chain of custody matters.',
            'Preserve log data for at least six years, extending any shorter default retention.',
            'Preserve email messages, including headers, related to the incident.',
            'Preserve device images for devices that are reimaged or retired as part of response.',
            'Document every remediation step with who, what, and when.',
            'Do not turn off affected systems unless containment requires it - memory may contain evidence.',
          ]}
        />
      </Section>

      <Section title="Post-incident review template">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['Incident ID', ''],
            ['Severity', 'P1 / P2 / P3 / P4'],
            ['What happened - narrative', ''],
            ['Timeline - discovery to closure', ''],
            ['Root cause', ''],
            ['Controls that failed', ''],
            ['Controls that worked', ''],
            ['Corrective actions with owner and due date', ''],
            ['Breach determination (if applicable)', ''],
            ['Notifications issued', ''],
            ['Lessons learned for next tabletop', ''],
            ['Signed by Incident Response Lead', ''],
          ]}
        />
      </Section>

      <Section title="Tabletop exercise schedule">
        <Bullets
          items={[
            'Quarterly - 60-minute tabletop with the incident response team working through a scripted scenario (ransomware, lost device, insider snooping, vendor breach).',
            'Annually - full-day exercise including workforce notification drills, media messaging drafts, and OCR reporting rehearsal.',
            'New-hire onboarding drill - every new workforce member with PHI access participates in a short simulated incident within their first 60 days.',
            'After any P1 or P2 - adjust the next tabletop to reflect the controls that failed.',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard gives every incident a structured record, routes communications to the right roles, and keeps the
          six-year retention clock. If incident response today is a group chat and a Word document, see phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
