import 'dart:io';

import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../constants/geo.dart';
import 'tile_utils.dart';

/// OSM tile usage policy — identify the app.
const osmUserAgent =
    'VisitHararFlutter/0.1 (Harari Tourism Commission; +https://visitharar.et)';

const _offlineKey = 'offline_map_ready_v1';
const _offlineZooms = [14, 15, 16];

enum OfflineMapPhase { idle, downloading, complete, error }

class OfflineMapProgress {
  const OfflineMapProgress({
    required this.done,
    required this.total,
    required this.phase,
    this.error,
  });

  final int done;
  final int total;
  final OfflineMapPhase phase;
  final String? error;
}

abstract final class OfflineMapService {
  static Future<String> _tileDirectory() async {
    final docs = await getApplicationDocumentsDirectory();
    return '${docs.path}/harar-tiles/';
  }

  static List<TileCoordinate> _allOfflineTiles() {
    return _offlineZooms
        .expand(
          (z) => tilesForBounds(
            north: GeoConstants.jugolNorth,
            south: GeoConstants.jugolSouth,
            east: GeoConstants.jugolEast,
            west: GeoConstants.jugolWest,
            zoom: z,
          ),
        )
        .toList();
  }

  static Future<bool> isReady() async {
    final prefs = await SharedPreferences.getInstance();
    if (prefs.getString(_offlineKey) != 'true') return false;
    final dir = await _tileDirectory();
    return Directory('${dir}15/').existsSync();
  }

  static Future<String?> sizeLabel() async {
    if (!await isReady()) return null;
    var bytes = 0;
    for (final tile in _allOfflineTiles()) {
      final path =
          '${await _tileDirectory()}${tile.z}/${tile.x}/${tile.y}.png';
      final file = File(path);
      if (await file.exists()) {
        bytes += await file.length();
      }
    }
    if (bytes < 1024 * 1024) return '${(bytes / 1024).round()} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  static Future<String> tileDirectoryPath() => _tileDirectory();

  static Future<void> download({
    void Function(OfflineMapProgress progress)? onProgress,
  }) async {
    final tiles = _allOfflineTiles();
    final total = tiles.length;
    var done = 0;
    final tileDir = await _tileDirectory();
    final dio = Dio(
      BaseOptions(
        headers: {'User-Agent': osmUserAgent},
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 30),
      ),
    );

    onProgress?.call(
      OfflineMapProgress(
        done: 0,
        total: total,
        phase: OfflineMapPhase.downloading,
      ),
    );

    await Directory(tileDir).create(recursive: true);

    for (final tile in tiles) {
      final dir = '$tileDir${tile.z}/${tile.x}/';
      final dest = '$dir${tile.y}.png';
      final file = File(dest);
      if (!await file.exists()) {
        await Directory(dir).create(recursive: true);
        try {
          await dio.download(osmTileUrl(tile.z, tile.x, tile.y), dest);
        } catch (_) {
          // Skip individual tile failures; map still usable online.
        }
        await Future<void>.delayed(const Duration(milliseconds: 120));
      }
      done += 1;
      onProgress?.call(
        OfflineMapProgress(
          done: done,
          total: total,
          phase: OfflineMapPhase.downloading,
        ),
      );
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_offlineKey, 'true');
    onProgress?.call(
      OfflineMapProgress(
        done: total,
        total: total,
        phase: OfflineMapPhase.complete,
      ),
    );
  }

  static Future<void> clear() async {
    final tileDir = await _tileDirectory();
    final dir = Directory(tileDir);
    if (await dir.exists()) {
      await dir.delete(recursive: true);
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_offlineKey);
  }
}
