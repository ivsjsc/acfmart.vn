import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Wallet,
  TrendingUp,
  MousePointerClick,
  ShoppingBag,
  Link2,
  Copy,
  Pause,
  Play,
  Trash2,
  Plus,
  Download,
  ArrowDownToLine,
  Sparkles,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDateTime, formatRelativeTime } from "../../../lib/format"
import { cn } from "../../../lib/cn"
import { StatCard } from "./StatCard"
import {
  MOCK_AFFILIATE_LINKS,
  MOCK_AFFILIATE_STATS,
  MOCK_AFFILIATE_TRANSACTIONS,
  MOCK_AFFILIATE_PAYOUTS,
} from "../mock-data"
import type { AffiliateLink, AffiliateLinkStatus, AffiliateTxnStatus } from "../types"

const TAB_LIST = [
  { id: "overview", label: "Tổng quan" },
  { id: "links", label: "Link" },
  { id: "transactions", label: "Giao dịch" },
  { id: "payouts", label: "Rút tiền" },
] as const

type TabId = (typeof TAB_LIST)[number]["id"]

const LINK_STATUS_BADGE: Record<AffiliateLinkStatus, { label: string; color: string }> = {
  active: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700" },
  paused: { label: "Tạm dừng", color: "bg-neutral-100 text-neutral-700" },
  pending: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700" },
}

const TXN_STATUS_BADGE: Record<AffiliateTxnStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  completed: { label: "Thành công", color: "text-emerald-700", icon: CheckCircle2 },
  pending: { label: "Đang xử lý", color: "text-amber-700", icon: Clock },
  failed: { label: "Thất bại", color: "text-rose-700", icon: XCircle },
  rejected: { label: "Bị từ chối", color: "text-rose-700", icon: XCircle },
}

export default function AffiliateDashboardScreen() {
  const [tab, setTab] = useState<TabId>("overview")
  const [links, setLinks] = useState<AffiliateLink[]>(MOCK_AFFILIATE_LINKS)
  const [showCreate, setShowCreate] = useState(false)
  const [showPayout, setShowPayout] = useState(false)
  const stats = MOCK_AFFILIATE_STATS

  function copyLink(url: string) {
    navigator.clipboard.writeText(`https://${url}`)
    toast.success("Đã sao chép link")
  }

  function toggleLinkStatus(id: string) {
    setLinks((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              status: l.status === "active" ? "paused" : "active",
            }
          : l
      )
    )
    toast.success("Đã cập nhật trạng thái")
  }

  function deleteLink(id: string) {
    if (confirm("Xoá link affiliate này?")) {
      setLinks((prev) => prev.filter((l) => l.id !== id))
      toast.success("Đã xoá link")
    }
  }

  return (
    <div className="container-acf py-4 lg:py-6">
      {/* Header */}
      <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-red-600 via-brand-red-500 to-brand-gold-500 p-6 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand-gold-200" />
              <span className="text-xs font-medium uppercase tracking-wider text-white/80">
                Chương trình Affiliate
              </span>
            </div>
            <h1 className="mt-1 text-3xl font-extrabold lg:text-4xl">
              Kiếm tiền cùng hàng chính hãng
            </h1>
            <p className="mt-1 text-sm text-white/90">
              Chia sẻ link – nhận hoa hồng đến 15% mỗi đơn
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-xs text-white/80">Số dư khả dụng</div>
            <div className="text-3xl font-extrabold">
              {formatCurrency(stats.availableBalance)}
            </div>
            <button
              onClick={() => setShowPayout(true)}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-brand-red-600 shadow-md transition-transform hover:scale-105"
            >
              <ArrowDownToLine size={14} /> Rút tiền
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Tổng hoa hồng"
          value={formatCurrency(stats.totalEarned)}
          color="gold"
          trend={{ value: "12% so với tháng trước", positive: true }}
        />
        <StatCard
          icon={TrendingUp}
          label="Đang chờ ghi nhận"
          value={formatCurrency(stats.pendingCommission)}
          color="blue"
        />
        <StatCard
          icon={MousePointerClick}
          label="Lượt click"
          value={stats.totalClicks.toLocaleString("vi-VN")}
          color="red"
        />
        <StatCard
          icon={ShoppingBag}
          label="Tỷ lệ chuyển đổi"
          value={`${stats.conversionRate}%`}
          color="emerald"
          trend={{ value: `${stats.totalConversions} đơn`, positive: true }}
        />
      </div>

      {/* Tabs */}
      <div className="mb-4 flex overflow-x-auto border-b border-neutral-200">
        {TAB_LIST.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === t.id
                ? "border-brand-red-500 text-brand-red-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Top performing links */}
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900">
                  Link hiệu quả nhất
                </h2>
                <button
                  onClick={() => setTab("links")}
                  className="text-xs font-semibold text-brand-red-600 hover:underline"
                >
                  Xem tất cả →
                </button>
              </div>
              <div className="space-y-3">
                {links
                  .filter((l) => l.status === "active")
                  .sort((a, b) => b.totalCommission - a.totalCommission)
                  .slice(0, 3)
                  .map((link, i) => (
                    <div key={link.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                          i === 0
                            ? "bg-brand-gold-100 text-brand-gold-700"
                            : "bg-neutral-100 text-neutral-700"
                        )}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="line-clamp-1 text-sm font-semibold text-neutral-900">
                          {link.title}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {link.conversions} đơn · {link.clicks} clicks
                        </div>
                      </div>
                      <div className="text-sm font-bold text-brand-red-600">
                        {formatCurrency(link.totalCommission)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Recent transactions */}
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900">
                  Giao dịch gần đây
                </h2>
                <button
                  onClick={() => setTab("transactions")}
                  className="text-xs font-semibold text-brand-red-600 hover:underline"
                >
                  Xem tất cả →
                </button>
              </div>
              <div className="space-y-2">
                {MOCK_AFFILIATE_TRANSACTIONS.slice(0, 4).map((txn) => {
                  const sb = TXN_STATUS_BADGE[txn.status]
                  return (
                    <div key={txn.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="line-clamp-1 font-medium text-neutral-900">
                          {txn.description}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                          <sb.icon size={10} className={sb.color} />
                          <span className={sb.color}>{sb.label}</span>
                          <span>· {formatRelativeTime(txn.date)}</span>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "shrink-0 font-bold",
                          txn.amount > 0 ? "text-emerald-600" : "text-rose-600"
                        )}
                      >
                        {txn.amount > 0 ? "+" : ""}
                        {formatCurrency(txn.amount)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* CTA Banner */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand-gold-50 to-brand-red-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
                  <Sparkles size={18} className="text-brand-gold-500" />
                  Mẹo từ Aivy
                </h3>
                <p className="mt-1 text-sm text-neutral-700">
                  Tham gia Livestream của Shop để được tăng tỷ lệ hoa hồng lên 15% trong 24h.
                </p>
              </div>
              <Link to="/aivy" className="btn-primary">
                Hỏi Aivy
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Links tab */}
      {tab === "links" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Tổng <strong className="text-neutral-900">{links.length}</strong> link
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn-primary"
            >
              <Plus size={16} /> Tạo link mới
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 text-xs text-neutral-500">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium">Sản phẩm</th>
                    <th className="px-4 py-2.5 text-left font-medium">Short URL</th>
                    <th className="px-4 py-2.5 text-right font-medium">Clicks</th>
                    <th className="px-4 py-2.5 text-right font-medium">Đơn</th>
                    <th className="px-4 py-2.5 text-right font-medium">CR</th>
                    <th className="px-4 py-2.5 text-right font-medium">Hoa hồng</th>
                    <th className="px-4 py-2.5 text-center font-medium">Trạng thái</th>
                    <th className="px-4 py-2.5 text-right font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {links.map((link) => {
                    const sb = LINK_STATUS_BADGE[link.status]
                    return (
                      <tr key={link.id} className="hover:bg-neutral-50">
                        <td className="px-4 py-3 max-w-[200px]">
                          <Link
                            to={link.productId ? `/products/${link.productId}` : "#"}
                            className="line-clamp-1 font-medium text-neutral-900 hover:text-brand-red-600"
                          >
                            {link.title}
                          </Link>
                          <div className="text-[10px] text-neutral-500">
                            Tỉ lệ {link.commissionRate}%
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px]">
                              {link.shortUrl}
                            </code>
                            <button
                              onClick={() => copyLink(link.shortUrl)}
                              className="rounded p-0.5 text-neutral-400 hover:text-brand-red-600"
                              aria-label="Sao chép"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">{link.clicks.toLocaleString("vi-VN")}</td>
                        <td className="px-4 py-3 text-right">{link.conversions}</td>
                        <td className="px-4 py-3 text-right text-xs">
                          {link.conversionRate}%
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-brand-red-600">
                          {formatCurrency(link.totalCommission)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", sb.color)}>
                            {sb.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {link.status !== "pending" && (
                              <button
                                onClick={() => toggleLinkStatus(link.id)}
                                className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100"
                                title={link.status === "active" ? "Tạm dừng" : "Kích hoạt"}
                              >
                                {link.status === "active" ? <Pause size={14} /> : <Play size={14} />}
                              </button>
                            )}
                            <button
                              onClick={() => deleteLink(link.id)}
                              className="rounded p-1.5 text-neutral-500 hover:bg-rose-50 hover:text-rose-600"
                              title="Xoá"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions tab */}
      {tab === "transactions" && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <h2 className="text-base font-bold">Lịch sử giao dịch</h2>
            <button className="btn-secondary text-xs">
              <Download size={14} /> Xuất Excel
            </button>
          </div>
          <div className="divide-y divide-neutral-100">
            {MOCK_AFFILIATE_TRANSACTIONS.map((txn) => {
              const sb = TXN_STATUS_BADGE[txn.status]
              return (
                <div key={txn.id} className="flex items-center gap-4 p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      txn.type === "commission" && "bg-emerald-50 text-emerald-600",
                      txn.type === "bonus" && "bg-brand-gold-50 text-brand-gold-600",
                      txn.type === "payout" && "bg-blue-50 text-blue-600",
                      txn.type === "adjustment" && "bg-neutral-100 text-neutral-600"
                    )}
                  >
                    {txn.type === "commission" && <Wallet size={18} />}
                    {txn.type === "bonus" && <Sparkles size={18} />}
                    {txn.type === "payout" && <ArrowDownToLine size={18} />}
                    {txn.type === "adjustment" && <TrendingUp size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900">{txn.description}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-neutral-500">
                      <sb.icon size={11} className={sb.color} />
                      <span className={sb.color}>{sb.label}</span>
                      <span>·</span>
                      <span>{formatDateTime(txn.date)}</span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "shrink-0 text-lg font-bold",
                      txn.amount > 0 ? "text-emerald-600" : "text-rose-600"
                    )}
                  >
                    {txn.amount > 0 ? "+" : ""}
                    {formatCurrency(txn.amount)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Payouts tab */}
      {tab === "payouts" && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs text-neutral-500">Số dư khả dụng</div>
                <div className="text-3xl font-extrabold text-brand-red-600">
                  {formatCurrency(stats.availableBalance)}
                </div>
                <div className="text-xs text-neutral-500">
                  Đã rút: {formatCurrency(stats.totalPaid)}
                </div>
              </div>
              <button
                onClick={() => setShowPayout(true)}
                className="btn-primary"
              >
                <ArrowDownToLine size={16} /> Yêu cầu rút tiền
              </button>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              💡 Tối thiểu 500.000đ. Xử lý trong 1-2 ngày làm việc.
            </p>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-neutral-200 px-4 py-3 text-base font-bold">
              Lịch sử rút tiền
            </div>
            <div className="divide-y divide-neutral-100">
              {MOCK_AFFILIATE_PAYOUTS.map((po) => (
                <div key={po.id} className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <ArrowDownToLine size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-neutral-900">
                      {po.accountInfo}
                    </div>
                    <div className="text-xs text-neutral-500">
                      Yêu cầu: {formatDateTime(po.requestedAt)}
                      {po.processedAt && <> · Xử lý: {formatDateTime(po.processedAt)}</>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-neutral-900">
                      {formatCurrency(po.amount)}
                    </div>
                    <div className="text-[10px] font-semibold text-emerald-600">
                      ✓ Hoàn tất
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Link Modal */}
      {showCreate && (
        <CreateLinkModal onClose={() => setShowCreate(false)} />
      )}

      {/* Payout Modal */}
      {showPayout && (
        <PayoutModal
          balance={stats.availableBalance}
          onClose={() => setShowPayout(false)}
        />
      )}
    </div>
  )
}

function CreateLinkModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("")
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md animate-slide-up rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-neutral-900">Tạo link affiliate</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Dán URL sản phẩm hoặc shop, Aivy sẽ tạo link rút gọn kèm tracking.
        </p>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://san-chinh-hang.vn/products/..."
          className="input mt-4"
          autoFocus
        />
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Huỷ
          </button>
          <button
            onClick={() => {
              if (!url) {
                toast.error("Vui lòng dán URL")
                return
              }
              toast.success("Link đã được tạo (mock)")
              onClose()
            }}
            className="btn-primary flex-1 justify-center"
          >
            <Link2 size={14} /> Tạo link
          </button>
        </div>
      </div>
    </div>
  )
}

function PayoutModal({ balance, onClose }: { balance: number; onClose: () => void }) {
  const [amount, setAmount] = useState<number>(0)
  const [method, setMethod] = useState<"bank" | "momo" | "zalopay" | "wallet">("bank")

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md animate-slide-up rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-neutral-900">Yêu cầu rút tiền</h3>
        <div className="mt-3 rounded-lg bg-brand-red-50 p-3 text-sm">
          <div className="text-xs text-neutral-600">Số dư khả dụng</div>
          <div className="text-2xl font-extrabold text-brand-red-600">
            {formatCurrency(balance)}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-neutral-700">Số tiền</label>
          <input
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(Math.min(balance, Math.max(0, +e.target.value)))}
            placeholder="Tối thiểu 500.000đ"
            className="input mt-1"
            min={500000}
            max={balance}
          />
          <div className="mt-2 flex gap-2">
            {[500000, 1000000, balance].map((v) => (
              <button
                key={v}
                onClick={() => setAmount(v)}
                className="rounded-md border border-neutral-200 px-3 py-1 text-xs hover:border-brand-red-300"
              >
                {v === balance ? "Tất cả" : formatCurrency(v)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium text-neutral-700">Phương thức</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(
              [
                { id: "bank" as const, label: "Ngân hàng" },
                { id: "momo" as const, label: "Momo" },
                { id: "zalopay" as const, label: "ZaloPay" },
                { id: "wallet" as const, label: "Ví mua sắm" },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "rounded-lg border p-2 text-sm font-medium",
                  method === m.id
                    ? "border-brand-red-500 bg-brand-red-50 text-brand-red-700"
                    : "border-neutral-200 hover:border-brand-red-300"
                )}
              >
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
              if (amount < 500000) {
                toast.error("Số tiền tối thiểu là 500.000đ")
                return
              }
              toast.success("Yêu cầu rút tiền đã được gửi")
              onClose()
            }}
            className="btn-primary flex-1 justify-center"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}
