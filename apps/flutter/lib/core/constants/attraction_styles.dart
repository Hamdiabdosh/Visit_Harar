import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Category labels aligned with web `src/lib/attraction-styles.ts`.
const attractionCategories = [
  'Heritage',
  'Wildlife',
  'Spiritual',
  'Culture',
  'Shopping',
  'History',
];

bool isAttractionCategory(String value) {
  return attractionCategories.contains(value);
}

class CategoryPalette {
  const CategoryPalette({required this.background, required this.foreground});

  final Color background;
  final Color foreground;
}

CategoryPalette categoryPalette(String category) {
  switch (category) {
    case 'Wildlife':
      return const CategoryPalette(
        background: Color(0xFFFEF3C7),
        foreground: Color(0xFF92400E),
      );
    case 'Spiritual':
      return const CategoryPalette(
        background: Color(0xFFF3E8FF),
        foreground: Color(0xFF6B21A8),
      );
    case 'Culture':
      return const CategoryPalette(
        background: Color(0xFFDBEAFE),
        foreground: Color(0xFF1E40AF),
      );
    case 'Shopping':
      return const CategoryPalette(
        background: Color(0xFFCCFBF1),
        foreground: Color(0xFF115E59),
      );
    case 'History':
      return const CategoryPalette(
        background: Color(0xFFFEE2E2),
        foreground: Color(0xFF991B1B),
      );
    case 'Event':
      return const CategoryPalette(
        background: Color(0xFFFEF3C7),
        foreground: Color(0xFF92400E),
      );
    case 'News':
      return const CategoryPalette(
        background: Color(0xFFDBEAFE),
        foreground: Color(0xFF1E40AF),
      );
    case 'Heritage':
    default:
      return CategoryPalette(
        background: AppColors.brand.withValues(alpha: 0.12),
        foreground: AppColors.brand,
      );
  }
}

LinearGradient categoryGradient(String category) {
  switch (category) {
    case 'Wildlife':
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF78350F), Color(0xFFC2410C), Color(0xFFF59E0B)],
      );
    case 'Spiritual':
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF581C87), Color(0xFF7E22CE), Color(0xFFD946EF)],
      );
    case 'Culture':
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF1E3A8A), Color(0xFF1D4ED8), Color(0xFF38BDF8)],
      );
    case 'Shopping':
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF134E4A), Color(0xFF0F766E), Color(0xFF34D399)],
      );
    case 'History':
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF7F1D1D), Color(0xFFE11D48), Color(0xFFEF4444)],
      );
    case 'Heritage':
    default:
      return const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.brandDark, AppColors.brand, Color(0xFF22D3EE)],
      );
  }
}
