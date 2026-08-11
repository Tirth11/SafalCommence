import type * as React from 'react'
import { cn } from '@/lib/utils'

export function Eyebrow({ onInk, className, children }: { onInk?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-block text-xs font-bold uppercase tracking-[0.14em]',
        onInk ? 'text-brand-300' : 'text-brand-600 dark:text-brand-300',
        className
      )}
    >
      {children}
    </span>
  )
}

export function SectionHead({
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
    <div className={cn('max-w-[680px]', center && 'mx-auto text-center', className)}>
      {eyebrow && (
        <Eyebrow onInk={onInk} className="mb-3.5">
          {eyebrow}
        </Eyebrow>
      )}
      <h2 className={cn('text-2xl sm:text-3xl md:text-[36px]', onInk && 'text-white')}>{title}</h2>
      {sub && <p className={cn('mt-3.5 text-base sm:text-[17px]', onInk ? 'text-ink-400' : 'text-ink-600 dark:text-ink-300')}>{sub}</p>}
    </div>
  )
}

export function Section({
  id,
  tone = 'default',
  className,
  children,
}: {
  id?: string
  tone?: 'default' | 'muted' | 'ink'
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-16 md:py-24',
        tone === 'muted' && 'bg-muted/70 dark:bg-card/40',
        tone === 'ink' && 'bg-ink-950 text-ink-300',
        className
      )}
    >
      {children}
    </section>
  )
}
