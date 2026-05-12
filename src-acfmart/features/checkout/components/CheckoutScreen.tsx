import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius, elevation } from '../../../design-system/tokens';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  estimatedDays: string;
  cost: number;
  isSelected: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  isSelected: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CheckoutScreen: React.FC = () => {
  const [shippingMethods] = useState<ShippingMethod[]>([
    {
      id: 'standard',
      name: 'Giao hàng tiết kiệm',
      description: 'Giao trong vòng 2-3 ngày làm việc',
      estimatedDays: '2-3 ngày',
      cost: 20000,
      isSelected: true
    },
    {
      id: 'express',
      name: 'Giao hàng nhanh',
      description: 'Giao trong vòng 1 ngày làm việc',
      estimatedDays: '1 ngày',
      cost: 35000,
      isSelected: false
    }
  ]);

  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: 'credit', name: 'Thẻ tín dụng', icon: '💳', isSelected: true },
    { id: 'wallet', name: 'Ví ACF', icon: '💰', isSelected: false },
    { id: 'ewallet', name: 'Ví điện tử', icon: '📱', isSelected: false },
    { id: 'cod', name: 'Tiền mặt khi nhận', icon: '💵', isSelected: false }
  ]);

  const [cartItems] = useState<CartItem[]>([
    {
      id: '1',
      name: 'Son dưỡng môi thiên nhiên - SPF 15',
      price: 180000,
      quantity: 1,
      image: 'https://via.placeholder.com/80'
    },
    {
      id: '2',
      name: 'Tai nghe không dây chống ồn',
      price: 990000,
      quantity: 1,
      image: 'https://via.placeholder.com/80'
    }
  ]);

  const [selectedShipping, setSelectedShipping] = useState<string>('standard');
  const [selectedPayment, setSelectedPayment] = useState<string>('credit');
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [useWalletPoints, setUseWalletPoints] = useState<boolean>(false);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingMethods.find(m => m.id === selectedShipping)?.cost || 0;
  const discount = 50000; // Example discount
  const total = subtotal + shippingCost - discount;

  const handlePlaceOrder = () => {
    // Handle order placement
    console.log('Placing order...');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thanh toán</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Delivery Address */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
        <View style={styles.addressCard}>
          <View style={styles.addressInfo}>
            <Text style={styles.recipientName}>Nguyễn Văn A</Text>
            <Text style={styles.phoneNumber}>0123 456 789</Text>
            <Text style={styles.fullAddress}>123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh</Text>
          </View>
          <TouchableOpacity style={styles.changeAddressButton}>
            <Text style={styles.changeAddressText}>Thay đổi</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Shipping Methods */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Phương thức vận chuyển</Text>
        {shippingMethods.map(method => (
          <TouchableOpacity 
            key={method.id}
            style={[
              styles.shippingMethod,
              method.isSelected && styles.selectedShippingMethod
            ]}
            onPress={() => setSelectedShipping(method.id)}
          >
            <View style={styles.shippingMethodContent}>
              <View>
                <Text style={[
                  styles.shippingMethodName,
                  method.isSelected && styles.selectedShippingMethodName
                ]}>
                  {method.name}
                </Text>
                <Text style={styles.shippingMethodDescription}>
                  {method.description} • Dự kiến: {method.estimatedDays}
                </Text>
              </View>
              <Text style={[
                styles.shippingMethodCost,
                method.isSelected && styles.selectedShippingMethodCost
              ]}>
                {method.cost === 0 ? 'Miễn phí' : `${method.cost.toLocaleString('vi-VN')}₫`}
              </Text>
            </View>
            {method.isSelected && <Text style={styles.radioButton}>◉</Text>}
            {!method.isSelected && <Text style={styles.radioButton}>○</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Vouchers & Promotions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Voucher & Khuyến mãi</Text>
        <TouchableOpacity style={styles.voucherSelector}>
          <Text style={styles.voucherText}>Chọn voucher có sẵn</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.voucherInputContainer}>
          <TextInput
            style={styles.voucherInput}
            placeholder="Nhập mã giảm giá"
            value={voucherCode}
            onChangeText={setVoucherCode}
          />
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Methods */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
        {paymentMethods.map(method => (
          <TouchableOpacity 
            key={method.id}
            style={[
              styles.paymentMethod,
              method.isSelected && styles.selectedPaymentMethod
            ]}
            onPress={() => setSelectedPayment(method.id)}
          >
            <View style={styles.paymentMethodContent}>
              <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
              <Text style={[
                styles.paymentMethodName,
                method.isSelected && styles.selectedPaymentMethodName
              ]}>
                {method.name}
              </Text>
            </View>
            {method.isSelected && <Text style={styles.radioButton}>◉</Text>}
            {!method.isSelected && <Text style={styles.radioButton}>○</Text>}
          </TouchableOpacity>
        ))}
      </View>

      {/* Order Summary */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
        
        {/* Cart Items */}
        {cartItems.map(item => (
          <View key={item.id} style={styles.cartItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}₫ x {item.quantity}</Text>
            </View>
            <Text style={styles.itemTotal}>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</Text>
          </View>
        ))}

        {/* Order Totals */}
        <View style={styles.orderSummary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{subtotal.toLocaleString('vi-VN')}₫</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>{shippingCost.toLocaleString('vi-VN')}₫</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>-{discount.toLocaleString('vi-VN')}₫</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Sử dụng điểm ví ACF</Text>
            <TouchableOpacity 
              style={styles.toggleSwitch}
              onPress={() => setUseWalletPoints(!useWalletPoints)}
            >
              <View style={[
                styles.switch,
                useWalletPoints && styles.switchActive
              ]}>
                {useWalletPoints && <Text style={styles.switchThumb}>✓</Text>}
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{total.toLocaleString('vi-VN')}₫</Text>
          </View>
        </View>
      </View>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderButtonText}>🛒 ĐẶT HÀNG</Text>
          <Text style={styles.totalAmount}>{total.toLocaleString('vi-VN')}₫</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  backButton: {
    fontSize: 24,
    color: semanticColors.text.primary,
  },
  headerTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  headerPlaceholder: {
    width: 24, // Same width as back button
  },
  sectionContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  sectionTitle: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[3],
  },
  addressCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[1],
  },
  phoneNumber: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
    marginBottom: spacing[1],
  },
  fullAddress: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  changeAddressButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
  },
  changeAddressText: {
    color: colors.neutral[50],
    fontWeight: '600',
  },
  shippingMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  selectedShippingMethod: {
    backgroundColor: colors.brand.red[50],
    borderRadius: radius.md,
    paddingLeft: spacing[3],
    paddingRight: spacing[3],
    marginHorizontal: -spacing[3],
    marginVertical: spacing[1],
  },
  shippingMethodContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  shippingMethodName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.muted,
  },
  selectedShippingMethodName: {
    color: semanticColors.text.primary,
  },
  shippingMethodDescription: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginTop: spacing[1],
  },
  shippingMethodCost: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
  },
  selectedShippingMethodCost: {
    color: colors.brand.red[500],
    fontWeight: '600',
  },
  radioButton: {
    fontSize: 18,
  },
  voucherSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  voucherText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
  },
  arrow: {
    fontSize: typography.h3.fontSize,
    color: semanticColors.text.muted,
  },
  voucherInputContainer: {
    flexDirection: 'row',
    marginTop: spacing[3],
  },
  voucherInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    fontSize: typography.body.md.fontSize,
    marginRight: spacing[2],
  },
  applyButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    justifyContent: 'center',
  },
  applyButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  selectedPaymentMethod: {
    backgroundColor: colors.brand.red[50],
    borderRadius: radius.md,
    paddingLeft: spacing[3],
    paddingRight: spacing[3],
    marginHorizontal: -spacing[3],
    marginVertical: spacing[1],
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 20,
    marginRight: spacing[3],
  },
  paymentMethodName: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
  },
  selectedPaymentMethodName: {
    color: semanticColors.text.primary,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
    marginLeft: spacing[3],
  },
  itemName: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginTop: spacing[1],
  },
  itemTotal: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    minWidth: 80,
    textAlign: 'right',
  },
  orderSummary: {
    marginTop: spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  summaryLabel: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
  summaryValue: {
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
    paddingTop: spacing[2],
    marginTop: spacing[2],
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
  toggleSwitch: {
    padding: spacing[1],
  },
  switch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchActive: {
    backgroundColor: colors.brand.red[500],
  },
  switchThumb: {
    fontSize: 12,
    color: colors.neutral[50],
  },
  footer: {
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.divider,
  },
  placeOrderButton: {
    backgroundColor: colors.brand.red[500],
    borderRadius: radius.lg,
    padding: spacing[4],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeOrderButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.lg.fontSize,
    fontWeight: 'bold',
  },
  totalAmount: {
    color: colors.neutral[50],
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
  },
});

export default CheckoutScreen;