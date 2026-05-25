import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../shared/widgets/app_scaffold.dart';
import '../../storefront/presentation/storefront_widgets.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      selectedIndex: 4,
      title: 'Tài khoản',
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(28),
              border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
            ),
            child: Row(
              children: [
                Container(
                  width: 64,
                  height: 64,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        Theme.of(context).colorScheme.primary,
                        const Color(0xFFF59E0B),
                      ],
                    ),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.person_rounded, color: Colors.white, size: 34),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Nhi Bui',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              fontWeight: FontWeight.w900,
                            ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Buyer member since 2026',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: Theme.of(context).colorScheme.onSurfaceVariant,
                            ),
                      ),
                    ],
                  ),
                ),
                _ProfileBadge(
                  label: 'Gold',
                  color: Theme.of(context).colorScheme.primary,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              MetricTile(
                value: '12',
                label: 'đơn đã mua',
                icon: Icons.receipt_long_rounded,
                color: const Color(0xFF1D4ED8),
              ),
              const SizedBox(width: 12),
              MetricTile(
                value: '4',
                label: 'địa chỉ lưu',
                icon: Icons.location_on_rounded,
                color: const Color(0xFF0F766E),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              MetricTile(
                value: '98%',
                label: 'trust score',
                icon: Icons.verified_rounded,
                color: const Color(0xFFBE185D),
              ),
              const SizedBox(width: 12),
              MetricTile(
                value: '24/7',
                label: 'hỗ trợ',
                icon: Icons.support_agent_rounded,
                color: const Color(0xFFEA580C),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SectionHeader(
            title: 'Lối tắt tài khoản',
            subtitle: 'Những hành động buyer sẽ cần nhiều nhất',
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ActionTile(
                  title: 'Quét QR',
                  description: 'Xác thực sản phẩm',
                  icon: Icons.qr_code_scanner_rounded,
                  color: const Color(0xFF1D4ED8),
                  onTap: () => context.go('/qr-verify'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ActionTile(
                  title: 'Đơn hàng',
                  description: 'Xem lịch sử mua',
                  icon: Icons.receipt_long_rounded,
                  color: const Color(0xFFBE185D),
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
                  title: 'Địa chỉ',
                  description: 'Sổ địa chỉ giao hàng',
                  icon: Icons.location_on_rounded,
                  color: const Color(0xFF0F766E),
                  onTap: () => context.go('/checkout'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ActionTile(
                  title: 'Đăng xuất',
                  description: 'Về màn đăng nhập',
                  icon: Icons.logout_rounded,
                  color: const Color(0xFF7C3AED),
                  onTap: () => context.go('/login'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
            ),
            child: Column(
              children: [
                _SettingRow(
                  icon: Icons.notifications_none_rounded,
                  title: 'Thông báo',
                  subtitle: 'Quản lý marketing và order updates',
                ),
                const Divider(height: 28),
                _SettingRow(
                  icon: Icons.security_rounded,
                  title: 'Bảo mật',
                  subtitle: 'Đăng nhập, OTP, thiết bị tin cậy',
                ),
                const Divider(height: 28),
                _SettingRow(
                  icon: Icons.help_outline_rounded,
                  title: 'Hỗ trợ',
                  subtitle: 'FAQ, chat, trung tâm trợ giúp',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ProfileBadge extends StatelessWidget {
  const _ProfileBadge({
    required this.label,
    required this.color,
  });

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelLarge?.copyWith(
              color: color,
              fontWeight: FontWeight.w800,
            ),
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  const _SettingRow({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Row(
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Icon(icon, color: theme.colorScheme.primary),
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
        Icon(
          Icons.chevron_right_rounded,
          color: theme.colorScheme.onSurfaceVariant,
        ),
      ],
    );
  }
}

