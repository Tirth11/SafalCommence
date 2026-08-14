import 'package:flutter/material.dart';

import '../../data/seller_data.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common.dart';
import 'seller_assistant.dart';

/// What's happening with the business today.
///
/// Numbers first, then the things actually waiting on the seller. The web
/// build calls this "Requires your attention" and it earns the space — a
/// dashboard nobody can act on is a screensaver.
class SellerDashboardScreen extends StatelessWidget {
  const SellerDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = businessSnapshot();

    return ListView(
      padding: const EdgeInsets.only(bottom: 96),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 6),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Hi $sellerName 👋', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 4),
              Text("Here's what needs your attention today.", style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),

        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.9,
            children: [
              _Kpi(label: "Today's sales", value: money(s.todaySales), note: '+18% vs last week'),
              _Kpi(label: 'Orders', value: '${s.orders}', note: '${s.pendingOrders} need action'),
              _Kpi(label: 'Products sold', value: '${s.unitsSold}', note: 'Last 30 days'),
              _Kpi(
                label: 'Settlement due',
                value: money(s.settlementDue),
                note: 'Expected 18 Aug',
                tone: AppColors.teal,
              ),
            ],
          ),
        ),

        const SectionHeader(title: 'Needs your attention'),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              if (s.pendingOrders > 0)
                _AttentionRow(
                  icon: Icons.receipt_long_outlined,
                  label: '${s.pendingOrders} orders need processing',
                  action: 'Process',
                  onTap: () => showToast(context, 'Open the Orders tab'),
                ),
              if (s.lowStock > 0)
                _AttentionRow(
                  icon: Icons.inventory_2_outlined,
                  label: '${s.lowStock} products are low on stock',
                  action: 'Restock',
                  tone: AppColors.gold,
                  onTap: () => openSellerAssistant(context, seed: 'Which products are running low on stock?'),
                ),
              if (s.outOfStock > 0)
                _AttentionRow(
                  icon: Icons.error_outline,
                  label: '${s.outOfStock} product is out of stock',
                  action: 'Fix',
                  tone: AppColors.danger,
                  onTap: () => showToast(context, 'Open the Products tab'),
                ),
              if (s.needsChanges > 0)
                _AttentionRow(
                  icon: Icons.edit_outlined,
                  label: '${s.needsChanges} product needs changes',
                  action: 'Review',
                  tone: AppColors.gold,
                  onTap: () => showToast(context, 'Open the Products tab'),
                ),
              _AttentionRow(
                icon: Icons.star_outline,
                label: '${s.newReviews} new customer reviews',
                action: 'View',
                onTap: () => openSellerAssistant(context, seed: 'What are customers saying about my headphones?'),
              ),
            ],
          ),
        ),

        const SectionHeader(title: 'Best sellers', subtitle: 'Last 30 days.'),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              for (final (i, product) in topSellers(4).indexed)
                Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(Radii.md),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Text('${i + 1}',
                          style: const TextStyle(
                              fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.ink400)),
                      const SizedBox(width: 12),
                      ProductScene(glyph: product.glyph, tone: product.tone, size: 40),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(product.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                            Text(money(product.price), style: Theme.of(context).textTheme.bodySmall),
                          ],
                        ),
                      ),
                      Text('${product.sold} sold',
                          style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
            ],
          ),
        ),

        const SectionHeader(title: 'Suggested actions', subtitle: 'From your own numbers.'),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              _Suggestion(
                title: 'Restock ${sellerProducts.firstWhere((p) => p.isLowStock).name}',
                body:
                    'Only ${sellerProducts.firstWhere((p) => p.isLowStock).available} left and ${sellerProducts.firstWhere((p) => p.isLowStock).sold} sold in 30 days.',
                onTap: () => openSellerAssistant(context, seed: 'Set headphones stock to 25'),
              ),
              _Suggestion(
                title: 'Consider promoting ${slowestSeller().name}',
                body: '${slowestSeller().available} in stock but only ${slowestSeller().sold} sold recently.',
                onTap: () => openSellerAssistant(context, seed: 'Create an offer'),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Kpi extends StatelessWidget {
  const _Kpi({required this.label, required this.value, required this.note, this.tone});

  final String label;
  final String value;
  final String note;
  final Color? tone;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label.toUpperCase(),
              style: const TextStyle(
                  fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.6, color: AppColors.ink400)),
          const SizedBox(height: 6),
          Text(value,
              style: TextStyle(
                  fontSize: 20, fontWeight: FontWeight.w700, color: tone ?? AppColors.ink950, height: 1)),
          const SizedBox(height: 4),
          Text(note, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, color: AppColors.ink500)),
        ],
      ),
    );
  }
}

class _AttentionRow extends StatelessWidget {
  const _AttentionRow({
    required this.icon,
    required this.label,
    required this.action,
    required this.onTap,
    this.tone,
  });

  final IconData icon;
  final String label;
  final String action;
  final VoidCallback onTap;
  final Color? tone;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(Radii.md),
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(Radii.md),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            Icon(icon, size: 19, color: tone ?? AppColors.brand),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w500))),
            Text(action, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.brand)),
          ],
        ),
      ),
    );
  }
}

class _Suggestion extends StatelessWidget {
  const _Suggestion({required this.title, required this.body, required this.onTap});

  final String title;
  final String body;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(Radii.md),
        border: Border.all(color: AppColors.ink200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text(body, style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 8),
          OutlinedButton(
            style: OutlinedButton.styleFrom(minimumSize: const Size(0, 36)),
            onPressed: onTap,
            child: const Text('Ask the assistant'),
          ),
        ],
      ),
    );
  }
}
