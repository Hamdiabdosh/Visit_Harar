import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class PushPrefs {
  const PushPrefs({
    this.enabled = false,
    this.notifyBookings = true,
    this.notifyEvents = true,
    this.visitorEmail = '',
    this.fcmToken,
  });

  final bool enabled;
  final bool notifyBookings;
  final bool notifyEvents;
  final String visitorEmail;
  final String? fcmToken;

  PushPrefs copyWith({
    bool? enabled,
    bool? notifyBookings,
    bool? notifyEvents,
    String? visitorEmail,
    String? fcmToken,
  }) {
    return PushPrefs(
      enabled: enabled ?? this.enabled,
      notifyBookings: notifyBookings ?? this.notifyBookings,
      notifyEvents: notifyEvents ?? this.notifyEvents,
      visitorEmail: visitorEmail ?? this.visitorEmail,
      fcmToken: fcmToken ?? this.fcmToken,
    );
  }

  Map<String, dynamic> toJson() => {
        'enabled': enabled,
        'notify_bookings': notifyBookings,
        'notify_events': notifyEvents,
        'visitor_email': visitorEmail,
        if (fcmToken != null) 'fcm_token': fcmToken,
      };

  factory PushPrefs.fromJson(Map<String, dynamic> json) {
    return PushPrefs(
      enabled: json['enabled'] as bool? ?? false,
      notifyBookings: json['notify_bookings'] as bool? ?? true,
      notifyEvents: json['notify_events'] as bool? ?? true,
      visitorEmail: json['visitor_email'] as String? ?? '',
      fcmToken: json['fcm_token'] as String?,
    );
  }
}

abstract final class PushPrefsStorage {
  static const _key = 'push_notification_prefs_v1';

  static Future<PushPrefs> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return const PushPrefs();
    try {
      return PushPrefs.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return const PushPrefs();
    }
  }

  static Future<void> save(PushPrefs prefs) async {
    final sp = await SharedPreferences.getInstance();
    await sp.setString(_key, jsonEncode(prefs.toJson()));
  }
}
