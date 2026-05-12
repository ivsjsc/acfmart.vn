import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, Platform } from 'react-native';
import { colors, semanticColors, spacing, typography, radius } from '../../../design-system/tokens';

interface Address {
  id: string;
  recipient: string;
  phone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  label: 'home' | 'work' | 'other';
}

const AddressManagementScreen: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      recipient: 'Nguyễn Văn A',
      phone: '0123 456 789',
      street: '123 Đường ABC',
      ward: 'Phường XYZ',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh',
      isDefault: true,
      label: 'home'
    },
    {
      id: '2',
      recipient: 'Nguyễn Văn A',
      phone: '0987 654 321',
      street: '456 Đường DEF',
      ward: 'Phường UVW',
      district: 'Quận 3',
      city: 'TP. Hồ Chí Minh',
      isDefault: false,
      label: 'work'
    },
    {
      id: '3',
      recipient: 'Nguyễn Văn A',
      phone: '0112 233 445',
      street: '789 Đường GHI',
      ward: 'Phường RST',
      district: 'Quận Phú Nhuận',
      city: 'TP. Hồ Chí Minh',
      isDefault: false,
      label: 'other'
    }
  ]);

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const deleteAddress = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
  };

  const setAsDefault = (id: string) => {
    setAddresses(
      addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }))
    );
  };

  const getLabel = (label: string) => {
    switch(label) {
      case 'home': return { text: 'Nhà', color: colors.success[500] };
      case 'work': return { text: 'Cơ quan', color: colors.info[500] };
      case 'other': return { text: 'Khác', color: colors.neutral[500] };
      default: return { text: 'Khác', color: colors.neutral[500] };
    }
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressHeader}>
        <View style={[styles.label, { backgroundColor: getLabel(item.label).color + '20' }]}>
          <Text style={[styles.labelText, { color: getLabel(item.label).color }]}>
            {getLabel(item.label).text}
          </Text>
        </View>
        {item.isDefault && (
          <View style={styles.defaultTag}>
            <Text style={styles.defaultTagText}>Mặc định</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.recipient}>
        {item.recipient} - {item.phone}
      </Text>
      
      <Text style={styles.address}>
        {item.street}, {item.ward}, {item.district}, {item.city}
      </Text>
      
      <View style={styles.addressActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => {
            setEditingAddress(item);
            setShowForm(true);
          }}
        >
          <Text style={styles.editButtonText}>Sửa</Text>
        </TouchableOpacity>
        
        {!item.isDefault && (
          <TouchableOpacity 
            style={styles.makeDefaultButton}
            onPress={() => setAsDefault(item.id)}
          >
            <Text style={styles.makeDefaultButtonText}>Đặt mặc định</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteAddress(item.id)}
        >
          <Text style={styles.deleteButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Quản lý địa chỉ</Text>
      
      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.addressesList}
      />
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          setEditingAddress(null);
          setShowForm(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Thêm địa chỉ mới</Text>
      </TouchableOpacity>
      
      {/* Form modal would go here in a real implementation */}
      {showForm && (
        <View style={styles.formOverlay}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
            </Text>
            
            <Text style={styles.formInstruction}>
              Vui lòng điền thông tin địa chỉ
            </Text>
            
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.saveButtonText}>Lưu địa chỉ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
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
  addressesList: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[10],
  },
  addressCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: radius.md,
    padding: spacing[4},
    marginBottom: spacing[3},
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
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2},
  },
  label: {
    paddingHorizontal: spacing[3},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
  },
  labelText: {
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
  },
  defaultTag: {
    backgroundColor: colors.brand.red[500],
    paddingHorizontal: spacing[2},
    paddingVertical: spacing[1},
    borderRadius: radius.full,
  },
  defaultTagText: {
    fontSize: typography.caption.fontSize,
    color: colors.neutral[50],
    fontWeight: '600',
  },
  recipient: {
    fontSize: typography.body.md.fontSize,
    fontWeight: '600',
    color: semanticColors.text.primary,
    marginBottom: spacing[1},
  },
  address: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    lineHeight: typography.body.md.lineHeight,
    marginBottom: spacing[3},
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: spacing[3},
    paddingVertical: spacing[2},
    borderRadius: radius.md,
    marginRight: spacing[2},
  },
  editButtonText: {
    color: semanticColors.text.primary,
    fontWeight: '600',
    fontSize: typography.body.sm.fontSize,
  },
  makeDefaultButton: {
    backgroundColor: colors.brand.red[100],
    paddingHorizontal: spacing[3},
    paddingVertical: spacing[2},
    borderRadius: radius.md,
    marginRight: spacing[2},
  },
  makeDefaultButtonText: {
    color: colors.brand.red[600],
    fontWeight: '600',
    fontSize: typography.body.sm.fontSize,
  },
  deleteButton: {
    backgroundColor: colors.danger[100],
    paddingHorizontal: spacing[3},
    paddingVertical: spacing[2},
    borderRadius: radius.md,
  },
  deleteButtonText: {
    color: colors.danger[600],
    fontWeight: '600',
    fontSize: typography.body.sm.fontSize,
  },
  addButton: {
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[4},
    margin: spacing[4},
    borderRadius: radius.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  formOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  formContainer: {
    backgroundColor: colors.neutral[50],
    width: '90%',
    padding: spacing[5},
    borderRadius: radius.lg,
  },
  formTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: 'bold',
    color: semanticColors.text.primary,
    marginBottom: spacing[2},
    textAlign: 'center',
  },
  formInstruction: {
    fontSize: typography.body.md.fontSize,
    color: semanticColors.text.secondary,
    marginBottom: spacing[4},
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.brand.red[500],
    paddingVertical: spacing[3},
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing[2},
  },
  saveButtonText: {
    color: colors.neutral[50],
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
  cancelButton: {
    backgroundColor: colors.neutral[200],
    paddingVertical: spacing[3},
    borderRadius: radius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: semanticColors.text.primary,
    fontWeight: '600',
    fontSize: typography.body.md.fontSize,
  },
});

export default AddressManagementScreen;