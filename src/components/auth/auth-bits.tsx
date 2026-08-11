import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, Eye, EyeOff, Store, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PASSWORD_RULES } from '@/lib/validation'
import { cn } from '@/lib/utils'

/** Password input with show/hide affix. */
export function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  const [reveal, setReveal] = React.useState(false)
  return (
    <span className="relative block">
      <Input type={reveal ? 'text' : 'password'} className={cn('pr-12', className)} {...props} />
      <button
        type="button"
        onClick={() => setReveal((v) => !v)}
        aria-label={reveal ? 'Hide password' : 'Show password'}
        className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-sm text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800 focus-visible:ring-[3px] focus-visible:ring-ring/30 focus-visible:outline-none dark:hover:bg-secondary"
      >
        {reveal ? <EyeOff className="size-[19px]" /> : <Eye className="size-[19px]" />}
      </button>
    </span>
  )
}

/** Live password policy checklist. */
export function PasswordChecklist({ value }: { value: string }) {
  const touched = value.length > 0
  return (
    <div className="rounded-sm border bg-muted/60 px-3.5 py-3">
      <p className="text-xs font-semibold text-ink-600 dark:text-ink-300">Password should contain:</p>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(value)
          return (
            <li
              key={rule.id}
              className={cn(
                'flex items-center gap-1.5 text-xs',
                ok ? 'font-medium text-teal-600 dark:text-teal-100' : touched ? 'text-ink-500' : 'text-ink-500'
              )}
            >
              <span
                className={cn(
                  'grid size-4 shrink-0 place-items-center rounded-full',
                  ok ? 'bg-teal-500 text-white' : 'border border-ink-300 text-transparent'
                )}
              >
                {ok ? <Check className="size-2.5" strokeWidth={3.5} /> : <X className="size-2.5" />}
              </span>
              {rule.label}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** "or" divider */
export function OrDivider({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3.5 text-sm text-ink-400', className)}>
      <span className="h-px flex-1 bg-border" />
      or
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

/** Optional federated sign-in */
export function GoogleButton({ label = 'Continue with Google' }: { label?: string }) {
  return (
    <Button type="button" variant="outline" className="w-full">
      <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.2-2.2H12v4.1h6.6a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.2-2.1 3.4-5.1 3.4-8.6Z" />
        <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2a7 7 0 0 1-6.6-4.8H1.4v3.1A12 12 0 0 0 12 24Z" />
        <path fill="#FBBC05" d="M5.4 14.5a7.2 7.2 0 0 1 0-4.6V6.8H1.4a12 12 0 0 0 0 10.4l4-2.7Z" />
        <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.8l4 3.1A7 7 0 0 1 12 4.8Z" />
      </svg>
      {label}
    </Button>
  )
}

/** Persistent seller nudge — "Start Selling" stays visible across the funnel. */
export function SellerNudge({ className }: { className?: string }) {
  return (
    <Link
      to="/register"
      className={cn(
        'group flex items-center gap-3 rounded-sm border border-brand-100 bg-brand-50 px-4 py-3.5 transition-colors hover:border-brand-200 hover:bg-brand-100/70 dark:border-brand-800 dark:bg-brand-950/60 dark:hover:bg-brand-950',
        className
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-sm bg-brand-600 text-white">
        <Store className="size-[18px]" />
      </span>
      <span className="text-sm font-semibold text-brand-800 dark:text-brand-200">
        Want to sell on SafalHub?{' '}
        <span className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-300">
          Start Selling
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </span>
    </Link>
  )
}

/** Compact header used above every auth form. */
export function AuthFormHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl sm:text-[28px]">{title}</h1>
      {sub && <p className="mt-2 text-[15px] text-ink-600 dark:text-ink-300">{sub}</p>}
    </div>
  )
}
