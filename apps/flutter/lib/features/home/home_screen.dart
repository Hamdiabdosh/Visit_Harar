import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../api/models.dart';
import '../../core/providers/api_providers.dart';
import '../../core/theme/app_theme.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/page_widgets.dart';
import '../../core/widgets/place_card.dart';
import '../../core/utils/media_url.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final heroAsync = ref.watch(heroProvider);
    final featuredAsync = ref.watch(featuredAttractionsProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(heroProvider);
          ref.invalidate(featuredAttractionsProvider);
          ref.invalidate(attractionsProvider);
          await ref.read(heroProvider.future);
        },
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: heroAsync.when(
                loading: () => const _HomeHeroFallback(loading: true),
                error: (_, __) => const _HomeHeroFallback(),
                data: (hero) => _HomeHero(hero: hero),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                AppSpacing.section,
                AppSpacing.page,
                AppSpacing.bottomNav,
              ),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  _HomeActionCard(
                    meta: 'Explore',
                    title: 'Discover Jugol',
                    body:
                        'Browse UNESCO-listed sites, explore the offline map, '
                        'and follow commission-curated itineraries.',
                    primaryLabel: 'View attractions',
                    onPrimary: () => context.go('/attractions'),
                    secondaryLabel: 'Open map',
                    onSecondary: () => context.go('/map'),
                  ),
                  const SizedBox(height: AppSpacing.cardGap),
                  _HomeActionCard(
                    meta: 'Book a guide',
                    title: 'Licensed local guides',
                    body:
                        'Request a tour with a commission-registered guide. '
                        'No payment in the app — the bureau confirms within two business days.',
                    primaryLabel: 'Book a guide',
                    onPrimary: () => pushAppRoute(context, '/book'),
                    secondaryLabel: 'Browse all guides',
                    onSecondary: () => pushAppRoute(context, '/guides'),
                  ),
                  const SizedBox(height: AppSpacing.section),
                  const SectionHeading(title: 'Quick links'),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      QuickLinkChip(
                        icon: Icons.search,
                        label: 'Search',
                        onTap: () => pushAppRoute(context, '/search'),
                      ),
                      QuickLinkChip(
                        icon: Icons.route_outlined,
                        label: 'Itineraries',
                        onTap: () => pushAppRoute(context, '/itineraries'),
                      ),
                      QuickLinkChip(
                        icon: Icons.newspaper_outlined,
                        label: 'News & events',
                        onTap: () => pushAppRoute(context, '/news'),
                      ),
                      QuickLinkChip(
                        icon: Icons.calendar_month_outlined,
                        label: 'Plan trip',
                        onTap: () => goAppRoute(context, '/plan'),
                      ),
                      QuickLinkChip(
                        icon: Icons.mail_outline,
                        label: 'Contact',
                        onTap: () => pushAppRoute(context, '/contact'),
                      ),
                      QuickLinkChip(
                        icon: Icons.photo_library_outlined,
                        label: 'Gallery',
                        onTap: () => pushAppRoute(context, '/gallery'),
                      ),
                      QuickLinkChip(
                        icon: Icons.store_outlined,
                        label: 'Services',
                        onTap: () => pushAppRoute(context, '/services'),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.section),
                  featuredAsync.when(
                    loading: () => const _FeaturedPlacesSkeleton(),
                    error: (_, __) => const SizedBox.shrink(),
                    data: (featured) {
                      if (featured.isEmpty) return const SizedBox.shrink();
                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SectionHeading(
                            title: 'Featured places',
                            subtitle: 'UNESCO heritage and must-see sites',
                          ),
                          const SizedBox(height: 14),
                          SizedBox(
                            height: 290,
                            child: ListView.separated(
                              scrollDirection: Axis.horizontal,
                              itemCount: featured.length,
                              separatorBuilder: (_, __) =>
                                  const SizedBox(width: 14),
                              itemBuilder: (context, index) {
                                final item = featured[index];
                                return PlaceCard(
                                  width: 260,
                                  title: item.title,
                                  subtitle: item.shortDesc,
                                  imageUrl: item.image,
                                  category: item.category,
                                  onTap: () => pushAppRoute(
                                    context,
                                    '/attractions/${item.slug}',
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                ]),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _HomeHero extends StatelessWidget {
  const _HomeHero({required this.hero});

  final HeroContent? hero;

  static const _heroHeight = 480.0;

  @override
  Widget build(BuildContext context) {
    if (hero == null) return const _HomeHeroFallback();

    final imageUrl = resolveMediaUrl(hero!.backgroundImage);
    final headlineItalic = hero!.headlineItalic?.replaceAll('\\n', '\n');

    return SizedBox(
      height: _heroHeight,
      child: Stack(
        fit: StackFit.expand,
        children: [
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.brandDark, AppColors.brand, AppColors.brandDark],
              ),
            ),
          ),
          if (imageUrl != null)
            CachedNetworkImage(
              imageUrl: imageUrl,
              fit: BoxFit.cover,
              placeholder: (_, __) => const SizedBox.shrink(),
              errorWidget: (_, __, ___) => const SizedBox.shrink(),
            ),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [Color(0x80000000), Color(0x40000000), Colors.transparent],
              ),
            ),
          ),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [Color(0xCC000000), Color(0x33000000), Color(0x40000000)],
              ),
            ),
          ),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                12,
                AppSpacing.page,
                28,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const TrustBadge(),
                  const Spacer(),
                  if (hero!.badgeText != null && hero!.badgeText!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        hero!.badgeText!.toUpperCase(),
                        style: Theme.of(context).textTheme.labelSmall?.copyWith(
                              color: AppColors.gold,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                      ),
                    ),
                  Text.rich(
                    TextSpan(
                      children: [
                        if (hero!.headline != null && hero!.headline!.isNotEmpty)
                          TextSpan(
                            text: hero!.headline,
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.copyWith(
                                  color: Colors.white,
                                  fontSize: 32,
                                  height: 1.08,
                                ),
                          ),
                        if (headlineItalic != null && headlineItalic.isNotEmpty)
                          TextSpan(
                            text: '\n$headlineItalic',
                            style: Theme.of(context)
                                .textTheme
                                .headlineSmall
                                ?.copyWith(
                                  color: AppColors.gold,
                                  fontStyle: FontStyle.italic,
                                  fontWeight: FontWeight.w500,
                                  fontSize: 32,
                                  height: 1.08,
                                ),
                          ),
                      ],
                    ),
                  ),
                  if (hero!.subheading != null && hero!.subheading!.isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Text(
                      hero!.subheading!,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.white.withValues(alpha: 0.88),
                            height: 1.45,
                          ),
                    ),
                  ],
                  if (hero!.stats.isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        for (var i = 0; i < hero!.stats.length; i++) ...[
                          if (i > 0) const SizedBox(width: 20),
                          Expanded(
                            child: _HeroStat(
                              number: hero!.stats[i].number,
                              label: hero!.stats[i].label,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                  const SizedBox(height: 20),
                  Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      FilledButton(
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.gold,
                          foregroundColor: AppColors.ink,
                        ),
                        onPressed: () => _openHeroLink(
                          context,
                          hero!.ctaPrimaryUrl,
                          fallback: () => context.go('/plan'),
                        ),
                        child: Text(hero!.ctaPrimaryText ?? 'Plan your visit'),
                      ),
                      if (hero!.ctaGhostText != null &&
                          hero!.ctaGhostText!.isNotEmpty)
                        OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.white,
                            side: BorderSide(
                              color: Colors.white.withValues(alpha: 0.45),
                            ),
                          ),
                          onPressed: () => _openHeroLink(
                            context,
                            hero!.ctaGhostUrl,
                            fallback: () => context.go('/map'),
                          ),
                          child: Text(hero!.ctaGhostText!),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _openHeroLink(
    BuildContext context,
    String? url, {
    required VoidCallback fallback,
  }) {
    if (url == null || url.isEmpty || url == '#') {
      fallback();
      return;
    }
    if (url.startsWith('/attractions')) {
      context.go('/attractions');
    } else if (url.contains('plan') || url.contains('itinerar')) {
      context.go('/plan');
    } else if (url.contains('map')) {
      context.go('/map');
    } else if (url.contains('book') || url.contains('guide')) {
      pushAppRoute(context, '/book');
    } else {
      fallback();
    }
  }
}

class _HomeHeroFallback extends StatelessWidget {
  const _HomeHeroFallback({this.loading = false});

  final bool loading;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 360,
      child: Stack(
        fit: StackFit.expand,
        children: [
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [AppColors.brandDark, AppColors.brand],
              ),
            ),
          ),
          SafeArea(
            bottom: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                16,
                AppSpacing.page,
                28,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const TrustBadge(),
                  const Spacer(),
                  if (loading)
                    const Padding(
                      padding: EdgeInsets.only(bottom: 12),
                      child: LinearProgressIndicator(
                        color: AppColors.gold,
                        backgroundColor: Colors.white24,
                      ),
                    ),
                  Text(
                    'Visit Harar',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          color: Colors.white,
                          fontSize: 34,
                        ),
                  ),
                  const SizedBox(height: 10),
                  Text(
                    'Official tourism guide to Harar Jugol — attractions, map, '
                    'itineraries, and licensed guides.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.88),
                          height: 1.4,
                        ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroStat extends StatelessWidget {
  const _HeroStat({required this.number, required this.label});

  final String number;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          number,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
                color: AppColors.gold,
                fontSize: 28,
              ),
        ),
        Text(
          label.toUpperCase(),
          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                color: Colors.white.withValues(alpha: 0.65),
                letterSpacing: 0.6,
              ),
        ),
      ],
    );
  }
}

class _HomeActionCard extends StatelessWidget {
  const _HomeActionCard({
    required this.meta,
    required this.title,
    required this.body,
    required this.primaryLabel,
    required this.onPrimary,
    required this.secondaryLabel,
    required this.onSecondary,
  });

  final String meta;
  final String title;
  final String body;
  final String primaryLabel;
  final VoidCallback onPrimary;
  final String secondaryLabel;
  final VoidCallback onSecondary;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.card,
      ),
      child: Padding(
        padding: const EdgeInsets.all(18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              meta.toUpperCase(),
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: AppColors.brand,
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(title, style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            Text(
              body,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.inkMuted,
                  ),
            ),
            const SizedBox(height: 16),
            FilledButton(onPressed: onPrimary, child: Text(primaryLabel)),
            const SizedBox(height: 6),
            TextButton(onPressed: onSecondary, child: Text(secondaryLabel)),
          ],
        ),
      ),
    );
  }
}

class _FeaturedPlacesSkeleton extends StatelessWidget {
  const _FeaturedPlacesSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 160,
          height: 22,
          decoration: BoxDecoration(
            color: AppColors.border,
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: 290,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: 3,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (_, __) => Container(
              width: 260,
              decoration: BoxDecoration(
                color: AppColors.border.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(AppRadius.card),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
