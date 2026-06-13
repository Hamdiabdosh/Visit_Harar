import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../api/models.dart';
import '../../core/providers/api_providers.dart';
import '../../core/storage/push_prefs_storage.dart';
import '../../core/storage/recent_booking_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/form_widgets.dart';
import 'booking_constants.dart';
import 'booking_ui.dart';

const _steps = ['Guide', 'Tour', 'You', 'Review'];

class BookScreen extends ConsumerStatefulWidget {
  const BookScreen({super.key, this.initialGuideId});

  final String? initialGuideId;

  @override
  ConsumerState<BookScreen> createState() => _BookScreenState();
}

class _BookScreenState extends ConsumerState<BookScreen> {
  int _step = 0;
  bool _done = false;
  String _bookingRef = '';
  String _submitError = '';
  bool _submitting = false;

  String _guideId = '';
  DateTime _date = BookingConstants.parseMinTourDate();
  String _duration = BookingConstants.tourDurations[1];
  int _group = 2;
  String _country = '';

  late final _nameController = TextEditingController();
  late final _emailController = TextEditingController();
  late final _phoneController = TextEditingController();
  late final _notesController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  String _resolveGuideId(List<GuideSummary> bookable) {
    if (_guideId.isNotEmpty) return _guideId;
    final param = widget.initialGuideId;
    if (param != null && bookable.any((g) => g.id == param)) return param;
    return bookable.first.id;
  }

  bool _canNext(List<GuideSummary> bookable) {
    if (_step == 0) return _resolveGuideId(bookable).isNotEmpty;
    if (_step == 1) return _group >= 1 && _group <= 50;
    if (_step == 2) {
      return _nameController.text.trim().isNotEmpty &&
          _emailController.text.trim().contains('@') &&
          _country.isNotEmpty;
    }
    return true;
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: BookingConstants.parseMinTourDate(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _submit(GuideSummary guide) async {
    setState(() {
      _submitting = true;
      _submitError = '';
    });
    try {
      final api = ref.read(apiProvider);
      final email = _emailController.text.trim();
      final refCode = await api.createBooking(
        BookingInput(
          guideId: guide.id,
          visitorName: _nameController.text.trim(),
          visitorEmail: email,
          visitorCountry: _country,
          tourDate: BookingConstants.dateToIso(_date),
          tourDuration: _duration,
          groupSize: _group,
          visitorPhone: _phoneController.text.trim().isEmpty
              ? null
              : _phoneController.text.trim(),
          specialRequests: _notesController.text.trim().isEmpty
              ? null
              : _notesController.text.trim(),
        ),
      );
      await RecentBookingStorage.save(
        RecentBookingLookup(bookingRef: refCode, visitorEmail: email),
      );
      final pushPrefs = await PushPrefsStorage.load();
      if (pushPrefs.enabled) {
        await PushPrefsStorage.save(
          pushPrefs.copyWith(visitorEmail: email),
        );
      }
      setState(() {
        _bookingRef = refCode;
        _done = true;
      });
    } catch (e) {
      setState(() => _submitError = errorMessage(e));
    } finally {
      setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final enabledAsync = ref.watch(bookingEnabledProvider);
    final guidesAsync = ref.watch(guidesProvider);

    return Scaffold(
      appBar: appBarWithBack(context: context, title: 'Book a guide'),
      body: enabledAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => ApiErrorBody(
          message: errorMessage(e),
          onRetry: () => ref.invalidate(bookingEnabledProvider),
        ),
        data: (enabled) {
          if (!enabled) return _BookingPausedBody(onBrowse: () => pushAppRoute(context, '/guides'));
          return guidesAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (e, _) => ApiErrorBody(
              message: errorMessage(e),
              onRetry: () => ref.invalidate(guidesProvider),
            ),
            data: (guides) {
              final bookable = guides.where((g) => g.isAvailable).toList();

              if (bookable.isEmpty) {
                return _EmptyGuidesBody(onBrowse: () => pushAppRoute(context, '/guides'));
              }

              final selectedId = _resolveGuideId(bookable);
              final guide = bookable.firstWhere((g) => g.id == selectedId);

              if (_done) {
                return _SuccessBody(
                  bookingRef: _bookingRef,
                  email: _emailController.text.trim(),
                  onCheckStatus: () => pushAppRoute(context, '/book/status'),
                  onHome: () => goAppRoute(context, '/'),
                );
              }

              return ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  Text(
                    'Four quick steps. This is a request — not a guaranteed booking.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: AppColors.inkMuted,
                        ),
                  ),
                  const SizedBox(height: 16),
                  BookingStepIndicator(labels: _steps, currentStep: _step),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (_step == 0) _GuideStep(
                            bookable: bookable,
                            guideId: selectedId,
                            onSelect: (id) => setState(() => _guideId = id),
                          ),
                          if (_step == 1)
                            _TourStep(
                              date: _date,
                              duration: _duration,
                              group: _group,
                              onPickDate: _pickDate,
                              onDuration: (d) => setState(() => _duration = d),
                              onGroupChanged: (g) => setState(() => _group = g),
                            ),
                          if (_step == 2)
                            _VisitorStep(
                              nameController: _nameController,
                              emailController: _emailController,
                              phoneController: _phoneController,
                              notesController: _notesController,
                              country: _country,
                              onCountryChanged: (c) => setState(() => _country = c),
                            ),
                          if (_step == 3)
                            _ReviewStep(
                              guide: guide,
                              date: _date,
                              duration: _duration,
                              group: _group,
                              name: _nameController.text.trim(),
                              email: _emailController.text.trim(),
                              country: _country,
                              error: _submitError,
                            ),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              TextButton(
                                onPressed: _step == 0
                                    ? null
                                    : () => setState(() => _step -= 1),
                                child: const Text('Back'),
                              ),
                              const Spacer(),
                              if (_step < _steps.length - 1)
                                FilledButton(
                                  onPressed: _canNext(bookable)
                                      ? () => setState(() => _step += 1)
                                      : null,
                                  child: const Text('Next'),
                                )
                              else
                                FilledButton(
                                  style: FilledButton.styleFrom(
                                    backgroundColor: AppColors.gold,
                                    foregroundColor: AppColors.ink,
                                  ),
                                  onPressed: _submitting || !_canNext(bookable)
                                      ? null
                                      : () => _submit(guide),
                                  child: Text(
                                    _submitting ? 'Submitting…' : 'Submit request',
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }
}

class _GuideStep extends StatelessWidget {
  const _GuideStep({
    required this.bookable,
    required this.guideId,
    required this.onSelect,
  });

  final List<GuideSummary> bookable;
  final String guideId;
  final ValueChanged<String> onSelect;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Select a guide',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 12),
        ...bookable.map(
          (g) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: InkWell(
              onTap: () => onSelect(g.id),
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: guideId == g.id ? AppColors.brand : AppColors.border,
                  ),
                  color: guideId == g.id ? const Color(0xFFF0F7F2) : Colors.white,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      g.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 16,
                      ),
                    ),
                    if (g.languages.isNotEmpty)
                      Text(
                        g.languages.join(', '),
                        style: const TextStyle(color: AppColors.inkMuted),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _TourStep extends StatelessWidget {
  const _TourStep({
    required this.date,
    required this.duration,
    required this.group,
    required this.onPickDate,
    required this.onDuration,
    required this.onGroupChanged,
  });

  final DateTime date;
  final String duration;
  final int group;
  final VoidCallback onPickDate;
  final ValueChanged<String> onDuration;
  final ValueChanged<int> onGroupChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Tour details',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 12),
        const Text(
          'TOUR DATE',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.4,
          ),
        ),
        const SizedBox(height: 6),
        OutlinedButton(
          onPressed: onPickDate,
          style: OutlinedButton.styleFrom(
            minimumSize: const Size.fromHeight(48),
            alignment: Alignment.centerLeft,
          ),
          child: Text(BookingConstants.formatTourDate(BookingConstants.dateToIso(date))),
        ),
        const SizedBox(height: 16),
        const Text(
          'DURATION',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.4,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: BookingConstants.tourDurations.map((d) {
            final active = duration == d;
            return ChoiceChip(
              label: Text(d),
              selected: active,
              onSelected: (_) => onDuration(d),
              selectedColor: AppColors.brand,
              labelStyle: TextStyle(
                color: active ? Colors.white : AppColors.ink,
                fontWeight: active ? FontWeight.w600 : FontWeight.normal,
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 16),
        const Text(
          'GROUP SIZE',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.4,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton.outlined(
              onPressed: group > 1 ? () => onGroupChanged(group - 1) : null,
              icon: const Icon(Icons.remove),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                '$group',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
              ),
            ),
            IconButton.outlined(
              onPressed: group < 50 ? () => onGroupChanged(group + 1) : null,
              icon: const Icon(Icons.add),
            ),
          ],
        ),
      ],
    );
  }
}

class _VisitorStep extends StatelessWidget {
  const _VisitorStep({
    required this.nameController,
    required this.emailController,
    required this.phoneController,
    required this.notesController,
    required this.country,
    required this.onCountryChanged,
  });

  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController phoneController;
  final TextEditingController notesController;
  final String country;
  final ValueChanged<String> onCountryChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your details',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 12),
        LabeledTextField(label: 'Full name', controller: nameController),
        LabeledTextField(
          label: 'Email',
          controller: emailController,
          keyboardType: TextInputType.emailAddress,
          autocorrect: false,
        ),
        LabeledTextField(
          label: 'Phone (optional)',
          controller: phoneController,
          keyboardType: TextInputType.phone,
        ),
        const Text(
          'COUNTRY',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.4,
          ),
        ),
        const SizedBox(height: 6),
        DropdownButtonFormField<String>(
          initialValue: country.isEmpty ? null : country,
          decoration: InputDecoration(
            filled: true,
            fillColor: Colors.white,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
          hint: const Text('Select country…'),
          items: BookingConstants.countries
              .map((c) => DropdownMenuItem(value: c, child: Text(c)))
              .toList(),
          onChanged: (v) {
            if (v != null) onCountryChanged(v);
          },
        ),
        const SizedBox(height: 14),
        LabeledTextField(
          label: 'Special requests (optional)',
          controller: notesController,
          maxLines: 3,
        ),
      ],
    );
  }
}

class _ReviewStep extends StatelessWidget {
  const _ReviewStep({
    required this.guide,
    required this.date,
    required this.duration,
    required this.group,
    required this.name,
    required this.email,
    required this.country,
    required this.error,
  });

  final GuideSummary guide;
  final DateTime date;
  final String duration;
  final int group;
  final String name;
  final String email;
  final String country;
  final String error;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Review & confirm',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
        ),
        const SizedBox(height: 8),
        BookingReviewRow(label: 'Guide', value: guide.name),
        BookingReviewRow(
          label: 'Date',
          value: BookingConstants.formatTourDate(BookingConstants.dateToIso(date)),
        ),
        BookingReviewRow(label: 'Duration', value: duration),
        BookingReviewRow(label: 'Group', value: '$group'),
        BookingReviewRow(label: 'Visitor', value: name),
        BookingReviewRow(label: 'Email', value: email),
        BookingReviewRow(label: 'Country', value: country),
        const SizedBox(height: 12),
        Text(
          'By submitting, you agree this is a request. The commission will '
          'confirm within two business days.',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: AppColors.inkMuted,
              ),
        ),
        if (error.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text(error, style: const TextStyle(color: Colors.red)),
        ],
      ],
    );
  }
}

class _SuccessBody extends StatelessWidget {
  const _SuccessBody({
    required this.bookingRef,
    required this.email,
    required this.onCheckStatus,
    required this.onHome,
  });

  final String bookingRef;
  final String email;
  final VoidCallback onCheckStatus;
  final VoidCallback onHome;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Request submitted',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Your booking reference is saved below. The commission will confirm '
            'within two business days. No payment is taken in the app.',
          ),
          const SizedBox(height: 16),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'REFERENCE',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: AppColors.brand,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    bookingRef,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: AppColors.brand,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text('Confirmation sent to $email'),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: onCheckStatus,
            child: const Text('Check booking status'),
          ),
          TextButton(onPressed: onHome, child: const Text('Back to home')),
        ],
      ),
    );
  }
}

class _BookingPausedBody extends StatelessWidget {
  const _BookingPausedBody({required this.onBrowse});

  final VoidCallback onBrowse;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Booking paused',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          const Text(
            'The commission is not accepting new tour requests at this time. '
            'Please check back later or contact the bureau directly.',
          ),
          const SizedBox(height: 16),
          FilledButton(onPressed: onBrowse, child: const Text('Browse guides')),
        ],
      ),
    );
  }
}

class _EmptyGuidesBody extends StatelessWidget {
  const _EmptyGuidesBody({required this.onBrowse});

  final VoidCallback onBrowse;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'No guides available',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          const SizedBox(height: 8),
          const Text('No licensed guides are available for booking right now.'),
          const SizedBox(height: 16),
          FilledButton(onPressed: onBrowse, child: const Text('View all guides')),
        ],
      ),
    );
  }
}
