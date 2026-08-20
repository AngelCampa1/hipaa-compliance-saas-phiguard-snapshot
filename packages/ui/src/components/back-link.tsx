import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * Class string applied to back-navigation anchor elements.
 *
 * Exported separately so consumers using a typed router (e.g. TanStack
 * Router's `<Link>` with strict search-param types) can apply the styling
 * directly without losing route-level type inference through a polymorphic
 * wrapper. Prefer `<BackLinkAnchor as={Link}>` for simple cases; reach for
 * this constant only when the polymorphic wrapper drops important typing.
 */
export const BACK_LINK_ANCHOR_CLASS =
  'text-text-link underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 rounded-sm'

/**
 * Container nav for "back" navigation links rendered above a page header.
 *
 * Designed to be router-agnostic - consumers pass their own `<Link>` element
 * (e.g. from `@tanstack/react-router`) as children. The container provides
 * consistent spacing and typography across all back-navigation surfaces.
 *
 * Example:
 *   <BackLinkNav>
 *     <BackLinkAnchor as={Link} to="/app/soc2">Back to SOC 2</BackLinkAnchor>
 *   </BackLinkNav>
 */
export function BackLinkNav({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        'mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm',
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  )
}

/**
 * Styled anchor for back-navigation links.
 *
 * Renders as the element passed via `as` (defaults to `<a>`). Pass any
 * router-specific link component (e.g. TanStack Router's `Link`) and forward
 * its props. The component applies the standard back-link visual treatment.
 */
type AnyComponent = React.ElementType
type BackLinkAnchorProps<TComponent extends AnyComponent> = {
  as?: TComponent
  className?: string
  children?: React.ReactNode
} & Omit<
  React.ComponentPropsWithoutRef<TComponent>,
  'as' | 'className' | 'children'
>

export function BackLinkAnchor<TComponent extends AnyComponent = 'a'>({
  as,
  className,
  children,
  ...props
}: BackLinkAnchorProps<TComponent>) {
  const Component = (as ?? 'a') as React.ElementType
  return (
    <Component
      className={cn(BACK_LINK_ANCHOR_CLASS, className)}
      {...props}
    >
      {children}
    </Component>
  )
}
