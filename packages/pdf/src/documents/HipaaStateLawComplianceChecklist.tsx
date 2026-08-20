import { Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function HipaaStateLawComplianceChecklistDocument() {
  return (
    <PdfLayout
      title="HIPAA State Law Compliance Checklist"
      subtitle="State-specific breach deadlines, additional consent requirements, mental health protections, and AG contacts for 10 key states."
    >
      <Section title="How to use this checklist">
        <P>
          HIPAA sets a federal floor. Under 45 CFR § 160.203, state laws that are more protective of patient privacy
          are not preempted - they apply on top of HIPAA. Work through each state row that applies to your clinic and
          mark whether your current policies and procedures address the stricter requirement. Document the review date
          and reviewer name.
        </P>
        <Callout label="Priority rule">
          When state law and HIPAA conflict, the stricter rule applies. If your state requires breach notification in
          30 days and HIPAA allows 60, your clinic must meet the 30-day deadline.
        </Callout>
      </Section>

      <Section title="Breach notification deadlines by state">
        <Table
          headers={['State', 'Individual Notification', 'AG/Regulator Threshold', 'Citation', 'Compliant?']}
          rows={[
            ['California', '72 hours (for digital health data under CMIA)', '500+ CA residents → AG', 'Cal. Civ. Code § 1798.82; CMIA', ''],
            ['Texas', '60 days', '250+ TX residents → AG', 'Tex. Bus. & Com. Code § 521.053', ''],
            ['New York', '72 hours (for digital health data)', '500+ NY residents → AG', 'NY SHIELD Act; Public Health Law § 18', ''],
            ['Florida', '30 days', '500+ FL residents → FDHC', 'Fla. Stat. § 501.171', ''],
            ['Illinois', '45 days', 'Any breach → AG', '815 ILCS 530/10', ''],
            ['Washington', '30 days (2024 My Health MY Data Act)', '>', 'RCW 19.255.010; My Health MY Data Act', ''],
            ['Colorado', '30 days', '500+ CO residents → AG', 'C.R.S. § 6-1-716', ''],
            ['Massachusetts', '30 days', 'All breaches → AG + OCABR', 'M.G.L. c. 93H, § 3', ''],
            ['Virginia', '60 days', '1000+ VA residents → AG', 'Va. Code § 18.2-186.6', ''],
            ['New Jersey', '30 days', 'Discretionary → AG', 'N.J.S.A. 56:8-163', ''],
          ]}
        />
      </Section>

      <Section title="Additional patient consent requirements (beyond HIPAA minimum)">
        <Table
          headers={['State', 'Disclosure Category', 'Requirement Beyond HIPAA', 'Action Needed', 'Compliant?']}
          rows={[
            ['California', 'Employer access to health info', 'Written authorization required (CMIA)', 'Review employer disclosure policy', ''],
            ['California', 'Substance use disorder records', 'Stricter than 42 CFR Part 2 in some contexts', 'Confirm Part 2 compliance + state overlay', ''],
            ['New York', 'HIV/AIDS records', 'Written consent required for disclosure', 'Separate HIV authorization form', ''],
            ['Illinois', 'Mental health records', 'MHDDCA authorization required for all disclosures', 'Update MH release form', ''],
            ['Washington', 'Consumer health data', 'Affirmative authorization required (My Health MY Data)', 'Review data collection practices', ''],
            ['Colorado', 'Genetic information', 'Employer access prohibited; insurer access restricted', 'Update disclosure procedures', ''],
            ['Massachusetts', 'Records of minors (12+)', 'Minor consent controls disclosure to parents in some cases', 'Review minor patient policy', ''],
            ['Texas', 'EHR data to third parties', 'Patient authorization required for non-TPO disclosures', 'Review third-party data requests', ''],
            ['Virginia', 'Consumer health data', 'VCDPA consent requirements for health data processing', 'Assess VCDPA applicability', ''],
            ['New Jersey', 'HIV records', 'Strict confidentiality; written authorization required', 'HIV-specific authorization form', ''],
          ]}
        />
      </Section>

      <Section title="Mental health and substance use records - stricter state protections">
        <Table
          headers={['State', 'Governing Statute', 'Key Restriction Beyond HIPAA', 'Action Needed']}
          rows={[
            ['California', 'Welfare & Inst. Code §§ 5328-5330', 'LPS Act - MH records require specific authorization even for TPO in some contexts', 'Train staff on LPS exceptions'],
            ['Illinois', 'MHDDCA (740 ILCS 110)', 'Authorization required for disclosure to other treating providers without exception for TPO', 'Revise referral disclosure procedures'],
            ['New York', 'Mental Hygiene Law § 33.13', 'Psychiatric records: disclosure only with patient written consent or court order', 'Separate MH authorization form'],
            ['Texas', 'Health & Safety Code § 611', 'Communications to MH professional are confidential; limited treatment exception', 'Review referral and intake procedures'],
            ['Massachusetts', 'M.G.L. c. 123, § 36', 'Mental health records: patient consent required to release to insurer', 'Insurance billing procedures review'],
            ['Washington', 'RCW 71.05.390', 'MH records: disclosure to insurers requires patient authorization', 'Insurance request workflow update'],
            ['Florida', 'Fla. Stat. § 394.4615', 'Clinical records at MH facilities: authorization required for disclosure to outside providers', 'Interoperability requests policy'],
            ['Colorado', 'C.R.S. § 27-65-121', 'MH records: no disclosure without consent except listed exceptions', 'Update consent forms'],
            ['Virginia', 'Va. Code § 37.2-400', 'Records of MH and substance abuse services: strict confidentiality', 'BH-specific disclosure procedures'],
            ['New Jersey', 'N.J.S.A. 30:4-24.3', 'Mental health treatment records: written consent for each disclosure', 'Per-disclosure consent tracking'],
          ]}
        />
      </Section>

      <Section title="Genetic information restrictions by state">
        <Table
          headers={['State', 'Statute', 'Key Restriction', 'Applies To']}
          rows={[
            ['California', 'CMIA; Civ. Code § 56.18', 'Genetic data is sensitive PHI; heightened consent required', 'All covered entities holding genetic data'],
            ['Colorado', 'C.R.S. § 10-3-1104.7', 'Insurer access to genetic test results prohibited without consent', 'Insurer disclosures'],
            ['Florida', 'Fla. Stat. § 760.40', 'DNA analysis results: confidential; written consent required for disclosure', 'Genetic testing providers'],
            ['Illinois', '410 ILCS 513 (GIPA)', 'Genetic information: employer and insurer access prohibited', 'Employment, insurance disclosures'],
            ['New York', 'Civil Rights Law § 79-l', 'DNA information: disclosure requires authorization', 'All entities with genetic data'],
            ['New Jersey', 'N.J.S.A. 10:5-47', 'Genetic information nondiscrimination; insurer access prohibited', 'Insurer disclosures'],
            ['Texas', 'Tex. Ins. Code § 546.051', 'Insurer prohibited from conditioning coverage on genetic testing', 'Insurance-related disclosures'],
            ['Washington', 'RCW 19.375.020', 'Genetic privacy: informed written consent required for disclosure', 'All genetic data holders'],
            ['Massachusetts', 'M.G.L. c. 111 § 70G', 'Genetic information: disclosure prohibited without written consent', 'All covered entities'],
            ['Virginia', 'Va. Code § 38.2-508.4', 'Insurer access to genetic information prohibited', 'Insurer-related disclosures'],
          ]}
        />
      </Section>

      <Section title="State AG contacts and enforcement posture">
        <Table
          headers={['State', 'AG Health Privacy Unit', 'Notification Email / Portal', 'Enforcement Posture']}
          rows={[
            ['California', 'Privacy Enforcement & Protection Unit', 'privacy@doj.ca.gov', 'Aggressive - active enforcement; significant CMIA settlements'],
            ['Texas', 'Consumer Protection Division', 'cpd@oag.texas.gov', 'Active - requires notification for 250+ residents; pursues enforcement'],
            ['New York', 'Bureau of Internet & Technology', 'Internet.Bureau@ag.ny.gov', 'Aggressive - SHIELD Act enforcement active; large settlements'],
            ['Florida', 'Consumer Protection Division', 'healthprivacy@myfloridalegal.com', 'Moderate - growing enforcement activity post-2022'],
            ['Illinois', 'Consumer Fraud Bureau', 'agc@atg.state.il.us', 'Active - BIOMETRIC and health privacy enforcement'],
            ['Washington', 'Consumer Protection Division', 'ATGConsumerResource@atg.wa.gov', 'Aggressive - My Health MY Data Act enforcement pending'],
            ['Colorado', 'Consumer Protection Section', 'stop.fraud@coag.gov', 'Active - CPA enforcement; privacy rules expanding'],
            ['Massachusetts', 'Consumer Protection / OCABR', 'ago@state.ma.us', 'Active - requires notification to AG for all breaches'],
            ['Virginia', 'Consumer Protection Section', 'cpaemail@oag.state.va.us', 'Moderate - VCDPA enforcement building'],
            ['New Jersey', 'Division of Consumer Affairs', 'askconsumeraffairs@lps.state.nj.us', 'Moderate - active on large breaches'],
          ]}
        />
      </Section>

      <Section title="Review documentation">
        <Table
          headers={['Field', 'Entry']}
          rows={[
            ['Clinic name', ''],
            ['States that apply to this clinic', ''],
            ['Review completed by', ''],
            ['Review date', ''],
            ['Policies updated as a result', ''],
            ['Next scheduled review', ''],
            ['Reviewed by legal counsel?', ''],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks state-law compliance obligations alongside your HIPAA program so nothing falls through the
          gap between federal and state requirements. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
