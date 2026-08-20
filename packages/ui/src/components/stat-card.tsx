import * as React from 'react'
import { cn } from '../lib/cn'

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: React.ReactNode
  trend?: string
  trendDirection?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      label,
      value,
      trend,
      trendDirection = 'neutral',
      icon,
      ...props
    },
    ref,
  ) => {
    const trendColor =
      trendDirection === 'up'
        ? 'text-success-600'
        : trendDirection === 'down'
          ? 'text-danger-600'
          : 'text-text-muted'

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-2 rounded-lg border border-border-default bg-surface-0 p-4 shadow-sm',
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {label}
          </span>
          {icon ? (
            <span aria-hidden="true" className="text-text-muted">
              {icon}
            </span>
          ) : null}
        </div>
        <div className="text-2xl font-semibold text-text-primary leading-tight">
          {value}
        </div>
        {trend ? (
          <span className={cn('text-xs font-medium', trendColor)}>{trend}</span>
        ) : null}
      </div>
    )
  },
)
StatCard.displayName = 'StatCard'
