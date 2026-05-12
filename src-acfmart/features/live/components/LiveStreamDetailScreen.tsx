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
}

interface Comment {
  id: string;
  user: string;
  avatar: string;
  message: string;
  timestamp: string;
  likes: number;
}

const LiveStreamDetailScreen: React.FC = () => {
  const [streamInfo] = useState({
    id: 'ls1',
    title: 'Siêu sale buổi tối - Deal khủng chỉ có trong live!',
    hostName: 'Nguyễn Thị Mai',
    hostAvatar: 'https://via.placeholder.com/40',
    viewerCount: 1245,
    startTime: '19:30',
    duration: '2h 15p',
    shopName: 'Natural Beauty Shop',
    shopAvatar: 'https://via.placeholder.com/40',
    thumbnail: 'https://via.placeholder.com/400x225',
    isLive: true,
    description: 'Chương trình khuyến mãi đặc biệt trong live stream với mức giảm giá lên đến 50%. Chỉ có trong thời gian live mới có mức giá tốt như vậy!'
  });

  const [products] = useState<Product[]>([
    {
      id: 'p1',
      name: 'Son dưỡng môi thiên nhiên SPF 15',
      price: 250000,
      discountPrice: 180000,
      rating: 4.8,
      reviewCount: 1240,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isOnSale: true,
      shopName: 'Natural Beauty Shop'
    },
    {
      id: 'p2',
      name: 'Mặt nạ Vitamin C',
      price: 350000,
      discountPrice: 280000,
      rating: 4.7,
      reviewCount: 542,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isOnSale: true,
      shopName: 'Natural Beauty Shop'
    },
    {
      id: 'p3',
      name: 'Sữa rửa mặt dịu nhẹ',
      price: 280000,
      discountPrice: 220000,
      rating: 4.6,
      reviewCount: 421,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isOnSale: true,
      shopName: 'Natural Beauty Shop'
    },
    {
      id: 'p4',
      name: 'Kem chống nắng vật lý',
      price: 380000,
      discountPrice: 320000,
      rating: 4.9,
      reviewCount: 321,
      image: 'https://via.placeholder.com/150',
      isVerified: true,
      isOnSale: true,
      shopName: 'Natural Beauty Shop'
    },
  ]);

  const [comments] = useState<Comment[]>([
    {
      id: 'c1',
      user: 'Lê Thị Hoa',
      avatar: 'https://via.placeholder.com/30',
      message: 'Sản phẩm rất tuyệt, mình đã dùng và thấy hiệu quả rõ rệt!',
      timestamp: '2 phút trước',
      likes: 12
    },
    {
      id: 'c2',
      user: 'Trần Văn Nam',
      avatar: 'https://via.placeholder.com/30',
      message: 'Cho mình hỏi sản phẩm này có dùng cho da nhạy cảm được không?',
      timestamp: '5 phút trước',
      likes: 3
    },
    {
      id: 'c3',
      user: 'Phạm Thị Lan',
      avatar: 'https://via.placeholder.com/30',
      message: 'Đang đặt hàng, mong là sẽ nhận được hàng sớm',
      timestamp: '7 phút trước',
      likes: 8
    },
  ]);

  const [newComment, setNewComment] = useState('');

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.productRating}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
          <Text style={styles.reviewCountText}>({item.reviewCount})</Text>
        </View>
        <View style={styles.productPrice}>
          <Text style={styles.discountedPrice}>{item.discountPrice.toLocaleString('vi-VN')}₫</Text>
          <Text style={styles.originalPrice}>{item.price.toLocaleString('vi-VN')}₫</Text>
        </View>
        {item.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>🛡️ Chính hãng</Text>
          </View>
        )}
      </View>
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyButtonText}>MUA NGAY</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{item.user}</Text>
          <Text style={styles.commentTime}>{item.timestamp}</Text>
        </View>
        <Text style={styles.commentMessage}>{item.message}</Text>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.likeButton}>
            <Text style={styles.likeText}>👍 {item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.replyButton}>
            <Text style={styles.replyText}>Trả lời</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Image source={{ uri: streamInfo.thumbnail }} style={styles.videoThumbnail} />
        <View style={styles.videoOverlay}>
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
          <Text style={styles.viewerCount}>👥 {streamInfo.viewerCount} người đang xem</Text>
        </View>
      </View>
      
      {/* Stream Info */}
      <View style={styles.streamInfo}>
        <Text style={styles.streamTitle}>{streamInfo.title}</Text>
        <Text style={styles.streamDescription}>{streamInfo.description}</Text>
        
        <View style={styles.hostInfo}>
          <Image source={{ uri: streamInfo.hostAvatar }} style={styles.hostAvatar} />
          <View style={styles.hostDetails}>
            <Text style={styles.hostName}>{streamInfo.hostName}</Text>
            <Text style={styles.shopName}>{streamInfo.shopName}</Text>
          </View>
          <TouchableOpacity style={styles.followButton}>
            <Text style={styles.followButtonText}>Theo dõi</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Products Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm đang được giới thiệu</Text>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>
      
      {/* Comments Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bình luận ({comments.length})</Text>
        
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Viết bình luận..."
          />
          <TouchableOpacity style={styles.sendCommentButton}>
            <Text style={styles.sendCommentText}>Gửi</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.chatButton}>
          <Text style={styles.chatButtonText}>Trò chuyện</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Chia sẻ</Text>
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
  videoContainer: {
    position: 'relative',
    height: 225,
    backgroundColor: colors.neutral[900],
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: spacing[4},
  },
  liveIndicator: {
    backgroundColor: colors.danger[500],
    paddingHorizontal: spacing[3},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  liveText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.sm.fontSize,
  },
  viewerCount: {
    backgroundColor: colors.neutral[900],
    paddingHorizontal: spacing[3},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
    alignSelf: 'flex-end',
    color: colors.neutral[50],
    fontWeight: '600',
  },
  streamInfo: {
    padding: spacing[4},
    backgroundColor: colors.neutral[50],
  },
  streamTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[2},
  },
  streamDescription: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.md.lineHeight,
    marginBottom: spacing[3},
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    marginRight: spacing[3},
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  shopName: {
    fontSize: typography.body.sm.fontSize,
    color: colors.brand.red[500],
  },
  followButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[2},
    borderRadius: radius.full,
  },
  followButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.sm.fontSize,
  },
  section: {
    backgroundColor: colors.neutral[50],
    padding: spacing[4},
    marginBottom: spacing[2},
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[3},
  },
  productsList: {
    paddingBottom: spacing[4},
  },
  productCard: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    padding: spacing[3},
    width: 250,
    marginRight: spacing[3},
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
    width: '100%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: spacing[2},
  },
  productInfo: {
    marginBottom: spacing[2},
  },
  productName: {
    fontSize: typography.body.sm.fontSize,
    fontWeight: '500',
    color: semanticColors.text.primary,
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
  verifiedBadge: {
    backgroundColor: colors.success[500],
    paddingHorizontal: spacing[2},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    color: colors.neutral[50],
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[3},
    borderRadius: radius.md,
    alignItems: 'center',
  },
  buyButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4},
  },
  commentInput: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    borderRadius: radius.full,
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[3},
    marginRight: spacing[2},
    fontSize: typography.body.md.fontSize,
  },
  sendCommentButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[3},
    borderRadius: radius.full,
  },
  sendCommentText: {
    color: colors.neutral[50],
    fontWeight: '600',
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: spacing[4},
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    marginRight: spacing[3},
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[1},
  },
  commentUser: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginRight: spacing[2},
  },
  commentTime: {
    fontSize: typography.caption.fontSize,
    color: semanticColors.text.muted,
  },
  commentMessage: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.md.lineHeight,
    marginBottom: spacing[1},
  },
  commentActions: {
    flexDirection: 'row',
  },
  likeButton: {
    marginRight: spacing[3},
  },
  likeText: {
    color: semanticColors.text.muted,
    fontSize: typography.body.sm.fontSize,
  },
  replyButton: {},
  replyText: {
    color: colors.brand.red[500],
    fontSize: typography.body.sm.fontSize,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: spacing[4},
    backgroundColor: colors.neutral[50],
  },
  chatButton: {
    flex: 1,
    backgroundColor: colors.info[500],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2},
  },
  chatButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  shareButton: {
    flex: 1,
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginLeft: spacing[2},
  },
  shareButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
});

export default LiveStreamDetailScreen;