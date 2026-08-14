import 'package:flutter_test/flutter_test.dart';

import 'package:safalmarkethub/data/catalog.dart';
import 'package:safalmarkethub/data/offer_engine.dart';

/// The engine's two load-bearing rules. Both are easy to regress silently,
/// and both change what a customer is charged.
void main() {
  final headphones = productById('SH-P-1042'); // ABC Electronics, Electronics
  final backpack = productById('SH-P-1056'); // TravelGear Store

  group('seller offer scope', () {
    test('a storewide campaign covers the seller\'s whole catalogue', () {
      final storewide = sellerOffers.firstWhere((o) => o.id == 'SO-4010');
      expect(sellerOfferCovers(storewide, headphones), isTrue);
      // …but never another seller's listing.
      expect(sellerOfferCovers(storewide, backpack), isFalse);
    });

    test('exclusions win over scope', () {
      final excluded = SellerOffer(
        id: 'X',
        seller: 'ABC Electronics',
        displayName: 'test',
        percent: 10,
        scope: SellerOfferScope.all,
        exclusions: const OfferExclusions(categories: ['Electronics']),
        startsAt: DateTime(2026, 8, 1),
        endsAt: DateTime(2026, 8, 31),
      );
      expect(sellerOfferCovers(excluded, headphones), isFalse);
    });
  });

  group('best single offer', () {
    test('two seller offers on one product resolve to one, not both', () {
      // SH-P-1042 is caught by the storewide sale AND its own 10% markdown.
      final matches = sellerOffers
          .where((o) => sellerOfferCovers(o, headphones) && statusOf(o) == OfferStatus.live)
          .toList();
      expect(matches.length, greaterThan(1), reason: 'the fixture must overlap for this to mean anything');

      final result = evaluate(subtotal: headphones.price, product: headphones);
      final sellerLines = result.applied.where((a) => a.fromSeller).toList();
      expect(sellerLines.length, 1);
    });

    test('the better discount is the one that applies', () {
      final resolved = resolveSellerOffer(headphones, headphones.price);
      final best = sellerOffers
          .where((o) => sellerOfferCovers(o, headphones) && statusOf(o) == OfferStatus.live)
          .map((o) => o.percent)
          .reduce((a, b) => a > b ? a : b);
      expect(resolved!.percent, best);
    });
  });

  test('a stated budget is never exceeded by the final price', () {
    for (final product in products) {
      final result = evaluate(subtotal: product.price, product: product);
      expect(result.finalSubtotal, lessThanOrEqualTo(product.price));
      expect(result.finalSubtotal, greaterThanOrEqualTo(0));
    }
  });
}
