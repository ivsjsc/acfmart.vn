import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

const OrderSuccessScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.successContainer}>
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Đặt hàng thành công!</Text>
        <Text style={styles.successMessage}>Cảm ơn bạn đã đặt hàng tại ACF Marketplace</Text>
      </View>

      <View style={styles.orderInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Mã đơn hàng:</Text>
          <Text style={styles.value}>ORD-2023-001234</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày đặt:</Text>
          <Text style={styles.value}>15 May 2023, 14:30</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Tổng thanh toán:</Text>
          <Text style={styles.value}>1,250,000₫</Text>
        </View>
      </View>

      <View style={styles.deliveryInfo}>
        <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Dự kiến giao:</Text>
          <Text style={styles.value}>17-19 May 2023</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Địa chỉ nhận:</Text>
          <Text style={styles.value}>123 Đường ABC, Phường XYZ, Quận 1, TP. HCM</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Phương thức:</Text>
          <Text style={styles.value}>Ví ACF</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.trackOrderButton}>
          <Text style={styles.trackOrderButtonText}>THEO DÕI ĐƠN HÀNG</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueShoppingButton}>
          <Text style={styles.continueShoppingButtonText}>TIẾP TỤC MUA SẮM</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    marginBottom: spacing[4],
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
    marginBottom: spacing[2],
  },
  successMessage: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    textAlign: 'center',
  },
  orderInfo: {
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    margin: spacing[4],
    borderRadius: radius.md,
  },
  deliveryInfo: {
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    borderRadius: radius.md,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[3],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  label: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
  },
  value: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing[2],
  },
  actionButtons: {
    flexDirection: 'row',
    padding: spacing[4],
  },
  trackOrderButton: {
    flex: 1,
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4],
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2],
  },
  trackOrderButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  continueShoppingButton: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing[4],
    borderRadius: radius.md,
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  continueShoppingButtonText: {
    color: semanticColors.text.primary,
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
});

export default OrderSuccessScreen;