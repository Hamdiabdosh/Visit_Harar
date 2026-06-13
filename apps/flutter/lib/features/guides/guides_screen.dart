import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/api_providers.dart';
import '../../core/constants/content_gradients.dart';
import '../../core/theme/app_theme.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/category_badge.dart';
import '../../core/widgets/cms_body.dart';
import '../../core/widgets/cms_image.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/media_card.dart';
import '../../core/widgets/page_widgets.dart';
import '../../core/widgets/search_app_bar_action.dart';

class GuidesScreen extends ConsumerWidget {
  const GuidesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(guidesProvider);

    return Scaffold(
      appBar: appBarWithBack(
        context: context,
        title: 'Licensed guides',
        actions: const [SearchAppBarAction()],
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(guidesProvider),
        ),
        data: (guides) {
          if (guides.isEmpty) {
            return refreshableBody(
              onRefresh: () async => ref.invalidate(guidesProvider),
              child: const EmptyState(
                title: 'No guides yet',
                message:
                    'Commission-registered guides will be listed here when published.',
                icon: Icons.person_outline,
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(guidesProvider),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                8,
                AppSpacing.page,
                24,
              ),
              children: [
                const ListIntro(
                  text:
                      'Licensed local guides registered with the Harari Tourism Commission.',
                ),
                ...guides.map(
                  (guide) => Padding(
                    padding: const EdgeInsets.only(bottom: 14),
                    child: MediaCard(
                      title: guide.name,
                      subtitle: guide.languages.isEmpty
                          ? guide.bio
                          : 'Languages: ${guide.languages.join(', ')}',
                      imageUrl: guide.photo,
                      imageLabel: 'Licensed guide',
                      fallbackGradient: ContentGradients.guide,
                      fallbackIcon: Icons.person_outline,
                      trailing: StatusBadge(
                        label: guide.isAvailable ? 'Available' : 'Unavailable',
                        positive: guide.isAvailable,
                      ),
                      onTap: () => pushAppRoute(context, '/guides/${guide.slug}'),
                    ),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class GuideDetailScreen extends ConsumerWidget {
  const GuideDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(guideProvider(slug));
    final title = async.maybeWhen(
      data: (guide) => guide.name,
      orElse: () => 'Guide',
    );

    return Scaffold(
      appBar: appBarWithBack(context: context, title: title),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(guideProvider(slug)),
        ),
        data: (guide) {
          return ListView(
            children: [
              CmsCoverImage(url: guide.photo, aspectRatio: 4 / 3),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.page),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    StatusBadge(
                      label: guide.isAvailable ? 'Available' : 'Unavailable',
                      positive: guide.isAvailable,
                    ),
                    const SizedBox(height: 12),
                    Text(
                      guide.name,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontSize: 30,
                          ),
                    ),
                    if (guide.bio != null && guide.bio!.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      CmsBody(html: guide.bio!),
                    ],
                    if (guide.languages.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      IconInfoBlock(
                        icon: Icons.translate,
                        title: 'Languages',
                        body: guide.languages.join(', '),
                      ),
                    ],
                    if (guide.specialties.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      IconInfoBlock(
                        icon: Icons.star_outline,
                        title: 'Specialties',
                        body: guide.specialties.join(', '),
                      ),
                    ],
                    const SizedBox(height: 28),
                    FilledButton(
                      onPressed: guide.isAvailable
                          ? () => pushAppRoute(context, '/book?guideId=${guide.id}')
                          : null,
                      child: const Text('Request this guide'),
                    ),
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
