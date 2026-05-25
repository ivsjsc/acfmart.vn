import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/page_placeholder.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      selectedIndex: 4,
      title: 'Tài khoản',
      body: PagePlaceholder(
        title: 'Profile',
        description:
            'Account info, address book, seller switch, and settings will live here.',
        children: [
          FilledButton.tonal(
            onPressed: () => context.go('/login'),
            child: const Text('Sign out flow'),
          ),
        ],
      ),
    );
  }
}
