import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { authClient } from '@phiguard/auth/client'
import { Button, Input } from '@phiguard/ui'
import { BrandHeader } from '../components/brand-header'
import { trackPublicAuthEvent } from '../lib/product-analytics-browser'
import { getSafeRedirectPath } from '../lib/redirect'
import { recordFailedLoginAttemptFn } from '../server/auth-log.js'
import {
  getOrganizationNavigationFn,
  switchActiveOrganizationFn,
} from '../server/organizations.js'

export const Route = createFileRoute('/login')({
  validateSearch: z.object({
    redirect: z.string().optional(),
  }),
  component: LoginPage,
})

function LoginPage() {
  const { redirect } = Route.useSearch()
  const redirectPath = getSafeRedirectPath(redirect, '/app/dashboard')
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)
  const [isGooglePending, setIsGooglePending] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isHydrated) {
      return
    }

    setError(null)
    setIsPending(true)
    trackPublicAuthEvent('login_started', {
      route: '/login',
      destination_route: redirectPath,
      source: 'email',
    })

    const result = await authClient.signIn.email({ email, password })

    setIsPending(false)

    if (result.error) {
      await recordFailedLoginAttemptFn({
        data: {
          route: '/login',
          reason: 'invalid_credentials',
        },
      }).catch(() => undefined)
      trackPublicAuthEvent('login_failed', {
        route: '/login',
        source: 'email',
        reason: 'invalid_credentials',
      })
      setError(result.error.message ?? 'Sign-in failed. Please try again.')
      return
    }

    try {
      const navigation = await getOrganizationNavigationFn()
      if (
        !navigation.session.session.activeOrganizationId
        && navigation.organizations.length === 1
      ) {
        await switchActiveOrganizationFn({
          data: {
            organizationId: navigation.organizations[0]!.id,
          },
        })
      }
    } catch {
      // Let the authenticated app shell finish org hydration on redirect.
    }

    trackPublicAuthEvent('login_completed', {
      route: '/login',
      destination_route: redirectPath,
      source: 'email',
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await navigate({ to: redirectPath as any })
  }

  async function handleGoogleSignIn() {
    if (!isHydrated) {
      return
    }

    const origin = window.location.origin
    setGoogleError(null)
    setIsGooglePending(true)
    trackPublicAuthEvent('login_google_started', {
      route: '/login',
      destination_route: redirectPath,
      source: 'google',
      provider: 'google',
    })

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${origin}${redirectPath}`,
        newUserCallbackURL: `${origin}/app/onboarding`,
        errorCallbackURL: redirect
          ? `${origin}/login?redirect=${encodeURIComponent(redirectPath)}`
          : `${origin}/login`,
        requestSignUp: true,
      })

      if (result.data?.url) {
        window.location.href = result.data.url
        return
      }

      if (result.error) {
        trackPublicAuthEvent('login_google_failed', {
          route: '/login',
          source: 'google',
          provider: 'google',
          reason: 'google_error',
        })
        setGoogleError(result.error.message ?? 'Google sign-in failed. Please try again.')
        setIsGooglePending(false)
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await navigate({ to: redirectPath as any })
    } catch (e) {
      trackPublicAuthEvent('login_google_failed', {
        route: '/login',
        source: 'google',
        provider: 'google',
        reason: 'google_error',
      })
      setGoogleError((e as Error).message ?? 'Google sign-in failed. Please try again.')
      setIsGooglePending(false)
    }
  }

  return (
    <main id="main" className="min-h-screen flex flex-col items-center justify-center bg-surface-50 px-4">
      <BrandHeader />
      <div className="w-full max-w-md rounded-xl bg-surface-0 p-3 shadow-sm border border-border-default sm:p-8">
        <h1 className="mb-6 text-2xl font-semibold text-text-primary">Sign in</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email address"
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!isHydrated || isPending}
          />

          <div>
            <Input
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={!isHydrated || isPending}
            />
            <div className="mt-1 text-right">
              <Link
                to="/forgot-password"
                onClick={() =>
                  trackPublicAuthEvent('password_reset_link_clicked', {
                    route: '/login',
                    destination_route: '/forgot-password',
                    source: 'email',
                  })
                }
                className="inline-flex min-h-11 items-center text-xs text-text-secondary hover:text-text-primary"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger-700" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={!isHydrated || isPending}
            className="w-full min-h-11"
          >
            {isPending ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-4 text-sm text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            search={redirect ? { redirect: redirectPath } : {}}
            onClick={() =>
              trackPublicAuthEvent('signup_link_clicked', {
                route: '/login',
                destination_route: '/signup',
                source: 'email',
              })
            }
            className="inline-flex min-h-11 items-center text-brand-600 hover:underline"
          >
            Sign up
          </Link>
        </p>

        <div className="mt-6 border-t border-border-muted pt-6">
          <p className="mb-3 text-sm font-medium text-text-primary">Continue with Google</p>
          {googleError && (
            <p className="mb-3 text-sm text-danger-700" role="alert">
              {googleError}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={!isHydrated || isGooglePending}
            className="w-full min-h-11"
          >
            {isGooglePending ? 'Redirecting to Google...' : 'Continue with Google'}
          </Button>
        </div>
      </div>
    </main>
  )
}
