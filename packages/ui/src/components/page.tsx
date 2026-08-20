import * as React from 'react'
import { cn } from '../lib/cn'

export const PageHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    eyebrow?: React.ReactNode
    title: React.ReactNode
    description?: React.ReactNode
    actions?: React.ReactNode
  }
>(({ className, eyebrow, title, description, actions, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mb-6 flex min-w-0 flex-col gap-4 md:flex-row md:items-start md:justify-between',
      className,
    )}
    {...props}
  >
    <div className="min-w-0 space-y-1">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-caps text-brand-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="break-words text-2xl font-semibold leading-tight text-text-primary">
        {title}
      </h1>
      {description ? (
        <p className="max-w-3xl text-sm leading-6 text-text-secondary">
          {description}
        </p>
      ) : null}
    </div>
    {actions ? (
      <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
        {actions}
      </div>
    ) : null}
  </div>
))
PageHeader.displayName = 'PageHeader'

export const Panel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <section
    ref={ref}
    className={cn(
      'rounded-xl border border-border-default bg-surface-0 p-5 shadow-sm md:p-6',
      className,
    )}
    {...props}
  />
))
Panel.displayName = 'Panel'

export const PanelHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: React.ReactNode
    description?: React.ReactNode
    actions?: React.ReactNode
  }
>(({ className, title, description, actions, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between',
      className,
    )}
    {...props}
  >
    <div className="min-w-0">
      <h2 className="break-words text-base font-semibold leading-tight text-text-primary">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm leading-6 text-text-muted">{description}</p>
      ) : null}
    </div>
    {actions ? <div className="shrink-0">{actions}</div> : null}
  </div>
))
PanelHeader.displayName = 'PanelHeader'

export const TableShell = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'w-full overflow-x-auto rounded-lg border border-border-default bg-surface-0',
      className,
    )}
    {...props}
  />
))
TableShell.displayName = 'TableShell'

