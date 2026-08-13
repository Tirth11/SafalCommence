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
import { ShopHero } from '@/components/marketing/shop-hero'
import { AssistantProvider } from '@/components/shop/assistant'
import {
  ActiveOrderCard,
  AssistantFab,
  AssistantWelcome,
  ComingSoon,
  ContinueShopping,
  OffersForYou,
  ShopperHero,
  TodaysOffers,
  YourWishlist,
} from '@/components/shop/shopping-home'
import { SHOP_PRODUCTS } from '@/data/shop'
import { useAccountStore } from '@/store/account-store'

/**
 * One route, two audiences.
 *
 * Signed out, this is the pitch: shopping made simpler, proved in the first
 * screen by three ways in — type it, show a photo, or answer two questions.
 *
 * Signed in, it becomes a personal shopping home. Not a dashboard: no counts
 * of orders and returns, just what to buy, what's on offer, and where the
 * current parcel is.
 */
export function LandingPage() {
  const user = useAccountStore((s) => s.user)

  return (
    <AssistantProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-sm focus:bg-brand-600 focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <SiteHeader />

      <main id="main">{user ? <ShoppingHome /> : <MarketingHome />}</main>

      <SiteFooter />
      {/* The assistant follows the shopper everywhere on this page. */}
      <AssistantFab />
    </AssistantProvider>
  )
}

/* ------------------------------------------------------------ signed in --- */
function ShoppingHome() {
  const popular = SHOP_PRODUCTS.slice(0, 4)

  return (
    <>
      <ShopperHero />
      <ActiveOrderCard />
      <AssistantWelcome />
      <TodaysOffers />
      <ContinueShopping />
      <YourWishlist />
      <OffersForYou />
      <ShopByCategory />
      <ShopByBudget />
      <ProductRail title="Popular right now" sub="What shoppers are buying this week." products={popular} />
      <ComingSoon />
      <CantDecide />
      <PhotoSearchBand />
      <ShopWithConfidence />
      <ContactBand />
      <SellerFooterCta />
    </>
  )
}

/* ----------------------------------------------------------- signed out --- */
function MarketingHome() {
  const popular = SHOP_PRODUCTS.slice(0, 4)

  return (
    <>
      <ShopHero />
      <ShopByCategory />
      <ShopByNeed />
      <ShopByBudget />
      <ProductRail title="Popular right now" sub="What shoppers are buying this week." products={popular} />
      <CantDecide />
      <PhotoSearchBand />
      <ShopWithConfidence />
      <ContactBand />
      <SellerFooterCta />
    </>
  )
}
