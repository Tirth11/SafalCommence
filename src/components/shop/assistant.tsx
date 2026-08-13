import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { ArrowLeft, Camera, Check, ImageUp, RotateCcw, Sparkles, Star } from 'lucide-react'

import { AdminLink } from '@/components/admin/admin-link'
import { ProductScene } from '@/components/marketing/scene'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { AssistantChat, PaymentSheet, type CheckoutDraft } from '@/components/shop/assistant-chat'
import { findMatches, findSimilarToPhoto, GUIDE_STEPS, searchProducts, type Match } from '@/data/discovery'
import { cn, money } from '@/lib/utils'

/* ==========================================================================
   The shopping assistant, in plain English.

   Three doors, one room: answer two questions, show us a photo, or just type
   what you want. Every path lands on the same short list of products, each
   with a one-line reason it's there.

   No "AI" wording anywhere in the UI — the help is the feature, not the
   technology behind it.
   ========================================================================== */

type AssistantMode = 'guide' | 'photo' | 'search' | 'chat'

type AssistantContext = {
  open: (mode: AssistantMode, query?: string) => void
}

const Ctx = createContext<AssistantContext | null>(null)

/** Lets any card, chip or search box on the page summon the assistant. */
export function useAssistant() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAssistant must be used inside <AssistantProvider>')
  return ctx
}

/**
 * For shared chrome. The header renders on screens that have no provider
 * (login, checkout), and a missing assistant should hide the button, not
 * crash the page.
 */
export function useOptionalAssistant() {
  return useContext(Ctx)
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AssistantMode>('guide')
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  const open = useCallback((next: AssistantMode, q = '') => {
    setMode(next)
    setQuery(q)
    setIsOpen(true)
  }, [])

  const value = useMemo(() => ({ open }), [open])

  return (
    <Ctx.Provider value={value}>
      {children}
      <AssistantDialog open={isOpen} onOpenChange={setIsOpen} mode={mode} query={query} />
    </Ctx.Provider>
  )
}

function AssistantDialog({
  open,
  onOpenChange,
  mode,
  query,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: AssistantMode
  query: string
}) {
  // A purchase started in chat pauses the conversation for the payment sheet,
  // then returns to it. The shopper never feels thrown out mid-sentence.
  const [paying, setPaying] = useState<CheckoutDraft | null>(null)
  const [placed, setPlaced] = useState<{ orderId: string; total: number } | null>(null)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setPaying(null)
          setPlaced(null)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-[560px] p-0">
        {mode === 'guide' && <GuideFlow key={String(open)} />}
        {mode === 'photo' && <PhotoFlow key={String(open)} />}
        {mode === 'search' && <SearchResults query={query} />}
        {mode === 'chat' && (
          <>
            <DialogTitle className="sr-only">Safal Assistant</DialogTitle>
            {placed ? (
              <OrderPlaced order={placed} onClose={() => onOpenChange(false)} />
            ) : paying ? (
              <PaymentSheet
                draft={paying}
                onCancel={() => setPaying(null)}
                onDone={(orderId) => {
                  setPlaced({ orderId, total: paying.total })
                  setPaying(null)
                }}
              />
            ) : (
              <AssistantChat key={String(open)} onRequestPayment={setPaying} />
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

/** Where a conversational purchase lands. */
function OrderPlaced({ order, onClose }: { order: { orderId: string; total: number }; onClose: () => void }) {
  return (
    <div className="p-6 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-600/15 dark:text-teal-100">
        <Check className="size-6" strokeWidth={2.6} />
      </span>
      <DialogTitle className="mt-4 text-[21px]">Order placed</DialogTitle>
      <DialogDescription className="mt-2 text-[13px]">
        {order.orderId} · {money(order.total)} paid. We'll email the confirmation.
      </DialogDescription>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Button asChild>
          <AdminLink to="/account/orders">Track order</AdminLink>
        </Button>
        <Button variant="outline" onClick={onClose}>
          Keep shopping
        </Button>
      </div>
    </div>
  )
}

/* --------------------------------------------------------- help me choose -- */
function GuideFlow() {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [stepIndex, setStepIndex] = useState(0)

  const done = stepIndex >= GUIDE_STEPS.length
  const step = GUIDE_STEPS[stepIndex]

  const answer = (value: string) => {
    setAnswers((a) => ({ ...a, [step.id]: value }))
    setStepIndex((i) => i + 1)
  }

  if (done) {
    const matches = findMatches({
      category: answers.category,
      budget: answers.budget,
      priority: answers.priority,
    })
    return (
      <Results
        title={`We found ${matches.length} good ${matches.length === 1 ? 'option' : 'options'} for you`}
        subtitle={summarise(answers)}
        matches={matches}
        onRestart={() => {
          setAnswers({})
          setStepIndex(0)
        }}
      />
    )
  }

  return (
    <div className="p-6">
      <header className="mb-5">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-300">
          <Sparkles className="size-3.5" />
          Help me choose
        </p>
        <DialogTitle className="mt-2 text-[22px]">{step.question}</DialogTitle>
        <DialogDescription className="mt-1.5 text-[13px]">
          Question {stepIndex + 1} of {GUIDE_STEPS.length} — this takes about ten seconds.
        </DialogDescription>
      </header>

      <div className="grid grid-cols-2 gap-2.5">
        {step.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => answer(option.value)}
            className="rounded-xl border px-4 py-3.5 text-left text-[14px] font-semibold text-ink-800 transition-[border-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md dark:text-ink-100"
          >
            {option.label}
            {option.hint && <span className="mt-0.5 block text-[11px] font-normal text-ink-500">{option.hint}</span>}
          </button>
        ))}
      </div>

      {stepIndex > 0 && (
        <Button variant="ghost" size="sm" className="mt-5" onClick={() => setStepIndex((i) => i - 1)}>
          <ArrowLeft className="size-4" />
          Back
        </Button>
      )}

      {/* Progress reads as reassurance, not decoration. */}
      <div className="mt-5 flex gap-1.5" aria-hidden>
        {GUIDE_STEPS.map((s, i) => (
          <span
            key={s.id}
            className={cn('h-1 flex-1 rounded-full', i <= stepIndex ? 'bg-brand-600' : 'bg-ink-200 dark:bg-secondary')}
          />
        ))}
      </div>
    </div>
  )
}

function summarise(answers: Record<string, string>) {
  const bits: string[] = []
  if (answers.category && answers.category !== 'any') bits.push(answers.category.toLowerCase())
  if (answers.budget && answers.budget !== 'any') bits.push(`under ${money(Number(answers.budget))}`)
  if (answers.priority) bits.push(`good ${answers.priority === 'portable' ? 'for travel' : answers.priority}`)
  return bits.length ? `Based on: ${bits.join(' · ')}` : 'Based on what you told us'
}

/* ------------------------------------------------------------ photo search -- */
function PhotoFlow() {
  const [state, setState] = useState<'idle' | 'looking' | 'done'>('idle')

  const upload = () => {
    setState('looking')
    // Stands in for the upload + vision round-trip.
    setTimeout(() => setState('done'), 1100)
  }

  if (state === 'done') {
    return (
      <Results
        title="We found products similar to your photo"
        subtitle="Closest matches from sellers on SafalMarketHub"
        matches={findSimilarToPhoto()}
        onRestart={() => setState('idle')}
        restartLabel="Try another photo"
      />
    )
  }

  return (
    <div className="p-6">
      <header className="mb-5">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.1em] text-brand-600 dark:text-brand-300">
          <Camera className="size-3.5" />
          Search with a photo
        </p>
        <DialogTitle className="mt-2 text-[22px]">Seen something you like?</DialogTitle>
        <DialogDescription className="mt-1.5 text-[13px]">
          Upload a photo and we'll find similar products from our sellers.
        </DialogDescription>
      </header>

      <button
        type="button"
        onClick={upload}
        disabled={state === 'looking'}
        className={cn(
          'flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 transition-colors',
          state === 'looking'
            ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-950/40'
            : 'hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-950/40'
        )}
      >
        {state === 'looking' ? (
          <>
            <span className="flex gap-1.5" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-2.5 animate-bounce rounded-full bg-brand-500"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </span>
            <span className="text-[15px] font-semibold text-ink-900 dark:text-white">Looking for matches…</span>
          </>
        ) : (
          <>
            <ImageUp className="size-8 text-ink-400" />
            <span className="text-[15px] font-semibold text-ink-900 dark:text-white">Drop a photo here</span>
            <span className="text-[13px] text-ink-500">or browse your device · JPG or PNG</span>
          </>
        )}
      </button>

      <p className="mt-4 text-center text-[12px] text-ink-500">
        A screenshot, a photo from a shop window, anything. We match on what the product looks like.
      </p>
    </div>
  )
}

/* ----------------------------------------------------------- typed search -- */
function SearchResults({ query }: { query: string }) {
  const matches = searchProducts(query)

  if (!matches.length) {
    return (
      <div className="p-6 text-center">
        <DialogTitle className="text-[20px]">Nothing matched “{query}”</DialogTitle>
        <DialogDescription className="mx-auto mt-2 max-w-[360px] text-[13px]">
          Try fewer words, or let us ask you a couple of questions instead.
        </DialogDescription>
        <Button className="mt-5" asChild>
          <AdminLink to="/shop/all">Browse everything</AdminLink>
        </Button>
      </div>
    )
  }

  return (
    <Results
      title={`Results for “${query}”`}
      subtitle={`${matches.length} ${matches.length === 1 ? 'product' : 'products'} worth a look`}
      matches={matches}
    />
  )
}

/* ---------------------------------------------------------------- results -- */
function Results({
  title,
  subtitle,
  matches,
  onRestart,
  restartLabel = 'Start over',
}: {
  title: string
  subtitle: string
  matches: Match[]
  onRestart?: () => void
  restartLabel?: string
}) {
  return (
    <div className="max-h-[80vh] overflow-y-auto p-6">
      <header className="mb-5">
        <DialogTitle className="text-[21px]">{title}</DialogTitle>
        <DialogDescription className="mt-1.5 text-[13px]">{subtitle}</DialogDescription>
      </header>

      <ul className="grid gap-3">
        {matches.map(({ product, reason }) => (
          <li key={product.id}>
            <AdminLink
              to={`/product/${product.id}`}
              className="group flex gap-3.5 rounded-xl border p-3 transition-[border-color,box-shadow] hover:border-brand-300 hover:shadow-md"
            >
              <ProductScene glyph={product.glyph} tone={product.tone} className="size-[76px] shrink-0 rounded-lg" grain={false} />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-[14px] font-semibold text-ink-900 group-hover:text-brand-700 dark:text-white dark:group-hover:text-brand-300">
                  {product.name}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-ink-500">
                  <Star className="size-3 fill-gold-400 text-gold-400" />
                  <span className="font-semibold tabular text-ink-700 dark:text-ink-300">{product.rating}</span>
                  <span aria-hidden>·</span>
                  <span className="truncate">{product.seller}</span>
                </p>
                <p className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-[15px] font-bold tabular text-ink-950 dark:text-white">{money(product.price)}</span>
                  <span className="text-[12px] text-ink-400 line-through tabular">{money(product.mrp)}</span>
                </p>
                {/* One short line. Never a paragraph explaining the pick. */}
                <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700 dark:bg-teal-600/15 dark:text-teal-100">
                  <Sparkles className="size-3" />
                  {reason}
                </p>
              </div>
            </AdminLink>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2.5 border-t pt-5">
        <Button asChild>
          <AdminLink to="/shop/all">See all products</AdminLink>
        </Button>
        {onRestart && (
          <Button variant="outline" onClick={onRestart}>
            <RotateCcw className="size-4" />
            {restartLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

/** Small tick used by callers that show what the shopper already answered. */
export function AnsweredChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-ink-700 dark:text-ink-200">
      <Check className="size-3 text-teal-500" strokeWidth={3} />
      {label}
    </span>
  )
}
