import 'package:flutter/material.dart';

import '../data/commerce.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import 'checkout_screen.dart';

/// Cart. The offer line is the interesting part: it only appears when the
/// order genuinely qualifies, and it says how much it saves.
class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final lines = state.lines;
    final subtotal = state.subtotal;
    final offer = bestOfferFor(subtotal);
    final discount = offer == null ? 0 : offerDiscount(offer, subtotal);
    final shipping = subtotal - discount >= 99 || subtotal == 0 ? 0 : 5;
    final total = subtotal - discount + shipping;

    return Scaffold(
      appBar: AppBar(title: const Text('Your cart')),
      body: lines.isEmpty
          ? EmptyState(
              icon: Icons.shopping_bag_outlined,
              title: 'Your cart is empty',
              body: 'Products you add will show up here.',
              action: FilledButton(
                onPressed: () => Navigator.of(context).maybePop(),
                child: const Text('Start shopping'),
              ),
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
              children: [
                for (final line in lines) _CartRow(line: line),
                const SizedBox(height: 8),
                if (offer != null)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.tealSoft,
                      borderRadius: BorderRadius.circular(Radii.md),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.check_circle_outline,
                            size: 18, color: AppColors.teal),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Best offer applied — ${offer.code ?? offer.headline} saves ${money(discount)}',
                            style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.teal),
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 20),
                Text('Price details',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 10),
                _SummaryRow(label: 'Subtotal', value: money(subtotal)),
                if (discount > 0)
                  _SummaryRow(
                      label: 'Offer discount',
                      value: '− ${money(discount)}',
                      good: true),
                _SummaryRow(
                    label: 'Delivery',
                    value: shipping == 0 ? 'Free' : money(shipping)),
                const Divider(height: 24),
                _SummaryRow(label: 'Total', value: money(total), bold: true),
              ],
            ),
      bottomNavigationBar: lines.isEmpty
          ? null
          : SafeArea(
              child: Container(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                decoration: const BoxDecoration(
                  color: AppColors.surface,
                  border: Border(top: BorderSide(color: AppColors.border)),
                ),
                child: Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(money(total),
                            style: const TextStyle(
                                fontSize: 19, fontWeight: FontWeight.w700)),
                        Text('${state.cartCount} items',
                            style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: FilledButton(
                        onPressed: () => Navigator.of(context).push(
                          MaterialPageRoute(
                              builder: (_) => CheckoutScreen(
                                  total: total,
                                  discount: discount,
                                  shipping: shipping)),
                        ),
                        child: const Text('Checkout'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}

class _CartRow extends StatelessWidget {
  const _CartRow({required this.line});
  final CartLine line;

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final product = line.product;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ProductScene(glyph: product.glyph, tone: product.tone, size: 72),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 13.5, fontWeight: FontWeight.w600, height: 1.3),
                ),
                const SizedBox(height: 2),
                Text('${line.variant} · ${product.seller}',
                    style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _QtyStepper(
                      qty: line.qty,
                      onChanged: (value) => state.setQty(line.key, value),
                    ),
                    const Spacer(),
                    Text(money(line.lineTotal),
                        style: const TextStyle(
                            fontSize: 14.5, fontWeight: FontWeight.w700)),
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            tooltip: 'Remove',
            icon: const Icon(Icons.close, size: 17, color: AppColors.ink400),
            onPressed: () {
              state.removeLine(line.key);
              showToast(context, 'Removed from cart', detail: product.name);
            },
          ),
        ],
      ),
    );
  }
}

class _QtyStepper extends StatelessWidget {
  const _QtyStepper({required this.qty, required this.onChanged});

  final int qty;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(Radii.pill),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _StepButton(icon: Icons.remove, onTap: () => onChanged(qty - 1)),
          SizedBox(
            width: 28,
            child: Text('$qty',
                textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.w700)),
          ),
          _StepButton(icon: Icons.add, onTap: () => onChanged(qty + 1)),
        ],
      ),
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({required this.icon, required this.onTap});
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      customBorder: const CircleBorder(),
      onTap: onTap,
      child: Padding(
          padding: const EdgeInsets.all(6), child: Icon(icon, size: 15)),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow(
      {required this.label,
      required this.value,
      this.good = false,
      this.bold = false});

  final String label;
  final String value;
  final bool good;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: bold ? 15 : 13.5,
              fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
              color: bold ? AppColors.ink950 : AppColors.ink700,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
              fontSize: bold ? 17 : 13.5,
              fontWeight: FontWeight.w700,
              color: good ? AppColors.teal : AppColors.ink950,
            ),
          ),
        ],
      ),
    );
  }
}
