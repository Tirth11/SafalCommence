/* ==========================================================================
   SafalMarketHub — Super Admin mock data
   Stands in for the platform API. Shapes mirror the Phase 1 spec so screens
   can be wired to real endpoints without changing component contracts.
   ========================================================================== */

export type SellerStatus =
  | 'Registered'
  | 'Onboarding'
  | 'Pending Review'
  | 'Active'
  | 'Suspended'
  | 'Payout Hold'
  | 'Closed'

export type KycStatus = 'Not Submitted' | 'Submitted' | 'Under Review' | 'Verified' | 'Changes Required' | 'Rejected'

export type Seller = {
  id: string
  storeName: string
  legalName: string
  owner: string
  email: string
  phone: string
  gstin: string
  pan: string
  businessType: string
  category: string
  city: string
  state: string
  pin: string
  address: string
  kyc: KycStatus
  status: SellerStatus
  products: number
  orders: number
  sales: number
  registered: string
  submittedOn?: string
  statusReason?: string
  bank: { holder: string; bank: string; last4: string; ifsc: string; verified: boolean }
  documents: { type: string; uploaded: string; status: 'Verified' | 'Pending' | 'Issue Found' }[]
}

export const SELLERS: Seller[] = [
  {
    id: 'SLR-10021',
    storeName: 'ABC Electronics',
    legalName: 'ABC Electronics Private Limited',
    owner: 'Rahul Mehta',
    email: 'rahul@abcelectronics.in',
    phone: '+91 98200 41122',
    gstin: '27AABCA1234M1Z5',
    pan: 'AABCA1234M',
    businessType: 'Private Limited',
    category: 'Electronics',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin: '400069',
    address: 'Unit 402, Sunrise Business Park, Andheri East',
    kyc: 'Verified',
    status: 'Active',
    products: 128,
    orders: 486,
    sales: 245800,
    registered: '12 Feb 2026',
    bank: { holder: 'ABC Electronics Private Limited', bank: 'HDFC Bank', last4: '1234', ifsc: 'HDFC0000123', verified: true },
    documents: [
      { type: 'PAN Card', uploaded: '12 Feb 2026', status: 'Verified' },
      { type: 'GST Certificate', uploaded: '12 Feb 2026', status: 'Verified' },
      { type: 'Company Registration', uploaded: '12 Feb 2026', status: 'Verified' },
      { type: 'Cancelled Cheque', uploaded: '13 Feb 2026', status: 'Verified' },
    ],
  },
  {
    id: 'SLR-10248',
    storeName: 'Urban Threads',
    legalName: 'Urban Threads LLP',
    owner: 'Sneha Iyer',
    email: 'sneha@urbanthreads.co',
    phone: '+91 90045 77281',
    gstin: '29AAFUT9012K1Z2',
    pan: 'AAFUT9012K',
    businessType: 'LLP',
    category: 'Fashion',
    city: 'Bengaluru',
    state: 'Karnataka',
    pin: '560038',
    address: '17, 3rd Cross, Indiranagar',
    kyc: 'Under Review',
    status: 'Pending Review',
    products: 24,
    orders: 0,
    sales: 0,
    registered: '04 Aug 2026',
    submittedOn: '08 Aug 2026',
    bank: { holder: 'Urban Threads LLP', bank: 'ICICI Bank', last4: '8890', ifsc: 'ICIC0004421', verified: false },
    documents: [
      { type: 'PAN Card', uploaded: '08 Aug 2026', status: 'Verified' },
      { type: 'GST Certificate', uploaded: '08 Aug 2026', status: 'Pending' },
      { type: 'Address Proof', uploaded: '08 Aug 2026', status: 'Pending' },
      { type: 'Cancelled Cheque', uploaded: '08 Aug 2026', status: 'Pending' },
    ],
  },
  {
    id: 'SLR-10251',
    storeName: 'HomeCraft Studio',
    legalName: 'HomeCraft Studio',
    owner: 'Devika Rao',
    email: 'devika@homecraft.studio',
    phone: '+91 88267 30119',
    gstin: '33AASHC5566P1Z9',
    pan: 'AASHC5566P',
    businessType: 'Proprietorship',
    category: 'Home & Living',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pin: '600020',
    address: '8/3 Kasturba Nagar, Adyar',
    kyc: 'Submitted',
    status: 'Pending Review',
    products: 12,
    orders: 0,
    sales: 0,
    registered: '06 Aug 2026',
    submittedOn: '10 Aug 2026',
    bank: { holder: 'Devika Rao', bank: 'Axis Bank', last4: '4471', ifsc: 'UTIB0001204', verified: false },
    documents: [
      { type: 'PAN Card', uploaded: '10 Aug 2026', status: 'Pending' },
      { type: 'GST Certificate', uploaded: '10 Aug 2026', status: 'Pending' },
      { type: 'Cancelled Cheque', uploaded: '10 Aug 2026', status: 'Issue Found' },
    ],
  },
  {
    id: 'SLR-10190',
    storeName: 'FitZone Sports',
    legalName: 'FitZone Sports Pvt Ltd',
    owner: 'Arjun Khan',
    email: 'arjun@fitzone.in',
    phone: '+91 98111 20034',
    gstin: '07AAFFZ3344L1Z1',
    pan: 'AAFFZ3344L',
    businessType: 'Private Limited',
    category: 'Sports',
    city: 'New Delhi',
    state: 'Delhi',
    pin: '110024',
    address: 'B-14, Lajpat Nagar II',
    kyc: 'Verified',
    status: 'Payout Hold',
    products: 61,
    orders: 212,
    sales: 118400,
    registered: '28 Apr 2026',
    statusReason: 'Return investigation — 9 returns flagged in the last 14 days.',
    bank: { holder: 'FitZone Sports Pvt Ltd', bank: 'Kotak Mahindra Bank', last4: '9902', ifsc: 'KKBK0000261', verified: true },
    documents: [
      { type: 'PAN Card', uploaded: '28 Apr 2026', status: 'Verified' },
      { type: 'GST Certificate', uploaded: '28 Apr 2026', status: 'Verified' },
      { type: 'Cancelled Cheque', uploaded: '29 Apr 2026', status: 'Verified' },
    ],
  },
  {
    id: 'SLR-10102',
    storeName: 'GlowKart',
    legalName: 'GlowKart Retail LLP',
    owner: 'Meera Nair',
    email: 'meera@glowkart.in',
    phone: '+91 99872 66410',
    gstin: '32AAGGK7788R1Z4',
    pan: 'AAGGK7788R',
    businessType: 'LLP',
    category: 'Beauty',
    city: 'Kochi',
    state: 'Kerala',
    pin: '682016',
    address: '2nd Floor, Palarivattom Junction',
    kyc: 'Verified',
    status: 'Suspended',
    products: 43,
    orders: 96,
    sales: 52300,
    registered: '19 Mar 2026',
    statusReason: 'Repeated customer complaints — 6 counterfeit reports in 30 days.',
    bank: { holder: 'GlowKart Retail LLP', bank: 'Federal Bank', last4: '6120', ifsc: 'FDRL0001234', verified: true },
    documents: [
      { type: 'PAN Card', uploaded: '19 Mar 2026', status: 'Verified' },
      { type: 'GST Certificate', uploaded: '19 Mar 2026', status: 'Verified' },
    ],
  },
  {
    id: 'SLR-10260',
    storeName: 'GadgetHub Retail',
    legalName: 'GadgetHub Retail Pvt Ltd',
    owner: 'Vikram Shah',
    email: 'vikram@gadgethub.in',
    phone: '+91 97654 11009',
    gstin: '24AAGRH1122T1Z7',
    pan: 'AAGRH1122T',
    businessType: 'Private Limited',
    category: 'Electronics',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pin: '380015',
    address: '501, Iscon Emporio, Satellite',
    kyc: 'Changes Required',
    status: 'Pending Review',
    products: 8,
    orders: 0,
    sales: 0,
    registered: '09 Aug 2026',
    submittedOn: '11 Aug 2026',
    statusReason: 'GST document unclear — resubmission requested on 11 Aug 2026.',
    bank: { holder: 'GadgetHub Retail Pvt Ltd', bank: 'State Bank of India', last4: '3388', ifsc: 'SBIN0011513', verified: false },
    documents: [
      { type: 'PAN Card', uploaded: '11 Aug 2026', status: 'Verified' },
      { type: 'GST Certificate', uploaded: '11 Aug 2026', status: 'Issue Found' },
      { type: 'Address Proof', uploaded: '11 Aug 2026', status: 'Pending' },
    ],
  },
  {
    id: 'SLR-10263',
    storeName: 'Loom & Clay',
    legalName: 'Loom and Clay Ventures',
    owner: 'Priya Desai',
    email: 'priya@loomandclay.in',
    phone: '+91 90999 45123',
    gstin: '—',
    pan: 'BXTPD8899K',
    businessType: 'Proprietorship',
    category: 'Home & Living',
    city: 'Pune',
    state: 'Maharashtra',
    pin: '411001',
    address: '14 Ambedkar Road, Camp',
    kyc: 'Not Submitted',
    status: 'Onboarding',
    products: 0,
    orders: 0,
    sales: 0,
    registered: '11 Aug 2026',
    bank: { holder: '—', bank: '—', last4: '----', ifsc: '—', verified: false },
    documents: [],
  },
  {
    id: 'SLR-10265',
    storeName: 'SoundPro India',
    legalName: 'SoundPro India Pvt Ltd',
    owner: 'Kabir Anand',
    email: 'kabir@soundpro.in',
    phone: '+91 98330 77112',
    gstin: '19AASPI4455Q1Z3',
    pan: 'AASPI4455Q',
    businessType: 'Private Limited',
    category: 'Electronics',
    city: 'Kolkata',
    state: 'West Bengal',
    pin: '700019',
    address: '9 Ballygunge Circular Road',
    kyc: 'Submitted',
    status: 'Pending Review',
    products: 16,
    orders: 0,
    sales: 0,
    registered: '10 Aug 2026',
    submittedOn: '11 Aug 2026',
    bank: { holder: 'SoundPro India Pvt Ltd', bank: 'Yes Bank', last4: '7741', ifsc: 'YESB0000123', verified: false },
    documents: [
      { type: 'PAN Card', uploaded: '11 Aug 2026', status: 'Pending' },
      { type: 'GST Certificate', uploaded: '11 Aug 2026', status: 'Pending' },
      { type: 'Company Registration', uploaded: '11 Aug 2026', status: 'Pending' },
      { type: 'Cancelled Cheque', uploaded: '11 Aug 2026', status: 'Pending' },
    ],
  },
]

/* --------------------------------------------------------------- Buyers --- */
export type Buyer = {
  id: string
  name: string
  email: string
  phone: string
  orders: number
  spend: number
  registered: string
  status: 'Active' | 'Suspended'
  city: string
}

export const BUYERS: Buyer[] = [
  { id: 'BUY-88201', name: 'Rohit Sharma', email: 'rohit.sharma@example.com', phone: '+91 98765 43210', orders: 24, spend: 84250, registered: '18 Jan 2026', status: 'Active', city: 'Mumbai' },
  { id: 'BUY-88394', name: 'Ananya Gupta', email: 'ananya.g@example.com', phone: '+91 91234 56780', orders: 11, spend: 32600, registered: '02 Mar 2026', status: 'Active', city: 'Gurugram' },
  { id: 'BUY-88512', name: 'Imran Sheikh', email: 'imran.sheikh@example.com', phone: '+91 99880 11223', orders: 6, spend: 14990, registered: '21 Apr 2026', status: 'Suspended', city: 'Hyderabad' },
  { id: 'BUY-88677', name: 'Lakshmi Menon', email: 'lakshmi.m@example.com', phone: '+91 90876 55412', orders: 38, spend: 156400, registered: '09 Dec 2025', status: 'Active', city: 'Kochi' },
  { id: 'BUY-88910', name: 'Dev Patel', email: 'dev.patel@example.com', phone: '+91 97000 33445', orders: 2, spend: 5499, registered: '05 Aug 2026', status: 'Active', city: 'Surat' },
  { id: 'BUY-89004', name: 'Nikita Bose', email: 'nikita.bose@example.com', phone: '+91 88990 76543', orders: 15, spend: 47800, registered: '14 Feb 2026', status: 'Active', city: 'Kolkata' },
]

/* ------------------------------------------------------------- Products --- */
export type ApprovalStatus = 'In Review' | 'Approved' | 'Changes Required' | 'Rejected'
export type ProductState = 'Active' | 'Inactive' | 'Disabled' | 'Out of Stock' | 'Draft'

export type AdminProduct = {
  id: string
  name: string
  seller: string
  sellerId: string
  brand: string
  category: string
  mrp: number
  price: number
  stock: number
  state: ProductState
  approval: ApprovalStatus
  created: string
  submitted?: string
  hsn: string
  gst: number
  origin: string
  manufacturer: string
  description: string
  images: number
  variants: { sku: string; attributes: string; stock: number }[]
  reason?: string
}

export const ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: 'SH-P-1042',
    name: 'Wireless Noise Cancelling Headphones',
    seller: 'TechWorld',
    sellerId: 'SLR-10021',
    brand: 'SoundPro',
    category: 'Electronics › Audio › Headphones',
    mrp: 7999,
    price: 5499,
    stock: 42,
    state: 'Active',
    approval: 'Approved',
    created: '02 Jun 2026',
    hsn: '85183000',
    gst: 18,
    origin: 'India',
    manufacturer: 'SoundPro Audio Pvt Ltd',
    description:
      'Over-ear headphones with hybrid active noise cancellation, 40-hour battery life, multipoint Bluetooth 5.3 and a foldable travel case.',
    images: 6,
    variants: [
      { sku: 'SP-WH-102-BLK', attributes: 'Black', stock: 24 },
      { sku: 'SP-WH-102-WHT', attributes: 'White', stock: 18 },
    ],
  },
  {
    id: 'SH-P-2210',
    name: 'Smart Air Purifier — 45 m² Coverage',
    seller: 'GadgetHub Retail',
    sellerId: 'SLR-10260',
    brand: 'Airo',
    category: 'Home & Living › Appliances',
    mrp: 18999,
    price: 13499,
    stock: 30,
    state: 'Draft',
    approval: 'In Review',
    created: '09 Aug 2026',
    submitted: '11 Aug 2026',
    hsn: '84213900',
    gst: 18,
    origin: 'India',
    manufacturer: 'Airo Appliances Pvt Ltd',
    description:
      'True HEPA H13 air purifier with real-time AQI display, auto mode and app control. Filter life indicator and child lock included.',
    images: 5,
    variants: [{ sku: 'AIR-45-WHT', attributes: 'White', stock: 30 }],
  },
  {
    id: 'SH-P-2214',
    name: 'Organic Cotton Kurta Set',
    seller: 'Urban Threads',
    sellerId: 'SLR-10248',
    brand: 'Muhl',
    category: 'Fashion › Women › Ethnic',
    mrp: 4499,
    price: 2699,
    stock: 88,
    state: 'Draft',
    approval: 'In Review',
    created: '10 Aug 2026',
    submitted: '11 Aug 2026',
    hsn: '62114290',
    gst: 5,
    origin: 'India',
    manufacturer: 'Urban Threads LLP',
    description: 'Hand-block printed kurta with matching palazzo. GOTS-certified organic cotton, pre-shrunk.',
    images: 8,
    variants: [
      { sku: 'UT-KS-01-S', attributes: 'Small', stock: 22 },
      { sku: 'UT-KS-01-M', attributes: 'Medium', stock: 34 },
      { sku: 'UT-KS-01-L', attributes: 'Large', stock: 32 },
    ],
  },
  {
    id: 'SH-P-2218',
    name: 'Stainless Steel Insulated Bottle 1L',
    seller: 'FitZone Sports',
    sellerId: 'SLR-10190',
    brand: 'IronCore',
    category: 'Sports › Accessories',
    mrp: 1999,
    price: 1149,
    stock: 0,
    state: 'Out of Stock',
    approval: 'Approved',
    created: '22 Jul 2026',
    hsn: '96170019',
    gst: 18,
    origin: 'India',
    manufacturer: 'IronCore Fitness',
    description: 'Double-walled vacuum insulated bottle. Keeps liquids hot 12 h, cold 24 h.',
    images: 4,
    variants: [{ sku: 'IC-BT-1L-STL', attributes: 'Steel', stock: 0 }],
  },
  {
    id: 'SH-P-2221',
    name: 'Vitamin C Brightening Face Serum',
    seller: 'GlowKart',
    sellerId: 'SLR-10102',
    brand: 'Aurea',
    category: 'Beauty › Skincare › Serums',
    mrp: 1899,
    price: 1139,
    stock: 7,
    state: 'Disabled',
    approval: 'Approved',
    created: '30 Mar 2026',
    hsn: '33049990',
    gst: 18,
    origin: 'India',
    manufacturer: 'Aurea Labs',
    description: '15% L-ascorbic acid serum with ferulic acid and vitamin E.',
    images: 5,
    variants: [{ sku: 'AU-SR-055', attributes: '30 ml', stock: 7 }],
    reason: 'Seller suspended — listing disabled pending counterfeit investigation.',
  },
  {
    id: 'SH-P-2225',
    name: 'Portable Power Station 300W',
    seller: 'SoundPro India',
    sellerId: 'SLR-10265',
    brand: 'SoundPro',
    category: 'Electronics › Power',
    mrp: 24999,
    price: 19999,
    stock: 12,
    state: 'Draft',
    approval: 'In Review',
    created: '11 Aug 2026',
    submitted: '11 Aug 2026',
    hsn: '85072000',
    gst: 18,
    origin: 'China',
    manufacturer: 'SoundPro India Pvt Ltd',
    description: 'LiFePO4 portable power station, 300 W output, pass-through charging, 3 500 cycles.',
    images: 3,
    variants: [{ sku: 'SP-PS-300', attributes: '300 W', stock: 12 }],
  },
  {
    id: 'SH-P-2228',
    name: 'Replica Designer Handbag',
    seller: 'GlowKart',
    sellerId: 'SLR-10102',
    brand: 'Unbranded',
    category: 'Accessories › Bags',
    mrp: 5999,
    price: 1499,
    stock: 40,
    state: 'Draft',
    approval: 'Rejected',
    created: '01 Aug 2026',
    submitted: '02 Aug 2026',
    hsn: '42022210',
    gst: 18,
    origin: 'China',
    manufacturer: 'Not disclosed',
    description: 'Inspired-by design handbag, premium finish.',
    images: 2,
    variants: [{ sku: 'GK-BG-990', attributes: 'Beige', stock: 40 }],
    reason: 'Counterfeit concern — listing references a protected trademark design.',
  },
]

/* --------------------------------------------------------------- Orders --- */
export type PaymentStatus = 'Initiated' | 'Pending' | 'Successful' | 'Failed' | 'Partially Refunded' | 'Refunded'
export type FulfilmentStatus = 'Confirmed' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned'

export type SubOrder = {
  id: string
  seller: string
  sellerId: string
  items: { name: string; sku: string; qty: number; price: number }[]
  value: number
  commission: number
  receivable: number
  fulfilment: FulfilmentStatus
  courier?: string
  awb?: string
}

export type AdminOrder = {
  id: string
  buyer: string
  buyerId: string
  date: string
  itemCount: number
  value: number
  tax: number
  shipping: number
  payment: PaymentStatus
  fulfilment: FulfilmentStatus
  address: string
  gateway: string
  method: string
  gatewayRef: string
  subOrders: SubOrder[]
}

export const ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 'SH-100482',
    buyer: 'Rohit Sharma',
    buyerId: 'BUY-88201',
    date: '11 Aug 2026, 10:24',
    itemCount: 3,
    value: 12246,
    tax: 1868,
    shipping: 0,
    payment: 'Successful',
    fulfilment: 'Processing',
    address: '1204, Oberoi Springs, Andheri West, Mumbai, Maharashtra 400053',
    gateway: 'Razorpay',
    method: 'UPI',
    gatewayRef: 'pay_QF82nKd91Lm4Zx',
    subOrders: [
      {
        id: 'SH-100482-01',
        seller: 'TechWorld',
        sellerId: 'SLR-10021',
        items: [{ name: 'Wireless Noise Cancelling Headphones', sku: 'SP-WH-102-BLK', qty: 1, price: 5499 }],
        value: 5499,
        commission: 550,
        receivable: 4949,
        fulfilment: 'Packed',
        courier: 'Delhivery',
        awb: 'DL7789234011',
      },
      {
        id: 'SH-100482-02',
        seller: 'Urban Threads',
        sellerId: 'SLR-10248',
        items: [{ name: 'Premium Cotton Oversized Shirt', sku: 'UT-SH-44-M', qty: 2, price: 1299 }],
        value: 2598,
        commission: 260,
        receivable: 2338,
        fulfilment: 'Processing',
      },
      {
        id: 'SH-100482-03',
        seller: 'HomeCraft Studio',
        sellerId: 'SLR-10251',
        items: [{ name: 'Ceramic Table Lamp with Linen Shade', sku: 'LC-LMP-07', qty: 1, price: 2449 }],
        value: 2449,
        commission: 245,
        receivable: 2204,
        fulfilment: 'Confirmed',
      },
    ],
  },
  {
    id: 'SH-100481',
    buyer: 'Ananya Gupta',
    buyerId: 'BUY-88394',
    date: '11 Aug 2026, 09:12',
    itemCount: 1,
    value: 9499,
    tax: 1449,
    shipping: 0,
    payment: 'Successful',
    fulfilment: 'Shipped',
    address: 'B-704, DLF Phase 3, Gurugram, Haryana 122010',
    gateway: 'Razorpay',
    method: 'Credit Card',
    gatewayRef: 'pay_QF7yTb44Rm0Kq2',
    subOrders: [
      {
        id: 'SH-100481-01',
        seller: 'GadgetHub Retail',
        sellerId: 'SLR-10260',
        items: [{ name: 'Titanium Smartwatch — Series 4', sku: 'KA-SW-04-TI', qty: 1, price: 9499 }],
        value: 9499,
        commission: 950,
        receivable: 8549,
        fulfilment: 'Shipped',
        courier: 'Blue Dart',
        awb: 'BD5512099834',
      },
    ],
  },
  {
    id: 'SH-100479',
    buyer: 'Lakshmi Menon',
    buyerId: 'BUY-88677',
    date: '10 Aug 2026, 18:40',
    itemCount: 1,
    value: 2449,
    tax: 373,
    shipping: 0,
    payment: 'Refunded',
    fulfilment: 'Returned',
    address: 'Villa 12, Panampilly Nagar, Kochi, Kerala 682036',
    gateway: 'Razorpay',
    method: 'Netbanking',
    gatewayRef: 'pay_QF6mLp02Xd77Vc',
    subOrders: [
      {
        id: 'SH-100479-01',
        seller: 'HomeCraft Studio',
        sellerId: 'SLR-10251',
        items: [{ name: 'Ceramic Table Lamp with Linen Shade', sku: 'LC-LMP-07', qty: 1, price: 2449 }],
        value: 2449,
        commission: 0,
        receivable: 0,
        fulfilment: 'Returned',
        courier: 'Delhivery',
        awb: 'DL7789101223',
      },
    ],
  },
  {
    id: 'SH-100476',
    buyer: 'Dev Patel',
    buyerId: 'BUY-88910',
    date: '10 Aug 2026, 14:02',
    itemCount: 1,
    value: 5499,
    tax: 838,
    shipping: 0,
    payment: 'Failed',
    fulfilment: 'Cancelled',
    address: '22, Vesu Main Road, Surat, Gujarat 395007',
    gateway: 'Razorpay',
    method: 'UPI',
    gatewayRef: 'pay_QF5kJj71Bn29Pl',
    subOrders: [
      {
        id: 'SH-100476-01',
        seller: 'TechWorld',
        sellerId: 'SLR-10021',
        items: [{ name: 'Wireless Noise Cancelling Headphones', sku: 'SP-WH-102-WHT', qty: 1, price: 5499 }],
        value: 5499,
        commission: 0,
        receivable: 0,
        fulfilment: 'Cancelled',
      },
    ],
  },
  {
    id: 'SH-100470',
    buyer: 'Nikita Bose',
    buyerId: 'BUY-89004',
    date: '09 Aug 2026, 11:55',
    itemCount: 2,
    value: 7448,
    tax: 1136,
    shipping: 99,
    payment: 'Successful',
    fulfilment: 'Delivered',
    address: '31 Southern Avenue, Kolkata, West Bengal 700029',
    gateway: 'Razorpay',
    method: 'UPI',
    gatewayRef: 'pay_QF3nQw55Tt18Hs',
    subOrders: [
      {
        id: 'SH-100470-01',
        seller: 'FitZone Sports',
        sellerId: 'SLR-10190',
        items: [{ name: 'Adjustable Dumbbell Set — 20 kg', sku: 'IC-DB-020', qty: 1, price: 6299 }],
        value: 6299,
        commission: 630,
        receivable: 5669,
        fulfilment: 'Delivered',
        courier: 'Ecom Express',
        awb: 'EE9982143007',
      },
      {
        id: 'SH-100470-02',
        seller: 'GlowKart',
        sellerId: 'SLR-10102',
        items: [{ name: 'Vitamin C Brightening Face Serum', sku: 'AU-SR-055', qty: 1, price: 1139 }],
        value: 1139,
        commission: 114,
        receivable: 1025,
        fulfilment: 'Delivered',
        courier: 'Ecom Express',
        awb: 'EE9982143008',
      },
    ],
  },
]

export const ORDER_TIMELINE = [
  { label: 'Order Confirmed', at: '11 Aug 2026, 10:24', done: true },
  { label: 'Payment Successful', at: '11 Aug 2026, 10:24', done: true },
  { label: 'Processing', at: '11 Aug 2026, 11:02', done: true },
  { label: 'Packed', at: '11 Aug 2026, 16:35', done: true },
  { label: 'Shipped', at: 'Awaiting courier pickup', done: false },
  { label: 'Delivered', at: 'Expected 14 Aug 2026', done: false },
]

/* ------------------------------------------------------------- Payments --- */
export type Transaction = {
  id: string
  order: string
  buyer: string
  gateway: string
  method: string
  amount: number
  date: string
  status: PaymentStatus
  ref: string
  failureReason?: string
  gatewayMessage?: string
}

export const TRANSACTIONS: Transaction[] = [
  { id: 'TXN-556201', order: 'SH-100482', buyer: 'Rohit Sharma', gateway: 'Razorpay', method: 'UPI', amount: 12246, date: '11 Aug 2026, 10:24', status: 'Successful', ref: 'pay_QF82nKd91Lm4Zx' },
  { id: 'TXN-556198', order: 'SH-100481', buyer: 'Ananya Gupta', gateway: 'Razorpay', method: 'Credit Card', amount: 9499, date: '11 Aug 2026, 09:12', status: 'Successful', ref: 'pay_QF7yTb44Rm0Kq2' },
  { id: 'TXN-556190', order: 'SH-100476', buyer: 'Dev Patel', gateway: 'Razorpay', method: 'UPI', amount: 5499, date: '10 Aug 2026, 14:02', status: 'Failed', ref: 'pay_QF5kJj71Bn29Pl', failureReason: 'Payment declined by customer bank', gatewayMessage: 'BAD_REQUEST_ERROR: payment failed because of insufficient funds' },
  { id: 'TXN-556186', order: 'SH-100479', buyer: 'Lakshmi Menon', gateway: 'Razorpay', method: 'Netbanking', amount: 2449, date: '10 Aug 2026, 18:40', status: 'Refunded', ref: 'pay_QF6mLp02Xd77Vc' },
  { id: 'TXN-556180', order: 'SH-100470', buyer: 'Nikita Bose', gateway: 'Razorpay', method: 'UPI', amount: 7547, date: '09 Aug 2026, 11:55', status: 'Successful', ref: 'pay_QF3nQw55Tt18Hs' },
  { id: 'TXN-556172', order: 'SH-100465', buyer: 'Imran Sheikh', gateway: 'Razorpay', method: 'Credit Card', amount: 3299, date: '09 Aug 2026, 08:31', status: 'Pending', ref: 'pay_QF2bXr88Yy44Nn' },
  { id: 'TXN-556165', order: 'SH-100461', buyer: 'Ananya Gupta', gateway: 'Razorpay', method: 'UPI', amount: 1899, date: '08 Aug 2026, 20:14', status: 'Partially Refunded', ref: 'pay_QF1cVv22Zz09Mm' },
]

export type Refund = {
  id: string
  order: string
  buyer: string
  seller: string
  amount: number
  orderValue: number
  reason: string
  requested: string
  status: 'Requested' | 'Under Review' | 'Approved' | 'Refund Initiated' | 'Refunded' | 'Rejected'
  sellerComment?: string
}

export const REFUNDS: Refund[] = [
  { id: 'REF-3301', order: 'SH-100479', buyer: 'Lakshmi Menon', seller: 'HomeCraft Studio', amount: 2449, orderValue: 2449, reason: 'Product damaged on arrival', requested: '10 Aug 2026', status: 'Refunded', sellerComment: 'Damage confirmed from unboxing images. Refund agreed.' },
  { id: 'REF-3308', order: 'SH-100461', buyer: 'Ananya Gupta', seller: 'GlowKart', amount: 760, orderValue: 1899, reason: 'Partial order missing — 1 of 2 items not delivered', requested: '11 Aug 2026', status: 'Under Review', sellerComment: 'Checking pickup manifest with courier.' },
  { id: 'REF-3311', order: 'SH-100470', buyer: 'Nikita Bose', seller: 'FitZone Sports', amount: 6299, orderValue: 7547, reason: 'Item not as described', requested: '11 Aug 2026', status: 'Requested' },
  { id: 'REF-3295', order: 'SH-100442', buyer: 'Rohit Sharma', seller: 'TechWorld', amount: 5499, orderValue: 5499, reason: 'Changed mind after delivery', requested: '07 Aug 2026', status: 'Rejected', sellerComment: 'Return window closed — request received on day 9.' },
]

export type ReturnRequest = {
  id: string
  order: string
  buyer: string
  seller: string
  product: string
  reason: string
  requested: string
  status:
    | 'Return Requested'
    | 'Under Review'
    | 'Approved'
    | 'Pickup Scheduled'
    | 'Product Received'
    | 'Quality Check'
    | 'Refund Initiated'
    | 'Refunded'
    | 'Rejected'
}

export const RETURNS: ReturnRequest[] = [
  { id: 'RET-2201', order: 'SH-100479', buyer: 'Lakshmi Menon', seller: 'HomeCraft Studio', product: 'Ceramic Table Lamp', reason: 'Damaged in transit', requested: '10 Aug 2026', status: 'Refunded' },
  { id: 'RET-2208', order: 'SH-100470', buyer: 'Nikita Bose', seller: 'FitZone Sports', product: 'Adjustable Dumbbell Set', reason: 'Item not as described', requested: '11 Aug 2026', status: 'Quality Check' },
  { id: 'RET-2210', order: 'SH-100468', buyer: 'Dev Patel', seller: 'Urban Threads', product: 'Cotton Oversized Shirt', reason: 'Size issue', requested: '11 Aug 2026', status: 'Pickup Scheduled' },
  { id: 'RET-2213', order: 'SH-100455', buyer: 'Imran Sheikh', seller: 'GlowKart', product: 'Vitamin C Serum', reason: 'Suspected counterfeit', requested: '09 Aug 2026', status: 'Under Review' },
]

/* ---------------------------------------------------------- Settlements --- */
export type Settlement = {
  id: string
  seller: string
  sellerId: string
  period: string
  gross: number
  refunds: number
  commission: number
  deductions: number
  net: number
  status: 'Pending' | 'Eligible' | 'Processing' | 'Paid' | 'On Hold'
  date?: string
  reference?: string
  holdReason?: string
  orders: number
}

export const SETTLEMENTS: Settlement[] = [
  { id: 'SET-10001', seller: 'ABC Electronics', sellerId: 'SLR-10021', period: '1 Aug – 7 Aug 2026', gross: 100000, refunds: 5000, commission: 9500, deductions: 1000, net: 84500, status: 'Eligible', orders: 62 },
  { id: 'SET-10002', seller: 'Urban Threads', sellerId: 'SLR-10248', period: '1 Aug – 7 Aug 2026', gross: 46200, refunds: 1200, commission: 4500, deductions: 400, net: 40100, status: 'Eligible', orders: 31 },
  { id: 'SET-10003', seller: 'FitZone Sports', sellerId: 'SLR-10190', period: '1 Aug – 7 Aug 2026', gross: 78400, refunds: 9800, commission: 6860, deductions: 600, net: 61140, status: 'On Hold', holdReason: 'Return investigation — 9 returns flagged in 14 days.', orders: 44 },
  { id: 'SET-09988', seller: 'HomeCraft Studio', sellerId: 'SLR-10251', period: '25 Jul – 31 Jul 2026', gross: 32100, refunds: 2449, commission: 2965, deductions: 250, net: 26436, status: 'Paid', date: '04 Aug 2026', reference: 'HDFC/NEFT/882910', orders: 18 },
  { id: 'SET-09990', seller: 'GadgetHub Retail', sellerId: 'SLR-10260', period: '25 Jul – 31 Jul 2026', gross: 21400, refunds: 0, commission: 2140, deductions: 0, net: 19260, status: 'Processing', orders: 12 },
  { id: 'SET-10005', seller: 'GlowKart', sellerId: 'SLR-10102', period: '8 Aug – 14 Aug 2026', gross: 14900, refunds: 1139, commission: 1376, deductions: 0, net: 12385, status: 'Pending', orders: 9 },
]

/* ---------------------------------------------------------- Commission --- */
export type CommissionRule = {
  id: string
  name: string
  type: 'Percentage' | 'Fixed'
  value: string
  scope: string
  seller?: string
  category?: string
  from: string
  until: string
  status: 'Active' | 'Scheduled' | 'Expired'
}

export const COMMISSION_RULES: CommissionRule[] = [
  { id: 'CR-001', name: 'Platform default', type: 'Percentage', value: '10%', scope: 'Global', from: '01 Jan 2026', until: '—', status: 'Active' },
  { id: 'CR-014', name: 'Electronics category', type: 'Percentage', value: '8%', scope: 'Category', category: 'Electronics', from: '01 Apr 2026', until: '—', status: 'Active' },
  { id: 'CR-021', name: 'Fashion launch rate', type: 'Percentage', value: '6%', scope: 'Category', category: 'Fashion', from: '01 Jul 2026', until: '30 Sep 2026', status: 'Active' },
  { id: 'CR-030', name: 'ABC Electronics negotiated', type: 'Percentage', value: '7.5%', scope: 'Seller', seller: 'ABC Electronics', from: '01 Sep 2026', until: '—', status: 'Scheduled' },
  { id: 'CR-008', name: 'Beauty introductory rate', type: 'Percentage', value: '5%', scope: 'Category', category: 'Beauty', from: '01 Feb 2026', until: '30 Jun 2026', status: 'Expired' },
]

/* ------------------------------------------------------------- Support ---- */
export type Ticket = {
  id: string
  user: string
  userType: 'Buyer' | 'Seller'
  order?: string
  subject: string
  description: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  status: 'Open' | 'In Progress' | 'Waiting for Customer' | 'Waiting for Seller' | 'Resolved' | 'Closed'
  created: string
}

export const TICKETS: Ticket[] = [
  { id: 'TKT-7701', user: 'Nikita Bose', userType: 'Buyer', order: 'SH-100470', subject: 'Dumbbell set does not match listing weight', description: 'Received 15 kg set instead of 20 kg as listed. Requesting return and refund.', priority: 'High', status: 'In Progress', created: '11 Aug 2026' },
  { id: 'TKT-7705', user: 'Urban Threads', userType: 'Seller', subject: 'KYC resubmission not reflecting', description: 'Re-uploaded GST certificate two days ago, dashboard still shows pending.', priority: 'Medium', status: 'Waiting for Seller', created: '11 Aug 2026' },
  { id: 'TKT-7698', user: 'Dev Patel', userType: 'Buyer', order: 'SH-100476', subject: 'Payment failed but amount debited', description: 'UPI shows debit of ₹5,499 but order marked failed.', priority: 'Urgent', status: 'Open', created: '10 Aug 2026' },
  { id: 'TKT-7690', user: 'FitZone Sports', userType: 'Seller', subject: 'Settlement on hold — clarification needed', description: 'Requesting details of the return investigation blocking settlement.', priority: 'High', status: 'Waiting for Customer', created: '09 Aug 2026' },
  { id: 'TKT-7684', user: 'Lakshmi Menon', userType: 'Buyer', order: 'SH-100479', subject: 'Refund not received', description: 'Refund marked complete on 10 Aug, not credited yet.', priority: 'Medium', status: 'Resolved', created: '08 Aug 2026' },
]

/* ----------------------------------------------------------- Audit logs --- */
export type AuditEntry = {
  id: string
  admin: string
  role: 'Super Admin' | 'Operations Admin'
  action: string
  module: string
  target: string
  oldValue: string
  newValue: string
  reason?: string
  ip: string
  at: string
}

export const AUDIT_LOG: AuditEntry[] = [
  { id: 'AUD-99120', admin: 'Tirth Thaker', role: 'Super Admin', action: 'Settlement Marked Paid', module: 'Settlements', target: 'SET-09988 · HomeCraft Studio', oldValue: 'Processing', newValue: 'Paid', reason: 'NEFT completed, ref HDFC/NEFT/882910', ip: '103.21.58.14', at: '11 Aug 2026, 17:41' },
  { id: 'AUD-99118', admin: 'Priyanka Joshi', role: 'Operations Admin', action: 'Product Approved', module: 'Products', target: 'SH-P-1042 · Wireless Headphones', oldValue: 'In Review', newValue: 'Approved', ip: '103.21.58.22', at: '11 Aug 2026, 16:08' },
  { id: 'AUD-99115', admin: 'Tirth Thaker', role: 'Super Admin', action: 'Seller Suspended', module: 'Sellers', target: 'SLR-10102 · GlowKart', oldValue: 'Active', newValue: 'Suspended', reason: 'Repeated counterfeit complaints (6 in 30 days)', ip: '103.21.58.14', at: '11 Aug 2026, 12:30' },
  { id: 'AUD-99110', admin: 'Priyanka Joshi', role: 'Operations Admin', action: 'KYC Changes Required', module: 'Sellers', target: 'SLR-10260 · GadgetHub Retail', oldValue: 'Under Review', newValue: 'Changes Required', reason: 'GST document unclear', ip: '103.21.58.22', at: '11 Aug 2026, 11:14' },
  { id: 'AUD-99104', admin: 'Tirth Thaker', role: 'Super Admin', action: 'Commission Changed', module: 'Commission', target: 'CR-014 · Electronics category', oldValue: '10%', newValue: '8%', reason: 'Q3 category growth plan', ip: '103.21.58.14', at: '10 Aug 2026, 19:22' },
  { id: 'AUD-99098', admin: 'Priyanka Joshi', role: 'Operations Admin', action: 'Order Cancelled', module: 'Orders', target: 'SH-100476', oldValue: 'Confirmed', newValue: 'Cancelled', reason: 'Payment failed — buyer confirmed re-order', ip: '103.21.58.22', at: '10 Aug 2026, 15:02' },
  { id: 'AUD-99091', admin: 'Tirth Thaker', role: 'Super Admin', action: 'Refund Approved', module: 'Payments', target: 'REF-3301 · ₹2,449', oldValue: 'Under Review', newValue: 'Approved', reason: 'Damage confirmed from unboxing images', ip: '103.21.58.14', at: '10 Aug 2026, 13:47' },
  { id: 'AUD-99085', admin: 'Tirth Thaker', role: 'Super Admin', action: 'Settlement On Hold', module: 'Settlements', target: 'SET-10003 · FitZone Sports', oldValue: 'Eligible', newValue: 'On Hold', reason: 'Return investigation', ip: '103.21.58.14', at: '09 Aug 2026, 18:20' },
  { id: 'AUD-99080', admin: 'Tirth Thaker', role: 'Super Admin', action: 'Admin User Created', module: 'Admin Users', target: 'priyanka.joshi@safalmarkethub.com', oldValue: '—', newValue: 'Operations Admin · Invited', ip: '103.21.58.14', at: '08 Aug 2026, 10:05' },
]

/* --------------------------------------------------------- Admin users --- */
export type AdminUser = {
  id: string
  name: string
  email: string
  role: 'Super Admin' | 'Operations Admin'
  status: 'Invited' | 'Active' | 'Suspended' | 'Deactivated'
  lastActive: string
  created: string
}

export const ADMIN_USERS: AdminUser[] = [
  { id: 'ADM-001', name: 'Tirth Thaker', email: 'tirth.thaker@safalmarkethub.com', role: 'Super Admin', status: 'Active', lastActive: 'Online now', created: '01 Jan 2026' },
  { id: 'ADM-004', name: 'Priyanka Joshi', email: 'priyanka.joshi@safalmarkethub.com', role: 'Operations Admin', status: 'Active', lastActive: '2 hours ago', created: '08 Aug 2026' },
  { id: 'ADM-006', name: 'Rahul Verma', email: 'rahul.verma@safalmarkethub.com', role: 'Operations Admin', status: 'Invited', lastActive: '—', created: '11 Aug 2026' },
  { id: 'ADM-003', name: 'Sana Qureshi', email: 'sana.qureshi@safalmarkethub.com', role: 'Operations Admin', status: 'Suspended', lastActive: '24 Jul 2026', created: '02 Mar 2026' },
]

/* ------------------------------------------------------ Catalogue admin --- */
export type CategoryNode = {
  id: string
  name: string
  parent?: string
  products: number
  order: number
  status: 'Active' | 'Inactive'
  level: 0 | 1 | 2
}

export const CATEGORY_TREE: CategoryNode[] = [
  { id: 'CAT-01', name: 'Electronics', products: 2410, order: 1, status: 'Active', level: 0 },
  { id: 'CAT-01-01', name: 'Cameras', parent: 'Electronics', products: 312, order: 1, status: 'Active', level: 1 },
  { id: 'CAT-01-01-01', name: 'Action Cameras', parent: 'Cameras', products: 88, order: 1, status: 'Active', level: 2 },
  { id: 'CAT-01-02', name: 'Audio', parent: 'Electronics', products: 640, order: 2, status: 'Active', level: 1 },
  { id: 'CAT-02', name: 'Fashion', products: 5120, order: 2, status: 'Active', level: 0 },
  { id: 'CAT-02-01', name: 'Women', parent: 'Fashion', products: 2980, order: 1, status: 'Active', level: 1 },
  { id: 'CAT-03', name: 'Home & Living', products: 1804, order: 3, status: 'Active', level: 0 },
  { id: 'CAT-04', name: 'Beauty', products: 962, order: 4, status: 'Active', level: 0 },
  { id: 'CAT-05', name: 'Sports', products: 741, order: 5, status: 'Active', level: 0 },
  { id: 'CAT-06', name: 'Festive Store 2025', products: 0, order: 9, status: 'Inactive', level: 0 },
]

export type Brand = {
  id: string
  name: string
  products: number
  requestedBy?: string
  status: 'Active' | 'Inactive' | 'Pending Approval'
}

export const BRANDS: Brand[] = [
  { id: 'BRD-101', name: 'SoundPro', products: 64, status: 'Active' },
  { id: 'BRD-108', name: 'Kairo', products: 31, status: 'Active' },
  { id: 'BRD-112', name: 'Muhl', products: 48, status: 'Active' },
  { id: 'BRD-119', name: 'Loom & Clay', products: 22, status: 'Active' },
  { id: 'BRD-126', name: 'Airo', products: 0, requestedBy: 'GadgetHub Retail', status: 'Pending Approval' },
  { id: 'BRD-127', name: 'Aurea', products: 19, status: 'Inactive' },
]

/* -------------------------------------------------------------- Charts --- */
export const SALES_TREND = [
  { day: '05 Aug', gross: 286000, net: 268000, commission: 26800 },
  { day: '06 Aug', gross: 312000, net: 291000, commission: 29100 },
  { day: '07 Aug', gross: 298000, net: 279000, commission: 27900 },
  { day: '08 Aug', gross: 356000, net: 334000, commission: 33400 },
  { day: '09 Aug', gross: 388000, net: 361000, commission: 36100 },
  { day: '10 Aug', gross: 412000, net: 384000, commission: 38400 },
  { day: '11 Aug', gross: 448000, net: 419000, commission: 41900 },
]

export const ORDER_MIX = [
  { status: 'Confirmed', count: 412 },
  { status: 'Processing', count: 286 },
  { status: 'Shipped', count: 344 },
  { status: 'Delivered', count: 3012 },
  { status: 'Cancelled', count: 148 },
  { status: 'Returned', count: 84 },
]

export const SELLER_GROWTH = [
  { month: 'Apr', newSellers: 42, active: 318, suspended: 4 },
  { month: 'May', newSellers: 51, active: 356, suspended: 5 },
  { month: 'Jun', newSellers: 63, active: 401, suspended: 6 },
  { month: 'Jul', newSellers: 58, active: 447, suspended: 8 },
  { month: 'Aug', newSellers: 39, active: 485, suspended: 9 },
]

export const BUYER_GROWTH = [
  { month: 'Apr', registrations: 1840, active: 6420 },
  { month: 'May', registrations: 2160, active: 7810 },
  { month: 'Jun', registrations: 2640, active: 9240 },
  { month: 'Jul', registrations: 3120, active: 11480 },
  { month: 'Aug', registrations: 1980, active: 12960 },
]

/* --------------------------------------------------- Admin notifications -- */
export type AdminNotification = {
  id: string
  title: string
  detail: string
  at: string
  kind: 'seller' | 'product' | 'refund' | 'settlement' | 'payment' | 'return'
  unread: boolean
}

export const ADMIN_NOTIFICATIONS: AdminNotification[] = [
  { id: 'N-1', title: '3 new sellers awaiting review', detail: 'Urban Threads, HomeCraft Studio, SoundPro India', at: '12 min ago', kind: 'seller', unread: true },
  { id: 'N-2', title: 'Product flagged during review', detail: 'SH-P-2228 · Replica Designer Handbag — counterfeit concern', at: '1 hour ago', kind: 'product', unread: true },
  { id: 'N-3', title: 'Refund request over ₹5,000', detail: 'REF-3311 · ₹6,299 · FitZone Sports', at: '2 hours ago', kind: 'refund', unread: true },
  { id: 'N-4', title: 'Settlement batch ready', detail: '2 settlements eligible · ₹1,24,600 total', at: '5 hours ago', kind: 'settlement', unread: false },
  { id: 'N-5', title: 'Payment failure spike', detail: '6 failed UPI payments in the last hour', at: 'Yesterday', kind: 'payment', unread: false },
]
