import 'package:flutter/material.dart';

ThemeData buildAppTheme() {
  const seedColor = Color(0xFFDC2626);
  final colorScheme = ColorScheme.fromSeed(
    seedColor: seedColor,
    brightness: Brightness.light,
  );

  return ThemeData(
    colorScheme: colorScheme,
    useMaterial3: true,
    scaffoldBackgroundColor: colorScheme.surface,
    appBarTheme: AppBarTheme(
      centerTitle: false,
      backgroundColor: colorScheme.surface,
      foregroundColor: colorScheme.onSurface,
      elevation: 0,
    ),
    navigationBarTheme: NavigationBarThemeData(
      indicatorColor: colorScheme.primaryContainer,
    ),
  );
}
