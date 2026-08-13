import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { PackageSearch, SlidersHorizontal, X } from 'lucide-react'

import { adminLinkProps, useAdminSearch } from '@/components/admin/admin-link'
import { EmptyState } from '@/components/admin/primitives'
import { Breadcrumbs, ShopProductCard } from '@/components/shop/shop-bits'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { SHOP_CATEGORIES, SHOP_PRODUCTS } from '@/data/shop'
import { cn, money } from '@/lib/utils'

const SORTS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'newest', label: 'Newest' },
]

const PRICE_BANDS = [
  { id: 'under-25', label: 'Under $25', test: (p: number) => p < 25 },
  { id: '25-50', label: '$25 – $50', test: (p: number) => p >= 25 && p <= 50 },
  { id: '50-100', label: '$50 – $100', test: (p: number) => p > 50 && p <= 100 },
  { id: 'above-100', label: 'Above $100', test: (p: number) => p > 100 },
]

/** Category listing and search results share one screen — the filters differ only by what's preset. */
export function ShopListingPage() {
  const search = useAdminSearch()
  const navigate = useNavigate()

  const query = search.q ?? ''
  const category = search.category ?? ''
  const sub = search.sub ?? ''
  const leaf = search.leaf ?? ''
  const sort = search.sort ?? 'relevance'
  const brand = search.brand ?? ''
  const price = search.price ?? ''
  const inStockOnly = search.stock === 'in'

  function setParam(key: string, value: string) {
    const next = { ...search, [key]: value }
    if (!value) delete next[key]
    navigate(adminLinkProps({ to: '/shop/all', search: next }))
  }

  const brands = useMemo(() => [...new Set(SHOP_PRODUCTS.map((p) => p.brand))].sort(), [])

  const results = useMemo(() => {
    let out = SHOP_PRODUCTS.filter((p) => {
      const haystack = `${p.name} ${p.brand} ${p.category} ${p.categoryPath.join(' ')} ${p.shortDescription}`.toLowerCase()
      if (query && !haystack.includes(query.toLowerCase())) return false
      if (category && p.category !== category) return false
      if (sub && !p.categoryPath.includes(sub)) return false
      if (leaf && !p.categoryPath.includes(leaf)) return false
      if (brand && p.brand !== brand) return false
      if (inStockOnly && p.stock === 0) return false
      if (price) {
        const band = PRICE_BANDS.find((b) => b.id === price)
        if (band && !band.test(p.price)) return false
      }
      return true
    })

    if (sort === 'price-asc') out = [...out].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') out = [...out].sort((a, b) => b.price - a.price)
    if (sort === 'newest') out = [...out].reverse()
    return out
  }, [query, category, sub, leaf, brand, price, inStockOnly, sort])

  const activeChips = [
    category && { key: 'category', label: category },
    sub && { key: 'sub', label: sub },
    leaf && { key: 'leaf', label: leaf },
    brand && { key: 'brand', label: brand },
    price && { key: 'price', label: PRICE_BANDS.find((b) => b.id === price)?.label ?? price },
    inStockOnly && { key: 'stock', label: 'In stock only' },
  ].filter(Boolean) as { key: string; label: string }[]

  const trail = [
    { label: 'Home', to: '/shop' },
    ...(category ? [{ label: category, to: '/shop/all', search: { category } }] : []),
    ...(sub ? [{ label: sub, to: '/shop/all', search: { category, sub } }] : []),
    ...(leaf ? [{ label: leaf }] : []),
    ...(!category && query ? [{ label: `Search: ${query}` }] : []),
    ...(!category && !query ? [{ label: 'All products' }] : []),
  ]

  const filters = (
    <FilterPanel
      brands={brands}
      brand={brand}
      price={price}
      inStockOnly={inStockOnly}
      category={category}
      onChange={setParam}
    />
  )

  return (
    <>
      <Breadcrumbs trail={trail} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-[28px]">
            {query ? <>Search results for “{query}”</> : leaf || sub || category || 'All products'}
          </h1>
          <p className="mt-1.5 text-[14px] text-ink-600 dark:text-ink-300">
            {results.length} {results.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile filter drawer */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <SlidersHorizontal className="size-4" />
                Filters
                {activeChips.length > 0 && (
                  <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">{activeChips.length}</span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto p-5">
              <SheetTitle className="mb-4 text-base">Filters</SheetTitle>
              {filters}
            </SheetContent>
          </Sheet>

          <Select value={sort} onValueChange={(v) => setParam('sort', v === 'relevance' ? '' : v)}>
            <SelectTrigger size="sm" className="w-[190px] text-[13px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setParam(chip.key, '')}
              className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-[12px] font-semibold text-ink-700 transition-colors hover:border-ink-400 dark:text-ink-200"
            >
              {chip.label}
              <X className="size-3 text-ink-400" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => navigate(adminLinkProps({ to: '/shop/all', search: query ? { q: query } : undefined }))}
            className="text-[12px] font-semibold text-brand-600 hover:underline dark:text-brand-300"
          >
            Clear all
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[236px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">{filters}</div>
        </aside>

        <div>
          {results.length === 0 ? (
            <div className="rounded-lg border bg-card shadow-xs">
              <EmptyState
                icon={PackageSearch}
                title="No products found"
                body={
                  query
                    ? `We couldn't find anything matching “${query}”. Try a different spelling or fewer filters.`
                    : 'No product matches these filters. Try widening your price range.'
                }
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(adminLinkProps({ to: '/shop/all' }))}
                  >
                    Clear filters
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
              {results.map((product) => (
                <ShopProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function FilterPanel({
  brands,
  brand,
  price,
  inStockOnly,
  category,
  onChange,
}: {
  brands: string[]
  brand: string
  price: string
  inStockOnly: boolean
  category: string
  onChange: (key: string, value: string) => void
}) {
  const [openGroups, setOpenGroups] = useState({ category: true, brand: true, price: true, availability: true })

  return (
    <div className="grid gap-4">
      <FilterGroup
        title="Category"
        open={openGroups.category}
        onToggle={() => setOpenGroups((g) => ({ ...g, category: !g.category }))}
      >
        <ul className="grid gap-1.5">
          {SHOP_CATEGORIES.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onChange('category', category === cat.label ? '' : cat.label)}
                className={cn(
                  'flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-[13px] transition-colors',
                  category === cat.label
                    ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                    : 'text-ink-700 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-secondary'
                )}
              >
                {cat.label}
                <span className="text-[11px] text-ink-400 tabular">{cat.count.toLocaleString('en-US')}</span>
              </button>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Brand" open={openGroups.brand} onToggle={() => setOpenGroups((g) => ({ ...g, brand: !g.brand }))}>
        <ul className="grid gap-2">
          {brands.map((b) => (
            <li key={b}>
              <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-700 dark:text-ink-300">
                <Checkbox checked={brand === b} onCheckedChange={(c) => onChange('brand', c ? b : '')} />
                {b}
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Price" open={openGroups.price} onToggle={() => setOpenGroups((g) => ({ ...g, price: !g.price }))}>
        <ul className="grid gap-2">
          {PRICE_BANDS.map((band) => (
            <li key={band.id}>
              <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-700 dark:text-ink-300">
                <Checkbox checked={price === band.id} onCheckedChange={(c) => onChange('price', c ? band.id : '')} />
                {band.label}
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup
        title="Availability"
        open={openGroups.availability}
        onToggle={() => setOpenGroups((g) => ({ ...g, availability: !g.availability }))}
      >
        <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-700 dark:text-ink-300">
          <Checkbox checked={inStockOnly} onCheckedChange={(c) => onChange('stock', c ? 'in' : '')} />
          In stock only
        </label>
      </FilterGroup>

      <p className="rounded-sm border bg-muted/50 px-3 py-2.5 text-[11px] leading-relaxed text-ink-500">
        Prices shown include taxes. Delivery is calculated at checkout from your PIN code.
        <span className="mt-1 block tabular">Free delivery on orders above {money(99)}.</span>
      </p>
    </div>
  )
}

function FilterGroup({
  title,
  open,
  onToggle,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border bg-card p-4">
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center justify-between gap-2">
        <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-ink-500">{title}</span>
        <span aria-hidden className="text-ink-400">
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="mt-3.5">{children}</div>}
    </section>
  )
}
