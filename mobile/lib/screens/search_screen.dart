import 'package:flutter/material.dart';

import '../data/catalog.dart';
import '../data/commerce.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import '../widgets/product_card.dart';
import 'assistant_sheet.dart';

/// Search, with the same three doors as the web hero: type it, show a photo,
/// or let us ask. Recent searches and examples sit under the field so an
/// empty box is never a dead end.
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _controller = TextEditingController();
  final _recent = <String>['wireless headphones', 'travel backpack'];
  List<Match> _results = const [];
  bool _searched = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _run(String query) {
    if (query.trim().isEmpty) return;
    setState(() {
      _controller.text = query;
      _results = searchProducts(query, limit: 8);
      _searched = true;
      _recent.remove(query);
      _recent.insert(0, query);
      if (_recent.length > 5) _recent.removeLast();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          color: AppColors.surface,
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
          child: Column(
            children: [
              TextField(
                controller: _controller,
                autofocus: false,
                textInputAction: TextInputAction.search,
                onChanged: (_) => setState(() {}),
                onSubmitted: _run,
                decoration: InputDecoration(
                  hintText: 'Search products, brands or categories',
                  prefixIcon: const Icon(Icons.search, size: 21, color: AppColors.ink400),
                  suffixIcon: _controller.text.isEmpty
                      ? null
                      : IconButton(
                          icon: const Icon(Icons.close, size: 18),
                          onPressed: () => setState(() {
                            _controller.clear();
                            _searched = false;
                            _results = const [];
                          }),
                        ),
                ),
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(minimumSize: const Size(0, 42)),
                      onPressed: () => openAssistant(context, AssistantMode.photo),
                      icon: const Icon(Icons.photo_camera_outlined, size: 17),
                      label: const Text('Photo'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: FilledButton.icon(
                      style: FilledButton.styleFrom(minimumSize: const Size(0, 42)),
                      onPressed: () => openAssistant(context, AssistantMode.guide),
                      icon: const Icon(Icons.auto_awesome, size: 17),
                      label: const Text('Help me choose'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const Divider(height: 1),
        Expanded(child: _searched ? _resultsView() : _suggestionsView()),
      ],
    );
  }

  Widget _suggestionsView() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_recent.isNotEmpty) ...[
          Text('Recent searches', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final term in _recent)
                ActionChip(
                  avatar: const Icon(Icons.history, size: 15, color: AppColors.ink400),
                  label: Text(term),
                  onPressed: () => _run(term),
                ),
            ],
          ),
          const SizedBox(height: 24),
        ],
        Text('Try something like', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final example in searchExamples)
              ActionChip(label: Text('“$example”'), onPressed: () => _run(example)),
          ],
        ),
        const SizedBox(height: 24),
        Text('Browse categories', style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 10),
        for (final category in categories)
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: ProductScene(glyph: category.glyph, tone: category.tone, size: 40),
            title: Text(category.label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
            subtitle: Text('${category.count} items', style: Theme.of(context).textTheme.bodySmall),
            trailing: const Icon(Icons.chevron_right, size: 20, color: AppColors.ink400),
            onTap: () => _run(category.label),
          ),
      ],
    );
  }

  Widget _resultsView() {
    if (_results.isEmpty) {
      return EmptyState(
        icon: Icons.search_off,
        title: 'Nothing matched “${_controller.text}”',
        body: 'Try fewer words, or let us ask you a couple of questions instead.',
        action: FilledButton(
          onPressed: () => openAssistant(context, AssistantMode.guide),
          child: const Text('Help me choose'),
        ),
      );
    }

    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.54,
      ),
      itemCount: _results.length,
      itemBuilder: (context, index) => ProductCard(
        product: _results[index].product,
        reason: _results[index].reason,
      ),
    );
  }
}
