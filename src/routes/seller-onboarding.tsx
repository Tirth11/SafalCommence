import { Link } from '@tanstack/react-router'
import { Banknote, Building2, Check, MapPin, Package, Save, ShieldCheck } from 'lucide-react'

import { Logo } from '@/components/brand/logo'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const STEPS = [
  { n: 1, label: 'Business Details', icon: Building2, body: 'Legal name, business type and contact details.' },
  { n: 2, label: 'Verification', icon: ShieldCheck, body: 'GSTIN / PAN and identity verification.' },
  { n: 3, label: 'Bank Details', icon: Banknote, body: 'Account for order settlements.' },
  { n: 4, label: 'Pickup Address', icon: MapPin, body: 'Where couriers collect your orders.' },
  { n: 5, label: 'First Product', icon: Package, body: 'List one product to go live.' },
]

const CURRENT = 1

/**
 * Beginning of seller onboarding — deliberately separate from registration.
 * No business or KYC field appears before this point in the funnel.
 */
export function SellerOnboardingPage() {
  return (
    <div className="min-h-dvh bg-muted/50">
      <header className="border-b bg-background">
        <div className="container-page flex h-18 items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Save className="size-4" />
              Save &amp; exit
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Exit</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-[860px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
            Step {CURRENT} of {STEPS.length}
          </p>
          <h1 className="mt-3 text-2xl sm:text-[34px]">Let's set up your business</h1>
          <p className="mt-3 max-w-[520px] text-base text-ink-600 dark:text-ink-300">
            You can save your progress and continue anytime.
          </p>

          <Progress value={(CURRENT / STEPS.length) * 100} className="mt-8" aria-label="Onboarding progress" />

          <ol className="mt-8 grid gap-3">
            {STEPS.map((step) => {
              const done = step.n < CURRENT
              const active = step.n === CURRENT
              return (
                <li
                  key={step.n}
                  className={cn(
                    'flex items-center gap-4 rounded-lg border bg-card p-4 sm:p-5',
                    active && 'border-brand-600 shadow-md',
                    !active && !done && 'opacity-70'
                  )}
                >
                  <span
                    className={cn(
                      'grid size-11 shrink-0 place-items-center rounded-md',
                      done && 'bg-teal-500 text-white',
                      active && 'bg-brand-600 text-white',
                      !done && !active && 'bg-ink-100 text-ink-500 dark:bg-secondary'
                    )}
                  >
                    {done ? <Check className="size-5" strokeWidth={3} /> : <step.icon className="size-5" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-ink-900 dark:text-white">
                      {step.n}. {step.label}
                      {active && (
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-600 dark:text-ink-300">{step.body}</p>
                  </div>
                  {active && (
                    <Button size="sm" className="hidden shrink-0 sm:inline-flex">
                      Continue
                    </Button>
                  )}
                </li>
              )
            })}
          </ol>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="w-full sm:w-auto">
              Enter Business Details
            </Button>
            <Button size="lg" variant="ghost" className="w-full sm:w-auto" asChild>
              <Link to="/">Do this later</Link>
            </Button>
          </div>

          <p className="mt-6 text-sm text-ink-500">
            Your products go live once verification is approved. Until then, you can shop as a customer with the same
            account.
          </p>
        </div>
      </main>
    </div>
  )
}
