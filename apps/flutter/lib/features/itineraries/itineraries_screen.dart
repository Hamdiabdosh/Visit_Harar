import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/models.dart';
import '../../core/providers/api_providers.dart';
import '../../core/constants/content_gradients.dart';
import '../../routing/app_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/media_card.dart';
import '../../core/widgets/page_widgets.dart';

class ItinerariesScreen extends ConsumerWidget {
  const ItinerariesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(itinerariesProvider);

    return Scaffold(
      appBar: appBarWithBack(context: context, title: 'Itineraries'),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(itinerariesProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return refreshableBody(
              onRefresh: () async => ref.invalidate(itinerariesProvider),
              child: const EmptyState(
                title: 'No itineraries yet',
                message:
                    'Commission-curated day plans will appear here when published.',
                icon: Icons.route_outlined,
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(itinerariesProvider),
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                8,
                AppSpacing.page,
                24,
              ),
              itemCount: items.length + 1,
              separatorBuilder: (_, index) =>
                  index == 0 ? const SizedBox.shrink() : const SizedBox(height: 14),
              itemBuilder: (context, index) {
                if (index == 0) {
                  return const ListIntro(
                    text:
                        'Follow suggested routes through Jugol — from half-day '
                        'walks to multi-day stays.',
                  );
                }
                final item = items[index - 1];
                return MediaCard(
                  title: item.title,
                  subtitle: item.summary,
                  imageLabel: item.duration,
                  fallbackGradient: ContentGradients.itinerary,
                  fallbackIcon: Icons.route_outlined,
                  onTap: () => pushAppRoute(context, '/itineraries/${item.slug}'),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class ItineraryDetailScreen extends ConsumerWidget {
  const ItineraryDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(itineraryProvider(slug));
    final title = async.maybeWhen(
      data: (item) => item.title,
      orElse: () => 'Itinerary',
    );

    return Scaffold(
      appBar: appBarWithBack(context: context, title: title),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(itineraryProvider(slug)),
        ),
        data: (item) {
          return ListView(
            padding: const EdgeInsets.all(AppSpacing.page),
            children: [
              DecoratedBox(
                decoration: BoxDecoration(
                  gradient: ContentGradients.itinerary,
                  borderRadius: BorderRadius.circular(AppRadius.card),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item.duration.toUpperCase(),
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: Colors.white.withValues(alpha: 0.85),
                              letterSpacing: 0.8,
                            ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        item.title,
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: Colors.white,
                              fontSize: 28,
                            ),
                      ),
                      if (item.summary != null && item.summary!.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        Text(
                          item.summary!,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.white.withValues(alpha: 0.9),
                                height: 1.45,
                              ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              ...item.days.map(
                (day) => Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: AppColors.card,
                      borderRadius: BorderRadius.circular(AppRadius.card),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppShadows.card,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            day.label,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontSize: 17,
                                ),
                          ),
                          const SizedBox(height: 10),
                          ...day.items.map(
                            (activity) => Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: _ItineraryActivityItem(activity: activity),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _ItineraryActivityItem extends StatelessWidget {
  const _ItineraryActivityItem({required this.activity});

  final ItineraryDayItem activity;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final slug = activity.attractionSlug?.trim();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(top: 2),
          child: Text(
            '●',
            style: TextStyle(
              color: AppColors.gold,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                activity.title,
                style: theme.textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (activity.description != null &&
                  activity.description!.trim().isNotEmpty) ...[
                const SizedBox(height: 2),
                Text(
                  activity.description!.trim(),
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.inkMuted,
                    height: 1.35,
                  ),
                ),
              ],
              if (slug != null && slug.isNotEmpty) ...[
                const SizedBox(height: 4),
                InkWell(
                  onTap: () => pushAppRoute(context, '/attractions/$slug'),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.location_on_outlined,
                        size: 16,
                        color: AppColors.brand,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'View attraction',
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: AppColors.brand,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
