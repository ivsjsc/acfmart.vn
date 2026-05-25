import 'package:flutter/material.dart';
import '../../../shared/widgets/page_placeholder.dart';

class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thanh toán')),
      body: const PagePlaceholder(
        title: 'Checkout',
        description:
            'Shipping address, payment methods, order summary, and confirmation flow will live here.',
      ),
    );
  }
}
