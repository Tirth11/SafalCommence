import { useRef, useState } from 'react'
import { Check, Eye, FileText, Replace, Trash2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ONBOARDING_STEPS, useOnboardingProgress, useSellerStore } from '@/store/seller-store'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------- stepper ---- */
export function Stepper({
  steps,
  current,
  onSelect,
  className,
}: {
  steps: { key: string; label: string }[]
  current: string
  onSelect?: (key: string) => void
  className?: string
}) {
  const currentIndex = steps.findIndex((s) => s.key === current)

  return (
    <ol className={cn('flex gap-1 overflow-x-auto pb-1 no-scrollbar', className)}>
      {steps.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <li key={step.key} className="flex min-w-0 shrink-0 items-center gap-1">
            <button
              type="button"
              disabled={!onSelect || i > currentIndex}
              onClick={() => onSelect?.(step.key)}
              className={cn(
                'flex items-center gap-2 rounded-sm px-3 py-2 text-[13px] transition-colors',
                active && 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-200',
                done && 'font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-secondary',
                !active && !done && 'text-ink-400'
              )}
            >
              <span
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold',
                  done && 'bg-teal-500 text-white',
                  active && 'bg-brand-600 text-white',
                  !done && !active && 'border border-ink-300'
                )}
              >
                {done ? <Check className="size-3" strokeWidth={3.5} /> : i + 1}
              </span>
              <span className="whitespace-nowrap">{step.label}</span>
            </button>
            {i < steps.length - 1 && <span aria-hidden className="text-ink-300">›</span>}
          </li>
        )
      })}
    </ol>
  )
}

/* --------------------------------------------------- onboarding checklist -- */
export function OnboardingChecklist({ compact = false }: { compact?: boolean }) {
  const completed = useSellerStore((s) => s.completed)
  const { done, total, percent, nextStep } = useOnboardingProgress()

  return (
    <div className="rounded-lg border bg-card p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-semibold">Complete your seller setup</h2>
          <p className="mt-1 text-[13px] text-ink-600 dark:text-ink-300">
            {done} of {total} steps completed
          </p>
        </div>
        <span className="text-[26px] font-bold leading-none tabular text-brand-600 dark:text-brand-300">{percent}%</span>
      </div>

      <Progress value={percent} className="mt-4" aria-label="Seller setup progress" />

      <ul className={cn('mt-5 grid gap-2', !compact && 'sm:grid-cols-2')}>
        {ONBOARDING_STEPS.map((step) => {
          const isDone = completed[step.key]
          return (
            <li key={step.key}>
              <AdminLink
                to={step.to}
                search={{ step: step.step }}
                className={cn(
                  'flex items-center gap-2.5 rounded-sm border px-3.5 py-2.5 transition-colors hover:border-brand-200',
                  isDone ? 'bg-muted/50' : 'bg-background'
                )}
              >
                <span
                  className={cn(
                    'grid size-5 shrink-0 place-items-center rounded-full',
                    isDone ? 'bg-teal-500 text-white' : 'border border-ink-300'
                  )}
                >
                  {isDone && <Check className="size-3" strokeWidth={3.5} />}
                </span>
                <span
                  className={cn(
                    'flex-1 text-[13px]',
                    isDone ? 'font-medium text-ink-700 dark:text-ink-200' : 'text-ink-600 dark:text-ink-300'
                  )}
                >
                  {step.label}
                </span>
                {nextStep?.key === step.key && (
                  <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white">
                    Next
                  </span>
                )}
              </AdminLink>
            </li>
          )
        })}
      </ul>

      <Button className="mt-5 w-full sm:w-auto" asChild>
        <AdminLink to="/seller/setup" search={nextStep ? { step: nextStep.step } : undefined}>
          Continue Setup
        </AdminLink>
      </Button>
    </div>
  )
}

/* --------------------------------------------------------- upload card ---- */
export type DocState = 'Not Uploaded' | 'Uploaded' | 'Verified' | 'Issue Found'

export function DocumentUploadCard({
  title,
  hint,
  required = true,
  initialState = 'Not Uploaded',
  initialFile,
  comment,
}: {
  title: string
  hint?: string
  required?: boolean
  initialState?: DocState
  initialFile?: string
  comment?: string
}) {
  const [state, setState] = useState<DocState>(initialState)
  const [fileName, setFileName] = useState(initialFile ?? '')
  const inputRef = useRef<HTMLInputElement>(null)

  function pick() {
    inputRef.current?.click()
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("We couldn't upload this file", { description: 'Please check the file format and size (max 5 MB).' })
      return
    }
    setFileName(file.name)
    setState('Uploaded')
    toast.success('Document uploaded', { description: file.name })
  }

  const uploaded = state !== 'Not Uploaded'

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4',
        state === 'Issue Found' && 'border-destructive/30',
        state === 'Verified' && 'border-teal-100 dark:border-teal-600/40'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[14px] font-semibold text-ink-900 dark:text-white">
            {title}
            {!required && <span className="text-[11px] font-medium text-ink-400">Optional</span>}
          </p>
          {hint && <p className="mt-0.5 text-[12px] text-ink-500">{hint}</p>}
        </div>
        <StatusBadge status={state === 'Not Uploaded' ? 'Not Submitted' : state === 'Uploaded' ? 'Submitted' : state} />
      </div>

      <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={onFile} className="sr-only" />

      {uploaded ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-sm border bg-muted/50 px-3.5 py-2.5">
          <FileText className="size-4 shrink-0 text-ink-400" />
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-800 dark:text-ink-100">
            {fileName || 'document.pdf'}
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8">
              <Eye className="size-4" />
              Preview
            </Button>
            <Button variant="ghost" size="sm" className="h-8" onClick={pick}>
              <Replace className="size-4" />
              Replace
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-destructive hover:bg-destructive/8 hover:text-destructive"
              onClick={() => {
                setState('Not Uploaded')
                setFileName('')
              }}
            >
              <Trash2 className="size-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          className="mt-3 flex w-full flex-col items-center gap-1.5 rounded-sm border border-dashed px-4 py-6 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/40"
        >
          <Upload className="size-5 text-ink-400" />
          <span className="text-[13px] font-semibold text-ink-800 dark:text-ink-100">Upload document</span>
          <span className="text-[11px] text-ink-500">PDF, JPG or PNG · up to 5 MB</span>
        </button>
      )}

      {comment && state === 'Issue Found' && (
        <p className="mt-3 rounded-sm border border-destructive/25 bg-destructive/8 px-3.5 py-2.5 text-[12px] font-medium text-destructive">
          {comment}
        </p>
      )}
    </div>
  )
}

/* ---------------------------------------------------------- form layout --- */
export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('border-b py-6 first:pt-0 last:border-0 last:pb-0', className)}>
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {description && <p className="mt-1 text-[13px] text-ink-500">{description}</p>}
      <div className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

/** Sticky action bar for long seller forms — the primary action never scrolls away. */
export function FormActions({
  primary,
  secondary,
  hint,
}: {
  primary: React.ReactNode
  secondary?: React.ReactNode
  hint?: string
}) {
  return (
    <div className="sticky bottom-16 z-20 -mx-4 mt-6 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3.5 backdrop-blur-md sm:-mx-6 sm:bottom-0 sm:px-6">
      {primary}
      {secondary}
      {hint && <p className="text-[12px] text-ink-500 sm:ml-auto">{hint}</p>}
    </div>
  )
}
