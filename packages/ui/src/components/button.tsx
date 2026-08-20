import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/cn'

/**
 * Button - used in apps/web (TanStack Start, React).
 *
 * The marketing site (apps/marketing, Astro) cannot import this component
 * because Astro pages are not React. It uses CSS classes that mirror this
 * contract 1:1 by intent and tokens. See the "Button system" header in
 * apps/marketing/src/styles/global.css.
 *
 * Variant to marketing class mapping:
 *   variant="default"      -> .button-primary
 *   variant="outline"      -> .button-secondary
 *   variant="ghost"        -> .button-tertiary
 *   variant="destructive"  -> (none - no destructive marketing CTAs)
 *
 * Size to marketing modifier class mapping:
 *   size="sm" -> .button-sm
 *   size="md" -> .button-md  (default)
 *   size="lg" -> .button-lg
 *
 * Keep both in sync when adding variants or sizes.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-brand-600 text-text-inverse hover:bg-brand-700',
        outline:
          'border border-border-strong bg-surface-0 text-text-primary hover:bg-surface-50',
        ghost: 'text-text-primary hover:bg-surface-100',
        destructive: 'bg-danger-600 text-text-inverse hover:bg-danger-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
