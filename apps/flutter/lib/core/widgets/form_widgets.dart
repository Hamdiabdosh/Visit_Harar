import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class LabeledTextField extends StatelessWidget {
  const LabeledTextField({
    super.key,
    required this.label,
    required this.controller,
    this.keyboardType,
    this.autocorrect = true,
    this.maxLines = 1,
    this.hintText,
  });

  final String label;
  final TextEditingController controller;
  final TextInputType? keyboardType;
  final bool autocorrect;
  final int maxLines;
  final String? hintText;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label.toUpperCase(),
            style: Theme.of(context).textTheme.labelSmall?.copyWith(
                  color: AppColors.ink,
                ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: controller,
            keyboardType: keyboardType,
            autocorrect: autocorrect,
            maxLines: maxLines,
            decoration: InputDecoration(hintText: hintText),
          ),
        ],
      ),
    );
  }
}
