import { SHOP_PRODUCTS } from '@/data/shop'

/* ==========================================================================
   Catalogue shape for a seller's own website.

   The governing idea: separate catalogue management from campaign
   management. A seller says "10% off everything for Independence Day"
   without touching 5,000 listings, and their customers never meet a wall of
   5,000 products — they arrive through categories, collections, search and
   filters instead.

   Everything here is about the second half of that: how a large catalogue is
   made navigable.
   ========================================================================== */

export type CategoryNode = {
  id: string
  label: string
  /** Product count including descendants — what the storefront displays. */
  count: number
  children?: CategoryNode[]
}

/**
 * Hierarchy, not a flat list. One level stops scaling the moment a seller
 * has more than a dozen categories, and "Electronics" alone tells a shopper
 * nothing when it holds 1,245 products.
 */
export const STORE_CATEGORY_TREE: CategoryNode[] = [
  {
    id: 'electronics',
    label: 'Electronics',
    count: 1245,
    children: [
      {
        id: 'audio',
        label: 'Audio',
        count: 402,
        children: [
          { id: 'headphones', label: 'Headphones', count: 82 },
          { id: 'wireless-headphones', label: 'Wireless Headphones', count: 164 },
          { id: 'speakers', label: 'Speakers', count: 54 },
          { id: 'earbuds', label: 'Earbuds', count: 102 },
        ],
      },
      {
        id: 'wearables',
        label: 'Wearables',
        count: 178,
        children: [
          { id: 'smartwatches', label: 'Smartwatches', count: 64 },
          { id: 'fitness-bands', label: 'Fitness Bands', count: 114 },
        ],
      },
      {
        id: 'power',
        label: 'Power',
        count: 286,
        children: [
          { id: 'chargers', label: 'Chargers', count: 128 },
          { id: 'power-banks', label: 'Power Banks', count: 96 },
          { id: 'cables', label: 'Cables', count: 62 },
        ],
      },
      { id: 'mobile-accessories', label: 'Mobile Accessories', count: 379 },
    ],
  },
  {
    id: 'travel-tech',
    label: 'Travel Tech',
    count: 94,
    children: [
      { id: 'travel-adapters', label: 'Travel Adapters', count: 38 },
      { id: 'tech-organisers', label: 'Tech Organisers', count: 56 },
    ],
  },
  {
    id: 'accessories',
    label: 'Accessories',
    count: 315,
    children: [
      { id: 'laptop-sleeves', label: 'Laptop Sleeves', count: 88 },
      { id: 'backpacks', label: 'Backpacks', count: 141 },
      { id: 'stands', label: 'Stands & Mounts', count: 86 },
    ],
  },
]

/** Flattened, for pickers and counts. */
export function flattenCategories(nodes = STORE_CATEGORY_TREE, depth = 0): { node: CategoryNode; depth: number }[] {
  return nodes.flatMap((node) => [
    { node, depth },
    ...(node.children ? flattenCategories(node.children, depth + 1) : []),
  ])
}

export const TOTAL_STORE_PRODUCTS = STORE_CATEGORY_TREE.reduce((sum, c) => sum + c.count, 0)

/* --------------------------------------------------------- collections -- */

export type StoreCollection = { id: string; label: string; count: number }

export const STORE_COLLECTIONS: StoreCollection[] = [
  { id: 'best-sellers', label: 'Best Sellers', count: 48 },
  { id: 'new-arrivals', label: 'New Arrivals', count: 36 },
  { id: 'summer-essentials', label: 'Summer Essentials', count: 24 },
  { id: 'work-from-home', label: 'Work From Home', count: 61 },
]

export const STORE_BRANDS = ['SoundPro', 'Kairo', 'PowerLine', 'TrailMark', 'HomeCraft']

/* ------------------------------------------------- catalogue display ----- */

/**
 * How the storefront renders a large catalogue. The seller controls the
 * shape without designing pages by hand — which is the only way this stays
 * usable at 50 categories.
 */
export type CatalogueDisplay = {
  /** Categories promoted to the homepage. The rest live behind "View all". */
  homepageCategoryIds: string[]
  productsPerSection: 4 | 8 | 12
  defaultSort: SortId
  showOutOfStock: boolean
  showProductCount: boolean
  showBrands: boolean
  enableFilters: boolean
  enableSearch: boolean
}

export const DEFAULT_CATALOGUE_DISPLAY: CatalogueDisplay = {
  homepageCategoryIds: ['headphones', 'smartwatches', 'mobile-accessories', 'chargers', 'travel-tech', 'speakers'],
  productsPerSection: 8,
  defaultSort: 'recommended',
  showOutOfStock: false,
  showProductCount: true,
  showBrands: true,
  enableFilters: true,
  enableSearch: true,
}

export type SortId =
  | 'recommended'
  | 'best-selling'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'discount'

export const SORT_LABELS: Record<SortId, string> = {
  recommended: 'Recommended',
  'best-selling': 'Best selling',
  newest: 'Newest',
  'price-asc': 'Price: low to high',
  'price-desc': 'Price: high to low',
  rating: 'Highest rated',
  discount: 'Biggest discount',
}

/** Filters a storefront offers on its All Products page. */
export const STORE_FILTERS = ['Category', 'Brand', 'Price', 'Rating', 'Availability', 'Offers', 'Colour']

/* ------------------------------------------------------ homepage sections */

/** Curated sections, so Home never becomes a wall of products. */
export type StoreSectionId =
  | 'campaign-hero'
  | 'search'
  | 'categories'
  | 'deals'
  | 'best-sellers'
  | 'budget'
  | 'new-arrivals'
  | 'help-me-choose'
  | 'reviews'
  | 'trust'

export const STORE_SECTION_LABELS: Record<StoreSectionId, string> = {
  'campaign-hero': 'Campaign hero',
  search: 'Search bar',
  categories: 'Shop by category',
  deals: 'Campaign deals',
  'best-sellers': 'Best sellers',
  budget: 'Shop by budget',
  'new-arrivals': 'New arrivals',
  'help-me-choose': 'Help me choose',
  reviews: 'Customer reviews',
  trust: 'Trust signals',
}

/** A slug for the auto-generated sale page. */
export const saleSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Sample products for previews, priced through the offer engine elsewhere. */
export const previewProducts = SHOP_PRODUCTS.slice(0, 8)
