import React, { useMemo, useState } from 'react';
import { BadgeCheck, Building2, CreditCard, Landmark, LockKeyhole, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { useStore } from '../store';

type PaymentType = 'credit_card' | 'debit_card' | 'bank_account';

const initialForm = {
  type: 'credit_card' as PaymentType,
  cardNumber: '',
  expiryDate: '',
  cvv: '',
  cardHolder: '',
  bankName: '',
  bankBranch: '',
  accountNumber: '',
  accountHolder: '',
  makeDefault: true
};

const maskCard = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 4 ? `**** **** **** ${digits.slice(-4)}` : '';
};

const maskAccount = (value: string) => {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 4 ? `******${digits.slice(-4)}` : '';
};

const detectCardBrand = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Thẻ ngân hàng';
};

const Payment = () => {
  const { user, paymentMethods, addPaymentMethod, setDefaultPaymentMethod, updatePaymentMethod } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const activeMethods = useMemo(() => paymentMethods.filter(method => method.isActive !== false), [paymentMethods]);

  const validateForm = () => {
    const nextErrors: Record<string, string> = {};
    const cardDigits = form.cardNumber.replace(/\D/g, '');
    const accountDigits = form.accountNumber.replace(/\D/g, '');

    if (form.type === 'credit_card' || form.type === 'debit_card') {
      if (!/^\d{16}$/.test(cardDigits)) nextErrors.cardNumber = 'Số thẻ cần đủ 16 chữ số';
      if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(form.expiryDate)) nextErrors.expiryDate = 'Nhập theo định dạng MM/YY';
      if (!/^\d{3,4}$/.test(form.cvv)) nextErrors.cvv = 'CVV cần 3-4 chữ số';
      if (form.cardHolder.trim().length < 3) nextErrors.cardHolder = 'Nhập tên chủ thẻ';
    }

    if (form.type === 'bank_account') {
      if (!form.bankName.trim()) nextErrors.bankName = 'Chọn hoặc nhập tên ngân hàng';
      if (!form.bankBranch.trim()) nextErrors.bankBranch = 'Nhập chi nhánh';
      if (!/^\d{6,20}$/.test(accountDigits)) nextErrors.accountNumber = 'Số tài khoản cần 6-20 chữ số';
      if (form.accountHolder.trim().length < 3) nextErrors.accountHolder = 'Nhập chủ tài khoản';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAddPaymentMethod = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || isSaving || !validateForm()) return;

    setIsSaving(true);
    const isCard = form.type === 'credit_card' || form.type === 'debit_card';
    const shouldBeDefault = form.makeDefault || activeMethods.length === 0;

    if (shouldBeDefault) {
      await Promise.all(activeMethods.map(method => updatePaymentMethod(method.id, { isDefault: false })));
    }

    await addPaymentMethod({
      userId: user.uid,
      type: form.type,
      provider: isCard ? detectCardBrand(form.cardNumber) : form.bankName.trim(),
      displayName: isCard ? `${detectCardBrand(form.cardNumber)} ${maskCard(form.cardNumber)}` : `${form.bankName.trim()} ${maskAccount(form.accountNumber)}`,
      last4: isCard ? form.cardNumber.replace(/\D/g, '').slice(-4) : form.accountNumber.replace(/\D/g, '').slice(-4),
      bankName: isCard ? undefined : form.bankName.trim(),
      bankBranch: isCard ? undefined : form.bankBranch.trim(),
      accountHolder: isCard ? form.cardHolder.trim() : form.accountHolder.trim(),
      accountNumberMasked: isCard ? maskCard(form.cardNumber) : maskAccount(form.accountNumber),
      isDefault: shouldBeDefault,
      isActive: true,
      verificationStatus: 'checked',
      verificationAmount: isCard ? undefined : 1000,
      refundAfterDays: isCard ? undefined : 14
    });

    setForm(initialForm);
    setShowAddForm(false);
    setIsSaving(false);
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultPaymentMethod(id);
  };

  const handleRemoveMethod = async (id: string) => {
    await updatePaymentMethod(id, { isActive: false, isDefault: false });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 md:p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-red-600" />
            Thiết lập thanh toán
          </h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý thẻ và tài khoản nhận thanh toán cho đơn hàng.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(current => !current)}
          className="shrink-0 inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700"
        >
          <Plus className="w-4 h-4" />
          Thêm
        </button>
      </div>

      <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 flex gap-2">
        <LockKeyhole className="w-4 h-4 mt-0.5 shrink-0" />
        <span>Thông tin thẻ được bảo vệ, hệ thống không lưu trữ dữ liệu thẻ.</span>
      </div>

      <div className="space-y-3">
        {activeMethods.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Chưa có phương thức thanh toán nào.
          </div>
        ) : (
          activeMethods.map(method => (
            <div key={method.id} className="rounded-lg border border-gray-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-red-50 p-2 text-red-600">
                    {method.type === 'bank_account' ? <Landmark className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{method.displayName || method.provider}</div>
                    <div className="text-sm text-gray-500">
                      {method.type === 'bank_account' ? `${method.bankBranch || 'Chi nhánh chưa cập nhật'} • ${method.accountHolder || 'Chưa có chủ TK'}` : `Chủ thẻ: ${method.accountHolder || 'Đã xác thực'}`}
                    </div>
                    {method.verificationAmount && (
                      <div className="mt-1 text-xs text-gray-500">
                        Giao dịch xác minh 1.000 VND sẽ được hoàn lại sau 14 ngày.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Đã kiểm tra
                  </span>
                  {method.verificationStatus === 'approved' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Đã duyệt
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Chờ duyệt</span>
                  )}
                  {method.isDefault ? (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">Mặc định</span>
                  ) : (
                    <button type="button" onClick={() => handleSetDefault(method.id)} className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200">
                      Đặt mặc định
                    </button>
                  )}
                  <button type="button" onClick={() => handleRemoveMethod(method.id)} className="rounded-md bg-gray-100 p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label="Xóa phương thức">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddPaymentMethod} className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Loại liên kết</label>
              <select
                value={form.type}
                onChange={event => setForm(current => ({ ...current, type: event.target.value as PaymentType }))}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2"
              >
                <option value="credit_card">Thẻ tín dụng</option>
                <option value="debit_card">Thẻ ghi nợ</option>
                <option value="bank_account">Tài khoản ngân hàng</option>
              </select>
            </div>

            {(form.type === 'credit_card' || form.type === 'debit_card') ? (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tên chủ thẻ</label>
                  <input value={form.cardHolder} onChange={event => setForm(current => ({ ...current, cardHolder: event.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="NGUYEN VAN A" />
                  {errors.cardHolder && <p className="mt-1 text-xs text-red-600">{errors.cardHolder}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Số thẻ</label>
                  <input value={form.cardNumber} onChange={event => setForm(current => ({ ...current, cardNumber: event.target.value.replace(/\D/g, '') }))} maxLength={16} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="16 chữ số" />
                  {errors.cardNumber && <p className="mt-1 text-xs text-red-600">{errors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Hết hạn</label>
                    <input value={form.expiryDate} onChange={event => setForm(current => ({ ...current, expiryDate: event.target.value.replace(/[^0-9/]/g, '') }))} maxLength={5} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="MM/YY" />
                    {errors.expiryDate && <p className="mt-1 text-xs text-red-600">{errors.expiryDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">CVV</label>
                    <input value={form.cvv} onChange={event => setForm(current => ({ ...current, cvv: event.target.value.replace(/\D/g, '') }))} maxLength={4} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="3-4 số" />
                    {errors.cvv && <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tên ngân hàng</label>
                  <input value={form.bankName} onChange={event => setForm(current => ({ ...current, bankName: event.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="VD: Vietcombank" />
                  {errors.bankName && <p className="mt-1 text-xs text-red-600">{errors.bankName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Chi nhánh</label>
                  <input value={form.bankBranch} onChange={event => setForm(current => ({ ...current, bankBranch: event.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Chi nhánh / PGD" />
                  {errors.bankBranch && <p className="mt-1 text-xs text-red-600">{errors.bankBranch}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Số tài khoản</label>
                  <input value={form.accountNumber} onChange={event => setForm(current => ({ ...current, accountNumber: event.target.value.replace(/\D/g, '') }))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Số tài khoản nhận tiền" />
                  {errors.accountNumber && <p className="mt-1 text-xs text-red-600">{errors.accountNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Chủ tài khoản</label>
                  <input value={form.accountHolder} onChange={event => setForm(current => ({ ...current, accountHolder: event.target.value }))} className="w-full rounded-md border border-gray-300 px-3 py-2" placeholder="Tên trên tài khoản" />
                  {errors.accountHolder && <p className="mt-1 text-xs text-red-600">{errors.accountHolder}</p>}
                </div>
              </>
            )}

            <label className="md:col-span-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <input type="checkbox" checked={form.makeDefault} onChange={event => setForm(current => ({ ...current, makeDefault: event.target.checked }))} className="rounded border-gray-300 text-red-600 focus:ring-red-500" />
              Đặt làm phương thức mặc định
            </label>
          </div>

          <button type="submit" disabled={isSaving} className="mt-4 w-full rounded-md bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
            {isSaving ? 'Đang lưu...' : 'Lưu phương thức thanh toán'}
          </button>
        </form>
      )}

      <div className="mt-5 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
        <div className="rounded-md bg-gray-50 p-3 flex gap-2">
          <Building2 className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
          Tài khoản ngân hàng cần giao dịch xác minh 1.000 VND.
        </div>
        <div className="rounded-md bg-gray-50 p-3 flex gap-2">
          <ShieldCheck className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
          Trạng thái duyệt dùng để khóa thanh toán khi có rủi ro.
        </div>
      </div>
    </div>
  );
};

export default Payment;
