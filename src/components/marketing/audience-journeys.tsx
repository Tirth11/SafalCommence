import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Banknote,
  Compass,
  CreditCard,
  Package,
  ShoppingBag,
  Store,
  Truck,
  UserPlus,
  Wallet,
} from 'lucide-react'

import { EditorialHeading, Reveal } from '@/components/marketing/reveal'
import { ProductScene, type SceneTone } from '@/components/marketing/scene'
import { Button } from '@/components/ui/button'
import type { ProductGlyph } from '@/data/catalog'
import { cn } from '@/lib/utils'

type Audience = 'shop' | 'sell'

const JOURNEYS: Record<
  Audience,
  {
    label: string
    tagline: string
    heading: string
    sub: string
    tone: SceneTone
    glyph: ProductGlyph
    cta: { label: string; to: '/shop' | '/register' }
    secondary: { label: string; to: '/shop/categories' | '/login' }
    steps: { icon: typeof Compass; title: string; body: string }[]
    proof: { value: string; label: string }[]
  }
> = {
  shop: {
    label: 'I want to shop',
    tagline: 'For customers',
    heading: 'Find it, buy it, track it — without the guesswork.',
    sub: 'Browse without an account. Pay once, even when your basket comes from different sellers. Then follow every parcel to your door.',
    tone: 'brand',
    glyph: 'bag',
    cta: { label: 'Browse the marketplace', to: '/shop' },
    secondary: { label: 'See all categories', to: '/shop/categories' },
    steps: [
      { icon: Compass, title: 'Discover', body: 'Search or browse categories from verified sellers. No sign-in needed.' },
      { icon: ShoppingBag, title: 'One cart', body: 'Add products from several sellers and check out a single time.' },
      { icon: CreditCard, title: 'Pay securely', body: 'UPI, cards, net banking or cash on delivery where available.' },
      { icon: Truck, title: 'Track to the door', body: 'Live status for every parcel, plus easy 7-day returns.' },
    ],
    proof: [
      { value: '1 checkout', label: 'however many sellers' },
      { value: '7 days', label: 'to return eligible items' },
      { value: '0', label: 'accounts needed to browse' },
    ],
  },
  sell: {
    label: 'I want to sell',
    tagline: 'For businesses',
    heading: 'Open your store in a day, run it from one screen.',
    sub: 'Register, get verified, list your products. Orders, inventory, shipping labels and settlements all live in the same dashboard.',
    tone: 'teal',
    glyph: 'camera',
    cta: { label: 'Start selling', to: '/register' },
    secondary: { label: 'Seller sign in', to: '/login' },
    steps: [
      { icon: UserPlus, title: 'Create your account', body: 'Register with your email in under a minute.' },
      { icon: Store, title: 'Set up your business', body: 'Add business details, KYC documents and your bank account.' },
      { icon: Package, title: 'List your products', body: 'Photos, variants, pricing and stock — guided step by step.' },
      { icon: Wallet, title: 'Sell and get paid', body: 'Fulfil orders and track settlements to your bank.' },
    ],
    proof: [
      { value: 'No fee', label: 'to list your products' },
      { value: 'Weekly', label: 'settlement cycle' },
      { value: '1 dashboard', label: 'for the whole business' },
    ],
  },
}

/**
 * The page has two audiences, so it asks once and adapts — rather than making a
 * shopper read seller copy or the other way round.
 */
export function AudienceJourneys() {
  const [audience, setAudience] = useState<Audience>('shop')
  const active = JOURNEYS[audience]

  return (
    <section id="how-it-works" className="scroll-mt-24 border-y bg-muted/40 py-16 sm:py-24 dark:bg-card/30">
      <div className="container-page">
        <Reveal>
          <EditorialHeading
            center
            eyebrow="How it works"
            title="Two ways to use SafalMarketHub"
            sub="Tell us why you're here and we'll show you the path."
          />
        </Reveal>

        {/* Audience switch */}
        <Reveal delay={0.08}>
          <div className="mt-9 flex justify-center">
            <div
              role="tablist"
              aria-label="Choose your path"
              className="inline-flex gap-1 rounded-full border bg-card p-1.5 shadow-sm"
            >
              {(Object.keys(JOURNEYS) as Audience[]).map((key) => {
                const selected = key === audience
                return (
                  <button
                    key={key}
                    role="tab"
                    type="button"
                    aria-selected={selected}
                    onClick={() => setAudience(key)}
                    className={cn(
                      'relative rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors sm:px-7',
                      selected ? 'text-white' : 'text-ink-600 hover:text-ink-900 dark:text-ink-300 dark:hover:text-white'
                    )}
                  >
                    {selected && (
                      <motion.span
                        layoutId="audience-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        className="absolute inset-0 -z-10 rounded-full bg-ink-950 dark:bg-brand-600"
                      />
                    )}
                    {JOURNEYS[key].label}
                  </button>
                )
              })}
            </div>
          </div>
        </Reveal>

        {/* Swapping panel */}
        <div className="mt-12">
          {/* Keyed on audience so the panel remounts and replays its entrance.
              Position-only animation, like Reveal — a fade from 0 would hide the
              copy entirely if the animation never ran. */}
          <div
              key={audience}
              className="grid animate-in items-center gap-10 slide-in-from-bottom-2 duration-400 ease-out lg:grid-cols-[1fr_1.05fr] lg:gap-16"
            >
              {/* Copy + steps */}
              <div>
                <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-brand-600 dark:text-brand-300">
                  {active.tagline}
                </span>
                <h3 className="mt-3.5 text-[26px] leading-[1.12] tracking-[-0.03em] sm:text-[34px]">{active.heading}</h3>
                <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-ink-600 dark:text-ink-300">
                  {active.sub}
                </p>

                <ol className="mt-8 grid gap-5 sm:grid-cols-2">
                  {active.steps.map((step, i) => (
                    <li key={step.title} className="flex gap-3.5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-background text-brand-600 shadow-xs dark:text-brand-300">
                        <step.icon className="size-5" />
                      </span>
                      <div>
                        <p className="flex items-baseline gap-2 text-[15px] font-semibold text-ink-900 dark:text-white">
                          <span className="text-[11px] font-bold tabular text-ink-400">0{i + 1}</span>
                          {step.title}
                        </p>
                        <p className="mt-1 text-[13px] leading-relaxed text-ink-600 dark:text-ink-300">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <Button size="lg" asChild className="w-full sm:w-auto">
                    <Link to={active.cta.to}>
                      {active.cta.label}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                    <Link to={active.secondary.to}>{active.secondary.label}</Link>
                  </Button>
                </div>
              </div>

              {/* Visual + proof numbers */}
              <div>
                <div className="overflow-hidden rounded-3xl border bg-card p-2 shadow-lg">
                  <ProductScene glyph={active.glyph} tone={active.tone} className="aspect-4/3" />
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-3">
                  {active.proof.map((item) => (
                    <div key={item.label} className="rounded-2xl border bg-card p-4">
                      <dt className="text-[17px] font-bold leading-none tracking-[-0.02em] text-ink-950 dark:text-white">
                        {item.value}
                      </dt>
                      <dd className="mt-1.5 text-[11px] leading-snug text-ink-500">{item.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
        </div>
      </div>
    </section>
  )
}

/** Big closing split — the two doors, side by side, no switching required. */
export function TwoDoors() {
  const doors = [
    {
      tagline: 'For customers',
      title: 'Start shopping',
      body: 'Thousands of products from verified sellers, with one cart and one checkout.',
      to: '/shop' as const,
      cta: 'Browse the marketplace',
      glyph: 'watch' as ProductGlyph,
      tone: 'brand' as SceneTone,
      icon: ShoppingBag,
    },
    {
      tagline: 'For businesses',
      title: 'Start selling',
      body: 'List your products, reach new customers and get settled to your bank every week.',
      to: '/register' as const,
      cta: 'Create a seller account',
      glyph: 'lamp' as ProductGlyph,
      tone: 'gold' as SceneTone,
      icon: Banknote,
    },
  ]

  return (
    <section className="py-16 sm:py-24">
      <div className="container-page">
        <Reveal>
          <EditorialHeading center title="Whichever side you're on, start here." />
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {doors.map((door, i) => (
            <Reveal key={door.title} delay={i * 0.1}>
              <Link
                to={door.to}
                className="group block h-full overflow-hidden rounded-3xl border bg-card shadow-xs transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  <ProductScene
                    glyph={door.glyph}
                    tone={door.tone}
                    className="aspect-16/9 transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <span className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-300">
                    <door.icon className="size-3.5" />
                    {door.tagline}
                  </span>
                  <h3 className="mt-3 text-[24px] tracking-[-0.02em] sm:text-[28px]">{door.title}</h3>
                  <p className="mt-2.5 max-w-[420px] text-[15px] leading-relaxed text-ink-600 dark:text-ink-300">
                    {door.body}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-brand-600 dark:text-brand-300">
                    {door.cta}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
