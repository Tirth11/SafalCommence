import 'package:flutter/material.dart';

import '../data/catalog.dart';
import '../data/commerce.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import 'product_screen.dart';

/// The shopping assistant, in plain English.
///
/// Three doors, one room: answer two questions, show a photo, or type what
/// you want. Every path ends at the same short list, each item carrying one
/// line saying why it's there. The word "AI" appears nowhere in the UI — the
/// help is the feature, not the technology behind it.
enum AssistantMode { guide, photo, search }

Future<void> openAssistant(BuildContext context, AssistantMode mode, {String query = ''}) {
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
      decoration: BoxDecoration(color: AppColors.ink200, borderRadius: BorderRadius.circular(Radii.pill)),
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
        title: 'We found ${matches.length} good ${matches.length == 1 ? 'option' : 'options'} for you',
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
        Row(
          children: [
            const Icon(Icons.auto_awesome, size: 15, color: AppColors.brand),
            const SizedBox(width: 6),
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
          style: Theme.of(context).textTheme.bodySmall,
        ),
        const SizedBox(height: 20),
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 2.6,
          children: [
            for (final option in step.options)
              OutlinedButton(
                onPressed: () => setState(() {
                  _answers[step.id] = option.value;
                  _step += 1;
                }),
                child: Text(option.label, textAlign: TextAlign.center),
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
    if (category != null && category != 'any') bits.add(category.toLowerCase());
    if (budget != null && budget != 'any') bits.add('under ${money(int.parse(budget))}');
    if (priority != null) bits.add('good ${priority == 'portable' ? 'for travel' : priority}');
    return bits.isEmpty ? 'Based on what you told us' : 'Based on: ${bits.join(' · ')}';
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
              style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 1.1, color: AppColors.brand),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text('Seen something you like?', style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 6),
        Text(
          "Upload a photo and we'll find similar products from our sellers.",
          style: Theme.of(context).textTheme.bodySmall,
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
                        child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.brand),
                      ),
                      SizedBox(height: 14),
                      Text('Looking for matches…', style: TextStyle(fontWeight: FontWeight.w600)),
                    ],
                  )
                : const Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add_photo_alternate_outlined, size: 34, color: AppColors.ink400),
                      SizedBox(height: 12),
                      Text('Take or upload a photo', style: TextStyle(fontWeight: FontWeight.w600)),
                      SizedBox(height: 4),
                      Text('JPG or PNG', style: TextStyle(fontSize: 12, color: AppColors.ink500)),
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
        color: AppColors.brandSoft.withOpacity(0.45),
        borderRadius: BorderRadius.circular(Radii.lg),
        border: Border.all(color: AppColors.brand.withOpacity(0.30), width: 1.5),
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
        body: 'Try fewer words, or let us ask you a couple of questions instead.',
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
        Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
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
        borderRadius: BorderRadius.circular(Radii.md),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ProductScene(glyph: match.product.glyph, tone: match.product.tone, size: 68),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  match.product.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, height: 1.3),
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
                    MaterialPageRoute(builder: (_) => ProductScreen(product: match.product)),
                  );
                },
              ),
              IconButton(
                tooltip: 'Add to cart',
                icon: const Icon(Icons.add_shopping_cart_outlined, size: 18),
                onPressed: () {
                  state.addToCart(match.product, match.product.variants.first);
                  showToast(context, 'Added to cart', detail: match.product.name);
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
      return Text('Thanks — noted.', style: Theme.of(context).textTheme.bodySmall);
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
              for (final reason in ['Too expensive', 'Wrong style', 'Wrong brand', 'Not relevant'])
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
              child: Text("Thanks — I'll weight that next time.", style: Theme.of(context).textTheme.bodySmall),
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
