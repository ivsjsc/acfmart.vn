import { Navigate, useLocation, useNavigate } from "react-router-dom"
import { Loader2, LogOut, ShieldAlert, Clock, XCircle } from "lucide-react"
import { Link } from "react-router-dom"
import toast from "react-hot-toast"
import { useAuthStore } from "../../../stores/auth-store"
import { useMyVendor } from "../../../hooks/use-vendor"
import { authService } from "../../../lib/auth-service"
import { Logo } from "../../../components/Logo"
import { useEffect } from "react"
import { LucideIcon } from "lucide-react"
import { getKycLevelLabel, getKycStatusMeta } from "../../../lib/kyc"

/**
 * Wrap SellerLayout. Checks:
 *   - User must be logged in (Firebase) → else redirect /login
 *   - User must have a vendor record → else redirect /seller-register
 *   - Vendor status must be "active" → else show appropriate screen
 *     (pending / rejected / suspended each get their own message)
 */
export function SellerGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data, isLoading, error } = useMyVendor()
  const vendorStatus = data?.vendor?.status
  const vendorKycStatus = data?.vendor?.kyc_status ?? "not_started"
  const isKycRoute = location.pathname.startsWith("/seller/kyc")

  async function handleLogout() {
    try {
      await authService.signOut()
      toast.success("Đã đăng xuất")
      navigate("/login/store", { replace: true })
    } catch (err) {
      toast.error("Không thể đăng xuất. Vui lòng thử lại.")
    }
  }

  useEffect(() => {
    if (vendorStatus === "active" && user?.role !== "seller") {
      updateUser({ role: "seller" })
    }
  }, [updateUser, user?.role, vendorStatus])

  // Not logged in → login
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login/store"
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

  if (error) {
    return <VendorStatusScreen
      icon={ShieldAlert}
      iconColor="text-amber-600 bg-amber-50"
      title="Chưa thể tải Seller Center"
      description="Tài khoản đã đăng nhập nhưng hệ thống chưa đọc được hồ sơ shop. Vui lòng thử lại sau ít phút hoặc liên hệ hỗ trợ nếu hồ sơ vừa được duyệt."
      showAppealButton
      onLogout={handleLogout}
      currentEmail={user.email}
    />
  }

  // No vendor record yet → register
  if (!data?.registered || !data.vendor) {
    return <Navigate to="/seller-register" replace />
  }

  const vendor = data.vendor
  const kycMeta = getKycStatusMeta(vendorKycStatus)

  // Pending review
  if (vendor.status === "pending") {
    if (isKycRoute) {
      return <>{children}</>
    }

    const pendingDescription =
      vendorKycStatus === "approved"
        ? `VNPT eKYC của shop "${vendor.shop_name}" đã hoàn tất. Hệ thống đang chờ duyệt hồ sơ và kích hoạt Seller Center.`
        : vendorKycStatus === "failed" || vendorKycStatus === "rejected"
        ? `Hồ sơ eKYC của shop "${vendor.shop_name}" chưa đạt. Vui lòng mở trang xác minh để tạo phiên mới.`
        : `Shop "${vendor.shop_name}" đang được Quỹ Chống Hàng Giả VN xem xét. Bạn có thể hoàn tất VNPT eKYC để rút ngắn thời gian xác minh.`

    return <VendorStatusScreen
      icon={Clock}
      iconColor="text-amber-500 bg-amber-50"
      title="Hồ sơ đang chờ duyệt"
      description={pendingDescription}
      statusPill={`${kycMeta.label} · ${getKycLevelLabel(vendor.kyc_level)}`}
      primaryAction={{
        label:
          vendorKycStatus === "approved"
            ? "Xem trạng thái VNPT eKYC"
            : vendorKycStatus === "failed" || vendorKycStatus === "rejected"
            ? "Thử lại VNPT eKYC"
            : "Tiếp tục VNPT eKYC",
        to: "/seller/kyc",
      }}
      onLogout={handleLogout}
      currentEmail={user.email}
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
      onLogout={handleLogout}
      currentEmail={user.email}
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
      onLogout={handleLogout}
      currentEmail={user.email}
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
  statusPill,
  primaryAction,
  showAppealButton,
  onLogout,
  currentEmail,
}: {
  icon: LucideIcon
  iconColor: string
  title: string
  description: string
  statusPill?: string
  primaryAction?: { label: string; to: string }
  showAppealButton?: boolean
  onLogout?: () => void
  currentEmail?: string
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
          {statusPill && (
            <div className="mt-3 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-700">
              {statusPill}
            </div>
          )}
          {currentEmail && (
            <p className="mt-3 text-xs text-neutral-400">
              Đang đăng nhập với{" "}
              <span className="font-mono">{currentEmail}</span>
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2">
            {primaryAction && (
              <Link to={primaryAction.to} className="btn-primary justify-center">
                {primaryAction.label}
              </Link>
            )}
            <Link to="/" className="btn-primary justify-center">Về trang chủ</Link>
            {showAppealButton && (
              <Link to="/contact" className="btn-secondary justify-center">
                Gửi kháng nghị / Liên hệ CSKH
              </Link>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <LogOut size={14} />
                Đăng xuất để dùng tài khoản khác
              </button>
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
