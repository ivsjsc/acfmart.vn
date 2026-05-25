import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_scaffold.dart';
import '../../storefront/demo_store.dart';
import '../../storefront/presentation/storefront_widgets.dart';

class CatalogScreen extends StatelessWidget {
  const CatalogScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      selectedIndex: 1,
      title: 'Danh mục',
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: Theme.of(context).colorScheme.outlineVariant,
              ),
            ),
            child: TextField(
              readOnly: true,
              onTap: () => context.go('/home'),
              decoration: const InputDecoration(
                border: InputBorder.none,
                icon: Icon(Icons.search_rounded),
                hintText: 'Tìm tai nghe, serum, balo...',
              ),
            ),
          ),
          const SizedBox(height: 20),
          SectionHeader(
            title: 'Lọc theo nhu cầu',
            subtitle: 'Chọn danh mục để rút ngắn đường đi đến sản phẩm phù hợp',
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 46,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: demoCategories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, index) {
                final category = demoCategories[index];
                return CategoryChip(
                  category: category,
                  selected: index == 0,
                  onTap: () {},
                );
              },
            ),
          ),
          const SizedBox(height: 22),
          SectionHeader(
            title: 'Kết quả mẫu',
            subtitle: '${demoProducts.length} sản phẩm để test luồng buyer',
          ),
          const SizedBox(height: 12),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: demoProducts.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 0.72,
            ),
            itemBuilder: (context, index) {
              final product = demoProducts[index];
              return ProductCard(
                product: product,
                compact: true,
                onTap: () => context.go('/product/${product.id}'),
              );
            },
          ),
        ],
      ),
    );
  }
}
