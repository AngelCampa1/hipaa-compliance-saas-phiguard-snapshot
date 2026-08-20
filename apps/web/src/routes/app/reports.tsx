import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Breadcrumbs } from '@phiguard/ui'

const SECTION_LABELS: Record<string, string> = {
  '/app/reports/compliance': 'Compliance progress',
  '/app/reports/tasks': 'Tasks by location',
}

function ReportsLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const section = SECTION_LABELS[pathname] ?? null

  // Only show a breadcrumb on sub-pages, where it provides a real "back to
  // Reports" trail. On the index a single "Reports" crumb would just duplicate
  // the page's own "Reports" heading directly below it.
  const items = section
    ? [
        { label: 'Reports', to: '/app/reports' },
        { label: section },
      ]
    : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {items ? <Breadcrumbs items={items} LinkComponent={Link} /> : null}
      <Outlet />
    </div>
  )
}

export const Route = createFileRoute('/app/reports')({
  component: ReportsLayout,
})
