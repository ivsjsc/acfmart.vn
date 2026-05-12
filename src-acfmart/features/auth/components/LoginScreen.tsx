import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleEmailLogin = () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập email và mật khẩu');
      return;
    }
    // Logic đăng nhập
    Alert.alert('Thông báo', `Đăng nhập thành công với email: ${email}`);
  };

  const handleGoogleLogin = () => {
    Alert.alert('Thông báo', 'Đăng nhập bằng Google thành công!');
  };

  const handleForgotPassword = () => {
    Alert.alert('Quên mật khẩu', 'Vui lòng nhập email để nhận liên kết đặt lại mật khẩu');
  };

  const handleSignup = () => {
    Alert.alert('Đăng ký', 'Chuyển đến trang đăng ký');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://placehold.co/100x100?text=ACF' }} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.logoText}>ACF Marketplace</Text>
      </View>

      <Text style={styles.title}>Chào mừng trở lại</Text>
      <Text style={styles.subtitle}>Đăng nhập để tiếp tục mua sắm sản phẩm chính hãng</Text>

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

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Nhập mật khẩu"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.forgotPasswordButton} onPress={handleForgotPassword}>
        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton} onPress={handleEmailLogin}>
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>HOẶC</Text>
        <View style={styles.divider} />
      </View>

      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Image 
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
          style={styles.googleIcon} 
        />
        <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={handleSignup}>
          <Text style={styles.signupLink}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.securityNotice}>
        <Text style={styles.securityText}>
          Bằng việc đăng nhập, bạn đồng ý với Điều khoản sử dụng và Chính sách bảo mật của chúng tôi
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: semanticColors.surface.base,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[12],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logo: {
    width: 80,
    height: 80,
  },
  logoText: {
    fontSize: typography.h3.fontSize,
    fontWeight: '700',
    color: colors.brand.red[500],
    marginTop: spacing[2],
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: '700',
    color: semanticColors.text.primary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing[6],
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  label: {
    fontSize: typography.body.sm.fontSize,
    fontWeight: '500',
    color: semanticColors.text.primary,
    marginBottom: spacing[1],
  },
  input: {
    backgroundColor: colors.neutral[100],
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    fontSize: typography.body.md.fontSize,
    borderWidth: 1,
    borderColor: semanticColors.border.base,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: spacing[4],
  },
  forgotPasswordText: {
    fontSize: typography.body.sm.fontSize,
    color: colors.brand.red[500],
  },
  loginButton: {
    backgroundColor: colors.brand.red[500],
    borderRadius: radius.md,
    paddingVertical: spacing[4],
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  loginButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: semanticColors.border.divider,
  },
  dividerText: {
    paddingHorizontal: spacing[3],
    color: semanticColors.text.muted,
    fontSize: typography.body.sm.fontSize,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    paddingVertical: spacing[3],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: semanticColors.border.base,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: spacing[2],
  },
  googleButtonText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing[4],
  },
  signupText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
  },
  signupLink: {
    fontSize: typography.body.sm.fontSize,
    color: colors.brand.red[500],
    fontWeight: '500',
  },
  securityNotice: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  securityText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    textAlign: 'center',
    lineHeight: typography.body.sm.lineHeight,
  },
});

export default LoginScreen;