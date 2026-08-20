export type Contributor = {
  slug: string
  name: string
  role: string
  bio: string
  expertise: string[]
  sameAs?: string[]
}

export const contributors: Record<string, Contributor> = {
  'angel-campa': {
    slug: 'angel-campa',
    name: 'Angel Campa',
    role: 'Founder',
    bio: 'Angel Campa is the founder of PHIGuard and writes practical guidance for medical clinics evaluating HIPAA workflows, vendor risk, and compliance operations.',
    expertise: ['HIPAA operations', 'Clinic workflows', 'Vendor risk', 'Healthcare SaaS'],
    sameAs: ['https://www.linkedin.com/in/angelcampa1/'],
  },
  'phiguard-compliance-research': {
    slug: 'phiguard-compliance-research',
    name: 'PHIGuard Compliance Research',
    role: 'Compliance reviewer',
    bio: 'PHIGuard Compliance Research reviews regulatory references, workflow assumptions, and product claims for content related to HIPAA operations in small clinics.',
    expertise: ['HIPAA operations', 'Vendor risk', 'Incident response', 'Workforce compliance'],
  },
  'phiguard-editorial-team': {
    slug: 'phiguard-editorial-team',
    name: 'PHIGuard Editorial Team',
    role: 'Editorial team',
    bio: 'The PHIGuard Editorial Team produces practical HIPAA operations guidance for small medical clinics using regulatory citations and clinic workflows.',
    expertise: ['HIPAA operations', 'Clinic workflows', 'Vendor management', 'Workforce training', 'Compliance documentation'],
  },
}

export const contributorList: Contributor[] = Object.values(contributors)
export const contributorSlugs = new Set(contributorList.map((contributor) => contributor.slug))

export function getContributor(slug: string): Contributor {
  const contributor = contributors[slug]
  if (!contributor) {
    throw new Error(`Unknown contributor slug: ${slug}`)
  }
  return contributor
}
