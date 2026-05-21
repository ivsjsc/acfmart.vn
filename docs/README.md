# ACFMart.vn — Tài liệu Dự án

## Tổng quan

ACFMart là sàn Thương mại Điện tử xác thực nguồn gốc sản phẩm, hợp tác với Quỹ Chống Hàng Giả Việt Nam (ACF).

## Cấu trúc tài liệu

| File | Nội dung | Phần tham chiếu |
|------|----------|-----------------|
| [PROJECT_PLAN.md](./PROJECT_PLAN.md) | Bảng kế hoạch triển khai đầy đủ (3,362 dòng) | Toàn bộ dự án |
| [FINANCE_SETTLEMENT_BACKLOG.md](./FINANCE_SETTLEMENT_BACKLOG.md) | Backlog kỹ thuật cho settlement, payout, COD, refund | Tài chính & vận hành |

## Mục lục nhanh — PROJECT_PLAN.md

### Phần I: Chiến lược & Lộ trình
| Mục | Nội dung | Dòng |
|-----|----------|------|
| Executive Summary | Tóm tắt dành cho lãnh đạo | 8-18 |
| I. Lộ trình 5 Phase | Phase 0→5 (2026-2027) | 21-32 |
| II. Đánh giá tiến độ | Tiến độ module (Strategic ~95%, MVP ~40%) | 34-48 |
| III. Công nghệ & Pháp lý | Tech stack, thủ tục Bộ Công Thương, đối tác | 51-77 |
| IV. Chi phí | Đã đầu tư & dự kiến Phase 1-4 | 79-101 |
| V. Vai trò & RACI | IVS JSC, Quỹ ACF, HĐQT | 103-124 |
| VI. So sánh | Truyền thống vs IVS execution | 126-155 |
| VII. Tốc độ triển khai | "Đốt cháy giai đoạn" — AI-first approach | 157-192 |
| VIII. Logistics & Escrow | Tầm nhìn Phase 3+ | 194-202 |
| IX. 30-day priority | Các bước ưu tiên ngay | 204-225 |
| X. Rủi ro & biện pháp | Pháp lý, kỹ thuật, vận hành | 227-235 |
| XI. Kết luận | Kiến nghị cho HĐQT | 237-251 |

### Phần II: Kiến trúc Kỹ thuật
| Mục | Nội dung | Dòng |
|-----|----------|------|
| 1.1 Microservices | Kiến trúc 4 phân hệ (acfmart.vn/store/online/cloud) | 279-347 |
| 1.2 Tech stack | Next.js, NestJS, PostgreSQL, Firebase, Kubernetes | 349-360 |
| 2.x Sprint & Milestones | Sprint hiện tại, mốc đạt, mốc sắp tới | 362-398 |
| 3.x Module Status | Production-ready, In Progress, Backlog | 399-423 |
| 4.x Go-Live | Tiêu chí nghiệm thu, lộ trình, rollback plan | 424-472 |
| 5.x Monitoring | Real-time dashboard, alerting rules | 475-501 |

### Phần III: Tuân thủ Pháp lý
| Cơ sở pháp lý | Nội dung |
|---------------|----------|
| NĐ 52/2013/NĐ-CP | Quy định TMĐT, đăng ký sàn |
| NĐ 85/2021/NĐ-CP | Cập nhật quy định TMĐT, audit log 24 tháng |
| NĐ 13/2023/NĐ-CP (PDPD) | Bảo vệ dữ liệu cá nhân |
| TT 47/2014/TT-BTC | Minh bạch phí giao dịch |
| NĐ 43/2017/NĐ-CP | Ghi nhãn hàng hoá |
| Luật An ninh mạng 2018 | Quản lý nội dung, lưu trữ dữ liệu |

### Phần IV: Affiliate & Social Commerce
| Mục | Nội dung | Dòng |
|-----|----------|------|
| Affiliate Management | Dashboard, link tracking, commission | 1304-1470 |
| Fraud Detection | Algorithm chống gian lận affiliate | 1454-1470 |
| Social Commerce | Short video, livestream, UGC | 1965-2050 |
| Content Moderation | AI moderation, manual review | 2001-2010 |

### Phần V: Kiến trúc 4 Phân hệ
| Domain | Vai trò | Đối tượng |
|--------|---------|-----------|
| `acfmart.vn` | Buyer marketplace | Người mua |
| `acfmart.store` | Seller portal | Người bán (KYC, quản lý shop) |
| `acfmart.online` | Social commerce | UGC, reviews, follows |
| `acfmart.cloud` | Admin/Moderator | Kiểm duyệt, audit, compliance |

## Các trang chính sách pháp lý

Đã triển khai tại `src-acfmart/pages/`:

| Route | File | Nội dung |
|-------|------|----------|
| `/legal/terms` | TermsOfServicePage.tsx | Điều khoản sử dụng Sàn TMĐT |
| `/legal/seller-terms` | SellerTermsPage.tsx | Điều khoản Người bán |
| `/legal/seller-fees` | SellerFeesPage.tsx | Chính sách Phí Người bán |
| `/legal/privacy` | DataProtectionPolicyPage.tsx | PDPD — Bảo vệ dữ liệu cá nhân |
| `/legal/privacy/buyer` | PrivacyPolicyBuyer.tsx | Bảo mật cho Người mua |
| `/legal/privacy/seller` | PrivacyPolicySeller.tsx | Bảo mật cho Người bán |
| `/legal/return` | ReturnPolicyPage.tsx | Đổi trả & Hoàn tiền |
| `/legal/shipping` | ShippingPolicyPage.tsx | Vận chuyển |
| `/legal/payment` | PaymentPolicyPage.tsx | Thanh toán |
| `/legal/affiliate` | AffiliatePolicyPage.tsx | Tiếp thị liên kết |
| `/anti-counterfeit` | AntiCounterfeitPage.tsx | Chống hàng giả |
