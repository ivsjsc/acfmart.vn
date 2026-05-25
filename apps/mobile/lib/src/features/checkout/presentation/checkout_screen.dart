import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../storefront/demo_store.dart';
import '../../storefront/presentation/storefront_widgets.dart';

class CheckoutScreen extends StatelessWidget {
  const CheckoutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Thanh toán')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF111827),
                  Color(0xFF991B1B),
                  Color(0xFFF59E0B),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Xác nhận đơn hàng',
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Sẵn sàng chuyển sang payment, shipping và final confirmation.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.92),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          SectionHeader(
            title: 'Địa chỉ giao hàng',
            subtitle: 'Mẫu địa chỉ sẽ được nối với address book ở phase sau',
          ),
          const SizedBox(height: 12),
          _InfoCard(
            icon: Icons.location_on_rounded,
            title: '12 Nguyen Trai, Q.1, TP.HCM',
            subtitle: 'Người nhận: Nhi Bui - 0901 234 567',
            color: const Color(0xFF1D4ED8),
          ),
          const SizedBox(height: 20),
          SectionHeader(
            title: 'Phương thức thanh toán',
            subtitle: 'COD, card và wallet sẽ nối sau qua backend/payment service',
          ),
          const SizedBox(height: 12),
          _InfoCard(
            icon: Icons.payment_rounded,
            title: 'Thanh toán khi nhận hàng',
            subtitle: 'Phù hợp cho MVP buyer flow',
            color: const Color(0xFF0F766E),
          ),
          const SizedBox(height: 12),
          _InfoCard(
            icon: Icons.credit_card_rounded,
            title: 'Thẻ / ví điện tử',
            subtitle: 'Cần tích hợp thêm payment provider',
            color: const Color(0xFFBE185D),
          ),
          const SizedBox(height: 20),
          SectionHeader(
            title: 'Tóm tắt đơn hàng',
            subtitle: 'Tính tổng dựa trên demo products hiện có',
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: theme.colorScheme.surface,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: theme.colorScheme.outlineVariant),
            ),
            child: Column(
              children: [
                _SummaryRow(
                  label: demoProducts[0].name,
                  value: formatCurrencyVnd(demoProducts[0].priceVnd),
                ),
                const SizedBox(height: 8),
                _SummaryRow(
                  label: demoProducts[1].name,
                  value: '${formatCurrencyVnd(demoProducts[1].priceVnd)} x2',
                ),
                const Divider(height: 28),
                _SummaryRow(
                  label: 'Tổng cộng',
                  value: formatCurrencyVnd(
                    demoProducts[0].priceVnd + demoProducts[1].priceVnd * 2 - 120000,
                  ),
                  valueColor: theme.colorScheme.primary,
                  emphasized: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: () => context.go('/orders'),
            child: const Text('Xác nhận đặt hàng'),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.colorScheme.outlineVariant),
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                ),
              ],
            ),
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

