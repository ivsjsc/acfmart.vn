import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius, elevation } from '../../../design-system/tokens';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const handleLogin = () => {
    // Logic đăng nhập
    console.log('Logging in with:', { email, password });
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Logging in with ${provider}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={{ uri: 'https://placehold.co/120x120' }} 
          style={styles.logo} 
        />
        <Text style={styles.appName}>ACF Marketplace</Text>
        <Text style={styles.tagline}>Sàn thương mại điện tử chống hàng giả</Text>
      </View>

      {/* Login Method Toggle */}
      <View style={styles.methodToggleContainer}>
        <TouchableOpacity 
          style={[
            styles.methodButton,
            loginMethod === 'email' && styles.activeMethodButton
          ]}
          onPress={() => setLoginMethod('email')}
        >
          <Text style={[
            styles.methodButtonText,
            loginMethod === 'email' && styles.activeMethodButtonText
          ]}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.methodButton,
            loginMethod === 'phone' && styles.activeMethodButton
          ]}
          onPress={() => setLoginMethod('phone')}
        >
          <Text style={[
            styles.methodButtonText,
            loginMethod === 'phone' && styles.activeMethodButtonText
          ]}>Số điện thoại</Text>
        </TouchableOpacity>
      </View>

      {/* Email/Phone Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {loginMethod === 'email' ? 'Email' : 'Số điện thoại'}
        </Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={
            loginMethod === 'email' 
              ? 'Nhập email của bạn' 
              : 'Nhập số điện thoại'
          }
          keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
          autoCapitalize="none"
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
            placeholder="Nhập mật khẩu"
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

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Đăng nhập</Text>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>HOẶC</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Options */}
      <View style={styles.socialLoginContainer}>
        <TouchableOpacity 
          style={[styles.socialButton, styles.googleButton]} 
          onPress={() => handleSocialLogin('Google')}
        >
          <Text style={styles.socialButtonText}>G</Text>
          <Text style={styles.socialButtonText}>Đăng nhập với Google</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.socialButton, styles.appleButton]} 
          onPress={() => handleSocialLogin('Apple')}
        >
          <Text style={styles.socialButtonText}></Text>
          <Text style={styles.socialButtonText}>Đăng nhập với Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.socialButton, styles.zaloButton]} 
          onPress={() => handleSocialLogin('Zalo')}
        >
          <Text style={styles.socialButtonText}>Z</Text>
          <Text style={styles.socialButtonText}>Đăng nhập với Zalo</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Link */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>Chưa có tài khoản? </Text>
        <TouchableOpacity>
          <Text style={styles.signupLink}>Đăng ký</Text>
        </TouchableOpacity>
      </View>

      {/* Security Notice */}
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
    padding: spacing[5],
    backgroundColor: semanticColors.surface.base,
    paddingTop: spacing[10],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    marginBottom: spacing[3],
  },
  appName: {
    fontSize: typography.h2.fontSize,
    fontWeight: 'bold',
    color: colors.brand.red[500],
    marginBottom: spacing[1],
  },
  tagline: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.muted,
    textAlign: 'center',
  },
  methodToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: radius.full,
    padding: spacing[1],
    marginBottom: spacing[5],
  },
  methodButton: {
    flex: 1,
    paddingVertical: spacing[3],
    alignItems: 'center',
    borderRadius: radius.full,
  },
  activeMethodButton: {
    backgroundColor: colors.brand.red[500],
  },
  methodButtonText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
  activeMethodButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing[4],
  },
  forgotPasswordText: {
    color: colors.brand.red[500],
    fontSize: typography.body.md.fontSize,
  },
  loginButton: {
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
  loginButtonText: {
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
  socialLoginContainer: {
    marginBottom: spacing[5],
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    marginBottom: spacing[3],
    borderWidth: 1,
  },
  googleButton: {
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  appleButton: {
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  zaloButton: {
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  socialButtonText: {
    fontSize: typography.body.md.fontSize,
    marginHorizontal: spacing[2],
    color: semanticColors.text.primary,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  signupText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
  },
  signupLink: {
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

export default LoginScreen;