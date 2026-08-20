import { useEffect, type ReactNode } from 'react'
import type { FeatureKey, OrgFeatureContext } from '@phiguard/billing'
import { getMinimumPlanForFeatures, hasFeatureForOrg } from '@phiguard/billing'
import { Link } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { trackProductEvent } from '../lib/product-analytics-browser'

interface FeatureGateProps {
  feature: FeatureKey
  org: OrgFeatureContext
  children: ReactNode
  fallback?: ReactNode
}

export function FeatureGate({ feature, org, children, fallback }: FeatureGateProps) {
  const hasFeature = hasFeatureForOrg(org, feature)

  useEffect(() => {
    if (!hasFeature) trackFeatureGateViewed(feature)
  }, [feature, hasFeature])

  if (hasFeature) return <>{children}</>
  return <>{fallback ?? <UpgradePrompt feature={feature} />}</>
}

export function trackFeatureGateViewed(feature: FeatureKey, route = currentRoute()) {
  trackFeatureGateEvent('feature_gate_viewed', feature, route)
}

export function trackFeatureGateUpgradeClicked(feature: FeatureKey, route = currentRoute()) {
  trackFeatureGateEvent('feature_gate_upgrade_clicked', feature, route)
}

function trackFeatureGateEvent(
  eventName: 'feature_gate_viewed' | 'feature_gate_upgrade_clicked',
  feature: FeatureKey,
  route: string,
) {
  trackProductEvent(eventName, {
    route,
    feature,
    minimum_plan: getMinimumPlanForFeatures([feature]),
  })
}

function currentRoute() {
  if (typeof window === 'undefined') return '/app/other'
  return window.location.pathname
}

function UpgradePrompt({ feature }: { feature: FeatureKey }) {
  const featureLabels: Record<string, string> = {
    integrations_basic: 'calendar integrations and connected actions',
    multi_location_rollup: 'multi-location reporting',
    compliance_addon: 'policies, training, risk, and vendor management',
    soc2_evidence: 'SOC 2 evidence and access reviews',
  }
  const label = featureLabels[feature] ?? 'this feature'

  return (
    <div className="rounded-xl border border-brand-100 bg-brand-50 p-6 text-center text-sm">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-0 text-brand-700">
        <Lock className="h-5 w-5" />
      </div>
      <p className="mt-3 font-semibold text-text-primary">Your current plan doesn't include {label}.</p>
      <p className="mx-auto mt-2 max-w-md leading-6 text-text-secondary">
        Nothing is broken. This area is locked until your clinic is on a plan that covers this level of compliance work.
      </p>
      <Link
        to="/app/billing"
        onClick={() => trackFeatureGateUpgradeClicked(feature)}
        className="mt-4 inline-flex rounded-full bg-brand-700 px-4 py-2 font-semibold text-text-inverse hover:bg-brand-800"
      >
        See billing options
      </Link>
    </div>
  )
}
