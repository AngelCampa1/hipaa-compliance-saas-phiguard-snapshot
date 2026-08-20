import * as React from 'react'
import { cn } from '../lib/cn'

export type PhiguardLogoVariant = 'light' | 'inverse' | 'dark' | 'mark'

export interface PhiguardLogoProps
  extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt' | 'height' | 'src' | 'width'> {
  variant?: PhiguardLogoVariant
  showWordmark?: boolean
  title?: string
}

export function PhiguardLogo({
  className,
  variant = 'light',
  showWordmark = true,
  title,
  ...props
}: PhiguardLogoProps) {
  const markOnly = variant === 'mark' || !showWordmark
  const inverse = variant === 'inverse' || variant === 'dark'
  const src = markOnly
    ? inverse
      ? '/logo-mark-inverse.png'
      : '/logo-mark.png'
    : inverse
      ? '/logo-horizontal-inverse.png'
      : '/logo-horizontal.png'
  const width = markOnly ? 512 : 910
  const height = markOnly ? 512 : 200

  return (
    <img
      src={src}
      alt={title ?? ''}
      aria-hidden={title ? undefined : true}
      title={title}
      width={width}
      height={height}
      decoding="async"
      className={cn('h-10 w-auto shrink-0', className)}
      {...props}
    />
  )
}

export function PhiguardMark(props: Omit<PhiguardLogoProps, 'showWordmark'> = {}) {
  return <PhiguardLogo {...props} variant={props.variant ?? 'mark'} showWordmark={false} />
}
