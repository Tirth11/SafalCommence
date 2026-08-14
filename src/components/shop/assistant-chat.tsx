import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Camera, Check, CreditCard, Lock, MapPin, Mic, ShieldCheck, Sparkles, Star, ThumbsDown, ThumbsUp } from 'lucide-react'
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
import { CUSTOMER_ORDERS, SHOP_PRODUCTS, type Shipment, type ShopProduct } from '@/data/shop'
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
  | { id: number; from: 'bot'; text: string; offer: OfferInsight }
  | { id: number; from: 'bot'; text: string; reviews: ReviewIntel }
  | { id: number; from: 'bot'; text: string; returnHelp: ReturnHelp }
  | { id: number; from: 'bot'; text: string; vault: VaultItem[] }
  | { id: number; from: 'bot'; text: string; preferences: PreferencePreview }
  | { id: number; from: 'bot'; text: string; voice: VoicePreview }
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

type OfferInsight = {
  product?: ShopProduct
  headline: string
  detail: string
  discount: number
  subtotal: number
  delivery: number
  total: number
}

type ReviewIntel = {
  product: ShopProduct
  likes: string[]
  concerns: string[]
  bestFor: string
}

type ReturnHelp = {
  orderId: string
  placedOn: string
  status: string
  seller: string
  item: Shipment['items'][number]
  estimate: string
  issue: string
  returnableUntil?: string
}

type VaultItem = {
  orderId: string
  purchased: string
  seller: string
  item: Shipment['items'][number]
  status: string
  paymentMethod: string
  warranty: string
  returnableUntil?: string
}

type PreferencePreview = {
  size: string
  colour: string
  address: string
  budget: string
  payment: string
  bestOffer: boolean
  priceDrops: boolean
}

type VoicePreview = {
  examples: string[]
}

const SUGGESTIONS = [
  'Find headphones under $80 for travel',
  'Upload photo to match a product',
  'Compare the first two',
  'I received the wrong colour',
  'Show my purchase vault',
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
      text: `Hi ${user?.firstName ?? 'there'} 👋 I can search by words or photo, compare options, find offers, prepare checkout, and help with orders. What are you shopping for today?`,
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

    if (/\b(photo|image|screenshot|picture|similar|match a product)\b/.test(q)) {
      const matches = photoMatches(3)
      setResults(matches.map((m) => m.product))
      return say({
        from: 'bot',
        text: 'Photo search is ready. I matched this like a product screenshot:',
        matches,
        rateable: true,
      })
    }

    if (/\b(voice|speak|mic|microphone|hindi|multilingual|language)\b/.test(q)) {
      return say({
        from: 'bot',
        text: 'Voice shopping can understand natural requests before turning them into product matches.',
        voice: voicePreview(),
      })
    }

    if (isMultilingualQuery(q)) {
      const cap = budgetIn(q)
      const wantsFitness = /\b(run|running|shoe|shoes|fitness)\b/.test(q)
      const matches = wantsFitness
        ? findMatches({ category: 'Sports', budget: cap ? String(cap) : 'any', priority: 'value' }, 3)
        : searchProducts(normaliseShoppingQuery(text), 3)
      setResults(matches.map((m) => m.product))
      if (matches.length) {
        return say({
          from: 'bot',
          text: wantsFitness
            ? `I understood that as fitness shopping${cap ? ` under ${money(cap)}` : ''}. Shoes are not in this demo catalogue yet, so here is the closest SafalHub stock.`
            : 'I understood the mixed-language request and found these:',
          matches,
          rateable: true,
        })
      }
    }

    if (/\b(wrong|damaged|broken|return|replace|refund|support|problem|colour|color)\b/.test(q) && /\b(order|received|return|replace|refund|support|problem|wrong|damaged|colour|color)\b/.test(q)) {
      return say({
        from: 'bot',
        text: 'I found the order most likely connected to that issue. Pick the next step — nothing is submitted until you confirm it.',
        returnHelp: returnHelpFor(q),
      })
    }

    if (/\b(purchase vault|my purchases|warranty|invoice|return window|buy again|bought items?)\b/.test(q)) {
      return say({
        from: 'bot',
        text: 'Here is your purchase vault — orders, invoices, warranty and return windows in one place.',
        vault: purchaseVault(),
      })
    }

    if (/\b(review|reviews|buyers saying|customers saying|people say|feedback|concerns|best for)\b/.test(q)) {
      const product = resolveProductFromContext(q, results)
      setResults([product])
      return say({
        from: 'bot',
        text: `Here is the review summary for ${product.name}:`,
        reviews: reviewIntelFor(product),
      })
    }

    if (/\b(preference|preferences|usual size|preferred colour|preferred color|price-drop|price drop|always look for best offer)\b/.test(q)) {
      return say({
        from: 'bot',
        text: 'These preferences let SafalAssistant ask fewer questions while staying editable by the customer.',
        preferences: preferencePreview(),
      })
    }

    if (/\b(passkey|fingerprint|face id|device pin|login)\b/.test(q)) {
      return say({
        from: 'bot',
        text: 'SafalHub can keep login simple with passkeys: continue using fingerprint, Face ID, or device PIN instead of repeated password resets.',
      })
    }

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
      const product = results[0] ?? productFromText(q)
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
      const delivery = subtotal - off >= 99 ? 0 : 5
      return say({
        from: 'bot',
        text: product ? 'Best eligible offer found before checkout:' : 'Best offer available right now:',
        offer: {
          product,
          headline: offer.code ?? offer.headline,
          detail: offer.detail,
          discount: off,
          subtotal,
          delivery,
          total: subtotal - off + delivery,
        },
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
      const matches = photoMatches(3)
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
            aria-label="Message SafalAssistant"
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
          <button
            type="button"
            onClick={() => send('Voice shopping')}
            aria-label="Use voice shopping"
            className="grid size-9 shrink-0 place-items-center rounded-full text-ink-500 transition-colors hover:bg-muted hover:text-ink-900 dark:hover:text-white"
          >
            <Mic className="size-[17px]" />
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

      {'offer' in bubble && <OfferFinderCard insight={bubble.offer} />}

      {'reviews' in bubble && <ReviewSummaryCard intel={bubble.reviews} onAsk={onAsk} />}

      {'returnHelp' in bubble && <ReturnHelpCard help={bubble.returnHelp} />}

      {'vault' in bubble && <PurchaseVaultCard items={bubble.vault} />}

      {'preferences' in bubble && <PreferenceCard preferences={bubble.preferences} />}

      {'voice' in bubble && <VoiceShoppingCard preview={bubble.voice} onAsk={onAsk} />}

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

/* ---------------------------------------------------------- smart offer --- */
function OfferFinderCard({ insight }: { insight: OfferInsight }) {
  const label = insight.product ? insight.product.name : 'Eligible cart'

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-[13px] font-semibold text-ink-900 dark:text-white">Smart offer finder</p>
      <p className="mt-1 text-[12px] text-ink-500">SafalAssistant only shows offers this item actually qualifies for.</p>

      {insight.product && (
        <div className="mt-3 flex gap-3">
          <ProductScene glyph={insight.product.glyph} tone={insight.product.tone} className="size-14 shrink-0 rounded-lg" grain={false} />
          <div className="min-w-0">
            <p className="line-clamp-1 text-[13px] font-semibold text-ink-900 dark:text-white">{label}</p>
            <p className="text-[12px] text-ink-500">{insight.product.seller}</p>
          </div>
        </div>
      )}

      <dl className="mt-3.5 grid gap-1.5 border-t pt-3 text-[12px]">
        <Row label="Product price" value={money(insight.subtotal)} />
        <Row label={`Offer ${insight.headline}`} value={`− ${money(insight.discount)}`} good />
        <Row label="Delivery" value={insight.delivery === 0 ? 'Free' : money(insight.delivery)} />
        <div className="mt-1 flex items-baseline justify-between gap-3 border-t pt-2">
          <dt className="text-[13px] font-semibold text-ink-900 dark:text-white">Final pay</dt>
          <dd className="text-[15px] font-bold tabular text-ink-950 dark:text-white">{money(insight.total)}</dd>
        </div>
      </dl>

      <p className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-[12px] font-medium text-teal-800 dark:bg-teal-600/15 dark:text-teal-100">
        {insight.detail}
      </p>
    </div>
  )
}

/* ------------------------------------------------------- review summary --- */
function ReviewSummaryCard({ intel, onAsk }: { intel: ReviewIntel; onAsk: (text: string) => void }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex gap-3">
        <ProductScene glyph={intel.product.glyph} tone={intel.product.tone} className="size-14 shrink-0 rounded-lg" grain={false} />
        <div className="min-w-0">
          <p className="line-clamp-1 text-[13px] font-semibold text-ink-900 dark:text-white">{intel.product.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-ink-500">
            <Star className="size-3 fill-gold-400 text-gold-400" />
            <span className="font-semibold tabular text-ink-700 dark:text-ink-300">{intel.product.rating}</span>
            <span aria-hidden>·</span>
            <span>{intel.product.reviews} reviews</span>
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 rounded-xl bg-muted/50 p-3 text-[12px]">
        <section>
          <p className="font-semibold text-ink-900 dark:text-white">What buyers are saying</p>
          <ul className="mt-1.5 grid gap-1 text-ink-600 dark:text-ink-300">
            {intel.likes.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>

        <section>
          <p className="font-semibold text-ink-900 dark:text-white">Common concerns</p>
          <ul className="mt-1.5 grid gap-1 text-ink-600 dark:text-ink-300">
            {intel.concerns.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-[12px] font-medium text-brand-800 dark:bg-brand-600/15 dark:text-brand-100">
        Best for: {intel.bestFor}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="h-8 text-[12px]" onClick={() => onAsk('Compare the first two')}>
          Compare for me
        </Button>
        <Button size="sm" className="h-8 text-[12px]" onClick={() => onAsk('Find best offer')}>
          Find best offer
        </Button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- returns --- */
function ReturnHelpCard({ help }: { help: ReturnHelp }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-[13px] font-semibold text-ink-900 dark:text-white">Smart order assistant</p>
      <p className="mt-1 text-[12px] text-ink-500">
        {help.orderId} · Purchased {help.placedOn} · {help.status} · {help.estimate}
      </p>

      <div className="mt-3 flex gap-3 rounded-xl bg-muted/50 p-3">
        <ProductScene glyph={help.item.glyph} tone={help.item.tone} className="size-14 shrink-0 rounded-lg" grain={false} />
        <div className="min-w-0">
          <p className="line-clamp-1 text-[13px] font-semibold text-ink-900 dark:text-white">{help.item.name}</p>
          <p className="mt-0.5 text-[12px] text-ink-500">
            {help.item.variant} · Sold by {help.seller}
          </p>
          <p className="mt-1 text-[12px] font-medium text-ink-700 dark:text-ink-200">Issue: {help.issue}</p>
        </div>
      </div>

      <p className="mt-3 text-[12px] text-ink-600 dark:text-ink-300">
        {help.returnableUntil
          ? `Return available until ${help.returnableUntil}.`
          : 'This item may need support review before a return can be started.'}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" className="h-8 text-[12px]" asChild>
          <AdminLink to={`/account/orders/${help.orderId}`} search={{ action: 'return' }}>
            Replace product
          </AdminLink>
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-[12px]" asChild>
          <AdminLink to="/account/returns">Return product</AdminLink>
        </Button>
        <Button size="sm" variant="ghost" className="h-8 text-[12px]" asChild>
          <AdminLink to="/account/support" search={{ view: 'new', order: help.orderId, topic: 'Return / Refund' }}>
            Talk to support
          </AdminLink>
        </Button>
      </div>
    </div>
  )
}

/* --------------------------------------------------------- purchase vault -- */
function PurchaseVaultCard({ items }: { items: VaultItem[] }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-[13px] font-semibold text-ink-900 dark:text-white">Purchase & warranty vault</p>
      <p className="mt-1 text-[12px] text-ink-500">Everything the customer needs after buying, without digging through email.</p>

      <ul className="mt-3 grid gap-2.5">
        {items.map((entry) => (
          <li key={`${entry.orderId}-${entry.item.productId}`} className="rounded-xl border p-3">
            <div className="flex gap-3">
              <ProductScene glyph={entry.item.glyph} tone={entry.item.tone} className="size-14 shrink-0 rounded-lg" grain={false} />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-[13px] font-semibold text-ink-900 dark:text-white">{entry.item.name}</p>
                <p className="mt-0.5 text-[12px] text-ink-500">
                  {entry.orderId} · Purchased {entry.purchased}
                </p>
              </div>
            </div>

            <dl className="mt-3 grid gap-1 text-[12px] text-ink-600 dark:text-ink-300">
              <Row label="Status" value={entry.status} />
              <Row label="Payment" value={entry.paymentMethod} />
              <Row label="Seller" value={entry.seller} />
              <Row label="Warranty" value={entry.warranty} />
              <Row label="Return eligible until" value={entry.returnableUntil ?? 'Window closed'} />
            </dl>

            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-8 text-[12px]" asChild>
                <AdminLink to={`/account/orders/${entry.orderId}`}>View invoice</AdminLink>
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-[12px]" asChild>
                <AdminLink to="/account/support" search={{ view: 'new', order: entry.orderId, topic: 'My Order' }}>
                  Get support
                </AdminLink>
              </Button>
              <Button size="sm" className="h-8 text-[12px]" asChild>
                <AdminLink to={`/product/${entry.item.productId}`}>Buy again</AdminLink>
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <Button variant="ghost" size="sm" className="mt-3 h-8 text-[12px]" asChild>
        <AdminLink to="/account/orders">View all purchases</AdminLink>
      </Button>
    </div>
  )
}

/* ---------------------------------------------------------- preferences --- */
function PreferenceCard({ preferences }: { preferences: PreferencePreview }) {
  const rows = [
    ['Usual size', preferences.size],
    ['Preferred colour', preferences.colour],
    ['Default address', preferences.address],
    ['Budget preference', preferences.budget],
    ['Preferred payment', preferences.payment],
    ['Always look for best offer', preferences.bestOffer ? 'On' : 'Off'],
    ['Price-drop alerts', preferences.priceDrops ? 'On' : 'Off'],
  ]

  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-[13px] font-semibold text-ink-900 dark:text-white">My shopping preferences</p>
      <p className="mt-1 text-[12px] text-ink-500">SafalAssistant can remember these only if the customer can edit or remove them.</p>

      <dl className="mt-3 grid gap-1.5 text-[12px]">
        {rows.map(([label, value]) => (
          <Row key={label} label={label} value={value} />
        ))}
      </dl>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" className="h-8 text-[12px]" asChild>
          <AdminLink to="/account/shopping">Manage preferences</AdminLink>
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-[12px]" asChild>
          <AdminLink to="/account/profile">Security settings</AdminLink>
        </Button>
      </div>
    </div>
  )
}

/* --------------------------------------------------------------- voice --- */
function VoiceShoppingCard({ preview, onAsk }: { preview: VoicePreview; onAsk: (text: string) => void }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-ink-900 dark:text-white">
        <Mic className="size-4 text-brand-600 dark:text-brand-300" />
        Voice shopping
      </p>
      <p className="mt-1 text-[12px] text-ink-500">
        Speak naturally, including mixed-language requests. The assistant turns it into search, compare, offer, and checkout steps.
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {preview.examples.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => onAsk(example)}
            className="rounded-full border px-2.5 py-1 text-[11px] font-medium text-ink-600 transition-colors hover:border-brand-400 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white"
          >
            {example}
          </button>
        ))}
      </div>
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
function isText(value: string | null | undefined): value is string {
  return Boolean(value)
}

function photoMatches(limit = 3): Match[] {
  const labels = ['Closest match', 'Cheaper alternative', 'Premium style']
  return findSimilarToPhoto(limit).map((match, i) => ({
    ...match,
    reason: `${labels[i] ?? 'Similar style'} · ${match.reason}`,
  }))
}

function reviewIntelFor(product: ShopProduct): ReviewIntel {
  const facts = factsFor(product.id)
  const likes = [
    `${product.rating} average from ${product.reviews} shopper reviews`,
    product.highlights[0] ?? facts.note,
    product.highlights[1] ?? `Sold by ${product.seller}, rated ${product.sellerRating}`,
  ].filter(isText)

  const concerns = [
    product.stock === 0 ? 'Currently out of stock' : null,
    product.returnWindowDays === 0 ? 'No easy return window, so confirm before checkout' : null,
    product.bulky ? 'Bulkier delivery; check your PIN code before payment' : null,
    product.category === 'Fashion' ? 'Fit can vary, so check size before buying' : null,
    product.category === 'Beauty' ? 'Patch test advised for skincare products' : null,
    product.rating < 4.5 ? 'Compare recent seller feedback before deciding' : null,
  ].filter(isText)

  return {
    product,
    likes,
    concerns: concerns.length ? concerns : ['Check colour, size, and return window before payment'],
    bestFor: facts.needs.map(titleCase).join(', '),
  }
}

function returnHelpFor(q: string): ReturnHelp {
  const entries = CUSTOMER_ORDERS.flatMap((order) =>
    order.shipments.flatMap((shipment) => shipment.items.map((item) => ({ order, shipment, item })))
  )
  const fallback = {
    order: CUSTOMER_ORDERS[0]!,
    shipment: CUSTOMER_ORDERS[0]!.shipments[0]!,
    item: CUSTOMER_ORDERS[0]!.shipments[0]!.items[0]!,
  }
  const colourIssue = /\b(colou?r|variant|wrong)\b/.test(q)
  const chosen =
    (colourIssue
      ? entries.find((entry) => /\b(black|white|olive|titanium|blue|sand|slate|charcoal|tan|ecru)\b/i.test(entry.item.variant))
      : entries.find((entry) => entry.shipment.returnableUntil)) ?? fallback

  const issue = /\bdamaged|broken\b/.test(q)
    ? 'Damaged product'
    : /\brefund\b/.test(q)
      ? 'Refund help'
      : colourIssue
        ? 'Wrong colour or variant received'
        : 'Order help'

  return {
    orderId: chosen.order.id,
    placedOn: chosen.order.placedOn,
    status: chosen.shipment.status,
    seller: chosen.shipment.seller,
    item: chosen.item,
    estimate: chosen.shipment.estimate,
    issue,
    returnableUntil: chosen.shipment.returnableUntil,
  }
}

function purchaseVault(): VaultItem[] {
  return CUSTOMER_ORDERS.flatMap((order) =>
    order.shipments.flatMap((shipment) =>
      shipment.items.map((item) => {
        const product = SHOP_PRODUCTS.find((p) => p.id === item.productId)
        return {
          orderId: order.id,
          purchased: order.placedOn,
          seller: shipment.seller,
          item,
          status: shipment.status,
          paymentMethod: order.paymentMethod,
          warranty: warrantyFor(product),
          returnableUntil: shipment.returnableUntil,
        }
      })
    )
  ).slice(0, 4)
}

function warrantyFor(product?: ShopProduct) {
  const warranty = product?.highlights.find((highlight) => /warranty/i.test(highlight))
  if (warranty) return warranty
  if (product?.category === 'Electronics' || product?.category === 'Accessories') return '1 Year seller support'
  if (product?.category === 'Home & Living' || product?.category === 'Sports') return '6 Months seller support'
  return 'Not a warranty item'
}

function preferencePreview(): PreferencePreview {
  return {
    size: 'M',
    colour: 'Black',
    address: 'Home',
    budget: 'Value for money',
    payment: 'Visa •••• 4242',
    bestOffer: true,
    priceDrops: true,
  }
}

function voicePreview(): VoicePreview {
  return {
    examples: [
      'Headphones under $80 for travel',
      'Mujhe 3,000 ke andar fitness item dikhao',
      'Add the second one and prepare checkout',
    ],
  }
}

function resolveProductFromContext(q: string, results: ShopProduct[]) {
  const ordinal = matchOrdinal(q)
  if (ordinal !== null && results[ordinal]) return results[ordinal]

  return productFromText(q) ?? results[0] ?? SHOP_PRODUCTS[0]!
}

function productFromText(q: string) {
  return SHOP_PRODUCTS.find((product) => {
    const terms = [
      product.name,
      product.brand,
      product.category,
      ...product.categoryPath,
      ...product.name.split(/\W+/).filter((word) => word.length > 4),
    ]
    return terms.some((term) => {
      const clean = term.toLowerCase()
      return q.includes(clean) || (clean.endsWith('s') && q.includes(clean.slice(0, -1)))
    })
  })
}

function isMultilingualQuery(q: string) {
  return /\b(mujhe|dikhao|dikhaiye|andar|chahiye|achhe|achha|ke andar)\b/.test(q)
}

function normaliseShoppingQuery(text: string) {
  return text
    .replace(/mujhe/gi, 'show me')
    .replace(/dikhao|dikhaiye/gi, 'show')
    .replace(/achhe|achha/gi, 'good')
    .replace(/ke andar|andar/gi, 'under')
    .replace(/chahiye/gi, 'need')
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function matchOrdinal(q: string): number | null {
  if (/\b(first|1st|one|option 1)\b/.test(q)) return 0
  if (/\b(second|2nd|two|option 2)\b/.test(q)) return 1
  if (/\b(third|3rd|three|option 3)\b/.test(q)) return 2
  return null
}

function budgetIn(q: string): number | null {
  const m = q.match(
    /(?:under|below|less than|upto|up to|within|ke andar|andar)\s*(?:\$|₹|rs\.?\s*)?([\d,]+)|(?:\$|₹|rs\.?\s*)\s*([\d,]+)\s*(?:under|below|ke andar|andar)?/
  )
  const value = m?.[1] ?? m?.[2]
  return value ? Number(value.replace(/,/g, '')) : null
}

/** Exposed for the quick-action buttons on the shopping home. */
export function useAssistantSuggestions() {
  return useMemo(() => SUGGESTIONS, [])
}

export { factsFor }
