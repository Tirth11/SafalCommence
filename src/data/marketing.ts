/* ==========================================================================
   Storefront marketing: coupons, collections, policies and store analytics.

   Deliberately shallow. Sellers get the handful of levers that move sales —
   a discount code, a free-shipping threshold, an announcement bar, a few
   curated collections — and nothing that resembles a page builder.
   ========================================================================== */

export type CouponType = 'percent' | 'flat'

export type Coupon = {
  id: string
  code: string
  type: CouponType
  /** Percent when `type` is 'percent', dollars when 'flat'. */
  value: number
  minOrder: number
  /** Only meaningful for percentage coupons. */
  maxDiscount: number | null
  validUntil: string
  usageLimit: number | null
  used: number
  channel: 'store' | 'both'
  status: 'Active' | 'Scheduled' | 'Expired' | 'Paused'
}

export const SELLER_COUPONS: Coupon[] = [
  {
    id: 'CPN-1001',
    code: 'WELCOME10',
    type: 'percent',
    value: 10,
    minOrder: 25,
    maxDiscount: 15,
    validUntil: '31 Aug 2026',
    usageLimit: 200,
    used: 47,
    channel: 'store',
    status: 'Active',
  },
  {
    id: 'CPN-1002',
    code: 'FIRST100',
    type: 'flat',
    value: 5,
    minOrder: 40,
    maxDiscount: null,
    validUntil: '30 Sep 2026',
    usageLimit: 100,
    used: 12,
    channel: 'store',
    status: 'Active',
  },
  {
    id: 'CPN-1003',
    code: 'SAVE20',
    type: 'percent',
    value: 20,
    minOrder: 80,
    maxDiscount: 25,
    validUntil: '15 Aug 2026',
    usageLimit: null,
    used: 8,
    channel: 'both',
    status: 'Paused',
  },
  {
    id: 'CPN-1004',
    code: 'MONSOON15',
    type: 'percent',
    value: 15,
    minOrder: 50,
    maxDiscount: 20,
    validUntil: '31 Jul 2026',
    usageLimit: 150,
    used: 96,
    channel: 'store',
    status: 'Expired',
  },
]

/* ------------------------------------------------------------ collections -- */

export type Collection = {
  id: string
  name: string
  /** Auto collections fill themselves; manual ones are hand-picked. */
  rule: 'newest' | 'best-selling' | 'manual' | 'under-price'
  ruleValue?: number
  productIds: string[]
  productCount: number
  visible: boolean
  system?: boolean
}

export const SELLER_COLLECTIONS: Collection[] = [
  { id: 'COL-1', name: 'New Arrivals', rule: 'newest', productIds: [], productCount: 8, visible: true, system: true },
  { id: 'COL-2', name: 'Best Sellers', rule: 'best-selling', productIds: [], productCount: 6, visible: true, system: true },
  { id: 'COL-3', name: 'Featured Products', rule: 'manual', productIds: ['SP-1042', 'SP-1044', 'SP-1056'], productCount: 3, visible: true },
  { id: 'COL-4', name: 'Under $25', rule: 'under-price', ruleValue: 25, productIds: [], productCount: 5, visible: false },
]

export const COLLECTION_RULES: { id: Collection['rule']; label: string; hint: string }[] = [
  { id: 'newest', label: 'Newest first', hint: 'Fills automatically with your most recently added products.' },
  { id: 'best-selling', label: 'Best selling', hint: 'Ranked by units sold over the last 30 days.' },
  { id: 'under-price', label: 'Under a price', hint: 'Every product below the price you set.' },
  { id: 'manual', label: 'Hand-picked', hint: 'You choose exactly which products appear.' },
]

/* -------------------------------------------------------- homepage layout -- */

export type HomepageSectionId =
  | 'announcement'
  | 'hero'
  | 'categories'
  | 'new-arrivals'
  | 'best-sellers'
  | 'featured'
  | 'about'

export type HomepageSection = { id: HomepageSectionId; label: string; hint: string; on: boolean; locked?: boolean }

/** Sections, not pages. The seller toggles and reorders — that is the whole builder. */
export const DEFAULT_HOMEPAGE_SECTIONS: HomepageSection[] = [
  { id: 'announcement', label: 'Announcement bar', hint: 'A thin strip above the header.', on: true },
  { id: 'hero', label: 'Hero banner', hint: 'Your headline, subtext and a shop button.', on: true, locked: true },
  { id: 'categories', label: 'Featured categories', hint: 'Tiles linking into your catalogue.', on: true },
  { id: 'new-arrivals', label: 'New arrivals', hint: 'Your most recently listed products.', on: true },
  { id: 'best-sellers', label: 'Best sellers', hint: 'Ranked by units sold.', on: true },
  { id: 'featured', label: 'Featured products', hint: 'A collection you hand-pick.', on: false },
  { id: 'about', label: 'About the store', hint: 'Your story and contact details.', on: true },
]

/* ---------------------------------------------------------- policy copy --- */

export type PolicyKey = 'returns' | 'shipping' | 'privacy' | 'terms'

export const POLICY_TEMPLATES: { key: PolicyKey; label: string; description: string; template: string }[] = [
  {
    key: 'returns',
    label: 'Return & Refund Policy',
    description: 'When a customer can return, and how quickly they get their money back.',
    template:
      'We accept returns within 7 days of delivery on unused products in their original packaging. Raise the request from My Orders and we will arrange a pickup. Refunds reach the original payment method within 5–7 business days of the returned item passing inspection.',
  },
  {
    key: 'shipping',
    label: 'Shipping Policy',
    description: 'Dispatch times, delivery estimates and what shipping costs.',
    template:
      'Orders are dispatched within 2 business days. Delivery typically takes 3–5 business days depending on your location. Shipping is charged at checkout and is free on orders above the threshold shown in your cart.',
  },
  {
    key: 'privacy',
    label: 'Privacy Policy',
    description: 'What customer data you collect and how it is used.',
    template:
      'We collect only the details needed to process and deliver your order — name, contact details and delivery address. We never sell your data. Payments are handled by SafalMarketHub and we never see your card details.',
  },
  {
    key: 'terms',
    label: 'Terms of Service',
    description: 'The ground rules for buying from your store.',
    template:
      'By placing an order you agree that the details you provide are accurate and that the products are for personal use. Prices and availability may change without notice. Orders may be cancelled before dispatch.',
  },
]

/* ------------------------------------------------------- store analytics -- */

/** The four numbers that answer "is my store working?" — nothing more. */
export const STORE_ANALYTICS = {
  visitors: 3480,
  orders: 124,
  sales: 8940,
  /** Percentage of visitors who bought. */
  conversion: 3.6,
  previous: { visitors: 2960, orders: 98, sales: 7120, conversion: 3.3 },
}

export const STORE_TRAFFIC_14D = [
  { day: '30 Jul', visitors: 198, orders: 6 },
  { day: '31 Jul', visitors: 224, orders: 8 },
  { day: '01 Aug', visitors: 241, orders: 7 },
  { day: '02 Aug', visitors: 268, orders: 9 },
  { day: '03 Aug', visitors: 212, orders: 6 },
  { day: '04 Aug', visitors: 254, orders: 10 },
  { day: '05 Aug', visitors: 289, orders: 11 },
  { day: '06 Aug', visitors: 231, orders: 8 },
  { day: '07 Aug', visitors: 276, orders: 9 },
  { day: '08 Aug', visitors: 312, orders: 12 },
  { day: '09 Aug', visitors: 268, orders: 10 },
  { day: '10 Aug', visitors: 295, orders: 11 },
  { day: '11 Aug', visitors: 334, orders: 14 },
  { day: '12 Aug', visitors: 278, orders: 9 },
]

/** Where the store's visitors came from — enough to know what is working. */
export const STORE_TRAFFIC_SOURCES = [
  { source: 'Direct / QR code', visitors: 1240, orders: 52 },
  { source: 'Instagram', visitors: 1085, orders: 38 },
  { source: 'Google', visitors: 764, orders: 21 },
  { source: 'WhatsApp', visitors: 391, orders: 13 },
]

/* --------------------------------------------------------- abandoned cart -- */

export type AbandonedCart = {
  id: string
  customer: string
  email: string
  value: number
  items: number
  abandonedAt: string
  reminderSent: boolean
  recovered: boolean
}

export const ABANDONED_CARTS: AbandonedCart[] = [
  { id: 'AC-4471', customer: 'Meera Iyer', email: 'm•••@gmail.com', value: 93, items: 2, abandonedAt: '2 hours ago', reminderSent: false, recovered: false },
  { id: 'AC-4468', customer: 'Karan Malhotra', email: 'k•••@outlook.com', value: 120, items: 1, abandonedAt: '6 hours ago', reminderSent: true, recovered: false },
  { id: 'AC-4462', customer: 'Divya Nair', email: 'd•••@gmail.com', value: 44, items: 3, abandonedAt: 'Yesterday', reminderSent: true, recovered: true },
  { id: 'AC-4455', customer: 'Rohan Shetty', email: 'r•••@yahoo.com', value: 62, items: 1, abandonedAt: '2 days ago', reminderSent: true, recovered: false },
]
