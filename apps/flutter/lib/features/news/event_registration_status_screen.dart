import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../api/models.dart';
import '../../config/env.dart';
import '../../core/providers/api_providers.dart';
import '../../core/theme/app_theme.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/form_widgets.dart';

class EventRegistrationStatusScreen extends ConsumerStatefulWidget {
  const EventRegistrationStatusScreen({super.key});

  @override
  ConsumerState<EventRegistrationStatusScreen> createState() =>
      _EventRegistrationStatusScreenState();
}

class _EventRegistrationStatusScreenState
    extends ConsumerState<EventRegistrationStatusScreen> {
  late final _refController = TextEditingController();
  late final _emailController = TextEditingController();
  EventRegistrationStatus? _result;
  bool _notFound = false;
  bool _loading = false;

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
      final status = await api.getEventRegistrationStatus(
        EventRegistrationStatusInput(
          registrationRef: _refController.text.trim(),
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

  Future<void> _openTicket(String token) async {
    final uri = Uri.parse('${Env.apiBaseUrl}/events/ticket/$token');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: appBarWithBack(context: context, title: 'Event registration'),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          LabeledTextField(
            controller: _refController,
            label: 'Registration reference',
          ),
          LabeledTextField(
            controller: _emailController,
            label: 'Email',
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _loading ? null : _lookup,
            child: Text(_loading ? 'Looking up…' : 'Check status'),
          ),
          if (_notFound) ...[
            const SizedBox(height: 16),
            Text(
              'No registration found for that reference and email.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
          if (_result != null) ...[
            const SizedBox(height: 24),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _result!.registrationRef,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                        color: AppColors.brand,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('Status: ${_result!.status}'),
                    const SizedBox(height: 4),
                    Text('Event: ${_result!.eventTitle}'),
                    if (_result!.eventDate != null)
                      Text('Date: ${_result!.eventDate}'),
                    Text('Party size: ${_result!.partySize}'),
                    if (_result!.statusNote != null) ...[
                      const SizedBox(height: 8),
                      Text(_result!.statusNote!),
                    ],
                    if (_result!.qrToken != null) ...[
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: () => _openTicket(_result!.qrToken!),
                        child: const Text('Open ticket'),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
