import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Scaffold shell for features not yet implemented (F1–F3).
class PhasePlaceholder extends StatelessWidget {
  const PhasePlaceholder({
    super.key,
    required this.title,
    required this.phase,
    this.subtitle,
  });

  final String title;
  final String phase;
  final String? subtitle;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.construction_outlined, size: 48, color: AppColors.brand),
              const SizedBox(height: 16),
              Text(
                phase,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: AppColors.brand,
                      fontWeight: FontWeight.w600,
                    ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 8),
                Text(
                  subtitle!,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: AppColors.inkMuted,
                      ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
