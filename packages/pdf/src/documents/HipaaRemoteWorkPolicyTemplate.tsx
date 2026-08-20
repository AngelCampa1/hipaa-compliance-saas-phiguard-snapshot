import { Bullets, Callout, P, PdfLayout, Section } from '../layout/PdfLayout.js'

export default function HipaaRemoteWorkPolicyTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Remote Work & BYOD Policy Template"
      subtitle="Adoption-ready policy aligned to 45 CFR § 164.310(c) and § 164.312."
    >
      <Section title="Purpose and Scope">
        <P>
          This policy governs remote work and the use of personally owned devices (BYOD) by workforce members of [Clinic Name]. The clinic is a HIPAA covered entity. Workforce members who access electronic Protected Health Information (ePHI) outside the clinic facility, or who use a personally owned device for any clinic purpose, are bound by this policy.
        </P>
        <P>
          The policy implements administrative, physical, and technical safeguards required under the HIPAA Security Rule, with specific reference to workstation security at 45 CFR § 164.310(c) and the technical safeguards at § 164.312 (access control, audit controls, integrity, person-or-entity authentication, and transmission security).
        </P>
        <P>
          This policy applies to all employees, contractors, locum providers, students, and volunteers, and to all clinic-issued and personally owned devices used to access ePHI or any clinic system. It supplements, and does not replace, the clinic\'s Sanctions Policy, Workstation Use Policy, and Acceptable Use Policy.
        </P>
        <Callout label="Adoption note">
          Replace bracketed fields with clinic-specific values. Have the policy reviewed by counsel before adoption. Collect signed acknowledgments and re-issue annually.
        </Callout>
      </Section>

      <Section title="Eligibility for Remote Work">
        <P>
          Remote work is a privilege, not a default. Eligibility is determined by role, by demonstrated compliance with clinic policies, and by direct supervisor approval. The clinic reserves the right to deny, suspend, or terminate remote work privileges for any workforce member at any time.
        </P>
        <Bullets items={[
          'Eligible roles include billing, coding, administrative, and clinical-documentation roles where the work can be performed without in-person patient contact.',
          'Roles requiring in-person patient contact (rooming, vitals, in-clinic clinical care) are not eligible for remote work for the in-person portion of their duties.',
          'A workforce member may not perform remote work until the supervisor has approved the arrangement in writing and the workforce member has signed the acknowledgment at the end of this policy.',
          'New hires must complete the standard onboarding period in the clinic facility before becoming eligible for remote work, unless the supervisor and Security Officer jointly approve an exception.',
          'Remote work approval is reviewed at least annually and any time the workforce member\'s role changes.',
        ]} />
      </Section>

      <Section title="Approved Devices">
        <P>
          Two device categories are recognized: clinic-issued devices and approved BYOD devices. Each category has distinct configuration and use requirements.
        </P>
        <P>
          Clinic-issued devices. Laptops, tablets, and mobile phones issued by the clinic for the express purpose of work are configured by the clinic\'s IT vendor, enrolled in the clinic\'s mobile device management (MDM) platform, and remain clinic property at all times. Clinic-issued devices may not be used by family members or other persons.
        </P>
        <P>
          BYOD devices. Personally owned laptops, tablets, and mobile phones may be used for clinic work only when approved in writing by the Security Officer, enrolled in the clinic\'s MDM platform, and configured to meet the requirements in the next section. The workforce member must consent in writing to MDM enrollment and to the clinic\'s right to remotely wipe clinic data on the device under defined circumstances.
        </P>
        <Bullets items={[
          'Operating systems must be currently supported by the manufacturer (no end-of-life Windows, macOS, iOS, or Android versions).',
          'Jailbroken or rooted devices are prohibited under any circumstance.',
          'Use of family-shared devices for clinic work is prohibited.',
          'Personal use on a BYOD device is permitted, but clinic data and personal data must remain segregated through the MDM container or equivalent control.',
        ]} />
      </Section>

      <Section title="Required Configuration">
        <P>
          Every device used to access ePHI, whether clinic-issued or BYOD, must meet the following technical configuration requirements before access is granted, and must continue to meet them throughout the period of access.
        </P>
        <Bullets items={[
          'Full-disk encryption is enabled and verified (BitLocker on Windows, FileVault on macOS, default device encryption on iOS and Android).',
          'A unique user account with a strong password (minimum twelve characters) is required to log in; shared local accounts are prohibited.',
          'Multi-factor authentication (MFA) is enforced on every clinic system that supports it, including the EHR, email, billing system, and any cloud storage that may contain ePHI.',
          'Automatic screen lock is configured to engage at five minutes of inactivity or less.',
          'The device receives security updates from the manufacturer and any installed clinic software within fourteen days of release.',
          'Endpoint protection (antivirus / EDR) approved by the clinic IT vendor is installed and active on laptops and desktops.',
          'Remote-wipe capability through the MDM platform is enabled for any device that may store or cache ePHI.',
        ]} />
      </Section>

      <Section title="Acceptable Use">
        <P>
          The location of work does not alter the workforce member\'s obligations under the Privacy Rule and Security Rule. The minimum-necessary standard at § 164.502(b), the access control standard at § 164.312(a), and the transmission security standard at § 164.312(e) all apply in full to remote work.
        </P>
        <Bullets items={[
          'Access to ePHI from outside the clinic facility is permitted only over the clinic-approved virtual private network (VPN) or directly through clinic-approved cloud applications protected by MFA.',
          'Public, hotel, café, and other untrusted Wi-Fi networks may not be used to access ePHI without an active VPN connection.',
          'PHI may not be stored, copied, or forwarded to personal email accounts, personal cloud storage (personal Google Drive, iCloud, Dropbox, OneDrive), personal messaging apps, or any service without a signed Business Associate Agreement with the clinic.',
          'Workforce members must take reasonable steps to prevent visual and auditory disclosure in the remote environment: no PHI on screen in public spaces, no work calls discussing PHI in shared living spaces or public areas, privacy filters where applicable.',
          'Family members, roommates, and visitors may not view, hear, or otherwise be exposed to PHI in the remote work environment.',
          'Printing PHI in the remote environment is prohibited unless explicitly approved in writing by the Security Officer for a defined business purpose.',
          'Remote work devices may not be left unattended in vehicles, public spaces, or unsecured areas.',
        ]} />
      </Section>

      <Section title="Lost or Stolen Devices and Incident Reporting">
        <P>
          A lost or stolen device that may contain or access ePHI is a security incident under § 164.304 and may be a breach under § 164.402. Reporting is mandatory and time-sensitive.
        </P>
        <Bullets items={[
          'Workforce members must report a lost or stolen device, or any suspected unauthorized access to a device used for clinic work, to the Security Officer immediately and no later than the same calendar day the loss is discovered.',
          'Reporting channels: phone [Security Officer phone], email [Security Officer email]. Reporting is required even if the device is recovered shortly after the report.',
          'Upon report, the clinic will initiate a remote wipe of clinic data on the device, revoke the device\'s access to clinic systems, and rotate any credentials cached on the device.',
          'The workforce member will cooperate with the clinic\'s investigation and breach risk assessment, including providing a written timeline of events.',
          'Failure to report a lost or stolen device promptly is a violation of this policy and the Sanctions Policy.',
        ]} />
      </Section>

      <Section title="Termination of Remote Access">
        <P>
          Remote access termination follows the clinic\'s standard offboarding checklist, with same-day SLAs for all access revocation.
        </P>
        <Bullets items={[
          'On the last day of access, the clinic revokes VPN access, EHR access, email access, and any cloud application access used for clinic work.',
          'Clinic-issued devices are returned to the clinic on or before the last day of access; the device is wiped and re-imaged before reissue.',
          'For BYOD devices, the clinic remotely wipes the clinic MDM container; the workforce member signs an attestation that no clinic PHI remains on the device, in personal cloud storage, in personal email, or in any backup associated with the device.',
          'Cached credentials and saved passwords associated with clinic systems are removed from the BYOD device.',
          'Where the departure is involuntary or for cause, access revocation occurs before the termination conversation.',
        ]} />
      </Section>

      <Section title="Sanctions and Policy Violations">
        <P>
          Violations of this policy may result in disciplinary action up to and including termination of employment, in accordance with the clinic\'s Sanctions Policy. Certain violations may trigger external reporting obligations under 45 CFR §§ 164.400-414.
        </P>
      </Section>

      <Section title="Acknowledgment">
        <P>
          By signing below, the workforce member acknowledges receipt of this policy, has read and understands its requirements, and agrees to comply with each requirement as a condition of remote work and BYOD privileges at [Clinic Name].
        </P>
        <Bullets items={[
          'Workforce Member Name: ____________________',
          'Role: ____________________',
          'Device(s) Covered (clinic-issued and/or BYOD with make/model): ____________________',
          'Signature: ____________________',
          'Date: ____________________',
          'Supervisor Signature: ____________________',
          'Security Officer Signature: ____________________',
        ]} />
      </Section>
    </PdfLayout>
  )
}
