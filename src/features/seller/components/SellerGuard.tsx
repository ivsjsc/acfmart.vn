import { Navigate, useLocation } from "react-router-dom"
import { Loader2, ShieldAlert, Clock, XCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuthStore } from "../../../stores/auth-store"
import { useMyVendor } from "../../../hooks/use-vendor"
import { Logo } from "../../../components/Logo"

/**
 * Wrap SellerLayout. Checks:
 *   - User must be logged in (Firebase) → else redirect /login
 *   - User must have a vendor record → else redirect /seller-register
 *   - Vendor status must be "active" → else show appropriate screen
 *     (pending / rejected / suspended each get their own message)
 */
export function SellerGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data, isLoading, error } = useMyVendor()

  // Not logged in → login
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )
  }

  // Loading vendor lookup
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="flex items-center gap-2 text-neutral-600">
          <Loader2 size={20} className="animate-spin text-brand-red-500" />
          <span>Đang tải thông tin shop...</span>
        </div>
      </div>
    )
  }

  // No vendor record yet → register
  if (error || !data?.registered || !data.vendor) {
    return <Navigate to="/seller-register" replace />
  }

  const vendor = data.vendor

  // Pending review
  if (vendor.status === "pending") {
    return <VendorStatusScreen
      icon={Clock}
      iconColor="text-amber-500 bg-amber-50"
      title="Hồ sơ đang chờ duyệt"
      description={`Shop "${vendor.shop_name}" đang được Quỹ Chống Hàng Giả VN xem xét. Quá trình duyệt KYC thường mất 24-48 giờ làm việc. Aivy sẽ gửi email khi có kết quả.`}
    />
  }

  // Rejected
  if (vendor.status === "rejected") {
    return <VendorStatusScreen
      icon={XCircle}
      iconColor="text-rose-500 bg-rose-50"
      title="Đăng ký bị từ chối"
      description={
        vendor.rejected_reason ||
        "Hồ sơ của bạn chưa đạt yêu cầu. Vui lòng liên hệ tổng đài để biết thêm chi tiết."
      }
      showAppealButton
    />
  }

  // Suspended
  if (vendor.status === "suspended") {
    return <VendorStatusScreen
      icon={ShieldAlert}
      iconColor="text-rose-500 bg-rose-50"
      title="Shop đang bị tạm khoá"
      description="Shop của bạn đang bị tạm khoá. Vui lòng kiểm tra email để biết lý do và cách kháng nghị."
      showAppealButton
    />
  }

  // Active — show seller dashboard
  return <>{children}</>
}

function VendorStatusScreen({
  icon: Icon,
  iconColor,
  title,
  description,
  showAppealButton,
}: {
  icon: any
  iconColor: string
  title: string
  description: string
  showAppealButton?: boolean
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-red-50 via-white to-brand-gold-50 px-4 py-8">
      <div className="max-w-md w-full">
        <div className="mb-6 flex justify-center">
          <Link to="/"><Logo size="md" /></Link>
        </div>
        <div className="card overflow-hidden p-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${iconColor}`}>
            <Icon size={32} />
          </div>
          <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
          <p className="mt-2 text-sm text-neutral-600">{description}</p>

          <div className="mt-6 flex flex-col gap-2">
            <Link to="/" className="btn-primary justify-center">Về trang chủ</Link>
            {showAppealButton && (
              <Link to="/contact" className="btn-secondary justify-center">
                Gửi kháng nghị / Liên hệ CSKH
              </Link>
            )}
            <Link to="/aivy" className="text-xs text-neutral-500 hover:text-brand-red-600">
              💬 Hỏi Aivy về tình trạng đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
