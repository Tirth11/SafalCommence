import 'package:flutter/material.dart';

import 'data/catalog.dart';
import 'screens/account_screen.dart';
import 'screens/assistant_sheet.dart';
import 'screens/cart_screen.dart';
import 'screens/home_screen.dart';
import 'screens/listing_screen.dart';
import 'screens/search_screen.dart';
import 'screens/seller/seller_shell.dart';
import 'state/app_state.dart';
import 'theme/app_theme.dart';
import 'widgets/common.dart';

void main() => runApp(const SafalMarketApp());

class SafalMarketApp extends StatefulWidget {
  const SafalMarketApp({super.key});

  @override
  State<SafalMarketApp> createState() => _SafalMarketAppState();
}

class _SafalMarketAppState extends State<SafalMarketApp> {
  final _state = AppState();

  @override
  void dispose() {
    _state.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppScope(
      state: _state,
      child: MaterialApp(
        title: 'SafalMarket',
        debugShowCheckedModeBanner: false,
        theme: buildAppTheme(),
        home: const RootShell(),
      ),
    );
  }
}

/// Bottom navigation: Home · Categories · Search · Cart · Account.
/// Five destinations, the ones a shopper reaches for on a phone.
class RootShell extends StatefulWidget {
  const RootShell({super.key});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int _index = 0;

  void _openTab(int index) => setState(() => _index = index);

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);

    // One account, two portals. Switching is a state change, never a login.
    if (state.sellingMode) return const SellerShell();

    final pages = [
      HomeScreen(onOpenTab: _openTab),
      const _CategoriesTab(),
      const SearchScreen(),
      const SizedBox.shrink(), // cart has its own Scaffold below
      const AccountScreen(),
    ];

    // The cart tab brings its own Scaffold; the rest share this one.
    if (_index == 3) {
      return Scaffold(
        body: const CartScreen(),
        bottomNavigationBar: _bottomBar(state.cartCount),
      );
    }

    return Scaffold(
      appBar: _index == 0
          ? AppBar(
              titleSpacing: 16,
              title: const _Wordmark(),
              actions: [
                IconButton(
                  tooltip: 'Wishlist',
                  icon: const Icon(Icons.favorite_border),
                  onPressed: () => _openTab(4),
                ),
                IconButton(
                  tooltip: 'Cart',
                  icon: Badge(
                    isLabelVisible: state.cartCount > 0,
                    label: Text('${state.cartCount}'),
                    child: const Icon(Icons.shopping_bag_outlined),
                  ),
                  onPressed: () => _openTab(3),
                ),
                const SizedBox(width: 4),
              ],
            )
          : AppBar(
              title: Text(
                  ['', 'Categories', 'Search', 'Cart', 'Account'][_index])),
      body: IndexedStack(index: _index, children: pages),
      floatingActionButton: _index == 0
          ? FloatingActionButton.extended(
              backgroundColor: AppColors.ink950,
              foregroundColor: Colors.white,
              onPressed: () => openAssistant(context, AssistantMode.chat),
              icon: const Icon(Icons.auto_awesome, size: 18),
              label: const Text('SafalAI'),
            )
          : null,
      bottomNavigationBar: _bottomBar(state.cartCount),
    );
  }

  Widget _bottomBar(int cartCount) {
    return BottomNavigationBar(
      currentIndex: _index,
      onTap: _openTab,
      items: [
        const BottomNavigationBarItem(
            icon: Icon(Icons.home_outlined),
            activeIcon: Icon(Icons.home),
            label: 'Home'),
        const BottomNavigationBarItem(
            icon: Icon(Icons.grid_view_outlined),
            activeIcon: Icon(Icons.grid_view),
            label: 'Categories'),
        const BottomNavigationBarItem(
            icon: Icon(Icons.search), label: 'Search'),
        BottomNavigationBarItem(
          icon: Badge(
            isLabelVisible: cartCount > 0,
            label: Text('$cartCount'),
            child: const Icon(Icons.shopping_bag_outlined),
          ),
          label: 'Cart',
        ),
        const BottomNavigationBarItem(
            icon: Icon(Icons.person_outline),
            activeIcon: Icon(Icons.person),
            label: 'Account'),
      ],
    );
  }
}

class _Wordmark extends StatelessWidget {
  const _Wordmark();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'SafalMarket',
      image: true,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Image.asset(
            'assets/brand/safalmarket-mark.png',
            width: 36,
            height: 36,
            fit: BoxFit.contain,
            filterQuality: FilterQuality.high,
          ),
          const SizedBox(width: 8),
          Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Image.asset(
                'assets/brand/safalmarket-wordmark.png',
                height: 18,
                fit: BoxFit.contain,
                filterQuality: FilterQuality.high,
              ),
              const SizedBox(height: 2),
              const _BrandTagline(),
            ],
          ),
        ],
      ),
    );
  }
}

class _BrandTagline extends StatelessWidget {
  const _BrandTagline();

  @override
  Widget build(BuildContext context) {
    return const Text.rich(
      TextSpan(
        children: [
          TextSpan(text: 'List.'),
          TextSpan(text: 'Discover.', style: TextStyle(color: AppColors.brand)),
          TextSpan(text: 'Connect'),
        ],
      ),
      style: TextStyle(
        color: AppColors.brandDark,
        fontSize: 8.5,
        fontWeight: FontWeight.w900,
        height: 1,
        letterSpacing: -0.2,
      ),
    );
  }
}

/// Categories tab — the full grid, with subcategory counts.
class _CategoriesTab extends StatelessWidget {
  const _CategoriesTab();

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.95,
      ),
      itemCount: categories.length,
      itemBuilder: (context, index) {
        final category = categories[index];
        return InkWell(
          borderRadius: BorderRadius.circular(Radii.lg),
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(
                builder: (_) => ListingScreen(category: category.label)),
          ),
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(Radii.lg),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: ProductScene(
                      glyph: category.glyph,
                      tone: category.tone,
                      radius: Radii.md),
                ),
                const SizedBox(height: 10),
                Text(category.label,
                    style: const TextStyle(
                        fontSize: 14, fontWeight: FontWeight.w600)),
                Text('${category.count} items',
                    style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
          ),
        );
      },
    );
  }
}
