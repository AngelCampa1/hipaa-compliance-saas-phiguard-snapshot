import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/app/compliance/program/policies')({
  component: () => <Outlet />,
})
