import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import {
  ArrowUp,
  BarChart3,
  Boxes,
  Check,
  MessageSquare,
  Package,
  Plus,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  Wallet,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SELLER_PRODUCTS, type SellerProduct } from '@/data/seller'
import {
  businessSnapshot,
  marginAt,
  priceInsightFor,
  REVIEW_SUMMARIES,
  slowestSeller,
  suggestedActions,
  topSellers,
} from '@/data/seller-assistant'
import { usePlan } from '@/store/storefront-store'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   Safal Assistant — the seller's side panel.

   It reads freely: sales, orders, stock, reviews, settlements, pricing.
   It changes nothing without a preview and a confirm — stock edits, price
   changes and new products all stop at a review card first, because these
   are expensive things to get wrong.

   It also never invents product facts. Asked for "Sony headphones" with no
   model, it asks which model rather than inventing specifications.
   ========================================================================== */

type Ctx = { open: (prompt?: string) => void; close: () => void; isOpen: boolean }
const AssistantCtx = createContext<Ctx | null>(null)

export function useSellerAssistant() {
  const ctx = useContext(AssistantCtx)
  if (!ctx) throw new Error('useSellerAssistant must be used inside <SellerAssistantProvider>')
  return ctx
}

export function SellerAssistantProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [seed, setSeed] = useState<string | undefined>()

  const open = useCallback((prompt?: string) => {
    setSeed(prompt)
    setIsOpen(true)
  }, [])
  const close = useCallback(() => setIsOpen(false), [])
  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen])

  return (
    <AssistantCtx.Provider value={value}>
      {children}
      <AssistantFab />
      {isOpen && <AssistantPanel seed={seed} onClose={close} />}
    </AssistantCtx.Provider>
  )
}

function AssistantFab() {
  const { open, isOpen } = useSellerAssistant()
  if (isOpen) return null

  return (
    <button
      type="button"
      onClick={() => open()}
      className="fixed bottom-20 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-ink-950 py-3 pl-4 pr-5 text-[14px] font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 sm:bottom-[76px] sm:right-7 dark:bg-white dark:text-ink-950"
    >
      <Sparkles className="size-4" />
      Safal Assistant
    </button>
  )
}

/* --------------------------------------------- quick actions, by context -- */
type QuickAction = { label: string; prompt: string; icon: typeof Plus }

function quickActionsFor(pathname: string): QuickAction[] {
  if (pathname.startsWith('/seller/products'))
    return [
      { label: 'Add product', prompt: 'Add a product', icon: Plus },
      { label: 'Bulk upload', prompt: 'I want to upload products from Excel', icon: Package },
      { label: 'Help me price', prompt: 'What price should I keep for my headphones?', icon: BarChart3 },
      { label: 'Needs attention', prompt: 'Which products need changes?', icon: TriangleAlert },
    ]
  if (pathname.startsWith('/seller/inventory'))
    return [
      { label: 'Low stock', prompt: 'Which products are running low on stock?', icon: Boxes },
      { label: 'Update stock', prompt: 'Set headphones stock to 25', icon: Plus },
      { label: 'Out of stock', prompt: 'What is out of stock?', icon: TriangleAlert },
    ]
  if (pathname.startsWith('/seller/orders'))
    return [
      { label: 'New orders', prompt: "Show today's new orders", icon: Package },
      { label: 'To ship', prompt: 'Which orders need shipping?', icon: Package },
      { label: 'Sales today', prompt: 'How much did I sell today?', icon: BarChart3 },
    ]
  if (pathname.startsWith('/seller/transactions') || pathname.startsWith('/seller/settlements'))
    return [
      { label: 'Next settlement', prompt: 'How much money am I getting this week?', icon: Wallet },
      { label: 'Deductions', prompt: 'What deductions were taken?', icon: BarChart3 },
    ]

  return [
    { label: 'Check sales', prompt: 'How are my sales this month?', icon: BarChart3 },
    { label: "Today's orders", prompt: "Show today's new orders", icon: Package },
    { label: 'Low stock', prompt: 'Which products are running low on stock?', icon: Boxes },
    { label: 'Add product', prompt: 'Add a product', icon: Plus },
    { label: 'Check reviews', prompt: 'What are customers saying about my headphones?', icon: Star },
    { label: 'Earnings', prompt: 'How much money am I getting this week?', icon: Wallet },
  ]
}

/* ------------------------------------------------------------- the panel -- */
type Msg =
  | { id: number; from: 'seller'; text: string }
  | { id: number; from: 'bot'; text: string; node?: React.ReactNode; rateable?: boolean }

/** Omit over a union has to distribute, or the variants collapse. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

let msgId = 0
const nextId = () => ++msgId

function AssistantPanel({ seed, onClose }: { seed?: string; onClose: () => void }) {
  const location = useLocation()
  const plan = usePlan()
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)
  const [messages, setMessages] = useState<Msg[]>([
    { id: nextId(), from: 'bot', text: 'Hi! What would you like to do with your store today?' },
  ])

  const actions = quickActionsFor(location.pathname)

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [messages, thinking])

  // Lets the dev state-preview pill move out from under the panel.
  useEffect(() => {
    document.body.dataset.assistantOpen = 'true'
    return () => {
      delete document.body.dataset.assistantOpen
    }
  }, [])

  const say = (msg: DistributiveOmit<Msg, 'id'>) => setMessages((m) => [...m, { ...msg, id: nextId() } as Msg])

  const send = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    say({ from: 'seller', text })
    setInput('')
    setThinking(true)
    window.setTimeout(() => {
      setThinking(false)
      answer(text)
    }, 520)
  }

  // Fire the seeded prompt once, after mount.
  const seeded = useRef(false)
  useEffect(() => {
    if (seed && !seeded.current) {
      seeded.current = true
      send(seed)
    }
  }, [seed])

  /* ------------------------------------------------------ what it answers -- */
  const answer = (text: string) => {
    const q = text.toLowerCase()
    const snapshot = businessSnapshot()
    const product = findProduct(q)

    // ---- add a product, conversationally
    if (/\badd (a )?(new )?product|create a product|list a product\b/.test(q)) {
      return say({ from: 'bot', text: "Let's add it. Describe it in one line — name, price and stock is enough.", node: <AddProductFlow /> })
    }

    // ---- bulk upload
    if (/\bexcel|bulk|csv|spreadsheet\b/.test(q)) {
      return say({
        from: 'bot',
        text: 'Upload your product file and I will check it before anything is imported.',
        node: (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <AdminLink to="/seller/products/import">Open bulk upload</AdminLink>
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.success('Template downloaded', { description: 'safalmarkethub-products.xlsx' })}>
              Download template
            </Button>
          </div>
        ),
      })
    }

    // ---- pricing help
    if (/\bprice|pricing|overpriced|cheaper than|competitor\b/.test(q)) {
      const target = product ?? topSellers(1)[0]
      const insight = priceInsightFor(target)
      if (!insight) {
        return say({
          from: 'bot',
          text: `No other seller is listing ${target.name} on SafalMarketHub right now, so there's nothing to compare it against.`,
        })
      }
      return say({
        from: 'bot',
        text: `Most sellers price ${target.name} between ${money(insight.low)} and ${money(insight.high)}. ${insight.verdict}`,
        node: <PriceCheck product={target} commission={plan.commission} />,
        rateable: true,
      })
    }

    // ---- stock update, with a preview
    const stockUpdate = parseStockUpdate(q)
    if (stockUpdate.length) {
      return say({ from: 'bot', text: 'Here is what that would change:', node: <StockPreview updates={stockUpdate} /> })
    }

    // ---- low stock / out of stock
    if (/\blow (on )?stock|running low|almost out|out of stock\b/.test(q)) {
      const list = q.includes('out of stock') ? snapshot.outOfStock : snapshot.lowStock
      if (!list.length) return say({ from: 'bot', text: 'Nothing needs restocking right now.' })
      return say({
        from: 'bot',
        text: `${list.length} product${list.length === 1 ? '' : 's'} need${list.length === 1 ? 's' : ''} attention.`,
        node: (
          <>
            <StockTable products={list} />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <AdminLink to="/seller/inventory">Open inventory</AdminLink>
              </Button>
            </div>
          </>
        ),
      })
    }

    // ---- reviews
    if (/\breview|customers say|complain|feedback\b/.test(q)) {
      const target = product ?? topSellers(1)[0]
      const summary = REVIEW_SUMMARIES[target.id]
      if (!summary) return say({ from: 'bot', text: `${target.name} has no reviews yet.` })
      return say({ from: 'bot', text: `Here's the picture for ${target.name}.`, node: <ReviewSummaryCard name={target.name} summary={summary} />, rateable: true })
    }

    // ---- product performance
    if (product && /\bhow (is|are)|performance|doing\b/.test(q)) {
      return say({ from: 'bot', text: `${product.name} over the last 30 days:`, node: <ProductPerformance product={product} /> })
    }

    // ---- orders
    if (/\border|to ship|packed|dispatch\b/.test(q)) {
      const pending = snapshot.pending.slice(0, 5)
      if (!pending.length) return say({ from: 'bot', text: 'No orders are waiting — everything is dispatched.' })
      return say({
        from: 'bot',
        text: `You have ${snapshot.pending.length} order${snapshot.pending.length === 1 ? '' : 's'} waiting.`,
        node: (
          <>
            <ul className="grid gap-1.5">
              {pending.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-[12px]">
                  <span className="min-w-0 truncate font-semibold tabular">{order.id}</span>
                  <span className="shrink-0 text-ink-500">{order.status}</span>
                  <span className="shrink-0 font-semibold tabular">{money(order.productValue)}</span>
                </li>
              ))}
            </ul>
            <Button size="sm" variant="outline" className="mt-3" asChild>
              <AdminLink to="/seller/orders">Open orders</AdminLink>
            </Button>
          </>
        ),
      })
    }

    // ---- settlements
    if (/\bsettlement|payout|getting paid|money.*(week|coming)|earnings\b/.test(q)) {
      return say({ from: 'bot', text: 'Your next settlement:', node: <SettlementCard /> })
    }

    // ---- sales
    if (/\bsale|revenue|sold|selling|best|top|slow\b/.test(q)) {
      const top = topSellers(3)
      const slow = slowestSeller()
      return say({
        from: 'bot',
        text: `You've sold ${snapshot.sold} units recently, worth ${money(snapshot.gross)}.`,
        node: (
          <>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Best sellers</p>
            <ol className="grid gap-1.5">
              {top.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-[12px]">
                  <span className="min-w-0 truncate">
                    <span className="mr-2 font-bold tabular text-ink-400">{i + 1}</span>
                    {p.name}
                  </span>
                  <span className="shrink-0 font-semibold tabular">{p.sold} sold</span>
                </li>
              ))}
            </ol>
            {slow && (
              <p className="mt-2.5 text-[12px] text-ink-500">
                Slowest right now: <strong className="text-ink-800 dark:text-ink-100">{slow.name}</strong> ({slow.sold} sold).
              </p>
            )}
          </>
        ),
        rateable: true,
      })
    }

    // ---- suggestions
    if (/\bsuggest|what should i|advice|improve\b/.test(q)) {
      const suggestions = suggestedActions()
      return say({
        from: 'bot',
        text: 'Based on your own numbers:',
        node: (
          <ul className="grid gap-2">
            {suggestions.map((s) => (
              <li key={s.title} className="rounded-lg border p-3">
                <p className="text-[12px] font-semibold text-ink-900 dark:text-white">{s.title}</p>
                <p className="mt-0.5 text-[11px] text-ink-500">{s.body}</p>
                <Button size="sm" variant="ghost" className="mt-1.5 h-7 px-2 text-[11px]" asChild>
                  <AdminLink to={s.to}>Open</AdminLink>
                </Button>
              </li>
            ))}
          </ul>
        ),
      })
    }

    return say({
      from: 'bot',
      text: "I can help with sales, orders, stock, reviews, pricing, settlements, and adding products. Try one of the buttons below.",
    })
  }

  return (
    <>
      {/* Dimmed, but the dashboard stays visible behind the panel. */}
      <div className="fixed inset-0 z-[125] bg-ink-950/20 backdrop-blur-[1px] lg:hidden" onClick={onClose} aria-hidden />

      <aside
        className="fixed inset-y-0 right-0 z-[130] flex w-full max-w-[420px] flex-col border-l bg-background shadow-2xl"
        aria-label="Safal Assistant"
      >
        <header className="flex items-center gap-3 border-b px-5 py-4">
          <span className="grid size-8 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            <Sparkles className="size-4" />
          </span>
          <p className="min-w-0 flex-1 text-[15px] font-semibold">Safal Assistant</p>
          <Button variant="ghost" size="icon" aria-label="Close assistant" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </header>

        <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto p-5">
          {messages.map((msg) =>
            msg.from === 'seller' ? (
              <p key={msg.id} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2.5 text-[13px] text-white">
                {msg.text}
              </p>
            ) : (
              <div key={msg.id} className="max-w-[95%] space-y-2">
                <p className="w-fit rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-[13px] text-ink-800 dark:text-ink-100">
                  {msg.text}
                </p>
                {msg.node}
                {msg.rateable && <Helpful />}
              </div>
            )
          )}

          {thinking && (
            <span className="flex w-fit gap-1 rounded-2xl bg-muted px-3 py-2.5" aria-label="Thinking">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-1.5 animate-bounce rounded-full bg-ink-400" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </span>
          )}
        </div>

        {/* Quick actions follow the page the seller is on. */}
        <div className="flex flex-wrap gap-1.5 border-t px-5 pt-3">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => send(action.prompt)}
              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium text-ink-600 transition-colors hover:border-ink-400 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
            >
              <action.icon className="size-3" />
              {action.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            send(input)
          }}
          className="flex items-center gap-2 p-5 pt-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your store..."
            aria-label="Ask the Safal Assistant"
            className="h-10 min-w-0 flex-1 rounded-full border bg-background px-4 text-[13px] outline-none focus:border-brand-500"
          />
          <Button type="submit" size="icon" className="size-10 shrink-0 rounded-full" disabled={!input.trim()} aria-label="Send">
            <ArrowUp className="size-4" />
          </Button>
        </form>
      </aside>
    </>
  )
}

/* ------------------------------------------------------------- price check */
export function PriceCheck({ product, commission }: { product: SellerProduct; commission: number }) {
  const insight = priceInsightFor(product)
  const [chosen, setChosen] = useState<number | null>(null)
  const [applied, setApplied] = useState(false)

  if (!insight) return null
  const preview = chosen ?? product.price
  const margin = marginAt(product, preview, commission)

  return (
    <div className="rounded-xl border bg-card p-3.5">
      <table className="w-full text-left text-[12px]">
        <tbody>
          {[
            ['Lowest listing', money(insight.low)],
            ['Average', money(insight.average)],
            ['Highest', money(insight.high)],
            ['Your price', money(insight.yourPrice)],
          ].map(([label, value]) => (
            <tr key={label} className="border-b last:border-0">
              <td className="py-1.5 text-ink-500">{label}</td>
              <td className="py-1.5 text-right font-semibold tabular">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Other sellers</p>
      <ul className="mt-1.5 grid gap-1">
        {insight.listings.map((listing) => (
          <li
            key={listing.seller}
            className={cn(
              'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[12px]',
              listing.isYou && 'bg-brand-50 font-semibold dark:bg-brand-950'
            )}
          >
            <span className="min-w-0 truncate">{listing.seller}</span>
            <span className="flex shrink-0 items-center gap-2 tabular text-ink-500">
              <span>{listing.deliveryDays}</span>
              <span className="flex items-center gap-0.5">
                <Star className="size-3 fill-gold-400 text-gold-400" />
                {listing.rating}
              </span>
              <span className="font-semibold text-ink-900 dark:text-white">{money(listing.price)}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-ink-400">
        Public listing details only. We never show another seller's costs or margins.
      </p>

      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Choose a price</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {insight.suggestions.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setChosen(s.price)}
            className={cn(
              'rounded-lg border px-2.5 py-1.5 text-left transition-colors',
              preview === s.price ? 'border-brand-600 bg-brand-50 dark:bg-brand-950' : 'hover:border-ink-400'
            )}
          >
            <span className="block text-[12px] font-bold tabular">{money(s.price)}</span>
            <span className="block text-[10px] text-ink-500">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Margin is shown before any cut, not after. */}
      <dl className="mt-3 grid gap-1 border-t pt-2.5 text-[11px]">
        <Row label="Cost price" value={money(margin.cost)} />
        <Row label="Selling price" value={money(preview)} />
        <Row label={`SafalMarketHub fee (${commission}%)`} value={`− ${money(margin.fee)}`} />
        <Row label="Estimated earnings" value={money(margin.earnings)} strong />
        <Row label="Estimated margin" value={`${margin.marginPercent}%`} />
      </dl>

      {margin.thin && (
        <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-gold-50 p-2 text-[11px] text-gold-800 dark:bg-gold-950/40 dark:text-gold-200">
          <TriangleAlert className="mt-0.5 size-3 shrink-0" />
          At {money(preview)} your earnings would be very thin after fees.
        </p>
      )}

      {chosen !== null && chosen !== product.price && !applied && (
        <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50/60 p-2.5 dark:border-brand-800 dark:bg-brand-950/40">
          <p className="text-[12px] font-semibold text-ink-900 dark:text-white">
            Change {product.name} from {money(product.price)} to {money(chosen)}?
          </p>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              className="h-7 px-2.5 text-[11px]"
              onClick={() => {
                setApplied(true)
                toast.success('Price updated', { description: `${product.name} — ${money(chosen)}` })
              }}
            >
              Confirm change
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px]" onClick={() => setChosen(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {applied && (
        <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-teal-700 dark:text-teal-100">
          <Check className="size-3.5" />
          Price updated to {money(preview)}.
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ stock ------ */
function StockTable({ products }: { products: SellerProduct[] }) {
  return (
    <ul className="grid gap-1.5">
      {products.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-[12px]">
          <span className="min-w-0 truncate">{p.name}</span>
          <span className={cn('shrink-0 font-bold tabular', p.available === 0 ? 'text-red-600 dark:text-red-300' : 'text-gold-600 dark:text-gold-400')}>
            {p.available} left
          </span>
        </li>
      ))}
    </ul>
  )
}

function StockPreview({ updates }: { updates: { product: SellerProduct; to: number }[] }) {
  const [done, setDone] = useState(false)

  return (
    <div className="rounded-xl border bg-card p-3.5">
      <p className="text-[12px] font-semibold text-ink-900 dark:text-white">Review inventory changes</p>
      <table className="mt-2 w-full text-left text-[12px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.08em] text-ink-400">
            <th className="pb-1">Product</th>
            <th className="pb-1 text-right">Current</th>
            <th className="pb-1 text-right">New</th>
          </tr>
        </thead>
        <tbody>
          {updates.map(({ product, to }) => (
            <tr key={product.id} className="border-t">
              <td className="max-w-[160px] truncate py-1.5">{product.name}</td>
              <td className="py-1.5 text-right tabular text-ink-500">{product.available}</td>
              <td className="py-1.5 text-right font-bold tabular">{to}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {done ? (
        <p className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-teal-700 dark:text-teal-100">
          <Check className="size-3.5" />
          Inventory updated.
        </p>
      ) : (
        <div className="mt-3 flex gap-2">
          <Button
            size="sm"
            className="h-7 px-2.5 text-[11px]"
            onClick={() => {
              setDone(true)
              toast.success(`Stock updated for ${updates.length} product${updates.length === 1 ? '' : 's'}`)
            }}
          >
            Confirm {updates.length > 1 ? 'all' : 'update'}
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px]" asChild>
            <AdminLink to="/seller/inventory">Edit in inventory</AdminLink>
          </Button>
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------- add a product -- */
/**
 * Fills what the seller actually said and asks for the rest. It never
 * invents a model number, warranty or specification.
 */
function AddProductFlow() {
  const [draft, setDraft] = useState({ name: '', price: '', mrp: '', stock: '', category: 'Electronics → Audio' })
  const [saved, setSaved] = useState(false)

  const missing = [
    !draft.name && 'a name',
    !draft.price && 'a selling price',
    !draft.stock && 'stock',
  ].filter(Boolean) as string[]

  if (saved) {
    return (
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-3.5 dark:border-teal-600/40 dark:bg-teal-600/10">
        <p className="text-[12px] font-semibold text-teal-900 dark:text-teal-100">Saved as a draft</p>
        <p className="mt-1 text-[11px] text-ink-600 dark:text-ink-300">
          {draft.name} is in your products as a draft. Submit it when you're ready for review.
        </p>
        <Button size="sm" className="mt-2 h-7 px-2.5 text-[11px]" asChild>
          <AdminLink to="/seller/products">Open products</AdminLink>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-card p-3.5">
      <div className="grid gap-2">
        {[
          { key: 'name' as const, label: 'Product name', placeholder: 'Canvas Travel Backpack 45L' },
          { key: 'price' as const, label: 'Selling price', placeholder: '29' },
          { key: 'mrp' as const, label: 'MRP', placeholder: '39' },
          { key: 'stock' as const, label: 'Stock', placeholder: '40' },
        ].map((field) => (
          <label key={field.key} className="grid gap-1">
            <span className="text-[11px] font-medium text-ink-500">{field.label}</span>
            <Input
              value={draft[field.key]}
              placeholder={field.placeholder}
              onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
              className="h-8 text-[12px]"
            />
          </label>
        ))}
        <p className="text-[11px] text-ink-500">
          Category suggestion: <strong className="text-ink-800 dark:text-ink-100">{draft.category}</strong>
        </p>
      </div>

      {/* Facts we do not have, we ask for — we don't fill them in. */}
      {missing.length > 0 && (
        <p className="mt-2.5 text-[11px] text-gold-700 dark:text-gold-300">
          Still need {missing.join(', ')}. I won't guess these.
        </p>
      )}

      <div className="mt-3 border-t pt-2.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Preview</p>
        <p className="mt-1 text-[13px] font-semibold text-ink-900 dark:text-white">{draft.name || 'Untitled product'}</p>
        <p className="text-[11px] text-ink-500">
          {draft.category} · MRP {draft.mrp ? money(Number(draft.mrp)) : '—'} · Price{' '}
          {draft.price ? money(Number(draft.price)) : '—'} · Stock {draft.stock || '—'}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          className="h-7 px-2.5 text-[11px]"
          disabled={missing.length > 0}
          onClick={() => {
            setSaved(true)
            toast.success('Product saved as draft', { description: draft.name })
          }}
        >
          Save product
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px]" asChild>
          <AdminLink to="/seller/products/new">Open full form</AdminLink>
        </Button>
      </div>
    </div>
  )
}

/* --------------------------------------------------------- other cards --- */
function ReviewSummaryCard({ name, summary }: { name: string; summary: (typeof REVIEW_SUMMARIES)[string] }) {
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900 dark:text-white">
        <Star className="size-3.5 fill-gold-400 text-gold-400" />
        {summary.rating} · {summary.count} ratings
      </p>

      <p className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-teal-700 dark:text-teal-100">Customers like</p>
      <ul className="mt-1 grid gap-0.5">
        {summary.likes.map((like) => (
          <li key={like} className="text-[12px] text-ink-700 dark:text-ink-200">· {like}</li>
        ))}
      </ul>

      <p className="mt-2.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gold-700 dark:text-gold-300">Customers dislike</p>
      <ul className="mt-1 grid gap-0.5">
        {summary.dislikes.map((dislike) => (
          <li key={dislike} className="text-[12px] text-ink-700 dark:text-ink-200">· {dislike}</li>
        ))}
      </ul>

      {summary.trend && (
        <p className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-gold-50 p-2 text-[11px] text-gold-800 dark:bg-gold-950/40 dark:text-gold-200">
          <TriangleAlert className="mt-0.5 size-3 shrink-0" />
          {summary.trend}
        </p>
      )}

      <p className="mt-2 text-[10px] text-ink-400">Summarised from {summary.count} reviews of {name}.</p>
    </div>
  )
}

function ProductPerformance({ product }: { product: SellerProduct }) {
  const summary = REVIEW_SUMMARIES[product.id]
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <dl className="grid grid-cols-2 gap-2.5">
        {[
          ['Sold', `${product.sold} units`],
          ['Revenue', money(product.sold * product.price)],
          ['Stock', `${product.available} left`],
          ['Rating', summary ? `${summary.rating} ★` : '—'],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-[10px] font-bold uppercase tracking-[0.08em] text-ink-400">{label}</dt>
            <dd className="mt-0.5 text-[14px] font-bold tabular text-ink-950 dark:text-white">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-3 flex flex-wrap gap-2 border-t pt-2.5">
        <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px]" asChild>
          <AdminLink to={`/seller/products/${product.id}`}>Update product</AdminLink>
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2.5 text-[11px]" asChild>
          <AdminLink to="/seller/inventory">Update stock</AdminLink>
        </Button>
      </div>
    </div>
  )
}

function SettlementCard() {
  const { settlementDue } = businessSnapshot()
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <p className="text-[22px] font-bold leading-none tabular text-ink-950 dark:text-white">{money(settlementDue)}</p>
      <p className="mt-1 text-[11px] text-ink-500">Expected 18 Aug</p>
      <Button size="sm" variant="outline" className="mt-3 h-7 px-2.5 text-[11px]" asChild>
        <AdminLink to="/seller/settlements">View settlements</AdminLink>
      </Button>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-500">{label}</dt>
      <dd className={cn('tabular', strong ? 'font-bold text-ink-950 dark:text-white' : 'font-semibold')}>{value}</dd>
    </div>
  )
}

function Helpful() {
  const [given, setGiven] = useState<'up' | 'down' | null>(null)
  if (given === 'up') return <p className="text-[11px] text-ink-500">Thanks.</p>
  if (given === 'down')
    return (
      <div className="flex flex-wrap gap-1.5">
        {['Incorrect information', "Didn't understand me", 'Wrong product', "Couldn't complete action"].map((reason) => (
          <button
            key={reason}
            type="button"
            onClick={() => toast.success('Thanks — noted')}
            className="rounded-full border px-2 py-0.5 text-[10px] text-ink-600 hover:border-ink-400 dark:text-ink-300"
          >
            {reason}
          </button>
        ))}
      </div>
    )

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-ink-500">Did this help?</span>
      <button type="button" onClick={() => setGiven('up')} aria-label="This helped" className="rounded-full border p-1 hover:border-teal-400">
        <ThumbsUp className="size-3 text-ink-500" />
      </button>
      <button type="button" onClick={() => setGiven('down')} aria-label="This did not help" className="rounded-full border p-1 hover:border-gold-400">
        <ThumbsDown className="size-3 text-ink-500" />
      </button>
    </div>
  )
}

/* --------------------------------------------------------------- parsing -- */
function findProduct(q: string): SellerProduct | undefined {
  return SELLER_PRODUCTS.find((p) =>
    p.name
      .toLowerCase()
      .split(/[\s—-]+/)
      .filter((w) => w.length > 4)
      .some((word) => q.includes(word))
  )
}

/** "set headphones to 25, backpacks to 30" → one preview row per product. */
function parseStockUpdate(q: string) {
  if (!/\bset|update|make|change\b/.test(q) || !/\bstock|inventory|units|to \d+\b/.test(q)) return []

  const updates: { product: SellerProduct; to: number }[] = []
  for (const match of q.matchAll(/([a-z\s]+?)\s+(?:stock\s+)?to\s+(\d+)/g)) {
    const product = findProduct(match[1].trim())
    if (product && !updates.some((u) => u.product.id === product.id)) {
      updates.push({ product, to: Number(match[2]) })
    }
  }
  return updates
}

export { MessageSquare }
