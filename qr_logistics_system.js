/**
 * HỆ THỐNG QUÉT MÃ QR KIỂM SOÁT 5 CHẠM (5-TOUCH POINTS)
 * 
 * Quy trình:
 * 1. Shop đóng gói & Dán mã (Khởi tạo đơn)
 * 2. Đơn vị vận chuyển nhận hàng (Scan 1)
 * 3. Nhập kho phân loại/Sorting (Scan 2)
 * 4. Kho phát & Shipper nhận hàng (Scan 3)
 * 5. Giao thành công & Người nhận xác nhận (Scan 4 & 5 - gộp hoặc tách tùy quy trình, ở đây ta làm 5 bước rõ ràng)
 * 
 * Định nghĩa 5 chạm cụ thể theo yêu cầu:
 * Touch 1: Đơn vị vận chuyển nhận hàng từ Shop.
 * Touch 2: Hàng về kho trung chuyển (Nhận).
 * Touch 3: Hàng tới kho phát (Phát đi).
 * Touch 4: Shipper giao hàng (Chạm cuối cùng trước khi trao tay).
 * Touch 5: Người nhận hàng quét xác nhận đã nhận và chuẩn hàng.
 */

const express = require('express');
const app = express();
app.use(express.json());

// --- GIẢ LẬP DATABASE ---
// Trong thực tế, dữ liệu này nằm trong MySQL/PostgreSQL/MongoDB
let orders = {}; 
let scanLogs = [];

/**
 * Khởi tạo đơn hàng mới (Khi khách đặt, Shop in mã QR)
 * @param {string} orderId - Mã đơn hàng
 * @param {string} customerName - Tên khách hàng
 * @param {array} items - Danh sách mặt hàng
 * @returns {object} Thông tin đơn hàng và mã QR
 */
function createOrder(orderId, customerName, items) {
    const qrCodeData = `QR_${orderId}_${Date.now()}`; // Tạo mã QR duy nhất
    
    orders[orderId] = {
        orderId,
        customerName,
        items,
        qrCode: qrCodeData,
        status: 'CREATED', // Đã tạo, chờ lấy hàng
        touches: [], // Mảng lưu lịch sử 5 chạm
        isComplete: false,
        createdAt: new Date()
    };
    
    console.log(`[SHOP] Đã tạo đơn ${orderId}. Mã QR để in: ${qrCodeData}`);
    return { orderId, qrCode: qrCodeData, customerName, items };
}

/**
 * Hàm xử lý quét QR (Core Logic)
 * @param {string} qrCode - Mã QR quét được
 * @param {number} touchPoint - Số thứ tự điểm chạm (1-5)
 * @param {string} actor - Người quét (Shipper, Kho, Khách...)
 * @param {string} location - Vị trí quét
 */
function scanQR(qrCode, touchPoint, actor, location) {
    // Tìm đơn hàng chứa mã QR này
    const order = Object.values(orders).find(o => o.qrCode === qrCode);
    
    if (!order) {
        return { success: false, message: "Mã QR không tồn tại trong hệ thống" };
    }

    const orderId = order.orderId;

    // Validate tính liên tiếp của các điểm chạm
    const expectedTouch = order.touches.length + 1;
    
    if (touchPoint !== expectedTouch) {
        return { 
            success: false, 
            message: `Lỗi quy trình: Đơn ${orderId} đang chờ chạm thứ ${expectedTouch}, nhưng nhận được chạm thứ ${touchPoint}. Cần rà soát!`,
            currentStatus: order.status
        };
    }

    // Cập nhật thông tin chạm
    const touchRecord = {
        step: touchPoint,
        actor,
        location,
        timestamp: new Date(),
        verified: true
    };

    order.touches.push(touchRecord);
    
    // Cập nhật trạng thái đơn hàng dựa trên số lần chạm
    updateOrderStatus(order, touchPoint);

    // Ghi log
    scanLogs.push({ orderId, ...touchRecord });

    console.log(`[SCAN] Đơn ${orderId}: Chạm ${touchPoint}/5 thành công bởi ${actor} tại ${location}`);

    return {
        success: true,
        message: `Quét thành công. Đã hoàn thành bước ${touchPoint}/5.`,
        currentStep: touchPoint,
        totalSteps: 5,
        isComplete: order.isComplete,
        nextStep: touchPoint < 5 ? touchPoint + 1 : null
    };
}

function updateOrderStatus(order, touchPoint) {
    switch (touchPoint) {
        case 1:
            order.status = 'PICKED_UP'; // Đã lấy hàng
            break;
        case 2:
            order.status = 'AT_HUB_RECEIVED'; // Về kho nhận
            break;
        case 3:
            order.status = 'AT_DELIVERY_HUB'; // Tới kho phát
            break;
        case 4:
            order.status = 'OUT_FOR_DELIVERY'; // Shipper đang giao
            break;
        case 5:
            order.status = 'DELIVERED_VERIFIED'; // Đã giao và xác nhận
            order.isComplete = true;
            break;
    }
}

/**
 * Báo cáo các đơn hàng chưa đủ 5 chạm (Cần rà soát)
 */
function getIncompleteOrders() {
    const incomplete = Object.values(orders).filter(o => !o.isComplete);
    
    return incomplete.map(o => ({
        orderId: o.orderId,
        currentStatus: o.status,
        touchesCompleted: o.touches.length,
        missingTouches: 5 - o.touches.length,
        lastTouchTime: o.touches.length > 0 ? o.touches[o.touches.length - 1].timestamp : 'Chưa có lần quét nào',
        warning: o.touches.length === 0 ? "CHƯA CÓ LẦN QUÉT NÀO - CẦN KIỂM TRA GẤP" : "THIẾU CHẠM CUỐI - CẦN RÀ SOÁT"
    }));
}

// --- API ENDPOINTS (Mô phỏng) ---

// 1. Tạo đơn
app.post('/api/create-order', (req, res) => {
    const { orderId, customerName, items } = req.body;
    const result = createOrder(orderId, customerName, items);
    res.json({ message: "Đơn hàng tạo thành công. In mã QR sau:", data: result });
});

// 2. Quét QR (Dùng chung cho cả 5 bước, frontend sẽ gửi số bước tương ứng)
app.post('/api/scan', (req, res) => {
    const { qrCode, touchPoint, actor, location } = req.body;
    // touchPoint: 1, 2, 3, 4, 5
    const result = scanQR(qrCode, touchPoint, actor, location);
    
    if (!result.success) {
        return res.status(400).json(result);
    }
    res.json(result);
});

// 3. Báo cáo đơn hàng lỗi/thiếu chạm
app.get('/api/reports/incomplete', (req, res) => {
    const report = getIncompleteOrders();
    res.json({
        totalIncomplete: report.length,
        details: report
    });
});

// --- DEMO CHẠY THỬ ---
console.log("--- BẮT ĐẦU DEMO QUY TRÌNH 5 CHẠM ---");

// Bước 0: Khách đặt, Shop tạo đơn
const demoOrder = createOrder("DONHANG_001", "Nguyen Van A", ["Ao thun", "Quan Jean"]);
const qr = demoOrder.qrCode;

console.log(`\nMã QR cần in cho đơn DONHANG_001: ${qr}\n`);

// Bước 1: Đơn vị vận chuyển lấy hàng
let result1 = scanQR(qr, 1, "Shipper_Nhan_Hang", "Cửa hàng Quận 1");
console.log("Kết quả quét 1:", result1);

// Bước 2: Về kho trung chuyển
let result2 = scanQR(qr, 2, "Nhan_Vien_Kho", "Kho Trung Chuyển Miền Nam");
console.log("Kết quả quét 2:", result2);

// Bước 3: Tới kho phát
let result3 = scanQR(qr, 3, "Nhan_Vien_Kho_Phat", "Kho Phát Quận Gò Vấp");
console.log("Kết quả quét 3:", result3);

// Bước 4: Shipper đi giao
let result4 = scanQR(qr, 4, "Shipper_Giao_Hang", "Đường Nguyễn Văn Linh");
console.log("Kết quả quét 4:", result4);

// Bước 5: Người nhận xác nhận
let result5 = scanQR(qr, 5, "Khach_Hang", "Tại nhà khách");
console.log("Kết quả quét 5:", result5);

// Giả lập một đơn hàng khác bị lỗi (chỉ quét 3 bước rồi dừng)
console.log("\n--- GIẢ LẬP ĐƠN HÀNG LỖI (DONHANG_002) ---");
const errorOrder = createOrder("DONHANG_002", "Tran Thi B", ["Giay Sneaker"]);
const qr2 = errorOrder.qrCode;
console.log(`Mã QR cho đơn DONHANG_002: ${qr2}`);

scanQR(qr2, 1, "Shipper", "Cửa hàng");
scanQR(qr2, 2, "Kho", "Kho TB");
// Dừng ở đây, không quét tiếp -> Sẽ bị báo cáo

// Test thử quét sai thứ tự
console.log("\n--- TEST QUÉT SAI THỨ TỰ ---");
const wrongScan = scanQR(qr2, 5, "Ai_do", "Somewhere"); // Cố quét bước 5 khi mới chỉ có 2 bước
console.log("Kết quả quét sai:", wrongScan);

// Kiểm tra báo cáo
console.log("\n--- BÁO CÁO CÁC ĐƠN CHƯA ĐỦ 5 CHẠM ---");
const incompleteReport = getIncompleteOrders();
console.log(JSON.stringify(incompleteReport, null, 2));

module.exports = { createOrder, scanQR, getIncompleteOrders, app };
