import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/page_placeholder.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      selectedIndex: 2,
      title: 'Giỏ hàng',
      body: PagePlaceholder(
        title: 'Cart',
        description:
            'Cart grouping, item quantity updates, promo application, and totals go here.',
        children: [
          FilledButton(
            onPressed: () => context.go('/checkout'),
            child: const Text('Go to checkout'),
          ),
        ],
      ),
    );
  }
}
