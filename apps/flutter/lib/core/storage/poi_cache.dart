import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../api/models.dart';

abstract final class PoiCache {
  static const _key = 'map_pois_cache_v1';

  static Future<List<MapPoi>?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return null;
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .map((e) => MapPoi.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  static Future<void> save(List<MapPoi> pois) async {
    final prefs = await SharedPreferences.getInstance();
    final encoded = jsonEncode(
      pois.map((p) => _toJson(p)).toList(),
    );
    await prefs.setString(_key, encoded);
  }

  static Map<String, dynamic> _toJson(MapPoi poi) {
    return {
      'id': poi.id,
      'title': poi.title,
      'slug': poi.slug,
      'category': poi.category,
      if (poi.shortDesc != null) 'short_desc': poi.shortDesc,
      if (poi.image != null) 'image': poi.image,
      if (poi.latitude != null) 'latitude': poi.latitude,
      if (poi.longitude != null) 'longitude': poi.longitude,
      'is_featured': poi.isFeatured,
    };
  }
}
