import {
  TriangleAlert,
  Banknote,
  Bell,
  Boxes,
  LayoutDashboard,
  Package,
  Receipt,
  Search,
  Settings,
  ShoppingBag,
  Wallet,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { Badge } from '@/components/ui/badge'
import { DASHBOARD_STATS, LOW_STOCK, RECENT_ORDERS, SALES_SERIES } from '@/data/catalog'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Products', icon: Package },
  { label: 'Orders', icon: ShoppingBag },
  { label: 'Inventory', icon: Boxes },
  { label: 'Payments', icon: Wallet },
  { label: 'Settlements', icon: Banknote },
  { label: 'Business Settings', icon: Settings },
]

const STATUS_STYLES: Record<string, string> = {
  New: 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200',
  Packed: 'bg-gold-50 text-gold-600 dark:bg-gold-600/15 dark:text-gold-400',
  Shipped: 'bg-ink-100 text-ink-700 dark:bg-secondary dark:text-ink-200',
  Delivered: 'bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100',
}

export function SellerDashboardMock() {
  return (
    <div className="relative">
      <div
        className="overflow-hidden rounded-xl border bg-card shadow-xl"
        role="img"
        aria-label="Seller dashboard mockup: navigation, key metrics, sales overview chart, recent orders and low stock products"
      >
        {/* window chrome */}
        <div className="flex items-center gap-3 border-b bg-muted/60 px-4 py-3">
          <span className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-ink-300" />
            <span className="size-2.5 rounded-full bg-ink-300" />
            <span className="size-2.5 rounded-full bg-ink-300" />
          </span>
          <div className="mx-auto hidden w-[300px] items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-[11px] text-ink-400 sm:flex">
            <Search className="size-3" />
            seller.safalmarkethub.com/dashboard
          </div>
          <Bell className="ml-auto size-4 text-ink-400 sm:ml-0" />
        </div>

        <div className="grid lg:grid-cols-[212px_1fr]">
          {/* Left navigation */}
          <aside className="hidden border-r bg-sidebar p-3 lg:block">
            <ul className="space-y-0.5">
              {NAV.map(({ label, icon: Icon, active }) => (
                <li key={label}>
                  <span
                    className={cn(
                      'flex items-center gap-2.5 rounded-sm px-3 py-2.5 text-[13px] font-medium',
                      active
                        ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                        : 'text-sidebar-foreground'
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-md border bg-background p-3">
              <p className="text-[11px] font-semibold text-ink-700 dark:text-ink-200">Onboarding complete</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-200 dark:bg-secondary">
                <div className="h-full w-4/5 rounded-full bg-brand-600" />
              </div>
              <p className="mt-1.5 text-[10px] text-ink-500">4 of 5 steps</p>
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Good morning, ABC Electronics</h3>
                <p className="mt-0.5 text-[13px] text-ink-500">Here's how your store is performing today.</p>
              </div>
              <Badge variant="success" className="gap-1.5">
                <span className="size-1.5 rounded-full bg-teal-500" />
                Verified Seller
              </Badge>
            </div>

            {/* Stat cards */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
              {DASHBOARD_STATS.map((s) => (
                <div key={s.label} className="rounded-md border bg-background p-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">{s.label}</p>
                  <p className="mt-1.5 text-[19px] font-bold leading-none tracking-[-0.02em] text-ink-950 tabular dark:text-white">
                    {s.value}
                  </p>
                  <p
                    className={cn(
                      'mt-1.5 text-[11px] font-semibold',
                      s.trend === 'up' && 'text-teal-600 dark:text-teal-100',
                      s.trend === 'alert' && 'text-gold-600 dark:text-gold-400',
                      s.trend === 'flat' && 'text-ink-500'
                    )}
                  >
                    {s.delta}
                  </p>
                </div>
              ))}
            </div>

            {/* Chart + low stock */}
            <div className="mt-4 grid gap-3 xl:grid-cols-[1.55fr_1fr]">
              <div className="rounded-md border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[13px] font-semibold text-ink-900 dark:text-white">Sales Overview</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-ink-500">
                    Last 7 months
                  </span>
                </div>
                <div className="mt-3 h-[168px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SALES_SERIES} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--brand-600)" stopOpacity={0.26} />
                          <stop offset="100%" stopColor="var(--brand-600)" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: 'var(--ink-400)' }}
                        dy={6}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11, fill: 'var(--ink-400)' }}
                        tickFormatter={(v: number) => `${v / 1000}k`}
                      />
                      <Tooltip
                        cursor={{ stroke: 'var(--brand-300)', strokeWidth: 1 }}
                        contentStyle={{
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          background: 'var(--popover)',
                          fontSize: 12,
                          boxShadow: 'var(--shadow-md)',
                        }}
                        formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Sales']}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="var(--brand-600)"
                        strokeWidth={2}
                        fill="url(#salesFill)"
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--background)' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-md border bg-background p-4">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900 dark:text-white">
                  <TriangleAlert className="size-4 text-gold-500" />
                  Low Stock Products
                </p>
                <ul className="mt-3 space-y-2.5">
                  {LOW_STOCK.map((p) => (
                    <li key={p.sku} className="flex items-center justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-medium text-ink-800 dark:text-ink-100">
                          {p.name}
                        </span>
                        <span className="text-[11px] text-ink-400 tabular">{p.sku}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-bold text-gold-600 tabular dark:bg-gold-600/15 dark:text-gold-400">
                        {p.left} left
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent orders */}
            <div className="mt-3 overflow-hidden rounded-md border bg-background">
              <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900 dark:text-white">
                  <Receipt className="size-4 text-ink-400" />
                  Recent Orders
                </p>
                <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-300">View all</span>
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] uppercase tracking-[0.08em] text-ink-400">
                    <th className="px-4 py-2 font-semibold">Order</th>
                    <th className="px-4 py-2 font-semibold">Customer</th>
                    <th className="hidden px-4 py-2 font-semibold sm:table-cell">Item</th>
                    <th className="px-4 py-2 text-right font-semibold">Amount</th>
                    <th className="px-4 py-2 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[13px]">
                  {RECENT_ORDERS.map((o) => (
                    <tr key={o.id} className="border-t">
                      <td className="whitespace-nowrap px-4 py-2.5 font-semibold text-ink-800 tabular dark:text-ink-100">
                        {o.id}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-ink-600 dark:text-ink-300">{o.customer}</td>
                      <td className="hidden max-w-[180px] truncate px-4 py-2.5 text-ink-600 sm:table-cell dark:text-ink-300">
                        {o.item}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-right font-semibold text-ink-900 tabular dark:text-white">
                        {o.amount}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold',
                            STATUS_STYLES[o.status]
                          )}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Floating label */}
      <div className="absolute -bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 rounded-full border bg-card px-5 py-2.5 shadow-lg sm:flex">
        <span className="grid size-6 place-items-center rounded-full bg-brand-600 text-white">
          <LayoutDashboard className="size-3.5" />
        </span>
        <span className="text-[13px] font-semibold text-ink-900 dark:text-white">Your business. One dashboard.</span>
      </div>
    </div>
  )
}
