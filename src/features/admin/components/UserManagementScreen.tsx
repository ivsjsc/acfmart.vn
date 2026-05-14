import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Shield,
  ShieldCheck,
  UserCog,
  Loader2,
  ChevronDown,
  Ban,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import { useAuthStore, type UserRole } from "../../../stores/auth-store"
import {
  listUsers,
  updateUserRole,
  disableUser,
  enableUser,
  type UserDoc,
} from "../../../lib/user-management-service"

const ROLE_OPTIONS: { value: UserRole; label: string; color: string }[] = [
  { value: "customer", label: "Khách hàng", color: "bg-neutral-100 text-neutral-700" },
  { value: "seller", label: "Người bán", color: "bg-blue-100 text-blue-700" },
  { value: "carrier", label: "Vận chuyển", color: "bg-cyan-100 text-cyan-700" },
  { value: "moderator", label: "Kiểm duyệt viên", color: "bg-purple-100 text-purple-700" },
  { value: "admin", label: "Quản trị viên", color: "bg-rose-100 text-rose-700" },
]

type RoleFilter = UserRole | "all"

const FILTER_TABS: { value: RoleFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "admin", label: "Admin" },
  { value: "moderator", label: "Kiểm duyệt viên" },
  { value: "seller", label: "Người bán" },
  { value: "customer", label: "Khách hàng" },
  { value: "carrier", label: "Vận chuyển" },
]

export function UserManagementScreen() {
  const [users, setUsers] = useState<UserDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [selectedUser, setSelectedUser] = useState<UserDoc | null>(null)
  const [newRole, setNewRole] = useState<UserRole>("customer")
  const [changingRole, setChangingRole] = useState(false)
  const [togglingUser, setTogglingUser] = useState<string | null>(null)

  const currentUser = useAuthStore((s) => s.user)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await listUsers({
        role: roleFilter === "all" ? undefined : roleFilter,
        q: search || undefined,
        limitCount: 100,
      })
      setUsers(result.users)
    } catch {
      toast.error("Không thể tải danh sách người dùng")
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [roleFilter, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  async function handleRoleChange(userId: string) {
    if (!currentUser) return
    if (currentUser.role !== "admin") {
      toast.error("Chỉ Admin mới có thể thay đổi role")
      return
    }
    if (userId === currentUser.id) {
      toast.error("Không thể thay đổi role của chính mình")
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
      fetchUsers()
    } catch (err: any) {
      toast.error(err?.message ?? "Cập nhật role thất bại")
    } finally {
      setChangingRole(false)
    }
  }

  async function handleToggleDisable(user: UserDoc) {
    if (!currentUser) return
    if (currentUser.role !== "admin") {
      toast.error("Chỉ Admin mới có thể vô hiệu hoá tài khoản")
      return
    }
    if (user.id === currentUser.id) {
      toast.error("Không thể vô hiệu hoá chính mình")
      return
    }

    setTogglingUser(user.id)
    try {
      if (user.disabled) {
        await enableUser(user.id, {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
        })
        toast.success("Đã kích hoạt lại tài khoản")
      } else {
        await disableUser(user.id, {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
        })
        toast.success("Đã vô hiệu hoá tài khoản")
      }
      fetchUsers()
    } catch {
      toast.error("Thao tác thất bại")
    } finally {
      setTogglingUser(null)
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

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-purple-50 p-2">
          <UserCog className="text-purple-600" size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Quản lý Người dùng</h1>
          <p className="text-sm text-neutral-500">
            Xem danh sách, gán role và quản lý tài khoản người dùng
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setRoleFilter(tab.value)}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                roleFilter === tab.value
                  ? "bg-brand-red-50 text-brand-red-700"
                  : "text-neutral-600 hover:bg-neutral-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo email, tên..."
            className="rounded-lg border border-neutral-200 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-red-300 focus:ring-1 focus:ring-brand-red-200"
          />
        </div>
      </div>

      {/* User list */}
      <div className="mt-6">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-brand-red-500" size={28} />
          </div>
        )}

        {!loading && users.length === 0 && (
          <div className="rounded-xl border border-neutral-200 bg-white py-16 text-center">
            <p className="text-sm text-neutral-500">Không tìm thấy người dùng nào</p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-neutral-100 bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Người dùng</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-neutral-600">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium text-neutral-600">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-neutral-500">
                              {(user.name || user.email || "?")[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900 truncate max-w-[160px]">
                            {user.name || "Chưa đặt tên"}
                          </p>
                          {user.phone && (
                            <p className="text-[11px] text-neutral-400">{user.phone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-600 truncate max-w-[200px]">
                      {user.email}
                    </td>
                    <td className="px-4 py-3">{roleBadge(user.role)}</td>
                    <td className="px-4 py-3">
                      {user.disabled ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          <Ban size={10} /> Đã khoá
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 size={10} /> Hoạt động
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {currentUser?.role === "admin" && user.id !== currentUser.id && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setNewRole(user.role)
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50"
                            >
                              <Shield size={12} />
                              Đổi role
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
                              {user.disabled ? "Mở khoá" : "Khoá"}
                            </button>
                          </>
                        )}
                        {user.id === currentUser?.id && (
                          <span className="text-[11px] text-neutral-400 italic">Bạn</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role change modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-50 p-2">
                <ShieldCheck className="text-purple-600" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-neutral-900">Thay đổi Role</h2>
                <p className="text-xs text-neutral-500">
                  {selectedUser.name || selectedUser.email}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle size={14} className="mt-0.5 text-amber-600" />
                <p className="text-xs text-amber-700">
                  Thay đổi role sẽ ảnh hưởng đến quyền truy cập của người dùng trên toàn hệ thống.
                  Hành động này được ghi nhận trong Nhật ký hệ thống.
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
                {ROLE_OPTIONS.map((opt) => (
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
                    ? "bg-neutral-300 cursor-not-allowed"
                    : "bg-brand-red-600 hover:bg-brand-red-700"
                )}
              >
                {changingRole ? (
                  <Loader2 size={14} className="mx-auto animate-spin" />
                ) : (
                  "Xác nhận thay đổi"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
