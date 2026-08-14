import 'package:flutter/material.dart';

import '../../data/offer_engine.dart';
import '../../data/seller_data.dart';
import '../../theme/app_theme.dart';
import '../../widgets/common.dart';

/// The Safal Assistant for sellers.
///
/// It reads freely — sales, stock, orders, reviews, settlements, pricing. It
/// changes nothing without a preview and a confirm, because a mistyped stock
/// number or a wrong price is expensive to undo.
///
/// It also never invents product facts: asked to add a product it lists what
/// it still needs rather than filling in a plausible specification.
void openSellerAssistant(BuildContext context, {String? seed}) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _SellerAssistantSheet(seed: seed),
  );
}

class _Msg {
  _Msg.seller(this.text)
      : fromSeller = true,
        node = null;
  _Msg.bot(this.text, {this.node}) : fromSeller = false;

  final String text;
  final bool fromSeller;
  final Widget? node;
}

class _SellerAssistantSheet extends StatefulWidget {
  const _SellerAssistantSheet({this.seed});
  final String? seed;

  @override
  State<_SellerAssistantSheet> createState() => _SellerAssistantSheetState();
}

class _SellerAssistantSheetState extends State<_SellerAssistantSheet> {
  final _controller = TextEditingController();
  final _scroll = ScrollController();
  final _messages = <_Msg>[];
  bool _thinking = false;

  static const _quickActions = [
    'How are my sales?',
    'Which products are low on stock?',
    "Show today's orders",
    'What are customers saying?',
    'Explain my settlement',
    'Am I overpriced?',
  ];

  @override
  void initState() {
    super.initState();
    _messages.add(_Msg.bot('Hi! What would you like to do with your store today?'));
    if (widget.seed != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _send(widget.seed!));
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    _scroll.dispose();
    super.dispose();
  }

  void _send(String raw) {
    final text = raw.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add(_Msg.seller(text));
      _controller.clear();
      _thinking = true;
    });
    _jump();

    Future.delayed(const Duration(milliseconds: 520), () {
      if (!mounted) return;
      setState(() {
        _thinking = false;
        _messages.add(_answer(text));
      });
      _jump();
    });
  }

  void _jump() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 220), curve: Curves.easeOut);
      }
    });
  }

  _Msg _answer(String text) {
    final q = text.toLowerCase();
    final s = businessSnapshot();

    // ---- add a product: ask, never invent
    if (RegExp(r'add (a )?(new )?product|create a product').hasMatch(q)) {
      return _Msg.bot(
        "Let's add it. Tell me the name, price and stock — I won't guess those.",
        node: const _NeedsCard(items: ['Product name', 'Selling price', 'Stock', 'At least one image']),
      );
    }

    // ---- stock update: preview, then confirm
    final stockMatch = RegExp(r'(?:set|make|update|change).*?to (\d+)').firstMatch(q);
    if (stockMatch != null) {
      final target = int.parse(stockMatch.group(1)!);
      final product = _findProduct(q) ?? sellerProducts.first;
      return _Msg.bot('Here is what that would change:',
          node: _StockPreview(product: product, to: target));
    }

    // ---- low stock
    if (RegExp(r'low|running out|almost out|restock|out of stock').hasMatch(q)) {
      final list = sellerProducts.where((p) => p.isLowStock || p.isOutOfStock).toList();
      if (list.isEmpty) return _Msg.bot('Nothing needs restocking right now.');
      return _Msg.bot('${list.length} products need attention.', node: _StockTable(products: list));
    }

    // ---- pricing
    if (RegExp(r'price|pricing|overpriced|competitor|cheaper').hasMatch(q)) {
      final product = _findProduct(q) ?? topSellers(1).first;
      final insight = priceInsightFor(product);
      if (insight == null) {
        return _Msg.bot(
            'No other seller lists ${product.name} right now, so there is nothing to compare against.');
      }
      return _Msg.bot(
        'Most sellers price ${product.name} between ${money(insight.low)} and ${money(insight.high)}.',
        node: _PriceCard(product: product, insight: insight),
      );
    }

    // ---- reviews
    if (RegExp(r'review|customers say|complain|feedback').hasMatch(q)) {
      final product = _findProduct(q) ?? topSellers(1).first;
      final summary = reviewSummaries[product.id];
      if (summary == null) return _Msg.bot('${product.name} has no reviews yet.');
      return _Msg.bot("Here's the picture for ${product.name}.",
          node: _ReviewCard(name: product.name, summary: summary));
    }

    // ---- orders
    if (RegExp(r'order|ship|pack|dispatch').hasMatch(q)) {
      final pending = sellerOrders.where((o) => o.needsAction).toList();
      if (pending.isEmpty) return _Msg.bot('No orders are waiting — everything is dispatched.');
      return _Msg.bot('You have ${pending.length} orders waiting.', node: _OrderList(orders: pending));
    }

    // ---- settlement
    if (RegExp(r'settlement|payout|paid|money|earnings').hasMatch(q)) {
      final next = settlements.firstWhere((x) => !x.settled);
      return _Msg.bot('Your next settlement is ${money(next.net)}, expected ${next.expected}.',
          node: _SettlementCard(settlement: next));
    }

    // ---- offers
    if (RegExp(r'offer|discount|sale|campaign|promotion').hasMatch(q)) {
      final live = liveCampaigns().where((o) => o.seller == sellerName).toList();
      return _Msg.bot(
        live.isEmpty
            ? 'No campaign is running. Create one from the Offers tab.'
            : '${live.first.name} is live — ${live.first.percent}% off ${sellerScopeLabels[live.first.scope]!.toLowerCase()}.',
      );
    }

    // ---- sales
    if (RegExp(r'sale|revenue|sold|selling|best|top|how am i').hasMatch(q)) {
      return _Msg.bot(
        "You've sold ${s.unitsSold} units recently, worth ${money(s.todaySales * 8)}.",
        node: _TopSellers(products: topSellers(3), slowest: slowestSeller()),
      );
    }

    return _Msg.bot(
        'I can help with sales, orders, stock, reviews, pricing, settlements and offers. Try one of the buttons below.');
  }

  SellerProduct? _findProduct(String q) {
    for (final p in sellerProducts) {
      final words = p.name.toLowerCase().split(RegExp(r'[\s—-]+')).where((w) => w.length > 4);
      if (words.any(q.contains)) return p;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: Container(
        height: MediaQuery.of(context).size.height * 0.88,
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(Radii.xl)),
        ),
        child: SafeArea(
          top: false,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 12, 12, 8),
                child: Row(
                  children: [
                    Container(
                      width: 30,
                      height: 30,
                      decoration: const BoxDecoration(color: AppColors.brandSoft, shape: BoxShape.circle),
                      child: const Icon(Icons.auto_awesome, size: 16, color: AppColors.brand),
                    ),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text('Safal Assistant',
                          style: TextStyle(fontSize: 15.5, fontWeight: FontWeight.w700)),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),

              Expanded(
                child: ListView.builder(
                  controller: _scroll,
                  padding: const EdgeInsets.all(16),
                  itemCount: _messages.length + (_thinking ? 1 : 0),
                  itemBuilder: (context, i) {
                    if (i >= _messages.length) {
                      return const Padding(
                        padding: EdgeInsets.only(top: 8),
                        child: SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(strokeWidth: 2.2, color: AppColors.ink400),
                        ),
                      );
                    }

                    final msg = _messages[i];
                    if (msg.fromSeller) {
                      return Align(
                        alignment: Alignment.centerRight,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10, left: 40),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: const BoxDecoration(
                            color: AppColors.brand,
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(Radii.lg),
                              topRight: Radius.circular(Radii.lg),
                              bottomLeft: Radius.circular(Radii.lg),
                              bottomRight: Radius.circular(Radii.sm),
                            ),
                          ),
                          child: Text(msg.text,
                              style: const TextStyle(fontSize: 13.5, color: Colors.white)),
                        ),
                      );
                    }

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          margin: const EdgeInsets.only(bottom: 8, right: 30),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                          decoration: const BoxDecoration(
                            color: AppColors.ink100,
                            borderRadius: BorderRadius.only(
                              topLeft: Radius.circular(Radii.lg),
                              topRight: Radius.circular(Radii.lg),
                              bottomRight: Radius.circular(Radii.lg),
                              bottomLeft: Radius.circular(Radii.sm),
                            ),
                          ),
                          child: Text(msg.text, style: const TextStyle(fontSize: 13.5, height: 1.4)),
                        ),
                        if (msg.node != null)
                          Padding(padding: const EdgeInsets.only(bottom: 12), child: msg.node!),
                      ],
                    );
                  },
                ),
              ),

              SizedBox(
                height: 40,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _quickActions.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (context, i) => ActionChip(
                    label: Text(_quickActions[i], style: const TextStyle(fontSize: 12)),
                    onPressed: () => _send(_quickActions[i]),
                  ),
                ),
              ),

              Padding(
                padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        textInputAction: TextInputAction.send,
                        onSubmitted: _send,
                        decoration: const InputDecoration(hintText: 'Ask about your store...'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    IconButton.filled(
                      onPressed: () => _send(_controller.text),
                      icon: const Icon(Icons.arrow_upward, size: 20),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/* ------------------------------------------------------------ answer cards */

class _Card extends StatelessWidget {
  const _Card({required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      margin: const EdgeInsets.only(right: 30),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(Radii.md),
        border: Border.all(color: AppColors.border),
      ),
      child: child,
    );
  }
}

/// Facts we don't have, we ask for.
class _NeedsCard extends StatelessWidget {
  const _NeedsCard({required this.items});
  final List<String> items;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Still need', style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
          const SizedBox(height: 6),
          for (final item in items)
            Padding(
              padding: const EdgeInsets.only(bottom: 3),
              child: Text('· $item', style: const TextStyle(fontSize: 12.5, color: AppColors.ink700)),
            ),
        ],
      ),
    );
  }
}

/// Stock changes stop here until the seller confirms.
class _StockPreview extends StatefulWidget {
  const _StockPreview({required this.product, required this.to});
  final SellerProduct product;
  final int to;

  @override
  State<_StockPreview> createState() => _StockPreviewState();
}

class _StockPreviewState extends State<_StockPreview> {
  bool _done = false;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Review inventory change',
              style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: Text(widget.product.name, style: const TextStyle(fontSize: 12.5))),
              Text('${widget.product.available} → ${widget.to}',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 10),
          if (_done)
            const Row(
              children: [
                Icon(Icons.check, size: 15, color: AppColors.teal),
                SizedBox(width: 6),
                Text('Inventory updated.',
                    style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: AppColors.teal)),
              ],
            )
          else
            FilledButton(
              style: FilledButton.styleFrom(minimumSize: const Size(0, 34)),
              onPressed: () {
                setState(() => _done = true);
                showToast(context, 'Stock updated', detail: '${widget.product.name} → ${widget.to}');
              },
              child: const Text('Confirm update'),
            ),
        ],
      ),
    );
  }
}

class _StockTable extends StatelessWidget {
  const _StockTable({required this.products});
  final List<SellerProduct> products;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        children: [
          for (final p in products)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 3),
              child: Row(
                children: [
                  Expanded(
                    child: Text(p.name,
                        maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12.5)),
                  ),
                  Text(p.isOutOfStock ? 'Out of stock' : '${p.available} left',
                      style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w800,
                          color: p.isOutOfStock ? AppColors.danger : AppColors.gold)),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _PriceCard extends StatelessWidget {
  const _PriceCard({required this.product, required this.insight});
  final SellerProduct product;
  final PriceInsight insight;

  @override
  Widget build(BuildContext context) {
    final margin = marginAt(product, product.price);

    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final listing in insight.listings)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 6),
              decoration: BoxDecoration(
                color: listing.isYou ? AppColors.brandSoft : null,
                borderRadius: BorderRadius.circular(Radii.sm),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(listing.seller,
                        style: TextStyle(
                            fontSize: 12.5,
                            fontWeight: listing.isYou ? FontWeight.w700 : FontWeight.w400)),
                  ),
                  Text('${listing.deliveryDays} · ${listing.rating}★  ',
                      style: const TextStyle(fontSize: 11, color: AppColors.ink500)),
                  Text(money(listing.price),
                      style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          const Divider(height: 18),
          Row(
            children: [
              const Expanded(
                  child: Text('You keep per sale', style: TextStyle(fontSize: 12.5, color: AppColors.ink500))),
              Text(money(margin.earnings),
                  style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800)),
            ],
          ),
          const SizedBox(height: 6),
          const Text('Public listing details only — never another seller\'s costs or margins.',
              style: TextStyle(fontSize: 10.5, color: AppColors.ink400)),
        ],
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.name, required this.summary});
  final String name;
  final ReviewSummary summary;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.star_rounded, size: 16, color: Color(0xFFE0A82E)),
              const SizedBox(width: 4),
              Text('${summary.rating} · ${summary.count} ratings',
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 10),
          const Text('CUSTOMERS LIKE',
              style: TextStyle(
                  fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5, color: AppColors.teal)),
          for (final like in summary.likes)
            Text('· $like', style: const TextStyle(fontSize: 12.5, color: AppColors.ink700)),
          const SizedBox(height: 8),
          const Text('CUSTOMERS DISLIKE',
              style: TextStyle(
                  fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5, color: AppColors.gold)),
          for (final dislike in summary.dislikes)
            Text('· $dislike', style: const TextStyle(fontSize: 12.5, color: AppColors.ink700)),
          if (summary.trend != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(9),
              decoration: BoxDecoration(color: AppColors.goldSoft, borderRadius: BorderRadius.circular(Radii.sm)),
              child: Text(summary.trend!,
                  style: const TextStyle(fontSize: 11.5, height: 1.4, color: AppColors.gold)),
            ),
          ],
        ],
      ),
    );
  }
}

class _OrderList extends StatelessWidget {
  const _OrderList({required this.orders});
  final List<SellerOrder> orders;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        children: [
          for (final order in orders)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 3),
              child: Row(
                children: [
                  Text(order.id, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(sellerOrderLabels[order.status]!,
                        style: const TextStyle(fontSize: 12, color: AppColors.ink500)),
                  ),
                  Text(money(order.value),
                      style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _SettlementCard extends StatelessWidget {
  const _SettlementCard({required this.settlement});
  final Settlement settlement;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        children: [
          _row('Gross sales', money(settlement.gross)),
          _row('Refunds', '− ${money(settlement.refunds)}'),
          _row('Commission', '− ${money(settlement.commission)}'),
          _row('Deductions', '− ${money(settlement.deductions)}'),
          const Divider(height: 16),
          _row('Net payout', money(settlement.net), strong: true),
        ],
      ),
    );
  }

  Widget _row(String label, String value, {bool strong = false}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(
          children: [
            Expanded(child: Text(label, style: const TextStyle(fontSize: 12.5, color: AppColors.ink500))),
            Text(value,
                style: TextStyle(fontSize: 12.5, fontWeight: strong ? FontWeight.w800 : FontWeight.w600)),
          ],
        ),
      );
}

class _TopSellers extends StatelessWidget {
  const _TopSellers({required this.products, required this.slowest});
  final List<SellerProduct> products;
  final SellerProduct slowest;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('BEST SELLERS',
              style: TextStyle(
                  fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5, color: AppColors.ink400)),
          const SizedBox(height: 6),
          for (final (i, p) in products.indexed)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 2),
              child: Row(
                children: [
                  Text('${i + 1}  ',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.ink400)),
                  Expanded(
                    child: Text(p.name,
                        maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12.5)),
                  ),
                  Text('${p.sold} sold',
                      style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700)),
                ],
              ),
            ),
          const SizedBox(height: 8),
          Text('Slowest right now: ${slowest.name} (${slowest.sold} sold).',
              style: const TextStyle(fontSize: 11.5, color: AppColors.ink500)),
        ],
      ),
    );
  }
}
