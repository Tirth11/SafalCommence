import { useMemo, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import {
  BadgeCheck,
  Heart,
  Images,
  MapPin,
  PackageSearch,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Store,
  Truck,
} from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps } from '@/components/admin/admin-link'
import { EmptyState } from '@/components/admin/primitives'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { Breadcrumbs, Price, QuantityStepper, Rating, ShopProductCard, StockPill } from '@/components/shop/shop-bits'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getProduct, SERVICEABLE_PINS, SHOP_PRODUCTS } from '@/data/shop'
import { useCartStore } from '@/store/cart-store'
import { cn, inr } from '@/lib/utils'

export function ProductDetailPage() {
  const { productId } = useParams({ strict: false }) as { productId?: string }
  const navigate = useNavigate()
  const add = useCartStore((s) => s.add)
  const buyNow = useCartStore((s) => s.buyNow)
  const wishlist = useCartStore((s) => s.wishlist)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)

  const product = productId ? getProduct(productId) : undefined

  const [selected, setSelected] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState(false)
  const [qty, setQty] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const [pin, setPin] = useState('')
  const [pinResult, setPinResult] = useState<{ ok: boolean; pin: string } | null>(null)

  const related = useMemo(
    () => SHOP_PRODUCTS.filter((p) => p.id !== product?.id && p.category === product?.category).slice(0, 4),
    [product]
  )

  if (!product) {
    return (
      <div className="rounded-lg border bg-card shadow-xs">
        <EmptyState
          icon={PackageSearch}
          title="This product is currently unavailable"
          body="The listing may have been removed by the seller, or the link is out of date."
          action={
            <Button variant="outline" size="sm" asChild>
              <AdminLink to="/shop/all">Browse products</AdminLink>
            </Button>
          }
        />
      </div>
    )
  }

  const saved = wishlist.includes(product.id)
  const outOfStock = product.stock === 0

  /** Every option with more than one choice must be chosen before adding to cart. */
  const missingOption = product.options.find((o) => !selected[o.name])
  const variantLabel = product.options.map((o) => selected[o.name]).filter(Boolean).join(' · ')

  const guard = () => {
    setTouched(true)
    if (missingOption) {
      toast.error(`Please select a ${missingOption.name.toLowerCase()} before continuing.`)
      return false
    }
    return true
  }

  const onAddToCart = () => {
    if (!guard()) return
    add(product.id, variantLabel, qty)
    toast.success('Product added to your cart.', {
      description: `${product.name} · ${variantLabel}`,
      action: { label: 'View Cart', onClick: () => navigate(adminLinkProps({ to: '/cart' })) },
    })
  }

  const onBuyNow = () => {
    if (!guard()) return
    buyNow(product.id, variantLabel)
    navigate(adminLinkProps({ to: '/checkout' }))
  }

  const checkPin = () => {
    const ok = SERVICEABLE_PINS.includes(pin.trim())
    setPinResult({ ok, pin: pin.trim() })
  }

  return (
    <>
      <Breadcrumbs
        trail={[
          { label: 'Home', to: '/shop' },
          ...product.categoryPath.map((part, i) => ({
            label: part,
            to: '/shop/all',
            search: i === 0 ? { category: part } : { category: product.categoryPath[0], sub: part },
          })),
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="relative">
            <ProductThumb glyph={product.glyph} tone={activeImage % 2 === 0 ? product.tone : 'ink'} className="aspect-square rounded-lg" />
            {product.badge && (
              <span className="absolute left-3 top-3 rounded-full border border-brand-100 bg-background/90 px-2.5 py-1 text-[11px] font-bold text-brand-700 backdrop-blur-sm dark:border-brand-800 dark:text-brand-200">
                {product.badge}
              </span>
            )}
            <button
              type="button"
              aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-pressed={saved}
              onClick={() => {
                toggleWishlist(product.id)
                toast.success(saved ? 'Removed from wishlist' : 'Saved to wishlist')
              }}
              className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-background/90 text-ink-500 shadow-sm backdrop-blur-sm transition-colors hover:text-brand-600"
            >
              <Heart className={cn('size-5', saved && 'fill-brand-600 text-brand-600')} />
            </button>
          </div>

          <ul className="mt-3 flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {Array.from({ length: product.images }).map((_, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={activeImage === i}
                  className={cn(
                    'block size-[68px] shrink-0 overflow-hidden rounded-sm border-2 transition-colors',
                    activeImage === i ? 'border-brand-600' : 'border-transparent hover:border-ink-300'
                  )}
                >
                  <ProductThumb glyph={product.glyph} tone={i % 2 === 0 ? product.tone : 'ink'} className="aspect-square rounded-none" />
                </button>
              </li>
            ))}
            <li className="grid size-[68px] shrink-0 place-items-center rounded-sm border bg-muted text-ink-400">
              <Images className="size-4" />
            </li>
          </ul>
        </div>

        {/* Buy box */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">{product.brand}</p>
          <h1 className="mt-1.5 text-xl sm:text-[26px]">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Rating value={product.rating} count={product.reviews} />
            <span aria-hidden className="text-ink-300">·</span>
            <AdminLink
              to="/shop/all"
              search={{ q: product.seller }}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 dark:text-brand-300"
            >
              <Store className="size-3.5" />
              {product.seller}
            </AdminLink>
          </div>

          <div className="mt-5 border-y py-5">
            <Price price={product.price} mrp={product.mrp} size="lg" />
            <p className="mt-1.5 text-[12px] text-ink-500">{product.taxNote}</p>
            <StockPill stock={product.stock} className="mt-3" />
          </div>

          {/* Variants */}
          {product.options.map((option) => {
            const missing = touched && !selected[option.name]
            return (
              <div key={option.name} className="mt-5">
                <p className="mb-2 flex items-baseline gap-2 text-[13px] font-semibold text-ink-800 dark:text-ink-100">
                  {option.name}
                  {selected[option.name] && <span className="text-[12px] font-normal text-ink-500">{selected[option.name]}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const isSelected = selected[option.name] === value.label
                    return (
                      <button
                        key={value.label}
                        type="button"
                        disabled={!value.available}
                        aria-pressed={isSelected}
                        onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value.label }))}
                        className={cn(
                          'min-w-[52px] rounded-sm border px-3.5 py-2 text-[13px] font-semibold transition-colors',
                          isSelected
                            ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                            : 'border-input text-ink-700 hover:border-ink-400 dark:text-ink-200',
                          !value.available && 'cursor-not-allowed border-dashed text-ink-300 line-through hover:border-input'
                        )}
                      >
                        {value.label}
                      </button>
                    )
                  })}
                </div>
                {missing && (
                  <p className="mt-2 text-[12px] font-medium text-destructive">
                    Please select a {option.name.toLowerCase()} before continuing.
                  </p>
                )}
              </div>
            )
          })}

          {/* Delivery check */}
          <div className="mt-6 rounded-lg border bg-muted/40 p-4">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-800 dark:text-ink-100">
              <MapPin className="size-4 text-ink-400" />
              Check delivery availability
            </p>
            <form
              className="mt-3 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault()
                checkPin()
              }}
            >
              <Input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                placeholder="Enter PIN code"
                aria-label="Delivery PIN code"
                className="h-11 max-w-[180px]"
              />
              <Button type="submit" variant="outline" disabled={pin.length !== 6}>
                Check
              </Button>
            </form>

            {pinResult && (
              <div className="mt-3">
                {pinResult.ok ? (
                  <div className="rounded-sm border border-teal-100 bg-teal-50 px-3.5 py-2.5 dark:border-teal-600/40 dark:bg-teal-600/10">
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-teal-600 dark:text-teal-100">
                      <BadgeCheck className="size-4" />
                      Delivery available to {pinResult.pin}
                    </p>
                    <p className="mt-1 text-[12px] text-teal-600/90 dark:text-teal-100/80">
                      Estimated delivery: <span className="font-semibold">{product.deliveryDays}</span>
                    </p>
                  </div>
                ) : (
                  <p className="rounded-sm border border-gold-100 bg-gold-50 px-3.5 py-2.5 text-[13px] font-medium text-gold-600 dark:border-gold-600/40 dark:bg-gold-600/10 dark:text-gold-400">
                    Delivery is currently unavailable for this PIN code. You can still browse and save this product.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quantity + actions */}
          {!outOfStock && (
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink-800 dark:text-ink-100">Quantity</p>
                <QuantityStepper value={qty} max={Math.min(product.stock, 10)} onChange={setQty} />
              </div>
            </div>
          )}

          <div className="mt-6 hidden gap-3 sm:flex">
            <Button size="lg" variant="outline" className="flex-1" disabled={outOfStock} onClick={onAddToCart}>
              <ShoppingCart className="size-4" />
              Add to Cart
            </Button>
            <Button size="lg" className="flex-1" disabled={outOfStock} onClick={onBuyNow}>
              Buy Now
            </Button>
          </div>

          {outOfStock && (
            <Alert variant="warning" className="mt-6">
              <PackageSearch />
              <AlertTitle>Out of stock</AlertTitle>
              <AlertDescription>
                This product is currently unavailable from {product.seller}. Save it to your wishlist or explore similar
                products below.
              </AlertDescription>
            </Alert>
          )}

          <ul className="mt-6 grid gap-2.5 border-t pt-5">
            {[
              { icon: Truck, text: `Delivery in ${product.deliveryDays} to serviceable PIN codes` },
              {
                icon: RotateCcw,
                text: product.returnWindowDays > 0 ? `${product.returnWindowDays}-day return window after delivery` : 'This product is not eligible for return',
              },
              { icon: ShieldCheck, text: 'Secure payment via UPI, card or net banking' },
            ].map((item) => (
              <li key={item.text} className="flex gap-2.5 text-[13px] text-ink-600 dark:text-ink-300">
                <item.icon className="mt-0.5 size-4 shrink-0 text-ink-400" />
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Detail tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="returns">Return policy</TabsTrigger>
          <TabsTrigger value="seller">Seller</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="pt-6">
          <div className="max-w-[720px]">
            <p className="text-[15px] leading-relaxed text-ink-700 dark:text-ink-200">{product.description}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-[13px] text-ink-600 dark:text-ink-300">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0 text-teal-500" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="pt-6">
          <dl className="max-w-[640px] divide-y rounded-lg border bg-card">
            {product.specs.map((spec) => (
              <div key={spec.label} className="flex flex-wrap gap-x-6 gap-y-1 px-5 py-3">
                <dt className="w-[180px] shrink-0 text-[13px] font-semibold text-ink-500">{spec.label}</dt>
                <dd className="text-[13px] text-ink-800 dark:text-ink-100">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>

        <TabsContent value="shipping" className="pt-6">
          <div className="max-w-[640px] text-[14px] leading-relaxed text-ink-700 dark:text-ink-200">
            <p>
              Dispatched by {product.seller} from their registered pickup location. Standard delivery arrives in 3–5
              business days; express delivery in 1–2 business days where available.
            </p>
            <p className="mt-3">
              Delivery charges are calculated at checkout based on your PIN code. Orders above {inr(999)} qualify for free
              standard delivery.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="returns" className="pt-6">
          <div className="max-w-[640px] text-[14px] leading-relaxed text-ink-700 dark:text-ink-200">
            {product.returnWindowDays > 0 ? (
              <>
                <p>
                  This product can be returned within <strong>{product.returnWindowDays} days</strong> of delivery if it is
                  damaged, defective, not as described, or the wrong item was sent.
                </p>
                <p className="mt-3">
                  Start a return from <AdminLink to="/account/orders" className="font-semibold text-brand-600 dark:text-brand-300">My Orders</AdminLink>.
                  Once the product passes quality check, the refund is issued to your original payment method.
                </p>
              </>
            ) : (
              <p>
                For hygiene reasons this product cannot be returned once delivered. If it arrives damaged, contact support
                within 48 hours and we will resolve it.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="seller" className="pt-6">
          <div className="max-w-[520px] rounded-lg border bg-card p-5">
            <div className="flex items-center gap-3.5">
              <span className="grid size-12 place-items-center rounded-md bg-brand-50 text-[15px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-200">
                {product.seller.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="text-[15px] font-semibold text-ink-900 dark:text-white">{product.seller}</p>
                <p className="text-[12px] text-ink-500">Seller since {product.sellerSince}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4">
              <Rating value={product.sellerRating} />
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-teal-600 dark:text-teal-100">
                <BadgeCheck className="size-4" />
                Verified seller
              </span>
            </div>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <AdminLink to="/shop/all" search={{ q: product.seller }}>
                View seller's products
              </AdminLink>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="pt-6">
          <div className="max-w-[640px]">
            <div className="flex flex-wrap items-center gap-6 rounded-lg border bg-card p-5">
              <div>
                <p className="text-[38px] font-bold leading-none tabular text-ink-950 dark:text-white">
                  {product.rating.toFixed(1)}
                </p>
                <Rating value={product.rating} className="mt-2" />
                <p className="mt-1 text-[12px] text-ink-500">{product.reviews} verified ratings</p>
              </div>
              <div className="min-w-[180px] flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const pct = star === Math.round(product.rating) ? 62 : star === 5 ? 24 : star === 1 ? 3 : 11
                  return (
                    <div key={star} className="flex items-center gap-2.5">
                      <span className="w-3 text-[11px] tabular text-ink-500">{star}</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-200 dark:bg-secondary">
                        <span className="block h-full rounded-full bg-gold-400" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-8 text-right text-[11px] tabular text-ink-400">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <p className="mt-4 text-[13px] text-ink-500">
              Only customers who bought and received this product can leave a review. Rate it from your delivered order.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl sm:text-2xl">Similar products</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky mobile buy bar — no scrolling back to the top to purchase */}
      {!outOfStock && (
        <div className="fixed inset-x-0 bottom-[57px] z-40 flex items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur-xl sm:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] text-ink-500">{variantLabel || 'Select options'}</p>
            <p className="text-[15px] font-bold tabular text-ink-950 dark:text-white">{inr(product.price * qty)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={onAddToCart}>
            <ShoppingCart className="size-4" />
            Cart
          </Button>
          <Button size="sm" onClick={onBuyNow}>
            Buy Now
          </Button>
        </div>
      )}
    </>
  )
}
