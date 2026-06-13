import 'package:flutter/material.dart';
import 'package:flutter_widget_from_html/flutter_widget_from_html.dart';

import '../theme/app_theme.dart';

/// Renders CMS HTML/plain text for detail screens.
class CmsBody extends StatelessWidget {
  const CmsBody({super.key, required this.html});

  final String html;

  @override
  Widget build(BuildContext context) {
    final trimmed = html.trim();
    if (trimmed.isEmpty) return const SizedBox.shrink();

    final looksLikeHtml = trimmed.contains('<') && trimmed.contains('>');

    if (!looksLikeHtml) {
      return Text(
        trimmed,
        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: AppColors.inkMuted,
              height: 1.55,
            ),
      );
    }

    return HtmlWidget(
      trimmed,
      textStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: AppColors.inkMuted,
            height: 1.55,
          ),
    );
  }
}
