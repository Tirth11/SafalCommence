import { Heart, ShoppingCart, Star } from 'lucide-react'
import { toast } from 'sonner'

import { ProductThumb } from '@/components/commerce/product-thumb'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Product } from '@/data/catalog'
import { cn, discountPercent, inr } from '@/lib/utils'

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const off = discountPercent(product.mrp, product.price)

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-card p-2.5 shadow-xs transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-ink-200 hover:shadow-md sm:p-3',
        className
      )}
    >
      <div className="relative">
        <ProductThumb glyph={product.glyph} tone={product.tone} />
        {product.badge && (
          <Badge variant="brand" className="absolute left-2.5 top-2.5 bg-background/90 backdrop-blur-sm">
            {product.badge}
          </Badge>
        )}
        <button
          type="button"
          aria-label={`Save ${product.name} for later`}
          className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-background/90 text-ink-500 shadow-xs backdrop-blur-sm transition-colors hover:text-brand-600"
        >
          <Heart className="size-[17px]" />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">{product.brand}</p>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-ink-900 dark:text-white">
          {product.name}
        </h3>
        <p className="mt-1 text-xs text-ink-500">
          Sold by <span className="font-semibold text-ink-700 dark:text-ink-300">{product.seller}</span>
        </p>

        <div className="mt-2 flex items-center gap-1.5">
          <span className="flex gap-px text-gold-400">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className="size-3.5"
                strokeWidth={1.6}
                fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
              />
            ))}
          </span>
          <span className="text-xs font-semibold text-ink-600 tabular dark:text-ink-300">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-ink-400">({product.reviews})</span>
        </div>

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-lg font-bold text-ink-950 tabular dark:text-white">{inr(product.price)}</span>
          <span className="text-sm text-ink-400 line-through tabular">{inr(product.mrp)}</span>
          <Badge variant="discount">{off}% OFF</Badge>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full group-hover:border-brand-600 group-hover:bg-brand-50 group-hover:text-brand-700 dark:group-hover:bg-brand-950"
          onClick={() => toast.success('Added to cart', { description: product.name })}
        >
          <ShoppingCart className="size-4" />
          Add to Cart
        </Button>
      </div>
    </article>
  )
}
