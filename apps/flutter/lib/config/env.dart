/// API and app configuration.
///
/// Override at build/run time:
///   flutter run --dart-define=API_BASE_URL=http://192.168.1.10:3000
class Env {
  static const apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://visitharar.raafat.site',
  );

  static String get apiV1 => '$apiBaseUrl/api/v1';
}
