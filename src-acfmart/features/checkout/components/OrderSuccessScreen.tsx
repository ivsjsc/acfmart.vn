import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

const OrderSuccessScreen: React.FC = () => {
  const [orderInfo] = useState({
    orderId: 'ORD-2023-001234',
    orderDate: '15 May 2023, 14:30',
    totalAmount: 1250000,
    estimatedDelivery: '17-19 May 2023',
    deliveryAddress: '123 Đường ABC, Phường XYZ, Quận 1, TP. HCM',
    paymentMethod: 'Ví ACF',
    items: [
      { id: 'p1', name: 'Son dưỡng môi thiên nhiên SPF 15', quantity: 1, price: 180000 },
      { id: 'p2', name: 'Tai nghe không dây chống ồn', quantity: 1, price: 990000 },
      { id: 'p3', name: 'Mặt nạ Vitamin C', quantity: 2, price: 280000 },
    ]
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.successContainer}>
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        
        <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
        <Text style={styles.successMessage}>
          Cảm ơn bạn đã đặt hàng tại ACF Marketplace
        </Text>
        
        <View style={styles.orderSummary}>
          <Text style={styles.orderId}>Mã đơn hàng: <Text style={styles.orderIdValue}>{orderInfo.orderId}</Text></Text>
          <Text style={styles.orderDate}>Ngày đặt: {orderInfo.orderDate}</Text>
          <Text style={styles.totalAmount}>Tổng thanh toán: <Text style={styles.totalAmountValue}>{orderInfo.totalAmount.toLocaleString('vi-VN')}₫</Text></Text>
        </View>
      </View>
      
      <View style={styles.deliveryInfo}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Dự kiến giao:</Text>
          <Text style={styles.infoValue}>{orderInfo.estimatedDelivery}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Địa chỉ nhận:</Text>
          <Text style={styles.infoValue}>{orderInfo.deliveryAddress}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phương thức:</Text>
          <Text style={styles.infoValue}>{orderInfo.paymentMethod}</Text>
        </View>
      </View>
      
      <View style={styles.orderItems}>
        <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
        
        {orderInfo.items.map((item, index) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemQuantity}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}₫</Text>
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.trackOrderButton}>
          <Text style={styles.trackOrderButtonText}>THEO DÕI ĐƠN HÀNG</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.continueShoppingButton}>
          <Text style={styles.continueShoppingButtonText}>TIẾP TỤC MUA SẮM</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>Cần hỗ trợ?</Text>
        <Text style={styles.helpText}>Liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào về đơn hàng của mình</Text>
        
        <View style={styles.contactButtons}>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Trò chuyện</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Gọi điện</Text>
          </TouchableOpacity>
        </View>
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
  successContainer: {
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  checkmarkContainer: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4},
  },
  checkmark: {
    fontSize: 48,
    color: colors.neutral[50],
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    marginBottom: spacing[2},
  },
  successMessage: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[4},
  },
  orderSummary: {
    backgroundColor: colors.neutral[100],
    padding: spacing[4},
    borderRadius: radius.md,
    width: '100%',
  },
  orderId: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    marginBottom: spacing[1},
  },
  orderIdValue: {
    fontWeight: '600',
  },
  orderDate: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    marginBottom: spacing[1},
  },
  totalAmount: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.danger[600],
    marginTop: spacing[2},
  },
  totalAmountValue: {
    fontSize: typography.h4.fontSize,
  },
  deliveryInfo: {
    padding: spacing[4},
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[3},
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2},
  },
  infoLabel: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
  },
  infoValue: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing[2},
  },
  orderItems: {
    padding: spacing[4},
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2},
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  itemName: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    flex: 2,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  itemQuantity: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
    marginRight: spacing[2},
  },
  itemPrice: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  actionButtons: {
    padding: spacing[4},
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trackOrderButton: {
    flex: 1,
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2},
  },
  trackOrderButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  continueShoppingButton: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginLeft: spacing[2},
  },
  continueShoppingButtonText: {
    color: semanticColors.text.primary,
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  helpSection: {
    padding: spacing[4},
    backgroundColor: colors.neutral[50},
  },
  helpTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[2},
  },
  helpText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    marginBottom: spacing[3},
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactButton: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing[3},
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2},
  },
  contactButtonText: {
    color: semanticColors.text.primary,
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
});

export default OrderSuccessScreen;