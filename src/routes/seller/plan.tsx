import { useState } from 'react'
import { Check, Minus, Sparkles, TrendingUp, X } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink } from '@/components/admin/admin-link'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { Button } from '@/components/ui/button'
import { PLAN_FEATURES, PLANS, type PlanId } from '@/data/plans'
import { SELLER_PRODUCTS } from '@/data/seller'
import { usePlan, useStorefrontStore } from '@/store/storefront-store'
import { cn, money } from '@/lib/utils'

/** Plan & billing: what the seller is on, what they'd gain, and what it costs. */
export function SellerPlanPage() {
  const plan = usePlan()
  const changePlan = useStorefrontStore((s) => s.changePlan)
  const { config, ask, open, setOpen } = useActionDialog()
  // The plan being confirmed rides alongside the shared dialog.
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null)

  const productCount = SELLER_PRODUCTS.length
  const limit = plan.productLimit === 'Unlimited' ? Infinity : plan.productLimit
  const usedPct = limit === Infinity ? 0 : Math.min(100, Math.round((productCount / limit) * 100))

  return (
    <>
      <PageHeader
        title="Plan & billing"
        description="Your subscription decides your commission, your product limit and whether you get your own storefront."
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Plan & Billing', to: '/seller/plan' }]}
      />

      {/* Current plan */}
      <Panel
        title="Current plan"
        actions={
          plan.id !== 'business' && (
            <Button size="sm" asChild>
              <a href="#plans">Upgrade plan</a>
            </Button>
          )
        }
      >
        <div className="grid gap-6 sm:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="flex flex-wrap items-baseline gap-3">
              <span className="text-[28px] font-bold leading-none tracking-[-0.03em] text-ink-950 dark:text-white">
                {plan.name}
              </span>
              <span className="text-[15px] text-ink-500 tabular">
                {plan.price === 0 ? 'Free' : `${money(plan.price)}/month`}
              </span>
            </p>
            <p className="mt-2 text-[13px] text-ink-600 dark:text-ink-300">{plan.tagline}</p>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t pt-5 sm:grid-cols-3">
              <Stat label="Marketplace commission" value={`${plan.commission}%`} />
              <Stat
                label="Own-store fee"
                value={plan.ownStoreFee === null ? '—' : `${plan.ownStoreFee}%`}
                hint={plan.ownStoreFee === null ? 'No storefront on this plan' : undefined}
              />
              <Stat label="Staff accounts" value={String(plan.staff)} />
            </dl>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Product usage</p>
            <p className="mt-2 text-[19px] font-bold tabular text-ink-950 dark:text-white">
              {productCount}
              <span className="text-[13px] font-normal text-ink-500"> / {String(plan.productLimit)}</span>
            </p>
            {limit !== Infinity && (
              <>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-200 dark:bg-secondary">
                  <div
                    className={cn('h-full rounded-full', usedPct > 85 ? 'bg-gold-500' : 'bg-brand-600')}
                    style={{ width: `${Math.max(usedPct, 4)}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-ink-500">
                  {usedPct > 85 ? 'Close to your limit — upgrade to keep listing.' : `${usedPct}% of your plan limit used.`}
                </p>
              </>
            )}
          </div>
        </div>
      </Panel>

      {/* Upgrade path */}
      <section id="plans" className="mt-6 scroll-mt-24">
        <h2 className="text-[17px] font-semibold">Choose a plan</h2>
        <p className="mt-1 text-[13px] text-ink-500">
          Change any time. Upgrades apply immediately; downgrades take effect at the end of the billing period.
        </p>

        <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((option) => {
            const current = option.id === plan.id
            const isUpgrade = option.price > plan.price
            return (
              <div
                key={option.id}
                className={cn(
                  'relative flex flex-col rounded-lg border bg-card p-5 shadow-xs',
                  current && 'border-brand-600 ring-1 ring-brand-600/20',
                  option.popular && !current && 'border-brand-200'
                )}
              >
                {option.popular && !current && (
                  <span className="absolute -top-2.5 left-5 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                    <Sparkles className="size-3" />
                    Popular
                  </span>
                )}
                {current && (
                  <span className="absolute -top-2.5 left-5 rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                    Current plan
                  </span>
                )}

                <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-ink-400">{option.name}</p>
                <p className="mt-2 text-[26px] font-bold leading-none tabular text-ink-950 dark:text-white">
                  {option.priceLabel}
                  {option.price > 0 && <span className="text-[13px] font-normal text-ink-500">/mo</span>}
                </p>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-500">{option.bestFor}</p>

                <ul className="mt-4 grid flex-1 gap-2">
                  <li className="text-[12px] text-ink-700 dark:text-ink-200">
                    <span className="font-bold tabular">{option.commission}%</span> marketplace commission
                  </li>
                  <li className="text-[12px] text-ink-700 dark:text-ink-200">
                    <span className="font-bold tabular">{String(option.productLimit)}</span> products
                  </li>
                  <li className="text-[12px] text-ink-700 dark:text-ink-200">
                    {option.whiteLabel ? (
                      <>
                        Own storefront ·{' '}
                        <span className="font-bold tabular">{option.ownStoreFee}%</span> fee
                      </>
                    ) : (
                      'Marketplace only'
                    )}
                  </li>
                  {option.customDomain && <li className="text-[12px] text-ink-700 dark:text-ink-200">Custom domain</li>}
                </ul>

                <Button
                  size="sm"
                  variant={current ? 'outline' : option.popular ? 'default' : 'outline'}
                  className="mt-5 w-full"
                  disabled={current}
                  onClick={() => {
                    setPendingPlan(option.id)
                    ask({
                      title: isUpgrade ? `Upgrade to ${option.name}?` : `Switch to ${option.name}?`,
                      description: isUpgrade
                        ? `${money(option.price)}/month, billed monthly. Your commission drops to ${option.commission}% and ${
                            option.whiteLabel ? 'your online store unlocks immediately.' : 'your product limit rises.'
                          }`
                        : `Your plan will change to ${option.name}. ${
                            !option.whiteLabel
                              ? 'Your online store will be taken offline and any connected domain disconnected.'
                              : `Your commission becomes ${option.commission}%.`
                          }`,
                      confirmLabel: isUpgrade ? `Upgrade to ${option.name}` : `Switch to ${option.name}`,
                      destructive: !isUpgrade,
                      requireNote: false,
                      successMessage: `You're on ${option.name}`,
                    })
                  }}
                >
                  {current ? 'Current plan' : isUpgrade ? 'Upgrade' : 'Switch'}
                </Button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Why the two fees differ */}
      <Panel className="mt-6" title="How the fees work">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-lg border p-4">
            <p className="text-[13px] font-semibold text-ink-900 dark:text-white">
              SafalMarketHub brings the customer
            </p>
            <p className="mt-1.5 text-[12px] text-ink-500">A marketplace sale of {money(10000)}</p>
            <p className="mt-3 text-[13px] tabular text-ink-700 dark:text-ink-200">
              Commission {plan.commission}% ={' '}
              <span className="font-bold text-destructive">− {money((10000 * plan.commission) / 100)}</span>
            </p>
            <p className="mt-1 text-[15px] font-bold tabular text-ink-950 dark:text-white">
              You get {money(10000 - (10000 * plan.commission) / 100)}
            </p>
          </div>
          <div className="rounded-lg border border-teal-200 p-4 dark:border-teal-600/40">
            <p className="text-[13px] font-semibold text-ink-900 dark:text-white">You bring the customer</p>
            <p className="mt-1.5 text-[12px] text-ink-500">The same sale on your own storefront</p>
            {plan.ownStoreFee === null ? (
              <p className="mt-3 text-[13px] text-ink-500">Upgrade to Growth or above to sell on your own store.</p>
            ) : (
              <>
                <p className="mt-3 text-[13px] tabular text-ink-700 dark:text-ink-200">
                  Platform fee {plan.ownStoreFee}% ={' '}
                  <span className="font-bold text-destructive">− {money((10000 * plan.ownStoreFee) / 100)}</span>
                </p>
                <p className="mt-1 text-[15px] font-bold tabular text-ink-950 dark:text-white">
                  You get {money(10000 - (10000 * plan.ownStoreFee) / 100)}
                </p>
              </>
            )}
          </div>
        </div>
        <p className="mt-4 text-[12px] text-ink-500">
          Payment-gateway charges are billed separately and shown on every settlement.
        </p>
      </Panel>

      {/* Full matrix */}
      <Panel className="mt-6" title="Everything in each plan" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-muted/60">
              <tr>
                <th className="px-5 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-center text-[12px] font-bold text-ink-900 dark:text-white">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES.map((feature) => (
                <tr key={feature.label} className="border-t">
                  <th scope="row" className="px-5 py-2.5 text-left font-medium text-ink-700 dark:text-ink-200">
                    {feature.label}
                  </th>
                  {PLANS.map((p) => {
                    const value = feature.value(p)
                    return (
                      <td key={p.id} className={cn('px-4 py-2.5 text-center', p.id === plan.id && 'bg-brand-50/50 dark:bg-brand-950/40')}>
                        {value === true ? (
                          <Check className="mx-auto size-4 text-teal-500" strokeWidth={3} />
                        ) : value === false ? (
                          <X className="mx-auto size-4 text-ink-300" />
                        ) : value === '—' ? (
                          <Minus className="mx-auto size-4 text-ink-300" />
                        ) : (
                          <span className="font-semibold tabular">{value}</span>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="mt-6 flex items-start gap-2 text-[12px] text-ink-500">
        <TrendingUp className="mt-0.5 size-4 shrink-0" />
        Need more than Business? <AdminLink to="/seller/support" className="font-semibold underline">Talk to sales</AdminLink> about
        multiple storefronts, ERP integration and a negotiated commission.
      </p>

      <ActionDialog
        config={config}
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => {
          if (pendingPlan) {
            changePlan(pendingPlan)
            setPendingPlan(null)
          }
        }}
      />
    </>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</dt>
      <dd className="mt-1 text-[19px] font-bold tabular text-ink-950 dark:text-white">{value}</dd>
      {hint && <dd className="text-[11px] text-ink-500">{hint}</dd>}
    </div>
  )
}
