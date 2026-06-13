import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../routing/app_router.dart';
import '../../core/providers/api_providers.dart';
import '../../core/providers/favorites_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/media_card.dart';
import '../../core/constants/content_gradients.dart';
import '../../core/widgets/page_widgets.dart';
import '../../core/widgets/place_card.dart';
import '../../core/widgets/search_app_bar_action.dart';

class PlanScreen extends ConsumerWidget {
  const PlanScreen({super.key});

  Future<void> _refresh(WidgetRef ref) async {
    ref.invalidate(favoritesProvider);
    ref.invalidate(itinerariesProvider);
    await ref.read(itinerariesProvider.future);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesAsync = ref.watch(favoritesProvider);
    final itinerariesAsync = ref.watch(itinerariesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Plan'),
        actions: const [SearchAppBarAction()],
      ),
      body: RefreshIndicator(
        onRefresh: () => _refresh(ref),
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.page,
            8,
            AppSpacing.page,
            AppSpacing.bottomNav,
          ),
          children: [
            favoritesAsync.when(
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
              data: (favorites) {
                if (favorites.isEmpty) return const SizedBox.shrink();
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SectionHeading(
                      title: 'Saved places',
                      subtitle: 'Attractions you bookmarked for your trip.',
                    ),
                    const SizedBox(height: 12),
                    ...favorites.map(
                      (fav) => Padding(
                        padding: const EdgeInsets.only(bottom: 14),
                        child: PlaceCard(
                          title: fav.title,
                          category: fav.category,
                          onTap: () => pushAppRoute(
                            context,
                            '/attractions/${fav.slug}',
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                  ],
                );
              },
            ),
            const SectionHeading(
              title: 'Itineraries',
              subtitle:
                  'Pre-built day plans from the Harari Tourism Commission.',
            ),
            const SizedBox(height: 12),
            itinerariesAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: CircularProgressIndicator()),
              ),
              error: (e, _) => ApiErrorBody(
                message: errorMessage(e),
                onRetry: () => ref.invalidate(itinerariesProvider),
              ),
              data: (items) {
                if (items.isEmpty) {
                  return const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Text(
                      'No itineraries published yet.',
                      style: TextStyle(color: AppColors.inkMuted),
                    ),
                  );
                }
                return Column(
                  children: items
                      .map(
                        (item) => Padding(
                          padding: const EdgeInsets.only(bottom: 14),
                          child: MediaCard(
                            title: item.title,
                            subtitle: item.summary,
                            imageLabel: item.duration,
                            fallbackGradient: ContentGradients.itinerary,
                            fallbackIcon: Icons.route_outlined,
                            onTap: () => pushAppRoute(
                              context,
                              '/itineraries/${item.slug}',
                            ),
                          ),
                        ),
                      )
                      .toList(),
                );
              },
            ),
            const SizedBox(height: 20),
            const SectionHeading(
              title: 'Book & alerts',
              subtitle: 'Guides, booking lookup, and notification preferences.',
            ),
            const SizedBox(height: 12),
            _PlanTile(
              icon: Icons.person_search_outlined,
              title: 'Licensed guides',
              subtitle: 'Browse and book a guide',
              onTap: () => pushAppRoute(context, '/guides'),
            ),
            _PlanTile(
              icon: Icons.event_available_outlined,
              title: 'Book a guide',
              subtitle: 'Request a tour date',
              onTap: () => pushAppRoute(context, '/book'),
            ),
            _PlanTile(
              icon: Icons.receipt_long_outlined,
              title: 'Booking status',
              subtitle: 'Look up by reference + email',
              onTap: () => pushAppRoute(context, '/book/status'),
            ),
            _PlanTile(
              icon: Icons.notifications_outlined,
              title: 'Notifications',
              subtitle: 'Booking and event alerts',
              onTap: () => pushAppRoute(context, '/settings/notifications'),
            ),
            _PlanTile(
              icon: Icons.mail_outline,
              title: 'Contact commission',
              subtitle: 'Questions about your visit',
              onTap: () => pushAppRoute(context, '/contact'),
            ),
          ],
        ),
      ),
    );
  }
}

class _PlanTile extends StatelessWidget {
  const _PlanTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        leading: Icon(icon, color: AppColors.brand),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right, color: AppColors.inkMuted),
        onTap: onTap,
      ),
    );
  }
}
