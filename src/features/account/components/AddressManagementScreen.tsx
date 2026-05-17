import { useState } from "react"
import { Home, Briefcase, MapPin, Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { cn } from "../../../lib/cn"
import {
  useAddresses,
  useDeleteAddress,
  useSaveAddress,
  useSetDefaultAddress,
  type SaveAddressInput,
  type UserAddress,
} from "../../../hooks/use-addresses"

const LABEL_META: Record<UserAddress["label"], { icon: typeof Home; text: string; color: string }> = {
  home: { icon: Home, text: "Nhà riêng", color: "bg-brand-red-100 text-brand-red-700" },
  office: { icon: Briefcase, text: "Văn phòng", color: "bg-blue-100 text-blue-700" },
  other: { icon: MapPin, text: "Khác", color: "bg-neutral-100 text-neutral-700" },
}

export default function AddressManagementScreen() {
  const addressesQuery = useAddresses()
  const saveAddress = useSaveAddress()
  const setDefaultMutation = useSetDefaultAddress()
  const deleteMutation = useDeleteAddress()
  const addresses = addressesQuery.data?.addresses ?? []
  const [editing, setEditing] = useState<UserAddress | null>(null)
  const [showForm, setShowForm] = useState(false)

  async function setDefault(id: string) {
    try {
      await setDefaultMutation.mutateAsync(id)
      toast.success("Đã đặt làm địa chỉ mặc định")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể đặt mặc định")
    }
  }

  async function deleteAddress(id: string) {
    if (confirm("Xoá địa chỉ này?")) {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success("Đã xoá địa chỉ")
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Không thể xoá địa chỉ")
      }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Sổ địa chỉ</h1>
        <button
          onClick={() => {
            setEditing(null)
            setShowForm(true)
          }}
          className="btn-primary"
        >
          <Plus size={14} /> Thêm địa chỉ
        </button>
      </div>

      {addressesQuery.isLoading ? (
        <div className="card flex items-center justify-center gap-2 py-12 text-sm text-neutral-500">
          <Loader2 size={16} className="animate-spin" />
          Đang tải sổ địa chỉ...
        </div>
      ) : addressesQuery.isError ? (
        <div className="card border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Không thể tải sổ địa chỉ:{" "}
          {addressesQuery.error instanceof Error
            ? addressesQuery.error.message
            : "Vui lòng thử lại"}
        </div>
      ) : addresses.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <MapPin size={48} className="text-neutral-300" />
          <h2 className="mt-3 text-lg font-semibold">Chưa có địa chỉ nào</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Thêm địa chỉ để mua hàng dễ dàng hơn.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => {
            const meta = LABEL_META[addr.label]
            return (
              <div key={addr.id} className="card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
                          meta.color
                        )}
                      >
                        <meta.icon size={11} />
                        {meta.text}
                      </span>
                      {addr.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-brand-gold-100 px-2 py-0.5 text-xs font-bold text-brand-gold-700">
                          <Star size={11} /> Mặc định
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-neutral-900">
                      {addr.name} · {addr.phone}
                    </div>
                    <div className="mt-0.5 text-sm text-neutral-700">
                      {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => {
                        setEditing(addr)
                        setShowForm(true)
                      }}
                      className="rounded p-2 text-neutral-500 hover:bg-neutral-100"
                      aria-label="Sửa"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="rounded p-2 text-neutral-500 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Xoá"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => setDefault(addr.id)}
                    className="mt-3 text-xs font-semibold text-brand-red-600 hover:underline"
                  >
                    Đặt làm mặc định
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <AddressFormModal
          initial={editing}
          onClose={() => setShowForm(false)}
          pending={saveAddress.isPending}
          onSave={async (addr) => {
            try {
              await saveAddress.mutateAsync({
                addressId: editing?.id,
                data: addr,
              })
              toast.success(editing ? "Đã cập nhật địa chỉ" : "Đã thêm địa chỉ")
              setShowForm(false)
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Không thể lưu địa chỉ")
            }
          }}
        />
      )}
    </div>
  )
}

function AddressFormModal({
  initial,
  onClose,
  onSave,
  pending,
}: {
  initial: UserAddress | null
  onClose: () => void
  onSave: (a: SaveAddressInput) => Promise<void>
  pending: boolean
}) {
  const [form, setForm] = useState<SaveAddressInput>(
    initial ?? {
      label: "home",
      name: "",
      phone: "",
      address: "",
      ward: "",
      district: "",
      city: "",
      isDefault: false,
    }
  )

  function handleSave() {
    if (!form.name || !form.phone || !form.address) {
      toast.error("Vui lòng điền đủ thông tin bắt buộc")
      return
    }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 md:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg animate-slide-up rounded-2xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-bold">
          {initial ? "Sửa địa chỉ" : "Thêm địa chỉ mới"}
        </h3>

        <div className="space-y-3">
          <div className="flex gap-2">
            {(["home", "office", "other"] as const).map((lbl) => {
              const meta = LABEL_META[lbl]
              return (
                <button
                  key={lbl}
                  onClick={() => setForm({ ...form, label: lbl })}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg border p-2 text-sm",
                    form.label === lbl
                      ? "border-brand-red-500 bg-brand-red-50 font-semibold text-brand-red-700"
                      : "border-neutral-200 hover:border-brand-red-300"
                  )}
                >
                  <meta.icon size={14} />
                  {meta.text}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Họ tên *"
              className="input"
            />
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Số điện thoại *"
              className="input"
            />
          </div>

          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="Số nhà, đường *"
            className="input"
          />

          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              value={form.ward}
              onChange={(e) => setForm({ ...form, ward: e.target.value })}
              placeholder="Phường/Xã"
              className="input"
            />
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              placeholder="Quận/Huyện"
              className="input"
            />
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Tỉnh/Thành"
              className="input"
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
              className="h-4 w-4 rounded text-brand-red-500"
            />
            Đặt làm địa chỉ mặc định
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">
            Huỷ
          </button>
          <button
            onClick={handleSave}
            disabled={pending}
            className="btn-primary flex-1 justify-center"
          >
            {pending ? <Loader2 size={14} className="animate-spin" /> : null}
            {initial ? "Cập nhật" : "Thêm"}
          </button>
        </div>
      </div>
    </div>
  )
}
