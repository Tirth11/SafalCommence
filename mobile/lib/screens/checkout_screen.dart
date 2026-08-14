import 'package:flutter/material.dart';

import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';

/// Four stages, one screen: address → delivery → review → payment.
///
/// The rule carried over from the web build is the important one — nothing is
/// charged until the shopper sees what they are buying, where it is going and
/// which method pays for it, and presses the button themselves.
class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key, required this.total, required this.discount, required this.shipping});

  final int total;
  final int discount;
  final int shipping;

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int _step = 0;
  int _address = 0;
  int _delivery = 0;
  int _payment = 0;
  bool _placed = false;

  static const _stages = ['Address', 'Delivery', 'Review', 'Payment'];

  static const _addresses = [
    ('Home', '1204 Market Street, Apt 5B, San Francisco, CA 94114'),
    ('Office', '88 Mission Street, Floor 12, San Francisco, CA 94105'),
  ];

  static const _deliveryOptions = [
    ('Standard', '3–5 business days', 5),
    ('Express', '1–2 business days', 15),
  ];

  static const _payments = [
    ('Visa •••• 4242', Icons.credit_card),
    ('Pay on delivery', Icons.payments_outlined),
  ];

  int get _deliveryFee => _deliveryOptions[_delivery].$3;
  int get _payable => widget.total - widget.shipping + _deliveryFee;

  @override
  Widget build(BuildContext context) {
    if (_placed) return _OrderPlaced(total: _payable);

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: Column(
        children: [
          _Stepper(stages: _stages, current: _step),
          const Divider(height: 1),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                if (_step == 0) ..._addressStep(),
                if (_step == 1) ..._deliveryStep(),
                if (_step == 2) ..._reviewStep(),
                if (_step == 3) ..._paymentStep(),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          decoration: const BoxDecoration(
            color: AppColors.surface,
            border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: Row(
            children: [
              if (_step > 0)
                OutlinedButton(
                  onPressed: () => setState(() => _step -= 1),
                  child: const Text('Back'),
                ),
              if (_step > 0) const SizedBox(width: 12),
              Expanded(
                child: FilledButton(
                  onPressed: () {
                    if (_step < 3) {
                      setState(() => _step += 1);
                    } else {
                      _confirmAndPay();
                    }
                  },
                  child: Text(_step < 3 ? 'Continue' : 'Pay ${money(_payable)}'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _addressStep() => [
        Text('Where should it go?', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        for (var i = 0; i < _addresses.length; i++)
          _SelectCard(
            selected: _address == i,
            onTap: () => setState(() => _address = i),
            title: _addresses[i].$1,
            subtitle: _addresses[i].$2,
          ),
        const SizedBox(height: 8),
        OutlinedButton.icon(
          onPressed: () => showToast(context, 'Add address', detail: 'Not wired up in this mockup'),
          icon: const Icon(Icons.add, size: 17),
          label: const Text('Add a new address'),
        ),
      ];

  List<Widget> _deliveryStep() => [
        Text('How fast do you need it?', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        for (var i = 0; i < _deliveryOptions.length; i++)
          _SelectCard(
            selected: _delivery == i,
            onTap: () => setState(() => _delivery = i),
            title: _deliveryOptions[i].$1,
            subtitle: _deliveryOptions[i].$2,
            trailing: money(_deliveryOptions[i].$3),
          ),
      ];

  List<Widget> _reviewStep() {
    final state = AppScope.of(context);
    return [
      Text('Check the details', style: Theme.of(context).textTheme.titleLarge),
      const SizedBox(height: 12),
      for (final line in state.lines)
        Padding(
          padding: const EdgeInsets.only(bottom: 4),
          child: Row(
            children: [
              ProductScene(glyph: line.product.glyph, tone: line.product.tone, size: 44),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      line.product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    Text('${line.variant} · Qty ${line.qty}', style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              Text(money(line.lineTotal), style: const TextStyle(fontWeight: FontWeight.w700)),
            ],
          ),
        ),
      const Divider(height: 28),
      _Line(label: 'Deliver to', value: _addresses[_address].$1),
      _Line(label: 'Delivery', value: '${_deliveryOptions[_delivery].$1} · ${_deliveryOptions[_delivery].$2}'),
      if (widget.discount > 0) _Line(label: 'Offer discount', value: '− ${money(widget.discount)}', good: true),
      _Line(label: 'Delivery charge', value: money(_deliveryFee)),
      const Divider(height: 28),
      Row(
        children: [
          const Text('Total payable', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          const Spacer(),
          Text(money(_payable), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
        ],
      ),
    ];
  }

  List<Widget> _paymentStep() => [
        Text('How would you like to pay?', style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 12),
        for (var i = 0; i < _payments.length; i++)
          _SelectCard(
            selected: _payment == i,
            onTap: () => setState(() => _payment = i),
            title: _payments[i].$1,
            subtitle: i == 0 ? 'Saved card · expires 08/29' : 'Pay the courier when it arrives',
            icon: _payments[i].$2,
          ),
        const SizedBox(height: 14),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(color: AppColors.ink100, borderRadius: BorderRadius.circular(Radii.md)),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.lock_outline, size: 16, color: AppColors.ink500),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Handled by our payment provider. SafalMarketHub never stores your card number.',
                  style: TextStyle(fontSize: 12, height: 1.4, color: AppColors.ink500),
                ),
              ),
            ],
          ),
        ),
      ];

  /// The confirmation step. Everything being agreed to is on screen before
  /// anything is charged.
  void _confirmAndPay() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(Radii.xl))),
      builder: (sheetContext) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Row(
                children: [
                  Icon(Icons.verified_user_outlined, size: 16, color: AppColors.teal),
                  SizedBox(width: 6),
                  Text(
                    'CONFIRM AND PAY',
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1, color: AppColors.teal),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(money(_payable), style: Theme.of(context).textTheme.headlineLarge),
              const SizedBox(height: 14),
              _Line(label: 'Deliver to', value: _addresses[_address].$1),
              _Line(label: 'Paying with', value: _payments[_payment].$1),
              _Line(label: 'Arrives', value: _deliveryOptions[_delivery].$2),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: () {
                    Navigator.of(sheetContext).pop();
                    AppScope.of(context).clearCart();
                    setState(() => _placed = true);
                  },
                  child: Text('Pay ${money(_payable)}'),
                ),
              ),
              const SizedBox(height: 8),
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () => Navigator.of(sheetContext).pop(),
                  child: const Text('Cancel'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Stepper extends StatelessWidget {
  const _Stepper({required this.stages, required this.current});

  final List<String> stages;
  final int current;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
      child: Row(
        children: [
          for (var i = 0; i < stages.length; i++)
            Expanded(
              child: Padding(
                padding: EdgeInsets.only(right: i == stages.length - 1 ? 0 : 6),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      height: 4,
                      decoration: BoxDecoration(
                        color: i <= current ? AppColors.brand : AppColors.ink200,
                        borderRadius: BorderRadius.circular(Radii.pill),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      stages[i],
                      style: TextStyle(
                        fontSize: 10.5,
                        fontWeight: i == current ? FontWeight.w700 : FontWeight.w400,
                        color: i <= current ? AppColors.ink700 : AppColors.ink400,
                      ),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _SelectCard extends StatelessWidget {
  const _SelectCard({
    required this.selected,
    required this.onTap,
    required this.title,
    required this.subtitle,
    this.trailing,
    this.icon,
  });

  final bool selected;
  final VoidCallback onTap;
  final String title;
  final String subtitle;
  final String? trailing;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(Radii.md),
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: selected ? AppColors.brandSoft.withOpacity(0.5) : AppColors.surface,
          borderRadius: BorderRadius.circular(Radii.md),
          border: Border.all(color: selected ? AppColors.brand : AppColors.border, width: selected ? 1.5 : 1),
        ),
        child: Row(
          children: [
            Icon(
              selected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
              size: 19,
              color: selected ? AppColors.brand : AppColors.ink400,
            ),
            const SizedBox(width: 12),
            if (icon != null) ...[Icon(icon, size: 18, color: AppColors.ink500), const SizedBox(width: 10)],
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
                ],
              ),
            ),
            if (trailing != null)
              Text(trailing!, style: const TextStyle(fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}

class _Line extends StatelessWidget {
  const _Line({required this.label, required this.value, this.good = false});

  final String label;
  final String value;
  final bool good;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppColors.ink500)),
          const Spacer(),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: good ? AppColors.teal : AppColors.ink900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OrderPlaced extends StatelessWidget {
  const _OrderPlaced({required this.total});
  final int total;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: const BoxDecoration(color: AppColors.tealSoft, shape: BoxShape.circle),
                  child: const Icon(Icons.check_rounded, size: 32, color: AppColors.teal),
                ),
                const SizedBox(height: 20),
                Text('Order placed 🎉', style: Theme.of(context).textTheme.headlineMedium),
                const SizedBox(height: 8),
                Text(
                  '${money(total)} paid · arriving 16 Aug\nWe have emailed your confirmation.',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 26),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => Navigator.of(context).popUntil((route) => route.isFirst),
                    child: const Text('Keep shopping'),
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
