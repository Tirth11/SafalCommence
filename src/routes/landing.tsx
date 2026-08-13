import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import {
  CantDecide,
  ContactBand,
  PhotoSearchBand,
  ProductRail,
  SellerFooterCta,
  ShopByBudget,
  ShopByCategory,
  ShopByNeed,
  ShopWithConfidence,
} from '@/components/marketing/discovery-sections'
import { PickUpWhereYouLeftOff } from '@/components/marketing/for-you'
import { ShopHero } from '@/components/marketing/shop-hero'
import { AssistantProvider } from '@/components/shop/assistant'
import { SHOP_PRODUCTS } from '@/data/shop'

/**
 * A shopper's landing page.
 *
 * The promise is "shopping made simpler", and the page proves it in the first
 * screen: search normally, show a photo, or be asked two questions. Everything
 * after that is browsing — by category, by occasion, by budget — with product
 * rails named the way a person would say them.
 *
 * Selling is one quiet line above the footer. This page belongs to customers.
 */
export function LandingPage() {
  const popular = SHOP_PRODUCTS.slice(0, 4)

  return (
    <AssistantProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sm focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">
        <ShopHero />
        <PickUpWhereYouLeftOff />
        <ShopByCategory />
        <ShopByNeed />
        <ShopByBudget />

        <ProductRail title="Popular right now" sub="What shoppers are buying this week." products={popular} />

        <CantDecide />

        <PhotoSearchBand />

        <ShopWithConfidence />
        <ContactBand />
        <SellerFooterCta />
      </main>

      <SiteFooter />
    </AssistantProvider>
  )
}
