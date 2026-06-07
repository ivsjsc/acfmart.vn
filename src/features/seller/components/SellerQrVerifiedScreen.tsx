import { type FormEvent, type ReactNode, useMemo, useState } from "react"
import toast from "react-hot-toast"
import {
  AlertTriangle,
  Download,
  Eye,
  FileText,
  Loader2,
  Package,
  Plus,
  Printer,
  RefreshCcw,
  ServerCrash,
  ShieldCheck,
  X,
  ExternalLink,
} from "lucide-react"
import { useSellerProducts } from "../../../hooks/use-products"
import {
  useActivateIvsSellerQrBatch,
  useCreateIvsSellerQrBatch,
  useIvsSellerPrinterProfile,
  useIvsSellerQrBatches,
  useIvsSellerQrDashboard,
  useIvsSellerSuspiciousAlerts,
  useIvsSellerVerificationLogs,
  useIvsSellerQrBatchCodes,
  useIvsSellerQrPrintLayouts,
  useCreateIvsSellerQrPrintLayout,
  useCreateIvsSellerQrPrintJob,
  useDownloadIvsSellerQrPrintJob,
} from "../../../hooks/use-ivs-seller-qr"
import { IvsApiError, upsertSellerProduct, type IvsPrintLayout, type IvsPrintJob } from "../../../lib/ivs-trust-api"
import { cn } from "../../../lib/cn"

export default function SellerQrVerifiedScreen() {
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedSkuId, setSelectedSkuId] = useState("")
  const [quantity, setQuantity] = useState(100)

  // Modals state
  const [viewCodesBatchId, setViewCodesBatchId] = useState<string | null>(null)
  const [printModalBatchId, setPrintModalBatchId] = useState<string | null>(null)

  // Print flow state
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("")
  const [createdPrintJob, setCreatedPrintJob] = useState<IvsPrintJob | null>(null)

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
  const activateBatch = useActivateIvsSellerQrBatch()

  // Codes
  const { data: batchCodes = [], isLoading: isLoadingCodes } = useIvsSellerQrBatchCodes(viewCodesBatchId)

  // Print Flow
  const { data: layouts = [], isLoading: isLoadingLayouts } = useIvsSellerQrPrintLayouts()
  const createLayout = useCreateIvsSellerQrPrintLayout()
  const createPrintJob = useCreateIvsSellerQrPrintJob()
  const downloadPrintJob = useDownloadIvsSellerQrPrintJob()

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

  async function handleActivateBatch(batchId: string) {
    try {
      const result = await activateBatch.mutateAsync(batchId)
      const count = result.activated ?? result.quantity
      toast.success(`Đã kích hoạt ${count} tem — khách quét sẽ thấy "Chính hãng"`)
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

  async function handleCreateDefaultLayout() {
    try {
      const layout = await createLayout.mutateAsync({
        name: "Mẫu A4 mặc định",
        paperSize: "A4",
        isDefault: true
      })
      setSelectedLayoutId(layout.id || layout.layoutId || "")
      toast.success("Đã tạo mẫu in mặc định")
    } catch (error) {
      toast.error("Không thể tạo mẫu mặc định")
    }
  }

  async function handleStartPrintJob() {
    if (!printModalBatchId || !selectedLayoutId) return

    try {
      const job = await createPrintJob.mutateAsync({
        batchId: printModalBatchId,
        layoutId: selectedLayoutId
      })
      setCreatedPrintJob(job)
      toast.success("Đã tạo lệnh in thành công")
    } catch (error) {
      toast.error(toErrorMessage(error))
    }
  }

  async function handleDownloadJob() {
    const jobId = createdPrintJob?.id || createdPrintJob?.jobId
    if (!jobId) return

    try {
      const blob = await downloadPrintJob.mutateAsync(jobId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `print-job-${jobId}.pdf`
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      toast.error("Tải file thất bại")
    }
  }

  function refetchAll() {
    dashboardQuery.refetch()
    batchesQuery.refetch()
    logsQuery.refetch()
    alertsQuery.refetch()
    printerProfileQuery.refetch()
  }

  const serviceDown = isServiceUnavailable(firstError)

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 lg:text-3xl">QRVerified by IVS</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Tạo batch tem QR, quản lý mẫu in và theo dõi quét từ IVS Trust Platform API.
          </p>
        </div>
        <button type="button" onClick={refetchAll} className="btn-secondary">
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
                          <td
                            className="max-w-[200px] truncate px-4 py-3 text-sm font-medium text-neutral-800"
                            title={(batch as any).productName ?? batch.productId}
                          >
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
                                className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
                              >
                                <Eye size={14} />
                                Xem mã
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPrintModalBatchId(batch.id)
                                  setCreatedPrintJob(null)
                                }}
                                className="inline-flex items-center gap-1 rounded-lg bg-brand-red-50 px-3 py-1.5 text-xs font-semibold text-brand-red-700 hover:bg-brand-red-100"
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
                                {activateBatch.isPending ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <ShieldCheck size={14} />
                                )}
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

      {/* View Codes Modal */}
      {viewCodesBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">Danh sách mã QR batch {viewCodesBatchId.slice(0,8)}</h3>
              <button
                type="button"
                onClick={() => setViewCodesBatchId(null)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {isLoadingCodes ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-500">
                  <Loader2 size={32} className="animate-spin text-brand-red-500" />
                  <p>Đang tải danh sách mã...</p>
                </div>
              ) : batchCodes.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Public Code</th>
                      <th className="px-3 py-2 font-semibold">Serial</th>
                      <th className="px-3 py-2 font-semibold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {batchCodes.map((code, idx) => (
                      <tr key={code.id || idx}>
                        <td className="px-3 py-2 font-mono text-xs">{code.publicCode || code.code || code.token || "-"}</td>
                        <td className="px-3 py-2 font-mono text-xs">{code.serialCode || code.serial || "-"}</td>
                        <td className="px-3 py-2">
                           <StatusPill value={code.status || "UNKNOWN"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-20 text-center text-neutral-500">
                  Không tìm thấy mã nào trong batch này.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-neutral-100 bg-neutral-50 flex justify-end">
              <button
                type="button"
                onClick={() => setViewCodesBatchId(null)}
                className="btn-secondary px-6"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Flow Modal */}
      {printModalBatchId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900">
                {createdPrintJob ? "Kết quả tạo file in" : "Tạo file in tem QR"}
              </h3>
              <button
                type="button"
                onClick={() => setPrintModalBatchId(null)}
                className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100"
              >
                <X size={20} />
              </button>
            </div>

            {!createdPrintJob ? (
              <>
                <div className="mb-6 space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      Chọn mẫu in
                    </label>
                    <div className="space-y-2">
                      {isLoadingLayouts ? (
                        <div className="flex items-center gap-2 py-2 text-sm text-neutral-500">
                          <Loader2 size={16} className="animate-spin" /> Đang tải mẫu...
                        </div>
                      ) : layouts.length > 0 ? (
                        <select
                          value={selectedLayoutId}
                          onChange={(e) => setSelectedLayoutId(e.target.value)}
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm"
                        >
                          <option value="">-- Chọn mẫu in --</option>
                          {layouts.map((l) => (
                            <option key={l.id || l.layoutId} value={l.id || l.layoutId}>
                              {l.name || l.title || "Mẫu không tên"} ({l.paperSize})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="rounded-lg border border-dashed border-neutral-200 p-4 text-center">
                           <p className="text-xs text-neutral-500 mb-2">Bạn chưa có mẫu in nào.</p>
                           <button
                             onClick={handleCreateDefaultLayout}
                             disabled={createLayout.isPending}
                             className="text-xs font-bold text-brand-red-600 hover:underline inline-flex items-center gap-1"
                           >
                             {createLayout.isPending && <Loader2 size={12} className="animate-spin" />}
                             Tạo mẫu mặc định
                           </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-neutral-50 p-4 text-sm">
                    <div className="mb-2 font-semibold text-neutral-700">Thông tin lô tem</div>
                    <div className="space-y-1 text-xs text-neutral-600">
                      <div>Batch ID: <code className="font-mono">{printModalBatchId.slice(0,8)}</code></div>
                      <div>Mã sản phẩm: <strong>{batchesQuery.data?.data.find(b => b.id === printModalBatchId)?.productId}</strong></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPrintModalBatchId(null)}
                    className="btn-secondary flex-1 justify-center"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleStartPrintJob}
                    disabled={createPrintJob.isPending || !selectedLayoutId}
                    className="btn-primary flex-1 justify-center disabled:opacity-60"
                  >
                    {createPrintJob.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Đang tạo file...
                      </>
                    ) : (
                      <>
                        <FileText size={16} />
                        Tạo file in
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 space-y-4">
                  {['PENDING', 'PROCESSING'].includes(createdPrintJob.status?.toUpperCase() || '') ? (
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
                      <div className="mb-2 inline-flex rounded-full bg-blue-100 p-2 text-blue-600">
                        <Loader2 size={24} className="animate-spin" />
                      </div>
                      <h4 className="font-bold text-blue-900">Đang xử lý file in...</h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Hệ thống đang khởi tạo file PDF. Vui lòng đợi trong giây lát.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                      <div className="mb-2 inline-flex rounded-full bg-emerald-100 p-2 text-emerald-600">
                        <ShieldCheck size={24} />
                      </div>
                      <h4 className="font-bold text-emerald-900">
                        {createdPrintJob.status ? "Lệnh in đã sẵn sàng" : "Lệnh in đã được tạo"}
                      </h4>
                      <p className="text-xs text-emerald-700 mt-1">
                        {createdPrintJob.status
                          ? "File in tem QR đã được hệ thống xử lý xong."
                          : "Bạn có thể thử tải file in hoặc đợi hệ thống xử lý hoàn tất."}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">Job ID</span>
                      <span className="font-mono text-neutral-700">{createdPrintJob.id || createdPrintJob.jobId}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-neutral-100">
                      <span className="text-neutral-500">Trạng thái</span>
                      <StatusPill value={createdPrintJob.status || "UNKNOWN"} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadJob}
                    disabled={['PENDING', 'PROCESSING'].includes(createdPrintJob.status?.toUpperCase() || '')}
                    className="btn-primary w-full justify-center disabled:opacity-50"
                  >
                    <Download size={16} />
                    Tải file in (PDF)
                  </button>

                  {(createdPrintJob.pdfUrl || createdPrintJob.downloadUrl || createdPrintJob.fileUrl) && (
                    <a
                      href={createdPrintJob.pdfUrl || createdPrintJob.downloadUrl || createdPrintJob.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary w-full justify-center"
                    >
                      <ExternalLink size={16} />
                      Xem trực tiếp
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setPrintModalBatchId(null)}
                    className="text-center text-xs text-neutral-500 mt-2 hover:underline"
                  >
                    Quay lại danh sách batch
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
      <div className="mt-1 text-2xl font-extrabold text-neutral-900">{loading ? "..." : value}</div>
    </div>
  )
}

function StatusPill({ value }: { value: string }) {
  const normalized = value.toUpperCase()
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        normalized === "ACTIVATED" || normalized === "ACTIVE" || normalized === "COMPLETED"
          ? "bg-emerald-50 text-emerald-700"
          : normalized === "VOIDED" || normalized === "FAILED" || normalized === "ERROR"
            ? "bg-red-50 text-brand-red-700"
            : "bg-blue-50 text-blue-700"
      )}
    >
      {value}
    </span>
  )
}

function DataPanel({ title, total, children }: { title: string; total?: number; children: ReactNode }) {
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

  switch (error.status) {
    case 401:
      return "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
    case 403:
      return "Gian hàng chưa đủ điều kiện xuất file in tem QR. Vui lòng hoàn tất xác thực."
    case 400:
      return error.message || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại."
    case 500:
      return "Server IVS Trust đang lỗi. Vui lòng thử lại sau."
    default:
      return error.message || `Hệ thống trả lỗi ${error.status}. Vui lòng thử lại sau.`
  }
}

function isServiceUnavailable(error: unknown): boolean {
  if (!(error instanceof IvsApiError)) return false
  return error.status === 0 || error.status >= 500
}

function MaintenanceState({ onRetry, retrying }: { onRetry: () => void; retrying?: boolean }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <div className="rounded-full bg-amber-50 p-4 text-amber-600">
        <ServerCrash size={32} />
      </div>
      <div>
        <h2 className="text-lg font-bold text-neutral-900">Dịch vụ tem QR đang gặp sự cố</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600">
          Kết nối tới hệ thống QRVerified (IVS Trust Platform) đang bị gián đoạn. Đội ngũ kỹ thuật đang xử lý, mong bạn
          thông cảm và thử lại sau ít phút. Các phần khác của Seller Center vẫn hoạt động bình thường.
        </p>
      </div>
      <button type="button" onClick={onRetry} disabled={retrying} className="btn-secondary disabled:opacity-60">
        {retrying ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
        Thử lại
      </button>
    </div>
  )
}
