import { ChevronRight, Inbox } from 'lucide-react'
import type * as React from 'react'

import { AdminLink, type AdminTarget } from '@/components/admin/admin-link'
import { cn } from '@/lib/utils'

/* ---------------------------------------------------------- page header --- */
export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
  className,
}: {
  title: string
  description?: string
  breadcrumb?: (AdminTarget & { label: string })[]
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2.5 flex items-center gap-1 text-[12px] text-ink-500">
          {breadcrumb.map((crumb, i) => (
            <span key={crumb.label} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="size-3.5 text-ink-300" />}
              <AdminLink to={crumb.to} search={crumb.search} className="font-medium hover:text-ink-900 dark:hover:text-white">
                {crumb.label}
              </AdminLink>
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-[26px]">{title}</h1>
          {description && <p className="mt-1.5 max-w-[720px] text-[14px] text-ink-600 dark:text-ink-300">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- panel --- */
export function Panel({
  title,
  description,
  actions,
  footer,
  padded = true,
  className,
  children,
}: {
  title?: React.ReactNode
  description?: string
  actions?: React.ReactNode
  footer?: React.ReactNode
  padded?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn('overflow-hidden rounded-lg border bg-card shadow-xs', className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5">
          <div>
            {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-[12px] text-ink-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn(padded && 'p-5')}>{children}</div>
      {footer && <footer className="border-t bg-muted/40 px-5 py-3">{footer}</footer>}
    </section>
  )
}

/* ------------------------------------------------------ definition list --- */
export function DefinitionList({
  items,
  columns = 2,
  className,
}: {
  items: { label: string; value: React.ReactNode; hint?: string }[]
  columns?: 1 | 2 | 3
  className?: string
}) {
  return (
    <dl
      className={cn(
        'grid gap-x-8 gap-y-5',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{item.label}</dt>
          <dd className="mt-1 text-[14px] font-medium text-ink-900 dark:text-white">{item.value}</dd>
          {item.hint && <dd className="mt-0.5 text-[12px] text-ink-500">{item.hint}</dd>}
        </div>
      ))}
    </dl>
  )
}

/* ---------------------------------------------------------- money rows --- */
export function MoneyRows({
  rows,
  className,
}: {
  rows: { label: string; value: string; tone?: 'default' | 'negative' | 'total'; hint?: string }[]
  className?: string
}) {
  return (
    <dl className={cn('divide-y', className)}>
      {rows.map((row) => (
        <div
          key={row.label}
          className={cn('flex items-baseline justify-between gap-4 py-2.5', row.tone === 'total' && 'pt-3.5')}
        >
          <dt
            className={cn(
              'text-[13px] text-ink-600 dark:text-ink-300',
              row.tone === 'total' && 'text-[14px] font-semibold text-ink-900 dark:text-white'
            )}
          >
            {row.label}
            {row.hint && <span className="ml-2 text-[11px] text-ink-400">{row.hint}</span>}
          </dt>
          <dd
            className={cn(
              'shrink-0 text-[13px] font-semibold tabular text-ink-900 dark:text-white',
              row.tone === 'negative' && 'text-destructive',
              row.tone === 'total' && 'text-[17px] font-bold'
            )}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* ------------------------------------------------------------- timeline --- */
export function Timeline({ steps }: { steps: { label: string; at: string; done: boolean }[] }) {
  return (
    <ol className="relative">
      {steps.map((step, i) => (
        <li key={step.label} className="relative flex gap-4 pb-5 last:pb-0">
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={cn('absolute left-[9px] top-5 h-full w-px', step.done ? 'bg-teal-500/40' : 'bg-border')}
            />
          )}
          <span
            className={cn(
              'relative z-10 mt-1 size-[19px] shrink-0 rounded-full border-2',
              step.done ? 'border-teal-500 bg-teal-500' : 'border-ink-300 bg-background'
            )}
          >
            {step.done && (
              <svg viewBox="0 0 24 24" className="size-full text-white" fill="none" stroke="currentColor" strokeWidth="4">
                <path d="m6 12.5 4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <div className="min-w-0 pb-1">
            <p className={cn('text-[13px] font-semibold', step.done ? 'text-ink-900 dark:text-white' : 'text-ink-500')}>
              {step.label}
            </p>
            <p className="mt-0.5 text-[12px] text-ink-500">{step.at}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ---------------------------------------------------------- empty state --- */
export function EmptyState({
  title,
  body,
  icon: Icon = Inbox,
  action,
  className,
}: {
  title: string
  body: string
  icon?: typeof Inbox
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-16 text-center', className)}>
      <span className="grid size-14 place-items-center rounded-full bg-muted text-ink-400">
        <Icon className="size-7" />
      </span>
      <p className="mt-5 text-[15px] font-semibold text-ink-900 dark:text-white">{title}</p>
      <p className="mx-auto mt-1.5 max-w-[400px] text-[13px] leading-relaxed text-ink-500">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------ error card -- */
export function ErrorNote({ kind }: { kind: 'generic' | 'permission' | 'conflict' }) {
  const copy = {
    generic: 'Something went wrong. Please try again.',
    permission: "You don't have permission to perform this action.",
    conflict: 'This record has been updated by another user. Refresh the page to continue.',
  }[kind]
  return (
    <div className="rounded-sm border border-destructive/25 bg-destructive/8 px-4 py-3 text-[13px] font-medium text-destructive">
      {copy}
    </div>
  )
}
