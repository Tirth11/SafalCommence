/* ==========================================================================
   SafalMarketHub — Seller Portal mock data (single seller: ABC Electronics)
   Shapes mirror the seller-scoped API. Nothing here crosses organisations —
   a seller never sees another seller's data.
   ========================================================================== */

import type { ProductGlyph } from '@/data/catalog'

export type SellerProductStatus =
  | 'Draft'
  | 'Under Review'
  | 'Changes Required'
  | 'Approved'
  | 'Active'
  | 'Paused'
  | 'Rejected'
  | 'Out of Stock'
  | 'Archived'

export type SellerProduct = {
  id: string
  name: string
  sku: string
  brand: string
  category: string
  glyph: ProductGlyph
  tone: 'brand' | 'teal' | 'gold' | 'ink'
  mrp: number
  price: number
  available: number
  reserved: number
  lowStockAt: number
  status: SellerProductStatus
  updated: string
  images: number
  variants: { sku: string; attributes: string; price: number; available: number }[]
  adminComment?: string
}

export const SELLER_PRODUCTS: SellerProduct[] = [
  {
    id: 'SH-P-1042',
    name: 'Wireless Noise Cancelling Headphones',
    sku: 'WH-001',
    brand: 'SoundPro',
    category: 'Electronics › Audio',
    glyph: 'headphones',
    tone: 'brand',
    mrp: 7999,
    price: 5499,
    available: 4,
    reserved: 2,
    lowStockAt: 10,
    status: 'Active',
    updated: '11 Aug 2026',
    images: 6,
    variants: [
      { sku: 'WH-001-BLK', attributes: 'Black', price: 5499, available: 2 },
      { sku: 'WH-001-WHT', attributes: 'White', price: 5499, available: 2 },
    ],
  },
  {
    id: 'SH-P-1044',
    name: 'Titanium Smartwatch — Series 4',
    sku: 'SW-004',
    brand: 'Kairo',
    category: 'Electronics › Wearables',
    glyph: 'watch',
    tone: 'ink',
    mrp: 12999,
    price: 9499,
    available: 36,
    reserved: 4,
    lowStockAt: 8,
    status: 'Active',
    updated: '09 Aug 2026',
    images: 5,
    variants: [{ sku: 'SW-004-TI', attributes: 'Titanium', price: 9499, available: 36 }],
  },
  {
    id: 'SH-P-1051',
    name: 'Portable Bluetooth Speaker — 20W',
    sku: 'BS-020',
    brand: 'SoundPro',
    category: 'Electronics › Audio',
    glyph: 'headphones',
    tone: 'teal',
    mrp: 4499,
    price: 2999,
    available: 0,
    reserved: 0,
    lowStockAt: 10,
    status: 'Out of Stock',
    updated: '08 Aug 2026',
    images: 4,
    variants: [{ sku: 'BS-020-GRY', attributes: 'Grey', price: 2999, available: 0 }],
  },
  {
    id: 'SH-P-1058',
    name: 'USB-C 65W GaN Charger',
    sku: 'CH-065',
    brand: 'SoundPro',
    category: 'Electronics › Power',
    glyph: 'bottle',
    tone: 'gold',
    mrp: 2999,
    price: 1899,
    available: 120,
    reserved: 0,
    lowStockAt: 15,
    status: 'Changes Required',
    updated: '11 Aug 2026',
    images: 2,
    variants: [{ sku: 'CH-065-WHT', attributes: 'White', price: 1899, available: 120 }],
    adminComment: 'Please upload clearer images and update the product specifications. The current images are low resolution and the description is missing charging protocol details.',
  },
  {
    id: 'SH-P-1063',
    name: 'Over-Ear Studio Monitor Headphones',
    sku: 'WH-090',
    brand: 'SoundPro',
    category: 'Electronics › Audio',
    glyph: 'headphones',
    tone: 'ink',
    mrp: 15999,
    price: 11999,
    available: 18,
    reserved: 0,
    lowStockAt: 5,
    status: 'Under Review',
    updated: '11 Aug 2026',
    images: 7,
    variants: [{ sku: 'WH-090-BLK', attributes: 'Black', price: 11999, available: 18 }],
  },
  {
    id: 'SH-P-1070',
    name: 'Laptop Sleeve 14-inch',
    sku: 'LS-014',
    brand: 'SoundPro',
    category: 'Accessories › Bags',
    glyph: 'bag',
    tone: 'teal',
    mrp: 1999,
    price: 1199,
    available: 42,
    reserved: 1,
    lowStockAt: 10,
    status: 'Draft',
    updated: '10 Aug 2026',
    images: 1,
    variants: [{ sku: 'LS-014-GRY', attributes: 'Grey', price: 1199, available: 42 }],
  },
  {
    id: 'SH-P-1077',
    name: 'Wired Earphones with Mic',
    sku: 'EP-002',
    brand: 'SoundPro',
    category: 'Electronics › Audio',
    glyph: 'headphones',
    tone: 'brand',
    mrp: 999,
    price: 599,
    available: 6,
    reserved: 0,
    lowStockAt: 12,
    status: 'Paused',
    updated: '02 Aug 2026',
    images: 3,
    variants: [{ sku: 'EP-002-BLK', attributes: 'Black', price: 599, available: 6 }],
  },
]

/* --------------------------------------------------------------- orders --- */
export type SellerOrderStatus = 'New' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned'

export type SellerOrder = {
  id: string
  parentOrder: string
  /** Which channel produced the sale — decides the fee SafalMarketHub charges. */
  channel: 'marketplace' | 'store'
  date: string
  customer: string
  city: string
  address: string
  phoneMasked: string
  items: { name: string; variant: string; sku: string; qty: number; price: number; glyph: ProductGlyph; tone: 'brand' | 'teal' | 'gold' | 'ink' }[]
  productValue: number
  shipping: number
  commission: number
  otherCharges: number
  settlement: number
  payment: 'Paid' | 'Pending' | 'Refunded'
  status: SellerOrderStatus
  courier?: string
  awb?: string
  shippedOn?: string
  deliveredOn?: string
  expectedDelivery?: string
  settlementDate?: string
  returnCase?: {
    id: string
    reason: string
    requested: string
    status: 'Requested' | 'Under Review' | 'Approved' | 'Pickup Scheduled' | 'Returned' | 'Refund Processed' | 'Rejected'
  }
}

export const SELLER_ORDERS: SellerOrder[] = [
  {
    id: 'SH-100145-01',
    parentOrder: 'SH-100145',
    channel: 'marketplace',
    date: '12 Aug 2026, 09:14',
    customer: 'Rahul Sharma',
    city: 'Mumbai',
    address: '1204, Oberoi Springs, Andheri West, Mumbai, Maharashtra 400053',
    phoneMasked: '+91 98••• ••210',
    items: [
      { name: 'Wireless Noise Cancelling Headphones', variant: 'Black', sku: 'WH-001-BLK', qty: 1, price: 4999, glyph: 'headphones', tone: 'brand' },
    ],
    productValue: 4999,
    shipping: 0,
    commission: 500,
    otherCharges: 50,
    settlement: 4449,
    payment: 'Paid',
    status: 'New',
  },
  {
    id: 'SH-100142-01',
    parentOrder: 'SH-100142',
    channel: 'store',
    date: '12 Aug 2026, 08:02',
    customer: 'Ananya Gupta',
    city: 'Gurugram',
    address: 'B-704, DLF Phase 3, Gurugram, Haryana 122010',
    phoneMasked: '+91 91••• ••780',
    items: [{ name: 'Titanium Smartwatch — Series 4', variant: 'Titanium', sku: 'SW-004-TI', qty: 1, price: 9499, glyph: 'watch', tone: 'ink' }],
    productValue: 9499,
    shipping: 0,
    commission: 950,
    otherCharges: 0,
    settlement: 8549,
    payment: 'Paid',
    status: 'New',
  },
  {
    id: 'SH-100138-01',
    parentOrder: 'SH-100138',
    channel: 'marketplace',
    date: '11 Aug 2026, 19:41',
    customer: 'Dev Patel',
    city: 'Surat',
    address: '22, Vesu Main Road, Surat, Gujarat 395007',
    phoneMasked: '+91 97••• ••445',
    items: [
      { name: 'Wireless Noise Cancelling Headphones', variant: 'White', sku: 'WH-001-WHT', qty: 2, price: 5499, glyph: 'headphones', tone: 'brand' },
    ],
    productValue: 10998,
    shipping: 99,
    commission: 1100,
    otherCharges: 60,
    settlement: 9937,
    payment: 'Paid',
    status: 'Processing',
  },
  {
    id: 'SH-100131-01',
    parentOrder: 'SH-100131',
    channel: 'store',
    date: '11 Aug 2026, 12:20',
    customer: 'Nikita Bose',
    city: 'Kolkata',
    address: '31 Southern Avenue, Kolkata, West Bengal 700029',
    phoneMasked: '+91 88••• ••543',
    items: [{ name: 'USB-C 65W GaN Charger', variant: 'White', sku: 'CH-065-WHT', qty: 1, price: 1899, glyph: 'bottle', tone: 'gold' }],
    productValue: 1899,
    shipping: 0,
    commission: 190,
    otherCharges: 0,
    settlement: 1709,
    payment: 'Paid',
    status: 'Packed',
  },
  {
    id: 'SH-100124-01',
    parentOrder: 'SH-100124',
    channel: 'marketplace',
    date: '10 Aug 2026, 16:35',
    customer: 'Lakshmi Menon',
    city: 'Kochi',
    address: 'Villa 12, Panampilly Nagar, Kochi, Kerala 682036',
    phoneMasked: '+91 90••• ••412',
    items: [{ name: 'Titanium Smartwatch — Series 4', variant: 'Titanium', sku: 'SW-004-TI', qty: 1, price: 9499, glyph: 'watch', tone: 'ink' }],
    productValue: 9499,
    shipping: 0,
    commission: 950,
    otherCharges: 0,
    settlement: 8549,
    payment: 'Paid',
    status: 'Shipped',
    courier: 'Delhivery',
    awb: 'DLV12345678',
    shippedOn: '11 Aug 2026',
    expectedDelivery: '16 Aug 2026',
  },
  {
    id: 'SH-100109-01',
    parentOrder: 'SH-100109',
    channel: 'store',
    date: '06 Aug 2026, 11:12',
    customer: 'Imran Sheikh',
    city: 'Hyderabad',
    address: '8-2-120, Road No. 2, Banjara Hills, Hyderabad, Telangana 500034',
    phoneMasked: '+91 99••• ••223',
    items: [
      { name: 'Portable Bluetooth Speaker — 20W', variant: 'Grey', sku: 'BS-020-GRY', qty: 1, price: 2999, glyph: 'headphones', tone: 'teal' },
    ],
    productValue: 2999,
    shipping: 0,
    commission: 300,
    otherCharges: 0,
    settlement: 2699,
    payment: 'Paid',
    status: 'Delivered',
    courier: 'Blue Dart',
    awb: 'BD5512099834',
    shippedOn: '07 Aug 2026',
    deliveredOn: '09 Aug 2026, 14:22',
    settlementDate: '16 Aug 2026',
  },
  {
    id: 'SH-100098-01',
    parentOrder: 'SH-100098',
    channel: 'marketplace',
    date: '03 Aug 2026, 10:04',
    customer: 'Rohit Sharma',
    city: 'Mumbai',
    address: '1204, Oberoi Springs, Andheri West, Mumbai, Maharashtra 400053',
    phoneMasked: '+91 98••• ••210',
    items: [
      { name: 'Wireless Noise Cancelling Headphones', variant: 'Black', sku: 'WH-001-BLK', qty: 1, price: 5499, glyph: 'headphones', tone: 'brand' },
    ],
    productValue: 5499,
    shipping: 0,
    commission: 550,
    otherCharges: 0,
    settlement: 4949,
    payment: 'Paid',
    status: 'Delivered',
    courier: 'Delhivery',
    awb: 'DLV99001122',
    shippedOn: '04 Aug 2026',
    deliveredOn: '06 Aug 2026, 11:40',
    settlementDate: '13 Aug 2026',
    returnCase: {
      id: 'RET-2208',
      reason: 'Product damaged — right earcup not working',
      requested: '11 Aug 2026',
      status: 'Under Review',
    },
  },
  {
    id: 'SH-100091-01',
    parentOrder: 'SH-100091',
    channel: 'marketplace',
    date: '01 Aug 2026, 15:26',
    customer: 'Sana Kapoor',
    city: 'Pune',
    address: '14 Ambedkar Road, Camp, Pune, Maharashtra 411001',
    phoneMasked: '+91 90••• ••123',
    items: [{ name: 'Wired Earphones with Mic', variant: 'Black', sku: 'EP-002-BLK', qty: 3, price: 599, glyph: 'headphones', tone: 'brand' },
    ],
    productValue: 1797,
    shipping: 49,
    commission: 180,
    otherCharges: 0,
    settlement: 1666,
    payment: 'Refunded',
    status: 'Cancelled',
  },
]

export const ORDER_TABS = ['All', 'New', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Returned'] as const

/* --------------------------------------------------------- transactions --- */
export type SellerTransaction = {
  id: string
  order: string
  channel: 'marketplace' | 'store'
  date: string
  gross: number
  commission: number
  refund: number
  otherDeduction: number
  earnings: number
  status: 'Settlement Pending' | 'Settlement Eligible' | 'Settled' | 'Reversed'
  settlementId?: string
}

export const SELLER_TRANSACTIONS: SellerTransaction[] = [
  { id: 'TXN-90211', order: 'SH-100145-01', channel: 'marketplace', date: '12 Aug 2026', gross: 4999, commission: 500, refund: 0, otherDeduction: 50, earnings: 4449, status: 'Settlement Pending' },
  { id: 'TXN-90208', order: 'SH-100142-01', channel: 'store', date: '12 Aug 2026', gross: 9499, commission: 950, refund: 0, otherDeduction: 0, earnings: 8549, status: 'Settlement Pending' },
  { id: 'TXN-90196', order: 'SH-100124-01', channel: 'marketplace', date: '10 Aug 2026', gross: 9499, commission: 950, refund: 0, otherDeduction: 0, earnings: 8549, status: 'Settlement Pending' },
  { id: 'TXN-90180', order: 'SH-100109-01', channel: 'store', date: '06 Aug 2026', gross: 2999, commission: 300, refund: 0, otherDeduction: 0, earnings: 2699, status: 'Settlement Eligible', settlementId: 'SET-10021' },
  { id: 'TXN-90165', order: 'SH-100098-01', channel: 'marketplace', date: '03 Aug 2026', gross: 5499, commission: 550, refund: 0, otherDeduction: 0, earnings: 4949, status: 'Settlement Eligible', settlementId: 'SET-10021' },
  { id: 'TXN-90140', order: 'SH-100072-01', channel: 'marketplace', date: '28 Jul 2026', gross: 11999, commission: 1200, refund: 0, otherDeduction: 120, earnings: 10679, status: 'Settled', settlementId: 'SET-09988' },
  { id: 'TXN-90121', order: 'SH-100064-01', channel: 'store', date: '26 Jul 2026', gross: 1899, commission: 190, refund: 1899, otherDeduction: 0, earnings: -190, status: 'Reversed', settlementId: 'SET-09988' },
]

/* ---------------------------------------------------------- settlements --- */
export type SellerSettlement = {
  id: string
  period: string
  orders: number
  gross: number
  refunds: number
  commission: number
  deductions: number
  net: number
  status: 'Pending' | 'Eligible' | 'Processing' | 'Paid' | 'On Hold'
  settledOn?: string
  reference?: string
  holdReason?: string
}

export const SELLER_SETTLEMENTS: SellerSettlement[] = [
  { id: 'SET-10021', period: '1 Aug – 7 Aug 2026', orders: 12, gross: 100000, refunds: 5000, commission: 9500, deductions: 1000, net: 84500, status: 'Eligible' },
  { id: 'SET-10014', period: '25 Jul – 31 Jul 2026', orders: 9, gross: 42500, refunds: 0, commission: 4250, deductions: 380, net: 37870, status: 'Processing' },
  { id: 'SET-09988', period: '18 Jul – 24 Jul 2026', orders: 14, gross: 76400, refunds: 1899, commission: 7450, deductions: 620, net: 66431, status: 'Paid', settledOn: '28 Jul 2026', reference: 'HDFC/NEFT/774120' },
  { id: 'SET-09960', period: '11 Jul – 17 Jul 2026', orders: 11, gross: 58200, refunds: 2400, commission: 5580, deductions: 300, net: 49920, status: 'Paid', settledOn: '21 Jul 2026', reference: 'HDFC/NEFT/761005' },
  { id: 'SET-10028', period: '8 Aug – 14 Aug 2026', orders: 6, gross: 24996, refunds: 0, commission: 2500, deductions: 110, net: 22386, status: 'Pending' },
  { id: 'SET-09931', period: '4 Jul – 10 Jul 2026', orders: 8, gross: 31200, refunds: 6400, commission: 2480, deductions: 0, net: 22320, status: 'On Hold', holdReason: 'This settlement is under review due to an open return case.' },
]

export const SETTLEMENT_SUMMARY = {
  pending: 85000,
  eligible: 42500,
  processing: 20000,
  paid: 645000,
}

/* ---------------------------------------------------------- sales chart --- */
export const SELLER_SALES_7D = [
  { day: '06 Aug', sales: 18400, orders: 6 },
  { day: '07 Aug', sales: 22600, orders: 8 },
  { day: '08 Aug', sales: 19800, orders: 7 },
  { day: '09 Aug', sales: 28400, orders: 11 },
  { day: '10 Aug', sales: 31200, orders: 12 },
  { day: '11 Aug', sales: 34800, orders: 14 },
  { day: '12 Aug', sales: 26100, orders: 9 },
]

/* -------------------------------------------------------- notifications --- */
export type SellerNotification = {
  id: string
  kind: 'order' | 'product' | 'payment' | 'account'
  title: string
  detail: string
  at: string
  unread: boolean
  to?: string
}

export const SELLER_NOTIFICATIONS: SellerNotification[] = [
  { id: 'SN-1', kind: 'order', title: 'New order received', detail: 'Order SH-100145-01 · ₹4,999 · 1 product', at: '12 min ago', unread: true, to: '/seller/orders/SH-100145-01' },
  { id: 'SN-2', kind: 'order', title: 'New order received', detail: 'Order SH-100142-01 · ₹9,499 · 1 product', at: '1 hour ago', unread: true, to: '/seller/orders/SH-100142-01' },
  { id: 'SN-3', kind: 'product', title: 'Changes required', detail: 'USB-C 65W GaN Charger needs clearer images', at: '3 hours ago', unread: true, to: '/seller/products/SH-P-1058' },
  { id: 'SN-4', kind: 'product', title: 'Low stock alert', detail: 'Wireless Headphones has only 4 units remaining', at: '5 hours ago', unread: false, to: '/seller/inventory' },
  { id: 'SN-5', kind: 'order', title: 'Return requested', detail: 'RET-2208 · Order SH-100098-01 · Product damaged', at: 'Yesterday', unread: false, to: '/seller/orders/SH-100098-01' },
  { id: 'SN-6', kind: 'payment', title: 'Settlement eligible', detail: 'SET-10021 · ₹84,500 ready for processing', at: 'Yesterday', unread: false, to: '/seller/settlements/SET-10021' },
  { id: 'SN-7', kind: 'payment', title: 'Settlement paid', detail: 'SET-09988 · ₹66,431 credited to XXXX4521', at: '28 Jul 2026', unread: false, to: '/seller/settlements/SET-09988' },
  { id: 'SN-8', kind: 'account', title: 'KYC approved', detail: 'Your business verification is complete', at: '19 Jul 2026', unread: false },
]

/* -------------------------------------------------------------- support --- */
export type SellerTicket = {
  id: string
  subject: string
  category: 'Account/KYC' | 'Product' | 'Order' | 'Payment' | 'Settlement' | 'Shipping' | 'Other'
  order?: string
  created: string
  status: 'Open' | 'In Progress' | 'Waiting for You' | 'Resolved' | 'Closed'
  lastMessage: string
}

export const SELLER_TICKETS: SellerTicket[] = [
  { id: 'TKT-7705', subject: 'KYC resubmission not reflecting', category: 'Account/KYC', created: '11 Aug 2026', status: 'Waiting for You', lastMessage: 'Please re-upload the GST certificate as a PDF under 5 MB.' },
  { id: 'TKT-7690', subject: 'Settlement on hold — clarification needed', category: 'Settlement', created: '09 Aug 2026', status: 'In Progress', lastMessage: 'Our team is reviewing the linked return case. We will update you within 48 hours.' },
  { id: 'TKT-7662', subject: 'Courier pickup missed for SH-100124-01', category: 'Shipping', order: 'SH-100124-01', created: '05 Aug 2026', status: 'Resolved', lastMessage: 'Pickup was rescheduled and completed on 11 Aug.' },
]

/* ------------------------------------------------------- business profile -- */
export const SELLER_BUSINESS = {
  storeName: 'ABC Electronics',
  legalName: 'ABC Electronics Private Limited',
  businessType: 'Private Limited Company',
  gstin: '27AABCA1234M1Z5',
  pan: 'AABCA1234M',
  category: 'Electronics',
  description:
    'Audio and mobile accessories retailer based in Mumbai. Authorised dealer for SoundPro and Kairo, serving customers across India since 2019.',
  sellerSince: 'February 2026',
  email: 'rahul@abcelectronics.in',
  phone: '+91 98200 41122',
  contactPerson: 'Rahul Mehta',
  address: {
    line1: 'Unit 402, Sunrise Business Park',
    line2: 'Andheri East',
    landmark: 'Near Metro Station',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400069',
    country: 'India',
  },
  pickup: {
    name: 'Main Warehouse',
    contact: 'Suresh Kadam',
    phone: '+91 98200 41133',
    line1: 'Unit 402, Sunrise Business Park',
    line2: 'Andheri East',
    landmark: 'Near Metro Station',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400069',
  },
  bank: {
    holder: 'ABC Electronics Private Limited',
    bank: 'HDFC Bank',
    masked: 'XXXX XXXX 4521',
    ifsc: 'HDFC0000123',
    type: 'Current',
  },
  documents: [
    { type: 'PAN Card', required: true, file: 'pan-card.pdf', uploaded: '12 Feb 2026', status: 'Verified' as const },
    { type: 'GST Certificate', required: true, file: 'gst-certificate.pdf', uploaded: '12 Feb 2026', status: 'Verified' as const },
    { type: 'Business Registration Proof', required: true, file: 'incorporation.pdf', uploaded: '12 Feb 2026', status: 'Verified' as const },
    { type: 'Address Proof', required: true, file: 'electricity-bill.jpg', uploaded: '13 Feb 2026', status: 'Verified' as const },
  ],
}

export const BUSINESS_TYPES = [
  'Individual',
  'Sole Proprietorship',
  'Partnership',
  'LLP',
  'Private Limited Company',
  'Public Limited Company',
  'Other',
]

export const PRODUCT_CATEGORIES = ['Electronics', 'Fashion', 'Home', 'Beauty', 'Sports', 'Others']

export const INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Tamil Nadu',
  'Delhi',
  'Gujarat',
  'Kerala',
  'West Bengal',
  'Telangana',
  'Rajasthan',
  'Uttar Pradesh',
]
