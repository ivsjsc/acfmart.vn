import 'package:acfmart_mobile/src/app/app.dart';
import 'package:acfmart_mobile/src/core/config/app_config.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

void main() {
  testWidgets('renders the app shell', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        child: ACFMartApp(config: AppConfig.dev()),
      ),
    );

    await tester.pumpAndSettle();

    expect(find.text('ACFMart'), findsWidgets);
  });
}
