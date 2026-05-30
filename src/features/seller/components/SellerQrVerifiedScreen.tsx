import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import toast from "react-hot-toast"
import {
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  Package,
  Plus,
  Printer,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react"
import { useSellerProducts } from "../../../hooks/use-products"
import {
  useActivateIvsSellerQrBatch,
  useCreateIvsSellerQrBatch,
  useDownloadIvsSellerQrPrintFile,
  useIvsSellerPrinterProfile,
  useIvsSellerQrBatches,
  useIvsSellerQrDashboard,
  useIvsSellerSuspiciousAlerts,
  useIvsSellerVerificationLogs,
} from "../../../hooks/use-ivs-seller-qr"
import { IvsApiError, upsertSellerProduct } from "../../../lib/ivs-trust-api"
import { cn } from "../../../lib/cn"

export default function SellerQrVerifiedScreen() {
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedSkuId, setSelectedSkuId] = useState("")
  const [quantity, setQuantity] = useState(100)

  const productsQuery = useSellerProducts({ status: "approved", limit: 100 })
  const products = productsQuery.data?.products ?? []
  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? products[0]
  const variants = selectedProduct?.variants ?? []

  const dashboardQuery = useIvsSellerQrDashboard()
  const batchesQuery = useIvsSellerQrBatches({ page: 1, limit: 20 })
  const logsQuery = useIvsSellerVerificationLogs({ page: 1, limit: 10 })
  const alertsQuery = useIvsSellerSuspiciousAlerts({ page: 1, limit: 10 })
  const printerProfileQuery = useIvsSellerPrinterProfile()
  const createBatch = useCreateIvsSellerQrBatch()
  const downloadPrintFile = useDownloadIvsSellerQrPrintFile()
  const activateBatch = useActivateIvsSellerQrBatch()

  const initialProductId = selectedProductId || selectedProduct?.id || ""
  const initialSkuId = selectedSkuId || variants[0]?.id || ""

  const loading =
    dashboardQuery.isLoading ||
    batchesQuery.isLoading ||
    logsQuery.isLoading ||
    alertsQuery.isLoading ||
    printerProfileQuery.isLoading

  const firstError = useMemo(() => {
    const errors = [
      dashboardQuery.error,
      batchesQuery.error,
      logsQuery.error,
      alertsQuery.error,
      printerProfileQuery.error,
    ]
    return errors.find(Boolean)
  }, [
    dashboardQuery.error,
    batchesQuery.error,
    logsQuery.error,
    alertsQuery.error,
    printerProfileQuery.error,
  ])

  async function handleCreateBatch(event: FormEvent) {
    event.preventDefault()
    if (!initialProductId) {
      toast.error("Chọn sản phẩm trước khi tạo batch QR")
      return
    }

    const productForSync = products.find((product) => product.id === initialProductId) ?? selectedProduct

    try {
      await createBatch.mutateAsync({
        productId: initialProductId,
        skuId: initialSkuId || undefined,
        quantity,
      })
      toast.success("Đã tạo batch QR từ IVS Trust API")
    } catch (error) {
      // Sản phẩm vừa duyệt nhưng chưa kịp đồng bộ sang trust-platform → tự đồng bộ rồi thử lại.
      if (isProductNotSyncedError(error) && productForSync) {
        try {
          await upsertSellerProduct(initialProductId, {
            name: productForSync.title,
            brand: productForSync.brand,
            category: productForSync.category,
            publicRef: productForSync.handle,
          })
          await createBatch.mutateAsync({
            productId: initialProductId,
            skuId: initialSkuId || undefined,
            quantity,
          })
          toast.success("Đã đồng bộ sản phẩm và tạo batch QR")
          return
        } catch (retryError) {
          toast.error(toErrorMessage(retryError))
          return
        }
      }
      toast.error(toErrorMessage(error))
    }
  }

  async function handleDownloadPrintFile(batchId: string) {
    try {
      const payload = await downloadPrintFile.mutateAsync(batchId)
      const artifact = payload.artifact?.content
      const blob = new Blob([artifact || JSON.stringify(payload, null, 2)], {
        type: payload.artifact?.contentType || payload.contentType || "application/json",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = payload.artifact?.fileName || payload.fileName || `ivs-qr-batch-${batchId}.json`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

  async function handleActivateBatch(batchId: string) {
    try {
      const result = await activateBatch.mutateAsync(batchId)
      const count = result.activated ?? result.quantity
      toast.success(`Đã kích hoạt ${count} tem — khách quét sẽ thấy "Chính hãng"`)
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">QRVerified by IVS</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Tạo batch tem QR, tải file in và theo dõi quét từ IVS Trust Platform API.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            dashboardQuery.refetch()
            batchesQuery.refetch()
            logsQuery.refetch()
            alertsQuery.refetch()
            printerProfileQuery.refetch()
          }}
          className="btn-secondary"
        >
          <RefreshCcw size={16} />
          Làm mới
        </button>
      </div>

      {firstError && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {toErrorMessage(firstError)}
        </div>
      )}

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        <MetricCard
          icon={Package}
          label="Sản phẩm IVS"
          value={formatCount(dashboardQuery.data?.totalProducts)}
          loading={dashboardQuery.isLoading}
        />
        <MetricCard
          icon={FileText}
          label="Batch QR"
          value={formatCount(dashboardQuery.data?.totalQrBatches)}
          loading={dashboardQuery.isLoading}
        />
        <MetricCard
          icon={ShieldCheck}
          label="Mã QR đã cấp"
          value={formatCount(dashboardQuery.data?.totalQrCodes)}
          loading={dashboardQuery.isLoading}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <form onSubmit={handleCreateBatch} className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-neutral-900">
            <Plus size={18} className="text-brand-red-500" />
            Tạo batch QR
          </h2>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Sản phẩm
          </label>
          <select
            value={selectedProductId || selectedProduct?.id || ""}
            onChange={(event) => {
              setSelectedProductId(event.target.value)
              setSelectedSkuId("")
            }}
            className="mb-4 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            {products.length ? (
              products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.title}
                </option>
              ))
            ) : (
              <option value="">Chưa có sản phẩm đã duyệt</option>
            )}
          </select>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            SKU
          </label>
          <select
            value={selectedSkuId || variants[0]?.id || ""}
            onChange={(event) => setSelectedSkuId(event.target.value)}
            className="mb-4 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
          >
            {variants.length ? (
              variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.sku || variant.title}
                </option>
              ))
            ) : (
              <option value="">Không có SKU riêng</option>
            )}
          </select>

          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Số lượng tem
          </label>
          <input
            type="number"
            min={1}
            max={10000}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            className="mb-4 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
          />

          <button
            type="submit"
            disabled={createBatch.isPending || !initialProductId}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {createBatch.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            Tạo batch
          </button>

          <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-xs text-neutral-500">
            Endpoint: <code>/v1/sellers/me/qr-batches</code>
          </div>
        </form>

        <section className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-neutral-100 p-5">
            <h2 className="text-lg font-bold text-neutral-900">Batch QR</h2>
            <span className="text-xs font-semibold text-neutral-500">
              {formatCount(batchesQuery.data?.total)} batch
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Sản phẩm</th>
                  <th className="px-4 py-3">Số lượng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <EmptyRow colSpan={5} text="Đang tải batch QR..." loading />
                ) : batchesQuery.data?.data.length ? (
                  batchesQuery.data.data.map((batch) => (
                    <tr key={batch.id}>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-700">{batch.id}</td>
                      <td className="px-4 py-3">{batch.productId}</td>
                      <td className="px-4 py-3 font-semibold">{formatCount(batch.quantity)}</td>
                      <td className="px-4 py-3">
                        <StatusPill value={batch.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDownloadPrintFile(batch.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                          >
                            <Download size={14} />
                            Tải
                          </button>
                          <button
                            type="button"
                            onClick={() => handleActivateBatch(batch.id)}
                            disabled={activateBatch.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            title="Kích hoạt lô tem để khách quét ra Chính hãng"
                          >
                            {activateBatch.isPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                            Kích hoạt
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <EmptyRow colSpan={5} text="Chưa có batch QR từ backend." />
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <DataPanel title="Verification logs" total={logsQuery.data?.total}>
          {logsQuery.data?.data.length ? (
            logsQuery.data.data.map((log) => (
              <RowItem
                key={log.id}
                title={log.publicCode || log.id}
                meta={`${formatResult(log.result)} · ${formatDate(log.createdAt)}`}
              />
            ))
          ) : (
            <EmptyPanel text="Không có log xác minh." />
          )}
        </DataPanel>

        <DataPanel title="Suspicious alerts" total={alertsQuery.data?.total}>
          {alertsQuery.data?.data.length ? (
            alertsQuery.data.data.map((alert) => (
              <RowItem
                key={alert.id}
                title={alert.message || alert.ruleCode || alert.id}
                meta={`${alert.severity || "MEDIUM"} · ${alert.status || "OPEN"} · ${formatDate(alert.createdAt)}`}
                danger
              />
            ))
          ) : (
            <EmptyPanel text="Không có cảnh báo nghi vấn." />
          )}
        </DataPanel>
      </div>

      <div className="mt-5 card p-5">
        <h2 className="mb-2 flex items-center gap-2 text-lg font-bold text-neutral-900">
          <Printer size={18} className="text-brand-red-500" />
          Printer profile
        </h2>
        <p className="text-sm text-neutral-600">
          {printerProfileQuery.data?.printerConfig
            ? "Backend đã có cấu hình máy in cho seller."
            : "Backend chưa có cấu hình máy in cho seller này."}
        </p>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof ShieldCheck
  label: string
  value: string
  loading?: boolean
}) {
  return (
    <div className="card p-5">
      <div className="mb-3 inline-flex rounded-lg bg-brand-red-50 p-2 text-brand-red-600">
        <Icon size={18} />
      </div>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-neutral-900">
        {loading ? "..." : value}
      </div>
    </div>
  )
}

function StatusPill({ value }: { value: string }) {
  const normalized = value.toUpperCase()
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        normalized === "ACTIVATED" || normalized === "ACTIVE"
          ? "bg-emerald-50 text-emerald-700"
          : normalized === "VOIDED" || normalized === "FAILED"
            ? "bg-red-50 text-brand-red-700"
            : "bg-blue-50 text-blue-700"
      )}
    >
      {value}
    </span>
  )
}

function DataPanel({
  title,
  total,
  children,
}: {
  title: string
  total?: number
  children: ReactNode
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-100 p-5">
        <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
        <span className="text-xs font-semibold text-neutral-500">{formatCount(total)} total</span>
      </div>
      <div className="divide-y divide-neutral-100">{children}</div>
    </section>
  )
}

function RowItem({ title, meta, danger }: { title: string; meta: string; danger?: boolean }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div
        className={cn(
          "mt-0.5 rounded-lg p-2",
          danger ? "bg-red-50 text-brand-red-600" : "bg-emerald-50 text-emerald-600"
        )}
      >
        {danger ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-neutral-900">{title}</div>
        <div className="mt-0.5 text-xs text-neutral-500">{meta}</div>
      </div>
    </div>
  )
}

function EmptyPanel({ text }: { text: string }) {
  return <div className="p-6 text-center text-sm text-neutral-500">{text}</div>
}

function EmptyRow({ colSpan, text, loading }: { colSpan: number; text: string; loading?: boolean }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-neutral-500">
        {loading && <Loader2 size={16} className="mr-2 inline animate-spin text-brand-red-500" />}
        {text}
      </td>
    </tr>
  )
}

function formatCount(value: number | null | undefined): string {
  return (Number.isFinite(value) ? Number(value) : 0).toLocaleString("vi-VN")
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN")
}

function formatResult(value: string | undefined): string {
  const normalized = (value || "UNKNOWN").toUpperCase()
  if (normalized === "GENUINE" || normalized === "VALID") return "Hợp lệ"
  if (normalized === "SUSPECT" || normalized === "SUSPICIOUS") return "Nghi vấn"
  if (normalized === "VOIDED" || normalized === "REVOKED") return "Thu hồi"
  if (normalized === "INVALID") return "Không hợp lệ"
  return normalized
}

function isProductNotSyncedError(error: unknown): boolean {
  if (!(error instanceof IvsApiError)) return false
  const payload = error.payload
  if (payload && typeof payload === "object" && "code" in payload) {
    return (payload as { code?: unknown }).code === "PRODUCT_NOT_SYNCED"
  }
  return error.status === 400 && /not found or not owned/i.test(error.message)
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Không thể kết nối IVS Trust API"
}
