import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { resolveCommercialState } from '@phiguard/billing'
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  CheckSquare,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  CreditCard,
  FileText,
  History,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Plug,
  Plus,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react'
import { authClient } from '@phiguard/auth/client'
import { logger } from '@phiguard/audit'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  PhiguardLogo,
  cn,
} from '@phiguard/ui'
import {
  ensureAppSessionFn,
  getOrganizationNavigationFn,
  switchActiveOrganizationFn,
} from '../server/organizations'
import {
  isBillingRecoveryPath,
  requiresLegalReacceptanceRedirect,
  shouldRedirectReadyUserFromOnboarding,
} from '../lib/phase-two-flow'
import { normalizeProductAnalyticsRoute } from '../lib/product-analytics'
import { initProductAnalytics, trackProductEvent } from '../lib/product-analytics-browser'
import { LEGAL_ONBOARDING_REQUIRED_MESSAGE } from '../lib/legal-gate'
import { RouteErrorFallback } from '../components/error-fallback'
import { HelpDrawer, PageHelpPanel } from '../components/help-guidance'
import { SUPPORT_EMAIL, getRouteHelp } from '../lib/help-content'
import { NewTaskModal } from '../components/new-task-modal.js'
import { AiCsSupportWidget } from '../components/ai-cs-support-widget'
import { CrmFeedbackWidget } from '../components/crm-feedback-widget'
import { getAiCsAvailabilityFn } from '../server/ai-cs'

type OrganizationNavigation = Awaited<ReturnType<typeof getOrganizationNavigationFn>>
type NavigationOrganization = OrganizationNavigation['organizations'][number]

// Passkey/security-key enrollment is a built-but-dormant shell: the better-auth
// `passkey` plugin isn't wired yet (see apps/web/src/routes/app/settings.security-keys.tsx
// for the activation steps). Until it ships, don't advertise "Security keys" in the
// account menu — a primary-nav item that leads to a "coming soon" screen reads as
// unfinished. Flip this to true (and complete the wiring) to expose it again.
// The route stays reachable by direct URL for development.
const PASSKEY_ENROLLMENT_ENABLED = false

export const Route = createFileRoute('/app')({
  beforeLoad: async ({ location }) => {
    const access = await ensureAppSessionFn()

    if (access.status === 'unauthenticated') {
      const search =
        typeof location.search === 'string' ? location.search : buildSearchString(location.search)

      throw redirect({
        to: '/login',
        search: {
          redirect: `${location.pathname}${search}${location.hash}`,
        },
      })
    }

    if (access.status === 'needs-onboarding' && location.pathname !== '/app/onboarding') {
      throw redirect({ to: '/app/onboarding' })
    }

    if (access.status === 'ready' && access.commercial) {
      const commercialState = resolveCommercialState(access.commercial)

      if (
        (commercialState.requiresPlanSelection || commercialState.requiresTrialStart) &&
        location.pathname !== '/app/onboarding' &&
        !isBillingRecoveryPath(location.pathname)
      ) {
        throw redirect({ to: '/app/onboarding' })
      }

      if (commercialState.isHardLocked && !isBillingRecoveryPath(location.pathname)) {
        throw redirect({ to: '/app/billing' })
      }

      if (
        requiresLegalReacceptanceRedirect({
          legalCurrent: access.commercial.legalCurrent,
          pathname: location.pathname,
          search: location.search,
        })
      ) {
        throw redirect({ to: '/app/onboarding', search: { step: 2 } })
      }

      if (
        shouldRedirectReadyUserFromOnboarding({
          pathname: location.pathname,
          search: location.search,
        }) &&
        commercialState.hasProductAccess
      ) {
        throw redirect({
          to: '/app/dashboard',
          search: { locationId: undefined },
        })
      }
    }

    return {}
  },
  loader: async () => getAiCsAvailabilityFn(),
  component: AppLayout,
  errorComponent: RouteErrorFallback,
})

type IconComponent = typeof LayoutDashboard

type NavLinkProps = {
  to: string
  children: React.ReactNode
  search?: Record<string, unknown>
  icon?: IconComponent
  onClick?: () => void
  /**
   * When true, the link is only active on an exact path match. Use for section
   * "Overview" links whose path is a prefix of their siblings (e.g.
   * /app/compliance is a prefix of /app/compliance/checklists) so the parent
   * doesn't light up alongside the active child. Children keep prefix matching
   * so their own detail routes stay highlighted.
   */
  exact?: boolean
}

function NavLink({ to, children, search, icon: Icon, onClick, exact }: NavLinkProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const handleClick = () => {
    trackProductEvent('app_navigation_clicked', {
      route: pathname,
      destination_route: to,
      trigger: 'sidebar',
    })
    onClick?.()
  }

  return (
    <Link
      to={to}
      search={search as never}
      onClick={handleClick}
      activeOptions={exact ? { exact: true } : undefined}
      className="group flex items-center gap-3 rounded-full px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-100 hover:text-text-primary [&.active]:bg-brand-50 [&.active]:text-brand-700 [&.active]:font-medium"
    >
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      {children}
    </Link>
  )
}

function NavSection({
  label,
  children,
  collapsible = false,
  forceOpen = false,
}: {
  label: string
  children: React.ReactNode
  collapsible?: boolean
  forceOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(forceOpen)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  // When navigating to a child route, auto-expand
  useEffect(() => {
    if (forceOpen) setIsOpen(true)
  }, [forceOpen])
  const open = !collapsible || isOpen

  if (!collapsible) {
    return (
      <div className="flex flex-col gap-0.5">
        <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-text-muted">
          {label}
        </p>
        {children}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => {
          const nextOpen = !open
          trackProductEvent('app_nav_section_toggled', {
            route: pathname,
            action: label.toLowerCase().replaceAll(' ', '_'),
            status: nextOpen ? 'opened' : 'closed',
          })
          setIsOpen(nextOpen)
        }}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-text-muted hover:bg-surface-100 hover:text-text-primary"
      >
        <span>{label}</span>
        <ChevronRight
          className={cn('h-3.5 w-3.5 transition-transform duration-150', open && 'rotate-90')}
        />
      </button>
      {open && <div className="flex flex-col gap-0.5">{children}</div>}
    </div>
  )
}

type SidebarProps = {
  navState: OrganizationNavigation | null
  onSignOut: () => void
  activeOrganizationId?: string
  isSwitchingOrganization?: boolean
  onOrganizationChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  onNavigate?: () => void
  onClose?: () => void
}

function Sidebar({
  navState,
  onSignOut,
  activeOrganizationId,
  isSwitchingOrganization,
  onOrganizationChange,
  onNavigate,
  onClose,
}: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const complianceOpen = pathname.startsWith('/app/compliance') || pathname.startsWith('/app/soc2')
  const soc2Open = pathname.startsWith('/app/soc2')
  const insightsOpen =
    pathname.startsWith('/app/reports') ||
    pathname.startsWith('/app/audit') ||
    pathname.startsWith('/app/help')
  const settingsOpen = pathname.startsWith('/app/settings') || pathname.startsWith('/app/billing')

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-6">
      <div className="flex items-start justify-between gap-2 px-3">
        <div className="min-w-0">
          <Link
            to="/app/dashboard"
            search={{ locationId: undefined }}
            className="flex items-center gap-2"
            onClick={onNavigate}
          >
            <PhiguardLogo className="h-8" title="PHIGuard" />
          </Link>
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {navState?.activeOrganization?.name ?? '...'}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-text-secondary hover:text-text-primary md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {onOrganizationChange && (
        <div className="px-3 md:hidden">
          <label htmlFor="mobile-org-switcher" className="sr-only">
            Active organization
          </label>
          <select
            id="mobile-org-switcher"
            value={activeOrganizationId}
            onChange={onOrganizationChange}
            disabled={isSwitchingOrganization || !navState?.organizations?.length}
            className="w-full rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm text-text-secondary"
          >
            {navState === null && (
              <option disabled value="">
                Loading…
              </option>
            )}
            {navState?.organizations?.map((organization: NavigationOrganization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav aria-label="Primary">
        <NavSection label="Work">
          <NavLink
            to="/app/dashboard"
            search={{ locationId: undefined }}
            icon={LayoutDashboard}
            onClick={onNavigate}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/app/tasks"
            search={{ status: undefined, locationId: undefined }}
            icon={CheckSquare}
            onClick={onNavigate}
          >
            Tasks
          </NavLink>
        </NavSection>

        <NavSection label="Compliance" collapsible forceOpen={complianceOpen}>
          <NavLink to="/app/compliance" icon={Shield} onClick={onNavigate} exact>
            Overview
          </NavLink>
          <NavLink
            to="/app/compliance/checklists"
            search={{ locationId: undefined }}
            icon={ClipboardCheck}
            onClick={onNavigate}
          >
            Checklists
          </NavLink>
          <NavLink
            to="/app/compliance/program/policies"
            icon={FileText}
            onClick={onNavigate}
          >
            Policies
          </NavLink>
          <NavLink to="/app/compliance/program" onClick={onNavigate} exact>
            Program
          </NavLink>
          <NavLink to="/app/compliance/incidents" icon={AlertTriangle} onClick={onNavigate}>
            Incidents
          </NavLink>
          <NavSection label="SOC 2" collapsible forceOpen={soc2Open}>
            <NavLink to="/app/soc2" icon={BadgeCheck} onClick={onNavigate} exact>
              Overview
            </NavLink>
            <NavLink to="/app/soc2/controls" onClick={onNavigate}>
              Controls
            </NavLink>
            <NavLink to="/app/soc2/evidence" onClick={onNavigate}>
              Evidence
            </NavLink>
            <NavLink to="/app/soc2/auditor" onClick={onNavigate}>
              Auditor
            </NavLink>
            <NavLink to="/app/soc2/access-reviews" onClick={onNavigate}>
              Access Reviews
            </NavLink>
          </NavSection>
        </NavSection>

        <NavSection label="Insights" collapsible forceOpen={insightsOpen}>
          <NavLink to="/app/reports" icon={BarChart3} onClick={onNavigate}>
            Reports
          </NavLink>
          <NavLink to="/app/audit" icon={History} onClick={onNavigate}>
            Audit Log
          </NavLink>
          <NavLink to="/app/help" icon={CircleHelp} onClick={onNavigate}>
            Help
          </NavLink>
        </NavSection>

        <NavSection label="Settings" collapsible forceOpen={settingsOpen}>
          <NavLink to="/app/settings/members" icon={Users} onClick={onNavigate}>
            Members
          </NavLink>
          {navState?.locationAccess?.accessLevel === 'organization' && (
            <NavLink to="/app/settings/locations" icon={MapPin} onClick={onNavigate}>
              Locations
            </NavLink>
          )}
          <NavLink to="/app/settings/integrations" icon={Plug} onClick={onNavigate}>
            Integrations
          </NavLink>
          <NavLink to="/app/billing" icon={CreditCard} onClick={onNavigate}>
            Billing
          </NavLink>
        </NavSection>

        {navState?.isSystemAdmin && (
          <NavSection label="Admin">
            <NavLink to="/app/admin/partners" onClick={onNavigate}>
              Partners
            </NavLink>
          </NavSection>
        )}
      </nav>

      <div className="mt-auto border-t border-border-muted px-3 pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              onClick={() =>
                trackProductEvent('app_account_menu_opened', {
                  route: pathname,
                  trigger: 'sidebar',
                })
              }
              className="flex w-full items-center gap-2 rounded-full px-2 py-2 text-sm text-text-secondary hover:bg-surface-100 hover:text-text-primary"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {(navState?.session?.user?.name ?? navState?.session?.user?.email ?? '?')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <span className="min-w-0 truncate text-left">
                {navState?.session?.user?.name ?? navState?.session?.user?.email ?? 'Account'}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem asChild className="cursor-pointer text-text-primary">
              <Link
                to="/app/settings/profile"
                onClick={() =>
                  trackProductEvent('app_account_action_clicked', {
                    route: pathname,
                    destination_route: '/app/settings/profile',
                    action: 'profile',
                  })
                }
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            {PASSKEY_ENROLLMENT_ENABLED ? (
              <DropdownMenuItem asChild className="cursor-pointer text-text-primary">
                <Link
                  to="/app/settings/security-keys"
                  onClick={() =>
                    trackProductEvent('app_account_action_clicked', {
                      route: pathname,
                      destination_route: '/app/settings/security-keys',
                      action: 'security_keys',
                    })
                  }
                >
                  <KeyRound className="h-4 w-4" />
                  Security keys
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                trackProductEvent('app_account_action_clicked', {
                  route: pathname,
                  action: 'sign_out',
                })
                onSignOut()
              }}
              className="cursor-pointer text-text-primary"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenuSeparator className="my-2" />
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          onClick={() =>
            trackProductEvent('app_support_link_clicked', {
              route: pathname,
              action: 'contact_support',
            })
          }
          className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary"
        >
          <CircleHelp className="h-3.5 w-3.5" /> Contact support
        </a>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          onClick={() =>
            trackProductEvent('app_support_link_clicked', {
              route: pathname,
              action: 'security_issue',
            })
          }
          className="mt-2 flex items-center gap-2 text-xs text-text-muted hover:text-text-primary"
        >
          <Shield className="h-3.5 w-3.5" /> Report a security issue
        </a>
      </div>
    </div>
  )
}

function AppLayout() {
  const { aiCsConfigured } = Route.useLoaderData()
  const navigate = useNavigate()
  const [navState, setNavState] = useState<OrganizationNavigation | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [legalGateMessage, setLegalGateMessage] = useState<string | null>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null)
  const mobileNavRef = useRef<HTMLDivElement | null>(null)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const sessionStartRouteRef = useRef(normalizeProductAnalyticsRoute(pathname))
  const isOnboardingRoute = pathname === '/app/onboarding'
  const routeHelp = getRouteHelp(pathname)
  const activeOrganizationId = navState?.session?.session?.activeOrganizationId ?? ''
  const analyticsOrgId = navState?.analyticsContext?.organization.id

  useEffect(() => {
    let isCancelled = false

    async function loadNavigation() {
      try {
        const navigation = await getOrganizationNavigationFn()

        if (
          !navigation.session?.session?.activeOrganizationId &&
          navigation.organizations.length === 1
        ) {
          await switchActiveOrganizationFn({
            data: {
              organizationId: navigation.organizations[0]!.id,
            },
          })

          const refreshedNavigation = await getOrganizationNavigationFn()
          if (!isCancelled) {
            setNavState(refreshedNavigation)
          }
          return
        }

        if (!isCancelled) {
          setNavState(navigation)
        }
      } catch (err) {
        logger.safe.error({ err }, 'loadNavigation failed')
        if (!isCancelled) {
          setNavState(null)
        }
      }
    }

    void loadNavigation()

    return () => {
      isCancelled = true
    }
  }, [])

  useEffect(() => {
    if (!navState?.analyticsContext) return

    const analytics = initProductAnalytics(navState.analyticsContext)
    void analytics
      ?.capture('app_session_started', {
        route: sessionStartRouteRef.current,
        role: navState.session.organization?.role,
      })
      .catch(() => undefined)
  }, [analyticsOrgId, navState?.analyticsContext, navState?.session.organization?.role])

  useEffect(() => {
    if (!navState?.analyticsContext) return

    const route = normalizeProductAnalyticsRoute(pathname)
    const analytics = initProductAnalytics(navState.analyticsContext)
    void analytics
      ?.capture('app_page_viewed', {
        route,
        role: navState.session.organization?.role,
      })
      .catch(() => undefined)
  }, [analyticsOrgId, navState?.analyticsContext, navState?.session.organization?.role, pathname])

  useEffect(() => {
    if (!navState?.analyticsContext || pathname !== '/app/dashboard') return

    trackProductEvent('dashboard_viewed', {
      route: normalizeProductAnalyticsRoute(pathname),
      role: navState.session.organization?.role,
    })
  }, [navState?.analyticsContext, pathname])

  useEffect(() => {
    if (!isOnboardingRoute) {
      setLegalGateMessage(null)
    }
  }, [isOnboardingRoute])

  const handleOrganizationChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const organizationId = event.target.value
    if (!organizationId) {
      return
    }

    setIsSwitching(true)
    try {
      await switchActiveOrganizationFn({ data: { organizationId } })
      const refreshed = await getOrganizationNavigationFn()
      setNavState(refreshed)
      await navigate({
        to: '/app/dashboard',
        search: { locationId: undefined },
      })
      trackProductEvent('app_organization_switched', {
        route: pathname,
        destination_route: '/app/dashboard',
        trigger: 'organization_switcher',
      })
    } finally {
      setIsSwitching(false)
    }
  }

  const handleMobileOrganizationChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    await handleOrganizationChange(event)
    closeMobileNav()
  }

  const handleSignOut = async () => {
    await authClient.signOut()
    await navigate({ to: '/login' })
  }

  const closeMobileNav = () => setIsMobileNavOpen(false)

  const handleNewTaskClick = () => {
    if (isOnboardingRoute) {
      setLegalGateMessage(LEGAL_ONBOARDING_REQUIRED_MESSAGE)
      trackProductEvent('app_action_blocked', {
        route: pathname,
        action: 'new_task',
        reason: 'legal_onboarding_required',
      })
      return
    }

    setLegalGateMessage(null)
    trackProductEvent('app_task_create_opened', {
      route: pathname,
      trigger: 'header',
    })
    setIsTaskModalOpen(true)
  }

  useEffect(() => {
    if (!isMobileNavOpen) {
      return
    }

    // Guard: mobileNavRef.current may be null if nav data hasn't loaded yet.
    // Fall back to focusing the dialog container itself (tabIndex={-1}) so
    // focus always moves inside the nav when it opens.
    const container = mobileNavRef.current
    if (!container) {
      return
    }

    const firstFocusable = container.querySelector<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
    )
    ;(firstFocusable ?? container).focus()

    return () => {
      mobileMenuButtonRef.current?.focus()
    }
  }, [isMobileNavOpen])

  const handleMobileNavKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMobileNav()
      return
    }

    if (event.key !== 'Tab') {
      return
    }

    const focusable = Array.from(
      mobileNavRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('aria-hidden'))

    if (focusable.length === 0) {
      event.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      {/* Skip-link for keyboard / screen-reader users */}
      <a className="sr-only focus:not-sr-only" href="#main">
        Skip to main content
      </a>

      <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-border-default md:bg-surface-0">
        <Sidebar navState={navState} onSignOut={handleSignOut} />
      </aside>

      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-900/40 md:hidden"
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}
      {isMobileNavOpen && (
        <div
          id="mobile-nav"
          ref={mobileNavRef}
          tabIndex={-1}
          className="fixed inset-y-0 left-0 z-50 w-64 bg-surface-0 shadow-xl md:hidden"
          onKeyDown={handleMobileNavKeyDown}
          role="dialog"
          aria-label="Navigation"
          aria-modal="true"
        >
          <Sidebar
            navState={navState}
            onSignOut={handleSignOut}
            activeOrganizationId={activeOrganizationId}
            isSwitchingOrganization={isSwitching}
            onOrganizationChange={handleMobileOrganizationChange}
            onNavigate={closeMobileNav}
            onClose={closeMobileNav}
          />
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header
          role="banner"
          className="flex h-14 items-center justify-between gap-4 border-b border-border-default bg-surface-0 px-4"
        >
          <button
            ref={mobileMenuButtonRef}
            type="button"
            className="rounded-full p-2 text-text-secondary hover:text-text-primary md:hidden"
            onClick={() => {
              trackProductEvent('app_navigation_clicked', {
                route: pathname,
                trigger: 'mobile_menu',
              })
              setIsMobileNavOpen(true)
            }}
            aria-label="Open navigation"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-nav"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/app/dashboard" search={{ locationId: undefined }} className="md:hidden">
            <PhiguardLogo className="h-8" title="PHIGuard" />
          </Link>
          <div className="flex-1 md:flex-none" />
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                trackProductEvent('app_help_opened', {
                  route: pathname,
                  trigger: 'header_help',
                })
                setIsHelpOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
              aria-label="Open page help and feedback"
            >
              <CircleHelp className="h-4 w-4" />
              <span className="hidden sm:inline">Help</span>
            </button>
            <button
              type="button"
              onClick={handleNewTaskClick}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-700 px-3 py-1.5 text-sm font-semibold text-text-inverse transition hover:bg-brand-800"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New task</span>
            </button>
            <label htmlFor="org-switcher" className="sr-only">
              Active organization
            </label>
            <select
              id="org-switcher"
              value={activeOrganizationId}
              onChange={handleOrganizationChange}
              disabled={isSwitching || !navState?.organizations?.length}
              className="hidden max-w-48 truncate rounded-md border border-border-default bg-surface-0 px-3 py-2 text-sm text-text-secondary md:block xl:max-w-64"
            >
              {navState === null && (
                <option disabled value="">
                  Loading…
                </option>
              )}
              {navState?.organizations?.map((organization: NavigationOrganization) => (
                <option key={organization.id} value={organization.id}>
                  {organization.name}
                </option>
              ))}
            </select>
          </div>
        </header>

        <main id="main" className="flex-1 overflow-auto p-6 md:p-8">
          {legalGateMessage && (
            <div
              role="alert"
              className="mb-6 rounded-md border border-warning-300 bg-warning-50 px-4 py-3 text-sm font-medium text-warning-900"
            >
              {legalGateMessage}
            </div>
          )}
          {routeHelp && pathname !== '/app/help' && (
            <PageHelpPanel help={routeHelp} className="mb-6" />
          )}
          <Outlet />
        </main>
      </div>
      <NewTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <HelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} help={routeHelp} />
      {aiCsConfigured && !isOnboardingRoute && (
        <AiCsSupportWidget userId={navState?.session?.user?.id} currentPath={pathname} />
      )}
      <CrmFeedbackWidget />
    </div>
  )
}

function buildSearchString(search: Record<string, unknown> | undefined) {
  if (!search) {
    return ''
  }

  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(search)) {
    if (value == null) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, String(item))
      }
      continue
    }

    params.set(key, String(value))
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}
