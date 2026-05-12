import { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface SettingsScreenProps {
  navigation?: any;
}

const SettingsScreen = ({ navigation }: SettingsScreenProps) => {
  const [darkMode, setDarkMode] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleAddressManagement = () => {
    Alert.alert('Quản lý địa chỉ', 'Chuyển đến trang quản lý địa chỉ');
    // navigation.navigate('AddressManagement');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Thông tin cá nhân</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Đổi mật khẩu</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Phương thức thanh toán</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleAddressManagement}>
          <Text style={styles.optionText}>Địa chỉ của tôi</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt ứng dụng</Text>
        <View style={styles.toggleOption}>
          <Text style={styles.optionText}>Chế độ tối</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: colors.neutral[300], true: colors.brand.red[500] }}
            thumbColor={darkMode ? colors.neutral[50] : colors.neutral[50]}
          />
        </View>
        <View style={styles.toggleOption}>
          <Text style={styles.optionText}>Chia sẻ vị trí</Text>
          <Switch
            value={locationSharing}
            onValueChange={setLocationSharing}
            trackColor={{ false: colors.neutral[300], true: colors.brand.red[500] }}
            thumbColor={locationSharing ? colors.neutral[50] : colors.neutral[50]}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông báo</Text>
        <View style={styles.toggleOption}>
          <Text style={styles.optionText}>Thông báo đơn hàng</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: colors.neutral[300], true: colors.brand.red[500] }}
            thumbColor={notificationsEnabled ? colors.neutral[50] : colors.neutral[50]}
          />
        </View>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Cài đặt chi tiết</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hỗ trợ</Text>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Trung tâm trợ giúp</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Liên hệ hỗ trợ</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Điều khoản sử dụng</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Chính sách bảo mật</Text>
          <Text style={styles.chevron}>›</Text>
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
  section: {
    backgroundColor: colors.neutral[50],
    marginHorizontal: spacing[4],
    marginBottom: spacing[4],
    borderRadius: radius.md,
    padding: spacing[3],
  },
  sectionTitle: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    color: semanticColors.text.muted,
    marginBottom: spacing[2],
    textTransform: 'uppercase',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  toggleOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: semanticColors.border.divider,
  },
  optionText: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
  },
  chevron: {
    fontSize: typography.h2.fontSize,
    color: semanticColors.text.muted,
  },
});

export default SettingsScreen;