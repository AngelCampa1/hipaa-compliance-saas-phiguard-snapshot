import { getStripe } from './stripe.js'
import { LIMITED_OFFER_PROMOTIONS, type Promotion, type PromotionId } from './plans.js'

export type PromotionPhaseInfo = {
  id: PromotionId
  percentOff: number
  redeemed: number
  cap: number
  status: 'active' | 'completed' | 'upcoming'
}

export type PromotionPhaseState = {
  active: Promotion | null
  phases: PromotionPhaseInfo[]
  totalRedeemed: number
  totalCap: number
  degraded: boolean
}

// In-process cache: reduces Stripe calls for concurrent checkout requests.
// Workers isolate per-instance, so this only helps within a single request burst.
const CACHE_TTL_MS = 30_000
let cachedState: PromotionPhaseState | null = null
let cacheExpiresAt = 0

export function clearPromotionPhaseCache() {
  cachedState = null
  cacheExpiresAt = 0
}

export async function resolvePromotionPhaseState(): Promise<PromotionPhaseState> {
  const now = Date.now()
  if (cachedState && now < cacheExpiresAt) return cachedState

  const stripe = getStripe()

  const couponIds = LIMITED_OFFER_PROMOTIONS.map((promotion) => {
    const id = process.env[promotion.stripeCouponEnvKey]
    if (!id) throw new Error(`Stripe coupon env var not set: ${promotion.stripeCouponEnvKey}`)
    return id
  })

  const coupons = await Promise.all(
    couponIds.map((couponId) => stripe.coupons.retrieve(couponId))
  )

  const phases: PromotionPhaseInfo[] = LIMITED_OFFER_PROMOTIONS.map((promotion, i) => {
    const coupon = coupons[i]!
    // A deleted coupon returns { deleted: true }; treat it as fully redeemed.
    const rawRedeemed = (coupon as { deleted?: boolean }).deleted
      ? promotion.redemptionCap
      : (coupon.times_redeemed ?? 0)
    const redeemed = Math.min(Math.max(rawRedeemed, 0), promotion.redemptionCap)
    return {
      id: promotion.id,
      percentOff: promotion.percentOff,
      redeemed,
      cap: promotion.redemptionCap,
      status: redeemed >= promotion.redemptionCap ? 'completed' as const : 'active' as const,
    }
  })

  const activeIndex = phases.findIndex((p) => p.status === 'active')
  const degraded = activeIndex === -1

  const totalRedeemed = phases.reduce((sum, p) => sum + p.redeemed, 0)
  const totalCap = phases.reduce((sum, p) => sum + p.cap, 0)

  const state: PromotionPhaseState = {
    active: activeIndex === -1 ? null : LIMITED_OFFER_PROMOTIONS[activeIndex]!,
    phases,
    totalRedeemed,
    totalCap,
    degraded,
  }

  cachedState = state
  cacheExpiresAt = Date.now() + CACHE_TTL_MS
  return state
}
