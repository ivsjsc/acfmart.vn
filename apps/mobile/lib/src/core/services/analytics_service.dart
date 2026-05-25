class AnalyticsService {
  const AnalyticsService();

  void logEvent(
    String name, {
    Map<String, Object?> parameters = const <String, Object?>{},
  }) {
    // No-op until Firebase Analytics is intentionally enabled.
  }

  void logScreenView(
    String screenName, {
    String? screenClass,
  }) {
    // No-op until Firebase Analytics is intentionally enabled.
  }
}
