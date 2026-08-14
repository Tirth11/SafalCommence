import 'package:flutter/material.dart';

import '../data/catalog.dart';
import '../data/commerce.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import 'checkout_screen.dart';
import 'product_screen.dart';

/// The shopping assistant, in plain English.
///
/// Three doors, one room: answer a few questions, show a photo, or type what
/// you want. Every path ends at the same short list, each item carrying one
/// line saying why it's there. The word "AI" appears nowhere in the UI — the
/// help is the feature, not the technology behind it.
enum AssistantMode { guide, photo, search, chat }

Future<void> openAssistant(BuildContext context, AssistantMode mode,
    {String query = ''}) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _AssistantSheet(mode: mode, query: query),
  );
}

class _AssistantSheet extends StatelessWidget {
  const _AssistantSheet({required this.mode, required this.query});

  final AssistantMode mode;
  final String query;

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.82,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, controller) {
        return Container(
          decoration: const BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.vertical(top: Radius.circular(Radii.xl)),
          ),
          child: Column(
            children: [
              const _Grabber(),
              Expanded(
                child: switch (mode) {
                  AssistantMode.guide => _GuideFlow(controller: controller),
                  AssistantMode.photo => _PhotoFlow(controller: controller),
                  AssistantMode.chat => _ChatFlow(controller: controller),
                  AssistantMode.search => _ResultsView(
                      controller: controller,
                      title: 'Results for “$query”',
                      subtitle: () {
                        final count = searchProducts(query).length;
                        return '$count ${count == 1 ? 'product' : 'products'} worth a look';
                      }(),
                      matches: searchProducts(query),
                    ),
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

class _Grabber extends StatelessWidget {
  const _Grabber();

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 10),
      width: 40,
      height: 4,
      decoration: BoxDecoration(
          color: AppColors.ink200,
          borderRadius: BorderRadius.circular(Radii.pill)),
    );
  }
}

/* ------------------------------------------------------------ help me choose */
class _GuideFlow extends StatefulWidget {
  const _GuideFlow({required this.controller});
  final ScrollController controller;

  @override
  State<_GuideFlow> createState() => _GuideFlowState();
}

class _GuideFlowState extends State<_GuideFlow> {
  final Map<String, String> _answers = {};
  int _step = 0;

  @override
  Widget build(BuildContext context) {
    if (_step >= guideSteps.length) {
      final matches = findMatches(
        category: _answers['category'],
        budget: _answers['budget'],
        priority: _answers['priority'],
      );
      return _ResultsView(
        controller: widget.controller,
        title:
            'We found ${matches.length} good ${matches.length == 1 ? 'option' : 'options'} for you',
        subtitle: _summary(),
        matches: matches,
        onRestart: () => setState(() {
          _answers.clear();
          _step = 0;
        }),
      );
    }

    final step = guideSteps[_step];

    return ListView(
      controller: widget.controller,
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
      children: [
        const Row(
          children: [
            Icon(Icons.auto_awesome, size: 15, color: AppColors.brand),
            SizedBox(width: 6),
            Text(
              'HELP ME CHOOSE',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w800,
                letterSpacing: 1.1,
                color: AppColors.brand,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(step.question, style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 6),
        Text(
          'Question ${_step + 1} of ${guideSteps.length} — this takes about ten seconds.',
          style: const TextStyle(
              fontSize: 13, height: 1.4, color: AppColors.ink700),
        ),
        const SizedBox(height: 20),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 2.35,
          children: [
            for (final option in step.options)
              OutlinedButton(
                onPressed: () => setState(() {
                  _answers[step.id] = option.value;
                  _step += 1;
                }),
                child: Text(
                  option.label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ),
          ],
        ),
        const SizedBox(height: 18),
        Row(
          children: [
            if (_step > 0)
              TextButton.icon(
                onPressed: () => setState(() => _step -= 1),
                icon: const Icon(Icons.arrow_back, size: 16),
                label: const Text('Back'),
              ),
            const Spacer(),
            for (var i = 0; i < guideSteps.length; i++)
              Container(
                width: 26,
                height: 4,
                margin: const EdgeInsets.only(left: 5),
                decoration: BoxDecoration(
                  color: i <= _step ? AppColors.brand : AppColors.ink200,
                  borderRadius: BorderRadius.circular(Radii.pill),
                ),
              ),
          ],
        ),
      ],
    );
  }

  String _summary() {
    final bits = <String>[];
    final category = _answers['category'];
    final budget = _answers['budget'];
    final priority = _answers['priority'];
    if (category != null && category != 'any') {
      bits.add(category.toLowerCase());
    }
    if (budget != null && budget != 'any') {
      bits.add('under ${money(int.parse(budget))}');
    }
    if (priority != null) {
      bits.add('good ${priority == 'portable' ? 'for travel' : priority}');
    }
    return bits.isEmpty
        ? 'Based on what you told us'
        : 'Based on: ${bits.join(' · ')}';
  }
}

/* --------------------------------------------------------------- chat --- */
class _ChatFlow extends StatefulWidget {
  const _ChatFlow({required this.controller});
  final ScrollController controller;

  @override
  State<_ChatFlow> createState() => _ChatFlowState();
}

class _ChatFlowState extends State<_ChatFlow> {
  final _input = TextEditingController();
  final List<_ChatBubble> _bubbles = [];
  List<Product> _results = [];
  bool _thinking = false;

  static const _suggestions = [
    'Headphones under \$80',
    'Any offers?',
    'Compare first two',
    'Track my order',
    'Search with a photo',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = AppScope.of(context);
      setState(() {
        _bubbles.add(_ChatBubble.bot(
          'Hi ${state.customerName ?? 'there'} 👋 I can search by words or photo, compare options, find offers, prepare checkout, and help with orders. What are you shopping for today?',
        ));
      });
    });
  }

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  void _send(String raw) {
    final text = raw.trim();
    if (text.isEmpty) return;
    setState(() {
      _bubbles.add(_ChatBubble.user(text));
      _input.clear();
      _thinking = true;
    });

    Future.delayed(const Duration(milliseconds: 420), () {
      if (!mounted) return;
      setState(() {
        _thinking = false;
        _respond(text);
      });
    });
  }

  void _respond(String text) {
    final q = text.toLowerCase();
    final state = AppScope.of(context);

    if (RegExp(r'\b(photo|image|screenshot|picture|similar|match)\b')
        .hasMatch(q)) {
      final matches = similarToPhoto(limit: 3);
      _results = matches.map((m) => m.product).toList();
      _bubbles.add(_ChatBubble.bot(
        'Here is what looks closest to your photo:',
        matches: matches,
        rateable: true,
      ));
      return;
    }

    if (RegExp(r'\b(voice|speak|mic|microphone|hindi|language)\b')
        .hasMatch(q)) {
      _bubbles.add(_ChatBubble.bot(
        'Voice shopping can turn natural requests into product matches.',
        note:
            'Example: “Find running gear under \$100” → budget-aware recommendations. The web app shows the same voice-shopping preview.',
      ));
      return;
    }

    if (RegExp(r'\b(track|order|delivery|where is|shipped|arriving)\b')
            .hasMatch(q) &&
        !RegExp(r'\b(buy|checkout|purchase)\b').hasMatch(q)) {
      _bubbles.add(_ChatBubble.bot(
        'I found the order most likely connected to that request:',
        order: activeOrder ?? customerOrders.first,
      ));
      return;
    }

    if (RegExp(
            r'\b(return|refund|replace|damaged|wrong|broken|support|problem)\b')
        .hasMatch(q)) {
      _bubbles.add(_ChatBubble.bot(
        'I can help with the order, but nothing is submitted until you confirm it.',
        note:
            'Next steps: request a return, contact support, or add photos from the order detail page.',
        order: activeOrder ?? customerOrders.first,
      ));
      return;
    }

    if (RegExp(
            r'\b(review|reviews|buyers saying|people say|feedback|concerns)\b')
        .hasMatch(q)) {
      final product = _resolveProduct(q);
      _results = [product];
      _bubbles.add(_ChatBubble.bot(
        'Here is the quick review summary:',
        reviewProduct: product,
      ));
      return;
    }

    if (RegExp(r'\b(preference|preferences|usual size|price drop|best offer)\b')
        .hasMatch(q)) {
      _bubbles.add(_ChatBubble.bot(
        'These preferences let SafalAssistant ask fewer questions while staying editable by the customer.',
        note:
            'Saved preferences: show offers first, remember wishlist signals, and keep best eligible offer checks on.',
      ));
      return;
    }

    final ordinal = _ordinal(q);
    if (RegExp(r'\badd\b').hasMatch(q) &&
        (_results.isNotEmpty || ordinal != null)) {
      final product = _pick(ordinal);
      if (product == null) {
        _bubbles.add(_ChatBubble.bot(
            "I've lost track of which one — search again and I'll add it."));
        return;
      }
      state.addToCart(product, product.variants.first);
      _bubbles.add(_ChatBubble.bot(
          'Added ✓ ${product.name} — ${money(product.price)}. Your cart is updated.'));
      return;
    }

    if (RegExp(r'\b(buy|checkout|purchase)\b').hasMatch(q)) {
      final product = _pick(ordinal);
      if (product == null) {
        _bubbles.add(
            _ChatBubble.bot('Which one? Search first and tell me the number.'));
        return;
      }
      _bubbles.add(_ChatBubble.bot(
        'Here it is before you pay:',
        checkoutProduct: product,
      ));
      return;
    }

    if (RegExp(r'\bcompare\b').hasMatch(q)) {
      if (_results.length < 2) {
        _bubbles.add(_ChatBubble.bot(
            "Find a couple of options first and I'll line them up."));
        return;
      }
      _bubbles.add(
          _ChatBubble.bot('Side by side:', compare: _results.take(2).toList()));
      return;
    }

    if (RegExp(r'\b(offer|discount|coupon|deal|cheaper price)\b').hasMatch(q)) {
      final product =
          _results.isNotEmpty ? _results.first : _productFromText(q);
      final subtotal = product?.price ?? state.subtotal;
      final offer = bestOfferFor(subtotal, category: product?.category);
      if (offer == null) {
        _bubbles.add(_ChatBubble.bot(
          product != null
              ? "No offer applies to ${money(subtotal)} right now. I'll only tell you about one you can actually use."
              : "Today there's 20% off selected electronics, \$10 off orders above \$60, and free delivery.",
        ));
        return;
      }
      _bubbles.add(_ChatBubble.bot(
        product != null
            ? 'Best eligible offer found before checkout:'
            : 'Best offer available right now:',
        offerProduct: product,
        offer: offer,
        subtotal: subtotal,
      ));
      return;
    }

    if (RegExp(r'\b(cheap|less|lower|under budget)\b').hasMatch(q) &&
        _results.isNotEmpty) {
      final ceiling =
          _results.map((p) => p.price).reduce((a, b) => a < b ? a : b);
      final cheaper = products.where((p) => p.price < ceiling).toList()
        ..sort((a, b) => a.price.compareTo(b.price));
      final matches =
          cheaper.take(3).map((p) => Match(p, 'Cheaper option')).toList();
      if (matches.isEmpty) {
        _bubbles.add(_ChatBubble.bot(
            "Nothing cheaper than that in the catalogue — that's already the lowest."));
        return;
      }
      _results = matches.map((m) => m.product).toList();
      _bubbles.add(_ChatBubble.bot('These come in lower:',
          matches: matches, rateable: true));
      return;
    }

    final colour = [
      'black',
      'white',
      'olive',
      'titanium',
      'blue',
      'sand',
      'navy'
    ].where((c) => q.contains(c)).firstOrNull;
    if (colour != null && _results.isNotEmpty) {
      final filtered = _results
          .where((p) => p.variants.any((v) => v.toLowerCase().contains(colour)))
          .toList();
      if (filtered.isEmpty) {
        _bubbles.add(_ChatBubble.bot(
            'None of those come in $colour. Want me to widen the search?'));
        return;
      }
      _results = filtered;
      _bubbles.add(_ChatBubble.bot(
        'In $colour:',
        matches: filtered.map((p) => Match(p, 'Available in $colour')).toList(),
        rateable: true,
      ));
      return;
    }

    final found = searchProducts(text, limit: 3);
    final matches = found.isNotEmpty
        ? found
        : findMatches(budget: '${_budgetIn(q) ?? 'any'}', limit: 3);
    _results = matches.map((m) => m.product).toList();
    if (matches.isEmpty) {
      _bubbles.add(_ChatBubble.bot(
          "I couldn't find anything for that. Try naming the kind of product, or a budget."));
      return;
    }
    _bubbles.add(_ChatBubble.bot(
      'I found ${matches.length} good ${matches.length == 1 ? 'option' : 'options'}.',
      matches: matches,
      rateable: true,
    ));
  }

  Product? _pick(int? ordinal) {
    if (_results.isEmpty) return null;
    final index = ordinal ?? 0;
    if (index < 0 || index >= _results.length) return null;
    return _results[index];
  }

  Product _resolveProduct(String q) =>
      _productFromText(q) ??
      (_results.isNotEmpty ? _results.first : products.first);

  Product? _productFromText(String q) {
    for (final product in products) {
      final haystack =
          '${product.name} ${product.brand} ${product.category}'.toLowerCase();
      if (q
          .split(RegExp(r'\s+'))
          .where((word) => word.length > 3)
          .any(haystack.contains)) {
        return product;
      }
    }
    return null;
  }

  int? _ordinal(String q) {
    if (RegExp(r'\b(first|1st|one|1)\b').hasMatch(q)) return 0;
    if (RegExp(r'\b(second|2nd|two|2)\b').hasMatch(q)) return 1;
    if (RegExp(r'\b(third|3rd|three|3)\b').hasMatch(q)) return 2;
    return null;
  }

  int? _budgetIn(String q) {
    final match =
        RegExp(r'(?:under|below|less than)\s*\$?\s*(\d+)').firstMatch(q);
    return match == null ? null : int.parse(match.group(1)!);
  }

  void _startCheckout(Product product) {
    final state = AppScope.of(context);
    state.addToCart(product, product.variants.first);
    final offer = bestOfferFor(product.price, category: product.category);
    final discount = offer == null ? 0 : offerDiscount(offer, product.price);
    final shipping = product.price - discount >= 99 ? 0 : 5;
    final navigator = Navigator.of(context);
    navigator.pop();
    navigator.push(MaterialPageRoute(
      builder: (_) => CheckoutScreen(
        total: product.price - discount + shipping,
        discount: discount,
        shipping: shipping,
      ),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView(
            controller: widget.controller,
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 14),
            children: [
              for (final bubble in _bubbles) ...[
                _ChatBubbleView(
                    bubble: bubble, onAsk: _send, onCheckout: _startCheckout),
                const SizedBox(height: 10),
              ],
              if (_thinking) const _ThinkingBubble(),
            ],
          ),
        ),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
          decoration: const BoxDecoration(
            color: AppColors.surface,
            border: Border(top: BorderSide(color: AppColors.border)),
          ),
          child: Wrap(
            spacing: 7,
            runSpacing: 7,
            children: [
              for (final suggestion in _suggestions)
                ActionChip(
                    label: Text(suggestion),
                    onPressed: () => _send(suggestion)),
            ],
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _input,
                    minLines: 1,
                    maxLines: 3,
                    textInputAction: TextInputAction.send,
                    onSubmitted: _send,
                    decoration: InputDecoration(
                      hintText: 'Ask SafalAssistant…',
                      prefixIcon: IconButton(
                        tooltip: 'Search with a photo',
                        icon: const Icon(Icons.photo_camera_outlined, size: 18),
                        onPressed: () => _send('Search with a photo'),
                      ),
                      suffixIcon: IconButton(
                        tooltip: 'Use voice shopping',
                        icon: const Icon(Icons.mic_none, size: 19),
                        onPressed: () => _send('Voice shopping'),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                FilledButton(
                  style: FilledButton.styleFrom(
                    shape: const CircleBorder(),
                    minimumSize: const Size(48, 48),
                    padding: EdgeInsets.zero,
                  ),
                  onPressed: () => _send(_input.text),
                  child: const Icon(Icons.arrow_upward, size: 18),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ChatBubble {
  const _ChatBubble({
    required this.fromUser,
    required this.text,
    this.matches,
    this.rateable = false,
    this.compare,
    this.offer,
    this.offerProduct,
    this.subtotal,
    this.checkoutProduct,
    this.order,
    this.reviewProduct,
    this.note,
  });

  factory _ChatBubble.user(String text) =>
      _ChatBubble(fromUser: true, text: text);

  factory _ChatBubble.bot(
    String text, {
    List<Match>? matches,
    bool rateable = false,
    List<Product>? compare,
    Offer? offer,
    Product? offerProduct,
    int? subtotal,
    Product? checkoutProduct,
    CustomerOrder? order,
    Product? reviewProduct,
    String? note,
  }) =>
      _ChatBubble(
        fromUser: false,
        text: text,
        matches: matches,
        rateable: rateable,
        compare: compare,
        offer: offer,
        offerProduct: offerProduct,
        subtotal: subtotal,
        checkoutProduct: checkoutProduct,
        order: order,
        reviewProduct: reviewProduct,
        note: note,
      );

  final bool fromUser;
  final String text;
  final List<Match>? matches;
  final bool rateable;
  final List<Product>? compare;
  final Offer? offer;
  final Product? offerProduct;
  final int? subtotal;
  final Product? checkoutProduct;
  final CustomerOrder? order;
  final Product? reviewProduct;
  final String? note;
}

class _ChatBubbleView extends StatelessWidget {
  const _ChatBubbleView(
      {required this.bubble, required this.onAsk, required this.onCheckout});

  final _ChatBubble bubble;
  final ValueChanged<String> onAsk;
  final ValueChanged<Product> onCheckout;

  @override
  Widget build(BuildContext context) {
    if (bubble.fromUser) {
      return Align(
        alignment: Alignment.centerRight,
        child: Container(
          constraints: const BoxConstraints(maxWidth: 292),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: const BoxDecoration(
            color: AppColors.brand,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(18),
              topRight: Radius.circular(18),
              bottomLeft: Radius.circular(18),
              bottomRight: Radius.circular(5),
            ),
          ),
          child: Text(bubble.text,
              style: const TextStyle(
                  fontSize: 14, height: 1.35, color: Colors.white)),
        ),
      );
    }

    return Align(
      alignment: Alignment.centerLeft,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 340),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: AppColors.ink100,
                borderRadius: BorderRadius.circular(18)
                    .copyWith(bottomLeft: const Radius.circular(5)),
              ),
              child: Text(bubble.text,
                  style: const TextStyle(
                      fontSize: 14, height: 1.35, color: AppColors.ink900)),
            ),
            if (bubble.note != null) ...[
              const SizedBox(height: 8),
              _InfoCard(text: bubble.note!),
            ],
            if (bubble.matches != null) ...[
              const SizedBox(height: 8),
              for (var i = 0; i < bubble.matches!.length; i++) ...[
                _AssistantProductRow(
                    match: bubble.matches![i], index: i + 1, onAsk: onAsk),
                const SizedBox(height: 8),
              ],
              if (bubble.rateable) const _Helpful(),
            ],
            if (bubble.compare != null) ...[
              const SizedBox(height: 8),
              _CompareCard(products: bubble.compare!, onAsk: onAsk),
            ],
            if (bubble.offer != null && bubble.subtotal != null) ...[
              const SizedBox(height: 8),
              _OfferInsightCard(
                  product: bubble.offerProduct,
                  offer: bubble.offer!,
                  subtotal: bubble.subtotal!),
            ],
            if (bubble.checkoutProduct != null) ...[
              const SizedBox(height: 8),
              _CheckoutPreview(
                  product: bubble.checkoutProduct!, onCheckout: onCheckout),
            ],
            if (bubble.order != null) ...[
              const SizedBox(height: 8),
              _OrderAssistantCard(order: bubble.order!),
            ],
            if (bubble.reviewProduct != null) ...[
              const SizedBox(height: 8),
              _ReviewCard(product: bubble.reviewProduct!),
            ],
          ],
        ),
      ),
    );
  }
}

class _ThinkingBubble extends StatelessWidget {
  const _ThinkingBubble();

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
            color: AppColors.ink100, borderRadius: BorderRadius.circular(18)),
        child: const SizedBox(
          width: 40,
          child: LinearProgressIndicator(minHeight: 3, color: AppColors.brand),
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.text});
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.brandSoft,
        borderRadius: BorderRadius.circular(Radii.md),
        border: Border.all(color: AppColors.brand.withValues(alpha: 0.18)),
      ),
      child: Text(text,
          style: const TextStyle(
              fontSize: 12.5, height: 1.4, color: AppColors.ink700)),
    );
  }
}

class _AssistantProductRow extends StatelessWidget {
  const _AssistantProductRow(
      {required this.match, required this.index, required this.onAsk});
  final Match match;
  final int index;
  final ValueChanged<String> onAsk;

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final product = match.product;

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(Radii.md),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ProductScene(glyph: product.glyph, tone: product.tone, size: 58),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Option $index',
                    style: const TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        color: AppColors.ink500)),
                Text(product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                        fontSize: 13.2,
                        height: 1.24,
                        fontWeight: FontWeight.w800,
                        color: AppColors.ink950)),
                const SizedBox(height: 3),
                Row(children: [
                  Text(money(product.price),
                      style: const TextStyle(
                          fontSize: 12.5, fontWeight: FontWeight.w800)),
                  const SizedBox(width: 8),
                  RatingRow(rating: product.rating),
                ]),
                const SizedBox(height: 5),
                Text(match.reason,
                    style: const TextStyle(
                        fontSize: 11.5,
                        height: 1.25,
                        color: AppColors.teal,
                        fontWeight: FontWeight.w700)),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            children: [
              OutlinedButton(
                style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 32),
                    padding: const EdgeInsets.symmetric(horizontal: 9)),
                onPressed: () {
                  final navigator = Navigator.of(context);
                  navigator.pop();
                  navigator.push(MaterialPageRoute(
                      builder: (_) => ProductScreen(product: product)));
                },
                child: const Text('View'),
              ),
              const SizedBox(height: 6),
              FilledButton(
                style: FilledButton.styleFrom(
                    minimumSize: const Size(0, 32),
                    padding: const EdgeInsets.symmetric(horizontal: 10)),
                onPressed: () {
                  state.addToCart(product, product.variants.first);
                  showToast(context, 'Added to cart', detail: product.name);
                },
                child: const Text('Add'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _CompareCard extends StatelessWidget {
  const _CompareCard({required this.products, required this.onAsk});
  final List<Product> products;
  final ValueChanged<String> onAsk;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(Radii.md),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        children: [
          for (final product in products)
            Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  ProductScene(
                      glyph: product.glyph, tone: product.tone, size: 42),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(product.name,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                  fontSize: 13, fontWeight: FontWeight.w800)),
                          Text(
                              '${money(product.price)} · ${product.rating}★ · ${product.deliveryDays}',
                              style: Theme.of(context).textTheme.bodySmall),
                        ]),
                  ),
                ],
              ),
            ),
          OutlinedButton(
            onPressed: () => onAsk('Any offers?'),
            child: const Text('Check best offer'),
          ),
        ],
      ),
    );
  }
}

class _OfferInsightCard extends StatelessWidget {
  const _OfferInsightCard(
      {required this.offer, required this.subtotal, this.product});
  final Offer offer;
  final int subtotal;
  final Product? product;

  @override
  Widget build(BuildContext context) {
    final discount = offerDiscount(offer, subtotal);
    final delivery = subtotal - discount >= 99 ? 0 : 5;
    final total = subtotal - discount + delivery;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(Radii.md),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Smart offer finder',
              style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800)),
          const SizedBox(height: 4),
          const Text('Only showing an offer this item actually qualifies for.',
              style: TextStyle(fontSize: 12.2, color: AppColors.ink700)),
          if (product != null) ...[
            const SizedBox(height: 10),
            Text(product!.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style:
                    const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
          ],
          const Divider(height: 22),
          _MiniLine(label: 'Product price', value: money(subtotal)),
          _MiniLine(
              label: 'Offer ${offer.code ?? offer.headline}',
              value: '− ${money(discount)}',
              good: true),
          _MiniLine(
              label: 'Delivery',
              value: delivery == 0 ? 'Free' : money(delivery)),
          const Divider(height: 18),
          _MiniLine(label: 'Final pay', value: money(total), bold: true),
          const SizedBox(height: 10),
          Text(offer.detail,
              style: const TextStyle(
                  fontSize: 12.3,
                  height: 1.35,
                  color: AppColors.teal,
                  fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _CheckoutPreview extends StatelessWidget {
  const _CheckoutPreview({required this.product, required this.onCheckout});
  final Product product;
  final ValueChanged<Product> onCheckout;

  @override
  Widget build(BuildContext context) {
    final offer = bestOfferFor(product.price, category: product.category);
    final discount = offer == null ? 0 : offerDiscount(offer, product.price);
    final shipping = product.price - discount >= 99 ? 0 : 5;
    final total = product.price - discount + shipping;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(Radii.md),
          border: Border.all(color: AppColors.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          ProductScene(glyph: product.glyph, tone: product.tone, size: 50),
          const SizedBox(width: 10),
          Expanded(
            child: Text(product.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    fontSize: 13.5, fontWeight: FontWeight.w800)),
          ),
        ]),
        const Divider(height: 22),
        _MiniLine(label: 'Item', value: money(product.price)),
        if (discount > 0)
          _MiniLine(
              label: offer!.code ?? offer.headline,
              value: '− ${money(discount)}',
              good: true),
        _MiniLine(
            label: 'Delivery', value: shipping == 0 ? 'Free' : money(shipping)),
        _MiniLine(label: 'Payable', value: money(total), bold: true),
        const SizedBox(height: 12),
        SizedBox(
            width: double.infinity,
            child: FilledButton(
                onPressed: () => onCheckout(product),
                child: const Text('Continue to checkout'))),
      ]),
    );
  }
}

class _OrderAssistantCard extends StatelessWidget {
  const _OrderAssistantCard({required this.order});
  final CustomerOrder order;

  @override
  Widget build(BuildContext context) {
    final product = productById(order.lines.first.productId);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(Radii.md),
          border: Border.all(color: AppColors.border)),
      child: Row(children: [
        ProductScene(glyph: product.glyph, tone: product.tone, size: 52),
        const SizedBox(width: 12),
        Expanded(
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            StatusPill(label: orderStageLabels[order.stage.index]),
            const SizedBox(height: 6),
            Text(product.name,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                    fontSize: 13.5, fontWeight: FontWeight.w800)),
            Text('${order.id} · ${order.estimate}',
                style: Theme.of(context).textTheme.bodySmall),
          ]),
        ),
      ]),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.product});
  final Product product;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(Radii.md),
          border: Border.all(color: AppColors.border)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(product.name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style:
                const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800)),
        const SizedBox(height: 4),
        RatingRow(rating: product.rating, reviews: product.reviews),
        const SizedBox(height: 10),
        const Text('What buyers like',
            style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800)),
        Text('• ${product.highlights.take(2).join('\n• ')}',
            style: const TextStyle(
                fontSize: 12.3, height: 1.45, color: AppColors.ink700)),
        const SizedBox(height: 8),
        const Text('Common concern',
            style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800)),
        Text(
            product.stock < 12
                ? 'Limited stock, so delivery windows can move.'
                : 'No major issue flagged in the demo reviews.',
            style: const TextStyle(fontSize: 12.3, color: AppColors.ink700)),
      ]),
    );
  }
}

class _MiniLine extends StatelessWidget {
  const _MiniLine(
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
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(children: [
        Expanded(
            child: Text(label,
                style: TextStyle(
                    fontSize: bold ? 13.5 : 12.5,
                    color: bold ? AppColors.ink950 : AppColors.ink700,
                    fontWeight: bold ? FontWeight.w800 : FontWeight.w500))),
        Text(value,
            style: TextStyle(
                fontSize: bold ? 15 : 12.5,
                color: good ? AppColors.teal : AppColors.ink950,
                fontWeight: FontWeight.w800)),
      ]),
    );
  }
}

/* ---------------------------------------------------------------- photo --- */
class _PhotoFlow extends StatefulWidget {
  const _PhotoFlow({required this.controller});
  final ScrollController controller;

  @override
  State<_PhotoFlow> createState() => _PhotoFlowState();
}

class _PhotoFlowState extends State<_PhotoFlow> {
  bool _looking = false;
  bool _done = false;

  @override
  Widget build(BuildContext context) {
    if (_done) {
      return _ResultsView(
        controller: widget.controller,
        title: 'We found products similar to your photo',
        subtitle: 'Closest matches from sellers on SafalMarketHub',
        matches: similarToPhoto(),
        onRestart: () => setState(() {
          _done = false;
          _looking = false;
        }),
        restartLabel: 'Try another photo',
      );
    }

    return ListView(
      controller: widget.controller,
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
      children: [
        const Row(
          children: [
            Icon(Icons.photo_camera_outlined, size: 15, color: AppColors.brand),
            SizedBox(width: 6),
            Text(
              'SEARCH WITH A PHOTO',
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.1,
                  color: AppColors.brand),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text('Seen something you like?',
            style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 6),
        const Text(
          "Upload a photo and we'll find similar products from our sellers.",
          style: TextStyle(fontSize: 13, height: 1.45, color: AppColors.ink700),
        ),
        const SizedBox(height: 20),
        InkWell(
          borderRadius: BorderRadius.circular(Radii.lg),
          onTap: _looking
              ? null
              : () {
                  setState(() => _looking = true);
                  // Stands in for the upload plus vision round-trip.
                  Future.delayed(const Duration(milliseconds: 1100), () {
                    if (mounted) setState(() => _done = true);
                  });
                },
          child: DottedPanel(
            child: _looking
                ? const Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      SizedBox(
                        width: 26,
                        height: 26,
                        child: CircularProgressIndicator(
                            strokeWidth: 2.5, color: AppColors.brand),
                      ),
                      SizedBox(height: 14),
                      Text('Looking for matches…',
                          style: TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  )
                : const Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add_photo_alternate_outlined,
                          size: 34, color: AppColors.ink400),
                      SizedBox(height: 12),
                      Text('Take or upload a photo',
                          style: TextStyle(fontWeight: FontWeight.w600)),
                      SizedBox(height: 4),
                      Text('JPG or PNG',
                          style:
                              TextStyle(fontSize: 12, color: AppColors.ink500)),
                    ],
                  ),
          ),
        ),
        const SizedBox(height: 16),
        Text(
          'A screenshot, a photo from a shop window, anything. We match on what the product looks like.',
          textAlign: TextAlign.center,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}

class DottedPanel extends StatelessWidget {
  const DottedPanel({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 46),
      decoration: BoxDecoration(
        color: AppColors.brandSoft.withValues(alpha: 0.45),
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(
            color: AppColors.brand.withValues(alpha: 0.30), width: 1.5),
      ),
      child: Center(child: child),
    );
  }
}

/* -------------------------------------------------------------- results --- */
class _ResultsView extends StatelessWidget {
  const _ResultsView({
    required this.controller,
    required this.title,
    required this.subtitle,
    required this.matches,
    this.onRestart,
    this.restartLabel = 'Start over',
  });

  final ScrollController controller;
  final String title;
  final String subtitle;
  final List<Match> matches;
  final VoidCallback? onRestart;
  final String restartLabel;

  @override
  Widget build(BuildContext context) {
    if (matches.isEmpty) {
      return EmptyState(
        icon: Icons.search_off,
        title: 'Nothing matched',
        body:
            'Try fewer words, or let us ask you a couple of questions instead.',
        action: Builder(
          builder: (buttonContext) => FilledButton(
            onPressed: () {
              final root = Navigator.of(buttonContext).context;
              Navigator.of(buttonContext).pop();
              openAssistant(root, AssistantMode.guide);
            },
            child: const Text('Help me choose'),
          ),
        ),
      );
    }

    return ListView(
      controller: controller,
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
      children: [
        Text(title, style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 4),
        Text(subtitle,
            style: const TextStyle(
                fontSize: 13, height: 1.42, color: AppColors.ink700)),
        const SizedBox(height: 16),
        for (final match in matches) ...[
          _MatchRow(match: match),
          const SizedBox(height: 10),
        ],
        const SizedBox(height: 6),
        const _Helpful(),
        const SizedBox(height: 16),
        if (onRestart != null)
          OutlinedButton.icon(
            onPressed: onRestart,
            icon: const Icon(Icons.refresh, size: 17),
            label: Text(restartLabel),
          ),
      ],
    );
  }
}

class _MatchRow extends StatelessWidget {
  const _MatchRow({required this.match});
  final Match match;

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(Radii.md),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: AppColors.ink950.withValues(alpha: 0.025),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ProductScene(
              glyph: match.product.glyph, tone: match.product.tone, size: 68),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  match.product.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                      fontSize: 13.8,
                      fontWeight: FontWeight.w800,
                      height: 1.26,
                      color: AppColors.ink950),
                ),
                const SizedBox(height: 4),
                RatingRow(rating: match.product.rating),
                const SizedBox(height: 6),
                PriceRow(price: match.product.price, mrp: match.product.mrp),
                const SizedBox(height: 8),
                ReasonChip(text: match.reason),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Column(
            children: [
              IconButton(
                tooltip: 'View product',
                icon: const Icon(Icons.chevron_right, size: 20),
                onPressed: () {
                  // Capture the navigator before the sheet closes.
                  final navigator = Navigator.of(context);
                  navigator.pop();
                  navigator.push(
                    MaterialPageRoute(
                        builder: (_) => ProductScreen(product: match.product)),
                  );
                },
              ),
              IconButton(
                tooltip: 'Add to cart',
                icon: const Icon(Icons.add_shopping_cart_outlined, size: 18),
                onPressed: () {
                  state.addToCart(match.product, match.product.variants.first);
                  showToast(context, 'Added to cart',
                      detail: match.product.name);
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Was this useful? A low rating asks what was wrong rather than thanking you.
class _Helpful extends StatefulWidget {
  const _Helpful();

  @override
  State<_Helpful> createState() => _HelpfulState();
}

class _HelpfulState extends State<_Helpful> {
  bool? _up;
  String? _reason;

  @override
  Widget build(BuildContext context) {
    if (_up == true) {
      return Text('Thanks — noted.',
          style: Theme.of(context).textTheme.bodySmall);
    }

    if (_up == false) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('What was off?', style: Theme.of(context).textTheme.bodySmall),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final reason in [
                'Too expensive',
                'Wrong style',
                'Wrong brand',
                'Not relevant'
              ])
                ChoiceChip(
                  label: Text(reason),
                  selected: _reason == reason,
                  onSelected: (_) => setState(() => _reason = reason),
                ),
            ],
          ),
          if (_reason != null)
            Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Text("Thanks — I'll weight that next time.",
                  style: Theme.of(context).textTheme.bodySmall),
            ),
        ],
      );
    }

    return Row(
      children: [
        Text('Useful?', style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(width: 8),
        IconButton(
          tooltip: 'These suggestions were useful',
          onPressed: () => setState(() => _up = true),
          icon: const Icon(Icons.thumb_up_outlined, size: 17),
        ),
        IconButton(
          tooltip: 'These suggestions were not useful',
          onPressed: () => setState(() => _up = false),
          icon: const Icon(Icons.thumb_down_outlined, size: 17),
        ),
      ],
    );
  }
}
