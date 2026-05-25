import 'package:flutter/material.dart';

class PagePlaceholder extends StatelessWidget {
  const PagePlaceholder({
    super.key,
    required this.title,
    required this.description,
    this.children = const <Widget>[],
  });

  final String title;
  final String description;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Text(title, style: theme.textTheme.headlineMedium),
        const SizedBox(height: 12),
        Text(description, style: theme.textTheme.bodyLarge),
        if (children.isNotEmpty) ...[
          const SizedBox(height: 24),
          ...children,
        ],
      ],
    );
  }
}
