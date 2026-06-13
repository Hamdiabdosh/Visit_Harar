import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/api_providers.dart';
import '../../core/theme/app_theme.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/category_badge.dart';
import '../../core/widgets/cms_body.dart';
import '../../core/widgets/cms_image.dart';
import '../../core/widgets/content_widgets.dart';
import 'favorite_button.dart';

class AttractionDetailScreen extends ConsumerWidget {
  const AttractionDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(attractionProvider(slug));
    final title = async.maybeWhen(
      data: (item) => item.title,
      orElse: () => 'Attraction',
    );

    return Scaffold(
      appBar: appBarWithBack(
        context: context,
        title: title,
        actions: [
          async.maybeWhen(
            data: (item) => FavoriteButton(attraction: item),
            orElse: () => const SizedBox.shrink(),
          ),
        ],
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(attractionProvider(slug)),
        ),
        data: (item) {
          return ListView(
            children: [
              CmsCoverImage(url: item.image, aspectRatio: 16 / 9),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.page),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CategoryBadge(label: item.category),
                    const SizedBox(height: 12),
                    Text(
                      item.title,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontSize: 30,
                          ),
                    ),
                    if (item.shortDesc != null) ...[
                      const SizedBox(height: 14),
                      Text(
                        item.shortDesc!,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: AppColors.inkMuted,
                            ),
                      ),
                    ],
                    if (item.fullDesc != null && item.fullDesc!.isNotEmpty) ...[
                      const SizedBox(height: 18),
                      CmsBody(html: item.fullDesc!),
                    ],
                    if (item.openingHours != null ||
                        item.bestTimeToVisit != null ||
                        item.visitorTips != null) ...[
                      const SizedBox(height: 28),
                      Text(
                        'Plan your visit',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontSize: 22,
                            ),
                      ),
                      const SizedBox(height: 14),
                    ],
                    if (item.openingHours != null) ...[
                      IconInfoBlock(
                        icon: Icons.schedule_outlined,
                        title: 'Hours',
                        body: item.openingHours!,
                      ),
                    ],
                    if (item.bestTimeToVisit != null) ...[
                      const SizedBox(height: 12),
                      IconInfoBlock(
                        icon: Icons.wb_sunny_outlined,
                        title: 'Best time',
                        body: item.bestTimeToVisit!,
                      ),
                    ],
                    if (item.visitorTips != null) ...[
                      const SizedBox(height: 12),
                      IconInfoBlock(
                        icon: Icons.lightbulb_outline,
                        title: 'Tips',
                        body: item.visitorTips!,
                      ),
                    ],
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
