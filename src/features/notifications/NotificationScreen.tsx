import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  Bell,
  Mail,
  Package,
  Tag,
  Star,
  ShieldAlert,
  Gift,
  Users,
  Loader2,
  AlertTriangle,
  Wallet,
  LockKeyhole,
  MessageSquareText,
  BadgeCheck,
} from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "../../stores/auth-store"
import { useFirebaseAuthReady } from "../../hooks/use-firebase-auth-ready"
import { sanitizeUserError } from "../../lib/error-utils"
import {
  notificationService,
  type NotificationDoc,
  type NotificationType,
} from "../../lib/firestore-notification"

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  order_update: Package,
  shop_update: Tag,
  voucher: Gift,
  system: Bell,
  report_update: ShieldAlert,
  affiliate: Users,
  loyalty: Star,
  wallet: Wallet,
  privacy: LockKeyhole,
  support: MessageSquareText,
  kyc: BadgeCheck,
  vendor_registration: ShieldAlert,
  vendor_status_change: BadgeCheck,
}

const TYPE_TONE: Record<NotificationType, string> = {
  order_update: "text-emerald-600 bg-emerald-50",
  shop_update: "text-amber-600 bg-amber-50",
  voucher: "text-rose-600 bg-rose-50",
  system: "text-blue-600 bg-blue-50",
  report_update: "text-orange-600 bg-orange-50",
  affiliate: "text-purple-600 bg-purple-50",
  loyalty: "text-yellow-600 bg-yellow-50",
  wallet: "text-sky-600 bg-sky-50",
  privacy: "text-slate-600 bg-slate-100",
  support: "text-blue-600 bg-blue-50",
  kyc: "text-emerald-600 bg-emerald-50",
  vendor_registration: "text-orange-600 bg-orange-50",
  vendor_status_change: "text-emerald-600 bg-emerald-50",
}

function getNotificationIcon(type: NotificationType) {
  const Icon = TYPE_ICON[type] ?? Mail
  const tone = TYPE_TONE[type] ?? "text-neutral-500 bg-neutral-100"
  return (
    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
      <Icon className="h-5 w-5" />
    </div>
  )
}

function formatTimestamp(date: Date): string {
  const now = Date.now()
  const diff = now - date.getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return "Vừa xong"
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day} ngày trước`
  return date.toLocaleString("vi-VN")
}

export default function NotificationScreen() {
  const user = useAuthStore((s) => s.user)
  const authReady = useFirebaseAuthReady()
  const [notifications, setNotifications] = useState<NotificationDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  useEffect(() => {
    if (!authReady) return
    if (!user?.id) {
      setLoading(false)
      setNotifications([])
      return
    }
    setLoading(true)
    setError(null)
    let unsubscribe = () => {}
    try {
      unsubscribe = notificationService.subscribe(user.id, (next) => {
        setNotifications(next)
        setLoading(false)
      })
    } catch (err) {
      console.error("[NotificationScreen] subscribe failed:", err)
      setError(sanitizeUserError(err, "Không tải được thông báo."))
      setLoading(false)
    }
    return () => unsubscribe()
  }, [authReady, user?.id])

  const filtered = useMemo(
    () =>
      filter === "all" ? notifications : notifications.filter((n) => !n.read),
    [filter, notifications]
  )

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  )

  async function markAsRead(id: string) {
    try {
      await notificationService.markRead(id)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể đánh dấu đã đọc. Vui lòng thử lại sau."))
    }
  }

  async function markAllAsRead() {
    if (!user?.id || unreadCount === 0) return
    try {
      const count = await notificationService.markAllRead(user.id)
      if (count > 0) toast.success(`Đã đánh dấu ${count} thông báo đã đọc`)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không thể đánh dấu đã đọc. Vui lòng thử lại sau."))
    }
  }

  if (!user?.id) {
    return (
      <div className="container-acf py-12 text-center">
        <Bell className="mx-auto h-12 w-12 text-neutral-300" />
        <h2 className="mt-4 text-lg font-semibold text-neutral-900">
          Đăng nhập để xem thông báo
        </h2>
        <p className="mt-1 text-sm text-neutral-600">
          Thông báo đơn hàng, voucher và cảnh báo hàng giả chỉ hiển thị khi
          bạn đăng nhập tài khoản ACFMart.
        </p>
        <Link to="/login" className="btn-primary mt-4 inline-flex">
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="container-acf py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Thông báo</h1>
          <p className="text-sm text-neutral-600">
            {unreadCount > 0
              ? `Bạn có ${unreadCount} thông báo chưa đọc`
              : "Bạn đã đọc tất cả các thông báo"}
          </p>
        </div>
        <div className="mt-4 flex items-center gap-3 sm:mt-0">
          <div className="flex rounded-lg border border-neutral-200 bg-white p-1">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-md px-3 py-1.5 text-sm ${
                filter === "all"
                  ? "bg-brand-red-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              Tất cả ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`rounded-md px-3 py-1.5 text-sm ${
                filter === "unread"
                  ? "bg-brand-red-600 text-white"
                  : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>
          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Đánh dấu đã đọc tất cả
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-neutral-500">
          <Loader2 size={18} className="mr-2 animate-spin" /> Đang tải thông
          báo...
        </div>
      ) : error ? (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={18} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-rose-900">
              Không tải được thông báo
            </p>
            <p className="mt-1 text-xs text-rose-700">{error}</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <Bell className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900">
            Không có thông báo
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            {filter === "unread"
              ? "Bạn đã đọc tất cả các thông báo gần đây."
              : "Chưa có thông báo nào — chúng tôi sẽ thông báo khi có cập nhật mới."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const body = (
              <>
                <div className="flex items-start gap-3">
                  {getNotificationIcon(n.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-medium text-neutral-900">
                          {n.title}
                        </h3>
                        <p className="mt-1 text-sm text-neutral-600">
                          {n.body}
                        </p>
                        <p className="mt-2 text-xs text-neutral-500">
                          {formatTimestamp(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-brand-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )

            const cardClass = `block rounded-xl border p-4 transition-shadow hover:shadow-sm ${
              n.read
                ? "border-neutral-200 bg-white"
                : "border-brand-red-200 bg-brand-red-50"
            }`

            if (n.link) {
              return (
                <Link
                  key={n.id}
                  to={n.link}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id)
                  }}
                  className={cardClass}
                >
                  {body}
                </Link>
              )
            }

            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  if (!n.read) markAsRead(n.id)
                }}
                className={`${cardClass} w-full text-left`}
              >
                {body}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
