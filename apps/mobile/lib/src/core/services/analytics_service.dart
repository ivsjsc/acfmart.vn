class AnalyticsService {
  const AnalyticsService();

  void logEvent(
    String name, {
    Map<String, Object?> parameters = const <String, Object?>{},
  }) {
    // TODO: Forward to Firebase Analytics.
  }

  void logScreenView(
    String screenName, {
    String? screenClass,
  }) {
    // TODO: Forward to Firebase Analytics.
  }
}
