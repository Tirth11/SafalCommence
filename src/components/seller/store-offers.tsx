import { useState } from 'react'
import { Check, ExternalLink, Plus, Sparkles, Tag, TriangleAlert } from 'lucide-react'
import { toast } from 'sonner'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { SELLER_OFFERS, SELLER_OFFER_POLICY, statusOf, type SellerOfferScope } from '@/data/offer-engine'
import {
  flattenCategories,
  saleSlug,
  STORE_BRANDS,
  STORE_COLLECTIONS,
  STORE_CATEGORY_TREE,
  TOTAL_STORE_PRODUCTS,
} from '@/data/store-catalogue'
import { useStorefrontStore } from '@/store/storefront-store'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   Online Store → Offers.

   A storefront sale is described as a rule, never a selection. "Everything
   in my store" is one radio button, and it keeps covering listings the
   seller adds tomorrow — which is the only version of this that survives a
   catalogue growing from 20 products to 50,000.
   ========================================================================== */

const SCOPES: { id: SellerOfferScope; label: string }[] = [
  { id: 'all', label: 'Everything in my store' },
  { id: 'category', label: 'Categories' },
  { id: 'collection', label: 'Collections' },
  { id: 'brand', label: 'Brands' },
  { id: 'products', label: 'Specific products' },
]

const PLACEMENTS = [
  { id: 'homepage', label: 'Homepage banner' },
  { id: 'product', label: 'Product pages' },
  { id: 'category', label: 'Category pages' },
  { id: 'cart', label: 'Cart' },
  { id: 'checkout', label: 'Checkout' },
  { id: 'assistant', label: 'Shopping assistant' },
]

export function StoreOffersTab() {
  const [creating, setCreating] = useState(false)
  const storeOffers = SELLER_OFFERS.filter((o) => o.seller === 'ABC Electronics' && o.form === 'campaign')

  if (creating) return <CreateStoreOffer onDone={() => setCreating(false)} />

  return (
    <div className="grid gap-4">
      <Panel
        title="Store offers"
        description="Sales that run on your own website. Rule-based, so new products join automatically."
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" />
            Create offer
          </Button>
        }
      >
        {storeOffers.length === 0 ? (
          <p className="text-[14px] text-ink-500">
            No sale is running. Create one and your storefront picks it up — banner, product pages and all.
          </p>
        ) : (
          <ul className="grid gap-3">
            {storeOffers.map((offer) => {
              const status = statusOf(offer)
              return (
                <li key={offer.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-ink-900 dark:text-white">
                        {offer.name ?? offer.displayName}
                      </p>
                      <p className="mt-0.5 text-[13px] text-ink-500">
                        {offer.value}% off ·{' '}
                        {offer.scope === 'all' ? 'entire store' : (offer.scopeValues ?? []).join(', ')} ·{' '}
                        {offer.startsAt.slice(0, 10)} → {offer.endsAt.slice(0, 10)}
                      </p>
                    </div>
                    <StatusBadge status={status === 'live' ? 'Live' : status === 'scheduled' ? 'Scheduled' : 'Expired'} />
                  </div>

                  {status === 'live' && (
                    <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3">
                      {/* Generated for every campaign — nothing to build by hand. */}
                      <a
                        href={`/offers/${saleSlug(offer.name ?? offer.displayName)}`}
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-600 dark:text-brand-300"
                      >
                        abcelectronics.safalmarkethub.store/offers/{saleSlug(offer.name ?? offer.displayName)}
                        <ExternalLink className="size-3.5" />
                      </a>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto h-8"
                        onClick={() => toast.success('Sale ended', { description: 'Regular prices are live again.' })}
                      >
                        End sale
                      </Button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

      <Panel title="How storefront sales behave">
        <ul className="grid gap-2.5 text-[13.5px] leading-relaxed text-ink-600 dark:text-ink-300">
          <Bullet>
            A sale is a rule. Products you add while it runs are included automatically, as long as they are active,
            selling on your website, and not excluded.
          </Bullet>
          <Bullet>
            When the sale goes live your storefront shows the announcement bar and campaign hero. Both disappear on
            their own when it ends — no theme edit, nothing to clean up.
          </Bullet>
          <Bullet>
            A product that already has its own markdown keeps the better of the two discounts. Discounts never
            multiply unless you explicitly allow it.
          </Bullet>
        </ul>
      </Panel>
    </div>
  )
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check className="mt-0.5 size-4 shrink-0 text-teal-600 dark:text-teal-100" />
      <span>{children}</span>
    </li>
  )
}

/* ------------------------------------------------------------ create form */

function CreateStoreOffer({ onDone }: { onDone: () => void }) {
  const { config } = useStorefrontStore()

  const [name, setName] = useState('Independence Day Sale')
  const [message, setMessage] = useState('Celebrate Independence Day with 10% OFF')
  const [percent, setPercent] = useState('10')
  const [scope, setScope] = useState<SellerOfferScope>('all')
  const [scopeValues, setScopeValues] = useState<string[]>([])
  const [exCategories, setExCategories] = useState<string[]>([])
  const [exAlreadyDiscounted, setExAlreadyDiscounted] = useState(false)
  const [placements, setPlacements] = useState<string[]>(PLACEMENTS.map((p) => p.id))
  const [starts, setStarts] = useState('2026-08-14T20:00')
  const [ends, setEnds] = useState('2026-08-15T23:59')
  const [published, setPublished] = useState(false)

  const value = Number(percent) || 0
  const overMax = value > SELLER_OFFER_POLICY.maxDiscountPercent
  const needsApproval = value > SELLER_OFFER_POLICY.approvalAbovePercent && !overMax

  // Rule-based, so the count comes from the catalogue rather than a checklist.
  const eligible = (() => {
    if (scope === 'all') return TOTAL_STORE_PRODUCTS
    if (scopeValues.length === 0) return 0
    const flat = flattenCategories()
    if (scope === 'category') {
      return scopeValues.reduce((sum, id) => sum + (flat.find((f) => f.node.id === id)?.node.count ?? 0), 0)
    }
    if (scope === 'collection') {
      return scopeValues.reduce((sum, id) => sum + (STORE_COLLECTIONS.find((c) => c.id === id)?.count ?? 0), 0)
    }
    return scopeValues.length * 42 // brands / products, indicative
  })()

  const excludedCount = exCategories.reduce((sum, id) => {
    const flat = flattenCategories()
    return sum + (flat.find((f) => f.node.id === id)?.node.count ?? 0)
  }, 0)

  const affected = Math.max(0, eligible - excludedCount);
  const alreadyOnPromotion = 86
  const blocked = overMax || affected === 0 || value <= 0

  const toggle = (list: string[], item: string, set: (next: string[]) => void) =>
    set(list.includes(item) ? list.filter((v) => v !== item) : [...list, item])

  if (published) {
    return (
      <Panel className="mx-auto max-w-[560px] text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100">
          <Check className="size-6" strokeWidth={2.6} />
        </span>
        <h2 className="mt-4 text-[20px]">{needsApproval ? 'Sent for approval' : 'Sale is live'}</h2>
        <p className="mx-auto mt-2 max-w-[420px] text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">
          {needsApproval
            ? 'Nothing has changed on your storefront yet — SafalMarketHub reviews deeper discounts first.'
            : `${affected.toLocaleString('en-US')} products now show the sale price. Your banner is live and the sale page is generated.`}
        </p>
        {!needsApproval && (
          <p className="mt-3 text-[12.5px] font-medium text-brand-600 dark:text-brand-300">
            {config.slug || 'yourstore'}.safalmarkethub.store/offers/{saleSlug(name)}
          </p>
        )}
        <Button className="mt-6" onClick={onDone}>
          Back to offers
        </Button>
      </Panel>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid gap-4">
        <Panel title="Create offer" description="Name it, price it, and say what it covers.">
          <div className="grid gap-4">
            <Field label="Offer name" hint="Shown on your banner and on every discounted product.">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Independence Day Sale" />
            </Field>
            <Field label="Customer message">
              <Textarea rows={2} value={message} onChange={(e) => setMessage(e.target.value)} />
            </Field>
            <Field label="Discount" required>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  className="max-w-[110px]"
                />
                <span className="text-[14px] text-ink-500">%</span>
              </div>
            </Field>
          </div>
        </Panel>

        <Panel title="Applies to" description="A rule, not a list. No product selection required.">
          <div className="grid gap-2.5">
            {SCOPES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setScope(option.id)
                  setScopeValues([])
                }}
                className={cn(
                  'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-[border-color,background-color]',
                  scope === option.id ? 'border-brand-600 bg-brand-50 dark:bg-brand-950' : 'hover:border-ink-400'
                )}
              >
                <span
                  className={cn(
                    'grid size-4 shrink-0 place-items-center rounded-full border-2',
                    scope === option.id ? 'border-brand-600' : 'border-ink-300'
                  )}
                >
                  {scope === option.id && <span className="size-2 rounded-full bg-brand-600" />}
                </span>
                <span className="text-[14px] font-medium">{option.label}</span>
              </button>
            ))}
          </div>

          {scope === 'category' && (
            <div className="mt-4 max-h-[260px] overflow-y-auto rounded-lg border p-3">
              {flattenCategories().map(({ node, depth }) => (
                <label
                  key={node.id}
                  className="flex items-center gap-2.5 py-1.5 text-[13px]"
                  style={{ paddingLeft: depth * 18 }}
                >
                  <Checkbox
                    checked={scopeValues.includes(node.id)}
                    onCheckedChange={() => toggle(scopeValues, node.id, setScopeValues)}
                  />
                  <span>{node.label}</span>
                  <span className="text-[11px] text-ink-400">{node.count}</span>
                </label>
              ))}
            </div>
          )}

          {scope === 'collection' && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {STORE_COLLECTIONS.map((c) => (
                <label key={c.id} className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px]">
                  <Checkbox
                    checked={scopeValues.includes(c.id)}
                    onCheckedChange={() => toggle(scopeValues, c.id, setScopeValues)}
                  />
                  {c.label}
                  <span className="ml-auto text-[11px] text-ink-400">{c.count}</span>
                </label>
              ))}
            </div>
          )}

          {scope === 'brand' && (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {STORE_BRANDS.map((brand) => (
                <label key={brand} className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px]">
                  <Checkbox
                    checked={scopeValues.includes(brand)}
                    onCheckedChange={() => toggle(scopeValues, brand, setScopeValues)}
                  />
                  <span className="truncate">{brand}</span>
                </label>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Exclusions" description="Optional. Anything here stays at its normal price.">
          <div className="grid gap-2 sm:grid-cols-2">
            {STORE_CATEGORY_TREE.map((c) => (
              <label key={c.id} className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px]">
                <Checkbox
                  checked={exCategories.includes(c.id)}
                  onCheckedChange={() => toggle(exCategories, c.id, setExCategories)}
                />
                <span className="truncate">{c.label}</span>
                <span className="ml-auto text-[11px] text-ink-400">{c.count}</span>
              </label>
            ))}
          </div>

          <label className="mt-3 flex items-start gap-3 rounded-lg border p-3.5">
            <Checkbox
              checked={exAlreadyDiscounted}
              onCheckedChange={(v) => setExAlreadyDiscounted(v === true)}
              className="mt-0.5"
            />
            <span>
              <span className="block text-[14px] font-medium">Exclude already-discounted products</span>
              <span className="mt-0.5 block text-[12px] text-ink-500">
                {alreadyOnPromotion} products currently carry their own markdown. Left on, they keep the better of the
                two discounts.
              </span>
            </span>
          </label>
        </Panel>

        <Panel title="Duration">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starts">
              <Input type="datetime-local" value={starts} onChange={(e) => setStarts(e.target.value)} />
            </Field>
            <Field label="Ends">
              <Input type="datetime-local" value={ends} onChange={(e) => setEnds(e.target.value)} />
            </Field>
          </div>
        </Panel>

        <Panel title="Show on" description="Configure once — every surface reads the same rule.">
          <div className="grid gap-2 sm:grid-cols-2">
            {PLACEMENTS.map((placement) => (
              <label
                key={placement.id}
                className="flex items-center gap-2.5 rounded-lg border px-3.5 py-3 text-[14px]"
              >
                <Checkbox
                  checked={placements.includes(placement.id)}
                  onCheckedChange={() => toggle(placements, placement.id, setPlacements)}
                />
                {placement.label}
              </label>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid content-start gap-4">
        {/* The two facts that decide whether the sale is a good idea. */}
        <Panel title="Promotion summary">
          <dl className="grid gap-2 text-[13px]">
            <Row label="Products affected" value={affected.toLocaleString('en-US')} strong />
            <Row label="Average selling price" value={money(58)} />
            <Row label="Discount" value={`${value}%`} />
            <Row label="Already on promotion" value={String(alreadyOnPromotion)} />
          </dl>

          <p className="mt-3 border-t pt-3 text-[12px] leading-relaxed text-ink-500">
            Products you add while this runs are included automatically — active, selling on your website, and not
            excluded.
          </p>
        </Panel>

        <Panel title="Existing discounts" description="What happens where they overlap.">
          <p className="rounded-lg bg-teal-50 p-3 text-[12.5px] leading-relaxed text-teal-800 dark:bg-teal-600/15 dark:text-teal-100">
            <strong>Better single discount</strong> — a product already at 15% off keeps 15%, not 23.5%. Change this
            per campaign in Promotions if you need them to combine.
          </p>
        </Panel>

        {overMax && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertTitle>Above the {SELLER_OFFER_POLICY.maxDiscountPercent}% maximum</AlertTitle>
            <AlertDescription>Lower the discount to publish.</AlertDescription>
          </Alert>
        )}
        {needsApproval && (
          <Alert variant="warning">
            <TriangleAlert />
            <AlertTitle>Needs approval</AlertTitle>
            <AlertDescription>
              Above {SELLER_OFFER_POLICY.approvalAbovePercent}%, SafalMarketHub reviews before it reaches customers.
            </AlertDescription>
          </Alert>
        )}
        {affected === 0 && (
          <Alert variant="warning">
            <TriangleAlert />
            <AlertTitle>Nothing matches yet</AlertTitle>
            <AlertDescription>Pick a scope, or loosen the exclusions.</AlertDescription>
          </Alert>
        )}

        <Panel title="What customers will see">
          <div className="rounded-lg bg-ink-950 p-4 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-300">{name || 'Your sale'}</p>
            <p className="mt-1.5 text-[20px] font-bold leading-tight text-white">{value}% OFF EVERYTHING*</p>
            <p className="mt-1 text-[12px] text-ink-300">{message}</p>
            <p className="mt-2 text-[9.5px] text-ink-500">*Applicable products. Terms apply.</p>
          </div>
          <p className="mt-2 text-[11px] text-ink-500">
            Plus an announcement bar and a generated sale page at /offers/{saleSlug(name || 'sale')}.
          </p>
        </Panel>

        <div className="grid gap-2">
          <Button
            disabled={blocked}
            onClick={() => {
              setPublished(true)
              toast.success(needsApproval ? 'Sent for approval' : 'Sale published', { description: name })
            }}
          >
            <Sparkles className="size-4" />
            {needsApproval ? 'Submit for approval' : `Publish to ${affected.toLocaleString('en-US')} products`}
          </Button>
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- pieces */

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[13px]">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </Label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-ink-500">{hint}</p>}
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className={cn('tabular', strong ? 'text-[16px] font-bold text-ink-950 dark:text-white' : 'font-semibold')}>
        {value}
      </dd>
    </div>
  )
}

export { Tag }
