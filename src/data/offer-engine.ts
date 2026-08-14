import { SHOP_PRODUCTS, type ShopProduct } from '@/data/shop'
import { money } from '@/lib/utils'

/* ==========================================================================
   The Offer Engine.

   Three parties, three responsibilities, one calculator:

     · Super Admin decides what campaigns SafalMarketHub runs, and the limits
       sellers must work inside.
     · Sellers decide how much discount to give on their own products.
     · This engine decides which of those a given customer can actually use
       right now, and what the final price is.

   Everything downstream — homepage, product page, cart, checkout, the
   shopping assistant — reads from `evaluate()`. An offer quoted anywhere is
   an offer that survived every check here, which is the only way the same
   promise holds in all five places.
   ========================================================================== */

export type OfferKind =
  | 'percent'
  | 'flat'
  | 'coupon'
  | 'free-delivery'
  | 'category'
  | 'brand'
  | 'product'
  | 'new-customer'
  | 'customer-specific'
  | 'payment'
  | 'flash-sale'

export const OFFER_KIND_LABELS: Record<OfferKind, string> = {
  percent: 'Percentage discount',
  flat: 'Flat discount',
  coupon: 'Coupon',
  'free-delivery': 'Free delivery',
  category: 'Category offer',
  brand: 'Brand offer',
  product: 'Product offer',
  'new-customer': 'New customer offer',
  'customer-specific': 'Customer-specific offer',
  payment: 'Payment offer',
  'flash-sale': 'Flash sale',
}

export type FundedBy = 'platform' | 'seller' | 'joint' | 'bank'

export const FUNDED_BY_LABELS: Record<FundedBy, string> = {
  platform: 'SafalMarketHub',
  seller: 'Seller',
  joint: 'Jointly funded',
  bank: 'Bank / payment partner',
}

export type ApplicabilityScope = 'marketplace' | 'categories' | 'brands' | 'products' | 'sellers'
export type CustomerScope = 'all' | 'new' | 'existing' | 'segment' | 'specific'

export const CUSTOMER_SCOPE_LABELS: Record<CustomerScope, string> = {
  all: 'All customers',
  new: 'New customers',
  existing: 'Existing customers',
  segment: 'Selected segment',
  specific: 'Specific customers',
}

/** Where an offer is allowed to surface. Set once, honoured everywhere. */
export type Placement =
  | 'homepage'
  | 'offers-page'
  | 'category-page'
  | 'product-page'
  | 'cart'
  | 'checkout'
  | 'assistant'
  | 'notifications'

export const PLACEMENT_LABELS: Record<Placement, string> = {
  homepage: 'Homepage',
  'offers-page': 'Offers page',
  'category-page': 'Category page',
  'product-page': 'Product page',
  cart: 'Cart',
  checkout: 'Checkout',
  assistant: 'Shopping assistant',
  notifications: 'Notifications',
}

export type CombinationRules = {
  withSellerOffer: boolean
  withPaymentOffer: boolean
  withOtherPlatformCoupon: boolean
}

export type OfferStatus = 'draft' | 'scheduled' | 'live' | 'paused' | 'expired' | 'pending-approval' | 'rejected'

export type PlatformOffer = {
  id: string
  source: 'platform'
  kind: OfferKind
  /** Internal name — only staff see this. */
  name: string
  /** What the customer reads. */
  displayName: string
  description: string
  code?: string
  /** Percent for percentage kinds, dollars for flat. */
  value: number
  minOrder: number
  maxDiscount: number | null
  fundedBy: FundedBy
  scope: ApplicabilityScope
  /** Category names, brand names, product ids or seller names, per `scope`. */
  scopeValues: string[]
  customerScope: CustomerScope
  customerScopeValues?: string[]
  startsAt: string
  endsAt: string
  status: OfferStatus
  placements: Placement[]
  combination: CombinationRules
  metrics: OfferMetrics
}

/**
 * Sellers run two different things, and conflating them makes both worse:
 *
 *   · a product offer — one listing, a percentage off, no ceremony. Added
 *     from the product row in a few seconds.
 *   · a campaign — a named, dated promotion across several products
 *     ("Independence Day Sale"), which customers see branded as such and the
 *     seller reports on as one thing.
 */
export type SellerOfferForm = 'product' | 'campaign'

/**
 * What a seller campaign covers. "All my products" is the common case for a
 * seasonal sale and shouldn't require ticking every box — the seller owns
 * their whole catalogue, so listing it back to them is busywork.
 */
export type SellerOfferScope = 'all' | 'category' | 'collection' | 'brand' | 'products'

export const SELLER_SCOPE_LABELS: Record<SellerOfferScope, string> = {
  all: 'Everything in my store',
  category: 'Selected categories',
  collection: 'Selected collections',
  brand: 'Selected brands',
  products: 'Selected products',
}

/**
 * Even a storewide sale usually has things it shouldn't touch. Exclusions are
 * part of the rule rather than a manual de-selection, so they keep holding as
 * the catalogue grows.
 */
export type OfferExclusions = {
  categories: string[]
  brands: string[]
  productIds: string[]
  /** Leave products that already have their own promotion alone. */
  alreadyDiscounted: boolean
}

export const NO_EXCLUSIONS: OfferExclusions = {
  categories: [],
  brands: [],
  productIds: [],
  alreadyDiscounted: false,
}

/**
 * What happens when a product is caught by two of the same seller's offers —
 * say a 15% product markdown and a 10% storewide sale.
 *
 * The default is deliberately `best-single`. Stacking them silently turns a
 * 15% markdown into 23.5% off, which no seller intended when they ticked
 * "10% off everything".
 */
export type DiscountConflictRule = 'best-single' | 'combine' | 'skip-discounted'

export const CONFLICT_RULE_LABELS: Record<DiscountConflictRule, string> = {
  'best-single': 'Give the customer the better single discount',
  'combine': 'Allow both discounts to combine',
  'skip-discounted': "Don't apply this to already-discounted products",
}

export type SellerOffer = {
  id: string
  source: 'seller'
  seller: string
  form: SellerOfferForm
  kind: 'percent' | 'flat'
  /** Campaign name. Product offers have none — their label is the discount. */
  name?: string
  displayName: string
  value: number
  scope: SellerOfferScope
  /** Category, collection or brand names, per `scope`. */
  scopeValues?: string[]
  /** Only when scope is 'products'. Empty for the other scopes. */
  productIds: string[]
  exclusions?: OfferExclusions
  /** How this behaves against the seller's other offers on the same product. */
  conflictRule?: DiscountConflictRule
  startsAt: string
  endsAt: string
  status: OfferStatus
  /** Set when the discount crossed the platform's approval threshold. */
  approvalReason?: string
  metrics: OfferMetrics
}

export type Offer = PlatformOffer | SellerOffer

export type OfferMetrics = {
  views: number
  clicks: number
  customers: number
  orders: number
  gmv: number
  discountGiven: number
  assistantAssisted: number
}

/* ------------------------------------------------- platform-wide settings */

/**
 * The rules sellers work inside. Super Admin owns these; the seller promotion
 * form reads them rather than hard-coding its own limits.
 */
export type SellerOfferPolicy = {
  maxDiscountPercent: number
  maxDurationDays: number
  approvalAbovePercent: number
}

export const SELLER_OFFER_POLICY: SellerOfferPolicy = {
  maxDiscountPercent: 40,
  maxDurationDays: 30,
  approvalAbovePercent: 25,
}

/* --------------------------------------------------------------- the data */

export const PLATFORM_OFFERS: PlatformOffer[] = [
  {
    id: 'PO-2001',
    source: 'platform',
    kind: 'flat',
    name: 'Weekend Electronics Campaign',
    displayName: '$50 OFF Electronics',
    description: 'Save $50 when you spend $250 or more.',
    code: 'SAVE50',
    value: 50,
    minOrder: 250,
    maxDiscount: 50,
    fundedBy: 'platform',
    scope: 'categories',
    scopeValues: ['Electronics'],
    customerScope: 'all',
    startsAt: '2026-08-13T00:00',
    endsAt: '2026-08-17T23:59',
    status: 'live',
    placements: ['homepage', 'offers-page', 'category-page', 'product-page', 'cart', 'checkout', 'assistant', 'notifications'],
    combination: { withSellerOffer: true, withPaymentOffer: true, withOtherPlatformCoupon: false },
    metrics: { views: 48200, clicks: 6140, customers: 1820, orders: 2104, gmv: 184300, discountGiven: 9120, assistantAssisted: 318 },
  },
  {
    id: 'PO-2002',
    source: 'platform',
    kind: 'percent',
    name: 'Electronics Flash Sale',
    displayName: '20% off selected electronics',
    description: 'Up to $40 off, today only.',
    value: 20,
    minOrder: 0,
    maxDiscount: 40,
    fundedBy: 'joint',
    scope: 'categories',
    scopeValues: ['Electronics'],
    customerScope: 'all',
    startsAt: '2026-08-14T00:00',
    endsAt: '2026-08-14T23:59',
    status: 'live',
    placements: ['homepage', 'offers-page', 'product-page', 'cart', 'assistant'],
    combination: { withSellerOffer: true, withPaymentOffer: true, withOtherPlatformCoupon: false },
    metrics: { views: 31400, clicks: 4980, customers: 1240, orders: 1388, gmv: 96200, discountGiven: 12400, assistantAssisted: 244 },
  },
  {
    id: 'PO-2003',
    source: 'platform',
    kind: 'new-customer',
    name: 'First Order Welcome',
    displayName: '$10 off your first order',
    description: 'For customers ordering with us for the first time.',
    code: 'WELCOME10',
    value: 10,
    minOrder: 30,
    maxDiscount: 10,
    fundedBy: 'platform',
    scope: 'marketplace',
    scopeValues: [],
    customerScope: 'new',
    startsAt: '2026-07-01T00:00',
    endsAt: '2026-12-31T23:59',
    status: 'live',
    placements: ['homepage', 'offers-page', 'cart', 'checkout', 'assistant'],
    combination: { withSellerOffer: true, withPaymentOffer: false, withOtherPlatformCoupon: false },
    metrics: { views: 22800, clicks: 3410, customers: 2960, orders: 2960, gmv: 142000, discountGiven: 29600, assistantAssisted: 402 },
  },
  {
    id: 'PO-2004',
    source: 'platform',
    kind: 'free-delivery',
    name: 'Free Delivery Day',
    displayName: 'Free delivery',
    description: 'On every order, no minimum.',
    value: 0,
    minOrder: 0,
    maxDiscount: null,
    fundedBy: 'platform',
    scope: 'marketplace',
    scopeValues: [],
    customerScope: 'all',
    startsAt: '2026-08-14T00:00',
    endsAt: '2026-08-14T23:59',
    status: 'live',
    placements: ['homepage', 'offers-page', 'cart', 'checkout'],
    combination: { withSellerOffer: true, withPaymentOffer: true, withOtherPlatformCoupon: true },
    metrics: { views: 18900, clicks: 2210, customers: 1680, orders: 1712, gmv: 88400, discountGiven: 8560, assistantAssisted: 96 },
  },
  {
    id: 'PO-2005',
    source: 'platform',
    kind: 'payment',
    name: 'Partner Bank Card Offer',
    displayName: '5% back with partner cards',
    description: 'Up to $25 back when paying with a partner bank card.',
    value: 5,
    minOrder: 100,
    maxDiscount: 25,
    fundedBy: 'bank',
    scope: 'marketplace',
    scopeValues: [],
    customerScope: 'all',
    startsAt: '2026-08-20T00:00',
    endsAt: '2026-09-20T23:59',
    status: 'scheduled',
    placements: ['checkout', 'cart', 'offers-page'],
    combination: { withSellerOffer: true, withPaymentOffer: false, withOtherPlatformCoupon: true },
    metrics: { views: 0, clicks: 0, customers: 0, orders: 0, gmv: 0, discountGiven: 0, assistantAssisted: 0 },
  },
  {
    id: 'PO-1998',
    source: 'platform',
    kind: 'flash-sale',
    name: 'Independence Day Sale',
    displayName: '15% off storewide',
    description: 'Ran across the marketplace for 48 hours.',
    value: 15,
    minOrder: 0,
    maxDiscount: 60,
    fundedBy: 'platform',
    scope: 'marketplace',
    scopeValues: [],
    customerScope: 'all',
    startsAt: '2026-08-01T00:00',
    endsAt: '2026-08-03T23:59',
    status: 'expired',
    placements: ['homepage', 'offers-page', 'product-page', 'cart', 'checkout', 'assistant', 'notifications'],
    combination: { withSellerOffer: false, withPaymentOffer: true, withOtherPlatformCoupon: false },
    metrics: { views: 92400, clicks: 14200, customers: 5840, orders: 6910, gmv: 412000, discountGiven: 58400, assistantAssisted: 890 },
  },
]

export const SELLER_OFFERS: SellerOffer[] = [
  {
    id: 'SO-4001',
    source: 'seller',
    scope: 'products',
    seller: 'ABC Electronics',
    form: 'product',
    kind: 'percent',
    displayName: '10% off',
    value: 10,
    productIds: ['SH-P-1042'],
    startsAt: '2026-08-12T00:00',
    endsAt: '2026-08-17T23:59',
    status: 'live',
    metrics: { views: 1840, clicks: 286, customers: 58, orders: 62, gmv: 3460, discountGiven: 384, assistantAssisted: 14 },
  },
  {
    id: 'SO-4002',
    source: 'seller',
    scope: 'products',
    seller: 'ABC Electronics',
    form: 'product',
    kind: 'percent',
    displayName: '30% clearance',
    value: 30,
    productIds: ['SH-P-1054'],
    startsAt: '2026-08-18T00:00',
    endsAt: '2026-08-25T23:59',
    status: 'pending-approval',
    approvalReason: 'Discount above the 25% approval threshold',
    metrics: { views: 0, clicks: 0, customers: 0, orders: 0, gmv: 0, discountGiven: 0, assistantAssisted: 0 },
  },
  {
    id: 'SO-4010',
    source: 'seller',
    seller: 'ABC Electronics',
    form: 'campaign',
    name: 'Independence Day Sale',
    kind: 'percent',
    displayName: 'Independence Day Sale — 10% off',
    value: 10,
    scope: 'all',
    productIds: [],
    startsAt: '2026-08-13T00:00',
    endsAt: '2026-08-18T23:59',
    status: 'live',
    metrics: { views: 6420, clicks: 980, customers: 186, orders: 204, gmv: 12800, discountGiven: 1420, assistantAssisted: 41 },
  },
  {
    id: 'SO-4011',
    source: 'seller',
    seller: 'ABC Electronics',
    form: 'campaign',
    name: 'Monsoon Audio Week',
    kind: 'percent',
    displayName: 'Monsoon Audio Week — 15% off',
    value: 15,
    scope: 'category',
    scopeValues: ['Electronics'],
    productIds: [],
    startsAt: '2026-08-24T00:00',
    endsAt: '2026-08-31T23:59',
    status: 'scheduled',
    metrics: { views: 0, clicks: 0, customers: 0, orders: 0, gmv: 0, discountGiven: 0, assistantAssisted: 0 },
  },
  {
    id: 'SO-3990',
    source: 'seller',
    scope: 'products',
    seller: 'ABC Electronics',
    form: 'product',
    kind: 'flat',
    displayName: '$5 off',
    value: 5,
    productIds: ['SH-P-1044'],
    startsAt: '2026-07-20T00:00',
    endsAt: '2026-07-27T23:59',
    status: 'expired',
    metrics: { views: 2210, clicks: 340, customers: 71, orders: 74, gmv: 8880, discountGiven: 370, assistantAssisted: 9 },
  },
]

/* --------------------------------------------------------------- context */

/** Everything the engine needs to know about who is shopping, and how. */
export type OfferContext = {
  product?: ShopProduct
  /** Order value the offer is being tested against. */
  subtotal: number
  isNewCustomer?: boolean
  /** Set at checkout when a partner card is selected. */
  usingPartnerCard?: boolean
  /** Which surface is asking — an offer hidden from that surface won't apply. */
  placement: Placement
}

export type AppliedOffer = {
  offer: Offer
  label: string
  amount: number
  /** Free delivery saves money without reducing the item price. */
  freeDelivery: boolean
}

export type Evaluation = {
  applied: AppliedOffer[]
  /** Total taken off the item subtotal. */
  discount: number
  freeDelivery: boolean
  finalSubtotal: number
  /** Offers that nearly applied, and the one thing standing in the way. */
  nearMisses: { offer: Offer; reason: string }[]
}

const isActive = (offer: Offer) => statusOf(offer) === 'live'

/**
 * A seller offer only ever covers that seller's own listings — the scope
 * widens which of their products it hits, never whose.
 */
export function sellerOfferCovers(offer: SellerOffer, product: ShopProduct) {
  if (product.seller !== offer.seller) return false

  const inScope = (() => {
    switch (offer.scope) {
      case 'all':
        return true
      case 'category':
        return (offer.scopeValues ?? []).includes(product.category)
      case 'collection':
      case 'brand':
        return (offer.scopeValues ?? []).includes(product.brand)
      case 'products':
        return offer.productIds.includes(product.id)
    }
  })()

  if (!inScope) return false

  // Exclusions are evaluated after scope, so "everything except X" needs no
  // product list and keeps working as the catalogue grows.
  const ex = offer.exclusions
  if (!ex) return true
  if (ex.categories.includes(product.category)) return false
  if (ex.brands.includes(product.brand)) return false
  if (ex.productIds.includes(product.id)) return false

  return true
}

/**
 * Every seller offer that catches this product, resolved down to what the
 * customer actually gets.
 *
 * The default rule is the better single discount, not both. A 15% product
 * markdown plus a 10% storewide sale is 23.5% off if you stack them — a
 * number the seller never agreed to.
 */
function resolveSellerOffer(product: ShopProduct, subtotal: number): SellerOffer | undefined {
  const matches = SELLER_OFFERS.filter((o) => isActive(o) && sellerOfferCovers(o, product))
  if (matches.length <= 1) return matches[0]

  // A product-specific markdown is the one that "already discounted" refers to.
  const specific = matches.find((o) => o.scope === 'products')
  const broad = matches.filter((o) => o.scope !== 'products')

  for (const wide of broad) {
    if (specific && wide.conflictRule === 'skip-discounted') return specific
  }

  const combining = matches.filter((o) => o.conflictRule === 'combine')
  if (combining.length === matches.length) {
    // Every offer opted into stacking — fold them into one synthetic line so
    // the customer sees a single, honest total.
    const total = matches.reduce((sum, o) => sum + amountFor(o, subtotal), 0)
    return {
      ...matches[0],
      id: matches.map((o) => o.id).join('+'),
      displayName: matches.map((o) => o.displayName).join(' + '),
      kind: 'flat',
      value: total,
    }
  }

  return [...matches].sort((a, b) => amountFor(b, subtotal) - amountFor(a, subtotal))[0]
}

/** The products a seller campaign actually touches, for previews and counts. */
export function productsCovered(offer: SellerOffer) {
  return SHOP_PRODUCTS.filter((p) => sellerOfferCovers(offer, p))
}

/**
 * What a storewide campaign would do, before it is published.
 *
 * A seller ticking "everything" has no idea how many listings that is or how
 * many already carry a markdown, and those are exactly the two facts that
 * decide whether the campaign is a good idea.
 */
export function campaignImpact(draft: {
  seller: string
  scope: SellerOfferScope
  scopeValues?: string[]
  productIds: string[]
  exclusions?: OfferExclusions
  percent: number
}) {
  const probe: SellerOffer = {
    id: 'draft',
    source: 'seller',
    seller: draft.seller,
    form: 'campaign',
    kind: 'percent',
    displayName: 'draft',
    value: draft.percent,
    scope: draft.scope,
    scopeValues: draft.scopeValues,
    productIds: draft.productIds,
    exclusions: draft.exclusions,
    startsAt: '2000-01-01T00:00',
    endsAt: '2099-01-01T00:00',
    status: 'live',
    metrics: { views: 0, clicks: 0, customers: 0, orders: 0, gmv: 0, discountGiven: 0, assistantAssisted: 0 },
  }

  const affected = SHOP_PRODUCTS.filter((p) => sellerOfferCovers(probe, p))
  const alreadyDiscounted = affected.filter((p) =>
    SELLER_OFFERS.some((o) => isActive(o) && o.scope === 'products' && o.productIds.includes(p.id))
  )

  const averagePrice = affected.length
    ? Math.round(affected.reduce((sum, p) => sum + p.price, 0) / affected.length)
    : 0

  return {
    affected,
    count: affected.length,
    averagePrice,
    alreadyDiscounted: alreadyDiscounted.length,
    /** What the campaign would give away at current prices, per unit. */
    averageDiscount: Math.round((averagePrice * draft.percent) / 100),
  }
}

/** Does this offer cover this product at all? */
function coversProduct(offer: PlatformOffer, product?: ShopProduct) {
  if (offer.scope === 'marketplace') return true
  // Every remaining scope needs a product to test against.
  if (!product) return false

  switch (offer.scope) {
    case 'categories':
      return offer.scopeValues.includes(product.category)
    case 'brands':
      return offer.scopeValues.includes(product.brand)
    case 'products':
      return offer.scopeValues.includes(product.id)
    case 'sellers':
      return offer.scopeValues.includes(product.seller)
  }
}

function coversCustomer(offer: PlatformOffer, ctx: OfferContext) {
  switch (offer.customerScope) {
    case 'all':
      return true
    case 'new':
      return ctx.isNewCustomer === true
    case 'existing':
      return ctx.isNewCustomer !== true
    case 'segment':
    case 'specific':
      // Segment membership resolves server-side; the mock treats it as a miss
      // rather than silently promising something we cannot verify.
      return false
  }
}

/** What a single offer would take off, ignoring combination rules. */
export function amountFor(offer: Offer, subtotal: number): number {
  if (offer.source === 'seller') {
    return offer.kind === 'flat' ? Math.min(offer.value, subtotal) : Math.round((subtotal * offer.value) / 100)
  }

  if (offer.kind === 'free-delivery') return 0
  if (subtotal < offer.minOrder) return 0

  const raw =
    offer.kind === 'flat' || offer.kind === 'coupon' || offer.kind === 'new-customer'
      ? Math.min(offer.value, subtotal)
      : Math.round((subtotal * offer.value) / 100)

  return offer.maxDiscount === null ? raw : Math.min(raw, offer.maxDiscount)
}

/**
 * The single calculation every surface uses.
 *
 * Order matters and mirrors the documented pipeline: seller offers reduce the
 * item price first (the seller owns their own price), then platform offers
 * apply to what remains, then payment offers, each gated by the combination
 * rules of the offers already applied.
 */
export function evaluate(ctx: OfferContext): Evaluation {
  const nearMisses: Evaluation['nearMisses'] = []
  const applied: AppliedOffer[] = []
  let running = ctx.subtotal
  let freeDelivery = false

  /* 1 — seller offers on this product */
  const sellerOffer = ctx.product ? resolveSellerOffer(ctx.product, running) : undefined

  if (sellerOffer) {
    const amount = amountFor(sellerOffer, running)
    if (amount > 0) {
      applied.push({ offer: sellerOffer, label: `${sellerOffer.displayName} · ${sellerOffer.seller}`, amount, freeDelivery: false })
      running -= amount
    }
  }

  /* 2 — platform offers, best first, honouring combination rules */
  const platformCandidates = PLATFORM_OFFERS.filter((offer) => {
    if (!isActive(offer)) return false
    if (!offer.placements.includes(ctx.placement)) return false
    if (offer.kind === 'payment') return false // handled in step 3
    return true
  })

  let usedPlatformCoupon = false

  for (const offer of [...platformCandidates].sort((a, b) => amountFor(b, running) - amountFor(a, running))) {
    if (!coversProduct(offer, ctx.product)) {
      nearMisses.push({ offer, reason: 'Not valid on this product' })
      continue
    }
    if (!coversCustomer(offer, ctx)) {
      nearMisses.push({ offer, reason: `Only for ${CUSTOMER_SCOPE_LABELS[offer.customerScope].toLowerCase()}` })
      continue
    }
    if (running < offer.minOrder) {
      nearMisses.push({ offer, reason: `Spend ${money(offer.minOrder - running)} more to use this` })
      continue
    }
    if (sellerOffer && !offer.combination.withSellerOffer) {
      nearMisses.push({ offer, reason: "Can't be combined with the seller's offer" })
      continue
    }
    if (usedPlatformCoupon && !offer.combination.withOtherPlatformCoupon) {
      nearMisses.push({ offer, reason: 'Only one SafalMarketHub coupon per order' })
      continue
    }

    if (offer.kind === 'free-delivery') {
      freeDelivery = true
      applied.push({ offer, label: offer.displayName, amount: 0, freeDelivery: true })
      continue
    }

    const amount = amountFor(offer, running)
    if (amount <= 0) continue

    applied.push({ offer, label: offer.displayName, amount, freeDelivery: false })
    running -= amount
    usedPlatformCoupon = true
  }

  /* 3 — payment offers, only when that method is actually selected */
  const paymentOffer = PLATFORM_OFFERS.find(
    (offer) => offer.kind === 'payment' && isActive(offer) && offer.placements.includes(ctx.placement)
  )

  if (paymentOffer) {
    const blockedBySeller = sellerOffer && !paymentOffer.combination.withSellerOffer
    const blockedByPlatform = applied.some((a) => a.offer.source === 'platform' && !a.offer.combination.withPaymentOffer)

    if (!ctx.usingPartnerCard) {
      nearMisses.push({ offer: paymentOffer, reason: 'Pay with a partner card to use this' })
    } else if (blockedBySeller || blockedByPlatform) {
      nearMisses.push({ offer: paymentOffer, reason: "Can't be combined with the offers already applied" })
    } else if (running < paymentOffer.minOrder) {
      nearMisses.push({ offer: paymentOffer, reason: `Spend ${money(paymentOffer.minOrder - running)} more to use this` })
    } else {
      const amount = amountFor(paymentOffer, running)
      if (amount > 0) {
        applied.push({ offer: paymentOffer, label: paymentOffer.displayName, amount, freeDelivery: false })
        running -= amount
      }
    }
  }

  return {
    applied,
    discount: ctx.subtotal - running,
    freeDelivery,
    finalSubtotal: running,
    nearMisses,
  }
}

/** The headline a product card or PDP shows, if any. */
export function bestOfferBadge(product: ShopProduct, placement: Placement = 'product-page') {
  const result = evaluate({ product, subtotal: product.price, placement })
  if (!result.applied.length) return null
  const best = [...result.applied].sort((a, b) => b.amount - a.amount)[0]
  return { label: best.label, amount: best.amount, finalPrice: result.finalSubtotal }
}

/* ------------------------------------------------------------- reporting */

export const offerById = (id: string): Offer | undefined =>
  [...PLATFORM_OFFERS, ...SELLER_OFFERS].find((o) => o.id === id)

export function conversionRate(metrics: OfferMetrics) {
  return metrics.clicks === 0 ? 0 : Math.round((metrics.orders / metrics.clicks) * 1000) / 10
}

/** What the campaign cost us, which is not the same as what it discounted. */
export function offerCost(offer: Offer) {
  if (offer.source === 'seller') return 0
  switch (offer.fundedBy) {
    case 'platform':
      return offer.metrics.discountGiven
    case 'joint':
      return Math.round(offer.metrics.discountGiven / 2)
    case 'seller':
    case 'bank':
      return 0
  }
}

/** Products a seller can promote — never another seller's listing. */
export function sellableProducts(seller: string) {
  return SHOP_PRODUCTS.filter((p) => p.seller === seller)
}

export function statusOf(offer: Offer, now = new Date('2026-08-14T12:00:00')): OfferStatus {
  if (offer.status === 'draft' || offer.status === 'paused') return offer.status
  if (offer.status === 'pending-approval' || offer.status === 'rejected') return offer.status
  if (new Date(offer.endsAt) < now) return 'expired'
  if (new Date(offer.startsAt) > now) return 'scheduled'
  return 'live'
}
