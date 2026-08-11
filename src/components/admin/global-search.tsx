import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Banknote, CreditCard, Package, Search, ShoppingBag, Store, Users } from 'lucide-react'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ADMIN_ORDERS, ADMIN_PRODUCTS, BUYERS, SELLERS, SETTLEMENTS, TRANSACTIONS } from '@/data/admin'
import { adminLinkProps } from '@/components/admin/admin-link'
import { cn } from '@/lib/utils'

type Hit = { group: string; icon: typeof Store; label: string; meta: string; to: string }

function buildIndex(): Hit[] {
  return [
    ...SELLERS.map((s) => ({ group: 'Sellers', icon: Store, label: s.storeName, meta: `${s.id} · ${s.status}`, to: `/admin/sellers/${s.id}` })),
    ...BUYERS.map((b) => ({ group: 'Buyers', icon: Users, label: b.name, meta: `${b.id} · ${b.email}`, to: `/admin/buyers` })),
    ...ADMIN_ORDERS.map((o) => ({ group: 'Orders', icon: ShoppingBag, label: o.id, meta: `${o.buyer} · ${o.fulfilment}`, to: `/admin/orders/${o.id}` })),
    ...ADMIN_PRODUCTS.map((p) => ({ group: 'Products', icon: Package, label: p.name, meta: `${p.id} · ${p.seller}`, to: `/admin/products/${p.id}` })),
    ...TRANSACTIONS.map((t) => ({ group: 'Payments', icon: CreditCard, label: t.id, meta: `${t.order} · ${t.status}`, to: `/admin/payments` })),
    ...SETTLEMENTS.map((s) => ({ group: 'Settlements', icon: Banknote, label: s.id, meta: `${s.seller} · ${s.status}`, to: `/admin/settlements/${s.id}` })),
  ]
}

/**
 * Global lookup (spec §74) — one field across sellers, buyers, orders,
 * products, payments and settlements. Searching an order id jumps straight to
 * the order.
 */
export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const index = useMemo(buildIndex, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return index.filter((h) => `${h.label} ${h.meta}`.toLowerCase().includes(q)).slice(0, 12)
  }, [index, query])

  const grouped = useMemo(() => {
    const map = new Map<string, Hit[]>()
    for (const hit of results) map.set(hit.group, [...(map.get(hit.group) ?? []), hit])
    return [...map.entries()]
  }, [results])

  function go(to: string) {
    onOpenChange(false)
    setQuery('')
    navigate(adminLinkProps({ to }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="top-[12%] max-w-[560px] translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Global search</DialogTitle>
        <DialogDescription className="sr-only">
          Search sellers, buyers, orders, products, payments and settlements.
        </DialogDescription>

        <div className="flex items-center gap-3 border-b px-4">
          <Search className="size-[18px] shrink-0 text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search seller, buyer, order, product, payment or settlement…"
            className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-ink-400"
          />
          <kbd className="hidden shrink-0 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-ink-500 sm:block">
            ESC
          </kbd>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-2">
          {!query && (
            <div className="px-3 py-6 text-center">
              <p className="text-sm text-ink-500">Try an order id like SH-100482, a seller name, or a settlement id.</p>
            </div>
          )}
          {query && results.length === 0 && (
            <div className="px-3 py-6 text-center">
              <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">No matches</p>
              <p className="mt-1 text-sm text-ink-500">Check the reference and try again.</p>
            </div>
          )}
          {grouped.map(([group, hits]) => (
            <div key={group} className="mb-1">
              <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">{group}</p>
              {hits.map((hit) => (
                <button
                  key={`${hit.group}-${hit.label}-${hit.meta}`}
                  type="button"
                  onClick={() => go(hit.to)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-colors hover:bg-accent'
                  )}
                >
                  <hit.icon className="size-4 shrink-0 text-ink-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink-900 dark:text-white">
                      {hit.label}
                    </span>
                    <span className="block truncate text-[11px] text-ink-500">{hit.meta}</span>
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
