import { useMemo, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, ArrowRight, Check, GripVertical, ImagePlus, Plus, Trash2, TriangleAlert, X } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { DefinitionList, PageHeader, Panel } from '@/components/admin/primitives'
import { StatusBadge } from '@/components/admin/status-badge'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { FormActions, FormSection, Stepper } from '@/components/seller/seller-bits'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field, SelectField } from '@/routes/seller/setup'
import { PRODUCT_CATEGORIES, SELLER_PRODUCTS } from '@/data/seller'
import { discountPercent, inr } from '@/lib/utils'

const STEPS = [
  { key: 'basic', label: 'Basic Details' },
  { key: 'images', label: 'Images' },
  { key: 'variants', label: 'Variants' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'review', label: 'Review' },
]

export function SellerProductFormPage() {
  const { productId } = useParams({ strict: false }) as { productId?: string }
  const search = useAdminSearch()
  const navigate = useNavigate()

  const existing = productId && productId !== 'new' ? SELLER_PRODUCTS.find((p) => p.id === productId) : undefined
  const step = search.step ?? 'basic'

  // Draft state kept local — swap for a form library + API when the backend lands.
  const [mrp, setMrp] = useState(existing?.mrp ?? 10000)
  const [price, setPrice] = useState(existing?.price ?? 8000)
  const [hasVariants, setHasVariants] = useState((existing?.variants.length ?? 1) > 1)
  const [options, setOptions] = useState<{ name: string; values: string[] }[]>([
    { name: 'Colour', values: ['Black', 'White'] },
  ])
  const [available, setAvailable] = useState(existing?.available ?? 100)
  const [lowStockAt, setLowStockAt] = useState(existing?.lowStockAt ?? 10)
  const [trackInventory, setTrackInventory] = useState(true)
  const [images, setImages] = useState(existing?.images ?? 3)

  const priceInvalid = price > mrp
  const glyph = existing?.glyph ?? 'headphones'
  const tone = existing?.tone ?? 'brand'

  const combinations = useMemo(() => {
    if (!hasVariants) return [{ label: 'Single SKU', sku: 'WH-001', price, stock: available }]
    return options.reduce<string[][]>(
      (acc, opt) => acc.flatMap((combo) => opt.values.map((v) => [...combo, v])),
      [[]]
    ).map((combo, i) => ({
      label: combo.join(' / '),
      sku: `WH-001-${combo.map((c) => c.slice(0, 3).toUpperCase()).join('-')}`,
      price,
      stock: i === 0 ? available : Math.max(0, available - i * 10),
    }))
  }, [hasVariants, options, price, available])

  function go(next: string) {
    navigate(adminLinkProps({ to: `/seller/products/${productId ?? 'new'}`, search: { step: next } }))
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step)
  const nextStep = STEPS[stepIndex + 1]?.key
  const prevStep = STEPS[stepIndex - 1]?.key

  if (step === 'submitted') return <ProductSubmitted productId={productId ?? 'new'} />

  return (
    <>
      <PageHeader
        title={existing ? existing.name : 'Add Product'}
        description={existing ? `${existing.sku} · last updated ${existing.updated}` : 'List a new product on SafalMarketHub.'}
        breadcrumb={[
          { label: 'Dashboard', to: '/seller' },
          { label: 'Products', to: '/seller/products' },
          { label: existing ? existing.id : 'New product', to: `/seller/products/${productId ?? 'new'}` },
        ]}
        actions={existing && <StatusBadge status={existing.status} />}
      />

      {/* Admin feedback appears directly inside the edit screen */}
      {existing?.status === 'Changes Required' && existing.adminComment && (
        <Alert variant="warning" className="mb-5">
          <TriangleAlert />
          <AlertTitle>Changes required by SafalMarketHub</AlertTitle>
          <AlertDescription>{existing.adminComment}</AlertDescription>
        </Alert>
      )}

      <div className="mb-5 rounded-lg border bg-card px-4 py-3 shadow-xs">
        <Stepper steps={STEPS} current={step} onSelect={go} />
      </div>

      {step === 'basic' && (
        <Panel title="Basic details" description="Tell customers what this product is.">
          <FormSection title="Product information">
            <Field label="Product Name" required className="sm:col-span-2">
              <Input placeholder="Wireless Noise Cancelling Headphones" defaultValue={existing?.name} />
            </Field>
            <Field label="Brand" required>
              <Input placeholder="SoundPro" defaultValue={existing?.brand} />
            </Field>
            <Field label="Category" required>
              <SelectField options={PRODUCT_CATEGORIES} value="Electronics" />
            </Field>
            <Field label="Subcategory" required>
              <SelectField options={['Audio', 'Wearables', 'Power', 'Bags']} value="Audio" />
            </Field>
            <Field label="Manufacturer" required>
              <Input placeholder="SoundPro Audio Pvt Ltd" />
            </Field>
            <Field label="Country of Origin" required>
              <SelectField options={['India', 'China', 'Vietnam', 'Other']} value="India" />
            </Field>
            <Field label="Short Description" hint="Shown in product listings. Up to 120 characters." className="sm:col-span-2">
              <Input placeholder="Over-ear headphones with hybrid ANC and 40-hour battery" maxLength={120} />
            </Field>
            <Field label="Full Description" required className="sm:col-span-2">
              <Textarea
                rows={5}
                placeholder="Describe materials, features, what's in the box, warranty and care instructions."
                defaultValue={existing ? 'Over-ear headphones with hybrid active noise cancellation, 40-hour battery life, multipoint Bluetooth 5.3 and a foldable travel case.' : ''}
              />
            </Field>
          </FormSection>
          <WizardActions onNext={() => nextStep && go(nextStep)} />
        </Panel>
      )}

      {step === 'images' && (
        <Panel title="Product images" description="Clear images on a plain background convert best. The first image is the primary.">
          <button
            type="button"
            onClick={() => {
              setImages((n) => Math.min(n + 1, 8))
              toast.success('Image added')
            }}
            className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-10 transition-colors hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/40"
          >
            <ImagePlus className="size-6 text-ink-400" />
            <span className="text-[14px] font-semibold text-ink-900 dark:text-white">Drag and drop product images here</span>
            <span className="text-[12px] text-ink-500">or <span className="font-semibold text-brand-600 dark:text-brand-300">Browse Files</span></span>
            <span className="mt-1 text-[11px] text-ink-400">JPG or PNG · min 1000×1000 px · up to 5 MB each</span>
          </button>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: images }).map((_, i) => (
              <div key={i} className="group relative">
                <ProductThumb glyph={glyph} tone={i % 2 === 0 ? tone : 'ink'} className="aspect-square" />
                {i === 0 ? (
                  <span className="absolute left-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    Primary
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => toast.success('Set as primary image')}
                    className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-ink-700 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                  >
                    Make primary
                  </button>
                )}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="grid size-7 cursor-grab place-items-center rounded-full bg-background/90 text-ink-600 backdrop-blur-sm">
                    <GripVertical className="size-3.5" />
                  </span>
                  <button
                    type="button"
                    aria-label="Remove image"
                    onClick={() => setImages((n) => Math.max(1, n - 1))}
                    className="grid size-7 place-items-center rounded-full bg-background/90 text-destructive backdrop-blur-sm"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <WizardActions onBack={() => prevStep && go(prevStep)} onNext={() => nextStep && go(nextStep)} />
        </Panel>
      )}

      {step === 'variants' && (
        <Panel title="Variants" description="Does this product have variants?">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setHasVariants(false)}
              className={
                'rounded-lg border p-4 text-left transition-colors ' +
                (!hasVariants ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/60' : 'hover:border-ink-400')
              }
            >
              <p className="text-[14px] font-semibold text-ink-900 dark:text-white">No</p>
              <p className="mt-1 text-[12px] text-ink-500">Single SKU product with one price and one stock count.</p>
            </button>
            <button
              type="button"
              onClick={() => setHasVariants(true)}
              className={
                'rounded-lg border p-4 text-left transition-colors ' +
                (hasVariants ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-950/60' : 'hover:border-ink-400')
              }
            >
              <p className="text-[14px] font-semibold text-ink-900 dark:text-white">Yes</p>
              <p className="mt-1 text-[12px] text-ink-500">Add options like colour, size, storage, model or material.</p>
            </button>
          </div>

          {hasVariants && (
            <div className="mt-6 border-t pt-6">
              <div className="grid gap-4">
                {options.map((opt, oi) => (
                  <div key={oi} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="min-w-[160px]">
                        <Label className="mb-[7px]">Option name</Label>
                        <Input
                          value={opt.name}
                          onChange={(e) =>
                            setOptions((prev) => prev.map((o, i) => (i === oi ? { ...o, name: e.target.value } : o)))
                          }
                          placeholder="Colour"
                        />
                      </div>
                      {options.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/8 hover:text-destructive"
                          onClick={() => setOptions((prev) => prev.filter((_, i) => i !== oi))}
                        >
                          <Trash2 className="size-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="mt-3">
                      <Label className="mb-[7px]">Values</Label>
                      <div className="flex flex-wrap gap-2">
                        {opt.values.map((v, vi) => (
                          <span
                            key={vi}
                            className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1 text-[12px] font-medium"
                          >
                            {v}
                            <button
                              type="button"
                              aria-label={`Remove ${v}`}
                              onClick={() =>
                                setOptions((prev) =>
                                  prev.map((o, i) => (i === oi ? { ...o, values: o.values.filter((_, x) => x !== vi) } : o))
                                )
                              }
                            >
                              <X className="size-3 text-ink-400" />
                            </button>
                          </span>
                        ))}
                        <input
                          placeholder="Add value + Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              const value = e.currentTarget.value.trim()
                              setOptions((prev) => prev.map((o, i) => (i === oi ? { ...o, values: [...o.values, value] } : o)))
                              e.currentTarget.value = ''
                            }
                          }}
                          className="h-8 min-w-[140px] rounded-full border border-dashed bg-transparent px-3 text-[12px] outline-none placeholder:text-ink-400 focus:border-brand-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOptions((prev) => [...prev, { name: '', values: [] }])}
                  >
                    <Plus className="size-4" />
                    Add another option
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-[13px] font-semibold">{combinations.length} variant combinations</p>
                <div className="mt-3 overflow-hidden rounded-lg border">
                  <table className="w-full text-left text-[13px]">
                    <thead className="bg-muted/60">
                      <tr className="text-[11px] uppercase tracking-[0.06em] text-ink-500">
                        <th className="px-4 py-2.5 font-bold">Variant</th>
                        <th className="px-4 py-2.5 font-bold">SKU</th>
                        <th className="px-4 py-2.5 font-bold">Barcode</th>
                        <th className="px-4 py-2.5 text-right font-bold">Price</th>
                        <th className="px-4 py-2.5 text-right font-bold">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {combinations.map((c) => (
                        <tr key={c.label} className="border-t">
                          <td className="px-4 py-2.5 font-semibold text-ink-900 dark:text-white">{c.label}</td>
                          <td className="px-4 py-2 tabular">
                            <Input defaultValue={c.sku} className="h-9 text-[12px]" />
                          </td>
                          <td className="px-4 py-2">
                            <Input placeholder="Optional" className="h-9 text-[12px]" />
                          </td>
                          <td className="px-4 py-2">
                            <Input defaultValue={c.price} className="h-9 text-right text-[12px]" />
                          </td>
                          <td className="px-4 py-2">
                            <Input defaultValue={c.stock} className="h-9 text-right text-[12px]" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          <WizardActions onBack={() => prevStep && go(prevStep)} onNext={() => nextStep && go(nextStep)} />
        </Panel>
      )}

      {step === 'pricing' && (
        <Panel title="Set your price" description="Customers see the discount calculated from MRP.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="MRP (₹)" required>
              <Input type="number" value={mrp} onChange={(e) => setMrp(Number(e.target.value))} />
            </Field>
            <Field
              label="Selling Price (₹)"
              required
              error={priceInvalid ? 'Selling Price cannot be greater than MRP.' : undefined}
            >
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                aria-invalid={priceInvalid || undefined}
              />
            </Field>
            <Field label="GST Rate" required>
              <SelectField options={['0%', '5%', '12%', '18%', '28%']} value="18%" />
            </Field>
            <Field label="HSN / SAC" required>
              <Input placeholder="85183000" />
            </Field>
          </div>

          <div className="mt-6 rounded-lg border bg-muted/50 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Customer sees</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="text-[26px] font-bold tabular text-ink-950 dark:text-white">{inr(price)}</span>
              <span className="text-[15px] text-ink-400 line-through tabular">{inr(mrp)}</span>
              {!priceInvalid && mrp > price && (
                <span className="rounded-full bg-gold-50 px-2.5 py-0.5 text-[12px] font-bold text-gold-600 dark:bg-gold-600/15 dark:text-gold-400">
                  {discountPercent(mrp, price)}% OFF
                </span>
              )}
            </div>
            <p className="mt-3 text-[12px] text-ink-500">
              Platform commission at 10% ≈ {inr(Math.round(price * 0.1))} · your expected earning ≈{' '}
              {inr(price - Math.round(price * 0.1))} per unit.
            </p>
          </div>
          <WizardActions onBack={() => prevStep && go(prevStep)} onNext={() => nextStep && go(nextStep)} disabled={priceInvalid} />
        </Panel>
      )}

      {step === 'inventory' && (
        <Panel title="Manage inventory" description="Set stock and the level at which we should warn you.">
          <label className="flex cursor-pointer items-start gap-2.5 rounded-sm border bg-muted/40 px-3.5 py-3">
            <Checkbox checked={trackInventory} onCheckedChange={(c) => setTrackInventory(Boolean(c))} className="mt-0.5" />
            <span className="text-[13px] text-ink-700 dark:text-ink-300">
              Track inventory — the listing goes out of stock automatically at zero
            </span>
          </label>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Available Quantity" required>
              <Input type="number" value={available} onChange={(e) => setAvailable(Number(e.target.value))} disabled={!trackInventory} />
            </Field>
            <Field label="Notify me when stock reaches" hint="Low stock alerts appear on your dashboard.">
              <Input type="number" value={lowStockAt} onChange={(e) => setLowStockAt(Number(e.target.value))} disabled={!trackInventory} />
            </Field>
          </div>

          <div className="mt-5 flex items-center gap-2.5 rounded-sm border px-4 py-3">
            <span className="text-[12px] font-semibold text-ink-600 dark:text-ink-300">Stock indicator</span>
            <StatusBadge status={available === 0 ? 'Out of Stock' : available <= lowStockAt ? 'Pending' : 'Active'} />
            <span className="text-[12px] text-ink-500">
              {available === 0 ? 'Not purchasable' : available <= lowStockAt ? 'Low stock' : 'In stock'}
            </span>
          </div>
          <WizardActions onBack={() => prevStep && go(prevStep)} onNext={() => nextStep && go(nextStep)} />
        </Panel>
      )}

      {step === 'shipping' && (
        <Panel title="Shipping details" description="Used to calculate shipping cost and pick the right courier service.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Product Weight (grams)" required>
              <Input type="number" placeholder="450" />
            </Field>
            <Field label="Package Length (cm)" required>
              <Input type="number" placeholder="24" />
            </Field>
            <Field label="Package Width (cm)" required>
              <Input type="number" placeholder="18" />
            </Field>
            <Field label="Package Height (cm)" required>
              <Input type="number" placeholder="9" />
            </Field>
          </div>
          <p className="mt-4 text-[12px] text-ink-500">
            Orders are collected from your primary pickup address. Update it in Business Profile if it has changed.
          </p>
          <WizardActions onBack={() => prevStep && go(prevStep)} onNext={() => nextStep && go(nextStep)} />
        </Panel>
      )}

      {step === 'review' && (
        <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="grid gap-4">
            <ReviewSection title="Basic details" onEdit={() => go('basic')}>
              <DefinitionList
                items={[
                  { label: 'Product name', value: existing?.name ?? 'Wireless Noise Cancelling Headphones' },
                  { label: 'Brand', value: existing?.brand ?? 'SoundPro' },
                  { label: 'Category', value: existing?.category ?? 'Electronics › Audio' },
                  { label: 'Country of origin', value: 'India' },
                ]}
              />
            </ReviewSection>

            <ReviewSection title={`Images (${images})`} onEdit={() => go('images')}>
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: Math.min(images, 4) }).map((_, i) => (
                  <ProductThumb key={i} glyph={glyph} tone={i % 2 === 0 ? tone : 'ink'} className="aspect-square" />
                ))}
              </div>
            </ReviewSection>

            <ReviewSection title={`Variants (${combinations.length})`} onEdit={() => go('variants')}>
              <ul className="grid gap-2">
                {combinations.map((c) => (
                  <li key={c.label} className="flex items-center justify-between gap-3 rounded-sm border px-3.5 py-2.5 text-[13px]">
                    <span className="font-semibold text-ink-900 dark:text-white">{c.label}</span>
                    <span className="text-ink-500 tabular">
                      {c.sku} · {inr(c.price)} · {c.stock} in stock
                    </span>
                  </li>
                ))}
              </ul>
            </ReviewSection>

            <ReviewSection title="Pricing" onEdit={() => go('pricing')}>
              <DefinitionList
                items={[
                  { label: 'MRP', value: inr(mrp) },
                  { label: 'Selling price', value: inr(price), hint: `${discountPercent(mrp, price)}% off` },
                  { label: 'GST', value: '18%' },
                  { label: 'HSN / SAC', value: '85183000' },
                ]}
              />
            </ReviewSection>

            <ReviewSection title="Inventory" onEdit={() => go('inventory')}>
              <DefinitionList
                items={[
                  { label: 'Available quantity', value: String(available) },
                  { label: 'Low stock alert at', value: String(lowStockAt) },
                  { label: 'Track inventory', value: trackInventory ? 'Yes' : 'No' },
                ]}
              />
            </ReviewSection>

            <ReviewSection title="Shipping" onEdit={() => go('shipping')}>
              <DefinitionList
                items={[
                  { label: 'Weight', value: '450 g' },
                  { label: 'Dimensions', value: '24 × 18 × 9 cm' },
                  { label: 'Pickup address', value: 'Main Warehouse, Andheri East, Mumbai' },
                ]}
              />
            </ReviewSection>
          </div>

          <div className="grid content-start gap-4">
            <Panel title="Submit for approval">
              <p className="text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
                SafalMarketHub reviews every new listing before it becomes available to customers. You'll be notified as soon as
                there's a decision.
              </p>
              <div className="mt-5 grid gap-2">
                <Button onClick={() => go('submitted')}>Submit for Approval</Button>
                <Button variant="outline" onClick={() => toast.success('Product saved successfully.')}>
                  Save as Draft
                </Button>
              </div>
            </Panel>
            <Panel title="Before you submit">
              <ul className="grid gap-2.5">
                {[
                  'Images are sharp and show the actual product',
                  'Description lists specifications and what is in the box',
                  'MRP and selling price are correct',
                  'HSN and GST rate match your invoicing',
                ].map((item) => (
                  <li key={item} className="flex gap-2 text-[13px] text-ink-600 dark:text-ink-300">
                    <Check className="mt-0.5 size-4 shrink-0 text-teal-500" strokeWidth={2.6} />
                    {item}
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}
    </>
  )
}

function WizardActions({ onBack, onNext, disabled }: { onBack?: () => void; onNext?: () => void; disabled?: boolean }) {
  return (
    <FormActions
      primary={
        <Button onClick={onNext} disabled={disabled}>
          Save &amp; Continue
          <ArrowRight className="size-4" />
        </Button>
      }
      secondary={
        <>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
          )}
          <Button variant="ghost" onClick={() => toast.success('Product saved successfully.')}>
            Save Draft
          </Button>
        </>
      }
    />
  )
}

function ReviewSection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <Panel
      title={title}
      actions={
        <Button variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      }
    >
      {children}
    </Panel>
  )
}

function ProductSubmitted({ productId }: { productId: string }) {
  return (
    <div className="mx-auto max-w-[600px]">
      <div className="rounded-lg border bg-card p-6 text-center shadow-xs sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-teal-500 text-white">
          <Check className="size-9" strokeWidth={3} />
        </span>
        <h1 className="mt-6 text-2xl">Product submitted for review</h1>
        <p className="mx-auto mt-3 max-w-[420px] text-[15px] text-ink-600 dark:text-ink-300">
          Our team will review your product before it becomes available on SafalMarketHub.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <Button variant="outline" asChild>
            <AdminLink to={`/seller/products/${productId}`}>View Product</AdminLink>
          </Button>
          <Button asChild>
            <AdminLink to="/seller/products/new">Add Another</AdminLink>
          </Button>
          <Button variant="outline" asChild>
            <AdminLink to="/seller">Go to Dashboard</AdminLink>
          </Button>
        </div>
      </div>
    </div>
  )
}
