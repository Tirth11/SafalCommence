import type * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * Entrance animation for marketing sections.
 *
 * Animates position only — never opacity. Anything that fades from 0 (whether
 * JS-observed or a CSS animation with a backwards fill) renders invisible if
 * the animation never runs: throttled background tabs, print, prerender, a
 * script error. Content here is always painted; only its offset animates, so
 * the page degrades to plain, fully readable layout.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div
      className={cn('animate-in slide-in-from-bottom-3 fill-mode-both duration-700 ease-out', className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}

/** Big editorial section heading — Apple-style scale and tight tracking. */
export function EditorialHeading({
  eyebrow,
  title,
  sub,
  center,
  onInk,
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  sub?: React.ReactNode
  center?: boolean
  onInk?: boolean
  className?: string
}) {
  return (
    <div className={cn('max-w-[760px]', center && 'mx-auto text-center', className)}>
      {eyebrow && (
        <span
          className={cn(
            'mb-4 inline-block text-[12px] font-bold uppercase tracking-[0.16em]',
            onInk ? 'text-brand-300' : 'text-brand-600 dark:text-brand-300'
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2 className={cn('text-[30px] leading-[1.08] tracking-[-0.03em] sm:text-[40px] lg:text-[52px]', onInk && 'text-white')}>
        {title}
      </h2>
      {sub && (
        <p
          className={cn(
            'mt-5 text-[17px] leading-relaxed sm:text-[19px]',
            center ? 'mx-auto max-w-[620px]' : 'max-w-[620px]',
            onInk ? 'text-ink-300' : 'text-ink-600 dark:text-ink-300'
          )}
        >
          {sub}
        </p>
      )}
    </div>
  )
}
