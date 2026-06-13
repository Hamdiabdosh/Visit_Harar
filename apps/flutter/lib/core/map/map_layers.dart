import 'dart:io';

import 'package:flutter/painting.dart';
import 'package:flutter_map/flutter_map.dart';

import 'offline_map.dart';

/// Local tiles when cached; otherwise OpenStreetMap (same UX as Expo JugolMap).
class JugolTileProvider extends TileProvider {
  JugolTileProvider({
    required this.directory,
    required this.offlineReady,
  });

  final String directory;
  final bool offlineReady;

  final NetworkTileProvider _network = NetworkTileProvider(
    headers: {'User-Agent': osmUserAgent},
  );

  @override
  ImageProvider getImage(TileCoordinates coordinates, TileLayer options) {
    if (offlineReady) {
      final path =
          '$directory${coordinates.z}/${coordinates.x}/${coordinates.y}.png';
      final file = File(path);
      if (file.existsSync()) {
        return FileImage(file);
      }
    }
    return _network.getImage(coordinates, options);
  }
}

TileLayer buildJugolTileLayer({
  required bool offlineReady,
  required String tileDir,
}) {
  return TileLayer(
    urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    tileProvider: JugolTileProvider(
      directory: tileDir,
      offlineReady: offlineReady,
    ),
    maxZoom: 19,
    userAgentPackageName: 'et.gov.harar.visit_harar',
  );
}
