import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/page_placeholder.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({super.key, required this.productId});

  final String productId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Product detail')),
      body: PagePlaceholder(
        title: 'Product detail',
        description:
            'This route is ready for a dynamic product page. Current placeholder id: $productId.',
        children: [
          FilledButton(
            onPressed: () => context.go('/cart'),
            child: const Text('Add to cart'),
          ),
        ],
      ),
    );
  }
}
