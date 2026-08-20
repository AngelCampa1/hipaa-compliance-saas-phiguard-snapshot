---
title: "PHI Retention and Destruction Requirements Under HIPAA"
seoTitle: "PHI Retention and Destruction"
description: "HIPAA does not specify how long to retain medical records — state law does. But HIPAA does require documented policies for PHI retention and destruction, and specific methods for destroying PHI so it cannot be reconstructed."
metaDescription: "HIPAA data retention and PHI destruction requirements: what 45 CFR §164.530(j) requires, state law overlays, approved destruction methods, and BA..."
publishedAt: 2026-04-28
updatedAt: 2026-04-28
kind: article
pillar: phi-fundamentals
intent: awareness
schemaType: article
summary: "Confusion between HIPAA retention requirements and state medical records retention laws is common. HIPAA governs how long you retain compliance documentation, not how long you retain patient records — that is state law. HIPAA does govern how PHI must be destroyed and what your business associates must do with PHI when an agreement ends."
keyTakeaways:
  - "HIPAA does not specify a retention period for patient medical records. State law sets those requirements — typically 7–10 years for adults, longer for minors."
  - "HIPAA does require retention of compliance documentation (policies, training records, risk analyses, BAAs) for six years under 45 CFR §164.530(j)."
  - "PHI destruction must render the information unreadable and unable to be reconstructed — shredding paper, wiping or destroying digital media."
  - "Chain-of-custody documentation for destruction is not required by HIPAA but is strongly recommended and required by many state laws."
  - "At BAA termination, your business associate must return or destroy all PHI it holds — if neither is feasible, the BAA must document why and limit further use."
sources:
  - title: "45 CFR §164.530 — Administrative Requirements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.530"
    publisher: "eCFR"
  - title: "HIPAA Privacy Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/index.html"
    publisher: "HHS"
faq:
  - q: "How long does HIPAA require clinics to keep medical records?"
    a: "HIPAA does not set a retention period for patient medical records. Retention is governed by state law, which varies. Most states require adult patient records to be retained for 7 to 10 years from the date of last treatment. Pediatric records typically must be retained until the patient reaches a specific age (usually 18 or 21) plus several additional years. Check your state's specific requirements."
  - q: "What does HIPAA require for the destruction of PHI?"
    a: "Under HIPAA, PHI must be destroyed in a way that makes it unreadable and unable to be reconstructed. For paper records, this means shredding or incineration. For electronic media, it means clearing (overwriting), purging (degaussing), or destroying (physical destruction) the media. Deleting a file or dragging it to the trash does not constitute destruction."
  - q: "What are the HIPAA documentation retention requirements?"
    a: "45 CFR §164.530(j) requires covered entities to retain compliance documentation — written policies, training records, risk analyses, BAA inventory, and related documents — for six years from the date of creation or the date it was last in effect, whichever is later."
  - q: "What happens to PHI held by a business associate when the BAA ends?"
    a: "Under the standard BAA terms required by HIPAA, a business associate must return or destroy all PHI it holds at the termination of the BAA. If return or destruction is not feasible, the BA must notify the covered entity, document why it is not feasible, and agree to extend HIPAA protections to the PHI and limit further use. The BA must destroy the PHI when return or destruction becomes feasible."
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedCommercialPath: "/hipaa"
---

Two retention topics frequently get conflated in clinic conversations. They are different legal questions with different answers.

The first is: how long must a clinic keep patient medical records? That answer comes from state law, not HIPAA. Most states require adult patient records to be retained for a minimum of seven to ten years after the last date of treatment. Pediatric records often must be retained until the patient reaches majority plus additional years. HIPAA is silent on this.

The second is: how long must a clinic retain its HIPAA compliance documentation? That answer is in HIPAA. 45 CFR §164.530(j) requires covered entities to retain written policies and procedures and written records of required actions, activities, and assessments for six years from the date of creation or the date it was last in effect, whichever is later.

Understanding which question you are asking is the first step toward answering it correctly.

## What HIPAA Actually Requires for Retention

HIPAA's administrative requirements at 45 CFR §164.530(j) apply to compliance documentation — not patient records themselves. The documentation that must be retained for six years includes:

- Written privacy and security policies and procedures
- Training records showing who was trained, on what, and when
- Risk analysis and risk management documentation
- Business associate agreements and BAA inventories
- Security incident documentation and breach response records
- Documentation of compliance decisions (such as the rationale for implementing an alternative measure under an addressable specification)

This six-year retention requirement for compliance documentation runs concurrently with state medical records retention requirements but is not the same obligation. A clinic must meet both.

## State Law Governs Medical Records Retention

Every state has its own medical records retention statute or regulation. The variation is significant:

- Most states require adult patient records to be retained for a minimum of seven years after the last date of service.
- Several states require ten years or longer for general adult records.
- Pediatric records typically require retention until the patient reaches age 18 or 21 (depending on the state) plus an additional period — often six or seven years.
- Certain record categories (radiology images, surgical records, OB records) may have separate and longer retention requirements under state law.
- Federal program participation may impose additional requirements — Medicare requires that records of services billed to Medicare be retained for at least five years, and longer for enrolled providers under some circumstances.

A clinic that destroys records before state law permits it has a state law violation regardless of HIPAA's silence on the subject. Before implementing a records destruction schedule, confirm the applicable state law requirements for each patient population and record category.

## What HIPAA Requires for PHI Destruction

While HIPAA does not tell you when to destroy medical records, it does govern how. Under HHS guidance implementing the Privacy Rule, PHI must be destroyed in a manner that makes the information unreadable, indecipherable, and unable to be reconstructed.

The standard applies to both paper and electronic PHI.

**Paper PHI.** Shredding is the most common method and is explicitly recognized in HHS guidance. The shredding must produce particles that cannot reasonably be reassembled — cross-cut or micro-cut shredders meet this standard. Strip shredders producing long ribbons do not. Incineration also satisfies the destruction standard.

Placing patient records in an unsecured recycling bin, a regular trash can, or a dumpster without shredding is an impermissible disclosure. OCR has investigated and penalized covered entities for exactly this form of disposal.

**Electronic PHI.** Deleting a file does not destroy it. When a file is deleted on most operating systems, the file's contents remain on the storage media until overwritten by other data. That data is recoverable with standard forensic tools.

Accepted methods for electronic media destruction:
- **Clear (overwrite):** Overwriting all storage locations with new data, including data storage areas used for temporary file storage. Single-pass overwriting meets this standard for most media.
- **Purge (degauss):** For magnetic media, degaussing exposes the media to a strong magnetic field that destroys the recorded data. Note: degaussing is not effective for SSDs, flash storage, or optical media.
- **Destroy (physical):** Physical destruction — shredding, disintegrating, pulverizing, or incinerating — eliminates any possibility of data recovery. This is appropriate for end-of-life devices where the data is no longer needed and the device will not be reused.

Simply returning a leased copier, printer, or workstation without confirming data destruction is a frequent source of PHI exposure. Many devices store document images in internal memory. Confirm with the lessor or disposal vendor that media containing ePHI has been properly cleared, purged, or destroyed.

## Chain-of-Custody Documentation

HIPAA does not explicitly require written documentation of each destruction event. But several considerations make documentation essential:

**State law requirements.** Many state medical records laws require documentation of records destruction, including the date, method, description of records destroyed, and the person responsible. California, New York, and Florida each have such requirements.

**Defensibility.** If a privacy complaint or breach investigation occurs, documented destruction records demonstrate that your clinic handled PHI appropriately. Undocumented destruction — a practice of shredding records without any log — leaves no evidence that destruction was performed properly.

**Vendor accountability.** When a shredding vendor or electronic media destruction vendor handles PHI destruction on your behalf, that vendor is a business associate. The destruction certificate they provide is both a BAA-required safeguard and a documentation record.

A minimum destruction log should capture: the date of destruction, a description of the records destroyed (record type and approximate volume or device count), the method of destruction, and the name of the person or vendor who performed the destruction. Retain destruction certificates from vendors.

## What Happens to PHI When a BAA Ends

When a business associate relationship terminates — a vendor contract ends, a software platform is replaced, a consultant engagement concludes — the PHI that vendor holds does not automatically go away. The BAA must address what happens to it.

Under the standard HIPAA BAA requirements, a business associate must, at termination of the BAA, return or destroy all PHI received from the covered entity or created or received on its behalf. The BA must not retain copies of the PHI after termination.

**Destruction obligation.** The preferred outcome for security is destruction — the BA confirms that all PHI in its possession has been permanently destroyed and provides a written confirmation. This closes the data exposure created by the BA relationship.

**Return obligation.** Where PHI must be returned (for example, a cloud storage provider returning data to the clinic), confirm that the return is complete, that no copies remain with the vendor, and that you have received all data in a format you can access.

**When return or destruction is not feasible.** Some cloud platforms and large vendors maintain data in distributed systems where complete destruction or return is technically impossible at the moment of contract termination. In those cases, the BAA must document the reason return or destruction is not feasible. The BA must agree to extend all HIPAA protections to the retained PHI and limit further use to only what is required by law. The BA must destroy the PHI as soon as return or destruction becomes feasible.

Accepting a vendor's statement that destruction "is not feasible" without written documentation and a commitment to eventual destruction is inadequate. That commitment must be in writing, and your clinic must follow up to confirm ultimate destruction.

## A Practical Destruction and Retention Checklist

Before implementing or updating your PHI retention and destruction program, work through these items:

- Confirm your state's medical records retention requirement for adult and pediatric patients
- Confirm retention requirements for specific record types (radiology, surgical, obstetric)
- Confirm Medicare and other program retention requirements if applicable
- Verify that all shredders in clinical and administrative areas meet the cross-cut or micro-cut standard
- Confirm that copiers, printers, and multifunction devices are cleared before return or disposal
- Identify all devices that store ePHI (workstations, laptops, tablets, servers, network-attached storage)
- Establish a documented end-of-life process for each device category
- Obtain destruction certificates from any vendor handling PHI destruction on your behalf
- Review existing BAAs to confirm they contain required return/destruction terms
- Upon vendor termination, request written confirmation of PHI destruction or return

Retention and destruction are the bookends of the PHI lifecycle. Getting both right means knowing which law governs retention, building destruction processes that meet HIPAA's standard, and holding your business associates accountable for what they do with PHI after your relationship ends.
