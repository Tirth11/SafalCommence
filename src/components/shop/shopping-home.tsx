import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Bell, Camera, Check, Package, Search, Sparkles, Tag, Truck } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink, adminLinkProps } from '@/components/admin/admin-link'
import { ProductScene } from '@/components/marketing/scene'
import { ProductCard } from '@/components/marketing/discovery-sections'
import { useAssistant } from '@/components/shop/assistant'
import { Button } from '@/components/ui/button'
import { PERSONAL_OFFERS, productFor, TODAY_OFFERS, UPCOMING_OFFERS } from '@/data/offers'
import { CUSTOMER_ORDERS, SHOP_PRODUCTS } from '@/data/shop'
import { useAccountStore } from '@/store/account-store'
import { useCartStore } from '@/store/cart-store'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   The personal shopping home — what a signed-in customer sees.

   Not a dashboard. No "Orders: 0" tiles. It answers, in order: what can I
   buy, is anything on offer, where is my order, and can you help me choose.
   ========================================================================== */

/* ------------------------------------------------------------------ hero -- */
export function ShopperHero() {
  const user = useAccountStore((s) => s.user)
  const assistant = useAssistant()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const actions = [
    { icon: Camera, label: 'Photo', onClick: () => assistant.open('photo') },
    { icon: Sparkles, label: 'Help me choose', onClick: () => assistant.open('guide') },
    { icon: Tag, label: "Today's offers", onClick: () => document.getElementById('offers')?.scrollIntoView({ block: 'start' }) },
  ]

  return (
    <section className="relative overflow-hidden border-b">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-40 size-[460px] rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/25" />
        <div className="absolute -right-28 top-0 size-[380px] rounded-full bg-teal-200/35 blur-3xl dark:bg-teal-900/20" />
      </div>

      <div className="container-wide relative py-12 sm:py-16">
        <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] sm:text-[40px]">
          Hi {user?.firstName ?? 'there'} 👋
        </h1>
        <p className="mt-2 text-[18px] text-ink-600 sm:text-[22px] dark:text-ink-300">
          What are you looking for today?
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim()) assistant.open('search', query.trim())
          }}
          className="mt-7 max-w-[640px]"
        >
          <div className="flex items-center gap-2 rounded-2xl border-2 bg-card p-2 shadow-md focus-within:border-brand-500 sm:rounded-full sm:pl-5">
            <Search className="hidden size-5 shrink-0 text-ink-400 sm:block" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, brands or categories..."
              aria-label="Search products, brands or categories"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[15px] outline-none placeholder:text-ink-400 sm:px-0"
            />
            <Button type="submit" size="sm" className="shrink-0 rounded-full px-4">
              Search
            </Button>
          </div>
        </form>

        <ul className="mt-4 flex flex-wrap gap-2">
          {actions.map((action) => (
            <li key={action.label}>
              <button
                type="button"
                onClick={action.onClick}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-[13px] font-semibold text-ink-700 shadow-xs transition-[transform,border-color] hover:-translate-y-0.5 hover:border-brand-300 dark:text-ink-200"
              >
                <action.icon className="size-4 text-brand-600 dark:text-brand-300" />
                {action.label}
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => navigate(adminLinkProps({ to: '/shop/all' }))}
              className="inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-2 text-[13px] font-semibold text-ink-700 shadow-xs transition-[transform,border-color] hover:-translate-y-0.5 hover:border-brand-300 dark:text-ink-200"
            >
              Browse everything
              <ArrowRight className="size-3.5" />
            </button>
          </li>
        </ul>
      </div>
    </section>
  )
}

/* ---------------------------------------------------------- active order -- */
const STAGES = ['Ordered', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']

/** Where is my order — answered without making anyone open My Orders. */
export function ActiveOrderCard() {
  const order = CUSTOMER_ORDERS.find((o) => ['Shipped', 'Out for Delivery', 'Processing'].includes(o.status))
  if (!order) return null

  const shipment = order.shipments[0]
  const reached = Math.max(0, STAGES.indexOf(order.status === 'Processing' ? 'Packed' : order.status))
  const item = shipment?.items[0]

  return (
    <section className="container-wide py-8">
      <div className="rounded-2xl border bg-card p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 gap-4">
            {item && (
              <ProductScene glyph={item.glyph} tone={item.tone} className="size-16 shrink-0 rounded-xl" grain={false} />
            )}
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-brand-600 dark:text-brand-300">
                <Package className="size-4" />
                Your order is on the way
              </p>
              <p className="mt-1 line-clamp-1 text-[16px] font-semibold text-ink-900 dark:text-white">{item?.name}</p>
              <p className="mt-0.5 text-[13px] text-ink-500">
                {order.id} · {shipment?.estimate ?? 'Arriving soon'}
              </p>
            </div>
          </div>
          <Button asChild>
            <AdminLink to={`/account/orders/${order.id}`}>Track order</AdminLink>
          </Button>
        </div>

        {/* Progress reads left to right, with the current stage filled. */}
        <ol className="mt-6 flex gap-1.5">
          {STAGES.map((stage, i) => (
            <li key={stage} className="min-w-0 flex-1">
              <span
                className={cn(
                  'block h-1.5 rounded-full',
                  i < reached ? 'bg-teal-500' : i === reached ? 'bg-brand-600' : 'bg-ink-200 dark:bg-secondary'
                )}
              />
              <span
                className={cn(
                  'mt-2 block truncate text-[11px]',
                  i <= reached ? 'font-semibold text-ink-800 dark:text-ink-100' : 'text-ink-400'
                )}
              >
                {stage}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* --------------------------------------------------------- today's offers -- */
export function TodaysOffers() {
  return (
    <section id="offers" className="container-wide scroll-mt-24 py-10">
      <Heading title="Today's offers 🔥" sub="Running now — no waiting." />
      <ul className="mt-5 grid gap-4 lg:grid-cols-3">
        {TODAY_OFFERS.map((offer) => (
          <li key={offer.id}>
            <div
              className={cn(
                'flex h-full flex-col justify-between rounded-2xl border p-5',
                {
                  brand: 'bg-brand-50 dark:bg-brand-950/50',
                  teal: 'bg-teal-50 dark:bg-teal-950/40',
                  gold: 'bg-gold-50 dark:bg-gold-950/30',
                  ink: 'bg-muted',
                }[offer.tone]
              )}
            >
              <div>
                <p className="text-[26px] font-bold leading-none tracking-[-0.02em] tabular text-ink-950 dark:text-white">
                  {offer.headline}
                </p>
                <p className="mt-2 text-[14px] text-ink-700 dark:text-ink-200">{offer.detail}</p>
                {offer.code && (
                  <p className="mt-3 inline-block rounded-md border border-dashed bg-background/70 px-2.5 py-1 text-[12px] font-bold tabular">
                    {offer.code}
                  </p>
                )}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">{offer.endsLabel}</span>
                <Button size="sm" variant="outline" asChild>
                  <AdminLink to="/shop/all" search={offer.category ? { category: offer.category } : undefined}>
                    Shop now
                  </AdminLink>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------------------------------------------------------- offers for you */
export function OffersForYou() {
  const items = PERSONAL_OFFERS.map((offer) => ({ offer, product: productFor(offer.productId) })).filter(
    (entry): entry is { offer: (typeof PERSONAL_OFFERS)[number]; product: NonNullable<ReturnType<typeof productFor>> } =>
      Boolean(entry.product)
  )
  if (!items.length) return null

  return (
    <section className="container-wide py-10">
      <Heading title="Offers for you" sub="Based on what you saved and viewed." />
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ offer, product }) => {
          const saved = offer.wasPrice - product.price
          return (
            <li key={offer.id}>
              <div className="flex h-full gap-4 rounded-2xl border bg-card p-4 shadow-xs">
                <ProductScene glyph={product.glyph} tone={product.tone} className="size-20 shrink-0 rounded-xl" grain={false} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-teal-700 dark:text-teal-100">
                    {offer.label}
                  </p>
                  <p className="mt-1 line-clamp-2 text-[13px] font-semibold text-ink-900 dark:text-white">{product.name}</p>
                  <p className="mt-1.5 flex items-baseline gap-2">
                    <span className="text-[15px] font-bold tabular text-ink-950 dark:text-white">{money(product.price)}</span>
                    <span className="text-[12px] text-ink-400 line-through tabular">{money(offer.wasPrice)}</span>
                  </p>
                  {saved > 0 && (
                    <p className="mt-0.5 text-[11px] font-semibold text-teal-600 dark:text-teal-100">
                      You save {money(saved)}
                    </p>
                  )}
                  <Button size="sm" variant="outline" className="mt-auto w-fit" asChild>
                    <AdminLink to={`/product/${product.id}`}>View deal</AdminLink>
                  </Button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------ continue shopping -- */
export function ContinueShopping() {
  // Stands in for a viewing-history service.
  const recent = SHOP_PRODUCTS.slice(2, 6)

  return (
    <section className="container-wide py-10">
      <Heading title="Pick up where you left off" sub="Recently viewed." cta={{ label: 'Browse all', to: '/shop/all' }} />
      <ul className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {recent.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}

/* -------------------------------------------------------------- wishlist -- */
export function YourWishlist() {
  const wishlist = useCartStore((s) => s.wishlist)
  const saved = SHOP_PRODUCTS.filter((p) => wishlist.includes(p.id))

  if (!saved.length) return null

  return (
    <section className="container-wide py-10">
      <Heading title="Your wishlist" sub="Saved for later." cta={{ label: 'See all', to: '/account/wishlist' }} />
      <ul className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {saved.slice(0, 4).map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------- buy again -- */
/** Straight from delivered orders — reordering should take one tap. */
export function BuyAgain() {
  const add = useCartStore((s) => s.add)

  const delivered = CUSTOMER_ORDERS.filter((o) => o.status === 'Delivered')
    .flatMap((order) => order.shipments.flatMap((s) => s.items.map((item) => ({ item, order }))))
    .slice(0, 4)

  if (!delivered.length) return null

  return (
    <section className="container-wide py-10">
      <Heading title="Buy again" sub="Things you've bought before." cta={{ label: 'All orders', to: '/account/orders' }} />
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {delivered.map(({ item, order }) => (
          <li key={`${order.id}-${item.productId}`}>
            <div className="flex h-full flex-col rounded-2xl border bg-card p-4 shadow-xs">
              <div className="flex gap-3">
                <ProductScene glyph={item.glyph} tone={item.tone} className="size-16 shrink-0 rounded-xl" grain={false} />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-[13px] font-semibold text-ink-900 dark:text-white">{item.name}</p>
                  <p className="mt-1 text-[12px] text-ink-500">{item.variant}</p>
                  <p className="mt-1 text-[13px] font-bold tabular text-ink-950 dark:text-white">{money(item.price)}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3.5 w-full"
                onClick={() => {
                  add(item.productId, item.variant)
                  toast.success('Added to cart', { description: item.name })
                }}
              >
                Buy again
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* --------------------------------------------------------------- upcoming -- */
export function ComingSoon() {
  const [reminded, setReminded] = useState<string[]>([])

  return (
    <section className="container-wide py-10">
      <Heading title="Coming soon" sub="Worth waiting a few days for." />
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {UPCOMING_OFFERS.map((offer) => {
          const on = reminded.includes(offer.id)
          return (
            <li key={offer.id}>
              <div className="flex h-full flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed p-5">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-300">
                    {offer.starts}
                  </p>
                  <p className="mt-1.5 text-[17px] font-semibold text-ink-900 dark:text-white">{offer.title}</p>
                  <p className="mt-1 text-[13px] text-ink-500">{offer.detail}</p>
                </div>
                <Button
                  variant={on ? 'ghost' : 'outline'}
                  size="sm"
                  disabled={on}
                  onClick={() => {
                    setReminded((r) => [...r, offer.id])
                    toast.success("We'll remind you", { description: `${offer.title} — ${offer.starts.toLowerCase()}` })
                  }}
                >
                  {on ? (
                    <>
                      <Check className="size-4" />
                      Reminder set
                    </>
                  ) : (
                    <>
                      <Bell className="size-4" />
                      Notify me
                    </>
                  )}
                </Button>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* --------------------------------------------------------------- helpers -- */
function Heading({ title, sub, cta }: { title: string; sub?: string; cta?: { label: string; to: string } }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[22px] tracking-[-0.025em] sm:text-[26px]">{title}</h2>
        {sub && <p className="mt-1 text-[13px] text-ink-500">{sub}</p>}
      </div>
      {cta && (
        <AdminLink
          to={cta.to}
          className="group inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 dark:text-brand-300"
        >
          {cta.label}
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </AdminLink>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ floating -- */
/** Small, corner-anchored, and never covering the page. */
export function AssistantFab() {
  const assistant = useAssistant()

  return (
    <button
      type="button"
      onClick={() => assistant.open('chat')}
      className="fixed bottom-24 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-ink-950 py-3 pl-4 pr-5 text-[14px] font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 sm:bottom-[76px] sm:right-7 dark:bg-white dark:text-ink-950"
    >
      <Sparkles className="size-4" />
      Need help?
    </button>
  )
}

/** A compact welcome card offering the same doors as the hero. */
export function AssistantWelcome() {
  const assistant = useAssistant()
  const user = useAccountStore((s) => s.user)

  const options = [
    { label: 'Find something', run: () => assistant.open('chat') },
    { label: "Today's offers", run: () => document.getElementById('offers')?.scrollIntoView({ block: 'start' }) },
    { label: 'Upload a photo', run: () => assistant.open('photo') },
    { label: 'Help me choose', run: () => assistant.open('guide') },
  ]

  return (
    <section className="container-wide py-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-4 shadow-xs sm:p-5">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
          <Sparkles className="size-5" />
        </span>
        <p className="min-w-0 flex-1 text-[14px] text-ink-700 dark:text-ink-200">
          <strong className="font-semibold text-ink-900 dark:text-white">Hi {user?.firstName ?? 'there'} 👋</strong>{' '}
          What would you like to do?
        </p>
        <ul className="flex flex-wrap gap-2">
          {options.map((option) => (
            <li key={option.label}>
              <Button variant="outline" size="sm" onClick={option.run}>
                {option.label}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** Free-delivery style reassurance, kept to one line. */
export function DeliveryNote() {
  return (
    <p className="container-wide flex items-center gap-2 py-2 text-[12px] text-ink-500">
      <Truck className="size-3.5" />
      Free delivery on orders above {money(99)} · 7-day returns
    </p>
  )
}
