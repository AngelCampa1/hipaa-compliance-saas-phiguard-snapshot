---
title: "HIPAA AI Tool Vetting Checklist"
headline: "Evaluate any AI tool for HIPAA compliance before your staff uses it"
description: "A structured checklist for evaluating AI tools before allowing staff to use them in patient care or administrative contexts involving PHI. Covers BAA availability, data residency, training data policy, security certifications, subprocessor disclosure, data retention and deletion terms, and incident notification procedures. Includes scoring rubric and minimum requirements for HIPAA-eligible use."
metaDescription: "Free HIPAA AI tool vetting checklist. Evaluate BAA availability, data residency, training data policy, certifications, and breach notification before."
magnetSlug: "hipaa-ai-tool-vetting-checklist"
summary: "Use this ai tool vetting checklist to help small clinics turn cited HIPAA requirements into dated operating evidence. It gives staff a practical way to record decisions, owners, review dates, exceptions, and follow-up tasks, then tie the completed artifact back to policies, BAAs, risk analysis, patient-rights workflows, or safeguard reviews."
stage: "consideration"
sequenceStage: "consideration"
kind: article
pillar: vendor-management
schemaType: how-to
intent: consideration
bullets:
  - "BAA availability section: does the vendor offer a BAA, on which pricing tier, what does the BAA cover, and what does it exclude — critical because many AI vendors offer BAAs only at enterprise pricing tiers"
  - "Training data policy evaluation: the single most important question for AI tools — whether the vendor uses customer inputs to train or improve their models, because if they do, no PHI may ever be entered"
  - "Data residency and foreign data storage: confirmation that data is stored and processed on U.S. servers, relevant for covered entities operating under U.S. law and for any state law requirements"
  - "Security certification check: SOC 2 Type II, ISO 27001, HITRUST CSF — what certifications the vendor holds and whether the certificate covers the specific product being used"
  - "Scoring rubric with a defined minimum threshold: specific criteria that must be met before any PHI may be shared with the tool, regardless of how useful the tool is in practice"
faq:
  - q: "A staff member is already using an AI tool without clearance. What should we do?"
    a: "Stop further PHI input immediately and assess whether PHI has already been entered. If PHI was entered into an unapproved tool, that is a potential breach under 45 CFR § 164.402 and requires a risk assessment using the four-factor test. Complete the vetting checklist for the tool. If the tool cannot meet minimum HIPAA requirements, it must be prohibited. Document the incident and any corrective action in your incident log regardless of whether a reportable breach occurred."
  - q: "A free AI tool says it does not offer a BAA. Can we use it for non-PHI tasks?"
    a: "Potentially yes, if you can guarantee that no PHI is ever entered. The practical challenge is that staff in a clinical environment often share PHI inadvertently — a patient name in a scheduling question, a diagnosis in a documentation request. If there is no BAA and no organizational guardrail that reliably prevents PHI entry, the tool should not be used on clinic devices or by clinic staff during clinical operations."
  - q: "The vendor says they are HIPAA compliant. Is that enough?"
    a: "No. 'HIPAA compliant' is not a certification — there is no federal certification program for HIPAA compliance. Any vendor can claim HIPAA compliance. What matters is whether the vendor will sign a BAA, what the BAA covers, whether their security program is verified by an independent auditor (SOC 2 Type II is the standard), and whether their data handling terms are compatible with your obligations as a covered entity. This checklist evaluates all of those dimensions."
  - q: "Is this free?"
    a: "Yes. Enter your email and we will send the full resource to your inbox."
  - q: "Why do you need my email?"
    a: "We send the resource directly to your inbox. We will not add you to a marketing list without your consent."
publishedAt: "2026-04-29"
updatedAt: "2026-04-29"
sources:
  - title: "45 CFR § 164.308(b) — Business Associate Contracts and Other Arrangements"
    url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.308"
    publisher: "eCFR"
  - title: "Business Associate Guidance"
    url: "https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/business-associates/index.html"
    publisher: "HHS"
author: "angel-campa"
reviewer: "phiguard-compliance-research"
relatedResource: "hipaa-ai-tool-vetting-checklist"
relatedCommercialPath: "/product"
relatedLearnPath: "/learn/phi-workflows/phi-in-ai-tools"
---

## The AI Risk Happening Right Now in Your Clinic

Staff at medical clinics are using AI tools today. They are using them for clinical documentation, scheduling communications, billing inquiry responses, and dozens of other tasks. In many cases, they are doing this without formal clearance, without a BAA in place, and without understanding whether the tool retains, uses, or trains on the information they enter.

HIPAA's business associate framework is clear: any vendor that creates, receives, maintains, or transmits PHI on behalf of a covered entity is a business associate. A business associate relationship without a signed BAA violates 45 CFR § 164.308(b). It is not a gray area — it is a required implementation specification.

The harder reality is that AI vendor terms of service are designed for consumer and enterprise software markets, not for healthcare compliance. The defaults are often incompatible with HIPAA: data may be retained for extended periods, used to improve models, routed through subprocessors in multiple countries, and subject to deletion timelines that exceed what your records retention policy permits. A vendor that offers a BAA for enterprise customers but not for standard-tier customers is telling you something important: their standard product was not designed with HIPAA in mind.

This checklist is a downloadable PDF that gives your Privacy Officer a structured evaluation process for any AI tool under consideration — before the first PHI is entered. It is also useful retroactively, when a tool is already in use and you need to determine whether it can be cleared or must be prohibited.

## What's in the PDF

### Section 1 — BAA Availability and Terms

The BAA evaluation goes beyond "do they offer one?" It covers:

**BAA availability.** Does the vendor offer a BAA, and is it available on the pricing tier your clinic is using Many AI vendors offer BAAs only at enterprise or custom pricing tiers. If your clinic is on a standard plan, the BAA may not be available without upgrading.

**BAA scope.** What does the BAA cover Does it cover all products and features your staff would use, or does it exclude certain features (such as model training, third-party integrations, or analytics) A BAA that covers the core product but excludes the features your staff intend to use is incomplete.

**BAA terms review.** The checklist includes a 10-point review of standard BAA terms: permitted uses and disclosures, security requirements, subcontractor requirements, breach notification timeline, termination provisions, and return or destruction of PHI at termination. The PDF flags the terms most commonly problematic in AI vendor BAAs and what to look for.

**Who signs.** Does an authorized representative of the vendor sign the BAA, or is it a click-through agreement A click-through BAA may be legally sufficient, but document it in your BAA register with the date accepted and the version of the agreement.

### Section 2 — Training Data Policy

This is the evaluation most likely to disqualify a tool. Many AI vendors, particularly those offering free or low-cost tiers, reserve the right to use customer inputs to train or improve their models. If a vendor trains on customer inputs, no PHI may be entered into the tool under any circumstances, regardless of whether a BAA is in place.

The training data policy checklist asks:

- Does the vendor explicitly state that customer inputs are not used for model training?
- Is this commitment contractually binding (in the BAA or data processing agreement) or only a policy statement?
- Does the commitment cover all features of the product, or only certain modes?
- What is the vendor's data retention period for inputs and outputs?

A vendor that cannot provide a clear, contractually binding commitment that PHI will not be used for model training cannot receive PHI.

### Section 3 — Data Residency

The checklist verifies: are data stored and processed on U.S. servers Are there subprocessors in foreign jurisdictions that would receive data as part of normal product operations Some state laws impose additional restrictions on cross-border PHI transmission. For most covered entities, U.S.-only data residency is the required standard.

### Section 4 — Security Certifications

Security certifications provide independent verification that a vendor's security program meets a defined standard. The checklist evaluates:

- **SOC 2 Type II.** The most widely held certification for SaaS vendors. Type II covers a period (typically 6–12 months) rather than a point in time. Request the report, not just the attestation.
- **ISO 27001.** An internationally recognized information security management standard. Less common among U.S. SaaS vendors but relevant when held.
- **HITRUST CSF.** The healthcare industry's standard. HITRUST certification is the most directly relevant to HIPAA, but it is expensive to obtain and not all HIPAA-compliant vendors pursue it.

The checklist notes: does the certification cover the specific product you are evaluating, or only a portion of the vendor's infrastructure?

### Section 5 — Subprocessor Disclosure

The vendor's product almost certainly uses third-party subprocessors — infrastructure providers, analytics services, monitoring tools. The checklist asks: does the vendor publish a list of subprocessors Does the vendor's BAA require that subprocessors are bound by equivalent security and HIPAA obligations Do subprocessors have access to data in a form that includes PHI, or only to encrypted or anonymized data?

### Section 6 — Data Retention and Deletion Terms

What happens to data the vendor holds The checklist evaluates: retention period for inputs and outputs, deletion timeline at termination, whether deletion is guaranteed or best-effort, and whether you can request early deletion of specific data for breach remediation purposes.

### Section 7 — Incident Notification Procedures

If the vendor experiences a breach that includes your PHI, how and when will they notify you The HIPAA Breach Notification Rule requires covered entities to notify affected individuals within 60 days of discovering a breach. Your BAA should require the business associate to notify you within a timeframe that allows you to meet that deadline. The checklist evaluates: contractual notification timeline, what events trigger notification, and the vendor's incident response plan.

### Scoring Rubric and Decision Threshold

The rubric assigns each section a weight and produces a numeric score. The decision threshold section specifies which criteria are absolute disqualifiers (a "no" in this category means no PHI regardless of overall score) and which criteria are weighted against overall risk.

**Absolute disqualifiers:**
- No BAA available on your pricing tier
- Training data policy uses inputs for model training and is not contractually waivable
- Data processed or stored outside the U.S. without contractual restriction

## Regulatory Basis

The business associate framework is established at 45 CFR § 164.308(b) (Security Rule) and 45 CFR § 164.502(e) and 164.504(e) (Privacy Rule). A covered entity that permits a business associate to create, receive, maintain, or transmit PHI without a signed BAA violates the Security and Privacy Rules. The violation is not mitigated by the covered entity's belief that the vendor was HIPAA compliant.

HHS's 2013 Omnibus Rule extended the definition of business associate to include subcontractors of business associates. The vendor's subprocessors who handle PHI are also business associates, and the BAA chain must extend to them.

## Related Resources

For evaluating vendors more broadly, use the companion [HIPAA vendor security questionnaire](/resources/hipaa-vendor-security-questionnaire), which covers the full range of security questions for any type of vendor — not only AI tools. For a risk analysis that accounts for AI tool exposure, use the [HIPAA risk analysis template](/resources/hipaa-risk-analysis-template).

PHIGuard is built for covered entities and publishes BAA details on the pricing page. See the [PHIGuard HIPAA page](/hipaa) for the full compliance architecture, or [view pricing](/pricing).
