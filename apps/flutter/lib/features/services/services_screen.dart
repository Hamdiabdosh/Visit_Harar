import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../api/models.dart';
import '../../core/providers/api_providers.dart';
import '../../core/constants/content_gradients.dart';
import '../../core/theme/app_theme.dart';
import '../../core/widgets/category_badge.dart';
import '../../core/widgets/cms_image.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/page_widgets.dart';

class ServicesScreen extends ConsumerStatefulWidget {
  const ServicesScreen({super.key, this.initialCategory});

  final String? initialCategory;

  @override
  ConsumerState<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends ConsumerState<ServicesScreen> {
  late String _category;

  @override
  void initState() {
    super.initState();
    final initial = widget.initialCategory?.trim();
    _category = initial != null &&
            initial.isNotEmpty &&
            partnerCategories.contains(initial)
        ? initial
        : 'All';
  }

  @override
  Widget build(BuildContext context) {
    final partnersAsync = ref.watch(partnersProvider);

    return Scaffold(
      appBar: appBarWithBack(context: context, title: 'Local services'),
      body: partnersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(partnersProvider),
        ),
        data: (partners) {
          final filtered = _category == 'All'
              ? partners
              : partners.where((p) => p.category == _category).toList();
          final featured = filtered.where((p) => p.isFeatured).toList();
          final rest = filtered.where((p) => !p.isFeatured).toList();

          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(partnersProvider),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.page,
                8,
                AppSpacing.page,
                32,
              ),
              children: [
                const ListIntro(
                  text:
                      'Hotels, dining, transport, and other trusted partners '
                      'recommended by the commission.',
                ),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      CategoryFilterChip(
                        label: 'All',
                        selected: _category == 'All',
                        onTap: () => setState(() => _category = 'All'),
                      ),
                      ...partnerCategories.map(
                        (category) => Padding(
                          padding: const EdgeInsets.only(left: 8),
                          child: CategoryFilterChip(
                            label: category,
                            selected: _category == category,
                            onTap: () => setState(() => _category = category),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                if (filtered.isEmpty)
                  const EmptyState(
                    title: 'No partners in this category',
                    message: 'Partner listings will appear here soon.',
                    icon: Icons.store_outlined,
                  )
                else ...[
                  if (featured.isNotEmpty) ...[
                    const SectionHeading(title: 'Featured'),
                    const SizedBox(height: 12),
                    ...featured.map(
                      (partner) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _PartnerCard(partner: partner),
                      ),
                    ),
                    const SizedBox(height: 8),
                  ],
                  if (rest.isNotEmpty) ...[
                    if (featured.isNotEmpty) const SectionHeading(title: 'All'),
                    if (featured.isNotEmpty) const SizedBox(height: 12),
                    ...rest.map(
                      (partner) => Padding(
                        padding: const EdgeInsets.only(bottom: 12),
                        child: _PartnerCard(partner: partner),
                      ),
                    ),
                  ],
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _PartnerCard extends StatelessWidget {
  const _PartnerCard({required this.partner});

  final PartnerSummary partner;

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.card,
      ),
      child: Material(
        color: Colors.transparent,
        clipBehavior: Clip.antiAlias,
        borderRadius: BorderRadius.circular(AppRadius.card),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (partner.image != null && partner.image!.isNotEmpty)
              Stack(
                children: [
                  CmsCoverImage(url: partner.image, aspectRatio: 16 / 7),
                  Positioned(
                    left: 12,
                    bottom: 12,
                    child: ImageOverlayLabel(label: partner.category),
                  ),
                ],
              )
            else
              AspectRatio(
                aspectRatio: 16 / 7,
                child: DecoratedBox(
                  decoration: const BoxDecoration(
                    gradient: ContentGradients.partner,
                  ),
                  child: Align(
                    child: Icon(
                      Icons.store_outlined,
                      size: 36,
                      color: Colors.white.withValues(alpha: 0.4),
                    ),
                  ),
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          partner.name,
                          style: theme.textTheme.titleMedium,
                        ),
                      ),
                      CategoryBadge(label: partner.category, compact: true),
                    ],
                  ),
                  if (partner.description != null &&
                      partner.description!.trim().isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      partner.description!.trim(),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: AppColors.inkMuted,
                      ),
                    ),
                  ],
                  if (partner.address != null &&
                      partner.address!.trim().isNotEmpty) ...[
                    const SizedBox(height: 12),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          size: 16,
                          color: AppColors.inkMuted,
                        ),
                        const SizedBox(width: 6),
                        Expanded(child: Text(partner.address!.trim())),
                      ],
                    ),
                  ],
                  if (partner.phone != null && partner.phone!.trim().isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: InkWell(
                        onTap: () => _openUrl('tel:${partner.phone}'),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.phone_outlined,
                              size: 16,
                              color: AppColors.inkMuted,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              partner.phone!.trim(),
                              style: const TextStyle(color: AppColors.brand),
                            ),
                          ],
                        ),
                      ),
                    ),
                  if (partner.website != null &&
                      partner.website!.trim().isNotEmpty) ...[
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: () => _openUrl(partner.website!.trim()),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Visit website',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: AppColors.brand,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.open_in_new,
                            size: 14,
                            color: AppColors.brand,
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
