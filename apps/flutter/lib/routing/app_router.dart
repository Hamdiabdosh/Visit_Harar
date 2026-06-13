import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'package:visit_harar/features/attractions/attraction_detail_screen.dart';
import 'package:visit_harar/features/attractions/attractions_screen.dart';
import 'package:visit_harar/features/booking/book_screen.dart';
import 'package:visit_harar/features/booking/booking_status_screen.dart';
import 'package:visit_harar/features/contact/contact_screen.dart';
import 'package:visit_harar/features/gallery/gallery_screen.dart';
import 'package:visit_harar/features/guides/guides_screen.dart';
import 'package:visit_harar/features/home/home_screen.dart';
import 'package:visit_harar/features/itineraries/itineraries_screen.dart';
import 'package:visit_harar/features/map/map_screen.dart';
import 'package:visit_harar/features/news/news_screen.dart';
import 'package:visit_harar/features/news/event_registration_status_screen.dart';
import 'package:visit_harar/features/plan/plan_screen.dart';
import 'package:visit_harar/features/search/search_screen.dart';
import 'package:visit_harar/features/services/services_screen.dart';
import 'package:visit_harar/features/settings/notification_settings_screen.dart';
import 'package:visit_harar/features/shell/main_shell.dart';

/// Root navigator — full-screen flows (book, search, gallery, …).
final rootNavigatorKey = GlobalKey<NavigatorState>();

final appRouter = GoRouter(
  navigatorKey: rootNavigatorKey,
  initialLocation: '/',
  errorBuilder: (context, state) => _RouterErrorScreen(error: state.error),
  routes: [
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return MainShell(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/',
              builder: (context, state) => const HomeScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/attractions',
              builder: (context, state) => const AttractionsScreen(),
              routes: [
                GoRoute(
                  path: ':slug',
                  parentNavigatorKey: rootNavigatorKey,
                  builder: (context, state) => AttractionDetailScreen(
                    slug: state.pathParameters['slug']!,
                  ),
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/map',
              builder: (context, state) => const MapScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/plan',
              builder: (context, state) => const PlanScreen(),
            ),
          ],
        ),
      ],
    ),
    ..._fullscreenRoutes,
  ],
);

/// Full-screen routes outside the tab shell.
final List<RouteBase> _fullscreenRoutes = [
  GoRoute(
    path: '/search',
    parentNavigatorKey: rootNavigatorKey,
    builder: (context, state) => SearchScreen(
      initialQuery: state.uri.queryParameters['q'] ?? '',
    ),
  ),
  GoRoute(
    path: '/gallery',
    parentNavigatorKey: rootNavigatorKey,
    builder: (context, state) => const GalleryScreen(),
    routes: [
      GoRoute(
        path: ':id',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => GalleryAlbumScreen(
          albumId: state.pathParameters['id']!,
        ),
      ),
    ],
  ),
  GoRoute(
    path: '/services',
    parentNavigatorKey: rootNavigatorKey,
    builder: (context, state) => ServicesScreen(
      initialCategory: state.uri.queryParameters['category'],
    ),
  ),
  GoRoute(
    path: '/contact',
    parentNavigatorKey: rootNavigatorKey,
    builder: (context, state) => const ContactScreen(),
  ),
  GoRoute(
    path: '/guides',
    parentNavigatorKey: rootNavigatorKey,
    builder: (context, state) => const GuidesScreen(),
    routes: [
      GoRoute(
        path: ':slug',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => GuideDetailScreen(
          slug: state.pathParameters['slug']!,
        ),
      ),
    ],
  ),
  GoRoute(
    path: '/itineraries',
    parentNavigatorKey: rootNavigatorKey,
    builder: (context, state) => const ItinerariesScreen(),
    routes: [
      GoRoute(
        path: ':slug',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => ItineraryDetailScreen(
          slug: state.pathParameters['slug']!,
        ),
      ),
    ],
  ),
  GoRoute(
    path: '/news',
    parentNavigatorKey: rootNavigatorKey,
    builder: (context, state) => const NewsScreen(),
    routes: [
      GoRoute(
        path: ':slug',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => AnnouncementDetailScreen(
          slug: state.pathParameters['slug']!,
        ),
      ),
    ],
  ),
  GoRoute(
    path: '/book',
    parentNavigatorKey: rootNavigatorKey,
    builder: (context, state) => BookScreen(
      initialGuideId: state.uri.queryParameters['guideId'],
    ),
    routes: [
      GoRoute(
        path: 'status',
        parentNavigatorKey: rootNavigatorKey,
        builder: (context, state) => const BookingStatusScreen(),
      ),
    ],
  ),
  GoRoute(
    path: '/events/status',
    parentNavigatorKey: rootNavigatorKey,
    builder: (context, state) => const EventRegistrationStatusScreen(),
  ),
  GoRoute(
    path: '/settings/notifications',
    parentNavigatorKey: rootNavigatorKey,
    builder: (context, state) => const NotificationSettingsScreen(),
  ),
];

class _RouterErrorScreen extends StatelessWidget {
  const _RouterErrorScreen({required this.error});

  final Exception? error;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: const AppBackButton(),
        title: const Text('Page not found'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                error?.toString() ?? 'Unknown routing error',
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              FilledButton(
                onPressed: () => context.go('/'),
                child: const Text('Back to home'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Normalizes in-app paths before navigation (trim, ensure leading slash).
String normalizeAppPath(String location) {
  final trimmed = location.trim();
  if (trimmed.isEmpty) return '/';
  return trimmed.startsWith('/') ? trimmed : '/$trimmed';
}

/// Navigate to a full-screen route.
///
/// Uses [GoRouter.go] — `push` does not render correctly with our shell setup.
void pushAppRoute(BuildContext context, String location) {
  GoRouter.of(context).go(normalizeAppPath(location));
}

void goAppRoute(BuildContext context, String location) {
  GoRouter.of(context).go(normalizeAppPath(location));
}

/// Back from a full-screen page — pop when possible, otherwise home.
void popAppRoute(BuildContext context) {
  final router = GoRouter.of(context);
  if (router.canPop()) {
    router.pop();
  } else {
    router.go('/');
  }
}

/// Standard back control for routes outside the tab shell.
class AppBackButton extends StatelessWidget {
  const AppBackButton({super.key});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      tooltip: 'Back',
      onPressed: () => popAppRoute(context),
    );
  }
}

/// App bar with a working back button for full-screen routes.
PreferredSizeWidget appBarWithBack({
  required BuildContext context,
  required String title,
  List<Widget>? actions,
}) {
  return AppBar(
    leading: const AppBackButton(),
    title: Text(title),
    actions: actions,
  );
}
