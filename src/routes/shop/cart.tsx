import { useNavigate } from '@tanstack/react-router'
import { Heart, Info, ShoppingCart, Trash2, Truck } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps } from '@/components/admin/admin-link'
import { EmptyState } from '@/components/admin/primitives'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { Breadcrumbs, PriceDetails, QuantityStepper, SellerLine } from '@/components/shop/shop-bits'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { groupBySeller, totals, useCartStore } from '@/store/cart-store'
import { inr } from '@/lib/utils'

export function CartPage() {
  const items = useCartStore((s) => s.items)
  const setQty = useCartStore((s) => s.setQty)
  const remove = useCartStore((s) => s.remove)
  const clearBuyNow = useCartStore((s) => s.clearBuyNow)
  const toggleWishlist = useCartStore((s) => s.toggleWishlist)
  const shippingId = useCartStore((s) => s.shippingId)
  const navigate = useNavigate()

  const groups = groupBySeller(items)
  const sums = totals(items, shippingId)

  if (items.length === 0) {
    return (
      <>
        <Breadcrumbs trail={[{ label: 'Home', to: '/shop' }, { label: 'Cart' }]} />
        <div className="rounded-lg border bg-card shadow-xs">
          <EmptyState
            icon={ShoppingCart}
            title="Your cart is empty"
            body="Looks like you haven't added anything yet."
            action={
              <Button asChild>
                <AdminLink to="/shop/all">Start Shopping</AdminLink>
              </Button>
            }
          />
        </div>
      </>
    )
  }

  return (
    <>
      <Breadcrumbs trail={[{ label: 'Home', to: '/shop' }, { label: 'Cart' }]} />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-xl sm:text-[28px]">Your Cart</h1>
        <p className="text-[13px] text-ink-500">
          {items.length} {items.length === 1 ? 'item' : 'items'} from {groups.length}{' '}
          {groups.length === 1 ? 'seller' : 'sellers'}
        </p>
      </div>

      {groups.length > 1 && (
        <Alert variant="info" className="mt-4">
          <Truck />
          <AlertDescription>
            Your items come from {groups.length} sellers, so they may arrive in separate deliveries. You still pay once, at
            one checkout.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Lines grouped by seller */}
        <div className="grid gap-4">
          {groups.map((group) => (
            <section key={group.seller} className="overflow-hidden rounded-lg border bg-card shadow-xs">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
                <SellerLine seller={group.seller} />
                <span className="text-[11px] text-ink-500">Ships together</span>
              </header>

              <ul className="divide-y">
                {group.lines.map((line) => (
                  <li key={line.key} className="flex gap-4 p-4">
                    <AdminLink to={`/product/${line.productId}`} className="shrink-0">
                      <ProductThumb glyph={line.glyph} tone={line.tone} className="aspect-square size-[84px] rounded-sm sm:size-[104px]" />
                    </AdminLink>

                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">{line.brand}</p>
                      <h2 className="mt-0.5">
                        <AdminLink
                          to={`/product/${line.productId}`}
                          className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink-900 hover:text-brand-700 dark:text-white"
                        >
                          {line.name}
                        </AdminLink>
                      </h2>
                      {line.variant && <p className="mt-1 text-[12px] text-ink-500">{line.variant}</p>}
                      <p className="mt-1.5 text-[12px] font-medium text-teal-600 dark:text-teal-100">
                        {line.stock > 5 ? 'In stock' : `Only ${line.stock} left`}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <QuantityStepper value={line.qty} max={Math.min(line.stock, 10)} onChange={(next) => setQty(line.key, next)} />
                        <button
                          type="button"
                          onClick={() => {
                            remove(line.key)
                            clearBuyNow()
                            toast.success('Removed from cart', { description: line.name })
                          }}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-500 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toggleWishlist(line.productId)
                            remove(line.key)
                            toast.success('Saved for later', { description: line.name })
                          }}
                          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-500 hover:text-brand-600"
                        >
                          <Heart className="size-3.5" />
                          Save for later
                        </button>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[15px] font-bold tabular text-ink-950 dark:text-white">{inr(line.price * line.qty)}</p>
                      {line.mrp > line.price && (
                        <p className="text-[12px] text-ink-400 line-through tabular">{inr(line.mrp * line.qty)}</p>
                      )}
                      <p className="mt-1 text-[11px] text-ink-500 tabular">{inr(line.price)} each</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <Button variant="ghost" size="sm" className="justify-self-start" asChild>
            <AdminLink to="/shop/all">Continue shopping</AdminLink>
          </Button>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border bg-card p-5 shadow-xs">
            <h2 className="text-[15px] font-semibold">Price details</h2>
            <PriceDetails className="mt-4" {...sums} />

            {sums.discount > 0 && (
              <p className="mt-3 rounded-sm bg-teal-50 px-3 py-2 text-[12px] font-semibold text-teal-600 dark:bg-teal-600/10 dark:text-teal-100">
                You save {inr(sums.discount)} on this order.
              </p>
            )}

            <Button
              size="lg"
              className="mt-5 w-full"
              onClick={() => {
                clearBuyNow()
                navigate(adminLinkProps({ to: '/checkout' }))
              }}
            >
              Proceed to Checkout
            </Button>

            <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Delivery availability is confirmed against your address at checkout.
            </p>
          </div>
        </aside>
      </div>

      {/* Sticky mobile checkout bar */}
      <div className="fixed inset-x-0 bottom-[57px] z-40 flex items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur-xl sm:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-ink-500">Total</p>
          <p className="text-[17px] font-bold tabular text-ink-950 dark:text-white">{inr(sums.total)}</p>
        </div>
        <Button
          onClick={() => {
            clearBuyNow()
            navigate(adminLinkProps({ to: '/checkout' }))
          }}
        >
          Checkout
        </Button>
      </div>
    </>
  )
}
