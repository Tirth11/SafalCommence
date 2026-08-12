import { useNavigate } from '@tanstack/react-router'
import { Globe, ShoppingBag, Store } from 'lucide-react'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { EmptyState, PageHeader } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { SellerStatusBanner } from '@/components/seller/status-banner'
import { Button } from '@/components/ui/button'
import { ORDER_TABS, SELLER_ORDERS, type SellerOrder } from '@/data/seller'
import { inr } from '@/lib/utils'

const NEXT_ACTION: Record<SellerOrder['status'], string> = {
  New: 'Accept order',
  Processing: 'Mark as packed',
  Packed: 'Ship order',
  Shipped: 'Track shipment',
  Delivered: 'Awaiting settlement',
  Cancelled: 'No action',
  Returned: 'Respond to return',
}

export function SellerOrdersPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const tab = (search.tab ?? 'All') as (typeof ORDER_TABS)[number]

  const rows = SELLER_ORDERS.filter((o) => {
    if (tab === 'All') return true
    if (tab === 'Returned') return o.status === 'Returned' || Boolean(o.returnCase)
    return o.status === tab
  })

  const counts = Object.fromEntries(
    ORDER_TABS.map((t) => [
      t,
      t === 'All'
        ? SELLER_ORDERS.length
        : t === 'Returned'
          ? SELLER_ORDERS.filter((o) => o.status === 'Returned' || o.returnCase).length
          : SELLER_ORDERS.filter((o) => o.status === t).length,
    ])
  )

  const columns: Column<SellerOrder>[] = [
    {
      key: 'order',
      header: 'Order',
      sortBy: (o) => o.id,
      cell: (o) => (
        <span className="block">
          <AdminLink
            to={`/seller/orders/${o.id}`}
            className="block font-semibold tabular text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
          >
            {o.id}
          </AdminLink>
          <span className="block text-[11px] text-ink-500">{o.date}</span>
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      sortBy: (o) => o.customer,
      cell: (o) => (
        <span className="block">
          <span className="block text-ink-800 dark:text-ink-100">{o.customer}</span>
          <span className="block text-[11px] text-ink-500">{o.city}</span>
        </span>
      ),
    },
    {
      key: 'products',
      header: 'Products',
      hideBelow: 'lg',
      cell: (o) => (
        <span className="block max-w-[220px]">
          <span className="block truncate text-[13px] text-ink-700 dark:text-ink-200">{o.items[0].name}</span>
          {o.items.length > 1 && <span className="block text-[11px] text-ink-500">+{o.items.length - 1} more</span>}
        </span>
      ),
    },
    {
      key: 'qty',
      header: 'Qty',
      align: 'right',
      hideBelow: 'xl',
      cell: (o) => <span className="tabular">{o.items.reduce((sum, i) => sum + i.qty, 0)}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortBy: (o) => o.productValue,
      cell: (o) => <span className="font-semibold tabular text-ink-900 dark:text-white">{inr(o.productValue)}</span>,
    },
    {
      key: 'source',
      header: 'Source',
      sortBy: (o) => o.channel,
      cell: (o) => (
        <span
          className={
            'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ' +
            (o.channel === 'store'
              ? 'border-teal-100 bg-teal-50 text-teal-600 dark:border-teal-600/40 dark:bg-teal-600/15 dark:text-teal-100'
              : 'border-brand-100 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200')
          }
        >
          {o.channel === 'store' ? <Globe className="size-3" /> : <Store className="size-3" />}
          {o.channel === 'store' ? 'Online Store' : 'SafalMarketHub'}
        </span>
      ),
    },
    { key: 'payment', header: 'Payment', hideBelow: 'xl', cell: (o) => <StatusBadge status={o.payment === 'Paid' ? 'Successful' : o.payment} /> },
    { key: 'status', header: 'Fulfilment', sortBy: (o) => o.status, cell: (o) => <StatusBadge status={o.status} /> },
    {
      key: 'shipping',
      header: 'Shipping',
      hideBelow: 'xl',
      cell: (o) =>
        o.awb ? (
          <span className="block">
            <span className="block text-[12px] font-medium text-ink-700 dark:text-ink-200">{o.courier}</span>
            <span className="block text-[11px] text-ink-500 tabular">{o.awb}</span>
          </span>
        ) : (
          <span className="text-ink-400">—</span>
        ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (o) => (
        <Button
          variant={['New', 'Processing', 'Packed'].includes(o.status) ? 'default' : 'outline'}
          size="sm"
          className="h-8"
          asChild
        >
          <AdminLink to={`/seller/orders/${o.id}`}>
            {['New', 'Processing', 'Packed'].includes(o.status) ? NEXT_ACTION[o.status] : 'View'}
          </AdminLink>
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Orders"
        description="Every order placed with your store, and the next fulfilment action for each one."
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Orders', to: '/seller/orders' }]}
      />

      <SellerStatusBanner className="mb-5" />

      {/* Status tabs */}
      <div className="mb-4 overflow-x-auto no-scrollbar">
        <div className="flex min-w-max gap-1 rounded-lg border bg-card p-1 shadow-xs">
          {ORDER_TABS.map((t) => (
            <AdminLink
              key={t}
              to="/seller/orders"
              search={t === 'All' ? undefined : { tab: t }}
              className={
                'flex items-center gap-2 rounded-sm px-3.5 py-2 text-[13px] font-semibold transition-colors ' +
                (tab === t
                  ? 'bg-brand-600 text-white'
                  : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-secondary')
              }
            >
              {t}
              <span
                className={
                  'rounded-full px-1.5 text-[11px] font-bold tabular ' +
                  (tab === t ? 'bg-white/20' : 'bg-muted text-ink-500')
                }
              >
                {counts[t]}
              </span>
            </AdminLink>
          ))}
        </div>
      </div>

      {SELLER_ORDERS.length === 0 ? (
        <div className="rounded-lg border bg-card shadow-xs">
          <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            body="New orders will appear here when customers purchase your products."
          />
        </div>
      ) : (
        <DataTable
          rows={rows}
          columns={columns}
          searchKeys={(o) => `${o.id} ${o.parentOrder} ${o.customer} ${o.items.map((i) => `${i.name} ${i.sku}`).join(' ')}`}
          searchPlaceholder="Search order ID, customer or product"
          filters={[{ key: 'source', label: 'Source', options: ['SafalMarketHub', 'Online Store'] }]}
          rowHref={(o) => ({ to: `/seller/orders/${o.id}` })}
          exportName="Orders"
          empty={{
            title: `No ${tab.toLowerCase()} orders`,
            body: 'Orders move through this stage as you fulfil them.',
          }}
        />
      )}

      {(() => {
        function navigateToNew() {
          navigate(adminLinkProps({ to: '/seller/orders', search: { tab: 'New' } }))
        }
        const newCount = counts['New'] ?? 0
        return newCount > 0 && tab !== 'New' ? (
          <p className="mt-4 text-[12px] text-ink-500">
            {newCount} order{newCount > 1 ? 's' : ''} waiting to be accepted.{' '}
            <button type="button" onClick={navigateToNew} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Show them
            </button>
          </p>
        ) : null
      })()}
    </>
  )
}
