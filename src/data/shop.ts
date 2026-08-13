/* ==========================================================================
   SafalMarketHub — Customer / Buyer mock data
   Only what a shopper is allowed to see: no commission, no seller banking,
   no internal sub-order ids.
   ========================================================================== */

import type { ProductGlyph } from '@/data/catalog'

export type Tone = 'brand' | 'teal' | 'gold' | 'ink'

export type VariantOption = { name: string; values: { label: string; available: boolean }[] }

export type ShopProduct = {
  id: string
  slug: string
  name: string
  brand: string
  seller: string
  sellerSince: string
  sellerRating: number
  category: string
  categoryPath: string[]
  glyph: ProductGlyph
  tone: Tone
  images: number
  mrp: number
  price: number
  rating: number
  reviews: number
  stock: number
  taxNote: string
  returnWindowDays: number
  deliveryDays: string
  badge?: string
  shortDescription: string
  description: string
  specs: { label: string; value: string }[]
  options: VariantOption[]
  highlights: string[]
  /** Oversized items some couriers won't carry to every PIN. */
  bulky?: boolean
}

export const SHOP_CATEGORIES = [
  {
    id: 'electronics',
    label: 'Electronics',
    glyph: 'headphones' as ProductGlyph,
    tone: 'brand' as Tone,
    count: 2410,
    children: [
      { label: 'Audio', children: ['Headphones', 'Earbuds', 'Speakers'] },
      { label: 'Wearables', children: ['Smartwatches', 'Fitness Bands'] },
      { label: 'Power', children: ['Chargers', 'Power Banks'] },
    ],
  },
  {
    id: 'fashion',
    label: 'Fashion',
    glyph: 'shirt' as ProductGlyph,
    tone: 'teal' as Tone,
    count: 5120,
    children: [
      { label: 'Women', children: ['Ethnic', 'Tops', 'Dresses'] },
      { label: 'Men', children: ['Shirts', 'T-Shirts'] },
    ],
  },
  { id: 'home', label: 'Home & Living', glyph: 'lamp' as ProductGlyph, tone: 'gold' as Tone, count: 1804, children: [{ label: 'Lighting', children: ['Table Lamps'] }, { label: 'Decor', children: [] }] },
  { id: 'beauty', label: 'Beauty', glyph: 'bottle' as ProductGlyph, tone: 'brand' as Tone, count: 962, children: [{ label: 'Skincare', children: ['Serums', 'Moisturisers'] }] },
  { id: 'sports', label: 'Sports', glyph: 'dumbbell' as ProductGlyph, tone: 'ink' as Tone, count: 741, children: [{ label: 'Fitness', children: ['Weights'] }] },
  { id: 'accessories', label: 'Accessories', glyph: 'bag' as ProductGlyph, tone: 'teal' as Tone, count: 1240, children: [{ label: 'Bags', children: ['Backpacks', 'Sleeves'] }] },
]

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: 'SH-P-1042',
    slug: 'wireless-noise-cancelling-headphones',
    name: 'Wireless Noise Cancelling Headphones',
    brand: 'SoundPro',
    seller: 'ABC Electronics',
    sellerSince: 'February 2026',
    sellerRating: 4.6,
    category: 'Electronics',
    categoryPath: ['Electronics', 'Audio', 'Headphones'],
    glyph: 'headphones',
    tone: 'brand',
    images: 6,
    mrp: 87,
    price: 62,
    rating: 4.6,
    reviews: 214,
    stock: 12,
    taxNote: 'Inclusive of all taxes',
    returnWindowDays: 7,
    deliveryDays: '16–18 Aug',
    badge: 'Bestseller',
    shortDescription: 'Hybrid active noise cancellation with 40-hour battery life.',
    description:
      'Over-ear headphones with hybrid active noise cancellation, 40-hour battery life and multipoint Bluetooth 5.3. Memory-foam earcups, foldable hinge and a hard travel case are included in the box.',
    specs: [
      { label: 'Driver', value: '40 mm dynamic' },
      { label: 'Battery life', value: 'Up to 40 hours (ANC on)' },
      { label: 'Charging', value: 'USB-C, 10 min = 5 hours' },
      { label: 'Connectivity', value: 'Bluetooth 5.3, multipoint' },
      { label: 'Weight', value: '268 g' },
      { label: 'In the box', value: 'Headphones, case, USB-C cable, 3.5 mm cable' },
    ],
    options: [
      {
        name: 'Colour',
        values: [
          { label: 'Black', available: true },
          { label: 'White', available: true },
          { label: 'Blue', available: false },
        ],
      },
    ],
    highlights: ['Hybrid ANC with transparency mode', '40-hour battery life', '2-year brand warranty', 'Multipoint pairing'],
  },
  {
    id: 'SH-P-1044',
    slug: 'titanium-smartwatch-series-4',
    name: 'Titanium Smartwatch — Series 4',
    brand: 'Kairo',
    seller: 'GadgetHub Retail',
    sellerSince: 'August 2026',
    sellerRating: 4.4,
    category: 'Electronics',
    categoryPath: ['Electronics', 'Wearables', 'Smartwatches'],
    glyph: 'watch',
    tone: 'ink',
    images: 5,
    mrp: 160,
    price: 120,
    rating: 4.4,
    reviews: 128,
    stock: 3,
    taxNote: 'Inclusive of all taxes',
    returnWindowDays: 7,
    deliveryDays: '17–19 Aug',
    shortDescription: 'Titanium case, AMOLED display, 12-day battery.',
    description:
      'A lightweight titanium smartwatch with a 1.43" AMOLED display, dual-band GPS, SpO₂ and sleep tracking, and up to 12 days of battery life. 5 ATM water resistance.',
    specs: [
      { label: 'Display', value: '1.43" AMOLED, 466 × 466' },
      { label: 'Case', value: 'Grade-5 titanium' },
      { label: 'Battery', value: 'Up to 12 days' },
      { label: 'Water resistance', value: '5 ATM' },
      { label: 'Sensors', value: 'HR, SpO₂, GPS, altimeter' },
    ],
    options: [
      { name: 'Case size', values: [{ label: '42 mm', available: true }, { label: '46 mm', available: true }] },
      { name: 'Strap', values: [{ label: 'Titanium', available: true }, { label: 'Fluoroelastomer', available: true }, { label: 'Leather', available: false }] },
    ],
    highlights: ['Grade-5 titanium case', '12-day battery life', 'Dual-band GPS', '5 ATM water resistance'],
  },
  {
    id: 'SH-P-1046',
    slug: 'premium-cotton-oversized-shirt',
    name: 'Premium Cotton Oversized Shirt',
    brand: 'Muhl',
    seller: 'Urban Threads',
    sellerSince: 'August 2026',
    sellerRating: 4.7,
    category: 'Fashion',
    categoryPath: ['Fashion', 'Men', 'Shirts'],
    glyph: 'shirt',
    tone: 'teal',
    images: 8,
    mrp: 31,
    price: 16,
    rating: 4.7,
    reviews: 342,
    stock: 64,
    taxNote: 'Inclusive of all taxes',
    returnWindowDays: 7,
    deliveryDays: '16–18 Aug',
    badge: 'New',
    shortDescription: 'Pre-shrunk 100% cotton, relaxed oversized fit.',
    description:
      'A relaxed oversized shirt in pre-shrunk 100% cotton with a soft garment wash. Drop shoulders, curved hem and corozo buttons.',
    specs: [
      { label: 'Fabric', value: '100% cotton, 180 GSM' },
      { label: 'Fit', value: 'Oversized' },
      { label: 'Care', value: 'Machine wash cold' },
      { label: 'Origin', value: 'India' },
    ],
    options: [
      { name: 'Colour', values: [{ label: 'Ecru', available: true }, { label: 'Olive', available: true }, { label: 'Black', available: true }] },
      {
        name: 'Size',
        values: [
          { label: 'S', available: true },
          { label: 'M', available: true },
          { label: 'L', available: true },
          { label: 'XL', available: false },
        ],
      },
    ],
    highlights: ['Pre-shrunk cotton', 'Garment washed for softness', '7-day easy returns'],
  },
  {
    id: 'SH-P-1048',
    slug: 'ceramic-table-lamp',
    name: 'Ceramic Table Lamp with Linen Shade',
    brand: 'Loom & Clay',
    seller: 'HomeCraft Studio',
    sellerSince: 'August 2026',
    sellerRating: 4.5,
    category: 'Home & Living',
    categoryPath: ['Home & Living', 'Lighting', 'Table Lamps'],
    glyph: 'lamp',
    tone: 'gold',
    images: 4,
    mrp: 44,
    price: 31,
    rating: 4.5,
    reviews: 87,
    stock: 18,
    taxNote: 'Inclusive of all taxes',
    returnWindowDays: 7,
    deliveryDays: '18–21 Aug',
    shortDescription: 'Hand-glazed ceramic base with a natural linen shade.',
    description: 'A hand-glazed ceramic lamp base paired with a natural linen drum shade. E27 socket, 1.8 m braided cord with inline switch. Bulb not included.',
    specs: [
      { label: 'Material', value: 'Glazed ceramic, linen' },
      { label: 'Height', value: '42 cm' },
      { label: 'Socket', value: 'E27, max 15 W LED' },
      { label: 'Cord', value: '1.8 m braided' },
    ],
    options: [{ name: 'Finish', values: [{ label: 'Sand', available: true }, { label: 'Slate', available: true }] }],
    highlights: ['Hand-glazed base', 'Natural linen shade', 'Inline switch'],
  },
  {
    id: 'SH-P-1050',
    slug: 'vitamin-c-face-serum',
    name: 'Vitamin C Brightening Face Serum',
    brand: 'Aurea',
    seller: 'GlowKart',
    sellerSince: 'March 2026',
    sellerRating: 4.3,
    category: 'Beauty',
    categoryPath: ['Beauty', 'Skincare', 'Serums'],
    glyph: 'bottle',
    tone: 'brand',
    images: 5,
    mrp: 24,
    price: 14,
    rating: 4.3,
    reviews: 496,
    stock: 0,
    taxNote: 'Inclusive of all taxes',
    returnWindowDays: 0,
    deliveryDays: '17–19 Aug',
    shortDescription: '15% L-ascorbic acid with ferulic acid and vitamin E.',
    description: 'A lightweight brightening serum with 15% L-ascorbic acid, ferulic acid and vitamin E in an airless pump bottle.',
    specs: [
      { label: 'Volume', value: '30 ml' },
      { label: 'Key actives', value: '15% L-ascorbic acid, ferulic acid' },
      { label: 'Skin type', value: 'All, patch test advised' },
      { label: 'Shelf life', value: '24 months' },
    ],
    options: [{ name: 'Size', values: [{ label: '30 ml', available: true }] }],
    highlights: ['15% vitamin C', 'Airless pump', 'Dermatologically tested'],
  },
  {
    id: 'SH-P-1052',
    slug: 'adjustable-dumbbell-set-20kg',
    name: 'Adjustable Dumbbell Set — 20 kg',
    brand: 'IronCore',
    seller: 'FitZone Sports',
    sellerSince: 'April 2026',
    sellerRating: 4.8,
    category: 'Sports',
    categoryPath: ['Sports', 'Fitness', 'Weights'],
    glyph: 'dumbbell',
    tone: 'ink',
    images: 4,
    mrp: 110,
    price: 79,
    rating: 4.8,
    reviews: 156,
    stock: 9,
    taxNote: 'Inclusive of all taxes',
    returnWindowDays: 7,
    deliveryDays: '19–22 Aug',
    shortDescription: 'Cast-iron plates with quick-lock collars, 2 × 10 kg.',
    description: 'A pair of adjustable dumbbells with cast-iron plates, knurled chrome handles and quick-lock spin collars. Total 20 kg.',
    specs: [
      { label: 'Total weight', value: '20 kg (2 × 10 kg)' },
      { label: 'Plates', value: 'Cast iron, powder coated' },
      { label: 'Handle', value: 'Knurled chrome, 35 cm' },
    ],
    options: [{ name: 'Weight', values: [{ label: '20 kg', available: true }, { label: '30 kg', available: true }] }],
    highlights: ['Quick-lock collars', 'Cast-iron plates', 'Knurled grip'],
    bulky: true,
  },
  {
    id: 'SH-P-1054',
    slug: 'usb-c-65w-gan-charger',
    name: 'USB-C 65W GaN Charger',
    brand: 'SoundPro',
    seller: 'ABC Electronics',
    sellerSince: 'February 2026',
    sellerRating: 4.6,
    category: 'Electronics',
    categoryPath: ['Electronics', 'Power', 'Chargers'],
    glyph: 'bottle',
    tone: 'gold',
    images: 3,
    mrp: 37,
    price: 24,
    rating: 4.2,
    reviews: 74,
    stock: 120,
    taxNote: 'Inclusive of all taxes',
    returnWindowDays: 7,
    deliveryDays: '16–18 Aug',
    shortDescription: 'Two-port GaN charger, charges a laptop and phone together.',
    description: 'A compact 65 W GaN charger with two USB-C ports and foldable pins. Supports PD 3.0 and PPS.',
    specs: [
      { label: 'Output', value: '65 W total, PD 3.0 + PPS' },
      { label: 'Ports', value: '2 × USB-C' },
      { label: 'Pins', value: 'Foldable, Indian 2-pin' },
    ],
    options: [{ name: 'Colour', values: [{ label: 'White', available: true }, { label: 'Black', available: true }] }],
    highlights: ['65 W GaN', 'Dual USB-C', 'Foldable pins'],
  },
  {
    id: 'SH-P-1056',
    slug: 'canvas-travel-backpack-30l',
    name: 'Canvas Travel Backpack 30L',
    brand: 'TravelGear',
    seller: 'TravelGear Store',
    sellerSince: 'May 2026',
    sellerRating: 4.5,
    category: 'Accessories',
    categoryPath: ['Accessories', 'Bags', 'Backpacks'],
    glyph: 'bag',
    tone: 'teal',
    images: 6,
    mrp: 50,
    price: 31,
    rating: 4.5,
    reviews: 203,
    stock: 26,
    taxNote: 'Inclusive of all taxes',
    returnWindowDays: 7,
    deliveryDays: '17–20 Aug',
    shortDescription: 'Water-resistant canvas, padded 16" laptop sleeve.',
    description: 'A 30 L cabin-friendly backpack in water-resistant waxed canvas with a padded 16" laptop sleeve, luggage pass-through and hidden back pocket.',
    specs: [
      { label: 'Capacity', value: '30 L' },
      { label: 'Laptop sleeve', value: 'Up to 16 inch' },
      { label: 'Material', value: 'Waxed canvas, water resistant' },
      { label: 'Weight', value: '1.1 kg' },
    ],
    options: [{ name: 'Colour', values: [{ label: 'Olive', available: true }, { label: 'Charcoal', available: true }, { label: 'Tan', available: true }] }],
    highlights: ['Cabin friendly', 'Padded laptop sleeve', 'Luggage pass-through'],
    bulky: true,
  },
]

export const getProduct = (id: string) => SHOP_PRODUCTS.find((p) => p.id === id || p.slug === id)

/* -------------------------------------------------------------- delivery --- */
/** PIN codes that mock a serviceable area. Everything else is unavailable. */
export const SERVICEABLE_PINS = ['400001', '400053', '400069', '110024', '560038', '600020', '380015', '700029', '411001']

/**
 * PIN codes where the courier network can't carry oversized items. Used to show
 * the per-item serviceability warning rather than failing the whole checkout.
 */
export const NO_BULKY_DELIVERY_PINS = ['400001', '110024']

export function isDeliverable(productId: string, pin: string) {
  if (!SERVICEABLE_PINS.includes(pin)) return false
  const product = SHOP_PRODUCTS.find((p) => p.id === productId)
  if (product?.bulky && NO_BULKY_DELIVERY_PINS.includes(pin)) return false
  return true
}

/* -------------------------------------------------------------- addresses -- */
export type Address = {
  id: string
  label: 'Home' | 'Work' | 'Other'
  name: string
  phone: string
  line1: string
  line2?: string
  landmark?: string
  city: string
  state: string
  pin: string
  isDefault: boolean
}

export const CUSTOMER_ADDRESSES: Address[] = [
  {
    id: 'ADDR-1',
    label: 'Home',
    name: 'Rohit Sharma',
    phone: '+91 98765 43210',
    line1: 'Flat 1204, Oberoi Springs',
    line2: 'Andheri West',
    landmark: 'Near Infiniti Mall',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400053',
    isDefault: true,
  },
  {
    id: 'ADDR-2',
    label: 'Work',
    name: 'Rohit Sharma',
    phone: '+91 98765 43210',
    line1: '7th Floor, Peninsula Business Park',
    line2: 'Lower Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400001',
    isDefault: false,
  },
]

/* ------------------------------------------------------------- shipping ---- */
export const SHIPPING_OPTIONS = [
  { id: 'standard', label: 'Standard Delivery', price: 5, estimate: '3–5 business days' },
  { id: 'express', label: 'Express Delivery', price: 15, estimate: '1–2 business days' },
]

/* --------------------------------------------------------------- orders ---- */
export type CustomerOrderStatus = 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Returned'

export type Shipment = {
  id: string
  seller: string
  status: CustomerOrderStatus
  items: { productId: string; name: string; variant: string; qty: number; price: number; glyph: ProductGlyph; tone: Tone }[]
  courier?: string
  tracking?: string
  estimate: string
  deliveredOn?: string
  returnableUntil?: string
}

export type CustomerOrder = {
  id: string
  placedOn: string
  status: CustomerOrderStatus
  total: number
  subtotal: number
  discount: number
  shipping: number
  tax: number
  paymentMethod: string
  paymentStatus: 'Paid' | 'Refunded' | 'Partially Refunded' | 'Failed'
  address: Address
  shipments: Shipment[]
  cancellable: boolean
  cancelReason?: string
}

export const CUSTOMER_ORDERS: CustomerOrder[] = [
  {
    id: 'SH-100145',
    placedOn: '12 Aug 2026',
    status: 'Shipped',
    subtotal: 93,
    discount: 5,
    shipping: 5,
    tax: 7,
    total: 93,
    paymentMethod: 'UPI · Google Pay',
    paymentStatus: 'Paid',
    address: CUSTOMER_ADDRESSES[0],
    cancellable: false,
    shipments: [
      {
        id: 'SHP-1',
        seller: 'ABC Electronics',
        status: 'Shipped',
        estimate: 'Arriving 16 Aug',
        courier: 'Delhivery',
        tracking: 'DLV12345678',
        items: [{ productId: 'SH-P-1042', name: 'Wireless Noise Cancelling Headphones', variant: 'Black', qty: 1, price: 62, glyph: 'headphones', tone: 'brand' }],
      },
      {
        id: 'SHP-2',
        seller: 'TravelGear Store',
        status: 'Processing',
        estimate: 'Ships by 15 Aug',
        items: [{ productId: 'SH-P-1056', name: 'Canvas Travel Backpack 30L', variant: 'Olive', qty: 1, price: 31, glyph: 'bag', tone: 'teal' }],
      },
    ],
  },
  {
    id: 'SH-100131',
    placedOn: '09 Aug 2026',
    status: 'Out for Delivery',
    subtotal: 120,
    discount: 6,
    shipping: 0,
    tax: 9,
    total: 114,
    paymentMethod: 'Credit Card · **** 4242',
    paymentStatus: 'Paid',
    address: CUSTOMER_ADDRESSES[0],
    cancellable: false,
    shipments: [
      {
        id: 'SHP-3',
        seller: 'GadgetHub Retail',
        status: 'Out for Delivery',
        estimate: 'Arriving today',
        courier: 'Blue Dart',
        tracking: 'BD5512099834',
        items: [{ productId: 'SH-P-1044', name: 'Titanium Smartwatch — Series 4', variant: '46 mm · Titanium', qty: 1, price: 120, glyph: 'watch', tone: 'ink' }],
      },
    ],
  },
  {
    id: 'SH-100118',
    placedOn: '05 Aug 2026',
    status: 'Processing',
    subtotal: 31,
    discount: 2,
    shipping: 5,
    tax: 2,
    total: 34,
    paymentMethod: 'UPI · PhonePe',
    paymentStatus: 'Paid',
    address: CUSTOMER_ADDRESSES[1],
    cancellable: true,
    shipments: [
      {
        id: 'SHP-4',
        seller: 'HomeCraft Studio',
        status: 'Processing',
        estimate: 'Ships by 14 Aug',
        items: [{ productId: 'SH-P-1048', name: 'Ceramic Table Lamp with Linen Shade', variant: 'Sand', qty: 1, price: 31, glyph: 'lamp', tone: 'gold' }],
      },
    ],
  },
  {
    id: 'SH-100096',
    placedOn: '28 Jul 2026',
    status: 'Delivered',
    subtotal: 79,
    discount: 4,
    shipping: 5,
    tax: 6,
    total: 80,
    paymentMethod: 'UPI · Google Pay',
    paymentStatus: 'Paid',
    address: CUSTOMER_ADDRESSES[0],
    cancellable: false,
    shipments: [
      {
        id: 'SHP-5',
        seller: 'FitZone Sports',
        status: 'Delivered',
        estimate: 'Delivered 02 Aug',
        courier: 'Ecom Express',
        tracking: 'EE9982143007',
        deliveredOn: '02 Aug 2026',
        returnableUntil: '19 Aug 2026',
        items: [{ productId: 'SH-P-1052', name: 'Adjustable Dumbbell Set — 20 kg', variant: '20 kg', qty: 1, price: 79, glyph: 'dumbbell', tone: 'ink' }],
      },
    ],
  },
  {
    id: 'SH-100072',
    placedOn: '18 Jul 2026',
    status: 'Cancelled',
    subtotal: 24,
    discount: 1,
    shipping: 5,
    tax: 2,
    total: 28,
    paymentMethod: 'UPI · Google Pay',
    paymentStatus: 'Refunded',
    address: CUSTOMER_ADDRESSES[0],
    cancellable: false,
    cancelReason: 'Ordered by mistake',
    shipments: [
      {
        id: 'SHP-6',
        seller: 'ABC Electronics',
        status: 'Cancelled',
        estimate: 'Cancelled 18 Jul',
        items: [{ productId: 'SH-P-1054', name: 'USB-C 65W GaN Charger', variant: 'White', qty: 1, price: 24, glyph: 'bottle', tone: 'gold' }],
      },
    ],
  },
]

export const getOrder = (id: string) => CUSTOMER_ORDERS.find((o) => o.id === id)

export const ORDER_TABS = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returns'] as const

/** Customer-facing tracking steps for an order. */
export function trackingSteps(status: CustomerOrderStatus) {
  const order: CustomerOrderStatus[] = ['Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']
  const index = order.indexOf(status)
  return order.map((step, i) => ({
    // The first step reads as a completed event, matching the confirmation email.
    label: step === 'Confirmed' ? 'Order Confirmed' : step,
    done: i < index,
    current: i === index,
  }))
}

/* -------------------------------------------------- returns and refunds --- */
export type CustomerReturn = {
  id: string
  order: string
  productId: string
  product: string
  variant: string
  reason: string
  requestedOn: string
  status: 'Return Requested' | 'Under Review' | 'Approved' | 'Pickup Scheduled' | 'Product Picked Up' | 'Quality Check' | 'Refund Initiated' | 'Refunded' | 'Rejected'
  amount: number
  refundId?: string
  refundedOn?: string
  refundTo: string
  rejectionReason?: string
}

export const CUSTOMER_RETURNS: CustomerReturn[] = [
  {
    id: 'RET-10023',
    order: 'SH-100096',
    productId: 'SH-P-1052',
    product: 'Adjustable Dumbbell Set — 20 kg',
    variant: '20 kg',
    reason: 'Product not as described',
    requestedOn: '11 Aug 2026',
    status: 'Quality Check',
    amount: 79,
    refundTo: 'UPI · Google Pay',
  },
  {
    id: 'RET-10011',
    order: 'SH-100064',
    productId: 'SH-P-1050',
    product: 'Vitamin C Brightening Face Serum',
    variant: '30 ml',
    reason: 'Product damaged',
    requestedOn: '30 Jul 2026',
    status: 'Refunded',
    amount: 14,
    refundId: 'RF-10021',
    refundedOn: '04 Aug 2026',
    refundTo: 'UPI · Google Pay',
  },
  {
    id: 'RET-10004',
    order: 'SH-100041',
    productId: 'SH-P-1046',
    product: 'Premium Cotton Oversized Shirt',
    variant: 'Olive · M',
    reason: 'Changed my mind',
    requestedOn: '14 Jul 2026',
    status: 'Rejected',
    amount: 16,
    refundTo: 'Credit Card · **** 4242',
    rejectionReason: 'The request was raised after the 7-day return window closed on 12 Jul 2026.',
  },
]

export const RETURN_LIFECYCLE: CustomerReturn['status'][] = [
  'Return Requested',
  'Under Review',
  'Approved',
  'Pickup Scheduled',
  'Product Picked Up',
  'Quality Check',
  'Refund Initiated',
  'Refunded',
]

export const RETURN_REASONS = [
  'Product damaged',
  'Wrong item received',
  'Product not as described',
  'Defective product',
  'Missing parts or accessories',
  'Other',
]

export const CANCEL_REASONS = [
  'Ordered by mistake',
  'Found another product',
  'Delivery taking too long',
  'Incorrect address',
  'Other',
]

/* -------------------------------------------------------- notifications --- */
export type CustomerNotification = {
  id: string
  kind: 'order' | 'payment' | 'return' | 'account'
  title: string
  detail: string
  at: string
  unread: boolean
  to?: string
}

export const CUSTOMER_NOTIFICATIONS: CustomerNotification[] = [
  { id: 'CN-1', kind: 'order', title: 'Your order SH-100145 has shipped', detail: 'Delhivery · DLV12345678 · arriving 16 Aug', at: '2 hours ago', unread: true, to: '/account/orders/SH-100145' },
  { id: 'CN-2', kind: 'order', title: 'Arriving today', detail: 'SH-100131 · Titanium Smartwatch is out for delivery', at: '5 hours ago', unread: true, to: '/account/orders/SH-100131' },
  { id: 'CN-3', kind: 'return', title: 'Return update', detail: 'RET-10023 is in quality check', at: 'Yesterday', unread: true, to: '/account/returns' },
  { id: 'CN-4', kind: 'payment', title: 'Refund completed', detail: '$14refunded to UPI · Google Pay', at: '04 Aug 2026', unread: false, to: '/account/returns' },
  { id: 'CN-5', kind: 'order', title: 'Order delivered', detail: 'SH-100096 · Adjustable Dumbbell Set', at: '02 Aug 2026', unread: false, to: '/account/orders/SH-100096' },
  { id: 'CN-6', kind: 'account', title: 'Welcome to SafalMarketHub', detail: 'Your account is ready', at: '18 Jan 2026', unread: false },
]

/* -------------------------------------------------------------- support --- */
export type CustomerTicket = {
  id: string
  subject: string
  category: string
  order?: string
  created: string
  status: 'Open' | 'In Progress' | 'Waiting for You' | 'Resolved' | 'Closed'
  lastMessage: string
}

export const CUSTOMER_TICKETS: CustomerTicket[] = [
  { id: 'TKT-4412', subject: 'Refund not received for cancelled order', category: 'Payment Issue', order: 'SH-100072', created: '20 Jul 2026', status: 'Resolved', lastMessage: 'The refund was credited on 23 Jul. Please check your bank statement.' },
  { id: 'TKT-4460', subject: 'Dumbbell weight does not match listing', category: 'Return / Refund', order: 'SH-100096', created: '11 Aug 2026', status: 'In Progress', lastMessage: 'We have asked the seller to respond. Your return is in quality check.' },
]

export const SUPPORT_TOPICS = [
  { label: 'My Order', body: 'Delivery status, delays, wrong item.' },
  { label: 'Payment Issue', body: 'Failed payments, double charges, refunds.' },
  { label: 'Return / Refund', body: 'Start a return or check refund status.' },
  { label: 'Delivery Issue', body: 'Address changes and missed deliveries.' },
  { label: 'Account Issue', body: 'Sign-in, profile and address problems.' },
  { label: 'Other', body: 'Anything else we can help with.' },
]

/* -------------------------------------------------------------- profile --- */
export const CUSTOMER_PROFILE = {
  firstName: 'Rohit',
  lastName: 'Sharma',
  email: 'rohit.sharma@example.com',
  phone: '+91 98765 43210',
  memberSince: '18 Jan 2026',
}
