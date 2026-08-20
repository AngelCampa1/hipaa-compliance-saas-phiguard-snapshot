import * as React from 'react'
import { AlertTriangle, Lock, PackageOpen, RefreshCw } from 'lucide-react'
import { cn } from '../lib/cn'
import { Card, CardContent } from './card'
import { Button } from './button'
import { Spinner } from './spinner'

export type StatusPanelVariant = 'loading' | 'empty' | 'error' | 'locked'

export interface StatusPanelAction {
  label: string
  onClick?: () => void
  href?: string
}

export interface StatusPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: StatusPanelVariant
  title: string
  description?: string
  action?: StatusPanelAction
}

const variantConfig: Record<
  StatusPanelVariant,
  {
    icon: React.ReactNode
    iconBg: string
  }
> = {
  loading: {
    icon: <Spinner size="md" />,
    iconBg: 'bg-surface-100 text-brand-600',
  },
  empty: {
    icon: <PackageOpen className="h-6 w-6" />,
    iconBg: 'bg-surface-100 text-text-muted',
  },
  error: {
    icon: <AlertTriangle className="h-6 w-6" />,
    iconBg: 'bg-danger-50 text-danger-600',
  },
  locked: {
    icon: <Lock className="h-6 w-6" />,
    iconBg: 'bg-surface-100 text-text-muted',
  },
}

export function StatusPanel({
  variant,
  title,
  description,
  action,
  className,
  ...props
}: StatusPanelProps) {
  const config = variantConfig[variant]

  return (
    <Card className={cn('w-full', className)} {...props}>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div
          aria-hidden="true"
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full',
            config.iconBg,
          )}
        >
          {config.icon}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          {description && (
            <p className="max-w-sm text-sm text-text-muted">{description}</p>
          )}
        </div>

        {action && (
          <div className="mt-2">
            {action.href ? (
              <Button asChild variant={variant === 'error' ? 'default' : 'outline'} size="sm">
                <a href={action.href}>
                  {variant === 'error' && <RefreshCw className="h-4 w-4" />}
                  {action.label}
                </a>
              </Button>
            ) : (
              <Button
                variant={variant === 'error' ? 'default' : 'outline'}
                size="sm"
                onClick={action.onClick}
              >
                {variant === 'error' && <RefreshCw className="h-4 w-4" />}
                {action.label}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
