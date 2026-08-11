import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'

import { Section, SectionHead } from '@/components/marketing/section'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

/**
 * Header/footer both link to #pricing, so the anchor needs a destination.
 * Kept to structure + capability statements — commercial numbers are
 * placeholders for the commercial team to confirm before launch.
 */
const FACTS = [
  { label: 'Account creation', value: 'Free', note: 'No charge to register or list.' },
  { label: 'Commission', value: 'Category based', note: 'Deducted per completed order.' },
  { label: 'Settlement cycle', value: 'Weekly', note: 'Paid to your registered bank account.' },
]

const INCLUDED = [
  'Seller dashboard and product catalogue',
  'Order and inventory management',
  'Payment processing and settlement reports',
  'Business verification and seller support',
]

export function Pricing() {
  return (
    <Section id="pricing">
      <div className="container-page">
        <SectionHead
          center
          eyebrow="Pricing"
          title="Simple, transparent pricing"
          sub="No setup fee to open your store. You pay a commission only when you make a sale."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="rounded-lg border bg-card p-6 shadow-xs sm:p-8">
            <dl className="grid gap-5 sm:grid-cols-3">
              {FACTS.map((f) => (
                <div key={f.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">{f.label}</dt>
                  <dd className="mt-1.5 text-xl font-bold tracking-[-0.02em] text-ink-950 dark:text-white">{f.value}</dd>
                  <dd className="mt-1 text-sm text-ink-600 dark:text-ink-300">{f.note}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t pt-5 text-sm text-ink-500">
              Category-wise commission rates are shared during seller onboarding, before your store goes live.
            </p>
          </div>

          <div className="rounded-lg border bg-brand-950 p-6 text-ink-300 sm:p-8">
            <Badge variant="brand" className="border-brand-700 bg-brand-900/60 text-brand-200">
              Included for every seller
            </Badge>
            <ul className="mt-5 space-y-3">
              {INCLUDED.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm">
                  <Check className="mt-0.5 size-[17px] shrink-0 text-brand-300" strokeWidth={2.4} />
                  <span className="text-brand-100">{item}</span>
                </li>
              ))}
            </ul>
            <Button variant="onInk" className="mt-7 w-full" asChild>
              <Link to="/register">Start Selling</Link>
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
