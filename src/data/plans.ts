/* ==========================================================================
   SafalMarketHub pricing — a hybrid model, kept to three tiers.

   Three revenue streams:
     1. marketplace commission (SafalMarketHub brought the customer)
     2. subscription for the white-label storefront
     3. a small transaction fee on own-store sales (seller brought the customer)

   The fee split is the point: when we bring the buyer we take a commission;
   when the seller brings the buyer they pay a subscription plus a low fee.
   Anything bigger than Pro is a conversation, not a pricing card.
   ========================================================================== */

export type PlanId = 'free' | 'growth' | 'pro'

export type AnalyticsTier = 'Basic' | 'Standard' | 'Advanced'

export type Plan = {
  id: PlanId
  name: string
  price: number
  /** Shown on the marketing page. */
  priceLabel: string
  bestFor: string
  tagline: string
  popular?: boolean
  /** Headline numbers used on cards and in the seller plan screen. */
  productLimit: number | 'Unlimited'
  commission: number
  ownStoreFee: number | null
  staff: number
  themes: number | 'All' | null
  whiteLabel: boolean
  subdomain: boolean
  customDomain: boolean
  removeBranding: boolean
  coupons: boolean
  freeShippingRules: boolean
  announcementBar: boolean
  collections: boolean
  brandedEmails: boolean
  analytics: AnalyticsTier
  abandonedCart: boolean
  highlights: string[]
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceLabel: '$0',
    bestFor: 'New marketplace sellers',
    tagline: 'Sell on the SafalMarketHub marketplace, free.',
    productLimit: 25,
    commission: 12,
    ownStoreFee: null,
    staff: 1,
    themes: null,
    whiteLabel: false,
    subdomain: false,
    customDomain: false,
    removeBranding: false,
    coupons: false,
    freeShippingRules: false,
    announcementBar: false,
    collections: false,
    brandedEmails: false,
    analytics: 'Basic',
    abandonedCart: false,
    highlights: [
      'Sell on the marketplace',
      '25 products',
      '12% marketplace commission',
      'Seller dashboard, orders & inventory',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 12,
    priceLabel: '$12',
    bestFor: 'Small brands',
    tagline: 'Marketplace plus your own branded storefront.',
    productLimit: 250,
    commission: 9,
    ownStoreFee: 2,
    staff: 2,
    themes: 2,
    whiteLabel: true,
    subdomain: true,
    customDomain: false,
    removeBranding: false,
    coupons: true,
    freeShippingRules: true,
    announcementBar: true,
    collections: true,
    brandedEmails: false,
    analytics: 'Standard',
    abandonedCart: false,
    highlights: [
      'Everything in Free',
      'Your own store on a SafalMarketHub subdomain',
      '250 products · 9% commission',
      '2% fee on your own-store sales',
      'Coupons, free-shipping rules and collections',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    priceLabel: '$29',
    bestFor: 'Growing D2C brands',
    tagline: 'Your own domain, your own brand — no SafalMarketHub badge.',
    popular: true,
    productLimit: 1000,
    commission: 6,
    ownStoreFee: 1,
    staff: 5,
    themes: 'All',
    whiteLabel: true,
    subdomain: true,
    customDomain: true,
    removeBranding: true,
    coupons: true,
    freeShippingRules: true,
    announcementBar: true,
    collections: true,
    brandedEmails: true,
    analytics: 'Advanced',
    abandonedCart: true,
    highlights: [
      'Everything in Growth',
      'Connect your own domain',
      '1,000 products · 6% commission',
      '1% fee on your own-store sales',
      'No "Powered by" badge · branded emails · 5 staff',
    ],
  },
]

export const getPlan = (id: PlanId) => PLANS.find((p) => p.id === id)!

/** How long a seller can build a storefront before they have to subscribe. */
export const TRIAL_DAYS = 14

/** Full matrix for the comparison table. `true`/`false` render as tick/cross. */
export const PLAN_FEATURES: { label: string; note?: string; value: (plan: Plan) => string | boolean }[] = [
  { label: 'Monthly price', value: (p) => `${p.priceLabel}${p.price ? '/mo' : ''}` },
  { label: 'Sell on SafalMarketHub marketplace', value: () => true },
  { label: 'Marketplace products', value: (p) => (typeof p.productLimit === 'number' ? p.productLimit.toLocaleString('en-US') : p.productLimit) },
  { label: 'Marketplace commission', value: (p) => `${p.commission}%` },
  { label: 'Seller dashboard', value: () => true },
  { label: 'Orders & inventory', value: () => true },
  { label: 'Own online store', value: (p) => p.whiteLabel },
  { label: 'SafalMarketHub subdomain', value: (p) => p.subdomain },
  { label: 'Custom domain', value: (p) => p.customDomain },
  { label: 'Theme customisation', value: (p) => p.whiteLabel },
  { label: 'Store themes', value: (p) => (p.themes === null ? '—' : String(p.themes)) },
  { label: 'Remove "Powered by SafalMarketHub"', value: (p) => p.removeBranding },
  { label: 'Coupons & discount codes', value: (p) => p.coupons },
  { label: 'Free-shipping rules', value: (p) => p.freeShippingRules },
  { label: 'Announcement bar', value: (p) => p.announcementBar },
  { label: 'Product collections', value: (p) => p.collections },
  { label: 'Branded order emails', value: (p) => p.brandedEmails },
  { label: 'Abandoned-cart reminders', value: (p) => p.abandonedCart },
  { label: 'Analytics', value: (p) => p.analytics },
  { label: 'Staff accounts', value: (p) => String(p.staff) },
  {
    label: 'Own-store transaction fee',
    note: 'Payment-gateway charges are separate.',
    value: (p) => (p.ownStoreFee === null ? '—' : `${p.ownStoreFee}%`),
  },
]

/* ------------------------------------------------------------ storefront -- */

export type StoreTheme = {
  id: string
  name: string
  description: string
  tone: 'brand' | 'teal' | 'gold' | 'ink'
  minPlan: PlanId
}

export const STORE_THEMES: StoreTheme[] = [
  { id: 'minimal', name: 'Minimal', description: 'Clean and product-first. Ideal for electronics and fashion.', tone: 'ink', minPlan: 'growth' },
  { id: 'modern', name: 'Modern', description: 'Large visual banners and curated collections.', tone: 'brand', minPlan: 'growth' },
  { id: 'catalogue', name: 'Catalogue', description: 'Dense grids designed for large product catalogues.', tone: 'teal', minPlan: 'pro' },
  { id: 'editorial', name: 'Editorial', description: 'Story-led layout with generous imagery.', tone: 'gold', minPlan: 'pro' },
]

/** Pages SafalMarketHub generates for every storefront — no page builder needed. */
export const GENERATED_PAGES = [
  'Home',
  'Shop',
  'Categories',
  'Product Page',
  'Search',
  'Cart',
  'Checkout',
  'My Account',
  'Order Tracking',
  'About Us',
  'Contact Us',
  'Privacy Policy',
  'Terms',
  'Shipping Policy',
  'Return Policy',
]

export type SalesChannel = 'marketplace' | 'store' | 'b2b'

export const CHANNEL_LABELS: Record<SalesChannel, string> = {
  marketplace: 'SafalMarketHub Marketplace',
  store: 'My Online Store',
  b2b: 'B2B Wholesale',
}

/** What SafalMarketHub charges on a sale, by the channel that produced it. */
export function channelFee(channel: SalesChannel, amount: number, plan: Plan) {
  if (channel === 'marketplace') {
    return { rate: plan.commission, label: 'Marketplace commission', amount: Math.round((amount * plan.commission) / 100) }
  }
  const rate = plan.ownStoreFee ?? 0
  return { rate, label: 'Platform fee', amount: Math.round((amount * rate) / 100) }
}
