áoaimport React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface AccountMenuItem {
  id: string;
  title: string;
  icon: string;
  action: () => void;
}

const AccountScreen: React.FC = () => {
  const [userInfo] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0123 456 789',
    avatar: 'https://via.placeholder.com/100',
    memberSince: 'Tháng 5, 2023',
    tier: 'Thành viên bạc',
    points: 1250,
  });

  const [menuItems] = useState<AccountMenuItem[]>([
    { id: 'profile', title: 'Hồ sơ cá nhân', icon: '👤', action: () => {} },
    { id: 'security', title: 'Bảo mật', icon: '🔒', action: () => {} },
    { id: 'notifications', title: 'Thông báo', icon: '🔔', action: () => {} },
    { id: 'addresses', title: 'Địa chỉ', icon: '📍', action: () => {} },
    { id: 'payment', title: 'Phương thức thanh toán', icon: '💳', action: () => {} },
    { id: 'vouchers', title: 'Voucher của tôi', icon: '🎟️', action: () => {} },
    { id: 'wallet', title: 'Ví ACF', icon: '💰', action: () => {} },
    { id: 'orders', title: 'Đơn hàng', icon: '📦', action: () => {} },
    { id: 'favorites', title: 'Sản phẩm yêu thích', icon: '❤️', action: () => {} },
    { id: 'history', title: 'Lịch sử quét mã', icon: '🔍', action: () => {} },
    { id: 'settings', title: 'Cài đặt', icon: '⚙️', action: () => {} },
    { id: 'help', title: 'Trợ giúp', icon: '❓', action: () => {} },
  ]);

  const handleLogout = () => {
    console.log('Logging out...');
  };

  const renderMenuItem = (item: AccountMenuItem) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.menuItem}
      onPress={item.action}
    >
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemIcon}>{item.icon}</Text>
        <Text style={styles.menuItemText}>{item.title}</Text>
      </View>
      <Text style={styles.menuItemArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>🛡️</Text>
          </View>
        </View>
        <Text style={styles.profileName}>{userInfo.name}</Text>
        <Text style={styles.memberTier}>{userInfo.tier}</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>🏆 {userInfo.points} điểm</Text>
          <Text style={styles.memberSince}>Thành viên từ: {userInfo.memberSince}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>📦</Text>
          <Text style={styles.quickActionText}>Đơn hàng</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>❤️</Text>
          <Text style={styles.quickActionText}>Yêu thích</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>💰</Text>
          <Text style={styles.quickActionText}>Ví tiền</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction}>
          <Text style={styles.quickActionIcon}>🔍</Text>
          <Text style={styles.quickActionText}>QR Scanner</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map(renderMenuItem)}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
  },
  profileHeader: {
    backgroundColor: colors.brand.red[500],
    padding: spacing[5],
    alignItems: 'center',
    paddingBottom: spacing[6],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing[3],
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.neutral[50],
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.gold[500],
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.neutral[50],
  },
  badge: {
    fontSize: 20,
    padding: 3,
  },
  profileName: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: colors.neutral[50],
    marginBottom: spacing[1],
  },
  memberTier: {
    fontSize: typography.body.md.fontSize,
    color: colors.gold[100],
    backgroundColor: colors.brand.red[600],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    marginBottom: spacing[2],
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: typography.body.md.fontSize,
    color: colors.gold[100],
    fontWeight: '600',
    marginBottom: spacing[1],
  },
  memberSince: {
    fontSize: typography.body.sm.fontSize,
    color: colors.neutral[200],
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing[4],
    backgroundColor: colors.neutral[50],
    marginHorizontal: spacing[4],
    borderRadius: radius.lg,
    marginTop: -spacing[6], // Overlap with header
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
  quickAction: {
    alignItems: 'center',
    padding: spacing[2],
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
  menuContainer: {
    margin: spacing[4],
    backgroundColor: colors.neutral[50],
    borderRadius: radius.lg,
    overflow: 'hidden',
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
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4},
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: 24,
    marginRight: spacing[3],
  },
  menuItemText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    fontWeight: '500',
  },
  menuItemArrow: {
    fontSize: typography.h2.fontSize,
    color: semanticColors.text.muted,
  },
  logoutContainer: {
    margin: spacing[4],
    marginTop: spacing[2],
  },
  logoutButton: {
    backgroundColor: colors.danger[500],
    paddingVertical: spacing[4},
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.lg.fontSize,
    fontWeight: '600',
  },
});

export default AccountScreen;