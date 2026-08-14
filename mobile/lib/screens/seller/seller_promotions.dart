import 'package:flutter/material.dart';

import '../../data/catalog.dart';
import '../../data/offer_engine.dart';
import '../../data/seller_data.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common.dart';

/// Promotions the seller is running.
///
/// Two separate things, because conflating them made both worse on the web: a
/// campaign is a named, dated promotion across a slice of the catalogue; a
/// product offer is one listing marked down from its row.
class SellerPromotionsScreen extends StatefulWidget {
  const SellerPromotionsScreen({super.key});

  @override
  State<SellerPromotionsScreen> createState() => _SellerPromotionsScreenState();
}

class _SellerPromotionsScreenState extends State<SellerPromotionsScreen> {
  String _tab = 'Campaigns';
  static const _tabs = ['Campaigns', 'Product offers', 'Scheduled'];

  List<SellerOffer> get _rows {
    final mine = sellerOffers.where((o) => o.seller == sellerName);
    switch (_tab) {
      case 'Product offers':
        return mine.where((o) => !o.isCampaign && statusOf(o) == OfferStatus.live).toList();
      case 'Scheduled':
        return mine.where((o) => statusOf(o) == OfferStatus.scheduled).toList();
      default:
        return mine.where((o) => o.isCampaign && statusOf(o) == OfferStatus.live).toList();
    }
  }

  @override
  Widget build(BuildContext context) {
    final rows = _rows;

    return Column(
      children: [
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
          child: Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 34,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _tabs.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, i) => ChoiceChip(
                      label: Text(_tabs[i]),
                      selected: _tab == _tabs[i],
                      onSelected: (_) => setState(() => _tab = _tabs[i]),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                tooltip: 'Create campaign',
                icon: const Icon(Icons.add),
                onPressed: () => showCampaignSheet(context),
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: rows.isEmpty
              ? EmptyState(
                  icon: Icons.local_offer_outlined,
                  title: 'Nothing here',
                  body: _tab == 'Product offers'
                      ? 'Add an offer from any product row to discount a single listing.'
                      : 'Campaigns are named, dated promotions across your catalogue.',
                  action: _tab == 'Product offers'
                      ? null
                      : FilledButton(
                          onPressed: () => showCampaignSheet(context),
                          child: const Text('Create a campaign'),
                        ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
                  itemCount: rows.length,
                  itemBuilder: (context, i) => _OfferCard(offer: rows[i]),
                ),
        ),
      ],
    );
  }
}

class _OfferCard extends StatelessWidget {
  const _OfferCard({required this.offer});
  final SellerOffer offer;

  @override
  Widget build(BuildContext context) {
    final covered = products.where((p) => sellerOfferCovers(offer, p)).length;
    final live = statusOf(offer) == OfferStatus.live;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                decoration: BoxDecoration(
                  color: offer.isCampaign ? AppColors.brandSoft : AppColors.ink100,
                  borderRadius: BorderRadius.circular(Radii.pill),
                ),
                child: Text(
                  offer.isCampaign ? 'CAMPAIGN' : 'PRODUCT OFFER',
                  style: TextStyle(
                    fontSize: 9.5,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                    color: offer.isCampaign ? AppColors.brand : AppColors.ink600,
                  ),
                ),
              ),
              const Spacer(),
              StatusPill(label: live ? 'Live' : 'Scheduled'),
            ],
          ),
          const SizedBox(height: 10),
          Text(offer.name ?? offer.displayName,
              style: const TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700)),
          const SizedBox(height: 3),
          Text(
            '${offer.percent}% off · ${sellerScopeLabels[offer.scope]!.toLowerCase()} · $covered products',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 10),
          if (live)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(minimumSize: const Size(0, 36)),
                    onPressed: () => showToast(context, 'Promotion paused', detail: offer.displayName),
                    child: const Text('Pause'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                        minimumSize: const Size(0, 36), foregroundColor: AppColors.danger),
                    onPressed: () => _confirmEnd(context, offer),
                    child: const Text('End offer'),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

void _confirmEnd(BuildContext context, SellerOffer offer) {
  showDialog<void>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text('End ${offer.name ?? offer.displayName}?',
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
      content: const Text('Regular prices return immediately and the storefront banner disappears.',
          style: TextStyle(fontSize: 13.5, height: 1.45)),
      actions: [
        TextButton(onPressed: () => Navigator.of(dialogContext).pop(), child: const Text('Keep running')),
        FilledButton(
          style: FilledButton.styleFrom(backgroundColor: AppColors.danger),
          onPressed: () {
            Navigator.of(dialogContext).pop();
            showToast(context, 'Promotion ended', detail: 'Regular prices are live again.');
          },
          child: const Text('End offer'),
        ),
      ],
    ),
  );
}

/* --------------------------------------------------------- campaign form */

void showCampaignSheet(BuildContext context) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => const _CampaignSheet(),
  );
}

/// A campaign describes a rule, not a product list. A seller with thousands
/// of listings should never tick boxes to say "everything".
class _CampaignSheet extends StatefulWidget {
  const _CampaignSheet();

  @override
  State<_CampaignSheet> createState() => _CampaignSheetState();
}

class _CampaignSheetState extends State<_CampaignSheet> {
  final _nameController = TextEditingController(text: 'Independence Day Sale');
  SellerOfferScope _scope = SellerOfferScope.all;
  final _scopeValues = <String>[];
  final _excluded = <String>[];
  double _percent = 10;
  int _days = 3;
  bool _published = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  /// What the rule actually catches, from the live catalogue.
  List<Product> get _affected {
    final probe = SellerOffer(
      id: 'draft',
      seller: sellerName,
      displayName: 'draft',
      percent: _percent.round(),
      scope: _scope,
      scopeValues: _scopeValues,
      productIds: const [],
      exclusions: OfferExclusions(categories: _excluded),
      startsAt: DateTime(2000),
      endsAt: DateTime(2099),
    );
    return products.where((p) => sellerOfferCovers(probe, p)).toList();
  }

  @override
  Widget build(BuildContext context) {
    final percent = _percent.round();
    final affected = _affected;
    final overMax = percent > sellerOfferPolicy.maxDiscountPercent;
    final needsApproval = percent > sellerOfferPolicy.approvalAbovePercent && !overMax;
    final blocked = overMax || affected.isEmpty;

    final avgPrice = affected.isEmpty
        ? 0
        : (affected.fold(0, (sum, p) => sum + p.price) / affected.length).round();
    final avgDiscount = (avgPrice * percent / 100).round();

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        constraints: BoxConstraints(maxHeight: MediaQuery.of(context).size.height * 0.9),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(Radii.xl)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
        child: SafeArea(
          top: false,
          child: _published
              ? _Published(count: affected.length, pending: needsApproval)
              : SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 14),
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(
                              color: AppColors.ink200, borderRadius: BorderRadius.circular(Radii.pill)),
                        ),
                      ),
                      Text('Create campaign', style: Theme.of(context).textTheme.titleLarge),
                      Text('Customers see the name on every discounted product.',
                          style: Theme.of(context).textTheme.bodySmall),

                      const SizedBox(height: 16),
                      TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(labelText: 'Campaign name'),
                        onChanged: (_) => setState(() {}),
                      ),

                      const SizedBox(height: 18),
                      Row(
                        children: [
                          Text('$percent% off',
                              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
                          const Spacer(),
                          Text('$_days days', style: Theme.of(context).textTheme.bodySmall),
                        ],
                      ),
                      Slider(
                        value: _percent,
                        min: 5,
                        max: 50,
                        divisions: 9,
                        label: '$percent%',
                        onChanged: (v) => setState(() => _percent = v),
                      ),
                      Row(
                        children: [
                          for (final d in [1, 3, 7])
                            Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                label: Text('$d days'),
                                selected: _days == d,
                                onSelected: (_) => setState(() => _days = d),
                              ),
                            ),
                        ],
                      ),

                      const SizedBox(height: 18),
                      Text('Applies to', style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      for (final option in [SellerOfferScope.all, SellerOfferScope.category, SellerOfferScope.brand])
                        RadioListTileLike(
                          label: sellerScopeLabels[option]!,
                          selected: _scope == option,
                          onTap: () => setState(() {
                            _scope = option;
                            _scopeValues.clear();
                          }),
                        ),

                      if (_scope != SellerOfferScope.all) ...[
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            for (final value in _scope == SellerOfferScope.category
                                ? categories.map((c) => c.label)
                                : products.map((p) => p.brand).toSet())
                              FilterChip(
                                label: Text(value),
                                selected: _scopeValues.contains(value),
                                onSelected: (_) => setState(() {
                                  _scopeValues.contains(value)
                                      ? _scopeValues.remove(value)
                                      : _scopeValues.add(value);
                                }),
                              ),
                          ],
                        ),
                      ],

                      const SizedBox(height: 18),
                      Text('Exclusions', style: Theme.of(context).textTheme.titleMedium),
                      Text('Optional — anything here stays at its normal price.',
                          style: Theme.of(context).textTheme.bodySmall),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final c in categories)
                            FilterChip(
                              label: Text(c.label),
                              selected: _excluded.contains(c.label),
                              onSelected: (_) => setState(() {
                                _excluded.contains(c.label)
                                    ? _excluded.remove(c.label)
                                    : _excluded.add(c.label);
                              }),
                            ),
                        ],
                      ),

                      const SizedBox(height: 18),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.ink100,
                          borderRadius: BorderRadius.circular(Radii.md),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('WHAT THIS AFFECTS',
                                style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                    letterSpacing: 0.6,
                                    color: AppColors.ink400)),
                            const SizedBox(height: 8),
                            _Line('Products affected', '${affected.length}', strong: true),
                            _Line('Average selling price', money(avgPrice)),
                            _Line('Average discount each', money(avgDiscount)),
                            const SizedBox(height: 6),
                            const Text(
                              'Products you add while this runs are included automatically.',
                              style: TextStyle(fontSize: 11, height: 1.4, color: AppColors.ink500),
                            ),
                          ],
                        ),
                      ),

                      if (overMax) ...[
                        const SizedBox(height: 12),
                        _Note(
                          tone: AppColors.danger,
                          text:
                              'Above the ${sellerOfferPolicy.maxDiscountPercent}% platform maximum. Lower the discount to publish.',
                        ),
                      ],
                      if (needsApproval) ...[
                        const SizedBox(height: 12),
                        _Note(
                          tone: AppColors.gold,
                          text:
                              'Above ${sellerOfferPolicy.approvalAbovePercent}%, so SafalMarketHub reviews this before it goes live.',
                        ),
                      ],
                      if (affected.isEmpty) ...[
                        const SizedBox(height: 12),
                        const _Note(
                          tone: AppColors.danger,
                          text: 'Nothing matches this rule yet. Pick a scope, or loosen the exclusions.',
                        ),
                      ],

                      const SizedBox(height: 18),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: blocked
                              ? null
                              : () {
                                  setState(() => _published = true);
                                  showToast(
                                    context,
                                    needsApproval ? 'Sent for approval' : 'Campaign published',
                                    detail: _nameController.text,
                                  );
                                },
                          child: Text(needsApproval
                              ? 'Submit for approval'
                              : 'Publish to ${affected.length} products'),
                        ),
                      ),
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}

class RadioListTileLike extends StatelessWidget {
  const RadioListTileLike({super.key, required this.label, required this.selected, required this.onTap});

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(Radii.md),
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: selected ? AppColors.brandSoft.withValues(alpha: 0.5) : null,
          borderRadius: BorderRadius.circular(Radii.md),
          border: Border.all(color: selected ? AppColors.brand : AppColors.border),
        ),
        child: Row(
          children: [
            Icon(selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                size: 18, color: selected ? AppColors.brand : AppColors.ink400),
            const SizedBox(width: 10),
            Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

class _Line extends StatelessWidget {
  const _Line(this.label, this.value, {this.strong = false});
  final String label;
  final String value;
  final bool strong;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontSize: 12.5, color: AppColors.ink500)),
          const Spacer(),
          Text(value,
              style: TextStyle(fontSize: 12.5, fontWeight: strong ? FontWeight.w800 : FontWeight.w600)),
        ],
      ),
    );
  }
}

class _Note extends StatelessWidget {
  const _Note({required this.tone, required this.text});
  final Color tone;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: tone.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(Radii.md),
        border: Border.all(color: tone.withValues(alpha: 0.3)),
      ),
      child: Text(text, style: TextStyle(fontSize: 12.5, height: 1.4, color: tone)),
    );
  }
}

class _Published extends StatelessWidget {
  const _Published({required this.count, required this.pending});
  final int count;
  final bool pending;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(height: 12),
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: pending ? AppColors.goldSoft : AppColors.tealSoft,
            shape: BoxShape.circle,
          ),
          child: Icon(pending ? Icons.gavel_outlined : Icons.check,
              color: pending ? AppColors.gold : AppColors.teal),
        ),
        const SizedBox(height: 14),
        Text(pending ? 'Sent for approval' : 'Campaign is live',
            style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 6),
        Text(
          pending
              ? 'Nothing has changed on your listings yet.'
              : '$count products now show the sale price, and your storefront banner is live.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 20),
        SizedBox(
          width: double.infinity,
          child: FilledButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Done')),
        ),
      ],
    );
  }
}
