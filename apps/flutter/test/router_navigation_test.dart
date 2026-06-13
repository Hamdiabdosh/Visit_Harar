import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:visit_harar/routing/app_router.dart';
import 'package:visit_harar/features/gallery/gallery_screen.dart';
import 'package:visit_harar/features/search/search_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  for (final loc in ['/search', '/gallery', '/contact', '/services']) {
    testWidgets('go $loc renders screen', (tester) async {
      await tester.pumpWidget(
        ProviderScope(child: MaterialApp.router(routerConfig: appRouter)),
      );
      appRouter.go(loc);
      await tester.pumpAndSettle();
      expect(appRouter.state.uri.path, loc);
    });
  }

  testWidgets('go /search shows SearchScreen', (tester) async {
    await tester.pumpWidget(
      ProviderScope(child: MaterialApp.router(routerConfig: appRouter)),
    );
    appRouter.go('/search');
    await tester.pumpAndSettle();
    expect(find.byType(SearchScreen), findsOneWidget);
  });

  testWidgets('go /gallery shows GalleryScreen', (tester) async {
    await tester.pumpWidget(
      ProviderScope(child: MaterialApp.router(routerConfig: appRouter)),
    );
    appRouter.go('/gallery');
    await tester.pumpAndSettle();
    expect(find.byType(GalleryScreen), findsOneWidget);
  });
}
