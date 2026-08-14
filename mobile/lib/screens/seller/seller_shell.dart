import 'package:flutter/material.dart';

import '../../data/seller_data.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import 'seller_assistant.dart';
import 'seller_dashboard.dart';
import 'seller_orders.dart';
import 'seller_payments.dart';
import 'seller_products.dart';
import 'seller_promotions.dart';

/// The seller portal.
///
/// Same account as the customer app — switching modes never asks for another
/// login, which is the whole point of the one-account model on the web.
class SellerShell extends StatefulWidget {
  const SellerShell({super.key});

  @override
  State<SellerShell> createState() => _SellerShellState();
}

class _SellerShellState extends State<SellerShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final snapshot = businessSnapshot();

    final pages = [
      const SellerDashboardScreen(),
      const SellerProductsScreen(),
      const SellerOrdersScreen(),
      const SellerPromotionsScreen(),
      const SellerPaymentsScreen(),
    ];

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: Row(
          children: [
            Container(
              width: 30,
              height: 30,
              decoration: BoxDecoration(color: AppColors.brand, borderRadius: BorderRadius.circular(Radii.sm)),
              child: const Icon(Icons.storefront_outlined, size: 17, color: Colors.white),
            ),
            const SizedBox(width: 9),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(sellerName, style: TextStyle(fontSize: 14.5, fontWeight: FontWeight.w700, height: 1.1)),
                  Text('Seller', style: TextStyle(fontSize: 11, color: AppColors.ink500, height: 1.2)),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Switch to shopping',
            icon: const Icon(Icons.swap_horiz),
            onPressed: () => state.setSellingMode(false),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: IndexedStack(index: _index, children: pages),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: AppColors.ink950,
        foregroundColor: Colors.white,
        onPressed: () => openSellerAssistant(context),
        icon: const Icon(Icons.auto_awesome, size: 18),
        label: const Text('Safal Assistant'),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
        items: [
          const BottomNavigationBarItem(
              icon: Icon(Icons.dashboard_outlined), activeIcon: Icon(Icons.dashboard), label: 'Dashboard'),
          const BottomNavigationBarItem(
              icon: Icon(Icons.inventory_2_outlined), activeIcon: Icon(Icons.inventory_2), label: 'Products'),
          BottomNavigationBarItem(
            icon: Badge(
              isLabelVisible: snapshot.pendingOrders > 0,
              label: Text('${snapshot.pendingOrders}'),
              child: const Icon(Icons.receipt_long_outlined),
            ),
            activeIcon: const Icon(Icons.receipt_long),
            label: 'Orders',
          ),
          const BottomNavigationBarItem(
              icon: Icon(Icons.local_offer_outlined), activeIcon: Icon(Icons.local_offer), label: 'Offers'),
          const BottomNavigationBarItem(
              icon: Icon(Icons.account_balance_wallet_outlined),
              activeIcon: Icon(Icons.account_balance_wallet),
              label: 'Payments'),
        ],
      ),
    );
  }
}
