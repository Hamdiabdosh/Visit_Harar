import 'package:flutter/material.dart';

import '../constants/attraction_styles.dart';
import '../theme/app_theme.dart';

class CategoryBadge extends StatelessWidget {
  const CategoryBadge({
    super.key,
    required this.label,
    this.compact = false,
  });

  final String label;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final palette = categoryPalette(label);
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 3 : 4,
      ),
      decoration: BoxDecoration(
        color: palette.background,
        borderRadius: BorderRadius.circular(AppRadius.chip),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: palette.foreground,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.2,
              fontSize: compact ? 10 : 11,
            ),
      ),
    );
  }
}

/// Semi-transparent pill for overlays on photos.
class ImageOverlayLabel extends StatelessWidget {
  const ImageOverlayLabel({super.key, required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.45),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label.toUpperCase(),
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.8,
              fontSize: 10,
            ),
      ),
    );
  }
}

class StatusBadge extends StatelessWidget {
  const StatusBadge({
    super.key,
    required this.label,
    required this.positive,
  });

  final String label;
  final bool positive;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: positive
            ? AppColors.brand.withValues(alpha: 0.12)
            : AppColors.border.withValues(alpha: 0.8),
        borderRadius: BorderRadius.circular(AppRadius.chip),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: positive ? AppColors.brand : AppColors.inkMuted,
              fontWeight: FontWeight.w600,
              fontSize: 10,
            ),
      ),
    );
  }
}
