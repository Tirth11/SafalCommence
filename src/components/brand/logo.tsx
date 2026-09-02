import { Link, type LinkProps } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
  onInk?: boolean
  asLink?: boolean
  /** Small label under the wordmark. Pass '' to hide. */
  sub?: string
  /** Link target — e.g. '/' for storefront, '/admin' for admin, '/seller' for seller. */
  to?: string
  className?: string
}

const LOGO_SRC = '/safalmarket-header.png?v=provided-20260902'
const MARK_SRC = '/safalmarket-mark.png?v=provided-20260902'

/**
 * SafalMarket mark from the approved brand artwork.
 */
export function LogoMark({ className, onInk = false }: { className?: string; onInk?: boolean }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden rounded-[inherit]',
        onInk && 'bg-white/95 shadow-sm',
        className
      )}
    >
      <img src={MARK_SRC} alt="" className="h-full w-full object-contain" draggable={false} />
    </span>
  )
}

export function Logo({ size = 'md', onInk = false, asLink = true, sub = 'List.Discover.Connect', to = '/', className }: LogoProps) {
  const logo = { sm: 'h-11 w-[98px]', md: 'h-[58px] w-[129px]', lg: 'h-[74px] w-[165px]' }[size]
  const contextLabel = sub && sub !== 'List.Discover.Connect' ? sub : ''

  const content = (
    <span
      className={cn(
        'flex flex-col items-center justify-center leading-none',
        (onInk || contextLabel) && 'rounded-md bg-white/95 px-1.5 py-1 shadow-sm',
        !onInk && !contextLabel && 'dark:rounded-md dark:bg-white/95 dark:px-1.5 dark:py-1 dark:shadow-sm'
      )}
    >
      <img src={LOGO_SRC} alt="SafalMarket" className={cn('object-contain', logo)} draggable={false} />
      {contextLabel && <span className="-mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">{contextLabel}</span>}
    </span>
  )

  const classes = cn('inline-flex items-center', className)

  if (!asLink) return <span className={classes}>{content}</span>

  return (
    <Link {...({ to } as unknown as LinkProps)} className={classes} aria-label="SafalMarket — home">
      {content}
    </Link>
  )
}
