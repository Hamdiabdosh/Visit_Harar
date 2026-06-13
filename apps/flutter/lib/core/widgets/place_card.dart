import 'package:flutter/material.dart';

import '../constants/attraction_styles.dart';
import 'category_badge.dart';
import 'media_card.dart';

/// Image-first card — mirrors web `AttractionCard`.
class PlaceCard extends StatelessWidget {
  const PlaceCard({
    super.key,
    required this.title,
    required this.onTap,
    this.subtitle,
    this.imageUrl,
    this.category,
    this.imageLabel,
    this.width,
  });

  final String title;
  final String? subtitle;
  final String? imageUrl;
  final String? category;
  final String? imageLabel;
  final VoidCallback onTap;
  final double? width;

  @override
  Widget build(BuildContext context) {
    final cat = category ?? 'Heritage';

    return MediaCard(
      title: title,
      subtitle: subtitle,
      imageUrl: imageUrl,
      imageLabel: imageLabel ?? category,
      fallbackGradient: categoryGradient(cat),
      fallbackIcon: Icons.landscape_outlined,
      trailing: category != null && category!.isNotEmpty
          ? CategoryBadge(label: category!, compact: true)
          : null,
      width: width,
      onTap: onTap,
    );
  }
}
