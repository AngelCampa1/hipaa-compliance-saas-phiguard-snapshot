---
title: "Asset Inventory for Small Clinics: The NIST Approach"
seoTitle: "HIPAA Asset Inventory for Clinics"
description: "How to build an asset-based risk analysis using NIST SP 800-66 Rev. 2: list devices, systems, locations, and BAAs, and map ePHI flows."
metaDescription: "Asset inventory for small clinics following NIST SP 800-66r2: devices, systems, locations, BAAs, and ePHI flow mapping for HIPAA risk analysis."
publishedAt: 2026-04-24
updatedAt: 2026-04-24
kind: "article"
pillar: "risk-analysis"
schemaType: "how-to"
howToSteps:
  - name: "Define the scope"
    text: "Write a one-paragraph scope statement that names every location, every business function, and every workforce group that touches ePHI. The inventory lives or dies by this scope."
  - name: "List every device"
    text: "Walk each location and record every endpoint that stores, processes, or transmits ePHI. Include desktops, laptops, tablets, phones, printers, fax machines, medical devices, and on-prem servers."
  - name: "List every system and application"
    text: "Catalog the EHR, practice management system, imaging, dictation, secure messaging, task management, email, and any cloud service that touches PHI. Note the vendor, URL, and owner for each."
  - name: "Record physical locations"
    text: "Map the clinic's physical footprint: exam rooms, server closets, front desk, storage rooms, and any remote work sites. Each location is a control boundary."
  - name: "Cross-reference the BAA inventory"
    text: "For every external system identified, confirm a signed BAA is on file. Flag any vendor without a BAA as a risk-analysis finding."
  - name: "Map ePHI flows"
    text: "Draw or write how ePHI moves between systems: intake to EHR, EHR to billing clearinghouse, EHR to imaging, EHR to referral partners. Every arrow is a risk surface."
  - name: "Score and prioritize"
    text: "For each asset, record the likelihood and impact of common threats. Use the result to order the remediation backlog."
intent: "awareness"
summary: "NIST SP 800-66 Rev. 2 recommends an asset-based approach to HIPAA risk analysis. For small clinics, that means building a single inventory that covers devices, systems, locations, and vendors, then mapping how ePHI flows through it. It helps clinics connect Security Rule risk analysis work to specific systems, owners, likelihood, impact, mitigation steps, and follow-up evidence."
keyTakeaways:
  - "NIST SP 800-66 Rev. 2 anchors HIPAA risk analysis in a current asset inventory."
  - "Asset inventory and BAA inventory are two views of the same map and should be built together."
  - "ePHI flow mapping is where most small-clinic risk analyses find the real gaps."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
sources:
  - title: "NIST SP 800-66 Rev. 2 - Implementing the HIPAA Security Rule"
    url: "https://csrc.nist.gov/pubs/sp/800/66/r2/final"
    publisher: "NIST"
  - title: "45 CFR 164.308(a)(1)(ii)(A) - Risk Analysis"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "HIPAA Security Rule Guidance Material"
    url: "https://www.hhs.gov/hipaa/for-professionals/security/guidance/index.html"
    publisher: "HHS"
faq:
  - q: "Why asset-based instead of threat-based?"
    a: "NIST SP 800-66 Rev. 2 treats the asset inventory as the foundation because you cannot analyze risk to ePHI without knowing where ePHI lives. A threat-based analysis with no asset map usually misses systems the clinic forgot it had."
  - q: "Do medical devices belong in the inventory?"
    a: "Yes, if they store, process, or transmit ePHI. Many do - ultrasound carts, ECG machines, and infusion pumps with wireless reporting all qualify. Treat each as an endpoint with its own patching, access, and BAA considerations."
  - q: "How often should the inventory be refreshed?"
    a: "At least annually as part of the compliance review, and any time the clinic adds or retires a system. An inventory older than twelve months is treated as stale."
---

A HIPAA risk analysis without a current asset inventory is guesswork. NIST SP 800-66 Rev. 2 makes this explicit: asset-based analysis is the recommended approach because it forces the clinic to see every system, device, and location where ePHI lives before judging the risks to it.

For a small clinic, the inventory is usually one spreadsheet or one task list. The value is in how honestly it reflects the actual footprint.

## Why the asset-based approach

45 CFR 164.308(a)(1)(ii)(A) requires an accurate and thorough assessment of the potential risks and vulnerabilities to ePHI. NIST SP 800-66 Rev. 2 operationalizes that requirement by starting at the asset layer. Devices, systems, locations, and vendors are listed first. Threats and vulnerabilities are evaluated against that list.

The alternative - jumping straight to threats - tends to produce a risk analysis that looks sophisticated on paper and misses the printer in the back office that has been emailing scans to a personal Gmail account for two years.

## What to include

Five categories cover most small-clinic environments.

- Devices: every endpoint with storage or network access, including provider laptops, exam-room tablets, front-desk PCs, clinical workstations, phones used for clinic work, networked printers, and any medical device with data connectivity.
- Systems and applications: EHR, practice management, imaging, dictation, secure messaging, task management, backup, email, file sharing, telehealth, payment processing, and any other SaaS that touches PHI.
- Physical locations: each clinic site, each remote work location where ePHI is accessed, and any off-site storage used for backups or records.
- Business associates: every vendor that creates, receives, maintains, or transmits PHI on behalf of the clinic. This view doubles as the BAA inventory touched in the [annual review checklist](/learn/compliance-operations/hipaa-annual-review-checklist).
- Workforce roles: the groups of users with access to ePHI, mapped to the systems they use. This column feeds access review and sanctions enforcement.

## Map the ePHI flows

The inventory is static. ePHI flows are where risk actually happens. For each major system, trace how data enters, moves, and leaves.

A typical small-clinic flow looks like this: intake forms populate the EHR, the EHR sends encounter data to the billing clearinghouse, imaging posts DICOM studies back into the chart, referral letters go out through secure messaging, and patient-facing communication moves through the portal. Each arrow crosses a system boundary, and each boundary is a risk surface.

The flow map also reveals shadow systems. A provider forwarding patient photos through personal text messaging is a flow. A front-desk scanner saving files to a local folder that is not backed up is a flow. Both should show up in the map even though neither is a sanctioned system.

## The BAA inventory connection

Every external system in the inventory should have a BAA column. If the vendor handles PHI and the BAA column is blank, that is a finding, not a footnote. Vendors that refuse to sign a BAA should not handle PHI.

This is where the inventory and vendor management come together. A missing BAA on an active vendor is both a risk-analysis finding and a Privacy Rule issue under 45 CFR 164.504(e).

## Scoring and prioritization

Once the inventory and flows exist, each asset gets a likelihood and an impact rating for the threats that matter: unauthorized access, loss or theft, malware or ransomware, insider misuse, and vendor compromise. The scoring does not need to be quantitative. A simple low, medium, high matrix is enough for a small clinic, as long as the rationale is written down.

The output is a prioritized list of risks that feeds the [contingency plan](/learn/compliance-operations/hipaa-contingency-planning), the workforce training program, and the [sanctions policy](/learn/compliance-operations/hipaa-sanctions-policy) where relevant.

## Keeping the inventory alive

An inventory built once and never updated decays fast. The working pattern for small clinics is to tie inventory updates to the same events that already happen: new-hire onboarding, vendor signing, device purchases, and location changes. Platforms such as [PHIGuard](/hipaa) attach the inventory to recurring tasks so the document stays current without a dedicated compliance analyst.

## What to do next

If the clinic does not have a written asset inventory, block two hours this week and build v1. Walk the floor, list the obvious devices, list the obvious systems, cross-reference the BAA folder, and sketch the top three ePHI flows. The first version is never perfect. It is dramatically more useful than no inventory at all.
