import { ArrowRight, Camera, Heart, Package, RotateCcw, ShieldCheck, Sparkles, Star, Store } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { CategoryTile, ProductScene } from '@/components/marketing/scene'
import { useAssistant } from '@/components/shop/assistant'
import { Button } from '@/components/ui/button'
import { BUDGET_BANDS, factsFor, SHOPPING_NEEDS } from '@/data/discovery'
import { SHOP_CATEGORIES, SHOP_PRODUCTS, type ShopProduct } from '@/data/shop'
import { useAccountStore, useStartSellingTarget } from '@/store/account-store'
import { useCartStore } from '@/store/cart-store'
import { cn, discountPercent, money } from '@/lib/utils'

/* ==========================================================================
   The browsing half of the landing page.

   Every heading is something a shopper would actually say out loud — "shop by
   category", "what are you shopping for", "great finds under $50" — and every
   section ends in products rather than explanation.
   ========================================================================== */

/* ------------------------------------------------------------- categories -- */
export function ShopByCategory() {
  return (
    <Section title="Shop by category">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {SHOP_CATEGORIES.map((category) => (
          <li key={category.id}>
            <AdminLink to="/shop/all" search={{ category: category.label }}>
              <CategoryTile
                label={category.label}
                meta={`${category.count.toLocaleString('en-US')} items`}
                glyph={category.glyph}
                tone={category.tone === 'ink' ? 'ink' : category.tone}
              />
            </AdminLink>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ----------------------------------------------------------- shop by need -- */
export function ShopByNeed() {
  const assistant = useAssistant()

  return (
    <Section title="What are you shopping for?" sub="Not everyone thinks in categories.">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {SHOPPING_NEEDS.map((need) => {
          const isGift = need.id === 'gift'
          const inner = (
            <>
              <ProductScene glyph={need.glyph} tone={need.tone} className="aspect-16/10 rounded-xl" grain={false} />
              <p className="mt-3.5 text-[15px] font-semibold text-ink-900 dark:text-white">{need.label}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-500">{need.blurb}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 dark:text-brand-300">
                {isGift ? 'Help me choose' : 'Browse'}
                <ArrowRight className="size-3.5" />
              </span>
            </>
          )

          const shell =
            'block h-full rounded-2xl border bg-card p-3 text-left shadow-xs transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg'

          // The gift card opens the guide; the rest are ordinary browse links.
          return (
            <li key={need.id}>
              {isGift ? (
                <button type="button" onClick={() => assistant.open('guide')} className={cn(shell, 'w-full')}>
                  {inner}
                </button>
              ) : (
                <AdminLink to="/shop/all" search={{ need: need.id }} className={shell}>
                  {inner}
                </AdminLink>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

/* --------------------------------------------------------- shop by budget -- */
export function ShopByBudget() {
  return (
    <Section title="Find something within your budget" sub="Pick a number and we'll stay under it.">
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {BUDGET_BANDS.map((band, i) => (
          <li key={band.id}>
            <AdminLink
              to="/shop/all"
              search={{ price: band.id }}
              className={cn(
                'flex h-full flex-col justify-between rounded-2xl border p-5 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg',
                ['bg-brand-50 dark:bg-brand-950/50', 'bg-teal-50 dark:bg-teal-950/40', 'bg-gold-50 dark:bg-gold-950/30', 'bg-muted'][i]
              )}
            >
              <span className="text-[22px] font-bold leading-none tracking-[-0.02em] tabular text-ink-950 dark:text-white">
                {band.label}
              </span>
              <span className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-semibold text-ink-600 dark:text-ink-300">
                Browse
                <ArrowRight className="size-3.5" />
              </span>
            </AdminLink>
          </li>
        ))}
      </ul>
    </Section>
  )
}

/* ------------------------------------------------------------ product rails */
export function ProductRail({
  title,
  sub,
  products,
  showReason = false,
}: {
  title: string
  sub?: string
  products: ShopProduct[]
  showReason?: boolean
}) {
  return (
    <Section title={title} sub={sub} cta={{ label: 'View all', to: '/shop/all' }}>
      <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} reason={showReason ? factsFor(product.id).note : undefined} />
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** Deliberately plain: image, name, rating, price, one button. */
export function ProductCard({ product, reason }: { product: ShopProduct; reason?: string }) {
  const { add, wishlist, toggleWishlist } = useCartStore()
  const saved = wishlist.includes(product.id)
  const discount = discountPercent(product.mrp, product.price)

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-xs transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-lg">
      <div className="relative">
        <AdminLink to={`/product/${product.id}`}>
          <ProductScene glyph={product.glyph} tone={product.tone} className="aspect-square" grain={false} />
        </AdminLink>
        <button
          type="button"
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          aria-pressed={saved}
          onClick={() => {
            toggleWishlist(product.id)
            toast.success(saved ? 'Removed from wishlist' : 'Saved to wishlist')
          }}
          className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background"
        >
          <Heart className={cn('size-4', saved ? 'fill-red-500 text-red-500' : 'text-ink-500')} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <AdminLink to={`/product/${product.id}`} className="min-w-0">
          <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
            {product.name}
          </p>
        </AdminLink>

        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-ink-500">
          <Star className="size-3 fill-gold-400 text-gold-400" />
          <span className="font-semibold tabular text-ink-700 dark:text-ink-300">{product.rating}</span>
          <span aria-hidden>·</span>
          <span>{product.reviews}</span>
        </p>

        <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
          <span className="text-[17px] font-bold tabular text-ink-950 dark:text-white">{money(product.price)}</span>
          <span className="text-[12px] text-ink-400 line-through tabular">{money(product.mrp)}</span>
          {discount > 0 && (
            <span className="text-[12px] font-bold text-teal-600 dark:text-teal-100">{discount}% off</span>
          )}
        </p>

        {reason && (
          <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-600/15 dark:text-teal-100">
            <Sparkles className="size-3" />
            {reason}
          </p>
        )}

        <p className="mt-2 truncate text-[11px] text-ink-400">Sold by {product.seller}</p>

        <Button
          size="sm"
          variant="outline"
          className="mt-3 w-full"
          onClick={() => {
            add(product.id, product.options[0]?.values[0]?.label ?? 'Default')
            toast.success('Added to cart', { description: product.name })
          }}
        >
          Add to cart
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ can't decide -- */
export function CantDecide() {
  const assistant = useAssistant()
  const picks = SHOP_PRODUCTS.slice(1, 3)

  return (
    <section className="container-wide py-12 sm:py-16">
      <div className="grid items-center gap-8 rounded-3xl border bg-linear-160 from-brand-50 via-card to-card p-6 sm:p-10 lg:grid-cols-[1.1fr_1fr] dark:from-brand-950/60">
        <div>
          <h2 className="text-[28px] leading-tight tracking-[-0.03em] sm:text-[36px]">Can't decide?</h2>
          <p className="mt-3 max-w-[420px] text-[16px] leading-relaxed text-ink-600 dark:text-ink-300">
            Tell us what you're looking for and we'll narrow it down to a few good options.
          </p>

          <div className="mt-6 rounded-2xl border bg-background p-3.5 shadow-sm">
            <p className="text-[14px] italic text-ink-500">“I need a good smartwatch under $150.”</p>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => assistant.open('guide')}>
              <Sparkles className="size-4" />
              Help me choose
            </Button>
            <Button size="lg" variant="outline" onClick={() => assistant.open('photo')}>
              <Camera className="size-4" />
              Search with a photo
            </Button>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-4">
          {picks.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} reason={factsFor(product.id).note} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------ photo search -- */
export function PhotoSearchBand() {
  const assistant = useAssistant()

  return (
    <section className="container-wide py-12 sm:py-16">
      <div className="flex flex-wrap items-center gap-8 rounded-3xl bg-ink-950 p-8 sm:p-12">
        <div className="min-w-[260px] flex-1">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-brand-300">Search with a photo</p>
          <h2 className="mt-3 text-[26px] leading-tight tracking-[-0.03em] text-white sm:text-[34px]">
            Seen something you like?
          </h2>
          <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-ink-300">
            Upload a photo and we'll find similar products from sellers on SafalMarketHub. A screenshot works just as
            well as a snapshot.
          </p>
          <Button size="lg" variant="onInk" className="mt-6" onClick={() => assistant.open('photo')}>
            <Camera className="size-4" />
            Search with a photo
          </Button>
        </div>

        {/* Photo → matches, shown rather than described. */}
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-white/15 bg-white/5 p-2">
            <ProductScene glyph="bag" tone="teal" className="size-[132px] rounded-xl" grain={false} />
            <p className="mt-2 text-center text-[11px] font-semibold text-ink-400">Your photo</p>
          </div>
          <ArrowRight className="size-5 shrink-0 text-ink-500" />
          <div className="grid grid-cols-2 gap-2">
            {SHOP_PRODUCTS.slice(4, 8).map((product) => (
              <div key={product.id} className="rounded-lg border border-white/10 bg-white/5 p-1">
                <ProductScene glyph={product.glyph} tone={product.tone} className="size-[62px] rounded-md" grain={false} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ trust -- */
export function ShopWithConfidence() {
  const items = [
    { icon: ShieldCheck, label: 'Secure payments' },
    { icon: RotateCcw, label: 'Easy returns' },
    { icon: Package, label: 'Track your orders' },
    { icon: Sparkles, label: 'Verified sellers' },
  ]

  return (
    <section className="border-y bg-muted/40 py-10 dark:bg-card/30">
      <div className="container-wide">
        <h2 className="text-center text-[19px] font-semibold tracking-[-0.01em]">Shop with confidence</h2>
        <ul className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.label} className="flex items-center justify-center gap-2.5 text-center">
              <item.icon className="size-5 shrink-0 text-teal-600 dark:text-teal-100" />
              <span className="text-[14px] font-semibold text-ink-800 dark:text-ink-100">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------- seller CTA -- */
/** Deliberately small, deliberately last. This page belongs to shoppers. */
export function SellerFooterCta() {
  const sell = useStartSellingTarget()
  const user = useAccountStore((s) => s.user)

  return (
    <section className="container-wide py-12 sm:py-16">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-dashed px-6 py-7 text-center">
        <Store className="size-5 text-ink-400" />
        <div>
          <p className="text-[15px] font-semibold text-ink-900 dark:text-white">Have something to sell?</p>
          <p className="mt-0.5 text-[13px] text-ink-500">
            {user
              ? 'Add a business to your account — no second login.'
              : 'Create a seller profile and start selling on SafalMarketHub.'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <AdminLink to={sell.to}>
            Become a seller
            <ArrowRight className="size-4" />
          </AdminLink>
        </Button>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------- section -- */
function Section({
  title,
  sub,
  cta,
  children,
}: {
  title: string
  sub?: string
  cta?: { label: string; to: string }
  children: React.ReactNode
}) {
  return (
    <section className="container-wide py-10 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[24px] tracking-[-0.025em] sm:text-[30px]">{title}</h2>
          {sub && <p className="mt-1.5 text-[14px] text-ink-600 dark:text-ink-300">{sub}</p>}
        </div>
        {cta && (
          <AdminLink
            to={cta.to}
            className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-600 dark:text-brand-300"
          >
            {cta.label}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </AdminLink>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}
