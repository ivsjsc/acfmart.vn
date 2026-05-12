import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  shopId: string;
  shopName: string;
  isFavorite: boolean;
  variant: string;
}

interface ShopGroup {
  shopId: string;
  shopName: string;
  items: CartItem[];
  voucherAvailable: string | null;
}

const CartScreen: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: '1',
      productId: 'p1',
      name: 'Son dưỡng môi thiên nhiên SPF 15',
      price: 180000,
      quantity: 1,
      image: 'https://via.placeholder.com/100',
      shopId: 's1',
      shopName: 'Natural Beauty Shop',
      isFavorite: false,
      variant: 'Màu Đỏ Ruby'
    },
    {
      id: '2',
      productId: 'p2',
      name: 'Tai nghe không dây chống ồn',
      price: 990000,
      quantity: 1,
      image: 'https://via.placeholder.com/100',
      shopId: 's1',
      shopName: 'Natural Beauty Shop',
      isFavorite: false,
      variant: 'Model Pro X'
    },
    {
      id: '3',
      productId: 'p3',
      name: 'Mặt nạ dưỡng da Vitamin C',
      price: 280000,
      quantity: 2,
      image: 'https://via.placeholder.com/100',
      shopId: 's2',
      shopName: 'Skincare Essentials',
      isFavorite: true,
      variant: 'Size: 25ml'
    },
    {
      id: '4',
      productId: 'p4',
      name: 'Balo chống nước thời trang',
      price: 360000,
      quantity: 1,
      image: 'https://via.placeholder.com/100',
      shopId: 's3',
      shopName: 'Fashion Hub',
      isFavorite: false,
      variant: 'Màu: Đen'
    }
  ]);

  const [expandedShops, setExpandedShops] = useState<{[key: string]: boolean}>({
    's1': true,
    's2': true,
    's3': true
  });

  const toggleShopExpansion = (shopId: string) => {
    setExpandedShops(prev => ({
      ...prev,
      [shopId]: !prev[shopId]
    }));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateSubtotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = (): number => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Group items by shop
  const groupedItems: ShopGroup[] = cartItems.reduce((groups, item) => {
    const groupIndex = groups.findIndex(g => g.shopId === item.shopId);
    
    if (groupIndex === -1) {
      groups.push({
        shopId: item.shopId,
        shopName: item.shopName,
        items: [item],
        voucherAvailable: `FREESHIP-${item.shopId}`
      });
    } else {
      groups[groupIndex].items.push(item);
    }
    
    return groups;
  }, [] as ShopGroup[]);

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemVariant}>{item.variant}</Text>
        <Text style={styles.itemPrice}>{item.price.toLocaleString('vi-VN')}₫</Text>
        
        <View style={styles.quantityControl}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{item.quantity}</Text>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => {
            setCartItems(prev => 
              prev.map(i => 
                i.id === item.id ? { ...i, isFavorite: !i.isFavorite } : i
              )
            );
          }}
        >
          <Text style={styles.favoriteIcon}>
            {item.isFavorite ? '❤️' : '🤍'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeItem(item.id)}
        >
          <Text style={styles.removeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderShopGroup = ({ item }: { item: ShopGroup }) => (
    <View style={styles.shopGroup}>
      <TouchableOpacity 
        style={styles.shopHeader}
        onPress={() => toggleShopExpansion(item.shopId)}
      >
        <View style={styles.shopInfo}>
          <Text style={styles.shopIcon}>🏪</Text>
          <Text style={styles.shopName}>{item.shopName}</Text>
        </View>
        <Text style={styles.expandIcon}>
          {expandedShops[item.shopId] ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>
      
      {expandedShops[item.shopId] && (
        <>
          <FlatList
            data={item.items}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.voucherContainer}>
            <View style={styles.voucherInputContainer}>
              <Text style={styles.voucherPlaceholder}>Mã giảm giá của shop</Text>
              <TouchableOpacity style={styles.voucherButton}>
                <Text style={styles.voucherButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
            
            {item.voucherAvailable && (
              <TouchableOpacity style={styles.availableVoucher}>
                <Text style={styles.voucherText}>{item.voucherAvailable}</Text>
                <Text style={styles.useVoucherText}>Dùng</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.subtotalContainer}>
            <Text style={styles.subtotalLabel}>Tạm tính ({item.items.length} sản phẩm):</Text>
            <Text style={styles.subtotalValue}>
              {calculateSubtotal(item.items).toLocaleString('vi-VN')}₫
            </Text>
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng</Text>
        <Text style={styles.itemCount}>{cartItems.length} sản phẩm</Text>
      </View>
      
      <FlatList
        data={groupedItems}
        renderItem={renderShopGroup}
        keyExtractor={item => item.shopId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      
      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalValue}>{calculateTotal().toLocaleString('vi-VN')}₫</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>TIẾN HÀNH THANH TOÁN</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
  },
  itemCount: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  listContainer: {
    padding: spacing[4],
    paddingBottom: 120, // Space for bottom container
  },
  shopGroup: {
    marginBottom: spacing[5],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
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
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.neutral[100],
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopIcon: {
    fontSize: 20,
    marginRight: spacing[2],
  },
  shopName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  expandIcon: {
    fontSize: 16,
    color: semanticColors.text.muted,
  },
  cartItem: {
    flexDirection: 'row',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  itemImage: {
    width: 80,
    height: 80,
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
    marginBottom: spacing[2],
  },
  itemPrice: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: colors.danger[600],
    marginBottom: spacing[2],
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: typography.body.lg.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
  },
  quantityValue: {
    marginHorizontal: spacing[3],
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    minWidth: 20,
    textAlign: 'center',
  },
  itemActions: {
    marginLeft: spacing[3],
    justifyContent: 'flex-start',
    paddingTop: spacing[2],
  },
  favoriteButton: {
    marginBottom: spacing[3],
  },
  favoriteIcon: {
    fontSize: 20,
  },
  removeButton: {},
  removeIcon: {
    fontSize: 20,
    color: semanticColors.text.muted,
  },
  voucherContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.info[50],
  },
  voucherInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  voucherPlaceholder: {
    flex: 1,
    padding: spacing[2],
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  voucherButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    marginLeft: spacing[2],
  },
  voucherButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.sm.fontSize,
    fontWeight: '600',
  },
  availableVoucher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.gold[100],
    borderRadius: radius.md,
    borderColor: colors.gold[300],
    borderWidth: 1,
  },
  voucherText: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: colors.gold[700],
  },
  useVoucherText: {
    color: colors.brand.red[500],
    fontWeight: '600',
  },
  subtotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    paddingTop: spacing[2],
  },
  subtotalLabel: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
  subtotalValue: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral[50],
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.divider,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  totalLabel: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  totalValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: '700',
    color: colors.danger[600],
  },
  checkoutButton: {
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.lg.fontSize,
    fontWeight: '600',
  },
});

export default CartScreen;