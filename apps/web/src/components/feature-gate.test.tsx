import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  trackFeatureGateUpgradeClicked,
  trackFeatureGateViewed,
} from './feature-gate'
import { trackProductEvent } from '../lib/product-analytics-browser'

vi.mock('../lib/product-analytics-browser', () => ({
  trackProductEvent: vi.fn(),
}))

const source = readFileSync(resolve(__dirname, 'feature-gate.tsx'), 'utf8')

describe('FeatureGate analytics', () => {
  beforeEach(() => {
    vi.mocked(trackProductEvent).mockClear()
  })

  it('tracks locked feature exposure with only coarse business properties', () => {
    trackFeatureGateViewed('soc2_evidence', '/app/soc2/evidence')

    expect(trackProductEvent).toHaveBeenCalledWith('feature_gate_viewed', {
      route: '/app/soc2/evidence',
      feature: 'soc2_evidence',
      minimum_plan: 'group',
    })
    expect(JSON.stringify(vi.mocked(trackProductEvent).mock.calls)).not.toContain('patient')
  })

  it('tracks upgrade CTA clicks with the required minimum plan', () => {
    trackFeatureGateUpgradeClicked('compliance_addon', '/app/compliance/program')

    expect(trackProductEvent).toHaveBeenCalledWith('feature_gate_upgrade_clicked', {
      route: '/app/compliance/program',
      feature: 'compliance_addon',
      minimum_plan: 'group',
    })
  })

  it('wires locked feature views and billing CTA clicks in the rendered gate', () => {
    expect(source).toContain('useEffect')
    expect(source).toContain('trackFeatureGateViewed(feature)')
    expect(source).toContain('trackFeatureGateUpgradeClicked(feature)')
    expect(source).toContain("to=\"/app/billing\"")
  })
})
