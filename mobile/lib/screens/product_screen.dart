import 'package:flutter/material.dart';

import '../data/catalog.dart';
import '../data/offer_engine.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import 'cart_screen.dart';

/// Product detail. Sticky add-to-cart at the bottom, because on a phone the
/// buy button should never be something you have to scroll back to find.
class ProductScreen extends StatefulWidget {
  const ProductScreen({super.key, required this.product});

  final Product product;

  @override
  State<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends State<ProductScreen> {
  late String _variant = widget.product.variants.first;
  final _pinController = TextEditingController();
  String? _pinResult;

  @override
  void dispose() {
    _pinController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final state = AppScope.of(context);
    final saved = state.isSaved(product.id);
    final result = evaluate(subtotal: product.price, product: product);

    return Scaffold(
      appBar: AppBar(
        title: Text(product.category, style: const TextStyle(fontSize: 15)),
        actions: [
          IconButton(
            tooltip: saved ? 'Remove from wishlist' : 'Save for later',
            icon: Icon(saved ? Icons.favorite : Icons.favorite_border,
                color: saved ? AppColors.danger : null),
            onPressed: () {
              state.toggleWishlist(product.id);
              showToast(context,
                  saved ? 'Removed from wishlist' : 'Saved to wishlist');
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 24),
        children: [
          AspectRatio(
            aspectRatio: 1.15,
            child: ProductScene(
                glyph: product.glyph,
                tone: product.tone,
                radius: 0,
                iconScale: 0.30),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(product.brand.toUpperCase(),
                    style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1,
                        color: AppColors.ink400)),
                const SizedBox(height: 6),
                Text(product.name,
                    style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 10),
                Row(
                  children: [
                    RatingRow(rating: product.rating, reviews: product.reviews),
                    const SizedBox(width: 12),
                    Text('Sold by ${product.seller}',
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
                const SizedBox(height: 16),
                PriceRow(price: product.price, mrp: product.mrp, large: true),
                const SizedBox(height: 4),
                const Text('Inclusive of all taxes',
                    style: TextStyle(fontSize: 12, color: AppColors.ink500)),

                // Only what the engine says applies here — the seller's own
                // discount first, then any platform campaign on top.
                if (result.hasAny) ...[
                  const SizedBox(height: 14),
                  for (final applied in result.applied)
                    Container(
                      margin: const EdgeInsets.only(bottom: 6),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.tealSoft,
                        borderRadius: BorderRadius.circular(Radii.md),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.local_offer_outlined, size: 17, color: AppColors.teal),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              applied.freeDelivery
                                  ? applied.label
                                  : '${applied.label} — saves ${money(applied.amount)}',
                              style: const TextStyle(
                                  fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.teal),
                            ),
                          ),
                        ],
                      ),
                    ),
                  if (result.discount > 0)
                    Text(
                      'Your price today: ${money(result.finalSubtotal)}',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                    ),
                ],

                // One near-miss, and only the actionable kind.
                if (result.nearMisses.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Text(
                    '${result.nearMisses.first.label}: ${result.nearMisses.first.reason.toLowerCase()}.',
                    style: const TextStyle(fontSize: 12, color: AppColors.ink500),
                  ),
                ],

                const SizedBox(height: 22),
                Text('Choose an option',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    for (final variant in product.variants)
                      ChoiceChip(
                        label: Text(variant),
                        selected: _variant == variant,
                        selectedColor: AppColors.brandSoft,
                        onSelected: (_) => setState(() => _variant = variant),
                      ),
                  ],
                ),

                const SizedBox(height: 22),
                Text('Delivery',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _pinController,
                        keyboardType: TextInputType.number,
                        decoration:
                            const InputDecoration(hintText: 'Enter ZIP code'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    OutlinedButton(
                      onPressed: () {
                        final pin = _pinController.text.trim();
                        setState(() {
                          _pinResult = pin.length < 5
                              ? 'Enter a 5-digit ZIP code.'
                              : 'Delivers to $pin in ${product.deliveryDays}.';
                        });
                      },
                      child: const Text('Check'),
                    ),
                  ],
                ),
                if (_pinResult != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(_pinResult!,
                        style: Theme.of(context).textTheme.bodySmall),
                  ),

                const SizedBox(height: 22),
                Text('Highlights',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                for (final highlight in product.highlights)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 6),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Padding(
                          padding: EdgeInsets.only(top: 3),
                          child: Icon(Icons.check,
                              size: 15, color: AppColors.teal),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                            child: Text(highlight,
                                style: const TextStyle(
                                    fontSize: 13.5, height: 1.4))),
                      ],
                    ),
                  ),

                const SizedBox(height: 22),
                Text('About this product',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(product.shortDescription,
                    style: const TextStyle(
                        fontSize: 13.5, height: 1.5, color: AppColors.ink700)),

                const SizedBox(height: 22),
                const _ReturnsRow(days: 7),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          decoration: const BoxDecoration(
            color: AppColors.surface,
            border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    state.addToCart(product, _variant);
                    showToast(context, 'Added to cart',
                        detail: '${product.name} · $_variant');
                  },
                  child: const Text('Add to cart'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: FilledButton(
                  onPressed: () {
                    state.addToCart(product, _variant);
                    Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const CartScreen()));
                  },
                  child: const Text('Buy now'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReturnsRow extends StatelessWidget {
  const _ReturnsRow({required this.days});
  final int days;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.ink100,
        borderRadius: BorderRadius.circular(Radii.md),
      ),
      child: Row(
        children: [
          const Icon(Icons.replay_outlined, size: 18, color: AppColors.ink700),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              '$days-day returns · Secure payment · Verified seller',
              style: const TextStyle(fontSize: 12.5, color: AppColors.ink700),
            ),
          ),
        ],
      ),
    );
  }
}
