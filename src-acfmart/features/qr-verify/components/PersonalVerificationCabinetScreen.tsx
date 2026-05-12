import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface VerificationRecord {
  id: string;
  productId: string;
  productName: string;
  shopName: string;
  scanDate: string;
  verificationResult: 'verified' | 'unverified' | 'not_found';
  authenticityScore?: number;
  image?: string;
  notes?: string;
}

const PersonalVerificationCabinetScreen: React.FC = () => {
  const [records, setRecords] = useState<VerificationRecord[]>([
    {
      id: 'r1',
      productId: 'p1',
      productName: 'Son dưỡng môi thiên nhiên SPF 15',
      shopName: 'Natural Beauty Shop',
      scanDate: '2023-05-18 14:30',
      verificationResult: 'verified',
      authenticityScore: 98,
      image: 'https://via.placeholder.com/100',
      notes: 'Sản phẩm chính hãng, có chứng nhận ISO'
    },
    {
      id: 'r2',
      productId: 'p2',
      productName: 'Tai nghe không dây chống ồn',
      shopName: 'Electronics Pro',
      scanDate: '2023-05-17 19:45',
      verificationResult: 'verified',
      authenticityScore: 92,
      image: 'https://via.placeholder.com/100',
      notes: 'Sản phẩm mới, nguyên seal'
    },
    {
      id: 'r3',
      productId: 'p3',
      productName: 'Mặt nạ Vitamin C',
      shopName: 'Skincare Essentials',
      scanDate: '2023-05-16 10:20',
      verificationResult: 'unverified',
      image: 'https://via.placeholder.com/100',
      notes: 'Thông tin không khớp với cơ sở dữ liệu'
    },
    {
      id: 'r4',
      productId: 'p4',
      productName: 'Kem chống nắng vật lý',
      shopName: 'Natural Beauty Shop',
      scanDate: '2023-05-15 16:10',
      verificationResult: 'verified',
      authenticityScore: 100,
      image: 'https://via.placeholder.com/100',
      notes: 'Sản phẩm đạt tiêu chuẩn quốc tế'
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'not_found'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const filteredRecords = records
    .filter(record => filter === 'all' || record.verificationResult === filter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.scanDate).getTime() - new Date(a.scanDate).getTime();
      } else {
        return (b.authenticityScore || 0) - (a.authenticityScore || 0);
      }
    });

  const getResultColor = (result: string) => {
    switch(result) {
      case 'verified': return colors.success[500];
      case 'unverified': return colors.warning[500];
      case 'not_found': return colors.danger[500];
      default: return colors.neutral[500];
    }
  };

  const getResultText = (result: string) => {
    switch(result) {
      case 'verified': return 'Chính hãng';
      case 'unverified': return 'Nghi vấn';
      case 'not_found': return 'Không xác định';
      default: return 'Không rõ';
    }
  };

  const renderRecord = ({ item }: { item: VerificationRecord }) => (
    <View style={styles.recordCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      
      <View style={styles.recordInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.productName}</Text>
        <Text style={styles.shopName}>{item.shopName}</Text>
        
        <View style={styles.recordMeta}>
          <Text style={styles.scanDate}>{item.scanDate}</Text>
          <View style={[styles.resultBadge, { backgroundColor: `${getResultColor(item.verificationResult)}20` }]}>
            <Text style={[styles.resultText, { color: getResultColor(item.verificationResult) }]}>
              {getResultText(item.verificationResult)}
            </Text>
          </View>
        </View>
        
        {item.authenticityScore !== undefined && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Độ tin cậy:</Text>
            <View style={styles.scoreBar}>
              <View 
                style={[
                  styles.scoreFill, 
                  { 
                    width: `${item.authenticityScore}%`, 
                    backgroundColor: item.authenticityScore >= 80 ? colors.success[500] : 
                                   item.authenticityScore >= 60 ? colors.warning[500] : colors.danger[500] 
                  }
                ]} 
              />
            </View>
            <Text style={styles.scoreValue}>{item.authenticityScore}%</Text>
          </View>
        )}
        
        {item.notes && (
          <Text style={styles.notes}>{item.notes}</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.shareButton}>
        <Text style={styles.shareText}>Chia sẻ</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Tủ truy xuất cá nhân</Text>
      <Text style={styles.headerSubtitle}>Lịch sử quét mã xác thực của bạn</Text>
      
      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{records.length}</Text>
          <Text style={styles.statLabel}>Tổng quét</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success[500] }]}>
            {records.filter(r => r.verificationResult === 'verified').length}
          </Text>
          <Text style={styles.statLabel}>Chính hãng</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.warning[500] }]}>
            {records.filter(r => r.verificationResult === 'unverified').length}
          </Text>
          <Text style={styles.statLabel}>Nghi vấn</Text>
        </View>
      </View>
      
      {/* Filters and Sorting */}
      <View style={styles.controlsContainer}>
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'all' && styles.activeFilterButton]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.activeFilterButtonText]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'verified' && styles.activeFilterButton]}
            onPress={() => setFilter('verified')}
          >
            <Text style={[styles.filterButtonText, filter === 'verified' && styles.activeFilterButtonText]}>Chính hãng</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, filter === 'unverified' && styles.activeFilterButton]}
            onPress={() => setFilter('unverified')}
          >
            <Text style={[styles.filterButtonText, filter === 'unverified' && styles.activeFilterButtonText]}>Nghi vấn</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sắp xếp:</Text>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'date' && styles.activeSortButton]}
            onPress={() => setSortBy('date')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'date' && styles.activeSortButtonText]}>Mới nhất</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.sortButton, sortBy === 'score' && styles.activeSortButton]}
            onPress={() => setSortBy('score')}
          >
            <Text style={[styles.sortButtonText, sortBy === 'score' && styles.activeSortButtonText]}>Độ tin cậy</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Records List */}
      <FlatList
        data={filteredRecords}
        renderItem={renderRecord}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.recordsList}
      />
      
      {filteredRecords.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có bản ghi nào</Text>
          <Text style={styles.emptySubtext}>Bạn chưa quét mã xác thực nào</Text>
          <TouchableOpacity style={styles.scanButton}>
            <Text style={styles.scanButtonText}>Quét mã ngay</Text>
          </TouchableOpacity>
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
    paddingBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
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
  controlsContainer: {
    paddingHorizontal: spacing[4},
    marginBottom: spacing[4},
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: spacing[3},
  },
  filterButton: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    paddingVertical: spacing[2},
    paddingHorizontal: spacing[3},
    borderRadius: radius.full,
    alignItems: 'center',
    marginRight: spacing[2},
  },
  activeFilterButton: {
    backgroundColor: colors.brand.red[500],
  },
  filterButtonText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: colors.neutral[50],
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
    marginRight: spacing[2},
  },
  sortButton: {
    backgroundColor: colors.neutral[100],
    paddingVertical: spacing[1},
    paddingHorizontal: spacing[3},
    borderRadius: radius.full,
    marginLeft: spacing[2},
  },
  activeSortButton: {
    backgroundColor: colors.brand.red[500],
  },
  sortButtonText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
  },
  activeSortButtonText: {
    color: colors.neutral[50],
  },
  recordsList: {
    paddingHorizontal: spacing[4},
    paddingBottom: spacing[10},
  },
  recordCard: {
    flexDirection: 'row',
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
  productImage: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    resizeMode: 'contain',
  },
  recordInfo: {
    flex: 1,
    marginLeft: spacing[3},
  },
  productName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[1},
  },
  shopName: {
    fontSize: typography.body.sm.fontSize,
    color: colors.brand.red[500],
    marginBottom: spacing[2},
  },
  recordMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2},
  },
  scanDate: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    flex: 1,
  },
  resultBadge: {
    paddingHorizontal: spacing[2},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
  },
  resultText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2},
  },
  scoreLabel: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginRight: spacing[2},
    minWidth: 70,
  },
  scoreBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreValue: {
    fontSize: typography.body.sm.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginLeft: spacing[2},
    minWidth: 40,
  },
  notes: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
    fontStyle: 'italic',
    lineHeight: typography.body.sm.lineHeight,
  },
  shareButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[3},
    paddingVertical: spacing[2},
    borderRadius: radius.md,
    justifyContent: 'center',
    marginLeft: spacing[2},
  },
  shareText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.sm.fontSize,
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
    marginBottom: spacing[4},
  },
  scanButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[6},
    paddingVertical: spacing[3},
    borderRadius: radius.md,
  },
  scanButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
});

export default PersonalVerificationCabinetScreen;