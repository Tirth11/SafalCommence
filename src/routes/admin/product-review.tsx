import { useParams } from '@tanstack/react-router'
import { Ban, Check, Images, Pencil, TriangleAlert, X } from 'lucide-react'

import { ActionDialog, useActionDialog } from '@/components/admin/action-dialog'
import { AdminLink } from '@/components/admin/admin-link'
import { DefinitionList, EmptyState, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ADMIN_PRODUCTS, SELLERS } from '@/data/admin'
import { discountPercent, inr } from '@/lib/utils'

const CHANGE_REASONS = [
  'Improve product description',
  'Incorrect category',
  'Poor image quality',
  'Missing product specifications',
  'Invalid price',
  'Missing HSN/GST details',
]

const REJECT_REASONS = [
  'Prohibited product',
  'Counterfeit concern',
  'Misleading listing',
  'Duplicate listing',
  'Restricted category',
  'Policy violation',
]

const DISABLE_REASONS = [
  'Customer safety concern',
  'Counterfeit investigation',
  'Incorrect pricing',
  'Seller suspended',
  'Regulatory takedown',
]

export function ProductReviewPage() {
  const { productId } = useParams({ strict: false }) as { productId?: string }
  const { config, open, setOpen, ask } = useActionDialog()

  const product = ADMIN_PRODUCTS.find((p) => p.id === productId)

  if (!product) {
    return (
      <Panel padded={false}>
        <EmptyState
          title="Product not found"
          body="This product reference does not exist, or the listing has been removed."
          action={
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/admin/products">Back to products</AdminLink>
            </Button>
          }
        />
      </Panel>
    )
  }

  const seller = SELLERS.find((s) => s.id === product.sellerId)
  const inReview = product.approval === 'In Review'
  const glyph = product.category.startsWith('Fashion')
    ? 'shirt'
    : product.category.startsWith('Beauty')
      ? 'bottle'
      : product.category.startsWith('Sports')
        ? 'dumbbell'
        : product.category.startsWith('Home')
          ? 'lamp'
          : product.category.startsWith('Accessories')
            ? 'bag'
            : 'headphones'

  return (
    <>
      <PageHeader
        title={product.name}
        description={`${product.id} · ${product.brand} · listed by ${product.seller}`}
        breadcrumb={[
          { label: 'Dashboard', to: '/admin' },
          { label: 'Products', to: '/admin/products' },
          { label: product.id, to: `/admin/products/${product.id}` },
        ]}
        actions={
          inReview ? (
            <>
              <Button
                size="sm"
                onClick={() =>
                  ask({
                    title: 'Approve product',
                    description: `${product.name} moves from In Review to Approved and becomes available for sale. ${product.seller} is notified.`,
                    confirmLabel: 'Approve Product',
                    successMessage: 'Product approved',
                  })
                }
              >
                <Check className="size-4" />
                Approve Product
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  ask({
                    title: 'Request product changes',
                    description: 'The listing moves to Changes Required. The seller can edit and resubmit it.',
                    confirmLabel: 'Request Changes',
                    reasons: CHANGE_REASONS,
                    requireNote: true,
                    successMessage: 'Changes requested',
                  })
                }
              >
                <Pencil className="size-4" />
                Request Changes
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/8"
                onClick={() =>
                  ask({
                    title: 'Reject product',
                    description: `${product.name} will be rejected and cannot be sold on SafalMarketHub.`,
                    confirmLabel: 'Reject Product',
                    destructive: true,
                    reasons: REJECT_REASONS,
                    requireNote: true,
                    successMessage: 'Product rejected',
                  })
                }
              >
                <X className="size-4" />
                Reject
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/8"
              onClick={() =>
                ask({
                  title: 'Disable product',
                  description:
                    'The listing becomes unavailable for new purchases. Historical orders are unchanged and the seller keeps the listing data.',
                  confirmLabel: 'Disable Product',
                  destructive: true,
                  reasons: DISABLE_REASONS,
                  requireNote: true,
                  successMessage: 'Product disabled',
                })
              }
            >
              <Ban className="size-4" />
              Disable Product
            </Button>
          )
        }
      />

      {product.reason && (
        <Alert variant={product.approval === 'Rejected' ? 'destructive' : 'warning'} className="mb-4">
          <TriangleAlert />
          <AlertTitle>{product.approval === 'Rejected' ? 'Listing rejected' : 'Listing disabled'}</AlertTitle>
          <AlertDescription>{product.reason}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <div className="grid gap-4">
          <Panel title="Images" description={`${product.images} images submitted · first image is the primary`}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: Math.min(product.images, 4) }).map((_, i) => (
                <div key={i} className="relative">
                  <ProductThumb glyph={glyph} tone={i % 2 === 0 ? 'brand' : 'ink'} className="aspect-square" />
                  {i === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-bold text-ink-700 backdrop-blur-sm">
                      Primary
                    </span>
                  )}
                </div>
              ))}
              {product.images > 4 && (
                <div className="grid aspect-square place-items-center rounded-md border bg-muted text-center">
                  <div>
                    <Images className="mx-auto size-5 text-ink-400" />
                    <p className="mt-1 text-[12px] font-semibold text-ink-600">+{product.images - 4} more</p>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Product information">
            <DefinitionList
              items={[
                { label: 'Product name', value: product.name },
                { label: 'Brand', value: product.brand },
                { label: 'Category', value: product.category },
                { label: 'Manufacturer', value: product.manufacturer },
                { label: 'Country of origin', value: product.origin },
                { label: 'Created', value: product.created, hint: product.submitted ? `Submitted ${product.submitted}` : undefined },
              ]}
            />
            <div className="mt-6 border-t pt-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Description</p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-700 dark:text-ink-200">{product.description}</p>
            </div>
          </Panel>

          <Panel title={`Variants (${product.variants.length})`} padded={false}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Attributes</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.variants.map((v) => (
                  <TableRow key={v.sku}>
                    <TableCell className="font-semibold tabular text-ink-900 dark:text-white">{v.sku}</TableCell>
                    <TableCell>{v.attributes}</TableCell>
                    <TableCell className="text-right tabular">{v.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </div>

        <div className="grid content-start gap-4">
          <Panel title="Moderation state">
            <DefinitionList
              columns={1}
              items={[
                { label: 'Approval status', value: <StatusBadge status={product.approval} /> },
                { label: 'Product state', value: <StatusBadge status={product.state} /> },
                { label: 'Stock', value: <span className="tabular">{product.stock}</span> },
              ]}
            />
          </Panel>

          <Panel title="Pricing & tax">
            <DefinitionList
              columns={1}
              items={[
                { label: 'MRP', value: <span className="tabular">{inr(product.mrp)}</span> },
                {
                  label: 'Selling price',
                  value: <span className="tabular">{inr(product.price)}</span>,
                  hint: `${discountPercent(product.mrp, product.price)}% off MRP`,
                },
                { label: 'GST', value: `${product.gst}%` },
                { label: 'HSN / SAC', value: <span className="tabular">{product.hsn}</span> },
                {
                  label: 'Commission at 10%',
                  value: <span className="tabular">{inr(Math.round(product.price * 0.1))}</span>,
                  hint: `Seller receivable ${inr(product.price - Math.round(product.price * 0.1))}`,
                },
              ]}
            />
          </Panel>

          <Panel title="Seller">
            {seller ? (
              <>
                <DefinitionList
                  columns={1}
                  items={[
                    { label: 'Store', value: seller.storeName },
                    { label: 'Legal name', value: seller.legalName },
                    { label: 'Seller status', value: <StatusBadge status={seller.status} /> },
                    { label: 'KYC', value: <StatusBadge status={seller.kyc} /> },
                    { label: 'GSTIN', value: <span className="tabular">{seller.gstin}</span> },
                  ]}
                />
                <Button variant="outline" size="sm" className="mt-5 w-full" asChild>
                  <AdminLink to={`/admin/sellers/${seller.id}`}>Open seller</AdminLink>
                </Button>
              </>
            ) : (
              <p className="text-[13px] text-ink-500">Seller record unavailable.</p>
            )}
          </Panel>
        </div>
      </div>

      <ActionDialog config={config} open={open} onOpenChange={setOpen} />
    </>
  )
}
