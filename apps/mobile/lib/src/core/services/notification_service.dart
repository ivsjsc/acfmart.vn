class NotificationService {
  const NotificationService();

  Future<void> requestPermission() async {
    // TODO: Ask for push notification permission via Firebase Messaging.
  }

  Future<void> registerDeviceToken() async {
    // TODO: Send the FCM token to the backend.
  }

  Future<void> subscribeToTopics() async {
    // TODO: Subscribe to app topics like promotions, orders, and system alerts.
  }
}
