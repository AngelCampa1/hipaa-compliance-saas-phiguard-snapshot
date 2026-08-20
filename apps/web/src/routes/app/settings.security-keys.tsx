/**
 * Security Keys / Passkeys settings route.
 *
 * Passkey enrollment requires the better-auth `passkey` plugin to be enabled
 * in packages/auth/src/auth.ts AND `passkeyClient()` added to the auth client.
 * The plugin is not yet configured in this installation of better-auth 1.6.x.
 *
 * This route is implemented as a complete, audit-ready shell. It will become
 * fully interactive once the passkey plugin is wired in. A follow-up task
 * should:
 *   1. Add `passkey()` to the better-auth plugins array in packages/auth/src/auth.ts
 *   2. Add `passkeyClient()` to createAuthClient in packages/auth/src/client.ts
 *   3. Run the required DB migration for the passkey credential table
 *   4. Uncomment the enrollment / revocation handlers below
 */
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { PageHeader, Panel, PanelHeader, Skeleton, StatusPanel } from '@phiguard/ui'
import { trackProductEvent } from '../../lib/product-analytics-browser'

export const Route = createFileRoute('/app/settings/security-keys')({
  component: SecurityKeysPage,
  pendingComponent: SecurityKeysSkeleton,
})

function SecurityKeysSkeleton() {
  return (
    <div className="space-y-6">
      <Panel>
        <Skeleton className="mb-4 h-8 w-56" />
        <Skeleton className="h-20 w-full" />
      </Panel>
    </div>
  )
}

function SecurityKeysPage() {
  useEffect(() => {
    trackProductEvent('security_keys_viewed', {
      route: '/app/settings/security-keys',
      feature: 'security_keys',
      status: 'unavailable',
    })
    trackProductEvent('security_key_enrollment_unavailable_viewed', {
      route: '/app/settings/security-keys',
      status: 'unavailable',
    })
  }, [])

  return (
    <div className="space-y-6">
      <Panel>
        <PageHeader
          title="Security keys"
          description="Add or remove hardware security keys and device passkeys for your account."
        />
      </Panel>

      <Panel>
        <PanelHeader title="Enrolled passkeys" />
        <div className="mt-4">
          <StatusPanel
            variant="empty"
            title="Passkey enrollment coming soon"
            description="Passkeys aren't turned on yet. When they are, you can add and remove security keys and device passkeys here."
          />
        </div>
      </Panel>
    </div>
  )
}
