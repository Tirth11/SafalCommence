import 'package:flutter/material.dart';

import '../data/catalog.dart';
import '../data/commerce.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import '../widgets/product_card.dart';
import 'assistant_sheet.dart';
import 'listing_screen.dart';
import 'offers_screen.dart';
import 'order_detail_screen.dart';

/// The shopping home.
///
/// Not a dashboard — no "Orders: 0" tiles. It answers the questions people
/// actually arrive with, in the order they ask them: what can I buy, is
/// anything on offer, where is my parcel, and can you help me choose.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key, required this.onOpenTab});

  final void Function(int index) onOpenTab;

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final order = activeOrder;
    final saved = products.where((p) => state.isSaved(p.id)).toList();

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _Hero(onOpenTab: onOpenTab)),
        if (order != null) SliverToBoxAdapter(child: _ActiveOrderCard(order: order)),

        const SliverToBoxAdapter(child: SectionHeader(title: "Today's offers 🔥", subtitle: 'Running now — no waiting.')),
        SliverToBoxAdapter(
          child: HorizontalRail(
            height: 172,
            itemWidth: 232,
            children: [for (final offer in todayOffers) _OfferCard(offer: offer)],
          ),
        ),

        SliverToBoxAdapter(
          child: SectionHeader(
            title: 'Shop by category',
            actionLabel: 'All',
            onAction: () => onOpenTab(1),
          ),
        ),
        SliverToBoxAdapter(child: _CategoryStrip(onOpenTab: onOpenTab)),

        const SliverToBoxAdapter(
          child: SectionHeader(title: 'What are you shopping for?', subtitle: 'Not everyone thinks in categories.'),
        ),
        SliverToBoxAdapter(child: const _NeedsStrip()),

        const SliverToBoxAdapter(
          child: SectionHeader(title: 'Shop within your budget', subtitle: "Pick a number and we'll stay under it."),
        ),
        SliverToBoxAdapter(child: const _BudgetStrip()),

        const SliverToBoxAdapter(
          child: SectionHeader(title: 'Popular right now', subtitle: 'What shoppers are buying this week.'),
        ),
        SliverToBoxAdapter(
          child: HorizontalRail(
            children: [for (final product in products.take(5)) ProductCard(product: product)],
          ),
        ),

        if (saved.isNotEmpty) ...[
          const SliverToBoxAdapter(child: SectionHeader(title: 'Your wishlist', subtitle: 'Saved for later.')),
          SliverToBoxAdapter(
            child: HorizontalRail(children: [for (final product in saved) ProductCard(product: product)]),
          ),
        ],

        const SliverToBoxAdapter(child: SectionHeader(title: 'Offers for you', subtitle: 'Based on what you viewed.')),
        SliverToBoxAdapter(child: const _PriceDrops()),

        const SliverToBoxAdapter(child: SectionHeader(title: 'Coming soon', subtitle: 'Worth waiting a few days for.')),
        SliverToBoxAdapter(child: const _ComingSoon()),

        const SliverToBoxAdapter(child: _CantDecide()),
        const SliverToBoxAdapter(child: _TrustStrip()),
        const SliverToBoxAdapter(child: _SellerLine()),
        const SliverToBoxAdapter(child: SizedBox(height: 28)),
      ],
    );
  }
}

/* ------------------------------------------------------------------ hero -- */
class _Hero extends StatelessWidget {
  const _Hero({required this.onOpenTab});
  final void Function(int index) onOpenTab;

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final name = state.customerName;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFFF3F0FE), Color(0xFFEAF5F3), Color(0xFFFAFAFC)],
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            name != null ? 'Hi $name 👋' : 'Find it. Buy it.',
            style: Theme.of(context).textTheme.headlineLarge,
          ),
          const SizedBox(height: 6),
          Text(
            name != null
                ? 'What are you looking for today?'
                : 'Search for what you need, or let us help you choose.',
            style: const TextStyle(fontSize: 15, color: AppColors.ink500),
          ),
          const SizedBox(height: 18),

          // The search field is the centre of gravity, exactly as on the web.
          InkWell(
            borderRadius: BorderRadius.circular(Radii.pill),
            onTap: () => onOpenTab(2),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(Radii.pill),
                border: Border.all(color: AppColors.border),
                boxShadow: [
                  BoxShadow(color: AppColors.ink950.withOpacity(0.05), blurRadius: 18, offset: const Offset(0, 6)),
                ],
              ),
              child: const Row(
                children: [
                  Icon(Icons.search, size: 20, color: AppColors.ink400),
                  SizedBox(width: 10),
                  Text('Search products, brands or categories', style: TextStyle(color: AppColors.ink400, fontSize: 14)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Three ways in, named plainly.
          Row(
            children: [
              Expanded(
                child: _QuickAction(
                  icon: Icons.photo_camera_outlined,
                  label: 'Photo',
                  onTap: () => openAssistant(context, AssistantMode.photo),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 2,
                child: _QuickAction(
                  icon: Icons.auto_awesome,
                  label: 'Help me choose',
                  primary: true,
                  onTap: () => openAssistant(context, AssistantMode.guide),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _QuickAction(
                  icon: Icons.local_offer_outlined,
                  label: 'Offers',
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const OffersScreen()),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickAction extends StatelessWidget {
  const _QuickAction({required this.icon, required this.label, required this.onTap, this.primary = false});

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool primary;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(Radii.pill),
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 11),
        decoration: BoxDecoration(
          color: primary ? AppColors.ink950 : AppColors.surface,
          borderRadius: BorderRadius.circular(Radii.pill),
          border: Border.all(color: primary ? AppColors.ink950 : AppColors.border),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 16, color: primary ? Colors.white : AppColors.brand),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: primary ? Colors.white : AppColors.ink700,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/* ---------------------------------------------------------- active order -- */
class _ActiveOrderCard extends StatelessWidget {
  const _ActiveOrderCard({required this.order});
  final CustomerOrder order;

  @override
  Widget build(BuildContext context) {
    final line = order.lines.first;
    final product = productById(line.productId);
    final reached = order.stage.index;

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(Radii.lg),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ProductScene(glyph: product.glyph, tone: product.tone, size: 52),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.local_shipping_outlined, size: 15, color: AppColors.brand),
                          SizedBox(width: 6),
                          Text(
                            'Your order is on the way',
                            style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.brand),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        product.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w600),
                      ),
                      Text('${order.id} · ${order.estimate}', style: Theme.of(context).textTheme.bodySmall),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Progress reads left to right, current stage filled.
            Row(
              children: [
                for (var i = 0; i < orderStageLabels.length; i++)
                  Expanded(
                    child: Padding(
                      padding: EdgeInsets.only(right: i == orderStageLabels.length - 1 ? 0 : 4),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            height: 5,
                            decoration: BoxDecoration(
                              color: i < reached
                                  ? AppColors.teal
                                  : i == reached
                                      ? AppColors.brand
                                      : AppColors.ink200,
                              borderRadius: BorderRadius.circular(Radii.pill),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            orderStageLabels[i],
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 9.5,
                              fontWeight: i <= reached ? FontWeight.w700 : FontWeight.w400,
                              color: i <= reached ? AppColors.ink700 : AppColors.ink400,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => OrderDetailScreen(order: order)),
                ),
                child: const Text('Track order'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/* ---------------------------------------------------------------- offers -- */
class _OfferCard extends StatelessWidget {
  const _OfferCard({required this.offer});
  final Offer offer;

  static const _tones = <String, List<Color>>{
    'OF-201': [Color(0xFFEDE8FE), AppColors.brand],
    'OF-202': [Color(0xFFE3F3F1), AppColors.teal],
    'OF-203': [Color(0xFFFBF0DC), AppColors.gold],
  };

  @override
  Widget build(BuildContext context) {
    final palette = _tones[offer.id] ?? const [AppColors.ink100, AppColors.ink700];

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: palette[0],
        borderRadius: BorderRadius.circular(Radii.lg),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            offer.headline,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, letterSpacing: -0.6),
          ),
          const SizedBox(height: 4),
          Text(offer.detail, style: const TextStyle(fontSize: 13, color: AppColors.ink700)),
          if (offer.code != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.75),
                borderRadius: BorderRadius.circular(Radii.sm),
                border: Border.all(color: palette[1].withOpacity(0.35)),
              ),
              child: Text(
                offer.code!,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: palette[1]),
              ),
            ),
          ],
          const Spacer(),
          Row(
            children: [
              Text(
                offer.endsLabel.toUpperCase(),
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.6, color: AppColors.ink500),
              ),
              const Spacer(),
              TextButton(
                style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8), minimumSize: Size.zero),
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => ListingScreen(category: offer.category)),
                ),
                child: const Text('Shop'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/* -------------------------------------------------------------- browsing -- */
class _CategoryStrip extends StatelessWidget {
  const _CategoryStrip({required this.onOpenTab});
  final void Function(int index) onOpenTab;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 112,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final category = categories[index];
          return InkWell(
            borderRadius: BorderRadius.circular(Radii.md),
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => ListingScreen(category: category.label)),
            ),
            child: SizedBox(
              width: 78,
              child: Column(
                children: [
                  ProductScene(glyph: category.glyph, tone: category.tone, size: 70, radius: Radii.lg),
                  const SizedBox(height: 8),
                  Text(
                    category.label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _NeedsStrip extends StatelessWidget {
  const _NeedsStrip();

  @override
  Widget build(BuildContext context) {
    return HorizontalRail(
      height: 148,
      itemWidth: 176,
      children: [
        for (final need in shoppingNeeds)
          InkWell(
            borderRadius: BorderRadius.circular(Radii.lg),
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => const ListingScreen()),
            ),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(Radii.lg),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ProductScene(glyph: need.glyph, tone: need.tone, size: 44),
                  const Spacer(),
                  Text(need.label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  Text(
                    need.blurb,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 11.5, color: AppColors.ink500, height: 1.3),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

class _BudgetStrip extends StatelessWidget {
  const _BudgetStrip();

  @override
  Widget build(BuildContext context) {
    const fills = [Color(0xFFEDE8FE), Color(0xFFE3F3F1), Color(0xFFFBF0DC), AppColors.ink100];

    return SizedBox(
      height: 74,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: budgetBands.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final band = budgetBands[index];
          return InkWell(
            borderRadius: BorderRadius.circular(Radii.lg),
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => ListingScreen(maxPrice: band.max)),
            ),
            child: Container(
              width: 132,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: fills[index % fills.length], borderRadius: BorderRadius.circular(Radii.lg)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(band.label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 2),
                  const Text('Browse →', style: TextStyle(fontSize: 11.5, color: AppColors.ink500)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _PriceDrops extends StatelessWidget {
  const _PriceDrops();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          for (final drop in priceDrops)
            Builder(
              builder: (context) {
                final product = productById(drop.productId);
                final saved = drop.wasPrice - product.price;
                return ProductTile(
                  product: product,
                  subtitle: '${drop.label} · saves ${money(saved)}',
                  trailing: Text(
                    money(product.price),
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }
}

class _ComingSoon extends StatelessWidget {
  const _ComingSoon();

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        children: [
          for (final offer in upcomingOffers)
            Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(Radii.lg),
                border: Border.all(color: AppColors.border, style: BorderStyle.solid),
                color: AppColors.surface,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          offer.starts.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                            color: AppColors.brand,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(offer.title, style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700)),
                        Text(offer.detail, style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
                    onPressed: () {
                      state.toggleReminder(offer.id);
                      showToast(
                        context,
                        state.reminders.contains(offer.id) ? "We'll remind you" : 'Reminder removed',
                        detail: state.reminders.contains(offer.id) ? offer.title : null,
                      );
                    },
                    child: Text(state.reminders.contains(offer.id) ? 'Reminder set' : 'Notify me'),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _CantDecide extends StatelessWidget {
  const _CantDecide();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(Radii.xl),
          gradient: const LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFFF3F0FE), Color(0xFFFFFFFF)],
          ),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Can't decide?", style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 6),
            const Text(
              "Tell us what you're looking for and we'll narrow it down to a few good options.",
              style: TextStyle(fontSize: 14, height: 1.45, color: AppColors.ink700),
            ),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(Radii.md),
                border: Border.all(color: AppColors.border),
              ),
              child: const Text(
                '“I need a good smartwatch under \$150.”',
                style: TextStyle(fontSize: 13.5, fontStyle: FontStyle.italic, color: AppColors.ink500),
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: FilledButton.icon(
                    onPressed: () => openAssistant(context, AssistantMode.guide),
                    icon: const Icon(Icons.auto_awesome, size: 17),
                    label: const Text('Help me choose'),
                  ),
                ),
                const SizedBox(width: 10),
                OutlinedButton(
                  onPressed: () => openAssistant(context, AssistantMode.photo),
                  child: const Icon(Icons.photo_camera_outlined, size: 19),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TrustStrip extends StatelessWidget {
  const _TrustStrip();

  @override
  Widget build(BuildContext context) {
    const items = [
      (Icons.verified_user_outlined, 'Secure payments'),
      (Icons.replay_outlined, 'Easy returns'),
      (Icons.local_shipping_outlined, 'Order tracking'),
      (Icons.workspace_premium_outlined, 'Verified sellers'),
    ];

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 12),
      decoration: BoxDecoration(color: AppColors.ink100, borderRadius: BorderRadius.circular(Radii.lg)),
      child: Wrap(
        alignment: WrapAlignment.spaceEvenly,
        runSpacing: 14,
        children: [
          for (final item in items)
            SizedBox(
              width: 150,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(item.$1, size: 17, color: AppColors.teal),
                  const SizedBox(width: 7),
                  Flexible(
                    child: Text(
                      item.$2,
                      style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

/// Selling gets one quiet line, last. This app belongs to shoppers.
class _SellerLine extends StatelessWidget {
  const _SellerLine();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: AppColors.ink200),
      ),
      child: Row(
        children: [
          const Icon(Icons.storefront_outlined, size: 20, color: AppColors.ink400),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Have something to sell?', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
                Text('Sell on SafalMarketHub with the same account.', style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
          TextButton(
            onPressed: () => showToast(context, 'Seller sign-up opens on the web'),
            child: const Text('Start'),
          ),
        ],
      ),
    );
  }
}
