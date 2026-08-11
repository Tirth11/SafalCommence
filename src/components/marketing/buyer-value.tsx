import { Compass, ShieldCheck, Truck } from 'lucide-react'

import { Section, SectionHead } from '@/components/marketing/section'
import { Button } from '@/components/ui/button'

const BENEFITS = [
  { icon: Compass, title: 'Discover', body: 'Browse products from multiple sellers.' },
  { icon: ShieldCheck, title: 'Secure Checkout', body: 'Purchase using trusted payment methods.' },
  { icon: Truck, title: 'Track Everything', body: 'Follow your order from confirmation to delivery.' },
]

export function BuyerValue() {
  return (
    <Section tone="muted" className="border-y">
      <div className="container-page">
        <SectionHead center eyebrow="For customers" title="Shopping made easier" />

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-lg border bg-card p-6 text-center sm:p-7">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-200">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-lg">{title}</h3>
              <p className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-ink-600 dark:text-ink-300">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <a href="#marketplace">Start Shopping</a>
          </Button>
        </div>
      </div>
    </Section>
  )
}
