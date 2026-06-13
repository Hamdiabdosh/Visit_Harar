import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';

import '../constants/content_gradients.dart';
import '../theme/app_theme.dart';
import '../utils/media_url.dart';
import 'category_badge.dart';

/// Image-first list card for guides, news, itineraries, and similar content.
class MediaCard extends StatelessWidget {
  const MediaCard({
    super.key,
    required this.title,
    required this.onTap,
    this.subtitle,
    this.imageUrl,
    this.imageLabel,
    this.fallbackGradient = ContentGradients.news,
    this.fallbackIcon = Icons.article_outlined,
    this.trailing,
    this.width,
  });

  final String title;
  final String? subtitle;
  final String? imageUrl;
  final String? imageLabel;
  final LinearGradient fallbackGradient;
  final IconData fallbackIcon;
  final Widget? trailing;
  final VoidCallback onTap;
  final double? width;

  @override
  Widget build(BuildContext context) {
    final resolved = pickListImageUrl(imageUrl);

    return SizedBox(
      width: width,
      child: DecoratedBox(
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
            onTap: onTap,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AspectRatio(
                  aspectRatio: 4 / 3,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (resolved != null)
                        CachedNetworkImage(
                          imageUrl: resolved,
                          fit: BoxFit.cover,
                          placeholder: (_, __) => _GradientFallback(
                            gradient: fallbackGradient,
                            icon: fallbackIcon,
                          ),
                          errorWidget: (_, __, ___) => _GradientFallback(
                            gradient: fallbackGradient,
                            icon: fallbackIcon,
                          ),
                        )
                      else
                        _GradientFallback(
                          gradient: fallbackGradient,
                          icon: fallbackIcon,
                        ),
                      if (imageLabel != null && imageLabel!.isNotEmpty)
                        Positioned(
                          left: 12,
                          bottom: 12,
                          child: ImageOverlayLabel(label: imageLabel!),
                        ),
                    ],
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              title,
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                          ),
                          if (trailing != null) ...[
                            const SizedBox(width: 8),
                            trailing!,
                          ],
                        ],
                      ),
                      if (subtitle != null && subtitle!.isNotEmpty) ...[
                        const SizedBox(height: 8),
                        Text(
                          subtitle!,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _GradientFallback extends StatelessWidget {
  const _GradientFallback({required this.gradient, required this.icon});

  final LinearGradient gradient;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(gradient: gradient),
      child: Align(
        child: Icon(
          icon,
          size: 40,
          color: Colors.white.withValues(alpha: 0.35),
        ),
      ),
    );
  }
}