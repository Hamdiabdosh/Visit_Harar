import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Brand tokens — aligned with web and Expo apps.
abstract final class AppColors {
  static const brand = Color(0xFF1A99B1);
  static const brandDark = Color(0xFF0E6B7D);
  static const gold = Color(0xFFF9B200);
  static const goldDark = Color(0xFFD49400);
  static const ink = Color(0xFF1C1917);
  static const inkMuted = Color(0xFF57534E);
  static const surface = Color(0xFFFDF1C7);
  static const border = Color(0xFFE7E5E4);
  static const card = Colors.white;
}

abstract final class AppSpacing {
  static const page = 20.0;
  static const section = 28.0;
  static const cardGap = 16.0;
  static const bottomNav = 96.0;
}

abstract final class AppRadius {
  static const card = 12.0;
  static const button = 10.0;
  static const chip = 999.0;
}

abstract final class AppShadows {
  static List<BoxShadow> get card => [
        BoxShadow(
          color: AppColors.ink.withValues(alpha: 0.06),
          blurRadius: 12,
          offset: const Offset(0, 4),
        ),
      ];

  static List<BoxShadow> get cardHover => [
        BoxShadow(
          color: AppColors.ink.withValues(alpha: 0.1),
          blurRadius: 20,
          offset: const Offset(0, 8),
        ),
      ];
}

TextTheme _buildTextTheme() {
  final sans = GoogleFonts.outfitTextTheme();
  final serif = GoogleFonts.playfairDisplayTextTheme();

  TextStyle? serifStyle(TextStyle? base, TextStyle? fallback) {
    final style = base ?? fallback;
    if (style == null) return null;
    return GoogleFonts.playfairDisplay(textStyle: style);
  }

  return sans.copyWith(
    headlineSmall: serifStyle(
      serif.headlineSmall,
      const TextStyle(
        fontSize: 26,
        fontWeight: FontWeight.w700,
        color: AppColors.ink,
        height: 1.15,
      ),
    ),
    titleLarge: serifStyle(
      serif.titleLarge,
      const TextStyle(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: AppColors.ink,
        height: 1.2,
      ),
    ),
    titleMedium: serifStyle(
      serif.titleMedium,
      const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: AppColors.ink,
        height: 1.25,
      ),
    ),
    titleSmall: sans.titleSmall?.copyWith(
      fontWeight: FontWeight.w600,
      color: AppColors.ink,
    ),
    bodyLarge: sans.bodyLarge?.copyWith(
      fontSize: 16,
      color: AppColors.ink,
      height: 1.5,
    ),
    bodyMedium: sans.bodyMedium?.copyWith(
      fontSize: 14,
      color: AppColors.ink,
      height: 1.45,
    ),
    bodySmall: sans.bodySmall?.copyWith(
      fontSize: 13,
      color: AppColors.inkMuted,
      height: 1.4,
    ),
    labelLarge: sans.labelLarge?.copyWith(
      fontSize: 14,
      fontWeight: FontWeight.w600,
      color: AppColors.ink,
    ),
    labelSmall: sans.labelSmall?.copyWith(
      fontSize: 11,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.5,
      color: AppColors.inkMuted,
    ),
  );
}

ThemeData buildAppTheme() {
  final textTheme = _buildTextTheme();

  final inputBorder = OutlineInputBorder(
    borderRadius: BorderRadius.circular(AppRadius.button),
    borderSide: const BorderSide(color: AppColors.border),
  );

  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.brand,
      primary: AppColors.brand,
      onPrimary: Colors.white,
      secondary: AppColors.gold,
      surface: AppColors.surface,
    ),
    scaffoldBackgroundColor: AppColors.surface,
    textTheme: textTheme,
    appBarTheme: AppBarTheme(
      backgroundColor: AppColors.brand,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: GoogleFonts.outfit(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: Colors.white,
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      height: 68,
      backgroundColor: Colors.white,
      indicatorColor: AppColors.brand.withValues(alpha: 0.12),
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return GoogleFonts.outfit(
          fontSize: 12,
          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
          color: selected ? AppColors.brand : AppColors.inkMuted,
        );
      }),
      iconTheme: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return IconThemeData(
          color: selected ? AppColors.brand : AppColors.inkMuted,
          size: 22,
        );
      }),
    ),
    cardTheme: CardThemeData(
      color: AppColors.card,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.card),
        side: const BorderSide(color: AppColors.border),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: AppColors.brand,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.button),
        ),
        textStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: AppColors.brand,
        side: const BorderSide(color: AppColors.border),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.button),
        ),
        textStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: AppColors.brand,
        textStyle: GoogleFonts.outfit(fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      border: inputBorder,
      enabledBorder: inputBorder,
      focusedBorder: inputBorder.copyWith(
        borderSide: const BorderSide(color: AppColors.brand, width: 2),
      ),
      errorBorder: inputBorder.copyWith(
        borderSide: const BorderSide(color: Colors.red),
      ),
      hintStyle: GoogleFonts.outfit(color: AppColors.inkMuted),
    ),
    progressIndicatorTheme: const ProgressIndicatorThemeData(
      color: AppColors.brand,
    ),
    dividerTheme: const DividerThemeData(
      color: AppColors.border,
      thickness: 1,
    ),
    splashColor: AppColors.brand.withValues(alpha: 0.08),
    highlightColor: AppColors.brand.withValues(alpha: 0.05),
  );
}
