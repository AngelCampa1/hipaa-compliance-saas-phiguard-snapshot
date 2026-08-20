import { Bullets, Callout, P, PdfLayout, Section, Table } from '../layout/PdfLayout.js'

export default function MultiLocationComplianceRolloutPlanDocument() {
  return (
    <PdfLayout
      title="Multi-Location HIPAA Compliance Rollout Plan"
      subtitle="A 12-week rollout plan with site assessment matrix, shared vs. site-specific task framework, local owner designations, and an evidence rollup structure."
    >
      <Section title="Before you start">
        <Bullets
          items={[
            'Identify a Local Compliance Owner at each site - this person owns task follow-through at their location',
            'Identify shared elements that will be standardized across all sites (policies, training content, incident log format)',
            'Identify site-specific elements that each location must complete independently (risk analysis, access reviews, vendor BAAs for location-specific vendors)',
            'Set up the evidence rollup structure before starting - you want to collect site evidence into a coherent program record',
          ]}
        />
      </Section>

      <Section title="Site assessment matrix">
        <P>
          Rate each site on 9 dimensions using 0 (not in place), 1 (partial), or 2 (complete).
        </P>
        <Table
          headers={['Dimension', 'Site 1', 'Site 2', 'Site 3', 'Notes']}
          rows={[
            ['Privacy Officer designated', '', '', '', ''],
            ['Policies in place and dated', '', '', '', ''],
            ['NPP in use at intake', '', '', '', ''],
            ['Staff trained (with records)', '', '', '', ''],
            ['Risk analysis completed (within 12 months)', '', '', '', ''],
            ['All vendor BAAs executed', '', '', '', ''],
            ['Incident log in place', '', '', '', ''],
            ['Access review completed (within 6 months)', '', '', '', ''],
            ['Physical security assessed', '', '', '', ''],
            ['SITE TOTAL (0-18)', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Local Compliance Owner designation">
        <Table
          headers={['Site', 'Local Compliance Owner', 'Title', 'Contact', 'Start date']}
          rows={[
            ['Site 1:', '', '', '', ''],
            ['Site 2:', '', '', '', ''],
            ['Site 3:', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="12-week rollout milestones">
        <Table
          headers={['Weeks', 'Milestone', 'Shared or Site-Specific', 'Evidence']}
          rows={[
            ['Weeks 1-2', 'Site assessment completed; gaps scored; priorities set', 'Both', 'Completed site assessment matrix'],
            ['Weeks 3-4', 'Policies distributed to all sites; site-specific adaptations drafted', 'Shared → Site-Specific', 'Distributed policies with site signatures'],
            ['Weeks 5-6', 'All-staff HIPAA training delivered at each site', 'Site-Specific', 'Training logs per site'],
            ['Weeks 7-8', 'Access reviews completed at each site', 'Site-Specific', 'Signed access review per site'],
            ['Weeks 7-8', 'Vendor BAA gap review - all sites audit their vendors', 'Site-Specific', 'BAA inventory per site'],
            ['Weeks 9-10', 'Physical security walkthrough and device inventory at each site', 'Site-Specific', 'Walkthrough notes per site'],
            ['Weeks 11-12', 'Risk analysis completed or updated at each site', 'Site-Specific', 'Risk analysis per site'],
            ['Weeks 11-12', 'Program rollup - evidence collected into central record', 'Shared', 'Program evidence binder'],
          ]}
        />
      </Section>

      <Section title="Shared vs. site-specific evidence framework">
        <Table
          headers={['Element', 'Shared (one document for all sites)', 'Site-Specific (one per location)']}
          rows={[
            ['Privacy policy', 'Yes - one policy covers all locations', 'No'],
            ['Security policy', 'Yes', 'No'],
            ['Training content', 'Yes - same curriculum', 'No - training logs are per site'],
            ['Risk analysis', 'No', 'Yes - each site has different systems and physical environment'],
            ['Vendor BAAs', 'Partially - enterprise vendors may have one BAA covering all sites; local vendors need site-specific BAAs', 'Yes for local vendors'],
            ['Incident log', 'Shared format, but site-level entries', 'Yes - events are site-specific'],
            ['Access reviews', 'No', 'Yes - each site manages its own staff access'],
          ]}
        />
        <Callout label="One Privacy Officer, multiple sites">
          The Privacy Officer designation can cover all locations in a multi-site practice - one
          person is responsible for the compliance program across all sites. Local Compliance Owners
          are operational contacts, not separate Privacy Officers.
        </Callout>
      </Section>

      <Section title="Evidence rollup structure">
        <Bullets
          items={[
            'Central binder: shared policies, program-level risk analysis, enterprise BAAs, aggregate incident log',
            'Site 1 folder: site risk analysis, local vendor BAAs, training log, access review, incident entries',
            'Site 2 folder: same structure',
            'Site 3 folder: same structure',
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard supports multi-site programs with location-level task ownership, shared policy
          distribution, and evidence rollup into a single compliance record. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
