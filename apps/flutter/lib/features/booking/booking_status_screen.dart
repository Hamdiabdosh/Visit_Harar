import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/models.dart';
import '../../core/providers/api_providers.dart';
import '../../core/storage/recent_booking_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/form_widgets.dart';
import 'booking_constants.dart';
import 'booking_ui.dart';

class BookingStatusScreen extends ConsumerStatefulWidget {
  const BookingStatusScreen({super.key});

  @override
  ConsumerState<BookingStatusScreen> createState() =>
      _BookingStatusScreenState();
}

class _BookingStatusScreenState extends ConsumerState<BookingStatusScreen> {
  late final _refController = TextEditingController();
  late final _emailController = TextEditingController();
  BookingStatus? _result;
  bool _notFound = false;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    RecentBookingStorage.load().then((recent) {
      if (!mounted || recent == null) return;
      setState(() {
        _refController.text = recent.bookingRef;
        _emailController.text = recent.visitorEmail;
      });
    });
  }

  @override
  void dispose() {
    _refController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _lookup() async {
    setState(() {
      _loading = true;
      _notFound = false;
      _result = null;
    });
    try {
      final api = ref.read(apiProvider);
      final status = await api.getBookingStatus(
        BookingStatusInput(
          bookingRef: _refController.text.trim(),
          visitorEmail: _emailController.text.trim(),
        ),
      );
      if (!mounted) return;
      setState(() => _result = status);
    } catch (_) {
      if (!mounted) return;
      setState(() => _notFound = true);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final canSubmit = _refController.text.trim().isNotEmpty &&
        _emailController.text.trim().isNotEmpty;

    return Scaffold(
      appBar: appBarWithBack(context: context, title: 'Booking status'),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Enter your booking reference and the email you used when submitting.',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppColors.inkMuted,
                ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  LabeledTextField(
                    label: 'Booking reference',
                    controller: _refController,
                    hintText: 'HRR-2026-00001',
                    autocorrect: false,
                  ),
                  LabeledTextField(
                    label: 'Email address',
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    autocorrect: false,
                  ),
                  FilledButton(
                    onPressed: _loading || !canSubmit ? null : _lookup,
                    child: _loading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Check status'),
                  ),
                ],
              ),
            ),
          ),
          if (_notFound)
            const Padding(
              padding: EdgeInsets.only(top: 12),
              child: Text(
                'No booking found for that reference and email. Please check '
                'your details and try again.',
                textAlign: TextAlign.center,
              ),
            ),
          if (_result != null) ...[
            const SizedBox(height: 12),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            _result!.bookingRef,
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                              color: AppColors.brand,
                            ),
                          ),
                        ),
                        _StatusBadge(status: _result!.status),
                      ],
                    ),
                    const Divider(height: 24),
                    BookingReviewRow(label: 'Guide', value: _result!.guideName),
                    BookingReviewRow(
                      label: 'Tour date',
                      value: BookingConstants.formatTourDate(_result!.tourDate),
                    ),
                    BookingReviewRow(
                      label: 'Duration',
                      value: _result!.tourDuration,
                    ),
                    BookingReviewRow(
                      label: 'Group size',
                      value: '${_result!.groupSize}',
                    ),
                    if (_result!.statusNote != null &&
                        _result!.statusNote!.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'MESSAGE FROM THE COMMISSION',
                              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.inkMuted,
                                  ),
                            ),
                            const SizedBox(height: 6),
                            Text(_result!.statusNote!),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
          const SizedBox(height: 24),
          TextButton(
            onPressed: () => pushAppRoute(context, '/book'),
            child: const Text('Submit a new booking request'),
          ),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    final colors = bookingStatusStyle(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: colors.background,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          color: colors.foreground,
        ),
      ),
    );
  }
}
