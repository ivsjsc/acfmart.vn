import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'src/app/app.dart';
import 'src/app/bootstrap.dart';
import 'src/core/config/app_config.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await bootstrap();
  runApp(
    ProviderScope(
      child: ACFMartApp(config: AppConfig.dev()),
    ),
  );
}
