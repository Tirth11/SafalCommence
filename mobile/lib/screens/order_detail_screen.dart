import 'package:flutter/material.dart';

import '../data/catalog.dart';
import '../data/commerce.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';

/// Order detail: the tracking timeline, then the money, then — once it has
/// arrived — the three feedback questions.
class OrderDetailScreen extends StatelessWidget {
  const OrderDetailScreen({super.key, required this.order});

  final CustomerOrder order;

  @override
  Widget build(BuildContext context) {
    final reached = order.stage.index;

    return Scaffold(
      appBar: AppBar(title: Text(order.id)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Row(
            children: [
              StatusPill(label: orderStageLabels[reached]),
              const SizedBox(width: 10),
              Text(order.estimate, style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
          const SizedBox(height: 20),

          // Vertical timeline — easier to scan on a phone than a bar.
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(Radii.lg),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                for (var i = 0; i < orderStageLabels.length; i++)
                  _TimelineRow(
                    label: orderStageLabels[i],
                    done: i < reached,
                    current: i == reached,
                    last: i == orderStageLabels.length - 1,
                  ),
                if (order.courier != null) ...[
                  const Divider(height: 26),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Courier', style: Theme.of(context).textTheme.bodySmall),
                            Text(order.courier!, style: const TextStyle(fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Tracking', style: Theme.of(context).textTheme.bodySmall),
                            Text(order.tracking ?? '—', style: const TextStyle(fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 20),
          Text('Items', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          for (final line in order.lines)
            Builder(
              builder: (context) {
                final product = productById(line.productId);
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Row(
                    children: [
                      ProductScene(glyph: product.glyph, tone: product.tone, size: 52),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              product.name,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600),
                            ),
                            Text('${line.variant} · Qty ${line.qty}', style: Theme.of(context).textTheme.bodySmall),
                          ],
                        ),
                      ),
                      Text(money(product.price * line.qty), style: const TextStyle(fontWeight: FontWeight.w700)),
                    ],
                  ),
                );
              },
            ),

          const Divider(height: 28),
          _Money(label: 'Subtotal', value: money(order.subtotal)),
          if (order.discount > 0) _Money(label: 'Discount', value: '− ${money(order.discount)}', good: true),
          _Money(label: 'Delivery', value: order.shipping == 0 ? 'Free' : money(order.shipping)),
          const SizedBox(height: 6),
          _Money(label: 'Total paid', value: money(order.total), bold: true),

          if (order.isDelivered) ...[
            const SizedBox(height: 24),
            const _Feedback(),
          ] else ...[
            const SizedBox(height: 24),
            OutlinedButton(
              onPressed: () => showToast(context, 'Cancellation opens support'),
              child: const Text('Need help with this order?'),
            ),
          ],
        ],
      ),
    );
  }
}

class _TimelineRow extends StatelessWidget {
  const _TimelineRow({required this.label, required this.done, required this.current, required this.last});

  final String label;
  final bool done;
  final bool current;
  final bool last;

  @override
  Widget build(BuildContext context) {
    final active = done || current;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 18,
                height: 18,
                decoration: BoxDecoration(
                  color: done
                      ? AppColors.teal
                      : current
                          ? AppColors.brand
                          : AppColors.surface,
                  shape: BoxShape.circle,
                  border: Border.all(color: active ? Colors.transparent : AppColors.ink200, width: 2),
                ),
                child: done ? const Icon(Icons.check, size: 12, color: Colors.white) : null,
              ),
              if (!last)
                Expanded(
                  child: Container(width: 2, color: done ? AppColors.teal.withOpacity(0.35) : AppColors.ink200),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Padding(
            padding: EdgeInsets.only(bottom: last ? 0 : 18, top: 1),
            child: Text(
              label,
              style: TextStyle(
                fontSize: 13.5,
                fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                color: active ? AppColors.ink900 : AppColors.ink400,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Money extends StatelessWidget {
  const _Money({required this.label, required this.value, this.good = false, this.bold = false});

  final String label;
  final String value;
  final bool good;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Text(label, style: TextStyle(fontSize: bold ? 15 : 13, color: bold ? AppColors.ink950 : AppColors.ink500)),
          const Spacer(),
          Text(
            value,
            style: TextStyle(
              fontSize: bold ? 17 : 13,
              fontWeight: FontWeight.w700,
              color: good ? AppColors.teal : AppColors.ink950,
            ),
          ),
        ],
      ),
    );
  }
}

/// Three separate questions, because product, seller and courier are three
/// different parties. A low product rating routes to help, not a thank-you.
class _Feedback extends StatefulWidget {
  const _Feedback();

  @override
  State<_Feedback> createState() => _FeedbackState();
}

class _FeedbackState extends State<_Feedback> {
  int _productStars = 0;
  int _sellerStars = 0;
  String? _deliveryRating;
  String? _issue;

  @override
  Widget build(BuildContext context) {
    return Container(
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
            children: [
              const Icon(Icons.inventory_2_outlined, size: 18, color: AppColors.teal),
              const SizedBox(width: 8),
              Text('How did it go?', style: Theme.of(context).textTheme.titleMedium),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Three quick questions — they go to different places.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 16),

          const Text('How was your product?', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
          _Stars(value: _productStars, onChanged: (v) => setState(() => _productStars = v)),
          if (_productStars > 0 && _productStars <= 3) ...[
            const SizedBox(height: 8),
            const Text("What wasn't right?", style: TextStyle(fontSize: 12.5, color: AppColors.ink700)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final issue in ['Quality', 'Damaged', 'Not as described', 'Wrong item'])
                  ChoiceChip(
                    label: Text(issue),
                    selected: _issue == issue,
                    onSelected: (_) => setState(() => _issue = issue),
                  ),
              ],
            ),
            if (_issue != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.ink100, borderRadius: BorderRadius.circular(Radii.md)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Sorry about that. Would you like help with this order?',
                      style: TextStyle(fontSize: 13),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        FilledButton(
                          style: FilledButton.styleFrom(minimumSize: const Size(0, 38)),
                          onPressed: () => showToast(context, 'Return request started'),
                          child: const Text('Request a return'),
                        ),
                        const SizedBox(width: 8),
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(minimumSize: const Size(0, 38)),
                          onPressed: () => showToast(context, 'Opening support'),
                          child: const Text('Contact support'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
          if (_productStars >= 4)
            Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text('Glad you liked it.', style: Theme.of(context).textTheme.bodySmall),
            ),

          const SizedBox(height: 18),
          const Text('How was the seller?', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
          _Stars(value: _sellerStars, onChanged: (v) => setState(() => _sellerStars = v)),

          const SizedBox(height: 18),
          const Text('How was your delivery?', style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Row(
            children: [
              for (final option in ['Good', 'Poor'])
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(option),
                    selected: _deliveryRating == option,
                    onSelected: (_) => setState(() => _deliveryRating = option),
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Stars extends StatelessWidget {
  const _Stars({required this.value, required this.onChanged});

  final int value;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var star = 1; star <= 5; star++)
          IconButton(
            visualDensity: VisualDensity.compact,
            padding: const EdgeInsets.symmetric(horizontal: 2),
            constraints: const BoxConstraints(),
            tooltip: '$star star${star == 1 ? '' : 's'}',
            onPressed: () => onChanged(star),
            icon: Icon(
              star <= value ? Icons.star_rounded : Icons.star_outline_rounded,
              size: 28,
              color: star <= value ? const Color(0xFFE0A82E) : AppColors.ink200,
            ),
          ),
      ],
    );
  }
}
