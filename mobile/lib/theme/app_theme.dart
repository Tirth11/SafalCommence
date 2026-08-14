import 'package:flutter/material.dart';

/// The same design tokens as the web app, so the two read as one product:
/// a purple brand, near-black ink, teal for good news, gold for warnings.
class AppColors {
  static const brand = Color(0xFF543BCB);
  static const brandDark = Color(0xFF3F2BA6);
  static const brandSoft = Color(0xFFEFECFC);

  static const ink950 = Color(0xFF0B0A12);
  static const ink900 = Color(0xFF16151F);
  static const ink700 = Color(0xFF3F3D4E);
  static const ink500 = Color(0xFF6E6B80);
  static const ink400 = Color(0xFF908DA1);
  static const ink200 = Color(0xFFE2E0EA);
  static const ink100 = Color(0xFFF1F0F5);

  static const teal = Color(0xFF14827C);
  static const tealSoft = Color(0xFFE6F4F2);
  static const gold = Color(0xFFB4801A);
  static const goldSoft = Color(0xFFFCF3E2);
  static const danger = Color(0xFFC0362C);

  static const surface = Color(0xFFFFFFFF);
  static const canvas = Color(0xFFFAFAFC);
  static const border = Color(0xFFE7E5EE);
}

/// Corner radii, matching the web's 8 / 12 / 16 / 24 scale.
class Radii {
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const pill = 999.0;
}

ThemeData buildAppTheme() {
  final base = ThemeData.light(useMaterial3: true);

  return base.copyWith(
    scaffoldBackgroundColor: AppColors.canvas,
    colorScheme: base.colorScheme.copyWith(
      primary: AppColors.brand,
      onPrimary: Colors.white,
      surface: AppColors.surface,
      onSurface: AppColors.ink900,
      error: AppColors.danger,
    ),
    textTheme: base.textTheme
        .apply(bodyColor: AppColors.ink900, displayColor: AppColors.ink950)
        .copyWith(
          headlineLarge: const TextStyle(fontSize: 30, height: 1.1, fontWeight: FontWeight.w700, letterSpacing: -0.8),
          headlineMedium: const TextStyle(fontSize: 24, height: 1.15, fontWeight: FontWeight.w700, letterSpacing: -0.6),
          titleLarge: const TextStyle(fontSize: 19, fontWeight: FontWeight.w700, letterSpacing: -0.3),
          titleMedium: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          bodyMedium: const TextStyle(fontSize: 14, height: 1.45),
          bodySmall: TextStyle(fontSize: 12, height: 1.4, color: AppColors.ink500),
        ),
    appBarTheme: const AppBarTheme(
      backgroundColor: AppColors.surface,
      foregroundColor: AppColors.ink950,
      elevation: 0,
      scrolledUnderElevation: 0.5,
      centerTitle: false,
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.brand,
        foregroundColor: Colors.white,
        minimumSize: const Size(0, 48),
        padding: const EdgeInsets.symmetric(horizontal: 20),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.md)),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.ink900,
        minimumSize: const Size(0, 48),
        side: const BorderSide(color: AppColors.border),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.md)),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.brand,
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: AppColors.surface,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      hintStyle: const TextStyle(color: AppColors.ink400, fontSize: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Radii.md),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Radii.md),
        borderSide: const BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(Radii.md),
        borderSide: const BorderSide(color: AppColors.brand, width: 1.6),
      ),
    ),
    dividerTheme: const DividerThemeData(color: AppColors.border, thickness: 1, space: 1),
    chipTheme: base.chipTheme.copyWith(
      backgroundColor: AppColors.surface,
      side: const BorderSide(color: AppColors.border),
      labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.ink700),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(Radii.pill)),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: AppColors.surface,
      selectedItemColor: AppColors.brand,
      unselectedItemColor: AppColors.ink400,
      type: BottomNavigationBarType.fixed,
      showUnselectedLabels: true,
    ),
  );
}

/// One place decides how money looks, exactly as `money()` does on the web.
String money(num value) {
  final whole = value.round();
  final digits = whole.abs().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 == 0) buffer.write(',');
    buffer.write(digits[i]);
  }
  return '${whole < 0 ? '-' : ''}\$$buffer';
}

int discountPercent(num mrp, num price) => mrp <= 0 ? 0 : (((mrp - price) / mrp) * 100).round();
