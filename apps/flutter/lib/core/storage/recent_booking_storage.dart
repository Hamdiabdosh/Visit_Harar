import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

class RecentBookingLookup {
  const RecentBookingLookup({
    required this.bookingRef,
    required this.visitorEmail,
  });

  final String bookingRef;
  final String visitorEmail;
}

abstract final class RecentBookingStorage {
  static const _key = 'recent_booking_lookup_v1';

  static Future<void> save(RecentBookingLookup lookup) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _key,
      jsonEncode({
        'booking_ref': lookup.bookingRef,
        'visitor_email': lookup.visitorEmail,
      }),
    );
  }

  static Future<RecentBookingLookup?> load() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw == null) return null;
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      final ref = map['booking_ref'] as String?;
      final email = map['visitor_email'] as String?;
      if (ref == null || email == null) return null;
      return RecentBookingLookup(bookingRef: ref, visitorEmail: email);
    } catch (_) {
      return null;
    }
  }
}
