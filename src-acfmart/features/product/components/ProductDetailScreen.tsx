import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius, elevation } from '../../../design-system/tokens';

interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  discountPercentage: number;
  rating: number;
  reviewCount: number;
  images: string[];
  variants: ProductVariant[];
  isVerified: boolean;
  brand: string;
  category: string;
  shippingInfo: string;
}

const ProductDetailScreen: React.FC = () => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  
  const product: Product = {
    id: '1',
    name: 'Son dưỡng môi thiên nhiên - SPF 15 - Màu Đỏ Ruby',
    description: 'Son dưỡng môi với thành phần thiên nhiên, chiết xuất từ dầu dừa, vitamin E và SPF 15 giúp bảo vệ môi khỏi tia UV. Công thức không chứa paraben, không ch desoxybenzoin, không chứa chì.',
    price: 250000,
    discountPrice: 180000,
    discountPercentage: 28,
    rating: 4.8,
    reviewCount: 1240,
    images: [
      'https://via.placeholder.com/300x300',
      'https://via.placeholder.com/300x300',
      'https://via.placeholder.com/300x300',
      'https://via.placeholder.com/300x300',
    ],
    variants: [
      {
        id: 'color',
        name: 'Màu sắc',
        options: ['Đỏ Ruby', 'Cam San hô', 'Hồng đất', 'Nude']
      },
      {
        id: 'finish',
        name: 'Hoàn thiện',
        options: ['Matte', 'Bóng', 'Lì']
      }
    ],
    isVerified: true,
    brand: 'Natural Beauty',
    category: 'Mỹ phẩm',
    shippingInfo: 'Giao hàng tiết kiệm trong 2-3 ngày'
  };

  const reviews: Review[] = [
    {
      id: '1',
      userName: 'Nguyễn Thị Lan',
      rating: 5,
      comment: 'Son lên màu đẹp, dưỡng môi tốt, không bị khô môi',
      date: '2023-05-15'
    },
    {
      id: '2',
      userName: 'Trần Minh Hằng',
      rating: 4,
      comment: 'Chất son mềm mịn, mùi thơm nhẹ, khá ưng ý',
      date: '2023-05-10'
    }
  ];

  const handleAddToCart = () => {
    // Logic thêm vào giỏ hàng
    console.log('Added to cart');
  };

  const handleBuyNow = () => {
    // Logic mua ngay
    console.log('Buying now');
  };

  const handleVariantSelect = (variantType: string, option: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantType]: option
    }));
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity>
            <Text style={styles.headerIcon}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.headerIcon}>🛒 ({3})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Gallery */}
      <View style={styles.galleryContainer}>
        <View style={styles.mainImageContainer}>
          <Image 
            source={{ uri: product.images[selectedImageIndex] }} 
            style={styles.mainImage} 
          />
          {product.isVerified && (
            <View style={styles.verificationBadge}>
              <Text style={styles.verificationBadgeText}>🛡️ Chính hãng</Text>
            </View>
          )}
        </View>
        
        <View style={styles.thumbnailContainer}>
          {product.images.map((image, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => setSelectedImageIndex(index)}
              style={[
                styles.thumbnail, 
                selectedImageIndex === index && styles.selectedThumbnail
              ]}
            >
              <Image source={{ uri: image }} style={styles.thumbnailImage} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productInfoContainer}>
        <Text style={styles.productName}>{product.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {product.rating}</Text>
          <Text style={styles.reviewCount}>({product.reviewCount} đánh giá)</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.discountedPrice}>{product.discountPrice.toLocaleString('vi-VN')}₫</Text>
          <Text style={styles.originalPrice}>{product.price.toLocaleString('vi-VN')}₫</Text>
          <Text style={styles.discountPercent}>-{product.discountPercentage}%</Text>
        </View>
        
        <View style={styles.shippingContainer}>
          <Text style={styles.shippingText}>🚚 {product.shippingInfo}</Text>
        </View>
      </View>

      {/* Trust Indicators */}
      <View style={styles.trustSection}>
        <View style={styles.trustItem}>
          <Text style={styles.trustIcon}>🛡️</Text>
          <Text style={styles.trustText}>Chính hãng 100%</Text>
        </View>
        <View style={styles.trustItem}>
          <Text style={styles.trustIcon}>✅</Text>
          <Text style={styles.trustText}>Đánh giá từ AI</Text>
        </View>
        <View style={styles.trustItem}>
          <Text style={styles.trustIcon}>↻</Text>
          <Text style={styles.trustText}>Quét QR truy xuất</Text>
        </View>
        <View style={styles.trustItem}>
          <Text style={styles.trustIcon}>⚠️</Text>
          <Text style={styles.trustText}>Báo hàng giả nếu cần</Text>
        </View>
      </View>

      {/* Variants */}
      <View style={styles.variantsContainer}>
        {product.variants.map(variant => (
          <View key={variant.id} style={styles.variantSection}>
            <Text style={styles.variantLabel}>{variant.name}:</Text>
            <View style={styles.variantOptions}>
              {variant.options.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.variantOption,
                    selectedVariants[variant.id] === option && styles.selectedVariantOption
                  ]}
                  onPress={() => handleVariantSelect(variant.id, option)}
                >
                  <Text style={[
                    styles.variantOptionText,
                    selectedVariants[variant.id] === option && styles.selectedVariantOptionText
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Quantity Selector */}
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityLabel}>Số lượng:</Text>
        <View style={styles.quantitySelector}>
          <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityValue}>{quantity}</Text>
          <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.chatButton}>
          <Text style={styles.chatButtonText}>💬 Chat với shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Text style={styles.addToCartButtonText}>➕ Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowButton} onPress={handleBuyNow}>
          <Text style={styles.buyNowButtonText}>🛍️ Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Product Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Mô tả sản phẩm</Text>
        <Text style={styles.descriptionText}>{product.description}</Text>
      </View>

      {/* Reviews Section */}
      <View style={styles.reviewsContainer}>
        <Text style={styles.sectionTitle}>Đánh giá sản phẩm</Text>
        {reviews.map(review => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewUserName}>{review.userName}</Text>
              <Text style={styles.reviewRating}>
                {'⭐'.repeat(Math.floor(review.rating))}
              </Text>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewDate}>{review.date}</Text>
          </View>
        ))}
        <TouchableOpacity style={styles.seeAllReviewsButton}>
          <Text style={styles.seeAllReviewsButtonText}>Xem tất cả đánh giá</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Space */}
      <View style={styles.bottomSpace} />
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
  },
  backButton: {
    fontSize: 24,
    color: semanticColors.text.primary,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  headerIcon: {
    fontSize: 20,
  },
  galleryContainer: {
    backgroundColor: colors.neutral[100],
    padding: spacing[4],
  },
  mainImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  mainImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  verificationBadge: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[3],
    backgroundColor: colors.success[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  verificationBadgeText: {
    color: colors.neutral[50],
    fontWeight: 'bold',
    fontSize: typography.body.sm.fontSize,
  },
  thumbnailContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  thumbnail: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: colors.neutral[200],
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: colors.brand.red[500],
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productInfoContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
  },
  productName: {
    fontSize: typography.h4.fontSize,
    lineHeight: typography.h4.lineHeight,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    marginBottom: spacing[2],
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  rating: {
    fontSize: typography.body.md.fontSize,
    color: colors.warning[500],
    marginRight: spacing[2],
  },
  reviewCount: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  discountedPrice: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.danger[600],
    marginRight: spacing[2],
  },
  originalPrice: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
    textDecorationLine: 'line-through',
    marginRight: spacing[2],
  },
  discountPercent: {
    fontSize: typography.body.md.fontSize,
    color: colors.danger[600],
    fontWeight: 'bold',
  },
  shippingContainer: {
    backgroundColor: colors.info[50],
    padding: spacing[3],
    borderRadius: radius.md,
    marginBottom: spacing[4],
  },
  shippingText: {
    color: semanticColors.text.primary,
    fontWeight: '500',
  },
  trustSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: semanticColors.border.divider,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: spacing[2],
  },
  trustIcon: {
    fontSize: 18,
    marginRight: spacing[2],
  },
  trustText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.primary,
  },
  variantsContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
  },
  variantSection: {
    marginBottom: spacing[4],
  },
  variantLabel: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[2],
  },
  variantOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  variantOption: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    marginRight: spacing[2],
    marginBottom: spacing[2],
  },
  selectedVariantOption: {
    backgroundColor: colors.brand.red[500],
  },
  variantOptionText: {
    color: semanticColors.text.secondary,
  },
  selectedVariantOptionText: {
    color: colors.neutral[50],
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: semanticColors.border.divider,
  },
  quantityLabel: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginRight: spacing[4],
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    borderRadius: radius.full,
  },
  quantityButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  quantityButtonText: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
  },
  quantityValue: {
    minWidth: 40,
    textAlign: 'center',
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    padding: spacing[4],
    gap: spacing[2],
  },
  chatButton: {
    flex: 1,
    backgroundColor: colors.info[500],
    padding: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  chatButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
  },
  addToCartButton: {
    flex: 1.5,
    backgroundColor: colors.warning[500],
    padding: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  addToCartButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1.5,
    backgroundColor: colors.brand.red[500],
    padding: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buyNowButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
  },
  descriptionContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderColor: semanticColors.border.divider,
  },
  descriptionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[3],
  },
  descriptionText: {
    fontSize: typography.body.md.fontSize,
    lineHeight: typography.body.md.lineHeight,
    color: semanticColors.text.secondary,
    textAlign: 'justify',
  },
  reviewsContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderColor: semanticColors.border.divider,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[3],
  },
  reviewItem: {
    marginBottom: spacing[4],
    paddingBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  reviewUserName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  reviewRating: {
    fontSize: typography.body.md.fontSize,
  },
  reviewComment: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    marginBottom: spacing[1],
  },
  reviewDate: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    alignSelf: 'flex-end',
  },
  seeAllReviewsButton: {
    backgroundColor: colors.neutral[100],
    padding: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  seeAllReviewsButtonText: {
    color: semanticColors.text.primary,
    fontWeight: '600',
  },
  bottomSpace: {
    height: 100,
  }
});

export default ProductDetailScreen;