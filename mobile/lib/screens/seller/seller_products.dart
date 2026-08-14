import 'package:flutter/material.dart';

import '../../data/offer_engine.dart';
import '../../data/seller_data.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common.dart';
import 'seller_assistant.dart';

/// The seller's catalogue.
///
/// Every row carries the two things a seller acts on — status and stock — and
/// an "Add offer" action, because discounting one product should not require
/// opening a campaign builder.
class SellerProductsScreen extends StatefulWidget {
  const SellerProductsScreen({super.key});

  @override
  State<SellerProductsScreen> createState() => _SellerProductsScreenState();
}

class _SellerProductsScreenState extends State<SellerProductsScreen> {
  String _filter = 'All';

  static const _filters = ['All', 'Live', 'Low stock', 'Needs changes'];

  List<SellerProduct> get _rows => sellerProducts.where((p) {
        switch (_filter) {
          case 'Live':
            return p.status == ListingStatus.live;
          case 'Low stock':
            return p.isLowStock || p.isOutOfStock;
          case 'Needs changes':
            return p.status == ListingStatus.changesRequired || p.status == ListingStatus.pendingReview;
          default:
            return true;
        }
      }).toList();

  @override
  Widget build(BuildContext context) {
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
                    itemCount: _filters.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 8),
                    itemBuilder: (context, i) {
                      final selected = _filter == _filters[i];
                      return ChoiceChip(
                        label: Text(_filters[i]),
                        selected: selected,
                        onSelected: (_) => setState(() => _filter = _filters[i]),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                tooltip: 'Add product',
                icon: const Icon(Icons.add),
                onPressed: () => _showAddProductSheet(context),
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
            itemCount: _rows.length,
            itemBuilder: (context, i) => _ProductRow(
              product: _rows[i],
              onAddOffer: () => showProductOfferSheet(context, _rows[i]),
            ),
          ),
        ),
      ],
    );
  }
}

class _ProductRow extends StatelessWidget {
  const _ProductRow({required this.product, required this.onAddOffer});

  final SellerProduct product;
  final VoidCallback onAddOffer;

  @override
  Widget build(BuildContext context) {
    final sale = sellerOffers
        .where((o) => statusOf(o) == OfferStatus.live && o.seller == sellerName)
        .where((o) =>
            o.scope == SellerOfferScope.all ||
            (o.scope == SellerOfferScope.products && o.productIds.contains(product.id)) ||
            (o.scope == SellerOfferScope.category && o.scopeValues.contains(product.category)))
        .toList();

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ProductScene(glyph: product.glyph, tone: product.tone, size: 56),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(product.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, height: 1.3)),
                    const SizedBox(height: 3),
                    Text('${product.sku} · ${money(product.price)}',
                        style: Theme.of(context).textTheme.bodySmall),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        StatusPill(label: listingStatusLabels[product.status]!),
                        const SizedBox(width: 8),
                        Text(
                          product.isOutOfStock
                              ? 'Out of stock'
                              : product.isLowStock
                                  ? '${product.available} left'
                                  : '${product.available} in stock',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: product.isLowStock || product.isOutOfStock ? FontWeight.w700 : FontWeight.w400,
                            color: product.isOutOfStock
                                ? AppColors.danger
                                : product.isLowStock
                                    ? AppColors.gold
                                    : AppColors.ink500,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),

          if (product.adminNote != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.goldSoft, borderRadius: BorderRadius.circular(Radii.sm)),
              child: Text(product.adminNote!,
                  style: const TextStyle(fontSize: 12, height: 1.4, color: AppColors.gold)),
            ),
          ],

          if (sale.isNotEmpty) ...[
            const SizedBox(height: 10),
            Align(alignment: Alignment.centerLeft, child: ReasonChip(text: sale.first.displayName)),
          ],

          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
                  onPressed: onAddOffer,
                  icon: const Icon(Icons.local_offer_outlined, size: 16),
                  label: const Text('Add offer'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
                  onPressed: () => showStockSheet(context, product),
                  icon: const Icon(Icons.inventory_2_outlined, size: 16),
                  label: const Text('Stock'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/* ------------------------------------------------------- add a product --- */

void _showAddProductSheet(BuildContext context) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => const _SheetShell(child: _AddProductChoices()),
  );
}

/// Four ways in, offered at the moment the seller asks — a first listing and
/// 500 rows in a spreadsheet want very different things.
class _AddProductChoices extends StatelessWidget {
  const _AddProductChoices();

  @override
  Widget build(BuildContext context) {
    final options = [
      (Icons.edit_outlined, 'Add manually', 'The full form, one product.'),
      (Icons.auto_awesome, 'Add with Safal Assistant', 'Describe it and review the draft.'),
      (Icons.photo_camera_outlined, 'Add from images', 'We suggest the category, you confirm.'),
      (Icons.table_chart_outlined, 'Upload a spreadsheet', 'Many products at once, checked first.'),
    ];

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('How would you like to add products?', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 14),
        for (final (icon, title, body) in options)
          InkWell(
            borderRadius: BorderRadius.circular(Radii.md),
            onTap: () {
              Navigator.of(context).pop();
              if (title.contains('Assistant')) {
                openSellerAssistant(context, seed: 'Add a product');
              } else {
                showToast(context, title, detail: 'Not wired up in this mockup');
              }
            },
            child: Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(Radii.md),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Icon(icon, size: 20, color: AppColors.brand),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                        Text(body, style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }
}

/* ------------------------------------------------ a discount on one item -- */

void showProductOfferSheet(BuildContext context, SellerProduct product) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _SheetShell(child: _ProductOfferForm(product: product)),
  );
}

/// One product, a percentage, and the margin before committing. Deliberately
/// not the campaign builder — a seller marking down one slow item shouldn't
/// have to name a campaign.
class _ProductOfferForm extends StatefulWidget {
  const _ProductOfferForm({required this.product});
  final SellerProduct product;

  @override
  State<_ProductOfferForm> createState() => _ProductOfferFormState();
}

class _ProductOfferFormState extends State<_ProductOfferForm> {
  double _percent = 10;
  int _days = 7;
  bool _done = false;

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final percent = _percent.round();
    final offerPrice = (product.price * (1 - percent / 100)).round();
    final margin = marginAt(product, offerPrice);
    final insight = priceInsightFor(product);

    final overMax = percent > sellerOfferPolicy.maxDiscountPercent;
    final needsApproval = percent > sellerOfferPolicy.approvalAbovePercent && !overMax;

    if (_done) {
      return Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: const BoxDecoration(color: AppColors.tealSoft, shape: BoxShape.circle),
            child: const Icon(Icons.check, color: AppColors.teal),
          ),
          const SizedBox(height: 12),
          Text(needsApproval ? 'Sent for approval' : 'Offer is live',
              style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 6),
          Text(
            needsApproval
                ? 'Nothing has changed on your listing yet — we review deeper discounts first.'
                : '${product.name} now shows ${money(offerPrice)}.',
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: FilledButton(onPressed: () => Navigator.of(context).pop(), child: const Text('Done')),
          ),
        ],
      );
    }

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Add an offer', style: Theme.of(context).textTheme.titleLarge),
        Text('${product.name} · currently ${money(product.price)}',
            style: Theme.of(context).textTheme.bodySmall),

        const SizedBox(height: 18),
        Row(
          children: [
            Text('$percent% off', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
            const Spacer(),
            Text('New price ${money(offerPrice)}',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.teal)),
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
            const Text('Runs for', style: TextStyle(fontSize: 13)),
            const SizedBox(width: 12),
            for (final d in [3, 7, 14])
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

        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(Radii.md),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            children: [
              if (insight != null) _Line('Marketplace average', money(insight.average)),
              _Line('SafalMarketHub fee ($commissionRate%)', '− ${money(margin.fee)}'),
              _Line('You keep per sale', money(margin.earnings), strong: true),
              _Line('Stock', '${product.available} available'),
            ],
          ),
        ),

        if (margin.isThin && !overMax) ...[
          const SizedBox(height: 10),
          _Banner(
            tone: AppColors.gold,
            icon: Icons.warning_amber_rounded,
            title: 'Thin margin',
            body: 'You keep about ${money(margin.earnings)} per sale after fees.',
          ),
        ],
        if (overMax) ...[
          const SizedBox(height: 10),
          _Banner(
            tone: AppColors.danger,
            icon: Icons.block,
            title: 'Above the ${sellerOfferPolicy.maxDiscountPercent}% platform maximum',
            body: 'Lower the discount to publish.',
          ),
        ],
        if (needsApproval) ...[
          const SizedBox(height: 10),
          _Banner(
            tone: AppColors.gold,
            icon: Icons.gavel_outlined,
            title: 'Needs approval',
            body: 'Above ${sellerOfferPolicy.approvalAbovePercent}% we review before it reaches customers.',
          ),
        ],

        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: overMax
                ? null
                : () {
                    setState(() => _done = true);
                    showToast(context, needsApproval ? 'Sent for approval' : 'Offer published',
                        detail: product.name);
                  },
            child: Text(needsApproval ? 'Submit for approval' : 'Publish $percent% off'),
          ),
        ),
        const SizedBox(height: 6),
        Text('This changes what customers pay. You can end it early at any time.',
            style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}

/* ------------------------------------------------------------ stock edit -- */

void showStockSheet(BuildContext context, SellerProduct product) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _SheetShell(child: _StockForm(product: product)),
  );
}

/// Stock changes stop at a preview. A mistyped number here is expensive.
class _StockForm extends StatefulWidget {
  const _StockForm({required this.product});
  final SellerProduct product;

  @override
  State<_StockForm> createState() => _StockFormState();
}

class _StockFormState extends State<_StockForm> {
  late int _value = widget.product.available;

  @override
  Widget build(BuildContext context) {
    final changed = _value != widget.product.available;

    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Update stock', style: Theme.of(context).textTheme.titleLarge),
        Text(widget.product.name, style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 20),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton.filledTonal(
              onPressed: () => setState(() => _value = (_value - 5).clamp(0, 9999)),
              icon: const Icon(Icons.remove),
            ),
            const SizedBox(width: 20),
            Text('$_value', style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w700)),
            const SizedBox(width: 20),
            IconButton.filledTonal(
              onPressed: () => setState(() => _value += 5),
              icon: const Icon(Icons.add),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (changed)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: AppColors.ink100, borderRadius: BorderRadius.circular(Radii.md)),
            child: Text(
              'Current ${widget.product.available} → New $_value',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
          ),
        const SizedBox(height: 16),
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: changed
                ? () {
                    Navigator.of(context).pop();
                    showToast(context, 'Stock updated', detail: '${widget.product.name} → $_value');
                  }
                : null,
            child: const Text('Confirm update'),
          ),
        ),
      ],
    );
  }
}

/* ----------------------------------------------------------------- bits -- */

class _SheetShell extends StatelessWidget {
  const _SheetShell({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(Radii.xl)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: SafeArea(
          top: false,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  width: 40,
                  height: 4,
                  decoration:
                      BoxDecoration(color: AppColors.ink200, borderRadius: BorderRadius.circular(Radii.pill)),
                ),
                child,
              ],
            ),
          ),
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
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontSize: 12.5, color: AppColors.ink500)),
          const Spacer(),
          Text(value,
              style: TextStyle(
                  fontSize: 12.5, fontWeight: strong ? FontWeight.w800 : FontWeight.w600)),
        ],
      ),
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner({required this.tone, required this.icon, required this.title, required this.body});
  final Color tone;
  final IconData icon;
  final String title;
  final String body;

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
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 17, color: tone),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: tone)),
                Text(body, style: const TextStyle(fontSize: 12, height: 1.4, color: AppColors.ink700)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
