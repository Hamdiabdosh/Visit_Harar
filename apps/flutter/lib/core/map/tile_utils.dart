import 'dart:math' as math;

/// Slippy-map tile coordinates (Web Mercator) — mirrors `apps/mobile/lib/tile-utils.ts`.

int lonToTileX(double lon, int zoom) {
  return ((lon + 180) / 360 * math.pow(2, zoom)).floor();
}

int latToTileY(double lat, int zoom) {
  final rad = lat * math.pi / 180;
  return ((1 -
              math.log(math.tan(rad) + 1 / math.cos(rad)) / math.pi) /
          2 *
          math.pow(2, zoom))
      .floor();
}

class TileCoordinate {
  const TileCoordinate({required this.x, required this.y, required this.z});

  final int x;
  final int y;
  final int z;
}

List<TileCoordinate> tilesForBounds({
  required double north,
  required double south,
  required double east,
  required double west,
  required int zoom,
}) {
  final xMin = lonToTileX(west, zoom);
  final xMax = lonToTileX(east, zoom);
  final yMin = latToTileY(north, zoom);
  final yMax = latToTileY(south, zoom);
  final tiles = <TileCoordinate>[];
  for (var x = xMin; x <= xMax; x++) {
    for (var y = yMin; y <= yMax; y++) {
      tiles.add(TileCoordinate(x: x, y: y, z: zoom));
    }
  }
  return tiles;
}

String osmTileUrl(int z, int x, int y) {
  return 'https://tile.openstreetmap.org/$z/$x/$y.png';
}
