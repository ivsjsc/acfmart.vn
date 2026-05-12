import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

const QRScannerScreen: React.FC = () => {
  const [scanning, setScanning] = useState<boolean>(true);
  const [scanResult, setScanResult] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'verified' | 'unverified' | 'not_found' | null>(null);
  const [verificationData, setVerificationData] = useState<any>(null);

  const startScanning = () => {
    setScanning(true);
    setScanResult(null);
    setVerificationStatus(null);
  };

  const handleScanSuccess = (data: string) => {
    if (!data) return;
    
    setScanning(false);
    setScanResult(data);
    
    // Simulate verification process
    setVerificationStatus('loading');
    
    // Simulate API call delay
    setTimeout(() => {
      // Randomly determine verification result for demo
      const statuses: Array<'verified' | 'unverified' | 'not_found'> = ['verified', 'unverified', 'not_found'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      setVerificationStatus(randomStatus);
      
      if (randomStatus === 'verified') {
        setVerificationData({
          productName: 'Son dưỡng môi thiên nhiên SPF 15',
          brand: 'Natural Beauty',
          manufacturer: 'Công ty TNHH Mỹ Phẩm Thiên Nhiên',
          manufactureDate: '2023-04-15',
          expiryDate: '2025-04-15',
          origin: 'Việt Nam',
          certification: 'Chứng nhận ISO 22716',
          authenticityScore: 98,
          verificationDate: new Date().toISOString(),
          batchNumber: 'NB20230415001',
          serialNumber: data.substring(0, 10),
        });
      } else if (randomStatus === 'unverified') {
        setVerificationData({
          productName: 'Sản phẩm không xác định',
          reason: 'Thông tin không khớp với cơ sở dữ liệu',
          advice: 'Vui lòng kiểm tra kỹ trước khi sử dụng'
        });
      } else {
        setVerificationData({
          reason: 'Không tìm thấy thông tin sản phẩm',
          advice: 'Sản phẩm có thể không được đăng ký hoặc mã QR không hợp lệ'
        });
      }
    }, 2000);
  };

  const handleManualEntry = () => {
    Alert.alert(
      'Nhập mã QR',
      'Vui lòng nhập mã QR để xác thực:',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'OK', 
          onPress: (value) => {
            if(value) handleScanSuccess(value);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Xác thực sản phẩm</Text>
      
      {scanning ? (
        <View style={styles.scannerContainer}>
          {/* Simulated camera viewfinder */}
          <View style={styles.overlayContainer}>
            <View style={styles.topOverlay} />
            <View style={styles.middleOverlay}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeftCorner]} />
                <View style={[styles.corner, styles.topRightCorner]} />
                <View style={[styles.corner, styles.bottomLeftCorner]} />
                <View style={[styles.corner, styles.bottomRightCorner]} />
              </View>
            </View>
            <View style={styles.bottomOverlay} />
          </View>
          
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Đưa mã QR vào khung để quét</Text>
            <Text style={styles.instructionSubtext}>Mã QR thường nằm trên bao bì sản phẩm</Text>
          </View>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.manualEntryButton} onPress={handleManualEntry}>
              <Text style={styles.manualEntryButtonText}>Nhập mã thủ công</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <ScrollView style={styles.resultContainer}>
          {verificationStatus === 'loading' ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Đang xác thực...</Text>
              <View style={styles.spinner} />
            </View>
          ) : (
            <>
              <View style={[
                styles.verificationCard,
                verificationStatus === 'verified' && styles.verifiedCard,
                verificationStatus === 'unverified' && styles.unverifiedCard,
                verificationStatus === 'not_found' && styles.notFoundCard,
              ]}>
                <View style={styles.verificationHeader}>
                  <Text style={styles.verificationStatusText}>
                    {verificationStatus === 'verified' ? '✅ Chính hãng 100%' : 
                     verificationStatus === 'unverified' ? '⚠️ Cảnh báo' : 
                     '❌ Không tìm thấy'}
                  </Text>
                  
                  {verificationStatus === 'verified' && (
                    <Text style={styles.authenticityScore}>Độ tin cậy: {verificationData?.authenticityScore}%</Text>
                  )}
                </View>
                
                {verificationData && (
                  <View style={styles.verificationDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tên sản phẩm:</Text>
                      <Text style={styles.detailValue}>{verificationData.productName}</Text>
                    </View>
                    
                    {verificationData.brand && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Thương hiệu:</Text>
                        <Text style={styles.detailValue}>{verificationData.brand}</Text>
                      </View>
                    )}
                    
                    {verificationData.manufacturer && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Nhà sản xuất:</Text>
                        <Text style={styles.detailValue}>{verificationData.manufacturer}</Text>
                      </View>
                    )}
                    
                    {verificationData.origin && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Xuất xứ:</Text>
                        <Text style={styles.detailValue}>{verificationData.origin}</Text>
                      </View>
                    )}
                    
                    {verificationData.batchNumber && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Lô sản xuất:</Text>
                        <Text style={styles.detailValue}>{verificationData.batchNumber}</Text>
                      </View>
                    )}
                    
                    {verificationData.serialNumber && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Số seri:</Text>
                        <Text style={styles.detailValue}>{verificationData.serialNumber}</Text>
                      </View>
                    )}
                    
                    {verificationData.reason && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Lý do:</Text>
                        <Text style={styles.detailValue}>{verificationData.reason}</Text>
                      </View>
                    )}
                    
                    <View style={styles.adviceContainer}>
                      <Text style={styles.adviceLabel}>Lời khuyên:</Text>
                      <Text style={styles.adviceText}>{verificationData.advice}</Text>
                    </View>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={styles.scanAgainButton} 
                onPress={startScanning}
              >
                <Text style={styles.scanAgainButtonText}>Quét mã khác</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.reportButton} 
                onPress={() => console.log('Report counterfeit')}
              >
                <Text style={styles.reportButtonText}>Báo cáo hàng giả</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
  },
  headerTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    textAlign: 'center',
    paddingVertical: spacing[4],
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  overlayContainer: {
    flex: 1,
  },
  topOverlay: {
    flex: 0.35,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  middleOverlay: {
    flex: 0.3,
    flexDirection: 'row',
  },
  bottomOverlay: {
    flex: 0.35,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scanFrame: {
    flex: 1,
    margin: spacing[4],
    borderColor: colors.brand.gold[500],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: {
    position: 'absolute',
    borderColor: colors.brand.gold[500],
    borderWidth: 3,
    width: 20,
    height: 20,
  },
  topLeftCorner: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRightCorner: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeftCorner: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRightCorner: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionContainer: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    marginTop: 60,
  },
  instructionText: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: colors.neutral[50],
    marginBottom: spacing[2],
  },
  instructionSubtext: {
    fontSize: typography.body.md.fontSize,
    color: colors.neutral[200],
  },
  controlsContainer: {
    position: 'absolute',
    bottom: spacing[8],
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  manualEntryButton: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: radius.full,
  },
  manualEntryButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    padding: spacing[4],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.h3.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[4],
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: radius.full,
    borderWidth: 4,
    borderColor: colors.brand.red[500],
    borderTopColor: colors.neutral[50],
    borderRightColor: colors.neutral[50],
    borderBottomColor: colors.neutral[50],
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
  verificationCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    padding: spacing[5],
    marginBottom: spacing[5],
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
  verifiedCard: {
    borderColor: colors.success[500],
    borderWidth: 2,
  },
  unverifiedCard: {
    borderColor: colors.warning[500],
    borderWidth: 2,
  },
  notFoundCard: {
    borderColor: colors.danger[500],
    borderWidth: 2,
  },
  verificationHeader: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  verificationStatusText: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    marginBottom: spacing[2],
  },
  authenticityScore: {
    fontSize: typography.body.md.fontSize,
    color: colors.success[600],
    fontWeight: '600',
  },
  verificationDetails: {
    marginTop: spacing[2],
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing[3],
  },
  detailLabel: {
    width: 120,
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  detailValue: {
    flex: 1,
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
  adviceContainer: {
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: semanticColors.border.divider,
  },
  adviceLabel: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[1],
  },
  adviceText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    fontStyle: 'italic',
  },
  scanAgainButton: {
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  scanAgainButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.lg.fontSize,
    fontWeight: '600',
  },
  reportButton: {
    backgroundColor: colors.danger[500],
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  reportButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.lg.fontSize,
    fontWeight: '600',
  },
});

export default QRScannerScreen;