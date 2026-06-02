import type {
  Document as DocxDocument,
  Paragraph as DocxParagraph,
  Table as DocxTable,
} from "docx"
import { ACFMART_LEGAL_DISPLAY, ACFMART_REPRESENTATIVE } from "./legal-profile"

export type SellerDocumentBusinessType = "individual" | "household" | "company"

export interface SellerDocumentData {
  businessType: SellerDocumentBusinessType
  legalName: string
  shopName: string
  shopSlug: string
  description: string
  category: string
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  taxCode: string
  idCard: string
  address: string
  ward: string
  district: string
  city: string
  bankName: string
  accountNumber: string
  accountHolder: string
  sellsRegulatedGoods: boolean
  regulatedGoodsTypes: string[]
  regulatedGoodsNote: string
}

const PLATFORM_LEGAL_NAME = ACFMART_LEGAL_DISPLAY

const BUSINESS_TYPE_LABELS: Record<SellerDocumentBusinessType, string> = {
  individual: "Cá nhân",
  household: "Hộ kinh doanh",
  company: "Doanh nghiệp",
}

const SPECIAL_GOODS_LABELS: Record<string, string> = {
  imported: "Hàng nhập khẩu",
  alcohol: "Đồ uống có cồn",
  food: "Thực phẩm / đồ uống",
  health: "Sức khoẻ / thực phẩm chức năng",
  cosmetics: "Mỹ phẩm",
  conformity: "Hàng cần hợp quy / kiểm định",
}

type DocxApi = typeof import("docx")
type DocChild = DocxParagraph | DocxTable

let docxPromise: Promise<DocxApi> | null = null

function loadDocx() {
  docxPromise ??= import("docx")
  return docxPromise
}

function value(text: string | null | undefined) {
  return text?.trim() || "—"
}

function sellerLegalName(data: SellerDocumentData) {
  if (data.legalName.trim()) return data.legalName.trim()
  if (data.businessType === "individual") return value(data.ownerName)
  return value(data.shopName)
}

function fullAddress(data: SellerDocumentData) {
  return value([data.address, data.ward, data.district, data.city].filter(Boolean).join(", "))
}

function regulatedGoodsSummary(data: SellerDocumentData) {
  if (!data.sellsRegulatedGoods) return "Không"
  const labels = data.regulatedGoodsTypes
    .map((type) => SPECIAL_GOODS_LABELS[type] ?? type)
    .filter(Boolean)
  const note = data.regulatedGoodsNote.trim()
  return value([labels.join(", "), note].filter(Boolean).join(" - "))
}

function fileName(prefix: string, data: SellerDocumentData) {
  const slug = (data.shopSlug || data.shopName || data.ownerName || "seller")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return `${prefix}-${slug || "seller"}.docx`
}

function paragraph(
  docx: DocxApi,
  text: string,
  options: {
    bold?: boolean
    size?: number
    alignment?: string
    heading?: string
    spacingAfter?: number
  } = {}
) {
  return new docx.Paragraph({
    heading: options.heading,
    alignment: options.alignment,
    spacing: { after: options.spacingAfter ?? 120 },
    children: [
      new docx.TextRun({
        text,
        bold: options.bold,
        size: options.size,
      }),
    ],
  } as any)
}

function bullet(docx: DocxApi, text: string) {
  return new docx.Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new docx.TextRun({ text })],
  })
}

function noBorders(docx: DocxApi) {
  return {
    top: { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
    bottom: { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
    left: { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
    right: { style: docx.BorderStyle.NONE, size: 0, color: "FFFFFF" },
  }
}

function cell(docx: DocxApi, text: string, width: number, header = false) {
  return new docx.TableCell({
    width: { size: width, type: docx.WidthType.PERCENTAGE },
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
    shading: header ? { fill: "F8FAFC" } : undefined,
    borders: {
      top: { style: docx.BorderStyle.SINGLE, size: 1, color: "D9DEE8" },
      bottom: { style: docx.BorderStyle.SINGLE, size: 1, color: "D9DEE8" },
      left: { style: docx.BorderStyle.SINGLE, size: 1, color: "D9DEE8" },
      right: { style: docx.BorderStyle.SINGLE, size: 1, color: "D9DEE8" },
    },
    children: [
      new docx.Paragraph({
        children: [new docx.TextRun({ text: value(text), bold: header })],
      }),
    ],
  })
}

function fieldTable(docx: DocxApi, rows: Array<[string, string]>) {
  return new docx.Table({
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
    rows: rows.map(
      ([label, fieldValue]) =>
        new docx.TableRow({
          children: [cell(docx, label, 34, true), cell(docx, fieldValue, 66)],
        })
    ),
  })
}

function signatureTable(docx: DocxApi, leftTitle: string, rightTitle: string, rightName: string) {
  return new docx.Table({
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
    rows: [
      new docx.TableRow({
        children: [
          new docx.TableCell({
            width: { size: 50, type: docx.WidthType.PERCENTAGE },
            borders: noBorders(docx),
            children: [
              paragraph(docx, leftTitle, {
                bold: true,
                alignment: docx.AlignmentType.CENTER,
                spacingAfter: 80,
              }),
              paragraph(docx, "(Ký, ghi rõ họ tên)", {
                alignment: docx.AlignmentType.CENTER,
                spacingAfter: 900,
              }),
            ],
          }),
          new docx.TableCell({
            width: { size: 50, type: docx.WidthType.PERCENTAGE },
            borders: noBorders(docx),
            children: [
              paragraph(docx, rightTitle, {
                bold: true,
                alignment: docx.AlignmentType.CENTER,
                spacingAfter: 80,
              }),
              paragraph(docx, "(Ký, ghi rõ họ tên)", {
                alignment: docx.AlignmentType.CENTER,
                spacingAfter: 900,
              }),
              paragraph(docx, value(rightName), {
                bold: true,
                alignment: docx.AlignmentType.CENTER,
                spacingAfter: 0,
              }),
            ],
          }),
        ],
      }),
    ],
  })
}

function documentShell(docx: DocxApi, children: DocChild[]) {
  return new docx.Document({
    styles: {
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 30, bold: true, color: "111827" },
          paragraph: { spacing: { after: 180 } },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 24, bold: true, color: "111827" },
          paragraph: { spacing: { before: 180, after: 100 } },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 900,
              right: 900,
              bottom: 900,
              left: 900,
            },
          },
        },
        children,
      },
    ],
  })
}

function todayText() {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date())
}

function sellerRows(data: SellerDocumentData): Array<[string, string]> {
  return [
    ["Loại hình", BUSINESS_TYPE_LABELS[data.businessType]],
    ["Tên pháp lý", sellerLegalName(data)],
    ["Tên shop", data.shopName],
    ["Slug shop", data.shopSlug],
    ["Danh mục chính", data.category],
    ["Người đại diện", data.ownerName],
    ["Email", data.ownerEmail],
    ["Số điện thoại", data.ownerPhone],
    ["Mã số thuế", data.taxCode],
    ["CCCD/CMND", data.idCard],
    ["Địa chỉ lấy hàng", fullAddress(data)],
    ["Nhóm hàng cần giấy phép con", regulatedGoodsSummary(data)],
  ]
}

function bankRows(data: SellerDocumentData): Array<[string, string]> {
  return [
    ["Ngân hàng", data.bankName],
    ["Số tài khoản", data.accountNumber],
    ["Chủ tài khoản", data.accountHolder],
  ]
}

async function downloadDocx(docx: DocxApi, doc: DocxDocument, name: string) {
  const blob = await docx.Packer.toBlob(doc)
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement("a")
  link.href = url
  link.download = name
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function downloadSellerRegistrationDocument(data: SellerDocumentData) {
  const docx = await loadDocx()
  const children: DocChild[] = [
    paragraph(docx, "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", {
      bold: true,
      alignment: docx.AlignmentType.CENTER,
      spacingAfter: 40,
    }),
    paragraph(docx, "Độc lập - Tự do - Hạnh phúc", {
      bold: true,
      alignment: docx.AlignmentType.CENTER,
      spacingAfter: 260,
    }),
    paragraph(docx, "ĐƠN ĐĂNG KÝ TRỞ THÀNH NGƯỜI BÁN ACFMART", {
      heading: docx.HeadingLevel.HEADING_1,
      alignment: docx.AlignmentType.CENTER,
      spacingAfter: 220,
    }),
    paragraph(docx, `Kính gửi: ${PLATFORM_LEGAL_NAME}`),
    paragraph(
      docx,
      "Tôi/chúng tôi đăng ký tham gia bán hàng trên nền tảng ACFMart với các thông tin đã kê khai dưới đây.",
      { spacingAfter: 180 }
    ),
    paragraph(docx, "I. Thông tin người bán", { heading: docx.HeadingLevel.HEADING_2 }),
    fieldTable(docx, sellerRows(data)),
    paragraph(docx, "II. Tài khoản nhận thanh toán", { heading: docx.HeadingLevel.HEADING_2 }),
    fieldTable(docx, bankRows(data)),
    paragraph(docx, "III. Hồ sơ đính kèm", { heading: docx.HeadingLevel.HEADING_2 }),
    bullet(docx, "CCCD/CMND mặt trước và mặt sau của người đại diện."),
    bullet(docx, "Đơn đăng ký Seller đã ký."),
    bullet(docx, "Hợp đồng người bán đã ký."),
    ...(data.businessType !== "individual"
      ? [bullet(docx, "Giấy phép đăng ký kinh doanh hoặc giấy chứng nhận hộ kinh doanh.")]
      : []),
    ...(data.sellsRegulatedGoods
      ? [bullet(docx, "Giấy phép con/chứng từ chuyên ngành cho nhóm hàng đặc thù.")]
      : []),
    paragraph(docx, "IV. Cam kết", { heading: docx.HeadingLevel.HEADING_2 }),
    bullet(docx, "Cam kết thông tin kê khai và hồ sơ đính kèm là đúng sự thật, còn hiệu lực tại thời điểm nộp hồ sơ."),
    bullet(docx, "Cam kết chỉ kinh doanh hàng hóa hợp pháp, chính hãng, có nguồn gốc xuất xứ rõ ràng."),
    bullet(docx, "Đồng ý để IVS JSC sử dụng thông tin hồ sơ cho mục đích xác minh và vận hành gian hàng."),
    paragraph(docx, `Ngày tạo hồ sơ: ${todayText()}`, {
      alignment: docx.AlignmentType.RIGHT,
      spacingAfter: 180,
    }),
    signatureTable(docx, "ACFMart xác nhận", "Người đăng ký", data.ownerName),
  ]

  await downloadDocx(docx, documentShell(docx, children), fileName("don-dang-ky-seller", data))
}

export async function downloadSellerContractDocument(data: SellerDocumentData) {
  const docx = await loadDocx()
  const children: DocChild[] = [
    paragraph(docx, "HỢP ĐỒNG HỢP TÁC BÁN HÀNG TRÊN ACFMART", {
      heading: docx.HeadingLevel.HEADING_1,
      alignment: docx.AlignmentType.CENTER,
      spacingAfter: 100,
    }),
    paragraph(docx, `Ngày tạo dự thảo: ${todayText()}`, {
      alignment: docx.AlignmentType.CENTER,
      spacingAfter: 260,
    }),
    paragraph(docx, "Bên A - Đơn vị vận hành nền tảng", { heading: docx.HeadingLevel.HEADING_2 }),
    fieldTable(docx, [
      ["Tên pháp lý", PLATFORM_LEGAL_NAME],
      ["Nền tảng", "ACFMart"],
      ["Người đại diện", ACFMART_REPRESENTATIVE],
      ["Vai trò", "Đơn vị vận hành, cung cấp hạ tầng thương mại điện tử và công cụ quản lý gian hàng"],
    ]),
    paragraph(docx, "Bên B - Người bán", { heading: docx.HeadingLevel.HEADING_2 }),
    fieldTable(docx, sellerRows(data)),
    paragraph(docx, "Tài khoản nhận thanh toán của Bên B", { heading: docx.HeadingLevel.HEADING_2 }),
    fieldTable(docx, bankRows(data)),
    paragraph(docx, "Điều khoản hợp tác chính", { heading: docx.HeadingLevel.HEADING_2 }),
    bullet(docx, "Bên B đăng bán và chịu trách nhiệm về tính hợp pháp, chất lượng, nguồn gốc của hàng hóa/dịch vụ cung cấp trên ACFMart."),
    bullet(docx, "Bên B cam kết không kinh doanh hàng giả, hàng nhái, hàng cấm, hàng xâm phạm quyền sở hữu trí tuệ hoặc hàng hóa không đủ điều kiện lưu thông."),
    bullet(docx, "Đối với hàng nhập khẩu, có cồn, thực phẩm, mỹ phẩm, sức khỏe hoặc nhóm hàng cần quản lý chuyên ngành, Bên B phải cung cấp giấy phép/chứng từ hợp lệ trước khi kinh doanh."),
    bullet(docx, "IVS JSC được quyền tạm khóa gian hàng, gỡ sản phẩm hoặc yêu cầu bổ sung hồ sơ khi phát hiện rủi ro tuân thủ."),
    bullet(docx, "Thanh toán doanh thu được thực hiện về tài khoản Bên B đã đăng ký sau khi đối soát theo chính sách hiện hành của nền tảng."),
    bullet(docx, "Các chính sách phí, vận hành, xử lý khiếu nại và bảo vệ dữ liệu cá nhân được áp dụng theo bộ quy định công bố trên ACFMart tại từng thời điểm."),
    paragraph(docx, "Hai bên xác nhận đã đọc, hiểu và đồng ý ký kết hợp đồng này.", {
      spacingAfter: 240,
    }),
    signatureTable(docx, "Đại diện Bên A", "Đại diện Bên B", data.ownerName),
  ]

  await downloadDocx(docx, documentShell(docx, children), fileName("hop-dong-seller-acfmart", data))
}
