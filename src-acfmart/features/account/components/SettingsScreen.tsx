import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, FlatList, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'toggle' | 'navigation' | 'input';
  icon?: string;
  enabled?: boolean;
  action?: () => void;
}

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState([
    { id: 'account', title: 'Tài khoản', type: 'navigation', icon: '👤' },
    { id: 'security', title: 'Bảo mật', type: 'navigation', icon: '🔒' },
    { id: 'notifications', title: 'Thông báo', type: 'navigation', icon: '🔔' },
    { id: 'privacy', title: 'Quyền riêng tư', type: 'navigation', icon: '🛡️' },
    { id: 'appearance', title: 'Giao diện', type: 'navigation', icon: '🎨' },
    { id: 'language', title: 'Ngôn ngữ', type: 'navigation', icon: '🌐' },
    { id: 'location', title: 'Vị trí', type: 'navigation', icon: '📍' },
    { id: 'dark_mode', title: 'Chế độ tối', type: 'toggle', enabled: false },
    { id: 'notifications_enabled', title: 'Cho phép thông báo', type: 'toggle', enabled: true },
    { id: 'email_updates', title: 'Cập nhật qua email', type: 'toggle', enabled: true },
    { id: 'auto_location', title: 'Tự động xác định vị trí', type: 'toggle', enabled: true },
    { id: 'save_cards', title: 'Lưu thông tin thẻ', type: 'toggle', enabled: false },
    { id: 'biometric_auth', title: 'Xác thực sinh trắc học', type: 'toggle', enabled: true },
    { id: 'data_saver', title: 'Tiết kiệm dữ liệu', type: 'toggle', enabled: false },
    { id: 'help', title: 'Trợ giúp', type: 'navigation', icon: '❓' },
    { id: 'about', title: 'Về ACF Marketplace', type: 'navigation', icon: 'ℹ️' },
    { id: 'terms', title: 'Điều khoản sử dụng', type: 'navigation', icon: '📄' },
    { id: 'privacy_policy', title: 'Chính sách bảo mật', type: 'navigation', icon: '📋' },
    { id: 'licenses', title: 'Giấy phép', type: 'navigation', icon: '⚖️' },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id 
        ? { ...setting, enabled: !setting.enabled } 
        : setting
    ));
  };

  const groupedSettings = [
    {
      title: 'Tài khoản',
      items: settings.filter(s => ['account', 'security', 'privacy'].includes(s.id))
    },
    {
      title: 'Cài đặt ứng dụng',
      items: settings.filter(s => ['appearance', 'language', 'location', 'dark_mode', 'data_saver'].includes(s.id))
    },
    {
      title: 'Thông báo',
      items: settings.filter(s => ['notifications', 'notifications_enabled', 'email_updates'].includes(s.id))
    },
    {
      title: 'Bảo mật',
      items: settings.filter(s => ['biometric_auth', 'save_cards', 'auto_location'].includes(s.id))
    },
    {
      title: 'Thông tin',
      items: settings.filter(s => ['help', 'about', 'terms', 'privacy_policy', 'licenses'].includes(s.id))
    }
  ];

  const renderSettingItem = ({ item }: { item: SettingItem }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        {item.icon && <Text style={styles.settingIcon}>{item.icon}</Text>}
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          {item.subtitle && <Text style={styles.settingSubtitle}>{item.subtitle}</Text>}
        </View>
      </View>
      
      {item.type === 'toggle' ? (
        <Switch
          value={item.enabled}
          onValueChange={() => toggleSetting(item.id)}
          trackColor={{ false: colors.neutral[300], true: colors.brand.red[500] }}
          thumbColor={colors.neutral[50]}
        />
      ) : (
        <Text style={styles.chevron}>›</Text>
      )}
    </View>
  );

  const renderGroup = ({ item }: { item: { title: string; items: SettingItem[] } }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupTitle}>{item.title}</Text>
      <View style={styles.groupItems}>
        {item.items.map(setting => (
          <View key={setting.id}>
            {renderSettingItem({ item: setting })}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Cài đặt</Text>
      
      <FlatList
        data={groupedSettings}
        renderItem={renderGroup}
        keyExtractor={item => item.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.groupsList}
      />
      
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Phiên bản: 1.0.0</Text>
        <Text style={styles.copyrightText}>© 2023 ACF Marketplace. Bảo lưu mọi quyền.</Text>
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
  groupsList: {
    paddingBottom: spacing[10},
  },
  groupContainer: {
    marginBottom: spacing[5},
  },
  groupTitle: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.muted,
    paddingHorizontal: spacing[4},
    marginBottom: spacing[2},
    textTransform: 'uppercase',
  },
  groupItems: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    overflow: 'hidden',
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[4},
    paddingHorizontal: spacing[4},
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: spacing[3},
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '500',
    color: semanticColors.text.primary,
  },
  settingSubtitle: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginTop: spacing[1},
  },
  chevron: {
    fontSize: typography.h2.fontSize,
    color: semanticColors.text.muted,
  },
  versionContainer: {
    paddingHorizontal: spacing[4},
    paddingVertical: spacing[5},
    alignItems: 'center',
  },
  versionText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.muted,
    marginBottom: spacing[1},
  },
  copyrightText: {
    fontSize: typography.caption.fontSize,
    color: semanticColors.text.muted,
  },
});

export default SettingsScreen;