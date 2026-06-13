import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/models.dart';
import '../../core/providers/api_providers.dart';
import '../../core/constants/content_gradients.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/media_url.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/cms_image.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/page_widgets.dart';

class GalleryScreen extends ConsumerWidget {
  const GalleryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final albumsAsync = ref.watch(galleryAlbumsProvider);

    return Scaffold(
      appBar: appBarWithBack(context: context, title: 'Photo gallery'),
      body: albumsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(galleryAlbumsProvider),
        ),
        data: (albums) {
          if (albums.isEmpty) {
            return refreshableBody(
              onRefresh: () async => ref.invalidate(galleryAlbumsProvider),
              child: const EmptyState(
                title: 'No albums yet',
                message:
                    'Photo albums will appear here once the commission publishes them.',
                icon: Icons.photo_library_outlined,
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(galleryAlbumsProvider),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                8,
                AppSpacing.page,
                32,
              ),
              children: [
                const ListIntro(
                  text: 'Visual stories from inside the walls of Harar Jugol.',
                ),
                GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.82,
                  ),
                  itemCount: albums.length,
                  itemBuilder: (context, index) {
                    return _GalleryAlbumTile(album: albums[index]);
                  },
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _GalleryAlbumTile extends StatelessWidget {
  const _GalleryAlbumTile({required this.album});

  final GalleryAlbumSummary album;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final countLabel =
        album.itemCount == 1 ? '1 photo' : '${album.itemCount} photos';

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.card,
      ),
      child: Material(
        color: Colors.transparent,
        clipBehavior: Clip.antiAlias,
        borderRadius: BorderRadius.circular(AppRadius.card),
        child: InkWell(
          onTap: () => pushAppRoute(context, '/gallery/${album.id}'),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    if (album.coverImage != null && album.coverImage!.isNotEmpty)
                      CmsCoverImage(url: album.coverImage, aspectRatio: 1)
                    else
                      DecoratedBox(
                        decoration: const BoxDecoration(
                          gradient: ContentGradients.gallery,
                        ),
                        child: Align(
                          child: Icon(
                            Icons.photo_library_outlined,
                            size: 40,
                            color: Colors.white.withValues(alpha: 0.45),
                          ),
                        ),
                      ),
                    Positioned(
                      right: 8,
                      bottom: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black.withValues(alpha: 0.65),
                          borderRadius: BorderRadius.circular(AppRadius.chip),
                        ),
                        child: Text(
                          countLabel,
                          style: theme.textTheme.labelSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(12),
                child: Text(
                  album.title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class GalleryAlbumScreen extends ConsumerStatefulWidget {
  const GalleryAlbumScreen({super.key, required this.albumId});

  final String albumId;

  @override
  ConsumerState<GalleryAlbumScreen> createState() => _GalleryAlbumScreenState();
}

class _GalleryAlbumScreenState extends ConsumerState<GalleryAlbumScreen> {
  @override
  Widget build(BuildContext context) {
    final albumAsync = ref.watch(galleryAlbumProvider(widget.albumId));
    final title = albumAsync.maybeWhen(
      data: (detail) => detail.album.title,
      orElse: () => 'Album',
    );

    return Scaffold(
      appBar: appBarWithBack(context: context, title: title),
      body: albumAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(galleryAlbumProvider(widget.albumId)),
        ),
        data: (detail) {
          final album = detail.album;
          final items = detail.items;

          if (items.isEmpty) {
            return ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Text(
                  album.title,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'No photos in this album yet.',
                  style: TextStyle(color: AppColors.inkMuted),
                ),
              ],
            );
          }

          return ListView(
            padding: const EdgeInsets.fromLTRB(AppSpacing.page, 16, AppSpacing.page, 32),
            children: [
              Text(
                album.title,
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              if (album.description != null &&
                  album.description!.trim().isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  album.description!.trim(),
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppColors.inkMuted,
                        height: 1.4,
                      ),
                ),
              ],
              const SizedBox(height: 8),
              Text(
                '${items.length} ${items.length == 1 ? 'photo' : 'photos'} — tap to enlarge',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: AppColors.inkMuted,
                    ),
              ),
              const SizedBox(height: 16),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 8,
                  mainAxisSpacing: 8,
                  childAspectRatio: 1,
                ),
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final item = items[index];
                  return _GalleryPhotoTile(
                    item: item,
                    onTap: () => _openLightbox(context, items, index),
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }

  void _openLightbox(
    BuildContext context,
    List<GalleryItem> items,
    int initialIndex,
  ) {
    showDialog<void>(
      context: context,
      barrierColor: Colors.black87,
      builder: (context) => _GalleryLightbox(
        items: items,
        initialIndex: initialIndex,
      ),
    );
  }
}

class _GalleryPhotoTile extends StatelessWidget {
  const _GalleryPhotoTile({required this.item, required this.onTap});

  final GalleryItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveMediaUrl(item.displayUrl);
    if (resolved == null) {
      return const SizedBox.shrink();
    }

    return Material(
      clipBehavior: Clip.antiAlias,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        child: CachedNetworkImage(
          imageUrl: resolved,
          fit: BoxFit.cover,
          placeholder: (_, __) => Container(color: AppColors.border),
          errorWidget: (_, __, ___) => Container(
            color: AppColors.border,
            alignment: Alignment.center,
            child: const Icon(Icons.broken_image_outlined),
          ),
        ),
      ),
    );
  }
}

class _GalleryLightbox extends StatefulWidget {
  const _GalleryLightbox({
    required this.items,
    required this.initialIndex,
  });

  final List<GalleryItem> items;
  final int initialIndex;

  @override
  State<_GalleryLightbox> createState() => _GalleryLightboxState();
}

class _GalleryLightboxState extends State<_GalleryLightbox> {
  late final PageController _controller;
  late int _index;

  @override
  void initState() {
    super.initState();
    _index = widget.initialIndex;
    _controller = PageController(initialPage: widget.initialIndex);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final item = widget.items[_index];
    final caption = item.caption?.trim();
    final alt = item.altText?.trim();

    return Dialog.fullscreen(
      backgroundColor: Colors.black,
      child: SafeArea(
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerRight,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: widget.items.length,
                onPageChanged: (index) => setState(() => _index = index),
                itemBuilder: (context, index) {
                  final photo = widget.items[index];
                  final resolved = resolveMediaUrl(photo.url);
                  if (resolved == null) {
                    return const Center(
                      child: Icon(Icons.broken_image_outlined, color: Colors.white),
                    );
                  }
                  return InteractiveViewer(
                    child: Center(
                      child: CachedNetworkImage(
                        imageUrl: resolved,
                        fit: BoxFit.contain,
                        placeholder: (_, __) => const Center(
                          child: CircularProgressIndicator(color: Colors.white),
                        ),
                        errorWidget: (_, __, ___) => const Icon(
                          Icons.broken_image_outlined,
                          color: Colors.white,
                          size: 48,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            if ((caption != null && caption.isNotEmpty) ||
                (alt != null && alt.isNotEmpty))
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
                child: Text(
                  caption?.isNotEmpty == true ? caption! : alt!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.white70),
                ),
              ),
            Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: Text(
                '${_index + 1} / ${widget.items.length}',
                style: const TextStyle(color: Colors.white54),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
