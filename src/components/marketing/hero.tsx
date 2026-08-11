import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { Check } from 'lucide-react'

import { HeroCollage } from '@/components/mock/hero-collage'
import { Eyebrow } from '@/components/marketing/section'
import { Button } from '@/components/ui/button'

const PROOF = ['Simple seller onboarding', 'Secure payments', 'Easy order management']

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* faint grid + brand wash */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 size-[520px] rounded-full bg-brand-100/50 blur-3xl dark:bg-brand-900/25" />

      <div className="container-wide relative grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1fr_1.05fr] lg:gap-20 lg:py-28">
        {/* Left */}
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Eyebrow>Commerce made simple</Eyebrow>
            <h1 className="mt-4 text-[34px] leading-[1.08] sm:text-[44px] lg:text-[56px]">
              Buy what you love.
              <br />
              <span className="text-brand-600 dark:text-brand-300">Sell what you create.</span>
            </h1>
            <p className="mt-5 max-w-[540px] text-base text-ink-600 sm:text-[17px] dark:text-ink-300">
              SafalHub connects customers with businesses through one simple marketplace. Discover products,
              start selling and manage your commerce journey from a single platform.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link to="/register">Start Selling</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <a href="#marketplace">Explore Products</a>
              </Button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
              {PROOF.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-medium text-ink-700 dark:text-ink-300">
                  <Check className="size-[17px] shrink-0 text-teal-500 dark:text-teal-100" strokeWidth={2.4} />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Right — dashboard composition */}
        <div className="lg:pl-6">
          <HeroCollage />
        </div>
      </div>
    </section>
  )
}
