import 'package:flutter/material.dart';

import '../../data/seller_data.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common.dart';

/// Money in, and what was taken out of it.
///
/// The breakdown is the point: "you're getting $1,011" means nothing without
/// the refunds, commission and deductions that produced it.
class SellerPaymentsScreen extends StatelessWidget {
  const SellerPaymentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final next = settlements.firstWhere((s) => !s.settled);

    return ListView(
      padding: const EdgeInsets.only(bottom: 96),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 0),
          child: Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(Radii.lg),
              gradient: const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF543BCB), Color(0xFF7A63E0)],
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('NEXT SETTLEMENT',
                    style: TextStyle(
                        fontSize: 10.5, fontWeight: FontWeight.w800, letterSpacing: 0.8, color: Color(0xFFDCD5FA))),
                const SizedBox(height: 8),
                Text(money(next.net),
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: Colors.white, height: 1)),
                const SizedBox(height: 6),
                Text('${next.period} · expected ${next.expected}',
                    style: const TextStyle(fontSize: 13, color: Color(0xFFDCD5FA))),
              ],
            ),
          ),
        ),

        const SectionHeader(title: 'How it adds up', subtitle: 'For the current period.'),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(Radii.lg),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                _Row('Gross sales', money(next.gross)),
                _Row('Refunds', '− ${money(next.refunds)}'),
                _Row('SafalMarketHub commission ($commissionRate%)', '− ${money(next.commission)}'),
                _Row('Other deductions', '− ${money(next.deductions)}'),
                const Divider(height: 22),
                _Row('Net payout', money(next.net), strong: true),
              ],
            ),
          ),
        ),

        const SectionHeader(title: 'Past settlements'),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            children: [
              for (final s in settlements)
                Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(Radii.md),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s.period, style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600)),
                            Text('${s.id} · ${s.settled ? 'Settled' : 'Expected ${s.expected}'}',
                                style: Theme.of(context).textTheme.bodySmall),
                          ],
                        ),
                      ),
                      Text(money(s.net), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                      const SizedBox(width: 10),
                      StatusPill(label: s.settled ? 'Delivered' : 'Shipped'),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Row extends StatelessWidget {
  const _Row(this.label, this.value, {this.strong = false});
  final String label;
  final String value;
  final bool strong;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Expanded(
            child: Text(label,
                style: TextStyle(fontSize: strong ? 14.5 : 13, color: strong ? AppColors.ink950 : AppColors.ink500)),
          ),
          Text(value,
              style: TextStyle(
                  fontSize: strong ? 18 : 13, fontWeight: strong ? FontWeight.w800 : FontWeight.w600)),
        ],
      ),
    );
  }
}
