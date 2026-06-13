import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Fallback gradients for non-attraction content cards.
abstract final class ContentGradients {
  static const guide = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.brandDark, AppColors.brand, Color(0xFF5EEAD4)],
  );

  static const news = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1E3A8A), Color(0xFF2563EB), Color(0xFF60A5FA)],
  );

  static const event = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF78350F), AppColors.gold, Color(0xFFFDE68A)],
  );

  static const itinerary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF134E4A), Color(0xFF0D9488), Color(0xFF5EEAD4)],
  );

  static const partner = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [AppColors.brandDark, AppColors.brand, AppColors.gold],
  );

  static const gallery = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF44403C), Color(0xFF78716C), Color(0xFFA8A29E)],
  );

  static LinearGradient forAnnouncementType(String type) {
    return type == 'Event' ? event : news;
  }
}
