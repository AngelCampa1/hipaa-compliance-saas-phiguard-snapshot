import * as React from 'react'
import { cn } from '../lib/cn'

const alertTone = {
  info: 'border-brand-200 bg-brand-50 text-brand-900',
  success: 'border-success-200 bg-success-50 text-success-900',
  warning: 'border-warning-300 bg-warning-50 text-warning-900',
  danger: 'border-danger-200 bg-danger-50 text-danger-900',
} as const

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: keyof typeof alertTone
  title?: React.ReactNode
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, tone = 'info', title, children, ...props }, ref) => (
    <div
      ref={ref}
      role={tone === 'danger' ? 'alert' : undefined}
      className={cn(
        'rounded-lg border px-4 py-3 text-sm leading-6',
        alertTone[tone],
        className,
      )}
      {...props}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={cn(title && 'mt-1')}>{children}</div> : null}
    </div>
  ),
)
Alert.displayName = 'Alert'
