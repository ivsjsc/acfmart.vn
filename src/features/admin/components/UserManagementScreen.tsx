import { useState, useEffect, useMemo } from "react"
import type { ReactNode } from "react"
import {
  Shield,
  ShieldCheck,
  UserCog,
  Users,
  Loader2,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  Pencil,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { cn } from "../../../lib/cn"
import { sanitizeUserError } from "../../../lib/error-utils"
import { useAuthStore, type UserRole } from "../../../stores/auth-store"
import { useFirebaseAuthReady } from "../../../hooks/use-firebase-auth-ready"
import { useDebouncedValue } from "../../../hooks/use-debounced-value"
import { authService } from "../../../lib/auth-service"
import {
  subscribeUsers,
  subscribeUserDirectory,
  updateUserRole,
  updateUserProfile,
  disableUser,
  enableUser,
  type UserDoc,
} from "../../../lib/user-management-service"
import {
  AdminSearchInput,
  FilterTabs,
  StatTile,
  BulkActionBar,
  AdminEmptyState,
  AdminErrorState,
  type FilterTab,
} from "./shared/admin-ui"

const ROLE_OPTIONS: { value: UserRole; label: string; color: string }[] = [
  { value: "owner", label: "Owner", color: "bg-amber-100 text-amber-800" },
  { value: "customer", label: "Khách hàng", color: "bg-neutral-100 text-neutral-700" },
  { value: "seller", label: "Người bán", color: "bg-blue-100 text-blue-700" },
  { value: "carrier", label: "Vận chuyển", color: "bg-cyan-100 text-cyan-700" },
  { value: "manager", label: "Quản lý", color: "bg-teal-100 text-teal-700" },
  { value: "moderator", label: "Kiểm duyệt viên", color: "bg-purple-100 text-purple-700" },
  { value: "admin", label: "Quản trị viên", color: "bg-rose-100 text-rose-700" },
]

type RoleFilter = UserRole | "all"

const FILTER_TABS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Quản lý" },
  { value: "moderator", label: "Kiểm duyệt viên" },
  { value: "seller", label: "Người bán" },
  { value: "customer", label: "Khách hàng" },
  { value: "carrier", label: "Vận chuyển" },
]

type SortCol = "name" | "role" | "status" | "created"
const PAGE_SIZE = 50

function userDate(ts: UserDoc["created_at"]): number {
  return ts?.toDate?.()?.getTime?.() ?? 0
}

function explainFirestoreError(err: Error): string {
  const msg = err.message || ""
  if (msg.includes("Missing or insufficient permissions")) {
    return "Tài khoản của bạn chưa có quyền xem danh sách người dùng. Vui lòng liên hệ quản trị viên để được cấp quyền."
  }
  if (msg.includes("requires an index") || msg.toLowerCase().includes("network")) {
    return "Hệ thống đang gặp trục trặc khi tải danh sách người dùng. Vui lòng thử lại sau ít phút."
  }
  return "Không thể tải danh sách người dùng. Vui lòng thử lại sau."
}

export function UserManagementScreen() {
  const [users, setUsers] = useState<UserDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebouncedValue(search, 250)
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [sortCol, setSortCol] = useState<SortCol>("created")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkRunning, setBulkRunning] = useState(false)

  const [selectedUser, setSelectedUser] = useState<UserDoc | null>(null)
  const [editingUser, setEditingUser] = useState<UserDoc | null>(null)
  const [newRole, setNewRole] = useState<UserRole>("customer")
  const [changingRole, setChangingRole] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [togglingUser, setTogglingUser] = useState<string | null>(null)
  const [retryToken, setRetryToken] = useState(0)
  const [profileDraft, setProfileDraft] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
    address: "",
    note: "",
  })

  const currentUser = useAuthStore((s) => s.user)
  const isManagerView = currentUser?.role === "manager"
  const canManageUsers = currentUser?.role === "owner" || currentUser?.role === "admin"
  const canAssignOwner = currentUser?.role === "owner"
  const authReady = useFirebaseAuthReady()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isManagerView) return
    setSelectedUser(null)
    setEditingUser(null)
  }, [isManagerView])

  // Tải toàn bộ user một lần rồi lọc/đếm/sort client-side → có count cho
  // từng role và tìm kiếm bao phủ tất cả.
  useEffect(() => {
    if (!authReady) return
    setLoading(true)
    setError(null)

    const onData = (data: UserDoc[]) => {
      setUsers(data)
      setLoading(false)
    }
    const onErr = (err: Error) => {
      const msg = explainFirestoreError(err)
      setError(msg)
      setUsers([])
      setLoading(false)
      toast.error(msg, { duration: 6000 })
    }

    const subscription = isManagerView
      ? subscribeUserDirectory({ limitCount: 500 }, onData, onErr)
      : subscribeUsers({ limitCount: 500 }, onData, onErr)

    return () => subscription()
  }, [authReady, isManagerView, retryToken])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
    setSelectedIds(new Set())
  }, [roleFilter, debouncedSearch])

  async function handleLogout() {
    try {
      await authService.signOut()
      toast.success("Đã đăng xuất")
      navigate("/login/cloud", { replace: true })
    } catch {
      toast.error("Không thể đăng xuất. Vui lòng thử lại.")
    }
  }

  const stats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => !u.disabled).length,
      disabled: users.filter((u) => u.disabled).length,
    }),
    [users]
  )

  const roleCounts = useMemo(() => {
    const m: Partial<Record<RoleFilter, number>> = {}
    for (const u of users) m[u.role] = (m[u.role] ?? 0) + 1
    return m
  }, [users])

  const filtered = useMemo(() => {
    let arr = users.filter((u) => (roleFilter === "all" ? true : u.role === roleFilter))
    const q = debouncedSearch.trim().toLowerCase()
    if (q) {
      arr = arr.filter((u) =>
        isManagerView
          ? u.name?.toLowerCase().includes(q) ||
            u.address?.toLowerCase().includes(q) ||
            u.note?.toLowerCase().includes(q) ||
            u.id?.toLowerCase().includes(q)
          : u.email?.toLowerCase().includes(q) ||
            u.name?.toLowerCase().includes(q) ||
            u.phone?.toLowerCase().includes(q) ||
            u.id?.toLowerCase().includes(q)
      )
    }
    const dir = sortDir === "asc" ? 1 : -1
    arr = [...arr].sort((a, b) => {
      switch (sortCol) {
        case "name":
          return dir * (a.name ?? "").localeCompare(b.name ?? "", "vi")
        case "role":
          return dir * (a.role ?? "").localeCompare(b.role ?? "")
        case "status":
          return dir * (Number(a.disabled) - Number(b.disabled))
        default:
          return dir * (userDate(a.created_at) - userDate(b.created_at))
      }
    })
    return arr
  }, [users, roleFilter, debouncedSearch, sortCol, sortDir, isManagerView])

  const visibleUsers = filtered.slice(0, visibleCount)

  function canSelect(u: UserDoc): boolean {
    return (
      canManageUsers &&
      !isManagerView &&
      u.id !== currentUser?.id &&
      !(u.role === "owner" && !canAssignOwner)
    )
  }
  const selectableVisible = visibleUsers.filter(canSelect)
  const allSelected =
    selectableVisible.length > 0 && selectableVisible.every((u) => selectedIds.has(u.id))

  function toggleSort(col: SortCol) {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortCol(col)
      setSortDir(col === "created" ? "desc" : "asc")
    }
  }
  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function toggleSelectAll() {
    setSelectedIds(() => (allSelected ? new Set() : new Set(selectableVisible.map((u) => u.id))))
  }

  async function handleRoleChange(userId: string) {
    if (!currentUser) return
    if (!canManageUsers) {
      toast.error("Chỉ Owner/Admin mới có thể thay đổi role")
      return
    }
    if (userId === currentUser.id) {
      toast.error("Không thể thay đổi role của chính mình")
      return
    }
    if (newRole === "owner" && !canAssignOwner) {
      toast.error("Chỉ Owner mới có thể gán role Owner")
      return
    }
    if (selectedUser?.role === "owner" && !canAssignOwner) {
      toast.error("Chỉ Owner mới có thể thay đổi tài khoản Owner")
      return
    }

    setChangingRole(true)
    try {
      await updateUserRole(userId, newRole, {
        id: currentUser.id,
        email: currentUser.email,
        role: currentUser.role,
      })
      toast.success(`Đã cập nhật role thành "${ROLE_OPTIONS.find((r) => r.value === newRole)?.label}"`)
      setSelectedUser(null)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Cập nhật role thất bại. Vui lòng thử lại sau."))
    } finally {
      setChangingRole(false)
    }
  }

  async function handleToggleDisable(user: UserDoc) {
    if (!currentUser) return
    if (!canManageUsers) {
      toast.error("Chỉ Owner/Admin mới có thể vô hiệu hoá tài khoản")
      return
    }
    if (user.id === currentUser.id) {
      toast.error("Không thể vô hiệu hoá chính mình")
      return
    }
    if (user.role === "owner" && !canAssignOwner) {
      toast.error("Chỉ Owner mới có thể khoá/mở khoá tài khoản Owner")
      return
    }

    setTogglingUser(user.id)
    try {
      const actor = { id: currentUser.id, email: currentUser.email, role: currentUser.role }
      if (user.disabled) {
        await enableUser(user.id, actor)
        toast.success("Đã kích hoạt lại tài khoản")
      } else {
        await disableUser(user.id, actor)
        toast.success("Đã vô hiệu hoá tài khoản")
      }
    } catch (err) {
      toast.error(sanitizeUserError(err, "Thao tác thất bại. Vui lòng thử lại sau."))
    } finally {
      setTogglingUser(null)
    }
  }

  async function handleBulkToggle(disable: boolean) {
    if (!currentUser) return
    const targets = users.filter(
      (u) => selectedIds.has(u.id) && canSelect(u) && Boolean(u.disabled) !== disable
    )
    if (targets.length === 0) {
      toast.error(disable ? "Các tài khoản đã chọn đều đang khoá" : "Các tài khoản đã chọn đều đang hoạt động")
      return
    }
    setBulkRunning(true)
    const actor = { id: currentUser.id, email: currentUser.email, role: currentUser.role }
    let ok = 0
    for (const u of targets) {
      try {
        if (disable) await disableUser(u.id, actor)
        else await enableUser(u.id, actor)
        ok++
      } catch (err) {
        console.error("[UserManagement] bulk toggle failed:", u.id, err)
      }
    }
    setBulkRunning(false)
    setSelectedIds(new Set())
    toast.success(`Đã ${disable ? "khoá" : "mở khoá"} ${ok}/${targets.length} tài khoản`)
  }

  function openEditUser(user: UserDoc) {
    setEditingUser(user)
    setProfileDraft({
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      avatar: user.avatar ?? "",
      address: user.address ?? "",
      note: user.note ?? "",
    })
  }

  async function handleProfileSave() {
    if (!currentUser || !editingUser) return
    if (!canManageUsers) {
      toast.error("Chỉ Owner/Admin mới có thể chỉnh sửa user")
      return
    }
    if (editingUser.role === "owner" && !canAssignOwner) {
      toast.error("Chỉ Owner mới có thể chỉnh sửa tài khoản Owner")
      return
    }

    setSavingProfile(true)
    try {
      await updateUserProfile(
        editingUser.id,
        {
          name: profileDraft.name,
          email: profileDraft.email,
          phone: profileDraft.phone,
          avatar: profileDraft.avatar,
          address: profileDraft.address,
          note: profileDraft.note,
        },
        { id: currentUser.id, email: currentUser.email, role: currentUser.role }
      )
      toast.success("Đã cập nhật thông tin người dùng")
      setEditingUser(null)
    } catch (err) {
      toast.error(sanitizeUserError(err, "Cập nhật user thất bại. Vui lòng thử lại sau."))
    } finally {
      setSavingProfile(false)
    }
  }

  const roleBadge = (role: UserRole) => {
    const opt = ROLE_OPTIONS.find((r) => r.value === role)
    return (
      <span
        className={cn(
          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
          opt?.color ?? "bg-neutral-100 text-neutral-600"
        )}
      >
        {opt?.label ?? role}
      </span>
    )
  }

  const statusBadge = (disabled?: boolean) =>
    disabled ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
        <Ban size={10} /> Đã khoá
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 size={10} /> Hoạt động
      </span>
    )

  function renderActions(user: UserDoc) {
    if (isManagerView || !canManageUsers) return null
    const isSelf = user.id === currentUser?.id
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          onClick={() => openEditUser(user)}
          className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
        >
          <Pencil size={12} />
          Sửa
        </button>
        {!isSelf && (
          <>
            <button
              onClick={() => {
                setSelectedUser(user)
                setNewRole(user.role)
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
            >
              <Shield size={12} />
              Role
            </button>
            <button
              onClick={() => handleToggleDisable(user)}
              disabled={togglingUser === user.id}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs",
                user.disabled
                  ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                  : "border-rose-200 text-rose-600 hover:bg-rose-50"
              )}
            >
              {togglingUser === user.id ? (
                <Loader2 size={12} className="animate-spin" />
              ) : user.disabled ? (
                <CheckCircle2 size={12} />
              ) : (
                <Ban size={12} />
              )}
              {user.disabled ? "Mở" : "Khoá"}
            </button>
          </>
        )}
        {isSelf && <span className="text-[11px] italic text-neutral-400">Bạn</span>}
      </div>
    )
  }

  const tabs: FilterTab<RoleFilter>[] = FILTER_TABS.map((t) => ({
    value: t.value,
    label: t.label,
    count: t.value === "all" ? users.length : roleCounts[t.value] ?? 0,
  }))

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-50 p-2">
            <UserCog className="text-purple-600" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Quản lý Người dùng</h1>
            <p className="text-sm text-neutral-500">
              {isManagerView
                ? "Chế độ Quản lý chỉ hiển thị tên, địa chỉ và ghi chú của người dùng"
                : "Xem danh sách, gán role và quản lý tài khoản người dùng"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {isManagerView && (
            <div className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              Chế độ giới hạn
            </div>
          )}
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <Wifi size={12} /> Realtime
          </div>
        </div>
      </div>

      {isManagerView && (
        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4">
          <div className="flex items-start gap-2">
            <Shield className="mt-0.5 shrink-0 text-teal-600" size={16} />
            <div>
              <p className="text-sm font-semibold text-teal-900">
                Bạn đang xem dữ liệu giới hạn cho vai trò Quản lý
              </p>
              <p className="mt-1 text-xs leading-5 text-teal-700">
                Email, số điện thoại và các hành động chỉnh sửa tài khoản đã được ẩn. Nếu cần thay đổi
                role hoặc khoá tài khoản, chuyển sang Owner/Admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatTile label="Tổng người dùng" value={stats.total} color="bg-blue-50 text-blue-700" icon={Users} />
        <StatTile label="Đang hoạt động" value={stats.active} color="bg-emerald-50 text-emerald-700" icon={CheckCircle2} />
        <StatTile label="Đã khoá" value={stats.disabled} color="bg-rose-50 text-rose-700" icon={Ban} />
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-3">
        <FilterTabs tabs={tabs} value={roleFilter} onChange={setRoleFilter} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AdminSearchInput
            value={search}
            onChange={setSearch}
            placeholder={isManagerView ? "Tìm theo tên, địa chỉ, ghi chú..." : "Tìm theo email, tên, SĐT..."}
            className="sm:max-w-xs"
          />
          <span className="text-xs text-neutral-400 sm:ml-auto">{filtered.length} người dùng</span>
        </div>
      </div>

      {error && !loading && (
        <div className="mt-6">
          <AdminErrorState
            title="Không thể tải danh sách người dùng"
            message={error}
            onRetry={() => setRetryToken((n) => n + 1)}
          />
          <button
            onClick={handleLogout}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Đăng xuất để dùng tài khoản khác
          </button>
        </div>
      )}

      {/* List */}
      <div className="mt-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-brand-red-500" size={28} />
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <AdminEmptyState
            icon={UserCog}
            title="Không tìm thấy người dùng nào"
            hint={
              search || roleFilter !== "all"
                ? "Thử bỏ bộ lọc hoặc đổi từ khoá tìm kiếm"
                : "Collection /users chưa có document nào, hoặc bạn không có quyền đọc"
            }
          />
        )}

        {!loading && filtered.length > 0 && (
          <>
            {/* Table — desktop */}
            <div className="hidden overflow-hidden rounded-xl border border-neutral-200 bg-white md:block">
              <table className="w-full text-sm">
                <thead className="border-b border-neutral-100 bg-neutral-50">
                  <tr>
                    {!isManagerView && canManageUsers && (
                      <th className="w-10 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={toggleSelectAll}
                          className="accent-brand-red-600"
                          aria-label="Chọn tất cả"
                        />
                      </th>
                    )}
                    <SortHeader label="Người dùng" col="name" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                    {isManagerView ? (
                      <>
                        <th className="px-4 py-3 text-left font-medium text-neutral-600">Địa chỉ</th>
                        <th className="px-4 py-3 text-left font-medium text-neutral-600">Ghi chú</th>
                      </>
                    ) : (
                      <th className="px-4 py-3 text-left font-medium text-neutral-600">Email</th>
                    )}
                    <SortHeader label="Role" col="role" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                    <SortHeader label="Trạng thái" col="status" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                    <SortHeader label="Tạo lúc" col="created" sortCol={sortCol} sortDir={sortDir} onSort={toggleSort} />
                    {!isManagerView && (
                      <th className="px-4 py-3 text-right font-medium text-neutral-600">Hành động</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {visibleUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-neutral-50">
                      {!isManagerView && canManageUsers && (
                        <td className="px-4 py-3">
                          {canSelect(user) ? (
                            <input
                              type="checkbox"
                              checked={selectedIds.has(user.id)}
                              onChange={() => toggleOne(user.id)}
                              className="accent-brand-red-600"
                            />
                          ) : null}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className={cn("min-w-0", isManagerView ? "" : "flex items-center gap-3")}>
                          {!isManagerView && (
                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-neutral-200">
                              {user.avatar ? (
                                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-neutral-500">
                                  {(user.name || user.email || "?")[0].toUpperCase()}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p
                              className={cn(
                                "truncate font-medium text-neutral-900",
                                isManagerView ? "max-w-[260px]" : "max-w-[160px]"
                              )}
                            >
                              {user.name || "Chưa đặt tên"}
                            </p>
                            {!isManagerView && user.phone && (
                              <p className="text-[11px] text-neutral-400">{user.phone}</p>
                            )}
                            {isManagerView && <p className="text-[11px] text-neutral-400">ID: {user.id}</p>}
                          </div>
                        </div>
                      </td>
                      {isManagerView ? (
                        <>
                          <td className="max-w-[240px] truncate px-4 py-3 text-neutral-600">{user.address || "—"}</td>
                          <td className="max-w-[240px] truncate px-4 py-3 text-neutral-600">{user.note || "—"}</td>
                        </>
                      ) : (
                        <td className="max-w-[200px] truncate px-4 py-3 text-neutral-600">{user.email || "—"}</td>
                      )}
                      <td className="px-4 py-3">{roleBadge(user.role)}</td>
                      <td className="px-4 py-3">{statusBadge(user.disabled)}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {user.created_at?.toDate ? user.created_at.toDate().toLocaleDateString("vi-VN") : "—"}
                      </td>
                      {!isManagerView && <td className="px-4 py-3 text-right">{renderActions(user)}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards — mobile */}
            <div className="space-y-2 md:hidden">
              {visibleUsers.map((user) => (
                <div key={user.id} className="rounded-xl border border-neutral-200 bg-white p-3">
                  <div className="flex items-start gap-3">
                    {!isManagerView && canManageUsers && canSelect(user) && (
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user.id)}
                        onChange={() => toggleOne(user.id)}
                        className="mt-1 accent-brand-red-600"
                      />
                    )}
                    {!isManagerView && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200">
                        {user.avatar ? (
                          <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-neutral-500">
                            {(user.name || user.email || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-neutral-900">{user.name || "Chưa đặt tên"}</p>
                      <p className="truncate text-xs text-neutral-500">
                        {isManagerView ? user.address || `ID: ${user.id}` : user.email || user.phone || "—"}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {roleBadge(user.role)}
                        {statusBadge(user.disabled)}
                      </div>
                    </div>
                  </div>
                  {!isManagerView && <div className="mt-3">{renderActions(user)}</div>}
                </div>
              ))}
            </div>

            {visibleCount < filtered.length && (
              <button
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="mt-3 w-full rounded-lg border border-neutral-200 bg-white py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Tải thêm ({filtered.length - visibleCount} còn lại)
              </button>
            )}
          </>
        )}

        <BulkActionBar count={selectedIds.size} onClear={() => setSelectedIds(new Set())}>
          <button
            onClick={() => handleBulkToggle(false)}
            disabled={bulkRunning}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
          >
            {bulkRunning ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
            Mở khoá
          </button>
          <button
            onClick={() => handleBulkToggle(true)}
            disabled={bulkRunning}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            <Ban size={13} />
            Khoá
          </button>
        </BulkActionBar>
      </div>

      {/* Role change modal */}
      {!isManagerView && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-50 p-2">
                <ShieldCheck className="text-purple-600" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-neutral-900">Thay đổi Role</h2>
                <p className="text-xs text-neutral-500">{selectedUser.name || selectedUser.email}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 text-amber-600" />
                <p className="text-xs text-amber-700">
                  Thay đổi role sẽ ảnh hưởng đến quyền truy cập của người dùng trên toàn hệ thống. Hành
                  động này được ghi nhận trong Nhật ký hệ thống.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-neutral-700">
                Role hiện tại: {roleBadge(selectedUser.role)}
              </label>
            </div>

            <div className="mt-3">
              <label className="text-xs font-medium text-neutral-700">Chọn role mới:</label>
              <div className="mt-2 space-y-2">
                {ROLE_OPTIONS.filter((opt) => opt.value !== "owner" || canAssignOwner).map((opt) => (
                  <label
                    key={opt.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors",
                      newRole === opt.value
                        ? "border-brand-red-300 bg-brand-red-50"
                        : "border-neutral-200 hover:bg-neutral-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={opt.value}
                      checked={newRole === opt.value}
                      onChange={() => setNewRole(opt.value)}
                      className="accent-brand-red-600"
                    />
                    <span className="text-sm font-medium text-neutral-800">{opt.label}</span>
                    <span className={cn("ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold", opt.color)}>
                      {opt.value}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 rounded-lg border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Huỷ
              </button>
              <button
                onClick={() => handleRoleChange(selectedUser.id)}
                disabled={changingRole || newRole === selectedUser.role}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-colors",
                  changingRole || newRole === selectedUser.role
                    ? "cursor-not-allowed bg-neutral-300"
                    : "bg-brand-red-600 hover:bg-brand-red-700"
                )}
              >
                {changingRole ? <Loader2 size={14} className="mx-auto animate-spin" /> : "Xác nhận thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile edit modal */}
      {!isManagerView && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-bold text-neutral-900">Chỉnh sửa người dùng</h2>
                <p className="mt-1 text-xs text-neutral-500">{editingUser.id}</p>
              </div>
              {roleBadge(editingUser.role)}
            </div>

            <div className="mt-5 grid gap-3">
              <EditField label="Tên hiển thị">
                <input
                  value={profileDraft.name}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className="input"
                />
              </EditField>
              <EditField label="Email trong hồ sơ">
                <input
                  type="email"
                  value={profileDraft.email}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, email: e.target.value }))}
                  className="input"
                />
                <p className="mt-1 text-[11px] text-neutral-500">
                  Trường này cập nhật Firestore profile. Đổi email đăng nhập Firebase Auth cần backend Admin SDK.
                </p>
              </EditField>
              <EditField label="Số điện thoại">
                <input
                  value={profileDraft.phone}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, phone: e.target.value }))}
                  className="input"
                />
              </EditField>
              <EditField label="Avatar URL">
                <input
                  value={profileDraft.avatar}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, avatar: e.target.value }))}
                  className="input"
                />
              </EditField>
              <EditField label="Địa chỉ">
                <textarea
                  value={profileDraft.address}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="input resize-none"
                />
              </EditField>
              <EditField label="Ghi chú">
                <textarea
                  value={profileDraft.note}
                  onChange={(e) => setProfileDraft((prev) => ({ ...prev, note: e.target.value }))}
                  rows={3}
                  className="input resize-none"
                />
              </EditField>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 rounded-lg border border-neutral-200 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleProfileSave}
                disabled={savingProfile}
                className="flex-1 rounded-lg bg-brand-red-600 py-2.5 text-sm font-medium text-white hover:bg-brand-red-700 disabled:opacity-50"
              >
                {savingProfile ? <Loader2 size={14} className="mx-auto animate-spin" /> : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SortHeader({
  label,
  col,
  sortCol,
  sortDir,
  onSort,
}: {
  label: string
  col: SortCol
  sortCol: SortCol
  sortDir: "asc" | "desc"
  onSort: (c: SortCol) => void
}) {
  const active = sortCol === col
  return (
    <th className="px-4 py-3 text-left font-medium text-neutral-600">
      <button onClick={() => onSort(col)} className="inline-flex items-center gap-1 hover:text-neutral-900">
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ChevronUp size={12} />
          ) : (
            <ChevronDown size={12} />
          )
        ) : (
          <ChevronsUpDown size={12} className="text-neutral-300" />
        )}
      </button>
    </th>
  )
}

function EditField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  )
}
