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
  ServerCrash,
  ShieldCheck,
  X,
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
  useCreateSellerPrintJob,
  useBatchQrCodes,
  useCreatePrintLayout,
  usePrintLayouts,
} from "../../../hooks/use-ivs-seller-qr"
import { IvsApiError, upsertSellerProduct } from "../../../lib/ivs-trust-api"
import { cn } from "../../../lib/cn"

export default function SellerQrVerifiedScreen() {
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedSkuId, setSelectedSkuId] = useState("")
  const [quantity, setQuantity] = useState(100)
  const [exportModalBatchId, setExportModalBatchId] = useState<string | null>(null)
  const [viewCodesBatchId, setViewCodesBatchId] = useState<string | null>(null)
  const [printLayoutModalOpen, setPrintLayoutModalOpen] = useState(false)
  const [selectedBatchForPrint, setSelectedBatchForPrint] = useState<string | null>(null)

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
  const createPrintJob = useCreateSellerPrintJob()
  const createPrintLayout = useCreatePrintLayout()
  const printLayoutsQuery = usePrintLayouts({ page: 1, limit: 50 })
  const batchCodesQuery = useBatchQrCodes(viewCodesBatchId || "", { page: 1, limit: 50 },)

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
      toast.success("Đã tạo batch QR tem xác thực")
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

  async function handleExportPdf(batchId: string) {
    setExportModalBatchId(batchId)
  }

  async function handleConfirmExportPdf() {
    if (!exportModalBatchId) return

    try {
      const result = await createPrintJob.mutateAsync({
        batchId: exportModalBatchId,
        payload: {
          preset: 'A4',
          contentToggles: {
            showQrCode: true,
            showProductName: true,
            showSerialCode: true,
            showBranding: true,
            showScanText: true,
          },
        },
      })

      // Handle response: could be Blob (sync) or PrintJob object (async)
      const isPrintJob = result && typeof result === 'object' && 'status' in result
      
      if (isPrintJob) {
        const printJob = result as any
        const status = printJob.status?.toUpperCase()
        
        // Check if job is still processing
        if (status === 'PENDING' || status === 'PROCESSING') {
          toast.error("File in đang được xử lý. Vui lòng chờ và thử lại sau.")
          return
        }
        
        // Job completed - check for download URL
        const downloadUrl = printJob.pdfUrl || printJob.downloadUrl || printJob.fileUrl
        if (!downloadUrl && !printJob.blob) {
          toast.error("File in chưa sẵn sàng. Vui lòng thử lại sau.")
          return
        }
      }

      // Download the file (Blob from sync response)
      const blob = result instanceof Blob ? result : (result as any).blob
      
      if (!blob) {
        toast.error("Không thể tải file in. Vui lòng thử lại.")
        return
      }

      // Generate filename: qrverified-{batchCode}-A4-{yyyyMMdd-HHmm}.pdf
      const now = new Date()
      const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 12)
      const batchCode = exportModalBatchId.slice(0, 8)
      const fileName = `qrverified-${batchCode}-A4-${timestamp}.html`

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      
      toast.success("Đã tải file PDF tem QR thành công")
      setExportModalBatchId(null)
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

  function refetchAll() {
    dashboardQuery.refetch()
    batchesQuery.refetch()
    logsQuery.refetch()
    alertsQuery.refetch()
    printerProfileQuery.refetch()
  }

  // Dịch vụ IVS Trust không kết nối được (Cloud Run 503 / mất mạng / CORS chặn):
  // hiển thị trạng thái sự cố thay vì hàng loạt thẻ số 0 và bảng trống.
  const serviceDown = isServiceUnavailable(firstError)

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
          onClick={refetchAll}
          className="btn-secondary"
        >
          <RefreshCcw size={16} />
          Làm mới
        </button>
      </div>

      {serviceDown ? (
        <MaintenanceState onRetry={refetchAll} retrying={dashboardQuery.isFetching} />
      ) : (
        <>
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
                ) : batchesQuery.isError ? (
                  <EmptyRow 
                    colSpan={5} 
                    text={
                      batchesQuery.error instanceof IvsApiError
                        ? toErrorMessage(batchesQuery.error)
                        : "Không thể tải danh sách batch QR"
                    }
                  />
                ) : batchesQuery.data?.data.length ? (
                  batchesQuery.data.data.map((batch) => (
                    <tr key={batch.id}>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-700">{batch.id}</td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-sm font-medium text-neutral-800" title={(batch as any).productName ?? batch.productId}>
                        {(batch as any).productName ?? batch.productId}
                      </td>
                      <td className="px-4 py-3 font-semibold">{formatCount(batch.quantity)}</td>
                      <td className="px-4 py-3">
                        <StatusPill value={batch.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewCodesBatchId(batch.id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            title="Xem mã QR trong batch"
                          >
                            <FileText size={14} />
                            Xem mã
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedBatchForPrint(batch.id)
                              setPrintLayoutModalOpen(true)
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-brand-red-50 px-3 py-1.5 text-xs font-semibold text-brand-red-700 hover:bg-brand-red-100"
                            title="Tạo mẫu in để tải PDF"
                          >
                            <Printer size={14} />
                            Tạo mẫu in
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
                  <EmptyRow colSpan={5} text="Chưa có batch QR nào. Tạo batch đầu tiên ở form bên trái." />
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
        </>
      )}

      {/* QR Codes Preview Modal */}
      {viewCodesBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            <div className="mb-4 flex items-center justify-between border-b border-neutral-100 p-6">
              <h3 className="text-lg font-bold text-neutral-900">Mã QR - Batch {viewCodesBatchId.slice(0, 8)}</h3>
              <button
                type="button"
                onClick={() => setViewCodesBatchId(null)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {batchCodesQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-brand-red-500" />
                </div>
              ) : batchCodesQuery.data?.data.length ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {batchCodesQuery.data.data.map((qr, idx) => (
                    <div key={qr.id} className="rounded-lg border border-neutral-200 p-3 text-center">
                      <div className="mx-auto mb-2 flex h-24 w-24 items-center justify-center rounded bg-neutral-50 font-mono text-xs break-all">
                        {qr.qrCode.slice(0, 16)}...
                      </div>
                      <div className="text-xs font-semibold text-neutral-700">#{idx + 1}</div>
                      <div className="text-xs text-neutral-500 font-mono mt-1">{qr.serialNumber}</div>
                      <div className={`mt-1 text-xs font-semibold ${qr.isActive ? 'text-emerald-600' : 'text-neutral-400'}`}>
                        {qr.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-neutral-500">
                  Không có mã QR nào.
                </div>
              )}
            </div>

            <div className="border-t border-neutral-100 p-4 text-xs text-neutral-600">
              Tổng: {batchCodesQuery.data?.total || 0} mã QR
            </div>
          </div>
        </div>
      )}

      {/* Print Layout Creation Modal */}
      {printLayoutModalOpen && selectedBatchForPrint && (
        <PrintLayoutModal
          batchId={selectedBatchForPrint}
          onClose={() => {
            setPrintLayoutModalOpen(false)
            setSelectedBatchForPrint(null)
          }}
          printLayouts={printLayoutsQuery.data?.data || []}
          onCreateLayout={createPrintLayout}
          onCreatePrintJob={createPrintJob}
        />
      )}

      {/* Export PDF Modal */}
      {exportModalBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">Xuất file in tem QR</h3>
              <button
                type="button"
                onClick={() => setExportModalBatchId(null)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 rounded-lg bg-neutral-50 p-4 text-sm">
              <div className="mb-2 font-semibold text-neutral-700">Thông tin batch</div>
              <div className="space-y-1 text-xs text-neutral-600">
                <div>Batch ID: <code className="font-mono">{exportModalBatchId}</code></div>
                <div>Khổ giấy: <strong>A4 (210 x 297 mm)</strong></div>
                <div>Số tem: Đang tải...</div>
              </div>
            </div>

            <div className="mb-4 text-xs text-neutral-600">
              <p className="mb-1 font-semibold">Lưu ý:</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>File PDF sẽ chứa tất cả tem QR trong batch</li>
                <li>Mỗi tem có mã QR, serial, và thông tin sản phẩm</li>
                <li>Sau khi tải, bạn có thể in trực tiếp từ trình duyệt</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setExportModalBatchId(null)}
                className="btn-secondary flex-1 justify-center"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmExportPdf}
                disabled={createPrintJob.isPending}
                className="btn-primary flex-1 justify-center disabled:opacity-60"
              >
                {createPrintJob.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang tạo PDF...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Tải PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PrintLayoutModal({
  batchId,
  onClose,
  printLayouts,
  onCreateLayout,
  onCreatePrintJob,
}: {
  batchId: string
  onClose: () => void
  printLayouts: Array<{ id: string; name: string; preset: string }>
  onCreateLayout: any
  onCreatePrintJob: any
}) {
  const [step, setStep] = useState<'select' | 'create' | 'preview'>('select')
  const [layoutName, setLayoutName] = useState("")
  const [preset, setPreset] = useState("A4")
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [showQrCode, setShowQrCode] = useState(true)
  const [showProductName, setShowProductName] = useState(true)
  const [showSerialCode, setShowSerialCode] = useState(true)
  const [showBranding, setShowBranding] = useState(true)
  const [showScanText, setShowScanText] = useState(true)

  async function handleCreateLayout() {
    if (!layoutName) {
      toast.error("Vui lòng nhập tên mẫu in")
      return
    }

    try {
      const layout = await onCreateLayout.mutateAsync({
        name: layoutName,
        preset,
        orientation,
        showQrCode,
        showProductName,
        showSerialCode,
        showBranding,
        showScanText,
      })
      toast.success("Đã tạo mẫu in thành công")
      setStep('preview')
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

  async function handleGeneratePrint() {
    try {
      const result = await onCreatePrintJob.mutateAsync({
        batchId,
        payload: {
          preset,
          orientation,
          contentToggles: {
            showQrCode,
            showProductName,
            showSerialCode,
            showBranding,
            showScanText,
          },
        },
      })

      // Handle response: could be Blob (sync) or PrintJob object (async)
      const isPrintJob = result && typeof result === 'object' && 'status' in result
      
      if (isPrintJob) {
        const printJob = result as any
        const status = printJob.status?.toUpperCase()
        
        // Check if job is still processing
        if (status === 'PENDING' || status === 'PROCESSING') {
          toast.error("File in đang được xử lý. Vui lòng chờ và thử lại sau.")
          return
        }
        
        // Job completed - check for download URL
        const downloadUrl = printJob.pdfUrl || printJob.downloadUrl || printJob.fileUrl
        if (!downloadUrl && !printJob.blob) {
          toast.error("File in chưa sẵn sàng. Vui lòng thử lại sau.")
          return
        }
      }

      // Download the file (Blob from sync response)
      const blob = result instanceof Blob ? result : (result as any).blob
      
      if (!blob) {
        toast.error("Không thể tải file in. Vui lòng thử lại.")
        return
      }

      const now = new Date()
      const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 12)
      const batchCode = batchId.slice(0, 8)
      const fileName = `qrverified-${batchCode}-${preset}-${timestamp}.html`

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      
      toast.success("Đã tải file in thành công")
      onClose()
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        <div className="mb-4 flex items-center justify-between border-b border-neutral-100 p-6">
          <h3 className="text-lg font-bold text-neutral-900">
            {step === 'select' && 'Chọn hoặc tạo mẫu in'}
            {step === 'create' && 'Tạo mẫu in mới'}
            {step === 'preview' && 'Xem trước & Tải PDF'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 'select' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-600">
                Chọn mẫu in có sẵn hoặc tạo mẫu mới để tải PDF cho batch này.
              </p>

              {printLayouts.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Mẫu in có sẵn
                  </label>
                  <div className="space-y-2">
                    {printLayouts.map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => setStep('preview')}
                        className="w-full rounded-lg border border-neutral-200 p-3 text-left hover:bg-neutral-50"
                      >
                        <div className="font-semibold text-neutral-900">{layout.name}</div>
                        <div className="text-xs text-neutral-500">{layout.preset}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep('create')}
                className="btn-primary w-full justify-center"
              >
                <Plus size={16} />
                Tạo mẫu in mới
              </button>
            </div>
          )}

          {step === 'create' && (
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Tên mẫu in
                </span>
                <input
                  type="text"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                  placeholder="VD: A4 - Standard"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Khổ giấy
                </span>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                >
                  <option value="A4">A4 (210 x 297 mm)</option>
                  <option value="A5">A5 (148 x 210 mm)</option>
                  <option value="A3">A3 (297 x 420 mm)</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Hướng in
                </span>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                  className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                >
                  <option value="portrait">Dọc (Portrait)</option>
                  <option value="landscape">Ngang (Landscape)</option>
                </select>
              </label>

              <div className="space-y-2">
                <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Nội dung hiển thị
                </span>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showQrCode} onChange={(e) => setShowQrCode(e.target.checked)} />
                  <span className="text-sm">Mã QR</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showProductName} onChange={(e) => setShowProductName(e.target.checked)} />
                  <span className="text-sm">Tên sản phẩm</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showSerialCode} onChange={(e) => setShowSerialCode(e.target.checked)} />
                  <span className="text-sm">Serial</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showBranding} onChange={(e) => setShowBranding(e.target.checked)} />
                  <span className="text-sm">Branding</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={showScanText} onChange={(e) => setShowScanText(e.target.checked)} />
                  <span className="text-sm">Scan text</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep('select')} className="btn-secondary flex-1 justify-center">
                  Quay lại
                </button>
                <button onClick={handleCreateLayout} className="btn-primary flex-1 justify-center">
                  Tạo mẫu in
                </button>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-semibold">Chuẩn bị tạo file in tem QR</p>
                <p className="text-xs mt-1">Nhấn nút bên dưới để tạo và tải file PDF.</p>
              </div>

              <div className="rounded-lg bg-neutral-50 p-4 text-sm">
                <div className="space-y-1 text-xs text-neutral-600">
                  <div>Batch ID: <code className="font-mono">{batchId.slice(0, 8)}...</code></div>
                  <div>Khổ giấy: <strong>{preset}</strong></div>
                  <div>Hướng in: <strong>{orientation === 'portrait' ? 'Dọc' : 'Ngang'}</strong></div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary flex-1 justify-center">
                  Hủy
                </button>
                <button
                  onClick={handleGeneratePrint}
                  disabled={onCreatePrintJob.isPending}
                  className="btn-primary flex-1 justify-center disabled:opacity-60"
                >
                  {onCreatePrintJob.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Đang tạo PDF...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Tải PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
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
  if (!(error instanceof IvsApiError)) {
    return "Không thể kết nối IVS Trust API"
  }

  // Specific error messages based on HTTP status
  switch (error.status) {
    case 401:
      return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
    case 403:
      return "Gian hàng chưa đủ điều kiện xuất file in tem QR. Vui lòng hoàn tất xác thực."
    case 400:
      // Use backend validation message if available
      return error.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
    case 500:
      return "Server IVS Trust đang lỗi khi tạo file PDF. Vui lòng thử lại sau."
    default:
      return error.message || `Hệ thống trả lỗi ${error.status}. Vui lòng thử lại sau.`
  }
}

/**
 * Dịch vụ coi như "đang bảo trì" khi không có response hợp lệ từ backend:
 * status 0 = fetch lỗi (mất mạng / CORS chặn / Cloud Run trả 503 trước khi app
 * chạy nên không kèm header CORS); status >= 500 = backend lỗi server.
 */
function isServiceUnavailable(error: unknown): boolean {
  if (!(error instanceof IvsApiError)) return false
  return error.status === 0 || error.status >= 500
}

function MaintenanceState({
  onRetry,
  retrying,
}: {
  onRetry: () => void
  retrying?: boolean
}) {
  return (
    <div className="card flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="rounded-full bg-amber-50 p-4 text-amber-600">
        <ServerCrash size={32} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-neutral-900">
          Dịch vụ tem QR đang gặp sự cố
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
          Kết nối tới hệ thống QRVerified (IVS Trust Platform) đang bị gián đoạn.
          Đội ngũ kỹ thuật đang xử lý, mong bạn thông cảm và thử lại sau ít phút.
          Các phần khác của Seller Center vẫn hoạt động bình thường.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="btn-secondary disabled:opacity-60"
      >
        {retrying ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
        Thử lại
      </button>
    </div>
  )
}
