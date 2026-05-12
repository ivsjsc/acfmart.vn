import { useState } from "react"
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Lock,
  CreditCard,
  Smartphone,
  ShieldCheck,
  Download,
} from "lucide-react"
import toast from "react-hot-toast"
import {
  MOCK_WALLET_BALANCE,
  MOCK_WALLET_LOCKED,
  MOCK_WALLET_TRANSACTIONS,
  type MockWalletTransaction,
} from "../mock-data"
import { formatCurrency, formatDateTime } from "../../../lib/format"
import { cn } from "../../../lib/cn"

const TXN_TYPE_META: Record<
  MockWalletTransaction["type"],
  { label: string; color: string; icon: typeof ArrowUpRight }
> = {
  topup: { label: "Nạp tiền", color: "text-emerald-600 bg-emerald-50", icon: ArrowDownRight },
  payment: { label: "Thanh toán", color: "text-rose-600 bg-rose-50", icon: ArrowUpRight },
  refund: { label: "Hoàn tiền", color: "text-blue-600 bg-blue-50", icon: ArrowDownRight },
  cashback: { label: "Hoàn xu", color: "text-brand-gold-600 bg-brand-gold-50", icon: ArrowDownRight },
  withdraw: { label: "Rút tiền", color: "text-violet-600 bg-violet-50", icon: ArrowUpRight },
}

export default function WalletScreen() {
  const [showTopup, setShowTopup] = useState(false)

  return (
    <div className="space-y-5">
      {/* Balance card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-red-600 via-brand-red-500 to-brand-gold-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Wallet size={16} />
                <span>Ví ACFMart</span>
              </div>
              <div className="mt-1 text-xs text-white/70">Số dư khả dụng</div>
              <div className="mt-1 text-4xl font-extrabold">
                {formatCurrency(MOCK_WALLET_BALANCE)}
              </div>
            </div>
            <div className="hidden text-right text-xs text-white/80 md:block">
              <div className="flex items-center gap-1">
                <Lock size={12} /> Đang tạm giữ
              </div>
              <div className="text-base font-bold">
                {formatCurrency(MOCK_WALLET_LOCKED)}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <button
              onClick={() => setShowTopup(true)}
              className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25"
            >
              <Plus size={14} className="mx-auto mb-1" />
              Nạp tiền
            </button>
            <button className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25">
              <ArrowUpRight size={14} className="mx-auto mb-1" />
              Rút tiền
            </button>
            <button className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25">
              <ShieldCheck size={14} className="mx-auto mb-1" />
              Bảo mật
            </button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h2 className="text-base font-bold text-neutral-900">Lịch sử giao dịch</h2>
          <button className="btn-secondary text-xs">
            <Download size={14} /> Xuất sao kê
          </button>
        </div>
        <div className="divide-y divide-neutral-100">
          {MOCK_WALLET_TRANSACTIONS.map((txn) => {
            const meta = TXN_TYPE_META[txn.type]
            return (
              <div key={txn.id} className="flex items-center gap-3 p-4">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", meta.color)}>
                  <meta.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase text-neutral-500">
                      {meta.label}
                    </span>
                    {txn.status === "pending" && (
                      <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                        Đang xử lý
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-neutral-900">{txn.description}</div>
                  <div className="mt-0.5 text-[11px] text-neutral-500">
                    {formatDateTime(txn.date)}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={cn(
                      "text-base font-bold",
                      txn.amount > 0 ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {txn.amount > 0 ? "+" : ""}
                    {formatCurrency(txn.amount)}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    SD: {formatCurrency(txn.balance)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {showTopup && <TopupModal onClose={() => setShowTopup(false)} />}
    </div>
  )
}

function TopupModal({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState<"momo" | "zalopay" | "vnpay" | "bank">("momo")

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md animate-slide-up rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-neutral-900">Nạp tiền vào ví</h3>

        <div className="mt-4">
          <label className="text-sm font-medium text-neutral-700">Số tiền</label>
          <input
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(+e.target.value)}
            placeholder="Tối thiểu 50.000đ"
            className="input mt-1"
            min={50000}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[100000, 200000, 500000, 1000000].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className="rounded-md border border-neutral-200 px-3 py-1 text-xs hover:border-brand-red-300"
              >
                {formatCurrency(v)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-neutral-700">Phương thức</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(
              [
                { id: "momo" as const, label: "Momo", icon: Smartphone },
                { id: "zalopay" as const, label: "ZaloPay", icon: Smartphone },
                { id: "vnpay" as const, label: "VNPay", icon: CreditCard },
                { id: "bank" as const, label: "Chuyển khoản", icon: CreditCard },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors",
                  method === m.id
                    ? "border-brand-red-500 bg-brand-red-50 text-brand-red-700"
                    : "border-neutral-200 hover:border-brand-red-300"
                )}
              >
                <m.icon size={16} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Huỷ
          </button>
          <button
            onClick={() => {
              if (amount < 50000) {
                toast.error("Tối thiểu 50.000đ")
                return
              }
              toast.success(`Đang chuyển hướng tới ${method.toUpperCase()}...`)
              onClose()
            }}
            className="btn-primary flex-1 justify-center"
          >
            Nạp ngay
          </button>
        </div>
      </div>
    </div>
  )
}
