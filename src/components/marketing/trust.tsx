import { BadgeCheck, Headset, Lock, PackageSearch, RotateCcw, Truck } from 'lucide-react'

import { EditorialHeading, Reveal } from '@/components/marketing/reveal'

/** Capability statements only — no invented seller or customer counts. */
const INDICATORS = [
  { icon: BadgeCheck, title: 'Verified sellers', body: 'Every business is checked — documents, GST and bank account — before their products go live.' },
  { icon: Lock, title: 'Secure payments', body: 'Payments run through a certified gateway. We never see or store your card details.' },
  { icon: PackageSearch, title: 'Transparent orders', body: 'Clear status at every step, from confirmation to the courier at your door.' },
  { icon: RotateCcw, title: 'Straightforward returns', body: 'Eligible products can be returned within 7 days, with the refund tracked end to end.' },
  { icon: Truck, title: 'Reliable delivery', body: 'Serviceability is checked against your PIN code before you pay, not after.' },
  { icon: Headset, title: 'Real support', body: 'One place to raise an issue about any order, from any seller.' },
]

export function Trust() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container-page">
        <Reveal>
          <EditorialHeading
            center
            eyebrow="Built on trust"
            title="Confidence on both sides of the sale."
            sub="Buyers need to know the product is real. Sellers need to know the money arrives. Both are designed in, not added later."
          />
        </Reveal>

        <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {INDICATORS.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 0.06}>
              <div>
                <span className="grid size-11 place-items-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100">
                  <item.icon className="size-[22px]" />
                </span>
                <h3 className="mt-4 text-[17px] tracking-[-0.01em]">{item.title}</h3>
                <p className="mt-2 max-w-[320px] text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
