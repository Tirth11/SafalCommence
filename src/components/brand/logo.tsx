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

const MARK_SRC = '/safalmarket-mark.png'
const WORDMARK_SRC = '/safalmarket-wordmark.png'

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
      <img src={MARK_SRC} alt="" className="h-full w-full object-contain p-[2px]" draggable={false} />
    </span>
  )
}

function BrandTagline({ className }: { className?: string }) {
  return (
    <span className={cn('mt-0.5 text-[10px] font-black leading-none tracking-[-0.02em]', className)}>
      <span className="text-brand-900 dark:text-brand-200">List.</span>
      <span className="text-brand-400 dark:text-brand-300">Discover.</span>
      <span className="text-brand-900 dark:text-brand-200">Connect</span>
    </span>
  )
}

export function Logo({ size = 'md', onInk = false, asLink = true, sub = 'List.Discover.Connect', to = '/', className }: LogoProps) {
  const mark = { sm: 'size-9 rounded-[10px]', md: 'size-10 rounded-[12px]', lg: 'size-12 rounded-[15px]' }[size]
  const wordmark = { sm: 'h-5 w-[112px]', md: 'h-6 w-[134px]', lg: 'h-7 w-[156px]' }[size]
  const showBrandTagline = sub === 'List.Discover.Connect'

  const content = (
    <>
      <LogoMark className={mark} onInk={onInk} />
      <span className={cn('flex flex-col leading-[1.05]', onInk && 'rounded-md bg-white/95 px-1.5 py-1 shadow-sm')}>
        <img src={WORDMARK_SRC} alt="SafalMarket" className={cn('object-contain object-left', wordmark)} draggable={false} />
        {showBrandTagline ? (
          <BrandTagline />
        ) : (
          sub && <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">{sub}</span>
        )}
      </span>
    </>
  )

  const classes = cn('inline-flex items-center gap-2.5', className)

  if (!asLink) return <span className={classes}>{content}</span>

  return (
    <Link {...({ to } as unknown as LinkProps)} className={classes} aria-label="SafalMarket — home">
      {content}
    </Link>
  )
}
