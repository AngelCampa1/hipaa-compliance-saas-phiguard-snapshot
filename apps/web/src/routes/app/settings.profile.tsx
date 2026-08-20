import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { AppRouteErrorBoundary } from '../../components/compliance-error-boundary'
import { getSessionFn } from '../../lib/session.js'
import {
  deleteAccountFn,
  updateDisplayNameFn,
  updateEmailFn,
  updatePasswordFn,
} from '../../server/profile'
import {
  Alert,
  Button,
  Input,
  Label,
  PageHeader,
  Panel,
  PanelHeader,
  Skeleton,
} from '@phiguard/ui'
import { getClientErrorMessage } from '../../lib/client-errors'
import { trackProductEvent } from '../../lib/product-analytics-browser'

function trackProfileActionFailed(action: string, reason = 'request_failed') {
  trackProductEvent('profile_action_failed', {
    route: '/app/settings/profile',
    feature: 'profile',
    action,
    reason,
  })
}

function trackProfileSectionStarted(action: string) {
  trackProductEvent('profile_section_started', {
    route: '/app/settings/profile',
    feature: 'profile',
    action,
  })
}

export const Route = createFileRoute('/app/settings/profile')({
  loader: async () => {
    const session = await getSessionFn()
    return { userName: session?.user?.name ?? '' }
  },
  component: ProfileSettingsPage,
  pendingComponent: ProfileSettingsSkeleton,
  errorComponent: AppRouteErrorBoundary,
})

function ProfileSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Panel>
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-20 w-full" />
      </Panel>
      <Panel>
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-20 w-full" />
      </Panel>
      <Panel>
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </Panel>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Display name section
// ---------------------------------------------------------------------------

function DisplayNameSection() {
  const { userName } = Route.useLoaderData()
  const [name, setName] = useState(userName)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    setError(null)
    setNotice(null)
    trackProfileSectionStarted('update_display_name')

    try {
      await updateDisplayNameFn({ data: { name: name.trim() } })
      trackProductEvent('profile_display_name_updated', {
        route: '/app/settings/profile',
        status: 'succeeded',
      })
      setNotice('Display name updated.')
      setName('')
    } catch (e) {
      trackProfileActionFailed('update_display_name')
      setError(
        getClientErrorMessage(e, {
          route: '/app/settings/profile',
          operation: 'updateDisplayName',
          fallbackMessage: 'Failed to update display name. Please try again.',
        }),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Panel>
      <PanelHeader title="Display name" />
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="display-name">New display name</Label>
          <Input
            id="display-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            maxLength={120}
            autoComplete="name"
          />
        </div>

        {error && (
          <Alert tone="danger" role="alert">
            {error}
          </Alert>
        )}
        {notice && <Alert tone="success" role="status">{notice}</Alert>}

        <Button type="submit" disabled={isSubmitting || !name.trim()}>
          {isSubmitting ? 'Saving…' : 'Save display name'}
        </Button>
      </form>
    </Panel>
  )
}

// ---------------------------------------------------------------------------
// Email section
// ---------------------------------------------------------------------------

function EmailSection() {
  const [newEmail, setNewEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!newEmail.trim() || !currentPassword) return

    setIsSubmitting(true)
    setError(null)
    setNotice(null)
    trackProfileSectionStarted('update_email')

    try {
      await updateEmailFn({ data: { newEmail: newEmail.trim(), currentPassword } })
      trackProductEvent('profile_email_change_requested', {
        route: '/app/settings/profile',
        status: 'verification_required',
      })
      setNotice(
        'Email change requested. Check your new inbox for a verification link before the change takes effect.',
      )
      setNewEmail('')
      setCurrentPassword('')
    } catch (e) {
      trackProfileActionFailed('update_email')
      setError(
        getClientErrorMessage(e, {
          route: '/app/settings/profile',
          operation: 'updateEmail',
          fallbackMessage: 'Failed to request email change. Please try again.',
        }),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit = newEmail.trim().length > 0 && currentPassword.length > 0

  return (
    <Panel>
      <PanelHeader title="Email address" />
      <p className="mt-1 text-sm text-text-muted">
        Changing your email requires verification. You will receive a link at your new address before
        the change takes effect.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="new-email">New email address</Label>
          <Input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new@clinic.com"
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email-current-password">Current password</Label>
          <Input
            id="email-current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Your current password"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <Alert tone="danger" role="alert">
            {error}
          </Alert>
        )}
        {notice && <Alert tone="success" role="status">{notice}</Alert>}

        <Button type="submit" disabled={isSubmitting || !canSubmit}>
          {isSubmitting ? 'Requesting change…' : 'Request email change'}
        </Button>
      </form>
    </Panel>
  )
}

// ---------------------------------------------------------------------------
// Password section
// ---------------------------------------------------------------------------

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const passwordsMatch = newPassword === confirmPassword
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    confirmPassword.length > 0 &&
    passwordsMatch

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)
    setNotice(null)
    trackProfileSectionStarted('update_password')

    try {
      await updatePasswordFn({ data: { currentPassword, newPassword, confirmPassword } })
      trackProductEvent('profile_password_updated', {
        route: '/app/settings/profile',
        status: 'succeeded',
      })
      setNotice('Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      trackProfileActionFailed('update_password')
      setError(
        getClientErrorMessage(e, {
          route: '/app/settings/profile',
          operation: 'updatePassword',
          fallbackMessage: 'Failed to update password. Please check your current password and try again.',
        }),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Panel>
      <PanelHeader title="Password" />
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Your current password"
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            minLength={8}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            autoComplete="new-password"
          />
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-xs text-danger-600" role="alert">
              Passwords do not match.
            </p>
          )}
        </div>

        {error && (
          <Alert tone="danger" role="alert">
            {error}
          </Alert>
        )}
        {notice && <Alert tone="success" role="status">{notice}</Alert>}

        <Button type="submit" disabled={isSubmitting || !canSubmit}>
          {isSubmitting ? 'Updating password…' : 'Update password'}
        </Button>
      </form>
    </Panel>
  )
}

// ---------------------------------------------------------------------------
// Account deletion section
// ---------------------------------------------------------------------------

export function AccountDeletionSection() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit = confirmation === 'DELETE' && !isSubmitting

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (confirmation !== 'DELETE') {
      trackProfileActionFailed('delete_account')
      setError('Type DELETE to confirm account deletion.')
      return
    }

    setIsSubmitting(true)
    trackProductEvent('account_deletion_started', {
      route: '/app/settings/profile',
      feature: 'profile',
      action: 'delete_account',
      status: password.length > 0 ? 'password_provided' : 'no_password',
    })

    try {
      await deleteAccountFn({
        data: {
          password: password.length > 0 ? password : undefined,
          confirmation,
        },
      })
      trackProductEvent('account_deletion_requested', {
        route: '/app/settings/profile',
        status: 'succeeded',
      })
      await navigate({ to: '/login', replace: true })
    } catch (e) {
      trackProfileActionFailed('delete_account')
      setError(
        getClientErrorMessage(e, {
          route: '/app/settings/profile',
          operation: 'deleteAccount',
          fallbackMessage: 'Failed to delete account. Please try again.',
        }),
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Panel>
      <PanelHeader title="Delete account" />
      <p className="mt-1 text-sm text-text-muted">
        This permanently removes your login and signs you out everywhere. Remove yourself from any organizations first. If your account is tied to a compliance record, contact support before you delete it.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="delete-account-password">Password</Label>
          <Input
            id="delete-account-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Required for password accounts"
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="delete-account-confirmation">Type DELETE to confirm</Label>
          <Input
            id="delete-account-confirmation"
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
          />
        </div>

        {error && (
          <Alert tone="danger" role="alert">
            {error}
          </Alert>
        )}

        <Button type="submit" variant="destructive" disabled={!canSubmit}>
          {isSubmitting ? 'Deleting account...' : 'Delete account'}
        </Button>
      </form>
    </Panel>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function ProfileSettingsPage() {
  useEffect(() => {
    trackProductEvent('profile_viewed', {
      route: '/app/settings/profile',
      feature: 'profile',
    })
  }, [])

  return (
    <div className="space-y-6">
      <Panel>
        <PageHeader
          title="Profile"
          description="Update your display name, email address, and password."
        />
      </Panel>

      <DisplayNameSection />
      <EmailSection />
      <PasswordSection />
      <AccountDeletionSection />
    </div>
  )
}
