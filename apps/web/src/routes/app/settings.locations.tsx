import { createFileRoute } from '@tanstack/react-router'
import { getMinimumPlanForFeatures, PLANS } from '@phiguard/billing'
import {
  Alert,
  Button,
  PageHeader,
  Panel,
  PanelHeader,
  Skeleton,
  StatusPanel,
  SummaryMetric,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@phiguard/ui'
import { useEffect, useState } from 'react'
import { getClientErrorMessage } from '../../lib/client-errors'
import { roleLabel } from '../../lib/roles.js'
import {
  createLocationFn,
  getLocationSettingsFn,
  updateLocationFn,
  updateLocationGrantsFn,
} from '../../server/location-settings'
import { trackProductEvent } from '../../lib/product-analytics-browser.js'

type LocationSettingsState = Awaited<ReturnType<typeof getLocationSettingsFn>>
type LocationSettingsLocation = LocationSettingsState['locations'][number]
type LocationSettingsMember = LocationSettingsState['members'][number]
const multiLocationMinimumPlan = PLANS[getMinimumPlanForFeatures(['multi_location_rollup'])].name

export const Route = createFileRoute('/app/settings/locations')({
  component: LocationSettingsPage,
})

function LocationSettingsPage() {
  const [locationName, setLocationName] = useState('')
  const [state, setState] = useState<LocationSettingsState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadFailed, setLoadFailed] = useState(false)
  const [draftNames, setDraftNames] = useState<Record<string, string>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [savingLocationId, setSavingLocationId] = useState<string | null>(null)
  const [savingMembershipId, setSavingMembershipId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  /** Per-row inline grant errors, keyed by membershipId. */
  const [grantErrors, setGrantErrors] = useState<Record<string, string>>({})

  const loadSettings = async () => {
    setLoadFailed(false)
    const result = await getLocationSettingsFn()
    setState(result)
    setDraftNames(
      Object.fromEntries(
        result.locations.map((location: LocationSettingsLocation) => [location.id, location.name]),
      ),
    )
  }

  useEffect(() => {
    loadSettings()
      .catch((loadError) => {
        setLoadFailed(true)
        trackProductEvent('location_action_failed', {
          route: '/app/settings/locations',
          operation: 'locations.load',
          error_type: 'client_error',
        })
        setError(
          getClientErrorMessage(loadError, {
            route: '/app/settings/locations',
            operation: 'locations.load',
            fallbackMessage: 'Unable to load location settings.',
          }),
        )
      })
      .finally(() => setIsLoading(false))
  }, [])

  const handleLocationSettingsRetry = () => {
    trackProductEvent('location_settings_retry_clicked', {
      route: '/app/settings/locations',
      category: 'locations',
      action: 'retry',
    })
    setIsLoading(true)
    loadSettings()
      .catch((loadError) => {
        setLoadFailed(true)
        trackProductEvent('location_action_failed', {
          route: '/app/settings/locations',
          operation: 'locations.load',
          error_type: 'client_error',
        })
        setError(
          getClientErrorMessage(loadError, {
            route: '/app/settings/locations',
            operation: 'locations.load',
            fallbackMessage: 'Unable to load location settings.',
          }),
        )
      })
      .finally(() => setIsLoading(false))
  }

  const handleCreateLocation = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setIsCreating(true)

    try {
      const nextState = await createLocationFn({
        data: {
          name: locationName,
        },
      })
      setLocationName('')
      setState(nextState)
      setDraftNames(
        Object.fromEntries(
          nextState.locations.map((location: LocationSettingsLocation) => [
            location.id,
            location.name,
          ]),
        ),
      )
      setNotice('Location created.')
      trackProductEvent('location_created', {
        route: '/app/settings/locations',
        count: nextState.locations.length,
      })
    } catch (createError) {
      trackProductEvent('location_action_failed', {
        route: '/app/settings/locations',
        operation: 'locations.create',
        error_type: 'client_error',
      })
      setError(
        getClientErrorMessage(createError, {
          route: '/app/settings/locations',
          operation: 'locations.create',
          fallbackMessage: 'Unable to create location.',
        }),
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleSaveLocation = async (locationId: string) => {
    setError(null)
    setNotice(null)
    setSavingLocationId(locationId)

    try {
      const nextState = await updateLocationFn({
        data: {
          locationId,
          name: draftNames[locationId]?.trim() || undefined,
        },
      })
      setState(nextState)
      setNotice('Location updated.')
      trackProductEvent('location_updated', {
        route: '/app/settings/locations',
      })
    } catch (saveError) {
      trackProductEvent('location_action_failed', {
        route: '/app/settings/locations',
        operation: 'locations.update_name',
        error_type: 'client_error',
      })
      setError(
        getClientErrorMessage(saveError, {
          route: '/app/settings/locations',
          operation: 'locations.update-name',
          fallbackMessage: 'Unable to save location.',
        }),
      )
    } finally {
      setSavingLocationId(null)
    }
  }

  const handleToggleLocationStatus = async (
    locationId: string,
    nextStatus: 'active' | 'inactive',
  ) => {
    setError(null)
    setNotice(null)
    setSavingLocationId(locationId)

    try {
      const nextState = await updateLocationFn({
        data: {
          locationId,
          status: nextStatus,
        },
      })
      setState(nextState)
      setNotice(nextStatus === 'active' ? 'Location reactivated.' : 'Location deactivated.')
      trackProductEvent('location_status_changed', {
        route: '/app/settings/locations',
        status: nextStatus,
      })
    } catch (saveError) {
      trackProductEvent('location_action_failed', {
        route: '/app/settings/locations',
        operation: 'locations.update_status',
        status: nextStatus,
        error_type: 'client_error',
      })
      setError(
        getClientErrorMessage(saveError, {
          route: '/app/settings/locations',
          operation: 'locations.update-status',
          fallbackMessage: 'Unable to update location status.',
        }),
      )
    } finally {
      setSavingLocationId(null)
    }
  }

  const handleGrantToggle = async (
    membershipId: string,
    locationId: string,
    checked: boolean,
  ) => {
    if (!state) {
      return
    }

    const member = state.members.find(
      (candidate: LocationSettingsMember) => candidate.membershipId === membershipId,
    )
    if (!member) {
      return
    }

    const nextLocationIds = checked
      ? Array.from(new Set([...member.locationIds, locationId]))
      : member.locationIds.filter((candidate) => candidate !== locationId)

    if (nextLocationIds.length === 0) {
      // Show inline error on the affected row rather than at the top of the page.
      trackProductEvent('location_grant_update_blocked', {
        route: '/app/settings/locations',
        operation: 'locations.update_grants',
        reason: 'zero_grants',
      })
      setGrantErrors((prev) => ({
        ...prev,
        [membershipId]: 'At least one location must remain assigned.',
      }))
      return
    }

    // Clear any prior inline error for this member.
    setGrantErrors((prev) => {
      const next = { ...prev }
      delete next[membershipId]
      return next
    })
    setError(null)
    setNotice(null)
    setSavingMembershipId(membershipId)

    try {
      const nextState = await updateLocationGrantsFn({
        data: {
          membershipId,
          locationIds: nextLocationIds,
        },
      })
      setState(nextState)
      setNotice('Location grants updated.')
      trackProductEvent('location_grants_updated', {
        route: '/app/settings/locations',
        count: nextLocationIds.length,
      })
    } catch (saveError) {
      trackProductEvent('location_action_failed', {
        route: '/app/settings/locations',
        operation: 'locations.update_grants',
        error_type: 'client_error',
      })
      setError(
        getClientErrorMessage(saveError, {
          route: '/app/settings/locations',
          operation: 'locations.update-grants',
          fallbackMessage: 'Unable to update location grants.',
        }),
      )
    } finally {
      setSavingMembershipId(null)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <Panel>
          <PageHeader
            className="mb-5"
            title="Locations"
            description={`Manage clinic locations for ${state?.organization.name ?? 'your organization'} and choose who can see each one.`}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryMetric
              label="Locations"
              value={state?.locations.length ?? 0}
              detail="Total locations"
              tone="brand"
            />
            <SummaryMetric
              label="Active"
              value={
                state?.locations.filter((location) => location.status === 'active').length ?? 0
              }
              detail="Available for work"
              tone="success"
            />
            <SummaryMetric
              label="Location-assigned staff"
              value={
                state?.members.filter(
                  (member) => member.role !== 'org_owner' && member.role !== 'org_admin',
                ).length ?? 0
              }
              detail="Have location access"
            />
          </div>

          {state && !state.canCreateAdditionalLocations && (
            <Alert tone="warning" className="mt-4">
              Multi-location management requires {multiLocationMinimumPlan} or higher. This organization can keep using
              its primary location, but adding more sites is gated until billing is upgraded.
            </Alert>
          )}

          <form onSubmit={handleCreateLocation} className="mt-6 flex flex-col gap-3 md:flex-row">
            <div className="flex-1">
              <label htmlFor="new-location-name" className="sr-only">
                New location name
              </label>
              <input
                id="new-location-name"
                type="text"
                value={locationName}
                onChange={(event) => setLocationName(event.target.value)}
                placeholder={
                  state?.canCreateAdditionalLocations
                    ? 'Satellite Clinic'
                    : 'Upgrade required to add locations'
                }
                disabled={!state?.canCreateAdditionalLocations}
                className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
              />
            </div>
            <Button
              type="submit"
              disabled={isCreating || !locationName.trim() || !state?.canCreateAdditionalLocations}
            >
              {isCreating ? 'Creating...' : 'Add location'}
            </Button>
          </form>

          {error && (
            <Alert tone="danger" className="mt-3" role="alert">
              {error}
            </Alert>
          )}

          {notice && <Alert tone="success" className="mt-3">{notice}</Alert>}
        </Panel>

        <Panel>
          <PanelHeader title={`Location directory (${state?.locations.length ?? 0})`} />
          <div className="mt-4 space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : loadFailed ? (
              <StatusPanel
                variant="error"
                title="Could not load locations"
                description="There was a problem retrieving location settings. Check your connection and try again."
                action={{ label: 'Try again', onClick: handleLocationSettingsRetry }}
              />
            ) : state?.locations.length === 0 ? (
              <StatusPanel
                variant="empty"
                title="No locations configured yet"
                description="Add your first clinic location using the form above. Each location becomes a site you can assign staff to and track compliance for separately."
              />
            ) : (
              state?.locations.map((location: LocationSettingsLocation) => {
                const locationInputId = `location-name-${location.id}`
                // Status chip: show Primary flag AND the actual status value.
                const statusLabel = `${location.isPrimary ? 'Primary · ' : ''}${location.status}`
                return (
                  <div key={location.id} className="rounded-lg border border-border-muted p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <div className="flex-1">
                        <label htmlFor={locationInputId} className="sr-only">
                          Location name for {location.name}
                        </label>
                        <input
                          id={locationInputId}
                          type="text"
                          value={draftNames[location.id] ?? location.name}
                          onChange={(event) =>
                            setDraftNames((current) => ({
                              ...current,
                              [location.id]: event.target.value,
                            }))
                          }
                          className="w-full rounded-md border border-border-strong px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
                          {statusLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSaveLocation(location.id)}
                          disabled={savingLocationId === location.id}
                          className="rounded-full border border-border-strong px-3 py-2 text-sm text-text-secondary hover:bg-background-subtle disabled:opacity-50"
                        >
                          Save
                        </button>
                        {!location.isPrimary && (
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleLocationStatus(
                                location.id,
                                location.status === 'active' ? 'inactive' : 'active',
                              )
                            }
                            disabled={savingLocationId === location.id}
                            className="rounded-full border border-border-strong px-3 py-2 text-sm text-text-secondary hover:bg-background-subtle disabled:opacity-50"
                          >
                            {location.status === 'active' ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Slug is auto-derived at creation and is immutable. */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="mt-2 cursor-help text-xs text-text-muted underline decoration-dotted underline-offset-2">
                          Slug: {location.slug}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        The slug is auto-derived at creation and cannot be changed. Use this value
                        when building any internal URLs that reference this location.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                )
              })
            )}
          </div>
        </Panel>

        <Panel>
          <PanelHeader title={`Location access (${state?.members.length ?? 0})`} />
          <div className="mt-4 space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </>
            ) : state?.members.length === 0 ? (
              <StatusPanel
                variant="empty"
                title="No location-assigned staff"
                description="Staff with location-limited roles appear here. Org owners and admins can see all locations and are not listed."
              />
            ) : (
              state?.members.map((member: LocationSettingsMember) => {
                const isOrgWide =
                  member.role === 'org_owner' ||
                  member.role === 'org_admin' ||
                  member.role === 'auditor'
                const memberGrantError = grantErrors[member.membershipId]
                const hasNoGrants =
                  !isOrgWide &&
                  state.locations.length > 0 &&
                  member.locationIds.length === 0
                return (
                  <div
                    key={member.membershipId}
                    className="rounded-lg border border-border-muted p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-text-primary">{member.name}</p>
                        <p className="text-sm text-text-muted">{member.email}</p>
                      </div>
                      <span className="rounded-full bg-surface-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
                        {roleLabel(member.role)}
                      </span>
                    </div>

                    {isOrgWide ? (
                      <p className="mt-3 text-sm text-text-muted">
                        This person's role gives them access to all locations.
                      </p>
                    ) : (
                      <>
                        {hasNoGrants && (
                          <p role="alert" className="mt-3 text-xs text-warning-700">
                            This staff member has no location access. Assign at least one location
                            below.
                          </p>
                        )}
                        {memberGrantError && (
                          <p role="alert" className="mt-2 text-xs text-danger-600">
                            {memberGrantError}
                          </p>
                        )}
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {state.locations.map((location: LocationSettingsLocation) => {
                            const checkboxId = `grant-${member.membershipId}-${location.id}`
                            return (
                              <label
                                key={location.id}
                                htmlFor={checkboxId}
                                className="flex items-center gap-3 rounded-md border border-border-default px-3 py-2 text-sm text-text-secondary"
                              >
                                <input
                                  id={checkboxId}
                                  type="checkbox"
                                  checked={member.locationIds.includes(location.id)}
                                  disabled={savingMembershipId === member.membershipId}
                                  onChange={(event) =>
                                    handleGrantToggle(
                                      member.membershipId,
                                      location.id,
                                      event.target.checked,
                                    )
                                  }
                                />
                                <span>{location.name}</span>
                              </label>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </Panel>
      </div>
    </TooltipProvider>
  )
}
