import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@phiguard/ui'
import { BrandHeader } from '../components/brand-header'
import { trackPublicAuthEvent } from '../lib/product-analytics-browser'
import { getSessionFn } from '../lib/session'
import {
  acceptOrganizationInvitationFn,
  getInvitationPreviewFn,
} from '../server/organizations'

export const Route = createFileRoute('/accept-invite/$invitationId')({
  beforeLoad: async ({ params }) => {
    const invitationId = params.invitationId
    const [sessionResult, previewResult] = await Promise.allSettled([
      getSessionFn(),
      getInvitationPreviewFn({ data: { invitationId } }),
    ])

    const session = sessionResult.status === 'fulfilled' ? sessionResult.value : null
    const preview = previewResult.status === 'fulfilled' ? previewResult.value : null
    const invitedEmail = preview?.invitedEmail ?? null
    const invitationExpired = preview?.expired ?? false

    return {
      session,
      invitationId,
      invitedEmail,
      invitationExpired,
    }
  },
  component: AcceptInvitePage,
})

function AcceptInvitePage() {
  const navigate = useNavigate()
  const { invitationId, session, invitedEmail, invitationExpired } = Route.useRouteContext()
  const [error, setError] = useState<string | null>(null)
  const [isAccepting, setIsAccepting] = useState(false)

  const redirectTarget = `/accept-invite/${invitationId}`

  // A valid, pending invitation always resolves to an invited email via the
  // preview. No email means the link is not found, malformed, or already
  // consumed — there is nothing to accept, so we surface a clear message and
  // hide the action buttons instead of letting the user click into a raw error.
  const invitationUnavailable = !invitedEmail && !invitationExpired

  // Warn if the signed-in user email does not match the invited email.
  const emailMismatch =
    session &&
    invitedEmail &&
    session.user.email.toLowerCase() !== invitedEmail.toLowerCase()

  // Track focus return target for modal-like behavior
  const [hasMounted, setHasMounted] = useState(false)
  useEffect(() => {
    setHasMounted(true)
    trackPublicAuthEvent('invite_viewed', {
      route: redirectTarget,
      source: session ? 'email' : undefined,
      status: invitationExpired || emailMismatch ? 'failed' : 'attempted',
      reason: invitationExpired ? 'expired' : emailMismatch ? 'email_mismatch' : undefined,
    })
  }, [emailMismatch, invitationExpired, redirectTarget, session])

  const handleAccept = async () => {
    setIsAccepting(true)
    setError(null)
    trackPublicAuthEvent('invite_accept_started', {
      route: redirectTarget,
      source: 'email',
      action: 'accept_invite',
    })

    try {
      await acceptOrganizationInvitationFn({
        data: {
          invitationId,
        },
      })

      trackPublicAuthEvent('invite_accept_completed', {
        route: redirectTarget,
        destination_route: '/app/dashboard',
        source: 'email',
        status: 'succeeded',
        action: 'accept_invite',
      })
      await navigate({ to: '/app/dashboard', search: { locationId: undefined } })
    } catch (e) {
      trackPublicAuthEvent('invite_accept_failed', {
        route: redirectTarget,
        source: 'email',
        status: 'failed',
        reason: 'request_failed',
        action: 'accept_invite',
      })
      setError((e as Error).message)
    } finally {
      setIsAccepting(false)
    }
  }

  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center bg-surface-50 px-4">
      <BrandHeader />
      <div className="w-full max-w-md rounded-xl border border-border-default bg-surface-0 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-text-primary">Accept your invitation</h1>
        <p className="mt-3 text-sm text-text-secondary">
          Sign in with the invited email address to accept this invitation.
        </p>

        {invitedEmail && hasMounted ? (
          <p className="mt-4 rounded-lg border border-border-muted bg-surface-50 px-3 py-2 text-sm text-text-secondary">
            Invitation sent to <span className="font-medium text-text-primary">{invitedEmail}</span>
          </p>
        ) : null}

        {invitationExpired ? (
          <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700">
            This invitation has expired or already been used. Ask an admin to send a new one.
          </div>
        ) : null}

        {emailMismatch ? (
          <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700">
            You are signed in as <span className="font-medium">{session!.user.email}</span> but
            this invitation was sent to <span className="font-medium">{invitedEmail}</span>. Sign
            in with the invited email to accept.
          </div>
        ) : null}

        {invitationUnavailable ? (
          <div className="mt-4 rounded-xl border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700">
            This invitation link is invalid or has already been used. Ask an admin to send a new
            one.
          </div>
        ) : null}

        {error && (
          <div className="mt-4 rounded-xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
            {error}
          </div>
        )}

        {invitationUnavailable ? (
          <div className="mt-6">
            <Button asChild variant="outline" className="w-full min-h-11">
              <Link to="/login" search={{ redirect: undefined }}>
                Back to sign in
              </Link>
            </Button>
          </div>
        ) : session ? (
          <Button
            onClick={handleAccept}
            disabled={isAccepting || invitationExpired || !!emailMismatch}
            className="mt-6 w-full min-h-11"
          >
            {isAccepting ? 'Accepting invitation...' : 'Accept invitation'}
          </Button>
        ) : (
          <div className="mt-6 space-y-3">
            <Button asChild className="w-full min-h-11">
              <Link
                to="/login"
                search={{ redirect: redirectTarget }}
                onClick={() =>
                  trackPublicAuthEvent('invite_auth_redirect_clicked', {
                    route: redirectTarget,
                    destination_route: '/login',
                    source: 'email',
                  })
                }
              >
                Sign in to continue
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full min-h-11">
              <Link
                to="/signup"
                search={{ redirect: redirectTarget }}
                onClick={() =>
                  trackPublicAuthEvent('invite_signup_redirect_clicked', {
                    route: redirectTarget,
                    destination_route: '/signup',
                    source: 'email',
                  })
                }
              >
                Create an account
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
