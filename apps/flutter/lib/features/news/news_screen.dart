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
import 'event_registration_panel.dart';

class NewsScreen extends ConsumerStatefulWidget {
  const NewsScreen({super.key});

  @override
  ConsumerState<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends ConsumerState<NewsScreen> {
  String? _typeFilter;

  @override
  Widget build(BuildContext context) {
    final query = AnnouncementQuery(type: _typeFilter);
    final async = ref.watch(announcementsProvider(query));

    return Scaffold(
      appBar: appBarWithBack(
        context: context,
        title: 'News & events',
        actions: const [SearchAppBarAction()],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.fromLTRB(AppSpacing.page, 12, AppSpacing.page, 0),
            child: Row(
              children: [
                CategoryFilterChip(
                  label: 'All',
                  selected: _typeFilter == null,
                  onTap: () => setState(() => _typeFilter = null),
                ),
                const SizedBox(width: 8),
                CategoryFilterChip(
                  label: 'News',
                  selected: _typeFilter == 'News',
                  onTap: () => setState(() => _typeFilter = 'News'),
                ),
                const SizedBox(width: 8),
                CategoryFilterChip(
                  label: 'Events',
                  selected: _typeFilter == 'Event',
                  onTap: () => setState(() => _typeFilter = 'Event'),
                ),
              ],
            ),
          ),
          Expanded(
            child: async.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => ApiErrorBody(
                message: errorMessage(e),
                onRetry: () => ref.invalidate(announcementsProvider(query)),
              ),
              data: (page) {
                if (page.items.isEmpty) {
                  return refreshableBody(
                    onRefresh: () async =>
                        ref.invalidate(announcementsProvider(query)),
                    child: const EmptyState(
                      title: 'Nothing published yet',
                      message:
                          'News, events, and notices from the commission will show here.',
                      icon: Icons.newspaper_outlined,
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async =>
                      ref.invalidate(announcementsProvider(query)),
                  child: ListView.separated(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: const EdgeInsets.fromLTRB(
                      AppSpacing.page,
                      12,
                      AppSpacing.page,
                      24,
                    ),
                    itemCount: page.items.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 14),
                    itemBuilder: (context, index) {
                      final item = page.items[index];
                      return MediaCard(
                        title: item.title,
                        subtitle: item.eventDate ?? item.publishedAt,
                        imageUrl: item.coverImage,
                        imageLabel: item.type,
                        fallbackGradient:
                            ContentGradients.forAnnouncementType(item.type),
                        fallbackIcon: item.type == 'Event'
                            ? Icons.event_outlined
                            : Icons.newspaper_outlined,
                        trailing: CategoryBadge(label: item.type, compact: true),
                        onTap: () => pushAppRoute(context, '/news/${item.slug}'),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class AnnouncementDetailScreen extends ConsumerWidget {
  const AnnouncementDetailScreen({super.key, required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(announcementProvider(slug));
    final title = async.maybeWhen(
      data: (item) => item.title,
      orElse: () => 'News',
    );

    return Scaffold(
      appBar: appBarWithBack(context: context, title: title),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(announcementProvider(slug)),
        ),
        data: (item) {
          return ListView(
            children: [
              CmsCoverImage(url: item.coverImage, aspectRatio: 16 / 9),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.page),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    CategoryBadge(label: item.type),
                    const SizedBox(height: 12),
                    Text(
                      item.title,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontSize: 30,
                          ),
                    ),
                    if (item.eventDate != null) ...[
                      const SizedBox(height: 20),
                      IconInfoBlock(
                        icon: Icons.event_outlined,
                        title: 'Date',
                        body: item.eventDate!,
                      ),
                    ],
                    if (item.eventLocation != null) ...[
                      const SizedBox(height: 12),
                      IconInfoBlock(
                        icon: Icons.location_on_outlined,
                        title: 'Location',
                        body: item.eventLocation!,
                      ),
                    ],
                    if (item.body != null && item.body!.isNotEmpty) ...[
                      const SizedBox(height: 18),
                      CmsBody(html: item.body!),
                    ],
                    EventRegistrationPanel(event: item),
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
