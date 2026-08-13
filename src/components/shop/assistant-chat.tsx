import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Camera, Check, CreditCard, Lock, MapPin, ShieldCheck, Sparkles, Star, ThumbsDown, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'

import { AdminLink } from '@/components/admin/admin-link'
import { ProductScene } from '@/components/marketing/scene'
import { Button } from '@/components/ui/button'
import { bestOfferFor, offerDiscount } from '@/data/offers'
import {
  comparisonRows,
  factsFor,
  findMatches,
  findSimilarToPhoto,
  pickWinner,
  searchProducts,
  type Match,
} from '@/data/discovery'
import { SHOP_PRODUCTS, type ShopProduct } from '@/data/shop'
import { useAccountStore } from '@/store/account-store'
import { useCartStore } from '@/store/cart-store'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   Conversational shopping.

   The assistant may search, compare, apply an offer, and assemble a complete
   order — but it never buys anything. Every purchase ends at a summary the
   shopper reads and a button they press, showing what, how much, where to
   and paid with which method. Card details never touch the conversation:
   payment happens in a separate sheet against a saved, tokenised method.
   ========================================================================== */

type Bubble =
  | { id: number; from: 'user'; text: string }
  | { id: number; from: 'bot'; text: string }
  | { id: number; from: 'bot'; text: string; matches: Match[]; rateable?: boolean }
  | { id: number; from: 'bot'; text: string; compare: ShopProduct[] }
  | { id: number; from: 'bot'; text: string; checkout: CheckoutDraft }
  | { id: number; from: 'bot'; text: string; placed: { orderId: string; total: number; product: ShopProduct } }

type CheckoutDraft = {
  product: ShopProduct
  qty: number
  offerCode?: string
  discount: number
  shipping: number
  total: number
  address: string
  payment: string
}

const SUGGESTIONS = [
  'Find a smartwatch under $150',
  "Show today's offers",
  'Show cheaper ones',
  'Compare the first two',
]

/** Omit over a union has to distribute, or every variant collapses to the first. */
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never

let bubbleId = 0
const next = () => ++bubbleId

export function AssistantChat({ onRequestPayment }: { onRequestPayment: (draft: CheckoutDraft) => void }) {
  const user = useAccountStore((s) => s.user)
  const add = useCartStore((s) => s.add)
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [results, setResults] = useState<ShopProduct[]>([])
  const scroller = useRef<HTMLDivElement>(null)

  const [bubbles, setBubbles] = useState<Bubble[]>(() => [
    {
      id: next(),
      from: 'bot',
      text: `Hi ${user?.firstName ?? 'there'} 👋 Tell me what you're after — a budget and roughly what it's for is plenty.`,
    },
  ])

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [bubbles, thinking])

  const say = (bubble: DistributiveOmit<Bubble, 'id'>) => setBubbles((b) => [...b, { ...bubble, id: next() } as Bubble])

  const send = (raw: string) => {
    const text = raw.trim()
    if (!text) return
    say({ from: 'user', text })
    setInput('')
    setThinking(true)
    // A beat of latency so replies read as answers rather than page updates.
    window.setTimeout(() => {
      setThinking(false)
      respond(text)
    }, 550)
  }

  /* ------------------------------------------------- the intent handling -- */
  const respond = (text: string) => {
    const q = text.toLowerCase()

    // "add the second one" / "add it to my cart"
    const ordinal = matchOrdinal(q)
    if (/\badd\b/.test(q) && (ordinal !== null || results.length === 1)) {
      const product = results[ordinal ?? 0]
      if (!product) return say({ from: 'bot', text: "I've lost track of which one — search again and I'll add it." })
      add(product.id, product.options[0]?.values[0]?.label ?? 'Default')
      return say({ from: 'bot', text: `Added ✓ ${product.name} — ${money(product.price)}. Your cart is updated.` })
    }

    // "buy it" / "buy the second one" — prepare, never purchase
    if (/\b(buy|order|checkout|purchase)\b/.test(q)) {
      const product = results[ordinal ?? 0]
      if (!product) return say({ from: 'bot', text: 'Which one? Search first and tell me the number.' })
      return say({ from: 'bot', text: 'Here it is before you pay:', checkout: draftFor(product) })
    }

    // "compare the first two"
    if (/\bcompare\b/.test(q)) {
      const picks = results.slice(0, 2)
      if (picks.length < 2) return say({ from: 'bot', text: "Find a couple of options first and I'll line them up." })
      return say({ from: 'bot', text: 'Side by side:', compare: picks })
    }

    // "any offers?"
    if (/\boffer|discount|coupon|deal|cheaper price\b/.test(q)) {
      const product = results[0]
      const subtotal = product?.price ?? 0
      const offer = bestOfferFor(subtotal, product?.category)
      if (!offer) {
        return say({
          from: 'bot',
          text: product
            ? `No offer applies to ${money(subtotal)} right now. I'll only tell you about one you can actually use.`
            : "Today there's 20% off selected electronics, $10 off orders above $60, and free delivery.",
        })
      }
      const off = offerDiscount(offer, subtotal)
      return say({
        from: 'bot',
        text: `Yes 🎉 ${offer.code ?? offer.headline} — ${offer.detail}. That takes ${money(off)} off, so ${money(
          subtotal
        )} becomes ${money(subtotal - off)}.`,
      })
    }

    // "show cheaper ones"
    if (/\bcheap|less|lower|under budget\b/.test(q) && results.length) {
      const ceiling = Math.min(...results.map((p) => p.price))
      const cheaper = SHOP_PRODUCTS.filter((p) => p.price < ceiling).sort((a, b) => a.price - b.price).slice(0, 3)
      if (!cheaper.length) return say({ from: 'bot', text: "Nothing cheaper than that in the catalogue — that's already the lowest." })
      setResults(cheaper)
      return say({
        from: 'bot',
        text: 'These come in lower:',
        matches: cheaper.map((product) => ({ product, reason: 'Cheaper option' })),
        rateable: true,
      })
    }

    // "only black" — a colour filter over the current results
    const colour = ['black', 'white', 'olive', 'titanium', 'blue'].find((c) => q.includes(c))
    if (colour && results.length) {
      const filtered = results.filter((p) =>
        p.options.some((o) => o.values.some((v) => v.label.toLowerCase().includes(colour)))
      )
      if (!filtered.length) return say({ from: 'bot', text: `None of those come in ${colour}. Want me to widen the search?` })
      setResults(filtered)
      return say({
        from: 'bot',
        text: `In ${colour}:`,
        matches: filtered.map((product) => ({ product, reason: `Available in ${colour}` })),
        rateable: true,
      })
    }

    // Otherwise: a search.
    const found = searchProducts(text, 3)
    const matches = found.length ? found : findMatches({ budget: String(budgetIn(q) ?? 'any') }, 3)
    setResults(matches.map((m) => m.product))

    if (!matches.length) {
      return say({ from: 'bot', text: "I couldn't find anything for that. Try naming the kind of product, or a budget." })
    }
    return say({
      from: 'bot',
      text: `I found ${matches.length} good ${matches.length === 1 ? 'option' : 'options'}.`,
      matches,
      rateable: true,
    })
  }

  /* ------------------------------------------------------- photo input -- */
  const attachPhoto = () => {
    say({ from: 'user', text: '📷 Photo uploaded' })
    setThinking(true)
    window.setTimeout(() => {
      setThinking(false)
      const matches = findSimilarToPhoto(3)
      setResults(matches.map((m) => m.product))
      say({ from: 'bot', text: 'Here is what looks closest to your photo:', matches, rateable: true })
    }, 1100)
  }

  const draftFor = (product: ShopProduct): CheckoutDraft => {
    const offer = bestOfferFor(product.price, product.category)
    const discount = offer ? offerDiscount(offer, product.price) : 0
    const shipping = product.price - discount >= 99 ? 0 : 5
    return {
      product,
      qty: 1,
      offerCode: offer?.code ?? offer?.headline,
      discount,
      shipping,
      total: product.price - discount + shipping,
      address: 'Home — 1204 Oberoi Springs, Mumbai 400053',
      payment: 'Visa •••• 4242',
    }
  }

  return (
    <div className="flex h-[min(640px,78vh)] flex-col">
      <div ref={scroller} className="flex-1 space-y-3.5 overflow-y-auto p-5">
        {bubbles.map((bubble) => (
          <BubbleView
            key={bubble.id}
            bubble={bubble}
            onAsk={send}
            onPay={onRequestPayment}
            onAdd={(product) => {
              add(product.id, product.options[0]?.values[0]?.label ?? 'Default')
              toast.success('Added to cart', { description: product.name })
            }}
          />
        ))}

        {thinking && (
          <span className="flex w-fit gap-1 rounded-2xl bg-muted px-3.5 py-3" aria-label="Thinking">
            {[0, 1, 2].map((i) => (
              <span key={i} className="size-1.5 animate-bounce rounded-full bg-ink-400" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </span>
        )}
      </div>

      {/* Suggestions keep people from facing an empty box. */}
      <div className="flex flex-wrap gap-1.5 border-t px-5 pt-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            className="rounded-full border px-2.5 py-1 text-[11px] font-medium text-ink-600 transition-colors hover:border-ink-400 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
          >
            {s}
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
        <div className="flex min-w-0 flex-1 items-center rounded-full border bg-background pr-1 focus-within:border-brand-500">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for anything…"
            aria-label="Message the shopping assistant"
            className="h-11 min-w-0 flex-1 bg-transparent px-4 text-[14px] outline-none"
          />
          <button
            type="button"
            onClick={attachPhoto}
            aria-label="Search with a photo"
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-muted hover:text-ink-900 dark:hover:text-white"
          >
            <Camera className="size-[18px]" />
          </button>
        </div>
        <Button type="submit" size="icon" className="size-11 shrink-0 rounded-full" disabled={!input.trim()} aria-label="Send">
          <ArrowUp className="size-4" />
        </Button>
      </form>
    </div>
  )
}

/* ----------------------------------------------------------- one message -- */
function BubbleView({
  bubble,
  onAsk,
  onAdd,
  onPay,
}: {
  bubble: Bubble
  onAsk: (text: string) => void
  onAdd: (product: ShopProduct) => void
  onPay: (draft: CheckoutDraft) => void
}) {
  if (bubble.from === 'user') {
    return (
      <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2.5 text-[14px] text-white">
        {bubble.text}
      </p>
    )
  }

  return (
    <div className="max-w-[92%] space-y-2.5">
      <p className="w-fit rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5 text-[14px] text-ink-800 dark:text-ink-100">
        {bubble.text}
      </p>

      {'matches' in bubble && (
        <>
          <ul className="grid gap-2">
            {bubble.matches.map(({ product, reason }, i) => (
              <li key={product.id} className="flex gap-3 rounded-xl border bg-card p-2.5">
                <ProductScene glyph={product.glyph} tone={product.tone} className="size-16 shrink-0 rounded-lg" grain={false} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-400">Option {i + 1}</p>
                  <p className="line-clamp-1 text-[13px] font-semibold text-ink-900 dark:text-white">{product.name}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[12px]">
                    <span className="font-bold tabular text-ink-950 dark:text-white">{money(product.price)}</span>
                    <Star className="size-3 fill-gold-400 text-gold-400" />
                    <span className="tabular text-ink-500">{product.rating}</span>
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-teal-700 dark:text-teal-100">{reason}</p>
                </div>
                <div className="flex shrink-0 flex-col justify-center gap-1.5">
                  <Button size="sm" variant="outline" className="h-7 px-2.5 text-[11px]" asChild>
                    <AdminLink to={`/product/${product.id}`}>View</AdminLink>
                  </Button>
                  <Button size="sm" className="h-7 px-2.5 text-[11px]" onClick={() => onAdd(product)}>
                    Add
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {bubble.rateable && <Helpful />}
        </>
      )}

      {'compare' in bubble && <CompareTable products={bubble.compare} onAdd={onAdd} />}

      {'checkout' in bubble && <CheckoutCard draft={bubble.checkout} onPay={onPay} />}

      {'placed' in bubble && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-600/40 dark:bg-teal-600/10">
          <p className="text-[15px] font-semibold text-teal-900 dark:text-teal-100">🎉 Order placed</p>
          <dl className="mt-2.5 grid gap-1 text-[12px] text-ink-700 dark:text-ink-200">
            <div className="flex justify-between gap-3">
              <dt>Order</dt>
              <dd className="font-semibold tabular">{bubble.placed.orderId}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Paid</dt>
              <dd className="font-semibold tabular">{money(bubble.placed.total)}</dd>
            </div>
          </dl>
          <div className="mt-3.5 flex flex-wrap gap-2">
            <Button size="sm" asChild>
              <AdminLink to="/account/orders">Track order</AdminLink>
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAsk('Show me something else')}>
              Keep shopping
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- compare ---- */
function CompareTable({ products, onAdd }: { products: ShopProduct[]; onAdd: (p: ShopProduct) => void }) {
  const rows = comparisonRows(products)
  const winner = pickWinner(products)

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <table className="w-full text-left text-[12px]">
        <thead className="bg-muted/60">
          <tr>
            <th className="px-3 py-2 font-semibold text-ink-500"> </th>
            {products.map((p) => (
              <th key={p.id} className="px-3 py-2 font-semibold text-ink-900 dark:text-white">
                <span className="line-clamp-2">{p.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-t">
              <th className="px-3 py-2 text-left font-medium text-ink-500">{row.label}</th>
              {row.values.map((value, i) => (
                <td key={i} className="px-3 py-2 tabular text-ink-800 dark:text-ink-100">
                  {value}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t">
            <th className="px-3 py-2" />
            {products.map((p) => (
              <td key={p.id} className="px-3 py-2">
                <Button size="sm" className="h-7 px-2.5 text-[11px]" onClick={() => onAdd(p)}>
                  Add to cart
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      {winner && (
        <p className="flex items-start gap-2 border-t bg-muted/40 px-3 py-2.5 text-[12px] text-ink-700 dark:text-ink-200">
          <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand-600 dark:text-brand-300" />
          <span>
            <strong className="text-ink-900 dark:text-white">Our pick: {winner.product.name}.</strong> {winner.reason}
          </span>
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------- checkout --- */
/**
 * The confirmation step. Everything the shopper is agreeing to is on screen —
 * product, price, address, payment method — and nothing is charged until they
 * press the button.
 */
function CheckoutCard({ draft, onPay }: { draft: CheckoutDraft; onPay: (draft: CheckoutDraft) => void }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-[13px] font-semibold text-ink-900 dark:text-white">Ready to order</p>

      <div className="mt-3 flex gap-3">
        <ProductScene glyph={draft.product.glyph} tone={draft.product.tone} className="size-14 shrink-0 rounded-lg" grain={false} />
        <div className="min-w-0">
          <p className="line-clamp-1 text-[13px] font-semibold text-ink-900 dark:text-white">{draft.product.name}</p>
          <p className="text-[12px] text-ink-500">Quantity {draft.qty}</p>
        </div>
      </div>

      <dl className="mt-3.5 grid gap-1.5 border-t pt-3 text-[12px]">
        <Row label="Product" value={money(draft.product.price)} />
        {draft.discount > 0 && <Row label={`Offer ${draft.offerCode ?? ''}`.trim()} value={`− ${money(draft.discount)}`} good />}
        <Row label="Delivery" value={draft.shipping === 0 ? 'Free' : money(draft.shipping)} />
        <div className="mt-1 flex items-baseline justify-between gap-3 border-t pt-2">
          <dt className="text-[13px] font-semibold text-ink-900 dark:text-white">Total</dt>
          <dd className="text-[15px] font-bold tabular text-ink-950 dark:text-white">{money(draft.total)}</dd>
        </div>
      </dl>

      <ul className="mt-3.5 grid gap-1.5 border-t pt-3 text-[12px] text-ink-600 dark:text-ink-300">
        <li className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-400" />
          {draft.address}
        </li>
        <li className="flex items-center gap-2">
          <CreditCard className="size-3.5 shrink-0 text-ink-400" />
          {draft.payment}
        </li>
      </ul>

      <Button className="mt-4 w-full" onClick={() => onPay(draft)}>
        <Lock className="size-4" />
        Pay {money(draft.total)}
      </Button>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" className="h-7 text-[11px]" asChild>
          <AdminLink to="/account/addresses">Change address</AdminLink>
        </Button>
        <Button variant="ghost" size="sm" className="h-7 text-[11px]" asChild>
          <AdminLink to="/account/profile">Change payment</AdminLink>
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-ink-600 dark:text-ink-300">{label}</dt>
      <dd className={cn('font-semibold tabular', good ? 'text-teal-600 dark:text-teal-100' : 'text-ink-900 dark:text-white')}>
        {value}
      </dd>
    </div>
  )
}

/* ------------------------------------------------------------- feedback --- */
function Helpful() {
  const [given, setGiven] = useState<'up' | 'down' | null>(null)
  const [why, setWhy] = useState<string | null>(null)

  if (given === 'up') return <p className="text-[11px] text-ink-500">Thanks — noted.</p>

  if (given === 'down') {
    return (
      <div className="rounded-xl border p-3">
        <p className="text-[12px] font-medium text-ink-700 dark:text-ink-200">What was off?</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {['Too expensive', 'Wrong style', 'Wrong brand', 'Wrong features', 'Not relevant'].map((reason) => (
            <button
              key={reason}
              type="button"
              onClick={() => setWhy(reason)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
                why === reason
                  ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
                  : 'text-ink-600 hover:border-ink-400 dark:text-ink-300'
              )}
            >
              {reason}
            </button>
          ))}
        </div>
        {why && <p className="mt-2 text-[11px] text-ink-500">Thanks — I'll weight that next time.</p>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] text-ink-500">Useful?</span>
      <button type="button" onClick={() => setGiven('up')} aria-label="These suggestions were useful" className="rounded-full border p-1.5 hover:border-teal-400">
        <ThumbsUp className="size-3.5 text-ink-500" />
      </button>
      <button type="button" onClick={() => setGiven('down')} aria-label="These suggestions were not useful" className="rounded-full border p-1.5 hover:border-gold-400">
        <ThumbsDown className="size-3.5 text-ink-500" />
      </button>
    </div>
  )
}

/* -------------------------------------------------------- payment sheet --- */
/**
 * Deliberately separate from the conversation. Card details are never typed
 * into chat — this shows the saved, tokenised method and hands off to the
 * payment provider.
 */
export function PaymentSheet({
  draft,
  onDone,
  onCancel,
}: {
  draft: CheckoutDraft
  onDone: (orderId: string) => void
  onCancel: () => void
}) {
  const [state, setState] = useState<'ready' | 'authorising'>('ready')

  const pay = () => {
    setState('authorising')
    window.setTimeout(() => onDone(`SH-1${Math.floor(Date.now() % 100000)}`), 1400)
  }

  return (
    <div className="p-6">
      <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-teal-700 dark:text-teal-100">
        <ShieldCheck className="size-3.5" />
        Secure payment
      </p>
      <p className="mt-2 text-[21px] font-bold tracking-[-0.02em] text-ink-950 dark:text-white">{money(draft.total)}</p>
      <p className="mt-1 text-[13px] text-ink-500">{draft.product.name}</p>

      <div className="mt-5 rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-md bg-muted">
            <CreditCard className="size-4 text-ink-500" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-ink-900 dark:text-white">{draft.payment}</span>
            <span className="block text-[11px] text-ink-500">Saved card · expires 08/29</span>
          </span>
          <Check className="size-4 text-teal-500" />
        </div>
      </div>

      <p className="mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-ink-500">
        <Lock className="mt-0.5 size-3 shrink-0" />
        Handled by our payment provider. SafalMarketHub never sees your card number, and card details are never typed
        into chat.
      </p>

      <Button className="mt-5 w-full" size="lg" disabled={state === 'authorising'} onClick={pay}>
        {state === 'authorising' ? 'Authorising…' : `Confirm and pay ${money(draft.total)}`}
      </Button>
      <Button variant="ghost" className="mt-2 w-full" disabled={state === 'authorising'} onClick={onCancel}>
        Cancel
      </Button>
    </div>
  )
}

export type { CheckoutDraft }

/* --------------------------------------------------------------- parsing -- */
function matchOrdinal(q: string): number | null {
  if (/\b(first|1st|one|option 1)\b/.test(q)) return 0
  if (/\b(second|2nd|two|option 2)\b/.test(q)) return 1
  if (/\b(third|3rd|three|option 3)\b/.test(q)) return 2
  return null
}

function budgetIn(q: string): number | null {
  const m = q.match(/(?:under|below|less than|upto|up to)\s*\$?\s*(\d+)/)
  return m ? Number(m[1]) : null
}

/** Exposed for the quick-action buttons on the shopping home. */
export function useAssistantSuggestions() {
  return useMemo(() => SUGGESTIONS, [])
}

export { factsFor }
