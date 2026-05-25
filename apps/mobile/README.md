# ACFMart Mobile

Flutter app for the ACFMart buyer experience on iOS and Android.

## Structure

```text
apps/mobile/
├── android/
├── ios/
├── pubspec.yaml
├── analysis_options.yaml
├── lib/
│   ├── main.dart
│   └── src/
│       ├── app/
│       │   ├── app.dart
│       │   ├── bootstrap.dart
│       │   ├── router.dart
│       │   └── theme.dart
│       ├── core/
│       │   ├── config/
│       │   ├── network/
│       │   └── services/
│       ├── features/
│       │   ├── auth/
│       │   ├── catalog/
│       │   ├── cart/
│       │   ├── checkout/
│       │   ├── home/
│       │   ├── notifications/
│       │   ├── orders/
│       │   ├── product/
│       │   ├── profile/
│       │   └── qr_verify/
│       └── shared/
│           └── widgets/
└── test/
```

## Bootstrap

After installing the Flutter SDK, run:

```bash
cd apps/mobile
flutter create --platforms=android,ios .
dart pub global activate flutterfire_cli
flutterfire configure
flutter pub get
```

## Notes

- `flutterfire configure` will generate `lib/firebase_options.dart` and platform-specific Firebase configuration.
- `android/` and `ios/` are now generated project folders and are ready for Firebase setup.
- The app identifiers are configured for `vn.acfmart.mobile` on both Android and iOS.
- The current scaffold is intentionally lightweight and feature-first so the app can grow without rework.
- When running the Android emulator against a local backend, override the API URL with `--dart-define=ACFMART_API_BASE_URL=http://10.0.2.2:3001`.
