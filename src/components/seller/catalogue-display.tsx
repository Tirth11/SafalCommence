import { useState } from 'react'
import { toast } from 'sonner'

import { Panel } from '@/components/admin/primitives'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  DEFAULT_CATALOGUE_DISPLAY,
  flattenCategories,
  SORT_LABELS,
  STORE_FILTERS,
  TOTAL_STORE_PRODUCTS,
  type SortId,
} from '@/data/store-catalogue'
import { cn } from '@/lib/utils'

/* ==========================================================================
   Online Store → Catalogue display.

   A storefront may hold fifty categories and five thousand products. This is
   how the seller shapes what a customer meets first, without designing pages
   by hand — the homepage promotes a handful of categories, and the full
   catalogue stays one tap away behind search and filters.
   ========================================================================== */

export function CatalogueDisplayTab() {
  const [display, setDisplay] = useState(DEFAULT_CATALOGUE_DISPLAY)
  const categories = flattenCategories()

  const set = <K extends keyof typeof display>(key: K, value: (typeof display)[K]) =>
    setDisplay((d) => ({ ...d, [key]: value }))

  const toggleCategory = (id: string) =>
    set(
      'homepageCategoryIds',
      display.homepageCategoryIds.includes(id)
        ? display.homepageCategoryIds.filter((c) => c !== id)
        : [...display.homepageCategoryIds, id]
    )

  const chosen = display.homepageCategoryIds.length
  const tooMany = chosen > 10

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-4">
        <Panel
          title="Homepage categories"
          description="Six to ten works best. Everything else stays reachable behind “View all categories”."
        >
          <p className="mb-3 text-[13px] text-ink-500">
            {chosen} selected · your catalogue has {categories.length} categories and{' '}
            {TOTAL_STORE_PRODUCTS.toLocaleString('en-US')} products.
          </p>

          <div className="max-h-[320px] overflow-y-auto rounded-lg border p-3">
            {categories.map(({ node, depth }) => (
              <label
                key={node.id}
                className="flex items-center gap-2.5 py-1.5 text-[13px]"
                style={{ paddingLeft: depth * 18 }}
              >
                <Checkbox
                  checked={display.homepageCategoryIds.includes(node.id)}
                  onCheckedChange={() => toggleCategory(node.id)}
                />
                <span className={cn(depth === 0 && 'font-semibold')}>{node.label}</span>
                <span className="ml-auto text-[11px] text-ink-400">{node.count} products</span>
              </label>
            ))}
          </div>

          {tooMany && (
            <p className="mt-3 text-[12.5px] text-gold-700 dark:text-gold-300">
              {chosen} categories is a lot for one screen. Customers scan the first six or so — the rest is scrolling.
            </p>
          )}
        </Panel>

        <Panel title="Product sections" description="How many products each homepage section shows.">
          <div className="flex flex-wrap gap-2">
            {([4, 8, 12] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set('productsPerSection', n)}
                className={cn(
                  'rounded-lg border px-4 py-2.5 text-[14px] font-medium transition-colors',
                  display.productsPerSection === n
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950'
                    : 'hover:border-ink-400'
                )}
              >
                {n} products
              </button>
            ))}
          </div>

          <Label className="mb-2 mt-6 block text-[13px]">Default sort</Label>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(SORT_LABELS) as SortId[]).map((sort) => (
              <button
                key={sort}
                type="button"
                onClick={() => set('defaultSort', sort)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-[12.5px] transition-colors',
                  display.defaultSort === sort
                    ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950'
                    : 'hover:border-ink-400'
                )}
              >
                {SORT_LABELS[sort]}
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Storefront behaviour">
          <div className="divide-y">
            <Toggle
              label="Show out-of-stock products"
              body="Off hides them entirely. On shows them greyed, which helps if customers search for them."
              checked={display.showOutOfStock}
              onChange={(v) => set('showOutOfStock', v)}
            />
            <Toggle
              label="Show product counts"
              body="“Headphones · 82 products” on category cards."
              checked={display.showProductCount}
              onChange={(v) => set('showProductCount', v)}
            />
            <Toggle
              label="Show brands"
              body="Brand names on product cards and as a filter."
              checked={display.showBrands}
              onChange={(v) => set('showBrands', v)}
            />
            <Toggle
              label="Enable filters"
              body={`Category, brand, price, rating, availability, offers and colour.`}
              checked={display.enableFilters}
              onChange={(v) => set('enableFilters', v)}
            />
            <Toggle
              label="Enable search"
              body="Strongly recommended above a few hundred products."
              checked={display.enableSearch}
              onChange={(v) => set('enableSearch', v)}
            />
          </div>

          {!display.enableSearch && TOTAL_STORE_PRODUCTS > 500 && (
            <p className="mt-4 text-[12.5px] text-gold-700 dark:text-gold-300">
              With {TOTAL_STORE_PRODUCTS.toLocaleString('en-US')} products, turning search off leaves customers
              browsing category by category to find anything.
            </p>
          )}
        </Panel>
      </div>

      <div className="grid content-start gap-4">
        <Panel title="What this produces">
          <ol className="grid gap-2 text-[13px] text-ink-600 dark:text-ink-300">
            <li>1. Campaign hero, when a sale is live</li>
            <li>2. Search</li>
            <li>3. Shop by category — your {Math.min(chosen, 10)} chosen</li>
            <li>4. Campaign deals — {display.productsPerSection} products</li>
            <li>5. Best sellers — {display.productsPerSection} products</li>
            <li>6. Shop by budget</li>
            <li>7. New arrivals — {display.productsPerSection} products</li>
            <li>8. Help me choose</li>
            <li>9. Reviews and trust signals</li>
          </ol>
          <p className="mt-3 border-t pt-3 text-[12px] leading-relaxed text-ink-500">
            Never the whole catalogue. Customers reach the rest through categories, search and “View all products”.
          </p>
        </Panel>

        <Panel title="All products page">
          <p className="text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">
            Generated for you at <strong>/products</strong>, with{' '}
            {TOTAL_STORE_PRODUCTS.toLocaleString('en-US')} products, search, sorting and these filters:
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {STORE_FILTERS.map((filter) => (
              <span key={filter} className="rounded-full border px-2.5 py-1 text-[11.5px] text-ink-600 dark:text-ink-300">
                {filter}
              </span>
            ))}
          </div>
        </Panel>

        <Button onClick={() => toast.success('Catalogue display saved')}>Save changes</Button>
      </div>
    </div>
  )
}

function Toggle({
  label,
  body,
  checked,
  onChange,
}: {
  label: string
  body: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-ink-900 dark:text-white">{label}</p>
        <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">{body}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
