import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

const ForgotPasswordScreen: React.FC = () => {
  const [step, setStep] = useState<number>(1); // 1: Enter email, 2: Verify OTP, 3: Reset password
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const handleSendOTP = () => {
    if (email) {
      console.log('Sending OTP to:', email);
      setStep(2);
    }
  };

  const handleVerifyOTP = () => {
    console.log('Verifying OTP:', otp);
    setStep(3);
  };

  const handleResetPassword = () => {
    if (newPassword === confirmNewPassword) {
      console.log('Password reset successful');
      // Navigate to login screen
    } else {
      alert('Mật khẩu không khớp!');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {step === 1 ? 'Quên mật khẩu?' : 
         step === 2 ? 'Xác minh OTP' : 
         'Đặt lại mật khẩu'}
      </Text>
      
      <Text style={styles.subtitle}>
        {step === 1 
          ? 'Nhập email để nhận mã xác minh' 
          : step === 2 
            ? 'Nhập mã xác minh đã gửi tới email của bạn' 
            : 'Nhập mật khẩu mới cho tài khoản của bạn'}
      </Text>

      {step === 1 && (
        <>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Nhập email của bạn"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Send OTP Button */}
          <TouchableOpacity 
            style={[styles.button, !email && styles.disabledButton]} 
            onPress={handleSendOTP}
            disabled={!email}
          >
            <Text style={styles.buttonText}>Gửi mã xác minh</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          {/* OTP Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mã xác minh</Text>
            <TextInput
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              placeholder="Nhập mã gồm 6 chữ số"
              keyboardType="numeric"
              maxLength={6}
            />
          </View>

          {/* Resend OTP */}
          <TouchableOpacity style={styles.resendContainer}>
            <Text style={styles.resendText}>Chưa nhận được mã? </Text>
            <TouchableOpacity>
              <Text style={styles.resendLink}>Gửi lại</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Verify Button */}
          <TouchableOpacity 
            style={[styles.button, !otp && styles.disabledButton]} 
            onPress={handleVerifyOTP}
            disabled={!otp}
          >
            <Text style={styles.buttonText}>Xác minh</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <>
          {/* New Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu mới</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Tối thiểu 8 ký tự"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity 
                style={styles.passwordToggle}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Text style={styles.passwordToggleText}>
                  {showConfirmPassword ? 'Ẩn' : 'Hiện'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reset Password Button */}
          <TouchableOpacity 
            style={[styles.button, !(newPassword && confirmNewPassword) && styles.disabledButton]} 
            onPress={handleResetPassword}
            disabled={!(newPassword && confirmNewPassword)}
          >
            <Text style={styles.buttonText}>Đặt lại mật khẩu</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Back to Login */}
      <TouchableOpacity 
        style={styles.backToLoginButton}
        onPress={() => setStep(1)}
      >
        <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
      </TouchableOpacity>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, step >= 1 && styles.activeProgressStep]} />
        <View style={[styles.progressStep, step >= 2 && styles.activeProgressStep]} />
        <View style={[styles.progressStep, step >= 3 && styles.activeProgressStep]} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing[5],
    backgroundColor: semanticColors.surface.base,
    paddingTop: spacing[8],
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[2],
  },
  input: {
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: spacing[12],
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing[4],
    top: spacing[3],
  },
  passwordToggleText: {
    color: colors.brand.red[500],
    fontSize: typography.body.sm.fontSize,
  },
  button: {
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing[4],
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
  disabledButton: {
    backgroundColor: colors.neutral[300],
  },
  buttonText: {
    color: colors.neutral[50],
    fontSize: typography.body.lg.fontSize,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  resendText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
  },
  resendLink: {
    fontSize: typography.body.md.fontSize,
    color: colors.brand.red[500],
    fontWeight: '600',
  },
  backToLoginButton: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  backToLoginText: {
    fontSize: typography.body.md.fontSize,
    color: colors.brand.red[500],
    fontWeight: '600',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing[6],
  },
  progressStep: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.neutral[300],
    marginHorizontal: spacing[2],
  },
  activeProgressStep: {
    backgroundColor: colors.brand.red[500],
  },
});

export default ForgotPasswordScreen;