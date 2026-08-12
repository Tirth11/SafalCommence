import { useState } from 'react'
import {
  Banknote,
  CreditCard,
  Package,
  RotateCcw,
  Store,
  Undo2,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AdminLink } from '@/components/admin/admin-link'
import { AttentionCard, KpiGrid, type Kpi } from '@/components/admin/kpi'
import { PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { ADMIN_ORDERS, BUYER_GROWTH, ORDER_MIX, SALES_TREND, SELLER_GROWTH, SELLERS } from '@/data/admin'
import { money } from '@/lib/utils'

const PERIODS = ['Today', '7 Days', '30 Days', 'Custom'] as const

const PRIMARY_KPIS: Kpi[] = [
  { label: 'Gross Merchandise Value', value: '$30,600', hint: 'Total order value', delta: { value: '+12.4%', direction: 'up' } },
  { label: 'Platform Revenue', value: '$2,700', hint: 'Commission + fees', delta: { value: '+9.1%', direction: 'up' } },
  { label: 'Total Orders', value: '4,286', hint: 'All time', delta: { value: '+128 today', direction: 'up' } },
  { label: 'Active Sellers', value: '485', hint: '9 suspended', delta: { value: '+39 this month', direction: 'up' } },
]

const QUEUE_KPIS: Kpi[] = [
  { label: 'Pending Seller Approvals', value: '24', hint: 'Oldest waiting 3 days', attention: true, target: { to: '/admin/sellers', search: { status: 'Pending Review' } } },
  { label: 'Pending Product Approvals', value: '52', hint: '12 submitted today', attention: true, target: { to: '/admin/products', search: { status: 'In Review' } } },
  { label: 'Refund Requests', value: '18', hint: '$530exposure', attention: true, target: { to: '/admin/refunds' } },
  { label: 'Pending Settlements', value: '$9,300', hint: '2 batches eligible', attention: true, target: { to: '/admin/settlements', search: { status: 'Eligible' } } },
]

const SECONDARY_KPIS: Kpi[] = [
  { label: 'Orders Today', value: '128', hint: 'vs 114 yesterday', delta: { value: '+12.3%', direction: 'up' } },
  { label: 'Registered Buyers', value: '18,560', hint: '1,980 this month' },
  { label: 'Active Products', value: '12,450', hint: '312 out of stock' },
  { label: 'Failed Payments', value: '6', hint: 'Last 24 hours', delta: { value: '+2', direction: 'down' } },
]

const ATTENTION = [
  { icon: Store, count: '24', label: 'Sellers awaiting approval', detail: 'Urban Threads, HomeCraft Studio, SoundPro India + 21 more', tone: 'gold' as const, target: { to: '/admin/sellers', search: { status: 'Pending Review' } } },
  { icon: Package, count: '52', label: 'Products awaiting approval', detail: '1 flagged for counterfeit concern', tone: 'gold' as const, target: { to: '/admin/products', search: { status: 'In Review' } } },
  { icon: Undo2, count: '18', label: 'Refund requests', detail: '3 above $62need Super Admin sign-off', tone: 'danger' as const, target: { to: '/admin/refunds' } },
  { icon: Banknote, count: '$9,300', label: 'Settlement pending', detail: '2 eligible batches · 1 on hold', tone: 'brand' as const, target: { to: '/admin/settlements', search: { status: 'Eligible' } } },
  { icon: CreditCard, count: '6', label: 'Failed payment cases', detail: 'Awaiting gateway reconciliation', tone: 'danger' as const, target: { to: '/admin/payments', search: { status: 'Failed' } } },
  { icon: RotateCcw, count: '12', label: 'Return requests', detail: '4 in quality check', tone: 'gold' as const, target: { to: '/admin/returns' } },
]

const chartAxis = { tickLine: false, axisLine: false, tick: { fontSize: 11, fill: 'var(--ink-400)' } } as const
const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--popover)',
  fontSize: 12,
  boxShadow: 'var(--shadow-md)',
}

export function AdminDashboardPage() {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>('7 Days')

  const pendingSellers = SELLERS.filter((s) => s.status === 'Pending Review').slice(0, 4)
  const recentOrders = ADMIN_ORDERS.slice(0, 5)

  return (
    <>
      <PageHeader
        title="Platform dashboard"
        description="Marketplace health and everything waiting on the SafalMarketHub team, as of 12 Aug 2026."
        actions={
          <Button variant="outline" size="sm" asChild>
            <AdminLink to="/admin/reports">View reports</AdminLink>
          </Button>
        }
      />

      {/* Row 1 — headline KPIs */}
      <KpiGrid items={PRIMARY_KPIS} />

      {/* Row 2 — work queues */}
      <KpiGrid items={QUEUE_KPIS} className="mt-3" />

      {/* Row 3 — supporting counts */}
      <KpiGrid items={SECONDARY_KPIS} className="mt-3" />

      {/* Row 4 — charts */}
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Panel
          title="Sales overview"
          description="Gross sales, net sales and platform commission"
          actions={
            <div className="flex rounded-sm border p-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={
                    'rounded-[6px] px-2.5 py-1 text-[12px] font-semibold transition-colors ' +
                    (period === p
                      ? 'bg-brand-600 text-white'
                      : 'text-ink-500 hover:text-ink-900 dark:hover:text-white')
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SALES_TREND} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="day" {...chartAxis} dy={6} />
                <YAxis {...chartAxis} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => money(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="plainline" />
                <Line type="monotone" name="Gross sales" dataKey="gross" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" name="Net sales" dataKey="net" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                <Line type="monotone" name="Commission" dataKey="commission" stroke="var(--chart-3)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Orders overview" description="Current distribution across fulfilment states">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ORDER_MIX} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="status" {...chartAxis} dy={6} interval={0} angle={-20} height={48} textAnchor="end" />
                <YAxis {...chartAxis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" name="Orders" fill="var(--chart-1)" radius={[5, 5, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Seller growth" description="New, active and suspended sellers by month">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SELLER_GROWTH} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" {...chartAxis} dy={6} />
                <YAxis {...chartAxis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Bar dataKey="newSellers" name="New" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="active" name="Active" fill="var(--chart-4)" radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="suspended" name="Suspended" fill="var(--chart-3)" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Customer growth" description="New registrations and active customers">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={BUYER_GROWTH} margin={{ top: 6, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="month" {...chartAxis} dy={6} />
                <YAxis {...chartAxis} tickFormatter={(v: number) => `${v / 1000}k`} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="plainline" />
                <Line type="monotone" name="New registrations" dataKey="registrations" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" name="Active customers" dataKey="active" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      {/* Row 5 — pending actions */}
      <section className="mt-8">
        <h2 className="text-[17px] font-semibold">Requires your attention</h2>
        <p className="mt-1 text-[13px] text-ink-500">Each card opens the matching work queue.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ATTENTION.map((a) => (
            <AttentionCard key={a.label} {...a} />
          ))}
        </div>
      </section>

      {/* Row 6 — recent activity */}
      <div className="mt-6 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Panel
          title="Recent orders"
          padded={false}
          actions={
            <Button variant="ghost" size="sm" asChild>
              <AdminLink to="/admin/orders">View all</AdminLink>
            </Button>
          }
        >
          <ul className="divide-y">
            {recentOrders.map((order) => (
              <li key={order.id}>
                <AdminLink
                  to={`/admin/orders/${order.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="w-[104px] shrink-0 text-[13px] font-semibold tabular text-ink-900 dark:text-white">
                    {order.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-ink-700 dark:text-ink-200">{order.buyer}</span>
                    <span className="block text-[11px] text-ink-500">
                      {order.subOrders.length} seller{order.subOrders.length > 1 ? 's' : ''} · {order.date}
                    </span>
                  </span>
                  <span className="text-[13px] font-semibold tabular text-ink-900 dark:text-white">{money(order.value)}</span>
                  <StatusBadge status={order.fulfilment} />
                </AdminLink>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          title="Recent seller registrations"
          padded={false}
          actions={
            <Button variant="ghost" size="sm" asChild>
              <AdminLink to="/admin/sellers" search={{ status: 'Pending Review' }}>
                Review queue
              </AdminLink>
            </Button>
          }
        >
          <ul className="divide-y">
            {pendingSellers.map((seller) => (
              <li key={seller.id}>
                <AdminLink
                  to={`/admin/sellers/${seller.id}`}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-[12px] font-bold text-ink-600 dark:text-ink-300">
                    {seller.storeName.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink-900 dark:text-white">
                      {seller.storeName}
                    </span>
                    <span className="block text-[11px] text-ink-500">
                      {seller.city} · submitted {seller.submittedOn ?? seller.registered}
                    </span>
                  </span>
                  <StatusBadge status={seller.kyc} />
                </AdminLink>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  )
}
