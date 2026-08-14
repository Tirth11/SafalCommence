import '../theme/app_theme.dart';
import 'catalog.dart';
import 'commerce.dart';

/* ===========================================================================
   The Offer Engine — the Dart twin of lib/data/offer-engine.ts on the web.

   Three parties, three responsibilities, one calculator:

     · The platform decides what campaigns run and the limits sellers work in.
     · Sellers decide the discount on their own products.
     · This decides which of those a given customer can use right now.

   Two rules matter enough to state, because both are easy to get wrong:

     · A seller campaign is a RULE, not a product list. "Everything in my
       store" covers listings added after the campaign started.
     · Two of the same seller's offers on one product resolve to the better
       single discount, not both. A 15% markdown inside a 10% storewide sale
       is 23.5% off if you stack them — a number nobody agreed to.
   =========================================================================== */

enum SellerOfferScope { all, category, collection, brand, products }

const sellerScopeLabels = <SellerOfferScope, String>{
  SellerOfferScope.all: 'Everything in the store',
  SellerOfferScope.category: 'Selected categories',
  SellerOfferScope.collection: 'Selected collections',
  SellerOfferScope.brand: 'Selected brands',
  SellerOfferScope.products: 'Selected products',
};

/// What happens when two of the same seller's offers catch one product.
enum DiscountConflictRule { bestSingle, combine, skipDiscounted }

/// Even a storewide sale usually has things it shouldn't touch. Exclusions
/// live in the rule so they keep holding as the catalogue grows.
class OfferExclusions {
  const OfferExclusions({
    this.categories = const [],
    this.brands = const [],
    this.productIds = const [],
    this.alreadyDiscounted = false,
  });

  final List<String> categories;
  final List<String> brands;
  final List<String> productIds;
  final bool alreadyDiscounted;
}

enum OfferStatus { scheduled, live, expired, paused, pendingApproval }

/// A seller's own promotion — either a one-product markdown or a named
/// campaign across a slice of their catalogue.
class SellerOffer {
  const SellerOffer({
    required this.id,
    required this.seller,
    required this.displayName,
    required this.percent,
    required this.scope,
    required this.startsAt,
    required this.endsAt,
    this.name,
    this.scopeValues = const [],
    this.productIds = const [],
    this.exclusions = const OfferExclusions(),
    this.conflictRule = DiscountConflictRule.bestSingle,
  });

  final String id;
  final String seller;

  /// Campaign name. A single-product markdown has none — the discount is the
  /// label.
  final String? name;
  final String displayName;
  final int percent;
  final SellerOfferScope scope;
  final List<String> scopeValues;
  final List<String> productIds;
  final OfferExclusions exclusions;
  final DiscountConflictRule conflictRule;
  final DateTime startsAt;
  final DateTime endsAt;

  bool get isCampaign => name != null;
}

/// Pinned so the mockup always has a live campaign to show.
final _now = DateTime(2026, 8, 14, 12);

final sellerOffers = <SellerOffer>[
  SellerOffer(
    id: 'SO-4010',
    seller: 'ABC Electronics',
    name: 'Independence Day Sale',
    displayName: 'Independence Day Sale — 10% off',
    percent: 10,
    scope: SellerOfferScope.all,
    startsAt: DateTime(2026, 8, 13),
    endsAt: DateTime(2026, 8, 18, 23, 59),
  ),
  SellerOffer(
    id: 'SO-4001',
    seller: 'ABC Electronics',
    displayName: '10% off',
    percent: 10,
    scope: SellerOfferScope.products,
    productIds: ['SH-P-1042'],
    startsAt: DateTime(2026, 8, 12),
    endsAt: DateTime(2026, 8, 17, 23, 59),
  ),
  SellerOffer(
    id: 'SO-4020',
    seller: 'TravelGear Store',
    name: 'Travel Week',
    displayName: 'Travel Week — 15% off',
    percent: 15,
    scope: SellerOfferScope.all,
    startsAt: DateTime(2026, 8, 14),
    endsAt: DateTime(2026, 8, 21, 23, 59),
  ),
  SellerOffer(
    id: 'SO-4011',
    seller: 'ABC Electronics',
    name: 'Monsoon Audio Week',
    displayName: 'Monsoon Audio Week — 15% off',
    percent: 15,
    scope: SellerOfferScope.category,
    scopeValues: ['Electronics'],
    startsAt: DateTime(2026, 8, 24),
    endsAt: DateTime(2026, 8, 31, 23, 59),
  ),
];

OfferStatus statusOf(SellerOffer offer) {
  if (offer.endsAt.isBefore(_now)) return OfferStatus.expired;
  if (offer.startsAt.isAfter(_now)) return OfferStatus.scheduled;
  return OfferStatus.live;
}

bool _isLive(SellerOffer offer) => statusOf(offer) == OfferStatus.live;

/// A seller offer only ever covers that seller's own listings — the scope
/// widens which of their products it hits, never whose.
bool sellerOfferCovers(SellerOffer offer, Product product) {
  if (product.seller != offer.seller) return false;

  final inScope = switch (offer.scope) {
    SellerOfferScope.all => true,
    SellerOfferScope.category => offer.scopeValues.contains(product.category),
    SellerOfferScope.collection || SellerOfferScope.brand => offer.scopeValues.contains(product.brand),
    SellerOfferScope.products => offer.productIds.contains(product.id),
  };
  if (!inScope) return false;

  // Exclusions apply after scope, so "everything except X" needs no product
  // list and keeps working as the catalogue grows.
  final ex = offer.exclusions;
  if (ex.categories.contains(product.category)) return false;
  if (ex.brands.contains(product.brand)) return false;
  if (ex.productIds.contains(product.id)) return false;

  return true;
}

int _sellerAmount(SellerOffer offer, int subtotal) => ((subtotal * offer.percent) / 100).round();

/// Every seller offer catching this product, resolved to what the customer
/// actually gets. Defaults to the better single discount rather than both.
SellerOffer? resolveSellerOffer(Product product, int subtotal) {
  final matches = sellerOffers.where((o) => _isLive(o) && sellerOfferCovers(o, product)).toList();
  if (matches.isEmpty) return null;
  if (matches.length == 1) return matches.first;

  final specific = matches.where((o) => o.scope == SellerOfferScope.products).toList();
  final wide = matches.where((o) => o.scope != SellerOfferScope.products);

  // A campaign told to leave marked-down products alone does exactly that.
  if (specific.isNotEmpty && wide.any((o) => o.conflictRule == DiscountConflictRule.skipDiscounted)) {
    return specific.first;
  }

  matches.sort((a, b) => _sellerAmount(b, subtotal).compareTo(_sellerAmount(a, subtotal)));
  return matches.first;
}

/* ------------------------------------------------------------- evaluation */

class AppliedOffer {
  const AppliedOffer({required this.label, required this.amount, this.freeDelivery = false, this.fromSeller = false});

  final String label;
  final int amount;
  final bool freeDelivery;
  final bool fromSeller;
}

class NearMiss {
  const NearMiss(this.label, this.reason);
  final String label;
  final String reason;
}

class Evaluation {
  const Evaluation({
    required this.applied,
    required this.discount,
    required this.finalSubtotal,
    required this.freeDelivery,
    required this.nearMisses,
  });

  final List<AppliedOffer> applied;
  final int discount;
  final int finalSubtotal;
  final bool freeDelivery;
  final List<NearMiss> nearMisses;

  bool get hasAny => applied.isNotEmpty;
}

/// The single calculation every screen uses.
///
/// Order mirrors the web build: the seller's own discount reduces their price
/// first, then a platform campaign applies to what remains. An offer shown on
/// one screen is one that survived every check here, which is the only way
/// the same promise holds in the cart, on the product page and in chat.
Evaluation evaluate({required int subtotal, Product? product, bool isNewCustomer = false}) {
  final applied = <AppliedOffer>[];
  final nearMisses = <NearMiss>[];
  var running = subtotal;
  var freeDelivery = false;

  // 1 — the seller's own offer on this product
  if (product != null) {
    final sellerOffer = resolveSellerOffer(product, running);
    if (sellerOffer != null) {
      final amount = _sellerAmount(sellerOffer, running);
      if (amount > 0) {
        applied.add(AppliedOffer(
          label: '${sellerOffer.displayName} · ${sellerOffer.seller}',
          amount: amount,
          fromSeller: true,
        ));
        running -= amount;
      }
    }
  }

  // 2 — platform campaigns, best first
  final candidates = [...todayOffers]..sort(
      (a, b) => offerDiscount(b, running).compareTo(offerDiscount(a, running)),
    );

  var usedPlatformOffer = false;

  for (final offer in candidates) {
    if (offer.category != null && offer.category != product?.category) {
      continue;
    }
    if (running < offer.minOrder) {
      nearMisses.add(NearMiss(offer.headline, 'Spend ${money(offer.minOrder - running)} more to use this'));
      continue;
    }
    if (offer.kind == OfferKind.shipping) {
      freeDelivery = true;
      applied.add(AppliedOffer(label: offer.headline, amount: 0, freeDelivery: true));
      continue;
    }
    // One platform discount per order, matching the web combination rules.
    if (usedPlatformOffer) continue;

    final amount = offerDiscount(offer, running);
    if (amount <= 0) continue;

    applied.add(AppliedOffer(label: offer.headline, amount: amount));
    running -= amount;
    usedPlatformOffer = true;
  }

  return Evaluation(
    applied: applied,
    discount: subtotal - running,
    finalSubtotal: running,
    freeDelivery: freeDelivery,
    nearMisses: nearMisses,
  );
}

/// The single line a product card shows, if any.
({String label, int price})? saleBadgeFor(Product product) {
  final result = evaluate(subtotal: product.price, product: product);
  if (!result.hasAny || result.discount <= 0) return null;

  final seller = result.applied.where((a) => a.fromSeller).toList();
  final headline = seller.isNotEmpty ? seller.first.label.split(' · ').first : result.applied.first.label;
  return (label: headline, price: result.finalSubtotal);
}

/// Live campaigns worth naming on the home screen and in the assistant.
List<SellerOffer> liveCampaigns() =>
    sellerOffers.where((o) => _isLive(o) && o.isCampaign).toList();
