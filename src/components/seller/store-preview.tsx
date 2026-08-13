import { Lock, Search, ShoppingCart } from 'lucide-react'

import { ProductScene } from '@/components/marketing/scene'
import { SELLER_PRODUCTS } from '@/data/seller'
import { usePlan, useStorefrontStore, useStoreUrl } from '@/store/storefront-store'
import { money } from '@/lib/utils'

/**
 * A miniature of the generated storefront, driven entirely by the seller's own
 * settings — theme, colours, sections, announcement bar. It is the answer to
 * "what will this look like?" without building a page builder to find out.
 */
export function StorePreview({ device = 'desktop' }: { device?: 'desktop' | 'mobile' }) {
  const plan = usePlan()
  const { config, homepageSections, collections, status } = useStorefrontStore()
  const storeUrl = useStoreUrl()
  const active = SELLER_PRODUCTS.filter((p) => p.status === 'Active')
  const fontFamily =
    config.font === 'Playfair' ? 'Georgia, serif' : config.font === 'Sora' ? 'system-ui, sans-serif' : 'inherit'

  const on = (id: string) => homepageSections.find((s) => s.id === id)?.on ?? false
  const mobile = device === 'mobile'
  // Sections render in the order the seller arranged them.
  const ordered = homepageSections.filter((s) => s.on)

  const productGrid = (items: typeof active, cols: string) => (
    <div className={`grid gap-2.5 p-4 ${cols}`}>
      {items.map((p) => (
        <div key={p.id}>
          <ProductScene glyph={p.glyph} tone={p.tone} className="aspect-square rounded-md" grain={false} />
          <p className="mt-1.5 line-clamp-1 text-[10px] font-semibold text-ink-900 dark:text-white">{p.name}</p>
          <p className="text-[10px] font-bold tabular" style={{ color: config.brandColor }}>
            {money(p.price)}
          </p>
        </div>
      ))}
    </div>
  )

  const sectionHeading = (label: string) => (
    <p className="px-4 pt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</p>
  )

  return (
    <div className="overflow-hidden rounded-b-lg" style={{ fontFamily }}>
      {/* browser chrome */}
      <div className="flex items-center gap-3 border-b bg-muted/60 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2 rounded-full bg-ink-300" />
          <span className="size-2 rounded-full bg-ink-300" />
          <span className="size-2 rounded-full bg-ink-300" />
        </span>
        <span className="mx-auto flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-[10px] tabular text-ink-500">
          <Lock className="size-2.5" />
          {storeUrl}
        </span>
      </div>

      <div className={mobile ? 'mx-auto max-w-[320px] border-x bg-background' : 'bg-background'}>
        {/* paused stores stay browsable but stop taking orders */}
        {status === 'paused' && (
          <div className="bg-gold-100 px-4 py-2 text-center text-[10px] font-semibold text-gold-800 dark:bg-gold-950 dark:text-gold-200">
            This store is not accepting orders right now.
          </div>
        )}

        {/* announcement bar */}
        {on('announcement') && config.announcement.on && config.announcement.text && (
          <div className="px-4 py-1.5 text-center text-[10px] font-semibold text-white" style={{ background: config.brandColor }}>
            {config.announcement.text}
          </div>
        )}

        {/* store header — the seller's brand, not ours */}
        <div className="flex items-center gap-3 border-b px-4 py-3">
          <span
            className="grid size-7 shrink-0 place-items-center rounded-md text-[10px] font-bold text-white"
            style={{ background: config.brandColor }}
          >
            {config.logoText.slice(0, 3).toUpperCase()}
          </span>
          <span className="text-[13px] font-bold tracking-[-0.01em] text-ink-950 dark:text-white">{config.name}</span>
          {!mobile && (
            <nav className="ml-4 hidden gap-3 text-[11px] text-ink-500 sm:flex">
              <span>Home</span>
              <span>Shop</span>
              <span>Categories</span>
              <span>About</span>
            </nav>
          )}
          <span className="ml-auto flex items-center gap-2 text-ink-400">
            <Search className="size-3.5" />
            <ShoppingCart className="size-3.5" />
          </span>
        </div>

        {ordered.map((section) => {
          switch (section.id) {
            case 'hero':
              return (
                <div
                  key={section.id}
                  className="px-5 py-7"
                  style={{ background: `linear-gradient(135deg, ${config.brandColor}14, ${config.accentColor}0F)` }}
                >
                  <p className="text-[17px] font-bold leading-tight tracking-[-0.02em] text-ink-950 dark:text-white">
                    {config.bannerHeadline}
                  </p>
                  <p className="mt-1.5 max-w-[320px] text-[11px] leading-relaxed text-ink-600 dark:text-ink-300">
                    {config.bannerSub}
                  </p>
                  <span
                    className="mt-3.5 inline-block rounded-md px-3 py-1.5 text-[11px] font-semibold text-white"
                    style={{ background: config.brandColor }}
                  >
                    Shop now
                  </span>
                </div>
              )

            case 'categories':
              return (
                <div key={section.id}>
                  {sectionHeading('Shop by category')}
                  <div className="flex gap-2 overflow-hidden px-4 pb-1 pt-2.5">
                    {['Audio', 'Wearables', 'Accessories', 'Cables'].map((c) => (
                      <span key={c} className="rounded-full border px-2.5 py-1 text-[10px] font-semibold text-ink-600 dark:text-ink-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )

            case 'new-arrivals':
              return (
                <div key={section.id}>
                  {sectionHeading('New arrivals')}
                  {productGrid(active.slice(0, mobile ? 2 : 4), mobile ? 'grid-cols-2' : 'grid-cols-4')}
                </div>
              )

            case 'best-sellers':
              return (
                <div key={section.id}>
                  {sectionHeading('Best sellers')}
                  {productGrid(active.slice(2, mobile ? 4 : 6), mobile ? 'grid-cols-2' : 'grid-cols-4')}
                </div>
              )

            case 'featured': {
              const featured = collections.find((c) => c.rule === 'manual' && c.visible)
              return (
                <div key={section.id}>
                  {sectionHeading(featured?.name ?? 'Featured products')}
                  {productGrid(active.slice(0, mobile ? 2 : 3), mobile ? 'grid-cols-2' : 'grid-cols-3')}
                </div>
              )
            }

            case 'about':
              return (
                <div key={section.id} className="border-t px-4 py-4">
                  <p className="text-[11px] font-bold text-ink-900 dark:text-white">About {config.name}</p>
                  <p className="mt-1 line-clamp-3 text-[10px] leading-relaxed text-ink-500">{config.description}</p>
                </div>
              )

            default:
              return null
          }
        })}

        {/* footer — badge only when the plan keeps it */}
        <div className="border-t px-4 py-3 text-center">
          {config.freeShipping.on && (
            <p className="text-[10px] font-semibold" style={{ color: config.accentColor }}>
              Free shipping on orders above {money(config.freeShipping.threshold)}
            </p>
          )}
          <p className="mt-1 text-[10px] text-ink-500">
            © 2026 {config.name} · {config.supportEmail}
          </p>
          <p className="mt-0.5 text-[10px] text-ink-400">Returns · Shipping · Privacy · Terms</p>
          {!plan.removeBranding && <p className="mt-1 text-[10px] font-semibold text-ink-400">Powered by SafalMarketHub</p>}
        </div>
      </div>
    </div>
  )
}
