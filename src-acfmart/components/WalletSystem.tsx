import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, DollarSign, TrendingDown, TrendingUp, Plus, Minus, ExternalLink, Eye, EyeOff, X } from 'lucide-react';
import { useStore, PaymentMethod } from '../store';
import { paymentService } from '../services/paymentService';

interface WalletSystemProps {
  userId: string;
  onClose: () => void;
}

export function WalletSystem({ userId, onClose }: WalletSystemProps) {
  const { paymentMethods, addPaymentMethod } = useStore();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'deposit' | 'withdraw'>('overview');
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load wallet data
  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setIsLoading(true);
    try {
      const walletBalance = await paymentService.getUserWalletBalance(userId);
      setBalance(walletBalance.balance);
      
      // Mock transaction history
      const mockTransactions = [
        { id: 'tx1', type: 'deposit', amount: 500000, description: 'Nạp tiền từ thẻ Visa', date: new Date(Date.now() - 86400000), status: 'completed' },
        { id: 'tx2', type: 'escrow_hold', amount: 300000, description: 'Giữ tiền đơn hàng #ORD001', date: new Date(Date.now() - 172800000), status: 'completed' },
        { id: 'tx3', type: 'escrow_release', amount: 300000, description: 'Giải phóng tiền đơn #ORD001', date: new Date(Date.now() - 86400000), status: 'completed' },
        { id: 'tx4', type: 'deposit', amount: 200000, description: 'Nạp tiền từ MoMo', date: new Date(Date.now() - 259200000), status: 'completed' },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      setNotification({ type: 'error', message: 'Lỗi khi tải dữ liệu ví' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !selectedPaymentMethod) {
      setNotification({ type: 'error', message: 'Vui lòng chọn phương thức và nhập số tiền' });
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setNotification({ type: 'error', message: 'Số tiền không hợp lệ' });
      return;
    }

    try {
      const storePaymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethod);
      if (!storePaymentMethod) {
        setNotification({ type: 'error', message: 'Phương thức thanh toán không tồn tại' });
        return;
      }

      // Convert store PaymentMethod to paymentService PaymentMethod format
      const servicePaymentMethod = {
        id: storePaymentMethod.id,
        name: storePaymentMethod.provider || storePaymentMethod.displayName || storePaymentMethod.type,
        type: storePaymentMethod.type as any,
        logo: '',
        isActive: storePaymentMethod.isActive,
        config: {
          merchantId: '',
          merchantKey: '',
          endpoint: '',
          returnUrl: '',
          notifyUrl: '',
          fee: 0,
          dailyLimit: 0,
          minAmount: 0,
          maxAmount: 0
        }
      };

      await paymentService.depositToWallet(userId, amount, servicePaymentMethod);
      setNotification({ type: 'success', message: `Nạp tiền ${amount.toLocaleString('vi-VN')} VND thành công!` });
      setDepositAmount('');
      loadWalletData(); // Refresh data
    } catch (error) {
      console.error('Deposit error:', error);
      setNotification({ type: 'error', message: 'Lỗi khi nạp tiền' });
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !selectedBankAccount) {
      setNotification({ type: 'error', message: 'Vui lòng chọn tài khoản và nhập số tiền' });
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setNotification({ type: 'error', message: 'Số tiền không hợp lệ' });
      return;
    }

    if (balance !== null && amount > balance) {
      setNotification({ type: 'error', message: 'Số dư không đủ' });
      return;
    }

    try {
      await paymentService.withdrawFromWallet(userId, amount, selectedBankAccount);
      setNotification({ type: 'success', message: `Rút tiền ${amount.toLocaleString('vi-VN')} VND thành công!` });
      setWithdrawAmount('');
      loadWalletData(); // Refresh data
    } catch (error) {
      console.error('Withdraw error:', error);
      setNotification({ type: 'error', message: 'Lỗi khi rút tiền' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Wallet className="w-6 h-6 mr-2 text-blue-600" />
              Ví điện tử ACF
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Balance Overview */}
        <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm opacity-80">Số dư hiện tại</span>
            <button onClick={() => setIsBalanceVisible(!isBalanceVisible)}>
              {isBalanceVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex items-end">
            <h3 className="text-3xl font-bold mr-2">
              {isBalanceVisible ? (balance !== null ? formatCurrency(balance) : '***') : '••••••••'}
            </h3>
            <span className="text-sm opacity-80 mb-1">VND</span>
          </div>
          <p className="text-sm opacity-80 mt-2">Được bảo hộ bởi ACF Security</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {(['overview', 'history', 'deposit', 'withdraw'] as const).map(tab => (
            <button
              key={tab}
              className={`flex-1 py-3 text-center text-sm font-medium ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'overview' && 'Tổng quan'}
              {tab === 'history' && 'Lịch sử'}
              {tab === 'deposit' && 'Nạp tiền'}
              {tab === 'withdraw' && 'Rút tiền'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {notification && (
            <div className={`mb-4 p-3 rounded-lg ${
              notification.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {notification.message}
            </div>
          )}

          {activeTab === 'overview' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Tính năng ví điện tử</h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Bảo vệ giao dịch</p>
                    <p className="text-xs text-gray-600">Tiền được giữ an toàn trong ví Escrow</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium">Nạp/Rút nhanh chóng</p>
                    <p className="text-xs text-gray-600">Hỗ trợ nhiều phương thức thanh toán</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium">Liên kết thẻ ngân hàng</p>
                    <p className="text-xs text-gray-600">Tích hợp VNPay, MoMo, ZaloPay</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Lịch sử giao dịch</h3>
              <div className="space-y-3">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${
                        tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 
                        tx.type === 'withdrawal' ? 'bg-red-100 text-red-600' : 
                        tx.type === 'escrow_hold' ? 'bg-yellow-100 text-yellow-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {tx.type === 'deposit' ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium">{tx.description}</p>
                        <p className="text-xs text-gray-500">{tx.date.toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className={`text-right ${
                      tx.type === 'deposit' || tx.type === 'escrow_release' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <p className="font-bold">
                        {tx.type === 'deposit' || tx.type === 'escrow_release' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs">{tx.status === 'completed' ? 'Hoàn tất' : 'Đang xử lý'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Nạp tiền vào ví</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VND)</label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Nhập số tiền..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức nạp</label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn phương thức</option>
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.displayName || `${method.type} - ${method.provider}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handleDeposit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nạp tiền
                </button>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Rút tiền từ ví</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền (VND)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Nhập số tiền..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tài khoản nhận</label>
                  <select
                    value={selectedBankAccount}
                    onChange={(e) => setSelectedBankAccount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn tài khoản ngân hàng</option>
                    <option value="acc1">Vietcombank - 1234567890 (Nguyen Van A)</option>
                    <option value="acc2">Techcombank - 0987654321 (Nguyen Van A)</option>
                    <option value="acc3">Momo - 0123456789 (Nguyen Van A)</option>
                  </select>
                </div>
                
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Minus className="w-5 h-5 mr-2" />
                  Rút tiền
                </button>
                
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    <strong>Lưu ý:</strong> Rút tiền mất 1-2 ngày làm việc. Phí giao dịch: 11,000 VND/giao dịch.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            Ví điện tử được vận hành bởi ACF Payment Services - Đã được cấp phép bởi Ngân hàng Nhà nước Việt Nam
          </p>
        </div>
      </div>
    </div>
  );
}