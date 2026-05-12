import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface Product {
  id: string;
  name: string;
  price: number;
  discountPrice: number;
  rating: number;
  reviewCount: number;
  image: string;
  isVerified: boolean;
  isNew: boolean;
  isBestSeller: boolean;
}

interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  founded: string;
  certifications: string[];
  totalProducts: number;
  followers: number;
}

const BrandPageScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'bestseller'>('all');
  const [followed, setFollowed] = useState<boolean>(false);

  const brand: Brand = {
    id: 'b1',
    name: 'Natural Beauty',
    logo: 'https://via.placeholder.com/100',
    description: 'Natural Beauty là thương hiệu mỹ phẩm thiên nhiên hàng đầu Việt Nam, chuyên cung cấp các sản phẩm chăm sóc da và trang điểm từ thành phần thiên nhiên, an toàn cho da nhạy cảm.',
    founded: '2018',
    certifications: ['ISO 22716', 'FDA_approved', 'Cruelty_free'],
    totalProducts: 42,
    followers: 12500,
  };

  const products: Product[] = [
    {
      id: 'p1',
      name: 'Son dưỡng môi thiên nhiên SPF 15',
      price: 250000,
      discountPrice: 180000,
      rating: 4.8,
      reviewCount: 1240,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isNew: true,
      isBestSeller: false,
    },
    {
      id: 'p2',
      name: 'Mặt nạ Vitamin C sáng da',
      price: 350000,
      discountPrice: 280000,
      rating: 4.7,
      reviewCount: 542,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isNew: false,
      isBestSeller: true,
    },
    {
      id: 'p3',
      name: 'Sữa rửa mặt dịu nhẹ',
      price: 280000,
      discountPrice: 220000,
      rating: 4.6,
      reviewCount: 321,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isNew: false,
      isBestSeller: true,
    },
    {
      id: 'p4',
      name: 'Toner cân bằng da',
      price: 320000,
      discountPrice: 260000,
      rating: 4.5,
      reviewCount: 215,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isNew: true,
      isBestSeller: false,
    },
    {
      id: 'p5',
      name: 'Kem chống nắng vật lý',
      price: 380000,
      discountPrice: 320000,
      rating: 4.9,
      reviewCount: 421,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isNew: false,
      isBestSeller: true,
    },
  ];

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(p => (activeTab === 'new' && p.isNew) || (activeTab === 'bestseller' && p.isBestSeller));

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedBadgeText}>🛡️</Text>
          </View>
        )}
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>MỚI</Text>
          </View>
        )}
        {item.isBestSeller && (
          <View style={styles.bestSellerBadge}>
            <Text style={styles.bestSellerBadgeText}>BÁN CHẠY</Text>
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
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <Image source={{ uri: brand.logo }} style={styles.brandLogo} />
        <View style={styles.brandInfo}>
          <Text style={styles.brandName}>{brand.name}</Text>
          <Text style={styles.brandStats}>{brand.totalProducts} sản phẩm • {brand.followers.toLocaleString()} người theo dõi</Text>
          <Text style={styles.brandFounded}>Thành lập: {brand.founded}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.followButton, followed && styles.followedButton]} 
          onPress={() => setFollowed(!followed)}
        >
          <Text style={[styles.followButtonText, followed && styles.followedButtonText]}>
            {followed ? 'Đang theo dõi' : 'Theo dõi'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Certifications */}
      <View style={styles.certificationsContainer}>
        <Text style={styles.certificationsTitle}>Chứng nhận</Text>
        <View style={styles.certificationsList}>
          {brand.certifications.map((cert, index) => (
            <View key={index} style={styles.certificationBadge}>
              <Text style={styles.certificationText}>{cert}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Brand Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>{brand.description}</Text>
      </View>

      {/* Products Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'new' && styles.activeTab]}
          onPress={() => setActiveTab('new')}
        >
          <Text style={[styles.tabText, activeTab === 'new' && styles.activeTabText]}>Mới</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bestseller' && styles.activeTab]}
          onPress={() => setActiveTab('bestseller')}
        >
          <Text style={[styles.tabText, activeTab === 'bestseller' && styles.activeTabText]}>Bán chạy</Text>
        </TouchableOpacity>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  brandLogo: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    marginRight: spacing[3],
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    marginBottom: spacing[1],
  },
  brandStats: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[1],
  },
  brandFounded: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  followButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
  },
  followedButton: {
    backgroundColor: colors.neutral[300],
  },
  followButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  followedButtonText: {
    color: semanticColors.text.primary,
  },
  certificationsContainer: {
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
  },
  certificationsTitle: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[2],
  },
  certificationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  certificationBadge: {
    backgroundColor: colors.success[100],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  certificationText: {
    color: colors.success[700],
    fontSize: typography.body.sm.fontSize,
    fontWeight: '600',
  },
  descriptionContainer: {
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  descriptionText: {
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
    color: semanticColors.text.secondary,
    textAlign: 'justify',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing[2],
    marginHorizontal: spacing[1],
    borderRadius: radius.md,
    backgroundColor: colors.neutral[200],
  },
  activeTab: {
    backgroundColor: colors.brand.red[500],
  },
  tabText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.neutral[50],
  },
  productsContainer: {
    padding: spacing[4],
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: spacing[4],
  },
  productCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[3],
    width: '48%',
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
  productImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'contain',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: colors.success[500],
    borderRadius: radius.full,
    padding: spacing[1],
  },
  verifiedBadgeText: {
    fontSize: 12,
    color: colors.neutral[50],
  },
  newBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: colors.brand.gold[500],
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  newBadgeText: {
    fontSize: 10,
    color: colors.neutral[900],
    fontWeight: 'bold',
  },
  bestSellerBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: colors.danger[500],
    borderRadius: radius.full,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
  },
  bestSellerBadgeText: {
    fontSize: 10,
    color: colors.neutral[50],
    fontWeight: 'bold',
  },
  productName: {
    fontSize: typography.body.sm.fontSize,
    lineHeight: typography.body.sm.lineHeight,
    color: semanticColors.text.primary,
    marginTop: spacing[1],
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
    marginTop: spacing[1],
  },
  discountedPrice: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600,
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
});

export default BrandPageScreen;