import { ArrowRight, BadgeCheck, Headset, RotateCcw, ShieldCheck, Truck } from 'lucide-react'

import { AdminLink } from '@/components/admin/admin-link'
import { ProductThumb } from '@/components/commerce/product-thumb'
import { Breadcrumbs, ShopProductCard } from '@/components/shop/shop-bits'
import { Button } from '@/components/ui/button'
import { SHOP_CATEGORIES, SHOP_PRODUCTS } from '@/data/shop'

const TRUST = [
  { icon: BadgeCheck, label: 'Verified sellers', body: 'Every seller is checked before going live.' },
  { icon: ShieldCheck, label: 'Secure payments', body: 'UPI, cards and net banking.' },
  { icon: RotateCcw, label: 'Easy returns', body: '7-day returns on eligible products.' },
  { icon: Headset, label: 'Support', body: 'Help with any order, any seller.' },
]

/** Marketplace landing — discovery first, no sign-in wall. */
export function ShopHomePage() {
  const featured = SHOP_PRODUCTS.slice(0, 4)
  const newArrivals = SHOP_PRODUCTS.slice(4, 8)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-xl border bg-linear-160 from-brand-50 via-background to-background p-6 sm:p-10 dark:from-brand-950/60">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-[380px] rounded-full bg-brand-100/60 blur-3xl dark:bg-brand-900/30" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
              SafalMarketHub marketplace
            </span>
            <h1 className="mt-3 text-[32px] leading-[1.1] sm:text-[44px]">Discover. Shop. Delivered.</h1>
            <p className="mt-4 max-w-[480px] text-base text-ink-600 sm:text-[17px] dark:text-ink-300">
              Explore products from trusted sellers across SafalMarketHub.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <AdminLink to="/shop/all">Shop Now</AdminLink>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <AdminLink to="/shop/categories">Browse Categories</AdminLink>
              </Button>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2">
              {['Free delivery over $99', '7-day returns', 'Verified sellers'].map((item) => (
                <li key={item} className="flex items-center gap-1.5 text-[13px] font-medium text-ink-700 dark:text-ink-300">
                  <BadgeCheck className="size-4 shrink-0 text-teal-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Promotional tiles instead of a stock photo */}
          <div className="grid grid-cols-2 gap-3">
            {SHOP_CATEGORIES.slice(0, 4).map((cat) => (
              <AdminLink
                key={cat.id}
                to="/shop/all"
                search={{ category: cat.label }}
                className="group overflow-hidden rounded-lg border bg-card p-3 shadow-xs transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md"
              >
                <ProductThumb glyph={cat.glyph} tone={cat.tone} className="aspect-4/3" />
                <p className="mt-2.5 px-0.5 text-[13px] font-semibold text-ink-900 dark:text-white">{cat.label}</p>
                <p className="px-0.5 text-[11px] text-ink-500 tabular">{cat.count.toLocaleString('en-US')} products</p>
              </AdminLink>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-10">
        <SectionRow title="Shop by category" to="/shop/categories" cta="All categories" />
        <div className="-mx-5 mt-4 overflow-x-auto px-5 pb-2 no-scrollbar sm:mx-0 sm:px-0">
          <ul className="flex min-w-max gap-3 sm:min-w-0 sm:flex-wrap">
            {SHOP_CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <AdminLink
                  to="/shop/all"
                  search={{ category: cat.label }}
                  className="flex items-center gap-3 rounded-full border bg-card py-2 pl-2 pr-5 shadow-xs transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                >
                  <ProductThumb glyph={cat.glyph} tone={cat.tone} className="aspect-square size-9 shrink-0 rounded-full" />
                  <span className="text-left">
                    <span className="block text-sm font-semibold leading-tight text-ink-900 dark:text-white">{cat.label}</span>
                    <span className="block text-[11px] text-ink-500 tabular">{cat.count.toLocaleString('en-US')} products</span>
                  </span>
                </AdminLink>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Featured */}
      <section className="mt-10">
        <SectionRow title="Featured products" to="/shop/all" cta="View all" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {featured.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <section className="mt-10">
        <SectionRow title="New arrivals" to="/shop/all" search={{ sort: 'newest' }} cta="See what's new" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {newArrivals.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="mt-12 rounded-xl border bg-muted/40 p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((item) => (
            <div key={item.label} className="flex gap-3.5">
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-background text-teal-600 shadow-xs dark:text-teal-100">
                <item.icon className="size-5" />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-ink-900 dark:text-white">{item.label}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function SectionRow({
  title,
  to,
  search,
  cta,
}: {
  title: string
  to: string
  search?: Record<string, string>
  cta: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <h2 className="text-xl sm:text-2xl">{title}</h2>
      <AdminLink
        to={to}
        search={search}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-300"
      >
        {cta}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </AdminLink>
    </div>
  )
}

/** All categories, with subcategories — the browse-by-category entry point. */
export function ShopCategoriesPage() {
  return (
    <>
      <Breadcrumbs trail={[{ label: 'Home', to: '/shop' }, { label: 'Categories' }]} />
      <h1 className="text-2xl sm:text-[30px]">Categories</h1>
      <p className="mt-2 text-[15px] text-ink-600 dark:text-ink-300">
        Browse everything on SafalMarketHub, from electronics to home and living.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SHOP_CATEGORIES.map((cat) => (
          <section key={cat.id} className="rounded-lg border bg-card p-5 shadow-xs">
            <div className="flex items-center gap-3.5">
              <ProductThumb glyph={cat.glyph} tone={cat.tone} className="aspect-square size-12 shrink-0 rounded-md" />
              <div className="min-w-0">
                <h2 className="text-[17px]">
                  <AdminLink to="/shop/all" search={{ category: cat.label }} className="hover:text-brand-700 dark:hover:text-brand-300">
                    {cat.label}
                  </AdminLink>
                </h2>
                <p className="text-[11px] text-ink-500 tabular">{cat.count.toLocaleString('en-US')} products</p>
              </div>
            </div>

            <ul className="mt-4 space-y-2.5 border-t pt-4">
              {cat.children.map((sub) => (
                <li key={sub.label}>
                  <AdminLink
                    to="/shop/all"
                    search={{ category: cat.label, sub: sub.label }}
                    className="text-[13px] font-semibold text-ink-800 hover:text-brand-700 dark:text-ink-100 dark:hover:text-brand-300"
                  >
                    {sub.label}
                  </AdminLink>
                  {sub.children.length > 0 && (
                    <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                      {sub.children.map((leaf) => (
                        <AdminLink
                          key={leaf}
                          to="/shop/all"
                          search={{ category: cat.label, sub: sub.label, leaf }}
                          className="text-[12px] text-ink-500 hover:text-ink-900 dark:hover:text-white"
                        >
                          {leaf}
                        </AdminLink>
                      ))}
                    </p>
                  )}
                </li>
              ))}
            </ul>

            <Button variant="ghost" size="sm" className="mt-4" asChild>
              <AdminLink to="/shop/all" search={{ category: cat.label }}>
                Shop {cat.label}
                <Truck className="size-4" />
              </AdminLink>
            </Button>
          </section>
        ))}
      </div>
    </>
  )
}
