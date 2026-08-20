export const PHIGUARD_LEGAL_ENTITY = 'PHIGuard'
export const PHIGUARD_PRODUCT_NAME = 'PHIGuard'

export const PHIGUARD_ROOT_DOMAIN = 'phiguard.app'
export const PHIGUARD_MARKETING_HOST = PHIGUARD_ROOT_DOMAIN
export const PHIGUARD_MARKETING_WWW_HOST = `www.${PHIGUARD_ROOT_DOMAIN}` as const
export const PHIGUARD_APP_HOST = `my.${PHIGUARD_ROOT_DOMAIN}` as const

export const PHIGUARD_PUBLIC_SITE_ORIGIN = `https://${PHIGUARD_MARKETING_HOST}` as const
export const PHIGUARD_PUBLIC_SITE_WWW_ORIGIN = `https://${PHIGUARD_MARKETING_WWW_HOST}` as const
export const PHIGUARD_APP_ORIGIN = `https://${PHIGUARD_APP_HOST}` as const
export const PHIGUARD_SIGNUP_URL = `${PHIGUARD_APP_ORIGIN}/signup`
export const PHIGUARD_EMAIL_LOGO_URL = `${PHIGUARD_PUBLIC_SITE_ORIGIN}/email/logo-horizontal.png`

export const PHIGUARD_NOTICE_ADDRESS_LINES = [
  'Address removed — service retired',
] as const
export const PHIGUARD_NOTICE_ADDRESS_SINGLE_LINE = PHIGUARD_NOTICE_ADDRESS_LINES.join(', ')

export const PHIGUARD_EMAIL_FOOTER_ENTITY = 'PHIGuard'

export const PHIGUARD_FOUNDER_LINKEDIN_URL = 'https://www.linkedin.com/in/angelcampa1/'
