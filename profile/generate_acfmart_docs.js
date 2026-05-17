const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  LevelFormat, HeadingLevel, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');

// ── SHARED CONSTANTS ──────────────────────────────────────────────────────────
const CO = 'CÔNG TY CỔ PHẦN ACFMART TECHNOLOGY';
const CO_SHORT = 'ACFMART TECHNOLOGY JSC';
const MST = '[Điền MST sau khi đăng ký]';
const NGAY_CAP = '[Điền ngày cấp]';
const NOI_CAP = 'Phòng Đăng ký kinh doanh – Sở Kế hoạch và Đầu tư tỉnh Đồng Nai';
const DAIDIEN = 'Ông NGUYỄN MINH TRIẾT';
const CHUC_DANH = 'Tổng Giám đốc';
const DIA_CHI = '[Điền địa chỉ trụ sở tại Đồng Nai]';
const EMAIL = 'support@acfmart.vn';
const SDT = '1900 066 689';
const VON = '10.000.000.000 VNĐ (Mười tỷ đồng)';
const NGANH = '6312 – Cổng thông tin điện tử (Sàn giao dịch TMĐT)';
const URL_DEMO = 'https://ecommerceacf.web.app/';
const URL_PROD = 'https://acfmart.vn';
const NGAY_HS = '…… tháng 05 năm 2026';

// IVS JSC (chủ sở hữu tên miền / đối tác kỹ thuật)
const IVS = 'CÔNG TY CP DỊCH VỤ THƯƠNG MẠI INTEGRATE VISION SYNERGY (IVS JSC)';
const IVS_MST = '3603960189';

// ── HELPERS ───────────────────────────────────────────────────────────────────
const A4 = { width: 11906, height: 16838 };
const MARGIN = { top: 1134, right: 1134, bottom: 1134, left: 1701 };

function pageProps() {
  return { properties: { page: { size: A4, margin: MARGIN } } };
}

function border(color='999999') {
  return { style: BorderStyle.SINGLE, size: 1, color };
}
const BORDERS = {
  top: border(), bottom: border(), left: border(), right: border()
};
const BORDERS_NONE = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

const cellM = { top: 80, bottom: 80, left: 120, right: 120 };

function bold(text, size=24) {
  return new TextRun({ text, bold: true, size, font: 'Times New Roman' });
}
function normal(text, size=24) {
  return new TextRun({ text, size, font: 'Times New Roman' });
}
function italic(text, size=24) {
  return new TextRun({ text, italics: true, size, font: 'Times New Roman' });
}

function para(children, opts={}) {
  return new Paragraph({ children, ...opts });
}
function paraBold(text, align=AlignmentType.CENTER, size=24) {
  return para([bold(text, size)], { alignment: align });
}
function paraCenter(text, size=24) {
  return para([new TextRun({ text, size, font: 'Times New Roman' })], { alignment: AlignmentType.CENTER });
}
function paraLeft(text, size=24) {
  return para([normal(text, size)], { alignment: AlignmentType.LEFT });
}
function paraItalicCenter(text, size=24) {
  return para([italic(text, size)], { alignment: AlignmentType.CENTER });
}
function empty(n=1) {
  return Array.from({ length: n }, () => para([normal('')]));
}

function hdr(text) {
  return [
    paraBold('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', AlignmentType.CENTER, 26),
    paraBold('Độc lập – Tự do – Hạnh phúc', AlignmentType.CENTER, 24),
    paraCenter('──────────────────────────'),
    ...empty(1),
  ];
}

function signBlock(role='TỔNG GIÁM ĐỐC') {
  return [
    ...empty(1),
    para([normal('Đồng Nai, ngày ' + NGAY_HS, 24)], { alignment: AlignmentType.RIGHT }),
    ...empty(1),
    paraBold(role, AlignmentType.CENTER),
    paraCenter(CO_SHORT),
    paraItalicCenter('(Ký, ghi rõ họ tên, đóng dấu)'),
    ...empty(3),
    paraBold(DAIDIEN, AlignmentType.CENTER),
    paraCenter(CHUC_DANH),
  ];
}

function makeTable(rows, colWidths) {
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map(row => new TableRow({
      children: row.map((cell, i) => new TableCell({
        borders: BORDERS,
        width: { size: colWidths[i], type: WidthType.DXA },
        margins: cellM,
        shading: { fill: cell.fill || 'FFFFFF', type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        children: Array.isArray(cell.content)
          ? cell.content
          : [para(Array.isArray(cell.runs) ? cell.runs : [normal(cell.text||'', 22)])]
      }))
    }))
  });
}

function doc1() {
  const body = [
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [4500, 4526],
      rows: [new TableRow({ children: [
        new TableCell({ borders: BORDERS_NONE, width: { size: 4500, type: WidthType.DXA }, children: [
          para([bold(CO, 22)]),
          para([normal('────────────────', 22)]),
          para([normal('Số: 001/2026/ĐK-ACFMart', 22)]),
        ]}),
        new TableCell({ borders: BORDERS_NONE, width: { size: 4526, type: WidthType.DXA }, children: [
          paraBold('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', AlignmentType.CENTER, 22),
          paraBold('Độc lập – Tự do – Hạnh phúc', AlignmentType.CENTER, 22),
          paraCenter('──────────────────'),
        ]}),
      ]})],
    }),
    ...empty(1),
    para([normal('Đồng Nai, ngày ' + NGAY_HS, 22)], { alignment: AlignmentType.RIGHT }),
    ...empty(1),
    paraBold('ĐƠN ĐĂNG KÝ ỨNG DỤNG CUNG CẤP', AlignmentType.CENTER, 28),
    paraBold('DỊCH VỤ THƯƠNG MẠI ĐIỆN TỬ', AlignmentType.CENTER, 28),
    paraItalicCenter('(Ban hành kèm theo Thông tư số 59/2015/TT-BCT)', 22),
    ...empty(1),
    para([normal('Kính gửi: ', 24), bold('Cục Thương mại điện tử và Kinh tế số – Bộ Công Thương', 24)]),
    ...empty(1),
    paraBold('1. THÔNG TIN VỀ THƯƠNG NHÂN/TỔ CHỨC', AlignmentType.LEFT),
    makeTable([
      [{ runs: [bold('Tên tổ chức:', 22)], fill:'EBF3FF' }, { text: CO }],
      [{ runs: [bold('Tên giao dịch:', 22)], fill:'EBF3FF' }, { text: 'ACFMART TECHNOLOGY JSC / Sàn TMĐT ACFMart' }],
      [{ runs: [bold('Người đại diện pháp luật:', 22)], fill:'EBF3FF' }, { runs: [bold(DAIDIEN + ' – ' + CHUC_DANH, 22)] }],
      [{ runs: [bold('Địa chỉ trụ sở:', 22)], fill:'EBF3FF' }, { text: DIA_CHI }],
      [{ runs: [bold('Điện thoại:', 22)], fill:'EBF3FF' }, { text: SDT + '  |  Email: ' + EMAIL }],
      [{ runs: [bold('Giấy CNĐKKD số:', 22)], fill:'EBF3FF' }, { text: MST }],
      [{ runs: [bold('Ngày cấp:', 22)], fill:'EBF3FF' }, { text: NGAY_CAP + '    Nơi cấp: ' + NOI_CAP }],
      [{ runs: [bold('Mã ngành chính:', 22)], fill:'EBF3FF' }, { text: NGANH }],
      [{ runs: [bold('Vốn điều lệ:', 22)], fill:'EBF3FF' }, { text: VON }],
    ], [3200, 5826]),
    ...empty(1),
    paraBold('2. THÔNG TIN VỀ ỨNG DỤNG', AlignmentType.LEFT),
    paraBold('a. Tên và địa chỉ lưu trữ/tải ứng dụng:', AlignmentType.LEFT),
    makeTable([
      [{ runs: [bold('STT',22)], fill:'2E75B6' }, { runs: [bold('Tên ứng dụng',22)], fill:'2E75B6' }, { runs: [bold('Địa chỉ truy cập',22)], fill:'2E75B6' }, { runs: [bold('Logo',22)], fill:'2E75B6' }],
      [{ text: '1' }, { text: 'Sàn TMĐT ACFMart (Demo)' }, { text: URL_DEMO }, { text: '[Đính kèm]' }],
      [{ text: '2' }, { text: 'Sàn TMĐT ACFMart (Production)' }, { text: URL_PROD }, { text: '[Đính kèm]' }],
    ], [600, 3200, 3426, 1200]),
    ...empty(1),
    para([bold('b. Loại hình dịch vụ: ', 24), bold('☑ Dịch vụ sàn giao dịch TMĐT', 24)]),
    para([normal('                              ☑ Dịch vụ khác: ', 24), italic('Xác thực nguồn gốc sản phẩm bằng mã QR và tem chống giả ACF', 24)]),
    ...empty(1),
    paraBold('c. Nhóm hàng hóa/dịch vụ chủ yếu:', AlignmentType.LEFT),
    makeTable([
      [{ runs: [bold('☑',22)], fill:'EBF3FF' }, { text: 'Hàng điện tử, gia dụng' }, { runs: [bold('☑',22)], fill:'EBF3FF' }, { text: 'Thực phẩm, đồ uống' }],
      [{ runs: [bold('☑',22)], fill:'EBF3FF' }, { text: 'Thời trang, mỹ phẩm, sức khỏe' }, { runs: [bold('☑',22)], fill:'EBF3FF' }, { text: 'Sách, văn phòng phẩm' }],
      [{ runs: [bold('☑',22)], fill:'EBF3FF' }, { text: 'Máy tính, điện thoại, thiết bị IT' }, { runs: [bold('☑',22)], fill:'EBF3FF' }, { text: 'Nội thất, trang trí nội ngoại thất' }],
      [{ runs: [bold('☑',22)], fill:'EBF3FF' }, { text: 'Công nghiệp, xây dựng' }, { runs: [bold('☑',22)], fill:'EBF3FF' }, { text: 'Hàng hóa khác có nguồn gốc rõ ràng' }],
    ], [500, 3763, 500, 3763]),
    ...empty(1),
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [4500, 4526],
      rows: [new TableRow({ children: [
        new TableCell({ borders: BORDERS_NONE, width: { size: 4500, type: WidthType.DXA }, children: [
          para([italic('Nơi nhận:', 22)]),
          para([normal('– Cục TMĐT và Kinh tế số – Bộ Công Thương;', 22)]),
          para([normal('– ' + CO + ' (lưu hồ sơ);', 22)]),
          para([normal('– Lưu: Hồ sơ pháp lý.', 22)]),
        ]}),
        new TableCell({ borders: BORDERS_NONE, width: { size: 4526, type: WidthType.DXA }, children: [
          paraBold('ĐẠI DIỆN THEO PHÁP LUẬT', AlignmentType.CENTER),
          paraItalicCenter('(Ký tên, ghi rõ họ tên, đóng dấu)', 22),
          ...empty(3),
          paraBold(DAIDIEN, AlignmentType.CENTER),
          paraCenter(CHUC_DANH, 22),
        ]}),
      ]})],
    }),
  ];
  return new Document({
    styles: { default: { document: { run: { font: 'Times New Roman', size: 24 } } } },
    sections: [{ ...pageProps(), children: body.filter(Boolean) }],
  });
}

function doc2() {
  const children = [
    ...hdr(),
    para([normal('Số: 01/2026/ĐA-ACFMart', 22)]),
    para([italic('Đồng Nai, ngày ' + NGAY_HS, 22)], { alignment: AlignmentType.RIGHT }),
    ...empty(1),
    paraBold('ĐỀ ÁN CUNG CẤP DỊCH VỤ THƯƠNG MẠI ĐIỆN TỬ', AlignmentType.CENTER, 28),
    paraCenter('Website/Ứng dụng: Sàn TMĐT ACFMart – Nền tảng giao dịch kiểm chứng nguồn gốc', 24),
    ...empty(1),
    paraBold('I. GIỚI THIỆU TỔNG QUAN VỀ THƯƠNG NHÂN', AlignmentType.LEFT, 26),
    paraBold('1. Thông tin pháp lý', AlignmentType.LEFT),
    makeTable([
      [{ runs: [bold('Tên đầy đủ:', 22)], fill:'EBF3FF' }, { runs: [bold(CO, 22)] }],
      [{ runs: [bold('Tên giao dịch:', 22)], fill:'EBF3FF' }, { text: CO_SHORT + ' / ACFMart' }],
      [{ runs: [bold('Đại diện pháp luật:', 22)], fill:'EBF3FF' }, { runs: [bold(DAIDIEN + ' – ' + CHUC_DANH, 22)] }],
      [{ runs: [bold('Địa chỉ trụ sở:', 22)], fill:'EBF3FF' }, { text: DIA_CHI }],
      [{ runs: [bold('Điện thoại | Email:', 22)], fill:'EBF3FF' }, { text: SDT + '  |  ' + EMAIL }],
      [{ runs: [bold('Giấy CNĐKKD số:', 22)], fill:'EBF3FF' }, { text: MST + ', cấp ngày ' + NGAY_CAP }],
      [{ runs: [bold('Nơi cấp:', 22)], fill:'EBF3FF' }, { text: NOI_CAP }],
      [{ runs: [bold('Mã ngành chính:', 22)], fill:'EBF3FF' }, { text: NGANH }],
      [{ runs: [bold('Vốn điều lệ:', 22)], fill:'EBF3FF' }, { text: VON }],
    ], [3200, 5826]),
    ...empty(1),
    paraBold('2. Cơ cấu tổ chức & Nhân sự', AlignmentType.LEFT),
    paraLeft('Cơ cấu tổ chức bao gồm:'),
    paraLeft('– Ban Giám đốc điều hành: hoạch định chiến lược, chịu trách nhiệm pháp lý;'),
    paraLeft('– Phòng Kỹ thuật & Hạ tầng: phát triển, vận hành hệ thống kỹ thuật (Firebase/Cloud);'),
    paraLeft('– Phòng Pháp lý & Tuân thủ: đảm bảo tuân thủ NĐ 52/2013, NĐ 85/2021, NĐ 13/2023;'),
    paraLeft('– Trung tâm Kiểm duyệt & Hỗ trợ người dùng: kiểm duyệt 3 lớp và CSKH 24/7;'),
    paraLeft('– Đội ngũ Thẩm định chuyên môn: phối hợp Quỹ Chống Hàng Giả ACF giám định hàng thật/giả;'),
    paraLeft('– Người phụ trách bảo vệ dữ liệu (DPO): ' + DAIDIEN + ' | Email: dpo@acfmart.vn.'),
    paraLeft('– Đối tác kỹ thuật & sở hữu tên miền: ' + IVS + ' (MST: ' + IVS_MST + ') – đơn vị phát triển và cung cấp hạ tầng kỹ thuật cho sàn ACFMart.'),
    ...empty(1),
    paraBold('3. Mục tiêu đề án', AlignmentType.LEFT),
    paraLeft('Xây dựng và vận hành sàn giao dịch TMĐT tập trung vào: (i) minh bạch nguồn gốc hàng hóa qua mã QR truy xuất độc bản; (ii) bảo vệ người mua bằng cơ chế Escrow; (iii) kiểm soát chặt chẽ hàng giả, hàng nhái thông qua hệ thống kiểm duyệt 3 lớp; đáp ứng đầy đủ tiêu chuẩn NĐ 52/2013 (sửa đổi NĐ 85/2021), NĐ 13/2023 và NĐ 98/2020.'),
    ...empty(1),
    paraBold('II. MÔ HÌNH TỔ CHỨC HOẠT ĐỘNG', AlignmentType.LEFT, 26),
    paraBold('1. Loại hình dịch vụ', AlignmentType.LEFT),
    paraLeft('Sàn giao dịch TMĐT đa ngành hàng, tích hợp dịch vụ xác thực nguồn gốc sản phẩm bằng mã QR truy xuất và tem chống giả ACF.'),
    ...empty(1),
    paraBold('2. Địa chỉ truy cập', AlignmentType.LEFT),
    makeTable([
      [{ runs: [bold('Môi trường', 22)], fill:'2E75B6' }, { runs: [bold('URL', 22)], fill:'2E75B6' }, { runs: [bold('Trạng thái', 22)], fill:'2E75B6' }],
      [{ text: 'Demo' }, { text: URL_DEMO }, { text: 'Đang vận hành thử nghiệm' }],
      [{ text: 'Production' }, { text: URL_PROD }, { text: 'Chính thức' }],
      [{ text: 'Mobile (iOS/Android)' }, { text: 'Dự kiến Q4/2026' }, { text: 'Sau khi ổn định môi trường Web' }],
    ], [2500, 4000, 2526]),
    ...empty(1),
    paraBold('3. Quy trình vận hành', AlignmentType.LEFT),
    para([bold('Đối với Người bán (Seller): ', 24)]),
    paraLeft('Đăng ký tài khoản → Xác thực qua VNeID mức 2 hoặc GPKD → Nộp hồ sơ sản phẩm & chứng từ nguồn gốc → Trung tâm ACF thẩm định → Duyệt & cấp mã QR truy xuất độc bản → Bắt đầu đăng bán.', 22),
    para([bold('Đối với Người mua (Buyer): ', 24)]),
    paraLeft('Tìm sản phẩm → Đặt hàng → Thanh toán qua cơ chế Escrow (giữ tại ngân hàng đối tác) → Nhận hàng & Quét QR xác thực hàng thật → Xác nhận hoàn tất → Escrow giải ngân cho Người bán sau 3 ngày.', 22),
    ...empty(1),
    paraBold('III. TIỆN ÍCH & DỊCH VỤ HỖ TRỢ', AlignmentType.LEFT, 26),
    makeTable([
      [{ runs: [bold('Tiện ích', 22)], fill:'2E75B6' }, { runs: [bold('Mô tả', 22)], fill:'2E75B6' }],
      [{ runs: [bold('Thanh toán Escrow', 22)], fill:'EBF3FF' }, { text: 'Tiền giữ tại tài khoản ngân hàng đối tác (VNPay/MoMo), chỉ giải ngân khi người mua xác nhận nhận hàng đúng mô tả hoặc hết thời hạn khiếu nại.' }],
      [{ runs: [bold('Vận chuyển', 22)], fill:'EBF3FF' }, { text: 'Tích hợp API thời gian thực với GHN, GHTK, Viettel Post. Người bán đính kèm mã QR truy xuất trước khi bàn giao.' }],
      [{ runs: [bold('Xác thực QR ACF', 22)], fill:'EBF3FF' }, { text: 'Mỗi SKU được cấp mã QR độc bản sau khi thẩm định hồ sơ nguồn gốc. Người mua quét mã bằng camera điện thoại để kiểm tra hàng thật.' }],
      [{ runs: [bold('Chữ ký số & HĐĐT', 22)], fill:'EBF3FF' }, { text: 'Tích hợp SDK Viettel-CA/FPT-CA cho hợp đồng điện tử với Seller và hóa đơn. Hoàn thiện trước 31/12/2026 theo Luật GDĐT 2023.' }],
    ], [2500, 6526]),
    ...empty(1),
    paraBold('IV. NGUỒN THU & CƠ CHẾ THU PHÍ', AlignmentType.LEFT, 26),
    paraLeft('Chi tiết Biểu phí công khai tại: https://acfmart.vn/bieu-phi (Phụ lục Biểu phí đính kèm hồ sơ).'),
    makeTable([
      [{ runs: [bold('Loại phí', 22)], fill:'2E75B6' }, { runs: [bold('Mức phí', 22)], fill:'2E75B6' }, { runs: [bold('Ghi chú', 22)], fill:'2E75B6' }],
      [{ text: 'Phí hoa hồng sàn' }, { text: '3% – 10% tùy ngành hàng' }, { text: '% giá trị đơn hàng, bên bán chịu' }],
      [{ text: 'Phí xác thực & tem QR' }, { text: '2.000 – 3.000 VNĐ/mã' }, { text: 'Thu trên mỗi mã QR được cấp' }],
      [{ text: 'Phí thanh toán Escrow' }, { text: '3,5% giá trị đơn' }, { text: 'Bên bán chịu' }],
      [{ text: 'Phí hạ tầng xử lý đơn' }, { text: '2.500 VNĐ/đơn hàng' }, { text: 'Cố định/đơn' }],
      [{ text: 'Gói dịch vụ nâng cao (Mall/Pro)' }, { text: 'Theo hợp đồng riêng' }, { text: 'Ưu tiên hiển thị, báo cáo phân tích' }],
    ], [3000, 2500, 3526]),
    ...empty(1),
    paraBold('V. BIỆN PHÁP KỸ THUẬT & BẢO MẬT', AlignmentType.LEFT, 26),
    makeTable([
      [{ runs: [bold('Hạng mục', 22)], fill:'2E75B6' }, { runs: [bold('Biện pháp', 22)], fill:'2E75B6' }],
      [{ runs: [bold('Hạ tầng kỹ thuật', 22)], fill:'EBF3FF' }, { text: 'Nền tảng Cloud (Google Cloud/Firebase) có khả năng tự động mở rộng (Auto-scaling), lưu trữ đa vùng, sao lưu định kỳ. Cam kết duy trì bản sao dữ liệu tại máy chủ đặt tại Việt Nam theo yêu cầu pháp luật.' }],
      [{ runs: [bold('Bảo mật dữ liệu', 22)], fill:'EBF3FF' }, { text: 'Mã hóa TLS 1.3, phân quyền truy cập RBAC, lưu nhật ký giao dịch và kiểm duyệt tối thiểu 24 tháng theo NĐ 98/2020. Tuân thủ NĐ 13/2023. Báo cáo sự cố rò rỉ dữ liệu trong 72 giờ.' }],
      [{ runs: [bold('Kết nối cơ quan quản lý', 22)], fill:'EBF3FF' }, { text: 'Hệ thống API sẵn sàng kết nối Cổng thông tin Bộ Công Thương (online.gov.vn) để báo cáo số liệu giao dịch và người bán định kỳ.' }],
      [{ runs: [bold('Lưu trữ Livestream', 22)], fill:'EBF3FF' }, { text: 'Toàn bộ nội dung phiên Livestream bán hàng được lưu trữ tối thiểu 36 tháng theo yêu cầu của Cục TMĐT và Kinh tế số.' }],
    ], [2800, 6226]),
    ...empty(1),
    paraBold('VI. PHÂN ĐỊNH QUYỀN & TRÁCH NHIỆM', AlignmentType.LEFT, 26),
    makeTable([
      [{ runs: [bold('Chủ thể', 22)], fill:'2E75B6' }, { runs: [bold('Vai trò & Trách nhiệm', 22)], fill:'2E75B6' }],
      [{ runs: [bold('Chủ sở hữu & Vận hành sàn', 22), normal('
' + CO, 22)], fill:'EBF3FF' }, { text: 'Chịu trách nhiệm vận hành kỹ thuật, duy trì quy trình kiểm duyệt 3 lớp, lưu audit log ≥24 tháng, phối hợp cơ quan chức năng khi phát hiện vi phạm.' }],
      [{ runs: [bold('Đối tác kỹ thuật', 22), normal('
' + IVS, 22)], fill:'EBF3FF' }, { text: 'Phát triển và cung cấp hạ tầng kỹ thuật, sở hữu tên miền acfmart.vn và hệ sinh thái. Tham gia với tư cách cổ đông sáng lập và đối tác kỹ thuật chiến lược.' }],
      [{ runs: [bold('Đơn vị bảo trợ chuyên môn', 22), normal('
Công ty TNHH Đầu tư ACF / Quỹ Chống Hàng Giả ACF', 22)], fill:'EBF3FF' }, { text: 'Hỗ trợ thẩm định nguồn gốc, giám định hàng thật/giả, tư vấn kỹ thuật chống hàng giả và phối hợp cơ quan QLTT/Công an theo đặc thù chuyên môn.' }],
      [{ runs: [bold('Người bán (Seller)', 22)], fill:'EBF3FF' }, { text: 'Cam kết cung cấp hàng chính hãng, đầy đủ hóa đơn/chứng từ, chịu trách nhiệm pháp lý theo NĐ 98/2020 nếu vi phạm về hàng giả, hàng nhái.' }],
      [{ runs: [bold('Người mua (Buyer)', 22)], fill:'EBF3FF' }, { text: 'Cung cấp thông tin đặt hàng chính xác, thực hiện thanh toán qua Escrow, tuân thủ quy định sử dụng dịch vụ.' }],
    ], [3200, 5826]),
    ...signBlock('ĐẠI DIỆN CÔNG TY'),
  ];
  return new Document({
    styles: { default: { document: { run: { font: 'Times New Roman', size: 24 } } } },
    sections: [{ ...pageProps(), children }],
  });
}

function doc3() {
  const children = [
    new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [4500, 4526],
      rows: [new TableRow({ children: [
        new TableCell({ borders: BORDERS_NONE, width: { size: 4500, type: WidthType.DXA }, children: [
          para([bold(CO, 22)]), para([normal('────────────────', 22)]),
        ]}),
        new TableCell({ borders: BORDERS_NONE, width: { size: 4526, type: WidthType.DXA }, children: [
          paraBold('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', AlignmentType.CENTER, 22),
          paraBold('Độc lập – Tự do – Hạnh phúc', AlignmentType.CENTER, 22),
          paraCenter('──────────────────'),
        ]}),
      ]})],
    }),
    ...empty(1),
    paraBold('QUY CHẾ HOẠT ĐỘNG', AlignmentType.CENTER, 28),
    paraBold('SÀN GIAO DỊCH THƯƠNG MẠI ĐIỆN TỬ ACFMART', AlignmentType.CENTER, 26),
    paraItalicCenter('(Ban hành kèm Quyết định số 01/2026/QĐ-ACFMart ngày …/…/2026 của Tổng Giám đốc ' + CO + ')'),
    ...empty(1),
    paraBold('CHƯƠNG I: QUY ĐỊNH CHUNG', AlignmentType.CENTER, 26),
    paraBold('Điều 1. Phạm vi điều chỉnh', AlignmentType.LEFT),
    paraLeft('Quy chế này điều chỉnh hoạt động cung cấp dịch vụ sàn giao dịch thương mại điện tử của ' + CO + ' (sau đây gọi là "Sàn ACFMart"), bao gồm: kết nối Người mua và Người bán; hỗ trợ giao dịch, thanh toán Escrow; xác thực nguồn gốc hàng hóa bằng mã QR; lưu trữ nội dung; giải quyết tranh chấp và xử lý vi phạm.'),
    ...empty(1),
    paraBold('Điều 2. Căn cứ pháp lý', AlignmentType.LEFT),
    paraLeft('– Nghị định 52/2013/NĐ-CP và Nghị định 85/2021/NĐ-CP về quản lý hoạt động TMĐT;'),
    paraLeft('– Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân;'),
    paraLeft('– Nghị định 98/2020/NĐ-CP về xử phạt vi phạm hành chính trong lĩnh vực quản lý thị trường;'),
    paraLeft('– Luật Giao dịch điện tử 2023 (số 20/2023/QH15) và Nghị định 59/2022/NĐ-CP về định danh điện tử;'),
    paraLeft('– Thông tư 59/2015/TT-BCT quy định về quản lý hoạt động thương mại điện tử.'),
    ...empty(1),
    paraBold('Điều 3. Giải thích từ ngữ', AlignmentType.LEFT),
    makeTable([
      [{ runs: [bold('Thuật ngữ', 22)], fill:'2E75B6' }, { runs: [bold('Định nghĩa', 22)], fill:'2E75B6' }],
      [{ runs: [bold('"Sàn ACFMart"', 22)], fill:'EBF3FF' }, { text: 'Nền tảng TMĐT tại ' + URL_PROD + ' do ' + CO + ' sở hữu và vận hành.' }],
      [{ runs: [bold('"Người bán (Seller)"', 22)], fill:'EBF3FF' }, { text: 'Cá nhân/Tổ chức đăng ký, được xác thực và đăng bán hàng hóa trên Sàn.' }],
      [{ runs: [bold('"Người mua (Buyer)"', 22)], fill:'EBF3FF' }, { text: 'Cá nhân/Tổ chức sử dụng dịch vụ Sàn để tìm kiếm và mua hàng hóa.' }],
      [{ runs: [bold('"Escrow"', 22)], fill:'EBF3FF' }, { text: 'Cơ chế giữ tiền thanh toán tại tài khoản ngân hàng đối tác cho đến khi Người mua xác nhận nhận hàng đúng mô tả.' }],
      [{ runs: [bold('"Mã QR ACF"', 22)], fill:'EBF3FF' }, { text: 'Mã QR độc bản được Sàn cấp cho từng SKU sau khi thẩm định hồ sơ nguồn gốc.' }],
      [{ runs: [bold('"Audit log"', 22)], fill:'EBF3FF' }, { text: 'Nhật ký hoạt động hệ thống được lưu trữ bất biến để phục vụ kiểm tra, thanh tra.' }],
    ], [2800, 6226]),
    ...empty(1),
    paraBold('CHƯƠNG II: QUYỀN VÀ NGHĨA VỤ', AlignmentType.CENTER, 26),
    paraBold('Điều 4. Người bán (Seller)', AlignmentType.LEFT),
    paraLeft('4.1. Quyền: Sử dụng đầy đủ tính năng Sàn theo gói đăng ký; yêu cầu giải thích khi sản phẩm bị từ chối; xuất báo cáo doanh thu bất kỳ lúc nào; khiếu nại quyết định của Sàn trong 07 ngày.'),
    paraLeft('4.2. Nghĩa vụ: Xác thực tài khoản qua VNeID mức 2 (cá nhân) hoặc GPKD (tổ chức); chỉ đăng bán hàng hóa có nguồn gốc hợp pháp, đầy đủ chứng từ; tuân thủ Biểu phí tại ' + URL_PROD + '/bieu-phi; chịu trách nhiệm trước pháp luật về chất lượng, nguồn gốc, bảo hành và nghĩa vụ thuế TMĐT.'),
    ...empty(1),
    paraBold('Điều 5. Người mua (Buyer)', AlignmentType.LEFT),
    paraLeft('5.1. Quyền: Kiểm tra hàng hóa khi nhận; yêu cầu đổi/trả/hoàn tiền nếu hàng sai mô tả hoặc nghi ngờ hàng giả; truy cập thông tin xác thực QR của sản phẩm.'),
    paraLeft('5.2. Nghĩa vụ: Cung cấp thông tin đặt hàng chính xác; thanh toán đầy đủ qua Escrow; tuân thủ quy định bảo mật tài khoản; không lợi dụng chính sách để trục lợi.'),
    ...empty(1),
    paraBold('Điều 6. Sàn ACFMart', AlignmentType.LEFT),
    paraLeft('6.1. Quyền: Từ chối duyệt sản phẩm không đạt tiêu chuẩn; tạm khóa tài khoản vi phạm; điều chỉnh phí với thông báo trước 15 ngày; cung cấp thông tin cho cơ quan nhà nước khi có yêu cầu hợp pháp.'),
    paraLeft('6.2. Nghĩa vụ: Duy trì hạ tầng kỹ thuật ổn định (SLA uptime ≥ 99,5%/tháng); bảo mật dữ liệu theo NĐ 13/2023; triển khai kiểm duyệt 3 lớp (AI + Moderator + Audit ngẫu nhiên); không trực tiếp mua bán hàng hóa; hỗ trợ Escrow và phối hợp cơ quan chức năng khi có yêu cầu hợp pháp.'),
    ...empty(1),
    paraBold('CHƯƠNG III: QUY TRÌNH GIAO DỊCH & THANH TOÁN', AlignmentType.CENTER, 26),
    paraBold('Điều 7. Đặt hàng & Xác nhận', AlignmentType.LEFT),
    paraLeft('Người mua đặt hàng → Hệ thống giữ tiền tạm vào tài khoản Escrow ngân hàng đối tác → Người bán xác nhận đơn trong 24h → Đóng gói, gắn mã QR truy xuất (nếu thuộc danh mục bắt buộc) → Bàn giao đơn vị vận chuyển → Người mua kiểm tra & xác nhận "Đã nhận hàng" → Escrow tự động giải ngân sau 03 ngày hoặc theo hợp đồng điện tử.'),
    ...empty(1),
    paraBold('Điều 8. Hoàn tiền & Trả hàng', AlignmentType.LEFT),
    paraLeft('Trường hợp hàng sai mô tả, hư hỏng, nghi ngờ hàng giả: Người mua mở khiếu nại trong 48h kể từ khi nhận hàng. Escrow tạm khóa. Moderator thẩm tra bằng chứng (ảnh/video/log giao nhận/mã QR). Nếu hợp lệ: Hoàn 100% hoặc xử lý đổi trả theo chính sách Người bán. Phí hoàn hàng: Người bán chịu tối đa 35.000 VNĐ/đơn (trừ khi sử dụng gói PiShip 1.900 VNĐ/đơn để được Sàn bảo trợ đến 40.000 VNĐ).'),
    ...empty(1),
    paraBold('CHƯƠNG IV: LƯU TRỮ NỘI DUNG & LIVESTREAM', AlignmentType.CENTER, 26),
    paraBold('Điều 9. Lưu trữ nội dung', AlignmentType.LEFT),
    paraLeft('9.1. Nhật ký giao dịch & kiểm duyệt: Lưu trữ tối thiểu 24 (hai mươi bốn) tháng theo NĐ 98/2020/NĐ-CP kể từ thời điểm giao dịch hoặc kiểm duyệt. Dữ liệu lưu bất biến (immutable audit log), sẵn sàng xuất trình cho cơ quan chức năng khi yêu cầu.'),
    paraLeft('9.2. Nội dung Livestream bán hàng: Toàn bộ nội dung phiên phát trực tiếp (livestream) được lưu trữ tối thiểu 36 (ba mươi sáu) tháng theo yêu cầu của Cục TMĐT và Kinh tế số. Người bán tham gia livestream đồng ý với điều khoản lưu trữ này.'),
    paraLeft('9.3. Dữ liệu cá nhân: Lưu tối đa 02 năm sau khi tài khoản ngừng hoạt động, trừ dữ liệu kế toán/pháp lý bắt buộc lưu theo luật chuyên ngành.'),
    ...empty(1),
    paraBold('CHƯƠNG V: KIỂM SOÁT HÀNG GIẢ & XỬ LÝ VI PHẠM', AlignmentType.CENTER, 26),
    paraBold('Điều 10. Quy trình báo cáo 24/7', AlignmentType.LEFT),
    paraLeft('Hotline: ' + SDT + '  |  Email: report@acfmart.vn  |  Form báo cáo: ' + URL_PROD + '/bao-cao-vi-pham'),
    paraLeft('SLA xử lý: Phản hồi xác nhận trong 24h; hoàn thành điều tra sơ bộ trong 7–15 ngày; cập nhật trạng thái công khai trên hồ sơ đơn hàng.'),
    ...empty(1),
    paraBold('Điều 11. Chế tài nội bộ', AlignmentType.LEFT),
    makeTable([
      [{ runs: [bold('Mức độ vi phạm', 22)], fill:'2E75B6' }, { runs: [bold('Hành vi', 22)], fill:'2E75B6' }, { runs: [bold('Biện pháp', 22)], fill:'2E75B6' }],
      [{ text: 'Nhẹ' }, { text: 'Thông tin sản phẩm thiếu, giao hàng chậm lần đầu' }, { text: 'Cảnh cáo bằng email, yêu cầu chỉnh sửa trong 48h' }],
      [{ text: 'Vừa' }, { text: 'Giao hàng sai mô tả nhiều lần, vi phạm thời hạn xử lý khiếu nại' }, { text: 'Khóa tạm 7–30 ngày, thu hồi hoa hồng/đền bù Người mua' }],
      [{ runs: [bold('Nghiêm trọng', 22)], fill:'FFEBEE' }, { text: 'Hàng giả, hàng cấm, lừa đảo, giả mạo chứng từ' }, { text: 'Chấm dứt ngay, phong tỏa Escrow, chuyển hồ sơ QLTT/Công an theo NĐ 98/2020, lưu vết ≥ 2 năm' }],
    ], [2000, 3800, 3226]),
    paraLeft('Sàn không chịu trách nhiệm bồi thường thay Người bán nếu đã thực hiện đầy đủ nghĩa vụ kiểm duyệt, cảnh báo và phối hợp cơ quan chức năng.'),
    ...empty(1),
    paraBold('CHƯƠNG VI: GIẢI QUYẾT TRANH CHẤP & ĐIỀU KHOẢN CHUNG', AlignmentType.CENTER, 26),
    paraBold('Điều 12. Thương lượng & Hòa giải', AlignmentType.LEFT),
    paraLeft('Ưu tiên giải quyết nội bộ qua bộ phận Chăm sóc khách hàng & Pháp lý. Nếu không thành trong 30 ngày, hai bên có thể yêu cầu hòa giải thương mại hoặc khởi kiện tại Tòa án nhân dân có thẩm quyền tại tỉnh Đồng Nai.'),
    ...empty(1),
    paraBold('Điều 13. Hiệu lực & Sửa đổi', AlignmentType.LEFT),
    paraLeft('Quy chế có hiệu lực kể từ ngày niêm yết công khai tại ' + URL_PROD + '/quy-che. Sàn có quyền sửa đổi để phù hợp với quy định pháp luật hoặc điều kiện thị trường. Thay đổi được thông báo trước tối thiểu 15 (mười lăm) ngày. Người dùng tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận bản mới.'),
    ...empty(1),
    paraBold('CHƯƠNG VII: CHÍNH SÁCH BẢO VỆ DỮ LIỆU CÁ NHÂN', AlignmentType.CENTER, 26),
    paraItalicCenter('(Tuân thủ Nghị định 13/2023/NĐ-CP)', 22),
    paraBold('Điều 14. Phạm vi & Cơ sở pháp lý', AlignmentType.LEFT),
    paraLeft('Chính sách này áp dụng cho mọi hoạt động thu thập, xử lý, lưu trữ và chia sẻ dữ liệu cá nhân (DLCN) của Người mua, Người bán và Khách truy cập trên hệ thống ACFMart. Căn cứ: NĐ 13/2023/NĐ-CP, Luật An ninh mạng 2018, Luật GDĐT 2023.'),
    ...empty(1),
    paraBold('Điều 15. Nguyên tắc xử lý dữ liệu', AlignmentType.LEFT),
    paraLeft('– Hợp pháp, minh bạch: Chỉ xử lý khi có cơ sở pháp lý rõ ràng (đồng ý, thực hiện hợp đồng, nghĩa vụ pháp lý).'),
    paraLeft('– Tối thiểu hóa: Chỉ thu thập dữ liệu cần thiết cho mục đích đã công bố.'),
    paraLeft('– Chính xác & cập nhật: Cho phép chủ thể dữ liệu chỉnh sửa/thông báo sai sót qua Cài đặt tài khoản.'),
    paraLeft('– Bảo mật & lưu trữ có thời hạn: Mã hóa TLS 1.3, phân quyền RBAC, lưu tối đa 02 năm sau khi tài khoản ngừng hoạt động.'),
    ...empty(1),
    paraBold('Điều 16. Phân loại dữ liệu & Mục đích xử lý', AlignmentType.LEFT),
    makeTable([
      [{ runs: [bold('Nhóm dữ liệu', 22)], fill:'2E75B6' }, { runs: [bold('Mục đích xử lý', 22)], fill:'2E75B6' }, { runs: [bold('Cơ sở pháp lý', 22)], fill:'2E75B6' }],
      [{ text: 'Định danh (CCCD/VNeID, MST, GPKD)' }, { text: 'Xác thực Seller/Buyer, ký HĐĐT, Escrow, nghĩa vụ thuế' }, { text: 'Thực hiện hợp đồng, nghĩa vụ pháp lý' }],
      [{ text: 'Giao dịch & thanh toán' }, { text: 'Xử lý đơn hàng, đối soát phí, hoàn tiền, chống gian lận' }, { text: 'Thực hiện hợp đồng, lợi ích chính đáng' }],
      [{ text: 'Hành vi & nhật ký truy cập' }, { text: 'Cải thiện trải nghiệm, phát hiện bất thường (AI/Log), audit bảo mật' }, { text: 'Lợi ích chính đáng, đồng ý (cookie)' }],
      [{ text: 'Nhạy cảm (vị trí GPS, lịch sử mua thuốc)' }, { text: 'Giao hàng, cảnh báo tương tác sản phẩm sức khỏe' }, { text: 'Đồng ý rõ ràng (opt-in riêng)' }],
    ], [2800, 3600, 2626]),
    ...empty(1),
    paraBold('Điều 17. Cơ chế đồng ý & Rút lại đồng ý', AlignmentType.LEFT),
    paraLeft('Người dùng tích chọn đồng ý trước khi cung cấp dữ liệu hoặc tạo tài khoản. Có thể rút lại đồng ý qua Cài đặt → Quyền riêng tư hoặc email DPO. Việc rút lại không ảnh hưởng tính hợp pháp của xử lý trước đó nhưng có thể hạn chế một số tính năng.'),
    ...empty(1),
    paraBold('Điều 18. Chia sẻ & Chuyển giao dữ liệu', AlignmentType.LEFT),
    paraLeft('ACFMart chỉ chia sẻ dữ liệu với: (i) đối tác vận hành hợp đồng (VNPay/MoMo, GHN/GHTK, Ngân hàng Escrow, Nhà cung cấp CA); (ii) cơ quan nhà nước khi có yêu cầu bằng văn bản hợp pháp. Không bán, không chia sẻ dữ liệu cho bên thứ ba ngoài mục đích trên.'),
    ...empty(1),
    paraBold('Điều 19. Bảo mật & Xử lý sự cố', AlignmentType.LEFT),
    paraLeft('Mã hóa TLS 1.3, lưu trữ đa vùng, kiểm soát truy cập RBAC, audit log bất biến. Báo cáo sự cố rò rỉ trong 72 giờ cho Cục An ninh mạng và chủ thể dữ liệu bị ảnh hưởng theo mẫu NĐ 13/2023. Rà soát DPIA định kỳ 06 tháng/lần.'),
    ...empty(1),
    paraBold('Điều 20. Quyền của chủ thể dữ liệu & Liên hệ DPO', AlignmentType.LEFT),
    paraLeft('Người dùng có quyền: Truy cập, chỉnh sửa, xóa, hạn chế xử lý, chuyển dữ liệu, khiếu nại. Sàn xử lý trong 72 giờ làm việc (trừ trường hợp pháp luật cấm xóa).'),
    para([bold('Người phụ trách bảo vệ dữ liệu (DPO): ', 24), normal(DAIDIEN + '  |  Email: dpo@acfmart.vn  |  Website: ' + URL_PROD + '/dpia-summary', 24)]),
    paraLeft('Hồ sơ Đánh giá tác động (DPIA) đã nộp Bộ Công an trong 60 ngày kể từ ngày bắt đầu xử lý dữ liệu cá nhân.'),
    ...signBlock('GIÁM ĐỐC ' + CO),
  ];
  return new Document({
    styles: { default: { document: { run: { font: 'Times New Roman', size: 24 } } } },
    sections: [{ ...pageProps(), children }],
  });
}

function doc4() {
  const children = [
    ...hdr(),
    paraBold('BIỂU PHÍ DỊCH VỤ', AlignmentType.CENTER, 28),
    paraBold('SÀN THƯƠNG MẠI ĐIỆN TỬ ACFMART', AlignmentType.CENTER, 26),
    paraItalicCenter('(Ban hành kèm theo Quyết định số 01/2026/QĐ-ACFMart ngày …/…/2026 của Tổng Giám đốc)', 22),
    paraItalicCenter('(Công bố công khai tại: ' + URL_PROD + '/bieu-phi)', 22),
    ...empty(1),
    paraBold('I. PHÍ CƠ BẢN ÁP DỤNG CHO MỌI GIAO DỊCH', AlignmentType.LEFT, 26),
    makeTable([
      [{ runs: [bold('STT',22)], fill:'2E75B6' },{ runs: [bold('Loại phí',22)], fill:'2E75B6' },{ runs: [bold('Mức phí',22)], fill:'2E75B6' },{ runs: [bold('Bên chịu phí',22)], fill:'2E75B6' },{ runs: [bold('Ghi chú',22)], fill:'2E75B6' }],
      [{ text: '1' },{ text: 'Phí hoa hồng – Thời trang, mỹ phẩm' },{ text: '8% – 10%' },{ text: 'Người bán' },{ text: '% giá trị đơn hàng' }],
      [{ text: '2' },{ text: 'Phí hoa hồng – Điện tử, gia dụng' },{ text: '3% – 5%' },{ text: 'Người bán' },{ text: '% giá trị đơn hàng' }],
      [{ text: '3' },{ text: 'Phí hoa hồng – Thực phẩm, FMCG' },{ text: '5% – 7%' },{ text: 'Người bán' },{ text: '% giá trị đơn hàng' }],
      [{ text: '4' },{ text: 'Phí hoa hồng – Ngành hàng khác' },{ text: '5% – 8%' },{ text: 'Người bán' },{ text: '% giá trị đơn hàng' }],
      [{ text: '5' },{ text: 'Phí thanh toán Escrow' },{ text: '3,5%' },{ text: 'Người bán' },{ text: '% tổng giá trị thanh toán' }],
      [{ text: '6' },{ text: 'Phí hạ tầng xử lý đơn hàng' },{ text: '2.500 VNĐ/đơn' },{ text: 'Người bán' },{ text: 'Cố định/đơn hàng' }],
    ], [600, 3200, 1400, 1400, 2426]),
    ...empty(1),
    paraBold('II. PHÍ XÁC THỰC & TEM QR ACF', AlignmentType.LEFT, 26),
    makeTable([
      [{ runs: [bold('STT',22)], fill:'2E75B6' },{ runs: [bold('Loại dịch vụ xác thực',22)], fill:'2E75B6' },{ runs: [bold('Mức phí',22)], fill:'2E75B6' },{ runs: [bold('Đơn vị',22)], fill:'2E75B6' },{ runs: [bold('Ghi chú',22)], fill:'2E75B6' }],
      [{ text: '1' },{ text: 'Phí thẩm định hồ sơ SKU lần đầu' },{ text: 'Miễn phí' },{ text: '/SKU' },{ text: 'Giai đoạn ra mắt' }],
      [{ text: '2' },{ text: 'Mã QR tiêu chuẩn (≤ 500 QR/tháng)' },{ text: '3.000 VNĐ/mã' },{ text: '/mã QR' },{ text: 'Giá niêm yết' }],
      [{ text: '3' },{ text: 'Mã QR số lượng lớn (> 500 QR/tháng)' },{ text: '2.000 VNĐ/mã' },{ text: '/mã QR' },{ text: 'Giá ưu đãi theo sản lượng' }],
      [{ text: '4' },{ text: 'Tái thẩm định SKU (thay đổi nguồn cung/nhãn hàng)' },{ text: '50.000 VNĐ/SKU' },{ text: '/lần' },{ text: 'Sau lần đầu' }],
    ], [600, 3200, 1400, 1200, 2626]),
    ...empty(1),
    paraBold('III. PHÍ HOÀN HÀNG & BẢO TRỢ VẬN CHUYỂN', AlignmentType.LEFT, 26),
    makeTable([
      [{ runs: [bold('STT',22)], fill:'2E75B6' },{ runs: [bold('Loại phí',22)], fill:'2E75B6' },{ runs: [bold('Mức phí',22)], fill:'2E75B6' },{ runs: [bold('Bên chịu',22)], fill:'2E75B6' },{ runs: [bold('Ghi chú',22)], fill:'2E75B6' }],
      [{ text: '1' },{ text: 'Phí hoàn hàng (lỗi do Người bán)' },{ text: 'Tối đa 35.000 VNĐ' },{ text: 'Người bán' },{ text: '/đơn hoàn' }],
      [{ text: '2' },{ text: 'Gói PiShip (bảo trợ hoàn hàng)' },{ text: '1.900 VNĐ/đơn' },{ text: 'Người bán' },{ text: 'Sàn bảo trợ hoàn tới 40.000 VNĐ' }],
    ], [600, 3200, 1800, 1400, 2026]),
    ...empty(1),
    paraBold('IV. GÓI DỊCH VỤ NÂNG CAO (PRO / MALL)', AlignmentType.LEFT, 26),
    makeTable([
      [{ runs: [bold('STT',22)], fill:'2E75B6' },{ runs: [bold('Gói dịch vụ',22)], fill:'2E75B6' },{ runs: [bold('Phí tháng',22)], fill:'2E75B6' },{ runs: [bold('Phí năm',22)], fill:'2E75B6' },{ runs: [bold('Quyền lợi chính',22)], fill:'2E75B6' }],
      [{ text: '1' },{ text: 'Gói Basic (mặc định)' },{ text: 'Miễn phí' },{ text: 'Miễn phí' },{ text: 'Đầy đủ tính năng cơ bản, phí theo giao dịch' }],
      [{ text: '2' },{ text: 'Gói Pro' },{ text: 'Theo báo giá' },{ text: 'Ưu đãi 10–15%' },{ text: 'Ưu tiên hiển thị, báo cáo phân tích, giảm phí hoa hồng 0,5%' }],
      [{ text: '3' },{ text: 'Gói Mall (Nhãn hàng chính hãng)' },{ text: 'Theo HĐ riêng' },{ text: 'Theo HĐ riêng' },{ text: 'Badge chính hãng, top hiển thị, hỗ trợ pháp lý chống hàng giả' }],
    ], [600, 2400, 1400, 1400, 3226]),
    ...empty(1),
    paraBold('V. ĐIỀU KHOẢN ÁP DỤNG BIỂU PHÍ', AlignmentType.LEFT, 26),
    makeTable([
      [{ runs: [bold('Hiệu lực:', 22)], fill:'EBF3FF' }, { text: 'Biểu phí có hiệu lực kể từ ngày niêm yết và được công bố công khai tại ' + URL_PROD + '/bieu-phi.' }],
      [{ runs: [bold('Thay đổi phí:', 22)], fill:'EBF3FF' }, { text: 'Thông báo trước tối thiểu 15 ngày qua email trước khi áp dụng thay đổi.' }],
      [{ runs: [bold('Thuế VAT:', 22)], fill:'EBF3FF' }, { text: 'Các mức phí trên chưa bao gồm thuế VAT (nếu có theo quy định pháp luật hiện hành).' }],
      [{ runs: [bold('Đối soát:', 22)], fill:'EBF3FF' }, { text: 'Cung cấp bảng kê chi tiết phí hàng tháng qua email và trang quản lý tài khoản Seller.' }],
      [{ runs: [bold('Khiếu nại phí:', 22)], fill:'EBF3FF' }, { text: 'Seller có thể khiếu nại phí trong vòng 30 ngày kể từ ngày nhận bảng kê qua email seller@acfmart.vn.' }],
    ], [2500, 6526]),
    ...signBlock('TỔNG GIÁM ĐỐC'),
  ];
  return new Document({
    styles: { default: { document: { run: { font: 'Times New Roman', size: 24 } } } },
    sections: [{ ...pageProps(), children }],
  });
}

function doc5() {
  const children = [
    ...hdr(),
    paraBold('CAM KẾT TUÂN THỦ CHỐNG HÀNG GIẢ', AlignmentType.CENTER, 28),
    paraItalicCenter('(V/v: Đăng ký ứng dụng cung cấp dịch vụ Sàn TMĐT ACFMart theo Thông tư 59/2015/TT-BCT)', 22),
    ...empty(1),
    para([normal('Kính gửi: ', 24), bold('Cục Thương mại điện tử và Kinh tế số – Bộ Công Thương', 24)]),
    ...empty(1),
    para([bold(CO, 24), normal(' (Giấy CNĐKKD số: ', 24), bold(MST, 24), normal(', do ' + NOI_CAP + ' cấp ngày ' + NGAY_CAP + '), là đơn vị sở hữu và vận hành Sàn TMĐT ACFMart tại ', 24), bold(URL_PROD, 24), normal(', trân trọng cam kết với Quý Cục về các biện pháp kiểm soát chất lượng và chống hàng giả như sau:', 24)]),
    ...empty(1),
    makeTable([
      [{ runs: [bold('1.', 24), bold(' Hệ thống kiểm duyệt sản phẩm 3 lớp', 24)], fill:'2E75B6' }],
      [{ text: '(i) AI phân tích tự động hình ảnh/tem nhãn sản phẩm, phát hiện dấu hiệu bất thường; (ii) Moderator (Kiểm duyệt viên chuyên trách từ Trung tâm Kỹ thuật Chống Hàng Giả ACF) xét duyệt hồ sơ Seller và từng SKU; (iii) Audit ngẫu nhiên định kỳ toàn bộ sản phẩm đang hiển thị trên sàn. Cấp mã QR truy xuất độc bản cho từng SKU sau khi thẩm định.' }],
      [{ runs: [bold('2.', 24), bold(' Tiếp nhận & xử lý báo cáo hàng giả', 24)], fill:'2E75B6' }],
      [{ text: 'Duy trì kênh báo cáo 24/7 (Hotline ' + SDT + ', email report@acfmart.vn, form tại ' + URL_PROD + '/bao-cao-vi-pham). SLA phản hồi trong 24h; điều tra sơ bộ trong 7–15 ngày; gỡ bỏ sản phẩm vi phạm ngay sau khi có bằng chứng đủ cơ sở. Phối hợp đầy đủ với cơ quan Quản lý thị trường và Công an khi có yêu cầu bằng văn bản hợp pháp.' }],
      [{ runs: [bold('3.', 24), bold(' Lưu vết nhật ký bất biến (Immutable Audit Log)', 24)], fill:'2E75B6' }],
      [{ runs: [normal('Toàn bộ nhật ký giao dịch, nhật ký kiểm duyệt sản phẩm và nhật ký xử lý vi phạm được lưu trữ tối thiểu ', 24), bold('24 (hai mươi bốn) tháng', 24), normal(' theo Điều 40, Nghị định 98/2020/NĐ-CP. Nội dung Livestream bán hàng được lưu trữ tối thiểu ', 24), bold('36 (ba mươi sáu) tháng', 24), normal('. Dữ liệu sẵn sàng xuất trình khi cơ quan thanh tra yêu cầu.', 24)] }],
      [{ runs: [bold('4.', 24), bold(' Cơ chế Escrow bảo vệ người mua', 24)], fill:'2E75B6' }],
      [{ text: 'Toàn bộ thanh toán được giữ tại tài khoản Escrow ngân hàng đối tác và chỉ giải ngân cho Người bán sau khi Người mua xác nhận nhận hàng đúng mô tả. Trường hợp xác định vi phạm hàng giả: hoàn 100% tiền cho Người mua, phong tỏa tài khoản Người bán, thu hồi số tiền liên quan theo biên bản xử lý.' }],
      [{ runs: [bold('5.', 24), bold(' Báo cáo định kỳ và đột xuất', 24)], fill:'2E75B6' }],
      [{ text: 'Thực hiện báo cáo định kỳ hoặc đột xuất theo yêu cầu của cơ quan quản lý nhà nước thông qua Cổng thông tin online.gov.vn. Đảm bảo minh bạch dòng tiền và nghĩa vụ thuế TMĐT theo hướng dẫn phối hợp GDT–MoIT.' }],
    ], [9026]),
    ...empty(1),
    paraLeft(CO + ' cam kết thực hiện đầy đủ, nghiêm túc các biện pháp nêu trên và chịu trách nhiệm pháp lý nếu vi phạm cam kết này theo quy định của pháp luật Việt Nam.'),
    ...signBlock('ĐẠI DIỆN PHÁP LUẬT
' + CO),
  ];
  return new Document({
    styles: { default: { document: { run: { font: 'Times New Roman', size: 24 } } } },
    sections: [{ ...pageProps(), children }],
  });
}

async function main() {
  const OUT = '/mnt/data/outputs';
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  
  const docs = [
    { fn: doc1, name: '1_Don_Dang_Ky_TT59_ACFMart.docx' },
    { fn: doc2, name: '2_De_An_TMDT_ACFMart.docx' },
    { fn: doc3, name: '3_Quy_Che_Hoat_Dong_ACFMart.docx' },
    { fn: doc4, name: '4_Bieu_Phi_Dich_Vu_ACFMart.docx' },
    { fn: doc5, name: '5_Cam_Ket_Chong_Hang_Gia_ACFMart.docx' },
  ];

  for (const d of docs) {
    const buf = await Packer.toBuffer(d.fn());
    fs.writeFileSync(`${OUT}/${d.name}`, buf);
    console.log('✅ ' + d.name);
  }
  console.log('\nDone — 5 files written to ' + OUT);
}

main().catch(e => { console.error(e); process.exit(1); });
