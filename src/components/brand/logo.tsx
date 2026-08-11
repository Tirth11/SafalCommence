import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

type LogoProps = {
  size?: 'sm' | 'md' | 'lg'
  onInk?: boolean
  asLink?: boolean
  /** Small label under the wordmark. Pass '' to hide. */
  sub?: string
  /** Link target — '/' for the storefront, '/admin' inside the admin portal. */
  to?: '/' | '/admin'
  className?: string
}

/**
 * Brand mark: three ascending bars — growth, inventory, commerce.
 * Original identity; no resemblance to existing marketplace logos.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center bg-linear-145 from-brand-500 to-brand-700 shadow-[0_2px_8px_color-mix(in_oklab,var(--brand-600)_35%,transparent)]',
        className
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[55%]" aria-hidden="true">
        <rect x="4.6" y="14.5" width="3.4" height="5.5" rx="1.1" fill="#fff" fillOpacity=".62" />
        <rect x="10.3" y="9.8" width="3.4" height="10.2" rx="1.1" fill="#fff" fillOpacity=".8" />
        <rect x="16" y="4" width="3.4" height="16" rx="1.1" fill="#fff" />
      </svg>
    </span>
  )
}

export function Logo({ size = 'md', onInk = false, asLink = true, sub = 'Marketplace', to = '/', className }: LogoProps) {
  const mark = { sm: 'size-8 rounded-[9px]', md: 'size-9 rounded-[10px]', lg: 'size-11 rounded-[13px]' }[size]
  const name = { sm: 'text-[15px]', md: 'text-[17px]', lg: 'text-[19px]' }[size]

  const content = (
    <>
      <LogoMark className={mark} />
      <span className="flex flex-col leading-[1.05]">
        <span className={cn('font-bold tracking-[-0.025em]', name, onInk ? 'text-white' : 'text-ink-950 dark:text-white')}>
          Safal<span className={cn(onInk ? 'text-brand-300' : 'text-brand-600 dark:text-brand-300')}>Hub</span>
        </span>
        {sub && <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-400">{sub}</span>}
      </span>
    </>
  )

  const classes = cn('inline-flex items-center gap-2.5', className)

  if (!asLink) return <span className={classes}>{content}</span>

  return (
    <Link to={to} className={classes} aria-label="SafalHub — home">
      {content}
    </Link>
  )
}
