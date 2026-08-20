import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaNewHireChecklistDocument() {
  return (
    <PdfLayout
      title="HIPAA New Hire Compliance Checklist"
      subtitle="A 30/60/90-day checklist for onboarding clinical and administrative staff into a HIPAA-compliant practice."
    >
      <Section title="Why every hire is a compliance event">
        <P>
          Every person a clinic adds to its workforce extends the surface area for PHI access. The Security Rule
          requires a security awareness and training program for all workforce members under §164.308(a)(5), and the
          Privacy Rule requires training on policies and procedures under §164.530(b). Training must be documented,
          and sanctions for violations must be applied consistently under §164.530(e). If a workforce member causes a
          breach and training cannot be produced, OCR treats that as an aggravating factor.
        </P>
        <P>
          This checklist breaks the onboarding work into day-one, week-one, day-30, day-60, and day-90 milestones so
          small practices can run it without a dedicated HR compliance function.
        </P>
      </Section>

      <Section title="Day-one tasks">
        <Bullets
          items={[
            'Signed employee confidentiality and HIPAA acknowledgment on file.',
            'Signed BAA or equivalent if the new hire is a contractor with PHI access.',
            'Initial HIPAA training delivered (Privacy Rule basics, minimum necessary, workstation etiquette, reporting channels).',
            'Workstation provisioned with unique user ID per §164.312(a)(2)(i) - no shared logins.',
            'Automatic screen lock configured per §164.312(a)(2)(iii).',
            'Email account created with MFA enforced from first sign-in.',
          ]}
        />
      </Section>

      <Section title="Week-one tasks">
        <Bullets
          items={[
            'Role-based access assigned per the access matrix below; no "admin" or "everything" grants unless the role requires it.',
            'Supervisor pairing scheduled - no solo PHI handling in the first week.',
            'EHR training completed with read/write permissions configured to role.',
            'Privacy officer and security officer introductions so the hire knows who to escalate to.',
            'Incident reporting channel walkthrough - how to flag a suspected breach in the first 24 hours.',
          ]}
        />
      </Section>

      <Section title="Day-30 tasks">
        <Bullets
          items={[
            'Sanctions policy acknowledgment signed. Sanctions must be applied consistently - a stated policy that is never enforced is worse than no policy.',
            'Minimum-necessary briefing completed, with job-specific examples.',
            'Password manager provisioned and in active use.',
            'Documented competency check on handling the three most common PHI disclosure scenarios the role encounters.',
          ]}
        />
      </Section>

      <Section title="Day-60 tasks">
        <Bullets
          items={[
            'Incident reporting drill - tabletop or simulated scenario, with observed reporting behavior logged.',
            'Review of the new hire\'s audit-log activity: any anomalies (off-hours access, records outside their patient panel) reviewed with the hire.',
            'Confirmation that role-based access is still appropriate after 60 days of actual work.',
          ]}
        />
      </Section>

      <Section title="Day-90 tasks">
        <Bullets
          items={[
            'Competency check: short quiz or structured review covering Privacy, Security, and Breach Notification Rules as they apply to the role.',
            'Manager sign-off on continued employment with PHI access.',
            'Training log updated with all training events from the first 90 days.',
          ]}
        />
      </Section>

      <Section title="Role-based access matrix (sample)">
        <Table
          headers={['Role', 'EHR access', 'Billing system', 'Admin tools']}
          rows={[
            ['Front desk', 'Demographics + scheduling only', 'Read-only copay lookup', 'None'],
            ['Medical assistant', 'Full chart for today\'s patient panel', 'None', 'None'],
            ['Provider', 'Full chart, own patient panel', 'None', 'None'],
            ['Billing specialist', 'Encounter codes and diagnosis only', 'Full read/write', 'None'],
            ['Practice administrator', 'Audit logs, no clinical notes', 'Full read/write', 'User management'],
          ]}
        />
        <Callout label="Minimum necessary">
          Under §164.502(b) and §164.514(d), a workforce member should see only the PHI reasonably necessary to do
          their job. The default should be least-privilege, not convenience.
        </Callout>
      </Section>

      <Section title="Training log template">
        <Table
          headers={['Employee', 'Date', 'Topic', 'Citation', 'Trainer']}
          rows={[
            ['', '', 'Privacy Rule basics', '§164.530(b)', ''],
            ['', '', 'Security awareness - password and workstation', '§164.308(a)(5)(ii)(D)', ''],
            ['', '', 'Security awareness - malicious software', '§164.308(a)(5)(ii)(B)', ''],
            ['', '', 'Security awareness - log-in monitoring', '§164.308(a)(5)(ii)(C)', ''],
            ['', '', 'Minimum necessary', '§164.502(b)', ''],
            ['', '', 'Incident reporting', '§164.308(a)(6)', ''],
          ]}
        />
      </Section>

      <Section title="Sanctions policy - acknowledgment language">
        <P>
          "I acknowledge that I have been trained on the clinic's HIPAA policies and that violations of those policies,
          including impermissible uses or disclosures of PHI, may result in corrective action up to and including
          termination of employment, in accordance with the clinic's sanctions policy under §164.530(e). I understand
          that sanctions are applied consistently regardless of role or seniority."
        </P>
        <P>Employee signature: __________________________ Date: __________</P>
      </Section>

      <Section title="Minimum-necessary rule in practice">
        <P>
          The rule is simple to state and hard to enforce: a workforce member, a business associate, or anyone else
          should request, use, or disclose only the minimum PHI necessary to accomplish the intended purpose. Treatment
          disclosures are the main exception. For everything else - billing, scheduling, operations, quality - the
          default posture is least-privilege access, role-based permissions, and clear documentation of why a broader
          view is needed when it is.
        </P>
      </Section>

      <Section title="Termination and offboarding checklist">
        <Bullets
          items={[
            'EHR access revoked same-day, ideally within the hour of notice being given or received.',
            'Email and Google sign-in accounts disabled on the last working day.',
            'Physical keys, badges, and any clinic-owned devices returned.',
            'Remote-wipe issued on any clinic device that cannot be physically returned.',
            'Exit interview conducted, including reminder of ongoing confidentiality obligations.',
            'Final HIPAA acknowledgment signed confirming no retained PHI.',
            'Access revocation logged in the audit trail.',
          ]}
        />
      </Section>

      <Section title="Common onboarding mistakes">
        <Bullets
          items={[
            'Granting "admin" access to avoid permission requests later - violates minimum necessary from day one.',
            'Using a shared login for the first week while the individual account is provisioned.',
            'Letting training slip to "we\'ll get to it" - no documentation means no defense.',
            'Skipping the 90-day competency check because nothing obvious went wrong.',
            'Not revoking access on the day of termination.',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard turns this checklist into assigned tasks with due dates, audit-log hooks for access provisioning, and
          a training log that OCR will recognize. If onboarding compliance lives in spreadsheets today, see
          phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}

