import 'package:flutter/material.dart';

import '../data/catalog.dart';
import '../screens/product_screen.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import 'common.dart';

/// Deliberately plain: image, name, rating, price, one button. A product card
/// shouldn't become a mini-dashboard.
class ProductCard extends StatelessWidget {
  const ProductCard(
      {super.key, required this.product, this.reason, this.compact = false});

  final Product product;
  final String? reason;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final saved = state.isSaved(product.id);

    return InkWell(
      borderRadius: BorderRadius.circular(Radii.lg),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ProductScreen(product: product)),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(Radii.lg),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: AppColors.ink950.withValues(alpha: 0.035),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 1,
                  child: ProductScene(
                      glyph: product.glyph, tone: product.tone, radius: 0),
                ),
                Positioned(
                  top: 8,
                  right: 8,
                  child: _RoundIcon(
                    icon: saved ? Icons.favorite : Icons.favorite_border,
                    color: saved ? AppColors.danger : AppColors.ink500,
                    tooltip: saved ? 'Remove from wishlist' : 'Save for later',
                    onTap: () {
                      state.toggleWishlist(product.id);
                      showToast(
                          context,
                          saved
                              ? 'Removed from wishlist'
                              : 'Saved to wishlist');
                    },
                  ),
                ),
                if (product.badge != null)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.ink950,
                        borderRadius: BorderRadius.circular(Radii.pill),
                      ),
                      child: Text(
                        product.badge!,
                        style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: Colors.white),
                      ),
                    ),
                  ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 13),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13.8,
                      height: 1.26,
                      fontWeight: FontWeight.w800,
                      color: AppColors.ink950,
                    ),
                  ),
                  const SizedBox(height: 6),
                  RatingRow(rating: product.rating, reviews: product.reviews),
                  const SizedBox(height: 8),
                  PriceRow(price: product.price, mrp: product.mrp),
                  if (reason != null) ...[
                    const SizedBox(height: 8),
                    ReasonChip(text: reason!),
                  ],
                  const SizedBox(height: 6),
                  Text(
                    'Sold by ${product.seller}',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 11.5, height: 1.25, color: AppColors.ink600),
                  ),
                  if (!compact) ...[
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                            minimumSize: const Size(0, 38)),
                        onPressed: () {
                          state.addToCart(product, product.variants.first);
                          showToast(context, 'Added to cart',
                              detail: product.name);
                        },
                        child: const Text('Add to cart'),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoundIcon extends StatelessWidget {
  const _RoundIcon(
      {required this.icon,
      required this.onTap,
      required this.color,
      this.tooltip});

  final IconData icon;
  final VoidCallback onTap;
  final Color color;
  final String? tooltip;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip ?? '',
      child: Material(
        color: Colors.white.withValues(alpha: 0.92),
        shape: const CircleBorder(),
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(7),
            child: Icon(icon, size: 17, color: color),
          ),
        ),
      ),
    );
  }
}

/// Compact horizontal tile for "buy again" and recently-viewed strips.
class ProductTile extends StatelessWidget {
  const ProductTile(
      {super.key, required this.product, this.trailing, this.subtitle});

  final Product product;
  final Widget? trailing;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(Radii.md),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => ProductScreen(product: product)),
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            ProductScene(glyph: product.glyph, tone: product.tone, size: 56),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 13.5, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    subtitle ?? money(product.price),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 12.2, color: AppColors.ink600),
                  ),
                ],
              ),
            ),
            if (trailing != null) trailing!,
          ],
        ),
      ),
    );
  }
}
