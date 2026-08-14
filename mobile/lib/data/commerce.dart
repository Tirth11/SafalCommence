import 'catalog.dart';

/* ===========================================================================
   Offers, orders and the matching logic behind "Help me choose".

   Two rules carried over from the web build, because they are what make the
   help trustworthy rather than annoying:
     · An offer is only ever quoted if it actually applies to the order.
     · A stated budget is a hard limit, not a preference.
   =========================================================================== */

enum OfferKind { percent, flat, shipping }

class Offer {
  const Offer({
    required this.id,
    required this.kind,
    required this.value,
    required this.headline,
    required this.detail,
    required this.endsLabel,
    this.code,
    this.minOrder = 0,
    this.maxDiscount,
    this.category,
  });

  final String id;
  final OfferKind kind;
  final int value;
  final String headline;
  final String detail;
  final String endsLabel;
  final String? code;
  final int minOrder;
  final int? maxDiscount;
  final String? category;
}

const todayOffers = <Offer>[
  Offer(
    id: 'OF-201',
    kind: OfferKind.percent,
    value: 20,
    headline: '20% off',
    detail: 'Selected electronics',
    endsLabel: 'Ends tonight',
    maxDiscount: 40,
    category: 'Electronics',
  ),
  Offer(
    id: 'OF-202',
    kind: OfferKind.flat,
    value: 10,
    headline: 'Extra \$10 off',
    detail: 'Orders above \$60',
    endsLabel: '3 days left',
    code: 'SAVE10',
    minOrder: 60,
  ),
  Offer(
    id: 'OF-203',
    kind: OfferKind.shipping,
    value: 0,
    headline: 'Free delivery',
    detail: 'On every order, no minimum',
    endsLabel: 'Today only',
  ),
];

class UpcomingOffer {
  const UpcomingOffer(this.id, this.title, this.starts, this.detail);
  final String id;
  final String title;
  final String starts;
  final String detail;
}

const upcomingOffers = <UpcomingOffer>[
  UpcomingOffer('UP-1', 'Weekend Electronics Sale', 'Starts Saturday',
      'Up to 25% off selected products'),
  UpcomingOffer('UP-2', 'Travel Week', 'Starts 18 Aug',
      'Bags, accessories and travel kit'),
];

class PriceDrop {
  const PriceDrop(this.productId, this.label, this.wasPrice);
  final String productId;
  final String label;
  final int wasPrice;
}

const priceDrops = <PriceDrop>[
  PriceDrop('SH-P-1042', 'Price dropped since you looked', 87),
  PriceDrop('SH-P-1056', 'Saved item, now cheaper', 50),
  PriceDrop('SH-P-1054', 'Back in stock', 37),
];

int offerDiscount(Offer offer, int subtotal) {
  if (subtotal < offer.minOrder) {
    return 0;
  }
  if (offer.kind == OfferKind.shipping) {
    return 0;
  }
  if (offer.kind == OfferKind.flat) {
    return offer.value < subtotal ? offer.value : subtotal;
  }
  final raw = ((subtotal * offer.value) / 100).round();
  final cap = offer.maxDiscount;
  return cap == null ? raw : (raw < cap ? raw : cap);
}

/// The best offer this order actually qualifies for, or null. Never a
/// near-miss: suggesting an offer that cannot be used is worse than silence.
Offer? bestOfferFor(int subtotal, {String? category}) {
  final eligible = todayOffers.where((offer) {
    if (subtotal < offer.minOrder) return false;
    if (offer.category != null && offer.category != category) return false;
    return offerDiscount(offer, subtotal) > 0;
  }).toList();

  if (eligible.isEmpty) return null;
  eligible.sort((a, b) =>
      offerDiscount(b, subtotal).compareTo(offerDiscount(a, subtotal)));
  return eligible.first;
}

/* ------------------------------------------------------------------ orders */

enum OrderStage { ordered, packed, shipped, outForDelivery, delivered }

const orderStageLabels = <String>[
  'Ordered',
  'Packed',
  'Shipped',
  'Out for Delivery',
  'Delivered'
];

class OrderLine {
  const OrderLine(this.productId, this.variant, this.qty);
  final String productId;
  final String variant;
  final int qty;
}

class CustomerOrder {
  const CustomerOrder({
    required this.id,
    required this.placedOn,
    required this.stage,
    required this.estimate,
    required this.lines,
    required this.discount,
    required this.shipping,
    this.courier,
    this.tracking,
  });

  final String id;
  final String placedOn;
  final OrderStage stage;
  final String estimate;
  final List<OrderLine> lines;
  final int discount;
  final int shipping;
  final String? courier;
  final String? tracking;

  int get subtotal => lines.fold(
      0, (sum, line) => sum + productById(line.productId).price * line.qty);

  int get total => subtotal - discount + shipping;

  bool get isDelivered => stage == OrderStage.delivered;
}

const customerOrders = <CustomerOrder>[
  CustomerOrder(
    id: 'SH-100145',
    placedOn: '12 Aug 2026',
    stage: OrderStage.shipped,
    estimate: 'Arriving 16 Aug',
    lines: [
      OrderLine('SH-P-1042', 'Black', 1),
      OrderLine('SH-P-1056', 'Olive', 1)
    ],
    discount: 5,
    shipping: 5,
    courier: 'Delhivery',
    tracking: 'DLV12345678',
  ),
  CustomerOrder(
    id: 'SH-100131',
    placedOn: '09 Aug 2026',
    stage: OrderStage.outForDelivery,
    estimate: 'Arriving today',
    lines: [OrderLine('SH-P-1044', '46 mm · Titanium', 1)],
    discount: 6,
    shipping: 0,
    courier: 'Blue Dart',
    tracking: 'BD5512099834',
  ),
  CustomerOrder(
    id: 'SH-100096',
    placedOn: '02 Aug 2026',
    stage: OrderStage.delivered,
    estimate: 'Delivered 05 Aug',
    lines: [OrderLine('SH-P-1052', '20 kg pair', 1)],
    discount: 4,
    shipping: 5,
    courier: 'Delhivery',
    tracking: 'DLV99120043',
  ),
  CustomerOrder(
    id: 'SH-100072',
    placedOn: '28 Jul 2026',
    stage: OrderStage.delivered,
    estimate: 'Delivered 31 Jul',
    lines: [OrderLine('SH-P-1050', '30 ml', 1)],
    discount: 1,
    shipping: 5,
  ),
];

CustomerOrder? get activeOrder {
  for (final order in customerOrders) {
    if (!order.isDelivered) return order;
  }
  return null;
}

/* ------------------------------------------------------- "help me choose" */

class GuideStep {
  const GuideStep(this.id, this.question, this.options);
  final String id;
  final String question;
  final List<GuideOption> options;
}

class GuideOption {
  const GuideOption(this.value, this.label);
  final String value;
  final String label;
}

const guideSteps = <GuideStep>[
  GuideStep('category', 'What are you looking for?', [
    GuideOption('Electronics', 'Electronics'),
    GuideOption('Fashion', 'Fashion'),
    GuideOption('Home & Living', 'Home'),
    GuideOption('Beauty', 'Beauty'),
    GuideOption('Sports', 'Fitness'),
    GuideOption('any', 'Not sure yet'),
  ]),
  GuideStep('budget', "What's your budget?", [
    GuideOption('25', 'Up to \$25'),
    GuideOption('50', 'Up to \$50'),
    GuideOption('100', 'Up to \$100'),
    GuideOption('any', 'No fixed budget'),
  ]),
  GuideStep('priority', 'What matters most?', [
    GuideOption('sound', 'Sound'),
    GuideOption('battery', 'Battery'),
    GuideOption('comfort', 'Comfort'),
    GuideOption('portable', 'Travel-friendly'),
    GuideOption('value', 'Best value'),
  ]),
];

/// Hand-tagged qualities — eight products don't need a taxonomy.
const _qualities = <String, List<String>>{
  'SH-P-1042': ['sound', 'battery', 'comfort'],
  'SH-P-1044': ['battery'],
  'SH-P-1046': ['comfort', 'value'],
  'SH-P-1048': ['value'],
  'SH-P-1050': ['value'],
  'SH-P-1052': ['value'],
  'SH-P-1054': ['portable', 'value'],
  'SH-P-1056': ['comfort', 'portable', 'value'],
};

const _priorityWords = <String, String>{
  'sound': 'Best for sound',
  'battery': 'Best for battery life',
  'comfort': 'Most comfortable pick',
  'portable': 'Best for travel',
  'value': 'Best value',
};

class Match {
  const Match(this.product, this.reason);
  final Product product;
  final String reason;
}

/// Budget is a promise, not a preference — nothing over the cap is returned.
/// The category only widens when it would otherwise leave the shopper with
/// nothing, and then the reason says so out loud.
List<Match> findMatches(
    {String? category, String? budget, String? priority, int limit = 4}) {
  final cap = (budget == null || budget == 'any') ? 1 << 30 : int.parse(budget);
  final affordable = products.where((p) => p.price <= cap).toList();

  final inCategory = (category == null || category == 'any')
      ? affordable
      : affordable.where((p) => p.category == category).toList();

  final widened = inCategory.isEmpty;
  final pool = widened ? affordable : inCategory;

  pool.sort((a, b) {
    double score(Product p) {
      var value = 1.0;
      if (p.price <= cap * 0.75) {
        value += 1;
      }
      if (priority != null &&
          (_qualities[p.id] ?? const []).contains(priority)) {
        value += 4;
      }
      return value + (p.rating - 4);
    }

    return score(b).compareTo(score(a));
  });

  return pool.take(limit).map((product) {
    if (widened) {
      return Match(
          product, 'Nothing in that category in budget — this is close');
    }
    if (priority != null &&
        (_qualities[product.id] ?? const []).contains(priority)) {
      return Match(product, _priorityWords[priority] ?? 'Good match');
    }
    if (cap != 1 << 30 && product.price <= cap * 0.75) {
      return Match(product, 'Comfortably within your budget');
    }
    if (cap != 1 << 30) {
      return Match(product, 'Good match for your budget');
    }
    if (product.rating >= 4.5) {
      return Match(product, 'Highly rated by shoppers');
    }
    return Match(product, product.shortDescription);
  }).toList();
}

/// Free-text search. A word has to match before price is considered, so a
/// cheap shirt never answers a search for headphones.
List<Match> searchProducts(String query, {int limit = 4}) {
  final q = query.toLowerCase().trim();
  if (q.isEmpty) return const [];

  final priceMatch =
      RegExp(r'(?:under|below|less than)\s*\$?\s*(\d+)').firstMatch(q);
  final cap = priceMatch != null ? int.parse(priceMatch.group(1)!) : 1 << 30;
  final words = q
      .replaceAll(RegExp(r'(?:under|below|less than)\s*\$?\s*\d+'), '')
      .split(RegExp(r'\s+'))
      .where((w) => w.length > 2)
      .toList();

  final scored = <MapEntry<Product, int>>[];
  for (final product in products) {
    final haystack =
        '${product.name} ${product.brand} ${product.category} ${product.shortDescription}'
            .toLowerCase();
    final hits = words.where(haystack.contains).length;
    if (words.isNotEmpty && hits == 0) continue;
    if (product.price > cap) continue;
    scored.add(MapEntry(product, hits * 3 + (product.rating * 10).round()));
  }

  scored.sort((a, b) => b.value.compareTo(a.value));
  return scored.take(limit).map((entry) {
    final product = entry.key;
    if (cap != 1 << 30) return Match(product, 'Within your budget');
    return Match(product, product.shortDescription);
  }).toList();
}

/// Photo search, honestly mocked: a real build sends the image to a vision
/// model. Here it returns visually similar products so the flow is reviewable.
List<Match> similarToPhoto({int limit = 4}) =>
    products.take(limit).map((p) => Match(p, p.shortDescription)).toList();
