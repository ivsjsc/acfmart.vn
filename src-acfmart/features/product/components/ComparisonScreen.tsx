import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface ProductFeature {
  name: string;
  value: string;
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
  shopName: string;
  features: ProductFeature[];
}

const ComparisonScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 'p1',
      name: 'Son dưỡng môi thiên nhiên SPF 15',
      price: 250000,
      discountPrice: 180000,
      rating: 4.8,
      reviewCount: 1240,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      shopName: 'Natural Beauty Shop',
      features: [
        { name: 'Thành phần', value: 'Thiên nhiên' },
        { name: 'SPF', value: '15' },
        { name: 'Dưỡng ẩm', value: 'Cao' },
        { name: 'Thời gian dùng', value: '12h' },
        { name: 'Chống nước', value: 'Không' },
      ]
    },
    {
      id: 'p2',
      name: 'Son kem lì chống nước',
      price: 280000,
      discountPrice: 220000,
      rating: 4.6,
      reviewCount: 876,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      shopName: 'Makeup Studio',
      features: [
        { name: 'Thành phần', value: 'Synthetic' },
        { name: 'SPF', value: 'Không' },
        { name: 'Dưỡng ẩm', value: 'Thấp' },
        { name: 'Thời gian dùng', value: '24h' },
        { name: 'Chống nước', value: 'Có' },
      ]
    },
    {
      id: 'p3',
      name: 'Son tint dạng nước',
      price: 220000,
      discountPrice: 190000,
      rating: 4.5,
      reviewCount: 542,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      shopName: 'Beauty Express',
      features: [
        { name: 'Thành phần', value: 'Organic' },
        { name: 'SPF', value: '10' },
        { name: 'Dưỡng ẩm', value: 'Trung bình' },
        { name: 'Thời gian dùng', value: '18h' },
        { name: 'Chống nước', value: 'Có' },
      ]
    },
  ]);

  const allFeatures = Array.from(
    new Set(products.flatMap(p => p.features.map(f => f.name)))
  );

  const removeProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>So sánh sản phẩm</Text>
      
      {/* Product Cards Row */}
      <View style={styles.productsRow}>
        {products.map(product => (
          <View key={product.id} style={styles.productColumn}>
            <TouchableOpacity 
              style={styles.removeButton}
              onPress={() => removeProduct(product.id)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
            <Text style={styles.shopName}>{product.shopName}</Text>
            
            <View style={styles.productPrice}>
              <Text style={styles.discountedPrice}>{product.discountPrice.toLocaleString('vi-VN')}₫</Text>
              <Text style={styles.originalPrice}>{product.price.toLocaleString('vi-VN')}₫</Text>
            </View>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {product.rating}</Text>
              <Text style={styles.reviewCount}>({product.reviewCount})</Text>
            </View>
            
            {product.isVerified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>🛡️ Chính hãng</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>Thêm vào giỏ</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {products.length < 4 && (
          <TouchableOpacity style={styles.addMoreColumn}>
            <Text style={styles.plusIcon}>+</Text>
            <Text style={styles.addMoreText}>Thêm sản phẩm</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Features Comparison Table */}
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.featureName}>Tính năng</Text>
          {products.map(product => (
            <Text key={product.id} style={styles.productHeader}>{product.name}</Text>
          ))}
        </View>
        
        {allFeatures.map(featureName => (
          <View key={featureName} style={styles.tableRow}>
            <Text style={styles.featureName}>{featureName}</Text>
            {products.map(product => {
              const feature = product.features.find(f => f.name === featureName);
              return (
                <Text key={`${product.id}-${featureName}`} style={styles.featureValue}>
                  {feature ? feature.value : '-'}
                </Text>
              );
            })}
          </View>
        ))}
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.compareButton}>
          <Text style={styles.compareButtonText}>MUA NGAY</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>CHIA SẺ</Text>
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
  productsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing[2],
    marginBottom: spacing[5],
  },
  productColumn: {
    flex: 1,
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    marginHorizontal: spacing[1],
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
  addMoreColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing[3],
    backgroundColor: colors.neutral[100],
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: radius.md,
    marginHorizontal: spacing[1],
  },
  plusIcon: {
    fontSize: 40,
    color: colors.neutral[400],
    marginBottom: spacing[2],
  },
  addMoreText: {
    fontSize: typography.body.md.fontSize,
    color: colors.neutral[500],
  },
  removeButton: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: colors.danger[500],
    width: 24,
    height: 24,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.sm.fontSize,
    fontWeight: 'bold',
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginVertical: spacing[2],
  },
  productName: {
    fontSize: typography.body.sm.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    textAlign: 'center',
    marginVertical: spacing[1],
  },
  shopName: {
    fontSize: typography.caption.fontSize,
    color: colors.brand.red[500],
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  productPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[1],
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
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing[2],
  },
  rating: {
    fontSize: typography.body.sm.fontSize,
    color: colors.warning[500],
  },
  reviewCount: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginLeft: spacing[1],
  },
  verifiedBadge: {
    backgroundColor: colors.success[100],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    marginBottom: spacing[2],
  },
  verifiedText: {
    fontSize: typography.caption.fontSize,
    color: colors.success[700],
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    marginTop: spacing[2],
  },
  addButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.sm.fontSize,
  },
  tableContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    marginHorizontal: spacing[4],
    marginBottom: spacing[5],
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
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  featureName: {
    flex: 1,
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    paddingHorizontal: spacing[2],
  },
  productHeader: {
    flex: 1,
    fontSize: typography.body.sm.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  featureValue: {
    flex: 1,
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing[1],
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[5],
  },
  compareButton: {
    flex: 3,
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2],
  },
  compareButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.lg.fontSize,
    fontWeight: 'bold',
  },
  shareButton: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginLeft: spacing[2],
  },
  shareButtonText: {
    color: semanticColors.text.primary,
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
  },
});

export default ComparisonScreen;