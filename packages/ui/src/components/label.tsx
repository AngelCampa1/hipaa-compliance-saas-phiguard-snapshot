import * as React from 'react'
import { cn } from '../lib/cn'

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'text-sm font-medium text-text-primary leading-none',
        className,
      )}
      {...props}
    />
  ),
)
Label.displayName = 'Label'
