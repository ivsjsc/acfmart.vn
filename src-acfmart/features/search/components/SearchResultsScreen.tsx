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
  isOnSale: boolean;
  shopName: string;
  category: string;
}

const SearchResultsScreen: React.FC = () => {
  const [products] = useState<Product[]>([
    {
      id: 'p1',
      name: 'Son dưỡng môi thiên nhiên SPF 15 - Đỏ Ruby',
      price: 250000,
      discountPrice: 180000,
      rating: 4.8,
      reviewCount: 1240,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isOnSale: true,
      shopName: 'Natural Beauty Shop',
      category: 'Mỹ phẩm'
    },
    {
      id: 'p2',
      name: 'Tai nghe không dây chống ồn - Model X Pro',
      price: 1200000,
      discountPrice: 990000,
      rating: 4.6,
      reviewCount: 876,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isOnSale: true,
      shopName: 'Electronics Pro',
      category: 'Điện tử'
    },
    {
      id: 'p3',
      name: 'Mặt nạ dưỡng da Vitamin C - 25ml',
      price: 350000,
      discountPrice: 280000,
      rating: 4.7,
      reviewCount: 542,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isOnSale: false,
      shopName: 'Skincare Essentials',
      category: 'Mỹ phẩm'
    },
    {
      id: 'p4',
      name: 'Balo chống nước thời trang - Size L',
      price: 450000,
      discountPrice: 360000,
      rating: 4.5,
      reviewCount: 321,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isOnSale: true,
      shopName: 'Fashion Hub',
      category: 'Phụ kiện'
    },
    {
      id: 'p5',
      name: 'Sữa rửa mặt dịu nhẹ cho da nhạy cảm',
      price: 280000,
      discountPrice: 220000,
      rating: 4.6,
      reviewCount: 421,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isOnSale: true,
      shopName: 'Natural Beauty Shop',
      category: 'Mỹ phẩm'
    },
    {
      id: 'p6',
      name: 'Toner cân bằng da - 150ml',
      price: 320000,
      discountPrice: 260000,
      rating: 4.5,
      reviewCount: 215,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isOnSale: false,
      shopName: 'Skincare Essentials',
      category: 'Mỹ phẩm'
    },
  ]);

  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>('relevance');
  const [layout, setLayout] = useState<'grid' | 'list'>('list');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const filters = [
    { id: 'price', label: 'Giá', active: activeFilters.includes('price') },
    { id: 'shipping', label: 'Vận chuyển', active: activeFilters.includes('shipping') },
    { id: 'official', label: 'Chính hãng', active: activeFilters.includes('official') },
    { id: 'rating', label: 'Đánh giá', active: activeFilters.includes('rating') },
    { id: 'location', label: 'Khu vực', active: activeFilters.includes('location') },
  ];

  const sortOptions = [
    { id: 'relevance', label: 'Liên quan nhất' },
    { id: 'latest', label: 'Mới nhất' },
    { id: 'price-low', label: 'Giá: Thấp đến cao' },
    { id: 'price-high', label: 'Giá: Cao đến thấp' },
    { id: 'rating', label: 'Đánh giá cao' },
  ];

  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      setActiveFilters(activeFilters.filter(id => id !== filterId));
    } else {
      setActiveFilters([...activeFilters, filterId]);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.category}>{item.category}</Text>
        
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
        
        <Text style={styles.shopName}>{item.shopName}</Text>
        
        <View style={styles.productBadges}>
          {item.isVerified && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🛡️ Chính hãng</Text>
            </View>
          )}
          {item.isOnSale && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🔥 Giảm giá</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={styles.searchResultText}>
          {products.length} kết quả cho "son dưỡng môi"
        </Text>
      </View>
      
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={[styles.filterButton, showFilters && styles.activeFilterButton]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>LỌC</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.sortButton}
          onPress={() => {}}
        >
          <Text style={styles.sortButtonText}>
            {sortOptions.find(opt => opt.id === sortOption)?.label}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.layoutButton}
          onPress={() => setLayout(layout === 'grid' ? 'list' : 'grid')}
        >
          <Text style={styles.layoutButtonText}>{layout === 'grid' ? '📋' : '☰'}</Text>
        </TouchableOpacity>
      </View>
      
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <View style={styles.activeFiltersContainer}>
          {activeFilters.map(filterId => {
            const filter = filters.find(f => f.id === filterId);
            return filter ? (
              <View key={filterId} style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>{filter.label}</Text>
                <TouchableOpacity 
                  onPress={() => toggleFilter(filterId)}
                  style={styles.removeFilterButton}
                >
                  <Text style={styles.removeFilterText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null;
          })}
          <TouchableOpacity 
            style={styles.clearAllButton}
            onPress={() => setActiveFilters([])}
          >
            <Text style={styles.clearAllText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Expanded Filters */}
      {showFilters && (
        <View style={styles.expandedFilters}>
          <Text style={styles.filterSectionTitle}>Bộ lọc</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.map(filter => (
              <TouchableOpacity 
                key={filter.id}
                style={[styles.filterChip, filter.active && styles.activeFilterChip]}
                onPress={() => toggleFilter(filter.id)}
              >
                <Text style={[styles.filterChipText, filter.active && styles.activeFilterChipText]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={styles.filterSectionTitle}>Sắp xếp theo</Text>
          {sortOptions.map(option => (
            <TouchableOpacity 
              key={option.id}
              style={[styles.sortOption, option.id === sortOption && styles.activeSortOption]}
              onPress={() => {
                setSortOption(option.id);
                setShowFilters(false);
              }}
            >
              <Text style={[styles.sortOptionText, option.id === sortOption && styles.activeSortOptionText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.productsContainer}
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
  searchHeader: {
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[3},
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  searchResultText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    fontWeight: '600',
  },
  filterBar: {
    flexDirection: 'row',
    padding: spacing[3},
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  filterButton: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing[2},
    paddingHorizontal: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2},
  },
  activeFilterButton: {
    backgroundColor: colors.brand.red[500],
  },
  filterButtonText: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.secondary,
  },
  activeFilterButtonText: {
    color: colors.neutral[50],
  },
  sortButton: {
    flex: 1.5,
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing[2},
    paddingHorizontal: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2},
  },
  sortButtonText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
  layoutButton: {
    width: 44,
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing[2},
    borderRadius: radius.md,
    alignItems: 'center',
  },
  layoutButtonText: {
    fontSize: typography.h3.fontSize,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing[3},
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  activeFilterChip: {
    flexDirection: 'row',
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[3},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
    marginRight: spacing[2},
    marginBottom: spacing[1},
    alignItems: 'center',
  },
  activeFilterText: {
    color: colors.neutral[50],
    fontSize: typography.body.sm.fontSize,
    marginRight: spacing[1},
  },
  removeFilterButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFilterText: {
    color: colors.neutral[50],
    fontSize: typography.caption.fontSize,
  },
  clearAllButton: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: spacing[3},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
  },
  clearAllText: {
    color: semanticColors.text.primary,
    fontSize: typography.body.sm.fontSize,
  },
  expandedFilters: {
    padding: spacing[4},
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  filterSectionTitle: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[2},
  },
  filterChip: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[2},
    borderRadius: radius.full,
    marginRight: spacing[2},
  },
  activeFilterChip: {
    backgroundColor: colors.brand.red[500],
  },
  filterChipText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
  },
  activeFilterChipText: {
    color: colors.neutral[50],
  },
  sortOption: {
    paddingVertical: spacing[3},
    paddingHorizontal: spacing[4},
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  activeSortOption: {
    backgroundColor: colors.brand.red[50],
  },
  sortOptionText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
  },
  activeSortOptionText: {
    fontWeight: '600',
    color: colors.brand.red[500],
  },
  productsContainer: {
    padding: spacing[4},
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[4},
    marginBottom: spacing[4},
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
  productImage: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing[3},
  },
  productName: {
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
    color: semanticColors.text.primary,
    fontWeight: '500',
    marginBottom: spacing[1},
  },
  category: {
    fontSize: typography.body.sm.fontSize,
    color: colors.brand.red[500],
    marginBottom: spacing[1},
  },
  productRating: {
    flexDirection: 'row',
    marginBottom: spacing[1},
  },
  ratingText: {
    fontSize: typography.body.sm.fontSize,
    color: colors.warning[500],
  },
  reviewCountText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginLeft: spacing[1},
  },
  productPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: spacing[1},
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
    marginLeft: spacing[1},
  },
  discountPercent: {
    fontSize: typography.caption.fontSize,
    color: colors.danger[600],
    fontWeight: '600',
    marginLeft: spacing[1},
  },
  shopName: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[2},
  },
  productBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: colors.success[100],
    paddingHorizontal: spacing[2},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
    marginRight: spacing[2},
    marginBottom: spacing[1},
  },
  badgeText: {
    fontSize: typography.caption.fontSize,
    color: colors.success[700],
    fontWeight: '600',
  },
});

export default SearchResultsScreen;