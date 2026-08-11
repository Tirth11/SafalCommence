import { ArrowRight } from 'lucide-react'

import { ProductCard } from '@/components/commerce/product-card'
import { Section, SectionHead } from '@/components/marketing/section'
import { Button } from '@/components/ui/button'
import { CATEGORIES, PRODUCTS } from '@/data/catalog'

const CATEGORY_GLYPH_TONES = ['brand', 'teal', 'gold', 'ink', 'brand', 'teal'] as const

export function MarketplacePreview() {
  return (
    <Section id="marketplace">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead
            eyebrow="Marketplace"
            title="Discover products from growing businesses"
            sub="Explore products listed by verified sellers across multiple categories."
          />
          <Button variant="link" asChild className="hidden lg:inline-flex">
            <a href="#marketplace" className="group">
              View All Products
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </Button>
        </div>

        {/* Category chips — horizontally scrollable on mobile */}
        <div id="categories" className="-mx-5 mt-10 scroll-mt-24 overflow-x-auto px-5 pb-2 no-scrollbar md:mx-0 md:px-0">
          <ul className="flex min-w-max gap-3 md:min-w-0 md:flex-wrap">
            {CATEGORIES.map((cat, i) => (
              <li key={cat.id}>
                <a
                  href="#marketplace"
                  className="group flex items-center gap-3 rounded-full border bg-card py-2 pl-2 pr-5 shadow-xs transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
                >
                  <span
                    className={
                      'grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-bold ' +
                      {
                        brand: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-200',
                        teal: 'bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100',
                        gold: 'bg-gold-50 text-gold-600 dark:bg-gold-600/15 dark:text-gold-400',
                        ink: 'bg-ink-100 text-ink-700 dark:bg-secondary dark:text-ink-200',
                      }[CATEGORY_GLYPH_TONES[i % CATEGORY_GLYPH_TONES.length]]
                    }
                  >
                    {cat.label.charAt(0)}
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-semibold leading-tight text-ink-900 dark:text-white">
                      {cat.label}
                    </span>
                    <span className="block text-[11px] text-ink-500">{cat.count}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Product grid — 2 per row on mobile */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 lg:hidden">
          <Button variant="outline" asChild className="w-full">
            <a href="#marketplace">
              View All Products
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </Section>
  )
}
