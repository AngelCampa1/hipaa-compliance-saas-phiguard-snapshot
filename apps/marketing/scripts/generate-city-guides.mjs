import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDir, '..')
const targetDir = path.join(projectRoot, 'src', 'content', 'city-guides')

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

const stateSources = {
  AL: [{ title: 'Alabama Board of Medical Examiners', url: 'https://www.albme.gov/', publisher: 'State of Alabama' }],
  AK: [{ title: 'Alaska State Medical Board', url: 'https://www.commerce.alaska.gov/web/cbpl/ProfessionalLicensing/StateMedicalBoard.aspx', publisher: 'State of Alaska' }],
  AZ: [{ title: 'Arizona Medical Board', url: 'https://www.azmd.gov/', publisher: 'State of Arizona' }],
  AR: [{ title: 'Arkansas State Medical Board', url: 'https://www.armedicalboard.org/', publisher: 'State of Arkansas' }],
  CA: [{ title: 'Medical Board of California', url: 'https://www.mbc.ca.gov/', publisher: 'State of California' }],
  CO: [{ title: 'Colorado Privacy Act', url: 'https://leg.colorado.gov/sites/default/files/2021a_190_signed.pdf', publisher: 'Colorado General Assembly' }],
  CT: [{ title: 'Connecticut Department of Public Health', url: 'https://portal.ct.gov/dph', publisher: 'State of Connecticut' }],
  DC: [{ title: 'DC Health', url: 'https://dchealth.dc.gov/', publisher: 'District of Columbia' }],
  DE: [{ title: 'Delaware Board of Medical Licensure and Discipline', url: 'https://dpr.delaware.gov/boards/medicalpractice/', publisher: 'State of Delaware' }],
  FL: [{ title: 'Florida Board of Medicine', url: 'https://flboardofmedicine.gov/', publisher: 'State of Florida' }],
  GA: [{ title: 'Georgia Composite Medical Board', url: 'https://medicalboard.georgia.gov/', publisher: 'State of Georgia' }],
  HI: [{ title: 'Hawaii Medical Board', url: 'https://cca.hawaii.gov/pvl/boards/medical/', publisher: 'State of Hawaii' }],
  ID: [{ title: 'Idaho Division of Occupational and Professional Licenses', url: 'https://dopl.idaho.gov/', publisher: 'State of Idaho' }],
  IL: [{ title: 'Illinois Department of Financial and Professional Regulation', url: 'https://idfpr.illinois.gov/', publisher: 'State of Illinois' }],
  IN: [{ title: 'Indiana Professional Licensing Agency', url: 'https://www.in.gov/pla/', publisher: 'State of Indiana' }],
  IA: [{ title: 'Iowa Board of Medicine', url: 'https://medicalboard.iowa.gov/', publisher: 'State of Iowa' }],
  KS: [{ title: 'Kansas medical records statute', url: 'https://www.ksrevisor.org/statutes/chapters/ch65/065_068_0019.html', publisher: 'Kansas Office of Revisor of Statutes' }],
  KY: [{ title: 'Kentucky Board of Medical Licensure', url: 'https://kbml.ky.gov/', publisher: 'Commonwealth of Kentucky' }],
  LA: [{ title: 'Louisiana State Board of Medical Examiners', url: 'https://www.lsbme.la.gov/', publisher: 'State of Louisiana' }],
  MA: [{ title: 'Massachusetts Board of Registration in Medicine', url: 'https://www.mass.gov/orgs/board-of-registration-in-medicine', publisher: 'Commonwealth of Massachusetts' }],
  MD: [{ title: 'Maryland Board of Physicians', url: 'https://www.mbp.state.md.us/', publisher: 'State of Maryland' }],
  MI: [{ title: 'Michigan Board of Medicine', url: 'https://www.michigan.gov/lara/bureau-list/bpl/health/hp-lic-health-prof/medicine', publisher: 'State of Michigan' }],
  MN: [{ title: 'Minnesota Board of Medical Practice', url: 'https://mn.gov/boards/medical-practice/', publisher: 'State of Minnesota' }],
  MO: [{ title: 'Missouri Revised Statutes Chapter 334', url: 'https://revisor.mo.gov/main/OneChapter.aspx?chapter=334', publisher: 'State of Missouri' }],
  MS: [{ title: 'Mississippi State Board of Medical Licensure', url: 'https://www.msbml.ms.gov/', publisher: 'State of Mississippi' }],
  MT: [{ title: 'Montana Board of Medical Examiners', url: 'https://boards.bsd.dli.mt.gov/medical-examiners/', publisher: 'State of Montana' }],
  NC: [{ title: 'North Carolina Medical Board', url: 'https://www.ncmedboard.org/', publisher: 'State of North Carolina' }],
  ND: [{ title: 'North Dakota Board of Medicine', url: 'https://www.ndbom.org/', publisher: 'State of North Dakota' }],
  NE: [{ title: 'Nebraska Board of Medicine and Surgery', url: 'https://dhhs.ne.gov/licensure/Pages/Medicine-and-Surgery.aspx', publisher: 'State of Nebraska' }],
  NV: [{ title: 'Nevada State Board of Medical Examiners', url: 'https://medboard.nv.gov/', publisher: 'State of Nevada' }],
  NH: [{ title: 'New Hampshire Board of Medicine', url: 'https://www.oplc.nh.gov/board-medicine', publisher: 'State of New Hampshire' }],
  NJ: [{ title: 'New Jersey State Board of Medical Examiners', url: 'https://www.njconsumeraffairs.gov/bme', publisher: 'State of New Jersey' }],
  NM: [{ title: 'New Mexico Medical Board', url: 'https://www.nmmb.state.nm.us/', publisher: 'State of New Mexico' }],
  NY: [{ title: 'New York data breach reporting', url: 'https://ag.ny.gov/resources/organizations/data-breach-reporting', publisher: 'New York Attorney General' }],
  OH: [{ title: 'Ohio eLicense', url: 'https://elicense.ohio.gov/', publisher: 'State of Ohio' }],
  OK: [{ title: 'Oklahoma State Department of Health', url: 'https://oklahoma.gov/health.html', publisher: 'State of Oklahoma' }],
  OR: [{ title: 'Oregon Medical Board', url: 'https://www.oregon.gov/omb/', publisher: 'State of Oregon' }],
  PA: [{ title: 'Pennsylvania State Board of Medicine', url: 'https://www.pa.gov/agencies/dos/department-and-offices/bpoa/boards-commissions/medicine.html', publisher: 'Commonwealth of Pennsylvania' }],
  RI: [{ title: 'Rhode Island Department of Health', url: 'https://health.ri.gov/', publisher: 'State of Rhode Island' }],
  SC: [{ title: 'South Carolina Board of Medical Examiners', url: 'https://llr.sc.gov/med/', publisher: 'State of South Carolina' }],
  SD: [{ title: 'South Dakota Board of Medical and Osteopathic Examiners', url: 'https://www.sdbmoe.gov/', publisher: 'State of South Dakota' }],
  TN: [{ title: 'Tennessee Board of Medical Examiners', url: 'https://www.tn.gov/health/health-program-areas/health-professional-boards/me-board.html', publisher: 'State of Tennessee' }],
  TX: [{ title: 'Texas Medical Board', url: 'https://www.tmb.state.tx.us/', publisher: 'State of Texas' }],
  UT: [{ title: 'Utah Physicians and Surgeons Licensing', url: 'https://dopl.utah.gov/physician-surgeon/', publisher: 'State of Utah' }],
  VA: [{ title: 'Virginia Board of Medicine', url: 'https://www.dhp.virginia.gov/Boards/Medicine/', publisher: 'Commonwealth of Virginia' }],
  VT: [{ title: 'Vermont Board of Medical Practice', url: 'https://www.healthvermont.gov/systems/medical-practice-board', publisher: 'State of Vermont' }],
  WA: [{ title: 'Washington Medical Commission', url: 'https://wmc.wa.gov/', publisher: 'State of Washington' }],
  WI: [{ title: 'Wisconsin Medical Examining Board', url: 'https://dsps.wi.gov/Pages/BoardsCouncils/MEB/Default.aspx', publisher: 'State of Wisconsin' }],
  WV: [{ title: 'West Virginia Board of Medicine', url: 'https://wvbom.wv.gov/', publisher: 'State of West Virginia' }],
  WY: [{ title: 'Wyoming Board of Medicine', url: 'https://wyomedboard.wyo.gov/', publisher: 'State of Wyoming' }],
}

const cities = [
  ['New York', 'New York', 'NY', 'large hospital referral networks, dense multispecialty practices, and frequent handoffs among billing, referral, and care-coordination teams'],
  ['Los Angeles', 'California', 'CA', 'multilingual patient access teams, ambulatory specialty groups, and high vendor count operations across a sprawling metro'],
  ['Chicago', 'Illinois', 'IL', 'large outpatient networks, neighborhood clinics, academic referrals, and workforce coverage across multiple sites'],
  ['Houston', 'Texas', 'TX', 'large health systems, independent specialty groups, and hurricane-ready continuity planning for clinic records and workflows'],
  ['Phoenix', 'Arizona', 'AZ', 'rapid practice growth, retiree care demand, telehealth follow-up, and cross-county patient intake'],
  ['Philadelphia', 'Pennsylvania', 'PA', 'academic medicine referrals, independent primary care offices, and payer-heavy administrative workflows'],
  ['San Antonio', 'Texas', 'TX', 'military families, bilingual intake, multisite primary care, and growing specialty clinics'],
  ['San Diego', 'California', 'CA', 'border-region referrals, biotech-adjacent specialty practices, and mobile workforce coordination'],
  ['Dallas', 'Texas', 'TX', 'multi-location physician groups, employer health relationships, and high-volume billing operations'],
  ['Jacksonville', 'Florida', 'FL', 'regional referral patterns, coastal continuity planning, and broad primary care coverage'],
  ['Austin', 'Texas', 'TX', 'fast-growing clinics, digital health adoption, and startup-heavy vendor ecosystems'],
  ['Fort Worth', 'Texas', 'TX', 'suburban expansion, occupational health workflows, and shared staff across clinic locations'],
  ['San Jose', 'California', 'CA', 'technology-forward clinics, specialty referrals, and strict vendor review expectations'],
  ['Columbus', 'Ohio', 'OH', 'large university and employer health activity, primary care growth, and centralized admin teams'],
  ['Charlotte', 'North Carolina', 'NC', 'regional specialty hubs, rapid metro growth, and multi-office practice administration'],
  ['Indianapolis', 'Indiana', 'IN', 'health-system adjacency, specialty referrals, and billing teams serving broad catchment areas'],
  ['San Francisco', 'California', 'CA', 'high vendor density, specialty clinics, and privacy-sensitive patient communication expectations'],
  ['Seattle', 'Washington', 'WA', 'tech-enabled care models, behavioral health demand, and cloud vendor review pressure'],
  ['Denver', 'Colorado', 'CO', 'regional referral traffic, mountain-area telehealth, and multi-county clinic coordination'],
  ['Oklahoma City', 'Oklahoma', 'OK', 'regional primary care coverage, independent practices, and weather-aware continuity planning'],
  ['Nashville', 'Tennessee', 'TN', 'healthcare company density, specialty practices, and payer operations concentrated around the metro'],
  ['Washington', 'District of Columbia', 'DC', 'policy-adjacent healthcare teams, mobile staff, and complex payer and referral handoffs'],
  ['El Paso', 'Texas', 'TX', 'border-region intake, bilingual operations, and referral documentation crossing multiple care settings'],
  ['Las Vegas', 'Nevada', 'NV', 'tourism-related urgent care, mobile workforces, and fast-growing outpatient practices'],
  ['Boston', 'Massachusetts', 'MA', 'academic medical referrals, specialty clinics, and privacy expectations shaped by dense care networks'],
  ['Detroit', 'Michigan', 'MI', 'multi-site primary care, community health needs, and centralized compliance teams'],
  ['Portland', 'Oregon', 'OR', 'behavioral health, primary care, and telehealth-heavy clinic operations'],
  ['Memphis', 'Tennessee', 'TN', 'regional referral traffic, specialty care, and community clinic workflows'],
  ['Louisville', 'Kentucky', 'KY', 'regional specialty practices, independent clinics, and cross-state patient movement'],
  ['Baltimore', 'Maryland', 'MD', 'academic referrals, neighborhood clinics, and payer documentation workflows'],
  ['Milwaukee', 'Wisconsin', 'WI', 'multi-location outpatient groups, specialty referrals, and workforce training needs'],
  ['Albuquerque', 'New Mexico', 'NM', 'wide service areas, telehealth support, and rural referral coordination'],
  ['Tucson', 'Arizona', 'AZ', 'retiree care, university referrals, and multilingual patient communication'],
  ['Fresno', 'California', 'CA', 'Central Valley referral patterns, agricultural workforce care, and multilingual intake'],
  ['Sacramento', 'California', 'CA', 'state capital operations, multispecialty practices, and compliance-conscious administrative teams'],
  ['Mesa', 'Arizona', 'AZ', 'East Valley primary care panels, Medicare-heavy follow-up, and front-desk coverage across family medicine offices'],
  ['Kansas City', 'Missouri', 'MO', 'cross-state patient movement, specialty referrals, and regional clinic administration'],
  ['Atlanta', 'Georgia', 'GA', 'major referral networks, rapid metro growth, and high-volume outpatient operations'],
  ['Omaha', 'Nebraska', 'NE', 'regional specialty practices, employer health programs, and centralized clinic administration'],
  ['Colorado Springs', 'Colorado', 'CO', 'military families, regional referrals, and mountain-area continuity needs'],
  ['Raleigh', 'North Carolina', 'NC', 'fast-growing practices, research-triangle employers, and digital health adoption'],
  ['Virginia Beach', 'Virginia', 'VA', 'military families, seasonal care patterns, and coastal continuity planning'],
  ['Long Beach', 'California', 'CA', 'port-adjacent employer health needs, multilingual intake, and Los Angeles county referrals'],
  ['Miami', 'Florida', 'FL', 'multilingual patient communication, international visitors, and high-volume specialty clinics'],
  ['Oakland', 'California', 'CA', 'community clinics, behavioral health workflows, and Bay Area vendor ecosystems'],
  ['Minneapolis', 'Minnesota', 'MN', 'large care networks, multispecialty clinics, and mature privacy operations'],
  ['Tulsa', 'Oklahoma', 'OK', 'regional specialty care, independent clinics, and continuity planning across service areas'],
  ['Bakersfield', 'California', 'CA', 'Central Valley occupational health, multilingual intake, and regional referrals'],
  ['Wichita', 'Kansas', 'KS', 'regional referral traffic, specialty practices, and shared administrative teams'],
  ['Arlington', 'Texas', 'TX', 'metroplex patient movement, urgent care workflows, and multi-site administration'],
  ['Aurora', 'Colorado', 'CO', 'large medical campus referrals, diverse patient communication, and regional specialty care'],
  ['Tampa', 'Florida', 'FL', 'bay-area specialty referrals, hurricane-season downtime planning, and centralized outpatient administration'],
  ['New Orleans', 'Louisiana', 'LA', 'regional referrals, disaster readiness, and community clinic documentation needs'],
  ['Cleveland', 'Ohio', 'OH', 'major specialty referrals, academic medicine adjacency, and mature compliance expectations'],
  ['Honolulu', 'Hawaii', 'HI', 'island continuity planning, referral coordination, and remote workforce constraints'],
  ['Anaheim', 'California', 'CA', 'tourism-adjacent urgent care, multilingual intake, and Orange County referrals'],
  ['Lexington', 'Kentucky', 'KY', 'regional specialty referrals, independent practices, and university-adjacent care'],
  ['Stockton', 'California', 'CA', 'Central Valley access needs, multilingual patient communication, and referral coordination'],
  ['Corpus Christi', 'Texas', 'TX', 'coastal continuity planning, specialty referrals, and bilingual intake operations'],
  ['Henderson', 'Nevada', 'NV', 'suburban specialty growth, retiree care, and shared Las Vegas metro staffing'],
  ['Riverside', 'California', 'CA', 'Inland Empire growth, multi-county referrals, and high-volume patient intake'],
  ['Newark', 'New Jersey', 'NJ', 'dense referral networks, multilingual intake, and urban clinic administration'],
  ['Saint Paul', 'Minnesota', 'MN', 'multi-location community care, payer workflows, and behavioral health coordination'],
  ['Santa Ana', 'California', 'CA', 'multilingual patient communication, Orange County referrals, and community clinic workflows'],
  ['Cincinnati', 'Ohio', 'OH', 'regional specialty care, cross-state patient movement, and employer health programs'],
  ['Irvine', 'California', 'CA', 'specialty groups, technology-forward administration, and Orange County vendor review'],
  ['Orlando', 'Florida', 'FL', 'tourism-related urgent care, retiree care, and high-volume specialty practices'],
  ['Pittsburgh', 'Pennsylvania', 'PA', 'academic medical referrals, specialty groups, and mature clinic compliance operations'],
  ['St. Louis', 'Missouri', 'MO', 'regional specialty referrals, cross-state patient movement, and centralized billing teams'],
  ['Greensboro', 'North Carolina', 'NC', 'regional primary care coverage, specialty referrals, and growing outpatient operations'],
  ['Jersey City', 'New Jersey', 'NJ', 'commuter-heavy care patterns, multilingual intake, and dense referral networks'],
  ['Anchorage', 'Alaska', 'AK', 'remote referral coordination, weather disruption planning, and telehealth workflows'],
  ['Plano', 'Texas', 'TX', 'suburban specialty groups, employer health workflows, and shared metroplex staff'],
  ['Lincoln', 'Nebraska', 'NE', 'university-adjacent care, regional referrals, and independent practice administration'],
  ['Durham', 'North Carolina', 'NC', 'research-triangle referrals, academic medicine adjacency, and specialty care coordination'],
  ['Buffalo', 'New York', 'NY', 'regional specialty referrals, weather continuity planning, and cross-border patient questions'],
  ['Chandler', 'Arizona', 'AZ', 'fast-growing suburban clinics, technology vendors, and shared administrative teams'],
  ['Chula Vista', 'California', 'CA', 'border-region intake, bilingual workflows, and San Diego county referrals'],
  ['Toledo', 'Ohio', 'OH', 'regional primary care, specialty referrals, and cross-state patient movement'],
  ['Madison', 'Wisconsin', 'WI', 'university referrals, technology-forward clinics, and mature privacy expectations'],
  ['Gilbert', 'Arizona', 'AZ', "family medicine expansion, pediatric and women's health referrals, and fast-growing suburb intake workflows"],
  ['Reno', 'Nevada', 'NV', 'regional referrals, mountain-area telehealth, and continuity planning'],
  ['Fort Wayne', 'Indiana', 'IN', 'regional primary care coverage, specialty referrals, and shared compliance staff'],
  ['North Las Vegas', 'Nevada', 'NV', 'fast-growing outpatient practices, mobile staffing, and Las Vegas metro referrals'],
  ['St. Petersburg', 'Florida', 'FL', 'older adult care coordination, barrier-island access issues, and records communication across waterfront clinics'],
  ['Lubbock', 'Texas', 'TX', 'regional referral coverage, rural patient movement, and independent specialty practices'],
  ['Irving', 'Texas', 'TX', 'metroplex employer health workflows, multilingual intake, and multi-site administration'],
  ['Laredo', 'Texas', 'TX', 'border-region patient intake, bilingual communication, and referral documentation'],
  ['Winston-Salem', 'North Carolina', 'NC', 'regional specialty referrals, community clinics, and centralized administration'],
  ['Chesapeake', 'Virginia', 'VA', 'coastal continuity planning, military families, and multi-site outpatient care'],
  ['Glendale', 'Arizona', 'AZ', 'suburban primary care, retiree care, and Phoenix-area referral coordination'],
  ['Garland', 'Texas', 'TX', 'metroplex patient movement, multilingual intake, and shared administrative teams'],
  ['Scottsdale', 'Arizona', 'AZ', 'specialty and elective care, retiree workflows, and high vendor expectations'],
  ['Norfolk', 'Virginia', 'VA', 'military families, coastal continuity planning, and regional specialty referrals'],
  ['Boise', 'Idaho', 'ID', 'fast-growing outpatient practices, regional referrals, and expanding telehealth workflows'],
  ['Fremont', 'California', 'CA', 'Bay Area specialty referrals, multilingual intake, and technology-forward operations'],
  ['Spokane', 'Washington', 'WA', 'regional specialty coverage, rural referrals, and continuity planning'],
  ['Tacoma', 'Washington', 'WA', 'regional referrals, military families, behavioral health workflows, and Puget Sound continuity planning'],
  ['Richmond', 'Virginia', 'VA', 'state capital operations, regional specialty referrals, and mature administrative teams'],
  ['Baton Rouge', 'Louisiana', 'LA', 'state capital operations, regional referrals, and storm-ready continuity planning'],
]

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function getContextParts(context) {
  return context
    .split(',')
    .map((part) => part.replace(/\.$/, '').trim().replace(/^and\s+/i, ''))
    .filter(Boolean)
}

function getLocalOperationalNotes(city, context, profile) {
  const parts = getContextParts(context)
  const first = parts[0] ?? `${city} clinic operations`
  const second = parts[1] ?? profile.summaryFocus
  const third = parts[2] ?? 'shared administrative teams'

  return [
    `In ${city}, ${first} should be reflected in the clinic risk analysis, not left as informal knowledge held by one administrator.`,
    `For ${city} teams managing ${second}, document which roles can view PHI, which tools are approved, and how exceptions are escalated.`,
    `When ${city} operations involving ${third} change, refresh access lists, vendor records, and training examples within the same operating cycle.`,
  ]
}

function getLocalRiskMap(city, state, context, profile) {
  const parts = getContextParts(context)
  const first = parts[0] ?? `${city} clinic operations`
  const second = parts[1] ?? profile.summaryFocus
  const third = parts[2] ?? 'shared administrative teams'

  return [
    `${city} risk: ${first}. Evidence to keep: role-based access notes, task owners, and the reason each workforce group needs PHI for that workflow.`,
    `${city} risk: ${second}. Evidence to keep: approved communication channels, patient identity-check steps, and a sample of completed follow-up tasks that avoided unnecessary PHI exposure.`,
    `${city} risk: ${third}. Evidence to keep: vendor BAA status, administrator settings, renewal dates, and screenshots or exports showing the workflow stayed inside approved tools.`,
    `${state} overlay risk: a local workflow changes but the clinic keeps using last year's policy language. Evidence to keep: review dates, source checks, decision notes, and the owner who approved the change.`,
  ]
}

function getEvidenceCadence(city, state, profile) {
  return [
    `Weekly: review open ${profile.label} tasks for patient-identifying details in task names, comments, inboxes, attachments, and reminders.`,
    `Monthly: sample vendor, access, training, and incident records for ${city} workflows and confirm each item has an owner, due date, status, and retained evidence.`,
    `Quarterly: refresh the risk analysis sections tied to ${profile.summaryFocus}, then document what changed and which staff examples need retraining.`,
    `Annually: compare the clinic's HIPAA policies against current federal sources and the cited ${state} source before approving the next training cycle.`,
  ]
}

function getSoftwareBuyingCriteria(city, profile) {
  return [
    `Require a BAA before ${city} staff enter PHI into scheduling, messaging, billing, analytics, AI, storage, form, or task-management software.`,
    `Prefer tools that keep PHI out of email notifications, calendar titles, exported task names, analytics tags, and AI prompts unless those surfaces are explicitly covered.`,
    `Confirm the product can preserve evidence for ${profile.summaryFocus}: owner, due date, completion status, review notes, attachments, and change history.`,
    `Avoid buying a broad project-management system for ${city} compliance work unless the clinic can prove BAA scope, admin settings, retention, audit exports, and staff training boundaries.`,
  ]
}

function getSelectionEvidence(city, stateAbbreviation, index, profile) {
  const keywordSet = [
    `hipaa compliance ${city} ${stateAbbreviation}`,
    `hipaa consultant ${city}`,
    `hipaa training ${city}`,
    `hipaa compliance software ${city}`,
  ]

  return {
    model: 'City-modified HIPAA query planning model',
    keywordSet,
    priorityTier: index < 25 ? 'tier-1' : index < 60 ? 'tier-2' : 'tier-3',
    validationNote: `Validate live DataForSEO volume, keyword difficulty, and SERP evidence for ${profile.label} intent before treating ${city} as a ranked opportunity target.`,
  }
}

function getNearby(city, stateAbbreviation) {
  return cities
    .filter(([otherCity, , otherState]) => otherState === stateAbbreviation && otherCity !== city)
    .slice(0, 6)
    .map(([otherCity, , otherState]) => `${slugify(otherCity)}-${otherState.toLowerCase()}`)
}

function getCityProfile(context) {
  if (/border|bilingual|multilingual/i.test(context)) {
    return {
      label: 'multilingual access',
      summaryFocus: 'patient communication controls, interpreter-aware handoffs, vendor BAAs, and documented identity checks',
      priorities: [
        'Write patient communication rules that account for bilingual intake, portal messages, voicemail, and referral follow-up.',
        'Confirm staff know when translated forms, call notes, or text-message threads become PHI documentation.',
      ],
      checklist: [
        'Review intake, interpreter, portal, and call-back workflows for minimum necessary disclosures.',
        'Add incident examples that match multilingual front-desk, referral, and billing communication.',
      ],
      faqVendor: 'messaging, forms, interpreter, scheduling, billing, and referral vendors',
    }
  }

  if (/coastal|storm|hurricane|weather|continuity|remote|mountain|island/i.test(context)) {
    return {
      label: 'continuity planning',
      summaryFocus: 'downtime access, backups, device loss, remote work, and incident triage evidence',
      priorities: [
        'Test backup access, downtime procedures, and remote-work safeguards before seasonal disruptions or service interruptions.',
        'Keep incident triage notes tied to device loss, unavailable systems, and emergency communication workarounds.',
      ],
      checklist: [
        'Document how staff access schedules, records, and patient communication tools during outages.',
        'Review backup, device-loss, and emergency contact workflows in the security risk analysis.',
      ],
      faqVendor: 'backup, cloud storage, messaging, telehealth, and device-management vendors',
    }
  }

  if (/academic|university|research|medical campus|specialty/i.test(context)) {
    return {
      label: 'specialty referrals',
      summaryFocus: 'referral documentation, specialist access, care-coordination tasks, and vendor boundaries',
      priorities: [
        'Define how referrals, consult notes, imaging requests, and outside records move between clinic staff and specialty partners.',
        'Review shared inboxes, fax alternatives, and task tools used by referral coordinators.',
      ],
      checklist: [
        'Map referral, records-request, prior-authorization, and specialist follow-up steps before changing tools.',
        'Limit shared queue access to workforce members who need the PHI for their assigned role.',
      ],
      faqVendor: 'referral, imaging, fax, task-management, billing, and records-request vendors',
    }
  }

  if (/technology|digital|startup|vendor|cloud/i.test(context)) {
    return {
      label: 'digital vendor review',
      summaryFocus: 'cloud vendor review, AI/tool intake, access governance, and BAA evidence',
      priorities: [
        'Gate new AI, automation, analytics, forms, and task tools until the clinic confirms PHI use is allowed and covered by a BAA when required.',
        'Keep a clear owner for vendor intake so staff do not pilot patient-specific workflows in unscreened software.',
      ],
      checklist: [
        'Create a vendor intake path for AI, analytics, automation, forms, and collaboration tools before staff test them with PHI.',
        'Store BAA status, plan limitations, admin settings, and renewal dates in one evidence file.',
      ],
      faqVendor: 'AI, analytics, automation, cloud storage, forms, and task-management vendors',
    }
  }

  if (/retiree|urgent care|tourism|seasonal/i.test(context)) {
    return {
      label: 'high-volume access',
      summaryFocus: 'front-desk verification, urgent requests, patient messaging, and records-release logs',
      priorities: [
        'Standardize patient identity checks for walk-ins, family contacts, portal support, and records requests.',
        'Keep release-of-information and complaint workflows documented so high-volume teams do not improvise.',
      ],
      checklist: [
        'Review front-desk scripts for patient identity checks, family disclosures, and records requests.',
        'Audit patient messaging and release logs for incomplete verification notes.',
      ],
      faqVendor: 'scheduling, patient messaging, records-release, billing, and portal vendors',
    }
  }

  return {
    label: 'clinic operations',
    summaryFocus: 'staff access, vendor BAAs, patient messaging, billing follow-up, and recurring evidence reviews',
    priorities: [
      'Keep access reviews tied to job role changes, shared inboxes, billing queues, and temporary coverage.',
      'Maintain incident triage notes so the clinic can show how a suspected disclosure was evaluated.',
    ],
    checklist: [
      'Map high-frequency workflows: intake, referrals, prior authorizations, billing follow-up, patient messaging, and records requests.',
      'Schedule quarterly evidence reviews so policies, access logs, training records, and vendor files stay current.',
    ],
    faqVendor: 'scheduling, messaging, billing, analytics, storage, AI, and task-management vendors',
  }
}

function buildGuide([city, state, stateAbbreviation, context], index) {
  const slug = `${slugify(city)}-${stateAbbreviation.toLowerCase()}`
  const primaryKeyword = `HIPAA compliance ${city} ${stateAbbreviation}`
  const profile = getCityProfile(context)
  const stateSource = stateSources[stateAbbreviation]?.[0]
  const localOperationalNotes = getLocalOperationalNotes(city, context, profile)
  const localRiskMap = getLocalRiskMap(city, state, context, profile)
  const evidenceCadence = getEvidenceCadence(city, state, profile)
  const softwareBuyingCriteria = getSoftwareBuyingCriteria(city, profile)
  const selectionEvidence = getSelectionEvidence(city, stateAbbreviation, index, profile)
  const relatedResource = stateAbbreviation === 'CA' || stateAbbreviation === 'NY' || stateAbbreviation === 'TX'
    ? 'hipaa-state-law-overlay-matrix'
    : 'hipaa-compliance-self-assessment'

  return {
    title: `HIPAA compliance in ${city}, ${stateAbbreviation}: clinic operations guide`,
    seoTitle: `HIPAA Compliance ${city}, ${stateAbbreviation}`,
    description: `A practical HIPAA compliance guide for ${city} clinics that need federal HIPAA basics, ${state} oversight checkpoints, and repeatable operating steps.`,
    metaDescription: `HIPAA compliance guide for ${city} clinics: federal rules, ${state} oversight, checklist, sources, and PHIGuard next steps.`,
    city,
    state,
    stateAbbreviation,
    primaryKeyword,
    intent: 'consideration',
    summary: `${city} clinics should treat HIPAA compliance as recurring operating work: maintain federal privacy and security safeguards, train staff, document ${profile.summaryFocus}, keep vendor evidence current, and check the cited ${state} source before changing PHI workflows.`,
    keyTakeaways: [
      `${city} practices still start with the federal HIPAA Privacy, Security, and Breach Notification Rules.`,
      `The cited ${state} source is a state-specific checkpoint; verify current state materials before changing patient-record, incident, or vendor workflows.`,
      `The highest-risk local workflows for this page are ${profile.summaryFocus}.`,
      `PHIGuard supports US clinics through web software; this page does not claim a local office or legal representation in ${city}.`,
      `Use this page as a local operating checklist, not a substitute for legal advice or a full risk analysis.`,
    ],
    cityContext: `${city} clinic administrators often manage ${context}. That makes HIPAA work less about one annual policy binder and more about repeatable controls for who can access PHI, which vendors receive PHI, how staff document exceptions, and how the clinic proves follow-through after a workflow change.`,
    localOperationalNotes,
    localRiskMap,
    stateOverlay: `Use federal HIPAA as the baseline, then treat ${stateSource?.title ?? `${state} oversight materials`} as a state-specific verification checkpoint. For ${city} clinics, the practical question is whether the clinic has checked current ${state} materials before changing a policy, vendor contract, patient communication process, or incident log. This is compliance education, not legal advice.`,
    operatingPriorities: [
      `Confirm each PHI-handling vendor has a signed BAA before ${city} staff use it for patient-specific work.`,
      ...profile.priorities,
      `Run a security risk analysis that covers remote work, backups, device loss, and cloud tools.`,
      `Use the cited ${state} source as a refresh trigger for current state healthcare oversight materials.`,
    ],
    evidenceCadence,
    softwareBuyingCriteria,
    checklist: [
      `Name the privacy and security owners for the ${city} clinic.`,
      `Inventory systems, spreadsheets, inboxes, forms, and vendors that create, receive, maintain, or transmit PHI.`,
      ...profile.checklist,
      `Verify BAAs for ${profile.faqVendor} before PHI use.`,
      `Train workforce members on minimum necessary access, patient identity checks, and incident escalation.`,
      `Review current ${state} materials before changing patient communication, record-release, incident, or vendor workflows.`,
      `Schedule quarterly evidence reviews around the ${profile.label} workflows most likely to change in ${city}.`,
    ],
    sources: [...federalSources, ...(stateSources[stateAbbreviation] ?? [])],
    faq: [
      {
        q: `What is the fastest HIPAA starting point for a ${city} clinic?`,
        a: `Start with a current risk analysis, a vendor/BAA inventory, workforce training records, and documented rules for patient messaging, referrals, billing follow-up, and records requests.`,
      },
      {
        q: `Does ${state} replace HIPAA for ${city} clinics?`,
        a: `No. HIPAA remains the federal baseline for covered entities and business associates. ${city} clinics should check current ${state} materials before changing workflows because state oversight, medical-record, privacy, or incident expectations can change.`,
      },
      {
        q: `Can PHIGuard provide HIPAA compliance software to clinics in ${city}?`,
        a: `PHIGuard serves US clinics through its web application and helps organize HIPAA tasks, vendor evidence, policy work, access reviews, and incident follow-through. {{PHIGUARD_PRICING_DETAILS}} This guide is educational and does not claim a local office, consultant, or legal service in ${city}.`,
      },
      {
        q: `Which vendors should a ${city} clinic review first?`,
        a: `Review vendors that touch PHI first, especially ${profile.faqVendor}. Confirm the workflow is allowed, the right plan or contract is in place, and a BAA is signed before PHI use.`,
      },
      {
        q: `How often should a ${city} clinic review HIPAA evidence?`,
        a: `Review high-change workflows monthly, run a broader evidence review quarterly, and refresh policies and training at least annually. Add extra reviews after vendor, staffing, location, or patient communication changes.`,
      },
    ],
    relatedLearnPath: '/learn/compliance-operations/hipaa-multi-state-practice-compliance-guide',
    relatedResource,
    nearbyCitySlugs: getNearby(city, stateAbbreviation),
    selectionEvidence,
    author: 'angel-campa',
    reviewer: 'phiguard-compliance-research',
    publishedAt: '2026-05-06',
    updatedAt: '2026-05-06',
    verificationDate: '2026-05-06',
    selectionNote: `Internal planning note: ${city} was included for city-modified HIPAA compliance, consultant, training, and software intent. Validate live DataForSEO volume and SERP evidence before each major refresh.`,
  }
}

const guides = cities.map((city, index) => buildGuide(city, index))

if (new Set(guides.map((guide) => `${slugify(guide.city)}-${guide.stateAbbreviation.toLowerCase()}`)).size !== guides.length) {
  throw new Error('Duplicate city guide slugs detected')
}

if (targetDir.includes(`${path.sep}src${path.sep}content${path.sep}city-guides`)) {
  fs.rmSync(targetDir, { recursive: true, force: true })
}
fs.mkdirSync(targetDir, { recursive: true })

for (const guide of guides) {
  const slug = `${slugify(guide.city)}-${guide.stateAbbreviation.toLowerCase()}`
  fs.writeFileSync(path.join(targetDir, `${slug}.json`), `${JSON.stringify(guide, null, 2)}\n`)
}

console.log(`Generated ${guides.length} city guides in ${path.relative(projectRoot, targetDir)}`)
