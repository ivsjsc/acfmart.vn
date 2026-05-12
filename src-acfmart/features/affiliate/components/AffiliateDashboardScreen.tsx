aimport React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface AffiliateLink {
  id: string;
  title: string;
  url: string;
  clicks: number;
  conversions: number;
  commission: number;
  status: 'active' | 'inactive' | 'pending';
}

interface AffiliateTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'commission' | 'payout' | 'adjustment';
  status: 'completed' | 'pending' | 'failed';
  description: string;
}

const AffiliateDashboardScreen: React.FC = () => {
  const [stats] = useState({
    totalEarned: 1250000,
    pendingCommission: 250000,
    totalClicks: 1240,
    totalConversions: 45,
    conversionRate: 3.6,
  });

  const [links] = useState<AffiliateLink[]>([
    {
      id: '1',
      title: 'Combo Son Dưỡng SPF 15',
      url: 'https://acfmart.vn/a/son-duong-spf15-combo',
      clicks: 120,
      conversions: 8,
      commission: 144000,
      status: 'active'
    },
    {
      id: '2',
      title: 'Tai Nghe Không Dây Pro',
      url: 'https://acfmart.vn/a/tai-nghe-khong-day-pro',
      clicks: 95,
      conversions: 5,
      commission: 49500,
      status: 'active'
    },
    {
      id: '3',
      title: 'Mặt Nạ Vitamin C',
      url: 'https://acfmart.vn/a/mat-na-vitamin-c',
      clicks: 78,
      conversions: 3,
      commission: 84000,
      status: 'inactive'
    },
  ]);

  const [transactions] = useState<AffiliateTransaction[]>([
    {
      id: 't1',
      date: '2023-05-15',
      amount: 245000,
      type: 'commission',
      status: 'completed',
      description: 'Hoa hồng từ đơn hàng #ORD-2023-001234'
    },
    {
      id: 't2',
      date: '2023-05-10',
      amount: -50000,
      type: 'adjustment',
      status: 'completed',
      description: 'Điều chỉnh hoa hồng do trả hàng'
    },
    {
      id: 't3',
      date: '2023-05-01',
      amount: 125000,
      type: 'commission',
      status: 'completed',
      description: 'Hoa hồng từ đơn hàng #ORD-2023-001122'
    },
    {
      id: 't4',
      date: '2023-04-28',
      amount: -200000,
      type: 'payout',
      status: 'completed',
      description: 'Rút tiền hoa hồng'
    },
  ]);

  const renderLink = ({ item }: { item: AffiliateLink }) => (
    <View style={styles.linkCard}>
      <View style={styles.linkHeader}>
        <Text style={styles.linkTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'active' && styles.activeStatus,
          item.status === 'inactive' && styles.inactiveStatus,
          item.status === 'pending' && styles.pendingStatus,
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'active' ? 'Hoạt động' : 
             item.status === 'inactive' ? 'Tạm dừng' : 'Chờ duyệt'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.linkUrl} numberOfLines={1}>{item.url}</Text>
      
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{item.clicks}</Text>
          <Text style={styles.metricLabel}>Lượt click</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{item.conversions}</Text>
          <Text style={styles.metricLabel}>Chuyển đổi</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{item.commission.toLocaleString('vi-VN')}₫</Text>
          <Text style={styles.metricLabel}>Hoa hồng</Text>
        </View>
      </View>
      
      <View style={styles.linkActions}>
        <TouchableOpacity style={styles.copyButton}>
          <Text style={styles.copyButtonText}>Sao chép</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>Chia sẻ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTransaction = ({ item }: { item: AffiliateTransaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionMain}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={[
          styles.transactionAmount,
          item.amount > 0 ? styles.positiveAmount : styles.negativeAmount
        ]}>
          {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString('vi-VN')}₫
        </Text>
      </View>
      
      <View style={styles.transactionMeta}>
        <Text style={styles.transactionDate}>{item.date}</Text>
        <View style={[
          styles.transactionStatus,
          item.status === 'completed' && styles.completedStatus,
          item.status === 'pending' && styles.pendingStatus,
          item.status === 'failed' && styles.failedStatus,
        ]}>
          <Text style={styles.transactionStatusText}>
            {item.status === 'completed' ? 'Hoàn thành' : 
             item.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Chương trình Affiliate</Text>
      
      {/* Stats Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tổng đã nhận</Text>
          <Text style={styles.statValue}>{stats.totalEarned.toLocaleString('vi-VN')}₫</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Chờ thanh toán</Text>
          <Text style={styles.statValue}>{stats.pendingCommission.toLocaleString('vi-VN')}₫</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Tỷ lệ chuyển đổi</Text>
          <Text style={styles.statValue}>{stats.conversionRate}%</Text>
        </View>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>🔗</Text>
          <Text style={styles.quickActionText}>Tạo liên kết</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>📊</Text>
          <Text style={styles.quickActionText}>Thống kê</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>💰</Text>
          <Text style={styles.quickActionText}>Rút tiền</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>🎁</Text>
          <Text style={styles.quickActionText}>Khuyến mãi</Text>
        </TouchableOpacity>
      </View>
      
      {/* Affiliate Links */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Liên kết Affiliate</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={links}
          renderItem={renderLink}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
      
      {/* Transaction History */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
      
      {/* How it works */}
      <View style={styles.howItWorksContainer}>
        <Text style={styles.howItWorksTitle}>Cách thức hoạt động</Text>
        <View style={styles.stepContainer}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Chia sẻ liên kết sản phẩm</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Người mua click và mua hàng</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Nhận hoa hồng từ đơn hàng</Text>
          </View>
        </View>
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  statCard: {
    backgroundColor: colors.neutral[50],
    flex: 1,
    marginHorizontal: spacing[1],
    padding: spacing[3],
    borderRadius: radius.md,
    alignItems: 'center',
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
  statLabel: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[1],
  },
  statValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: 'bold',
    color: colors.brand.red[500],
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    marginHorizontal: spacing[4],
    borderRadius: radius.lg,
    marginBottom: spacing[4],
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
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: spacing[1],
  },
  quickActionText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.primary,
    fontWeight: '500',
  },
  sectionContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[5],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  seeAllText: {
    color: colors.brand.red[500],
    fontSize: typography.body.sm.fontSize,
  },
  linkCard: {
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
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  linkTitle: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    flex: 1,
    marginRight: spacing[2],
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  activeStatus: {
    backgroundColor: colors.success[100],
  },
  inactiveStatus: {
    backgroundColor: colors.warning[100],
  },
  pendingStatus: {
    backgroundColor: colors.info[100],
  },
  statusText: {
    fontSize: typography.body.sm.fontSize,
    fontWeight: '600',
  },
  linkUrl: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[3],
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
    paddingBottom: spacing[3],
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: typography.body.md.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
  },
  metricLabel: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  linkActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  copyButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
    marginRight: spacing[2],
  },
  copyButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.md,
  },
  shareButtonText: {
    color: semanticColors.text.primary,
    fontWeight: '600',
  },
  transactionItem: {
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
  transactionMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  transactionDescription: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    flex: 1,
    marginRight: spacing[2],
  },
  transactionAmount: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
  },
  positiveAmount: {
    color: colors.success[600],
  },
  negativeAmount: {
    color: colors.danger[600],
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  transactionStatus: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  completedStatus: {
    backgroundColor: colors.success[100],
  },
  pendingStatus: {
    backgroundColor: colors.warning[100],
  },
  failedStatus: {
    backgroundColor: colors.danger[100],
  },
  transactionStatusText: {
    fontSize: typography.body.sm.fontSize,
    fontWeight: '600',
  },
  howItWorksContainer: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[5],
    backgroundColor: colors.brand.red[50],
    marginHorizontal: spacing[4],
    borderRadius: radius.lg,
    marginBottom: spacing[5],
  },
  howItWorksTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  stepContainer: {
    flexDirection: 'column',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    backgroundColor: colors.brand.red[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
  },
  stepNumberText: {
    color: colors.neutral[50],
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    flex: 1,
  },
});

export default AffiliateDashboardScreen;