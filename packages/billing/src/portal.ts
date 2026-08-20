import { getStripe } from './stripe.js'

export async function createPortalSession(stripeCustomerId: string, returnUrl: string) {
  const stripe = getStripe()
  return stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  })
}
