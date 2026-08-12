import { Heart, ShoppingCart, Star } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { Button } from '@/components/ui/button'
import type { ShopProduct } from '@/data/shop'
import { useCartStore } from '@/store/cart-store'
import { cn, discountPercent, money } from '@/lib/utils'

/* ----------------------------------------------------------------- price --- */
export function Price({
  price,
  mrp,
  size = 'md',
  className,
}: {
  price: number
  mrp: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const off = discountPercent(mrp, price)
  const sizes = {
    sm: { now: 'text-[15px]', was: 'text-[12px]', off: 'text-[11px]' },
    md: { now: 'text-lg', was: 'text-sm', off: 'text-[11px]' },
    lg: { now: 'text-[28px]', was: 'text-[15px]', off: 'text-[13px]' },
  }[size]

  return (
    <span className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-1', className)}>
      <span className={cn('font-bold tabular text-ink-950 dark:text-white', sizes.now)}>{money(price)}</span>
      {mrp > price && (
        <>
          <span className={cn('text-ink-400 line-through tabular', sizes.was)}>{money(mrp)}</span>
          <span
            className={cn(
              'rounded-full bg-gold-50 px-2 py-0.5 font-bold text-gold-600 dark:bg-gold-600/15 dark:text-gold-400',
              sizes.off
            )}
          >
            {off}% OFF
          </span>
        </>
      )}
    </span>
  )
}

/* ---------------------------------------------------------------- rating --- */
export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="flex gap-px text-gold-400">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="size-3.5" strokeWidth={1.6} fill={i < Math.round(value) ? 'currentColor' : 'none'} />
        ))}
      </span>
      <span className="text-xs font-semibold text-ink-600 tabular dark:text-ink-300">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-ink-400">({count})</span>}
    </span>
  )
}

/* ----------------------------------------------------------------- stock --- */
export function StockPill({ stock, className }: { stock: number; className?: string }) {
  const tone =
    stock === 0
      ? 'border-destructive/25 bg-destructive/8 text-destructive'
      : stock <= 5
        ? 'border-gold-100 bg-gold-50 text-gold-600 dark:border-gold-600/40 dark:bg-gold-600/15 dark:text-gold-400'
        : 'border-teal-100 bg-teal-50 text-teal-600 dark:border-teal-600/40 dark:bg-teal-600/15 dark:text-teal-100'
  const label = stock === 0 ? 'Out of Stock' : stock <= 5 ? `Only ${stock} left` : 'In Stock'
  return (
    <span
      className={cn('inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold', tone, className)}
    >
      <span className="size-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  )
}

/* ---------------------------------------------------------- product card --- */
export function ShopProductCard({ product, className }: { product: ShopProduct; className?: string }) {
  const add = useCartStore((s) => s.add)
  const wishlist = useCartStore((s) => s.wishlist)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)
  const saved = wishlist.includes(product.id)
  const needsChoice = product.options.some((o) => o.values.filter((v) => v.available).length > 1)

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-card p-2.5 shadow-xs transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-md sm:p-3',
        className
      )}
    >
      <div className="relative">
        <AdminLink to={`/product/${product.id}`} aria-label={product.name}>
          <ProductThumb glyph={product.glyph} tone={product.tone} />
        </AdminLink>
        {product.badge && (
          <span className="absolute left-2.5 top-2.5 rounded-full border border-brand-100 bg-background/90 px-2 py-0.5 text-[10px] font-bold text-brand-700 backdrop-blur-sm dark:border-brand-800 dark:text-brand-200">
            {product.badge}
          </span>
        )}
        <button
          type="button"
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={saved}
          onClick={() => {
            toggleWishlist(product.id)
            toast.success(saved ? 'Removed from wishlist' : 'Saved to wishlist', { description: product.name })
          }}
          className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-background/90 text-ink-500 shadow-xs backdrop-blur-sm transition-colors hover:text-brand-600"
        >
          <Heart className={cn('size-[17px]', saved && 'fill-brand-600 text-brand-600')} />
        </button>
        {product.stock === 0 && (
          <span className="absolute inset-x-2.5 bottom-2.5 rounded-sm bg-ink-950/80 py-1 text-center text-[11px] font-bold text-white backdrop-blur-sm">
            Out of Stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">{product.brand}</p>
        <h3 className="mt-1">
          <AdminLink
            to={`/product/${product.id}`}
            className="line-clamp-2 text-[15px] font-semibold leading-snug text-ink-900 hover:text-brand-700 dark:text-white dark:hover:text-brand-300"
          >
            {product.name}
          </AdminLink>
        </h3>
        <p className="mt-1 text-xs text-ink-500">
          Sold by <span className="font-semibold text-ink-700 dark:text-ink-300">{product.seller}</span>
        </p>

        <Rating value={product.rating} count={product.reviews} className="mt-2" />
        <Price price={product.price} mrp={product.mrp} className="mt-3" />
        <StockPill stock={product.stock} className="mt-2.5" />

        {product.stock === 0 ? (
          <Button variant="outline" size="sm" className="mt-4 w-full" disabled>
            Out of Stock
          </Button>
        ) : needsChoice ? (
          <Button variant="outline" size="sm" className="mt-4 w-full group-hover:border-brand-600 group-hover:text-brand-700" asChild>
            <AdminLink to={`/product/${product.id}`}>View Product</AdminLink>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full group-hover:border-brand-600 group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:bg-brand-950"
            onClick={() => {
              const variant = product.options.map((o) => o.values.find((v) => v.available)?.label ?? '').filter(Boolean).join(' · ')
              add(product.id, variant || 'Default')
              toast.success('Added to cart successfully.', { description: product.name })
            }}
          >
            <ShoppingCart className="size-4" />
            Add to Cart
          </Button>
        )}
      </div>
    </article>
  )
}

/* ---------------------------------------------------------- breadcrumbs ---- */
export function Breadcrumbs({ trail }: { trail: { label: string; to?: string; search?: Record<string, string | undefined> }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-500">
      {trail.map((crumb, i) => (
        <span key={crumb.label} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden className="text-ink-300">/</span>}
          {crumb.to ? (
            <AdminLink to={crumb.to} search={crumb.search} className="font-medium hover:text-ink-900 dark:hover:text-white">
              {crumb.label}
            </AdminLink>
          ) : (
            <span className="font-semibold text-ink-800 dark:text-ink-100">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

/* --------------------------------------------------------- price summary --- */
export function PriceDetails({
  subtotal,
  discount,
  shipping,
  tax,
  total,
  className,
}: {
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  className?: string
}) {
  return (
    <dl className={cn('divide-y', className)}>
      <Row label={`Subtotal`} value={money(subtotal + discount)} />
      {discount > 0 && <Row label="Discount" value={`− ${money(discount)}`} tone="save" />}
      <Row label="Shipping" value={shipping === 0 ? 'Free' : money(shipping)} />
      <Row label="Taxes" value={money(tax)} hint="included" />
      <div className="flex items-baseline justify-between gap-4 pt-3.5">
        <dt className="text-[15px] font-semibold text-ink-900 dark:text-white">Total</dt>
        <dd className="text-xl font-bold tabular text-ink-950 dark:text-white">{money(total)}</dd>
      </div>
    </dl>
  )
}

function Row({ label, value, tone, hint }: { label: string; value: string; tone?: 'save'; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-[13px] text-ink-600 dark:text-ink-300">
        {label}
        {hint && <span className="ml-1.5 text-[11px] text-ink-400">{hint}</span>}
      </dt>
      <dd className={cn('text-[13px] font-semibold tabular', tone === 'save' ? 'text-teal-600 dark:text-teal-100' : 'text-ink-900 dark:text-white')}>
        {value}
      </dd>
    </div>
  )
}

/* -------------------------------------------------------- quantity input --- */
export function QuantityStepper({
  value,
  max,
  onChange,
  className,
}: {
  value: number
  max: number
  onChange: (next: number) => void
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center rounded-sm border', className)}>
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className="grid size-9 place-items-center text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-40 dark:hover:bg-secondary"
      >
        −
      </button>
      <span className="min-w-9 text-center text-[13px] font-semibold tabular">{value}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid size-9 place-items-center text-ink-600 transition-colors hover:bg-ink-100 disabled:opacity-40 dark:hover:bg-secondary"
      >
        +
      </button>
    </div>
  )
}

/* ------------------------------------------------------------ order card --- */
export function SellerLine({ seller, className }: { seller: string; className?: string }) {
  return (
    <p className={cn('flex items-center gap-2 text-[12px] font-semibold text-ink-700 dark:text-ink-200', className)}>
      <span className="grid size-6 place-items-center rounded-full bg-muted text-[10px] font-bold text-ink-600 dark:text-ink-300">
        {seller.slice(0, 2).toUpperCase()}
      </span>
      Sold by {seller}
    </p>
  )
}
