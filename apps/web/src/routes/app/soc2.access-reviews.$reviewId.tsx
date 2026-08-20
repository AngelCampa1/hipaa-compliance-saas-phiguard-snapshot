import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { Alert, Badge, Button, EmptyState, PageHeader, Panel, SummaryMetric } from '@phiguard/ui'
import {
  closeAccessReviewFn,
  listAccessReviewItemsFn,
  recordDecisionFn,
} from '../../server/soc2.js'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary'
import { trackProductEvent } from '../../lib/product-analytics-browser.js'
import { ROLE_LABELS } from '../../lib/roles.js'

export const Route = createFileRoute('/app/soc2/access-reviews/$reviewId')({
  loader: async ({ params }) => {
    return listAccessReviewItemsFn({ data: { reviewId: params.reviewId } })
  },
  component: AccessReviewDetailPage,
  errorComponent: AppRouteErrorBoundary,
})

const DECISION_LABELS: Record<string, string> = {
  keep: 'Keep',
  revoke: 'Revoke',
  change_role: 'Change Role',
}

const DECISION_BADGE_VARIANT: Record<string, 'success' | 'danger' | 'warning' | 'default'> = {
  keep: 'success',
  revoke: 'danger',
  change_role: 'warning',
}

// Role display labels come from the shared `ROLE_LABELS` map (lib/roles.ts) so
// access reviews speak the same language as Members/Locations instead of keeping
// a divergent local copy. The shared map also includes `org_owner`, which is a
// harmless superset for the access-review roles below.
const ROLE_OPTIONS = ['org_admin', 'auditor', 'location_manager', 'location_staff'] as const
type TargetRole = (typeof ROLE_OPTIONS)[number]

function AccessReviewDetailPage() {
  const { items, canAdmin } = Route.useLoaderData()
  type AccessReviewItem = (typeof items)[number]
  const { reviewId } = Route.useParams()
  const router = useRouter()

  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [deciding, setDeciding] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [targetRoles, setTargetRoles] = useState<Record<string, TargetRole>>({})
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({})

  const allDecided = items.every((item: AccessReviewItem) => item.decision != null)
  const undecidedCount = items.filter((item: AccessReviewItem) => item.decision == null).length
  const revokeCount = items.filter((item: AccessReviewItem) => item.decision === 'revoke').length
  const changeRoleCount = items.filter(
    (item: AccessReviewItem) => item.decision === 'change_role',
  ).length

  const handleDecision = async (itemId: string, decision: 'keep' | 'revoke' | 'change_role') => {
    setError(null)
    setDeciding(itemId)
    try {
      await recordDecisionFn({
        data: {
          reviewId,
          itemId,
          decision,
          targetRole: decision === 'change_role' ? targetRoles[itemId] : undefined,
          notes: decisionNotes[itemId] ?? '',
        },
      })
      trackProductEvent('access_review_decision_recorded', {
        route: '/app/soc2/access-reviews/$reviewId',
        action: decision,
        target_role: decision === 'change_role' ? targetRoles[itemId] : undefined,
      })
      const noticeText =
        decision === 'change_role'
          ? `Decision recorded and role changed to ${ROLE_LABELS[targetRoles[itemId]]}.`
          : `Decision recorded: ${DECISION_LABELS[decision]}`
      setNotice(noticeText)
      await router.invalidate()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setDeciding(null)
    }
  }

  const handleClose = async () => {
    setError(null)
    setClosing(true)
    try {
      await closeAccessReviewFn({ data: { reviewId } })
      trackProductEvent('access_review_closed', {
        route: '/app/soc2/access-reviews/$reviewId',
        status: 'closed',
        count: items.length,
      })
      setNotice('Review closed.')
      await router.invalidate()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <nav className="mb-4 text-sm">
        <Link to="/app/soc2/access-reviews" search={{ status: undefined, sort: undefined, dir: undefined }} className="text-text-link">
          Back to Access Reviews
        </Link>
      </nav>

      <PageHeader
        title="Access Review"
        description={
          undecidedCount > 0
            ? `${undecidedCount} member${undecidedCount !== 1 ? 's' : ''} still ${undecidedCount !== 1 ? 'need' : 'needs'} a decision.`
            : 'All members have been reviewed.'
        }
        actions={
          canAdmin && allDecided ? (
            <Button onClick={handleClose} disabled={closing} size="sm">
              {closing ? 'Closing...' : 'Close Review'}
            </Button>
          ) : null
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <SummaryMetric label="Members" value={items.length} detail="In review scope" />
        <SummaryMetric
          label="Undecided"
          value={undecidedCount}
          detail="Needs decision"
          tone={undecidedCount > 0 ? 'warning' : 'success'}
        />
        <SummaryMetric
          label="Revoke"
          value={revokeCount}
          detail="Access revoked"
          tone={revokeCount > 0 ? 'danger' : 'neutral'}
        />
        <SummaryMetric
          label="Role changes"
          value={changeRoleCount}
          detail="Role changed in review"
          tone={changeRoleCount > 0 ? 'warning' : 'neutral'}
        />
      </div>

      {!canAdmin ? (
        <Alert tone="info" title="Read-only view" className="mb-4">
          You can see decisions here. Only administrators can record changes or close this review.
        </Alert>
      ) : null}
      {error ? (
        <Alert tone="danger" className="mb-4">
          {error}
        </Alert>
      ) : null}
      {notice ? (
        <Alert tone="success" className="mb-4">
          {notice}
        </Alert>
      ) : null}

      {items.length === 0 ? (
        <EmptyState
          heading="No members in this review"
          description="This review has no members. Check your membership data before closing the audit record."
        />
      ) : (
        <div className="grid gap-3">
          {items.map((item: AccessReviewItem) => {
            const noteText = decisionNotes[item.id] ?? ''

            return (
              <Panel key={item.id} className="p-4 md:p-4">
                <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="break-words font-medium text-text-primary">
                      {item.memberName ?? item.memberEmail ?? 'Unknown member'}
                    </p>
                    {item.memberEmail && item.memberEmail !== item.memberName ? (
                      <p className="mt-0.5 break-all text-xs text-text-muted">{item.memberEmail}</p>
                    ) : null}
                    <p className="mt-0.5 break-words text-xs text-text-muted">
                      Role:{' '}
                      {item.memberRole
                        ? (ROLE_LABELS[item.memberRole] ?? item.memberRole)
                        : 'Unknown'}
                    </p>
                    {!item.memberName && !item.memberEmail ? (
                      <p className="mt-0.5 break-all text-xs text-text-muted">
                        User ID: {item.memberUserId ?? item.membershipId}
                      </p>
                    ) : null}
                    {item.notes ? (
                      <p className="mt-2 max-w-2xl break-words text-xs text-text-muted">
                        Reviewer notes: {item.notes}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-96 lg:items-end">
                    {!item.decision && canAdmin ? (
                      <label
                        className="w-full text-xs font-medium text-text-muted lg:w-96"
                        htmlFor={`decision-notes-${item.id}`}
                      >
                        Reviewer notes
                        <textarea
                          id={`decision-notes-${item.id}`}
                          value={noteText}
                          onChange={(event) =>
                            setDecisionNotes((prev) => ({
                              ...prev,
                              [item.id]: event.target.value,
                            }))
                          }
                          className="mt-1 min-h-20 w-full rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm font-normal text-text-primary"
                          placeholder="Add notes to explain a revoke or role-change decision."
                          disabled={deciding === item.id}
                        />
                      </label>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      {item.decision ? (
                        <Badge variant={DECISION_BADGE_VARIANT[item.decision] ?? 'default'}>
                          {DECISION_LABELS[item.decision] ?? item.decision}
                        </Badge>
                      ) : canAdmin ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDecision(item.id, 'keep')}
                            disabled={deciding === item.id}
                          >
                            Keep
                          </Button>
                          {item.memberRole !== 'org_owner' ? (
                            <label className="sr-only" htmlFor={`target-role-${item.id}`}>
                              Target role
                            </label>
                          ) : null}
                          {item.memberRole !== 'org_owner' ? (
                            <select
                              id={`target-role-${item.id}`}
                              value={targetRoles[item.id] ?? ''}
                              onChange={(event) =>
                                setTargetRoles((prev) => ({
                                  ...prev,
                                  [item.id]: event.target.value as TargetRole,
                                }))
                              }
                              className="h-9 rounded-md border border-border-default bg-surface-0 px-2 text-sm text-text-primary"
                              disabled={deciding === item.id}
                            >
                              <option value="" disabled>
                                New role
                              </option>
                              {ROLE_OPTIONS.filter((role) => role !== item.memberRole).map(
                                (role) => (
                                  <option key={role} value={role}>
                                    {ROLE_LABELS[role]}
                                  </option>
                                ),
                              )}
                            </select>
                          ) : null}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDecision(item.id, 'change_role')}
                            disabled={
                              deciding === item.id ||
                              item.memberRole === 'org_owner' ||
                              !targetRoles[item.id] ||
                              !noteText.trim()
                            }
                          >
                            Change Role
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDecision(item.id, 'revoke')}
                            disabled={
                              deciding === item.id ||
                              item.memberRole === 'org_owner' ||
                              !noteText.trim()
                            }
                          >
                            Revoke
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-text-disabled">Pending</span>
                      )}
                    </div>
                  </div>
                </div>
              </Panel>
            )
          })}
        </div>
      )}
    </div>
  )
}
