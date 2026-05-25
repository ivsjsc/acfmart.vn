import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_scaffold.dart';
import '../../storefront/demo_store.dart';
import '../../storefront/presentation/storefront_widgets.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return AppScaffold(
      selectedIndex: 0,
      title: 'ACFMart',
      actions: [
        IconButton(
          onPressed: () => context.go('/notifications'),
          icon: const Icon(Icons.notifications_none_rounded),
          tooltip: 'Thông báo',
        ),
        IconButton(
          onPressed: () => context.go('/qr-verify'),
          icon: const Icon(Icons.qr_code_scanner_rounded),
          tooltip: 'Quét QR',
        ),
      ],
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          _HeroBanner(
            onBrowseCatalog: () => context.go('/catalog'),
            onVerifyQr: () => context.go('/qr-verify'),
          ),
          const SizedBox(height: 20),
          SectionHeader(
            title: 'Danh mục nóng',
            subtitle: 'Lướt nhanh theo nhu cầu mua hàng hôm nay',
            actionLabel: 'Xem tất cả',
            onAction: () => context.go('/catalog'),
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
                  onTap: () => context.go('/catalog'),
                );
              },
            ),
          ),
          const SizedBox(height: 22),
          SectionHeader(
            title: 'Nổi bật hôm nay',
            subtitle: 'Những sản phẩm có tín hiệu mua tốt và dễ chốt đơn',
            actionLabel: 'Mở catalog',
            onAction: () => context.go('/catalog'),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 356,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: demoFeaturedProducts.length,
              separatorBuilder: (_, __) => const SizedBox(width: 16),
              itemBuilder: (context, index) {
                final product = demoFeaturedProducts[index];
                return SizedBox(
                  width: 238,
                  child: ProductCard(
                    product: product,
                    onTap: () => context.go('/product/${product.id}'),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 22),
          SectionHeader(
            title: 'Lối tắt mua nhanh',
            subtitle: 'Những hành động buyer sẽ chạm nhiều nhất trong app',
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ActionTile(
                  title: 'Quét QR',
                  description: 'Xác thực hàng chính hãng',
                  icon: Icons.qr_code_scanner_rounded,
                  color: theme.colorScheme.primary,
                  onTap: () => context.go('/qr-verify'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ActionTile(
                  title: 'Đơn đang giao',
                  description: 'Theo dõi trạng thái hiện tại',
                  icon: Icons.local_shipping_rounded,
                  color: const Color(0xFFEA580C),
                  onTap: () => context.go('/orders'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ActionTile(
                  title: 'Deal hôm nay',
                  description: 'Ưu đãi nhanh trong ngày',
                  icon: Icons.local_fire_department_rounded,
                  color: const Color(0xFFBE185D),
                  onTap: () => context.go('/catalog'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ActionTile(
                  title: 'Yêu thích',
                  description: 'Giữ các item để so sánh',
                  icon: Icons.favorite_rounded,
                  color: const Color(0xFF7C3AED),
                  onTap: () => context.go('/profile'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),
          SectionHeader(
            title: 'Niềm tin & xác thực',
            subtitle: 'Điểm khác biệt của ACFMart so với một catalog thông thường',
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              MetricTile(
                value: '98%',
                label: 'Sản phẩm có QR / mã xác thực',
                icon: Icons.verified_rounded,
                color: const Color(0xFF0F766E),
              ),
              const SizedBox(width: 12),
              MetricTile(
                value: '2h',
                label: 'Giao nhanh nội thành',
                icon: Icons.timer_rounded,
                color: const Color(0xFF1D4ED8),
              ),
            ],
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFB42318).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(
                        Icons.security_rounded,
                        color: Color(0xFFB42318),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Buyer trust first',
                            style: theme.textTheme.titleSmall?.copyWith(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Mọi điểm chạm đều hướng tới xác thực, giao nhanh và đổi trả rõ ràng.',
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
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _TrustBadge(
                      icon: Icons.check_circle_rounded,
                      label: 'Đổi trả 7 ngày',
                      color: const Color(0xFF0F766E),
                    ),
                    _TrustBadge(
                      icon: Icons.receipt_long_rounded,
                      label: 'Hóa đơn rõ ràng',
                      color: const Color(0xFF1D4ED8),
                    ),
                    _TrustBadge(
                      icon: Icons.phone_iphone_rounded,
                      label: 'Mở app từ push',
                      color: const Color(0xFFBE185D),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          SectionHeader(
            title: 'Deals phù hợp với bạn',
            subtitle: 'Các gợi ý này sẽ kết nối tốt với funnel mua hàng đầu tiên',
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF111827),
                  const Color(0xFF7F1D1D).withValues(alpha: 0.92),
                  const Color(0xFFF59E0B).withValues(alpha: 0.82),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Mở catalog trước để xem sản phẩm demo',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Từ đây ta có thể mở rộng sang search, filter, add to cart, checkout và tracking.',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.92),
                  ),
                ),
                const SizedBox(height: 16),
                FilledButton(
                  onPressed: () => context.go('/catalog'),
                  style: FilledButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: const Color(0xFF111827),
                  ),
                  child: const Text('Mở catalog'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroBanner extends StatelessWidget {
  const _HeroBanner({
    required this.onBrowseCatalog,
    required this.onVerifyQr,
  });

  final VoidCallback onBrowseCatalog;
  final VoidCallback onVerifyQr;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(32),
        gradient: LinearGradient(
          colors: [
            const Color(0xFF111827),
            const Color(0xFF991B1B),
            const Color(0xFFF59E0B).withValues(alpha: 0.88),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            top: -18,
            right: -10,
            child: Container(
              width: 112,
              height: 112,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.08),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            left: -30,
            bottom: -40,
            child: Container(
              width: 130,
              height: 130,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.06),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  _HeroPill(
                    icon: Icons.auto_awesome_rounded,
                    label: 'Buyer beta',
                    backgroundColor: Colors.white.withValues(alpha: 0.14),
                    foregroundColor: Colors.white,
                  ),
                  const Spacer(),
                  _HeroPill(
                    icon: Icons.verified_rounded,
                    label: 'Xác thực QR',
                    backgroundColor: Colors.white.withValues(alpha: 0.12),
                    foregroundColor: Colors.white,
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                'Mua hàng có thể kiểm chứng.',
                style: theme.textTheme.headlineSmall?.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  height: 1.05,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'ACFMart ưu tiên trust, giao nhanh và hành trình mua gọn. Đây là điểm bắt đầu của buyer app.',
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: Colors.white.withValues(alpha: 0.92),
                ),
              ),
              const SizedBox(height: 18),
              Wrap(
                spacing: 10,
                runSpacing: 10,
                children: [
                  FilledButton(
                    onPressed: onBrowseCatalog,
                    style: FilledButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: const Color(0xFF111827),
                    ),
                    child: const Text('Khám phá catalog'),
                  ),
                  OutlinedButton(
                    onPressed: onVerifyQr,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: BorderSide(
                        color: Colors.white.withValues(alpha: 0.32),
                      ),
                    ),
                    child: const Text('Quét QR'),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  _MiniMetric(
                    value: '3.2k',
                    label: 'buyer hoạt động',
                    foregroundColor: Colors.white,
                  ),
                  const SizedBox(width: 12),
                  _MiniMetric(
                    value: '4.8',
                    label: 'rating trung bình',
                    foregroundColor: Colors.white,
                  ),
                  const SizedBox(width: 12),
                  _MiniMetric(
                    value: '98%',
                    label: 'điểm xác thực',
                    foregroundColor: Colors.white,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroPill extends StatelessWidget {
  const _HeroPill({
    required this.icon,
    required this.label,
    required this.backgroundColor,
    required this.foregroundColor,
  });

  final IconData icon;
  final String label;
  final Color backgroundColor;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: foregroundColor),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: foregroundColor,
                  fontWeight: FontWeight.w800,
                ),
          ),
        ],
      ),
    );
  }
}

class _MiniMetric extends StatelessWidget {
  const _MiniMetric({
    required this.value,
    required this.label,
    required this.foregroundColor,
  });

  final String value;
  final String label;
  final Color foregroundColor;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.10),
          borderRadius: BorderRadius.circular(18),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              value,
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: foregroundColor,
                    fontWeight: FontWeight.w900,
                  ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: Theme.of(context).textTheme.labelSmall?.copyWith(
                    color: foregroundColor.withValues(alpha: 0.88),
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TrustBadge extends StatelessWidget {
  const _TrustBadge({
    required this.icon,
    required this.label,
    required this.color,
  });

  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            label,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: color,
                  fontWeight: FontWeight.w800,
                ),
          ),
        ],
      ),
    );
  }
}

