import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_scaffold.dart';
import '../../../shared/widgets/page_placeholder.dart';

class CatalogScreen extends StatelessWidget {
  const CatalogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      selectedIndex: 1,
      title: 'Danh mục',
      body: PagePlaceholder(
        title: 'Catalog',
        description:
            'Search, filters, category pages, and product cards will be built here.',
        children: [
          FilledButton(
            onPressed: () => context.go('/product/demo-product'),
            child: const Text('Open a product'),
          ),
        ],
      ),
    );
  }
}
