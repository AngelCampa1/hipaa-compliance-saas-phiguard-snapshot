interface ReferralRevenue {
  partnerId: string
  commissionPct: number
  newRevenueCents: number
}

interface PayoutSummary {
  partnerId: string
  amountCents: number
}

export const MIN_PARTNER_PAYOUT_CENTS = 5_000

export function computePayouts(referrals: ReferralRevenue[]): PayoutSummary[] {
  const map = new Map<string, { amountCents: number; commissionPct: number }>()
  for (const r of referrals) {
    const cur = map.get(r.partnerId) ?? { amountCents: 0, commissionPct: r.commissionPct }
    cur.amountCents += r.newRevenueCents
    map.set(r.partnerId, cur)
  }
  return [...map.entries()]
    .map(([partnerId, { amountCents, commissionPct }]) => ({
      partnerId,
      amountCents: Math.floor(amountCents * (commissionPct / 100)),
    }))
    .filter((summary) => summary.amountCents >= MIN_PARTNER_PAYOUT_CENTS)
}
