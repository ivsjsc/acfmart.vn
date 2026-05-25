import { useEffect, useMemo, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import {
  User,
  Lock,
  Bell,
  Shield,
  Globe,
  Link2,
  Trash2,
  Loader2,
  Check,
  Camera,
  Download,
  Eye,
  FileText,
  Ban,
  RotateCcw,
  Database,
  Share2,
} from "lucide-react"
import toast from "react-hot-toast"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { useAuthStore } from "../../../stores/auth-store"
import { firestore } from "../../../lib/firebase"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useAccountProfile } from "../../../hooks/use-account-profile"
import { useLinkFacebookAccount, useLinkGoogleAccount } from "../../../hooks/use-auth"
import {
  authProviderLabel,
  normalizeAuthProviderId,
  profileSourceLabel,
  setPrimaryLinkedAccount,
} from "../../../lib/account-identity"
import { updateUserProfile } from "../../../lib/user-management-service"
import {
  buildPortableAccountData,
  createDataRightsRequest,
  DATA_PROTECTION_POLICY_VERSION,
  savePrivacySettings,
  subscribeDataRightsRequests,
  subscribePrivacySettings,
  type DataRightsRequest,
  type DataRightsRequestType,
  type PrivacySettingKey,
  type PrivacySettings,
} from "../../../lib/privacy-rights-service"
import AffiliateShowcaseSettingsSection from "./AffiliateShowcaseSettingsSection"

const SECTIONS = [
  { id: "profile", label: "Thông tin cá nhân", icon: User },
  { id: "account", label: "Tài khoản & liên kết", icon: Link2 },
  { id: "security", label: "Bảo mật", icon: Lock },
  { id: "notifications", label: "Thông báo", icon: Bell },
  { id: "privacy", label: "Quyền riêng tư", icon: Shield },
  { id: "affiliate", label: "Trang công khai", icon: Share2 },
  { id: "language", label: "Ngôn ngữ & vùng", icon: Globe },
  { id: "danger", label: "Vùng nguy hiểm", icon: Trash2 },
] as const

type SectionId = (typeof SECTIONS)[number]["id"]

function parseSectionId(value: string | null): SectionId | null {
  return SECTIONS.some((section) => section.id === value)
    ? (value as SectionId)
    : null
}

export default function SettingsScreen() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get("tab")
  const [section, setSection] = useState<SectionId>(
    parseSectionId(activeTab) ?? "profile"
  )

  useEffect(() => {
    const nextSection = parseSectionId(activeTab)
    if (nextSection) setSection(nextSection)
  }, [activeTab])

  function selectSection(nextSection: SectionId) {
    setSection(nextSection)
    setSearchParams(nextSection === "profile" ? {} : { tab: nextSection }, {
      replace: true,
    })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-neutral-900">Cài đặt</h1>

      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <nav className="card overflow-hidden">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => selectSection(s.id)}
              className={cn(
                "flex w-full items-center gap-3 border-b border-neutral-100 px-4 py-3 text-sm transition-colors last:border-0",
                section === s.id
                  ? "bg-brand-red-50 font-semibold text-brand-red-700"
                  : "text-neutral-700 hover:bg-neutral-50"
              )}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </nav>

        <div>
          {section === "profile" && <ProfileSection />}
          {section === "account" && <AccountConnectionsSection />}
          {section === "security" && <SecuritySection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "privacy" && (
            <PrivacySection onOpenProfile={() => selectSection("profile")} />
          )}
          {section === "affiliate" && <AffiliateShowcaseSettingsSection />}
          {section === "language" && <LanguageSection />}
          {section === "danger" && <DangerSection />}
        </div>
      </div>
    </div>
  )
}

function ProfileSection() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const { profile } = useAccountProfile()
  const [name, setName] = useState(profile?.name ?? user?.name ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? user?.phone ?? "")
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setName(profile?.name ?? user?.name ?? "")
    setPhone(profile?.phone ?? user?.phone ?? "")
    setBirthDate(profile?.birthDate ?? "")
  }, [profile?.name, profile?.phone, profile?.birthDate, user?.name, user?.phone])

  async function save() {
    if (!user?.id) return
    setLoading(true)
    try {
      const nextName = name.trim()
      const nextPhone = phone.trim()
      const nextBirthDate = birthDate.trim()
      const originalName = (profile?.name ?? user?.name ?? "").trim()
      const originalPhone = (profile?.phone ?? user?.phone ?? "").trim()
      const originalBirthDate = (profile?.birthDate ?? "").trim()
      const nextSources = {
        ...(profile?.profileSources ?? {}),
      }
      if (nextName && nextName !== originalName) {
        nextSources.name = "manual"
      }
      if (nextPhone !== originalPhone) {
        nextSources.phone = "manual"
      }
      if (nextBirthDate !== originalBirthDate) {
        nextSources.birthDate = "manual"
      }
      if (!nextSources.email) {
        nextSources.email = profile?.profileSources?.email ?? "system"
      }

      await updateUserProfile(
        user.id,
        {
          name: nextName,
          email: user.email,
          phone: nextPhone,
          birthDate: nextBirthDate || undefined,
          profileSources: nextSources,
        },
        {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      )
      updateUser({ name: nextName, phone: nextPhone || undefined })
      toast.success("Đã lưu thay đổi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không lưu được thay đổi")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-5">
      <h2 className="mb-4 text-base font-bold text-neutral-900">Thông tin cá nhân</h2>

      <div className="mb-5 flex items-center gap-4">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-red-500 to-brand-red-700 text-2xl font-bold text-white">
            {(name || "K")[0].toUpperCase()}
          </div>
          <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <div className="font-semibold">{user?.name ?? "Khách"}</div>
          <div className="text-xs text-neutral-500">{user?.email}</div>
          <div className="mt-2 grid gap-1 text-[11px] text-neutral-500 sm:grid-cols-2">
            <div>
              Nguồn tên: {profileSourceLabel(profile?.profileSources?.name ?? "system")}
            </div>
            <div>
              Nguồn ảnh: {profileSourceLabel(profile?.profileSources?.avatar ?? "system")}
            </div>
            <div>
              Nguồn SĐT: {profileSourceLabel(profile?.profileSources?.phone ?? "system")}
            </div>
            <div>
              Nguồn email: {profileSourceLabel(profile?.profileSources?.email ?? "system")}
            </div>
            <div>
              Nguồn ngày sinh: {profileSourceLabel(profile?.profileSources?.birthDate ?? "system")}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Họ và tên
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            type="email"
            value={user?.email ?? ""}
            className="input"
            disabled
          />
          <p className="mt-1 text-xs text-neutral-500">
            Liên hệ CSKH để đổi email
          </p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">
            Ngày sinh
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="input"
          />
        </div>
      </div>

      <button
        onClick={save}
        disabled={loading}
        className="btn-primary mt-5"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        Lưu thay đổi
      </button>
    </div>
  )
}

function AccountConnectionsSection() {
  const user = useAuthStore((s) => s.user)
  const { profile, loading, error } = useAccountProfile()
  const googleLink = useLinkGoogleAccount()
  const facebookLink = useLinkFacebookAccount()
  const [primarySaving, setPrimarySaving] = useState<string | null>(null)

  const linkedProviders = profile?.authProviders ?? []
  const primaryProvider =
    profile?.primaryAuthProvider ??
    profile?.authProvider ??
    linkedProviders.find((item) => item.isPrimary)?.rawProviderId ??
    linkedProviders.find((item) => item.isPrimary)?.providerId
  const normalizedPrimaryProvider = primaryProvider
    ? normalizeAuthProviderId(primaryProvider)
    : undefined
  const lastProvider =
    profile?.lastAuthProvider ?? profile?.authProvider ?? primaryProvider

  async function linkProvider(kind: "google" | "facebook") {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập trước khi liên kết tài khoản")
      return
    }
    try {
      if (kind === "google") {
        await googleLink.mutateAsync()
      } else {
        await facebookLink.mutateAsync()
      }
      toast.success(`Đã liên kết ${authProviderLabel(kind)}`)
    } catch (err) {
      toast.error(sanitizeUserError(err, `Không liên kết được ${authProviderLabel(kind)}`))
    }
  }

  async function setPrimary(providerId: string) {
    if (!user?.id || !profile) return
    setPrimarySaving(providerId)
    try {
      await updateDoc(doc(firestore, "users", user.id), {
        auth_provider: providerId,
        primary_auth_provider: providerId,
        auth_providers: setPrimaryLinkedAccount(profile.authProviders, providerId),
        updated_at: serverTimestamp(),
      })
      toast.success(`Đã đặt ${authProviderLabel(providerId)} làm nguồn chính`)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không cập nhật được nguồn chính"))
    } finally {
      setPrimarySaving(null)
    }
  }

  const providerSummary = [
    ["Đăng nhập gần nhất", authProviderLabel(lastProvider)],
    ["Nguồn chính", authProviderLabel(primaryProvider)],
    ["Liên kết", `${linkedProviders.length} phương thức`],
    ["Email xác thực", user?.isVerified ? "Đã xác thực" : "Chưa xác thực"],
  ]

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Tài khoản & liên kết</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Một hồ sơ người dùng có thể liên kết nhiều phương thức đăng nhập. Tên và ảnh đại diện ưu tiên từ nguồn đầu tiên, còn chỉnh sửa thủ công sẽ ghi đè.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => linkProvider("google")}
              disabled={googleLink.isPending || linkedProviders.some((item) => item.providerId === "google")}
              className="btn-secondary"
            >
              {googleLink.isPending ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
              {linkedProviders.some((item) => item.providerId === "google") ? "Đã liên kết Google" : "Thêm Google"}
            </button>
            <button
              onClick={() => linkProvider("facebook")}
              disabled={facebookLink.isPending || linkedProviders.some((item) => item.providerId === "facebook")}
              className="btn-secondary"
            >
              {facebookLink.isPending ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
              {linkedProviders.some((item) => item.providerId === "facebook") ? "Đã liên kết Facebook" : "Thêm Facebook"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {providerSummary.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
              <div className="mt-1 text-sm font-semibold text-neutral-900">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-neutral-900">Thông tin liên kết</h3>
          {error && (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error.message}
            </div>
          )}
          <div className="mt-3 space-y-3">
            {loading && (
              <div className="rounded-lg border border-dashed border-neutral-200 px-4 py-4 text-sm text-neutral-500">
                Đang tải hồ sơ liên kết...
              </div>
            )}
            {!loading && linkedProviders.length === 0 && (
              <div className="rounded-lg border border-dashed border-neutral-200 px-4 py-4 text-sm text-neutral-500">
                Chưa có phương thức liên kết bổ sung.
              </div>
            )}
            {linkedProviders.map((identity) => {
              const providerName = authProviderLabel(identity.rawProviderId ?? identity.providerId)
              const isPrimary = Boolean(normalizedPrimaryProvider) && identity.providerId === normalizedPrimaryProvider
              return (
                <div key={identity.providerId} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-neutral-900">{providerName}</div>
                        {isPrimary && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                            Nguồn chính
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm text-neutral-600">
                        {identity.email || identity.phoneNumber || "Chưa có email/điện thoại từ provider này"}
                      </div>
                      <div className="mt-2 grid gap-1 text-xs text-neutral-500 sm:grid-cols-2">
                        <div>Email xác thực: {identity.emailVerified ? "Đã xác thực" : "Chưa xác thực"}</div>
                        <div>SĐT xác thực: {identity.phoneVerified ? "Đã xác thực" : "Chưa xác thực"}</div>
                        <div>Liên kết: {formatTimestamp(identity.linkedAt as { toDate?: () => Date } | undefined)}</div>
                        <div>Đăng nhập gần nhất: {formatTimestamp(identity.lastLoginAt as { toDate?: () => Date } | undefined)}</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {!isPrimary && (
                        <button
                          onClick={() => setPrimary(identity.providerId)}
                          disabled={primarySaving === identity.providerId}
                          className="btn-secondary"
                        >
                          {primarySaving === identity.providerId ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          Đặt làm nguồn chính
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="text-base font-bold text-neutral-900">Nguồn dữ liệu hồ sơ</h3>
        <p className="mt-1 text-sm text-neutral-600">
          Trường nào đã sửa tay sẽ ưu tiên giá trị thủ công. Các nguồn khác chỉ bổ sung dữ liệu còn thiếu.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {[
            ["Tên", profileSourceLabel(profile?.profileSources?.name ?? "system")],
            ["Ảnh đại diện", profileSourceLabel(profile?.profileSources?.avatar ?? "system")],
            ["Số điện thoại", profileSourceLabel(profile?.profileSources?.phone ?? "system")],
            ["Email", profileSourceLabel(profile?.profileSources?.email ?? "system")],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
              <div className="mt-1 text-sm font-semibold text-neutral-900">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SecuritySection() {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="mb-3 text-base font-bold">Đổi mật khẩu</h2>
        <div className="space-y-3">
          <input type="password" placeholder="Mật khẩu hiện tại" className="input" />
          <input type="password" placeholder="Mật khẩu mới" className="input" />
          <input type="password" placeholder="Xác nhận mật khẩu mới" className="input" />
          <button className="btn-primary">Cập nhật mật khẩu</button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-base font-bold">Xác thực 2 bước</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Xác thực qua SMS</div>
            <div className="text-xs text-neutral-500">
              Tăng cường bảo mật khi đăng nhập
            </div>
          </div>
          <Toggle />
        </div>
      </div>
    </div>
  )
}

function NotificationsSection() {
  const items = [
    { label: "Đơn hàng & vận chuyển", desc: "Cập nhật trạng thái đơn", default: true },
    { label: "Khuyến mãi & voucher", desc: "Săn deal độc quyền", default: true },
    { label: "Tin từ Aivy", desc: "Gợi ý sản phẩm phù hợp", default: true },
    { label: "Tin từ shop yêu thích", desc: "Khi shop có sản phẩm/livestream mới", default: false },
    { label: "Báo cáo hàng giả", desc: "Khi báo cáo của bạn có cập nhật", default: true },
  ]
  return (
    <div className="card p-5">
      <h2 className="mb-4 text-base font-bold">Cài đặt thông báo</h2>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-medium">{it.label}</div>
              <div className="text-xs text-neutral-500">{it.desc}</div>
            </div>
            <Toggle defaultChecked={it.default} />
          </div>
        ))}
      </div>
    </div>
  )
}

const PRIVACY_CONTROLS: Array<{
  key: PrivacySettingKey
  label: string
  desc: string
}> = [
  {
    key: "public_reviews",
    label: "Hiển thị đánh giá công khai",
    desc: "Người khác có thể thấy review đã được duyệt của bạn.",
  },
  {
    key: "aivy_personalization",
    label: "Cá nhân hoá gợi ý từ Aivy",
    desc: "Dùng lịch sử tương tác để gợi ý sản phẩm và hỗ trợ phù hợp hơn.",
  },
  {
    key: "analytics_cookies",
    label: "Cookie phân tích",
    desc: "Giúp ACFMart đo lường hiệu năng và cải thiện trải nghiệm.",
  },
  {
    key: "marketing_cookies",
    label: "Cookie tiếp thị",
    desc: "Dùng cho ưu đãi và nội dung quảng cáo cá nhân hoá.",
  },
  {
    key: "marketing_messages",
    label: "Nhận thông tin tiếp thị",
    desc: "Cho phép gửi voucher, khuyến mãi qua email, SMS hoặc Zalo OA.",
  },
  {
    key: "profiling_opt_out",
    label: "Từ chối profiling/tự động hoá",
    desc: "Không dùng dữ liệu của bạn cho phân loại hành vi ngoài dịch vụ cốt lõi.",
  },
  {
    key: "cross_border_sharing",
    label: "Chia sẻ dữ liệu xuyên biên giới",
    desc: "Chỉ bật khi bạn đồng ý cho xử lý bởi đối tác ngoài Việt Nam.",
  },
]

const REQUEST_LABELS: Record<DataRightsRequestType, string> = {
  access: "Truy cập dữ liệu",
  rectification: "Chỉnh sửa dữ liệu",
  erasure: "Xoá dữ liệu",
  portability: "Di chuyển dữ liệu",
  restriction: "Hạn chế xử lý",
  objection: "Phản đối xử lý",
  withdraw_consent: "Rút lại đồng ý",
}

const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: "Đang chờ",
  reviewing: "Đang xử lý",
  completed: "Hoàn tất",
  rejected: "Từ chối",
  cancelled: "Đã huỷ",
}

function formatTimestamp(value?: { toDate?: () => Date } | null): string {
  if (!value?.toDate) return "Chưa có"
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value.toDate())
}

function statusClass(status: DataRightsRequest["status"]) {
  if (status === "completed") return "bg-emerald-50 text-emerald-700"
  if (status === "rejected") return "bg-rose-50 text-rose-700"
  if (status === "reviewing") return "bg-blue-50 text-blue-700"
  if (status === "cancelled") return "bg-neutral-100 text-neutral-600"
  return "bg-amber-50 text-amber-700"
}

function PrivacySection({ onOpenProfile }: { onOpenProfile: () => void }) {
  const user = useAuthStore((s) => s.user)
  const [settings, setSettings] = useState<PrivacySettings | null>(null)
  const [requests, setRequests] = useState<DataRightsRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState<PrivacySettingKey | null>(null)
  const [submitting, setSubmitting] = useState<DataRightsRequestType | null>(null)
  const [showDataSummary, setShowDataSummary] = useState(false)

  useEffect(() => {
    if (!user?.id) {
      setSettings(null)
      setRequests([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubSettings = subscribePrivacySettings(
      user.id,
      (nextSettings) => {
        setSettings(nextSettings)
        setLoading(false)
      },
      (err) => {
        console.error("[privacy] settings subscription failed", err)
        setLoading(false)
        toast.error("Không tải được cài đặt quyền riêng tư")
      }
    )
    const unsubRequests = subscribeDataRightsRequests(
      user.id,
      setRequests,
      (err) => {
        console.error("[privacy] data rights subscription failed", err)
        toast.error("Không tải được lịch sử yêu cầu dữ liệu")
      }
    )

    return () => {
      unsubSettings()
      unsubRequests()
    }
  }, [user?.id])

  const accountSummary = useMemo(
    () => [
      ["Mã tài khoản", user?.id ?? "Chưa đăng nhập"],
      ["Họ tên", user?.name ?? "Chưa cập nhật"],
      ["Email", user?.email ?? "Chưa cập nhật"],
      ["Số điện thoại", user?.phone ?? "Chưa cập nhật"],
      ["Vai trò", user?.role ?? "customer"],
      ["Phiên bản chính sách", DATA_PROTECTION_POLICY_VERSION],
    ],
    [user]
  )

  async function handleToggle(key: PrivacySettingKey, nextValue: boolean) {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để cập nhật quyền riêng tư")
      return
    }
    setSavingKey(key)
    setSettings((current) =>
      current ? { ...current, [key]: nextValue } : current
    )
    try {
      await savePrivacySettings(user.id, { [key]: nextValue })
      toast.success("Đã lưu lựa chọn quyền riêng tư")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không lưu được thay đổi. Vui lòng thử lại sau."))
    } finally {
      setSavingKey(null)
    }
  }

  async function submitRequest(type: DataRightsRequestType, description: string) {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để gửi yêu cầu")
      return
    }
    setSubmitting(type)
    try {
      await createDataRightsRequest({
        userId: user.id,
        type,
        contactEmail: user.email,
        description,
      })
      toast.success("Đã ghi nhận yêu cầu. ACFMart sẽ xử lý trong 15 ngày làm việc.")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không gửi được yêu cầu. Vui lòng thử lại sau."))
    } finally {
      setSubmitting(null)
    }
  }

  async function handleWithdrawConsent() {
    if (!user?.id) return
    const patch = {
      aivy_personalization: false,
      analytics_cookies: false,
      marketing_cookies: false,
      marketing_messages: false,
      cross_border_sharing: false,
      profiling_opt_out: true,
    }
    setSubmitting("withdraw_consent")
    setSettings((current) => (current ? { ...current, ...patch } : current))
    try {
      await savePrivacySettings(user.id, patch)
      await createDataRightsRequest({
        userId: user.id,
        type: "withdraw_consent",
        contactEmail: user.email,
        description:
          "Nguoi dung rut lai dong y cho cac muc dich khong thiet yeu: tiep thi, phan tich, ca nhan hoa Aivy va chia se xuyen bien gioi.",
      })
      toast.success("Đã rút lại các đồng ý không thiết yếu")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không rút lại được đồng ý. Vui lòng thử lại sau."))
    } finally {
      setSubmitting(null)
    }
  }

  async function handleObjection() {
    if (!user?.id) return
    setSubmitting("objection")
    setSettings((current) =>
      current ? { ...current, profiling_opt_out: true } : current
    )
    try {
      await savePrivacySettings(user.id, { profiling_opt_out: true })
      await createDataRightsRequest({
        userId: user.id,
        type: "objection",
        contactEmail: user.email,
        description:
          "Nguoi dung phan doi profiling va xu ly tu dong ngoai dich vu cot loi.",
      })
      toast.success("Đã ghi nhận phản đối profiling")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không gửi được yêu cầu. Vui lòng thử lại sau."))
    } finally {
      setSubmitting(null)
    }
  }

  async function handlePortability() {
    if (!user || !settings) return
    const data = buildPortableAccountData({ user, privacySettings: settings, requests })
    const blob = new Blob([data], { type: "application/json;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `acfmart-account-data-${user.id}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    await submitRequest(
      "portability",
      "Nguoi dung yeu cau xuat bo du lieu day du o dinh dang co cau truc theo chinh sach PDPD."
    )
  }

  if (!user) {
    return (
      <div className="card p-5">
        <h2 className="text-base font-bold text-neutral-900">Quyền riêng tư</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Vui lòng đăng nhập để quản lý đồng ý, yêu cầu xuất dữ liệu hoặc yêu cầu xoá tài khoản.
        </p>
        <Link to="/login" className="btn-primary mt-4">
          Đăng nhập
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Quyền riêng tư & dữ liệu cá nhân
            </h2>
            <p className="mt-1 text-sm text-neutral-600">
              Quản lý đồng ý và thực hiện quyền chủ thể dữ liệu theo Chính sách Bảo vệ Dữ liệu Cá nhân.
            </p>
          </div>
          <Link to="/legal/data-protection" className="btn-secondary shrink-0">
            <FileText size={14} />
            Xem chính sách
          </Link>
        </div>

        <div className="mt-5 rounded-lg border border-neutral-200">
          <div className="border-b border-neutral-200 px-4 py-3">
            <div className="text-sm font-semibold text-neutral-900">Đồng ý xử lý dữ liệu</div>
            <div className="text-xs text-neutral-500">
              Cookie bắt buộc cho đăng nhập, giỏ hàng và bảo mật luôn được bật.
            </div>
          </div>
          <div className="divide-y divide-neutral-100">
            {loading && (
              <div className="flex items-center gap-2 px-4 py-4 text-sm text-neutral-500">
                <Loader2 size={14} className="animate-spin" />
                Đang tải lựa chọn của bạn...
              </div>
            )}
            {!loading &&
              settings &&
              PRIVACY_CONTROLS.map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="text-sm font-medium text-neutral-900">{item.label}</div>
                    <div className="text-xs text-neutral-500">{item.desc}</div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {savingKey === item.key && (
                      <Loader2 size={14} className="animate-spin text-neutral-400" />
                    )}
                    <Toggle
                      checked={settings[item.key]}
                      disabled={savingKey === item.key}
                      onChange={(nextValue) => handleToggle(item.key, nextValue)}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4">
          <h3 className="text-base font-bold text-neutral-900">
            Quyền của chủ thể dữ liệu
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Các yêu cầu cần xác minh hoặc xử lý thủ công sẽ được ghi nhận để DPO/Admin phản hồi.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <DataRightAction
            icon={Eye}
            title="Truy cập dữ liệu"
            desc="Xem nhanh dữ liệu tài khoản và lựa chọn quyền riêng tư đang lưu."
            actionLabel="Xem dữ liệu"
            onClick={() => setShowDataSummary((value) => !value)}
          />
          <DataRightAction
            icon={Database}
            title="Chỉnh sửa dữ liệu"
            desc="Cập nhật họ tên, số điện thoại và thông tin hồ sơ chưa chính xác."
            actionLabel="Mở hồ sơ"
            onClick={onOpenProfile}
          />
          <DataRightAction
            icon={Download}
            title="Di chuyển dữ liệu"
            desc="Tải bản tóm tắt và gửi yêu cầu xuất bộ dữ liệu đầy đủ."
            actionLabel="Xuất dữ liệu"
            loading={submitting === "portability"}
            onClick={handlePortability}
          />
          <DataRightAction
            icon={Ban}
            title="Hạn chế xử lý"
            desc="Yêu cầu tạm ngừng xử lý dữ liệu cho mục đích không bắt buộc."
            actionLabel="Gửi yêu cầu"
            loading={submitting === "restriction"}
            onClick={() =>
              submitRequest(
                "restriction",
                "Nguoi dung yeu cau han che xu ly du lieu cho muc dich khong bat buoc."
              )
            }
          />
          <DataRightAction
            icon={Shield}
            title="Phản đối profiling"
            desc="Phản đối phân tích hành vi hoặc xử lý tự động ngoài dịch vụ cốt lõi."
            actionLabel="Phản đối"
            loading={submitting === "objection"}
            onClick={handleObjection}
          />
          <DataRightAction
            icon={RotateCcw}
            title="Rút lại đồng ý"
            desc="Tắt tiếp thị, phân tích, cá nhân hoá Aivy và chia sẻ xuyên biên giới."
            actionLabel="Rút đồng ý"
            loading={submitting === "withdraw_consent"}
            onClick={handleWithdrawConsent}
          />
          <DataRightAction
            icon={Trash2}
            title="Xoá dữ liệu"
            desc="Yêu cầu xoá hoặc ẩn danh dữ liệu, trừ phần phải lưu theo pháp luật."
            actionLabel="Yêu cầu xoá"
            danger
            loading={submitting === "erasure"}
            onClick={() =>
              submitRequest(
                "erasure",
                "Nguoi dung yeu cau xoa/ẩn danh du lieu ca nhan va tai khoan theo chinh sach PDPD."
              )
            }
          />
        </div>

        {showDataSummary && (
          <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <h4 className="text-sm font-semibold text-neutral-900">
              Dữ liệu tài khoản hiện có
            </h4>
            <dl className="mt-3 grid gap-2 sm:grid-cols-2">
              {accountSummary.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] uppercase text-neutral-500">{label}</dt>
                  <dd className="break-words text-sm text-neutral-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      <div className="card p-5">
        <h3 className="text-base font-bold text-neutral-900">Lịch sử yêu cầu dữ liệu</h3>
        <div className="mt-3 space-y-2">
          {requests.length === 0 && (
            <div className="rounded-lg border border-dashed border-neutral-300 px-4 py-5 text-sm text-neutral-500">
              Chưa có yêu cầu nào được ghi nhận.
            </div>
          )}
          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-lg border border-neutral-200 px-4 py-3"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-medium text-neutral-900">
                  {REQUEST_LABELS[request.type]}
                </div>
                <span
                  className={cn(
                    "inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold",
                    statusClass(request.status)
                  )}
                >
                  {REQUEST_STATUS_LABELS[request.status] ?? request.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                {request.description || "Không có mô tả bổ sung."}
              </p>
              <div className="mt-2 text-xs text-neutral-500">
                Gửi lúc: {formatTimestamp(request.created_at)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DataRightAction({
  icon: Icon,
  title,
  desc,
  actionLabel,
  onClick,
  loading = false,
  danger = false,
}: {
  icon: typeof Shield
  title: string
  desc: string
  actionLabel: string
  onClick: () => void
  loading?: boolean
  danger?: boolean
}) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            danger ? "bg-rose-50 text-rose-600" : "bg-brand-red-50 text-brand-red-600"
          )}
        >
          <Icon size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-neutral-900">{title}</div>
          <p className="mt-1 text-xs leading-5 text-neutral-500">{desc}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        disabled={loading}
        className={cn(
          "mt-3 w-full",
          danger
            ? "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
            : "btn-secondary"
        )}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        {actionLabel}
      </button>
    </div>
  )
}

function LanguageSection() {
  return (
    <div className="card p-5 space-y-4">
      <h2 className="text-base font-bold">Ngôn ngữ & vùng</h2>
      <div>
        <label className="mb-1 block text-sm font-medium">Ngôn ngữ</label>
        <select className="input">
          <option>Tiếng Việt</option>
          <option>English</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Tiền tệ</label>
        <select className="input">
          <option>VND (đ)</option>
          <option>USD ($)</option>
        </select>
      </div>
    </div>
  )
}

function DangerSection() {
  const user = useAuthStore((s) => s.user)
  const [loading, setLoading] = useState(false)

  async function requestAccountErasure() {
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để gửi yêu cầu xoá tài khoản")
      return
    }
    if (
      !confirm(
        "Gửi yêu cầu xoá tài khoản và dữ liệu cá nhân? Dữ liệu bắt buộc theo thuế, kế toán, chống gian lận hoặc tranh chấp sẽ được lưu/ẩn danh theo quy định."
      )
    ) {
      return
    }
    setLoading(true)
    try {
      await createDataRightsRequest({
        userId: user.id,
        type: "erasure",
        contactEmail: user.email,
        description:
          "Nguoi dung yeu cau xoa tai khoan va xoa/an danh du lieu ca nhan theo chinh sach PDPD.",
      })
      toast.success("Đã gửi yêu cầu xoá tài khoản")
    } catch (err) {
      toast.error(sanitizeUserError(err, "Không gửi được yêu cầu. Vui lòng thử lại sau."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card border-rose-200 bg-rose-50 p-5">
      <h2 className="mb-3 text-base font-bold text-rose-700">Vùng nguy hiểm</h2>
      <div className="rounded-lg bg-white p-4">
        <h3 className="font-semibold">Yêu cầu xoá tài khoản</h3>
        <p className="mt-1 text-sm text-neutral-600">
          ACFMart sẽ xoá hoặc ẩn danh dữ liệu cá nhân trong phạm vi pháp luật cho phép.
          Dữ liệu giao dịch, kế toán, chống gian lận hoặc tranh chấp có thể phải lưu theo thời hạn bắt buộc.
        </p>
        <button
          onClick={requestAccountErasure}
          disabled={loading}
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Gửi yêu cầu xoá
        </button>
      </div>
    </div>
  )
}

function Toggle({
  defaultChecked = false,
  checked,
  onChange,
  disabled = false,
}: {
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
}) {
  const [on, setOn] = useState(defaultChecked)
  const isOn = checked ?? on

  function handleToggle() {
    if (disabled) return
    const next = !isOn
    if (checked === undefined) setOn(next)
    onChange?.(next)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={cn(
        "relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        isOn ? "bg-brand-red-500" : "bg-neutral-300"
      )}
      aria-pressed={isOn}
    >
      <div
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
          isOn ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}
