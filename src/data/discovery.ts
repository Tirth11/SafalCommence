import { SHOP_PRODUCTS, type ShopProduct } from '@/data/shop'
import { money } from '@/lib/utils'

/* ==========================================================================
   Discovery — the "shopping made simpler" layer.

   Three ways in: type what you want, show us a photo, or let us ask a couple
   of questions. All three end at the same place — a handful of products with
   one short line saying why each one is here.

   The matching below is deliberately plain scoring, not a model. It is honest
   about being a mockup, and it swaps out for a real search API without any of
   the screens changing.
   ========================================================================== */

/** What a product is genuinely good for — drives the "Best for…" line. */
export type NeedTag = 'work' | 'travel' | 'home' | 'fitness' | 'gift' | 'everyday'
export type QualityTag = 'sound' | 'battery' | 'comfort' | 'portable' | 'value' | 'premium'

type ProductFacts = { needs: NeedTag[]; qualities: QualityTag[]; note: string }

/** Hand-tagged because eight products don't need a taxonomy. */
export const PRODUCT_FACTS: Record<string, ProductFacts> = {
  'SH-P-1042': { needs: ['travel', 'work'], qualities: ['sound', 'battery', 'comfort'], note: '40-hour battery and active noise cancelling' },
  'SH-P-1044': { needs: ['fitness', 'everyday'], qualities: ['battery', 'premium'], note: 'Titanium case with a 7-day battery' },
  'SH-P-1046': { needs: ['work', 'everyday'], qualities: ['comfort', 'value'], note: 'Breathable cotton that survives a full day' },
  'SH-P-1048': { needs: ['home', 'gift'], qualities: ['premium', 'value'], note: 'Warm light, hand-finished ceramic' },
  'SH-P-1050': { needs: ['everyday', 'gift'], qualities: ['value'], note: 'A daily-use serum at an easy price' },
  'SH-P-1052': { needs: ['fitness', 'home'], qualities: ['value'], note: 'Replaces a whole rack of fixed weights' },
  'SH-P-1054': { needs: ['travel', 'work'], qualities: ['portable', 'value'], note: 'Charges a laptop from a plug the size of a matchbox' },
  'SH-P-1056': { needs: ['travel'], qualities: ['comfort', 'portable', 'value'], note: 'Carry-on sized, with a padded laptop sleeve' },
}

export const factsFor = (id: string): ProductFacts =>
  PRODUCT_FACTS[id] ?? { needs: ['everyday'], qualities: ['value'], note: 'A solid everyday pick' }

/* ------------------------------------------------------------- shop by need */

export type ShoppingNeed = {
  id: NeedTag | 'gift'
  label: string
  blurb: string
  glyph: 'headphones' | 'watch' | 'shirt' | 'lamp' | 'bottle' | 'dumbbell' | 'bag' | 'camera'
  tone: 'brand' | 'teal' | 'gold' | 'ink'
}

/** People shop by occasion, not by taxonomy. */
export const SHOPPING_NEEDS: ShoppingNeed[] = [
  { id: 'work', label: 'For Work', blurb: 'Laptop kit, accessories and desk essentials', glyph: 'headphones', tone: 'brand' },
  { id: 'travel', label: 'For Travel', blurb: 'Bags, headphones, chargers and more', glyph: 'bag', tone: 'teal' },
  { id: 'home', label: 'For Home', blurb: 'Everyday things that make a place yours', glyph: 'lamp', tone: 'gold' },
  { id: 'fitness', label: 'For Fitness', blurb: 'Kit for training and active days', glyph: 'dumbbell', tone: 'ink' },
  { id: 'gift', label: 'Buying a Gift?', blurb: "Tell us who it's for — we'll help", glyph: 'bottle', tone: 'brand' },
]

/* ----------------------------------------------------------- shop by budget */

export type BudgetBand = { id: string; label: string; max: number }

export const BUDGET_BANDS: BudgetBand[] = [
  { id: 'under-25', label: 'Under $25', max: 25 },
  { id: 'under-50', label: 'Under $50', max: 50 },
  { id: 'under-100', label: 'Under $100', max: 100 },
  { id: 'under-200', label: 'Under $200', max: 200 },
]

/* ---------------------------------------------------------- example prompts */

export const SEARCH_EXAMPLES = [
  'headphones under $80',
  'running shoes for daily use',
  'birthday gift under $30',
  'something for a new desk',
]

/* --------------------------------------------------- the guided question set */

export type GuideStep = {
  id: 'category' | 'budget' | 'priority'
  question: string
  options: { value: string; label: string; hint?: string }[]
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'category',
    question: 'What are you looking for?',
    options: [
      { value: 'Electronics', label: 'Electronics' },
      { value: 'Fashion', label: 'Fashion' },
      { value: 'Home & Living', label: 'Home' },
      { value: 'Beauty', label: 'Beauty' },
      { value: 'Sports', label: 'Fitness' },
      { value: 'any', label: 'Not sure yet' },
    ],
  },
  {
    id: 'budget',
    question: "What's your budget?",
    options: [
      { value: '25', label: 'Up to $25' },
      { value: '50', label: 'Up to $50' },
      { value: '100', label: 'Up to $100' },
      { value: 'any', label: 'No fixed budget' },
    ],
  },
  {
    id: 'priority',
    question: "What matters most?",
    options: [
      { value: 'sound', label: 'Sound' },
      { value: 'battery', label: 'Battery' },
      { value: 'comfort', label: 'Comfort' },
      { value: 'portable', label: 'Travel-friendly' },
      { value: 'value', label: 'Best value' },
    ],
  },
]

/* ---------------------------------------------------------------- matching -- */

export type Match = { product: ShopProduct; reason: string }

/**
 * Score every product against the answers, then explain the winner in one
 * line. Nothing here is clever — it just has to be defensible to a shopper.
 */
export function findMatches(
  { category, budget, priority }: { category?: string; budget?: string; priority?: string },
  limit = 4
): Match[] {
  const cap = budget && budget !== 'any' ? Number(budget) : Infinity

  // Budget is a promise, not a preference — never show something over it.
  const affordable = SHOP_PRODUCTS.filter((p) => p.price <= cap)

  // Same for the category: only widen if that would leave the shopper with
  // nothing, and then say so rather than quietly showing unrelated things.
  const inCategory = category && category !== 'any' ? affordable.filter((p) => p.category === category) : affordable
  const widened = inCategory.length === 0
  const pool = widened ? affordable : inCategory

  const scored = pool
    .map((product) => {
      const facts = factsFor(product.id)
      let score = 1
      if (product.price <= cap * 0.75) score += 1
      if (priority && facts.qualities.includes(priority as QualityTag)) score += 4
      score += product.rating - 4
      return { product, score, facts }
    })
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ product, facts }) => ({
    product,
    reason: widened ? `Nothing in that category under ${money(cap)} — this is close` : explain(product, facts, { cap, priority }),
  }))
}

const PRIORITY_WORDS: Record<string, string> = {
  sound: 'Best for sound',
  battery: 'Best for battery life',
  comfort: 'Most comfortable pick',
  portable: 'Best for travel',
  value: 'Best value',
}

function explain(product: ShopProduct, facts: ProductFacts, ctx: { cap: number; priority?: string }) {
  if (ctx.priority && facts.qualities.includes(ctx.priority as QualityTag)) {
    return PRIORITY_WORDS[ctx.priority] ?? 'Good match'
  }
  if (ctx.cap !== Infinity && product.price <= ctx.cap * 0.75) return 'Comfortably within your budget'
  if (ctx.cap !== Infinity && product.price <= ctx.cap) return 'Good match for your budget'
  if (product.rating >= 4.6) return 'Highly rated by shoppers'
  return facts.note
}

/** Free-text search — the same scoring, driven by words instead of taps. */
export function searchProducts(query: string, limit = 4): Match[] {
  const q = query.toLowerCase().trim()
  if (!q) return []

  // Pull a budget out of phrases like "headphones under $80".
  const priceMatch = q.match(/(?:under|below|less than)\s*\$?\s*(\d+)/)
  const cap = priceMatch ? Number(priceMatch[1]) : Infinity
  const words = q.replace(/(?:under|below|less than)\s*\$?\s*\d+/, '').split(/\s+/).filter((w) => w.length > 2)

  const scored = SHOP_PRODUCTS.map((product) => {
    const facts = factsFor(product.id)
    const haystack = `${product.name} ${product.brand} ${product.category} ${product.categoryPath.join(' ')} ${
      product.shortDescription
    } ${facts.needs.join(' ')} ${facts.qualities.join(' ')}`.toLowerCase()

    const hits = words.filter((word) => haystack.includes(word)).length
    // Being cheap enough is not a reason to appear in someone's search for
    // something else — a word has to match before price is even considered.
    if (words.length > 0 && hits === 0) return { product, score: 0, facts }
    if (product.price > cap) return { product, score: 0, facts }

    return { product, score: hits * 3 + (product.price <= cap * 0.75 ? 1 : 0) + product.rating - 4, facts }
  })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(({ product, facts }) => ({
    product,
    reason: explain(product, facts, { cap }),
  }))
}

/**
 * Photo search, honestly mocked: a real build sends the image to a vision
 * model. Here we return visually similar products so the flow is reviewable.
 */
export function findSimilarToPhoto(limit = 4): Match[] {
  return SHOP_PRODUCTS.slice(0, limit).map((product) => ({
    product,
    reason: factsFor(product.id).note,
  }))
}

/* ------------------------------------------------------------- comparison -- */

/** The rows a shopper actually compares on — no spec dump. */
export function comparisonRows(products: ShopProduct[]) {
  const rows: { label: string; values: string[] }[] = [
    { label: 'Price', values: products.map((p) => money(p.price)) },
    { label: 'Rating', values: products.map((p) => `${p.rating} (${p.reviews})`) },
    { label: 'Delivery', values: products.map((p) => p.deliveryDays) },
    { label: 'Returns', values: products.map((p) => `${p.returnWindowDays} days`) },
    { label: 'Best for', values: products.map((p) => factsFor(p.id).needs.slice(0, 2).join(', ')) },
    { label: 'Sold by', values: products.map((p) => p.seller) },
  ]
  return rows
}

/** Our pick, and the one-line reason for it. */
export function pickWinner(products: ShopProduct[]) {
  if (products.length < 2) return null
  const best = [...products].sort((a, b) => {
    const valueA = a.rating / a.price
    const valueB = b.rating / b.price
    return valueB - valueA
  })[0]
  const cheapest = [...products].sort((a, b) => a.price - b.price)[0]
  const highestRated = [...products].sort((a, b) => b.rating - a.rating)[0]

  const reason =
    best.id === cheapest.id && best.id === highestRated.id
      ? 'Cheaper and better rated than the alternative.'
      : best.id === highestRated.id
        ? 'Best rating of the ones you picked.'
        : 'Better value for what you get.'

  return { product: best, reason }
}
