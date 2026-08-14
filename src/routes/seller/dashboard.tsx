import { useState } from 'react'
import { ArrowRight, Boxes, CircleAlert, Package, PartyPopper, ShoppingBag, Sparkles, Star, TriangleAlert, Wallet } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { AdminLink } from '@/components/admin/admin-link'
import { AttentionCard, KpiGrid, type Kpi } from '@/components/admin/kpi'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { OnboardingChecklist } from '@/components/seller/seller-bits'
import { useSellerAssistant } from '@/components/seller/seller-assistant'
import { SellerStatusBanner, SellerStatusPill } from '@/components/seller/status-banner'
import { Button } from '@/components/ui/button'
import { ProductScene } from '@/components/marketing/scene'
import { SELLER_ORDERS, SELLER_PRODUCTS, SELLER_SALES_7D, SELLER_TRANSACTIONS } from '@/data/seller'
import { priceInsightFor, REVIEW_SUMMARIES } from '@/data/seller-assistant'
import { cn, money } from '@/lib/utils'
import { useOnboardingProgress, useSellerStore } from '@/store/seller-store'
import { usePlan } from '@/store/storefront-store'

const PERIODS = ['7 Days', '30 Days', 'Custom'] as const

export function SellerDashboardPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('7 Days')
  const assistant = useSellerAssistant()
  const { storeName, status, kyc } = useSellerStore()
  const plan = usePlan()
  const { isComplete, percent } = useOnboardingProgress()

  const newOrders = SELLER_ORDERS.filter((o) => o.status === 'New')
  const pendingOrders = SELLER_ORDERS.filter((o) => ['New', 'Processing', 'Packed'].includes(o.status))
  const lowStock = SELLER_PRODUCTS.filter((p) => p.available > 0 && p.available <= p.lowStockAt)
  const outOfStock = SELLER_PRODUCTS.filter((p) => p.available === 0)
  const changesRequired = SELLER_PRODUCTS.filter((p) => p.status === 'Changes Required')
  const listingNeeds = SELLER_PRODUCTS.filter((p) => p.status === 'Changes Required' || p.images < 3 || p.status === 'Draft')
  const activeProducts = SELLER_PRODUCTS.filter((p) => p.status === 'Active').length
  const recentOrders = SELLER_ORDERS.slice(0, 5)
  const returnCases = SELLER_ORDERS.filter((o) => o.returnCase)
  const settlementDue = SELLER_TRANSACTIONS.filter((t) => t.status !== 'Settled').reduce((sum, t) => sum + t.earnings, 0)

  const onboarding = status === 'Onboarding' || (status === 'Pending Review' && !isComplete)

  const bestSellers = [...SELLER_PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 4)
  const spotlightProduct = bestSellers[0]
  const voiceProduct = SELLER_PRODUCTS.find((p) => REVIEW_SUMMARIES[p.id]?.trend) ?? spotlightProduct
  const voiceSummary = voiceProduct ? REVIEW_SUMMARIES[voiceProduct.id] : undefined
  const overpriced = SELLER_PRODUCTS.filter((p) => (priceInsightFor(p)?.difference ?? 0) > 2)
  const productAttention = [
    { label: 'Low stock', value: String(lowStock.length + outOfStock.length), to: '/seller/inventory' },
    { label: 'Slow moving', value: String(SELLER_PRODUCTS.filter((p) => p.available > 20 && p.sold < 12).length), to: '/seller/marketing' },
    { label: 'Pricing', value: String(overpriced.length), to: '/seller/products' },
    { label: 'Listing health', value: String(listingNeeds.length), to: '/seller/products' },
  ]

  // Sales by the channel that produced them — the number that justifies the plan.
  const marketplaceSales = SELLER_TRANSACTIONS.filter((t) => t.channel === 'marketplace').reduce((s, t) => s + t.gross, 0)
  const storeSales = SELLER_TRANSACTIONS.filter((t) => t.channel === 'store').reduce((s, t) => s + t.gross, 0)
  const totalSales = marketplaceSales + storeSales || 1
  const channelSplit = [
    {
      label: 'SafalMarketHub marketplace',
      value: marketplaceSales,
      share: Math.round((marketplaceSales / totalSales) * 100),
      fee: `${plan.commission}% commission`,
      own: false,
    },
    {
      label: 'My online store',
      value: storeSales,
      share: Math.round((storeSales / totalSales) * 100),
      fee: plan.ownStoreFee === null ? 'not on this plan' : `${plan.ownStoreFee}% platform fee`,
      own: true,
    },
  ]

  const kpis: Kpi[] = [
    { label: 'Total Sales', value: '$3,100', hint: 'Last 30 days', delta: { value: '+18.4%', direction: 'up' } },
    { label: 'Total Orders', value: '486', hint: 'All time', delta: { value: '+12 this week', direction: 'up' } },
    {
      label: 'Pending Orders',
      value: String(pendingOrders.length),
      hint: 'Awaiting fulfilment',
      attention: pendingOrders.length > 0,
      target: { to: '/seller/orders', search: { tab: 'New' } },
    },
    { label: 'Active Products', value: String(activeProducts), hint: `${SELLER_PRODUCTS.length} total listings`, target: { to: '/seller/products' } },
    {
      label: 'Low Stock',
      value: String(lowStock.length + outOfStock.length),
      hint: `${outOfStock.length} out of stock`,
      attention: lowStock.length + outOfStock.length > 0,
      target: { to: '/seller/inventory', search: { filter: 'Low Stock' } },
    },
    { label: 'Pending Settlement', value: money(settlementDue), hint: 'Expected on 18 Aug', target: { to: '/seller/settlements' } },
  ]

  return (
    <>
      <PageHeader
        title={`Good morning, ${storeName}`}
        description="Here's what's happening with your store today."
        actions={
          <>
            <SellerStatusPill className="hidden sm:inline-flex" />
            <Button size="sm" asChild>
              <AdminLink to="/seller/products/new">Add Product</AdminLink>
            </Button>
          </>
        }
      />

      <SellerStatusBanner className="mb-5" />

      {/* A new seller sees activation, not an empty mature dashboard. */}
      {onboarding ? (
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <OnboardingChecklist />
          <div className="grid content-start gap-4">
            <Panel title="What you can do now">
              <ul className="grid gap-3">
                {[
                  { icon: Package, label: 'Add products', body: 'Draft your catalogue while verification is in progress.', to: '/seller/products/new' },
                  { icon: Boxes, label: 'Prepare inventory', body: 'Set stock levels and low-stock alerts in advance.', to: '/seller/inventory' },
                  { icon: CircleAlert, label: 'Check verification', body: `KYC status: ${kyc}`, to: '/seller/setup' },
                ].map((item) => (
                  <li key={item.label}>
                    <AdminLink
                      to={item.to}
                      className="flex items-start gap-3 rounded-sm border p-3.5 transition-colors hover:border-brand-200"
                    >
                      <item.icon className="mt-0.5 size-4 shrink-0 text-brand-600 dark:text-brand-300" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-semibold text-ink-900 dark:text-white">{item.label}</span>
                        <span className="block text-[12px] text-ink-500">{item.body}</span>
                      </span>
                      <ArrowRight className="mt-0.5 size-4 shrink-0 text-ink-300" />
                    </AdminLink>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title="Selling status">
              <p className="text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
                Your store is <span className="font-semibold">{percent}%</span> set up. Customers can buy from you once
                SafalMarketHub approves your profile and your products.
              </p>
            </Panel>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.6fr_0.9fr]">
            <Panel
              title="Here's what needs your attention today"
              description="The work queue SafalHub thinks you should clear first."
              actions={
                <Button size="sm" variant="outline" onClick={() => assistant.open('What should I do today?')}>
                  <Sparkles className="size-4" />
                  Ask SafalHub
                </Button>
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: ShoppingBag,
                    count: String(newOrders.length),
                    label: newOrders.length === 1 ? 'New order' : 'New orders',
                    detail: 'Ready to process',
                    tone: 'brand' as const,
                    target: { to: '/seller/orders', search: { tab: 'New' } },
                  },
                  {
                    icon: Boxes,
                    count: String(lowStock.length + outOfStock.length),
                    label: 'Products low on stock',
                    detail: lowStock[0] ? `${lowStock[0].name} may run out soon` : 'Inventory is in a good place',
                    tone: 'gold' as const,
                    target: { to: '/seller/inventory', search: { filter: 'Low Stock' } },
                  },
                  {
                    icon: TriangleAlert,
                    count: String(listingNeeds.length),
                    label: 'Listings need changes',
                    detail: changesRequired[0]?.name ?? 'Images or listing basics need attention',
                    tone: changesRequired.length ? ('danger' as const) : ('gold' as const),
                    target: { to: '/seller/products' },
                  },
                  {
                    icon: Star,
                    count: '3',
                    label: 'New review signals',
                    detail: voiceSummary?.trend ?? 'Customer feedback is steady',
                    tone: 'brand' as const,
                    target: { to: '/seller/products' },
                  },
                  {
                    icon: Package,
                    count: String(returnCases.length),
                    label: returnCases.length === 1 ? 'Return opened' : 'Returns opened',
                    detail: returnCases[0]?.returnCase?.reason ?? 'No return exceptions',
                    tone: returnCases.length ? ('gold' as const) : ('brand' as const),
                    target: { to: '/seller/orders' },
                  },
                  {
                    icon: Wallet,
                    count: money(settlementDue),
                    label: 'Settlement due',
                    detail: 'Expected on 18 Aug',
                    tone: status === 'Payout Hold' ? ('danger' as const) : ('brand' as const),
                    target: { to: '/seller/settlements' },
                  },
                ].map((item) => (
                  <AttentionCard key={item.label} {...item} />
                ))}
              </div>
            </Panel>

            <Panel title="Ask SafalHub" description="Tell it what you want to know or do.">
              <div className="grid gap-2">
                {[
                  'Help me price this',
                  'Why is this product not selling?',
                  'What should I restock?',
                  'Explain my next settlement',
                  'What should I improve?',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => assistant.open(prompt)}
                    className="flex items-center justify-between gap-3 rounded-sm border px-3 py-2.5 text-left text-[13px] font-semibold transition-colors hover:border-brand-200 hover:bg-brand-50/50 dark:hover:bg-brand-950/30"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="size-4 shrink-0 text-ink-300" />
                  </button>
                ))}
              </div>
            </Panel>
          </div>

          <KpiGrid items={kpis.slice(0, 4)} className="mt-6" />
          <KpiGrid items={kpis.slice(4)} className="mt-3 lg:grid-cols-4" />

          {/* The two questions a KPI row can't answer: where did the money come
              from, and what is actually selling. */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Panel title="Where sales came from" description="Last 30 days, by channel.">
              <ul className="grid gap-4">
                {channelSplit.map((channel) => (
                  <li key={channel.label}>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-[13px] font-medium text-ink-700 dark:text-ink-200">{channel.label}</span>
                      <span className="text-[14px] font-bold tabular text-ink-950 dark:text-white">
                        {money(channel.value)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-200 dark:bg-secondary">
                      <div
                        className={cn('h-full rounded-full', channel.own ? 'bg-teal-500' : 'bg-brand-600')}
                        style={{ width: `${channel.share}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[11px] text-ink-500 tabular">
                      {channel.share}% of sales · {channel.fee}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t pt-4 text-[12px] leading-relaxed text-ink-500">
                Sales you bring to your own store cost you far less. That gap is the point of having one.
              </p>
            </Panel>

            <Panel
              title="Best sellers"
              description="Units sold in the last 30 days."
              actions={
                <Button variant="ghost" size="sm" className="h-8" asChild>
                  <AdminLink to="/seller/products">All products</AdminLink>
                </Button>
              }
            >
              <ul className="grid gap-3">
                {bestSellers.map((product, i) => (
                  <li key={product.id} className="flex items-center gap-3">
                    <span className="w-4 shrink-0 text-[12px] font-bold tabular text-ink-400">{i + 1}</span>
                    <ProductScene glyph={product.glyph} tone={product.tone} className="size-10 shrink-0 rounded-md" grain={false} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-semibold text-ink-900 dark:text-white">
                        {product.name}
                      </span>
                      <span className="block text-[11px] text-ink-500 tabular">{money(product.price)}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[14px] font-bold tabular text-ink-950 dark:text-white">{product.sold}</span>
                      <span className="block text-[11px] text-ink-500">sold</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            {spotlightProduct && (
              <Panel
                title="Product health"
                description={spotlightProduct.name}
                actions={
                  <Button variant="ghost" size="sm" onClick={() => assistant.open(`How are my ${spotlightProduct.name} doing?`)}>
                    Ask
                  </Button>
                }
              >
                <dl className="grid grid-cols-2 gap-4">
                  {[
                    ['Sold', `${spotlightProduct.sold} units`],
                    ['Revenue', money(spotlightProduct.sold * spotlightProduct.price)],
                    ['Stock', `${spotlightProduct.available} left`],
                    ['Rating', REVIEW_SUMMARIES[spotlightProduct.id] ? `${REVIEW_SUMMARIES[spotlightProduct.id].rating} ★` : '—'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</dt>
                      <dd className="mt-1 text-[18px] font-bold tabular text-ink-950 dark:text-white">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 grid gap-2 border-t pt-4">
                  {productAttention.map((item) => (
                    <AdminLink key={item.label} to={item.to} className="flex items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-[12px] hover:bg-muted">
                      <span className="font-medium text-ink-700 dark:text-ink-200">{item.label}</span>
                      <span className="font-bold tabular text-ink-950 dark:text-white">{item.value}</span>
                    </AdminLink>
                  ))}
                </div>
              </Panel>
            )}

            <Panel title="Customer voice" description={voiceProduct?.name ?? 'Recent products'}>
              {voiceSummary ? (
                <>
                  <p className="flex items-center gap-2 text-[15px] font-bold text-ink-950 dark:text-white">
                    <Star className="size-4 fill-gold-400 text-gold-400" />
                    {voiceSummary.rating} average · {voiceSummary.count} reviews
                  </p>
                  <div className="mt-4 grid gap-3">
                    <VoiceList title="Customers love" items={voiceSummary.likes.slice(0, 3)} tone="good" />
                    <VoiceList title="Needs attention" items={voiceSummary.dislikes.slice(0, 3)} tone="warn" />
                  </div>
                  {voiceSummary.trend && (
                    <p className="mt-4 rounded-sm bg-gold-50 p-3 text-[12px] font-medium text-gold-800 dark:bg-gold-950/40 dark:text-gold-200">
                      {voiceSummary.trend}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-ink-500">No review signals yet.</p>
              )}
            </Panel>

            <Panel title="Store health" description="A compact operating score.">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[34px] font-bold leading-none tracking-[-0.04em] text-ink-950 dark:text-white">92</p>
                  <p className="mt-1 text-[12px] font-semibold text-teal-700 dark:text-teal-100">Excellent</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => assistant.open('How is my store doing?')}>
                  Improve
                </Button>
              </div>
              <ul className="mt-5 grid gap-2 text-[12px]">
                {[
                  ['Order cancellation', 'Good'],
                  ['Late shipping', '3 orders need care'],
                  ['Return rate', `${returnCases.length} open case`],
                  ['KYC status', kyc],
                ].map(([label, value]) => (
                  <li key={label} className="flex items-center justify-between gap-3 border-t pt-2 first:border-t-0 first:pt-0">
                    <span className="text-ink-500">{label}</span>
                    <span className="font-semibold text-ink-900 dark:text-white">{value}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Sales + low stock */}
          <div className="mt-6 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Panel
              title="Sales overview"
              description="Sales value and order count"
              actions={
                <div className="flex rounded-sm border p-0.5">
                  {PERIODS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={
                        'rounded-[6px] px-2.5 py-1 text-[12px] font-semibold transition-colors ' +
                        (period === p ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-900 dark:hover:text-white')
                      }
                    >
                      {p}
                    </button>
                  ))}
                </div>
              }
            >
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={SELLER_SALES_7D} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sellerSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand-600)" stopOpacity={0.26} />
                        <stop offset="100%" stopColor="var(--brand-600)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--ink-400)' }} dy={6} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'var(--ink-400)' }} tickFormatter={(v: number) => `${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: '1px solid var(--border)',
                        background: 'var(--popover)',
                        fontSize: 12,
                        boxShadow: 'var(--shadow-md)',
                      }}
                      formatter={(value, name) => (name === 'sales' ? [money(Number(value)), 'Sales'] : [value, 'Orders'])}
                    />
                    <Area type="monotone" dataKey="sales" stroke="var(--brand-600)" strokeWidth={2} fill="url(#sellerSales)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel
              title="Low stock"
              padded={false}
              actions={
                <Button variant="ghost" size="sm" asChild>
                  <AdminLink to="/seller/inventory">Update inventory</AdminLink>
                </Button>
              }
            >
              <ul className="divide-y">
                {[...lowStock, ...outOfStock].map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-ink-900 dark:text-white">{p.name}</span>
                      <span className="block text-[11px] text-ink-500 tabular">{p.sku}</span>
                    </span>
                    <span
                      className={
                        'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular ' +
                        (p.available === 0
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-gold-50 text-gold-600 dark:bg-gold-600/15 dark:text-gold-400')
                      }
                    >
                      {p.available === 0 ? 'Out of stock' : `${p.available} left`}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          {/* Recent orders */}
          <Panel
            className="mt-4"
            title="Recent orders"
            padded={false}
            actions={
              <Button variant="ghost" size="sm" asChild>
                <AdminLink to="/seller/orders">View All Orders</AdminLink>
              </Button>
            }
          >
            <ul className="divide-y">
              {recentOrders.map((o) => (
                <li key={o.id}>
                  <AdminLink
                    to={`/seller/orders/${o.id}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="w-[128px] shrink-0 text-[13px] font-semibold tabular text-ink-900 dark:text-white">
                      {o.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-ink-700 dark:text-ink-200">{o.customer}</span>
                      <span className="block text-[11px] text-ink-500">{o.date}</span>
                    </span>
                    <span className="text-[13px] font-semibold tabular text-ink-900 dark:text-white">{money(o.productValue)}</span>
                    <StatusBadge status={o.status} />
                  </AdminLink>
                </li>
              ))}
            </ul>
          </Panel>

          {status === 'Active' && kyc === 'Approved' && (
            <p className="mt-6 flex items-center gap-2 text-[12px] text-ink-500">
              <PartyPopper className="size-4 shrink-0 text-brand-600 dark:text-brand-300" />
              Your store is active and approved products are live on SafalMarketHub.
            </p>
          )}
        </>
      )}
    </>
  )
}

function VoiceList({ title, items, tone }: { title: string; items: string[]; tone: 'good' | 'warn' }) {
  return (
    <div>
      <p className={cn('text-[11px] font-bold uppercase tracking-[0.08em]', tone === 'good' ? 'text-teal-700 dark:text-teal-100' : 'text-gold-700 dark:text-gold-300')}>
        {title}
      </p>
      <ul className="mt-1 grid gap-1">
        {items.map((item) => (
          <li key={item} className="text-[12px] text-ink-700 dark:text-ink-200">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
