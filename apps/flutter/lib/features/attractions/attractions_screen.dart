import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/providers/api_providers.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/page_widgets.dart';
import '../../core/widgets/place_card.dart';
import '../../core/widgets/search_app_bar_action.dart';
import '../../core/theme/app_theme.dart';

class AttractionsScreen extends ConsumerWidget {
  const AttractionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(attractionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Attractions'),
        actions: const [SearchAppBarAction()],
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(attractionsProvider),
        ),
        data: (items) {
          if (items.isEmpty) {
            return refreshableBody(
              onRefresh: () async => ref.invalidate(attractionsProvider),
              child: const EmptyState(
                title: 'No attractions yet',
                message:
                    'Published UNESCO sites and landmarks will appear here.',
                icon: Icons.account_balance_outlined,
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(attractionsProvider),
            color: Theme.of(context).colorScheme.primary,
            child: ListView.separated(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                8,
                AppSpacing.page,
                AppSpacing.bottomNav,
              ),
              itemCount: items.length + 1,
              separatorBuilder: (_, index) =>
                  index == 0 ? const SizedBox.shrink() : const SizedBox(height: 14),
              itemBuilder: (context, index) {
                if (index == 0) {
                  return const ListIntro(
                    text:
                        'Explore Harar Jugol — mosques, markets, gates, and '
                        'UNESCO heritage sites.',
                  );
                }
                final item = items[index - 1];
                return PlaceCard(
                  title: item.title,
                  subtitle: item.shortDesc,
                  imageUrl: item.image,
                  category: item.category,
                  onTap: () => context.go('/attractions/${item.slug}'),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
