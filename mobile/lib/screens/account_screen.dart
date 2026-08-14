import 'package:flutter/material.dart';

import '../data/catalog.dart';
import '../data/commerce.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import '../widgets/product_card.dart';
import 'offers_screen.dart';
import 'order_detail_screen.dart';

/// Account. Signed out, it asks you to sign in rather than showing an empty
/// shell of somebody else's orders.
class AccountScreen extends StatelessWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);

    if (!state.isSignedIn) {
      return EmptyState(
        icon: Icons.person_outline,
        title: 'Sign in to your account',
        body: 'Your orders, wishlist and addresses live here once you sign in.',
        action: FilledButton(
          onPressed: () => state.signIn('Rahul'),
          child: const Text('Sign in'),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.only(bottom: 28),
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 20),
          color: AppColors.surface,
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: const BoxDecoration(
                    color: AppColors.brand, shape: BoxShape.circle),
                child: Center(
                  child: Text(
                    state.customerName!.substring(0, 1),
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 19,
                        fontWeight: FontWeight.w700),
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(state.customerName!,
                        style: Theme.of(context).textTheme.titleLarge),
                    Text('rahul@gmail.com',
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SectionHeader(title: 'Your orders'),
        for (final order in customerOrders.take(3)) _OrderRow(order: order),
        const SectionHeader(title: 'Shortcuts'),
        _MenuRow(
          icon: Icons.local_offer_outlined,
          label: 'My offers',
          detail: '${state.savedOffers.length} saved',
          onTap: () => Navigator.of(context)
              .push(MaterialPageRoute(builder: (_) => const OffersScreen())),
        ),
        _MenuRow(
          icon: Icons.favorite_border,
          label: 'Wishlist',
          detail: '${state.wishlist.length} items',
          onTap: () => Navigator.of(context)
              .push(MaterialPageRoute(builder: (_) => const _WishlistScreen())),
        ),
        _MenuRow(
            icon: Icons.location_on_outlined,
            label: 'Addresses',
            detail: '2 saved',
            onTap: () => showToast(context, 'Addresses')),
        _MenuRow(
            icon: Icons.credit_card,
            label: 'Payment methods',
            detail: 'Visa •••• 4242',
            onTap: () => showToast(context, 'Payment methods')),
        _MenuRow(
            icon: Icons.replay_outlined,
            label: 'Returns & refunds',
            onTap: () => showToast(context, 'Returns')),
        _MenuRow(
            icon: Icons.rate_review_outlined,
            label: 'My reviews',
            onTap: () => showToast(context, 'Reviews')),
        _MenuRow(
            icon: Icons.notifications_none,
            label: 'Notifications',
            onTap: () => showToast(context, 'Notifications')),
        _MenuRow(
            icon: Icons.help_outline,
            label: 'Help & support',
            onTap: () => showToast(context, 'Support')),
        const SectionHeader(title: 'Selling'),
        _MenuRow(
          icon: Icons.storefront_outlined,
          label: 'Switch to selling',
          detail: 'ABC Electronics · same account, no second login',
          onTap: () {
            state.setSellingMode(true);
            showToast(context, 'Switched to your seller portal');
          },
        ),
        const SizedBox(height: 20),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: OutlinedButton(
            onPressed: () {
              state.signOut();
              showToast(context, 'Signed out');
            },
            child: const Text('Log out'),
          ),
        ),
        const SizedBox(height: 20),
        Center(
          child: Text(
            'Copyright © SafalVir, Inc. 2026.\nAll rights reserved.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
      ],
    );
  }
}

class _OrderRow extends StatelessWidget {
  const _OrderRow({required this.order});
  final CustomerOrder order;

  @override
  Widget build(BuildContext context) {
    final product = productById(order.lines.first.productId);

    return InkWell(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => OrderDetailScreen(order: order)),
      ),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 0, 16, 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(Radii.lg),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            ProductScene(glyph: product.glyph, tone: product.tone, size: 52),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      StatusPill(label: orderStageLabels[order.stage.index]),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          order.id,
                          style: const TextStyle(
                              fontSize: 11.5, color: AppColors.ink500),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    product.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 13.5, fontWeight: FontWeight.w600),
                  ),
                  Text(order.estimate,
                      style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.ink400),
          ],
        ),
      ),
    );
  }
}

class _MenuRow extends StatelessWidget {
  const _MenuRow(
      {required this.icon,
      required this.label,
      required this.onTap,
      this.detail});

  final IconData icon;
  final String label;
  final String? detail;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: Material(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(Radii.md),
        child: ListTile(
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(Radii.md),
            side: const BorderSide(color: AppColors.border),
          ),
          leading: Icon(icon, size: 21, color: AppColors.ink700),
          title: Text(label,
              style: const TextStyle(
                  fontSize: 14.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.ink950)),
          subtitle: detail == null
              ? null
              : Text(detail!, style: Theme.of(context).textTheme.bodySmall),
          trailing: const Icon(Icons.chevron_right,
              size: 20, color: AppColors.ink400),
          onTap: onTap,
        ),
      ),
    );
  }
}

class _WishlistScreen extends StatelessWidget {
  const _WishlistScreen();

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final saved = products.where((p) => state.isSaved(p.id)).toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Wishlist')),
      body: saved.isEmpty
          ? const EmptyState(
              icon: Icons.favorite_border,
              title: 'Nothing saved yet',
              body: 'Tap the heart on a product to keep it here.',
            )
          : GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.48,
              ),
              itemCount: saved.length,
              itemBuilder: (context, index) =>
                  ProductCard(product: saved[index]),
            ),
    );
  }
}
