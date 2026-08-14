import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Check, Eye, Pause, Plus, Sparkles, Tag, TrendingUp, TriangleAlert, X } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { EmptyState, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { useSellerAssistant } from '@/components/seller/seller-assistant'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SELLER_PRODUCTS } from '@/data/seller'
import { SHOP_CATEGORIES, SHOP_PRODUCTS } from '@/data/shop'
import {
  campaignImpact,
  CONFLICT_RULE_LABELS,
  conversionRate,
  SELLER_OFFERS,
  SELLER_OFFER_POLICY,
  SELLER_SCOPE_LABELS,
  statusOf,
  type DiscountConflictRule,
  type SellerOfferScope,
} from '@/data/offer-engine'
import { usePlan } from '@/store/storefront-store'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   Seller promotions.

   A seller decides how much discount to give on their own products. The
   platform decides the limits they work inside — and this screen reads those
   limits rather than inventing its own, so a policy change in admin lands
   here without a code change.

   Two things happen before anything is published: the seller sees what the
   discount does to their margin and their market position, and they confirm
   a price change explicitly. Both exist because a promotion is a commercial
   commitment, not a setting.
   ========================================================================== */

const TABS = [
  { value: 'campaigns', label: 'Campaigns' },
  { value: 'products', label: 'Product offers' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'pending', label: 'Awaiting approval' },
  { value: 'ended', label: 'Ended' },
]

export function SellerPromotionsPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const assistant = useSellerAssistant()
  const tab = search.tab ?? 'campaigns'

  const mine = SELLER_OFFERS.filter((o) => o.seller === 'ABC Electronics')
  const rows = mine.filter((offer) => {
    const status = statusOf(offer)
    if (tab === 'campaigns') return offer.form === 'campaign' && status === 'live'
    if (tab === 'products') return offer.form === 'product' && status === 'live'
    if (tab === 'scheduled') return status === 'scheduled'
    if (tab === 'pending') return status === 'pending-approval'
    return status === 'expired' || status === 'rejected'
  })

  return (
    <>
      <PageHeader
        title="Promotions"
        description="Discounts on your own products. SafalMarketHub campaigns run separately and may stack with these."
        breadcrumb={[
          { label: 'Dashboard', to: '/seller' },
          { label: 'Promotions', to: '/seller/promotions' },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => assistant.open('Create an offer')}>
              <Sparkles className="size-4" />
              Ask the assistant
            </Button>
            <Button size="sm" asChild>
              <AdminLink to="/seller/promotions/new">
                <Plus className="size-4" />
                Create campaign
              </AdminLink>
            </Button>
          </div>
        }
      />

      <Panel className="mb-5" title="What you can do" description="Set by SafalMarketHub for every seller.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Limit label="Maximum discount" value={`${SELLER_OFFER_POLICY.maxDiscountPercent}%`} />
          <Limit label="Maximum duration" value={`${SELLER_OFFER_POLICY.maxDurationDays} days`} />
          <Limit
            label="Needs approval above"
            value={`${SELLER_OFFER_POLICY.approvalAbovePercent}%`}
            note="Below this, publishes instantly"
          />
        </div>
      </Panel>

      <Tabs
        value={tab}
        onValueChange={(value) => navigate(adminLinkProps({ to: '/seller/promotions', search: { tab: value } }))}
      >
        <TabsList className="mb-4">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Panel padded={false}>
        {rows.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="Nothing here"
            body={
              tab === 'products'
                ? 'Add an offer from any product row to discount a single listing.'
                : 'Campaigns are named, dated promotions across several products.'
            }
            action={
              <Button size="sm" asChild>
                <AdminLink to={tab === 'products' ? '/seller/products' : '/seller/promotions/new'}>
                  {tab === 'products' ? 'Go to products' : 'Create a campaign'}
                </AdminLink>
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promotion</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((offer) => {
                const status = statusOf(offer)
                return (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <p className="font-medium text-ink-900 dark:text-white">
                        {offer.name ?? offer.displayName}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-ink-500">
                        <span
                          className={cn(
                            'rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]',
                            offer.form === 'campaign'
                              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                              : 'bg-muted text-ink-600 dark:text-ink-300'
                          )}
                        >
                          {offer.form === 'campaign' ? 'Campaign' : 'Product offer'}
                        </span>
                        {offer.startsAt.slice(0, 10)} → {offer.endsAt.slice(0, 10)}
                      </p>
                    </TableCell>
                    <TableCell className="text-[13px]">
                      {offer.productIds.map(productName).join(', ')}
                    </TableCell>
                    <TableCell className="text-right tabular">{offer.metrics.views.toLocaleString('en-US')}</TableCell>
                    <TableCell className="text-right tabular">{offer.metrics.orders}</TableCell>
                    <TableCell className="text-right tabular">{money(offer.metrics.gmv)}</TableCell>
                    <TableCell>
                      <StatusBadge status={statusLabel(status)} />
                    </TableCell>
                    <TableCell className="text-right">
                      {status === 'live' ? (
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8"
                            onClick={() => toast.success('Promotion paused', { description: offer.displayName })}
                          >
                            <Pause className="size-3.5" />
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-red-600 dark:text-red-300"
                            onClick={() =>
                              toast.success('Promotion ended', {
                                description: 'The regular price is live again.',
                              })
                            }
                          >
                            End
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[12px] text-ink-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Panel>

      {tab === 'campaigns' && rows.length > 0 && (
        <Panel className="mt-4" title="How it's doing" description="Compared with the two weeks before the promotion.">
          {rows.map((offer) => (
            <div key={offer.id} className="grid gap-3 sm:grid-cols-4">
              <Stat icon={Eye} label="Views" value={offer.metrics.views.toLocaleString('en-US')} />
              <Stat icon={TrendingUp} label="Product visits" value={offer.metrics.clicks.toLocaleString('en-US')} />
              <Stat icon={Tag} label="Orders" value={String(offer.metrics.orders)} />
              <Stat icon={TrendingUp} label="Conversion" value={`${conversionRate(offer.metrics)}%`} />
            </div>
          ))}
        </Panel>
      )}
    </>
  )
}

/* ------------------------------------------------------------ create form */

export function SellerPromotionFormPage() {
  const navigate = useNavigate()
  const plan = usePlan()

  const [name, setName] = useState('Independence Day Sale')
  const [message, setMessage] = useState('Celebrate with 10% off storewide')
  const [scope, setScope] = useState<SellerOfferScope>('all')
  const [scopeValues, setScopeValues] = useState<string[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [exCategories, setExCategories] = useState<string[]>([])
  const [exAlreadyDiscounted, setExAlreadyDiscounted] = useState(false)
  const [conflictRule, setConflictRule] = useState<DiscountConflictRule>('best-single')
  const [discount, setDiscount] = useState('10')
  const [days, setDays] = useState('2')
  const [published, setPublished] = useState<'no' | 'live' | 'pending'>('no')

  const percent = Number(discount) || 0
  const duration = Number(days) || 0

  const exclusions = {
    categories: exCategories,
    brands: [],
    productIds: [],
    alreadyDiscounted: exAlreadyDiscounted,
  }

  const impact = campaignImpact({
    seller: 'ABC Electronics',
    scope,
    scopeValues,
    productIds: selected,
    exclusions,
    percent,
  })

  const overMax = percent > SELLER_OFFER_POLICY.maxDiscountPercent
  const overDuration = duration > SELLER_OFFER_POLICY.maxDurationDays
  const needsApproval = percent > SELLER_OFFER_POLICY.approvalAbovePercent && !overMax
  const noProducts = impact.count === 0
  const blocked = overMax || overDuration || noProducts || percent <= 0

  if (published !== 'no') {
    return (
      <PromotionPublished
        pending={published === 'pending'}
        count={impact.count}
        onDone={() => navigate(adminLinkProps({ to: '/seller/promotions' }))}
      />
    )
  }

  const toggle = (list: string[], item: string, set: (next: string[]) => void) =>
    set(list.includes(item) ? list.filter((v) => v !== item) : [...list, item])

  return (
    <>
      <PageHeader
        title="Create campaign"
        description="A named, dated promotion across your catalogue."
        breadcrumb={[
          { label: 'Dashboard', to: '/seller' },
          { label: 'Promotions', to: '/seller/promotions' },
          { label: 'Create campaign', to: '/seller/promotions/new' },
        ]}
      />

      <Alert className="mb-5">
        <Sparkles />
        <AlertTitle>Discounting just one product?</AlertTitle>
        <AlertDescription>
          Use <strong>Add offer</strong> on the product row instead. Campaigns are for named promotions across many
          products.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <Panel title="Name the campaign" description="Customers see this on the banner and on every discounted product.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-[13px]">Campaign name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Independence Day Sale" />
              </div>
              <div>
                <Label className="mb-1.5 block text-[13px]">Discount %</Label>
                <Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label className="mb-1.5 block text-[13px]">Customer message</Label>
                <Input value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
            </div>
          </Panel>

          {/* Scope, not selection. A seller with 5,000 listings should never
              tick boxes to say "everything". */}
          <Panel title="Applies to" description="A rule, not a list — products added later are included automatically.">
            <div className="grid gap-2.5">
              {(Object.keys(SELLER_SCOPE_LABELS) as SellerOfferScope[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setScope(option)
                    setScopeValues([])
                    setSelected([])
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-[border-color,background-color]',
                    scope === option ? 'border-brand-600 bg-brand-50 dark:bg-brand-950' : 'hover:border-ink-400'
                  )}
                >
                  <span
                    className={cn(
                      'grid size-4 shrink-0 place-items-center rounded-full border-2',
                      scope === option ? 'border-brand-600' : 'border-ink-300'
                    )}
                  >
                    {scope === option && <span className="size-2 rounded-full bg-brand-600" />}
                  </span>
                  <span className="text-[14px] font-medium">{SELLER_SCOPE_LABELS[option]}</span>
                </button>
              ))}
            </div>

            {scope === 'category' && (
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {SHOP_CATEGORIES.map((c) => (
                  <label key={c.id} className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px]">
                    <Checkbox
                      checked={scopeValues.includes(c.label)}
                      onCheckedChange={() => toggle(scopeValues, c.label, setScopeValues)}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            )}

            {(scope === 'brand' || scope === 'collection') && (
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                {[...new Set(SHOP_PRODUCTS.map((p) => p.brand))].map((brand) => (
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

            {scope === 'products' && (
              <div className="mt-4 grid gap-2">
                {SELLER_PRODUCTS.slice(0, 6).map((product) => (
                  <label key={product.id} className="flex items-center gap-3 rounded-lg border px-3.5 py-2.5">
                    <Checkbox
                      checked={selected.includes(product.id)}
                      onCheckedChange={() => toggle(selected, product.id, setSelected)}
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px]">{product.name}</span>
                    <span className="shrink-0 text-[12px] tabular text-ink-500">{money(product.price)}</span>
                  </label>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Exclusions" description="Optional. Anything here is left at its normal price.">
            <div className="grid gap-2 sm:grid-cols-3">
              {SHOP_CATEGORIES.map((c) => (
                <label key={c.id} className="flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px]">
                  <Checkbox
                    checked={exCategories.includes(c.label)}
                    onCheckedChange={() => toggle(exCategories, c.label, setExCategories)}
                  />
                  <span className="truncate">{c.label}</span>
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
                <span className="block text-[14px] font-medium">Skip products that already have an offer</span>
                <span className="mt-0.5 block text-[12px] text-ink-500">
                  {impact.alreadyDiscounted} of the affected products currently carry their own markdown.
                </span>
              </span>
            </label>
          </Panel>

          {/* The rule that stops a 15% markdown quietly becoming 23.5% off. */}
          <Panel title="Products that already have an offer" description="What the customer gets when two of your offers overlap.">
            <div className="grid gap-2.5">
              {(Object.keys(CONFLICT_RULE_LABELS) as DiscountConflictRule[]).map((rule) => (
                <button
                  key={rule}
                  type="button"
                  onClick={() => setConflictRule(rule)}
                  className={cn(
                    'rounded-lg border px-4 py-3 text-left text-[14px] transition-[border-color,background-color]',
                    conflictRule === rule ? 'border-brand-600 bg-brand-50 dark:bg-brand-950' : 'hover:border-ink-400'
                  )}
                >
                  {CONFLICT_RULE_LABELS[rule]}
                  {rule === 'best-single' && (
                    <span className="mt-0.5 block text-[12px] font-normal text-ink-500">
                      Recommended — a 15% markdown plus a 10% sale is 23.5% off if they stack.
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Duration">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-1.5 block text-[13px]">Runs for (days)</Label>
                <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} />
              </div>
            </div>

            {overMax && (
              <Alert variant="destructive" className="mt-4">
                <TriangleAlert />
                <AlertTitle>Above the platform maximum</AlertTitle>
                <AlertDescription>
                  SafalMarketHub allows up to {SELLER_OFFER_POLICY.maxDiscountPercent}% on seller promotions.
                </AlertDescription>
              </Alert>
            )}
            {overDuration && (
              <Alert variant="destructive" className="mt-4">
                <TriangleAlert />
                <AlertTitle>Runs too long</AlertTitle>
                <AlertDescription>At most {SELLER_OFFER_POLICY.maxDurationDays} days.</AlertDescription>
              </Alert>
            )}
            {needsApproval && (
              <Alert variant="warning" className="mt-4">
                <TriangleAlert />
                <AlertTitle>Needs SafalMarketHub approval</AlertTitle>
                <AlertDescription>
                  Anything above {SELLER_OFFER_POLICY.approvalAbovePercent}% is reviewed before it goes live.
                </AlertDescription>
              </Alert>
            )}
          </Panel>
        </div>

        <div className="grid content-start gap-4">
          <Panel title="What this affects" description="Calculated from your live catalogue.">
            {noProducts ? (
              <p className="text-[13px] text-ink-500">
                Nothing matches this rule yet. Pick a scope, or loosen the exclusions.
              </p>
            ) : (
              <dl className="grid gap-2 text-[13px]">
                <Row label="Products affected" value={String(impact.count)} strong />
                <Row label="Average selling price" value={money(impact.averagePrice)} />
                <Row label="Average discount each" value={money(impact.averageDiscount)} />
                <Row label="Already discounted" value={String(impact.alreadyDiscounted)} />
                <Row
                  label={`SafalMarketHub fee (${plan.commission}%)`}
                  value={`− ${money(Math.round(((impact.averagePrice - impact.averageDiscount) * plan.commission) / 100))}`}
                />
                <Row
                  label="Average earnings per sale"
                  value={money(
                    impact.averagePrice -
                      impact.averageDiscount -
                      Math.round(((impact.averagePrice - impact.averageDiscount) * plan.commission) / 100)
                  )}
                  strong
                />
              </dl>
            )}

            <p className="mt-3 border-t pt-3 text-[12px] leading-relaxed text-ink-500">
              Products you add while this is running are included automatically, as long as they are active and not
              excluded.
            </p>
          </Panel>

          <Panel title="Review">
            <dl className="grid gap-2 text-[13px]">
              <Row label="Campaign" value={name || '—'} />
              <Row label="Discount" value={`${percent}%`} />
              <Row label="Applies to" value={SELLER_SCOPE_LABELS[scope]} />
              <Row label="Exclusions" value={exCategories.length || exAlreadyDiscounted ? 'Yes' : 'None'} />
              <Row label="Duration" value={`${duration} days`} />
              <Row label="Funded by" value="ABC Electronics" />
            </dl>

            <div className="mt-5 grid gap-2">
              <Button
                disabled={blocked}
                onClick={() => {
                  setPublished(needsApproval ? 'pending' : 'live')
                  toast.success(needsApproval ? 'Sent for approval' : 'Campaign published')
                }}
              >
                {needsApproval ? 'Submit for approval' : `Publish to ${impact.count} products`}
              </Button>
              <Button variant="ghost" asChild>
                <AdminLink to="/seller/promotions">Cancel</AdminLink>
              </Button>
            </div>
          </Panel>

          <Panel title="On your store">
            <p className="text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
              While this runs, your storefront shows an announcement bar and every eligible product card carries the
              sale price. Both disappear on their own when the campaign ends — nothing to clean up.
            </p>
          </Panel>
        </div>
      </div>
    </>
  )
}

/* ---------------------------------------------------------------- pieces */

function Limit({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-lg border p-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
      <p className="mt-1 text-[18px] font-bold leading-none tabular text-ink-950 dark:text-white">{value}</p>
      {note && <p className="mt-1 text-[11px] text-ink-500">{note}</p>}
    </div>
  )
}

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">
        <Icon className="size-3" />
        {label}
      </p>
      <p className="mt-1 text-[20px] font-bold leading-none tabular text-ink-950 dark:text-white">{value}</p>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-ink-500">{label}</dt>
      <dd className={cn('tabular', strong ? 'font-bold text-ink-950 dark:text-white' : 'font-semibold')}>{value}</dd>
    </div>
  )
}

function PromotionPublished({ pending, count, onDone }: { pending: boolean; count: number; onDone: () => void }) {
  return (
    <Panel className="mx-auto max-w-[520px] text-center">
      <span
        className={cn(
          'mx-auto grid size-12 place-items-center rounded-full',
          pending ? 'bg-gold-50 text-gold-700 dark:bg-gold-950 dark:text-gold-200' : 'bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100'
        )}
      >
        {pending ? <TriangleAlert className="size-6" /> : <Check className="size-6" strokeWidth={2.6} />}
      </span>
      <h2 className="mt-4 text-[20px]">{pending ? 'Sent for approval' : 'Promotion is live'}</h2>
      <p className="mx-auto mt-2 max-w-[400px] text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">
        {pending
          ? 'SafalMarketHub reviews discounts above the threshold before they reach customers. Nothing has changed on your listings yet.'
          : `${count} products now show the sale price, and your storefront banner is live.`}
      </p>
      <Button className="mt-6" onClick={onDone}>
        Back to promotions
      </Button>
    </Panel>
  )
}

/** Resolve a name from either catalogue rather than showing a raw id. */
function productName(id: string) {
  return SELLER_PRODUCTS.find((p) => p.id === id)?.name ?? SHOP_PRODUCTS.find((p) => p.id === id)?.name ?? id
}

function statusLabel(status: string) {
  return (
    {
      live: 'Live',
      scheduled: 'Scheduled',
      expired: 'Expired',
      paused: 'Paused',
      'pending-approval': 'Pending Approval',
      rejected: 'Rejected',
      draft: 'Draft',
    }[status] ?? status
  )
}

export { X }
