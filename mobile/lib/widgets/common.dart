import 'package:flutter/material.dart';

import '../data/catalog.dart';
import '../theme/app_theme.dart';

/// Generated product artwork: a glyph on a soft gradient, the mobile twin of
/// the web's `ProductScene`. Swap for an Image.network when real photography
/// exists — nothing else has to change.
class ProductScene extends StatelessWidget {
  const ProductScene({
    super.key,
    required this.glyph,
    required this.tone,
    this.size,
    this.radius = Radii.md,
    this.iconScale = 0.34,
  });

  final Glyph glyph;
  final Tone tone;
  final double? size;
  final double radius;
  final double iconScale;

  static const _palettes = <Tone, List<Color>>{
    Tone.brand: [Color(0xFFEDE8FE), Color(0xFFD8CEFB)],
    Tone.teal: [Color(0xFFE3F3F1), Color(0xFFC7E7E2)],
    Tone.gold: [Color(0xFFFBF0DC), Color(0xFFF3DFB8)],
    Tone.ink: [Color(0xFFEDEDF2), Color(0xFFDCDCE5)],
  };

  static const _inks = <Tone, Color>{
    Tone.brand: AppColors.brand,
    Tone.teal: AppColors.teal,
    Tone.gold: AppColors.gold,
    Tone.ink: AppColors.ink700,
  };

  @override
  Widget build(BuildContext context) {
    final colors = _palettes[tone]!;

    return LayoutBuilder(
      builder: (context, constraints) {
        final box = size ??
            (constraints.hasBoundedWidth ? constraints.maxWidth : 120.0);

        return Container(
          width: size,
          height: size,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(radius),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: colors,
            ),
          ),
          child: Center(
            child: Icon(
              iconFor(glyph),
              size: box * iconScale,
              color: _inks[tone]!.withOpacity(0.85),
            ),
          ),
        );
      },
    );
  }
}

/// Section heading with an optional trailing action — the rhythm every
/// scrolling screen uses.
class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title, this.subtitle, this.actionLabel, this.onAction});

  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: Theme.of(context).textTheme.titleLarge),
                if (subtitle != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 2),
                    child: Text(subtitle!, style: Theme.of(context).textTheme.bodySmall),
                  ),
              ],
            ),
          ),
          if (actionLabel != null)
            TextButton(
              onPressed: onAction,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(actionLabel!),
                  const Icon(Icons.arrow_forward, size: 15),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// Lifecycle labels, one place, same tone mapping as the web StatusBadge.
class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.label, this.tone});

  final String label;
  final Tone? tone;

  static const _map = <String, Color>{
    'Delivered': AppColors.teal,
    'Shipped': AppColors.brand,
    'Out for Delivery': AppColors.brand,
    'Packed': AppColors.brand,
    'Ordered': AppColors.ink500,
    'Cancelled': AppColors.danger,
    'Active': AppColors.teal,
    'Used': AppColors.ink500,
  };

  @override
  Widget build(BuildContext context) {
    final color = _map[label] ?? AppColors.ink500;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(Radii.pill),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color),
      ),
    );
  }
}

/// The one-line "why this is here" note the assistant attaches to a result.
class ReasonChip extends StatelessWidget {
  const ReasonChip({super.key, required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.tealSoft,
        borderRadius: BorderRadius.circular(Radii.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.auto_awesome, size: 11, color: AppColors.teal),
          const SizedBox(width: 4),
          Flexible(
            child: Text(
              text,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.teal),
            ),
          ),
        ],
      ),
    );
  }
}

class RatingRow extends StatelessWidget {
  const RatingRow({super.key, required this.rating, this.reviews});

  final double rating;
  final int? reviews;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.star_rounded, size: 14, color: Color(0xFFE0A82E)),
        const SizedBox(width: 3),
        Text(
          rating.toStringAsFixed(1),
          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.ink700),
        ),
        if (reviews != null) ...[
          const SizedBox(width: 4),
          Text('($reviews)', style: const TextStyle(fontSize: 12, color: AppColors.ink500)),
        ],
      ],
    );
  }
}

class PriceRow extends StatelessWidget {
  const PriceRow({super.key, required this.price, required this.mrp, this.large = false});

  final int price;
  final int mrp;
  final bool large;

  @override
  Widget build(BuildContext context) {
    final off = discountPercent(mrp, price);
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 8,
      children: [
        Text(
          money(price),
          style: TextStyle(
            fontSize: large ? 26 : 16,
            fontWeight: FontWeight.w700,
            color: AppColors.ink950,
            letterSpacing: -0.4,
          ),
        ),
        Text(
          money(mrp),
          style: TextStyle(
            fontSize: large ? 15 : 12,
            color: AppColors.ink400,
            decoration: TextDecoration.lineThrough,
          ),
        ),
        if (off > 0)
          Text(
            '$off% off',
            style: TextStyle(
              fontSize: large ? 14 : 12,
              fontWeight: FontWeight.w700,
              color: AppColors.teal,
            ),
          ),
      ],
    );
  }
}

/// A row of horizontally scrolling cards — used for offers and product rails.
class HorizontalRail extends StatelessWidget {
  const HorizontalRail({super.key, required this.children, this.height = 268, this.itemWidth = 168});

  final List<Widget> children;
  final double height;
  final double itemWidth;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: height,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: children.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) => SizedBox(width: itemWidth, child: children[index]),
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  const EmptyState({super.key, required this.icon, required this.title, required this.body, this.action});

  final IconData icon;
  final String title;
  final String body;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: const BoxDecoration(color: AppColors.ink100, shape: BoxShape.circle),
              child: Icon(icon, color: AppColors.ink400),
            ),
            const SizedBox(height: 16),
            Text(title, style: Theme.of(context).textTheme.titleLarge, textAlign: TextAlign.center),
            const SizedBox(height: 6),
            Text(body, style: Theme.of(context).textTheme.bodySmall, textAlign: TextAlign.center),
            if (action != null) ...[const SizedBox(height: 20), action!],
          ],
        ),
      ),
    );
  }
}

void showToast(BuildContext context, String message, {String? detail}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        backgroundColor: AppColors.ink950,
        margin: const EdgeInsets.all(16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.md)),
        content: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(message, style: const TextStyle(fontWeight: FontWeight.w600)),
            if (detail != null)
              Text(detail, style: const TextStyle(fontSize: 12, color: Color(0xFFC9C7D6))),
          ],
        ),
      ),
    );
}
