import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../storage/favorites_storage.dart';

final favoritesProvider =
    AsyncNotifierProvider<FavoritesNotifier, List<FavoriteEntry>>(
  FavoritesNotifier.new,
);

final isFavoriteProvider = FutureProvider.family<bool, String>((ref, slug) async {
  ref.watch(favoritesProvider);
  return FavoritesStorage.isFavorite(slug);
});

class FavoritesNotifier extends AsyncNotifier<List<FavoriteEntry>> {
  @override
  Future<List<FavoriteEntry>> build() => FavoritesStorage.getAll();

  Future<bool> toggle({
    required String slug,
    required String title,
    required String category,
  }) async {
    final favorited = await FavoritesStorage.toggle(
      slug: slug,
      title: title,
      category: category,
    );
    state = AsyncData(await FavoritesStorage.getAll());
    return favorited;
  }

  Future<void> remove(String slug) async {
    await FavoritesStorage.remove(slug);
    state = AsyncData(await FavoritesStorage.getAll());
  }
}
