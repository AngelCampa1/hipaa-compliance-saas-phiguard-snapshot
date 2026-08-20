import * as React from 'react'
import { cn } from '../lib/cn'
import { Label } from './label'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, hint, id, containerClassName, ...props },
    ref,
  ) => {
    const reactId = React.useId()
    const inputId = id ?? reactId
    const describedBy =
      [error ? `${inputId}-error` : null, hint ? `${inputId}-hint` : null]
        .filter(Boolean)
        .join(' ') || undefined

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label ? <Label htmlFor={inputId}>{label}</Label> : null}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'flex h-10 w-full rounded-md border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-border-danger focus-visible:ring-danger-600'
              : 'border-border-strong focus-visible:ring-brand-600',
            className,
          )}
          {...props}
        />
        {error ? (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="text-xs text-text-danger"
          >
            {error}
          </p>
        ) : null}
        {hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)
Input.displayName = 'Input'

export const InputPrimitive = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-md border border-border-strong bg-surface-0 px-3 py-2',
      'text-sm text-text-primary placeholder:text-text-muted',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
      error && 'border-danger-600 focus-visible:ring-danger-600',
      className,
    )}
    aria-invalid={error || undefined}
    {...props}
  />
))
InputPrimitive.displayName = 'InputPrimitive'
