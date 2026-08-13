import { useState } from 'react'
import { ArrowRight, Boxes, CircleAlert, Package, PartyPopper, ShoppingBag, TriangleAlert, Wallet } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { AdminLink } from '@/components/admin/admin-link'
import { AttentionCard, KpiGrid, type Kpi } from '@/components/admin/kpi'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { OnboardingChecklist } from '@/components/seller/seller-bits'
import { SellerStatusBanner, SellerStatusPill } from '@/components/seller/status-banner'
import { Button } from '@/components/ui/button'
import { ProductScene } from '@/components/marketing/scene'
import { SELLER_ORDERS, SELLER_PRODUCTS, SELLER_SALES_7D, SELLER_TRANSACTIONS } from '@/data/seller'
import { cn, money } from '@/lib/utils'
import { useOnboardingProgress, useSellerStore } from '@/store/seller-store'
import { usePlan } from '@/store/storefront-store'

const PERIODS = ['7 Days', '30 Days', 'Custom'] as const

export function SellerDashboardPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('7 Days')
  const { storeName, status, kyc } = useSellerStore()
  const plan = usePlan()
  const { isComplete, percent } = useOnboardingProgress()

  const newOrders = SELLER_ORDERS.filter((o) => o.status === 'New')
  const pendingOrders = SELLER_ORDERS.filter((o) => ['New', 'Processing', 'Packed'].includes(o.status))
  const lowStock = SELLER_PRODUCTS.filter((p) => p.available > 0 && p.available <= p.lowStockAt)
  const outOfStock = SELLER_PRODUCTS.filter((p) => p.available === 0)
  const changesRequired = SELLER_PRODUCTS.filter((p) => p.status === 'Changes Required')
  const activeProducts = SELLER_PRODUCTS.filter((p) => p.status === 'Active').length
  const recentOrders = SELLER_ORDERS.slice(0, 5)

  const onboarding = status === 'Onboarding' || (status === 'Pending Review' && !isComplete)

  const bestSellers = [...SELLER_PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 4)

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
    { label: 'Pending Settlement', value: '$540', hint: 'Eligible on 16 Aug', target: { to: '/seller/settlements' } },
  ]

  return (
    <>
      <PageHeader
        title={`Good morning, ${storeName}`}
        description="Here's what's happening with your store today."
        actions={
          <>
            <SellerStatusPill className="hidden sm:inline-flex" />
            {/* Same account — buying doesn't need a different login */}
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/shop">Shop SafalMarketHub</AdminLink>
            </Button>
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
          <KpiGrid items={kpis.slice(0, 4)} />
          <KpiGrid items={kpis.slice(4)} className="mt-3 lg:grid-cols-4" />

          {/* Action centre */}
          <section className="mt-7">
            <h2 className="text-[17px] font-semibold">Requires your attention</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {lowStock.length + outOfStock.length > 0 && (
                <AttentionCard
                  icon={Boxes}
                  count={String(lowStock.length + outOfStock.length)}
                  label={lowStock.length + outOfStock.length === 1 ? 'Low stock product' : 'Low stock products'}
                  detail={lowStock[0] ? `${lowStock[0].name} · ${lowStock[0].available} left` : 'Restock to stay listed'}
                  tone="gold"
                  target={{ to: '/seller/inventory', search: { filter: 'Low Stock' } }}
                />
              )}
              {newOrders.length > 0 && (
                <AttentionCard
                  icon={ShoppingBag}
                  count={String(newOrders.length)}
                  label={newOrders.length === 1 ? 'New order' : 'New orders'}
                  detail="Accept them to start fulfilment"
                  tone="brand"
                  target={{ to: '/seller/orders', search: { tab: 'New' } }}
                />
              )}
              {changesRequired.length > 0 && (
                <AttentionCard
                  icon={TriangleAlert}
                  count={String(changesRequired.length)}
                  label={changesRequired.length === 1 ? 'Product requires changes' : 'Products require changes'}
                  detail={changesRequired[0].name}
                  tone="danger"
                  target={{ to: `/seller/products/${changesRequired[0].id}` }}
                />
              )}
              {SELLER_ORDERS.some((o) => o.returnCase) && (
                <AttentionCard
                  icon={Package}
                  count="1"
                  label="Return request"
                  detail="RET-2208 · awaiting your response"
                  tone="gold"
                  target={{ to: '/seller/orders/SH-100098-01' }}
                />
              )}
              {(status === 'Payout Hold' || kyc !== 'Approved') && (
                <AttentionCard
                  icon={Wallet}
                  count="1"
                  label={status === 'Payout Hold' ? 'Settlement on hold' : 'Verification pending'}
                  detail={status === 'Payout Hold' ? 'Payouts paused pending review' : `KYC status: ${kyc}`}
                  tone="danger"
                  target={{ to: status === 'Payout Hold' ? '/seller/settlements' : '/seller/setup' }}
                />
              )}
            </div>
          </section>

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
