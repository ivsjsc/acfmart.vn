import 'package:flutter/material.dart';

import '../../storefront/presentation/storefront_widgets.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Thông báo')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
        children: const [
          NotificationCard(
            title: 'Đơn hàng đang trên đường giao',
            body: 'Tai nghe Studio X sẽ đến trong khoảng 2 giờ nữa.',
            time: '5m',
            icon: Icons.local_shipping_rounded,
            color: Color(0xFF1D4ED8),
          ),
          SizedBox(height: 12),
          NotificationCard(
            title: 'Giảm giá hôm nay',
            body: 'Serum Vitamin C đang có deal 15% cho buyer mới.',
            time: '1h',
            icon: Icons.local_fire_department_rounded,
            color: Color(0xFFBE185D),
          ),
          SizedBox(height: 12),
          NotificationCard(
            title: 'Xác thực QR đã sẵn sàng',
            body: 'Mở QR verify để kiểm tra mã hàng chính hãng.',
            time: '3h',
            icon: Icons.verified_rounded,
            color: Color(0xFF0F766E),
          ),
        ],
      ),
    );
  }
}
