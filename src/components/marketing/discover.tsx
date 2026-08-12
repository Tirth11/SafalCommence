import { useCallback, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react'

import { AdminLink } from '@/components/admin/admin-link'
import { EditorialHeading, Reveal } from '@/components/marketing/reveal'
import { CategoryTile, ProductScene, type SceneTone } from '@/components/marketing/scene'
import { Button } from '@/components/ui/button'
import { SHOP_CATEGORIES, SHOP_PRODUCTS } from '@/data/shop'
import { cn, discountPercent, money } from '@/lib/utils'

/** Categories + a swipeable product rail — the shopper's half of the page. */
export function Discover() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps', loop: false })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const sync = useCallback((api: typeof emblaApi) => {
    if (!api) return
    setCanPrev(api.canScrollPrev())
    setCanNext(api.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return
    sync(emblaApi)
    emblaApi.on('select', sync).on('reInit', sync)
  }, [emblaApi, sync])

  return (
    <section id="marketplace" className="scroll-mt-24 py-16 sm:py-24">
      <div className="container-wide">
        <Reveal>
          <EditorialHeading
            eyebrow="Discover"
            title="A marketplace of small businesses, in one place."
            sub="Every seller is verified before their products go live. Browse freely — you only need an account when you're ready to buy."
          />
        </Reveal>

        {/* Category tiles */}
        <Reveal delay={0.08}>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {SHOP_CATEGORIES.map((cat) => (
              <AdminLink key={cat.id} to="/shop/all" search={{ category: cat.label }}>
                <CategoryTile
                  label={cat.label}
                  meta={`${cat.count.toLocaleString('en-US')} products`}
                  glyph={cat.glyph}
                  tone={(cat.tone === 'ink' ? 'ink' : cat.tone) as SceneTone}
                />
              </AdminLink>
            ))}
          </div>
        </Reveal>

        {/* Product rail */}
        <Reveal delay={0.12}>
          <div className="mt-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h3 className="text-[22px] tracking-[-0.02em] sm:text-[26px]">Popular right now</h3>
                <p className="mt-1.5 text-[14px] text-ink-600 dark:text-ink-300">
                  Hand-picked products from sellers across the marketplace.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous products"
                  disabled={!canPrev}
                  onClick={() => emblaApi?.scrollPrev()}
                  className="rounded-full"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next products"
                  disabled={!canNext}
                  onClick={() => emblaApi?.scrollNext()}
                  className="rounded-full"
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button variant="link" asChild className="ml-2 hidden sm:inline-flex">
                  <Link to="/shop">
                    View all
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 overflow-hidden" ref={emblaRef}>
              <div className="-ml-4 flex">
                {SHOP_PRODUCTS.map((product) => (
                  <div
                    key={product.id}
                    className="min-w-0 shrink-0 grow-0 basis-[78%] pl-4 sm:basis-[44%] lg:basis-[26%] xl:basis-[23%]"
                  >
                    <AdminLink to={`/product/${product.id}`} className="group block">
                      <div className="overflow-hidden rounded-2xl border bg-card">
                        <ProductScene
                          glyph={product.glyph}
                          tone={product.tone as SceneTone}
                          className="aspect-square transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                        />
                      </div>
                      <div className="px-1 pt-3.5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">{product.brand}</p>
                        <p className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                          {product.name}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-500">
                          <Star className="size-3 fill-gold-400 text-gold-400" />
                          <span className="font-semibold text-ink-700 tabular dark:text-ink-300">{product.rating.toFixed(1)}</span>
                          <span aria-hidden>·</span>
                          <span className="truncate">{product.seller}</span>
                        </p>
                        <p className="mt-2 flex flex-wrap items-baseline gap-x-2">
                          <span className="text-[16px] font-bold tabular text-ink-950 dark:text-white">
                            {money(product.price)}
                          </span>
                          <span className="text-[12px] text-ink-400 line-through tabular">{money(product.mrp)}</span>
                          <span className="text-[11px] font-bold text-teal-600 dark:text-teal-100">
                            {discountPercent(product.mrp, product.price)}% off
                          </span>
                        </p>
                      </div>
                    </AdminLink>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 sm:hidden">
              <Button variant="outline" asChild className="w-full">
                <Link to="/shop">View all products</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Full-bleed editorial band — a seller story, told simply. */
export function SellerStory() {
  const stats = [
    { value: '$1,100', label: 'Sales in their first full month' },
    { value: '124', label: 'Orders fulfilled' },
    { value: '4.6★', label: 'Average customer rating' },
  ]

  return (
    <section id="sellers" className="scroll-mt-24 overflow-hidden bg-ink-950 py-16 sm:py-24">
      <div className="container-wide">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <Reveal>
            <div>
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-brand-300">For sellers</span>
              <h2 className="mt-4 text-[30px] leading-[1.08] tracking-[-0.03em] text-white sm:text-[42px]">
                Everything you need to run the business — nothing you don't.
              </h2>
              <p className="mt-5 max-w-[520px] text-[17px] leading-relaxed text-ink-300">
                No spreadsheets, no separate tools. Add a product, accept an order, print the label, watch the settlement
                land. All of it in the same place.
              </p>

              <ul className="mt-9 grid gap-4 sm:grid-cols-2">
                {[
                  { title: 'Guided listing', body: 'A step-by-step flow for photos, variants, pricing and stock.' },
                  { title: 'Order to doorstep', body: 'Accept, pack, generate a label and track the shipment.' },
                  { title: 'Clear money trail', body: 'Every commission and deduction shown, per order.' },
                  { title: 'Weekly settlements', body: 'Paid to your verified bank account on a fixed cycle.' },
                ].map((item) => (
                  <li key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[14px] font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-400">{item.body}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="onInk" asChild className="w-full sm:w-auto">
                  <Link to="/register">Start selling today</Link>
                </Button>
                <Button size="lg" variant="onInkOutline" asChild className="w-full sm:w-auto">
                  <Link to="/login">Seller sign in</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <figure className="relative">
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm">
                <ProductScene glyph="headphones" tone="ink" className="aspect-4/3" grain={false} />
              </div>
              <figcaption className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-[15px] leading-relaxed text-ink-200">
                  “We listed twelve products on a Sunday and had our first order before Monday lunch. The dashboard tells
                  me exactly what to do next.”
                </p>
                <p className="mt-4 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-brand-500/25 text-[12px] font-bold text-brand-100">
                    AE
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-white">ABC Electronics</span>
                    <span className="block text-[11px] text-ink-400">Audio &amp; accessories · Mumbai</span>
                  </span>
                </p>
              </figcaption>

              <dl className="mt-4 grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                  <div key={stat.label} className={cn('rounded-2xl border border-white/10 bg-white/5 p-4')}>
                    <dt className="text-[18px] font-bold leading-none tracking-[-0.02em] text-white tabular">
                      {stat.value}
                    </dt>
                    <dd className="mt-1.5 text-[11px] leading-snug text-ink-400">{stat.label}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[11px] text-ink-500">Figures shown are from a sample seller account.</p>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
