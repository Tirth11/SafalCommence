import 'package:flutter/widgets.dart';

import '../data/catalog.dart';

/// Cart, wishlist and the handful of preferences the screens share.
/// A plain ChangeNotifier — no state library, because a mockup shouldn't
/// need one to be understood.
class CartLine {
  CartLine({required this.productId, required this.variant, this.qty = 1});

  final String productId;
  final String variant;
  int qty;

  String get key => '$productId::$variant';
  Product get product => productById(productId);
  int get lineTotal => product.price * qty;
}

class AppState extends ChangeNotifier {
  final List<CartLine> _lines = [];
  final Set<String> _wishlist = {'SH-P-1056'};
  final Set<String> _savedOffers = {'OF-202'};
  final Set<String> _reminders = {};

  /// Signed out by default, so the app opens on the real first-run experience.
  String? _customerName;

  List<CartLine> get lines => List.unmodifiable(_lines);
  Set<String> get wishlist => Set.unmodifiable(_wishlist);
  Set<String> get savedOffers => Set.unmodifiable(_savedOffers);
  Set<String> get reminders => Set.unmodifiable(_reminders);
  String? get customerName => _customerName;
  bool get isSignedIn => _customerName != null;

  int get cartCount => _lines.fold(0, (sum, line) => sum + line.qty);
  int get subtotal => _lines.fold(0, (sum, line) => sum + line.lineTotal);

  void signIn(String name) {
    _customerName = name;
    notifyListeners();
  }

  void signOut() {
    _customerName = null;
    notifyListeners();
  }

  void addToCart(Product product, String variant, {int qty = 1}) {
    final key = '${product.id}::$variant';
    final existing = _lines.where((line) => line.key == key).toList();
    if (existing.isEmpty) {
      _lines.add(CartLine(productId: product.id, variant: variant, qty: qty));
    } else {
      existing.first.qty += qty;
    }
    notifyListeners();
  }

  void setQty(String key, int qty) {
    if (qty <= 0) {
      _lines.removeWhere((line) => line.key == key);
    } else {
      for (final line in _lines) {
        if (line.key == key) line.qty = qty;
      }
    }
    notifyListeners();
  }

  void removeLine(String key) {
    _lines.removeWhere((line) => line.key == key);
    notifyListeners();
  }

  void clearCart() {
    _lines.clear();
    notifyListeners();
  }

  bool isSaved(String productId) => _wishlist.contains(productId);

  void toggleWishlist(String productId) {
    if (!_wishlist.remove(productId)) _wishlist.add(productId);
    notifyListeners();
  }

  void toggleSavedOffer(String offerId) {
    if (!_savedOffers.remove(offerId)) _savedOffers.add(offerId);
    notifyListeners();
  }

  void toggleReminder(String offerId) {
    if (!_reminders.remove(offerId)) _reminders.add(offerId);
    notifyListeners();
  }
}

/// Exposed through an InheritedNotifier so any screen can read it without a
/// package dependency.
class AppScope extends InheritedNotifier<AppState> {
  const AppScope({super.key, required AppState state, required super.child}) : super(notifier: state);

  static AppState of(BuildContext context) {
    final scope = context.dependOnInheritedWidgetOfExactType<AppScope>();
    assert(scope != null, 'AppScope is missing above this widget');
    return scope!.notifier!;
  }
}
