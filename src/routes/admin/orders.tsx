import { useNavigate } from '@tanstack/react-router'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { ADMIN_ORDERS, type AdminOrder } from '@/data/admin'
import { inr } from '@/lib/utils'

const FULFILMENT = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned']
const PAYMENTS = ['Initiated', 'Pending', 'Successful', 'Failed', 'Partially Refunded', 'Refunded']

export function OrdersPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()

  const activeFilters = { status: search.status ?? '', payment: search.payment ?? '' }

  function setFilter(key: string, value: string) {
    const next = { ...search, [key]: value }
    if (!value) delete next[key]
    navigate(adminLinkProps({ to: '/admin/orders', search: next }))
  }

  const rows = ADMIN_ORDERS.filter(
    (o) =>
      (!activeFilters.status || o.fulfilment === activeFilters.status) &&
      (!activeFilters.payment || o.payment === activeFilters.payment)
  )

  const columns: Column<AdminOrder>[] = [
    {
      key: 'order',
      header: 'Order',
      sortBy: (o) => o.id,
      cell: (o) => (
        <span className="block">
          <AdminLink
            to={`/admin/orders/${o.id}`}
            className="block font-semibold tabular text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
          >
            {o.id}
          </AdminLink>
          <span className="block text-[11px] text-ink-500">
            {o.subOrders.length > 1 ? `${o.subOrders.length} sub-orders` : o.subOrders[0].id}
          </span>
        </span>
      ),
    },
    {
      key: 'buyer',
      header: 'Buyer',
      sortBy: (o) => o.buyer,
      cell: (o) => (
        <span className="block">
          <span className="block text-ink-800 dark:text-ink-100">{o.buyer}</span>
          <span className="block text-[11px] text-ink-500 tabular">{o.buyerId}</span>
        </span>
      ),
    },
    {
      key: 'sellers',
      header: 'Sellers',
      hideBelow: 'lg',
      cell: (o) => (
        <span className="block max-w-[200px] truncate text-[12px] text-ink-600 dark:text-ink-300">
          {o.subOrders.map((s) => s.seller).join(', ')}
        </span>
      ),
    },
    { key: 'date', header: 'Order date', hideBelow: 'md', sortBy: (o) => o.date, cell: (o) => <span className="whitespace-nowrap text-ink-500">{o.date}</span> },
    { key: 'items', header: 'Items', align: 'right', hideBelow: 'xl', sortBy: (o) => o.itemCount, cell: (o) => <span className="tabular">{o.itemCount}</span> },
    {
      key: 'value',
      header: 'Order value',
      align: 'right',
      sortBy: (o) => o.value,
      cell: (o) => <span className="font-semibold tabular text-ink-900 dark:text-white">{inr(o.value)}</span>,
    },
    { key: 'payment', header: 'Payment', sortBy: (o) => o.payment, cell: (o) => <StatusBadge status={o.payment} /> },
    { key: 'fulfilment', header: 'Fulfilment', sortBy: (o) => o.fulfilment, cell: (o) => <StatusBadge status={o.fulfilment} /> },
  ]

  return (
    <>
      <PageHeader
        title={activeFilters.status ? `${activeFilters.status} orders` : 'All orders'}
        description="Marketplace orders across every seller. A multi-seller order splits into one sub-order per seller."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Orders', to: '/admin/orders' }]}
      />

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(o) => `${o.id} ${o.buyer} ${o.buyerId} ${o.subOrders.map((s) => `${s.id} ${s.seller}`).join(' ')}`}
        searchPlaceholder="Search order ID, buyer or seller"
        filters={[
          { key: 'status', label: 'Fulfilment', options: FULFILMENT },
          { key: 'payment', label: 'Payment', options: PAYMENTS },
        ]}
        activeFilters={activeFilters}
        onFilterChange={setFilter}
        rowHref={(o) => ({ to: `/admin/orders/${o.id}` })}
        exportName="Orders"
        empty={{ title: 'No orders found', body: 'No order matches the current filters.' }}
      />
    </>
  )
}
