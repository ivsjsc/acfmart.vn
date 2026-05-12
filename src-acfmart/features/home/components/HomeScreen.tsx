import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import { colors, semanticColors, spacing, typography, radius, elevation, breakpoints, grid } from '../../../design-system/tokens';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  isVerified: boolean;
}

interface Brand {
  id: string;
  name: string;
  logo: string;
}

const HomeScreen: React.FC = () => {
  const [categories] = useState<Category[]>([
    { id: '1', name: 'Điện thoại', icon: '📱' },
    { id: '2', name: 'Quần áo', icon: '👗' },
    { id: '3', name: 'Mỹ phẩm', icon: '💄' },
    { id: '4', name: 'Dược phẩm', icon: '💊' },
    { id: '5', name: 'Đồ gia dụng', icon: '🏠' },
  ]);

  const [products] = useState<Product[]>([
    { 
      id: '1', 
      name: 'Son dưỡng môi thiên nhiên', 
      price: 250000, 
      discountPrice: 180000, 
      rating: 4.8, 
      reviewCount: 1240, 
      image: 'https://via.placeholder.com/150', 
      isVerified: true 
    },
    { 
      id: '2', 
      name: 'Tai nghe không dây chống ồn', 
      price: 1200000, 
      discountPrice: 990000, 
      rating: 4.6, 
      reviewCount: 876, 
      image: 'https://via.placeholder.com/150', 
      isVerified: true 
    },
    { 
      id: '3', 
      name: 'Sữa rửa mặt dịu nhẹ', 
      price: 350000, 
      discountPrice: 280000, 
      rating: 4.7, 
      reviewCount: 542, 
      image: 'https://via.placeholder.com/150', 
      isVerified: true 
    },
    { 
      id: '4', 
      name: 'Balo chống nước thời trang', 
      price: 450000, 
      discountPrice: 360000, 
      rating: 4.5, 
      reviewCount: 321, 
      image: 'https://via.placeholder.com/150', 
      isVerified: true 
    },
  ]);

  const [brands] = useState<Brand[]>([
    { id: '1', name: 'SkinCare Pro', logo: 'https://via.placeholder.com/80' },
    { id: '2', name: 'TechWorld', logo: 'https://via.placeholder.com/80' },
    { id: '3', name: 'FashionHub', logo: 'https://via.placeholder.com/80' },
  ]);

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>🛡️</Text>
          </View>
        )}
      </View>
      <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.productRating}>
        <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        <Text style={styles.reviewCountText}>({item.reviewCount})</Text>
      </View>
      <View style={styles.productPrice}>
        <Text style={styles.discountedPrice}>{item.discountPrice.toLocaleString('vi-VN')}₫</Text>
        <Text style={styles.originalPrice}>{item.price.toLocaleString('vi-VN')}₫</Text>
        <Text style={styles.discountPercent}>
          -{Math.round((1 - item.discountPrice / item.price) * 100)}%
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.searchBox}>
          <Text style={styles.searchPlaceholder}>🔍 Tìm kiếm sản phẩm...</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Banner */}
      <View style={styles.bannerContainer}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/350x150' }} 
          style={styles.bannerImage} 
        />
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>⏰ Kết thúc sau 18:00</Text>
        </View>
      </View>

      {/* Special Vouchers */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>VOUCHER ĐẶC BIỆT CHO BẠN</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voucherRow}>
          {[1, 2, 3].map((item) => (
            <View key={item} style={styles.voucherCard}>
              <Text style={styles.voucherValue}>-50%</Text>
              <Text style={styles.voucherDescription}>Cho đơn từ 200k</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Categories */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>DANH MỤC NỔI BẬT</Text>
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <TouchableOpacity key={category.id} style={styles.categoryItem}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Verified Products */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>SẢN PHẨM CHÍNH HÃNG VỪA DUYỆT</Text>
          <Text style={styles.seeAllText}>Xem tất cả ></Text>
        </View>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalList}
        />
      </View>

      {/* Trusted Brands */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>THƯƠNG HIỆU TIN CẬY</Text>
          <Text style={styles.seeAllText}>Xem tất cả ></Text>
        </View>
        <View style={styles.brandGrid}>
          {brands.map((brand) => (
            <TouchableOpacity key={brand.id} style={styles.brandItem}>
              <Image source={{ uri: brand.logo }} style={styles.brandLogo} />
              <Text style={styles.brandName}>{brand.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Today's Suggestions */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>GỢI Ý HÔM NAY</Text>
          <Text style={styles.seeAllText}>Xem tất cả ></Text>
        </View>
        <View style={styles.productGrid}>
          {products.slice(0, 4).map((product) => (
            <TouchableOpacity key={product.id} style={styles.gridProductCard}>
              <Image source={{ uri: product.image }} style={styles.gridProductImage} />
              <Text style={styles.gridProductName} numberOfLines={2}>{product.name}</Text>
              <View style={styles.gridProductPrice}>
                <Text style={styles.gridDiscountedPrice}>{product.discountPrice.toLocaleString('vi-VN')}₫</Text>
                <Text style={styles.gridOriginalPrice}>{product.price.toLocaleString('vi-VN')}₫</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bottom Navigation Placeholder */}
      <View style={styles.bottomNavPlaceholder} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
  },
  searchContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.brand.red[500],
  },
  searchBox: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchPlaceholder: {
    color: semanticColors.text.muted,
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
  },
  bannerContainer: {
    marginHorizontal: spacing[4],
    marginTop: spacing[3],
    borderRadius: radius.lg,
    overflow: 'hidden',
    elevation: elevation.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  bannerImage: {
    width: '100%',
    height: 150,
  },
  countdownContainer: {
    position: 'absolute',
    bottom: spacing[2],
    right: spacing[2],
    backgroundColor: colors.danger[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  countdownText: {
    color: colors.neutral[50],
    fontWeight: 600,
    fontSize: typography.caption.fontSize,
  },
  sectionContainer: {
    paddingHorizontal: spacing[4],
    marginTop: spacing[5],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    lineHeight: typography.h4.lineHeight,
    fontWeight: 600,
    color: semanticColors.text.primary,
  },
  seeAllText: {
    color: colors.brand.red[500],
    fontSize: typography.body.sm.fontSize,
  },
  voucherRow: {
    flexDirection: 'row',
  },
  voucherCard: {
    backgroundColor: colors.gold[100],
    borderRadius: radius.lg,
    padding: spacing[3],
    marginRight: spacing[3],
    minWidth: 120,
    borderColor: colors.gold[300],
    borderWidth: 1,
  },
  voucherValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: 700,
    color: colors.gold[700],
  },
  voucherDescription: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
    marginTop: spacing[1],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: spacing[4],
    width: '20%', // 5 items per row
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: spacing[1],
  },
  categoryName: {
    fontSize: typography.body.sm.fontSize,
    textAlign: 'center',
    color: semanticColors.text.secondary,
  },
  horizontalList: {
    maxHeight: 200,
  },
  productCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    marginRight: spacing[4],
    width: 150,
    padding: spacing[3],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  productImageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.success[500],
    borderRadius: radius.full,
    padding: spacing[1],
  },
  verifiedBadgeText: {
    fontSize: 12,
  },
  productName: {
    fontSize: typography.body.sm.fontSize,
    lineHeight: typography.body.sm.lineHeight,
    color: semanticColors.text.primary,
    marginTop: spacing[2],
    minHeight: 36,
  },
  productRating: {
    flexDirection: 'row',
    marginTop: spacing[1],
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
  productPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  discountedPrice: {
    fontSize: typography.body.md.fontSize,
    fontWeight: 600,
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
    fontWeight: 600,
    marginLeft: spacing[1],
  },
  brandGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandItem: {
    alignItems: 'center',
    width: '30%',
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    marginBottom: spacing[2],
  },
  brandName: {
    fontSize: typography.body.sm.fontSize,
    textAlign: 'center',
    color: semanticColors.text.secondary,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridProductCard: {
    width: '48%',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[3],
    marginBottom: spacing[3],
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  gridProductImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
  },
  gridProductName: {
    fontSize: typography.body.sm.fontSize,
    lineHeight: typography.body.sm.lineHeight,
    color: semanticColors.text.primary,
    marginTop: spacing[2],
    minHeight: 36,
  },
  gridProductPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  gridDiscountedPrice: {
    fontSize: typography.body.md.fontSize,
    fontWeight: 600,
    color: colors.danger[600],
  },
  gridOriginalPrice: {
    fontSize: typography.caption.fontSize,
    color: semanticColors.text.muted,
    textDecorationLine: 'line-through',
    marginLeft: spacing[1],
  },
  bottomNavPlaceholder: {
    height: 80, // Height of bottom navigation
  },
});

export default HomeScreen;