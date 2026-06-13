abstract final class BookingConstants {
  static const countries = [
    'Ethiopia',
    'United States',
    'United Kingdom',
    'France',
    'Germany',
    'Italy',
    'Spain',
    'Netherlands',
    'Belgium',
    'Switzerland',
    'Sweden',
    'Norway',
    'Denmark',
    'Ireland',
    'Canada',
    'Australia',
    'Japan',
    'China',
    'South Korea',
    'India',
    'United Arab Emirates',
    'Saudi Arabia',
    'Kenya',
    'South Africa',
    'Nigeria',
    'Brazil',
    'Argentina',
    'Mexico',
    'Other',
  ];

  static const tourDurations = ['Half Day', 'Full Day', 'Multi Day'];

  static String todayIso() {
    final now = DateTime.now();
    return '${now.year.toString().padLeft(4, '0')}-'
        '${now.month.toString().padLeft(2, '0')}-'
        '${now.day.toString().padLeft(2, '0')}';
  }

  static DateTime parseMinTourDate() {
    final parts = todayIso().split('-').map(int.parse).toList();
    return DateTime(parts[0], parts[1], parts[2]);
  }

  static String formatTourDate(String iso) {
    final d = DateTime.parse('${iso}T12:00:00');
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${weekdays[d.weekday - 1]}, ${months[d.month - 1]} ${d.day}, ${d.year}';
  }

  static String dateToIso(DateTime date) {
    return '${date.year.toString().padLeft(4, '0')}-'
        '${date.month.toString().padLeft(2, '0')}-'
        '${date.day.toString().padLeft(2, '0')}';
  }
}
