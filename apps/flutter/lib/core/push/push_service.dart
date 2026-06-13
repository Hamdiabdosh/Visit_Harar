/// FCM push registration — Phase F3 (firebase_messaging).
abstract final class PushService {
  static Future<void> initialize() async {}

  static Future<String?> getToken() async => null;

  static Future<void> registerWithServer({String? visitorEmail}) async {}
}
