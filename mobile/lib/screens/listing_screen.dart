import 'package:flutter/material.dart';

import '../data/catalog.dart';
import '../theme/app_theme.dart';
import '../widgets/common.dart';
import '../widgets/product_card.dart';

/// Category listing and search results are the same screen — only the preset
/// filters differ, which is how the web build does it too.
class ListingScreen extends StatefulWidget {
  const ListingScreen({super.key, this.category, this.maxPrice, this.query});

  final String? category;
  final int? maxPrice;
  final String? query;

  @override
  State<ListingScreen> createState() => _ListingScreenState();
}

enum _Sort { relevance, priceLow, priceHigh, rating }

class _ListingScreenState extends State<ListingScreen> {
  late String? _category = widget.category;
  late int? _maxPrice = widget.maxPrice;
  _Sort _sort = _Sort.relevance;
  bool _inStockOnly = false;

  List<Product> get _results {
    var list = products.where((product) {
      if (_category != null && product.category != _category) return false;
      if (_maxPrice != null && product.price > _maxPrice!) return false;
      if (_inStockOnly && product.stock == 0) return false;
      if (widget.query != null && widget.query!.isNotEmpty) {
        final haystack = '${product.name} ${product.brand} ${product.category}'
            .toLowerCase();
        if (!haystack.contains(widget.query!.toLowerCase())) return false;
      }
      return true;
    }).toList();

    switch (_sort) {
      case _Sort.priceLow:
        list.sort((a, b) => a.price.compareTo(b.price));
      case _Sort.priceHigh:
        list.sort((a, b) => b.price.compareTo(a.price));
      case _Sort.rating:
        list.sort((a, b) => b.rating.compareTo(a.rating));
      case _Sort.relevance:
        break;
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final results = _results;

    return Scaffold(
      appBar: AppBar(
        title: Text(
            widget.query != null ? 'Results' : _category ?? 'All products'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(52),
          child: SizedBox(
            height: 52,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                _FilterChip(
                  label: _sortLabel,
                  icon: Icons.swap_vert,
                  onTap: _pickSort,
                ),
                _FilterChip(
                  label: _category ?? 'Category',
                  selected: _category != null,
                  onTap: _pickCategory,
                  onClear: _category == null
                      ? null
                      : () => setState(() => _category = null),
                ),
                _FilterChip(
                  label: _maxPrice == null
                      ? 'Budget'
                      : 'Under ${money(_maxPrice!)}',
                  selected: _maxPrice != null,
                  onTap: _pickBudget,
                  onClear: _maxPrice == null
                      ? null
                      : () => setState(() => _maxPrice = null),
                ),
                _FilterChip(
                  label: 'In stock',
                  selected: _inStockOnly,
                  onTap: () => setState(() => _inStockOnly = !_inStockOnly),
                ),
              ],
            ),
          ),
        ),
      ),
      body: results.isEmpty
          ? EmptyState(
              icon: Icons.search_off,
              title: 'No products found',
              body:
                  'Nothing matches these filters. Try widening your price range.',
              action: OutlinedButton(
                onPressed: () => setState(() {
                  _category = null;
                  _maxPrice = null;
                  _inStockOnly = false;
                }),
                child: const Text('Clear filters'),
              ),
            )
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
                  child: Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      '${results.length} ${results.length == 1 ? 'product' : 'products'}',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ),
                ),
                Expanded(
                  child: GridView.builder(
                    padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.48,
                    ),
                    itemCount: results.length,
                    itemBuilder: (context, index) =>
                        ProductCard(product: results[index]),
                  ),
                ),
              ],
            ),
    );
  }

  String get _sortLabel => switch (_sort) {
        _Sort.relevance => 'Sort',
        _Sort.priceLow => 'Price: low to high',
        _Sort.priceHigh => 'Price: high to low',
        _Sort.rating => 'Top rated',
      };

  void _pickSort() {
    showModalBottomSheet<void>(
      context: context,
      builder: (sheetContext) => SafeArea(
        child: RadioGroup<_Sort>(
          groupValue: _sort,
          onChanged: (value) {
            if (value == null) return;
            setState(() => _sort = value);
            Navigator.of(sheetContext).pop();
          },
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              for (final option in _Sort.values)
                RadioListTile<_Sort>(
                  value: option,
                  title: Text(switch (option) {
                    _Sort.relevance => 'Relevance',
                    _Sort.priceLow => 'Price: low to high',
                    _Sort.priceHigh => 'Price: high to low',
                    _Sort.rating => 'Top rated',
                  }),
                ),
            ],
          ),
        ),
      ),
    );
  }

  void _pickCategory() {
    showModalBottomSheet<void>(
      context: context,
      builder: (_) => SafeArea(
        child: ListView(
          shrinkWrap: true,
          children: [
            for (final category in categories)
              ListTile(
                leading: ProductScene(
                    glyph: category.glyph, tone: category.tone, size: 36),
                title: Text(category.label),
                trailing: _category == category.label
                    ? const Icon(Icons.check, color: AppColors.brand)
                    : null,
                onTap: () {
                  setState(() => _category = category.label);
                  Navigator.of(context).pop();
                },
              ),
          ],
        ),
      ),
    );
  }

  void _pickBudget() {
    showModalBottomSheet<void>(
      context: context,
      builder: (_) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (final band in budgetBands)
              ListTile(
                title: Text(band.label),
                trailing: _maxPrice == band.max
                    ? const Icon(Icons.check, color: AppColors.brand)
                    : null,
                onTap: () {
                  setState(() => _maxPrice = band.max);
                  Navigator.of(context).pop();
                },
              ),
          ],
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  const _FilterChip(
      {required this.label,
      required this.onTap,
      this.selected = false,
      this.icon,
      this.onClear});

  final String label;
  final VoidCallback onTap;
  final bool selected;
  final IconData? icon;
  final VoidCallback? onClear;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8, top: 8, bottom: 8),
      child: InkWell(
        borderRadius: BorderRadius.circular(Radii.pill),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: selected ? AppColors.brandSoft : AppColors.surface,
            borderRadius: BorderRadius.circular(Radii.pill),
            border: Border.all(
                color: selected ? AppColors.brand : AppColors.border),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 15, color: AppColors.ink500),
                const SizedBox(width: 5)
              ],
              Text(
                label,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: selected ? AppColors.brand : AppColors.ink700,
                ),
              ),
              if (onClear != null) ...[
                const SizedBox(width: 5),
                GestureDetector(
                  onTap: onClear,
                  child:
                      const Icon(Icons.close, size: 14, color: AppColors.brand),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
