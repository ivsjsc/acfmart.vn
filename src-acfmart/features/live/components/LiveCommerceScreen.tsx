import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface LiveStream {
  id: string;
  title: string;
  hostName: string;
  hostAvatar: string;
  viewerCount: number;
  startTime: string;
  shopName: string;
  shopAvatar: string;
  thumbnail: string;
  isLive: boolean;
  featuredProducts: Array<{
    id: string;
    name: string;
    price: number;
    discountPrice: number;
    isSoldOut: boolean;
  }>;
}

const LiveCommerceScreen: React.FC = () => {
  const [liveStreams] = useState<LiveStream[]>([
    {
      id: '1',
      title: 'Siêu sale buổi tối - Deal khủng chỉ có trong live!',
      hostName: 'Nguyễn Thị Mai',
      hostAvatar: 'https://via.placeholder.com/40',
      viewerCount: 1245,
      startTime: '19:30',
      shopName: 'Natural Beauty Shop',
      shopAvatar: 'https://via.placeholder.com/40',
      thumbnail: 'https://via.placeholder.com/300x200',
      isLive: true,
      featuredProducts: [
        {
          id: 'p1',
          name: 'Son dưỡng môi thiên nhiên SPF 15',
          price: 250000,
          discountPrice: 180000,
          isSoldOut: false
        },
        {
          id: 'p2',
          name: 'Mặt nạ Vitamin C',
          price: 350000,
          discountPrice: 280000,
          isSoldOut: false
        }
      ]
    },
    {
      id: '2',
      title: 'Unbox sản phẩm mới - Đánh giá chân thực',
      hostName: 'Trần Minh Hùng',
      hostAvatar: 'https://via.placeholder.com/40',
      viewerCount: 876,
      startTime: '20:15',
      shopName: 'Electronics Pro',
      shopAvatar: 'https://via.placeholder.com/40',
      thumbnail: 'https://via.placeholder.com/300x200',
      isLive: true,
      featuredProducts: [
        {
          id: 'p3',
          name: 'Tai nghe không dây chống ồn',
          price: 1200000,
          discountPrice: 990000,
          isSoldOut: false
        }
      ]
    },
    {
      id: '3',
      title: 'Thử nghiệm makeup với chuyên gia',
      hostName: 'Lê Thu Trang',
      hostAvatar: 'https://via.placeholder.com/40',
      viewerCount: 2103,
      startTime: '18:45',
      shopName: 'Makeup Studio',
      shopAvatar: 'https://via.placeholder.com/40',
      thumbnail: 'https://via.placeholder.com/300x200',
      isLive: true,
      featuredProducts: [
        {
          id: 'p4',
          name: 'Bộ cọ makeup chuyên nghiệp',
          price: 450000,
          discountPrice: 360000,
          isSoldOut: true
        }
      ]
    }
  ]);

  const renderFeaturedProduct = (product: LiveStream['featuredProducts'][0]) => (
    <View key={product.id} style={styles.featuredProduct}>
      <Image source={{ uri: 'https://via.placeholder.com/80' }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.productPrice}>
          <Text style={styles.discountedPrice}>{product.discountPrice.toLocaleString('vi-VN')}₫</Text>
          <Text style={styles.originalPrice}>{product.price.toLocaleString('vi-VN')}₫</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={[styles.buyButton, product.isSoldOut && styles.soldOutButton]}
        disabled={product.isSoldOut}
      >
        <Text style={styles.buyButtonText}>
          {product.isSoldOut ? 'Hết hàng' : 'Mua'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLiveStream = ({ item }: { item: LiveStream }) => (
    <TouchableOpacity style={styles.streamCard}>
      <View style={styles.streamHeader}>
        <View style={styles.streamerInfo}>
          <Image source={{ uri: item.hostAvatar }} style={styles.avatar} />
          <View style={styles.streamerDetails}>
            <Text style={styles.streamerName}>{item.hostName}</Text>
            <View style={styles.shopInfo}>
              <Image source={{ uri: item.shopAvatar }} style={styles.shopAvatar} />
              <Text style={styles.shopName}>{item.shopName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.viewerInfo}>
          <Text style={styles.viewerCount}>👥 {item.viewerCount}</Text>
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      </View>
      
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
      
      <View style={styles.streamContent}>
        <Text style={styles.streamTitle}>{item.title}</Text>
        
        <View style={styles.streamMeta}>
          <Text style={styles.startTime}>⏰ {item.startTime}</Text>
        </View>
        
        <View style={styles.productsContainer}>
          <Text style={styles.productsTitle}>Sản phẩm nổi bật:</Text>
          {item.featuredProducts.map(renderFeaturedProduct)}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Live Commerce</Text>
      <Text style={styles.headerSubtitle}>Trực tiếp từ các shop uy tín</Text>
      
      <FlatList
        data={liveStreams}
        renderItem={renderLiveStream}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.streamsList}
      />
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
    paddingBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  streamsList: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  streamCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    marginBottom: spacing[5],
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  streamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    paddingBottom: spacing[2],
  },
  streamerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    marginRight: spacing[3],
  },
  streamerDetails: {
    flex: 1,
  },
  streamerName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[1],
  },
  shopAvatar: {
    width: 16,
    height: 16,
    borderRadius: radius.full,
    marginRight: spacing[1],
  },
  shopName: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  viewerInfo: {
    alignItems: 'flex-end',
  },
  viewerCount: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[1],
  },
  liveBadge: {
    backgroundColor: colors.danger[500],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  liveText: {
    color: colors.neutral[50],
    fontSize: typography.caption.fontSize,
    fontWeight: 'bold',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  streamContent: {
    padding: spacing[4],
  },
  streamTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[2],
  },
  streamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  startTime: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  productsContainer: {
    marginTop: spacing[3],
  },
  productsTitle: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[2],
  },
  featuredProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    marginBottom: spacing[2],
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  productName: {
    fontSize: typography.body.sm.fontSize,
    fontWeight: '500',
    color: semanticColors.text.primary,
    marginBottom: spacing[1],
  },
  productPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountedPrice: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: colors.danger[600],
    marginRight: spacing[2],
  },
  originalPrice: {
    fontSize: typography.caption.fontSize,
    color: semanticColors.text.muted,
    textDecorationLine: 'line-through',
  },
  buyButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    justifyContent: 'center',
    minWidth: 50,
    alignItems: 'center',
  },
  soldOutButton: {
    backgroundColor: colors.neutral[300],
  },
  buyButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.sm.fontSize,
    fontWeight: '600',
  },
});

export default LiveCommerceScreen;