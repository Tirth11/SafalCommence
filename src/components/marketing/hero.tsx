import { Link } from '@tanstack/react-router'
import { ArrowRight, BadgeCheck, Bell, IndianRupee, ShoppingBag, Star, TrendingUp } from 'lucide-react'

import { motion } from 'motion/react'

import { Reveal } from '@/components/marketing/reveal'
import { AmbientWash, ProductScene } from '@/components/marketing/scene'
import { Button } from '@/components/ui/button'
import { money } from '@/lib/utils'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <AmbientWash />

      <div className="container-wide relative pb-16 pt-14 sm:pb-24 sm:pt-20 lg:pb-28 lg:pt-24">
        {/* Statement */}
        <div className="mx-auto max-w-[860px] text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3.5 py-1.5 text-[12px] font-semibold text-ink-700 shadow-xs backdrop-blur-sm dark:text-ink-200">
              <span className="flex size-1.5 rounded-full bg-teal-500" />
              A marketplace built for both sides
            </span>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="mt-6 text-[38px] leading-[1.03] tracking-[-0.035em] sm:text-[58px] lg:text-[76px]">
            Shop what you love.
            <br />
            <span className="bg-linear-100 from-brand-600 via-brand-500 to-teal-500 bg-clip-text text-transparent dark:from-brand-300 dark:via-brand-200 dark:to-teal-100">
              Sell what you make.
            </span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-relaxed text-ink-600 sm:text-[19px] dark:text-ink-300">
            Discover products from verified sellers across India — or open your own store and run it from one simple
            dashboard.
            </p>
          </Reveal>

          <Reveal delay={0.18} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/shop">
                Start shopping
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link to="/register">Start selling</Link>
            </Button>
          </Reveal>

          <Reveal delay={0.24}>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
            {['Verified sellers', 'Secure payments', '7-day returns', 'No listing fee'].map((item) => (
              <li key={item} className="flex items-center gap-1.5 text-[13px] font-medium text-ink-600 dark:text-ink-300">
                <BadgeCheck className="size-4 shrink-0 text-teal-500" />
                {item}
              </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Editorial visual — the two sides of the marketplace, side by side */}
        <div className="mt-14 grid gap-4 sm:mt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-5">
          {/* Shopper side */}
          <Reveal delay={0.3} className="relative">
            <div className="relative overflow-hidden rounded-3xl border bg-card p-2 shadow-xl">
              <ProductScene glyph="headphones" tone="brand" className="aspect-16/11" />

              {/* Floating product card, like a shopper mid-browse */}
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border bg-background/85 p-4 shadow-lg backdrop-blur-md sm:right-auto sm:w-[320px]">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink-400">SoundPro</p>
                <p className="mt-1 text-[15px] font-semibold leading-snug text-ink-950 dark:text-white">
                  Wireless Noise Cancelling Headphones
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="flex gap-px text-gold-400">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="size-3" strokeWidth={1.6} fill="currentColor" />
                    ))}
                  </span>
                  <span className="text-[11px] font-semibold text-ink-600 tabular dark:text-ink-300">4.6 (214)</span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2">
                  <span className="text-[19px] font-bold tabular text-ink-950 dark:text-white">{money(4999)}</span>
                  <span className="text-[13px] text-ink-400 line-through tabular">{money(6999)}</span>
                  <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[11px] font-bold text-gold-600 dark:bg-gold-600/15 dark:text-gold-400">
                    29% OFF
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-3.5 px-1 text-[13px] text-ink-500">
              <span className="font-semibold text-ink-800 dark:text-ink-100">For shoppers</span> · thousands of products,
              one checkout, one place to track it all.
            </p>
          </Reveal>

          {/* Seller side */}
          <Reveal delay={0.38} className="relative">
            <div className="relative overflow-hidden rounded-3xl border bg-ink-950 p-6 shadow-xl sm:p-7">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-24 size-[320px] rounded-full bg-brand-600/25 blur-3xl"
              />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-white/10 text-brand-200">
                      <ShoppingBag className="size-[19px]" />
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold leading-tight text-white">ABC Electronics</p>
                      <p className="text-[11px] text-ink-400">Seller dashboard</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/15 px-2.5 py-1 text-[11px] font-bold text-teal-100">
                    <span className="size-1.5 rounded-full bg-teal-300" />
                    Active
                  </span>
                </div>

                <div className="mt-6">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-400">Sales this month</p>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-[40px] font-bold leading-none tracking-[-0.04em] text-white tabular">$1,100</p>
                    <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-teal-500/15 px-2 py-0.5 text-[12px] font-bold text-teal-100">
                      <TrendingUp className="size-3.5" />
                      +18.4%
                    </span>
                  </div>

                  {/* Growth curve */}
                  <svg viewBox="0 0 300 84" className="mt-5 h-24 w-full" preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="heroSpark" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#A697F5" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#A697F5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polygon points="0,66 40,58 80,62 120,44 160,50 200,28 240,34 300,10 300,84 0,84" fill="url(#heroSpark)" />
                    <motion.polyline
                      points="0,66 40,58 80,62 120,44 160,50 200,28 240,34 300,10"
                      fill="none"
                      stroke="#C9C1FA"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.3, delay: 0.7, ease: 'easeOut' }}
                    />
                  </svg>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2.5">
                  {[
                    { icon: ShoppingBag, label: 'Orders', value: '124' },
                    { icon: IndianRupee, label: 'Payouts', value: '$1k' },
                    { icon: Bell, label: 'New', value: '4' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white/10 bg-white/6 p-3">
                      <stat.icon className="size-4 text-brand-200" />
                      <p className="mt-2 text-[15px] font-bold leading-none text-white tabular">{stat.value}</p>
                      <p className="mt-1 text-[11px] text-ink-400">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3.5 px-1 text-[13px] text-ink-500">
              <span className="font-semibold text-ink-800 dark:text-ink-100">For sellers</span> · products, orders,
              inventory and payouts in a single dashboard.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
