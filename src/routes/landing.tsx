import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { BuyerValue } from '@/components/marketing/buyer-value'
import { DashboardPreview } from '@/components/marketing/dashboard-preview'
import { FinalCta } from '@/components/marketing/final-cta'
import { Hero } from '@/components/marketing/hero'
import { HowItWorks } from '@/components/marketing/how-it-works'
import { MarketplacePreview } from '@/components/marketing/marketplace-preview'
import { Pricing } from '@/components/marketing/pricing'
import { SellerValue } from '@/components/marketing/seller-value'
import { Trust } from '@/components/marketing/trust'

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
        <MarketplacePreview />
        <SellerValue />
        <HowItWorks />
        <BuyerValue />
        <DashboardPreview />
        <Trust />
        <Pricing />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
