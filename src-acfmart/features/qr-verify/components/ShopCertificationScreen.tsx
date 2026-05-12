import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  dateIssued: string;
  expiresAt?: string;
  status: 'valid' | 'expired' | 'revoked';
  description: string;
}

interface AuditRecord {
  id: string;
  date: string;
  type: 'product' | 'process' | 'facility';
  result: 'passed' | 'failed' | 'conditional';
  notes: string;
}

interface Shop {
  id: string;
  name: string;
  logo: string;
  description: string;
  joinDate: string;
  totalProducts: number;
  approvalRate: number;
  lastAuditDate: string;
  certifications: Certification[];
  auditHistory: AuditRecord[];
}

const ShopCertificationScreen: React.FC = () => {
  const [shop] = useState<Shop>({
    id: 's1',
    name: 'Natural Beauty Shop',
    logo: 'https://via.placeholder.com/100',
    description: 'Shop chuyên cung cấp các sản phẩm mỹ phẩm thiên nhiên, organic chính hãng từ các thương hiệu uy tín trong và ngoài nước.',
    joinDate: '2021-03-15',
    totalProducts: 42,
    approvalRate: 98.5,
    lastAuditDate: '2023-04-20',
    certifications: [
      {
        id: 'c1',
        name: 'Chứng nhận chính hãng ACF',
        issuer: 'Quỹ Chống Hàng Giả Việt Nam',
        dateIssued: '2023-01-15',
        expiresAt: '2024-01-15',
        status: 'valid',
        description: 'Chứng nhận rằng shop chỉ bán sản phẩm chính hãng, có nguồn gốc rõ ràng'
      },
      {
        id: 'c2',
        name: 'ISO 9001:2015',
        issuer: 'Tổ chức quốc tế ISO',
        dateIssued: '2022-08-10',
        expiresAt: '2025-08-10',
        status: 'valid',
        description: 'Chứng nhận hệ thống quản lý chất lượng theo tiêu chuẩn quốc tế'
      },
      {
        id: 'c3',
        name: 'Chứng nhận kinh doanh hợp pháp',
        issuer: 'UBND Quận 1, TP.HCM',
        dateIssued: '2021-02-20',
        status: 'valid',
        description: 'Giấy phép kinh doanh hợp lệ do cơ quan chức năng cấp'
      }
    ],
    auditHistory: [
      {
        id: 'a1',
        date: '2023-04-20',
        type: 'product',
        result: 'passed',
        notes: 'Kiểm tra mẫu 10 sản phẩm ngẫu nhiên, tất cả đều đúng thông tin khai báo'
      },
      {
        id: 'a2',
        date: '2023-01-15',
        type: 'facility',
        result: 'passed',
        notes: 'Kiểm tra kho hàng và quy trình bảo quản, đạt tiêu chuẩn'
      },
      {
        id: 'a3',
        date: '2022-10-05',
        type: 'process',
        result: 'conditional',
        notes: 'Cần cải thiện quy trình xác thực nguồn gốc cho 2 sản phẩm'
      }
    ]
  });

  const [activeTab, setActiveTab] = useState<'certifications' | 'audits' | 'products'>('certifications');

  const renderCertification = ({ item }: { item: Certification }) => (
    <View style={styles.certificationCard}>
      <View style={styles.certificationHeader}>
        <Text style={styles.certificationName}>{item.name}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'valid' && styles.validStatus,
          item.status === 'expired' && styles.expiredStatus,
          item.status === 'revoked' && styles.revokedStatus,
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'valid' ? 'Hiệu lực' : 
             item.status === 'expired' ? 'Hết hạn' : 'Thu hồi'}
          </Text>
        </View>
      </View>
      
      <View style={styles.certificationDetails}>
        <Text style={styles.issuer}>Cấp bởi: {item.issuer}</Text>
        <Text style={styles.date}>Ngày cấp: {item.dateIssued}</Text>
        {item.expiresAt && (
          <Text style={styles.date}>Hiệu lực đến: {item.expiresAt}</Text>
        )}
        <Text style={styles.description}>{item.description}</Text>
      </View>
      
      <TouchableOpacity style={styles.viewCertificateButton}>
        <Text style={styles.viewCertificateText}>Xem chứng nhận</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAudit = ({ item }: { item: AuditRecord }) => (
    <View style={styles.auditRecord}>
      <View style={styles.auditHeader}>
        <Text style={styles.auditDate}>{item.date}</Text>
        <View style={[
          styles.resultBadge,
          item.result === 'passed' && styles.passedResult,
          item.result === 'failed' && styles.failedResult,
          item.result === 'conditional' && styles.conditionalResult,
        ]}>
          <Text style={styles.resultText}>
            {item.result === 'passed' ? 'Đạt' : 
             item.result === 'failed' ? 'Không đạt' : 'Đạt có điều kiện'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.auditType}>
        Loại kiểm tra: {item.type === 'product' ? 'Sản phẩm' : 
                       item.type === 'process' ? 'Quy trình' : 'Cơ sở vật chất'}
      </Text>
      
      <Text style={styles.auditNotes}>{item.notes}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Chứng nhận chính hãng của shop</Text>
      
      {/* Shop Info */}
      <View style={styles.shopInfoCard}>
        <Image source={{ uri: shop.logo }} style={styles.shopLogo} />
        <View style={styles.shopDetails}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <Text style={styles.shopDescription}>{shop.description}</Text>
          
          <View style={styles.shopStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{shop.totalProducts}</Text>
              <Text style={styles.statLabel}>Sản phẩm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{shop.approvalRate}%</Text>
              <Text style={styles.statLabel}>Tỷ lệ đạt</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>Từ {shop.joinDate.split('-')[0]}</Text>
              <Text style={styles.statLabel}>Tham gia</Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'certifications' && styles.activeTab]}
          onPress={() => setActiveTab('certifications')}
        >
          <Text style={[styles.tabText, activeTab === 'certifications' && styles.activeTabText]}>Chứng nhận</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'audits' && styles.activeTab]}
          onPress={() => setActiveTab('audits')}
        >
          <Text style={[styles.tabText, activeTab === 'audits' && styles.activeTabText]}>Kiểm định</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'products' && styles.activeTab]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.activeTabText]}>Sản phẩm</Text>
        </TouchableOpacity>
      </View>
      
      {/* Content based on active tab */}
      {activeTab === 'certifications' && (
        <FlatList
          data={shop.certifications}
          renderItem={renderCertification}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {activeTab === 'audits' && (
        <FlatList
          data={shop.auditHistory}
          renderItem={renderAudit}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
      
      {activeTab === 'products' && (
        <View style={styles.productsContent}>
          <Text style={styles.productsIntro}>
            Tất cả {shop.totalProducts} sản phẩm tại shop đều đã qua kiểm duyệt của ACF và được đảm bảo là hàng chính hãng.
          </Text>
          <TouchableOpacity style={styles.browseProductsButton}>
            <Text style={styles.browseProductsText}>Duyệt sản phẩm</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Verification Note */}
      <View style={styles.verificationNote}>
        <Text style={styles.verificationNoteText}>
          Thông tin chứng nhận này được cập nhật và xác minh bởi hệ thống ACF. 
          Nếu bạn nghi ngờ bất kỳ sản phẩm nào tại shop này, vui lòng báo cáo để chúng tôi kiểm tra.
        </Text>
        <TouchableOpacity style={styles.reportButton}>
          <Text style={styles.reportButtonText}>Báo cáo sản phẩm</Text>
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
  shopInfoCard: {
    flexDirection: 'row',
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    marginHorizontal: spacing[4],
    borderRadius: radius.md,
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
  shopLogo: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    marginRight: spacing[3],
  },
  shopDetails: {
    flex: 1,
  },
  shopName: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    marginBottom: spacing[2],
  },
  shopDescription: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.md.lineHeight,
    marginBottom: spacing[3],
  },
  shopStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: semanticColors.text.muted,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    marginHorizontal: spacing[4],
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
  listContent: {
    paddingHorizontal: spacing[4],
  },
  certificationCard: {
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
  certificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3},
  },
  certificationName: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    flex: 1,
    marginRight: spacing[2},
  },
  statusBadge: {
    paddingHorizontal: spacing[2},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
  },
  validStatus: {
    backgroundColor: colors.success[100],
  },
  expiredStatus: {
    backgroundColor: colors.warning[100],
  },
  revokedStatus: {
    backgroundColor: colors.danger[100],
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  certificationDetails: {
    marginBottom: spacing[3},
  },
  issuer: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    marginBottom: spacing[1},
  },
  date: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[1},
  },
  description: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.md.lineHeight,
    marginTop: spacing[2},
  },
  viewCertificateButton: {
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[3},
    borderRadius: radius.md,
    alignItems: 'center',
  },
  viewCertificateText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  auditRecord: {
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
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2},
  },
  auditDate: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  resultBadge: {
    paddingHorizontal: spacing[2},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
  },
  passedResult: {
    backgroundColor: colors.success[100],
  },
  failedResult: {
    backgroundColor: colors.danger[100],
  },
  conditionalResult: {
    backgroundColor: colors.warning[100],
  },
  resultText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  auditType: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[2},
  },
  auditNotes: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.md.lineHeight,
  },
  productsContent: {
    padding: spacing[4},
  },
  productsIntro: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.md.lineHeight,
    marginBottom: spacing[4},
  },
  browseProductsButton: {
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
  },
  browseProductsText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  verificationNote: {
    margin: spacing[4},
    padding: spacing[4},
    backgroundColor: colors.info[50],
    borderRadius: radius.md,
  },
  verificationNoteText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.sm.lineHeight,
    marginBottom: spacing[3},
  },
  reportButton: {
    backgroundColor: colors.danger[500],
    paddingVertical: spacing[3},
    borderRadius: radius.md,
    alignItems: 'center',
  },
  reportButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
});

export default ShopCertificationScreen;