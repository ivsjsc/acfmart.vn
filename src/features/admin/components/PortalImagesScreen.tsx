import { useState, useEffect, useCallback } from "react"
import { Loader2, Save, ImagePlus, ExternalLink } from "lucide-react"
import toast from "react-hot-toast"
import { getPortalConfig, savePortalConfig } from "../../../lib/portal-config-service"
import {
  PORTAL_SLOTS,
  type PortalImageSlot,
} from "../../../types/portal-config"
import type { AppDomain } from "../../../lib/domain"

const PORTALS: { id: AppDomain; label: string; color: string }[] = [
  { id: "buyer", label: "ACFMart (acfmart.vn)", color: "bg-red-500" },
  { id: "seller", label: "Seller Center (acfmart.store)", color: "bg-amber-500" },
  { id: "social", label: "Social (acfmart.online)", color: "bg-violet-500" },
]

const EMPTY_SLOT: PortalImageSlot = { image_url: "", link_url: "", alt: "" }

export function PortalImagesScreen() {
  const [activePortal, setActivePortal] = useState<AppDomain>("social")
  const [images, setImages] = useState<Record<string, PortalImageSlot>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async (portal: AppDomain) => {
    setLoading(true)
    try {
      const config = await getPortalConfig(portal)
      setImages(config?.images ?? {})
    } catch {
      toast.error("Không thể tải cấu hình portal")
      setImages({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(activePortal)
  }, [activePortal, load])

  function handleChange(
    slotKey: string,
    field: keyof PortalImageSlot,
    value: string,
  ) {
    setImages((prev) => ({
      ...prev,
      [slotKey]: {
        ...(prev[slotKey] ?? EMPTY_SLOT),
        [field]: value,
      },
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await savePortalConfig(activePortal, images)
      toast.success("Đã lưu cấu hình hình ảnh")
    } catch {
      toast.error("Không thể lưu. Vui lòng thử lại.")
    } finally {
      setSaving(false)
    }
  }

  const slots = PORTAL_SLOTS[activePortal] ?? []

  return (
    <div className="container-acf py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Hình ảnh Portal
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            Dán URL hình ảnh để chỉnh giao diện cho từng portal.
            Hỗ trợ <code className="rounded bg-neutral-100 px-1">acfmart.vn</code>,{" "}
            <code className="rounded bg-neutral-100 px-1">acfmart.online</code>,{" "}
            <code className="rounded bg-neutral-100 px-1">acfmart.store</code>.
          </p>
        </div>
        <button
          type="button"
          disabled={saving || loading}
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-red-700 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </div>

      {/* Portal tabs */}
      <div className="mt-6 flex gap-2">
        {PORTALS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActivePortal(p.id)}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              activePortal === p.id
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50"
            }`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
            {p.label}
          </button>
        ))}
      </div>

      {/* Image slots */}
      {loading ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-neutral-500">
          <Loader2 size={20} className="animate-spin" /> Đang tải…
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {slots.map((slot) => {
            const current = images[slot.key] ?? EMPTY_SLOT
            return (
              <section
                key={slot.key}
                className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="shrink-0">
                    {current.image_url ? (
                      <img
                        src={current.image_url}
                        alt={current.alt || slot.label}
                        className="h-24 w-40 rounded-lg border border-neutral-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-40 items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 bg-neutral-50">
                        <ImagePlus size={24} className="text-neutral-300" />
                      </div>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="min-w-0 flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-neutral-900">
                          {slot.label}
                        </h3>
                        <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500">
                          {slot.key}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500">{slot.hint}</p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                          URL hình ảnh *
                        </label>
                        <input
                          type="url"
                          value={current.image_url}
                          onChange={(e) =>
                            handleChange(slot.key, "image_url", e.target.value)
                          }
                          placeholder="https://firebasestorage.googleapis.com/…"
                          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                          Link khi click
                        </label>
                        <input
                          type="url"
                          value={current.link_url}
                          onChange={(e) =>
                            handleChange(slot.key, "link_url", e.target.value)
                          }
                          placeholder="https://… (tuỳ chọn)"
                          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                        Mô tả / Alt text
                      </label>
                      <input
                        type="text"
                        value={current.alt}
                        onChange={(e) =>
                          handleChange(slot.key, "alt", e.target.value)
                        }
                        placeholder="Mô tả ngắn gọn cho hình ảnh"
                        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-brand-red-400 focus:ring-2 focus:ring-brand-red-100"
                      />
                    </div>

                    {current.image_url && (
                      <a
                        href={current.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline"
                      >
                        Mở ảnh <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>
              </section>
            )
          })}

          {slots.length === 0 && (
            <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 py-12 text-center text-sm text-neutral-500">
              Chưa có slot nào cho portal này.
            </p>
          )}
        </div>
      )}

      {/* Firestore info */}
      <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-500">
        <p>
          <strong>Firestore:</strong> collection{" "}
          <code className="rounded bg-neutral-100 px-1">portalConfig</code>{" "}
          → document{" "}
          <code className="rounded bg-neutral-100 px-1">{activePortal}</code>{" "}
          → field{" "}
          <code className="rounded bg-neutral-100 px-1">images</code>.
        </p>
        <p className="mt-1">
          Hình ảnh sẽ hiển thị ngay trên dashboard tương ứng sau khi lưu và refresh trang.
        </p>
      </div>
    </div>
  )
}
