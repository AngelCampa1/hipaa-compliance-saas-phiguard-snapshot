import { Link } from '@tanstack/react-router'
import { PhiguardLogo } from '@phiguard/ui'

export function BrandHeader() {
  return (
    <div className="mb-8 flex flex-col items-center">
      <Link to="/" className="flex min-h-11 items-center gap-3 no-underline">
        <PhiguardLogo className="h-10" title="PHIGuard" />
      </Link>
    </div>
  )
}
