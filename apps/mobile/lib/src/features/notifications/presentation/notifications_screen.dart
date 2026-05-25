import 'package:flutter/material.dart';

import '../../../shared/widgets/page_placeholder.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thông báo')),
      body: const PagePlaceholder(
        title: 'Notifications',
        description:
            'Push notification inbox, marketing updates, and order alerts will live here.',
      ),
    );
  }
}
