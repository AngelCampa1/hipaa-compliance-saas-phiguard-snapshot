import { createFileRoute, redirect } from '@tanstack/react-router'

// `/app/settings` has no page of its own — the sidebar "Settings" group links
// straight to its children. Redirect the bare path to the first item so a typed
// URL or stale link lands on Members instead of a 404.
export const Route = createFileRoute('/app/settings/')({
  beforeLoad: () => {
    throw redirect({ to: '/app/settings/members' })
  },
})
