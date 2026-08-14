/* ==========================================================================
   SafalMarketHub — Super Admin Control Center data

   Covers the expanded control surface from the latest spec: customer AI,
   seller AI, offers, customer voice, marketplace intelligence and bulk import
   monitoring. This is mock data shaped like API payloads so the UI can move
   to real endpoints without redesigning the screens.
   ========================================================================== */

export type ControlMetric = {
  label: string
  value: string
  hint?: string
  delta?: string
}

export const SUPER_ADMIN_OVERVIEW: ControlMetric[] = [
  { label: 'GMV', value: '₹24.5L', hint: 'Today · gross marketplace value', delta: '+12.4%' },
  { label: 'Platform Revenue', value: '₹2.4L', hint: 'Commission + platform fees', delta: '+9.1%' },
  { label: 'Orders Today', value: '428', hint: 'vs 386 yesterday', delta: '+10.9%' },
  { label: 'Active Sellers', value: '485', hint: '9 suspended · 24 pending' },
  { label: 'Active Customers', value: '18,560', hint: '1,980 new this month' },
  { label: 'Products Live', value: '12,450', hint: '312 out of stock' },
  { label: 'Pending Settlements', value: '₹7.45L', hint: '2 eligible batches' },
  { label: 'Refunds Pending', value: '18', hint: '3 require Super Admin sign-off' },
]

export type AttentionItem = {
  id: string
  count: string
  title: string
  detail: string
  action: string
  priority: 'Medium' | 'High' | 'Urgent'
  tab: 'overview' | 'ai' | 'intelligence' | 'offers' | 'voice' | 'uploads'
}

export const SUPER_ADMIN_ATTENTION: AttentionItem[] = [
  { id: 'ATT-KYC', count: '24', title: 'Seller KYC applications', detail: 'Oldest application waiting 3 days', action: 'Review', priority: 'High', tab: 'overview' },
  { id: 'ATT-PRODUCTS', count: '52', title: 'Products awaiting approval', detail: '1 flagged for counterfeit concern', action: 'Review', priority: 'High', tab: 'overview' },
  { id: 'ATT-PAYMENTS', count: '6', title: 'Payment failures require investigation', detail: 'Gateway reconciliation pending', action: 'Review', priority: 'Urgent', tab: 'offers' },
  { id: 'ATT-RETURNS', count: '18', title: 'Return requests', detail: '4 in quality check · 3 high-value refunds', action: 'Review', priority: 'High', tab: 'voice' },
  { id: 'ATT-SETTLEMENTS', count: '₹4.5L', title: 'Settlements ready', detail: 'Eligible and ready for payout processing', action: 'Process', priority: 'Medium', tab: 'overview' },
  { id: 'ATT-CANCEL', count: '7', title: 'Unusual seller cancellation rates', detail: 'Cancellation rate above category baseline', action: 'Investigate', priority: 'High', tab: 'intelligence' },
  { id: 'ATT-AI', count: '12', title: 'AI conversations with negative feedback', detail: 'Price mismatch and poor relevance are trending', action: 'Review', priority: 'High', tab: 'ai' },
  { id: 'ATT-SAFETY', count: '3', title: 'Product safety complaints', detail: 'Original comments attached for moderation', action: 'Urgent review', priority: 'Urgent', tab: 'voice' },
]

export const CUSTOMER_AI_METRICS: ControlMetric[] = [
  { label: 'Conversations Today', value: '8,452', hint: 'Shopping assistant sessions' },
  { label: 'Products Recommended', value: '24,810', hint: 'From text, photo and voice flows' },
  { label: 'Recommendation Click Rate', value: '31%', hint: '+4.2 pts vs last week' },
  { label: 'Products Added to Cart', value: '4,290', hint: 'Assistant-attributed adds' },
  { label: 'Purchases Assisted', value: '1,180', hint: 'Prepared checkout, user confirmed' },
  { label: 'Helpful Rating', value: '87%', hint: '13% negative feedback' },
]

export type AiConversation = {
  id: string
  user: string
  assistant: 'Customer Shopping Assistant' | 'Seller Assistant'
  issue: string
  signal: string
  status: 'Open' | 'In Progress' | 'Resolved'
  at: string
}

export const AI_CONVERSATIONS: AiConversation[] = [
  { id: 'AIC-9081', user: 'Rohit Sharma', assistant: 'Customer Shopping Assistant', issue: 'Incorrect recommendation', signal: 'Not relevant · wrong category', status: 'Open', at: '14 Aug 2026, 10:18' },
  { id: 'AIC-9078', user: 'Meera Nair', assistant: 'Seller Assistant', issue: 'Inventory action failed', signal: 'Seller confirmed, API timeout', status: 'In Progress', at: '14 Aug 2026, 09:42' },
  { id: 'AIC-9070', user: 'Ananya Gupta', assistant: 'Customer Shopping Assistant', issue: 'Image search issue', signal: 'Low confidence match', status: 'Open', at: '13 Aug 2026, 18:21' },
  { id: 'AIC-9054', user: 'ABC Electronics', assistant: 'Seller Assistant', issue: 'Price recommendation disputed', signal: 'Seller ignored recommendation', status: 'Resolved', at: '13 Aug 2026, 13:05' },
]

export type AiAction = {
  id: string
  user: string
  userType: 'Customer' | 'Seller'
  assistant: 'Customer Shopping Assistant' | 'Seller Assistant'
  requestedAction: string
  target: string
  previousValue: string
  newValue: string
  confirmationRequired: 'Yes' | 'No'
  confirmationReceived: 'Yes' | 'No'
  result: 'Completed' | 'Prepared' | 'Failed' | 'Cancelled'
  date: string
}

export const AI_ACTIONS: AiAction[] = [
  {
    id: 'AIA-30091',
    user: 'ABC Electronics',
    userType: 'Seller',
    assistant: 'Seller Assistant',
    requestedAction: 'Update inventory',
    target: 'Wireless Headphones',
    previousValue: '4',
    newValue: '50',
    confirmationRequired: 'Yes',
    confirmationReceived: 'Yes',
    result: 'Completed',
    date: '14 Aug 2026, 10:05',
  },
  {
    id: 'AIA-30084',
    user: 'Rohit Sharma',
    userType: 'Customer',
    assistant: 'Customer Shopping Assistant',
    requestedAction: 'Prepare checkout',
    target: 'Wireless Noise Cancelling Headphones',
    previousValue: 'Cart empty',
    newValue: 'Checkout draft ₹5,220',
    confirmationRequired: 'Yes',
    confirmationReceived: 'No',
    result: 'Prepared',
    date: '14 Aug 2026, 09:28',
  },
  {
    id: 'AIA-30071',
    user: 'GadgetHub Retail',
    userType: 'Seller',
    assistant: 'Seller Assistant',
    requestedAction: 'Change price',
    target: 'Titanium Smartwatch',
    previousValue: '₹9,990',
    newValue: '₹8,999',
    confirmationRequired: 'Yes',
    confirmationReceived: 'Yes',
    result: 'Completed',
    date: '13 Aug 2026, 17:11',
  },
  {
    id: 'AIA-30068',
    user: 'Ananya Gupta',
    userType: 'Customer',
    assistant: 'Customer Shopping Assistant',
    requestedAction: 'Apply offer',
    target: 'SAVE10',
    previousValue: 'No offer',
    newValue: '₹830 discount',
    confirmationRequired: 'No',
    confirmationReceived: 'No',
    result: 'Completed',
    date: '13 Aug 2026, 16:34',
  },
]

export const AI_CONFIRMATION_RULES = [
  'Product creation and publication',
  'Price or inventory change',
  'Bulk inventory update',
  'Order cancellation',
  'Offer publication',
  'Checkout and payment',
  'Refund-related seller action',
  'Settlement-sensitive change',
  'Bank detail update',
]

export const IMAGE_SEARCH_METRICS: ControlMetric[] = [
  { label: 'Images Uploaded', value: '3,210', hint: 'Last 24 hours' },
  { label: 'Searches Completed', value: '3,088', hint: '96.2% completion' },
  { label: 'Products Matched', value: '8,940', hint: 'Average 2.9 matches/search' },
  { label: 'No Match Rate', value: '6.8%', hint: '-1.1 pts vs yesterday' },
  { label: 'Click Rate', value: '28%', hint: 'From image results' },
  { label: 'Add-to-Cart Rate', value: '11%', hint: 'From image search sessions' },
]

export const VOICE_METRICS: ControlMetric[] = [
  { label: 'Voice Requests', value: '1,420', hint: 'Customer + seller' },
  { label: 'Successfully Understood', value: '91%', hint: 'English + mixed-language' },
  { label: "Didn't Understand", value: '6%', hint: 'Mostly product names' },
  { label: 'User Cancelled', value: '3%', hint: 'Before confirmation' },
]

export const SELLER_INTELLIGENCE_METRICS: ControlMetric[] = [
  { label: 'Sellers Using Price Check', value: '164', hint: '34% of active sellers' },
  { label: 'Price Recommendations Viewed', value: '2,840', hint: 'Last 7 days' },
  { label: 'Recommendations Accepted', value: '41%', hint: '+6 pts this week' },
  { label: 'Average Price Position', value: '1.08×', hint: 'vs marketplace average' },
]

export type PricingAlert = {
  id: string
  product: string
  seller: string
  signal: string
  expectedRange: string
  currentPrice: string
  status: 'Open' | 'In Progress' | 'Resolved'
}

export const PRICING_ALERTS: PricingAlert[] = [
  { id: 'PA-1401', product: 'Wireless Headphones', seller: 'ABC Electronics', signal: 'Sudden 42% price drop', expectedRange: '₹4,299–₹5,499', currentPrice: '₹2,499', status: 'Open' },
  { id: 'PA-1396', product: 'Travel Backpack', seller: 'TravelGear Store', signal: '90% above marketplace average', expectedRange: '₹1,799–₹2,899', currentPrice: '₹5,499', status: 'In Progress' },
  { id: 'PA-1388', product: 'USB-C 65W GaN Charger', seller: 'ABC Electronics', signal: 'Possible ₹1 mistake listing', expectedRange: '₹1,699–₹2,399', currentPrice: '₹1', status: 'Open' },
]

export type InventoryAlert = {
  id: string
  product: string
  stock: string
  salesVelocity: string
  status: 'Restock Risk' | 'Slow Moving' | 'Oversell Risk'
}

export const INVENTORY_ALERTS: InventoryAlert[] = [
  { id: 'IA-501', product: 'Wireless Headphones', stock: '4 units left', salesVelocity: '24 sold in last 7 days', status: 'Restock Risk' },
  { id: 'IA-502', product: 'Canvas Travel Backpack', stock: '184 units', salesVelocity: '6 sold in 30 days', status: 'Slow Moving' },
  { id: 'IA-503', product: 'Vitamin C Serum', stock: '7 units across suspended seller', salesVelocity: 'Counterfeit investigation active', status: 'Oversell Risk' },
]

export type OfferPerformance = {
  id: string
  offer: string
  visibility: string
  views: number
  clicks: number
  orders: number
  gmv: string
  discountGiven: string
  conversion: string
  aiAssisted: number
  status: 'Active' | 'Scheduled' | 'Paused' | 'Expired'
}

export const OFFER_PERFORMANCE: OfferPerformance[] = [
  { id: 'OF-201', offer: '20% off selected electronics', visibility: 'Homepage · Product · AI Assistant', views: 48210, clicks: 6210, orders: 910, gmv: '₹18.2L', discountGiven: '₹2.8L', conversion: '14.7%', aiAssisted: 340, status: 'Active' },
  { id: 'OF-202', offer: 'SAVE10 above ₹5,000', visibility: 'Cart · Checkout · AI Assistant', views: 22100, clicks: 4100, orders: 720, gmv: '₹10.6L', discountGiven: '₹74K', conversion: '17.5%', aiAssisted: 290, status: 'Active' },
  { id: 'UP-1', offer: 'Weekend Electronics Sale', visibility: 'Upcoming · Notify Me', views: 13840, clicks: 3482, orders: 0, gmv: '₹0', discountGiven: '₹0', conversion: 'Notify: 25.2%', aiAssisted: 0, status: 'Scheduled' },
]

export const BEST_OFFER_RULES = [
  { label: 'Best eligible offer engine', value: 'Enabled' },
  { label: 'Offer stacking', value: 'One platform offer + one seller offer' },
  { label: 'Mutually exclusive offers', value: 'Higher customer saving wins' },
  { label: 'AI coupon creation', value: 'Blocked' },
  { label: 'Payment step', value: 'Customer confirmation required' },
]

export const CUSTOMER_VOICE_METRICS: ControlMetric[] = [
  { label: 'Overall Satisfaction', value: '82%', hint: 'Product + delivery + support' },
  { label: 'Product Rating', value: '4.4★', hint: 'Verified purchases' },
  { label: 'Seller Rating', value: '4.5★', hint: 'Separate from delivery rating' },
  { label: 'Delivery Satisfaction', value: '89%', hint: 'Courier feedback' },
  { label: 'Shopping Assistant Helpful', value: '87%', hint: '13% not helpful' },
  { label: 'Support Resolution', value: '84%', hint: 'Closed tickets' },
]

export const CUSTOMER_COMPLAINTS = [
  { id: 'CC-1', category: 'Delivery Delay', count: 187, detail: 'Blue Dart and Ecom Express routes trending' },
  { id: 'CC-2', category: 'Product Quality', count: 123, detail: 'Mostly home and beauty categories' },
  { id: 'CC-3', category: 'Refund Delay', count: 82, detail: 'Gateway status not synced on 18 cases' },
  { id: 'CC-4', category: 'Product Not as Described', count: 61, detail: 'Image/description mismatch' },
  { id: 'CC-5', category: 'Recommendation Not Relevant', count: 57, detail: 'Customer AI feedback' },
  { id: 'CC-6', category: 'Packaging', count: 41, detail: 'Increased 34% this week' },
]

export const CUSTOMER_FEEDBACK_SUMMARY = {
  likes: ['Easy checkout', 'Product selection', 'Order tracking'],
  problems: ['Delivery delays', 'Packaging', 'Refund communication'],
  trend: 'Packaging complaints increased 34% this week.',
}

export type BulkImport = {
  id: string
  seller: string
  filename: string
  rows: number
  valid: number
  warnings: number
  errors: number
  imported: number
  date: string
  status: 'Imported' | 'Partially Imported' | 'Failed'
}

export const BULK_IMPORTS: BulkImport[] = [
  { id: 'IMP-8810', seller: 'ABC Electronics', filename: 'Products.xlsx', rows: 500, valid: 462, warnings: 25, errors: 13, imported: 462, date: '14 Aug 2026, 09:10', status: 'Partially Imported' },
  { id: 'IMP-8798', seller: 'Urban Threads', filename: 'Festive_Kurtas.xlsx', rows: 120, valid: 118, warnings: 2, errors: 0, imported: 118, date: '13 Aug 2026, 16:44', status: 'Imported' },
  { id: 'IMP-8781', seller: 'GlowKart', filename: 'Beauty_new.csv', rows: 80, valid: 0, warnings: 0, errors: 80, imported: 0, date: '13 Aug 2026, 11:26', status: 'Failed' },
]

export const IMPORT_ERROR_TYPES = [
  'Duplicate SKU',
  'Missing Price',
  'Invalid Category',
  'Unknown Brand',
  'Missing Description',
  'Invalid GST',
  'Invalid Inventory',
  'Bad Image URL',
]

export const TEMPLATE_FIELDS = [
  'Product Name',
  'Category',
  'Brand',
  'Description',
  'SKU',
  'Barcode',
  'MRP',
  'Selling Price',
  'Tax',
  'HSN',
  'Inventory',
  'Weight',
  'Dimensions',
  'Colour',
  'Size',
  'Image URL',
]
