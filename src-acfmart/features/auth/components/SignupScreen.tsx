import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

const SignupScreen: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  const handleSignup = () => {
    // Logic đăng ký
    console.log('Signing up with:', { name, email, phone, password });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Tạo tài khoản mới</Text>
      <Text style={styles.subtitle}>Vui lòng điền thông tin bên dưới</Text>

      {/* Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Họ và tên</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nhập họ và tên đầy đủ"
        />
      </View>

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

      {/* Phone Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={password}
            onChangeText={setPassword}
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

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Xác nhận mật khẩu</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Nhập lại mật khẩu"
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

      {/* Terms Agreement */}
      <View style={styles.agreementContainer}>
        <TouchableOpacity 
          style={[styles.checkbox, agreedToTerms && styles.checkedCheckbox]}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>
        <Text style={styles.agreementText}>
          Tôi đồng ý với{' '}
          <Text style={styles.linkText}>Điều khoản sử dụng</Text>{' '}
          và{' '}
          <Text style={styles.linkText}>Chính sách bảo mật</Text>
        </Text>
      </View>

      {/* Signup Button */}
      <TouchableOpacity 
        style={[styles.signupButton, !agreedToTerms && styles.disabledButton]} 
        onPress={handleSignup}
        disabled={!agreedToTerms}
      >
        <Text style={styles.signupButtonText}>Tạo tài khoản</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>HOẶC</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Login Link */}
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Đã có tài khoản? </Text>
        <TouchableOpacity>
          <Text style={styles.loginLink}>Đăng nhập</Text>
        </TouchableOpacity>
      </View>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Text style={styles.securityText}>
          Tài khoản của bạn được bảo vệ bởi công nghệ mã hóa tiên tiến và cam kết bảo mật của ACF Marketplace
        </Text>
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
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing[5],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: semanticColors.border.default,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[3],
    marginTop: spacing[1],
  },
  checkedCheckbox: {
    backgroundColor: colors.brand.red[500],
    borderColor: colors.brand.red[500],
  },
  checkmark: {
    color: colors.neutral[50],
    fontSize: 12,
    fontWeight: 'bold',
  },
  agreementText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
    flex: 1,
    lineHeight: 20,
  },
  linkText: {
    color: colors.brand.red[500],
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing[5],
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
  signupButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.lg.fontSize,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: semanticColors.border.divider,
  },
  dividerText: {
    marginHorizontal: spacing[3],
    color: semanticColors.text.muted,
    fontSize: typography.body.sm.fontSize,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  loginText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
  loginLink: {
    fontSize: typography.body.md.fontSize,
    color: colors.brand.red[500],
    fontWeight: '600',
  },
  securityNotice: {
    alignItems: 'center',
  },
  securityText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    textAlign: 'center',
    lineHeight: typography.body.sm.lineHeight,
  },
});

export default SignupScreen;