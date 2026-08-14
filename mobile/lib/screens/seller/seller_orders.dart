import 'package:flutter/material.dart';

import '../../data/seller_data.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common.dart';

/// Orders, filtered by what the seller has to do about them.
///
/// Status changes are confirmed rather than applied on tap — marking an order
/// packed by accident is a real customer-facing mistake.
class SellerOrdersScreen extends StatefulWidget {
  const SellerOrdersScreen({super.key});

  @override
  State<SellerOrdersScreen> createState() => _SellerOrdersScreenState();
}

class _SellerOrdersScreenState extends State<SellerOrdersScreen> {
  String _filter = 'Needs action';

  static const _filters = ['Needs action', 'All', 'Shipped', 'Delivered', 'Returned'];

  List<SellerOrder> get _rows => sellerOrders.where((o) {
        switch (_filter) {
          case 'Needs action':
            return o.needsAction;
          case 'Shipped':
            return o.status == SellerOrderStatus.shipped || o.status == SellerOrderStatus.packed;
          case 'Delivered':
            return o.status == SellerOrderStatus.delivered;
          case 'Returned':
            return o.status == SellerOrderStatus.returned;
          default:
            return true;
        }
      }).toList();

  @override
  Widget build(BuildContext context) {
    final rows = _rows;

    return Column(
      children: [
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
          child: SizedBox(
            height: 34,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _filters.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) => ChoiceChip(
                label: Text(_filters[i]),
                selected: _filter == _filters[i],
                onSelected: (_) => setState(() => _filter = _filters[i]),
              ),
            ),
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: rows.isEmpty
              ? const EmptyState(
                  icon: Icons.inbox_outlined,
                  title: 'Nothing here',
                  body: 'No orders match this filter right now.',
                )
              : ListView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 96),
                  itemCount: rows.length,
                  itemBuilder: (context, i) => _OrderCard(order: rows[i]),
                ),
        ),
      ],
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});
  final SellerOrder order;

  @override
  Widget build(BuildContext context) {
    final product = order.product;

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
              ProductScene(glyph: product.glyph, tone: product.tone, size: 52),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        StatusPill(label: sellerOrderLabels[order.status]!),
                        const SizedBox(width: 8),
                        Text(order.id, style: const TextStyle(fontSize: 11.5, color: AppColors.ink500)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(product.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
                    Text('${order.customer} · ${order.placedOn} · Qty ${order.qty}',
                        style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              Text(money(order.value), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
            ],
          ),
          if (order.needsAction) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: FilledButton(
                    style: FilledButton.styleFrom(minimumSize: const Size(0, 38)),
                    onPressed: () => _confirm(
                      context,
                      title: 'Mark ${order.id} as packed?',
                      body: 'The customer is told their order is being prepared for dispatch.',
                      confirmLabel: 'Mark packed',
                      onConfirm: () => showToast(context, 'Order marked packed', detail: order.id),
                    ),
                    child: const Text('Mark packed'),
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
                  onPressed: () => _confirm(
                    context,
                    title: 'Cancel ${order.id}?',
                    body: 'The customer is refunded in full and the stock is returned.',
                    confirmLabel: 'Cancel order',
                    destructive: true,
                    onConfirm: () => showToast(context, 'Order cancelled', detail: order.id),
                  ),
                  child: const Text('Cancel'),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

/// Anything that reaches a customer gets a confirm step.
void _confirm(
  BuildContext context, {
  required String title,
  required String body,
  required String confirmLabel,
  required VoidCallback onConfirm,
  bool destructive = false,
}) {
  showDialog<void>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      title: Text(title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w700)),
      content: Text(body, style: const TextStyle(fontSize: 13.5, height: 1.45)),
      actions: [
        TextButton(onPressed: () => Navigator.of(dialogContext).pop(), child: const Text('Not now')),
        FilledButton(
          style: destructive ? FilledButton.styleFrom(backgroundColor: AppColors.danger) : null,
          onPressed: () {
            Navigator.of(dialogContext).pop();
            onConfirm();
          },
          child: Text(confirmLabel),
        ),
      ],
    ),
  );
}
