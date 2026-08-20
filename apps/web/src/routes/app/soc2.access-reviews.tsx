import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app/soc2/access-reviews')({
  component: () => <Outlet />,
})
