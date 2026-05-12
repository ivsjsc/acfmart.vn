import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { CreditCard, Wallet, Smartphone, ShieldCheck, AlertTriangle, CheckCircle, X, Plus, Trash2, Eye, EyeOff, Clock, DollarSign, Lock, Store } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ExportReportButton from '../components/ExportReportButton';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'ewallet';
  name: string;
  number: string;
  isDefault: boolean;
  status: 'active' | 'pending' | 'inactive';
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  description: string;
  date: Date;
  escrowReleased?: boolean;
}

export function AccountSettings({ onClose }: { onClose: () => void }) {
  const { user, role, userProfile } = useStore();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'payment' | 'transactions' | 'verification'>('payment');
  const [loading, setLoading] = useState(true);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [verificationStatus, setVerificationStatus] = useState({
    emailVerified: false,
    identityVerified: false,
    businessVerified: false
  });
  
  // Load payment methods
  useEffect(() => {
    if (!user?.uid) return;
    
    const q = query(
      collection(db, 'userPaymentMethods'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const methods: PaymentMethod[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        methods.push({
          id: doc.id,
          type: data.type,
          name: data.displayName || `${data.type} ****${data.last4}`,
          number: `****${data.last4}`,
          isDefault: data.isDefault,
          status: data.isActive ? 'active' : 'inactive'
        });
      });
      setPaymentMethods(methods);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);
  
  // Load transactions
  useEffect(() => {
    if (!user?.uid) return;
    
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactionsData: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        transactionsData.push({
          id: doc.id,
          type: data.type,
          amount: data.amount,
          status: data.status,
          description: data.description,
          date: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          escrowReleased: data.escrowStatus === 'released'
        });
      });
      
      // Sort by date descending
      transactionsData.sort((a, b) => b.date.getTime() - a.date.getTime());
      setTransactions(transactionsData);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);
  
  // Load verification status
  useEffect(() => {
    if (!user?.uid) return;
    
    const loadVerificationStatus = async () => {
      setLoading(true);
      
      // Get user profile with verification info
      const profileDoc = await getDoc(doc(db, 'userProfiles', user.uid));
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        setVerificationStatus({
          emailVerified: user.emailVerified,
          identityVerified: profileData.identityVerified || false,
          businessVerified: profileData.businessVerified || false
        });
      }
      
      setLoading(false);
    };
    
    loadVerificationStatus();
  }, [user?.uid]);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: 'card' as 'card' | 'bank' | 'ewallet',
    name: '',
    number: '',
    holderName: '',
    expiryDate: ''
  });

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'bank': return <DollarSign className="w-4 h-4" />;
      case 'ewallet': return <Smartphone className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'pending': return 'Chờ duyệt';
      case 'inactive': return 'Không hoạt động';
      default: return 'Không xác định';
    }
  };

  const addPaymentMethod = () => {
    if (newPaymentMethod.name && newPaymentMethod.number) {
      // In a real implementation, this would call a cloud function
      // to securely add the payment method to Firestore
      alert("Chức năng thêm phương thức thanh toán sẽ được xử lý qua Cloud Function");
      setNewPaymentMethod({
        type: 'card',
        name: '',
        number: '',
        holderName: '',
        expiryDate: ''
      });
      setShowAddPayment(false);
    }
  };

  const deletePaymentMethod = (id: string) => {
    // In a real implementation, this would call a cloud function
    // to securely remove the payment method from Firestore
    alert(`Chức năng xóa phương thức thanh toán với ID: ${id} sẽ được xử lý qua Cloud Function`);
  };

  const setDefaultPayment = (id: string) => {
    // In a real implementation, this would call a cloud function
    // to securely update the default payment method in Firestore
    alert(`Chức năng đặt phương thức thanh toán mặc định với ID: ${id} sẽ được xử lý qua Cloud Function`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Cài đặt tài khoản</h2>
              <p className="opacity-80 mt-1">Quản lý phương thức thanh toán và thông tin tài khoản</p>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'payment' 
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Phương thức thanh toán
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'transactions' 
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Lịch sử giao dịch
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === 'verification' 
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 inline mr-2" />
            Xác thực tài khoản
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              {/* Escrow Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Bảo vệ thanh toán ACF</h4>
                    <p className="text-blue-800 text-sm mt-1">
                      Tiền của bạn được Sàn TMĐT ACF giữ an toàn. Tiền chỉ được chuyển cho Shop sau khi bạn xác nhận nhận hàng và không có khiếu nại trong vòng 7 ngày.
                    </p>
                  </div>
                </div>
              </div>

              {/* Add Payment Method */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Phương thức thanh toán</h3>
                <button
                  onClick={() => setShowAddPayment(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm phương thức
                </button>
              </div>

              {/* Payment Methods List */}
              <div className="space-y-3">
                {paymentMethods.length > 0 && paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getPaymentIcon(method.type)}
                        </div>
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.number}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(method.status)}`}>
                          {getStatusText(method.status)}
                        </span>
                        {method.isDefault && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                            Mặc định
                          </span>
                        )}
                        <div className="flex gap-1">
                          {!method.isDefault && (
                            <button
                              onClick={() => setDefaultPayment(method.id)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Đặt làm mặc định"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deletePaymentMethod(method.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Payment Form */}
              {showAddPayment && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-4">Thêm phương thức thanh toán mới</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={newPaymentMethod.type}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, type: e.target.value as any})}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="card">Thẻ tín dụng/ghi nợ</option>
                      <option value="bank">Tài khoản ngân hàng</option>
                      <option value="ewallet">Ví điện tử</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Tên phương thức"
                      value={newPaymentMethod.name}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, name: e.target.value})}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <input
                      type="text"
                      placeholder="Số tài khoản/thẻ"
                      value={newPaymentMethod.number}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, number: e.target.value})}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {(newPaymentMethod.type === 'card' || newPaymentMethod.type === 'bank') && (
                      <input
                        type="text"
                        placeholder="Tên chủ tài khoản"
                        value={newPaymentMethod.holderName}
                        onChange={(e) => setNewPaymentMethod({...newPaymentMethod, holderName: e.target.value})}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    )}
                    {newPaymentMethod.type === 'card' && (
                      <input
                        type="text"
                        placeholder="Ngày hết hạn (MM/YY)"
                        value={newPaymentMethod.expiryDate}
                        onChange={(e) => setNewPaymentMethod({...newPaymentMethod, expiryDate: e.target.value})}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={addPaymentMethod}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Thêm phương thức
                    </button>
                    <button
                      onClick={() => setShowAddPayment(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Lịch sử giao dịch</h3>
                <ExportReportButton />
              </div>

              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {transactions.filter(t => t.status === 'completed').length} Hoàn thành
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  {transactions.filter(t => t.status === 'pending').length} Chờ xử lý
                </span>
              </div>

              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'payment' ? 'bg-red-100' :
                          transaction.type === 'refund' ? 'bg-green-100' :
                          'bg-blue-100'
                        }`}>
                          {transaction.type === 'payment' && <DollarSign className="w-4 h-4 text-red-600" />}
                          {transaction.type === 'refund' && <DollarSign className="w-4 h-4 text-green-600" />}
                          {(transaction.type === 'deposit' || transaction.type === 'withdrawal') && <CreditCard className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-600">
                            {transaction.date.toLocaleDateString('vi-VN')} • {transaction.date.toLocaleTimeString('vi-VN')}
                          </p>
                          {transaction.type === 'payment' && !transaction.escrowReleased && (
                            <div className="flex items-center gap-1 mt-1">
                              <Lock className="w-3 h-3 text-orange-600" />
                              <span className="text-xs text-orange-600">Tiền đang được Sàn giữ</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'payment' ? 'text-red-600' :
                          transaction.type === 'refund' ? 'text-green-600' :
                          'text-blue-600'
                        }`}>
                          {transaction.type === 'payment' ? '-' : '+'}{transaction.amount.toLocaleString('vi-VN')} ₫
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Xác thực tài khoản</h3>
                <ExportReportButton />
              </div>
              
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Email đã xác thực</p>
                        <p className="text-sm text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      verificationStatus.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {verificationStatus.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </span>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Xác thực danh tính</p>
                        <p className="text-sm text-gray-600">Cần xác thực CCCD/CMND</p>
                      </div>
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                      Xác thực ngay
                    </button>
                  </div>
                </div>

                {role === 'shop' && (
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Store className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Giấy phép kinh doanh</p>
                          <p className="text-sm text-gray-600">Cần xác thực giấy phép kinh doanh</p>
                        </div>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors">
                        Tải lên giấy phép
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900">Lợi ích xác thực tài khoản</h4>
                    <ul className="text-blue-800 text-sm mt-2 space-y-1">
                      <li>• Tăng độ tin cậy với người mua/bán</li>
                      <li>• Giới hạn giao dịch cao hơn</li>
                      <li>• Ưu tiên giải quyết khiếu nại</li>
                      <li>• Bảo vệ tài khoản tốt hơn</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}