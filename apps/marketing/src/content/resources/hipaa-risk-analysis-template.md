---
title: "HIPAA Risk Analysis Worksheet"
seoTitle: "HIPAA Risk Assessment Template"
headline: "Complete your annual HIPAA risk assessment without a compliance consultant"
description: "A step-by-step HIPAA risk assessment template built on the NIST SP 800-66 Rev. 2 methodology. Covers asset inventory, threat identification, vulnerability assessment, likelihood and impact scoring, residual risk, and remediation evidence."
metaDescription: "Free HIPAA risk assessment template for small clinics. NIST SP 800-66 methodology, risk register, scoring, and remediation worksheet."
magnetSlug: "hipaa-risk-analysis-template"
summary: "A HIPAA risk assessment template helps a clinic document assets that touch ePHI, realistic threats, current vulnerabilities, likelihood and impact ratings, existing controls, residual risk, and remediation owners. This worksheet turns the required 45 CFR 164.308(a)(1)(ii)(A) risk analysis into a repeatable clinic workflow."
stage: "consideration"
sequenceStage: "consideration"
bullets:
  - "Structured threat inventory covering ePHI access points: EHR, scheduling software, email, mobile devices, and physical records"
  - "Likelihood x impact scoring matrix with built-in risk level categories (low / moderate / high)"
  - "Pre-populated with the most common threats found in OCR investigations of small practices"
  - "Residual risk documentation section - records what controls are in place after mitigation"
  - "Annotated with the specific regulatory citations so you understand what each section maps to"
faq:
  - q: "Is a risk analysis really required?"
    a: "Yes. 45 CFR §164.308(a)(1)(ii)(A) makes it a required implementation specification. OCR commonly asks for risk-analysis evidence during audits and breach investigations."
  - q: "How often do I need to do this?"
    a: "At minimum annually, and after any material change: new software, new location, new EHR vendor, or a security incident."
  - q: "Can a small clinic complete this without a consultant?"
    a: "Yes. This worksheet is designed for practice administrators without a compliance background. Each section includes plain-English guidance."
  - q: "Is this free?"
    a: "Yes. Enter your email and we will send the full worksheet to your inbox."
  - q: "Why do you need my email?"
    a: "We send the resource directly to your inbox. We will not add you to a marketing list without your consent."
publishedAt: "2026-04-18"
updatedAt: "2026-05-21"
sources:
  - title: "Guidance on Risk Analysis"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/guidance-risk-analysis/index.html"
    publisher: "HHS"
  - title: "NIST SP 800-66 Rev. 2"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/product"
relatedLearnPath: "/learn/risk-analysis/how-to-do-a-hipaa-risk-analysis"
---

## Why the risk analysis comes first

The HIPAA Security Rule opens with a required implementation specification: §164.308(a)(1)(ii)(A), the risk analysis. Every covered entity must conduct an accurate and thorough assessment of the potential risks and vulnerabilities to the confidentiality, integrity, and availability of the ePHI the organization creates, receives, maintains, or transmits. The requirement is not scaled by clinic size. A five-person primary care office and a 2,000-provider hospital system are both obligated.

OCR has been clear about why this matters. In the agency's audit protocols and published resolution agreements, absent or inadequate risk analysis appears frequently. A clinic can have firewalls, encryption, training, and policies and still be exposed if the risk analysis is missing, stale, or limited to a vendor-supplied checklist with no site-specific content. The reason: other Security Rule safeguards should be selected and sized based on the risks the analysis surfaced. Without the analysis, the safeguards are harder to defend.

This worksheet walks through the method. It is based on NIST SP 800-66 Rev 2 ("Implementing the HIPAA Security Rule: A Cybersecurity Resource Guide"), which HHS cites as an authoritative guide for covered entities. The structure below is adapted for a small practice that does not have an in-house security team.

## Before You Start

Schedule the analysis when you can give it sustained attention. This is not a lunch-break exercise. A five-person clinic can usually complete a first pass in eight to twelve hours of focused work spread across two weeks, plus follow-up as remediation items are closed.

Assemble a small working group. Practical composition for a small practice:

- Security Officer (owns the analysis)
- Privacy Officer (often the same person in a small clinic)
- Practice administrator
- One clinical lead (provider or senior clinical staff)
- One billing lead
- IT representative (internal staff or the external IT vendor under BAA)

Pull the source material into one place before the first working session: a current inventory of systems and vendors, the existing BAA tracker, prior incident logs, workforce roster with roles, the previous risk analysis if one exists, and any audit findings from payers or state regulators.

## The Seven-Step Method

### Step 1 - Inventory the Assets

You cannot protect what you have not listed. Start with an asset inventory that lists each PHI-touching system, device, record set, and vendor. For each asset, record whether it touches PHI, where it lives, and who is accountable for it.

Asset inventory template - columns:

| Asset | Type | PHI Touched (Y/N) | Storage Location | Vendor / BAA Status |
|---|---|---|---|---|
| EHR production database | Application + data | Y | Vendor cloud (region) | Vendor, BAA signed [date] |
| Scheduling system | Application | Y | Vendor cloud | Vendor, BAA signed [date] |
| Billing platform | Application | Y | Vendor cloud | Vendor, BAA signed [date] |
| Clinical laptops (5 units) | Endpoint | Y | On-premise, portable | N/A - managed internally |
| Front-desk workstations (3 units) | Endpoint | Y | On-premise | N/A |
| Exam-room tablets (4 units) | Endpoint | Y | On-premise, portable | N/A |
| On-site backup server | Storage | Y | On-premise server room | N/A |
| Off-site cloud backup | Storage | Y | Vendor cloud | Vendor, BAA signed [date] |
| Email (practice domain) | Communications | Y | Vendor cloud | Vendor, BAA signed [date] |
| Paper charts (legacy) | Physical records | Y | Locked records room | N/A |
| Fax line | Communications | Y | On-premise analog | N/A |
| Staff personal phones (BYOD) | Endpoint | Y (if permitted) | Personal devices | Per BYOD policy |
| Patient portal | Application | Y | EHR vendor cloud | Covered under EHR BAA |
| Telehealth platform | Application | Y | Vendor cloud | Vendor, BAA signed [date] |
| Network infrastructure (router, switches, Wi-Fi) | Network | Transit | On-premise | N/A |

Do not stop at software. Physical records, fax machines, voicemail systems that patients leave appointment details on, whiteboards in staff areas - if it holds or transmits PHI, it belongs on the list. A thorough inventory usually surprises the clinic; items that "everyone forgot about" are a common risk source.

### Step 2 - Identify Threats

For each asset, consider realistic threat sources. A threat is an event or actor that could cause harm if it acted on a vulnerability. Use a standard catalog rather than freelancing; the catalog below covers the threats most relevant to ambulatory practices.

**Threat catalog:**

- **Malware and ransomware.** Opportunistic encryption attacks that disable clinical operations and threaten PHI exposure. Ransomware specifically is treated as a presumptive breach by HHS guidance unless a risk assessment demonstrates low probability of compromise.
- **Unauthorized access by workforce.** A workforce member accessing records they have no business need to see. Curiosity cases, relatives of the workforce member, high-profile patients, former partners.
- **Insider misuse.** A workforce member intentionally misusing access - downloading a patient list to take to a new employer, snooping on a divorce opponent, selling information.
- **Physical theft or loss.** Stolen laptop from a vehicle, lost phone left at a coffee shop, stolen backup drive, missing paper chart.
- **Natural disaster.** Fire, flood, hurricane, extended power failure. Impacts availability first, confidentiality and integrity second.
- **Vendor compromise.** A Business Associate or subcontractor is breached, and PHI the vendor holds for you is exposed. You inherit the notification obligations.
- **Misdelivery.** Fax sent to the wrong number. Email sent to the wrong address. Release of records mailed to the wrong patient. These are the highest-volume small-clinic incident category.
- **Phishing and social engineering.** Credential theft from staff email accounts. Business email compromise targeting the billing function.
- **Unsecured disposal.** PHI printed and thrown in the trash rather than shredded. Old devices sold or donated without wiping.
- **Wireless eavesdropping.** Guest Wi-Fi bridged to clinical Wi-Fi, weak pre-shared keys, rogue access points.
- **Physical intrusion.** After-hours break-in to records storage or server room.
- **Third-party maintenance error.** Vendor technician on-site introduces malware via USB, misconfigures a firewall, walks out with a laptop.

Apply each relevant threat to each asset. Not every threat applies to every asset - ransomware is not a meaningful threat to a fax machine - but the matrix exercise forces deliberate thinking.

### Step 3 - Identify Vulnerabilities

A vulnerability is the weakness that would let a threat actually cause harm. For each threat-asset pairing, document the existing weaknesses.

Common vulnerabilities in small practices:

- No multi-factor authentication on the EHR
- Shared accounts or recycled passwords
- Workstations with no auto-lock timer
- Backup server in an unlocked utility closet
- BYOD with no mobile device management
- Staff trained once at hire with no annual refresher
- No formal sanctions policy acknowledged in writing
- No documented inventory of business associates
- Encryption not enabled on clinical laptops
- Faxes sent without cover-sheet checks on destination numbers
- Incident response plan exists on paper but has never been tested
- Access permissions granted broadly and never reviewed

The goal at this step is honesty, not optimism. A vulnerability you refuse to write down is a vulnerability that will surface later in a breach investigation.

### Step 4 - Score Likelihood x Impact

For each risk (threat + vulnerability + asset), assign a likelihood rating and an impact rating. Use a simple 3x3 matrix. Low, Moderate, High. Resist the urge to add five or seven levels; the precision is false and the scoring arguments get longer than the analysis.

**Likelihood scale:**

- **Low.** The threat is unlikely to act on the vulnerability in the next 12 months given current controls and threat history.
- **Moderate.** The threat could plausibly act on the vulnerability in the next 12 months. You would not be surprised.
- **High.** The threat is active or the vulnerability has been exploited before in your environment or in clinics like yours.

**Impact scale:**

- **Low.** Limited exposure - a small number of records, easily contained, unlikely to require individual notification.
- **Moderate.** A meaningful exposure - dozens to hundreds of records, requires workforce response, may trigger individual notification.
- **High.** Significant exposure - breach of 500 or more individuals (triggering §164.408 HHS notification and §164.406 media notice if applicable), or exposure of sensitive categories (behavioral health, substance use, HIV), or full loss of availability for the practice.

**Risk level matrix:**

|  | Impact: Low | Impact: Moderate | Impact: High |
|---|---|---|---|
| **Likelihood: Low** | Low | Low | Moderate |
| **Likelihood: Moderate** | Low | Moderate | High |
| **Likelihood: High** | Moderate | High | High |

A risk rated High requires a documented remediation plan with a target date. A risk rated Moderate requires either remediation or a documented acceptance rationale signed by the Security Officer. Low risks are logged and reviewed annually.

### Step 5 - Document Current Controls

For each identified risk, list the controls already in place. This is the honest ledger: what you actually have, not what the policy says you should have. A policy saying "all laptops are encrypted" does not count if three laptops are not encrypted.

Controls are categorized by safeguard type (see the safeguard map later in this document). Example entries:

- "EHR requires unique user IDs and 90-day password rotation; MFA enabled for administrators only."
- "Clinical laptops encrypted with BitLocker; encryption status verified [date]."
- "Backup server in locked closet; key held by practice administrator and lead provider."
- "Annual HIPAA refresher training completed by 4 of 6 workforce members in the last 12 months."

### Step 6 - Calculate Residual Risk

Residual risk is the risk that remains after current controls are applied. Rate each risk a second time with the controls in place. The delta between initial risk and residual risk is the value your existing program is providing. The residual risk level is what you are actually carrying.

If residual risk is still High or Moderate, you have a gap. Document the gap, the proposed remediation, the owner, and the target close date in the risk register.

### Step 7 - Prioritize Remediation

You cannot fix everything in a single quarter. Prioritize by residual risk level, then by cost-to-fix. Remediation items with high residual risk and low cost-to-fix (enabling MFA, tightening password policy, adding a screen-lock timer, signing an outstanding BAA) move to the top of the list. Remediation items with high residual risk and high cost-to-fix (replacing a legacy EHR, rebuilding network segmentation) become multi-quarter projects with interim compensating controls.

## Risk Register Template

The risk register is the working record of open and accepted risks. Spreadsheet or dedicated tool, the column structure stays the same.

| Risk ID | Description | Likelihood | Impact | Initial Score | Current Controls | Gap | Remediation Plan | Owner | Target Date | Residual Likelihood | Residual Impact | Residual Score | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| R-001 | Ransomware encrypts EHR and backup server, disabling clinical operations | Moderate | High | High | Daily cloud backup; endpoint AV; email filtering | No MFA on administrator accounts; backups not tested for restore in 12 months | Enable MFA on all admin accounts; schedule quarterly restore test; segment backup network | Security Officer | [Q+1] | Low | High | Moderate | In progress |
| R-002 | Workforce member accesses records of a family member without business need | Moderate | Moderate | Moderate | Role-based access in EHR; quarterly access review | No proactive alerting on suspicious access patterns | Enable EHR audit log monitoring; document break-glass access review procedure | Practice Administrator | [Q+2] | Low | Moderate | Low | Planned |
| R-003 | Laptop stolen from provider's vehicle | Low | High | Moderate | BitLocker enabled; EHR credentials not cached | Mobile device management not deployed | Deploy MDM with remote wipe; document device inventory | Security Officer | [Q+1] | Low | Moderate | Low | Planned |

Each row is an auditable artifact. During an OCR investigation, a current register with closed remediation items and documented decisions is the best evidence that the organization took the Security Rule seriously.

## Safeguard Mapping

§164.308, §164.310, and §164.312 list the administrative, physical, and technical safeguards your program must address. Map each risk to the relevant safeguard so you can demonstrate coverage across all three categories.

### Administrative Safeguards (§164.308)

- Security Management Process (including the risk analysis itself) - §164.308(a)(1)
- Assigned Security Responsibility - §164.308(a)(2)
- Workforce Security (authorization, supervision, termination) - §164.308(a)(3)
- Information Access Management - §164.308(a)(4)
- Security Awareness and Training - §164.308(a)(5)
- Security Incident Procedures - §164.308(a)(6)
- Contingency Plan (backup, disaster recovery, emergency mode) - §164.308(a)(7)
- Evaluation - §164.308(a)(8)
- Business Associate Contracts - §164.308(b)

### Physical Safeguards (§164.310)

- Facility Access Controls - §164.310(a)
- Workstation Use - §164.310(b)
- Workstation Security - §164.310(c)
- Device and Media Controls (disposal, re-use, movement) - §164.310(d)

### Technical Safeguards (§164.312)

- Access Control (unique user ID, emergency access, automatic logoff, encryption/decryption) - §164.312(a)
- Audit Controls - §164.312(b)
- Integrity (protection against improper alteration or destruction) - §164.312(c)
- Person or Entity Authentication - §164.312(d)
- Transmission Security (integrity controls, encryption in transit) - §164.312(e)

Every identified risk should map to at least one safeguard. Every safeguard should have at least one control in place or a documented plan.

## Annual Review Checklist

The risk analysis is a living document. At minimum, refresh it once every 12 months and after any material change. "Material change" includes:

- New EHR, billing system, or practice management platform
- New physical location or significant office reconfiguration
- New Business Associate relationship in a category you have not used before (first cloud vendor, first telehealth platform)
- Security incident or near-miss
- Change in workforce size of more than 25%
- Regulatory guidance update (HHS, state)

**Annual review tasks:**

- [ ] Update the asset inventory (additions, retirements, replacements)
- [ ] Refresh the BAA tracker and confirm every BAA is current
- [ ] Review the threat catalog for new or elevated threats
- [ ] Re-score likelihood and impact for each open risk
- [ ] Close remediated risks with evidence
- [ ] Add new risks surfaced in the last 12 months
- [ ] Review residual risk acceptance decisions with the Security Officer
- [ ] Present a summary to clinic leadership
- [ ] File the updated analysis with date and signature

## What PHIGuard Changes

PHIGuard holds your risk register as a live artifact rather than a document that ages in a folder. Asset inventory, threat catalog, scoring matrix, and remediation tasks live in one place with an owner and a due date on every open item. BAA tracker, training log, and incident records link into the register so the clinic can retrieve evidence without rebuilding it during an audit or incident review.

PHIGuard keeps the risk register, remediation owners, due dates, and supporting evidence in one system rather than a document set that has to be rebuilt each year.

