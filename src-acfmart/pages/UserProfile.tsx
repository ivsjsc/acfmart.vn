import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, User, Building2, Home, Navigation, Edit3, Save, X } from 'lucide-react';
import { useStore } from '../store';

interface DeliveryAddress {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  location: {
    lat: number;
    lng: number;
  };
}

const UserProfile: React.FC = () => {
  const { userProfile, updateUserProfile, addDeliveryAddress, updateDeliveryAddress, removeDeliveryAddress, setDefaultDeliveryAddress } = useStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [editingAddress, setEditingAddress] = useState<DeliveryAddress | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [tempLocation, setTempLocation] = useState({ lat: 0, lng: 0 });

  // Load profile data when component mounts
  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  const handleSaveProfile = async () => {
    if (profile) {
      await updateUserProfile(profile);
      setIsEditing(false);
    }
  };

  const handleAddAddress = () => {
    const newAddress: DeliveryAddress = {
      id: `new-${Date.now()}`,
      fullName: profile?.name || '',
      phone: profile?.phone || '',
      address: '',
      city: '',
      district: '',
      ward: '',
      isDefault: false,
      location: { lat: 21.028511, lng: 105.804817 },
    };
    setEditingAddress(newAddress);
    setShowMap(true);
  };

  const handleEditAddress = (address: DeliveryAddress) => {
    setEditingAddress(address);
    setTempLocation(address.location);
    setShowMap(true);
  };

  const handleDeleteAddress = async (id: string) => {
    await removeDeliveryAddress(id);
  };

  const handleSaveAddress = async () => {
    if (!editingAddress) return;

    if (editingAddress.id.startsWith('new')) {
      // Adding new address
      await addDeliveryAddress(editingAddress);
    } else {
      // Updating existing address
      await updateDeliveryAddress(editingAddress.id, editingAddress);
    }

    setEditingAddress(null);
    setShowMap(false);
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
    setShowMap(false);
  };

  const handleSetDefaultAddress = async (id: string) => {
    await setDefaultDeliveryAddress(id);
  };

  const handleMapPick = (lat: number, lng: number) => {
    setTempLocation({ lat, lng });
    if (editingAddress) {
      setEditingAddress({
        ...editingAddress,
        location: { lat, lng },
      });
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Hồ sơ người dùng</h1>
                <p className="opacity-80 mt-1">Quản lý thông tin cá nhân và địa chỉ giao hàng</p>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Profile Info Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Thông tin cá nhân</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4" /> Lưu
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4" /> Chỉnh sửa
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={`${profile.address}, ${profile.ward}, ${profile.district}, ${profile.city}`}
                      onChange={(e) => {
                        // Split the address for demonstration purposes
                        const parts = e.target.value.split(', ');
                        setProfile({
                          ...profile,
                          address: parts[0] || '',
                          ward: parts[1] || '',
                          district: parts[2] || '',
                          city: parts[3] || '',
                        });
                      }}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isEditing ? 'border-gray-300' : 'border-transparent bg-gray-50'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Addresses Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Địa chỉ giao hàng</h2>
                <button
                  onClick={handleAddAddress}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Home className="w-4 h-4" /> Thêm địa chỉ
                </button>
              </div>

              {profile.deliveryAddresses && profile.deliveryAddresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Chưa có địa chỉ giao hàng nào</p>
                  <button
                    onClick={handleAddAddress}
                    className="mt-3 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Thêm địa chỉ đầu tiên
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.deliveryAddresses?.map((address: DeliveryAddress) => (
                    <div
                      key={address.id}
                      className={`p-4 border rounded-lg ${
                        address.isDefault
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900">{address.fullName}</h3>
                            {address.isDefault && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mt-1 flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {address.phone}
                          </p>
                          <p className="text-gray-600 mt-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {address.address}, {address.ward}, {address.district}, {address.city}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!address.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.id)}
                              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                            >
                              Đặt mặc định
                            </button>
                          )}
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Editing Modal */}
      {editingAddress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingAddress.id.startsWith('new') ? 'Thêm địa chỉ mới' : 'Chỉnh sửa địa chỉ'}
                </h3>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={editingAddress.fullName}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editingAddress.phone}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ cụ thể
                </label>
                <input
                  type="text"
                  value={editingAddress.address}
                  onChange={(e) =>
                    setEditingAddress({ ...editingAddress, address: e.target.value })
                  }
                  placeholder="Số nhà, tên đường"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố
                  </label>
                  <select
                    value={editingAddress.city}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, city: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn tỉnh/thành</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện
                  </label>
                  <input
                    type="text"
                    value={editingAddress.district}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, district: e.target.value })
                    }
                    placeholder="Quận/Huyện"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã
                  </label>
                  <input
                    type="text"
                    value={editingAddress.ward}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, ward: e.target.value })
                    }
                    placeholder="Phường/Xã"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Vị trí trên bản đồ
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMap(!showMap)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <Navigation className="w-4 h-4" />
                    {showMap ? 'Ẩn bản đồ' : 'Chọn trên bản đồ'}
                  </button>
                </div>

                {showMap && (
                  <div className="border border-gray-300 rounded-lg h-64 bg-gray-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <Navigation className="w-12 h-12 text-blue-500 mx-auto mb-2" />
                        <p className="text-gray-600">Bản đồ sẽ hiển thị ở đây</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Vĩ độ: {tempLocation.lat.toFixed(6)}, Kinh độ: {tempLocation.lng.toFixed(6)}
                        </p>
                        <button
                          onClick={() => handleMapPick(tempLocation.lat, tempLocation.lng)}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                        >
                          Xác nhận vị trí
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveAddress}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lưu địa chỉ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;