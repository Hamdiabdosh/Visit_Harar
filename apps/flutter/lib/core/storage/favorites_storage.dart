import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

const _favoritesKey = 'favorite_attractions_v1';

class FavoriteEntry {
  const FavoriteEntry({
    required this.slug,
    required this.title,
    required this.category,
    required this.savedAt,
  });

  final String slug;
  final String title;
  final String category;
  final String savedAt;

  Map<String, dynamic> toJson() => {
        'slug': slug,
        'title': title,
        'category': category,
        'savedAt': savedAt,
      };

  factory FavoriteEntry.fromJson(Map<String, dynamic> json) {
    return FavoriteEntry(
      slug: json['slug'] as String,
      title: json['title'] as String,
      category: json['category'] as String,
      savedAt: json['savedAt'] as String,
    );
  }
}

abstract final class FavoritesStorage {
  static Future<List<FavoriteEntry>> getAll() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_favoritesKey);
    if (raw == null) return [];
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      return list
          .map((e) => FavoriteEntry.fromJson(e as Map<String, dynamic>))
          .toList()
        ..sort((a, b) => b.savedAt.compareTo(a.savedAt));
    } catch (_) {
      return [];
    }
  }

  static Future<bool> isFavorite(String slug) async {
    final items = await getAll();
    return items.any((e) => e.slug == slug);
  }

  /// Returns true if now favorited.
  static Future<bool> toggle({
    required String slug,
    required String title,
    required String category,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final items = await getAll();
    final index = items.indexWhere((e) => e.slug == slug);
    if (index >= 0) {
      items.removeAt(index);
      await _save(prefs, items);
      return false;
    }
    items.insert(
      0,
      FavoriteEntry(
        slug: slug,
        title: title,
        category: category,
        savedAt: DateTime.now().toUtc().toIso8601String(),
      ),
    );
    await _save(prefs, items);
    return true;
  }

  static Future<void> remove(String slug) async {
    final prefs = await SharedPreferences.getInstance();
    final items = await getAll();
    await _save(prefs, items.where((e) => e.slug != slug).toList());
  }

  static Future<void> _save(
    SharedPreferences prefs,
    List<FavoriteEntry> items,
  ) async {
    await prefs.setString(
      _favoritesKey,
      jsonEncode(items.map((e) => e.toJson()).toList()),
    );
  }
}
