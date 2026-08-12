import { useNavigate } from '@tanstack/react-router'
import { Check, Plus, Tag } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DataTable, type Column } from '@/components/admin/data-table'
import { PageHeader } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BRANDS, CATEGORY_TREE, type Brand, type CategoryNode } from '@/data/admin'

export function CataloguePage() {
  const search = useAdminSearch()
  const navigate = useNavigate()
  const { config, open, setOpen, ask } = useActionDialog()

  const tab = search.tab === 'brands' ? 'brands' : 'categories'
  function setTab(value: string) {
    navigate(adminLinkProps({ to: '/admin/catalogue', search: { tab: value } }))
  }

  const categoryColumns: Column<CategoryNode>[] = [
    {
      key: 'name',
      header: 'Category',
      cell: (c) => (
        <span className="flex items-center gap-2" style={{ paddingLeft: c.level * 18 }}>
          {c.level > 0 && <span aria-hidden className="text-ink-300">└</span>}
          <span className="block">
            <span className="block font-semibold text-ink-900 dark:text-white">{c.name}</span>
            <span className="block text-[11px] text-ink-500 tabular">{c.id}</span>
          </span>
        </span>
      ),
    },
    { key: 'parent', header: 'Parent', hideBelow: 'md', cell: (c) => c.parent ?? '—' },
    { key: 'products', header: 'Products', align: 'right', sortBy: (c) => c.products, cell: (c) => <span className="tabular">{c.products.toLocaleString('en-US')}</span> },
    { key: 'order', header: 'Display order', align: 'right', hideBelow: 'lg', sortBy: (c) => c.order, cell: (c) => <span className="tabular">{c.order}</span> },
    { key: 'status', header: 'Status', sortBy: (c) => c.status, cell: (c) => <StatusBadge status={c.status} /> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (c) => (
        <div className="inline-flex gap-1.5">
          <Button variant="ghost" size="sm" className="h-8">
            Edit
          </Button>
          {c.status === 'Active' ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() =>
                ask({
                  title: `Deactivate ${c.name}?`,
                  description:
                    c.products > 0
                      ? `${c.products.toLocaleString('en-US')} products sit in this category. Deactivating hides it from the storefront; existing products keep their history and may need reassignment.`
                      : 'The category will be hidden from the storefront. Nothing is deleted.',
                  confirmLabel: 'Deactivate Category',
                  requireNote: true,
                  successMessage: `${c.name} deactivated`,
                })
              }
            >
              Deactivate
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="h-8">
              Activate
            </Button>
          )}
        </div>
      ),
    },
  ]

  const brandColumns: Column<Brand>[] = [
    {
      key: 'brand',
      header: 'Brand',
      sortBy: (b) => b.name,
      cell: (b) => (
        <span className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-[11px] font-bold text-ink-600 dark:text-ink-300">
            {b.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="block">
            <span className="block font-semibold text-ink-900 dark:text-white">{b.name}</span>
            <span className="block text-[11px] text-ink-500 tabular">{b.id}</span>
          </span>
        </span>
      ),
    },
    { key: 'products', header: 'Products', align: 'right', sortBy: (b) => b.products, cell: (b) => <span className="tabular">{b.products}</span> },
    { key: 'requested', header: 'Requested by', hideBelow: 'md', cell: (b) => b.requestedBy ?? '—' },
    { key: 'status', header: 'Status', sortBy: (b) => b.status, cell: (b) => <StatusBadge status={b.status} /> },
    {
      key: 'action',
      header: 'Action',
      align: 'right',
      cell: (b) =>
        b.status === 'Pending Approval' ? (
          <div className="inline-flex gap-1.5">
            <Button
              size="sm"
              className="h-8"
              onClick={() =>
                ask({
                  title: `Approve brand "${b.name}"`,
                  description: `${b.requestedBy} requested this brand. Approving lets any seller list products under it.`,
                  confirmLabel: 'Approve Brand',
                  successMessage: `${b.name} approved`,
                })
              }
            >
              <Check className="size-4" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-destructive/30 text-destructive hover:bg-destructive/8"
              onClick={() =>
                ask({
                  title: `Reject brand "${b.name}"`,
                  description: 'The seller is notified and can submit a different brand.',
                  confirmLabel: 'Reject Brand',
                  destructive: true,
                  reasons: ['Trademark concern', 'Duplicate brand', 'Insufficient brand authorisation', 'Generic name'],
                  requireNote: true,
                  successMessage: 'Brand request rejected',
                })
              }
            >
              Reject
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="h-8">
            Edit
          </Button>
        ),
    },
  ]

  return (
    <>
      <PageHeader
        title="Catalogue"
        description="Category structure and brand registry for the marketplace."
        breadcrumb={[{ label: 'Dashboard', to: '/admin' }, { label: 'Products', to: '/admin/products' }, { label: 'Catalogue', to: '/admin/catalogue' }]}
        actions={
          <Button
            size="sm"
            onClick={() =>
              ask({
                title: tab === 'categories' ? 'Add category' : 'Add brand',
                description:
                  tab === 'categories'
                    ? 'Create a category or subcategory. Display order controls storefront placement.'
                    : 'Add a brand to the registry so sellers can list products under it.',
                confirmLabel: tab === 'categories' ? 'Create Category' : 'Create Brand',
                extraFields:
                  tab === 'categories'
                    ? [
                        { key: 'name', label: 'Category name', placeholder: 'e.g. Action Cameras', required: true },
                        { key: 'parent', label: 'Parent category', placeholder: 'e.g. Cameras' },
                        { key: 'order', label: 'Display order', placeholder: '1' },
                      ]
                    : [{ key: 'name', label: 'Brand name', placeholder: 'e.g. SoundPro', required: true }],
                successMessage: tab === 'categories' ? 'Category created' : 'Brand created',
              })
            }
          >
            <Plus className="size-4" />
            {tab === 'categories' ? 'Add Category' : 'Add Brand'}
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-5">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'categories' ? (
        <>
          <DataTable
            rows={CATEGORY_TREE}
            columns={categoryColumns}
            searchKeys={(c) => `${c.name} ${c.id} ${c.parent ?? ''}`}
            searchPlaceholder="Search category name"
            filters={[{ key: 'status', label: 'Status', options: ['Active', 'Inactive'] }]}
            initialPageSize={25}
            exportName="Categories"
            empty={{ title: 'No categories', body: 'Create your first category to organise the catalogue.' }}
          />
          <Alert variant="default" className="mt-4">
            <Tag />
            <AlertDescription>
              Categories holding historical product or order data are never deleted — deactivate them instead so reporting
              stays intact.
            </AlertDescription>
          </Alert>
        </>
      ) : (
        <DataTable
          rows={BRANDS}
          columns={brandColumns}
          searchKeys={(b) => `${b.name} ${b.id} ${b.requestedBy ?? ''}`}
          searchPlaceholder="Search brand name"
          filters={[{ key: 'status', label: 'Status', options: ['Active', 'Inactive', 'Pending Approval'] }]}
          exportName="Brands"
          empty={{ title: 'No brands', body: 'Add a brand or approve a seller brand request.' }}
        />
      )}

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}
