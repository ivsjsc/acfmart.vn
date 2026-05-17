import { useState, useEffect } from "react"
import { X, Plus, Trash2, Printer, Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { formatCurrency, formatDateTime } from "../../../../lib/format"
import { useCreateVatInvoice } from "../../../../hooks/use-seller-finance"
import type {
  VatInvoiceDoc,
  VatInvoiceLineItem,
} from "../../finance-types"

interface SellerInfo {
  shopName: string
  taxCode: string
  address: string
}

interface VatInvoiceModalProps {
  open: boolean
  onClose: () => void
  shopId: string
  seller: SellerInfo
  presetOrder?: {
    orderId: string
    orderCode: string
    paymentMethod: string
    items: VatInvoiceLineItem[]
  }
}

const EMPTY_ITEM: VatInvoiceLineItem = {
  description: "",
  quantity: 1,
  unitPrice: 0,
  vatRate: 10,
}

export function VatInvoiceModal({
  open,
  onClose,
  shopId,
  seller,
  presetOrder,
}: VatInvoiceModalProps) {
  const create = useCreateVatInvoice()
  const [issued, setIssued] = useState<VatInvoiceDoc | null>(null)

  // Form state
  const [buyerName, setBuyerName] = useState("")
  const [buyerTaxCode, setBuyerTaxCode] = useState("")
  const [buyerAddress, setBuyerAddress] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [items, setItems] = useState<VatInvoiceLineItem[]>([EMPTY_ITEM])
  const [paymentMethod, setPaymentMethod] = useState("Chuyển khoản")
  const [note, setNote] = useState("")

  useEffect(() => {
    if (open && presetOrder) {
      setItems(presetOrder.items.length > 0 ? presetOrder.items : [EMPTY_ITEM])
      setPaymentMethod(presetOrder.paymentMethod || "Chuyển khoản")
    }
  }, [open, presetOrder])

  if (!open) return null

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0)
  const vatAmount = items.reduce((s, it) => s + it.quantity * it.unitPrice * (it.vatRate / 100), 0)
  const total = subtotal + vatAmount

  const canSubmit =
    buyerName.trim() &&
    buyerTaxCode.trim() &&
    buyerAddress.trim() &&
    items.every((it) => it.description.trim() && it.quantity > 0 && it.unitPrice > 0)

  const handleAddItem = () => setItems((arr) => [...arr, { ...EMPTY_ITEM }])
  const handleRemoveItem = (i: number) =>
    setItems((arr) => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr))
  const handleItemChange = (i: number, patch: Partial<VatInvoiceLineItem>) =>
    setItems((arr) => arr.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))

  const handleSubmit = async () => {
    try {
      const result = await create.mutateAsync({
        shopId,
        orderId: presetOrder?.orderId ?? null,
        orderCode: presetOrder?.orderCode ?? null,
        buyer: {
          name: buyerName.trim(),
          taxCode: buyerTaxCode.trim(),
          address: buyerAddress.trim(),
          email: buyerEmail.trim() || null,
        },
        seller,
        items,
        paymentMethod,
        note: note.trim() || null,
      })
      setIssued(result)
      toast.success(`Đã phát hành hoá đơn ${result.series}-${result.invoiceNumber}`)
    } catch (err) {
      toast.error("Không phát hành được hoá đơn. Vui lòng thử lại.")
      console.error(err)
    }
  }

  const handlePrint = () => {
    if (!issued) return
    printInvoice(issued)
  }

  const handleClose = () => {
    setIssued(null)
    setBuyerName("")
    setBuyerTaxCode("")
    setBuyerAddress("")
    setBuyerEmail("")
    setItems([EMPTY_ITEM])
    setNote("")
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-2 md:items-center md:p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 p-4">
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              {issued ? "Hoá đơn đã phát hành" : "Tạo hoá đơn VAT"}
            </h2>
            {issued && (
              <p className="text-xs text-neutral-500">
                Số: <strong className="text-brand-red-600">{issued.series}-{issued.invoiceNumber}</strong>
                {" · "}
                {formatDateTime(issued.issuedAt.toDate())}
              </p>
            )}
          </div>
          <button onClick={handleClose} className="rounded-full p-2 hover:bg-neutral-100">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {issued ? (
            <InvoicePreview invoice={issued} />
          ) : (
            <div className="space-y-5">
              {/* Buyer info */}
              <fieldset>
                <legend className="mb-2 text-sm font-bold text-neutral-900">Thông tin người mua</legend>
                <div className="grid gap-3 md:grid-cols-2">
                  <input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Tên đơn vị / cá nhân *"
                    className="input text-sm"
                  />
                  <input
                    value={buyerTaxCode}
                    onChange={(e) => setBuyerTaxCode(e.target.value)}
                    placeholder="Mã số thuế *"
                    className="input text-sm"
                  />
                  <input
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    placeholder="Địa chỉ *"
                    className="input text-sm md:col-span-2"
                  />
                  <input
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    type="email"
                    placeholder="Email nhận hoá đơn (tuỳ chọn)"
                    className="input text-sm md:col-span-2"
                  />
                </div>
              </fieldset>

              {/* Items */}
              <fieldset>
                <div className="mb-2 flex items-center justify-between">
                  <legend className="text-sm font-bold text-neutral-900">Hàng hoá / dịch vụ</legend>
                  <button onClick={handleAddItem} className="text-xs font-semibold text-brand-red-600 hover:underline">
                    <Plus size={12} className="inline" /> Thêm dòng
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((it, i) => (
                    <div key={i} className="grid gap-2 rounded-lg border border-neutral-200 p-3 md:grid-cols-[1fr_80px_140px_80px_32px]">
                      <input
                        value={it.description}
                        onChange={(e) => handleItemChange(i, { description: e.target.value })}
                        placeholder="Mô tả hàng hoá *"
                        className="input text-sm"
                      />
                      <input
                        type="number"
                        value={it.quantity}
                        onChange={(e) => handleItemChange(i, { quantity: Number(e.target.value) })}
                        min={1}
                        placeholder="SL"
                        className="input text-sm"
                      />
                      <input
                        type="number"
                        value={it.unitPrice}
                        onChange={(e) => handleItemChange(i, { unitPrice: Number(e.target.value) })}
                        min={0}
                        placeholder="Đơn giá"
                        className="input text-sm"
                      />
                      <select
                        value={it.vatRate}
                        onChange={(e) => handleItemChange(i, { vatRate: Number(e.target.value) })}
                        className="input text-sm"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={8}>8%</option>
                        <option value={10}>10%</option>
                      </select>
                      <button
                        onClick={() => handleRemoveItem(i)}
                        disabled={items.length === 1}
                        className="rounded p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </fieldset>

              {/* Payment + note */}
              <fieldset className="grid gap-3 md:grid-cols-2">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input text-sm"
                >
                  <option>Tiền mặt</option>
                  <option>Chuyển khoản</option>
                  <option>Thẻ tín dụng</option>
                  <option>Ví điện tử</option>
                </select>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú (tuỳ chọn)"
                  className="input text-sm"
                />
              </fieldset>

              {/* Summary */}
              <div className="rounded-lg bg-neutral-50 p-4">
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-600">Cộng tiền hàng</dt>
                    <dd className="font-semibold">{formatCurrency(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-600">Thuế GTGT</dt>
                    <dd className="font-semibold">{formatCurrency(vatAmount)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-neutral-200 pt-2">
                    <dt className="font-bold text-neutral-900">Tổng thanh toán</dt>
                    <dd className="text-lg font-extrabold text-brand-red-600">{formatCurrency(total)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-neutral-100 bg-neutral-50 p-4">
          {issued ? (
            <>
              <button onClick={handleClose} className="btn-secondary text-sm">
                Đóng
              </button>
              <button onClick={handlePrint} className="btn-primary text-sm">
                <Printer size={14} />
                In / Lưu PDF
              </button>
            </>
          ) : (
            <>
              <button onClick={handleClose} className="btn-secondary text-sm">
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || create.isPending}
                className="btn-primary text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {create.isPending && <Loader2 size={14} className="animate-spin" />}
                Phát hành hoá đơn
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function InvoicePreview({ invoice }: { invoice: VatInvoiceDoc }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-5 text-sm">
      <div className="text-center">
        <div className="text-xs text-neutral-500">HOÁ ĐƠN GIÁ TRỊ GIA TĂNG</div>
        <div className="mt-1 text-base font-bold text-neutral-900">
          {invoice.series}-{invoice.invoiceNumber}
        </div>
        <div className="text-xs text-neutral-500">
          Ngày {formatDateTime(invoice.issuedAt.toDate())}
        </div>
      </div>
      <hr className="my-4 border-neutral-200" />
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs font-bold uppercase text-neutral-500">Bên bán</div>
          <div className="mt-1 font-semibold">{invoice.seller.shopName}</div>
          <div className="text-xs text-neutral-600">MST: {invoice.seller.taxCode}</div>
          <div className="text-xs text-neutral-600">{invoice.seller.address}</div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase text-neutral-500">Bên mua</div>
          <div className="mt-1 font-semibold">{invoice.buyer.name}</div>
          <div className="text-xs text-neutral-600">MST: {invoice.buyer.taxCode}</div>
          <div className="text-xs text-neutral-600">{invoice.buyer.address}</div>
        </div>
      </div>
      <table className="mt-4 w-full text-xs">
        <thead className="border-b border-neutral-200 text-left">
          <tr>
            <th className="py-2">Diễn giải</th>
            <th className="py-2 text-right">SL</th>
            <th className="py-2 text-right">Đơn giá</th>
            <th className="py-2 text-right">VAT</th>
            <th className="py-2 text-right">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={i} className="border-b border-neutral-100">
              <td className="py-2">{it.description}</td>
              <td className="py-2 text-right">{it.quantity}</td>
              <td className="py-2 text-right">{formatCurrency(it.unitPrice)}</td>
              <td className="py-2 text-right">{it.vatRate}%</td>
              <td className="py-2 text-right font-semibold">
                {formatCurrency(it.quantity * it.unitPrice * (1 + it.vatRate / 100))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <dl className="mt-4 space-y-1 text-right">
        <div>
          Cộng tiền hàng: <strong>{formatCurrency(invoice.subtotal)}</strong>
        </div>
        <div>
          Thuế GTGT: <strong>{formatCurrency(invoice.vatAmount)}</strong>
        </div>
        <div className="text-base">
          Tổng thanh toán: <strong className="text-brand-red-600">{formatCurrency(invoice.total)}</strong>
        </div>
      </dl>
    </div>
  )
}

function printInvoice(invoice: VatInvoiceDoc): void {
  const win = window.open("", "_blank", "width=900,height=700")
  if (!win) {
    toast.error("Trình duyệt chặn cửa sổ in. Cho phép pop-up rồi thử lại.")
    return
  }
  const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Hoá đơn ${invoice.series}-${invoice.invoiceNumber}</title>
<style>
  body { font-family: 'Be Vietnam Pro', system-ui, sans-serif; padding: 32px; color: #111; }
  h1 { text-align: center; font-size: 18px; margin: 0; }
  .meta { text-align: center; color: #666; font-size: 12px; margin-top: 4px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
  .label { font-size: 11px; text-transform: uppercase; color: #666; font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
  th, td { padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: left; }
  th { background: #f9fafb; }
  .right { text-align: right; }
  .totals { margin-top: 16px; text-align: right; font-size: 14px; line-height: 1.6; }
  .totals strong { color: #dc2626; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
  @media print { body { padding: 16px; } }
</style>
</head>
<body>
<h1>HOÁ ĐƠN GIÁ TRỊ GIA TĂNG</h1>
<div class="meta">${invoice.series}-${invoice.invoiceNumber} · ${formatDateTime(invoice.issuedAt.toDate())}</div>
<hr/>
<div class="grid">
  <div>
    <div class="label">Bên bán</div>
    <div><strong>${escapeHtml(invoice.seller.shopName)}</strong></div>
    <div>MST: ${escapeHtml(invoice.seller.taxCode)}</div>
    <div>${escapeHtml(invoice.seller.address)}</div>
  </div>
  <div>
    <div class="label">Bên mua</div>
    <div><strong>${escapeHtml(invoice.buyer.name)}</strong></div>
    <div>MST: ${escapeHtml(invoice.buyer.taxCode)}</div>
    <div>${escapeHtml(invoice.buyer.address)}</div>
  </div>
</div>
<table>
  <thead>
    <tr><th>Diễn giải</th><th class="right">SL</th><th class="right">Đơn giá</th><th class="right">VAT</th><th class="right">Thành tiền</th></tr>
  </thead>
  <tbody>
    ${invoice.items
      .map(
        (it) => `<tr>
      <td>${escapeHtml(it.description)}</td>
      <td class="right">${it.quantity}</td>
      <td class="right">${formatCurrency(it.unitPrice)}</td>
      <td class="right">${it.vatRate}%</td>
      <td class="right"><strong>${formatCurrency(it.quantity * it.unitPrice * (1 + it.vatRate / 100))}</strong></td>
    </tr>`,
      )
      .join("")}
  </tbody>
</table>
<div class="totals">
  <div>Cộng tiền hàng: <strong>${formatCurrency(invoice.subtotal)}</strong></div>
  <div>Thuế GTGT: <strong>${formatCurrency(invoice.vatAmount)}</strong></div>
  <div style="font-size:16px">Tổng thanh toán: <strong>${formatCurrency(invoice.total)}</strong></div>
</div>
${invoice.note ? `<p style="margin-top:24px;font-size:12px;color:#555">Ghi chú: ${escapeHtml(invoice.note)}</p>` : ""}
<script>window.onload = () => { window.print(); };</script>
</body>
</html>`
  win.document.open()
  win.document.write(html)
  win.document.close()
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      case "'":
        return "&#39;"
      default:
        return c
    }
  })
}
