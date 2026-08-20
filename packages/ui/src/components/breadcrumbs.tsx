import * as React from 'react'
import { cn } from '../lib/cn'

/**
 * A single crumb in a breadcrumb trail. Omit `to` for the current page
 * (the last item is rendered as plain text with `aria-current="page"`).
 */
export type BreadcrumbItem = {
  label: string
  to?: string
}

/**
 * Pure helper: classifies each breadcrumb item as `current` (last in trail)
 * or `link`. Extracted so the classification logic is unit-testable without
 * a DOM. The component below uses this to decide what to render.
 */
export function classifyBreadcrumbItems(
  items: ReadonlyArray<BreadcrumbItem>,
): Array<{ item: BreadcrumbItem; isCurrent: boolean; isLink: boolean }> {
  const lastIndex = items.length - 1
  return items.map((item, index) => {
    const isCurrent = index === lastIndex
    // The current page is never a link, even if `to` is provided.
    // Non-current items are links only when `to` is set.
    const isLink = !isCurrent && typeof item.to === 'string' && item.to.length > 0
    return { item, isCurrent, isLink }
  })
}

type AnyLink = React.ElementType

type BreadcrumbsProps<TLink extends AnyLink = 'a'> = {
  items: ReadonlyArray<BreadcrumbItem>
  /**
   * Link component used for navigable crumbs. Consumers in TanStack Router
   * apps should pass `Link` from `@tanstack/react-router` so router-level
   * type inference is preserved. Defaults to a plain `<a>`.
   */
  LinkComponent?: TLink
  /**
   * Visual separator rendered between crumbs. Defaults to `/`.
   */
  separator?: React.ReactNode
  className?: string
}

/**
 * Accessible breadcrumb trail.
 *
 * - Wraps the trail in a `<nav aria-label="Breadcrumb">`.
 * - Renders the last item as plain text with `aria-current="page"`.
 * - Separators are decorative (`aria-hidden`).
 * - Router-agnostic: pass `LinkComponent` to integrate with your router.
 */
export function Breadcrumbs<TLink extends AnyLink = 'a'>({
  items,
  LinkComponent,
  separator = '/',
  className,
}: BreadcrumbsProps<TLink>) {
  const classified = classifyBreadcrumbItems(items)
  const Link = (LinkComponent ?? 'a') as React.ElementType

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'mb-6 flex flex-wrap items-center gap-1.5 text-sm text-text-muted',
        className,
      )}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {classified.map(({ item, isCurrent, isLink }, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 ? (
              <span aria-hidden="true" className="select-none">
                {separator}
              </span>
            ) : null}
            {isLink ? (
              <Link
                to={item.to}
                href={item.to}
                className="hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 rounded-sm"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isCurrent ? 'page' : undefined}
                className={
                  isCurrent ? 'text-text-primary font-medium' : undefined
                }
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
