# ACFMart Finance & Settlement Backlog

Tài liệu này chuyển đánh giá dòng tiền của ACFMart thành backlog kỹ thuật cụ thể, bám vào hệ thống hiện tại:

- `functions/src/payments.ts`
- `functions/src/shipping.ts`
- `functions/src/finance.ts`
- `functions/src/refunds.ts`
- `src/features/seller/components/SellerFinanceScreen.tsx`
- `src/features/seller/components/finance/PayoutScheduleCard.tsx`

Mục tiêu:

- Giải phóng số tiền giữ đúng hạn.
- Có settlement data đủ rõ để đối soát.
- Không để COD/refund/payout chạy rời rạc.
- Chuẩn hóa dần theo mô hình sàn lớn: payment, shipping, ledger, dispute, statement.

## 1) Tình trạng hiện tại

### Đã có

- Tạo đơn và nhận webhook thanh toán online.
- Tích hợp GHTK shipping webhook và lưu `pick_money`.
- Ledger seller với `pendingBalance`, `holdBalance`, `availableBalance`, `sellerPayouts`.
- Payout request / payout paid flow.
- Return request và refund request cơ bản.
- UI seller finance hiển thị số dư và lịch chi trả.

### Còn thiếu

- Release worker tự động chuyển `holdBalance -> availableBalance`.
- Settlement snapshot/report xuất theo kỳ.
- COD reconciliation dashboard.
- Refund adapter gọi thật sang PSP.
- Dispute / claim flow cho hàng trả, hoàn, bồi thường.
- Báo cáo quyết toán kiểu sàn lớn.

## 2) Backlog ưu tiên

### P0 - Làm ngay

| Item | Mục tiêu | Hiện trạng | Done when | Code surface |
|---|---|---|---|---|
| Auto-release hold balance | Tự mở tiền sau hết hold period | Chưa có worker | Worker chạy theo lịch, release `holdBalance` sang `availableBalance`, có log transaction | `functions/src/finance.ts` |
| Settlement snapshot tối thiểu | Có một bản chụp số liệu cho finance | UI chỉ đang đọc balance từng phần | Có hàm trả về tổng pending/hold/available/last payout/next payout | `functions/src/finance.ts`, `src/lib/seller-finance-service.ts` |
| COD reconciliation audit trail | GHTK đối soát xong phải có dấu vết kế toán rõ | Có lưu `pick_money`, chưa có report hóa | Có entry transaction/summary cho COD settlement theo seller | `functions/src/shipping.ts`, `functions/src/finance.ts` |

### P1 - Làm sau khi P0 ổn định

| Item | Mục tiêu | Hiện trạng | Done when | Code surface |
|---|---|---|---|---|
| Refund provider adapter | Refund thật qua ZaloPay/VNPay/MoMo | Mới ghi nhận nội bộ / pending | Có adapter theo provider, xử lý webhook và idempotency | `functions/src/payments.ts`, `functions/src/refunds.ts` |
| Payout orchestration | Quản lý lịch chi trả rõ hơn | Có request và paid state | Có approve/reject/paid flow chuẩn và report | `functions/src/finance.ts` |
| Dispute / return state machine | Chuẩn hóa tranh chấp, đổi trả, bồi thường | Return flow còn cơ bản | Có state machine, SLA, evidence, claim carrier | `functions/src/refunds.ts`, `src/features/order/*` |
| Settlement statement export | Xuất Excel/CSV theo kỳ | Chưa có statement chuẩn sàn | Có report kỳ ngày/tuần/tháng theo seller | `src/lib/seller-finance-service.ts`, UI finance |

### P2 - Nâng cấp hệ thống

| Item | Mục tiêu | Hiện trạng | Done when | Code surface |
|---|---|---|---|---|
| Daily settlement email | Gửi báo cáo tự động | Chưa có | Seller nhận email settlement hằng ngày/tuần | `functions/src/finance.ts` |
| Merchant payout validation | Kiểm tra tài khoản ngân hàng trước payout | Chưa có chuẩn hóa | Bank account verify / payout validation | `src/features/seller/*`, backend finance |
| Partner integration pack | Bộ hồ sơ tích hợp cho đối tác | Chưa đóng gói | Có tài liệu flow, security, webhook, test cases | `docs/` |
| Multi-seller COD policy | Tách COD theo seller/token nếu cần | Mô hình còn chung | Có policy rõ cho single-account / multi-account | `docs/`, `functions/src/shipping.ts` |

## 3) Chiến lược thực thi

### Sprint 1

- Bật worker tự release hold.
- Chốt dữ liệu settlement snapshot tối thiểu.
- Rà soát lại logic COD settlement để đảm bảo transaction entry nhất quán.

### Sprint 2

- Thêm report xuất CSV/Excel cho seller finance.
- Chuẩn hóa payout lifecycle.
- Tách refund theo provider.

### Sprint 3+

- Xây dispute center và carrier claim flow.
- Tạo settlement email và báo cáo quản trị.
- Hoàn thiện partner pack để onboarding đối tác.

## 4) Nguyên tắc thiết kế

- `Shipping` chỉ cung cấp trạng thái vận đơn và tín hiệu COD.
- `Payment` chỉ xác nhận thanh toán và phản hồi webhook.
- `Ledger` là nguồn sự thật cho số dư seller.
- `Payout` là trạng thái chi trả, không đồng nghĩa release hold.
- `Refund` phải là flow riêng, có idempotency và audit trail.

## 5) Acceptance criteria cho P0

- Số dư `holdBalance` tự chuyển sang `availableBalance` sau khi quá hạn.
- Mỗi lần release có transaction log để đối soát.
- Không release trùng khi function retry.
- Không ảnh hưởng tới `pendingBalance` hoặc payout đang chờ.
- Có log đủ để theo dõi số tiền đã release theo kỳ.

