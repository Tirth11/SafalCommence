import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink-950 py-20 md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-160 from-brand-800/45 via-transparent to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-brand-600/18 blur-3xl"
      />
      <div className="container-page relative text-center">
        <h2 className="text-3xl text-white sm:text-4xl md:text-[44px]">Ready to start?</h2>
        <p className="mx-auto mt-5 max-w-[620px] text-base text-ink-300 sm:text-[17px]">
          Whether you're here to discover your next purchase or grow your business, SafalMarketHub gives you one
          place to get started.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" variant="onInk" asChild className="w-full sm:w-auto">
            <Link to="/register">Start Selling</Link>
          </Button>
          <Button size="lg" variant="onInkOutline" asChild className="w-full sm:w-auto">
            <Link to="/shop">Explore Marketplace</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm text-ink-400">
          Already selling with us?{' '}
          <Link to="/login" className="font-semibold text-white underline-offset-4 hover:underline">
            Sign in to your dashboard
          </Link>
        </p>
      </div>
    </section>
  )
}
