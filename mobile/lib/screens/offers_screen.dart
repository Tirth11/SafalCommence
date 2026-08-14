import 'package:flutter/material.dart';

import '../data/commerce.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import 'listing_screen.dart';

/// My Offers — the wallet. Four tabs, and the difference between them is what
/// the shopper can do right now: use it, keep it, wait for it, or it's spent.
class OffersScreen extends StatelessWidget {
  const OffersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    const usedIds = {'OF-203'};

    final available =
        todayOffers.where((o) => !usedIds.contains(o.id)).toList();
    final saved = todayOffers
        .where(
            (o) => state.savedOffers.contains(o.id) && !usedIds.contains(o.id))
        .toList();
    final used = todayOffers.where((o) => usedIds.contains(o.id)).toList();

    return DefaultTabController(
      length: 4,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('My offers'),
          bottom: const TabBar(
            isScrollable: true,
            tabAlignment: TabAlignment.start,
            labelColor: AppColors.brand,
            unselectedLabelColor: AppColors.ink500,
            indicatorColor: AppColors.brand,
            tabs: [
              Tab(text: 'Available'),
              Tab(text: 'Saved'),
              Tab(text: 'Upcoming'),
              Tab(text: 'Used'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _OfferList(
                offers: available,
                empty: 'No offers are running for your account right now.'),
            _OfferList(
                offers: saved,
                empty:
                    'Nothing saved yet. Tap the bookmark on an offer to keep it here.'),
            const _UpcomingList(),
            _OfferList(
                offers: used,
                spent: true,
                empty: "You haven't used an offer yet."),
          ],
        ),
      ),
    );
  }
}

class _OfferList extends StatelessWidget {
  const _OfferList(
      {required this.offers, required this.empty, this.spent = false});

  final List<Offer> offers;
  final String empty;
  final bool spent;

  @override
  Widget build(BuildContext context) {
    if (offers.isEmpty) {
      return EmptyState(
          icon: Icons.local_offer_outlined, title: 'Nothing here', body: empty);
    }

    final state = AppScope.of(context);

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: offers.length,
      itemBuilder: (context, index) {
        final offer = offers[index];
        final isSaved = state.savedOffers.contains(offer.id);

        return Opacity(
          opacity: spent ? 0.6 : 1,
          child: Container(
            margin: const EdgeInsets.only(bottom: 12),
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
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            offer.headline,
                            style: const TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.w700,
                                letterSpacing: -0.4),
                          ),
                          const SizedBox(height: 4),
                          Text(offer.detail,
                              style: const TextStyle(
                                  fontSize: 13.5, color: AppColors.ink700)),
                        ],
                      ),
                    ),
                    if (!spent)
                      IconButton(
                        tooltip:
                            isSaved ? 'Remove from saved' : 'Save for later',
                        icon: Icon(
                          isSaved ? Icons.bookmark : Icons.bookmark_border,
                          size: 20,
                          color: isSaved ? AppColors.brand : AppColors.ink400,
                        ),
                        onPressed: () {
                          state.toggleSavedOffer(offer.id);
                          showToast(
                              context,
                              isSaved
                                  ? 'Removed from saved'
                                  : 'Saved for later');
                        },
                      ),
                  ],
                ),
                const Divider(height: 22),
                if (offer.minOrder > 0)
                  _Detail(label: 'Minimum order', value: money(offer.minOrder)),
                if (offer.maxDiscount != null)
                  _Detail(
                      label: 'Maximum discount',
                      value: money(offer.maxDiscount!)),
                _Detail(
                    label: 'Valid', value: spent ? 'Used' : offer.endsLabel),
                const SizedBox(height: 12),
                Row(
                  children: [
                    if (offer.code != null)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.ink100,
                          borderRadius: BorderRadius.circular(Radii.sm),
                          border: Border.all(color: AppColors.ink200),
                        ),
                        child: Text(
                          offer.code!,
                          style: const TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.5),
                        ),
                      ),
                    const Spacer(),
                    if (!spent)
                      FilledButton(
                        style: FilledButton.styleFrom(
                            minimumSize: const Size(0, 38)),
                        onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) =>
                                  ListingScreen(category: offer.category)),
                        ),
                        child: const Text('Shop offer'),
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _UpcomingList extends StatelessWidget {
  const _UpcomingList();

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: upcomingOffers.length,
      itemBuilder: (context, index) {
        final offer = upcomingOffers[index];
        final on = state.reminders.contains(offer.id);

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(Radii.lg),
            border: Border.all(color: AppColors.ink200),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                offer.starts.toUpperCase(),
                style: const TextStyle(
                  fontSize: 10.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.8,
                  color: AppColors.brand,
                ),
              ),
              const SizedBox(height: 6),
              Text(offer.title,
                  style: const TextStyle(
                      fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 2),
              Text(offer.detail, style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                style: OutlinedButton.styleFrom(minimumSize: const Size(0, 40)),
                onPressed: () {
                  state.toggleReminder(offer.id);
                  showToast(
                      context, on ? 'Reminder removed' : "We'll remind you",
                      detail: on ? null : offer.title);
                },
                icon:
                    Icon(on ? Icons.check : Icons.notifications_none, size: 17),
                label: Text(on ? 'Reminder set' : 'Remind me'),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _Detail extends StatelessWidget {
  const _Detail({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(label,
              style: const TextStyle(fontSize: 12.5, color: AppColors.ink500)),
          const Spacer(),
          Text(value,
              style:
                  const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
