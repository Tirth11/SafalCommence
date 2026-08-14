import { useNavigate } from '@tanstack/react-router'
import { Eye, MousePointerClick, Plus, Tag, TrendingUp, Users, Wallet } from 'lucide-react'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { EmptyState, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  conversionRate,
  FUNDED_BY_LABELS,
  offerCost,
  OFFER_KIND_LABELS,
  PLATFORM_OFFERS,
  SELLER_OFFERS,
  statusOf,
  type Offer,
} from '@/data/offer-engine'
import { money } from '@/lib/utils'

/* ==========================================================================
   Offers & Promotions — the Super Admin list.

   Platform campaigns and seller promotions live in one place because the
   admin's question is usually "what discounting is running right now", not
   "show me one of the two kinds". Seller offers are read-only here except
   for approvals — sellers own their own pricing.
   ========================================================================== */

const TABS = [
  { value: 'platform', label: 'Platform offers' },
  { value: 'seller', label: 'Seller offers' },
  { value: 'approvals', label: 'Needs approval' },
]

export function AdminOffersPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const tab = search.tab ?? 'platform'

  const pendingApprovals = SELLER_OFFERS.filter((o) => o.status === 'pending-approval')

  const rows: Offer[] =
    tab === 'platform' ? PLATFORM_OFFERS : tab === 'approvals' ? pendingApprovals : SELLER_OFFERS

  const live = PLATFORM_OFFERS.filter((o) => statusOf(o) === 'live')
  const totalDiscount = PLATFORM_OFFERS.reduce((sum, o) => sum + o.metrics.discountGiven, 0)
  const totalCost = PLATFORM_OFFERS.reduce((sum, o) => sum + offerCost(o), 0)
  const totalGmv = PLATFORM_OFFERS.reduce((sum, o) => sum + o.metrics.gmv, 0)

  return (
    <>
      <PageHeader
        title="Offers & Promotions"
        description="Marketplace campaigns, and the promotions sellers are running on their own products."
        breadcrumb={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Offers & Promotions', to: '/admin/offers' },
        ]}
        actions={
          <Button size="sm" asChild>
            <AdminLink to="/admin/offers/new">
              <Plus className="size-4" />
              Create offer
            </AdminLink>
          </Button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Tag} label="Live campaigns" value={String(live.length)} note={`${PLATFORM_OFFERS.length} total`} />
        <Metric icon={TrendingUp} label="GMV on offer" value={money(totalGmv)} note="All campaigns" />
        <Metric icon={Wallet} label="Discount given" value={money(totalDiscount)} note={`${money(totalCost)} funded by us`} />
        <Metric
          icon={Users}
          label="Awaiting approval"
          value={String(pendingApprovals.length)}
          note="Seller discounts above threshold"
          tone={pendingApprovals.length > 0 ? 'gold' : undefined}
        />
      </div>

      <Tabs
        value={tab}
        onValueChange={(value) => navigate(adminLinkProps({ to: '/admin/offers', search: { tab: value } }))}
      >
        <TabsList className="mb-4">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              {t.value === 'approvals' && pendingApprovals.length > 0 && (
                <span className="ml-1.5 rounded-full bg-gold-100 px-1.5 text-[11px] font-bold text-gold-800 dark:bg-gold-950 dark:text-gold-200">
                  {pendingApprovals.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Panel padded={false}>
        {rows.length === 0 ? (
          <EmptyState icon={Tag} title="Nothing here" body="No offers match this view." />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Funded by</TableHead>
                <TableHead>Runs</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>
                    <AdminLink to={`/admin/offers/${offer.id}`} className="font-medium text-ink-900 hover:underline dark:text-white">
                      {offer.source === 'platform' ? offer.name : offer.displayName}
                    </AdminLink>
                    <p className="mt-0.5 text-[12px] text-ink-500">
                      {offer.source === 'platform' ? offer.displayName : `${offer.seller} · own products`}
                    </p>
                  </TableCell>
                  <TableCell className="text-[13px]">
                    {offer.source === 'platform' ? OFFER_KIND_LABELS[offer.kind] : `${offer.value}${offer.kind === 'percent' ? '%' : ' off'}`}
                  </TableCell>
                  <TableCell className="text-[13px]">
                    {offer.source === 'platform' ? FUNDED_BY_LABELS[offer.fundedBy] : offer.seller}
                  </TableCell>
                  <TableCell className="text-[12px] tabular text-ink-600 dark:text-ink-300">
                    {formatRange(offer.startsAt, offer.endsAt)}
                  </TableCell>
                  <TableCell className="text-right tabular">{offer.metrics.orders.toLocaleString('en-US')}</TableCell>
                  <TableCell className="text-right tabular">{money(offer.metrics.discountGiven)}</TableCell>
                  <TableCell>
                    <StatusBadge status={statusLabel(statusOf(offer))} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>

      {tab === 'approvals' && pendingApprovals.length > 0 && (
        <Panel className="mt-4" title="Why these need a decision">
          <p className="text-[14px] leading-relaxed text-ink-600 dark:text-ink-300">
            Sellers may discount their own products freely up to the platform threshold. Anything deeper reaches you
            first, because a very large discount affects how the marketplace is priced overall — not just that
            seller's margin.
          </p>
        </Panel>
      )}
    </>
  )
}

function Metric({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: typeof Tag
  label: string
  value: string
  note: string
  tone?: 'gold'
}) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-xs">
      <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-500">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p
        className={
          tone === 'gold'
            ? 'mt-2 text-[24px] font-bold leading-none tabular text-gold-700 dark:text-gold-300'
            : 'mt-2 text-[24px] font-bold leading-none tabular text-ink-950 dark:text-white'
        }
      >
        {value}
      </p>
      <p className="mt-1.5 text-[12px] text-ink-500">{note}</p>
    </div>
  )
}

/* ------------------------------------------------------------ detail view */

export function AdminOfferDetailPage() {
  const search = useAdminSearch()
  const offerId = search.offerId ?? window.location.pathname.split('/').pop() ?? ''
  const offer = [...PLATFORM_OFFERS, ...SELLER_OFFERS].find((o) => o.id === offerId)

  if (!offer) {
    return (
      <Panel padded={false}>
        <EmptyState
          icon={Tag}
          title="Offer not found"
          body="This campaign may have been deleted."
          action={
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/admin/offers">Back to offers</AdminLink>
            </Button>
          }
        />
      </Panel>
    )
  }

  const m = offer.metrics

  return (
    <>
      <PageHeader
        title={offer.source === 'platform' ? offer.name : offer.displayName}
        description={offer.source === 'platform' ? offer.description : `${offer.seller} · own products only`}
        breadcrumb={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Offers & Promotions', to: '/admin/offers' },
          { label: offer.id, to: `/admin/offers/${offer.id}` },
        ]}
        actions={<StatusBadge status={statusLabel(statusOf(offer))} />}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-4">
          <Panel title="Performance" description="Since the campaign went live.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat icon={Eye} label="Views" value={m.views.toLocaleString('en-US')} />
              <Stat icon={MousePointerClick} label="Clicks" value={m.clicks.toLocaleString('en-US')} />
              <Stat icon={Users} label="Customers using it" value={m.customers.toLocaleString('en-US')} />
              <Stat icon={TrendingUp} label="Orders" value={m.orders.toLocaleString('en-US')} />
              <Stat icon={Wallet} label="GMV" value={money(m.gmv)} />
              <Stat icon={Tag} label="Discount given" value={money(m.discountGiven)} />
            </div>

            <dl className="mt-5 grid gap-2 border-t pt-4 text-[13px]">
              <Row label="Conversion (orders ÷ clicks)" value={`${conversionRate(m)}%`} />
              <Row label="Assistant-assisted purchases" value={m.assistantAssisted.toLocaleString('en-US')} />
              <Row label="Cost to SafalMarketHub" value={money(offerCost(offer))} strong />
            </dl>

            <p className="mt-4 text-[12px] leading-relaxed text-ink-500">
              Cost is the share we fund, which is not the same as the discount customers received — a jointly funded
              or seller-funded campaign discounts more than it costs us.
            </p>
          </Panel>
        </div>

        <div className="grid content-start gap-4">
          <Panel title="Setup">
            <dl className="grid gap-2 text-[13px]">
              <Row label="Type" value={offer.source === 'platform' ? OFFER_KIND_LABELS[offer.kind] : 'Seller promotion'} />
              <Row label="Value" value={offer.kind === 'percent' ? `${offer.value}%` : money(offer.value)} />
              {offer.source === 'platform' && (
                <>
                  <Row label="Funded by" value={FUNDED_BY_LABELS[offer.fundedBy]} />
                  {offer.code && <Row label="Code" value={offer.code} />}
                  {offer.minOrder > 0 && <Row label="Minimum order" value={money(offer.minOrder)} />}
                  {offer.maxDiscount !== null && <Row label="Maximum discount" value={money(offer.maxDiscount)} />}
                  <Row
                    label="Applies to"
                    value={offer.scope === 'marketplace' ? 'Entire marketplace' : offer.scopeValues.join(', ')}
                  />
                </>
              )}
              <Row label="Runs" value={formatRange(offer.startsAt, offer.endsAt)} />
            </dl>
          </Panel>

          {offer.source === 'platform' && (
            <Panel title="Combination rules" description="What this can stack with.">
              <ul className="grid gap-2 text-[13px]">
                <Rule allowed={offer.combination.withSellerOffer} label="Seller offers" />
                <Rule allowed={offer.combination.withPaymentOffer} label="Payment offers" />
                <Rule allowed={offer.combination.withOtherPlatformCoupon} label="Other SafalMarketHub coupons" />
              </ul>
            </Panel>
          )}

          {offer.source === 'seller' && offer.approvalReason && (
            <Panel title="Approval">
              <p className="text-[13px] text-ink-600 dark:text-ink-300">{offer.approvalReason}</p>
              <div className="mt-4 flex gap-2">
                <Button size="sm">Approve</Button>
                <Button size="sm" variant="outline">
                  Reject
                </Button>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
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
      <dd className={strong ? 'font-bold tabular text-ink-950 dark:text-white' : 'font-semibold tabular'}>{value}</dd>
    </div>
  )
}

function Rule({ allowed, label }: { allowed: boolean; label: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-ink-600 dark:text-ink-300">{label}</span>
      <span className={allowed ? 'font-semibold text-teal-600 dark:text-teal-100' : 'font-semibold text-ink-400'}>
        {allowed ? 'Allowed' : 'Not allowed'}
      </span>
    </li>
  )
}

/* ---------------------------------------------------------------- helpers */

function statusLabel(status: string) {
  return {
    live: 'Live',
    scheduled: 'Scheduled',
    expired: 'Expired',
    paused: 'Paused',
    draft: 'Draft',
    'pending-approval': 'Pending Approval',
    rejected: 'Rejected',
  }[status] ?? status
}

export function formatRange(startsAt: string, endsAt: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
  return `${fmt(startsAt)} – ${fmt(endsAt)}`
}
