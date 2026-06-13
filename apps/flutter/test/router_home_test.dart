import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:visit_harar/features/gallery/gallery_screen.dart';
import 'package:visit_harar/features/home/home_screen.dart';
import 'package:visit_harar/features/shell/main_shell.dart';
import 'package:visit_harar/routing/app_router.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  Future<void> pumpApp(WidgetTester tester) async {
    await tester.pumpWidget(
      ProviderScope(child: MaterialApp.router(routerConfig: appRouter)),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('initial location shows home in shell', (tester) async {
    await pumpApp(tester);
    expect(find.byType(MainShell), findsOneWidget);
    expect(find.byType(HomeScreen), findsOneWidget);
  });

  testWidgets('go to gallery and back to home', (tester) async {
    await pumpApp(tester);

    appRouter.go('/gallery');
    await tester.pumpAndSettle();
    expect(find.byType(GalleryScreen), findsOneWidget);

    appRouter.go('/');
    await tester.pumpAndSettle();
    expect(find.byType(MainShell), findsOneWidget);
    expect(find.byType(HomeScreen), findsOneWidget);
  });

  testWidgets('popAppRoute from gallery returns home', (tester) async {
    await pumpApp(tester);

    appRouter.go('/gallery');
    await tester.pumpAndSettle();
    expect(find.byType(GalleryScreen), findsOneWidget);

    await tester.tap(find.byTooltip('Back'));
    await tester.pumpAndSettle();
    expect(find.byType(HomeScreen), findsOneWidget);
  });

  testWidgets('error screen back to home works', (tester) async {
    await pumpApp(tester);

    appRouter.go('/does-not-exist');
    await tester.pumpAndSettle();
    expect(find.text('Back to home'), findsOneWidget);

    await tester.tap(find.text('Back to home'));
    await tester.pumpAndSettle();
    expect(find.byType(HomeScreen), findsOneWidget);
  });
}
