import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Camera, Search, Sparkles } from 'lucide-react'

import { adminLinkProps } from '@/components/admin/admin-link'
import { ProductScene } from '@/components/marketing/scene'
import { useAssistant } from '@/components/shop/assistant'
import { Button } from '@/components/ui/button'
import { SEARCH_EXAMPLES } from '@/data/discovery'
import { SHOP_PRODUCTS } from '@/data/shop'
import { useAccountStore } from '@/store/account-store'
import { cn, money } from '@/lib/utils'

/**
 * The hero has one job: make it obvious there are three ways to find things —
 * type it, show a photo, or be asked. Everything else on the page is browsing.
 */
export function ShopHero() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const assistant = useAssistant()
  const user = useAccountStore((s) => s.user)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    assistant.open('search', query.trim())
  }

  return (
    <section className="relative overflow-hidden border-b">
      {/* Soft colour wash — no stock photography, no hero carousel. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 size-[560px] rounded-full bg-brand-200/40 blur-3xl dark:bg-brand-900/25" />
        <div className="absolute -right-32 top-10 size-[460px] rounded-full bg-teal-200/35 blur-3xl dark:bg-teal-900/20" />
        <div className="absolute bottom-[-220px] left-1/3 size-[420px] rounded-full bg-gold-200/30 blur-3xl dark:bg-gold-900/15" />
      </div>

      <div className="container-wide relative py-16 sm:py-24">
        <div className="mx-auto max-w-[760px] text-center">
          <h1 className="text-[38px] leading-[1.04] tracking-[-0.035em] sm:text-[60px]">
            {user ? (
              <>
                Hi {user.firstName} 👋
                <span className="mt-2 block text-[26px] tracking-[-0.02em] text-ink-600 sm:text-[34px] dark:text-ink-300">
                  What are you looking for today?
                </span>
              </>
            ) : (
              <>Find it. Love it. Buy it.</>
            )}
          </h1>

          {!user && (
            <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-relaxed text-ink-600 sm:text-[19px] dark:text-ink-300">
              Search for what you need, or let SafalMarketHub help you choose.
            </p>
          )}

          {/* The oversized search box is the centre of gravity for the page. */}
          <form onSubmit={submit} className="mx-auto mt-9 max-w-[680px]">
            <div className="group relative flex items-center gap-2 rounded-2xl border-2 bg-card p-2 shadow-lg transition-[border-color,box-shadow] focus-within:border-brand-500 focus-within:shadow-xl sm:rounded-full sm:pl-6">
              <Search className="hidden size-5 shrink-0 text-ink-400 sm:block" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What are you looking for?"
                aria-label="Search for anything"
                className="min-w-0 flex-1 bg-transparent px-3 py-3 text-[16px] outline-none placeholder:text-ink-400 sm:px-0 sm:text-[17px]"
              />

              <span className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => assistant.open('photo')}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-2.5 text-[13px] font-semibold text-ink-600 transition-colors hover:bg-muted dark:text-ink-300"
                >
                  <Camera className="size-4" />
                  <span className="hidden sm:inline">Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => assistant.open('guide')}
                  className="inline-flex items-center gap-1.5 rounded-full bg-ink-950 px-3.5 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-ink-800 dark:bg-white dark:text-ink-950 dark:hover:bg-ink-100"
                >
                  <Sparkles className="size-4" />
                  <span className="hidden sm:inline">Help me choose</span>
                </button>
              </span>
            </div>
          </form>

          {/* Examples teach the search box what it accepts. */}
          <ul className="mx-auto mt-5 flex flex-wrap justify-center gap-2">
            {SEARCH_EXAMPLES.map((example) => (
              <li key={example}>
                <button
                  type="button"
                  onClick={() => {
                    setQuery(example)
                    assistant.open('search', example)
                  }}
                  className="rounded-full border bg-card/70 px-3.5 py-1.5 text-[13px] text-ink-600 backdrop-blur transition-colors hover:border-ink-400 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
                >
                  “{example}”
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Button size="lg" onClick={() => navigate(adminLinkProps({ to: '/shop/all' }))}>
              Explore products
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* A quiet strip of real products, so the page shows rather than tells. */}
        <ul className="mx-auto mt-14 grid max-w-[900px] grid-cols-3 gap-3 sm:grid-cols-6">
          {SHOP_PRODUCTS.slice(0, 6).map((product, i) => (
            <li key={product.id} className={cn(i > 3 && 'hidden sm:block')}>
              <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
                <ProductScene glyph={product.glyph} tone={product.tone} className="aspect-square" grain={false} />
              </div>
              <p className="mt-1.5 truncate text-center text-[11px] font-semibold tabular text-ink-500">
                {money(product.price)}
              </p>
            </li>
          ))}
        </ul>

        {/* Name the three ways in. This is the whole differentiator, so it
            should be legible in the first screen rather than discovered. */}
        <ul className="mx-auto mt-12 grid max-w-[860px] gap-3 sm:grid-cols-3">
          {[
            { icon: Search, title: 'Search normally', body: 'Type it the way you’d say it.', action: () => navigate(adminLinkProps({ to: '/shop/all' })) },
            { icon: Camera, title: 'Search with a photo', body: 'Seen it somewhere? Show us.', action: () => assistant.open('photo') },
            { icon: Sparkles, title: 'Help me choose', body: 'Two questions, a few good options.', action: () => assistant.open('guide') },
          ].map((item) => (
            <li key={item.title}>
              <button
                type="button"
                onClick={item.action}
                className="flex h-full w-full items-start gap-3 rounded-2xl border bg-card/80 p-4 text-left shadow-xs backdrop-blur transition-[transform,box-shadow,border-color] hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                  <item.icon className="size-4.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-ink-900 dark:text-white">{item.title}</span>
                  <span className="block text-[12px] leading-relaxed text-ink-500">{item.body}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
