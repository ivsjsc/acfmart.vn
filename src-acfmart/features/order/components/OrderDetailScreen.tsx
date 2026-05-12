import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: string;
  isVerified: boolean;
}

interface OrderEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
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
  paymentMethod: string;
  deliveryEstimate: string;
  note?: string;
}

const OrderDetailScreen: React.FC = () => {
  const [order] = useState<Order>({
    id: '1',
    orderId: 'ORD-2023-001234',
    shopName: 'Natural Beauty Shop',
    shopAvatar: 'https://via.placeholder.com/40',
    status: 'shipping',
    total: 1170000,
    date: '2023-05-15',
    items: [
      {
        id: 'i1',
        name: 'Son dưỡng môi thiên nhiên SPF 15',
        price: 180000,
        quantity: 1,
        image: 'https://via.placeholder.com/60',
        variant: 'Màu Đỏ Ruby',
        isVerified: true
      },
      {
        id: 'i2',
        name: 'Tai nghe không dây chống ồn',
        price: 990000,
        quantity: 1,
        image: 'https://via.placeholder.com/60',
        variant: 'Model Pro X',
        isVerified: true
      }
    ],
    trackingNumber: 'TN-789012',
    shippingAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP. HCM',
    paymentMethod: 'Thẻ tín dụng',
    deliveryEstimate: '2023-05-18',
    note: 'Giao hàng trong giờ hành chính'
  });

  const [timeline] = useState<OrderEvent[]>([
    {
      id: '1',
      title: 'Đơn hàng đã được xác nhận',
      description: 'Shop đã xác nhận đơn hàng của bạn',
      timestamp: '2023-05-15 10:30',
      status: 'completed'
    },
    {
      id: '2',
      title: 'Đang chuẩn bị hàng',
      description: 'Shop đang chuẩn bị hàng để giao cho đơn vị vận chuyển',
      timestamp: '2023-05-15 14:15',
      status: 'completed'
    },
    {
      id: '3',
      title: 'Đã giao cho đơn vị vận chuyển',
      description: 'Đơn hàng đã được giao cho đơn vị vận chuyển',
      timestamp: '2023-05-16 09:00',
      status: 'completed'
    },
    {
      id: '4',
      title: 'Đang trên đường giao',
      description: 'Đơn vị vận chuyển đang giao hàng đến bạn',
      timestamp: '2023-05-18 15:30',
      status: 'current'
    },
    {
      id: '5',
      title: 'Giao hàng thành công',
      description: 'Đơn hàng đã được giao thành công',
      timestamp: 'Dự kiến 2023-05-18 18:00',
      status: 'pending'
    }
  ]);

  const renderOrderItem = ({ item }: { item: OrderItem }) => (
    <View style={styles.orderItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.itemVariant}>{item.variant}</Text>
        <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}₫ x {item.quantity}</Text>
      </View>
      {item.isVerified && (
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>🛡️</Text>
        </View>
      )}
    </View>
  );

  const renderTimelineItem = ({ item }: { item: OrderEvent }) => (
    <View style={styles.timelineItem}>
      <View style={[
        styles.timelineDot,
        item.status === 'completed' && styles.completedDot,
        item.status === 'current' && styles.currentDot,
        item.status === 'pending' && styles.pendingDot,
      ]}>
        {item.status === 'completed' && <Text style={styles.timelineDotIcon}>✓</Text>}
        {item.status === 'current' && <Text style={styles.timelineDotIcon}>●</Text>}
        {item.status === 'pending' && <Text style={styles.timelineDotIcon}>○</Text>}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[
          styles.timelineTitle,
          item.status === 'current' && styles.currentTimelineTitle
        ]}>
          {item.title}
        </Text>
        <Text style={styles.timelineDescription}>{item.description}</Text>
        <Text style={styles.timelineTimestamp}>{item.timestamp}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
      
      {/* Order Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>#{order.orderId}</Text>
          <Text style={[
            styles.statusText,
            order.status === 'pending' && styles.pendingStatus,
            order.status === 'confirmed' && styles.confirmedStatus,
            order.status === 'shipping' && styles.shippingStatus,
            order.status === 'delivered' && styles.deliveredStatus,
            order.status === 'cancelled' && styles.cancelledStatus,
            order.status === 'returned' && styles.returnedStatus,
          ]}>
            {order.status === 'pending' ? 'Chờ xác nhận' : 
             order.status === 'confirmed' ? 'Đã xác nhận' : 
             order.status === 'shipping' ? 'Đang giao' : 
             order.status === 'delivered' ? 'Đã giao' : 
             order.status === 'cancelled' ? 'Đã hủy' : 
             'Trả hàng'}
          </Text>
        </View>
        
        <View style={styles.shopInfo}>
          <Image source={{ uri: order.shopAvatar }} style={styles.shopAvatar} />
          <Text style={styles.shopName}>{order.shopName}</Text>
        </View>
      </View>
      
      {/* Order Timeline */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Theo dõi đơn hàng</Text>
        <FlatList
          data={timeline}
          renderItem={renderTimelineItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
      
      {/* Order Items */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Sản phẩm</Text>
        <FlatList
          data={order.items}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
      
      {/* Order Details */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Mã đơn hàng:</Text>
          <Text style={styles.detailValue}>{order.orderId}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ngày đặt:</Text>
          <Text style={styles.detailValue}>{order.date}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phương thức thanh toán:</Text>
          <Text style={styles.detailValue}>{order.paymentMethod}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Dự kiến giao:</Text>
          <Text style={styles.detailValue}>{order.deliveryEstimate}</Text>
        </View>
        
        {order.trackingNumber && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mã vận đơn:</Text>
            <Text style={styles.detailValue}>{order.trackingNumber}</Text>
          </View>
        )}
        
        {order.note && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ghi chú:</Text>
            <Text style={styles.detailValue}>{order.note}</Text>
          </View>
        )}
      </View>
      
      {/* Shipping Address */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
        <Text style={styles.addressText}>{order.shippingAddress}</Text>
      </View>
      
      {/* Price Breakdown */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Tổng cộng</Text>
        
        <View style={styles.priceBreakdown}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Tạm tính</Text>
            <Text style={styles.breakdownValue}>
              {order.total.toLocaleString('vi-VN')}₫
            </Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Phí vận chuyển</Text>
            <Text style={styles.breakdownValue}>20,000₫</Text>
          </View>
          
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Giảm giá</Text>
            <Text style={[styles.breakdownValue, styles.discountValue]}>-50,000₫</Text>
          </View>
          
          <View style={[styles.breakdownRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            <Text style={styles.totalValue}>{(order.total + 20000 - 50000).toLocaleString('vi-VN')}₫</Text>
          </View>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Liên hệ shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackButtonText}>Theo dõi đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  statusCard: {
    backgroundColor: colors.neutral[50],
    marginHorizontal: spacing[4],
    padding: spacing[4],
    borderRadius: radius.md,
    marginBottom: spacing[4],
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
  orderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  orderId: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  statusText: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[3],
    borderRadius: radius.full,
  },
  pendingStatus: {
    backgroundColor: colors.warning[100],
    color: colors.warning[600],
  },
  confirmedStatus: {
    backgroundColor: colors.info[100],
    color: colors.info[600],
  },
  shippingStatus: {
    backgroundColor: colors.brand.gold[100],
    color: colors.brand.gold[600],
  },
  deliveredStatus: {
    backgroundColor: colors.success[100],
    color: colors.success[600],
  },
  cancelledStatus: {
    backgroundColor: colors.danger[100],
    color: colors.danger[600],
  },
  returnedStatus: {
    backgroundColor: colors.neutral[200],
    color: colors.neutral[600],
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
  sectionContainer: {
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[4],
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
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[3],
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: spacing[4],
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    marginTop: 4,
  },
  completedDot: {
    backgroundColor: colors.success[500],
    borderColor: colors.success[500],
  },
  currentDot: {
    backgroundColor: colors.brand.gold[500],
    borderColor: colors.brand.gold[500],
  },
  pendingDot: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[300],
  },
  timelineDotIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.neutral[50],
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.muted,
    marginBottom: spacing[1],
  },
  currentTimelineTitle: {
    color: semanticColors.text.primary,
  },
  timelineDescription: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[1],
  },
  timelineTimestamp: {
    fontSize: typography.caption.fontSize,
    color: semanticColors.text.muted,
  },
  orderItem: {
    flexDirection: 'row',
    paddingVertical: spacing[3},
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
    justifyContent: 'center',
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
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  verifiedText: {
    color: colors.neutral[50],
    fontSize: 12,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: spacing[2},
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  detailLabel: {
    flex: 1,
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
  },
  detailValue: {
    flex: 1.5,
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    textAlign: 'right',
  },
  addressText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.md.lineHeight,
  },
  priceBreakdown: {
    marginTop: spacing[2],
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing[2},
  },
  breakdownLabel: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
  breakdownValue: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    fontWeight: '600',
  },
  discountValue: {
    color: colors.success[600],
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.divider,
    paddingTop: spacing[2},
    marginTop: spacing[2},
  },
  totalLabel: {
    fontSize: typography.h4.fontSize,
    color: semanticColors.text.primary,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: typography.h4.fontSize,
    color: colors.danger[600],
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4},
    marginBottom: spacing[6},
  },
  contactButton: {
    flex: 1,
    backgroundColor: colors.info[500],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2],
  },
  contactButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
  },
  trackButton: {
    flex: 1.5,
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  trackButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
  },
});

export default OrderDetailScreen;