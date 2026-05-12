import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category: string;
}

const WalletScreen: React.FC = () => {
  const [balance, setBalance] = useState<number>(1250000);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 't1',
      type: 'income',
      amount: 250000,
      description: 'Hoa hồng từ đơn hàng #ORD-2023-001234',
      date: '2023-05-15 14:30',
      status: 'completed',
      category: 'Affiliate'
    },
    {
      id: 't2',
      type: 'expense',
      amount: 450000,
      description: 'Mua sắm tại Natural Beauty Shop',
      date: '2023-05-14 19:45',
      status: 'completed',
      category: 'Mua sắm'
    },
    {
      id: 't3',
      type: 'refund',
      amount: 120000,
      description: 'Hoàn tiền đơn hàng bị hủy',
      date: '2023-05-12 10:20',
      status: 'completed',
      category: 'Hoàn tiền'
    },
    {
      id: 't4',
      type: 'income',
      amount: 150000,
      description: 'Thưởng giới thiệu người dùng mới',
      date: '2023-05-10 16:10',
      status: 'completed',
      category: 'Khuyến mãi'
    },
    {
      id: 't5',
      type: 'expense',
      amount: 200000,
      description: 'Nạp tiền điện thoại',
      date: '2023-05-08 09:15',
      status: 'completed',
      category: 'Dịch vụ'
    },
    {
      id: 't6',
      type: 'income',
      amount: 300000,
      description: 'Hoa hồng từ đơn hàng #ORD-2023-001122',
      date: '2023-05-05 11:30',
      status: 'completed',
      category: 'Affiliate'
    },
  ]);

  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(t => 
    activeTab === 'all' || 
    (activeTab === 'income' && ['income', 'refund'].includes(t.type)) || 
    (activeTab === 'expense' && t.type === 'expense')
  );

  const handleWithdraw = () => {
    // Withdrawal logic
    console.log('Withdrawal initiated');
  };

  const handleDeposit = () => {
    // Deposit logic
    console.log('Deposit initiated');
  };

  const getTransactionColor = (type: string) => {
    switch(type) {
      case 'income': return colors.success[500];
      case 'expense': return colors.danger[500];
      case 'refund': return colors.info[500];
      case 'transfer': return colors.warning[500];
      default: return semanticColors.text.primary;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch(type) {
      case 'income': return '+';
      case 'expense': return '-';
      case 'refund': return '↺';
      case 'transfer': return '⇄';
      default: return '';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <Text style={[styles.transactionAmount, { color: getTransactionColor(item.type) }]}>
            {getTransactionIcon(item.type)} {item.amount.toLocaleString('vi-VN')}₫
          </Text>
        </View>
        
        <View style={styles.transactionMeta}>
          <Text style={styles.transactionCategory}>{item.category}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
      </View>
      
      <View style={[
        styles.statusBadge,
        item.status === 'completed' && styles.completedStatus,
        item.status === 'pending' && styles.pendingStatus,
        item.status === 'failed' && styles.failedStatus,
      ]}>
        <Text style={styles.statusText}>
          {item.status === 'completed' ? 'Hoàn thành' : 
           item.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Ví ACF</Text>
      
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
        <Text style={styles.balanceAmount}>{balance.toLocaleString('vi-VN')}₫</Text>
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleDeposit}>
            <Text style={styles.actionButtonText}>Nạp tiền</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.withdrawButton]} 
            onPress={handleWithdraw}
          >
            <Text style={styles.actionButtonText}>Rút tiền</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>1.250.000₫</Text>
          <Text style={styles.statLabel}>Tổng thu nhập</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>450.000₫</Text>
          <Text style={styles.statLabel}>Chi tiêu tháng</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>+25%</Text>
          <Text style={styles.statLabel}>Tăng trưởng</Text>
        </View>
      </View>
      
      {/* Transactions Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tất cả</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'income' && styles.activeTab]}
          onPress={() => setActiveTab('income')}
        >
          <Text style={[styles.tabText, activeTab === 'income' && styles.activeTabText]}>Thu nhập</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'expense' && styles.activeTab]}
          onPress={() => setActiveTab('expense')}
        >
          <Text style={[styles.tabText, activeTab === 'expense' && styles.activeTabText]}>Chi tiêu</Text>
        </TouchableOpacity>
      </View>
      
      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.transactionsList}
      />
      
      {/* Footer Note */}
      <View style={styles.footerNote}>
        <Text style={styles.footerText}>
          Ví ACF là nơi lưu trữ số dư của bạn để thanh toán nhanh chóng và nhận ưu đãi đặc biệt.
        </Text>
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
  balanceCard: {
    backgroundColor: colors.brand.red[500],
    marginHorizontal: spacing[4],
    borderRadius: radius.lg,
    padding: spacing[5},
    marginBottom: spacing[4},
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  balanceLabel: {
    fontSize: typography.body.md.fontSize,
    color: colors.neutral[200],
    marginBottom: spacing[1},
  },
  balanceAmount: {
    fontSize: typography.display.xl,
    fontWeight: 'bold',
    color: colors.neutral[50],
    marginBottom: spacing[4},
  },
  actionsContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    paddingVertical: spacing[3},
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2},
  },
  withdrawButton: {
    backgroundColor: colors.gold[500],
    marginRight: 0,
  },
  actionButtonText: {
    color: colors.brand.red[500],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4},
    marginBottom: spacing[4},
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing[1},
    padding: spacing[3},
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
  },
  statValue: {
    fontSize: typography.h4.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    marginBottom: spacing[1},
  },
  statLabel: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    textAlign: 'center',
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
  transactionsList: {
    paddingHorizontal: spacing[4},
    paddingBottom: spacing[10},
  },
  transactionItem: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[4},
    marginBottom: spacing[3},
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
  transactionInfo: {
    marginBottom: spacing[2},
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[1},
  },
  transactionDescription: {
    flex: 1,
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    marginRight: spacing[2},
  },
  transactionAmount: {
    fontSize: typography.body.md.fontSize,
    fontWeight: 'bold',
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionCategory: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  transactionDate: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing[2},
    paddingVertical: spacing[1},
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
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  footerNote: {
    marginHorizontal: spacing[4},
    padding: spacing[4},
    backgroundColor: colors.info[50],
    borderRadius: radius.md,
    marginBottom: spacing[4},
  },
  footerText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.sm.lineHeight,
  },
});

export default WalletScreen;