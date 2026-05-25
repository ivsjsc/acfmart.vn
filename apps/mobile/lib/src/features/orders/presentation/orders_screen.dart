import 'package:flutter/material.dart';

import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/page_placeholder.dart';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      selectedIndex: 3,
      title: 'Đơn hàng',
      body: const PagePlaceholder(
        title: 'Orders',
        description:
            'Order history, tracking state, cancellation, and delivery updates will live here.',
      ),
    );
  }
}
