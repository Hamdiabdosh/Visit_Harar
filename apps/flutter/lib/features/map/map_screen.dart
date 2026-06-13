import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:latlong2/latlong.dart';

import '../../api/models.dart';
import '../../core/constants/geo.dart';
import '../../core/map/map_layers.dart';
import '../../core/map/offline_map.dart';
import '../../core/providers/api_providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/search_app_bar_action.dart';

class MapScreen extends ConsumerStatefulWidget {
  const MapScreen({super.key});

  @override
  ConsumerState<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends ConsumerState<MapScreen> {
  final _mapController = MapController();
  bool _offlineReady = false;
  String? _offlineSize;
  String _tileDir = '';
  OfflineMapProgress _download = const OfflineMapProgress(
    done: 0,
    total: 0,
    phase: OfflineMapPhase.idle,
  );

  @override
  void initState() {
    super.initState();
    _refreshOfflineStatus();
  }

  Future<void> _refreshOfflineStatus() async {
    final ready = await OfflineMapService.isReady();
    final dir = await OfflineMapService.tileDirectoryPath();
    String? size;
    if (ready) {
      size = await OfflineMapService.sizeLabel();
    }
    if (!mounted) return;
    setState(() {
      _offlineReady = ready;
      _tileDir = dir;
      _offlineSize = size;
    });
  }

  Future<void> _handleDownload() async {
    if (_download.phase == OfflineMapPhase.downloading) return;
    setState(() {
      _download = const OfflineMapProgress(
        done: 0,
        total: 0,
        phase: OfflineMapPhase.downloading,
      );
    });
    try {
      await OfflineMapService.download(
        onProgress: (progress) {
          if (!mounted) return;
          setState(() => _download = progress);
        },
      );
      await _refreshOfflineStatus();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _download = OfflineMapProgress(
          done: 0,
          total: 0,
          phase: OfflineMapPhase.error,
          error: e.toString(),
        );
      });
    }
  }

  void _showPoiSheet(MapPoi poi) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (context) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              poi.title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
            ),
            if (poi.category.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text(
                poi.category,
                style: const TextStyle(color: AppColors.inkMuted),
              ),
            ],
            if (poi.shortDesc != null && poi.shortDesc!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(poi.shortDesc!),
            ],
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () {
                Navigator.pop(context);
                context.go('/attractions/${poi.slug}');
              },
              child: const Text('View details'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final poisAsync = ref.watch(mapPoisProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Map'),
        actions: const [SearchAppBarAction()],
      ),
      body: poisAsync.when(
        loading: () => _MapBody(
          mapController: _mapController,
          offlineReady: _offlineReady,
          tileDir: _tileDir,
          markers: const [],
          loading: true,
          error: null,
          offlineSize: _offlineSize,
          download: _download,
          onDownload: _handleDownload,
          onPoiTap: _showPoiSheet,
        ),
        error: (e, _) => _MapBody(
          mapController: _mapController,
          offlineReady: _offlineReady,
          tileDir: _tileDir,
          markers: const [],
          loading: false,
          error: errorMessage(e),
          offlineSize: _offlineSize,
          download: _download,
          onDownload: _handleDownload,
          onPoiTap: _showPoiSheet,
          onRetry: () => ref.invalidate(mapPoisProvider),
        ),
        data: (pois) {
          final markers = pois
              .where((p) => p.latitude != null && p.longitude != null)
              .toList();
          return _MapBody(
            mapController: _mapController,
            offlineReady: _offlineReady,
            tileDir: _tileDir,
            markers: markers,
            loading: false,
            error: null,
            offlineSize: _offlineSize,
            download: _download,
            onDownload: _handleDownload,
            onPoiTap: _showPoiSheet,
          );
        },
      ),
    );
  }
}

class _MapBody extends StatelessWidget {
  const _MapBody({
    required this.mapController,
    required this.offlineReady,
    required this.tileDir,
    required this.markers,
    required this.loading,
    required this.error,
    required this.offlineSize,
    required this.download,
    required this.onDownload,
    required this.onPoiTap,
    this.onRetry,
  });

  final MapController mapController;
  final bool offlineReady;
  final String tileDir;
  final List<MapPoi> markers;
  final bool loading;
  final String? error;
  final String? offlineSize;
  final OfflineMapProgress download;
  final VoidCallback onDownload;
  final void Function(MapPoi poi) onPoiTap;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        FlutterMap(
          mapController: mapController,
          options: const MapOptions(
            initialCenter: LatLng(
              GeoConstants.hararCenterLat,
              GeoConstants.hararCenterLng,
            ),
            initialZoom: 15,
            minZoom: 13,
            maxZoom: 18,
          ),
          children: [
            if (tileDir.isNotEmpty)
              buildJugolTileLayer(
                offlineReady: offlineReady,
                tileDir: tileDir,
              )
            else
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'et.gov.harar.visit_harar',
                maxZoom: 19,
              ),
            MarkerLayer(
              markers: markers
                  .map(
                    (poi) => Marker(
                      point: LatLng(poi.latitude!, poi.longitude!),
                      width: 36,
                      height: 36,
                      child: GestureDetector(
                        onTap: () => onPoiTap(poi),
                        child: const Icon(
                          Icons.place,
                          color: AppColors.brand,
                          size: 36,
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            const RichAttributionWidget(
              attributions: [
                TextSourceAttribution('OpenStreetMap contributors'),
              ],
            ),
          ],
        ),
        Positioned(
          left: 12,
          right: 12,
          bottom: 12,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (loading)
                _Banner(
                  child: Row(
                    children: [
                      const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Loading places…',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              if (error != null)
                _Banner(
                  error: true,
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          error!,
                          style: const TextStyle(color: Color(0xFFB91C1C)),
                        ),
                      ),
                      if (onRetry != null)
                        TextButton(onPressed: onRetry, child: const Text('Retry')),
                    ],
                  ),
                ),
              _Banner(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      offlineReady
                          ? 'Offline Jugol map ready${offlineSize != null ? ' · $offlineSize' : ''}'
                          : 'Online map · OpenStreetMap',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (download.phase == OfflineMapPhase.downloading)
                      Text(
                        'Downloading… ${download.done}/${download.total == 0 ? '…' : download.total}',
                        style: const TextStyle(color: AppColors.inkMuted),
                      )
                    else
                      FilledButton(
                        onPressed: onDownload,
                        child: Text(
                          offlineReady
                              ? 'Update offline map'
                              : 'Save for offline',
                        ),
                      ),
                    if (download.phase == OfflineMapPhase.error &&
                        download.error != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text(
                          download.error!,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFFB91C1C),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _Banner extends StatelessWidget {
  const _Banner({required this.child, this.error = false});

  final Widget child;
  final bool error;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: error ? const Color(0xFFFEF2F2) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: error ? const Color(0xFFFECACA) : AppColors.border,
        ),
      ),
      child: child,
    );
  }
}
