import 'package:flutter/material.dart';

import '../core/config/app_config.dart';
import 'router.dart';
import 'theme.dart';

class ACFMartApp extends StatelessWidget {
  const ACFMartApp({super.key, required this.config});

  final AppConfig config;

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: config.appName,
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      routerConfig: appRouter,
    );
  }
}
