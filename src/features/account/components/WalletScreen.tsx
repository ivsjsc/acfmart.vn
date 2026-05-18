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
  Loader2,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDateTime } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import {
  useCreateTopupIntent,
  useWallet,
  useWithdrawWallet,
  type WalletMethod,
  type WalletTransaction,
} from "../../../hooks/use-wallet"

const TXN_TYPE_META: Record<
  WalletTransaction["type"],
  { label: string; color: string; icon: typeof ArrowUpRight }
> = {
  topup: { label: "Nạp tiền", color: "text-emerald-600 bg-emerald-50", icon: ArrowDownRight },
  payment: { label: "Thanh toán", color: "text-rose-600 bg-rose-50", icon: ArrowUpRight },
  refund: { label: "Hoàn tiền", color: "text-blue-600 bg-blue-50", icon: ArrowDownRight },
  cashback: { label: "Hoàn xu", color: "text-brand-gold-600 bg-brand-gold-50", icon: ArrowDownRight },
  withdraw: { label: "Rút tiền", color: "text-violet-600 bg-violet-50", icon: ArrowUpRight },
  claim: { label: "Nhận thưởng", color: "text-emerald-600 bg-emerald-50", icon: ArrowDownRight },
}

export default function WalletScreen() {
  const [showTopup, setShowTopup] = useState(false)
  const walletQuery = useWallet()
  const topup = useCreateTopupIntent()
  const withdraw = useWithdrawWallet()
  const wallet = walletQuery.data?.wallet
  const balance = wallet?.balance ?? 0
  const lockedBalance = wallet?.locked_balance ?? 0
  const transactions = walletQuery.data?.transactions ?? []

  async function handleWithdraw() {
    const raw = window.prompt("Nhập số tiền cần rút")
    if (!raw) return
    const amount = Number(raw)
    if (!Number.isFinite(amount) || amount < 10000) {
      toast.error("Số tiền rút tối thiểu là 10.000đ")
      return
    }
    try {
      await withdraw.mutateAsync({ amount, method: "bank" })
      toast.success("Đã gửi yêu cầu rút tiền")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể rút tiền. Vui lòng thử lại sau."))
    }
  }

  return (
    <div className="space-y-5">
      {/* Balance card */}
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-brand-red-600 via-brand-red-500 to-brand-gold-500 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Wallet size={16} />
                <span>Ví mua sắm</span>
              </div>
              <div className="mt-1 text-xs text-white/70">Số dư khả dụng</div>
              <div className="mt-1 text-4xl font-extrabold">
                {formatCurrency(balance)}
              </div>
            </div>
            <div className="hidden text-right text-xs text-white/80 md:block">
              <div className="flex items-center gap-1">
                <Lock size={12} /> Đang tạm giữ
              </div>
              <div className="text-base font-bold">
                {formatCurrency(lockedBalance)}
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
            <button
              onClick={handleWithdraw}
              disabled={withdraw.isPending}
              className="rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold backdrop-blur transition-colors hover:bg-white/25 disabled:opacity-60"
            >
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
          {walletQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
              <Loader2 size={16} className="animate-spin" />
              Đang tải ví...
            </div>
          ) : walletQuery.isError ? (
            <div className="p-5 text-sm text-amber-700">
              Không thể tải ví. Vui lòng thử lại sau ít phút.
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wallet size={42} className="text-neutral-300" />
              <h3 className="mt-3 text-base font-bold text-neutral-900">
                Chưa có giao dịch ví
              </h3>
              <p className="mt-1 max-w-md text-sm text-neutral-500">
                Giao dịch nạp tiền, thanh toán, hoàn tiền và rút tiền sẽ hiển thị
                tại đây khi hệ thống ví phát sinh dữ liệu thật.
              </p>
            </div>
          ) : transactions.map((txn) => {
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

      {showTopup && (
        <TopupModal
          pending={topup.isPending}
          onClose={() => setShowTopup(false)}
          onSubmit={async (amount, method) => {
            try {
              await topup.mutateAsync({ amount, method })
              toast.success(`Đã tạo yêu cầu nạp tiền qua ${method.toUpperCase()}`)
              setShowTopup(false)
            } catch (err) {
              toast.error(sanitizeUserError(err, "Không thể nạp ví. Vui lòng thử lại sau."))
            }
          }}
        />
      )}
    </div>
  )
}

function TopupModal({
  pending,
  onClose,
  onSubmit,
}: {
  pending: boolean
  onClose: () => void
  onSubmit: (
    amount: number,
    method: Exclude<WalletMethod, "system">
  ) => Promise<void>
}) {
  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState<Exclude<WalletMethod, "system">>("momo")

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
              onSubmit(amount, method)
            }}
            disabled={pending}
            className="btn-primary flex-1 justify-center"
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            Nạp ngay
          </button>
        </div>
      </div>
    </div>
  )
}
