import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import '../utils/media_url.dart';

class CmsThumbnail extends StatelessWidget {
  const CmsThumbnail({
    super.key,
    required this.url,
    this.size = 72,
    this.borderRadius = 10,
  });

  final String? url;
  final double size;
  final double borderRadius;

  @override
  Widget build(BuildContext context) {
    final resolved = pickListImageUrl(url);
    if (resolved == null) return const SizedBox.shrink();

    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: SizedBox(
        width: size,
        height: size,
        child: CachedNetworkImage(
          imageUrl: resolved,
          fit: BoxFit.cover,
          placeholder: (_, __) => const _ImagePlaceholder(),
          errorWidget: (_, __, ___) => const _ImagePlaceholder(showIcon: true),
        ),
      ),
    );
  }
}

class CmsCoverImage extends StatelessWidget {
  const CmsCoverImage({
    super.key,
    required this.url,
    this.aspectRatio = 16 / 10,
  });

  final String? url;
  final double aspectRatio;

  @override
  Widget build(BuildContext context) {
    final resolved = resolveMediaUrl(url);
    if (resolved == null) return const SizedBox.shrink();

    return AspectRatio(
      aspectRatio: aspectRatio,
      child: CachedNetworkImage(
        imageUrl: resolved,
        fit: BoxFit.cover,
        width: double.infinity,
        placeholder: (_, __) => const _ImagePlaceholder(expanded: true),
        errorWidget: (_, __, ___) =>
            const _ImagePlaceholder(expanded: true, showIcon: true),
      ),
    );
  }
}

class _ImagePlaceholder extends StatelessWidget {
  const _ImagePlaceholder({this.expanded = false, this.showIcon = false});

  final bool expanded;
  final bool showIcon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: expanded ? double.infinity : null,
      height: expanded ? double.infinity : null,
      color: AppColors.border,
      alignment: Alignment.center,
      child: showIcon
          ? Icon(
              Icons.image_outlined,
              color: AppColors.inkMuted.withValues(alpha: 0.6),
              size: expanded ? 40 : 24,
            )
          : const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
    );
  }
}
