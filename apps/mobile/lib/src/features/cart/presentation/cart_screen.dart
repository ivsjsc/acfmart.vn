import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_scaffold.dart';
import '../../storefront/demo_store.dart';
import '../../storefront/presentation/storefront_widgets.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      selectedIndex: 2,
      title: 'Giỏ hàng',
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          SectionHeader(
            title: 'Giỏ hàng',
            subtitle: 'Hai sản phẩm demo để test quantity, promo và checkout',
          ),
          const SizedBox(height: 12),
          LineItemCard(
            product: demoProducts[0],
            quantity: 1,
            onIncrement: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Sẽ nối state quantity ở phase sau.')),
              );
            },
            onDecrement: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Sẽ nối state quantity ở phase sau.')),
              );
            },
          ),
          const SizedBox(height: 12),
          LineItemCard(
            product: demoProducts[1],
            quantity: 2,
            onIncrement: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Sẽ nối state quantity ở phase sau.')),
              );
            },
            onDecrement: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Sẽ nối state quantity ở phase sau.')),
              );
            },
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(
                color: Theme.of(context).colorScheme.outlineVariant,
              ),
            ),
            child: Column(
              children: [
                _SummaryRow(
                  label: 'Tạm tính',
                  value: formatCurrencyVnd(
                    demoProducts[0].priceVnd + demoProducts[1].priceVnd * 2,
                  ),
                ),
                const SizedBox(height: 8),
                _SummaryRow(
                  label: 'Phí giao hàng',
                  value: 'Miễn phí',
                ),
                const SizedBox(height: 8),
                _SummaryRow(
                  label: 'Giảm giá',
                  value: '- ${formatCurrencyVnd(120000)}',
                  valueColor: const Color(0xFF0F766E),
                ),
                const Divider(height: 28),
                _SummaryRow(
                  label: 'Tổng cộng',
                  value: formatCurrencyVnd(
                    demoProducts[0].priceVnd + demoProducts[1].priceVnd * 2 - 120000,
                  ),
                  valueColor: Theme.of(context).colorScheme.primary,
                  emphasized: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: Theme.of(context).colorScheme.outlineVariant,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(
                    Icons.local_offer_rounded,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Mã giảm giá',
                        style: Theme.of(context).textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Thêm mã giảm giá khi chúng ta nối checkout thật.',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: () => context.go('/checkout'),
            child: const Text('Tiến hành thanh toán'),
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.valueColor,
    this.emphasized = false,
  });

  final String label;
  final String value;
  final Color? valueColor;
  final bool emphasized;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Expanded(
          child: Text(
            label,
            style: theme.textTheme.bodyMedium?.copyWith(
              fontWeight: emphasized ? FontWeight.w800 : FontWeight.w500,
            ),
          ),
        ),
        Text(
          value,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: valueColor ?? theme.colorScheme.onSurface,
            fontWeight: emphasized ? FontWeight.w900 : FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

