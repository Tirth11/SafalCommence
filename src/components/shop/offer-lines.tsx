import { Sparkles, Tag } from 'lucide-react'

import { evaluate, type Placement } from '@/data/offer-engine'
import type { ShopProduct } from '@/data/shop'
import { cn, money } from '@/lib/utils'

/**
 * The offers that apply to one product, exactly as the engine calculates
 * them. Nothing is composed locally — if a line shows here it survived
 * eligibility, placement and combination checks, which is why the same
 * numbers appear in the cart and in the assistant.
 */
export function OfferLines({
  product,
  placement = 'product-page',
  className,
}: {
  product: ShopProduct
  placement?: Placement
  className?: string
}) {
  const result = evaluate({ product, subtotal: product.price, placement })
  const nearMiss = result.nearMisses.find((m) => m.reason.startsWith('Spend'))

  if (!result.applied.length && !nearMiss) return null

  return (
    <div className={cn('mt-4 grid gap-2', className)}>
      {result.applied.map(({ offer, label, amount, freeDelivery }) => (
        <p
          key={offer.id}
          className="flex items-start gap-2 rounded-md bg-teal-50 px-3 py-2 text-[12.5px] font-medium text-teal-800 dark:bg-teal-600/15 dark:text-teal-100"
        >
          <Tag className="mt-0.5 size-3.5 shrink-0" />
          <span>
            {label}
            {!freeDelivery && amount > 0 && ` — saves ${money(amount)}`}
          </span>
        </p>
      ))}

      {result.discount > 0 && (
        <p className="text-[13px] font-semibold text-ink-900 dark:text-white">
          Your price today: <span className="tabular">{money(result.finalSubtotal)}</span>
        </p>
      )}

      {/* One near-miss, and only the actionable kind. */}
      {nearMiss && (
        <p className="flex items-start gap-2 text-[12px] text-ink-500">
          <Sparkles className="mt-0.5 size-3 shrink-0" />
          {nearMiss.offer.displayName}: {nearMiss.reason.toLowerCase()}.
        </p>
      )}
    </div>
  )
}
