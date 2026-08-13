import { useNavigate } from '@tanstack/react-router'
import { Archive, Copy, Package, Pause, Pencil, Play } from 'lucide-react'
import { toast } from 'sonner'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { AddProductMenu } from '@/components/seller/add-product-menu'
import { EmptyState, PageHeader } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { SellerStatusBanner } from '@/components/seller/status-banner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SELLER_PRODUCTS, type SellerProduct } from '@/data/seller'
import { discountPercent, money } from '@/lib/utils'

const STATUSES = ['Draft', 'Under Review', 'Changes Required', 'Approved', 'Active', 'Paused', 'Rejected', 'Out of Stock', 'Archived']
const CATEGORIES = ['Electronics', 'Accessories']

export function SellerProductsPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const { config, open, setOpen, ask } = useActionDialog()

  const activeFilters = { status: search.status ?? '', category: search.category ?? '' }
  function setFilter(key: string, value: string) {
    const next = { ...search, [key]: value }
    if (!value) delete next[key]
    navigate(adminLinkProps({ to: '/seller/products', search: next }))
  }

  const rows = SELLER_PRODUCTS.filter(
    (p) =>
      (!activeFilters.status || p.status === activeFilters.status) &&
      (!activeFilters.category || p.category.startsWith(activeFilters.category))
  )

  const columns: Column<SellerProduct>[] = [
    {
      key: 'product',
      header: 'Product',
      sortBy: (p) => p.name,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <ProductThumb glyph={p.glyph} tone={p.tone} className="aspect-square size-11 shrink-0 rounded-sm" />
          <span className="block min-w-0 max-w-[260px]">
            <AdminLink
              to={`/seller/products/${p.id}`}
              className="block truncate font-semibold text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
            >
              {p.name}
            </AdminLink>
            <span className="block truncate text-[11px] text-ink-500 tabular">
              {p.sku} · {p.brand}
            </span>
          </span>
        </div>
      ),
    },
    { key: 'category', header: 'Category', hideBelow: 'lg', cell: (p) => <span className="text-[12px] text-ink-500">{p.category}</span> },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      sortBy: (p) => p.price,
      cell: (p) => (
        <span className="block">
          <span className="block font-semibold tabular text-ink-900 dark:text-white">{money(p.price)}</span>
          <span className="block text-[11px] text-ink-400 tabular">{discountPercent(p.mrp, p.price)}% off MRP</span>
        </span>
      ),
    },
    {
      key: 'inventory',
      header: 'Inventory',
      align: 'right',
      sortBy: (p) => p.available,
      cell: (p) => (
        <span className="block">
          <span
            className={
              'block font-semibold tabular ' +
              (p.available === 0
                ? 'text-destructive'
                : p.available <= p.lowStockAt
                  ? 'text-gold-600 dark:text-gold-400'
                  : 'text-ink-900 dark:text-white')
            }
          >
            {p.available}
          </span>
          <span className="block text-[11px] text-ink-400">{p.reserved} reserved</span>
        </span>
      ),
    },
    { key: 'status', header: 'Status', sortBy: (p) => p.status, cell: (p) => <StatusBadge status={p.status} /> },
    { key: 'updated', header: 'Last updated', hideBelow: 'xl', sortBy: (p) => p.updated, cell: (p) => <span className="whitespace-nowrap text-ink-500">{p.updated}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (p) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <AdminLink to={`/seller/products/${p.id}`}>
                <Pencil />
                {p.status === 'Changes Required' ? 'Edit & resubmit' : 'View / Edit'}
              </AdminLink>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <AdminLink to="/seller/inventory">
                <Package />
                Update stock
              </AdminLink>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast.success('Product duplicated as draft')}>
              <Copy />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {p.status === 'Paused' ? (
              <DropdownMenuItem onSelect={() => toast.success(`${p.name} resumed`)}>
                <Play />
                Resume listing
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onSelect={() =>
                  ask({
                    title: `Pause ${p.name}?`,
                    description: 'The listing stops accepting new orders. Existing orders are unaffected and you can resume anytime.',
                    confirmLabel: 'Pause Listing',
                    successMessage: `${p.name} paused`,
                  })
                }
              >
                <Pause />
                Pause listing
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              variant="destructive"
              onSelect={() =>
                ask({
                  title: `Archive ${p.name}?`,
                  description:
                    'Archiving hides the product from your catalogue. Past orders keep their history — products with order history are never deleted.',
                  confirmLabel: 'Archive Product',
                  destructive: true,
                  requireNote: true,
                  successMessage: `${p.name} archived`,
                })
              }
            >
              <Archive />
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Products"
        description="Your catalogue, with moderation and availability state for every listing."
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Products', to: '/seller/products' }]}
        actions={<AddProductMenu />}
      />

      <SellerStatusBanner className="mb-5" />

      {SELLER_PRODUCTS.length === 0 ? (
        <div className="rounded-lg border bg-card shadow-xs">
          <EmptyState
            icon={Package}
            title="You haven't added any products yet"
            body="Add your first product and start selling on SafalMarketHub."
            action={
              <Button asChild>
                <AdminLink to="/seller/products/new">Add Product</AdminLink>
              </Button>
            }
          />
        </div>
      ) : (
        <DataTable
          rows={rows}
          columns={columns}
          searchKeys={(p) => `${p.name} ${p.sku} ${p.id} ${p.brand} ${p.variants.map((v) => v.sku).join(' ')}`}
          searchPlaceholder="Search product name or SKU"
          filters={[
            { key: 'status', label: 'Status', options: STATUSES },
            { key: 'category', label: 'Category', options: CATEGORIES },
          ]}
          activeFilters={activeFilters}
          onFilterChange={setFilter}
          exportName="Products"
          empty={{ title: 'No products match', body: 'Try clearing a filter or searching a different SKU.' }}
        />
      )}

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}
