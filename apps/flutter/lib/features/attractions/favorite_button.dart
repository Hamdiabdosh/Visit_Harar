import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/models.dart';
import '../../core/providers/favorites_provider.dart';

class FavoriteButton extends ConsumerWidget {
  const FavoriteButton({super.key, required this.attraction});

  final AttractionSummary attraction;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favorites = ref.watch(favoritesProvider).valueOrNull ?? [];
    final isFavorite = favorites.any((e) => e.slug == attraction.slug);

    return IconButton(
      tooltip: isFavorite ? 'Remove from saved' : 'Save place',
      onPressed: () async {
        await ref.read(favoritesProvider.notifier).toggle(
              slug: attraction.slug,
              title: attraction.title,
              category: attraction.category,
            );
      },
      icon: Icon(
        isFavorite ? Icons.favorite : Icons.favorite_border,
        color: isFavorite ? Colors.red.shade400 : null,
      ),
    );
  }
}
