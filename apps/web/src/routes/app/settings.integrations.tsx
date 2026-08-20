import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Alert, Button, PageHeader, Panel, PanelHeader, Skeleton, StatusPanel, SummaryMetric } from '@phiguard/ui'
import { useEffect, useState } from 'react'
import type { CommercialPlanStatus } from '@phiguard/billing'
import { hasFeatureForOrg } from '@phiguard/billing'
import { FeatureGate } from '../../components/feature-gate.js'
import { getClientErrorMessage } from '../../lib/client-errors.js'
import { formatDate } from '../../lib/dates.js'
import { getSessionFn } from '../../lib/session.js'
import type { AppSession } from '../../lib/session.js'
import {
  listConnectionsFn,
  revokeConnectionFn,
  startIntegrationInstallFn,
} from '../../server/integrations.js'
import { ConfirmActionDialog, GuidanceCallout } from '../../components/help-guidance.js'
import { trackProductEvent } from '../../lib/product-analytics-browser.js'

type Connection = Awaited<ReturnType<typeof listConnectionsFn>>[number]
type IntegrationSession = AppSession & {
  organization?: {
    plan?: string | null
    planStatus?: string | null
    trialEndsAt?: string | null
    role?: string | null
  }
}

export const Route = createFileRoute('/app/settings/integrations')({
  component: IntegrationsSettingsPage,
})

const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google Workspace',
  microsoft: 'Microsoft 365',
}

const CALENDAR_COMPLIANCE_ACKNOWLEDGMENT =
  "I understand that PHIGuard creates generic due-date reminders in my clinic's calendar and that my clinic's Google Workspace / Microsoft 365 agreement includes a BAA that covers this calendar data."

const INTEGRATION_CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  access_denied: 'Only organization administrators can connect integrations.',
  encryption_failed:
    'Integration token encryption failed. Please try again or contact support if it continues.',
  encryption_not_configured:
    'Integration token encryption is not configured. Contact support before trying again.',
  plan_required: 'Your current plan does not include calendar integrations.',
  stale_state:
    'A newer connection attempt already finished. Start a new connection if you need to reconnect.',
  token_exchange:
    'The provider did not complete the connection. Please try again from PHIGuard.',
}

export function getIntegrationCallbackFeedback(search: string):
  | { type: 'notice'; message: string }
  | { type: 'error'; message: string }
  | null {
  const params = new URLSearchParams(search)
  const status = params.get('status')
  const error = params.get('error')
  const reason = params.get('reason')

  if (status === 'connected') {
    return { type: 'notice', message: 'Integration connected successfully.' }
  }

  if (error === 'encryption_not_configured') {
    return {
      type: 'error',
      message: INTEGRATION_CALLBACK_ERROR_MESSAGES.encryption_not_configured,
    }
  }

  if (status === 'error') {
    return {
      type: 'error',
      message:
        INTEGRATION_CALLBACK_ERROR_MESSAGES[reason ?? ''] ??
        'Integration connection failed. Please try again.',
    }
  }

  return null
}

function IntegrationsSettingsPage() {
  const router = useRouter()
  const [connections, setConnections] = useState<Connection[]>([])
  const [orgContext, setOrgContext] = useState<{
    plan: string | null
    planStatus: CommercialPlanStatus | null
    trialEndsAt: string | null
  } | null>(null)
  const [hasNoOrg, setHasNoOrg] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)
  const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [canManageIntegrations, setCanManageIntegrations] = useState(false)
  const [pendingConnectProvider, setPendingConnectProvider] = useState<
    'google' | 'microsoft' | null
  >(null)
  const [calendarComplianceAcknowledged, setCalendarComplianceAcknowledged] = useState(false)
  const [pendingRevoke, setPendingRevoke] = useState<Connection | null>(null)

  const loadData = async () => {
    setLoadFailed(false)
    const session = await getSessionFn()
    const integrationSession = session as IntegrationSession | null
    const role = integrationSession?.organization?.role ?? null
    const canManage = role === 'org_owner' || role === 'org_admin'

    let activeOrgContext: {
      plan: string | null
      planStatus: CommercialPlanStatus | null
      trialEndsAt: string | null
    }
    if (integrationSession?.session?.activeOrganizationId) {
      setHasNoOrg(false)
      activeOrgContext = {
        plan: integrationSession.organization?.plan ?? null,
        planStatus: (integrationSession.organization?.planStatus ??
          null) as CommercialPlanStatus | null,
        trialEndsAt: integrationSession.organization?.trialEndsAt ?? null,
      }
      setOrgContext(activeOrgContext)
    } else {
      setHasNoOrg(true)
      activeOrgContext = { plan: null, planStatus: null, trialEndsAt: null }
      setOrgContext(activeOrgContext)
    }
    setCanManageIntegrations(canManage)

    // `listConnectionsFn` enforces the `integrations_basic` plan gate server-side
    // and throws for plans that don't include it (e.g. Essentials). Skip the call
    // when the org lacks the feature so a plan gate renders the FeatureGate upsell
    // below instead of bricking the page with a "Could not load integrations" error.
    if (!hasFeatureForOrg(activeOrgContext, 'integrations_basic')) {
      setConnections([])
      return
    }

    const conns = await listConnectionsFn()
    setConnections(conns)
  }

  useEffect(() => {
    loadData()
      .catch((loadError) => {
        setLoadFailed(true)
        trackProductEvent('integration_settings_load_failed', {
          route: '/app/settings/integrations',
          category: 'integrations',
          status: 'failed',
          reason: 'request_failed',
        })
        setError(
          getClientErrorMessage(loadError, {
            route: '/app/settings/integrations',
            operation: 'integrations.load',
            fallbackMessage: 'Unable to load integrations.',
          }),
        )
      })
      .finally(() => setIsLoadingIntegrations(false))
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const callbackFeedback = getIntegrationCallbackFeedback(window.location.search)
      if (callbackFeedback?.type === 'notice') {
        setNotice(callbackFeedback.message)
        trackProductEvent('integration_connect_completed', {
          route: '/app/settings/integrations',
          status: 'connected',
        })
        loadData().catch((loadError) => {
          setError(
            getClientErrorMessage(loadError, {
              route: '/app/settings/integrations',
              operation: 'integrations.reload-after-connect',
              fallbackMessage:
                'Integration connected, but the connection list could not be refreshed.',
            }),
          )
        })
      } else if (callbackFeedback?.type === 'error') {
        setError(callbackFeedback.message)
        const reason = new URLSearchParams(window.location.search).get('reason') ?? 'unknown'
        trackProductEvent('integration_connect_failed', {
          route: '/app/settings/integrations',
          reason: INTEGRATION_CALLBACK_ERROR_MESSAGES[reason] ? reason : 'unknown',
        })
      }
    }
  }, [])

  const handleConnect = async (provider: 'google' | 'microsoft') => {
    setError(null)
    setNotice(null)
    setConnectingProvider(provider)
    trackProductEvent('integration_connect_started', {
      route: '/app/settings/integrations',
      provider,
    })
    try {
      const { authorizeUrl } = await startIntegrationInstallFn({
        data: { provider, acknowledgedCalendarCompliance: true },
      })
      window.location.href = authorizeUrl
    } catch (connectError) {
      trackProductEvent('integration_connect_failed', {
        route: '/app/settings/integrations',
        provider,
        reason: 'start_failed',
      })
      setError(
        getClientErrorMessage(connectError, {
          route: '/app/settings/integrations',
          operation: 'integrations.connect',
          fallbackMessage: 'Unable to start integration connection.',
        }),
      )
      setConnectingProvider(null)
    }
  }

  const handleRevoke = async (connectionId: string) => {
    setError(null)
    setNotice(null)
    setRevokingId(connectionId)
    try {
      await revokeConnectionFn({ data: { connectionId } })
      setNotice('Integration disconnected.')
      setConnections((prev) => prev.filter((c) => c.id !== connectionId))
      trackProductEvent('integration_revoked', {
        route: '/app/settings/integrations',
      })
    } catch (revokeError) {
      const connection = connections.find((candidate) => candidate.id === connectionId)
      trackProductEvent('integration_revoke_failed', {
        route: '/app/settings/integrations',
        provider: connection?.provider,
        status: connection?.status ?? 'unknown',
        reason: 'revoke_failed',
      })
      setError(
        getClientErrorMessage(revokeError, {
          route: '/app/settings/integrations',
          operation: 'integrations.revoke',
          fallbackMessage: 'Unable to disconnect integration.',
        }),
      )
    } finally {
      setRevokingId(null)
    }
  }

  const connectedProviders = new Set(connections.map((c) => c.provider))
  const handleIntegrationsRetry = () => {
    trackProductEvent('integration_settings_retry_clicked', {
      route: '/app/settings/integrations',
      category: 'integrations',
      action: 'retry',
    })
    void router.invalidate()
  }

  const pageHeader = (
    <PageHeader
      title="Integrations"
      description="Connect your Google Workspace or Microsoft 365 account so tasks can show up on a calendar."
    />
  )

  if (isLoadingIntegrations) {
    return (
      <div className="space-y-6">
        {pageHeader}
        <Panel>
          <Skeleton className="h-8 w-1/3 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </Panel>
      </div>
    )
  }

  if (loadFailed) {
    return (
      <div className="space-y-6">
        {pageHeader}
        <StatusPanel
          variant="error"
          title="Could not load integrations"
          description="There was a problem retrieving integration settings. Check your connection and try again."
          action={{ label: 'Try again', onClick: handleIntegrationsRetry }}
        />
      </div>
    )
  }

  if (hasNoOrg || !orgContext) {
    return (
      <div className="space-y-6">
        {pageHeader}
        <Panel>
          <Alert tone="warning" role="alert">
            Select an organization before managing integrations.
          </Alert>
        </Panel>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {pageHeader}
      <FeatureGate feature="integrations_basic" org={orgContext}>
        <Panel>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryMetric
              label="Connected"
              value={connections.length}
              detail="Active account connections"
              tone={connections.length > 0 ? 'success' : 'neutral'}
            />
            <SummaryMetric label="Available" value="2" detail="Google and Microsoft" tone="brand" />
            <SummaryMetric
              label="Management"
              value={canManageIntegrations ? 'Enabled' : 'Read only'}
              detail="Based on your role"
            />
          </div>
          <p className="mt-2 text-sm text-text-secondary">
            Connect your Google Workspace or Microsoft 365 account so tasks can show up on a calendar. We encrypt your sign-in tokens before we store them.
          </p>
          {!canManageIntegrations && orgContext.plan ? (
            <p className="mt-3 text-sm text-text-muted">
              Only organization administrators can connect or revoke shared integrations.
            </p>
          ) : null}

          <GuidanceCallout
            title="Use clinic-approved accounts only"
            tone="warning"
            className="mt-5"
          >
            Use only Google Workspace or Microsoft 365 accounts your clinic has approved. PHIGuard never sends PHI to these services. Calendar updates can fail on their own without affecting your tasks.
          </GuidanceCallout>

          {error && (
            <Alert tone="danger" className="mt-4" role="alert">
              {error}
            </Alert>
          )}
          {notice && (
            <Alert tone="success" className="mt-4">
              {notice}
            </Alert>
          )}
        </Panel>

        <Panel>
          <PanelHeader title="Available integrations" />
          <div className="mt-4 space-y-4">
            {(['google', 'microsoft'] as const).map((provider) => (
              <div
                key={provider}
                className="flex items-center justify-between rounded-lg border border-border-muted p-4"
              >
                <div>
                  <p className="font-medium text-text-primary">{PROVIDER_LABELS[provider]}</p>
                  <p className="text-sm text-text-muted">
                    {connectedProviders.has(provider) ? 'Connected' : 'Not connected'}
                  </p>
                </div>
                {!connectedProviders.has(provider) && canManageIntegrations && (
                  <Button
                    type="button"
                    onClick={() => {
                      setCalendarComplianceAcknowledged(false)
                      setPendingConnectProvider(provider)
                      trackProductEvent('integration_connect_dialog_opened', {
                        route: '/app/settings/integrations',
                        provider,
                        can_manage: canManageIntegrations,
                      })
                    }}
                    disabled={connectingProvider === provider}
                    size="sm"
                  >
                    {connectingProvider === provider
                      ? 'Redirecting...'
                      : `Connect ${PROVIDER_LABELS[provider]}`}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Panel>

        <ConfirmActionDialog
          isOpen={pendingConnectProvider !== null}
          tone="warning"
          title="Confirm calendar compliance before connecting"
          description={
            <div className="space-y-3">
              <p>
                PHIGuard creates generic due-date reminders only. Your clinic is responsible for
                keeping PHI out of connected calendars and confirming the provider agreement covers
                this use.
              </p>
              <label className="flex items-start gap-3 rounded-md border border-border-muted bg-surface-50 p-3 text-sm leading-6 text-text-secondary">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-border-strong"
                  checked={calendarComplianceAcknowledged}
                  onChange={(event) => {
                    setCalendarComplianceAcknowledged(event.target.checked)
                    if (event.target.checked && pendingConnectProvider) {
                      trackProductEvent('integration_compliance_acknowledged', {
                        route: '/app/settings/integrations',
                        provider: pendingConnectProvider,
                      })
                    }
                  }}
                />
                <span>{CALENDAR_COMPLIANCE_ACKNOWLEDGMENT}</span>
              </label>
            </div>
          }
          confirmLabel={
            pendingConnectProvider
              ? `Connect ${PROVIDER_LABELS[pendingConnectProvider]}`
              : 'Connect integration'
          }
          cancelLabel="Cancel"
          isWorking={pendingConnectProvider ? connectingProvider === pendingConnectProvider : false}
          confirmDisabled={!calendarComplianceAcknowledged}
          onCancel={() => {
            if (pendingConnectProvider) {
              trackProductEvent('integration_connect_cancelled', {
                route: '/app/settings/integrations',
                provider: pendingConnectProvider,
              })
            }
            setPendingConnectProvider(null)
            setCalendarComplianceAcknowledged(false)
          }}
          onConfirm={() => {
            if (!pendingConnectProvider || !calendarComplianceAcknowledged) return
            const provider = pendingConnectProvider
            setPendingConnectProvider(null)
            void handleConnect(provider)
          }}
        />

        <Panel>
          <PanelHeader title={`Active connections (${connections.length})`} />
          {connections.length === 0 ? (
            <div className="mt-4">
              <StatusPanel
                variant="empty"
                title="No clinic-approved accounts connected yet"
                description="Connect a Google Workspace or Microsoft 365 account above to enable due-date reminders in your clinic calendar."
              />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {connections.map((connection) => {
                const statusBadgeClass =
                  connection.status === 'active'
                    ? 'bg-success-100 text-success-800'
                    : 'bg-danger-100 text-danger-800'
                return (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between rounded-lg border border-border-muted p-4"
                  >
                    <div>
                      <p className="font-medium text-text-primary">
                        {PROVIDER_LABELS[connection.provider] ?? connection.provider}
                      </p>
                      <p className="text-sm text-text-muted">{connection.accountEmail}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass}`}>
                          {connection.status}
                        </span>
                        <span className="text-xs text-text-disabled">
                          Connected{' '}
                          {formatDate(connection.createdAt, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    {canManageIntegrations ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPendingRevoke(connection)
                          trackProductEvent('integration_revoke_started', {
                            route: '/app/settings/integrations',
                            provider: connection.provider,
                            status: connection.status,
                          })
                        }}
                        disabled={revokingId === connection.id}
                        className="rounded-full border border-danger-200 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 disabled:opacity-50"
                      >
                        {revokingId === connection.id ? 'Revoking...' : 'Revoke'}
                      </button>
                    ) : (
                      <span className="rounded-md border border-border-muted px-3 py-2 text-sm text-text-muted">
                        Read only
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
        <ConfirmActionDialog
          isOpen={pendingRevoke !== null}
          tone="warning"
          title="Disconnect this integration?"
          description={
            pendingRevoke
              ? `PHIGuard will stop using the ${PROVIDER_LABELS[pendingRevoke.provider] ?? pendingRevoke.provider} connection for ${pendingRevoke.accountEmail}. You can reconnect it later if needed.`
              : ''
          }
          confirmLabel="Disconnect integration"
          isWorking={pendingRevoke ? revokingId === pendingRevoke.id : false}
          onCancel={() => setPendingRevoke(null)}
          onConfirm={() => {
            if (!pendingRevoke) return
            void handleRevoke(pendingRevoke.id).then(() => setPendingRevoke(null))
          }}
        />
      </FeatureGate>
    </div>
  )
}
