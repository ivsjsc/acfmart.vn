import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/page_placeholder.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      selectedIndex: 0,
      title: 'ACFMart',
      body: PagePlaceholder(
        title: 'Home',
        description:
            'Featured products, trust banners, and seasonal campaigns will live here.',
        children: [
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              FilledButton(
                onPressed: () => context.go('/catalog'),
                child: const Text('Browse catalog'),
              ),
              FilledButton.tonal(
                onPressed: () => context.go('/product/demo-product'),
                child: const Text('Open sample product'),
              ),
              OutlinedButton(
                onPressed: () => context.go('/notifications'),
                child: const Text('Notifications'),
              ),
              OutlinedButton(
                onPressed: () => context.go('/qr-verify'),
                child: const Text('QR verify'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
