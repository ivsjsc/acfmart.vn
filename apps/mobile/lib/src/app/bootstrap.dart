import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import '../core/services/firebase_service.dart';

Future<void> bootstrap() async {
  // Initialize Firebase
  // Note: On Android, this requires google-services.json to be present in android/app
  // On iOS, this requires GoogleService-Info.plist to be present in ios/Runner
  try {
    await Firebase.initializeApp();

    // Initialize our specialized Firebase Service
    await FirebaseService.instance.initialize();

    // Set up background messaging handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Initialize Local Notifications
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
    );
    await FlutterLocalNotificationsPlugin().initialize(initializationSettings);

    if (kDebugMode) {
      print('Firebase and background services initialized successfully');
    }
  } catch (e) {
    if (kDebugMode) {
      print('Failed to initialize Firebase: $e');
      print('Make sure you have added google-services.json (Android) and GoogleService-Info.plist (iOS)');
    }
  }
}

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  if (kDebugMode) {
    print('Handling a background message: ${message.messageId}');
  }
}
