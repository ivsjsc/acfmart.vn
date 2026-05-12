import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  expiryDate: string;
  status: 'available' | 'used' | 'expired';
  shopId?: string;
  shopName?: string;
}

const VoucherScreen: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([
    {
      id: 'v1',
      code: 'ACF2023GOLD25',
      title: 'Giảm 25% cho đơn từ 500k',
      description: 'Áp dụng cho tất cả sản phẩm tại Natural Beauty Shop',
      discountType: 'percentage',
      discountValue: 25,
      minOrderValue: 500000,
      expiryDate: '2023-06-30',
      status: 'available',
      shopId: 's1',
      shopName: 'Natural Beauty Shop'
    },
    {
      id: 'v2',
      code: 'ACF2023FREESHIP',
      title: 'Miễn phí vận chuyển',
      description: 'Miễn phí vận chuyển cho đơn hàng từ 300k',
      discountType: 'fixed',
      discountValue: 30000,
      minOrderValue: 300000,
      expiryDate: '2023-05-25',
      status: 'available',
      shopId: 's2',
      shopName: 'Electronics Pro'
    },
    {
      id: 'v3',
      code: 'ACF2023NEWUSER',
      title: 'Giảm 50k cho đơn đầu',
      description: 'Khuyến mãi đặc biệt cho người dùng mới',
      discountType: 'fixed',
      discountValue: 50000,
      minOrderValue: 200000,
      expiryDate: '2023-05-20',
      status: 'available'
    },
    {
      id: 'v4',
      code: 'ACF2023AFFILIATE',
      title: 'Voucher từ affiliate',
      description: 'Mua hàng với mã giới thiệu từ bạn bè',
      discountType: 'percentage',
      discountValue: 15,
      minOrderValue: 400000,
      expiryDate: '2023-05-15',
      status: 'expired'
    },
    {
      id: 'v5',
      code: 'ACF2023MEMBER',
      title: 'Voucher thành viên bạc',
      description: 'Ưu đãi đặc biệt cho thành viên bạc',
      discountType: 'fixed',
      discountValue: 100000,
      minOrderValue: 600000,
      expiryDate: '2023-05-10',
      status: 'used'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'available' | 'used' | 'expired'>('available');

  const filteredVouchers = vouchers.filter(v => 
    activeTab === 'available' ? v.status === 'available' :
    activeTab === 'used' ? v.status === 'used' : v.status === 'expired'
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatDiscount = (voucher: Voucher) => {
    if (voucher.discountType === 'percentage') {
      return `${voucher.discountValue}%`;
    } else {
      return `${voucher.discountValue.toLocaleString('vi-VN')}₫`;
    }
  };

  const renderVoucher = ({ item }: { item: Voucher }) => (
    <View style={[
      styles.voucherCard,
      item.status === 'available' && styles.availableVoucher,
      item.status === 'used' && styles.usedVoucher,
      item.status === 'expired' && styles.expiredVoucher,
    ]}>
      <View style={styles.voucherHeader}>
        <View style={styles.voucherInfo}>
          <Text style={styles.voucherTitle}>{item.title}</Text>
          <Text style={styles.voucherDescription}>{item.description}</Text>
          {item.shopName && (
            <Text style={styles.shopName}>Cửa hàng: {item.shopName}</Text>
          )}
        </View>
        
        <View style={styles.voucherValueContainer}>
          <Text style={styles.voucherValue}>{formatDiscount(item)}</Text>
          <Text style={styles.voucherValueType}>GIẢM</Text>
        </View>
      </View>
      
      <View style={styles.voucherDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Mã</Text>
          <Text style={styles.detailValue}>{item.code}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Đơn tối thiểu</Text>
          <Text style={styles.detailValue}>{item.minOrderValue.toLocaleString('vi-VN')}₫</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>HSD</Text>
          <Text style={styles.detailValue}>{formatDate(item.expiryDate)}</Text>
        </View>
      </View>
      
      <View style={styles.voucherActions}>
        <TouchableOpacity style={styles.copyButton}>
          <Text style={styles.copyButtonText}>Sao chép mã</Text>
        </TouchableOpacity>
        {item.status === 'available' && (
          <TouchableOpacity style={styles.useButton}>
            <Text style={styles.useButtonText}>SỬ DỤNG NGAY</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Voucher của tôi</Text>
      
      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{vouchers.filter(v => v.status === 'available').length}</Text>
          <Text style={styles.statLabel}>Khả dụng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{vouchers.filter(v => v.status === 'used').length}</Text>
          <Text style={styles.statLabel}>Đã dùng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{vouchers.filter(v => v.status === 'expired').length}</Text>
          <Text style={styles.statLabel}>Hết hạn</Text>
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>Khả dụng</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'used' && styles.activeTab]}
          onPress={() => setActiveTab('used')}
        >
          <Text style={[styles.tabText, activeTab === 'used' && styles.activeTabText]}>Đã dùng</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'expired' && styles.activeTab]}
          onPress={() => setActiveTab('expired')}
        >
          <Text style={[styles.tabText, activeTab === 'expired' && styles.activeTabText]}>Hết hạn</Text>
        </TouchableOpacity>
      </View>
      
      {/* Vouchers List */}
      <FlatList
        data={filteredVouchers}
        renderItem={renderVoucher}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.vouchersList}
      />
      
      {/* Empty State */}
      {filteredVouchers.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {activeTab === 'available' 
              ? 'Bạn không có voucher khả dụng' 
              : activeTab === 'used' 
                ? 'Bạn chưa sử dụng voucher nào' 
                : 'Bạn không có voucher hết hạn'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'available' 
              ? 'Hãy tiếp tục mua sắm để nhận thêm voucher hấp dẫn' 
              : 'Các voucher đã sử dụng sẽ hiển thị tại đây'}
          </Text>
          {activeTab === 'available' && (
            <TouchableOpacity style={styles.shopButton}>
              <Text style={styles.shopButtonText}>MUA SẮM NGAY</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4},
  },
  statCard: {
    alignItems: 'center',
    padding: spacing[3},
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    flex: 1,
    marginHorizontal: spacing[1},
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
  statValue: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
  },
  statLabel: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginTop: spacing[1},
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing[4},
    borderRadius: radius.md,
    marginBottom: spacing[4},
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[3},
    alignItems: 'center',
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
  vouchersList: {
    paddingHorizontal: spacing[4},
    paddingBottom: spacing[10},
  },
  voucherCard: {
    borderRadius: radius.md,
    padding: spacing[4},
    marginBottom: spacing[4},
    position: 'relative',
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
  availableVoucher: {
    backgroundColor: colors.gold[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.success[500],
  },
  usedVoucher: {
    backgroundColor: colors.neutral[100],
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: colors.neutral[500],
  },
  expiredVoucher: {
    backgroundColor: colors.danger[50],
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger[500],
  },
  voucherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3},
  },
  voucherInfo: {
    flex: 1,
    marginRight: spacing[4},
  },
  voucherTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    marginBottom: spacing[1},
  },
  voucherDescription: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    marginBottom: spacing[1},
  },
  shopName: {
    fontSize: typography.body.sm.fontSize,
    color: colors.brand.red[500],
    fontWeight: '600',
  },
  voucherValueContainer: {
    alignItems: 'flex-end',
  },
  voucherValue: {
    fontSize: typography.display.lg,
    fontWeight: 'bold',
    color: colors.brand.red[500],
  },
  voucherValueType: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    fontWeight: '600',
  },
  voucherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[4},
    paddingVertical: spacing[2},
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[1},
  },
  detailValue: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  voucherActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  copyButton: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[2},
    borderRadius: radius.md,
    marginRight: spacing[2},
  },
  copyButtonText: {
    color: semanticColors.text.primary,
    fontWeight: '600',
  },
  useButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[2},
    borderRadius: radius.md,
  },
  useButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing[10},
  },
  emptyText: {
    fontSize: typography.h3.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[2},
  },
  emptySubtext: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
    textAlign: 'center',
    marginBottom: spacing[4},
  },
  shopButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[6},
    paddingVertical: spacing[3},
    borderRadius: radius.md,
  },
  shopButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
});

export default VoucherScreen;