import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/models.dart';
import '../../core/providers/api_providers.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/media_url.dart';
import '../../core/widgets/cms_image.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/place_card.dart';
import 'search_utils.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key, this.initialQuery = ''});

  final String initialQuery;

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  late final TextEditingController _controller;
  Timer? _debounce;
  String _debouncedQuery = '';

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialQuery);
    _debouncedQuery = widget.initialQuery.trim();
    _controller.addListener(_onQueryChanged);
  }

  void _onQueryChanged() {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      if (!mounted) return;
      setState(() => _debouncedQuery = _controller.text.trim());
    });
  }

  void _submit() {
    _debounce?.cancel();
    final next = _controller.text.trim();
    setState(() => _debouncedQuery = next);
    FocusScope.of(context).unfocus();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _controller.removeListener(_onQueryChanged);
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final trimmed = _debouncedQuery.trim();
    final resultsAsync = trimmed.length >= 2
        ? ref.watch(searchProvider(trimmed))
        : null;

    return Scaffold(
      appBar: appBarWithBack(context: context, title: 'Search'),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    textInputAction: TextInputAction.search,
                    onSubmitted: (_) => _submit(),
                    decoration: InputDecoration(
                      hintText: 'Attractions, guides, news…',
                      prefixIcon: const Icon(Icons.search),
                      filled: true,
                      fillColor: Colors.white,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.brand, width: 2),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(
                  onPressed: _submit,
                  child: const Text('Search'),
                ),
              ],
            ),
          ),
          Expanded(
            child: trimmed.length < 2
                ? const _SearchHint()
                : resultsAsync!.when(
                    loading: () => const Center(child: CircularProgressIndicator()),
                    error: (e, _) => ApiErrorBody(
                      message: errorMessage(e),
                      onRetry: () => ref.invalidate(searchProvider(trimmed)),
                    ),
                    data: (data) => _SearchResults(data: data),
                  ),
          ),
        ],
      ),
    );
  }
}

class _SearchHint extends StatelessWidget {
  const _SearchHint();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(16),
      child: Text(
        'Enter at least 2 characters to search attractions, guides, and news.',
        style: TextStyle(color: AppColors.inkMuted),
      ),
    );
  }
}

class _SearchResults extends StatelessWidget {
  const _SearchResults({required this.data});

  final SearchResult data;

  @override
  Widget build(BuildContext context) {
    if (data.results.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16),
        child: Text(
          'No results found. Try different keywords.',
          style: TextStyle(color: AppColors.inkMuted),
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      itemCount: data.results.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        return _SearchResultTile(item: data.results[index]);
      },
    );
  }
}

class _SearchResultTile extends StatelessWidget {
  const _SearchResultTile({required this.item});

  final SearchResultItem item;

  @override
  Widget build(BuildContext context) {
    if (item.type == 'attraction') {
      return PlaceCard(
        title: item.title,
        subtitle: item.excerpt,
        imageUrl: item.image,
        category: item.meta,
        imageLabel: item.meta ?? searchTypeLabel(item.type),
        onTap: () => openSearchResult(context, item),
      );
    }

    final theme = Theme.of(context);
    final hasImage = resolveMediaUrl(item.image) != null;

    return DecoratedBox(
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(AppRadius.card),
        border: Border.all(color: AppColors.border),
        boxShadow: AppShadows.card,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.card),
          onTap: () => openSearchResult(context, item),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (hasImage)
                  CmsThumbnail(url: item.image, size: 64, borderRadius: 8)
                else
                  Container(
                    width: 64,
                    height: 64,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Icon(
                      searchTypeIcon(item.type),
                      color: AppColors.inkMuted,
                    ),
                  ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        searchTypeLabel(item.type).toUpperCase(),
                        style: theme.textTheme.labelSmall?.copyWith(
                          color: AppColors.brand,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.6,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.title,
                        style: theme.textTheme.titleMedium,
                      ),
                      if (item.excerpt.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text(
                          item.excerpt,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: theme.textTheme.bodySmall,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
