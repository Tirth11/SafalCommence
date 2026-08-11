import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import type * as React from 'react'

import { AdminLink, type AdminTarget } from '@/components/admin/admin-link'
import { cn } from '@/lib/utils'

export type Kpi = {
  label: string
  value: string
  hint?: string
  delta?: { value: string; direction: 'up' | 'down' }
  /** Clickable KPIs open the matching work queue. */
  target?: AdminTarget
  /** Draws attention when a number represents work waiting on the admin. */
  attention?: boolean
}

export function KpiCard({ kpi, className }: { kpi: Kpi; className?: string }) {
  const body = (
    <>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">
        {kpi.label}
      </p>
      <p
        className={cn(
          'mt-2 text-[26px] font-bold leading-none tracking-[-0.03em] tabular text-ink-950 dark:text-white',
          kpi.attention && 'text-gold-600 dark:text-gold-400'
        )}
      >
        {kpi.value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        {kpi.delta && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold',
              kpi.delta.direction === 'up'
                ? 'bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100'
                : 'bg-destructive/10 text-destructive'
            )}
          >
            {kpi.delta.direction === 'up' ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {kpi.delta.value}
          </span>
        )}
        {kpi.hint && <span className="truncate text-[11px] text-ink-500">{kpi.hint}</span>}
      </div>
      {kpi.target && (
        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-300">
          Open queue
          <ArrowRight className="size-3" />
        </span>
      )}
    </>
  )

  const base = cn(
    'block rounded-lg border bg-card p-4 shadow-xs transition-[box-shadow,border-color,transform]',
    kpi.attention && 'border-gold-100 dark:border-gold-600/40',
    kpi.target && 'hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md',
    className
  )

  if (kpi.target) {
    return (
      <AdminLink to={kpi.target.to} search={kpi.target.search} className={base}>
        {body}
      </AdminLink>
    )
  }
  return <div className={base}>{body}</div>
}

export function KpiGrid({ items, className }: { items: Kpi[]; className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-3 lg:grid-cols-4', className)}>
      {items.map((kpi) => (
        <KpiCard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  )
}

/** "Requires your attention" row — every card is a queue shortcut. */
export function AttentionCard({
  icon: Icon,
  count,
  label,
  detail,
  target,
  tone = 'brand',
}: {
  icon: React.ElementType
  count: string
  label: string
  detail: string
  target: AdminTarget
  tone?: 'brand' | 'gold' | 'danger'
}) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-200',
    gold: 'bg-gold-50 text-gold-600 dark:bg-gold-600/15 dark:text-gold-400',
    danger: 'bg-destructive/10 text-destructive',
  }
  return (
    <AdminLink
      to={target.to}
      search={target.search}
      className="group flex items-center gap-3.5 rounded-lg border bg-card p-4 shadow-xs transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <span className={cn('grid size-10 shrink-0 place-items-center rounded-md', tones[tone])}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold leading-tight tabular text-ink-950 dark:text-white">
          {count} <span className="text-[13px] font-semibold text-ink-700 dark:text-ink-200">{label}</span>
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-ink-500">{detail}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
    </AdminLink>
  )
}
