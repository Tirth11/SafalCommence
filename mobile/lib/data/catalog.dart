import 'package:flutter/material.dart';

/// Product artwork is generated rather than photographed, same as the web —
/// a glyph on a soft gradient. It keeps the mockup honest: no stock imagery
/// pretending to be a real catalogue.
enum Glyph { headphones, watch, shirt, lamp, bottle, dumbbell, bag, charger }

enum Tone { brand, teal, gold, ink }

IconData iconFor(Glyph glyph) {
  switch (glyph) {
    case Glyph.headphones:
      return Icons.headphones_outlined;
    case Glyph.watch:
      return Icons.watch_outlined;
    case Glyph.shirt:
      return Icons.checkroom_outlined;
    case Glyph.lamp:
      return Icons.light_outlined;
    case Glyph.bottle:
      return Icons.water_drop_outlined;
    case Glyph.dumbbell:
      return Icons.fitness_center_outlined;
    case Glyph.bag:
      return Icons.backpack_outlined;
    case Glyph.charger:
      return Icons.power_outlined;
  }
}

class Product {
  const Product({
    required this.id,
    required this.name,
    required this.brand,
    required this.seller,
    required this.category,
    required this.glyph,
    required this.tone,
    required this.mrp,
    required this.price,
    required this.rating,
    required this.reviews,
    required this.stock,
    required this.deliveryDays,
    required this.shortDescription,
    required this.highlights,
    required this.variants,
    this.badge,
  });

  final String id;
  final String name;
  final String brand;
  final String seller;
  final String category;
  final Glyph glyph;
  final Tone tone;
  final int mrp;
  final int price;
  final double rating;
  final int reviews;
  final int stock;
  final String deliveryDays;
  final String shortDescription;
  final List<String> highlights;
  final List<String> variants;
  final String? badge;
}

const products = <Product>[
  Product(
    id: 'SH-P-1042',
    name: 'Wireless Noise Cancelling Headphones',
    brand: 'SoundPro',
    seller: 'ABC Electronics',
    category: 'Electronics',
    glyph: Glyph.headphones,
    tone: Tone.brand,
    mrp: 87,
    price: 62,
    rating: 4.6,
    reviews: 214,
    stock: 24,
    deliveryDays: '3–5 days',
    shortDescription: 'Over-ear headphones with hybrid ANC and a 40-hour battery.',
    highlights: ['Hybrid active noise cancelling', '40-hour battery', 'Multipoint Bluetooth 5.3', 'Foldable travel case'],
    variants: ['Black', 'Sand', 'Navy'],
    badge: 'Bestseller',
  ),
  Product(
    id: 'SH-P-1044',
    name: 'Titanium Smartwatch — Series 4',
    brand: 'Kairo',
    seller: 'GadgetHub Retail',
    category: 'Electronics',
    glyph: Glyph.watch,
    tone: Tone.ink,
    mrp: 160,
    price: 120,
    rating: 4.4,
    reviews: 128,
    stock: 11,
    deliveryDays: '2–4 days',
    shortDescription: 'Titanium case, seven-day battery and a bright always-on display.',
    highlights: ['Titanium case', '7-day battery', 'Always-on display', 'Water resistant to 50 m'],
    variants: ['46 mm · Titanium', '42 mm · Graphite'],
  ),
  Product(
    id: 'SH-P-1046',
    name: 'Premium Cotton Oversized Shirt',
    brand: 'Urban Threads',
    seller: 'Urban Threads',
    category: 'Fashion',
    glyph: Glyph.shirt,
    tone: Tone.teal,
    mrp: 31,
    price: 16,
    rating: 4.7,
    reviews: 342,
    stock: 60,
    deliveryDays: '3–5 days',
    shortDescription: 'Breathable cotton that survives a full day.',
    highlights: ['100% combed cotton', 'Relaxed fit', 'Pre-shrunk', 'Machine washable'],
    variants: ['S', 'M', 'L', 'XL'],
  ),
  Product(
    id: 'SH-P-1048',
    name: 'Ceramic Table Lamp with Linen Shade',
    brand: 'HomeCraft',
    seller: 'HomeCraft Studio',
    category: 'Home & Living',
    glyph: Glyph.lamp,
    tone: Tone.gold,
    mrp: 44,
    price: 31,
    rating: 4.5,
    reviews: 87,
    stock: 18,
    deliveryDays: '4–6 days',
    shortDescription: 'Warm light and a hand-finished ceramic base.',
    highlights: ['Hand-finished ceramic', 'Linen shade', 'Warm 2700K bulb included', 'Inline dimmer'],
    variants: ['Sand', 'Slate'],
  ),
  Product(
    id: 'SH-P-1050',
    name: 'Vitamin C Brightening Face Serum',
    brand: 'GlowKart',
    seller: 'GlowKart',
    category: 'Beauty',
    glyph: Glyph.bottle,
    tone: Tone.brand,
    mrp: 24,
    price: 14,
    rating: 4.3,
    reviews: 496,
    stock: 120,
    deliveryDays: '2–4 days',
    shortDescription: 'A daily-use serum at an easy price.',
    highlights: ['10% vitamin C', 'Fragrance free', 'Suitable for daily use', '30 ml'],
    variants: ['30 ml'],
  ),
  Product(
    id: 'SH-P-1052',
    name: 'Adjustable Dumbbell Set — 20 kg',
    brand: 'IronCore',
    seller: 'FitZone',
    category: 'Sports',
    glyph: Glyph.dumbbell,
    tone: Tone.ink,
    mrp: 120,
    price: 79,
    rating: 4.4,
    reviews: 63,
    stock: 9,
    deliveryDays: '5–7 days',
    shortDescription: 'Replaces a whole rack of fixed weights.',
    highlights: ['2.5–20 kg per side', 'Knurled grip', 'Quick-lock collars', 'Storage tray included'],
    variants: ['20 kg pair'],
  ),
  Product(
    id: 'SH-P-1054',
    name: 'USB-C 65W GaN Charger',
    brand: 'PowerLine',
    seller: 'ABC Electronics',
    category: 'Electronics',
    glyph: Glyph.charger,
    tone: Tone.teal,
    mrp: 37,
    price: 24,
    rating: 4.2,
    reviews: 74,
    stock: 45,
    deliveryDays: '2–3 days',
    shortDescription: 'Charges a laptop from a plug the size of a matchbox.',
    highlights: ['65W power delivery', 'GaN — runs cool', 'Two USB-C, one USB-A', 'Foldable pins'],
    variants: ['White', 'Black'],
  ),
  Product(
    id: 'SH-P-1056',
    name: 'Canvas Travel Backpack 30L',
    brand: 'TrailMark',
    seller: 'TravelGear Store',
    category: 'Accessories',
    glyph: Glyph.bag,
    tone: Tone.teal,
    mrp: 50,
    price: 31,
    rating: 4.5,
    reviews: 203,
    stock: 32,
    deliveryDays: '3–5 days',
    shortDescription: 'Carry-on sized, with a padded laptop sleeve.',
    highlights: ['Fits most cabin limits', 'Padded 15" laptop sleeve', 'Water-resistant canvas', 'Luggage pass-through'],
    variants: ['Olive', 'Black'],
    badge: 'New',
  ),
];

Product productById(String id) => products.firstWhere((p) => p.id == id);

class Category {
  const Category(this.label, this.glyph, this.tone, this.count);
  final String label;
  final Glyph glyph;
  final Tone tone;
  final int count;
}

const categories = <Category>[
  Category('Electronics', Glyph.headphones, Tone.brand, 2410),
  Category('Fashion', Glyph.shirt, Tone.teal, 5120),
  Category('Home & Living', Glyph.lamp, Tone.gold, 1804),
  Category('Beauty', Glyph.bottle, Tone.brand, 962),
  Category('Sports', Glyph.dumbbell, Tone.ink, 741),
  Category('Accessories', Glyph.bag, Tone.teal, 1240),
];

/// People shop by occasion, not by taxonomy — same idea as the web page.
class ShoppingNeed {
  const ShoppingNeed(this.label, this.blurb, this.glyph, this.tone);
  final String label;
  final String blurb;
  final Glyph glyph;
  final Tone tone;
}

const shoppingNeeds = <ShoppingNeed>[
  ShoppingNeed('For Work', 'Laptop kit and desk essentials', Glyph.charger, Tone.brand),
  ShoppingNeed('For Travel', 'Bags, headphones and chargers', Glyph.bag, Tone.teal),
  ShoppingNeed('For Home', 'Everyday things for your place', Glyph.lamp, Tone.gold),
  ShoppingNeed('For Fitness', 'Kit for training days', Glyph.dumbbell, Tone.ink),
];

class BudgetBand {
  const BudgetBand(this.label, this.max);
  final String label;
  final int max;
}

const budgetBands = <BudgetBand>[
  BudgetBand('Under \$25', 25),
  BudgetBand('Under \$50', 50),
  BudgetBand('Under \$100', 100),
  BudgetBand('Under \$200', 200),
];

const searchExamples = <String>[
  'headphones under \$80',
  'birthday gift under \$30',
  'something for a new desk',
];
