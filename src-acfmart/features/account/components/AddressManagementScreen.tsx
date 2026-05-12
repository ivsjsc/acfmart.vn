import { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

const AddressManagementScreen = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', name: 'Nguyễn Văn A', phone: '0123456789', address: '123 Đường ABC, Quận XYZ, TP.HCM', isDefault: true },
    { id: '2', name: 'Nguyễn Văn B', phone: '0987654321', address: '456 Đường DEF, Quận UVW, TP.HCM', isDefault: false },
    { id: '3', name: 'Nguyễn Văn C', phone: '0321654987', address: '789 Đường GHI, Quận RST, TP.HCM', isDefault: false },
  ]);

  const toggleDefault = (id: string) => {
    setAddresses(
      addresses.map(address => ({
        ...address,
        isDefault: address.id === id
      }))
    );
  };

  const deleteAddress = (id: string) => {
    if (addresses.length <= 1) {
      Alert.alert('Không thể xóa', 'Bạn cần có ít nhất một địa chỉ');
      return;
    }
    setAddresses(addresses.filter(address => address.id !== id));
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={[styles.addressCard, item.isDefault && styles.defaultAddress]}>
      <View style={styles.addressHeader}>
        <Text style={styles.addressName}>{item.name}</Text>
        {item.isDefault && <Text style={styles.defaultBadge}>Mặc định</Text>}
      </View>
      <Text style={styles.addressPhone}>{item.phone}</Text>
      <Text style={styles.addressText}>{item.address}</Text>
      <View style={styles.addressActions}>
        <TouchableOpacity 
          style={[styles.actionButton, item.isDefault ? styles.disabledButton : styles.primaryButton]} 
          onPress={() => !item.isDefault && toggleDefault(item.id)}
          disabled={item.isDefault}
        >
          <Text style={[styles.actionText, item.isDefault ? styles.disabledText : styles.primaryText]}>
            {item.isDefault ? 'Địa chỉ chính' : 'Đặt làm chính'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => Alert.alert('Sửa địa chỉ', `Sửa địa chỉ cho ${item.name}`)}
        >
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={() => deleteAddress(item.id)}
        >
          <Text style={[styles.actionText, styles.deleteText]}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => Alert.alert('Thêm địa chỉ', 'Chuyển đến trang thêm địa chỉ')}
      >
        <Text style={styles.addButtonText}>+ Thêm địa chỉ mới</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: semanticColors.surface.base,
    paddingTop: spacing[6],
  },
  list: {
    paddingHorizontal: spacing[4],
  },
  addressCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: semanticColors.border.divider,
  },
  defaultAddress: {
    borderColor: colors.brand.red[500],
    backgroundColor: colors.brand.red[50],
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  addressName: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
  },
  defaultBadge: {
    backgroundColor: colors.brand.red[500],
    color: colors.neutral[50],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    fontSize: typography.caption.fontSize,
  },
  addressPhone: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.primary,
    marginBottom: spacing[2],
  },
  addressText: {
    fontSize: typography.body.sm.fontSize,
    color: semanticColors.text.secondary,
    marginBottom: spacing[3],
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: spacing[2],
    borderRadius: radius.md,
    minWidth: 80,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.brand.red[500],
  },
  disabledButton: {
    backgroundColor: colors.neutral[200],
  },
  deleteButton: {
    backgroundColor: colors.danger[500],
  },
  actionText: {
    fontSize: typography.body.sm.fontSize,
    textAlign: 'center',
  },
  primaryText: {
    color: colors.neutral[50],
  },
  disabledText: {
    color: colors.neutral[400],
  },
  deleteText: {
    color: colors.neutral[50],
  },
  addButton: {
    backgroundColor: colors.brand.red[500],
    padding: spacing[4],
    margin: spacing[4],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.neutral[50],
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
  },
});

export default AddressManagementScreen;