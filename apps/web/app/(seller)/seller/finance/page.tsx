'use client';
import { useState } from 'react';
import { Wallet, Lock, TrendingDown, Percent, X, ArrowDownToLine } from 'lucide-react';

type TxTab = 'INCOME' | 'WITHDRAW' | 'ESCROW_RELEASE' | 'REFUND';

interface EscrowEntry {
  orderId: string;
  customer: string;
  amount: number;
  expectedDelivery: string;
  releaseDate: string;
}

interface Transaction {
  id: string;
  type: TxTab;
  description: string;
  amount: number;
  date: string;
}

const escrowEntries: EscrowEntry[] = [
  { orderId: 'ACF001234', customer: 'Nguyễn Văn An', amount: 7990000, expectedDelivery: '24/05/2026', releaseDate: '31/05/2026' },
  { orderId: 'ACF001235', customer: 'Trần Thị Bình', amount: 12490000, expectedDelivery: '25/05/2026', releaseDate: '01/06/2026' },
  { orderId: 'ACF001239', customer: 'Vũ Ngọc Phương', amount: 598000, expectedDelivery: '26/05/2026', releaseDate: '02/06/2026' },
  { orderId: 'ACF001240', customer: 'Đặng Thị Giang', amount: 7990000, expectedDelivery: '25/05/2026', releaseDate: '01/06/2026' },
  { orderId: 'ACF001241', customer: 'Bùi Thanh Hải', amount: 11990000, expectedDelivery: '27/05/2026', releaseDate: '03/06/2026' },
];

const transactions: Transaction[] = [
  { id: 'TX001', type: 'INCOME', description: 'Thu nhập đơn #ACF001237 — Kính Ray-Ban', amount: 2746000, date: '18/05/2026' },
  { id: 'TX002', type: 'ESCROW_RELEASE', description: 'Giải phóng escrow #ACF001230', amount: 3290000, date: '17/05/2026' },
  { id: 'TX003', type: 'WITHDRAW', description: 'Rút tiền về Vietcombank *1234', amount: -15000000, date: '16/05/2026' },
  { id: 'TX004', type: 'INCOME', description: 'Thu nhập đơn #ACF001229 — Kem Innisfree', amount: 427500, date: '15/05/2026' },
  { id: 'TX005', type: 'REFUND', description: 'Hoàn tiền đơn #ACF001228 — Khiếu nại', amount: -299000, date: '14/05/2026' },
  { id: 'TX006', type: 'ESCROW_RELEASE', description: 'Giải phóng escrow #ACF001225', amount: 11990000, date: '13/05/2026' },
  { id: 'TX007', type: 'INCOME', description: 'Thu nhập đơn #ACF001224 — Áo Uniqlo', amount: 284050, date: '12/05/2026' },
  { id: 'TX008', type: 'WITHDRAW', description: 'Rút tiền về Vietcombank *1234', amount: -8000000, date: '10/05/2026' },
];

const txConfig: Record<TxTab, { label: string; className: string }> = {
  INCOME:        { label: 'Thu nhập',        className: 'bg-green-100 text-green-700' },
  WITHDRAW:      { label: 'Rút tiền',        className: 'bg-blue-100 text-blue-700' },
  ESCROW_RELEASE:{ label: 'Escrow release',  className: 'bg-purple-100 text-purple-700' },
  REFUND:        { label: 'Hoàn trả',        className: 'bg-red-100 text-red-700' },
};

const txTabs: { key: TxTab; label: string }[] = [
  { key: 'INCOME', label: 'Thu nhập' },
  { key: 'WITHDRAW', label: 'Rút tiền' },
  { key: 'ESCROW_RELEASE', label: 'Escrow release' },
  { key: 'REFUND', label: 'Hoàn trả' },
];

const BANKS = ['Vietcombank', 'Techcombank', 'MB Bank', 'BIDV', 'Agribank', 'VPBank'];

export default function SellerFinancePage() {
  const [txTab, setTxTab] = useState<TxTab>('INCOME');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState('');

  const totalEscrow = escrowEntries.reduce((s, e) => s + e.amount, 0);
  const filteredTx = txTab ? transactions.filter(t => t.type === txTab) : transactions;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tài chính</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý doanh thu và rút tiền</p>
        </div>
        <button
          onClick={() => setShowWithdraw(true)}
          className="flex items-center gap-2 bg-[#E31937] hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          <ArrowDownToLine className="w-4 h-4" />
          Rút tiền
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Số dư khả dụng', value: '24.350.000đ', icon: <Wallet className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'Đang trong Escrow', value: `${(totalEscrow/1_000_000).toFixed(1)}M đ`, icon: <Lock className="w-5 h-5" />, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: 'Tổng đã rút', value: '135.200.000đ', icon: <TrendingDown className="w-5 h-5" />, color: 'text-purple-600', bg: 'bg-purple-100' },
          { label: 'Hoa hồng tháng 5', value: '2.180.000đ', icon: <Percent className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-100' },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{card.label}</p>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Escrow Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔒</span>
          <h2 className="text-base font-semibold text-blue-900">Tiền đang trong Escrow</h2>
          <span className="ml-auto text-lg font-bold text-blue-700">
            {totalEscrow.toLocaleString('vi-VN')}đ
          </span>
        </div>
        <p className="text-sm text-blue-700 mb-4">
          Số tiền này đang được ACFmart giữ an toàn. Sau khi khách hàng xác nhận nhận hàng (hoặc tối đa 7 ngày), tiền sẽ được tự động chuyển vào số dư khả dụng của bạn.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-blue-600 uppercase">
                <th className="pb-2 pr-4">Mã đơn</th>
                <th className="pb-2 pr-4">Khách hàng</th>
                <th className="pb-2 pr-4 text-right">Số tiền</th>
                <th className="pb-2 pr-4">Giao dự kiến</th>
                <th className="pb-2">Release dự kiến</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100">
              {escrowEntries.map(e => (
                <tr key={e.orderId} className="text-sm text-blue-800">
                  <td className="py-2 pr-4 font-mono font-medium">#{e.orderId}</td>
                  <td className="py-2 pr-4">{e.customer}</td>
                  <td className="py-2 pr-4 text-right font-semibold">{e.amount.toLocaleString('vi-VN')}đ</td>
                  <td className="py-2 pr-4">{e.expectedDelivery}</td>
                  <td className="py-2">{e.releaseDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Lịch sử giao dịch</h2>
          <div className="flex gap-2">
            {txTabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTxTab(t.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  txTab === t.key ? 'bg-[#E31937] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Mô tả</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Loại</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Số tiền</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Ngày</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTx.map(tx => (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-sm text-gray-700">{tx.description}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${txConfig[tx.type].className}`}>
                    {txConfig[tx.type].label}
                  </span>
                </td>
                <td className={`px-5 py-3 text-right text-sm font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('vi-VN')}đ
                </td>
                <td className="px-5 py-3 text-right text-sm text-gray-500">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTx.length === 0 && (
          <div className="py-10 text-center text-gray-400">Không có giao dịch nào</div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Rút tiền</h2>
              <button onClick={() => setShowWithdraw(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
                Số dư khả dụng: <span className="font-bold">24.350.000đ</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền muốn rút
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="Tối thiểu 100.000đ"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm pr-8 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">đ</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {['500000', '1000000', '5000000', '10000000'].map(v => (
                    <button key={v} onClick={() => setWithdrawAmount(v)}
                      className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                      {(Number(v)/1000).toFixed(0)}K
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng nhận</label>
                <select
                  value={selectedBank}
                  onChange={e => setSelectedBank(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Chọn ngân hàng</option>
                  {BANKS.map(b => <option key={b} value={b}>{b} **** 1234</option>)}
                </select>
              </div>
              <p className="text-xs text-gray-400">
                ⏱ Thời gian xử lý: 1–3 ngày làm việc. Phí rút: Miễn phí.
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  disabled={!withdrawAmount || !selectedBank}
                  onClick={() => setShowWithdraw(false)}
                  className="flex-1 py-2.5 bg-[#E31937] hover:bg-red-700 disabled:opacity-40 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Xác nhận rút tiền
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
