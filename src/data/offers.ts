import { SHOP_PRODUCTS } from '@/data/shop'

/* ==========================================================================
   Offers.

   Three kinds, and the difference matters to a shopper:
     · today's   — running now, anyone can use them
     · for you   — tied to something they saved, viewed or bought
     · upcoming  — starts later, so the only action is "remind me"

   Nothing here is invented at render time. The assistant reads this list and
   may only quote an offer that exists in it and is currently valid.
   ========================================================================== */

export type OfferKind = 'percent' | 'flat' | 'shipping'

export type Offer = {
  id: string
  code?: string
  kind: OfferKind
  /** Percent for 'percent', dollars for 'flat'. */
  value: number
  headline: string
  detail: string
  minOrder: number
  maxDiscount: number | null
  endsLabel: string
  category?: string
  tone: 'brand' | 'teal' | 'gold' | 'ink'
}

export const TODAY_OFFERS: Offer[] = [
  {
    id: 'OF-201',
    kind: 'percent',
    value: 20,
    headline: '20% off',
    detail: 'Selected electronics',
    minOrder: 0,
    maxDiscount: 40,
    endsLabel: 'Ends tonight',
    category: 'Electronics',
    tone: 'brand',
  },
  {
    id: 'OF-202',
    code: 'SAVE10',
    kind: 'flat',
    value: 10,
    headline: 'Extra $10 off',
    detail: 'Orders above $60',
    minOrder: 60,
    maxDiscount: null,
    endsLabel: '3 days left',
    tone: 'teal',
  },
  {
    id: 'OF-203',
    kind: 'shipping',
    value: 0,
    headline: 'Free delivery',
    detail: 'On every order, no minimum',
    minOrder: 0,
    maxDiscount: null,
    endsLabel: 'Today only',
    tone: 'gold',
  },
]

/* -------------------------------------------------------------- for you --- */

export type PersonalOffer = {
  id: string
  productId: string
  reason: 'price-drop' | 'wishlist' | 'back-in-stock' | 'buy-again'
  label: string
  wasPrice: number
}

export const PERSONAL_OFFERS: PersonalOffer[] = [
  { id: 'PO-1', productId: 'SH-P-1042', reason: 'price-drop', label: 'Price dropped since you looked', wasPrice: 87 },
  { id: 'PO-2', productId: 'SH-P-1056', reason: 'wishlist', label: 'Saved item, now cheaper', wasPrice: 50 },
  { id: 'PO-3', productId: 'SH-P-1054', reason: 'back-in-stock', label: 'Back in stock', wasPrice: 37 },
]

/* ------------------------------------------------------------- upcoming --- */

export type UpcomingOffer = {
  id: string
  title: string
  starts: string
  detail: string
  tone: 'brand' | 'teal' | 'gold' | 'ink'
}

/** Two at most. A homepage full of things you cannot buy yet is a waste. */
export const UPCOMING_OFFERS: UpcomingOffer[] = [
  { id: 'UP-1', title: 'Weekend Electronics Sale', starts: 'Starts Saturday', detail: 'Up to 25% off selected products', tone: 'brand' },
  { id: 'UP-2', title: 'Travel Week', starts: 'Starts 18 Aug', detail: 'Bags, accessories and travel kit', tone: 'teal' },
]

/* --------------------------------------------------------------- helpers -- */

/** What an offer takes off a given order, honouring minimums and caps. */
export function offerDiscount(offer: Offer, subtotal: number) {
  if (subtotal < offer.minOrder) return 0
  if (offer.kind === 'shipping') return 0
  if (offer.kind === 'flat') return Math.min(offer.value, subtotal)
  const raw = Math.round((subtotal * offer.value) / 100)
  return offer.maxDiscount === null ? raw : Math.min(raw, offer.maxDiscount)
}

/**
 * The best offer a cart actually qualifies for. Returns null rather than the
 * closest near-miss — suggesting an offer the shopper cannot use is worse
 * than saying nothing.
 */
export function bestOfferFor(subtotal: number, category?: string) {
  const eligible = TODAY_OFFERS.filter((offer) => {
    if (subtotal < offer.minOrder) return false
    if (offer.category && offer.category !== category) return false
    return offerDiscount(offer, subtotal) > 0
  })
  if (!eligible.length) return null

  return eligible.reduce((best, offer) =>
    offerDiscount(offer, subtotal) > offerDiscount(best, subtotal) ? offer : best
  )
}

export const productFor = (id: string) => SHOP_PRODUCTS.find((p) => p.id === id)
