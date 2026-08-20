import { Bullets, Callout, P, PdfLayout, Section } from '../layout/PdfLayout.js'

export default function HipaaPhysicalSecurityAuditChecklistDocument() {
  return (
    <PdfLayout
      title="HIPAA Physical Security Audit Checklist"
      subtitle="A room-by-room walkthrough mapped to 45 CFR § 164.310 physical safeguards."
    >
      <Section title="How to Use This Checklist">
        <P>
          This checklist is designed for practice administrators and HIPAA security officers at small clinics. It maps to the four required standards under the Security Rule physical safeguards: facility access controls (§ 164.310(a)), workstation use (§ 164.310(b)), workstation security (§ 164.310(c)), and device and media controls (§ 164.310(d)).
        </P>
        <P>
          Walk the building with this document. Mark each item as compliant, remediation needed, or not applicable, with the responsible owner and a target date for any remediation item. File the completed checklist with your Security Rule documentation. Repeat at least quarterly and whenever the clinic changes its lease, hires a new workforce member with key access, or terminates a workforce member with any physical access.
        </P>
        <Callout label="Retention">
          Retain completed audit checklists for six years from the date of creation or last effective date, per § 164.530(j)(2).
        </Callout>
      </Section>

      <Section title="Facility Access Controls - § 164.310(a)">
        <P>
          The facility access control standard requires policies and procedures to limit physical access to electronic information systems and the facilities that house them, while ensuring properly authorized access is allowed.
        </P>
        <Bullets items={[
          'A current key and badge inventory exists and lists every issued key, badge, fob, and alarm code by workforce member and date of issue.',
          'Keys to records storage, server or network closets, and medication areas are issued only to workforce members whose role requires that access.',
          'Alarm system codes are unique per workforce member; shared codes are prohibited.',
          'After-hours building entry is logged automatically by the alarm system or manually by a sign-in sheet at the entry point.',
          'A documented procedure exists for re-keying or re-coding when a workforce member with key or code access separates from the clinic.',
          'The procedure for re-keying after termination is executed within one business day of separation; a log entry confirms execution.',
          'Exterior doors are locked outside business hours and during periods when the clinic is unstaffed (lunch closures, between-shift gaps).',
          'A facility security plan documents physical access points, who is authorized at each, and how authorization is reviewed.',
          'Maintenance and contractor access to facility areas containing ePHI is escorted, logged, and limited to the work being performed.',
        ]} />
      </Section>

      <Section title="Workstation Use and Security - § 164.310(b) and (c)">
        <P>
          Workstation use addresses the manner in which workstations are used. Workstation security addresses physical safeguards over workstation hardware. Both apply to every workstation that can access ePHI, including remote and mobile workstations.
        </P>
        <Bullets items={[
          'A written workstation use policy specifies authorized functions, acceptable use, and physical attributes for every workstation that accesses ePHI.',
          'Reception and front-desk monitors are positioned so screens are not visible to patients, visitors, or passers-by; privacy filters are installed where line of sight cannot be controlled.',
          'Workstations in shared or open areas have automatic screen lock configured at five minutes of inactivity or less.',
          'Every workstation requires a unique user ID and password to unlock; no shared local accounts are in use.',
          'Workstations are physically secured against theft (cable locks for laptops left in the office, locked storage for mobile carts).',
          'A clean-desk standard is enforced in any area where paper PHI may be present; documents are returned to secured storage at end of day.',
          'Visitor and family-member proximity to workstations is limited; rooming and check-in scripts include a step to lock or minimize the screen when stepping away.',
          'Printers, fax machines, and multifunction devices that handle PHI are located in non-public areas, and printed output is collected promptly.',
        ]} />
      </Section>

      <Section title="Device and Media Controls - § 164.310(d)">
        <P>
          The device and media controls standard requires policies for the receipt and removal of hardware and electronic media that contain ePHI into and out of the facility, and the movement of these items within the facility. Disposal and media re-use are required implementation specifications.
        </P>
        <Bullets items={[
          'A current device inventory lists every laptop, desktop, tablet, mobile phone, server, and removable media item that may store or access ePHI, with serial numbers and assigned workforce member.',
          'Every device on the inventory has full-disk encryption enabled and verified at issuance.',
          'A media disposal log records every device or media item retired, the sanitization method used (NIST SP 800-88 conformant where applicable), the date, and the workforce member who performed it.',
          'Hard drives and removable media that have stored ePHI are sanitized or physically destroyed before disposal or re-use; certificates of destruction from a vendor are retained when applicable.',
          'A documented procedure addresses recovery of devices from terminated workforce members within one business day of separation.',
          'Personally owned devices used for work are tracked under the clinic\'s BYOD policy and inventory if BYOD is permitted.',
          'Backup media is stored in a secured location with restricted access and an access log.',
        ]} />
      </Section>

      <Section title="Visitor and Vendor Management">
        <P>
          Visitor management is not a named standard in § 164.310, but it operationalizes facility access control. Auditors look for evidence that the clinic distinguishes workforce members from visitors and limits visitor exposure to PHI.
        </P>
        <Bullets items={[
          'A visitor sign-in log captures name, organization, time in, time out, and purpose for every non-patient visitor.',
          'Visitors are issued a visible visitor badge and are escorted in any area beyond the public reception zone.',
          'Vendor and contractor visits to areas containing ePHI are scheduled in advance, escorted, and documented.',
          'Vendors with potential PHI exposure (IT support, biomedical service, document destruction) have a signed Business Associate Agreement on file before any visit.',
          'Patient family members and accompanying persons are kept out of staff-only areas; rooming procedures clarify who may follow a patient back.',
        ]} />
      </Section>

      <Section title="Paper PHI and After-Hours Securing">
        <P>
          Paper records remain a significant source of small-clinic breaches. Charts, intake forms, faxes, lab printouts, and superbills are PHI under the same Privacy Rule that governs the EHR.
        </P>
        <Bullets items={[
          'All paper PHI is stored in locked file cabinets, locked rooms, or locked carts when not actively in use.',
          'A documented end-of-day procedure requires every workforce member to return paper PHI to secured storage before leaving.',
          'Inbound faxes are removed from the fax machine promptly and routed to the responsible workforce member or secured storage; abandoned faxes are reviewed daily.',
          'A locked shred bin is provided for paper PHI awaiting destruction; the bin is not left in unsecured hallways or public areas.',
          'A shredding vendor with a signed BAA performs destruction on a documented schedule, and certificates of destruction are retained.',
          'In-house cross-cut shredding (where used in lieu of a vendor) is performed in a non-public area and the destruction is logged.',
        ]} />
      </Section>

      <Section title="Disposal Procedures">
        <P>
          Disposal failures appear regularly in OCR resolution agreements. The Security Rule disposal specification at § 164.310(d)(2)(i) requires policies and procedures to address the final disposition of ePHI and the hardware or media on which it is stored.
        </P>
        <Bullets items={[
          'A written disposal policy identifies the sanitization or destruction method for each media type the clinic uses.',
          'Hard drives are sanitized using NIST SP 800-88 Purge or Destroy methods as appropriate for the media type; vendor certificates of destruction are retained when destruction is outsourced.',
          'Mobile devices are factory-reset and confirmed wiped before disposal, donation, or trade-in.',
          'Paper PHI is cross-cut shredded or pulped; single-cut strip shredding is not used.',
          'A disposal log entry exists for every retired device or media item, with date, method, and the responsible workforce member.',
        ]} />
      </Section>

      <Section title="Environmental and Detective Controls">
        <P>
          Cameras, locks, and environmental sensors are not explicitly required, but they are reasonable and appropriate safeguards under § 164.306 and frequently appear in OCR corrective action plans for small practices.
        </P>
        <Bullets items={[
          'Server or network closet doors are locked at all times and accessible only to authorized workforce members and pre-approved vendors.',
          'Surveillance cameras cover entry points, the records storage area, and the server closet exterior; recordings are retained per the clinic\'s documented retention schedule.',
          'Camera placement and recording practices are disclosed in the Notice of Privacy Practices to the extent any patient area is recorded.',
          'Smoke detection, fire suppression, and water leak detection are present in any area housing servers or backup media.',
          'An uninterruptible power supply or backup power arrangement protects on-premises servers from sudden power loss.',
          'Lock cores on records storage and server closets are re-keyed when a workforce member with that key separates from the clinic.',
        ]} />
      </Section>

      <Section title="Audit Sign-Off">
        <P>
          Use this section to formalize completion of the audit. The signed sign-off becomes part of your Security Rule documentation.
        </P>
        <Bullets items={[
          'Audit date.',
          'Auditor name and role.',
          'Sites or rooms covered.',
          'Findings summary (compliant items, remediation items, not-applicable items).',
          'Remediation owner and target date for every flagged item.',
          'Signature of the HIPAA Security Officer or Practice Administrator.',
          'Date of next scheduled audit.',
        ]} />
      </Section>
    </PdfLayout>
  )
}
