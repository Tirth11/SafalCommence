import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, Minus, Sparkles, Store, X } from 'lucide-react'

import { EditorialHeading, Reveal } from '@/components/marketing/reveal'
import { Button } from '@/components/ui/button'
import { PLAN_FEATURES, PLANS, TRIAL_DAYS } from '@/data/plans'
import { cn, money } from '@/lib/utils'

/**
 * Hybrid model, stated plainly: free to join the marketplace, subscribe when
 * you want your own storefront. The fee split is the story — we charge a
 * commission when we bring the customer, and a small platform fee when the
 * seller does.
 */
export function Pricing() {
  const [showAll, setShowAll] = useState(false)
  // All three tiers fit on one row; anything larger is a sales conversation.
  const visible = PLANS

  return (
    <section id="pricing" className="scroll-mt-24 border-y bg-muted/40 py-16 sm:py-24 dark:bg-card/30">
      <div className="container-wide">
        <Reveal>
          <EditorialHeading
            center
            eyebrow="Seller pricing"
            title="Start free. Grow into your own brand."
            sub="Sell on the marketplace at no monthly cost. When you're ready for your own storefront, subscribe — and pay us far less on the customers you bring yourself."
          />
        </Reveal>

        {/* The trial removes the leap of faith: build first, pay to publish. */}
        <Reveal delay={0.04}>
          <p className="mx-auto mt-8 flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border bg-card px-4 py-2 text-[13px] font-semibold text-ink-700 shadow-xs dark:text-ink-200">
            <Sparkles className="size-4 text-brand-600 dark:text-brand-300" />
            Try your online store free for {TRIAL_DAYS} days — no card required
          </p>
        </Reveal>

        {/* Plan cards */}
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {visible.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.08}>
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-3xl border bg-card p-6 shadow-xs sm:p-7',
                  plan.popular && 'border-brand-600 shadow-lg ring-1 ring-brand-600/20'
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-7 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                    <Sparkles className="size-3" />
                    Most popular
                  </span>
                )}

                <p className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink-400">{plan.name}</p>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-[40px] font-bold leading-none tracking-[-0.04em] text-ink-950 tabular dark:text-white">
                    {plan.priceLabel}
                  </span>
                  {plan.price > 0 && <span className="text-[15px] text-ink-500">/month</span>}
                </p>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">{plan.tagline}</p>

                {/* The two numbers that decide the economics */}
                <dl className="mt-5 grid grid-cols-2 gap-3 border-y py-4">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Marketplace</dt>
                    <dd className="mt-1 text-[19px] font-bold tabular text-ink-950 dark:text-white">{plan.commission}%</dd>
                    <dd className="text-[11px] text-ink-500">commission</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Own store</dt>
                    <dd className="mt-1 text-[19px] font-bold tabular text-ink-950 dark:text-white">
                      {plan.ownStoreFee === null ? '—' : `${plan.ownStoreFee}%`}
                    </dd>
                    <dd className="text-[11px] text-ink-500">{plan.ownStoreFee === null ? 'not included' : 'platform fee'}</dd>
                  </div>
                </dl>

                <ul className="mt-5 grid flex-1 gap-2.5">
                  {plan.highlights.map((item) => (
                    <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-ink-700 dark:text-ink-200">
                      <Check className="mt-0.5 size-4 shrink-0 text-teal-500" strokeWidth={2.6} />
                      {item}
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  variant={plan.popular ? 'default' : 'outline'}
                  className="mt-7 w-full"
                  asChild
                >
                  <Link to="/register">{plan.price === 0 ? 'Start free' : `Choose ${plan.name}`}</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Enterprise */}
        <Reveal delay={0.1}>
          <div className="mt-5 flex flex-wrap items-center gap-6 rounded-3xl border bg-ink-950 p-6 sm:p-8">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-brand-300">Enterprise</p>
              <h3 className="mt-2 text-[22px] tracking-[-0.02em] text-white sm:text-[26px]">
                Unlimited products, API access, negotiated rates
              </h3>
              <p className="mt-2.5 max-w-[620px] text-[14px] leading-relaxed text-ink-300">
                Custom pricing for multiple storefronts, advanced roles, ERP integration, custom checkout and dedicated
                support — including a negotiated marketplace commission.
              </p>
            </div>
            <Button size="lg" variant="onInk" asChild>
              <Link to="/register">Contact sales</Link>
            </Button>
          </div>
        </Reveal>

        {/* The fee split, worked through */}
        <Reveal delay={0.12}>
          <div className="mt-12 grid gap-4 lg:grid-cols-2">
            <FeeExample
              title="We bring the customer"
              subtitle="A sale on the SafalMarketHub marketplace"
              rows={[
                { label: 'Product price', value: money(1000) },
                { label: 'Marketplace commission (6% on Pro)', value: `− ${money(60)}`, negative: true },
                { label: 'You receive', value: money(940), total: true },
              ]}
              note="Commission covers the customer we introduced, the checkout, support and settlement."
            />
            <FeeExample
              title="You bring the customer"
              subtitle="The same sale on your own storefront"
              accent
              rows={[
                { label: 'Product price', value: money(1000) },
                { label: 'Platform fee (1% on Pro)', value: `− ${money(10)}`, negative: true },
                { label: 'You receive', value: money(990), total: true },
              ]}
              note="You already pay a subscription, so we take a fraction. Payment-gateway charges are separate."
            />
          </div>
        </Reveal>

        {/* Full comparison */}
        <div className="mt-12 text-center">
          <Button variant="outline" onClick={() => setShowAll((v) => !v)}>
            {showAll ? 'Hide full comparison' : 'Compare all plans'}
            <ArrowRight className={cn('size-4 transition-transform', showAll && 'rotate-90')} />
          </Button>
        </div>

        {showAll && (
          <div className="mt-8 overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[760px] text-left text-[13px]">
              <thead className="bg-muted/60">
                <tr>
                  <th className="sticky left-0 z-10 bg-muted/60 px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
                    Feature
                  </th>
                  {PLANS.map((plan) => (
                    <th key={plan.id} className="px-4 py-3.5 text-center">
                      <span className="block text-[13px] font-bold text-ink-900 dark:text-white">{plan.name}</span>
                      <span className="block text-[11px] font-normal text-ink-500">{plan.bestFor}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PLAN_FEATURES.map((feature) => (
                  <tr key={feature.label} className="border-t">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-card px-5 py-3 text-left text-[13px] font-medium text-ink-700 dark:text-ink-200"
                    >
                      {feature.label}
                      {feature.note && <span className="block text-[11px] font-normal text-ink-400">{feature.note}</span>}
                    </th>
                    {PLANS.map((plan) => {
                      const value = feature.value(plan)
                      return (
                        <td key={plan.id} className="px-4 py-3 text-center">
                          {value === true ? (
                            <Check className="mx-auto size-4 text-teal-500" strokeWidth={3} />
                          ) : value === false ? (
                            <X className="mx-auto size-4 text-ink-300" />
                          ) : value === '—' ? (
                            <Minus className="mx-auto size-4 text-ink-300" />
                          ) : (
                            <span className="font-semibold tabular text-ink-900 dark:text-white">{value}</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-8 flex items-start justify-center gap-2 text-center text-[12px] text-ink-500">
          <Store className="mt-0.5 size-4 shrink-0" />
          One catalogue behind every channel: list a product once, choose where it sells, and keep a single shared stock
          count.
        </p>
      </div>
    </section>
  )
}

function FeeExample({
  title,
  subtitle,
  rows,
  note,
  accent,
}: {
  title: string
  subtitle: string
  rows: { label: string; value: string; negative?: boolean; total?: boolean }[]
  note: string
  accent?: boolean
}) {
  return (
    <div className={cn('rounded-2xl border bg-card p-6', accent && 'border-teal-200 dark:border-teal-600/40')}>
      <p className="text-[15px] font-semibold text-ink-900 dark:text-white">{title}</p>
      <p className="mt-0.5 text-[13px] text-ink-500">{subtitle}</p>
      <dl className="mt-4 divide-y">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className={cn('text-[13px] text-ink-600 dark:text-ink-300', row.total && 'font-semibold text-ink-900 dark:text-white')}>
              {row.label}
            </dt>
            <dd
              className={cn(
                'shrink-0 font-semibold tabular',
                row.negative && 'text-destructive',
                row.total ? 'text-[19px] font-bold text-ink-950 dark:text-white' : 'text-[13px]'
              )}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 border-t pt-3 text-[12px] leading-relaxed text-ink-500">{note}</p>
    </div>
  )
}
