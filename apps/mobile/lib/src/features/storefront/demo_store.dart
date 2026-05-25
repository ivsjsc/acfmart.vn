import 'package:flutter/material.dart';

class DemoCategory {
  const DemoCategory({
    required this.name,
    required this.icon,
    required this.accentColor,
    required this.itemCount,
    required this.subtitle,
  });

  final String name;
  final IconData icon;
  final Color accentColor;
  final String itemCount;
  final String subtitle;
}

class DemoProduct {
  const DemoProduct({
    required this.id,
    required this.name,
    required this.category,
    required this.subtitle,
    required this.priceVnd,
    required this.rating,
    required this.reviewCount,
    required this.shipping,
    required this.badge,
    required this.accentColor,
    required this.icon,
    required this.story,
    required this.highlights,
    required this.specs,
  });

  final String id;
  final String name;
  final String category;
  final String subtitle;
  final int priceVnd;
  final double rating;
  final int reviewCount;
  final String shipping;
  final String badge;
  final Color accentColor;
  final IconData icon;
  final String story;
  final List<String> highlights;
  final List<String> specs;
}

const demoCategories = <DemoCategory>[
  DemoCategory(
    name: 'Điện tử',
    icon: Icons.headphones_rounded,
    accentColor: Color(0xFF1D4ED8),
    itemCount: '128 item',
    subtitle: 'Tai nghe, phụ kiện, smart home',
  ),
  DemoCategory(
    name: 'Làm đẹp',
    icon: Icons.spa_rounded,
    accentColor: Color(0xFFBE185D),
    itemCount: '84 item',
    subtitle: 'Skincare và chăm sóc cá nhân',
  ),
  DemoCategory(
    name: 'Thời trang',
    icon: Icons.checkroom_rounded,
    accentColor: Color(0xFF7C3AED),
    itemCount: '146 item',
    subtitle: 'Áo khoác, giày, balo',
  ),
  DemoCategory(
    name: 'Nhà cửa',
    icon: Icons.kitchen_rounded,
    accentColor: Color(0xFFEA580C),
    itemCount: '102 item',
    subtitle: 'Bếp, gia dụng, dọn dẹp',
  ),
  DemoCategory(
    name: 'Sức khỏe',
    icon: Icons.health_and_safety_rounded,
    accentColor: Color(0xFF0F766E),
    itemCount: '61 item',
    subtitle: 'Vitamin, chăm sóc gia đình',
  ),
  DemoCategory(
    name: 'Mẹ & bé',
    icon: Icons.child_care_rounded,
    accentColor: Color(0xFFF59E0B),
    itemCount: '39 item',
    subtitle: 'An toàn, tiện dụng, dễ mua',
  ),
];

const demoProducts = <DemoProduct>[
  DemoProduct(
    id: 'studio-buds-x',
    name: 'Tai nghe Studio X',
    category: 'Điện tử',
    subtitle: 'Âm thanh cân bằng, pin 36 giờ',
    priceVnd: 1290000,
    rating: 4.9,
    reviewCount: 1245,
    shipping: 'Giao trong 2 giờ ở nội thành',
    badge: 'Bán chạy',
    accentColor: Color(0xFF1D4ED8),
    icon: Icons.headphones_rounded,
    story: 'Phù hợp cho work, học online và di chuyển mỗi ngày.',
    highlights: <String>[
      'Bảo hành 12 tháng',
      'Chống ồn chủ động',
      'Kết nối đa thiết bị',
    ],
    specs: <String>[
      'Bluetooth 5.3',
      'Pin 36 giờ',
      'Sạc nhanh 10 phút',
    ],
  ),
  DemoProduct(
    id: 'vitamin-c-serum',
    name: 'Serum Vitamin C',
    category: 'Làm đẹp',
    subtitle: 'Da sáng hơn sau 14 ngày',
    priceVnd: 459000,
    rating: 4.8,
    reviewCount: 862,
    shipping: 'Freeship từ 199k',
    badge: 'Mới',
    accentColor: Color(0xFFBE185D),
    icon: Icons.spa_rounded,
    story: 'Nhắm vào nhóm khách chăm da và mua lặp lại cao.',
    highlights: <String>[
      'Không hương liệu',
      'Phù hợp da nhạy cảm',
      'Có mã QR chống giả',
    ],
    specs: <String>[
      '30ml',
      'Vitamin C 10%',
      'Đóng gói niêm phong',
    ],
  ),
  DemoProduct(
    id: 'cloudshell-jacket',
    name: 'Áo khoác CloudShell',
    category: 'Thời trang',
    subtitle: 'Nhẹ, chống gió và dễ phối đồ',
    priceVnd: 799000,
    rating: 4.7,
    reviewCount: 531,
    shipping: 'Đổi size trong 7 ngày',
    badge: 'Hot',
    accentColor: Color(0xFF7C3AED),
    icon: Icons.checkroom_rounded,
    story: 'Hợp cho buyer cần sự thực dụng nhưng vẫn có gu.',
    highlights: <String>[
      'Form unisex',
      'Vải chống nhăn',
      'Có túi khóa kéo',
    ],
    specs: <String>[
      'Size S - XL',
      'Giặt máy được',
      'Lót nỉ mỏng',
    ],
  ),
  DemoProduct(
    id: 'airchef-fryer',
    name: 'Nồi chiên AirChef',
    category: 'Nhà cửa',
    subtitle: '4.5L, menu chạm một nút',
    priceVnd: 1490000,
    rating: 4.9,
    reviewCount: 318,
    shipping: 'Miễn phí lắp đặt',
    badge: 'Best value',
    accentColor: Color(0xFFEA580C),
    icon: Icons.kitchen_rounded,
    story: 'Thiết bị gia dụng dễ chốt đơn nhờ demo và review tốt.',
    highlights: <String>[
      'Tiết kiệm 80% dầu',
      'Bề mặt chống dính',
      'Có recipe book',
    ],
    specs: <String>[
      '4.5L',
      '1500W',
      '8 chế độ nấu',
    ],
  ),
  DemoProduct(
    id: 'eco-fresh-detergent',
    name: 'Nước giặt Eco Fresh',
    category: 'Sức khỏe',
    subtitle: 'An toàn cho da, dùng tiết kiệm',
    priceVnd: 219000,
    rating: 4.8,
    reviewCount: 987,
    shipping: 'Combo tiết kiệm 15%',
    badge: 'Tiết kiệm',
    accentColor: Color(0xFF0F766E),
    icon: Icons.health_and_safety_rounded,
    story: 'Nhóm consumable để tăng tần suất quay lại mua.',
    highlights: <String>[
      'Không chất tẩy mạnh',
      'Mùi hương dịu nhẹ',
      'Dung tích lớn',
    ],
    specs: <String>[
      '3.5L',
      'Đậm đặc',
      'Bảo quản 24 tháng',
    ],
  ),
  DemoProduct(
    id: 'urban-pro-backpack',
    name: 'Balo Urban Pro',
    category: 'Thời trang',
    subtitle: 'Chống nước, laptop 16 inch',
    priceVnd: 690000,
    rating: 4.6,
    reviewCount: 745,
    shipping: 'Giao trong hôm nay',
    badge: 'Được chọn nhiều',
    accentColor: Color(0xFF0EA5A4),
    icon: Icons.workspaces_rounded,
    story: 'Phù hợp dân văn phòng và người dùng mobile-first.',
    highlights: <String>[
      'Khoá ẩn chống trộm',
      'Ngăn sạc riêng',
      'Đệm lưng thoáng khí',
    ],
    specs: <String>[
      '25L',
      'Vải chống nước',
      'Trọng lượng 820g',
    ],
  ),
];

final demoFeaturedProducts = <DemoProduct>[
  demoProducts[0],
  demoProducts[1],
  demoProducts[3],
  demoProducts[5],
];

DemoProduct demoProductById(String id) {
  for (final product in demoProducts) {
    if (product.id == id) {
      return product;
    }
  }
  return demoProducts.first;
}

const demoQuickActions = <String>[
  'Quét QR xác thực',
  'Xem deal hôm nay',
  'Đơn đang giao',
  'Danh mục yêu thích',
];
