import { getStripe } from './stripe.js'

export async function hasSavedPaymentMethod(customerId: string): Promise<boolean> {
  const stripe = getStripe()
  const paymentMethods = await stripe.customers.listPaymentMethods(customerId, {
    type: 'card',
    limit: 1,
  })

  return paymentMethods.data.length > 0
}
