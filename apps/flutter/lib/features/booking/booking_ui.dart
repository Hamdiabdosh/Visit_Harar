import 'package:flutter/material.dart';

import '../../core/theme/app_theme.dart';

class BookingStatusColors {
  const BookingStatusColors({required this.background, required this.foreground});

  final Color background;
  final Color foreground;
}

BookingStatusColors bookingStatusStyle(String status) {
  switch (status) {
    case 'Pending':
      return const BookingStatusColors(
        background: Color(0xFFFEF3C7),
        foreground: Color(0xFF92400E),
      );
    case 'Confirmed':
      return const BookingStatusColors(
        background: Color(0xFFDCFCE7),
        foreground: Color(0xFF166534),
      );
    case 'Declined':
      return const BookingStatusColors(
        background: Color(0xFFFEE2E2),
        foreground: Color(0xFF991B1B),
      );
    case 'Cancelled':
      return const BookingStatusColors(
        background: Color(0xFFF3F4F6),
        foreground: Color(0xFF374151),
      );
    default:
      return const BookingStatusColors(
        background: AppColors.border,
        foreground: AppColors.ink,
      );
  }
}

class BookingReviewRow extends StatelessWidget {
  const BookingReviewRow({super.key, required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.inkMuted)),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value.isEmpty ? '—' : value,
              textAlign: TextAlign.end,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class BookingStepIndicator extends StatelessWidget {
  const BookingStepIndicator({
    super.key,
    required this.labels,
    required this.currentStep,
  });

  final List<String> labels;
  final int currentStep;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < labels.length; i++) ...[
          if (i > 0) const SizedBox(width: 6),
          Expanded(
            child: Column(
              children: [
                Container(
                  height: 4,
                  decoration: BoxDecoration(
                    color: i <= currentStep ? AppColors.brand : AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  labels[i],
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: i <= currentStep ? FontWeight.w600 : FontWeight.normal,
                    color: i <= currentStep ? AppColors.brand : AppColors.inkMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}
