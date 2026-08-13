import { SELLER_ORDERS, SELLER_PRODUCTS, SELLER_TRANSACTIONS, type SellerProduct } from '@/data/seller'

/* ==========================================================================
   What the Seller Assistant knows.

   Everything here is derived from the seller's own data. Two rules shape it:

     · It never invents product facts. Asked to "add Sony headphones", it
       asks which model rather than inventing a battery life and a warranty.
     · Competitor data is public-only — listed price, delivery estimate and
       rating. Never another seller's cost, margin, or commercial terms.
   ========================================================================== */

/* ------------------------------------------------------------- pricing --- */

export type CompetitorListing = {
  seller: string
  price: number
  deliveryDays: string
  rating: number
  isYou?: boolean
}

/** Public listings for the same product, as a shopper would see them. */
export const COMPETITOR_LISTINGS: Record<string, CompetitorListing[]> = {
  'SH-P-1042': [
    { seller: 'SoundBase', price: 59, deliveryDays: '3 days', rating: 4.4 },
    { seller: 'AudioLine', price: 62, deliveryDays: '2 days', rating: 4.6 },
    { seller: 'GadgetHub Retail', price: 66, deliveryDays: '1 day', rating: 4.8 },
  ],
  'SH-P-1044': [
    { seller: 'WristCo', price: 112, deliveryDays: '2 days', rating: 4.3 },
    { seller: 'GadgetHub Retail', price: 124, deliveryDays: '1 day', rating: 4.8 },
  ],
  'SH-P-1051': [
    { seller: 'SoundBase', price: 32, deliveryDays: '3 days', rating: 4.2 },
    { seller: 'AudioLine', price: 39, deliveryDays: '2 days', rating: 4.5 },
  ],
  'SH-P-1058': [
    { seller: 'PowerKart', price: 21, deliveryDays: '2 days', rating: 4.1 },
    { seller: 'GadgetHub Retail', price: 26, deliveryDays: '1 day', rating: 4.8 },
  ],
  'SH-P-1070': [
    { seller: 'TravelGear Store', price: 13, deliveryDays: '3 days', rating: 4.5 },
    { seller: 'PackRight', price: 17, deliveryDays: '4 days', rating: 4.1 },
  ],
}

export type PriceInsight = {
  low: number
  average: number
  high: number
  yourPrice: number
  /** Positive when the seller is above the market average. */
  difference: number
  listings: CompetitorListing[]
  suggestions: { price: number; label: string; note: string }[]
  verdict: string
}

/**
 * Market context for one product. Returns null when there is nothing to
 * compare against — a made-up range is worse than admitting we don't know.
 */
export function priceInsightFor(product: SellerProduct): PriceInsight | null {
  const others = COMPETITOR_LISTINGS[product.id]
  if (!others?.length) return null

  const all = [...others, { seller: 'You', price: product.price, deliveryDays: '3 days', rating: 4.5, isYou: true }]
  const prices = others.map((l) => l.price)
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  const average = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
  const difference = product.price - average

  const competitive = Math.max(low, Math.round(low * 1.02))
  const balanced = average
  const margin = product.price

  const verdict =
    difference > 2
      ? `Your price is ${difference} dollars above the marketplace average.`
      : difference < -2
        ? `Your price is ${Math.abs(difference)} dollars below the marketplace average.`
        : 'Your price is about level with the marketplace average.'

  return {
    low,
    average,
    high,
    yourPrice: product.price,
    difference,
    listings: all.sort((a, b) => a.price - b.price),
    suggestions: [
      { price: competitive, label: 'Competitive', note: 'Matches the cheapest listing' },
      { price: balanced, label: 'Balanced', note: 'Level with the market average' },
      { price: margin, label: 'Higher margin', note: 'Your current price' },
    ],
    verdict,
  }
}

/** What the seller keeps at a given price, so nobody cuts blind. */
export function marginAt(product: SellerProduct, price: number, commissionRate: number) {
  // Cost isn't captured in the product form yet; assume a typical 70% of the
  // current price so the figure is clearly indicative rather than invented.
  const cost = Math.round(product.price * 0.7)
  const fee = Math.round((price * commissionRate) / 100)
  const earnings = price - fee - cost
  return {
    cost,
    fee,
    earnings,
    marginPercent: price > 0 ? Math.round((earnings / price) * 100) : 0,
    thin: earnings <= 0 || (price > 0 && earnings / price < 0.08),
  }
}

/* ------------------------------------------------------------- reviews --- */

export type ReviewSummary = {
  rating: number
  count: number
  likes: string[]
  dislikes: string[]
  trend?: string
}

export const REVIEW_SUMMARIES: Record<string, ReviewSummary> = {
  'SH-P-1042': {
    rating: 4.3,
    count: 214,
    likes: ['Sound quality', 'Battery life', 'Comfortable for long wear'],
    dislikes: ['Ear cushions get warm', 'Packaging', 'Bluetooth pairing on some phones'],
    trend: 'Packaging complaints increased this month.',
  },
  'SH-P-1044': {
    rating: 4.4,
    count: 128,
    likes: ['Build quality', 'Battery lasts a week', 'Screen brightness'],
    dislikes: ['Strap sizing', 'App setup'],
  },
  'SH-P-1051': {
    rating: 4.2,
    count: 96,
    likes: ['Loud for its size', 'Battery', 'Value'],
    dislikes: ['Bass at high volume', 'No carry pouch'],
  },
}

/* ------------------------------------------------------------ business --- */

/** Plain-language answers to the questions sellers actually ask. */
export function businessSnapshot() {
  const sold = SELLER_PRODUCTS.reduce((sum, p) => sum + p.sold, 0)
  const gross = SELLER_TRANSACTIONS.reduce((sum, t) => sum + t.gross, 0)
  const pending = SELLER_ORDERS.filter((o) => ['New', 'Processing', 'Packed'].includes(o.status))
  const lowStock = SELLER_PRODUCTS.filter((p) => p.available > 0 && p.available <= p.lowStockAt)
  const outOfStock = SELLER_PRODUCTS.filter((p) => p.available === 0)
  const settlementDue = SELLER_TRANSACTIONS.filter((t) => t.status !== 'Settled').reduce((s, t) => s + t.earnings, 0)

  return { sold, gross, pending, lowStock, outOfStock, settlementDue }
}

export function topSellers(limit = 3) {
  return [...SELLER_PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, limit)
}

export function slowestSeller() {
  return [...SELLER_PRODUCTS].sort((a, b) => a.sold - b.sold)[0]
}

/** Suggestions drawn from the seller's own numbers — never auto-applied. */
export function suggestedActions() {
  const { lowStock } = businessSnapshot()
  const out: { title: string; body: string; to: string }[] = []

  const urgent = lowStock.sort((a, b) => a.available - b.available)[0]
  if (urgent) {
    out.push({
      title: `Restock ${urgent.name}`,
      body: `Only ${urgent.available} left and ${urgent.sold} sold in the last 30 days.`,
      to: '/seller/inventory',
    })
  }

  const overpriced = SELLER_PRODUCTS.filter((p) => {
    const insight = priceInsightFor(p)
    return insight && insight.difference > 2
  })
  if (overpriced.length) {
    out.push({
      title: `${overpriced.length} product${overpriced.length === 1 ? '' : 's'} priced above market`,
      body: 'Other sellers list the same items lower. Worth a look before your next promotion.',
      to: '/seller/products',
    })
  }

  const slow = slowestSeller()
  if (slow && slow.available > 20) {
    out.push({
      title: `Consider promoting ${slow.name}`,
      body: `${slow.available} in stock but only ${slow.sold} sold recently.`,
      to: '/seller/marketing',
    })
  }

  return out
}

/* ---------------------------------------------------------- bulk upload -- */

export const EXCEL_COLUMNS = [
  'Product Name',
  'Brand',
  'Category',
  'Subcategory',
  'Description',
  'SKU',
  'Barcode',
  'MRP',
  'Selling Price',
  'GST',
  'HSN',
  'Stock',
  'Low Stock Threshold',
  'Weight',
  'Length',
  'Width',
  'Height',
  'Colour',
  'Size',
  'Image URLs',
]

export type UploadIssue = {
  row: number
  product: string
  issue: string
  severity: 'error' | 'warning'
  /** What the assistant would propose, when it can propose something. */
  suggestion?: string
}

/** A realistic validation result: mostly fine, a handful genuinely wrong. */
export const UPLOAD_RESULT = {
  total: 146,
  ready: 132,
  warnings: 9,
  errors: 5,
  issues: [
    { row: 14, product: 'Wireless Headphones Pro', issue: 'Selling price missing', severity: 'error' as const },
    { row: 36, product: 'Travel Backpack 45L', issue: 'Category not recognised', severity: 'warning' as const, suggestion: 'Travel → Bags → Backpacks' },
    { row: 52, product: 'Smartwatch Lite', issue: 'SKU already exists', severity: 'error' as const },
    { row: 71, product: 'USB-C Cable 2m', issue: 'Category not recognised', severity: 'warning' as const, suggestion: 'Electronics → Power → Cables' },
    { row: 88, product: 'Desk Lamp Warm', issue: 'Stock is not a number', severity: 'error' as const },
    { row: 94, product: 'Canvas Tote', issue: 'Category not recognised', severity: 'warning' as const, suggestion: 'Travel → Bags → Totes' },
    { row: 110, product: 'Earbuds Mini', issue: 'MRP lower than selling price', severity: 'error' as const },
    { row: 121, product: 'Yoga Mat 6mm', issue: 'Missing HSN code', severity: 'warning' as const, suggestion: '95069110' },
    { row: 133, product: 'Water Bottle 1L', issue: 'Image URL unreachable', severity: 'error' as const },
  ] satisfies UploadIssue[],
}
