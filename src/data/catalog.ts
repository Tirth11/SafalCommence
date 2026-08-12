export type Category = {
  id: string
  label: string
  count: string
  glyph: ProductGlyph
}

export type ProductGlyph = 'headphones' | 'watch' | 'shirt' | 'lamp' | 'bottle' | 'dumbbell' | 'bag' | 'camera'

export type Product = {
  id: string
  name: string
  brand: string
  seller: string
  rating: number
  reviews: number
  mrp: number
  price: number
  category: string
  glyph: ProductGlyph
  tone: 'brand' | 'teal' | 'gold' | 'ink'
  badge?: string
}

export const CATEGORIES: Category[] = [
  { id: 'electronics', label: 'Electronics', count: '2.4k products', glyph: 'headphones' },
  { id: 'fashion', label: 'Fashion', count: '5.1k products', glyph: 'shirt' },
  { id: 'home', label: 'Home & Living', count: '1.8k products', glyph: 'lamp' },
  { id: 'beauty', label: 'Beauty', count: '960 products', glyph: 'bottle' },
  { id: 'sports', label: 'Sports', count: '740 products', glyph: 'dumbbell' },
  { id: 'accessories', label: 'Accessories', count: '1.2k products', glyph: 'bag' },
]

export const PRODUCTS: Product[] = [
  {
    id: 'SH-P-1042',
    name: 'Wireless Noise Cancelling Headphones',
    brand: 'SoundPro',
    seller: 'TechWorld',
    rating: 4.6,
    reviews: 214,
    mrp: 100,
    price: 69,
    category: 'Electronics',
    glyph: 'headphones',
    tone: 'brand',
    badge: 'Bestseller',
  },
  {
    id: 'SH-P-1043',
    name: 'Titanium Smartwatch — Series 4',
    brand: 'Kairo',
    seller: 'GadgetHub Retail',
    rating: 4.4,
    reviews: 128,
    mrp: 160,
    price: 120,
    category: 'Electronics',
    glyph: 'watch',
    tone: 'ink',
  },
  {
    id: 'SH-P-1044',
    name: 'Premium Cotton Oversized Shirt',
    brand: 'Muhl',
    seller: 'Urban Threads',
    rating: 4.7,
    reviews: 342,
    mrp: 31,
    price: 16,
    category: 'Fashion',
    glyph: 'shirt',
    tone: 'teal',
    badge: 'New',
  },
  {
    id: 'SH-P-1045',
    name: 'Ceramic Table Lamp with Linen Shade',
    brand: 'Loom & Clay',
    seller: 'HomeCraft Studio',
    rating: 4.5,
    reviews: 87,
    mrp: 44,
    price: 31,
    category: 'Home & Living',
    glyph: 'lamp',
    tone: 'gold',
  },
  {
    id: 'SH-P-1046',
    name: 'Vitamin C Brightening Face Serum',
    brand: 'Aurea',
    seller: 'GlowKart',
    rating: 4.3,
    reviews: 496,
    mrp: 24,
    price: 14,
    category: 'Beauty',
    glyph: 'bottle',
    tone: 'brand',
  },
  {
    id: 'SH-P-1047',
    name: 'Adjustable Dumbbell Set — 20 kg',
    brand: 'IronCore',
    seller: 'FitZone Sports',
    rating: 4.8,
    reviews: 156,
    mrp: 110,
    price: 79,
    category: 'Sports',
    glyph: 'dumbbell',
    tone: 'ink',
  },
]

/** Seller dashboard preview data */
export const DASHBOARD_STATS = [
  { label: 'Total Sales', value: '$3,100', delta: '+18.4%', trend: 'up' as const },
  { label: 'Orders', value: '486', delta: '+42 this week', trend: 'up' as const },
  { label: 'Products', value: '128', delta: '12 added', trend: 'flat' as const },
  { label: 'Pending Orders', value: '24', delta: 'Needs action', trend: 'alert' as const },
  { label: 'Settlement Due', value: '$540', delta: 'On 18 Aug', trend: 'flat' as const },
]

export const SALES_SERIES = [
  { month: 'Feb', sales: 1500 },
  { month: 'Mar', sales: 1800 },
  { month: 'Apr', sales: 1600 },
  { month: 'May', sales: 2100 },
  { month: 'Jun', sales: 2400 },
  { month: 'Jul', sales: 2600 },
  { month: 'Aug', sales: 3100 },
]

export const RECENT_ORDERS = [
  { id: '#SH-10482', customer: 'R. Mehta', item: 'Wireless Headphones', amount: '$69', status: 'New' as const },
  { id: '#SH-10481', customer: 'S. Iyer', item: 'Titanium Smartwatch', amount: '$120', status: 'Packed' as const },
  { id: '#SH-10480', customer: 'A. Khan', item: 'Cotton Oversized Shirt', amount: '$16', status: 'Shipped' as const },
  { id: '#SH-10479', customer: 'D. Rao', item: 'Ceramic Table Lamp', amount: '$31', status: 'Delivered' as const },
]

export const LOW_STOCK = [
  { name: 'Wireless Headphones', sku: 'SP-WH-102', left: 4 },
  { name: 'Vitamin C Serum', sku: 'AU-SR-055', left: 7 },
  { name: 'Adjustable Dumbbell Set', sku: 'IC-DB-020', left: 2 },
]
