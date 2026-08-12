import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { AudienceJourneys, TwoDoors } from '@/components/marketing/audience-journeys'
import { Discover, SellerStory } from '@/components/marketing/discover'
import { FinalCta } from '@/components/marketing/final-cta'
import { Hero } from '@/components/marketing/hero'
import { Pricing } from '@/components/marketing/pricing'
import { Trust } from '@/components/marketing/trust'

/**
 * One landing page for two audiences.
 *
 * Order matters: the hero states both propositions, discovery proves there is
 * something to buy, the audience switch lets each visitor read only their own
 * path, the seller band goes deep for businesses, and the closing split sends
 * everyone to the right door.
 */
export function LandingPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sm focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Discover />
        <AudienceJourneys />
        <SellerStory />
        <Trust />
        <Pricing />
        <TwoDoors />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
