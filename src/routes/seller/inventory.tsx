import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Boxes } from 'lucide-react'
import { toast } from 'sonner'

import { adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SELLER_PRODUCTS, type SellerProduct } from '@/data/seller'
import { inr } from '@/lib/utils'

const FILTERS = ['In Stock', 'Low Stock', 'Out of Stock']

export function SellerInventoryPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const [target, setTarget] = useState<SellerProduct | null>(null)

  const activeFilters = { filter: search.filter ?? '' }
  function setFilter(key: string, value: string) {
    const next = { ...search, [key]: value }
    if (!value) delete next[key]
    navigate(adminLinkProps({ to: '/seller/inventory', search: next }))
  }

  const rows = SELLER_PRODUCTS.filter((p) => {
    if (!activeFilters.filter) return true
    if (activeFilters.filter === 'Out of Stock') return p.available === 0
    if (activeFilters.filter === 'Low Stock') return p.available > 0 && p.available <= p.lowStockAt
    return p.available > p.lowStockAt
  })

  const columns: Column<SellerProduct>[] = [
    {
      key: 'product',
      header: 'Product',
      sortBy: (p) => p.name,
      cell: (p) => (
        <div className="flex items-center gap-3">
          <ProductThumb glyph={p.glyph} tone={p.tone} className="aspect-square size-10 shrink-0 rounded-sm" />
          <span className="block min-w-0 max-w-[240px]">
            <span className="block truncate font-semibold text-ink-900 dark:text-white">{p.name}</span>
            <span className="block truncate text-[11px] text-ink-500">{p.category}</span>
          </span>
        </div>
      ),
    },
    { key: 'sku', header: 'SKU', sortBy: (p) => p.sku, cell: (p) => <span className="tabular text-ink-600 dark:text-ink-300">{p.sku}</span> },
    { key: 'price', header: 'Price', align: 'right', sortBy: (p) => p.price, cell: (p) => <span className="tabular">{inr(p.price)}</span> },
    {
      key: 'available',
      header: 'Available',
      align: 'right',
      sortBy: (p) => p.available,
      cell: (p) => (
        <span
          className={
            'font-bold tabular ' +
            (p.available === 0
              ? 'text-destructive'
              : p.available <= p.lowStockAt
                ? 'text-gold-600 dark:text-gold-400'
                : 'text-ink-900 dark:text-white')
          }
        >
          {p.available}
        </span>
      ),
    },
    { key: 'reserved', header: 'Reserved', align: 'right', hideBelow: 'md', cell: (p) => <span className="tabular text-ink-500">{p.reserved}</span> },
    {
      key: 'threshold',
      header: 'Low stock at',
      align: 'right',
      hideBelow: 'lg',
      cell: (p) => <span className="tabular text-ink-500">{p.lowStockAt}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (p) => (
        <StatusBadge status={p.available === 0 ? 'Out of Stock' : p.available <= p.lowStockAt ? 'Pending' : 'Active'} />
      ),
    },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (p) => (
        <Button variant="outline" size="sm" className="h-8" onClick={() => setTarget(p)}>
          Update Stock
        </Button>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Inventory"
        description="Stock levels across every SKU, with the alert threshold that triggers a low-stock warning."
        breadcrumb={[{ label: 'Dashboard', to: '/seller' }, { label: 'Inventory', to: '/seller/inventory' }]}
      />

      <DataTable
        rows={rows}
        columns={columns}
        searchKeys={(p) => `${p.name} ${p.sku} ${p.id}`}
        searchPlaceholder="Search product or SKU"
        filters={[{ key: 'filter', label: 'Stock', options: FILTERS }]}
        activeFilters={activeFilters}
        onFilterChange={setFilter}
        exportName="Inventory"
        empty={{ title: 'Nothing here', body: 'No SKU matches this stock filter.' }}
      />

      <UpdateStockDialog product={target} onClose={() => setTarget(null)} />
    </>
  )
}

function UpdateStockDialog({ product, onClose }: { product: SellerProduct | null; onClose: () => void }) {
  const [mode, setMode] = useState<'set' | 'add'>('set')
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)

  const current = product?.available ?? 0
  const parsed = Number(value || 0)
  const result = mode === 'set' ? parsed : current + parsed

  async function save() {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 700))
    setSaving(false)
    onClose()
    setValue('')
    toast.success('Inventory updated successfully.', { description: `${product?.sku} · ${current} → ${result}` })
  }

  return (
    <Dialog open={Boolean(product)} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5">
            <Boxes className="size-5 text-brand-600 dark:text-brand-300" />
            Update inventory
          </DialogTitle>
          <DialogDescription>
            {product?.name} · {product?.sku}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex items-center justify-between gap-4 rounded-sm border bg-muted/50 px-4 py-3">
            <span className="text-[13px] text-ink-600 dark:text-ink-300">Current stock</span>
            <span className="text-[19px] font-bold tabular text-ink-950 dark:text-white">{current}</span>
          </div>

          <div className="flex rounded-sm border p-0.5">
            {(['set', 'add'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={
                  'flex-1 rounded-[6px] px-3 py-2 text-[13px] font-semibold transition-colors ' +
                  (mode === m ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-900 dark:hover:text-white')
                }
              >
                {m === 'set' ? 'Set new stock' : 'Add quantity'}
              </button>
            ))}
          </div>

          <div className="grid gap-[7px]">
            <Label htmlFor="stock-value">{mode === 'set' ? 'New stock' : 'Add quantity'}</Label>
            <Input
              id="stock-value"
              type="number"
              inputMode="numeric"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={mode === 'set' ? String(current) : '+18'}
            />
          </div>

          {value && (
            <p className="rounded-sm border border-brand-100 bg-brand-50 px-3.5 py-2.5 text-[13px] font-medium text-brand-800 dark:border-brand-800 dark:bg-brand-950/60 dark:text-brand-200">
              Stock will change from {current} to <span className="font-bold tabular">{result}</span>.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={save} disabled={!value} loading={saving} loadingLabel="Updating...">
            Update Inventory
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
