import { useNavigate } from '@tanstack/react-router'
import { Check } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Button } from '@/components/ui/button'
import { ADMIN_PRODUCTS, type AdminProduct } from '@/data/admin'
import { discountPercent, inr } from '@/lib/utils'

const APPROVALS = ['In Review', 'Approved', 'Changes Required', 'Rejected']
const STATES = ['Active', 'Inactive', 'Disabled', 'Out of Stock', 'Draft']
const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Accessories']
const SELLER_NAMES = [...new Set(ADMIN_PRODUCTS.map((p) => p.seller))]

export function ProductsPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const { config, open, setOpen, ask } = useActionDialog()

  const activeFilters = {
    status: search.status ?? '',
    state: search.state ?? '',
    category: search.category ?? '',
    seller: search.seller ?? '',
  }

  function setFilter(key: string, value: string) {
    const next = { ...search, [key]: value }
    if (!value) delete next[key]
    navigate(adminLinkProps({ to: '/admin/products', search: next }))
  }

  const rows = ADMIN_PRODUCTS.filter(
    (p) =>
      (!activeFilters.status || p.approval === activeFilters.status) &&
      (!activeFilters.state || p.state === activeFilters.state) &&
      (!activeFilters.category || p.category.startsWith(activeFilters.category)) &&
      (!activeFilters.seller || p.seller === activeFilters.seller)
  )

  const isQueue = activeFilters.status === 'In Review'

  const columns: Column<AdminProduct>[] = [
    {
      key: 'product',
      header: 'Product',
      sortBy: (p) => p.name,
      cell: (p) => (
        <span className="block max-w-[280px]">
          <AdminLink
            to={`/admin/products/${p.id}`}
            className="block truncate font-semibold text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
          >
            {p.name}
          </AdminLink>
          <span className="block truncate text-[11px] text-ink-500 tabular">
            {p.id} · {p.brand}
          </span>
        </span>
      ),
    },
    {
      key: 'seller',
      header: 'Seller',
      hideBelow: 'md',
      sortBy: (p) => p.seller,
      cell: (p) => (
        <AdminLink to={`/admin/sellers/${p.sellerId}`} className="text-ink-700 hover:text-brand-700 dark:text-ink-200">
          {p.seller}
        </AdminLink>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      hideBelow: 'lg',
      cell: (p) => <span className="text-[12px] text-ink-500">{p.category}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      sortBy: (p) => p.price,
      cell: (p) => (
        <span className="block">
          <span className="block font-semibold tabular text-ink-900 dark:text-white">{inr(p.price)}</span>
          <span className="block text-[11px] text-ink-400 tabular">
            MRP {inr(p.mrp)} · {discountPercent(p.mrp, p.price)}% off
          </span>
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      hideBelow: 'sm',
      sortBy: (p) => p.stock,
      cell: (p) => (
        <span className={'tabular ' + (p.stock === 0 ? 'font-semibold text-destructive' : '')}>{p.stock}</span>
      ),
    },
    { key: 'state', header: 'Product state', hideBelow: 'xl', cell: (p) => <StatusBadge status={p.state} /> },
    { key: 'approval', header: 'Approval', sortBy: (p) => p.approval, cell: (p) => <StatusBadge status={p.approval} /> },
    {
      key: 'submitted',
      header: isQueue ? 'Submitted' : 'Created',
      hideBelow: 'lg',
      cell: (p) => <span className="whitespace-nowrap text-ink-500">{isQueue ? (p.submitted ?? '—') : p.created}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (p) => (
        <Button variant="outline" size="sm" className="h-8" asChild>
          <AdminLink to={`/admin/products/${p.id}`}>{p.approval === 'In Review' ? 'Review' : 'View'}</AdminLink>
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title={isQueue ? 'Products awaiting approval' : 'All products'}
        description={
          isQueue
            ? 'Moderate submitted listings before they become available on the marketplace.'
            : 'Every listing across the marketplace, with moderation and availability state.'
        }
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Products', to: '/admin/products' }]}
        actions={
          !isQueue && (
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/admin/products" search={{ status: 'In Review' }}>
                Approval queue
              </AdminLink>
            </Button>
          )
        }
      />

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(p) => `${p.name} ${p.id} ${p.brand} ${p.seller} ${p.variants.map((v) => v.sku).join(' ')}`}
        searchPlaceholder="Search product name, SKU, seller, brand or product ID"
        filters={[
          { key: 'status', label: 'Approval', options: APPROVALS },
          { key: 'state', label: 'State', options: STATES },
          { key: 'category', label: 'Category', options: CATEGORIES },
          { key: 'seller', label: 'Seller', options: SELLER_NAMES },
        ]}
        activeFilters={activeFilters}
        onFilterChange={setFilter}
        selectable={isQueue}
        bulkActions={(selected, clear) => (
          <Button
            size="sm"
            className="h-8"
            onClick={() =>
              ask({
                title: `Approve ${selected.length} products`,
                description:
                  'Bulk approval is limited to listings that already pass automated moderation checks. Each approval is logged separately.',
                confirmLabel: `Approve ${selected.length}`,
                successMessage: `${selected.length} products approved`,
              })
            }
          >
            <Check className="size-4" />
            Approve selected
            <span className="sr-only" onClick={clear} />
          </Button>
        )}
        exportName="Products"
        empty={
          isQueue
            ? { title: 'No products pending review', body: 'There are no products waiting for approval.' }
            : { title: 'No products found', body: 'No listing matches the current filters.' }
        }
      />

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}
