import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowDownToLine,
  Copy,
  Download,
  Link2,
  Loader2,
  MousePointerClick,
  Plus,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { formatCurrency, formatDateTime } from "../../../lib/format"
import { sanitizeUserError } from "../../../lib/error-utils"
import {
  useAffiliateAccount,
  useAffiliateLinks,
  useCreateAffiliateLink,
  useAffiliateTransactions,
  type AffiliateLink,
  type AffiliateTransaction,
} from "../../../hooks/use-affiliate-fs"
import { StatCard } from "./StatCard"

const TAB_LIST = [
  { id: "overview", label: "Tổng quan" },
  { id: "links", label: "Link" },
  { id: "transactions", label: "Giao dịch" },
  { id: "payouts", label: "Rút tiền" },
] as const

type TabId = (typeof TAB_LIST)[number]["id"]

const LINK_STATUS_BADGE: Record<AffiliateLink["status"], { label: string; color: string }> = {
  active: { label: "Hoạt động", color: "bg-emerald-100 text-emerald-700" },
  paused: { label: "Tạm dừng", color: "bg-neutral-100 text-neutral-700" },
  pending: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700" },
  expired: { label: "Hết hạn", color: "bg-rose-100 text-rose-700" },
}

export default function AffiliateDashboardScreen() {
  const [tab, setTab] = useState<TabId>("overview")
  const [showCreate, setShowCreate] = useState(false)
  const accountQuery = useAffiliateAccount()
  const linksQuery = useAffiliateLinks()
  const transactionsQuery = useAffiliateTransactions()
  const account = accountQuery.data?.account ?? null
  const links = linksQuery.data?.links ?? []
  const transactions = transactionsQuery.data?.transactions ?? []

  const stats = useMemo(() => {
    const totalClicks =
      account?.total_clicks ?? links.reduce((sum, link) => sum + link.clicks, 0)
    const totalConversions =
      account?.total_conversions ??
      links.reduce((sum, link) => sum + link.conversions, 0)
    const totalEarned =
      account?.lifetime_commission ??
      links.reduce((sum, link) => sum + link.total_commission, 0)
    const pendingCommission = account?.pending_commission ?? 0
    const paidCommission = account?.paid_commission ?? 0
    const availableBalance = Math.max(
      0,
      totalEarned - pendingCommission - paidCommission
    )
    const conversionRate =
      totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0

    return {
      totalClicks,
      totalConversions,
      totalEarned,
      pendingCommission,
      paidCommission,
      availableBalance,
      conversionRate,
    }
  }, [account, links])

  function affiliateUrl(link: AffiliateLink) {
    return `${window.location.origin}/aff/${link.short_code}`
  }

  async function copyLink(link: AffiliateLink) {
    await navigator.clipboard.writeText(affiliateUrl(link))
    toast.success("Đã sao chép link affiliate")
  }

  const loading = accountQuery.isLoading || linksQuery.isLoading
  const error =
    accountQuery.error instanceof Error
      ? accountQuery.error.message
      : linksQuery.error instanceof Error
        ? linksQuery.error.message
        : transactionsQuery.error instanceof Error
          ? transactionsQuery.error.message
          : null

  return (
    <div className="container-acf py-4 lg:py-6">
      <div className="mb-6 overflow-hidden rounded-lg bg-gradient-to-br from-brand-red-600 via-brand-red-500 to-brand-gold-500 p-6 text-white">
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
              Chia sẻ link sản phẩm đã duyệt và theo dõi hoa hồng thật.
            </p>
          </div>

          <div className="flex flex-col items-end">
            <div className="text-xs text-white/80">Số dư khả dụng</div>
            <div className="text-3xl font-extrabold">
              {formatCurrency(stats.availableBalance)}
            </div>
            <button
              onClick={() => toast("Rút tiền sẽ khả dụng khi backend payout được kết nối")}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-brand-red-600 shadow-md"
            >
              <ArrowDownToLine size={14} /> Rút tiền
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="card mb-5 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Không thể tải dữ liệu affiliate: {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={Wallet}
          label="Tổng hoa hồng"
          value={formatCurrency(stats.totalEarned)}
          color="gold"
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
          value={`${stats.conversionRate.toFixed(2)}%`}
          color="emerald"
          trend={{ value: `${stats.totalConversions} đơn`, positive: true }}
        />
      </div>

      <div className="mb-4 flex overflow-x-auto border-b border-neutral-200">
        {TAB_LIST.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === item.id
                ? "border-brand-red-500 text-brand-red-600"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card flex items-center justify-center gap-2 p-8 text-sm text-neutral-500">
          <Loader2 size={16} className="animate-spin" />
          Đang tải dữ liệu affiliate...
        </div>
      ) : tab === "overview" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">
                Link hiệu quả nhất
              </h2>
              <button
                onClick={() => setTab("links")}
                className="text-xs font-semibold text-brand-red-600 hover:underline"
              >
                Xem tất cả
              </button>
            </div>
            {links.length === 0 ? (
              <EmptyState
                title="Chưa có link affiliate"
                description="Tạo link từ sản phẩm hoặc shop thật để bắt đầu ghi nhận click và đơn hàng."
              />
            ) : (
              <div className="space-y-3">
                {[...links]
                  .sort((a, b) => b.total_commission - a.total_commission)
                  .slice(0, 3)
                  .map((link, index) => (
                    <div key={link.id} className="flex items-center gap-3 rounded-lg border border-neutral-100 p-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-gold-100 text-xs font-bold text-brand-gold-700">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm font-semibold text-neutral-900">
                          {link.title || link.target_url}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {link.conversions} đơn · {link.clicks} clicks
                        </div>
                      </div>
                      <div className="text-sm font-bold text-brand-red-600">
                        {formatCurrency(link.total_commission)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-base font-bold text-neutral-900">Trạng thái tài khoản</h2>
            {account ? (
              <div className="mt-4 grid gap-3 text-sm">
                <InfoRow label="Tên hiển thị" value={account.display_name} />
                <InfoRow label="Trạng thái" value={account.status} />
                <InfoRow label="Hạng" value={account.tier} />
                <InfoRow
                  label="Hoa hồng mặc định"
                  value={`${(account.default_commission_bps / 100).toFixed(2)}%`}
                />
              </div>
            ) : (
              <EmptyState
                title="Chưa có tài khoản affiliate"
                description="Khi tài khoản affiliate được backend cấp, thông tin trạng thái sẽ xuất hiện tại đây."
              />
            )}
          </div>
        </div>
      ) : tab === "links" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-600">
              Tổng <strong className="text-neutral-900">{links.length}</strong> link
            </p>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={16} /> Tạo link mới
            </button>
          </div>

          <div className="card overflow-hidden">
            {links.length === 0 ? (
              <EmptyState
                title="Chưa có link affiliate"
                description="Tạo link mới để theo dõi click, đơn hàng và hoa hồng thật."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-50 text-xs text-neutral-500">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium">Đích đến</th>
                      <th className="px-4 py-2.5 text-left font-medium">Short URL</th>
                      <th className="px-4 py-2.5 text-right font-medium">Clicks</th>
                      <th className="px-4 py-2.5 text-right font-medium">Đơn</th>
                      <th className="px-4 py-2.5 text-right font-medium">Hoa hồng</th>
                      <th className="px-4 py-2.5 text-center font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {links.map((link) => {
                      const badge = LINK_STATUS_BADGE[link.status]
                      return (
                        <tr key={link.id} className="hover:bg-neutral-50">
                          <td className="max-w-[260px] px-4 py-3">
                            <a
                              href={link.target_url}
                              className="line-clamp-1 font-medium text-neutral-900 hover:text-brand-red-600"
                            >
                              {link.title || link.target_url}
                            </a>
                            <div className="text-[10px] text-neutral-500">
                              Tạo lúc {formatDateTime(link.created_at)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px]">
                                {link.short_code}
                              </code>
                              <button
                                onClick={() => copyLink(link)}
                                className="rounded p-0.5 text-neutral-400 hover:text-brand-red-600"
                                aria-label="Sao chép"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {link.clicks.toLocaleString("vi-VN")}
                          </td>
                          <td className="px-4 py-3 text-right">{link.conversions}</td>
                          <td className="px-4 py-3 text-right font-bold text-brand-red-600">
                            {formatCurrency(link.total_commission)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-semibold", badge.color)}>
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : tab === "transactions" ? (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">Lịch sử giao dịch</h2>
            <button className="btn-secondary text-xs" disabled>
              <Download size={14} /> Xuất Excel
            </button>
          </div>
          {transactionsQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
              <Loader2 size={16} className="animate-spin" />
              Đang tải lịch sử giao dịch...
            </div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="Chưa có giao dịch affiliate"
              description="Giao dịch hoa hồng thật sẽ hiển thị khi đơn hàng được ghi nhận."
            />
          ) : (
            <div className="divide-y divide-neutral-100">
              {transactions.map((txn) => (
                <AffiliateTransactionRow key={txn.id} transaction={txn} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold">Rút tiền</h2>
            <button
              onClick={() => toast("Rút tiền sẽ khả dụng khi backend payout được kết nối")}
              className="btn-primary"
            >
              <ArrowDownToLine size={16} /> Yêu cầu rút tiền
            </button>
          </div>
          <EmptyState
            title="Chưa có lịch sử rút tiền"
            description="Yêu cầu rút tiền thật sẽ xuất hiện khi payout backend được kết nối."
          />
        </div>
      )}

      {showCreate && <CreateLinkModal onClose={() => setShowCreate(false)} />}

      <div className="mt-5 overflow-hidden rounded-lg bg-gradient-to-r from-brand-gold-50 to-brand-red-50 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
              <Sparkles size={18} className="text-brand-gold-500" />
              Gợi ý từ Aivy
            </h3>
            <p className="mt-1 text-sm text-neutral-700">
              Chọn sản phẩm đã duyệt để chia sẻ, tránh link không còn hoạt động.
            </p>
          </div>
          <Link to="/aivy" className="btn-primary">
            Hỏi Aivy
          </Link>
        </div>
      </div>
    </div>
  )
}

const TRANSACTION_STATUS_LABEL: Record<AffiliateTransaction["status"], string> = {
  pending: "Chờ xử lý",
  completed: "Hoàn tất",
  failed: "Thất bại",
  rejected: "Từ chối",
}

function AffiliateTransactionRow({
  transaction,
}: {
  transaction: AffiliateTransaction
}) {
  const positive = transaction.amount >= 0

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900">
            {transaction.description}
          </span>
          <span className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-600">
            {TRANSACTION_STATUS_LABEL[transaction.status]}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-neutral-500">
          {formatDateTime(transaction.date)}
          {transaction.order_code ? ` · ${transaction.order_code}` : ""}
        </div>
      </div>
      <div
        className={cn(
          "shrink-0 text-right text-sm font-bold",
          positive ? "text-emerald-600" : "text-rose-600"
        )}
      >
        {positive ? "+" : ""}
        {formatCurrency(transaction.amount)}
      </div>
    </div>
  )
}

function EmptyState({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <Link2 size={40} className="text-neutral-300" />
      <h3 className="mt-3 text-base font-bold text-neutral-900">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-neutral-500">{description}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-neutral-50 px-3 py-2">
      <span className="text-neutral-500">{label}</span>
      <span className="font-semibold text-neutral-900">{value}</span>
    </div>
  )
}

function CreateLinkModal({ onClose }: { onClose: () => void }) {
  const [url, setUrl] = useState("")
  const createLink = useCreateAffiliateLink()

  async function handleCreate() {
    if (!url.trim()) {
      toast.error("Vui lòng dán URL")
      return
    }
    try {
      await createLink.mutateAsync({
        target_url: url.trim(),
        target_type: url.includes("/products/") ? "product" : "home",
        title: url.trim(),
      })
      toast.success("Đã tạo link affiliate")
      onClose()
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể tạo link. Vui lòng thử lại sau."))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-md animate-slide-up rounded-lg bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-neutral-900">Tạo link affiliate</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Dán URL sản phẩm hoặc trang đích thật để backend tạo mã tracking.
        </p>
        <input
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://acfmart.store/products/..."
          className="input mt-4"
          autoFocus
        />
        <div className="mt-4 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Huỷ
          </button>
          <button
            onClick={handleCreate}
            disabled={createLink.isPending}
            className="btn-primary flex-1 justify-center"
          >
            {createLink.isPending ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
            Tạo link
          </button>
        </div>
      </div>
    </div>
  )
}
