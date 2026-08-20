import * as React from 'react'
import { cn } from '../lib/cn'

export interface SummaryMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: React.ReactNode
  detail?: React.ReactNode
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'brand'
}

const toneClass = {
  neutral: 'bg-surface-0 text-text-primary',
  success: 'bg-success-50 text-success-900',
  warning: 'bg-warning-50 text-warning-900',
  danger: 'bg-danger-50 text-danger-900',
  brand: 'bg-brand-50 text-brand-900',
} as const

export const SummaryMetric = React.forwardRef<HTMLDivElement, SummaryMetricProps>(
  ({ className, label, value, detail, tone = 'neutral', ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'min-w-0 rounded-lg border border-border-default p-4',
        toneClass[tone],
        className,
      )}
      {...props}
    >
      <p className="truncate text-xs font-semibold uppercase tracking-caps opacity-80">
        {label}
      </p>
      <p className="mt-2 break-words text-2xl font-semibold leading-none">
        {value}
      </p>
      {detail ? (
        <p className="mt-2 text-xs leading-5 opacity-80">{detail}</p>
      ) : null}
    </div>
  ),
)
SummaryMetric.displayName = 'SummaryMetric'

