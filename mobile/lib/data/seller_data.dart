import 'catalog.dart';

/* ===========================================================================
   The seller side of the mockup.

   Mirrors src/data/seller.ts and the offer policy from the web build, so the
   two apps agree on what a seller can do and what the numbers mean.
   =========================================================================== */

const sellerName = 'ABC Electronics';

enum ListingStatus { live, pendingReview, changesRequired, draft, paused }

const listingStatusLabels = <ListingStatus, String>{
  ListingStatus.live: 'Live',
  ListingStatus.pendingReview: 'Pending review',
  ListingStatus.changesRequired: 'Changes required',
  ListingStatus.draft: 'Draft',
  ListingStatus.paused: 'Paused',
};

class SellerProduct {
  const SellerProduct({
    required this.id,
    required this.name,
    required this.sku,
    required this.category,
    required this.glyph,
    required this.tone,
    required this.mrp,
    required this.price,
    required this.available,
    required this.lowStockAt,
    required this.sold,
    required this.status,
    this.adminNote,
  });

  final String id;
  final String name;
  final String sku;
  final String category;
  final Glyph glyph;
  final Tone tone;
  final int mrp;
  final int price;
  final int available;
  final int lowStockAt;

  /// Units sold in the last 30 days — powers the best-seller ranking.
  final int sold;
  final ListingStatus status;
  final String? adminNote;

  bool get isLowStock => available > 0 && available <= lowStockAt;
  bool get isOutOfStock => available == 0;
}

const sellerProducts = <SellerProduct>[
  SellerProduct(
    id: 'SH-P-1042',
    name: 'Wireless Noise Cancelling Headphones',
    sku: 'WH-001',
    category: 'Electronics',
    glyph: Glyph.headphones,
    tone: Tone.brand,
    mrp: 87,
    price: 69,
    available: 4,
    lowStockAt: 10,
    sold: 42,
    status: ListingStatus.live,
  ),
  SellerProduct(
    id: 'SH-P-1044',
    name: 'Titanium Smartwatch — Series 4',
    sku: 'SW-004',
    category: 'Electronics',
    glyph: Glyph.watch,
    tone: Tone.ink,
    mrp: 160,
    price: 120,
    available: 36,
    lowStockAt: 10,
    sold: 28,
    status: ListingStatus.live,
  ),
  SellerProduct(
    id: 'SH-P-1051',
    name: 'Portable Bluetooth Speaker — 20W',
    sku: 'SP-020',
    category: 'Electronics',
    glyph: Glyph.bottle,
    tone: Tone.teal,
    mrp: 52,
    price: 37,
    available: 0,
    lowStockAt: 8,
    sold: 19,
    status: ListingStatus.live,
  ),
  SellerProduct(
    id: 'SH-P-1058',
    name: 'USB-C 65W GaN Charger',
    sku: 'CH-065',
    category: 'Electronics',
    glyph: Glyph.charger,
    tone: Tone.teal,
    mrp: 37,
    price: 24,
    available: 120,
    lowStockAt: 15,
    sold: 34,
    status: ListingStatus.live,
  ),
  SellerProduct(
    id: 'SH-P-1063',
    name: 'Over-Ear Studio Monitor Headphones',
    sku: 'WH-900',
    category: 'Electronics',
    glyph: Glyph.headphones,
    tone: Tone.ink,
    mrp: 210,
    price: 150,
    available: 12,
    lowStockAt: 6,
    sold: 12,
    status: ListingStatus.pendingReview,
  ),
  SellerProduct(
    id: 'SH-P-1070',
    name: 'Laptop Sleeve 14-inch',
    sku: 'LS-014',
    category: 'Accessories',
    glyph: Glyph.bag,
    tone: Tone.gold,
    mrp: 24,
    price: 15,
    available: 48,
    lowStockAt: 10,
    sold: 23,
    status: ListingStatus.changesRequired,
    adminNote: 'Add a size chart and at least one image on a plain background.',
  ),
  SellerProduct(
    id: 'SH-P-1077',
    name: 'Wired Earphones with Mic',
    sku: 'EP-002',
    category: 'Electronics',
    glyph: Glyph.headphones,
    tone: Tone.brand,
    mrp: 12,
    price: 7,
    available: 6,
    lowStockAt: 12,
    sold: 8,
    status: ListingStatus.live,
  ),
];

SellerProduct sellerProductById(String id) => sellerProducts.firstWhere((p) => p.id == id);

/* ------------------------------------------------------------------ orders */

enum SellerOrderStatus { newOrder, processing, packed, shipped, delivered, returned }

const sellerOrderLabels = <SellerOrderStatus, String>{
  SellerOrderStatus.newOrder: 'New',
  SellerOrderStatus.processing: 'Processing',
  SellerOrderStatus.packed: 'Packed',
  SellerOrderStatus.shipped: 'Shipped',
  SellerOrderStatus.delivered: 'Delivered',
  SellerOrderStatus.returned: 'Returned',
};

class SellerOrder {
  const SellerOrder({
    required this.id,
    required this.customer,
    required this.placedOn,
    required this.status,
    required this.productId,
    required this.qty,
    required this.value,
  });

  final String id;
  final String customer;
  final String placedOn;
  final SellerOrderStatus status;
  final String productId;
  final int qty;
  final int value;

  SellerProduct get product => sellerProductById(productId);
  bool get needsAction =>
      status == SellerOrderStatus.newOrder || status == SellerOrderStatus.processing;
}

const sellerOrders = <SellerOrder>[
  SellerOrder(id: 'SH-100152', customer: 'Rahul S.', placedOn: '14 Aug', status: SellerOrderStatus.newOrder, productId: 'SH-P-1042', qty: 1, value: 69),
  SellerOrder(id: 'SH-100151', customer: 'Meera P.', placedOn: '14 Aug', status: SellerOrderStatus.newOrder, productId: 'SH-P-1058', qty: 2, value: 48),
  SellerOrder(id: 'SH-100148', customer: 'Arjun K.', placedOn: '13 Aug', status: SellerOrderStatus.processing, productId: 'SH-P-1044', qty: 1, value: 120),
  SellerOrder(id: 'SH-100145', customer: 'Divya R.', placedOn: '13 Aug', status: SellerOrderStatus.packed, productId: 'SH-P-1042', qty: 1, value: 69),
  SellerOrder(id: 'SH-100142', customer: 'Sanjay M.', placedOn: '12 Aug', status: SellerOrderStatus.shipped, productId: 'SH-P-1070', qty: 3, value: 45),
  SellerOrder(id: 'SH-100138', customer: 'Priya N.', placedOn: '11 Aug', status: SellerOrderStatus.delivered, productId: 'SH-P-1058', qty: 1, value: 24),
  SellerOrder(id: 'SH-100131', customer: 'Vikram T.', placedOn: '10 Aug', status: SellerOrderStatus.returned, productId: 'SH-P-1077', qty: 1, value: 7),
];

/* ------------------------------------------------------------- settlements */

class Settlement {
  const Settlement({
    required this.id,
    required this.period,
    required this.gross,
    required this.refunds,
    required this.commission,
    required this.deductions,
    required this.expected,
    required this.settled,
  });

  final String id;
  final String period;
  final int gross;
  final int refunds;
  final int commission;
  final int deductions;
  final String expected;
  final bool settled;

  int get net => gross - refunds - commission - deductions;
}

const settlements = <Settlement>[
  Settlement(id: 'ST-2208', period: '08 – 14 Aug', gross: 1240, refunds: 62, commission: 149, deductions: 18, expected: '18 Aug', settled: false),
  Settlement(id: 'ST-2207', period: '01 – 07 Aug', gross: 1860, refunds: 94, commission: 223, deductions: 22, expected: '11 Aug', settled: true),
  Settlement(id: 'ST-2206', period: '25 – 31 Jul', gross: 1420, refunds: 0, commission: 170, deductions: 15, expected: '04 Aug', settled: true),
];

/// What SafalMarketHub takes on a marketplace sale, on the seller's plan.
const commissionRate = 12;

/* ---------------------------------------------------------------- reviews */

class ReviewSummary {
  const ReviewSummary({
    required this.rating,
    required this.count,
    required this.likes,
    required this.dislikes,
    this.trend,
  });

  final double rating;
  final int count;
  final List<String> likes;
  final List<String> dislikes;
  final String? trend;
}

const reviewSummaries = <String, ReviewSummary>{
  'SH-P-1042': ReviewSummary(
    rating: 4.3,
    count: 214,
    likes: ['Sound quality', 'Battery life', 'Comfortable for long wear'],
    dislikes: ['Ear cushions get warm', 'Packaging', 'Bluetooth pairing on some phones'],
    trend: 'Packaging complaints increased this month.',
  ),
  'SH-P-1044': ReviewSummary(
    rating: 4.4,
    count: 128,
    likes: ['Build quality', 'Battery lasts a week', 'Screen brightness'],
    dislikes: ['Strap sizing', 'App setup'],
  ),
  'SH-P-1058': ReviewSummary(
    rating: 4.2,
    count: 74,
    likes: ['Small for the power', 'Charges a laptop', 'Runs cool'],
    dislikes: ['No cable in the box'],
  ),
};

/* ------------------------------------------------------- competitor prices */

class CompetitorListing {
  const CompetitorListing(this.seller, this.price, this.deliveryDays, this.rating, {this.isYou = false});
  final String seller;
  final int price;
  final String deliveryDays;
  final double rating;
  final bool isYou;
}

/// Public listing details only — never another seller's cost or margin.
const competitorListings = <String, List<CompetitorListing>>{
  'SH-P-1042': [
    CompetitorListing('SoundBase', 59, '3 days', 4.4),
    CompetitorListing('AudioLine', 62, '2 days', 4.6),
    CompetitorListing('GadgetHub Retail', 66, '1 day', 4.8),
  ],
  'SH-P-1044': [
    CompetitorListing('WristCo', 112, '2 days', 4.3),
    CompetitorListing('GadgetHub Retail', 124, '1 day', 4.8),
  ],
  'SH-P-1058': [
    CompetitorListing('PowerKart', 21, '2 days', 4.1),
    CompetitorListing('GadgetHub Retail', 26, '1 day', 4.8),
  ],
};

class PriceInsight {
  const PriceInsight({required this.low, required this.average, required this.high, required this.listings});
  final int low;
  final int average;
  final int high;
  final List<CompetitorListing> listings;
}

/// Market context, or null when there is nothing to compare against — a
/// made-up range is worse than admitting we don't know.
PriceInsight? priceInsightFor(SellerProduct product) {
  final others = competitorListings[product.id];
  if (others == null || others.isEmpty) return null;

  final prices = others.map((l) => l.price).toList();
  final all = [...others, CompetitorListing('You', product.price, '3 days', 4.5, isYou: true)]
    ..sort((a, b) => a.price.compareTo(b.price));

  return PriceInsight(
    low: prices.reduce((a, b) => a < b ? a : b),
    average: (prices.reduce((a, b) => a + b) / prices.length).round(),
    high: prices.reduce((a, b) => a > b ? a : b),
    listings: all,
  );
}

class MarginBreakdown {
  const MarginBreakdown({required this.cost, required this.fee, required this.earnings, required this.percent});
  final int cost;
  final int fee;
  final int earnings;
  final int percent;

  bool get isThin => earnings <= 0 || percent < 8;
}

/// What the seller keeps at a given price, so nobody cuts blind.
MarginBreakdown marginAt(SellerProduct product, int price) {
  // Cost isn't captured in the product form yet; assume 70% of the current
  // price so the figure reads as indicative rather than invented.
  final cost = (product.price * 0.7).round();
  final fee = ((price * commissionRate) / 100).round();
  final earnings = price - fee - cost;
  return MarginBreakdown(
    cost: cost,
    fee: fee,
    earnings: earnings,
    percent: price > 0 ? ((earnings / price) * 100).round() : 0,
  );
}

/* ------------------------------------------------------------ offer policy */

/// The limits SafalMarketHub sets for every seller. The promotion screens
/// read these rather than hard-coding their own.
class SellerOfferPolicy {
  const SellerOfferPolicy({
    required this.maxDiscountPercent,
    required this.maxDurationDays,
    required this.approvalAbovePercent,
  });

  final int maxDiscountPercent;
  final int maxDurationDays;
  final int approvalAbovePercent;
}

const sellerOfferPolicy = SellerOfferPolicy(
  maxDiscountPercent: 40,
  maxDurationDays: 30,
  approvalAbovePercent: 25,
);

/* --------------------------------------------------------------- snapshot */

class BusinessSnapshot {
  const BusinessSnapshot({
    required this.todaySales,
    required this.orders,
    required this.unitsSold,
    required this.lowStock,
    required this.outOfStock,
    required this.pendingOrders,
    required this.settlementDue,
    required this.newReviews,
    required this.needsChanges,
  });

  final int todaySales;
  final int orders;
  final int unitsSold;
  final int lowStock;
  final int outOfStock;
  final int pendingOrders;
  final int settlementDue;
  final int newReviews;
  final int needsChanges;
}

BusinessSnapshot businessSnapshot() {
  final pending = sellerOrders.where((o) => o.needsAction).length;
  final low = sellerProducts.where((p) => p.isLowStock).length;
  final out = sellerProducts.where((p) => p.isOutOfStock).length;
  final due = settlements.where((s) => !s.settled).fold(0, (sum, s) => sum + s.net);

  return BusinessSnapshot(
    todaySales: 310,
    orders: sellerOrders.length,
    unitsSold: sellerProducts.fold(0, (sum, p) => sum + p.sold),
    lowStock: low,
    outOfStock: out,
    pendingOrders: pending,
    settlementDue: due,
    newReviews: 3,
    needsChanges: sellerProducts.where((p) => p.status == ListingStatus.changesRequired).length,
  );
}

List<SellerProduct> topSellers([int limit = 3]) {
  final sorted = [...sellerProducts]..sort((a, b) => b.sold.compareTo(a.sold));
  return sorted.take(limit).toList();
}

SellerProduct slowestSeller() {
  final sorted = [...sellerProducts]..sort((a, b) => a.sold.compareTo(b.sold));
  return sorted.first;
}
