import { BadgeCheck, Headset, Lock, PackageSearch } from 'lucide-react'

import { Section, SectionHead } from '@/components/marketing/section'

/** No fabricated numerical claims during MVP — capability statements only. */
const INDICATORS = [
  { icon: BadgeCheck, title: 'Verified Sellers', body: 'Seller verification before marketplace activation.' },
  { icon: Lock, title: 'Secure Payments', body: 'Safe and reliable payment processing.' },
  { icon: PackageSearch, title: 'Transparent Orders', body: 'Clear tracking throughout the purchase journey.' },
  { icon: Headset, title: 'Seller Support', body: 'Simple onboarding and commerce management.' },
]

export function Trust() {
  return (
    <Section tone="muted" className="border-y">
      <div className="container-page">
        <SectionHead center title="Built for trustworthy commerce" />

        <div className="mt-12 grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {INDICATORS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-background text-teal-600 shadow-xs dark:text-teal-100">
                <Icon className="size-[22px]" />
              </span>
              <div>
                <h3 className="text-[15px]">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}
