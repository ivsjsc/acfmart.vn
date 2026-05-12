import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

const ReportCounterfeitScreen: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);
  const [description, setDescription] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');

  const orders = [
    { id: 'ORD-2023-001234', productName: 'Son dưỡng môi thiên nhiên SPF 15', date: '2023-05-15' },
    { id: 'ORD-2023-001235', productName: 'Tai nghe không dây chống ồn', date: '2023-05-16' },
    { id: 'ORD-2023-001236', productName: 'Mặt nạ dưỡng da Vitamin C', date: '2023-05-17' },
  ];

  const handleNext = () => {
    if (step === 1 && !selectedOrder) {
      Alert.alert('Thông báo', 'Vui lòng chọn đơn hàng');
      return;
    }
    if (step === 2 && evidenceImages.length === 0) {
      Alert.alert('Thông báo', 'Vui lòng tải lên bằng chứng');
      return;
    }
    if (step === 3 && description.trim() === '') {
      Alert.alert('Thông báo', 'Vui lòng mô tả vấn đề');
      return;
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    // Submit report logic
    Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi. Chúng tôi sẽ xử lý trong thời gian sớm nhất.');
    setStep(1);
    setSelectedOrder(null);
    setEvidenceImages([]);
    setDescription('');
    setContactInfo('');
  };

  const addEvidenceImage = () => {
    // In a real app, this would open the camera/gallery
    const newImage = `https://picsum.photos/seed/${Date.now()}/300/300`;
    setEvidenceImages([...evidenceImages, newImage]);
  };

  const removeEvidenceImage = (index: number) => {
    const newImages = [...evidenceImages];
    newImages.splice(index, 1);
    setEvidenceImages(newImages);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Báo cáo hàng giả</Text>
      <Text style={styles.headerSubtitle}>Hãy giúp chúng tôi loại bỏ hàng giả</Text>
      
      {/* Step indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.step, step >= 1 && styles.activeStep]}>
          <Text style={[styles.stepText, step === 1 && styles.activeStepText]}>1</Text>
        </View>
        <View style={styles.stepConnector} />
        <View style={[styles.step, step >= 2 && styles.activeStep]}>
          <Text style={[styles.stepText, step === 2 && styles.activeStepText]}>2</Text>
        </View>
        <View style={styles.stepConnector} />
        <View style={[styles.step, step >= 3 && styles.activeStep]}>
          <Text style={[styles.stepText, step === 3 && styles.activeStepText]}>3</Text>
        </View>
      </View>
      
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, step === 1 && styles.activeStepLabel]}>Chọn đơn hàng</Text>
        <Text style={[styles.stepLabel, step === 2 && styles.activeStepLabel]}>Bằng chứng</Text>
        <Text style={[styles.stepLabel, step === 3 && styles.activeStepLabel]}>Mô tả</Text>
      </View>
      
      <View style={styles.formContainer}>
        {step === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Chọn đơn hàng nghi vấn</Text>
            <Text style={styles.sectionSubtitle}>Vui lòng chọn đơn hàng bạn nghi ngờ là hàng giả</Text>
            
            {orders.map(order => (
              <TouchableOpacity 
                key={order.id}
                style={[styles.orderItem, selectedOrder === order.id && styles.selectedOrderItem]}
                onPress={() => setSelectedOrder(order.id)}
              >
                <View>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.productName}>{order.productName}</Text>
                  <Text style={styles.orderDate}>{order.date}</Text>
                </View>
                <View style={styles.radioCircle}>
                  {selectedOrder === order.id && <View style={styles.selectedRb} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {step === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Upload bằng chứng</Text>
            <Text style={styles.sectionSubtitle}>Vui lòng chụp ảnh sản phẩm nghi vấn và các đặc điểm khác biệt</Text>
            
            <View style={styles.evidenceContainer}>
              {evidenceImages.map((img, index) => (
                <View key={index} style={styles.evidenceItem}>
                  <Image source={{ uri: img }} style={styles.evidenceImage} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeEvidenceImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
              
              {evidenceImages.length < 5 && (
                <TouchableOpacity style={styles.addImageButton} onPress={addEvidenceImage}>
                  <Text style={styles.addImageIcon}>+</Text>
                  <Text style={styles.addImageText}>Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        
        {step === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Mô tả chi tiết</Text>
            <Text style={styles.sectionSubtitle}>Vui lòng mô tả những điểm khiến bạn nghi ngờ đây là hàng giả</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={6}
                placeholder="Mô tả chi tiết về sản phẩm nghi vấn..."
                value={description}
                onChangeText={setDescription}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Thông tin liên hệ (nếu có)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Số điện thoại hoặc email để chúng tôi phản hồi"
                value={contactInfo}
                onChangeText={setContactInfo}
              />
            </View>
          </View>
        )}
      </View>
      
      {/* Navigation buttons */}
      <View style={styles.navButtons}>
        {step > 1 && (
          <TouchableOpacity style={styles.prevButton} onPress={handlePrevious}>
            <Text style={styles.prevButtonText}>Quay lại</Text>
          </TouchableOpacity>
        )}
        
        {step < 3 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Tiếp tục</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Gửi báo cáo</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.warningContainer}>
        <Text style={styles.warningText}>
          Báo cáo của bạn sẽ được gửi đến đội ngũ kiểm duyệt của ACF. 
          Chúng tôi cam kết bảo mật thông tin cá nhân của bạn.
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
    textAlign: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
    textAlign: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[4],
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[2],
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: colors.brand.red[500],
  },
  stepText: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.muted,
  },
  activeStepText: {
    color: colors.neutral[50],
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.neutral[200],
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  stepLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
  },
  activeStepLabel: {
    color: semanticColors.text.primary,
    fontWeight: '600',
  },
  formContainer: {
    paddingHorizontal: spacing[4],
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[2],
  },
  sectionSubtitle: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[4],
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  selectedOrderItem: {
    borderColor: colors.brand.red[500],
    backgroundColor: colors.brand.red[50],
  },
  orderId: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[1],
  },
  productName: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
    marginBottom: spacing[1],
  },
  orderDate: {
    fontSize: typography.caption.fontSize,
    color: semanticColors.text.muted,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRb: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.brand.red[500],
  },
  evidenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[3],
  },
  evidenceItem: {
    position: 'relative',
  },
  evidenceImage: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.danger[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: colors.neutral[50],
    fontSize: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageIcon: {
    fontSize: 24,
    color: colors.neutral[400],
    marginBottom: spacing[1],
  },
  addImageText: {
    fontSize: typography.body.sm.fontSize,
    color: colors.neutral[500],
  },
  inputContainer: {
    marginBottom: spacing[4},
  },
  inputLabel: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[2],
  },
  textInput: {
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[3},
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    textAlignVertical: 'top',
  },
  navButtons: {
    flexDirection: 'row',
    paddingHorizontal: spacing[4},
    marginBottom: spacing[3},
  },
  prevButton: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginRight: spacing[2},
  },
  prevButtonText: {
    color: semanticColors.text.primary,
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  nextButton: {
    flex: 1,
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
    marginLeft: spacing[2},
  },
  nextButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.success[500],
    paddingVertical: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
  },
  submitButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  warningContainer: {
    marginHorizontal: spacing[4},
    padding: spacing[4},
    backgroundColor: colors.warning[50],
    borderRadius: radius.md,
    marginBottom: spacing[4},
  },
  warningText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.sm.lineHeight,
  },
});

export default ReportCounterfeitScreen;