import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(process.cwd(), '..', '..')
const marketingRoot = resolve(process.cwd())
const outputDir = join(marketingRoot, 'src', 'content', 'state-guides')
const cityGuideDir = join(marketingRoot, 'src', 'content', 'city-guides')
const urlManifestPath = join(root, 'state-guide-urls.txt')
const publishedDate = '2026-05-06'
const baseUrl = 'https://phiguard.app'

const federalSources = [
  {
    title: 'HIPAA Privacy Rule',
    url: 'https://www.hhs.gov/hipaa/for-professionals/privacy/laws-regulations/index.html',
    publisher: 'HHS Office for Civil Rights',
  },
  {
    title: 'HIPAA Security Rule',
    url: 'https://www.hhs.gov/hipaa/for-professionals/security/laws-regulations/index.html',
    publisher: 'HHS Office for Civil Rights',
  },
  {
    title: 'HIPAA Breach Notification Rule',
    url: 'https://www.hhs.gov/hipaa/for-professionals/breach-notification/index.html',
    publisher: 'HHS Office for Civil Rights',
  },
  {
    title: '45 CFR Part 164',
    url: 'https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164',
    publisher: 'Electronic Code of Federal Regulations',
  },
]

const states = [
  ['Alabama', 'AL', 'https://www.alabamapublichealth.gov/', 'Alabama Department of Public Health', 'https://www.alabamaag.gov/', 'Alabama Attorney General', ['rural referral networks', 'county health access', 'hospital-owned outpatient sites']],
  ['Alaska', 'AK', 'https://health.alaska.gov/', 'Alaska Department of Health', 'https://law.alaska.gov/', 'Alaska Department of Law', ['remote access', 'traveling staff', 'telehealth across long distances']],
  ['Arizona', 'AZ', 'https://www.azdhs.gov/', 'Arizona Department of Health Services', 'https://www.azag.gov/', 'Arizona Attorney General', ['fast-growing metro clinics', 'cross-border care coordination', 'behavioral health referrals']],
  ['Arkansas', 'AR', 'https://www.healthy.arkansas.gov/', 'Arkansas Department of Health', 'https://arkansasag.gov/', 'Arkansas Attorney General', ['regional hospital referrals', 'small-town clinic coverage', 'paper-to-digital transitions']],
  ['California', 'CA', 'https://www.cdph.ca.gov/', 'California Department of Public Health', 'https://oag.ca.gov/privacy', 'California Attorney General Privacy Enforcement', ['CMIA overlays', 'large medical groups', 'technology vendor review']],
  ['Colorado', 'CO', 'https://cdphe.colorado.gov/', 'Colorado Department of Public Health and Environment', 'https://coag.gov/', 'Colorado Attorney General', ['mountain-region telehealth', 'privacy act overlays', 'multi-site specialty care']],
  ['Connecticut', 'CT', 'https://portal.ct.gov/dph', 'Connecticut Department of Public Health', 'https://portal.ct.gov/ag', 'Connecticut Attorney General', ['dense referral markets', 'state privacy oversight', 'small practice consolidation']],
  ['Delaware', 'DE', 'https://dhss.delaware.gov/dhss/', 'Delaware Health and Social Services', 'https://attorneygeneral.delaware.gov/', 'Delaware Department of Justice', ['multi-state patient movement', 'compact clinic teams', 'vendor-heavy workflows']],
  ['Florida', 'FL', 'https://www.floridahealth.gov/', 'Florida Department of Health', 'https://www.myfloridalegal.com/', 'Florida Attorney General', ['large senior-care volumes', 'hurricane continuity planning', 'multi-location practices']],
  ['Georgia', 'GA', 'https://dph.georgia.gov/', 'Georgia Department of Public Health', 'https://law.georgia.gov/', 'Georgia Attorney General', ['Atlanta referral concentration', 'rural access points', 'specialty group expansion']],
  ['Hawaii', 'HI', 'https://health.hawaii.gov/', 'Hawaii State Department of Health', 'https://ag.hawaii.gov/', 'Hawaii Attorney General', ['island-to-island coordination', 'telehealth access', 'tourism-related urgent care']],
  ['Idaho', 'ID', 'https://healthandwelfare.idaho.gov/', 'Idaho Department of Health and Welfare', 'https://www.ag.idaho.gov/', 'Idaho Attorney General', ['regional referral travel', 'small staff coverage', 'rural broadband constraints']],
  ['Illinois', 'IL', 'https://dph.illinois.gov/', 'Illinois Department of Public Health', 'https://illinoisattorneygeneral.gov/', 'Illinois Attorney General', ['Chicago specialty referrals', 'large outpatient networks', 'academic medical center coordination']],
  ['Indiana', 'IN', 'https://www.in.gov/health/', 'Indiana Department of Health', 'https://www.in.gov/attorneygeneral/', 'Indiana Attorney General', ['hospital-affiliated clinics', 'manufacturing workforce health', 'multi-county referrals']],
  ['Iowa', 'IA', 'https://hhs.iowa.gov/', 'Iowa Health and Human Services', 'https://www.iowaattorneygeneral.gov/', 'Iowa Attorney General', ['rural referral lanes', 'critical access partners', 'small staff cross-training']],
  ['Kansas', 'KS', 'https://www.kdhe.ks.gov/', 'Kansas Department of Health and Environment', 'https://ag.ks.gov/', 'Kansas Attorney General', ['rural clinic coverage', 'regional hospitals', 'cross-border Missouri care']],
  ['Kentucky', 'KY', 'https://www.chfs.ky.gov/', 'Kentucky Cabinet for Health and Family Services', 'https://www.ag.ky.gov/', 'Kentucky Attorney General', ['behavioral health networks', 'Appalachian access points', 'regional specialty referrals']],
  ['Louisiana', 'LA', 'https://ldh.la.gov/', 'Louisiana Department of Health', 'https://www.ag.state.la.us/', 'Louisiana Attorney General', ['storm readiness', 'Medicaid-heavy workflows', 'multi-parish clinic coverage']],
  ['Maine', 'ME', 'https://www.maine.gov/dhhs/', 'Maine Department of Health and Human Services', 'https://www.maine.gov/ag/', 'Maine Attorney General', ['rural coastal access', 'small practice staffing', 'seasonal patient movement']],
  ['Maryland', 'MD', 'https://health.maryland.gov/', 'Maryland Department of Health', 'https://www.marylandattorneygeneral.gov/', 'Maryland Attorney General', ['DC-area referrals', 'state privacy overlays', 'hospital system coordination']],
  ['Massachusetts', 'MA', 'https://www.mass.gov/orgs/department-of-public-health', 'Massachusetts Department of Public Health', 'https://www.mass.gov/orgs/office-of-the-attorney-general', 'Massachusetts Attorney General', ['academic medical referrals', 'data security rules', 'dense specialty networks']],
  ['Michigan', 'MI', 'https://www.michigan.gov/mdhhs', 'Michigan Department of Health and Human Services', 'https://www.michigan.gov/ag', 'Michigan Attorney General', ['large health systems', 'behavioral health access', 'multi-site specialty groups']],
  ['Minnesota', 'MN', 'https://www.health.state.mn.us/', 'Minnesota Department of Health', 'https://www.ag.state.mn.us/', 'Minnesota Attorney General', ['health records act overlays', 'regional care systems', 'cold-weather continuity planning']],
  ['Mississippi', 'MS', 'https://msdh.ms.gov/', 'Mississippi State Department of Health', 'https://www.ago.state.ms.us/', 'Mississippi Attorney General', ['rural access', 'small workforce coverage', 'regional referral transfers']],
  ['Missouri', 'MO', 'https://health.mo.gov/', 'Missouri Department of Health and Senior Services', 'https://ago.mo.gov/', 'Missouri Attorney General', ['St. Louis and Kansas City referrals', 'rural networks', 'multi-state border care']],
  ['Montana', 'MT', 'https://dphhs.mt.gov/', 'Montana Department of Public Health and Human Services', 'https://dojmt.gov/', 'Montana Department of Justice', ['frontier medicine', 'long-distance referrals', 'small staff backup coverage']],
  ['Nebraska', 'NE', 'https://dhhs.ne.gov/', 'Nebraska Department of Health and Human Services', 'https://ago.nebraska.gov/', 'Nebraska Attorney General', ['regional specialty travel', 'rural clinic staffing', 'hospital-affiliated practices']],
  ['Nevada', 'NV', 'https://dpbh.nv.gov/', 'Nevada Division of Public and Behavioral Health', 'https://ag.nv.gov/', 'Nevada Attorney General', ['Las Vegas clinic growth', 'tourism urgent care', 'rural frontier coverage']],
  ['New Hampshire', 'NH', 'https://www.dhhs.nh.gov/', 'New Hampshire Department of Health and Human Services', 'https://www.doj.nh.gov/', 'New Hampshire Department of Justice', ['small practice networks', 'cross-border New England referrals', 'seasonal patient access']],
  ['New Jersey', 'NJ', 'https://www.nj.gov/health/', 'New Jersey Department of Health', 'https://www.njoag.gov/', 'New Jersey Attorney General', ['dense specialty referrals', 'New York and Philadelphia market overlap', 'privacy-sensitive records requests']],
  ['New Mexico', 'NM', 'https://www.nmhealth.org/', 'New Mexico Department of Health', 'https://www.nmag.gov/', 'New Mexico Attorney General', ['rural and tribal-area coordination', 'telehealth access', 'regional referral travel']],
  ['New York', 'NY', 'https://www.health.ny.gov/', 'New York State Department of Health', 'https://ag.ny.gov/', 'New York Attorney General', ['SHIELD Act overlays', 'large provider networks', 'high-volume records requests']],
  ['North Carolina', 'NC', 'https://www.dph.ncdhhs.gov/', 'North Carolina Division of Public Health', 'https://ncdoj.gov/', 'North Carolina Attorney General', ['rapid metro growth', 'academic referrals', 'rural outreach clinics']],
  ['North Dakota', 'ND', 'https://www.hhs.nd.gov/', 'North Dakota Health and Human Services', 'https://attorneygeneral.nd.gov/', 'North Dakota Attorney General', ['frontier care delivery', 'small workforce redundancy', 'long-distance specialty referrals']],
  ['Ohio', 'OH', 'https://odh.ohio.gov/', 'Ohio Department of Health', 'https://www.ohioattorneygeneral.gov/', 'Ohio Attorney General', ['large health systems', 'multi-county specialty networks', 'behavioral health coordination']],
  ['Oklahoma', 'OK', 'https://oklahoma.gov/health.html', 'Oklahoma State Department of Health', 'https://www.oag.ok.gov/', 'Oklahoma Attorney General', ['rural hospital referrals', 'tribal-area coordination', 'storm continuity planning']],
  ['Oregon', 'OR', 'https://www.oregon.gov/oha/ph/Pages/index.aspx', 'Oregon Health Authority', 'https://www.doj.state.or.us/', 'Oregon Department of Justice', ['Portland specialty networks', 'behavioral health workflows', 'rural coastal access']],
  ['Pennsylvania', 'PA', 'https://www.health.pa.gov/', 'Pennsylvania Department of Health', 'https://www.attorneygeneral.gov/', 'Pennsylvania Attorney General', ['Philadelphia and Pittsburgh referrals', 'large outpatient groups', 'older records systems']],
  ['Rhode Island', 'RI', 'https://health.ri.gov/', 'Rhode Island Department of Health', 'https://riag.ri.gov/', 'Rhode Island Attorney General', ['compact referral networks', 'New England patient movement', 'small practice teams']],
  ['South Carolina', 'SC', 'https://dph.sc.gov/', 'South Carolina Department of Public Health', 'https://www.scag.gov/', 'South Carolina Attorney General', ['coastal storm readiness', 'rural access', 'rapid population growth']],
  ['South Dakota', 'SD', 'https://doh.sd.gov/', 'South Dakota Department of Health', 'https://atg.sd.gov/', 'South Dakota Attorney General', ['frontier care delivery', 'small clinic staffing', 'regional specialty travel']],
  ['Tennessee', 'TN', 'https://www.tn.gov/health.html', 'Tennessee Department of Health', 'https://www.tn.gov/attorneygeneral.html', 'Tennessee Attorney General', ['Nashville healthcare operations', 'behavioral health referrals', 'multi-site clinic growth']],
  ['Texas', 'TX', 'https://www.dshs.texas.gov/', 'Texas Department of State Health Services', 'https://www.texasattorneygeneral.gov/', 'Texas Attorney General', ['HB 300 overlays', 'large multi-location groups', 'rapid metro expansion']],
  ['Utah', 'UT', 'https://dhhs.utah.gov/', 'Utah Department of Health and Human Services', 'https://attorneygeneral.utah.gov/', 'Utah Attorney General', ['fast-growing clinics', 'intermountain referral networks', 'telehealth-heavy operations']],
  ['Vermont', 'VT', 'https://www.healthvermont.gov/', 'Vermont Department of Health', 'https://ago.vermont.gov/', 'Vermont Attorney General', ['small practice networks', 'rural access', 'cross-border New England care']],
  ['Virginia', 'VA', 'https://www.vdh.virginia.gov/', 'Virginia Department of Health', 'https://www.oag.state.va.us/', 'Virginia Attorney General', ['Northern Virginia referrals', 'privacy act overlays', 'multi-site specialty care']],
  ['Washington', 'WA', 'https://doh.wa.gov/', 'Washington State Department of Health', 'https://www.atg.wa.gov/', 'Washington Attorney General', ['My Health My Data overlays', 'technology vendor review', 'large metro specialty networks']],
  ['West Virginia', 'WV', 'https://dhhr.wv.gov/', 'West Virginia Department of Health', 'https://ago.wv.gov/', 'West Virginia Attorney General', ['rural access', 'Appalachian referral routes', 'small staff coverage']],
  ['Wisconsin', 'WI', 'https://www.dhs.wisconsin.gov/', 'Wisconsin Department of Health Services', 'https://www.doj.state.wi.us/', 'Wisconsin Department of Justice', ['regional health systems', 'rural clinic access', 'cold-weather continuity planning']],
  ['Wyoming', 'WY', 'https://health.wyo.gov/', 'Wyoming Department of Health', 'https://ag.wyo.gov/', 'Wyoming Attorney General', ['frontier care delivery', 'long-distance referrals', 'small workforce backup plans']],
]

const slugify = (value) =>
  value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const cityGuides = readdirSync(cityGuideDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => {
    const data = JSON.parse(readFileSync(join(cityGuideDir, file), 'utf8'))
    return { slug: file.replace(/\.json$/, ''), ...data }
  })

const citiesByState = new Map()
for (const city of cityGuides) {
  const entries = citiesByState.get(city.state) ?? []
  entries.push(city)
  citiesByState.set(city.state, entries)
}

function stateSource(state) {
  return {
    title: state.healthTitle,
    url: state.healthUrl,
    publisher: state.healthTitle,
  }
}

function agSource(state) {
  return {
    title: state.agTitle,
    url: state.agUrl,
    publisher: state.agTitle,
  }
}

function internalLinks(state, family, relatedCities) {
  const slug = state.slug
  const base = [
    { href: '/pricing', label: 'PHIGuard pricing', description: 'Review current plan and BAA details.' },
    { href: '/hipaa', label: 'HIPAA overview', description: 'Product capabilities for HIPAA operations.' },
    { href: '/security', label: 'Security', description: 'Security posture for clinics evaluating PHI workflows.' },
    { href: '/baa', label: 'Business Associate Agreement', description: 'Review BAA availability before PHI use.' },
  ]

  if (family === 'compliance-software') {
    base.push(
      { href: '/resources/hipaa-compliance-self-assessment', label: 'HIPAA compliance self-assessment' },
      { href: '/learn/vendor-management/hipaa-compliance-software-pricing', label: 'HIPAA compliance software pricing guide' },
      { href: `/locations/hipaa-breach-notification/${slug}`, label: `${state.name} breach notification guide` },
    )
  } else {
    base.push(
      { href: '/resources/hipaa-breach-decision-tree', label: 'HIPAA breach decision tree' },
      { href: '/learn/incident-response/hipaa-breach-notification-timelines', label: 'HIPAA breach notification timelines' },
      { href: `/locations/hipaa-compliance-software/${slug}`, label: `${state.name} compliance software guide` },
    )
  }

  for (const city of relatedCities.slice(0, 3)) {
    base.push({ href: `/locations/hipaa-compliance/${city.slug}`, label: `${city.city}, ${city.stateAbbreviation} HIPAA guide` })
  }

  return base
}

function cityPhrase(relatedCities) {
  const cityNames = relatedCities.slice(0, 3).map((city) => city.city)
  if (cityNames.length === 0) {
    return 'regional referral markets'
  }

  if (cityNames.length === 1) {
    return `${cityNames[0]} and nearby referral markets`
  }

  return `${cityNames.slice(0, -1).join(', ')}, and ${cityNames.at(-1)}`
}

function stateOperatingProfile(state, relatedCities, family) {
  const [firstFocus, secondFocus, thirdFocus] = state.focus
  const cities = cityPhrase(relatedCities)

  if (family === 'compliance-software') {
    return `For ${state.name}, the buying question is less about whether a checklist exists and more about whether the clinic can prove how PHI moves through ${firstFocus}, ${secondFocus}, and ${thirdFocus}. Teams serving ${cities} should expect different staff roles, referral partners, device patterns, and vendor access paths to show up in the same evidence program. That means the software should connect a policy requirement to the actual system, owner, due date, signed agreement, export, or review record behind it.`
  }

  return `For ${state.name}, the incident file should reflect the operating reality behind ${firstFocus}, ${secondFocus}, and ${thirdFocus}. A clinic serving ${cities} may need facts from front-desk intake, clinical staff, billing, outside vendors, referral partners, and temporary access paths before it can decide whether unsecured PHI was involved. The response should preserve enough detail to support the HIPAA assessment and any state-specific follow-up without turning early assumptions into final conclusions.`
}

function stateTexture(state, family) {
  const textures = {
    Florida: {
      software:
        'Florida evaluations should explicitly account for storm operations, senior-care intake volumes, snowbird patient movement, and continuity plans that may shift work between coastal offices, call centers, mobile staff, and billing vendors during disruptions.',
      breach:
        'Florida incident response should preserve continuity facts separately from breach facts when storms, temporary locations, senior-care handoffs, or high-volume appointment rescheduling affected access to records, messages, devices, or vendor systems.',
    },
    Georgia: {
      software:
        'Georgia software review should distinguish Atlanta referral concentration from rural access points, because the same specialty group may rely on different referral portals, transportation coordination, front-desk staffing, and outside billing support across locations.',
      breach:
        'Georgia breach files should separate metropolitan referral facts from rural outreach facts so the practice can show which portal, outside specialist, mobile team, or billing workflow actually introduced the suspected PHI exposure.',
    },
    Illinois: {
      software:
        'Illinois teams should document how Chicago specialty referrals, academic medical center coordination, and large outpatient networks affect role-based access, records routing, referral attachments, and evidence ownership across departments.',
      breach:
        'Illinois incident review should preserve academic referral messages, outpatient network handoffs, department-level access changes, and Chicago-area specialty routing facts before the team decides which patients or regulators may need notice.',
    },
    Michigan: {
      software:
        'Michigan clinics should separate large health system interfaces from independent specialty group processes, especially when behavioral health access, referral scheduling, and shared documentation create different access and retention expectations.',
      breach:
        'Michigan response teams should identify whether the suspected exposure came from a health system interface, behavioral health coordination path, specialty referral handoff, or local practice tool before finalizing patient counts.',
    },
    Ohio: {
      software:
        'Ohio evaluations should account for multi-county specialty networks, behavioral health coordination, and hospital-affiliated clinic access patterns that can make user provisioning and vendor evidence differ by service line.',
      breach:
        'Ohio breach work should separate multi-county referral facts, behavioral health coordination records, and hospital-affiliated access logs so the incident owner can explain patient scope without relying on broad assumptions.',
    },
    Pennsylvania: {
      software:
        'Pennsylvania clinics should capture how Philadelphia and Pittsburgh referral patterns, older records systems, and large outpatient groups change document retention, patient-request routing, and legacy system access review.',
      breach:
        'Pennsylvania incident files should preserve legacy records-system facts, Philadelphia or Pittsburgh referral routing, and outpatient group handoffs before the clinic decides whether older records, scanned files, or portal exports were involved.',
    },
  }

  const texture = textures[state.name]
  if (!texture) {
    return `The local review should translate ${state.focus.join(', ')} into named workflows, evidence owners, vendor records, and review dates instead of relying on a generic statewide checklist.`
  }

  return texture[family === 'compliance-software' ? 'software' : 'breach']
}

function softwareGuide(state, relatedCities) {
  const [firstFocus, secondFocus, thirdFocus] = state.focus
  const cities = cityPhrase(relatedCities)
  const operatingProfile = stateOperatingProfile(state, relatedCities, 'compliance-software')
  const texture = stateTexture(state, 'compliance-software')
  return {
    title: `HIPAA compliance software for ${state.name} clinics`,
    seoTitle: `HIPAA Software for ${state.name} Clinics`,
    description: `${state.name} clinics should evaluate HIPAA compliance software by checking BAA coverage, audit trails, workforce tasks, incident tracking, and official state agency starting points.`,
    metaDescription: `HIPAA compliance software guide for ${state.name} clinics: BAA, audit trails, workforce tasks, vendor evidence, and state checkpoints.`,
    summary: `${state.name} clinics should use HIPAA compliance software to document recurring controls, not to replace HIPAA judgment. Start with federal Privacy, Security, and Breach Notification duties, then use ${state.healthTitle} and ${state.agTitle} as official starting points for state-specific follow-up before changing PHI workflows.`,
    slug: state.slug,
    state: state.name,
    stateAbbreviation: state.abbreviation,
    pageFamily: 'compliance-software',
    primaryKeyword: `HIPAA compliance software ${state.name} clinics`,
    intent: 'decision',
    directAnswer: `HIPAA compliance software for ${state.name} clinics should help the practice track risk analysis work, BAAs, workforce training, vendor evidence, incidents, policy reviews, access reviews, and records-request follow-through in one defensible evidence trail. The software does not make a clinic compliant by itself, so ${state.name} teams still need current federal HIPAA controls, documented local workflows, and state-specific verification before PHI workflows change. A useful platform should make it clear which requirement is being managed, who owns it, when evidence was last reviewed, and what changed after a vendor, staffing, telehealth, or patient-communication update.`,
    stateContext: `${state.name} clinic teams often deal with ${firstFocus}, ${secondFocus}, and ${thirdFocus}, especially around ${cities}. Those realities make software evaluation practical: the system needs to show who owns each HIPAA task, which vendors touch PHI, when evidence was reviewed, and whether incident, records-release, intake, billing, referral, or messaging workflows changed after the last review. ${operatingProfile} ${texture}`,
    operationalGuidance: [
      `Map the ${state.name} workflows that create, receive, maintain, or transmit PHI before comparing software features, including intake, referrals, records requests, billing follow-up, secure messaging, shared drives, and vendor access used around ${cities}.`,
      `Require BAA support and vendor evidence tracking before staff use any tool for patient-specific work in ${state.name}; the record should show agreement status, renewal or review dates, contact owners, and the PHI workflow each vendor supports.`,
      `Treat ${state.healthTitle} and ${state.agTitle} as agency starting points when state privacy, licensing, records-release, consumer notice, or health department questions affect a workflow, and document the date and source used for each verification step.`,
      `Prioritize audit trails, assigned owners, due dates, role-based access evidence, exception review, and exportable documentation over generic checklist storage that cannot connect a requirement to a real ${state.name} operating process.`,
      `Document how the software supports ${firstFocus} so the risk analysis reflects actual clinic operations, including who performs the work, which systems are involved, and what backup process applies when staff, vendors, or locations change.`,
      `Use the platform to schedule recurring review of ${secondFocus} and ${thirdFocus}, because stale evidence is a common weakness when practices grow, consolidate tools, add referral partners, or move patient communication into new channels. ${texture}`,
    ],
    stateSpecificNotes: [
      `${firstFocus} should show up in the ${state.name} risk analysis as a named workflow with systems, vendors, owners, evidence locations, staff roles, and review dates rather than a generic note buried in a policy binder.`,
      `${secondFocus} can create access-control drift, so software should make exceptions, temporary access, emergency access, and role changes easy to review before they become permanent habits.`,
      `${thirdFocus} should have a documented fallback path for downtime, staff turnover, patient-record requests, vendor outage, and incident escalation so the clinic can keep PHI decisions traceable.`,
      `For ${state.name}, the cited state agencies are starting points for current official materials, not a substitute for statute-by-statute legal research or counsel review when a workflow has legal ambiguity.`,
      `Clinics that operate across ${cities} should keep location-specific evidence visible, because staffing patterns, referral partners, and communication tools can differ even when the same policy applies statewide.`,
    ],
    keyTakeaways: [
      `${state.name} clinics still start with federal HIPAA Privacy, Security, and Breach Notification requirements.`,
      `A signed BAA and a PHI workflow map should come before any software rollout involving patient information.`,
      `${state.healthTitle} and ${state.agTitle} are useful state verification points before major workflow changes.`,
      `The best fit is software that records evidence, owners, dates, vendors, and incident follow-through.`,
    ],
    practicalChecklist: [
      `Name the ${state.name} clinic owner for privacy, security, vendor, records-release, access-review, and incident tasks so responsibility is visible before a deadline or audit request arrives.`,
      `Inventory EHRs, intake forms, shared drives, messaging tools, spreadsheets, billing systems, referral portals, telehealth tools, and outside vendors that touch PHI for teams serving ${cities}.`,
      'Confirm BAA availability and signed agreements before PHI use, then attach or reference the agreement, review date, business owner, vendor contact, and covered workflow.',
      'Check role-based access, audit history, exports, retention settings, user provisioning, emergency access, and termination workflows before allowing routine patient-specific work.',
      'Build recurring tasks for risk analysis, workforce training, vendor review, policy review, access review, incident tabletop exercises, and evidence refresh after workflow changes.',
      `Add a ${state.name} state verification step before changing patient communication, records-release, vendor, telehealth, billing, or incident workflows, and capture whether ${state.healthTitle} or ${state.agTitle} was checked.`,
      'Test how the clinic would preserve evidence during a suspected breach or OCR inquiry, including logs, messages, vendor tickets, patient lists, decision notes, and remediation tasks.',
      `Review whether ${firstFocus}, ${secondFocus}, or ${thirdFocus} creates a location-specific risk that needs a separate owner, evidence item, or recurring review cadence.`,
    ],
    sources: [federalSources[0], federalSources[1], federalSources[2], federalSources[3], stateSource(state), agSource(state)],
    faq: [
      {
        q: `What should ${state.name} clinics look for in HIPAA compliance software?`,
        a: `Look for BAA support, vendor tracking, assigned compliance tasks, audit history, access-review evidence, incident documentation, workforce training records, policy review dates, and exports that can support an OCR inquiry or internal review. The tool should also map requirements to real ${state.name} workflows such as intake, referrals, messaging, records requests, billing, and vendor access rather than storing a generic checklist.`,
      },
      {
        q: `Does HIPAA compliance software replace legal review in ${state.name}?`,
        a: `No. Software can organize evidence and workflows, but ${state.name} clinics should verify current federal requirements and use state agency materials as research starting points when legal interpretation is needed. Counsel or the responsible compliance lead should review state-specific questions before the clinic changes notices, records-release workflows, breach decisions, or patient communication practices.`,
      },
      {
        q: `Can PHIGuard support clinics in ${state.name}?`,
        a: `PHIGuard serves US clinics through its web application and helps organize HIPAA tasks, vendor evidence, policy work, access reviews, and incident follow-through. {{PHIGUARD_PRICING_DETAILS}} This page is educational and does not claim a local office or legal service in ${state.name}.`,
      },
      {
        q: `Which ${state.name} workflows should be reviewed first?`,
        a: `Start with PHI-heavy workflows: patient intake, referrals, records requests, billing follow-up, secure messaging, vendor access, telehealth, shared drives, and incident escalation. For ${state.name}, also check whether ${firstFocus}, ${secondFocus}, or ${thirdFocus} changes who needs access, which vendors are involved, or how quickly evidence must be preserved.`,
      },
    ],
    internalLinks: internalLinks(state, 'compliance-software', relatedCities),
    relatedStateSlug: state.slug,
    relatedCitySlugs: relatedCities.slice(0, 4).map((city) => city.slug),
    author: 'angel-campa',
    reviewer: 'phiguard-compliance-research',
    publishedAt: publishedDate,
    updatedAt: publishedDate,
    verificationDate: publishedDate,
  }
}

function breachGuide(state, relatedCities) {
  const [firstFocus, secondFocus, thirdFocus] = state.focus
  const cities = cityPhrase(relatedCities)
  const operatingProfile = stateOperatingProfile(state, relatedCities, 'breach-notification')
  const texture = stateTexture(state, 'breach-notification')
  return {
    title: `${state.name} HIPAA breach notification guide for clinics`,
    seoTitle: `${state.name} HIPAA Breach Notification`,
    description: `${state.name} clinics handling a suspected HIPAA breach should preserve evidence, assess federal HIPAA duties, check official state agency starting points, and document every decision.`,
    metaDescription: `${state.name} HIPAA breach notification guide: OCR timelines, state checkpoints, incident checklist, sources, and clinic workflow steps.`,
    summary: `${state.name} clinics should treat breach notification as a documented incident workflow. Preserve facts first, run the HIPAA four-factor breach assessment, check federal timing rules, and use ${state.agTitle} or ${state.healthTitle} as official starting points for state-specific research before sending notices.`,
    slug: state.slug,
    state: state.name,
    stateAbbreviation: state.abbreviation,
    pageFamily: 'breach-notification',
    primaryKeyword: `${state.name} HIPAA breach notification`,
    intent: 'operational-research',
    directAnswer: `${state.name} HIPAA breach notification work starts with the federal HIPAA Breach Notification Rule: identify what happened, preserve evidence, assess whether unsecured PHI was breached, and notify affected people and regulators when required. ${state.name} clinics should also check official state agency materials and counsel guidance before external notices go out. A strong response file should show the discovery date, incident owner, affected systems, PHI categories, patient population, vendor involvement, containment steps, four-factor analysis, notice decisions, and remediation work, including why notice was or was not required.`,
    stateContext: `${state.name} incidents can involve ${firstFocus}, ${secondFocus}, and ${thirdFocus}, especially for clinics serving ${cities}. The clinic should avoid rushing to send notices before it knows what PHI was involved, which systems or vendors were touched, whether the information was secured, and which state or federal reporting paths apply. ${operatingProfile} ${texture}`,
    operationalGuidance: [
      `Open an incident record immediately and preserve logs, screenshots, vendor messages, device facts, patient communication records, staff statements, timestamps, and system ownership details for the ${state.name} clinic.`,
      'Use the HIPAA four-factor assessment to decide whether an impermissible use or disclosure is a reportable breach, and document the nature of PHI, unauthorized recipient, whether the PHI was acquired or viewed, and mitigation facts.',
      `Use ${state.agTitle} and ${state.healthTitle} as official agency starting points before sending patient, media, regulator, or consumer notices, and record the date each source was checked.`,
      `Coordinate with vendors and business associates quickly if ${firstFocus} or another outside workflow may have exposed PHI, but keep clinic-owned decision notes separate from unsupported vendor assumptions.`,
      'Keep notice drafting, approval, mailing, electronic delivery, regulator submission evidence, patient lists, translation needs, and call-center or front-desk scripts together in one incident file.',
      `After containment, review whether ${secondFocus} or ${thirdFocus} requires access changes, retraining, vendor remediation, policy updates, or additional monitoring for teams operating around ${cities}. ${texture}`,
    ],
    stateSpecificNotes: [
      `${firstFocus} changes the fact-gathering plan: identify the systems, people, vendors, patient groups, locations, and handoff points involved before deciding whether notice is required.`,
      `${secondFocus} should be tested against access logs, vendor messages, staff notes, patient communication records, device facts, and any temporary access granted during the relevant period.`,
      `${thirdFocus} belongs in remediation, because breach response should end with access, training, vendor, and workflow changes the clinic can prove later with dates and owners.`,
      `For ${state.name}, the cited state agencies are starting points for current official materials, not a claim that this page exhausts state breach law or replaces counsel review.`,
      `Clinics serving ${cities} should keep location and department facts clear because patient lists, front-desk scripts, referral partners, and vendor contacts can differ across the same incident.`,
    ],
    keyTakeaways: [
      'The HIPAA Breach Notification Rule is the federal baseline for unsecured PHI breaches.',
      `${state.name} clinics should check official state agency materials before assuming federal HIPAA is the only notice path.`,
      'Evidence preservation matters before root-cause theories harden.',
      'Breach decisions should be documented even when the clinic concludes notice is not required.',
    ],
    practicalChecklist: [
      'Open an incident record with date, discoverer, affected systems, suspected PHI, assigned owner, discovery timeline, containment owner, and evidence location.',
      'Contain the issue without deleting logs, messages, files, tickets, screenshots, patient communications, device facts, or vendor evidence needed for the assessment.',
      `Identify whether PHI was unsecured and which patients, records, locations, referral partners, or vendors may be affected for clinics serving ${cities}.`,
      'Run the HIPAA four-factor breach risk assessment and document the conclusion, including uncertainty, mitigation, unauthorized recipient facts, and who approved the decision.',
      `Check current ${state.name} state agency resources and counsel guidance before finalizing notices, and capture whether ${state.agTitle} or ${state.healthTitle} was used during review.`,
      'Prepare patient, OCR, media, vendor, and state-related notice drafts only for paths that apply, with separate approval records for content, mailing list, delivery method, and timing.',
      'Track deadlines, approvals, mailing or electronic delivery evidence, returned mail, patient questions, regulator submissions, vendor commitments, and post-incident remediation.',
      `Update training, access controls, vendor records, policies, and workflow documentation after the incident closes, especially where ${firstFocus}, ${secondFocus}, or ${thirdFocus} contributed to the event.`,
    ],
    sources: [federalSources[2], federalSources[3], federalSources[0], federalSources[1], stateSource(state), agSource(state)],
    faq: [
      {
        q: `When does a ${state.name} clinic need HIPAA breach notification?`,
        a: `Notification may be required when unsecured PHI is breached under the HIPAA Breach Notification Rule. The clinic should document the facts, run the required assessment, identify the PHI and patients involved, preserve evidence, and check state agency starting points and counsel guidance before deciding. The decision file should explain the conclusion even when the clinic determines notice is not required.`,
      },
      {
        q: `Does ${state.name} have separate breach notification duties?`,
        a: `${state.name} may have state privacy, consumer protection, health, or licensing materials that affect notice decisions. Use ${state.agTitle} and ${state.healthTitle} as verification points, record the date checked, and involve counsel for legal interpretation. This page is a research aid, not a complete state-law notice analysis.`,
      },
      {
        q: `What should ${state.name} clinics do first after a suspected breach?`,
        a: `Preserve evidence, contain the issue, assign an incident owner, identify the systems and PHI involved, and start a documented breach assessment before sending external notices. For ${state.name}, the first file should include logs, screenshots, vendor messages, staff statements, patient communication facts, discovery timing, and the reason each immediate containment step was taken.`,
      },
      {
        q: 'Can PHIGuard send breach notices for a clinic?',
        a: `PHIGuard helps organize incident evidence, owners, tasks, vendor follow-up, deadline tracking, and remediation documentation for clinics operating in ${state.name}. Notice content and legal determinations should be reviewed by qualified counsel or the responsible clinic team before patient, OCR, media, vendor, or state-related notices are sent.`,
      },
    ],
    internalLinks: internalLinks(state, 'breach-notification', relatedCities),
    relatedStateSlug: state.slug,
    relatedCitySlugs: relatedCities.slice(0, 4).map((city) => city.slug),
    author: 'angel-campa',
    reviewer: 'phiguard-compliance-research',
    publishedAt: publishedDate,
    updatedAt: publishedDate,
    verificationDate: publishedDate,
  }
}

const stateRecords = states.map(([name, abbreviation, healthUrl, healthTitle, agUrl, agTitle, focus]) => ({
  name,
  abbreviation,
  healthUrl,
  healthTitle,
  agUrl,
  agTitle,
  focus,
  slug: slugify(name),
}))

rmSync(outputDir, { recursive: true, force: true })
mkdirSync(outputDir, { recursive: true })

const urls = []
for (const state of stateRecords) {
  const relatedCities = (citiesByState.get(state.name) ?? []).sort((a, b) => a.city.localeCompare(b.city))
  const software = softwareGuide(state, relatedCities)
  const breach = breachGuide(state, relatedCities)

  writeFileSync(join(outputDir, `${state.slug}-software.json`), `${JSON.stringify(software, null, 2)}\n`)
  writeFileSync(join(outputDir, `${state.slug}-breach.json`), `${JSON.stringify(breach, null, 2)}\n`)
  urls.push(`${baseUrl}/locations/hipaa-compliance-software/${state.slug}`)
  urls.push(`${baseUrl}/locations/hipaa-breach-notification/${state.slug}`)
}

writeFileSync(urlManifestPath, `${urls.sort().join('\n')}\n`)
console.log(`Generated ${stateRecords.length * 2} state guides and ${urls.length} URLs.`)
