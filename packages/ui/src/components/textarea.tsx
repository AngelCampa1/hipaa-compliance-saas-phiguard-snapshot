import * as React from 'react'
import { cn } from '../lib/cn'
import { Label } from './label'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  containerClassName?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, hint, id, containerClassName, ...props },
    ref,
  ) => {
    const reactId = React.useId()
    const textareaId = id ?? reactId
    const describedBy =
      [
        error ? `${textareaId}-error` : null,
        hint ? `${textareaId}-hint` : null,
      ]
        .filter(Boolean)
        .join(' ') || undefined

    return (
      <div className={cn('flex flex-col gap-1.5', containerClassName)}>
        {label ? <Label htmlFor={textareaId}>{label}</Label> : null}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'flex min-h-20 w-full rounded-md border bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-border-danger focus-visible:ring-danger-600'
              : 'border-border-strong focus-visible:ring-brand-600',
            className,
          )}
          {...props}
        />
        {error ? (
          <p
            id={`${textareaId}-error`}
            role="alert"
            className="text-xs text-text-danger"
          >
            {error}
          </p>
        ) : null}
        {hint ? (
          <p id={`${textareaId}-hint`} className="text-xs text-text-muted">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'

export const TextareaPrimitive = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }
>(({ className, error, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-20 w-full rounded-md border border-border-default bg-surface-0 px-3 py-2',
      'text-sm text-text-primary placeholder:text-text-muted',
      'focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:opacity-50',
      error && 'border-danger-600 focus:ring-danger-600',
      className,
    )}
    aria-invalid={error || undefined}
    {...props}
  />
))
TextareaPrimitive.displayName = 'TextareaPrimitive'
