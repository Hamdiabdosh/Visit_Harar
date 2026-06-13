import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../api/models.dart';
import '../../config/env.dart';
import '../../core/providers/api_providers.dart';
import '../../core/theme/app_theme.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/form_widgets.dart';
import '../booking/booking_constants.dart';

class EventRegistrationPanel extends ConsumerStatefulWidget {
  const EventRegistrationPanel({super.key, required this.event});

  final AnnouncementSummary event;

  @override
  ConsumerState<EventRegistrationPanel> createState() =>
      _EventRegistrationPanelState();
}

class _EventRegistrationPanelState
    extends ConsumerState<EventRegistrationPanel> {
  bool _open = false;
  bool _done = false;
  bool _submitting = false;
  String _submitError = '';
  String _registrationRef = '';
  String _status = 'Pending';
  String? _qrToken;

  late final _nameController = TextEditingController();
  late final _emailController = TextEditingController();
  late final _phoneController = TextEditingController();
  late final _notesController = TextEditingController();
  String _country = BookingConstants.countries.first;
  int _partySize = 1;

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() {
      _submitting = true;
      _submitError = '';
    });
    try {
      final api = ref.read(apiProvider);
      final result = await api.createEventRegistration(
        EventRegistrationInput(
          announcementId: widget.event.id,
          visitorName: _nameController.text.trim(),
          visitorEmail: _emailController.text.trim(),
          visitorCountry: _country,
          partySize: _partySize,
          visitorPhone: _phoneController.text.trim().isEmpty
              ? null
              : _phoneController.text.trim(),
          specialRequests: _notesController.text.trim().isEmpty
              ? null
              : _notesController.text.trim(),
        ),
      );
      setState(() {
        _registrationRef = result.registrationRef;
        _status = result.status;
        _qrToken = result.qrToken;
        _done = true;
      });
    } catch (e) {
      setState(() => _submitError = errorMessage(e));
    } finally {
      setState(() => _submitting = false);
    }
  }

  Future<void> _openTicket() async {
    final token = _qrToken;
    if (token == null) return;
    final uri = Uri.parse('${Env.apiBaseUrl}/events/ticket/$token');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final meta = widget.event.registration;
    if (widget.event.type != 'Event' ||
        !widget.event.registrationEnabled ||
        meta == null) {
      return const SizedBox.shrink();
    }

    return Container(
      margin: const EdgeInsets.only(top: 24),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.brand.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.brand.withValues(alpha: 0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            'Event registration',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
          ),
          if (meta.registrationNote != null &&
              meta.registrationNote!.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(
              meta.registrationNote!,
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
          if (meta.registrationCapacity != null) ...[
            const SizedBox(height: 12),
            Text(
              '${meta.spotsRemaining ?? 0} of ${meta.registrationCapacity} spots remaining',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ],
          if (_done) ...[
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _registrationRef,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontWeight: FontWeight.bold,
                      color: AppColors.brand,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text('Status: $_status'),
                  const SizedBox(height: 8),
                  if (_status == 'Confirmed' && _qrToken != null)
                    OutlinedButton(
                      onPressed: _openTicket,
                      child: const Text('Open ticket'),
                    )
                  else
                    Text(
                      _status == 'Pending'
                          ? 'We will email you when your registration is confirmed.'
                          : 'Save your reference for your records.',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                ],
              ),
            ),
          ] else if (meta.registrationOpen) ...[
            const SizedBox(height: 16),
            if (!_open)
              FilledButton(
                onPressed: () => setState(() => _open = true),
                child: const Text('Register for this event'),
              )
            else ...[
              LabeledTextField(
                controller: _nameController,
                label: 'Full name',
              ),
              LabeledTextField(
                controller: _emailController,
                label: 'Email',
                keyboardType: TextInputType.emailAddress,
              ),
              LabeledTextField(
                controller: _phoneController,
                label: 'Phone (optional)',
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _country,
                decoration: const InputDecoration(labelText: 'Country'),
                items: BookingConstants.countries
                    .map((c) => DropdownMenuItem(value: c, child: Text(c)))
                    .toList(),
                onChanged: (v) {
                  if (v != null) setState(() => _country = v);
                },
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Text('Party size'),
                  const SizedBox(width: 12),
                  IconButton(
                    onPressed: _partySize > 1
                        ? () => setState(() => _partySize -= 1)
                        : null,
                    icon: const Icon(Icons.remove_circle_outline),
                  ),
                  Text('$_partySize'),
                  IconButton(
                    onPressed: _partySize < 20
                        ? () => setState(() => _partySize += 1)
                        : null,
                    icon: const Icon(Icons.add_circle_outline),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              LabeledTextField(
                controller: _notesController,
                label: 'Notes (optional)',
                maxLines: 3,
              ),
              if (_submitError.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(_submitError, style: const TextStyle(color: Colors.red)),
              ],
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: FilledButton(
                      onPressed: _submitting ? null : _submit,
                      child: Text(
                        _submitting ? 'Submitting…' : 'Submit registration',
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: () => setState(() => _open = false),
                    child: const Text('Cancel'),
                  ),
                ],
              ),
            ],
          ] else
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(
                'Registration is closed for this event.',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: Colors.amber.shade900,
                      fontWeight: FontWeight.w600,
                    ),
              ),
            ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => pushAppRoute(context, '/events/status'),
            child: const Text('Check registration status'),
          ),
        ],
      ),
    );
  }
}
