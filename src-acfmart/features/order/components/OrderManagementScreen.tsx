Cimport React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: string;
}

interface Order {
  id: string;
  orderId: string;
  shopName: string;
  shopAvatar: string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'returned';
  total: number;
  date: string;
  items: OrderItem[];
  trackingNumber?: string;
  shippingAddress: string;
}

const OrderManagementScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderId: 'ORD-2023-001234',
      shopName: 'Natural Beauty Shop',
      shopAvatar: 'https://via.placeholder.com/40',
      status: 'delivered',
      total: 1170000,
      date: '2023-05-15',
      items: [
        {
          id: 'i1',
          name: 'Son dưỡng môi thiên nhiên SPF 15',
          price: 180000,
          quantity: 1,
          image: 'https://via.placeholder.com/60',
          variant: 'Màu Đỏ Ruby'
        },
        {
          id: 'i2',
          name: 'Tai nghe không dây chống ồn',
          price: 990000,
          quantity: 1,
          image: 'https://via.placeholder.com/60',
          variant: 'Model Pro X'
        }
      ],
      shippingAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP. HCM'
    },
    {
      id: '2',
      orderId: 'ORD-2023-001235',
      shopName: 'Skincare Essentials',
      shopAvatar: 'https://via.placeholder.com/40',
      status: 'shipping',
      total: 560000,
      date: '2023-05-16',
      items: [
        {
          id: 'i3',
          name: 'Mặt nạ dưỡng da Vitamin C',
          price: 280000,
          quantity: 2,
          image: 'https://via.placeholder.com/60',
          variant: 'Size: 25ml'
        }
      ],
      trackingNumber: 'TN-789012',
      shippingAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP. HCM'
    },
    {
      id: '3',
      orderId: 'ORD-2023-001236',
      shopName: 'Fashion Hub',
      shopAvatar: 'https://via.placeholder.com/40',
      status: 'pending',
      total: 360000,
      date: '2023-05-17',
      items: [
        {
          id: 'i4',
          name: 'Balo chống nước thời trang',
          price: 360000,
          quantity: 1,
          image: 'https://via.placeholder.com/60',
          variant: 'Màu: Đen'
        }
      ],
      shippingAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP. HCM'
    },
    {
      id: '4',
      orderId: 'ORD-2023-001237',
      shopName: 'Electronics Pro',
      shopAvatar: 'https://via.placeholder.com/40',
      status: 'confirmed',
      total: 2450000,
      date: '2023-05-18',
      items: [
        {
          id: 'i5',
          name: 'Laptop Ultrabook Pro',
          price: 2450000,
          quantity: 1,
          image: 'https://via.placeholder.com/60',
          variant: 'Core i7, 16GB RAM'
        }
      ],
      shippingAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP. HCM'
    }
  ]);

  const tabs = [
    { id: 'all', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'confirmed', label: 'Đã xác nhận' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'delivered', label: 'Đã giao' },
    { id: 'cancelled', label: 'Đã hủy' },
    { id: 'returned', label: 'Trả hàng' },
  ];

  const getStatusText = (status: string): string => {
    switch(status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      case 'returned': return 'Trả hàng';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'pending': return colors.warning[500];
      case 'confirmed': return colors.info[500];
      case 'shipping': return colors.brand.gold[500];
      case 'delivered': return colors.success[500];
      case 'cancelled': return colors.danger[500];
      case 'returned': return colors.neutral[500];
      default: return colors.neutral[500];
    }
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemVariant}>{item.variant}</Text>
        <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}₫ x {item.quantity}</Text>
      </View>
    </View>
  );

  const renderOrder = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.shopInfo}>
          <Image source={{ uri: item.shopAvatar }} style={styles.shopAvatar} />
          <Text style={styles.shopName}>{item.shopName}</Text>
        </View>
        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
          {getStatusText(item.status)}
        </Text>
      </View>
      
      <FlatList
        data={item.items}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
      
      <View style={styles.orderFooter}>
        <View style={styles.orderDetails}>
          <Text style={styles.orderId}>#{item.orderId}</Text>
          <Text style={styles.orderDate}>{item.date}</Text>
        </View>
        <Text style={styles.orderTotal}>Tổng: {item.total.toLocaleString('vi-VN')}₫</Text>
      </View>
      
      <View style={styles.orderActions}>
        {item.status === 'delivered' && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Viết đánh giá</Text>
          </TouchableOpacity>
        )}
        {(item.status === 'delivered' || item.status === 'shipping') && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Theo dõi đơn hàng</Text>
          </TouchableOpacity>
        )}
        {item.status === 'delivered' && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Mua lại</Text>
          </TouchableOpacity>
        )}
        {(item.status === 'pending' || item.status === 'confirmed') && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => console.log('Cancel order')}
          >
            <Text style={styles.cancelButtonText}>Hủy đơn</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
      
      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text 
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ordersList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
    paddingTop: spacing[6],
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  tabsContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  tab: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    marginRight: spacing[2],
    borderRadius: radius.full,
    backgroundColor: colors.neutral[100],
  },
  activeTab: {
    backgroundColor: colors.brand.red[500],
  },
  tabText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
  activeTabText: {
    color: colors.neutral[50],
    fontWeight: '600',
  },
  ordersList: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  orderCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    marginBottom: spacing[4],
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    marginRight: spacing[2],
  },
  shopName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  statusText: {
    fontSize: typography.body.sm.fontSize,
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    resizeMode: 'contain',
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  itemName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '500',
    color: semanticColors.text.primary,
    marginBottom: spacing[1],
  },
  itemVariant: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[1],
  },
  itemPrice: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.primary,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.neutral[100],
  },
  orderDetails: {
    flex: 1,
  },
  orderId: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  orderDate: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  orderTotal: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing[4],
    paddingTop: spacing[2],
  },
  actionButton: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    marginLeft: spacing[2],
  },
  actionButtonText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.primary,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: colors.danger[100],
  },
  cancelButtonText: {
    color: colors.danger[600],
  },
});

export default OrderManagementScreen;