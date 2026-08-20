import { Link } from '@tanstack/react-router'
import { AlertTriangle, ChevronRight, CircleHelp, Info, Mail, MessageSquare, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@phiguard/ui'
import {
  HELP_CATEGORIES,
  SUPPORT_EMAIL,
  SUPPORT_PHI_WARNING,
  appPublicGuidanceCopy,
  getHelpTopic,
  type HelpTopic,
  type HelpTopicLink,
  type HelpTooltipContent,
  type RouteHelpContent,
} from '../lib/help-content'
import { trackProductEvent } from '../lib/product-analytics-browser'

type HelpLinkProps = {
  link: HelpTopicLink
  className?: string
}

function HelpLink({ link, className }: HelpLinkProps) {
  return (
    <Link
      to={link.to}
      search={(link.search ?? {}) as never}
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium text-text-link hover:underline',
        className,
      )}
    >
      {link.label}
      <ChevronRight className="h-3.5 w-3.5" />
    </Link>
  )
}

export function HelpTopicCard({ topic }: { topic: HelpTopic }) {
  const category = HELP_CATEGORIES.find((item) => item.id === topic.category)

  return (
    <Card className="transition hover:border-brand-300 hover:shadow-md">
      <CardContent className="flex h-full flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            {category?.label ?? topic.category}
          </span>
          <span className="text-xs text-text-muted">{topic.estimatedTime}</span>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-text-primary">{topic.title}</h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">{topic.summary}</p>
        <p className="mt-3 text-xs text-text-muted">For: {topic.audience}</p>
        <Link
          to="/app/help"
          search={{ topic: topic.id, category: topic.category, q: undefined }}
          className="mt-auto inline-flex items-center gap-1 pt-5 text-sm font-semibold text-brand-700 hover:underline"
        >
          Read steps
          <ChevronRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}

export function HelpArticle({ topic }: { topic: HelpTopic }) {
  return (
    <article className="rounded-xl border border-border-default bg-surface-0 p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          {topic.estimatedTime}
        </span>
        <span className="text-xs text-text-muted">For: {topic.audience}</span>
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-text-primary">{topic.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{topic.summary}</p>

      <ol className="mt-6 space-y-3">
        {topic.steps.map((step, index) => (
          <li key={step} className="flex gap-3 rounded-lg bg-surface-50 p-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-sm font-semibold text-text-inverse">
              {index + 1}
            </span>
            <span className="text-sm leading-6 text-text-secondary">{step}</span>
          </li>
        ))}
      </ol>

      {topic.relatedLinks.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {topic.relatedLinks.map((link) => (
            <HelpLink key={`${link.to}-${link.label}`} link={link} />
          ))}
        </div>
      )}

      {topic.supportCta && <SupportCallout className="mt-6" />}
    </article>
  )
}

export function SupportCallout({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-warning-200 bg-warning-50 p-4', className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-warning-900">Need a person to help?</p>
          <p className="mt-1 text-sm leading-6 text-warning-900">
            Email{' '}
            <a className="font-medium underline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
            . {SUPPORT_PHI_WARNING}
          </p>
        </div>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-warning-300 bg-surface-0 px-3 py-2 text-sm font-medium text-warning-900 hover:bg-warning-100"
        >
          <Mail className="h-4 w-4" />
          Email support
        </a>
      </div>
    </div>
  )
}

export function HelpTooltip({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <span className={cn('group relative inline-flex align-middle', className)}>
      <button
        type="button"
        aria-label={`Show help: ${label}`}
        title={`Help: ${label}`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-brand-700 transition hover:border-brand-300 hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-0 top-7 z-[600] hidden w-64 rounded-lg border border-border-default bg-surface-0 p-3 text-left text-xs leading-5 text-text-secondary shadow-lg group-focus-within:block group-hover:block sm:left-1/2 sm:-translate-x-1/2"
      >
        <span className="mb-1 block font-semibold text-text-primary">{label}</span>
        {children}
      </span>
    </span>
  )
}

export function InlineHelpLabel({
  label,
  help,
  htmlFor,
  className,
}: {
  label: string
  help: string
  htmlFor?: string
  className?: string
}) {
  // Keep the interactive help trigger OUTSIDE the <label>. A button nested in a
  // <label> leaks its accessible name into the field's name (e.g. the field
  // reads "Title Show help: Title") and makes clicking the help icon focus the
  // field. Rendering the tooltip as a sibling keeps the field name clean.
  const Text = htmlFor
    ? (
        <label htmlFor={htmlFor} className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )
    : <span className="text-sm font-medium text-text-primary">{label}</span>

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      {Text}
      <HelpTooltip label={label}>{help}</HelpTooltip>
    </span>
  )
}

export function GuidanceCallout({
  title,
  children,
  tone = 'brand',
  className,
}: {
  title: string
  children: React.ReactNode
  tone?: 'brand' | 'warning' | 'danger'
  className?: string
}) {
  const styles = {
    brand: 'border-brand-100 bg-brand-50 text-brand-900',
    warning: 'border-warning-200 bg-warning-50 text-warning-900',
    danger: 'border-danger-200 bg-danger-50 text-danger-800',
  }[tone]

  return (
    <aside className={cn('rounded-xl border p-4 text-sm leading-6', styles, className)}>
      <div className="flex items-start gap-3">
        {tone === 'brand' ? (
          <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        )}
        <div>
          <p className="font-semibold">{title}</p>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </aside>
  )
}

export function PageHelpPanel({ help, className }: { help: RouteHelpContent; className?: string }) {
  return (
    <GuidanceCallout title={help.title} className={className}>
      <p>{help.summary}</p>
      <p className="mt-2 font-medium">Best next step: {help.primaryAction}</p>
      {help.warnings?.map((warning) => (
        <p key={warning} className="mt-2 text-warning-900">
          {warning}
        </p>
      ))}
      {help.tooltips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {help.tooltips.slice(0, 4).map((tooltip) => (
            <HelpTooltip key={tooltip.label} label={tooltip.label}>
              {tooltip.body}
            </HelpTooltip>
          ))}
        </div>
      )}
    </GuidanceCallout>
  )
}

function HelpDrawerTopicLink({ topicId, onNavigate }: { topicId: string; onNavigate: () => void }) {
  const topic = getHelpTopic(topicId)
  if (!topic) return null

  return (
    <Link
      to="/app/help"
      search={{ topic: topic.id, category: topic.category, q: undefined }}
      onClick={onNavigate}
      className="rounded-lg border border-border-default bg-surface-0 p-3 text-sm text-text-primary transition hover:border-brand-300 hover:bg-brand-50"
    >
      <span className="font-medium">{topic.title}</span>
      <span className="mt-1 block text-xs leading-5 text-text-muted">{topic.summary}</span>
    </Link>
  )
}

function DrawerDefinition({ tooltip }: { tooltip: HelpTooltipContent }) {
  return (
    <div className="rounded-lg bg-surface-50 p-3">
      <p className="text-sm font-semibold text-text-primary">{tooltip.label}</p>
      <p className="mt-1 text-sm leading-6 text-text-secondary">{tooltip.body}</p>
    </div>
  )
}

export function HelpDrawer({
  isOpen,
  onClose,
  help,
}: {
  isOpen: boolean
  onClose: () => void
  help?: RouteHelpContent
}) {
  const fallbackTopicIds = ['first-day', 'contact-support']
  const relatedTopicIds = help?.relatedTopicIds ?? fallbackTopicIds
  const uniqueRelatedTopicIds = [...new Set(relatedTopicIds)]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogPortal>
        <DialogOverlay />
        <aside
          aria-labelledby="help-drawer-title"
          role="complementary"
          className="fixed right-0 top-0 z-[var(--phig-z-modal)] flex h-full w-full max-w-md flex-col border-l border-border-default bg-surface-0 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-border-default p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                Help and feedback
              </p>
              <h2 id="help-drawer-title" className="mt-1 text-xl font-semibold text-text-primary">
                {help?.title ?? 'PHIGuard help'}
              </h2>
            </div>
            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close help"
                className="rounded-full p-1 text-text-muted hover:bg-surface-100 hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogClose>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            <section>
              <h3 className="text-sm font-semibold text-text-primary">What this page is for</h3>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                {help?.summary ?? 'Use the guides below if anything here is unclear.'}
              </p>
              {help?.primaryAction && (
                <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm font-medium leading-6 text-brand-900">
                  Best next step: {help.primaryAction}
                </p>
              )}
            </section>

            {help?.warnings?.length ? (
              <section className="rounded-xl border border-warning-200 bg-warning-50 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-warning-900">
                  <AlertTriangle className="h-4 w-4" />
                  Be careful here
                </h3>
                <ul className="mt-2 space-y-2">
                  {help.warnings.map((warning) => (
                    <li key={warning} className="text-sm leading-6 text-warning-900">
                      {warning}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {help?.tooltips.length ? (
              <section>
                <h3 className="text-sm font-semibold text-text-primary">Helpful definitions</h3>
                <div className="mt-3 space-y-2">
                  {help.tooltips.map((tooltip) => (
                    <DrawerDefinition key={tooltip.label} tooltip={tooltip} />
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <h3 className="text-sm font-semibold text-text-primary">Related guides</h3>
              <div className="mt-3 grid gap-2">
                {uniqueRelatedTopicIds.map((topicId) => (
                  <HelpDrawerTopicLink key={topicId} topicId={topicId} onNavigate={onClose} />
                ))}
              </div>
            </section>

            <SupportCallout />
          </div>

          <div className="border-t border-border-default p-5">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=PHIGuard%20feedback%20or%20help`}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-brand-800"
            >
              <MessageSquare className="h-4 w-4" />
              Send feedback or ask for help
            </a>
            <p className="mt-2 text-xs leading-5 text-text-muted">{SUPPORT_PHI_WARNING}</p>
          </div>
        </aside>
      </DialogPortal>
    </Dialog>
  )
}

export function ConfirmActionDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Keep it as is',
  tone = 'danger',
  isWorking = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean
  title: string
  description: React.ReactNode
  confirmLabel: string
  cancelLabel?: string
  tone?: 'danger' | 'warning'
  isWorking?: boolean
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'rounded-full p-2',
                tone === 'danger' ? 'bg-danger-50 text-danger-700' : 'bg-warning-50 text-warning-800',
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-2">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isWorking}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isWorking || confirmDisabled}
            className={tone === 'danger' ? 'bg-danger-600 hover:bg-danger-700' : undefined}
          >
            {isWorking ? 'Working...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ContextualHelpPanel({
  title,
  description,
  topicId,
  links = [],
  className,
  storageKey,
}: {
  title: string
  description: string
  topicId?: string
  links?: HelpTopicLink[]
  className?: string
  storageKey?: string
}) {
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!storageKey) return
    setDismissed(window.localStorage.getItem(storageKey) === 'dismissed')
  }, [storageKey])

  if (storageKey && dismissed) return null

  const handleDismiss = () => {
    if (!storageKey) return
    setDismissed(true)
    window.localStorage.setItem(storageKey, 'dismissed')
  }

  return (
    <aside className={cn('rounded-xl border border-brand-100 bg-brand-50 p-4', className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-surface-0 p-2 text-brand-700">
          <CircleHelp className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {topicId && (
              <Link
                to="/app/help"
                search={{ topic: topicId, q: undefined, category: undefined }}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline"
              >
                Show step-by-step guide
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
            {links.map((link) => (
              <HelpLink key={`${link.to}-${link.label}`} link={link} />
            ))}
          </div>
        </div>
        {storageKey && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-1 text-brand-400 hover:bg-brand-100 hover:text-brand-700"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  )
}

export function FirstRunBanner({ organizationId }: { organizationId?: string }) {
  const storageKey = `phiguard:first-run-banner:v1:${organizationId ?? 'workspace'}`
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setDismissed(window.localStorage.getItem(storageKey) === 'dismissed')
  }, [storageKey])

  if (dismissed) return null

  const handleDismiss = () => {
    trackProductEvent('first_run_banner_dismissed', {
      route: '/app/dashboard',
    })
    setDismissed(true)
    window.localStorage.setItem(storageKey, 'dismissed')
  }

  const steps = appPublicGuidanceCopy.firstRun.steps

  return (
    <section className="rounded-xl border-2 border-brand-200 bg-surface-0 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">
            {appPublicGuidanceCopy.firstRun.eyebrow}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-text-primary">
            {appPublicGuidanceCopy.firstRun.heading}
          </h2>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss welcome guide"
          className="shrink-0 rounded-full p-1 text-text-muted hover:bg-surface-100 hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        {steps.map((step) => {
          const stepClassName = cn(
            'flex flex-1 items-start gap-3 rounded-lg border p-4 transition',
            step.active
              ? 'border-brand-300 bg-brand-50 hover:border-brand-400 hover:shadow-sm'
              : 'border-border-default bg-surface-50 opacity-60',
          )
          const stepContent = (
            <>
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  step.active ? 'bg-brand-700 text-text-inverse' : 'bg-surface-200 text-text-muted',
                )}
              >
                {step.number}
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">{step.title}</p>
                <p className="mt-0.5 text-xs text-text-secondary">{step.detail}</p>
              </div>
            </>
          )

          return step.active ? (
            <Link
              key={step.number}
              to={step.href as never}
              className={stepClassName}
              onClick={() =>
                trackProductEvent('first_run_step_clicked', {
                  route: '/app/dashboard',
                  destination_route: step.href,
                  step: step.number,
                })
              }
            >
              {stepContent}
            </Link>
          ) : (
            <div key={step.number} className={stepClassName} aria-disabled="true">
              {stepContent}
            </div>
          )
        })}
      </div>
    </section>
  )
}
