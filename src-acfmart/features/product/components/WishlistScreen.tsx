import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  discountPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  isVerified: boolean;
  shopName: string;
  isInStock: boolean;
  addedDate: string;
}

const WishlistScreen: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([
    {
      id: 'w1',
      productId: 'p1',
      name: 'Son dưỡng môi thiên nhiên SPF 15 - Đỏ Ruby',
      price: 250000,
      discountPrice: 180000,
      rating: 4.8,
      reviewCount: 1240,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      shopName: 'Natural Beauty Shop',
      isInStock: true,
      addedDate: '2023-05-10',
    },
    {
      id: 'w2',
      productId: 'p2',
      name: 'Tai nghe không dây chống ồn - Model X Pro',
      price: 1200000,
      discountPrice: 990000,
      rating: 4.6,
      reviewCount: 876,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      shopName: 'Electronics Pro',
      isInStock: true,
      addedDate: '2023-05-12',
    },
    {
      id: 'w3',
      productId: 'p3',
      name: 'Mặt nạ dưỡng da Vitamin C',
      price: 350000,
      discountPrice: 280000,
      rating: 4.7,
      reviewCount: 542,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      shopName: 'Skincare Essentials',
      isInStock: false,
      addedDate: '2023-05-08',
    },
    {
      id: 'w4',
      productId: 'p4',
      name: 'Balo chống nước thời trang - Size L',
      price: 450000,
      discountPrice: 360000,
      rating: 4.5,
      reviewCount: 321,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      shopName: 'Fashion Hub',
      isInStock: true,
      addedDate: '2023-05-05',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'instock' | 'onsale'>('all');

  const removeFromWishlist = (itemId: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== itemId));
  };

  const moveToList = (itemId: string) => {
    // Move to comparison list
    console.log(`Moving item ${itemId} to comparison`);
  };

  const addToCart = (itemId: string) => {
    // Add to cart logic
    console.log(`Adding item ${itemId} to cart`);
  };

  const filteredItems = wishlistItems.filter(item => {
    if (filter === 'instock') return item.isInStock;
    if (filter === 'onsale') return item.discountPrice < item.price;
    return true;
  });

  const renderWishlistItem = ({ item }: { item: WishlistItem }) => (
    <View style={styles.wishlistItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.shopName}>{item.shopName}</Text>
        
        <View style={styles.itemRating}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          <Text style={styles.reviewCountText}>({item.reviewCount})</Text>
        </View>
        
        <View style={styles.itemPrice}>
          <Text style={styles.discountedPrice}>{item.discountPrice.toLocaleString('vi-VN')}₫</Text>
          <Text style={styles.originalPrice}>{item.price.toLocaleString('vi-VN')}₫</Text>
          <Text style={styles.discountPercent}>
            -{Math.round((1 - item.discountPrice / item.price) * 100)}%
          </Text>
        </View>
        
        {!item.isInStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Hết hàng</Text>
          </View>
        )}
      </View>
      
      <View style={styles.itemActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => removeFromWishlist(item.id)}
        >
          <Text style={styles.actionButtonText}>✕</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => moveToList(item.id)}
        >
          <Text style={styles.actionButtonText}>→</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.addToCartButton, !item.isInStock && styles.disabledButton]}
          onPress={() => addToCart(item.id)}
          disabled={!item.isInStock}
        >
          <Text style={styles.addToCartButtonText}>Mua</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterButtonText]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'instock' && styles.activeFilterButton]}
          onPress={() => setFilter('instock')}
        >
          <Text style={[styles.filterButtonText, filter === 'instock' && styles.activeFilterButtonText]}>Còn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterButton, filter === 'onsale' && styles.activeFilterButton]}
          onPress={() => setFilter('onsale')}
        >
          <Text style={[styles.filterButtonText, filter === 'onsale' && styles.activeFilterButtonText]}>Giảm giá</Text>
        </TouchableOpacity>
      </View>
      
      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>{filteredItems.length} sản phẩm</Text>
      </View>
      
      {/* Wishlist Items */}
      <FlatList
        data={filteredItems}
        renderItem={renderWishlistItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      
      {filteredItems.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Danh sách yêu thích trống</Text>
          <Text style={styles.emptySubtext}>Các sản phẩm bạn yêu thích sẽ hiển thị ở đây</Text>
        </View>
      )}
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
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  filterButton: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2],
  },
  activeFilterButton: {
    backgroundColor: colors.brand.red[500],
  },
  filterButtonText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: colors.neutral[50],
  },
  resultsContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[3],
  },
  resultsText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
  },
  listContainer: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  wishlistItem: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
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
  itemImage: {
    width: 100,
    height: 100,
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
  shopName: {
    fontSize: typography.body.sm.fontSize,
    color: colors.brand.red[500],
    marginBottom: spacing[1],
  },
  itemRating: {
    flexDirection: 'row',
    marginBottom: spacing[1],
  },
  ratingText: {
    fontSize: typography.body.sm.fontSize,
    color: colors.warning[500],
  },
  reviewCountText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginLeft: spacing[1],
  },
  itemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  discountedPrice: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: colors.danger[600],
  },
  originalPrice: {
    fontSize: typography.caption.fontSize,
    color: semanticColors.text.muted,
    textDecorationLine: 'line-through',
    marginLeft: spacing[1],
  },
  discountPercent: {
    fontSize: typography.caption.fontSize,
    color: colors.danger[600],
    fontWeight: '600',
    marginLeft: spacing[1],
  },
  outOfStockBadge: {
    backgroundColor: colors.danger[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  outOfStockText: {
    fontSize: typography.caption.fontSize,
    color: colors.danger[600],
    fontWeight: '600',
  },
  itemActions: {
    marginLeft: spacing[3],
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: colors.neutral[200],
    width: 36,
    height: 36,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  actionButtonText: {
    fontSize: typography.body.lg.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
  },
  addToCartButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.neutral[300],
  },
  addToCartButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.sm.fontSize,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing[10],
  },
  emptyText: {
    fontSize: typography.h3.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[2],
  },
  emptySubtext: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
  },
});

export default WishlistScreen;