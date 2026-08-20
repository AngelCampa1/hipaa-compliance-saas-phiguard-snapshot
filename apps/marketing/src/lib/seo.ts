import {
  BILLING_CADENCES,
  PLANS,
  getPlanPromotionPriceDisplay,
  type BillingCadence,
  type StoredPlanId,
} from '../../../../packages/billing/src/plans'
import { PHIGUARD_PRODUCT_NAME, PHIGUARD_PUBLIC_SITE_ORIGIN } from '@phiguard/brand/identity'
import { legalNotice } from '@phiguard/knowledge/legal-trust'
import { SUPPORT_EMAIL } from '@phiguard/knowledge/support'

const BASE_URL = PHIGUARD_PUBLIC_SITE_ORIGIN
const BRAND_LOGO_URL = `${BASE_URL}/logo-mark.png`

const PUBLIC_PLAN_IDS = ['essentials', 'clinic', 'group', 'compliance_ops'] satisfies StoredPlanId[]
const CADENCE_BILLING_DURATIONS: Record<BillingCadence, string> = {
  monthly: 'P1M',
  annual: 'P1Y',
}

function toAbsoluteUrl(url: string): string {
  return url.startsWith('http') ? url : `${BASE_URL}${url}`
}

export function buildOrganizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: legalNotice.entity,
    url: BASE_URL,
    logo: BRAND_LOGO_URL,
    description:
      'HIPAA-native workflow and compliance platform for healthcare teams handling PHI-bearing operational work. BAA included at every pricing tier.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: SUPPORT_EMAIL,
      contactType: 'customer support',
    },
    sameAs: ['https://github.com/AngelCampa1/hipaa-compliance-saas-phiguard-snapshot'],
  }
}

export function buildFAQSchema(faqs: { q: string; a: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    })),
  }
}

export function buildSoftwareApplicationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: PHIGUARD_PRODUCT_NAME,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'HIPAA-native workflow and compliance platform for healthcare teams handling PHI-bearing operational work. BAA included at every tier.',
    url: BASE_URL,
    offers: PUBLIC_PLAN_IDS.flatMap((planId) => {
      const plan = PLANS[planId]

      return BILLING_CADENCES.map((cadence) => {
        const promotedPrice = getPlanPromotionPriceDisplay(planId, cadence)
        const schemaPrice = promotedPrice.discountedTotal.toFixed(2)

        return {
          '@type': 'Offer',
          name: `${plan.name} (${cadence})`,
          price: schemaPrice,
          priceCurrency: 'USD',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: schemaPrice,
            priceCurrency: 'USD',
            billingDuration: CADENCE_BILLING_DURATIONS[cadence],
          },
          url: `${BASE_URL}/pricing`,
        }
      })
    }),
    publisher: {
      '@type': 'Organization',
      name: legalNotice.entity,
      url: BASE_URL,
    },
  }
}

export function buildArticleSchema(args: {
  headline: string
  description: string
  url: string
  datePublished: string | Date
  dateModified?: string | Date
  authorName?: string
  authorUrl?: string
  authorSameAs?: string[]
  reviewerName?: string
  reviewerUrl?: string
  schemaType?: 'Article' | 'BlogPosting'
  citations?: { title: string; url: string }[]
}): object {
  const toISO = (d: string | Date) => (d instanceof Date ? d.toISOString() : d)
  return {
    '@context': 'https://schema.org',
    '@type': args.schemaType ?? 'Article',
    headline: args.headline,
    description: args.description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': toAbsoluteUrl(args.url),
    },
    datePublished: toISO(args.datePublished),
    dateModified: toISO(args.dateModified ?? args.datePublished),
    author: {
      '@type': 'Person',
      name: args.authorName ?? 'Angel Campa',
      url: args.authorUrl ?? `${BASE_URL}/contributors/angel-campa`,
      sameAs: args.authorSameAs ?? ['https://www.linkedin.com/in/angelcampa1/'],
    },
    reviewedBy: args.reviewerName
      ? {
          '@type': 'Organization',
          name: args.reviewerName,
          url: args.reviewerUrl,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: legalNotice.entity,
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: BRAND_LOGO_URL,
      },
    },
    citation: args.citations?.map((source) => ({
      '@type': 'CreativeWork',
      name: source.title,
      url: source.url,
    })),
  }
}

export function buildPersonSchema(args: {
  name: string
  description: string
  url: string
  jobTitle?: string
  knowsAbout?: string[]
  sameAs?: string[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: args.name,
    description: args.description,
    url: toAbsoluteUrl(args.url),
    jobTitle: args.jobTitle,
    knowsAbout: args.knowsAbout,
    sameAs: args.sameAs,
    worksFor: {
      '@type': 'Organization',
      name: legalNotice.entity,
      url: BASE_URL,
    },
  }
}

export function buildHowToSchema(args: {
  name: string
  description: string
  steps: { name: string; text: string }[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: args.name,
    description: args.description,
    step: args.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }
}

export function buildDefinedTermSchema(args: {
  name: string
  description: string
  url: string
  inDefinedTermSet?: { name: string; url: string }
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: args.name,
    description: args.description,
    url: toAbsoluteUrl(args.url),
    inDefinedTermSet: args.inDefinedTermSet
      ? {
          '@type': 'DefinedTermSet',
          name: args.inDefinedTermSet.name,
          url: toAbsoluteUrl(args.inDefinedTermSet.url),
        }
      : undefined,
  }
}

export function buildCollectionPageSchema(args: {
  name: string
  description: string
  url: string
  items: { name: string; url: string; description?: string }[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: args.name,
    description: args.description,
    url: toAbsoluteUrl(args.url),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: args.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: toAbsoluteUrl(item.url),
        description: item.description,
      })),
    },
  }
}

export function buildItemListSchema(args: {
  name: string
  url?: string
  items: { name: string; url?: string; description?: string }[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: args.name,
    url: args.url ? toAbsoluteUrl(args.url) : undefined,
    itemListElement: args.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url ? toAbsoluteUrl(item.url) : undefined,
      description: item.description,
    })),
  }
}
