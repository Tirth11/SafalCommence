import { ArrowRight, Heart, RotateCcw } from 'lucide-react'

import { AdminLink } from '@/components/admin/admin-link'
import { ProductScene } from '@/components/marketing/scene'
import { SHOP_PRODUCTS } from '@/data/shop'
import { useAccountStore } from '@/store/account-store'
import { useCartStore } from '@/store/cart-store'
import { money } from '@/lib/utils'

/**
 * Returning shoppers get a short strip of continuity — where they left off,
 * what they saved. Signed-out visitors never see it, so the page opens on
 * discovery instead of an empty account panel.
 */
export function PickUpWhereYouLeftOff() {
  const user = useAccountStore((s) => s.user)
  const { items, wishlist } = useCartStore()

  if (!user) return null

  // Stands in for a viewing-history service.
  const recentlyViewed = SHOP_PRODUCTS.slice(2, 6)
  const saved = SHOP_PRODUCTS.filter((p) => wishlist.includes(p.id)).slice(0, 4)

  return (
    <section className="container-wide py-10">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border bg-card p-5 shadow-xs">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-[19px] tracking-[-0.02em]">Pick up where you left off</h2>
            <AdminLink
              to="/shop/all"
              className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 dark:text-brand-300"
            >
              Keep browsing
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </AdminLink>
          </div>

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recentlyViewed.map((product) => (
              <li key={product.id}>
                <AdminLink to={`/product/${product.id}`} className="group block">
                  <ProductScene glyph={product.glyph} tone={product.tone} className="aspect-square rounded-xl" grain={false} />
                  <p className="mt-2 line-clamp-1 text-[12px] font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                    {product.name}
                  </p>
                  <p className="text-[12px] font-bold tabular text-ink-600 dark:text-ink-300">{money(product.price)}</p>
                </AdminLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid content-start gap-4">
          <QuickCard
            icon={Heart}
            label="Your wishlist"
            value={saved.length ? `${saved.length} saved` : 'Nothing saved yet'}
            to="/account/wishlist"
          />
          <QuickCard
            icon={RotateCcw}
            label="Your cart"
            value={items.length ? `${items.length} ${items.length === 1 ? 'item' : 'items'} waiting` : 'Your cart is empty'}
            to="/cart"
          />
        </div>
      </div>
    </section>
  )
}

function QuickCard({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Heart
  label: string
  value: string
  to: string
}) {
  return (
    <AdminLink
      to={to}
      className="flex items-center gap-3.5 rounded-2xl border bg-card p-4 shadow-xs transition-[border-color,transform] hover:-translate-y-0.5 hover:border-brand-200"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-ink-600 dark:text-ink-300">
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-ink-900 dark:text-white">{label}</span>
        <span className="block text-[12px] text-ink-500">{value}</span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-ink-300" />
    </AdminLink>
  )
}
