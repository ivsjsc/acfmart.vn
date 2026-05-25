import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../storefront/demo_store.dart';
import '../../storefront/presentation/storefront_widgets.dart';

class ProductDetailScreen extends StatelessWidget {
  const ProductDetailScreen({super.key, required this.productId});

  final String productId;

  @override
  Widget build(BuildContext context) {
    final product = demoProductById(productId);
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(product.category),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          Container(
            height: 260,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(32),
              gradient: LinearGradient(
                colors: [
                  product.accentColor,
                  product.accentColor.withValues(alpha: 0.75),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Stack(
              children: [
                Positioned(
                  top: -22,
                  right: -20,
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.10),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                Positioned(
                  left: -34,
                  bottom: -38,
                  child: Container(
                    width: 140,
                    height: 140,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.08),
                      shape: BoxShape.circle,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          _DetailBadge(
                            label: product.badge,
                            color: Colors.white.withValues(alpha: 0.18),
                            foregroundColor: Colors.white,
                          ),
                          const Spacer(),
                          _DetailBadge(
                            label: 'QR ready',
                            color: Colors.white.withValues(alpha: 0.12),
                            foregroundColor: Colors.white,
                          ),
                        ],
                      ),
                      const Spacer(),
                      Center(
                        child: Icon(
                          product.icon,
                          size: 112,
                          color: Colors.white.withValues(alpha: 0.96),
                        ),
                      ),
                      const Spacer(),
                      Row(
                        children: [
                          _DetailBadge(
                            label: product.shipping,
                            color: Colors.black.withValues(alpha: 0.16),
                            foregroundColor: Colors.white,
                          ),
                          const Spacer(),
                          _DetailBadge(
                            label: '${product.reviewCount}+ reviews',
                            color: Colors.black.withValues(alpha: 0.16),
                            foregroundColor: Colors.white,
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text(
            product.name,
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            product.subtitle,
            style: theme.textTheme.bodyLarge?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              const Icon(
                Icons.star_rounded,
                size: 18,
                color: Color(0xFFF59E0B),
              ),
              const SizedBox(width: 4),
              Text(
                product.rating.toStringAsFixed(1),
                style: theme.textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '(${product.reviewCount} đánh giá)',
                style: theme.textTheme.bodySmall?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const Spacer(),
              Text(
                formatCurrencyVnd(product.priceVnd),
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w900,
                  color: product.accentColor,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SectionHeader(
            title: 'Điểm nhấn sản phẩm',
            subtitle: 'Những chi tiết buyer nhìn thấy trước khi bấm mua',
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: product.highlights
                .map(
                  (highlight) => _SpecChip(
                    label: highlight,
                    color: product.accentColor,
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 20),
          Text(
            product.story,
            style: theme.textTheme.bodyLarge?.copyWith(
              height: 1.5,
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 20),
          SectionHeader(
            title: 'Thông số gợi ý',
            subtitle: 'Thông tin giúp buyer so sánh nhanh',
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: product.specs
                .map(
                  (spec) => _SpecChip(
                    label: spec,
                    color: const Color(0xFF111827),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: theme.colorScheme.outlineVariant),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        color: product.accentColor.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Icon(
                        Icons.verified_rounded,
                        color: product.accentColor,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Why buyers trust this item',
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Từ màn này ta có thể gắn thêm rating, warranty, seller info và QR verification.',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: theme.colorScheme.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    MetricTile(
                      value: '12m',
                      label: 'bảo hành',
                      icon: Icons.workspace_premium_rounded,
                      color: product.accentColor,
                    ),
                    const SizedBox(width: 12),
                    MetricTile(
                      value: '2h',
                      label: 'giao nội thành',
                      icon: Icons.delivery_dining_rounded,
                      color: const Color(0xFFEA580C),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        minimum: const EdgeInsets.fromLTRB(20, 0, 20, 20),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: () => context.go('/cart'),
                icon: const Icon(Icons.shopping_cart_outlined),
                label: const Text('Thêm vào giỏ'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton.icon(
                onPressed: () => context.go('/checkout'),
                icon: const Icon(Icons.shopping_bag_rounded),
                label: const Text('Mua ngay'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DetailBadge extends StatelessWidget {
  const _DetailBadge({
    required this.label,
    required this.color,
    required this.foregroundColor,
  });

  final String label;
  final Color color;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              color: foregroundColor,
              fontWeight: FontWeight.w800,
            ),
      ),
    );
  }
}

class _SpecChip extends StatelessWidget {
  const _SpecChip({
    required this.label,
    required this.color,
  });

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: color,
              fontWeight: FontWeight.w700,
            ),
      ),
    );
  }
}

