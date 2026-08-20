import * as React from 'react'
import { cn } from '../lib/cn'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  heading: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon, heading, description, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border-default bg-surface-50 px-6 py-12 text-center',
        className,
      )}
      {...props}
    >
      {icon ? (
        <div
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-100 text-text-muted"
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-text-primary">{heading}</h3>
      {description ? (
        <p className="max-w-md text-sm text-text-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  ),
)
EmptyState.displayName = 'EmptyState'
