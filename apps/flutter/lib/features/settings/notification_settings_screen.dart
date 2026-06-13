import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/providers/api_providers.dart';
import '../../core/push/push_service.dart';
import '../../core/storage/push_prefs_storage.dart';
import '../../core/storage/recent_booking_storage.dart';
import '../../core/theme/app_theme.dart';
import '../../routing/app_router.dart';
import '../../core/widgets/content_widgets.dart';
import '../../core/widgets/form_widgets.dart';

class NotificationSettingsScreen extends ConsumerStatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  ConsumerState<NotificationSettingsScreen> createState() =>
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState
    extends ConsumerState<NotificationSettingsScreen> {
  PushPrefs? _prefs;
  bool _busy = false;
  String? _message;
  late final _emailController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPrefs();
  }

  Future<void> _loadPrefs() async {
    var prefs = await PushPrefsStorage.load();
    if (prefs.visitorEmail.isEmpty) {
      final recent = await RecentBookingStorage.load();
      if (recent != null) {
        prefs = prefs.copyWith(visitorEmail: recent.visitorEmail);
        await PushPrefsStorage.save(prefs);
      }
    }
    if (mounted) {
      _emailController.text = prefs.visitorEmail;
      setState(() => _prefs = prefs);
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _apply(PushPrefs next) async {
    setState(() {
      _busy = true;
      _message = null;
    });
    try {
      if (next.enabled) {
        final token = await PushService.getToken();
        if (token == null) {
          await PushPrefsStorage.save(next.copyWith(enabled: false));
          if (!mounted) return;
          setState(() {
            _prefs = next.copyWith(enabled: false);
            _message =
                'Push alerts ship in v1.1 (after Play Store launch). '
                'Your preferences are saved on this device.';
          });
          return;
        }
        next = next.copyWith(fcmToken: token);
        await PushService.registerWithServer(visitorEmail: next.visitorEmail);
      }
      await PushPrefsStorage.save(next);
      if (!mounted) return;
      setState(() {
        _prefs = next;
        _message = next.enabled
            ? 'Notifications enabled.'
            : 'Notifications turned off.';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _message = errorMessage(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final pushEnabledAsync = ref.watch(pushEnabledProvider);
    final prefs = _prefs;

    return Scaffold(
      appBar: appBarWithBack(context: context, title: 'Notifications'),
      body: prefs == null
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                pushEnabledAsync.when(
                  loading: () => const SizedBox.shrink(),
                  error: (_, __) => const SizedBox.shrink(),
                  data: (enabled) {
                    if (enabled) return const SizedBox.shrink();
                    return Card(
                      color: const Color(0xFFFEF3C7),
                      child: Padding(
                        padding: const EdgeInsets.all(12),
                        child: Text(
                          'Push alerts are currently disabled on the server.',
                          style: Theme.of(context).textTheme.bodyMedium,
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 8),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Notifications',
                          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Get booking updates and news about events in Harar.',
                        ),
                        const SizedBox(height: 12),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Enable notifications'),
                          value: prefs.enabled,
                          activeThumbColor: AppColors.brand,
                          onChanged: _busy
                              ? null
                              : (enabled) => _apply(prefs.copyWith(enabled: enabled)),
                        ),
                        if (prefs.enabled) ...[
                          LabeledTextField(
                            label: 'Email for booking alerts',
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            autocorrect: false,
                            hintText: 'Same email used when booking',
                          ),
                          OutlinedButton(
                            onPressed: _busy
                                ? null
                                : () => _apply(
                                      prefs.copyWith(
                                        visitorEmail: _emailController.text.trim(),
                                      ),
                                    ),
                            child: const Text('Save email for alerts'),
                          ),
                          SwitchListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('Booking updates'),
                            value: prefs.notifyBookings,
                            activeThumbColor: AppColors.brand,
                            onChanged: _busy
                                ? null
                                : (v) => _apply(prefs.copyWith(notifyBookings: v)),
                          ),
                          SwitchListTile(
                            contentPadding: EdgeInsets.zero,
                            title: const Text('Events & news'),
                            value: prefs.notifyEvents,
                            activeThumbColor: AppColors.brand,
                            onChanged: _busy
                                ? null
                                : (v) => _apply(prefs.copyWith(notifyEvents: v)),
                          ),
                        ],
                        if (_busy)
                          const Padding(
                            padding: EdgeInsets.only(top: 8),
                            child: Center(child: CircularProgressIndicator()),
                          ),
                        if (_message != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(
                              _message!,
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
