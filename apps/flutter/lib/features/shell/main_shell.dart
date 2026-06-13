import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../routing/app_router.dart';

class MainShell extends StatelessWidget {
  const MainShell({super.key, required this.navigationShell});

  final StatefulNavigationShell navigationShell;

  void _onShellTap(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  /// Visual bar: Home, Places, Book, Map, Plan — shell has four tabs (no book branch).
  int _visualSelectedIndex(int shellIndex) =>
      shellIndex < 2 ? shellIndex : shellIndex + 1;

  void _onVisualTap(BuildContext context, int visualIndex) {
    if (visualIndex == 2) {
      pushAppRoute(context, '/book');
      return;
    }
    final shellIndex = visualIndex < 2 ? visualIndex : visualIndex - 1;
    _onShellTap(shellIndex);
  }

  @override
  Widget build(BuildContext context) {
    final selected = _visualSelectedIndex(navigationShell.currentIndex);

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: Material(
        elevation: 8,
        shadowColor: AppColors.ink.withValues(alpha: 0.08),
        color: Colors.white,
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 68,
            child: Row(
              children: [
                _ShellNavItem(
                  label: 'Home',
                  icon: Icons.home_outlined,
                  selectedIcon: Icons.home,
                  selected: selected == 0,
                  onTap: () => _onVisualTap(context, 0),
                ),
                _ShellNavItem(
                  label: 'Places',
                  icon: Icons.account_balance_outlined,
                  selectedIcon: Icons.account_balance,
                  selected: selected == 1,
                  onTap: () => _onVisualTap(context, 1),
                ),
                Expanded(
                  flex: 2,
                  child: Center(
                    child: _BookGuideNavButton(
                      onTap: () => _onVisualTap(context, 2),
                    ),
                  ),
                ),
                _ShellNavItem(
                  label: 'Map',
                  icon: Icons.map_outlined,
                  selectedIcon: Icons.map,
                  selected: selected == 3,
                  onTap: () => _onVisualTap(context, 3),
                ),
                _ShellNavItem(
                  label: 'Plan',
                  icon: Icons.calendar_month_outlined,
                  selectedIcon: Icons.calendar_month,
                  selected: selected == 4,
                  onTap: () => _onVisualTap(context, 4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _ShellNavItem extends StatelessWidget {
  const _ShellNavItem({
    required this.label,
    required this.icon,
    required this.selectedIcon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = selected ? AppColors.brand : AppColors.inkMuted;

    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(selected ? selectedIcon : icon, color: color, size: 22),
            const SizedBox(height: 4),
            Text(
              label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: color,
                    fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
                    fontSize: 12,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BookGuideNavButton extends StatelessWidget {
  const _BookGuideNavButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.gold,
      elevation: 2,
      shadowColor: AppColors.ink.withValues(alpha: 0.15),
      borderRadius: BorderRadius.circular(AppRadius.chip),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.person_search_outlined,
                color: AppColors.ink,
                size: 18,
              ),
              const SizedBox(width: 6),
              Text(
                'Book guide',
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: AppColors.ink,
                      fontSize: 13,
                    ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
