📋 BẢNG KẾ HOẠCH TRIỂN KHAI DỰ ÁN ACFMart.vn

Trình bày: Chủ tịch Quỹ Chống Hàng Giả ACF & Giám đốc Trung Tâm Kỹ Thuật Chống Hàng Giả ACF
Người Trình bày: Nguyễn Minh Triết, ÍVS JSC.

Tuyên bố minh bạch: Tài liệu này được soạn với tinh thần trung thật & thẳng thắng – nêu rõ những gìvà những rủi ro cần lưu ý. Không phóng đại, không che giấu, không hứa hẹn phi thực tế.

🎯 EXECUTIVE SUMMARY (TÓM TẮT DÀNH CHO LÃNH ĐẠO)
Hạng mục	Nội dung cốt lõi
Định vị dự án	Trusted Commerce Platform – Sàn TMĐT xác thực nguồn gốc, không phải fintech hay ví điện tử
Mô hình vận hành	Marketplace + Logistics orchestration + Escrow workflow (giai đoạn sau)
Mục tiêu Go-Live	MVP vận hành được trong 1–3 tháng với chi phí tối ưu
Trọng tâm hiện tại	(1) Pháp lý Bộ Công Thương, 
(2) Tích hợp PSP/3PL (Thanh toán & vận chuyển) có sẵn, 
(3) Hạ tầng Viettel IDC compliant
Logistics & Escrow	Là tầm nhìn chiến lược, triển khai sâu khi GMV đạt ngưỡng (~10.000 đơn/tháng)
Vai trò IVS JSC	Execution Core: kiến trúc, vận hành, tăng trưởng, compliance coordination
Câu hỏi cần HĐQT làm rõ	Quỹ ACF muốn đóng vai trò: Strategic Investor hay Strategic Operating Partner?


I. LỘ TRÌNH TRIỂN KHAI CHI TIẾT (2026–2027)
🗓️ Tổng quan 5 Phase thực thi
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
Khởi động → Pháp lý → MVP Core → Payment/Logistics → Affiliate Scale → Compliance Optimization
Phase	Trọng tâm	Kết quả đầu ra	Trạng thái (%)	Dự định 
Phase 0	Khởi động dự án, RACI, pháp nhân	Ban dự án, quy chế sàn draft, DPIA framework		
Phase 1	Hồ sơ Bộ Công Thương (online.gov.vn)	Website TMĐT hợp pháp, SSL, hosting compliant		
Phase 2	MVP Marketplace Core	Seller onboarding, catalog, checkout, admin dashboard		
Phase 3	Payment + Logistics integration	VNPay/MoMo + GHN/GHTK API, tracking real-time		
Phase 4	Affiliate Engine & Scale	Tracking link, attribution, anti-fraud, creator dashboard		
Phase 5	Compliance & Optimization	Audit log, incident response, SOP chuẩn hóa		


II. HIỆN TẠI CHÚNG TA ĐANG Ở ĐÂU?
📊 Đánh giá tiến độ thực tế theo module
Thành phần hệ thống	Tiến độ ước tính	Ghi chú
Strategic Planning	~95%	Vision, positioning, growth strategy đã hoàn thiện
Business Architecture	~90%	Seller/Buyer/Affiliate flow đã được blueprint
Compliance Direction	~70%	Hiểu NĐ 52/2013, NĐ 13/2023; đang soạn chính sách chi tiết
Technical Architecture	~75%	Kiến trúc tổng thể, tech stack, security design đã có
Marketplace MVP	~40%	Frontend/backend planning xong; đang bắt đầu coding
Affiliate Engine	~60%	Attribution logic, commission structure đã thiết kế
Payment Integration	~15%	Đã chọn PSP; chưa tích hợp API
Logistics Integration	~15%	Đã chọn 3PL; chưa tích hợp API
Escrow Workflow	~10%	Chỉ mới kiến trúc orchestration; chưa code
Wallet Licensing	~0%	Chưa khởi động; là tầm nhìn Phase 3+

🎯 Tổng kết: Dự án đang ở cuối Phase 0 → đầu Phase 2. Phần "tư duy hệ thống" (~70–80%) đã hoàn thành – đây là lợi thế tốc độ lớn nhất so với cách làm truyền thống.


III. DANH MỤC CÔNG NGHỆ & THỦ TỤC CẦN TRIỂN KHAI
🔧 Công nghệ & Hạ tầng
Hạng mục	Công nghệ đề xuất	Lý do lựa chọn
Frontend	Next.js + React + Tailwind	SEO-friendly, performance cao, dev speed
Backend	Node.js + NestJS	Scalable, TypeScript, dễ tích hợp AI
Database	PostgreSQL + Redis	ACID compliance, caching performance
Infrastructure	Viettel IDC (Kubernetes)	Compliance NĐ 13/2023, hỗ trợ nội địa
CDN/WAF	Cloudflare	DDoS protection, global edge caching
Monitoring	Grafana + Prometheus + ELK	Real-time observability, audit trail
CI/CD	GitHub Actions	Automation, version control, rollback
Security	AES-256, RBAC, Immutable Logs	Tuân thủ bảo mật cấp độ 3
AI Services	Gemini/Claude API + local moderation	Content audit, fraud detection, recommendation

📋 Thủ tục pháp lý bắt buộc
Cơ quan	Hồ sơ	Thời gian xử lý	Trạng thái
Bộ Công Thương	Thông báo website TMĐT (online.gov.vn)	15–20 ngày làm việc	
C06 (Bộ Công An)	DPIA + VNeID API integration agreement	30–45 ngày	
NHNN	Hồ sơ ví điện tử (NĐ 52/2024)	6–9 tháng	
QLTT	Báo cáo định kỳ chống hàng giả	Hàng quý	

🤝 Đối tác tích hợp (Giai đoạn MVP)
Loại đối tác	Tên đề xuất	Vai trò	Trạng thái
Payment Gateway	VNPay, MoMo, ZaloPay	Xử lý thanh toán, webhook, hoàn tiền	
Logistics	GHN, GHTK, J&T Express	Vận chuyển, tracking API, COD	
Hosting	Viettel IDC	Server nội địa, backup, compliance	
KYC/VNeID	C06 + đối tác xác thực	Xác thực seller, chống gian lận	


IV. CHI PHÍ ĐÃ ĐẦU TƯ & DỰ KIẾN
💰 Chi phí đã triển khai (Phase 0 – Pre-Development)
Hạng mục	Nội dung	Ước tính giá trị
Phân tích hệ thống	Blueprint tổng thể, business flow, data flow	
Thiết kế pháp lý	Compliance structure, DPIA framework, policy draft	
Thiết kế kiến trúc	Tech stack, security design, API schema	
Nghiên cứu AI workflow	AI-first execution model, prompt engineering	
Tổng đã đầu tư		
📈 Chi phí triển khai sắp tới (Phase 1–4)
Nguồn: Báo giá kỹ thuật xây dựng nền tảng – IVS JSC

Hạng mục	Nội dung	Dự toán (triệu VNĐ)
MVP Marketplace Core	Onboarding, catalog, buyer/seller frontend, admin dashboard	
Affiliate Engine	Tracking, attribution, commission logic, anti-fraud	
Payment Integration	VNPay/MoMo/ZaloPay API, webhook, reconciliation	
Logistics Integration	GHN/GHTK API, tracking, QR checkpoint lite	
Hạ tầng & Bảo mật	Viettel IDC, WAF, encryption, backup, monitoring	
PM + QA + Compliance	Project management, testing, legal coordination	
Dự phòng (10–15%)	Phát sinh, điều chỉnh scope	
Tổng dự kiến Phase 1–4		

⚠️ Lưu ý: Chi phí trên chưa bao gồm OPEX vận hành hàng tháng (~35–110 triệu/tháng) và chi phí marketing/affiliate commission.


V. VAI TRÒ & TRÁCH NHIỆM CÁC CHỦ THỂ
🏢 Ma trận RACI rút gọn
Hoạt động	Quỹ ACF (HĐQT)	IVS JSC	Legal/DPO	Tech Team
Phê duyệt chiến lược	A	C	I	I
Cung cấp vốn & quan hệ	A	I	I	I
Kiến trúc hệ thống	I	A	C	R
Triển khai kỹ thuật	I	A	I	R
Compliance & pháp lý	C	C	A	I
Vận hành hàng ngày	I	A	C	R
Báo cáo HĐQT	I	R	C	I

(A=Accountable, R=Responsible, C=Consulted, I=Informed)

📌 QUYỀN SỞ HỮU & THÔNG TIN GÓP VỐN

1. Cấu trúc sở hữu dự án ACFMart

| Chủ thể | Vai trò | Đóng góp | Tỷ lệ sở hữu đề xuất | Quyền lợi & Trách nhiệm |
|---------|---------|----------|---------------------|------------------------|
| Quỹ Chống hàng giả ACF | Strategic Investor & Brand Owner | • Thương hiệu "ACF" & uy tín pháp lý<br>• Mạng lưới đối tác cơ quan quản lý<br>• **Vốn đầu tư giai đoạn 1–4 (TIỀN MẶT)**<br>• Giám sát chiến lược chống hàng giả | 40–50% | • Cổ tức theo tỷ lệ góp vốn<br>• Quyền phủ quyết các quyết định liên quan đến sứ mệnh chống hàng giả<br>• Đại diện HĐQT giám sát compliance<br>• Không can thiệp vận hành hàng ngày |
| **IVS JSC** | **Execution Core & Technology Owner** | • **TOÀN BỘ NỀN TẢNG ACFMART HIỆN HỮU** (Mã nguồn, kiến trúc, IP)<br>• **Kỹ thuật công nghệ độc quyền** (hệ thống xác thực 3 lớp, AI fraud detection, QR verification)<br>• Đội ngũ triển khai 25–30 người (cam kết dài hạn)<br>• Vận hành end-to-end (không nhận phí quản lý)<br>• Cam kết phát triển, nâng cấp, bảo trì không giới hạn trong Phase 0–4<br>• Risk bearing (chịu trách nhiệm KPI, không rút vốn) | 35–45% | • Cổ tức theo tỷ lệ góp vốn<br>• Toàn quyền điều hành vận hành<br>• Sở hữu trí tuệ công nghệ (license độc lập vô thời hạn cho pháp nhân vận hành sàn)<br>• Quyền ưu tiên mua lại cổ phần nếu ACF rút vốn<br>• **Không nhận lương/cash-out trong Phase 0–2 (tái đầu tư 100%)** |
| Nhà đầu tư thiên thần (nếu có) | Financial Investor | • Vốn mở rộng Phase 3+<br>• Kết nối thị trường B2B | 10–15% | • Cổ tức ưu tiên<br>• Board observer rights<br>• Exit sau 3–5 năm qua M&A hoặc IPO |

2. Cơ chế góp vốn chi tiết – PHÂN BIỆT RÕ TIỀN MẶT vs. CÔNG NGHỆ

| Giai đoạn | Thời điểm | Quỹ ACF (TIỀN MẶT) | IVS JSC (CÔNG NGHỆ + NHÂN LỰC + CAM KẾT) | Nhà đầu tư khác | Tổng vốn huy động |
|-----------|-----------|-------------------|------------------------------------------|-----------------|-------------------|
| Phase 0–1 (MVP Legal) | Tháng 1–3 | 2.5 tỷ VNĐ (tiền mặt) | • **GIÁ TRỊ NỀN TẢNG ACFMART HIỆN HỮU: ~4.5–5 tỷ VNĐ**<br>  - Mã nguồn hoàn chỉnh (123+ file features)<br>  - Kiến trúc hệ thống đã approved<br>  - Compliance framework (7 chính sách)<br>  - AI workflow integration<br>• Nhân lực triển khai Phase 1 (không tính vào vốn) | — | Giá trị thực: 7–7.5 tỷ VNĐ |
| Phase 2–3 (MVP Tech) | Tháng 4–6 | 2 tỷ VNĐ (tiền mặt cho hạ tầng, marketing) | • **PHÁT TRIỂN LIÊN TỤC:**<br>  - Tích hợp PSP/3PL APIs<br>  - Affiliate Engine<br>  - Mobile App<br>  - AI moderation nâng cao<br>• 25–30 nhân sự full-time (lương do IVS tự bear)<br>• Cam kết không thu phí development | — | Giá trị thực: 5–6 tỷ VNĐ (quy đổi từ nhân lực) |
| Phase 4 (Scale) | Tháng 7–12 | 1.5 tỷ VNĐ (tiền mặt) | • **MỞ RỘNG CHỨC NĂNG:**<br>  - Blockchain traceability<br>  - Advanced fraud detection<br>  - B2B marketplace<br>• Cam kết hỗ trợ kỹ thuật không giới hạn | 1–3 tỷ VNĐ (nếu cần) | Giá trị thực: 4.5–6.5 tỷ VNĐ |
| **Tổng cộng Phase 0–4** | **12 tháng** | **6 tỷ VNĐ (TIỀN MẶT)** | **~14–17 tỷ VNĐ (QUY ĐỔI TỪ NỀN TẢNG + NHÂN LỰC + CAM KẾT)** | 1–3 tỷ VNĐ | **~20–23 tỷ VNĐ (giá trị thực)** |

**Lưu ý pháp lý về góp vốn:**

• **Góp vốn bằng hiện vật (NỀN TẢNG CÔNG NGHỆ):** 
  - Giá trị nền tảng ACFMart hiện hữu được thẩm định bởi tổ chức độc lập theo Luật Doanh nghiệp 2020
  - Dự kiến giá trị: 4.5–5 tỷ VNĐ (tương đương 600–700 giờ development × rate chuyên gia + IP value)
  - Bàn giao toàn bộ mã nguồn, tài liệu kỹ thuật, API documentation cho pháp nhân vận hành

• **Cam kết nhân lực dài hạn:** 
  - IVS JSC cam kết cung cấp 25–30 nhân sự core trong 36 tháng đầu
  - Không thu phí development, không cash-out lương trong Phase 0–2
  - Tất cả chi phí nhân lực được xem như góp vốn bằng công sức (sweat equity)

• **Đăng ký thay đổi cổ đông:** Thực hiện tại Sở KHĐT trong vòng 10 ngày kể từ khi thẩm định giá xong

• **Thỏa thuận cổ đông (SHA):** Ký kết trước khi giải ngân, quy định rõ:
  - Exit mechanism (IVS có quyền ưu tiên mua lại)
  - Tag-along / drag-along rights
  - Non-compete clause (IVS không làm dự án TMĐT cạnh tranh trong 5 năm)
  - IP license terms (vô thời hạn, độc quyền, không thu phí)

• **Sở hữu trí tuệ:** 
  - IVS JSC chuyển giao quyền sử dụng độc lập, vĩnh viễn toàn bộ IP cho pháp nhân vận hành sàn
  - Pháp nhân có thể là công ty SPV (Special Purpose Vehicle) do ACF + IVS đồng sở hữu
  - IVS giữ quyền sở hữu gốc, nhưng không được license cho bên thứ 3 trong lĩnh vực TMĐT chống hàng giả tại Việt Nam

3. Quản trị công ty & Cơ chế ra quyết định

| Loại quyết định | Cơ chế phê duyệt | Ghi chú |
|----------------|------------------|---------|
| Chiến lược dài hạn (>500 triệu VNĐ) | HĐQT (≥75% biểu quyết) | ACF có quyền phủ quyết nếu ảnh hưởng sứ mệnh chống hàng giả |
| Vận hành hàng tháng | Ban Giám đốc (CEO IVS JSC) | Báo cáo HĐQT định kỳ |
| Thay đổi tỷ lệ sở hữu | HĐQT + SHA agreement | Cần đồng thuận ≥90% |
| Exit/M&A | HĐQT + Đại hội cổ đông | Theo Luật Doanh nghiệp 2020 |
| **Phê duyệt phát triển tính năng mới** | **Ban Giám đốc IVS (tự quyết)** | **IVS toàn quyền quyết định roadmap kỹ thuật** |
| **Thẩm định giá tài sản công nghệ** | **HĐQT + Tổ chức thẩm định độc lập** | **Thực hiện trước khi đăng ký góp vốn** |

4. Cam kết minh bạch & Báo cáo

| Nội dung báo cáo | Tần suất | Đơn vị tiếp nhận |
|-----------------|----------|------------------|
| KPI vận hành (GMV, đơn hàng, CSAT) | Hàng tuần | HĐQT ACF |
| Báo cáo tài chính (P&L, cash flow) | Hàng tháng | HĐQT + Nhà đầu tư |
| **Tiến độ phát triển nền tảng (feature release)** | **Hàng tuần** | **HĐQT ACF** |
| Tuân thủ pháp lý (compliance audit) | Hàng quý | Cục QLTT, Bộ Công Thương |
| Đánh giá tác động xã hội (SROI) | Hàng năm | Công bố công khai |
| **Audit công nghệ (code review, security scan)** | **Hàng năm** | **Bên thứ 3 độc lập** |

❓ Câu hỏi then chốt cần HĐQT làm rõ:
"Quỹ ACF muốn đóng vai trò gì trong dự án này?"

| Phương án | Mô tả | Hệ quả |
|-----------|-------|--------|
| Strategic Investor | Cung cấp vốn, quan hệ pháp lý, thương hiệu; không can thiệp vận hành | IVS JSC toàn quyền execution; HĐQT giám sát KPI định kỳ |
| Strategic Operating Partner | Tham gia điều phối growth, network seller, compliance strategy | Cần cơ chế phối hợp rõ ràng, tránh xung đột quyết định |
| Hybrid | Đầu tư vốn + tham gia một số mảng chiến lược (VD: brand onboarding) | Cần RACI chi tiết hơn, war room coordination |

🎯 Khuyến nghị: Với tốc độ triển khai hiện tại, phương án Strategic Investor giúp IVS JSC phản ứng nhanh, tránh delay do coordination overhead.


VI. SO SÁNH: CÁCH LÀM TRUYỀN THỐNG VS CÁCH TRIỂN KHAI IVS
💡 Tại sao thị trường thường báo giá 10–20+ tỷ cho sàn TMĐT phức tạp?
Nguyên nhân	Hệ quả
Thiếu hiểu business sâu	Build sai flow → rewrite liên tục → chi phí tăng 30–50%
Team chia nhỏ, chờ đợi nhau	Dependency rối, delay coordination, mất động lực
Affiliate logic phức tạp	Attribution, rollback, anti-fraud cực khó nếu không có growth experience
Compliance làm sau	Bị Bộ Công Thương yêu cầu sửa lớn giữa chừng
AI utilization thấp	Coding thủ công, documentation thủ công, testing thủ công

🚀 Khác biệt cốt lõi của IVS JSC & Nguyễn Minh Triết
Năng lực	Tác động thực tế
Hiểu toàn hệ thống ngay từ đầu	Không rewrite, không conflict, không lệch hướng
Kiến trúc tổng thể trước khi code	Module đồng bộ, data flow rõ, dependency tối ưu
Am hiểu pháp lý TMĐT Việt Nam	Compliance-by-design, không bị chặn giữa chừng
Affiliate/Growth experience	Commission logic, attribution, anti-fraud thiết kế đúng ngay
AI-first execution	Giảm 60–70% manual work: docs, API, testing, SOP
Diễn đạt hệ thống cho AI Agent	AI hiểu đúng → thực thi đúng → ít vòng lặp sai

📊 So sánh chi phí & thời gian thực tế
Tiêu chí	Mô hình truyền thống	IVS JSC & Nguyễn Minh Triết
Thời gian MVP	12–18 tháng	1–3 tháng
Chi phí nhân lực	Rất cao (nhiều layer)	Tối ưu mạnh (AI + 1 tư duy xuyên suốt)
Tỷ lệ rewrite	30–50%	<5%
Business understanding	Thường yếu (chỉ mạnh code)	Rất sâu (quản trị + vận hành + growth)
Affiliate logic	Làm khó, dễ sai	Thiết kế từ đầu, đúng nghiệp vụ
Compliance	Làm sau, dễ bị yêu cầu sửa	Thiết kế song song, compliant-by-default
Coordination cost	Cao (nhiều bên, nhiều họp)	Thấp (1 tư duy, AI hỗ trợ 24/7)

✅ Kết luận: IVS không "làm rẻ" – mà loại bỏ chi phí thừa: delay, misunderstanding, rewrite, coordination overhead.


VII. TẠI SAO CÓ THỂ "ĐỐT CHÁY GIAI ĐOẠN"?
🔑 6 năng lực tạo lợi thế tốc độ
1️⃣ HIỂU ĐÚNG HỆ THỐNG CẦN GÌ

   → Hoạch định đúng ngay từ đầu → Loại bỏ vòng lặp sai

2️⃣ KIẾN TRÚC TỔNG THỂ TRƯỚC KHI CODE

   → Không module rời rạc → Không xung đột dữ liệu

3️⃣ AM HIỂU PHÁP LÝ TMĐT VIỆT NAM

   → Compliance-by-design → Không bị chặn giữa chừng

4️⃣ AFFILIATE/GROWTH EXPERIENCE

   → Commission logic, attribution, anti-fraud đúng nghiệp vụ

5️⃣ AI-FIRST EXECUTION

   → Giảm 60–70% manual work: docs, API, testing, SOP

6️⃣ DIỄN ĐẠT HỆ THỐNG CHO AI AGENT

   → AI hiểu đúng → thực thi đúng → ít rewrite

🎯 Thực tế: Không phải "làm nhanh", mà là "loại bỏ giai đoạn thừa"
Giai đoạn thừa bị loại bỏ	Tiết kiệm thời gian
Hiểu sai requirement → rewrite	2–4 tháng
Chờ đợi dependency giữa các team	1–3 tháng
Họp coordination không hiệu quả	1–2 tháng
Compliance làm sau → sửa lớn	2–6 tháng
Testing thủ công, documentation thủ công	1–2 tháng

📌 Tổng tiết kiệm: ~8–17 tháng → Rút từ 18 tháng xuống 1–3 tháng Go-Live MVP


VIII. LƯU Ý QUAN TRỌNG: LOGISTICS & ESCROW LÀ TẦM NHÌN
⚠️ Minh bạch về scope hiện tại
Thành phần	Hiện tại	Tầm nhìn Phase 3+
Logistics	Tích hợp API GHN/GHTK/J&T	Hub kiểm định ACF + QR checkpoint 5 lớp + fleet riêng
Escrow	Orchestration qua ngân hàng đối tác	ACF Wallet license NHNN + internal settlement
QR Verification	Buyer quét xác nhận nhận hàng	5 checkpoint bắt buộc + blockchain lite traceability

🎯 Chiến lược đúng: Dùng hạ tầng có sẵn để Go-Live nhanh → Có giao dịch thật → Có dữ liệu thật → Sau đó mới đầu tư logistics/escrow riêng khi GMV đạt ngưỡng (~10.000 đơn/tháng).


IX. CÁC BƯỚC ƯU TIÊN THỰC HIỆN NGAY (NEXT 30 DAYS)
🚀 Priority 1: Pháp lý & Hạ tầng
STT	Hành động	Đơn vị chủ trì	Deadline
1	Hoàn thiện hồ sơ Bộ Công Thương (online.gov.vn)	Legal + IVS	Tuần 2
2	Ký hợp đồng Viettel IDC (hosting compliant)	IVS + Tech	Tuần 3
3	Đăng ký domain + SSL + WAF cơ bản	Tech	Tuần 3
4	Soạn xong 7 chính sách bắt buộc (seller, buyer, affiliate, data, refund, payment, anti-counterfeit)	Legal + Compliance	Tuần 4

🚀 Priority 2: Tích hợp đối tác có sẵn
STT	Hành động	Đơn vị chủ trì	Deadline
5	Ký LOI với VNPay/MoMo (payment gateway)	IVS + Finance	Tuần 4
6	Ký LOI với GHN/GHTK (logistics API)	IVS + Operations	Tuần 4
7	Thiết kế API schema tích hợp PSP/3PL	Tech Lead	Tuần 5

🚀 Priority 3: MVP Core Development
STT	Hành động	Đơn vị chủ trì	Deadline
8	Coding frontend buyer + seller (Next.js)	Frontend Team	Tuần 6–8
9	Coding backend + database (NestJS + PostgreSQL)	Backend Team	Tuần 6–8
10	Tích hợp AI moderation + basic fraud detection	AI/Tech	Tuần 7–9
11	UAT nội bộ + fix bug	QA + IVS	Tuần 10
12	Go-Live MVP (pilot 20–30 seller, 100–200 buyer)	Toàn team	Tuần 12


X. RỦI RO CHÍNH & BIỆN PHÁP GIẢM THIỂU
Rủi ro	Mức độ	Biện pháp
Chậm phê duyệt Bộ Công Thương	Cao	Submit hồ sơ đúng mẫu, có legal review trước, follow-up định kỳ
PSP/3PL từ chối tích hợp nhanh	Trung bình	Có backup provider, dùng webhook mock trong MVP
Seller giả mạo onboard	Cao	VNeID L2 bắt buộc + random audit + ký quỹ ngành nhạy cảm
Affiliate spam/fraud	Trung bình	Fraud engine + giới hạn commission/user + giữ hoa hồng T+7
Incident dữ liệu/bảo mật	Cao	WAF + immutable logs + war room protocol + backup real-time
Burn rate vượt dự kiến	Trung bình	Weekly budget review, freeze non-critical features nếu cần


XI. KẾT LUẬN & KIẾN NGHỊ
🎯 Thông điệp cốt lõi
ACFMart không tăng tốc vì "làm ẩu" – mà tăng tốc vì "hiểu đúng, tổ chức đúng, tận dụng AI đúng".
✅ Những gì ĐÃ CÓ (Lợi thế cạnh tranh)
•	Blueprint tổng thể hoàn chỉnh
•	Business architecture rõ ràng
•	Growth system design (affiliate engine)
•	Compliance direction compliant-by-design
•	AI-first execution model
•	Đội ngũ execution core (IVS JSC) cam kết
⏳ Những gì CẦN QUYẾT ĐỊNH NGAY
1.	Vai trò của Quỹ ACF: Strategic Investor hay Operating Partner?
2.	Ngân sách Phase 1–4: Phê duyệt ~7.2–7.5 tỷ VNĐ để triển khai MVP → Scale
3.	Cơ chế báo cáo: Weekly KPI dashboard hay Monthly board meeting?
4.	Brand pilot: Danh sách 20–30 brand đầu tiên để onboard (mỹ phẩm, TPCN, mẹ & bé)
🚀 Cam kết của IVS JSC
•	Go-Live MVP trong 12 tuần kể từ khi phê duyệt ngân sách
•	CSAT buyer ≥4.5/5, fake product rate <0.3%, uptime ≥99.5%
•	Báo cáo minh bạch weekly: GMV, CAC, retention, incident log
•	Bàn giao toàn bộ SOP, documentation, training materials sau Phase 1

📎 PHỤ LỤC
•	Phụ lục A: Mẫu hồ sơ Bộ Công Thương (TMĐT-1, TMĐT-2)
•	Phụ lục B: Draft 7 chính sách bắt buộc (seller, buyer, affiliate, data, refund, payment, anti-counterfeit)
•	Phụ lục C: API schema tích hợp VNPay/MoMo/GHN/GHTK
•	Phụ lục D: RACI matrix chi tiết theo module
•	Phụ lục E: KPI dashboard template (weekly reporting)


Trân trọng,
Nguyễn Minh Triết
Head of Growth & Operations – IVS JSC
Ngày: 13/05/2026 
PHỤ LỤC: 
CẤU TRÚC MÃ NGUỒN & TIẾN ĐỘ TRIỂN KHAI KỸ THUẬT

Tài liệu đính kèm: Báo cáo chi tiết cấu trúc source code ACFMart.vn
Cập nhật: Tháng 05/2026
Trạng thái: Đang triển khai Phase 2 (MVP Core Development)

________________________________________
📂 I. CẤU TRÚC MÃ NGUỒN TỔNG THỂ
1.1 Kiến trúc Microservices-based
acfmart-platform/

│

├── acfmart-frontend/                 # Next.js 14 + React 18

│   ├── buyer-app/                    # Buyer Web App

│   ├── seller-center/                # Seller Portal

│   ├── affiliate-dashboard/          # Affiliate Tracking

│   └── admin-panel/                  # Admin Dashboard

│

├── acfmart-backend/                  # NestJS + TypeScript

│   ├── auth-service/                 # Authentication & VNeID

│   ├── marketplace-service/          # Product, Order, Cart

│   ├── affiliate-service/            # Tracking, Commission

│   ├── logistics-service/            # 3PL Integration

│   ├── payment-service/              # Escrow, PSP Integration

│   ├── notification-service/         # Email, SMS, Push

│   └── analytics-service/            # KPI, Reporting

│

├── acfmart-mobile/                   # React Native

│   ├── buyer-app/                    # iOS & Android

│   └── seller-app/                   # Mobile Seller Center

│

├── acfmart-ai-services/              # Python/FastAPI

│   ├── content-moderation/           # AI scan sản phẩm

│   ├── fraud-detection/              # Risk scoring

│   └── recommendation-engine/        # Personalization

│

├── infrastructure/

│   ├── k8s-manifests/                # Kubernetes configs

│   ├── terraform/                    # IaC Viettel IDC

│   └── monitoring/                   # Grafana + Prometheus

│

└── docs/

    ├── api-specs/                    # OpenAPI/Swagger

    ├── architecture/                 # System design docs

    └── compliance/                   # DPIA, NĐ 13/2023
1.2 Công nghệ chủ đạo
Layer	Công nghệ	Lý do lựa chọn
Frontend Web	Next.js 14 + TypeScript	SEO, SSR, performance cao
Mobile	React Native + Expo	Cross-platform, dev speed
Backend	NestJS + Node.js 20	Scalable, TypeScript native
Database	PostgreSQL 15 + Redis 7	ACID, caching, full-text search
Message Queue	RabbitMQ/Kafka	Event-driven architecture
Container	Docker + Kubernetes	Orchestration, auto-scaling
CI/CD	GitHub Actions	Automation, testing pipeline
Monitoring	Grafana + Prometheus + ELK	Observability stack


📊 II. TIẾN ĐỘ THỰC HIỆN CHI TIẾT
2.1 Tổng quan các Phase
Phase	Thời gian	Trạng thái	% Hoàn thành
Phase 0	Tuần 1-3	✅ Hoàn thành	100%
Phase 1	Tuần 4-9	🔄 Đang triển khai	70%
Phase 2	Tuần 10-18	⏳ Chuẩn bị	15%
Phase 3	Tuần 19-26	⏳ Chưa bắt đầu	0%
Go-Live MVP	Tuần 20-24	🎯 Mục tiêu	-

2.2 Chi tiết Sprint hiện tại (Sprint 3/12)
Thời gian: Tuần 7-9 (13/05 - 02/06/2026)

Module	Task	Assignee	Progress	Blockers
Auth Service	VNeID L2 integration	Backend Team	80%	Đợi API sandbox C06
Seller Onboarding	KYC/KYB workflow	Backend + Legal	65%	-
Product Catalog	AI moderation setup	AI Team	50%	Cần fine-tune model
Buyer Frontend	Search + Filter UI	Frontend Team	75%	-
Database Schema	Core tables migration	DevOps	90%	-

2.3 Mốc quan trọng đã đạt được
Mốc	Ngày hoàn thành	Ghi chú
✅ Hoàn thiện Business Blueprint	15/04/2026	Đã HĐQT phê duyệt
✅ Chọn Tech Stack	20/04/2026	Next.js + NestJS + PostgreSQL
✅ Setup CI/CD Pipeline	28/04/2026	GitHub Actions + Docker
✅ Khởi tạo Repository	01/05/2026	Monorepo structure
✅ Deploy Staging Environment	08/05/2026	Viettel IDC test server

2.4 Mốc sắp tới (Next 6 Weeks)
Mốc	Deadline	Rủi ro	Mitigation
🎯 Hoàn thành Auth + Seller Onboarding	25/05/2026	Thấp	Đã có backup plan
🎯 Product Catalog MVP	01/06/2026	Trung bình	Cần test AI moderation
🎯 Buyer Checkout Flow	10/06/2026	Thấp	-
🎯 Tích hợp VNPay/MoMo Sandbox	15/06/2026	Cao	Đợi contract ký kết
🎯 UAT Nội bộ Round 1	20/06/2026	Trung bình	Cần recruit tester
🎯 Go-Live MVP Pilot	01-15/07/2026	Cao	Critical path


🔧 III. CÁC MODULE ĐÃ TRIỂN KHAI
3.1 Hoàn thành (✅ Production-Ready)
Module	Chức năng	Test Coverage	Documentation
User Management	Đăng ký, đăng nhập, JWT auth	85%	✅ Complete
RBAC System	Phân quyền Admin/Seller/Buyer	90%	✅ Complete
Audit Logging	Immutable log tất cả actions	80%	✅ Complete
Basic Product CRUD	Tạo, sửa, xóa sản phẩm	75%	✅ Complete

3.2 Đang phát triển (🔄 In Progress)
Module	% Complete	ETA	Dependencies
VNeID Integration	80%	25/05	C06 API access
Product Moderation AI	50%	01/06	Training data
Shopping Cart	60%	28/05	-
Order Management	40%	05/06	Cart module
Affiliate Tracking	30%	15/06	Order module

3.3 Chưa bắt đầu (⏳ Backlog)
Module	Priority	Sprint Planned	Estimated Effort
Escrow Engine	High	Sprint 6-7	5 story points
Logistics API Integration	High	Sprint 5-6	4 story points
Notification System	Medium	Sprint 4-5	3 story points
Analytics Dashboard	Medium	Sprint 7-8	5 story points
Mobile App	Low	Sprint 9-12	8 story points

________________________________________
🚀 IV. KẾ HOẠCH GO-LIVE
4.1 Tiêu chí nghiệm thu Go-Live
Bắt buộc đạt 100% trước khi release:

Tiêu chí	Mục tiêu	Current Status
Critical Bugs	0 open	✅ 0
High Priority Bugs	0 open	⚠️ 2 (đang fix)
Test Coverage	≥70%	🔄 68%
Performance	Page load <3s	✅ 2.4s avg
Security Scan	No critical vulnerabilities	✅ Passed
Uptime SLA	≥99.5%	✅ 99.8% (staging)
Compliance Check	NĐ 13/2023 compliant	🔄 85%

4.2 Lộ trình Go-Live theo giai đoạn
Stage 1: Closed Beta (Tuần 20-22)
•	Đối tượng: 20-30 seller pilot, 100-200 buyer nội bộ
•	Mục tiêu: Validate core flow, fix bugs critical
•	KPI: CSAT ≥4.0, Bug rate <5%
Stage 2: Open Beta (Tuần 23-26)
•	Đối tượng: 100 seller, 1.000 buyer public
•	Mục tiêu: Test scalability, affiliate tracking
•	KPI: Uptime ≥99%, GMV test ≥500 triệu
Stage 3: Official Launch (Tuần 27+)
•	Đối tượng: Public toàn quốc
•	Mục tiêu: Scale affiliate, marketing campaigns
•	KPI: GMV ≥2 tỷ/tháng, CAC <60% paid ads
4.3 Rollback Plan
Nếu phát hiện critical issue sau Go-Live:

Bước 1: Phát hiện incident → Alert War Room (trong 5 phút)

   ↓

Bước 2: Đánh giá mức độ → Quyết định rollback (trong 15 phút)

   ↓

Bước 3: Kích hoạt rollback → Restore version ổn định cuối (30 phút)

   ↓

Bước 4: Thông báo user → Landing page bảo trì (real-time)

   ↓

Bước 5: Post-mortem → Phân tích root cause (trong 24h)

RPO (Recovery Point Objective): ≤15 phút dữ liệu
RTO (Recovery Time Objective): ≤60 phút downtime

________________________________________
📈 V. METRICS & MONITORING
5.1 Real-time Dashboard
Công cụ: Grafana + Prometheus + ELK Stack

Metrics theo dõi:


•	Application: Request rate, error rate, latency p95/p99
•	Infrastructure: CPU, memory, disk I/O, network
•	Business: GMV, orders/hour, active users, conversion rate
•	Compliance: QR scan rate, incident count, data breach attempts
5.2 Alerting Rules
Condition	Severity	Notification	Escalation
Error rate >5%	Critical	Slack + SMS + Phone	CTO trong 15 phút
Uptime <99%	High	Slack + Email	Tech Lead trong 30 phút
Latency p95 >3s	Medium	Slack	On-call dev trong 1h
Failed payment >10%	High	Slack + SMS	Finance + Tech trong 30 phút

________________________________________
⚠️ VI. RỦI RO KỸ THUẬT & GIẢI PHÁP
Rủi ro	Impact	Probability	Mitigation
Chậm API VNeID	High	Medium	Dùng mock data cho MVP, fallback manual review
PSP từ chối integration	High	Low	Có backup VNPay/MoMo/ZaloPay, dùng payment link tạm
Performance degradation	Medium	Medium	Load testing hàng tuần, auto-scaling config sẵn
Security breach	Critical	Low	Pen-test quarterly, WAF, immutable logs, 2FA bắt buộc
Team capacity	Medium	High	Hire thêm 2-3 dev contract nếu cần, outsource non-core

________________________________________
VII. KHUYẾN NGHỊ
7.1 Đối với HĐQT/Chủ đầu tư
✅ Phê duyệt ngay:


•	Ngân sách Phase 2 (3.300 triệu VNĐ) để không delay timeline
•	Hợp đồng Viettel IDC (ưu tiên compliance NĐ 13/2023)
•	LOI với VNPay/MoMo/GHN/GHTK

⚠️ Cần quyết định trong tuần này:


•	Danh sách 20-30 seller pilot (ngành mỹ phẩm, TPCN, mẹ & bé)
•	Chính sách hoa hồng affiliate chi tiết (để dev tracking engine)
•	War Room escalation matrix (ai được quyền quyết định rollback)
7.2 Đối với Team Kỹ thuật
🎯 Ưu tiên Sprint 3-4:


1.	Hoàn thành VNeID integration (blocker chính)
2.	Test coverage ≥75% trước UAT
3.	Documentation đầy đủ API specs
4.	Setup automated backup + disaster recovery drill

📋 Cải tiến quy trình:


•	Daily standup 15 phút (9:00 AM)
•	Weekly demo Friday 3:00 PM
•	Bi-weekly retrospective để adjust velocity

________________________________________
VIII. KẾT LUẬN
8.1 Tóm tắt tiến độ
Hạng mục	Trạng thái	Tự tin Go-Live
Kiến trúc hệ thống	✅ Hoàn thiện	95%
Core Marketplace	🔄 65% complete	80%
Payment/Escrow	⏳ 30% complete	60%
Logistics Integration	⏳ 20% complete	50%
Affiliate Engine	⏳ 15% complete	40%
Compliance (NĐ 13/2023)	🔄 85% complete	90%
8.2 Cam kết
IVS JSC cam kết:


•	✅ Go-Live MVP trong 12-16 tuần kể từ khi phê duyệt ngân sách
•	✅ Uptime ≥99.5% trong 3 tháng đầu
•	✅ CSAT buyer ≥4.5/5
•	✅ Tỷ lệ hàng giả lọt sàn <0.3%
•	✅ Báo cáo weekly transparent với HĐQT

Điều kiện tiên quyết:


•	Ngân sách được phê duyệt đúng hạn
•	Quyết định nhanh từ HĐQT (≤48h cho critical decisions)
•	Seller pilot onboard đúng timeline
•	Không thay đổi scope lớn sau Sprint 4
 
ĐỀ ÁN XÂY DỰNG & VẬN HÀNH 
SÀN THƯƠNG MẠI ĐIỆN TỬ ACFMART
Gửi: Cục Thương mại điện tử và Kinh tế số – Bộ Công Thương 
Phiên bản: 1.0 | Ngày cập nhật: 14/05/2026

I. THÔNG TIN TỔNG QUAN & MỤC TIÊU ĐỀ ÁN
Hạng mục	Nội dung
Tên dự án	Hệ sinh thái Sàn TMĐT đa vai trò ACFMART
Phân hệ chính	acfmart.vn (Người mua) | acfmart.store (Người bán) | acfmart.online (Social Commerce) | acfmart.cloud (Quản trị/Kiểm duyệt)
Mục tiêu pháp lý	Hoàn tất thủ tục Thông báo/Đăng ký sàn TMĐT theo Nghị định 52/2013/NĐ-CP & Nghị định 85/2021/NĐ-CP; tuân thủ Nghị định 13/2023/NĐ-CP (PDPD); đáp ứng tiêu chuẩn an ninh mạng & hóa đơn điện tử.
Mục tiêu vận hành	Xây dựng nền tảng TMĐT tập trung, phân tách trải nghiệm người dùng theo vai trò, nhưng chia sẻ cùng lõi dữ liệu, đảm bảo tính nhất quán giao dịch, kiểm soát chất lượng hàng hóa và tích hợp tính năng xã hội nhẹ (light social) phục vụ chuyển đổi mua sắm.


II. MÔ HÌNH HOẠT ĐỘNG & PHÂN BỔ PHÂN HỆ
Phân hệ	Đối tượng	Chức năng chính	Luồng dữ liệu chung
acfmart.vn	Người tiêu dùng	Duyệt sản phẩm, đặt hàng, thanh toán, theo dõi đơn, đánh giá, hỗ trợ sau mua	Đọc/ghi đơn hàng, thanh toán, lịch sử tương tác từ Core DB
acfmart.store	Người bán/Seller	Đăng ký cửa hàng, đăng hàng, nộp hồ sơ kiểm duyệt, in tem QR, quản lý kho & vận đơn, báo cáo doanh thu	Đồng bộ SKU, tồn kho, trạng thái kiểm duyệt, QR traceability, settlement
acfmart.online	Cộng đồng	Theo dõi shop/người dùng, chia sẻ trải nghiệm, UGC (ảnh/video review), tùy chọn "Tài khoản riêng tư", không chat real-time mass	Đọc dữ liệu công khai (review, follow), ghi nhật ký tương tác, tách biệt dữ liệu nhạy cảm
acfmart.cloud	Admin/Kiểm duyệt	Duyệt người bán/sản phẩm, giám sát giao dịch, xử lý khiếu nại, cấu hình phí, quản lý server & backup, báo cáo tuân thủ	Full access Core DB (role-based), audit log, PDPD consent tracking, compliance dashboard

Cơ chế chia sẻ dữ liệu:

•	Lõi dữ liệu tập trung (PostgreSQL + Redis cache) với kiến trúc Event-Driven + API Gateway.
•	Mọi phân hệ giao tiếp qua REST/gRPC được xác thực OAuth2/JWT, đảm bảo phân quyền RBAC/ABAC.
•	Dữ liệu giao dịch, người dùng, sản phẩm được đồng bộ thời gian thực thông qua CDC (Change Data Capture) và message queue (Kafka/RabbitMQ), tránh xung đột ghi (write conflicts) và đảm bảo tính idempotent.


III. KIẾN TRÚC KỸ THUẬT & UX/UI PHÂN TÁCH
Thành phần	Giải pháp đề xuất	Tiêu chí tuân thủ
Frontend	Next.js/React (SSR/CSR) cho từng domain; Design System riêng biệt theo role nhưng dùng chung component library	Responsive, WCAG 2.1, mobile-first, tải <2s (3G/4G)
Backend	Microservices modular (Order, Catalog, User, Payment, Logistics, Compliance)	API rate limiting, WAF, TLS 1.3, encryption at rest (AES-256)
Hạ tầng	Cloud VN (VNPT IDC/FPT Cloud/AWS Local Region), CDN trong nước, backup daily + DR site	Tuân thủ Nghị định 53/2022/NĐ-CP (an ninh mạng), lưu trữ dữ liệu cá nhân tại VN theo Điều 15 Nghị định 13/2023
UX/UI	Phân tách rõ ràng: .vn (tối ưu conversion), .store (dashboard quản lý), .online (feed nhẹ, privacy toggle), .cloud (admin panel + audit)	Không chuyển hướng chéo không kiểm soát; mỗi domain có scope cookie/session riêng, SSO nội bộ qua OAuth2


IV. TUÂN THỦ PHÁP LÝ & BẢO MẬT DỮ LIỆU (PDPD)
Yêu cầu	Biện pháp triển khai	Cơ sở pháp lý
Đăng ký/Thông báo sàn TMĐT	Nộp hồ sơ qua Cổng dịch vụ công Bộ Công Thương kèm mô tả mô hình, chính sách bảo vệ người tiêu dùng, cơ chế giải quyết tranh chấp	Nghị định 52/2013/NĐ-CP, sửa đổi bởi Nghị định 85/2021/NĐ-CP
Bảo vệ dữ liệu cá nhân (PDPD)	- Cơ chế đồng ý minh bạch (opt-in) 
- DPO được bổ nhiệm
- Đánh giá tác động DPIA trước khi xử lý dữ liệu nhạy cảm

- Phân loại dữ liệu, lưu trữ tối thiểu, xóa/anonymize sau 3 năm (trừ nghĩa vụ thuế)	Nghị định 13/2023/NĐ-CP, Luật An ninh mạng 2018
Social Commerce giới hạn	Tính năng .online chỉ bao gồm: follow, review, UGC, chia sẻ link sản phẩm. Không có tính năng nhắn tin nhóm, livestream thương mại mass, hay thuật toán gợi ý nội dung phi thương mại → tránh phân loại là "mạng xã hội"	Nghị định 72/2013/NĐ-CP, Thông tư 08/2023/TT-BTTTT
Thanh toán & Hóa đơn	Tích hợp VNPay/MoMo/OnePay, cơ chế escrow (giữ tiền đến khi xác nhận giao hàng), xuất hóa đơn điện tử tự động theo NĐ 123/2020	Quyết định 2429/QĐ-NHNN, Thông tư 78/2021/TT-BTC

________________________________________
V. KẾ HOẠCH TRIỂN KHAI & NGUỒN LỰC
Giai đoạn	Thời gian	Đầu ra chính	Ngân sách ước tính (USD)
Phase 1	Tháng 1–4	Core DB, .vn + .store + .cloud, API Gateway, PDPD consent flow, tích hợp payment/logistics	90.000 – 130.000
Phase 2	Tháng 5–6	.online (light social), QR traceability, audit log, DPIA report, penetration testing	40.000 – 60.000
Phase 3	Tháng 7–8	Nộp hồ sơ MOIT, pilot 500 seller, điều chỉnh UX, đào tạo kiểm duyệt, ra mắt chính thức	20.000 – 30.000
Vận hành năm 1	Tháng 9–20	Marketing, CSKH, tối ưu take-rate, mở rộng logistics partner	60.000 – 90.000

Lưu ý: Ngân sách dựa trên khảo sát thị trường phát triển phần mềm tại Việt Nam (2025–2026), chưa bao gồm chi phí dự phòng rủi ro pháp lý & biến động hạ tầng.

VI. PHÂN TÍCH TÀI CHÍNH & BỐI CẢNH VĨ MÔ
1. Bối cảnh vĩ mô & Ngành TMĐT Việt Nam
•	Quy mô GMV: Theo VECOM & Bộ Công Thương, TMĐT Việt Nam đạt ~20–23 tỷ USD (2025), tăng trưởng CAGR 15–18%/năm, thâm nhập internet >78%, tỷ lệ thanh toán không tiền mặt >50% (NHNN).
•	Xu hướng: Social commerce chiếm ~25–30% GMV online; người mua ưu tiên minh bạch nguồn gốc (QR traceability), logistics nội địa 24–48h, chính sách bảo vệ người tiêu dùng rõ ràng.
•	Chính sách: Nhà nước thúc đẩy chuyển đổi số B2B/B2C, khuyến khích sàn nội địa, siết chặt quản lý dữ liệu cá nhân & thuế TMĐT xuyên biên giới.
2. Mô hình tài chính cốt lõi (Giả định cơ sở)
Chỉ số	Giá trị giả định	Ghi chú
Take rate (phí sàn)	2.5 – 4.5%	Phụ thuộc ngành hàng, volume seller
CAC (Customer Acquisition Cost)	8–12 USD	Digital ads, referral, KOL micro
LTV/CAC ratio	≥ 2.5x	Mục tiêu ngành, cần retention >35% tháng 3
Điểm hòa vốn	GMV ~50–60 tỷ VND/tháng	Giả định fixed cost ~150M VND/tháng, gross margin ~18–22%
Thời gian hoàn vốn	14–20 tháng	Phụ thuộc tốc độ onboard seller & logistics cost

Phân tích nhạy cảm: Nếu take rate giảm 10% hoặc CAC tăng 20%, điểm hòa vốn dịch chuyển thêm 2–3 tháng. Đề xuất duy trì quỹ dự trữ hoạt động (runway) ≥ 9 tháng.


VII. RỦI RO & BIỆN PHÁP GIẢM THIỂU
Nhóm rủi ro	Mức độ	Biện pháp kiểm soát
Pháp lý & PDPD	Cao	Bổ nhiệm DPO nội bộ/thuê ngoài; DPIA định kỳ; cơ chế consent versioning; lưu log xử lý dữ liệu ≥ 3 năm
Đồng bộ dữ liệu 4 domain	Trung bình-Cao	CDC + message queue idempotent; circuit breaker; monitoring (Prometheus/Grafana); rollback plan
Cạnh tranh & CAC	Cao	Tập trung niche (hàng kiểm định QR, seller verified), partnership logistics, chính sách escrow minh bạch
Thanh khoản & dòng tiền	Trung bình	Escrow model, thanh toán T+3/T+5, dự phòng phí gateway biến động, tự động hóa hóa đơn điện tử
An ninh mạng	Cao	WAF, 2FA, pentest hàng quý, backup immutable, compliance ISO 27001 roadmap

 
ĐỀ ÁN XÂY DỰNG & VẬN HÀNH SÀN THƯƠNG MẠI ĐIỆN TỬ ACFMART
Gửi: Cục Thương mại điện tử và Kinh tế số – Bộ Công Thương Phiên bản: 1.0 | Ngày cập nhật: 14/05/2026

________________________________________
I. THÔNG TIN TỔNG QUAN & MỤC TIÊU ĐỀ ÁN
Hạng mục	Nội dung
Tên dự án	Hệ sinh thái Sàn TMĐT đa vai trò ACFMART
Phân hệ chính	acfmart.vn (Người mua) | acfmart.store (Người bán) | acfmart.online (Social Commerce) | acfmart.cloud (Quản trị/Kiểm duyệt)
Mục tiêu pháp lý	Hoàn tất thủ tục Thông báo/Đăng ký sàn TMĐT theo Nghị định 52/2013/NĐ-CP & Nghị định 85/2021/NĐ-CP; tuân thủ Nghị định 13/2023/NĐ-CP (PDPD); đáp ứng tiêu chuẩn an ninh mạng & hóa đơn điện tử.
Mục tiêu vận hành	Xây dựng nền tảng TMĐT tập trung, phân tách trải nghiệm người dùng theo vai trò, nhưng chia sẻ cùng lõi dữ liệu, đảm bảo tính nhất quán giao dịch, kiểm soát chất lượng hàng hóa và tích hợp tính năng xã hội nhẹ (light social) phục vụ chuyển đổi mua sắm.

________________________________________
II. MÔ HÌNH HOẠT ĐỘNG & PHÂN BỔ PHÂN HỆ
Phân hệ	Đối tượng	Chức năng chính	Luồng dữ liệu chung
acfmart.vn	Người tiêu dùng	Duyệt sản phẩm, đặt hàng, thanh toán, theo dõi đơn, đánh giá, hỗ trợ sau mua	Đọc/ghi đơn hàng, thanh toán, lịch sử tương tác từ Core DB
acfmart.store	Người bán/Seller	Đăng ký cửa hàng, đăng hàng, nộp hồ sơ kiểm duyệt, in tem QR, quản lý kho & vận đơn, báo cáo doanh thu	Đồng bộ SKU, tồn kho, trạng thái kiểm duyệt, QR traceability, settlement
acfmart.online	Cộng đồng	Theo dõi shop/người dùng, chia sẻ trải nghiệm, UGC (ảnh/video review), tùy chọn "Tài khoản riêng tư", không chat real-time mass	Đọc dữ liệu công khai (review, follow), ghi nhật ký tương tác, tách biệt dữ liệu nhạy cảm
acfmart.cloud	Admin/Kiểm duyệt	Duyệt người bán/sản phẩm, giám sát giao dịch, xử lý khiếu nại, cấu hình phí, quản lý server & backup, báo cáo tuân thủ	Full access Core DB (role-based), audit log, PDPD consent tracking, compliance dashboard

Cơ chế chia sẻ dữ liệu:


•	Lõi dữ liệu tập trung (PostgreSQL + Redis cache) với kiến trúc Event-Driven + API Gateway.
•	Mọi phân hệ giao tiếp qua REST/gRPC được xác thực OAuth2/JWT, đảm bảo phân quyền RBAC/ABAC.
•	Dữ liệu giao dịch, người dùng, sản phẩm được đồng bộ thời gian thực thông qua CDC (Change Data Capture) và message queue (Kafka/RabbitMQ), tránh xung đột ghi (write conflicts) và đảm bảo tính idempotent.

________________________________________
III. KIẾN TRÚC KỸ THUẬT & UX/UI PHÂN TÁCH
Thành phần	Giải pháp đề xuất	Tiêu chí tuân thủ
Frontend	Next.js/React (SSR/CSR) cho từng domain; Design System riêng biệt theo role nhưng dùng chung component library	Responsive, WCAG 2.1, mobile-first, tải <2s (3G/4G)
Backend	Microservices modular (Order, Catalog, User, Payment, Logistics, Compliance)	API rate limiting, WAF, TLS 1.3, encryption at rest (AES-256)
Hạ tầng	Cloud VN (VNPT IDC/FPT Cloud/AWS Local Region), CDN trong nước, backup daily + DR site	Tuân thủ Nghị định 53/2022/NĐ-CP (an ninh mạng), lưu trữ dữ liệu cá nhân tại VN theo Điều 15 Nghị định 13/2023
UX/UI	Phân tách rõ ràng: .vn (tối ưu conversion), .store (dashboard quản lý), .online (feed nhẹ, privacy toggle), .cloud (admin panel + audit)	Không chuyển hướng chéo không kiểm soát; mỗi domain có scope cookie/session riêng, SSO nội bộ qua OAuth2

________________________________________
IV. TUÂN THỦ PHÁP LÝ & BẢO MẬT DỮ LIỆU (PDPD)
Yêu cầu	Biện pháp triển khai	Cơ sở pháp lý
Đăng ký/Thông báo sàn TMĐT	Nộp hồ sơ qua Cổng dịch vụ công Bộ Công Thương kèm mô tả mô hình, chính sách bảo vệ người tiêu dùng, cơ chế giải quyết tranh chấp	Nghị định 52/2013/NĐ-CP, sửa đổi bởi Nghị định 85/2021/NĐ-CP
Bảo vệ dữ liệu cá nhân (PDPD)	- Cơ chế đồng ý minh bạch (opt-in) 
- DPO được bổ nhiệm
- Đánh giá tác động DPIA trước khi xử lý dữ liệu nhạy cảm

- Phân loại dữ liệu, lưu trữ tối thiểu, xóa/anonymize sau 3 năm (trừ nghĩa vụ thuế)	Nghị định 13/2023/NĐ-CP, Luật An ninh mạng 2018
Social Commerce giới hạn	Tính năng .online chỉ bao gồm: follow, review, UGC, chia sẻ link sản phẩm. Không có tính năng nhắn tin nhóm, livestream thương mại mass, hay thuật toán gợi ý nội dung phi thương mại → tránh phân loại là "mạng xã hội"	Nghị định 72/2013/NĐ-CP, Thông tư 08/2023/TT-BTTTT
Thanh toán & Hóa đơn	Tích hợp VNPay/MoMo/OnePay, cơ chế escrow (giữ tiền đến khi xác nhận giao hàng), xuất hóa đơn điện tử tự động theo NĐ 123/2020	Quyết định 2429/QĐ-NHNN, Thông tư 78/2021/TT-BTC

________________________________________
V. KẾ HOẠCH TRIỂN KHAI & NGUỒN LỰC
Giai đoạn	Thời gian	Đầu ra chính	Ngân sách ước tính (USD)
Phase 1	Tháng 1–4	Core DB, .vn + .store + .cloud, API Gateway, PDPD consent flow, tích hợp payment/logistics	90.000 – 130.000
Phase 2	Tháng 5–6	.online (light social), QR traceability, audit log, DPIA report, penetration testing	40.000 – 60.000
Phase 3	Tháng 7–8	Nộp hồ sơ MOIT, pilot 500 seller, điều chỉnh UX, đào tạo kiểm duyệt, ra mắt chính thức	20.000 – 30.000
Vận hành năm 1	Tháng 9–20	Marketing, CSKH, tối ưu take-rate, mở rộng logistics partner	60.000 – 90.000

Lưu ý: Ngân sách dựa trên khảo sát thị trường phát triển phần mềm tại Việt Nam (2025–2026), chưa bao gồm chi phí dự phòng rủi ro pháp lý & biến động hạ tầng.

________________________________________
VI. PHÂN TÍCH TÀI CHÍNH & BỐI CẢNH VĨ MÔ
1. Bối cảnh vĩ mô & Ngành TMĐT Việt Nam
•	Quy mô GMV: Theo VECOM & Bộ Công Thương, TMĐT Việt Nam đạt ~20–23 tỷ USD (2025), tăng trưởng CAGR 15–18%/năm, thâm nhập internet >78%, tỷ lệ thanh toán không tiền mặt >50% (NHNN).
•	Xu hướng: Social commerce chiếm ~25–30% GMV online; người mua ưu tiên minh bạch nguồn gốc (QR traceability), logistics nội địa 24–48h, chính sách bảo vệ người tiêu dùng rõ ràng.
•	Chính sách: Nhà nước thúc đẩy chuyển đổi số B2B/B2C, khuyến khích sàn nội địa, siết chặt quản lý dữ liệu cá nhân & thuế TMĐT xuyên biên giới.
2. Mô hình tài chính cốt lõi (Giả định cơ sở)
Chỉ số	Giá trị giả định	Ghi chú
Take rate (phí sàn)	2.5 – 4.5%	Phụ thuộc ngành hàng, volume seller
CAC (Customer Acquisition Cost)	8–12 USD	Digital ads, referral, KOL micro
LTV/CAC ratio	≥ 2.5x	Mục tiêu ngành, cần retention >35% tháng 3
Điểm hòa vốn	GMV ~50–60 tỷ VND/tháng	Giả định fixed cost ~150M VND/tháng, gross margin ~18–22%
Thời gian hoàn vốn	14–20 tháng	Phụ thuộc tốc độ onboard seller & logistics cost

Phân tích nhạy cảm: Nếu take rate giảm 10% hoặc CAC tăng 20%, điểm hòa vốn dịch chuyển thêm 2–3 tháng. Đề xuất duy trì quỹ dự trữ hoạt động (runway) ≥ 9 tháng.

________________________________________
VII. RỦI RO & BIỆN PHÁP GIẢM THIỂU
Nhóm rủi ro	Mức độ	Biện pháp kiểm soát
Pháp lý & PDPD	Cao	Bổ nhiệm DPO nội bộ/thuê ngoài; DPIA định kỳ; cơ chế consent versioning; lưu log xử lý dữ liệu ≥ 3 năm
Đồng bộ dữ liệu 4 domain	Trung bình-Cao	CDC + message queue idempotent; circuit breaker; monitoring (Prometheus/Grafana); rollback plan
Cạnh tranh & CAC	Cao	Tập trung niche (hàng kiểm định QR, seller verified), partnership logistics, chính sách escrow minh bạch
Thanh khoản & dòng tiền	Trung bình	Escrow model, thanh toán T+3/T+5, dự phòng phí gateway biến động, tự động hóa hóa đơn điện tử
An ninh mạng	Cao	WAF, 2FA, pentest hàng quý, backup immutable, compliance ISO 27001 roadmap

________________________________________
VIII. PHỤ LỤC & TÀI LIỆU THAM CHIẾU
1.	Nghị định 52/2013/NĐ-CP & Nghị định 85/2021/NĐ-CP về TMĐT
2.	Nghị định 13/2023/NĐ-CP về Bảo vệ dữ liệu cá nhân (PDPD)
3.	Luật An ninh mạng 2018 & Nghị định 53/2022/NĐ-CP
4.	VECOM White Paper on E-commerce 2025
5.	Ngân hàng Nhà nước: Báo cáo thanh toán không tiền mặt Q4/2025
6.	Checklist hồ sơ đăng ký sàn TMĐT (Bộ Công Thương)

________________________________________
📜 TUYÊN BỐ MIỄN TRỪ & GIẢ ĐỊNH DỮ LIỆU
•	Các số liệu tài chính & thị trường dựa trên báo cáo công khai của Bộ Công Thương, VECOM, Ngân hàng Nhà nước và khảo sát ngành 2025–2026. Biến động vĩ mô, thay đổi chính sách thuế/PDPD hoặc cạnh tranh nền tảng có thể tác động đến giả định.
•	Đề án không cam kết lợi nhuận cố định hay tỷ suất hoàn vốn đảm bảo. Mọi quyết định đầu tư cần được thẩm định độc lập bởi chuyên gia pháp lý, kiểm toán & quản trị rủi ro.
•	Kiến trúc kỹ thuật & luồng dữ liệu mô tả ở trên là khung đề xuất; triển khai thực tế cần qua giai đoạn PoC, security audit & load testing trước khi vận hành thương mại.

________________________________________

Liên hệ thẩm định & hỗ trợ hồ sơ MOIT:
[Thông tin doanh nghiệp/đại diện pháp lý] | [Email/Hotline] | [Mã số thuế/Giấy phép kinh doanh]
Đề án được xây dựng nhằm đáp ứng tiêu chuẩn trình duyệt của Cục Thương mại điện tử và Kinh tế số – Bộ Công Thương, đồng thời tuân thủ nguyên tắc phân tích tài chính thận trọng, minh bạch dữ liệu và quản trị rủi ro theo chuẩn mực đầu tư.
Dựa trên nghiên cứu thị trường và best practices, đây là chiến lược thiết lập mạng xã hội toàn diện cho ACFMart:

________________________________________
📊 1. CÁC NỀN TẢNG MẠNG XÃ HỘI CẦN THIẾT
Thứ tự ưu tiên theo thị trường Việt Nam:
STT	Nền tảng	Tỷ lệ sử dụng	Mục đích chính
1	Facebook	94% social commerce	Brand awareness, bán hàng, CSKH
2	Zalo	49%	Customer service, Zalo OA
3	TikTok	68.9% reach 18+	Video marketing, social commerce
4	Instagram	Top 5 VN	Visual content, brand building
5	YouTube	55.14%	Tutorial, review, unboxing
6	LinkedIn	B2B	Tuyển dụng, partnerships

[[23]][[33]][[34]]

________________________________________
🎯 2. THIẾT LẬP FACEBOOK PAGE (ƯU TIÊN SỐ 1)
A. THÔNG TIN CƠ BẢN
1. Tên Trang (Page Name)
Khuyến nghị: ACFMart - Sàn TMĐT Chống Hàng Giả

Lý do:


•	Tên thương hiệu + mô tả chức năng chính
•	Chứa từ khóa "Sàn TMĐT" và "Chống Hàng Giả" - SEO tốt
•	Phân biệt với ABC-Mart (hệ thống giày)
•	Độ dài tối ưu: 30-50 ký tự

Alternatives:


•	ACFMart.vn - Mua Sắm An Toàn, Xác Thực QR
•	ACFMart - Shopping Platform Anti-Counterfeit
2. Username/URL (Custom URL)
Mục tiêu: facebook.com/ACFMart.vn hoặc facebook.com/ACFMartOfficial

Lưu ý: Thiết lập ngay sau khi tạo page (chọn 1 trong 2)
3. Hạng mục (Category)
✅ Đã chọn đúng: "Mua sắm & bán lẻ"

Bổ sung thêm:


•	"Sàn thương mại điện tử"
•	"Trang web mua sắm"
•	"Dịch vụ bán lẻ"
4. Tiểu sử (About/Description)
Ngắn gọn (Short Description - 255 ký tự):

🛡️ Sàn TMĐT ACFMart - Chống hàng giả 100%

✅ Xác thực QR bởi Quỹ Chống Hàng Giả VN

🚚 Giao nhanh 2-4h | 💳 Thanh toán đa dạng

📱 Tải app: acfmart.vn

Chi tiết (Long Description):

🏪 **ACFMART - SÀN THƯƠNG MẠI ĐIỆN TỬ CHỐNG HÀNG GIẢ VIỆT NAM**

 **Sứ mệnh:** Bảo vệ người tiêu dùng Việt với 100% sản phẩm chính hãng, được xác thực qua mã QR bởi Quỹ Chống Hàng Giả Việt Nam.

✨ **Tại sao chọn ACFMart?**

✓ Xác thực nguồn gốc bằng QR code

✓ Kiểm duyệt nghiêm ngặt bởi đội ngũ chuyên gia

✓ Escrow - Giữ tiền đến khi nhận hàng

✓ Đổi trả 7 ngày miễn phí

✓ Giao hàng toàn quốc 2-4 ngày

✓ Hỗ trợ 24/7 tiếng Việt

🛍️ **Danh mục sản phẩm:**

• Thời trang & Phụ kiện

• Mỹ phẩm & Làm đẹp

• Điện tử & Công nghệ

• Gia dụng & Đời sống

• Sức khỏe & Mẹ bé

• Thể thao & Outdoor

📲 **Hệ sinh thái ACFMart:**

→ acfmart.vn - Mua sắm cho khách hàng

→ acfmart.store - Dành cho người bán

→ acfmart.online - Cộng đồng Social Commerce

→ acfmart.cloud - Quản trị & Kiểm duyệt

🏆 **Chứng nhận:**

- Đăng ký với Bộ Công Thương

- Tuân thủ Nghị định 13/2023/NĐ-CP (PDPD)

- ISO 27001 (An toàn thông tin)

📞 **Liên hệ:**

Hotline: 1900-xxxx

Email: hotro@acfmart.vn

Website: www.acfmart.vn

Địa chỉ: [Thêm địa chỉ công ty]

#ChongHangGia #XacThucQR #MuaSamAnToan #ACFMart

________________________________________
B. HÌNH ẢNH & THƯƠNG HIỆU
1. Avatar (Ảnh đại diện)
•	Kích thước: 170x170px (desktop), 128x128px (mobile)
•	Định dạng: PNG (nền trong suốt nếu có)
•	Nội dung: Logo ACFMart + icon shield (chống hàng giả)
•	Tỷ lệ nhận diện: Logo chiếm 60-70%
2. Cover Photo (Ảnh bìa)
•	Kích thước: 820x312px (desktop), 640x360px (mobile)
•	Thiết kế gợi ý:

[Logo ACFMart lớn] 

Tagline: "100% CHÍNH HÃNG - XÁC THỰC QR"

4 Icons: ✓ Chống hàng giả | 🚚 Giao nhanh | 💳 Escrow | 🛡️ Bảo vệ người mua

CTA: "MUA SẮM NGAY - www.acfmart.vn"

Hotline: 1900-xxxx
3. Action Button (Nút kêu gọi)
Chọn: "Mua ngay" (Shop Now) → Link: https://acfmart.vn

Alternatives:


•	"Đăng ký" → acfmart.vn/register
•	"Liên hệ" → Messenger auto-response

________________________________________
C. THÔNG TIN LIÊN HỆ (Contact Info)
Trường	Nội dung
Website	https://acfmart.vn

Email	hotro@acfmart.vn

Hotline	1900-xxxx (miễn phí)
Zalo OA	@acfmart (nếu có)
Địa chỉ	[Địa chỉ trụ sở chính]
Giờ làm việc	Thứ 2 - CN: 8:00 - 21:00

________________________________________
D. CÀI ĐẶT NÂNG CAO
1. Messenger Settings
•	✅ Enable Messenger


•	Greeting message:

👋 Chào bạn! ACFMart có thể giúp gì cho bạn?

🛍️ Tư vấn mua hàng: Gõ "MUA HÀNG"

 Đăng ký bán: Gõ "BÁN HÀNG"

📦 Tra đơn hàng: Gõ "ĐƠN HÀNG"

❌ Báo hàng giả: Gõ "BÁO GIẢ"

👤 Gặp tư vấn viên: Gõ "AGENT"


•	Instant replies:

⏰ Chúng tôi sẽ phản hồi trong 5-10 phút (giờ hành chính)

🌙 Ngoài giờ: Để lại tin nhắn, chúng tôi sẽ trả lời vào sáng hôm sau
2. Page Roles (Phân quyền)
•	Admin: CEO/CMO
•	Editor: Content Manager
•	Moderator: CSKH team
•	Advertiser: Marketing team
•	Analyst: Data team
3. Page Transparency
•	✅ Enable "Page Transparency" (minh bạch thông tin)
•	Show ads running on page
4. Shopping Features
•	Facebook Shop: Enable (khi có sản phẩm)
•	Instagram Shopping: Connect (nếu có Instagram)
•	Product Tags: Enable

________________________________________
📱 3. CÁC NỀN TẢNG KHÁC CẦN THIẾT
A. ZALO OFFICIAL ACCOUNT (OA)
Tên: ACFMart - Chống Hàng Giả

Mô tả:

🛡️ Sàn TMĐT ACFMart - 100% chính hãng

✓ Xác thực QR ✓ Escrow ✓ Giao nhanh

Hotline: 1900-xxxx | Web: acfmart.vn

Tính năng:


•	Zalo Chatbot CSKH
•	Broadcast khuyến mãi
•	Zalo Shop (bán hàng)
•	Rich Media (gửi ảnh sản phẩm)

Username: @acfmart

________________________________________
B. TIKTOK ACCOUNT
Tên hiển thị: ACFMart.vn

Username: @acfmart.official

Bio:

🛡️ Sàn TMĐT chống hàng giả VN

✅ Xác thực QR 100%

📱 App: acfmart.vn

👇 Shop ngay!

Link in bio: https://acfmart.vn

Content Strategy:


•	Unboxing sản phẩm
•	Hướng dẫn xác thực QR
•	Review sản phẩm hot
•	Behind-the-scenes kiểm duyệt
•	User-generated content

________________________________________
C. INSTAGRAM
Tên: ACFMart Official

Username: @acfmart.official

Bio:

🛡️ Anti-Counterfeit E-Commerce Vietnam

✅ QR Verified | 🚚 Fast Shipping

🌐 acfmart.vn

👇 Shop now

Category: Shopping & Retail

Features:


•	Instagram Shopping
•	Product Tags
•	Reels (video ngắn)
•	Stories (daily updates)
•	IGTV (tutorials)

________________________________________
D. YOUTUBE CHANNEL
Tên: ACFMart - Sàn TMĐT Chống Hàng Giả

Handle: @ACFMartOfficial

Description:

🏪 Kênh chính thức của ACFMart - Sàn TMĐT chống hàng giả Việt Nam

📺 Nội dung:

• Hướng dẫn mua hàng & xác thực QR

• Review sản phẩm chính hãng

• Unboxing & Test sản phẩm

• So sánh hàng thật vs hàng giả

• Livestream bán hàng

• Tips mua sắm thông minh

🔔 Subscribe để không bỏ lỡ deal hot!

🌐 Website: www.acfmart.vn

📞 Hotline: 1900-xxxx

📧 Email: hotro@acfmart.vn

Playlist gợi ý:


1.	Hướng dẫn sử dụng ACFMart
2.	Cách xác thực QR code
3.	Review sản phẩm
4.	Phân biệt hàng thật - hàng giả
5.	Livestream
6.	Unboxing

________________________________________
E. LINKEDIN COMPANY PAGE
Tên: ACFMart - Anti-Counterfeit E-Commerce Platform

Tagline: "Protecting Vietnamese Consumers Through Verified E-Commerce"

Description:

ACFMart is Vietnam's premier anti-counterfeit e-commerce platform, 

leveraging QR code verification and rigorous seller vetting to ensure 

100% authentic products.

🎯 Mission: Eliminate counterfeit goods in Vietnamese e-commerce

🔒 Technology: QR traceability, blockchain verification

🤝 Partners: Vietnam Anti-Counterfeit Fund, logistics providers

🌐 www.acfmart.vn

Specialties:


•	E-commerce Platform
•	Anti-Counterfeit Solutions
•	QR Code Verification
•	Consumer Protection
•	Digital Trust

Use for:


•	B2B partnerships
•	Recruitment
•	Investor relations
•	Brand credibility

________________________________________
📋 4. CHECKLIST SAU KHI TẠO FACEBOOK PAGE
Ngay lập tức (Day 1):
•	 
Upload avatar (170x170px)
•	 
Upload cover photo (820x312px)
•	 
Điền đầy đủ thông tin About
•	 
Thêm website, email, phone
•	 
Set action button (Shop Now)
•	 
Tạo username/custom URL
•	 
Enable Messenger
•	 
Set greeting message
•	 
Invite friends/family (first 100 likes)
Trong tuần đầu (Week 1):
•	 
Đăng 3-5 posts đầu tiên (giới thiệu, sứ mệnh, sản phẩm)
•	 
Tạo Facebook Shop (nếu có sản phẩm)
•	 
Connect Instagram (nếu có)
•	 
Set up Meta Business Suite
•	 
Tạo first ad campaign (brand awareness)
•	 
Add page to website (Facebook widget)
Trong tháng đầu (Month 1):
•	 
Đăng content đều đặn (3-5 posts/week)
•	 
Chạy ads reach/engagement
•	 
Respond to all messages within 24h
•	 
Monitor insights/analytics
•	 
Collect first reviews
•	 
Create events (nếu có promotion)

________________________________________
🎨 5. CONTENT STRATEGY (TÓM TẮT)
Tỷ lệ content (4-1-1 Rule):
•	40% Educational (hướng dẫn, tips, so sánh hàng thật/giả)
•	10% Promotional (deals, sales, new products)
•	10% Brand story (behind-the-scenes, team, mission)
•	40% Engagement (questions, polls, UGC)
Post types:
1.	Carousel: Hướng dẫn từng bước
2.	Video: Unboxing, review, tutorial
3.	Image: Product showcase, infographics
4.	Live: Q&A, flash sales, product launch
5.	Stories: Daily updates, polls, countdown

________________________________________
📊 6. KPIs THEO DÕI
Chỉ số	Mục tiêu (3 tháng)
Facebook followers	10,000+
Engagement rate	3-5%
Response time	<1 giờ
Page views	50,000+/tháng
Click-through rate	2-3%
Conversion rate	1-2%

🔐 7. COMPLIANCE & LEGAL
Bắt buộc theo Nghị định:
•	 
Điều khoản sử dụng (Terms of Service)
•	 
Chính sách bảo mật (Privacy Policy) - NĐ 13/2023/NĐ-CP
•	 
Chính sách đổi trả (Return Policy)
•	 
Chính sách vận chuyển (Shipping Policy)
•	 
Thông tin doanh nghiệp (Business Registration)
•	 
Giấy phép sàn TMĐT (Bộ Công Thương)

Link các chính sách đặt ở:


•	Facebook Page About section
•	Website footer
•	Pinned post

💡 8. QUICK WINS (HÀNH ĐỘNG NHANH)
1.	Claim vanity URL ngay (trùng với brand name)
2.	Verify Page (xanh/gray badge) - tăng credibility
3.	Cross-promote trên tất cả channels (website, email signature, packaging)
4.	Run launch campaign (giveaway, discount for first followers)
5.	Influencer seeding (micro-influencers review sản phẩm)
6.	Facebook Groups (join groups liên quan, không spam)
7.	Customer reviews (incentivize first 100 reviews)

📌 TÓM LẠI - HÀNH ĐỘNG NGAY:
Bước 1: Hoàn thiện Facebook Page (trong 2 giờ)
✓ Tên: ACFMart - Sàn TMĐT Chống Hàng Giả
✓ Category: Mua sắm & bán lẻ + Sàn TMĐT
✓ Description: Copy từ template trên
✓ Avatar + Cover: Theo brand guidelines
✓ Contact info: Đầy đủ website, email, phone
✓ Action button: "Mua ngay" → acfmart.vn
Bước 2: Tạo các platforms còn lại (trong 1 tuần)
1.	Zalo OA (ưu tiên #2)
2.	TikTok (ưu tiên #3 - Gen Z audience)
3.	Instagram (visual commerce)
4.	YouTube (long-form content)
5.	LinkedIn (B2B, credibility)
Bước 3: Content & Growth (ongoing)
•	Content calendar 30 ngày
•	Ads budget: 5-10M VND/tháng đầu
•	Influencer partnerships
•	Community building


 
PHÂN TÍCH CHIẾN LƯỢC PHÁT TRIỂN AFFILIATE MARKETING & SOCIAL COMMERCE
Gửi: Ban Lãnh đạo ACFMart
Ngày: 14/05/2026 | Phân tích theo chuẩn mực CFA & Investment Banking

________________________________________
📊 PHẦN 1: AFFILIATE MARKETING - CHIẾN LƯỢC & YÊU CẦU
1.1 BỐI CẢNH THỊ TRƯỜNG VIỆT NAM (2025-2026)
Chỉ số	Giá trị	Nguồn
Quy mô Affiliate VN	~$150-200 triệu USD (2025)	VECOM & AccessTrade
Tăng trưởng	CAGR 25-30%/năm	Industry Report 2025
Tỷ lệ chuyển đổi	2-5% (TMĐT tổng), 5-12% (niche)	Benchmark các sàn
Commission trung bình	3-15% tùy ngành hàng	Accesstrade, MasOffer
Top verticals	Thời trang (35%), Mỹ phẩm (25%), Điện tử (20%)	Market Share 2025

Xu hướng 2026:


•	Micro-influencers (1K-100K followers) chiếm 60% GMV affiliate
•	Video content & livestreaming drive 70% conversions
•	AI-powered product matching tăng CTR 40-60%

________________________________________
1.2 YÊU CẦU HỆ THỐNG AFFILIATE
A. KIẾN TRÚC KỸ THUẬT
┌─────────────────────────────────────────────────────────┐

│                    AFFILIATE PLATFORM                     │

├─────────────────────────────────────────────────────────┤

│  Frontend (acfmart.online/affiliate)                     │

│  ├── Dashboard cho Affiliate                             │

│  ├── Link/QR Generator                                   │

│  ├── Real-time Analytics                                 │

│  └── Content Library (banners, videos, templates)        │

├─────────────────────────────────────────────────────────┤

│  Backend Services                                        │

│  ├── Tracking Service (clicks, conversions, cookies)     │

│  ├── Commission Engine (calculation, tiers, bonuses)     │

│  ├── Payment Service (payouts, invoices, tax reporting)  │

│  ├── Fraud Detection (click fraud, self-referral)        │

│  └── Attribution Model (first-click, last-click, linear) │

├─────────────────────────────────────────────────────────┤

│  Database                                                │

│  ├── affiliate_users                                     │

│  ├── affiliate_links                                     │

│  ├── clicks & conversions                                │

│  ├── commissions & payouts                               │

│  └── performance_metrics                                 │

└─────────────────────────────────────────────────────────┘
B. DATA DICTIONARY - AFFILIATE ENTITIES
Entity	Fields chính	Data Type	PII	Retention
Affiliate	affiliate_id, user_id, status, tier, payment_method, tax_id, approved_at	UUID, FK, Enum	Yes	5 years
AffiliateLink	link_id, affiliate_id, product_id/shop_id, link_code, clicks, conversions, commission_rate, created_at, expires_at	UUID, FK, Decimal	No	3 years
Click	click_id, link_id, visitor_id, timestamp, ip_hash, user_agent, referrer, device_type	UUID, Hash	Yes (hashed)	90 days
Conversion	conversion_id, click_id, order_id, commission_amount, status (pending/approved/rejected), approved_at	UUID, Decimal	No	5 years (tax)
Payout	payout_id, affiliate_id, amount, period_start, period_end, status, payment_date, transaction_ref	UUID, Decimal	Yes	7 years
C. API ENDPOINTS - AFFILIATE
# Affiliate Management

POST   /api/v1/affiliate/apply                    # Đăng ký làm affiliate

GET    /api/v1/affiliate/dashboard                 # Thống kê tổng quan

GET    /api/v1/affiliate/performance              # Hiệu suất chi tiết

# Link & Content Generation

POST   /api/v1/affiliate/links                    # Tạo link affiliate

GET    /api/v1/affiliate/links                    # Danh sách links

DELETE /api/v1/affiliate/links/:id                # Xóa link

POST   /api/v1/affiliate/links/:id/qr-code        # Generate QR code

GET    /api/v1/affiliate/content-library          # Banners, videos, templates

# Tracking & Analytics

GET    /api/v1/affiliate/clicks                   # Click tracking data

GET    /api/v1/affiliate/conversions              # Conversion data

GET    /api/v1/affiliate/realtime-stats           # Real-time metrics

GET    /api/v1/affiliate/top-products             # Best converting products

# Commission & Payouts

GET    /api/v1/affiliate/commissions              # Commission history

GET    /api/v1/affiliate/commissions/pending      # Pending commissions

GET    /api/v1/affiliate/payouts                  # Payout history

POST   /api/v1/affiliate/payouts/request          # Request payout

GET    /api/v1/affiliate/tax-documents            # Tax forms

# Products & Categories

GET    /api/v1/affiliate/products                 # Products available for promo

GET    /api/v1/affiliate/categories/:id/commission # Commission rates by category

________________________________________
1.3 MÔ HÌNH HOA HỒNG (COMMISSION STRUCTURE)
A. Tier-Based Commission
Tier	Yêu cầu	Commission Rate	Bonus
Bronze	Mới đăng ký	3-5%	-
Silver	≥10 đơn/tháng, GMV ≥50M	5-8%	+2% cho sản phẩm mới
Gold	≥50 đơn/tháng, GMV ≥200M	8-12%	+3% bonus, early access deals
Platinum	≥200 đơn/tháng, GMV ≥1B	12-15%	+5% bonus, dedicated AM, co-marketing
B. Category-Based Rates
Danh mục	Commission	Lý do
Thời trang & Phụ kiện	10-15%	Margin cao, cạnh tranh
Mỹ phẩm & Làm đẹp	12-18%	High margin, repeat purchase
Điện tử & Công nghệ	3-6%	Low margin, high AOV
Gia dụng	8-12%	Mid margin
Sách & Văn phòng phẩm	15-20%	Very low cost, digital-friendly
Thực phẩm & FMCG	5-8%	Low margin, high volume
C. Performance Bonuses
// Bonus Calculation Logic

const bonuses = {

  volumeBonus: {

    threshold_100_orders: 0.02,      // +2% nếu ≥100 đơn/tháng

    threshold_500_orders: 0.03,      // +3% nếu ≥500 đơn/tháng

  },

  growthBonus: {

    mom_growth_50percent: 0.01,      // +1% nếu tăng trưởng 50% MoM

    mom_growth_100percent: 0.02,     // +2% nếu tăng trưởng 100% MoM

  },

  newProductBonus: 0.03,              // +3% cho sản phẩm mới launch

  exclusivityBonus: 0.05,             // +5% nếu exclusive partner

  retentionBonus: {

    customer_ltv_high: 0.02,          // +2% nếu customer LTV cao

    repeat_purchase_rate: 0.015       // +1.5% nếu repeat rate >30%

  }

};

________________________________________
1.4 HỆ THỐNG TRACKING & ATTRIBUTION
A. Tracking Methods
1. Cookie-based Tracking (30-90 days)

   - First-party cookie (acfmart.vn domain)

   - Fallback: third-party cookie

   - Compliance: GDPR/PDPD consent required

2. Device Fingerprinting

   - IP address (hashed)

   - User agent

   - Screen resolution

   - Timezone

   - Accuracy: ~85-90%

3. Server-to-Server (S2S) Tracking

   - Postback URL cho mobile apps

   - Server-side conversion tracking

   - Bypasses ad blockers

4. QR Code Tracking

   - Unique QR per affiliate

   - Scan → redirect → cookie set

   - Offline-to-online attribution
B. Attribution Models
Model	Mô tả	Use case
Last Click	100% commission cho link cuối	Default, simple
First Click	100% cho link đầu tiên	Brand awareness campaigns
Linear	Chia đều cho tất cả touchpoints	Multi-channel marketing
Time Decay	Link gần conversion cao hơn	Consideration phase products
Position Based	First 40%, Last 40%, Middle 20%	Balanced approach

Khuyến nghị ACFMart: Start với Last Click, sau 6 tháng chuyển sang Position Based để fair cho top-of-funnel affiliates.

________________________________________
1.5 CHỐNG FRAUD & ABUSE
A. Fraud Detection Rules
# Fraud Detection Algorithm

class AffiliateFraudDetector:

    def detect(self, click_data, conversion_data):

        red_flags = []

        

        # 1. Self-referral detection

        if click_data.user_id == conversion_data.buyer_id:

            red_flags.append("SELF_REFERRAL")

        

        # 2. Click velocity anomaly

        if clicks_per_minute > 10:

            red_flags.append("CLICK_FARM_SUSPECTED")

        

        # 3. Geographic mismatch

        if click_data.country != conversion_data.shipping_country:

            red_flags.append("GEO_MISMATCH")

        

        # 4. Device fingerprint duplication

        if same_device_clicks > 50_per_hour:

            red_flags.append("DEVICE_FRAUD")

        

        # 5. Conversion rate anomaly

        if conversion_rate > 50%:  # Industry avg 2-5%

            red_flags.append("UNNATURAL_CONVERSION")

        

        # 6. Cookie stuffing detection

        if multiple_affiliate_cookies_set_without_interaction:

            red_flags.append("COOKIE_STUFFING")

        

        return red_flags
B. Prevention Measures
Biện pháp	Implementation
IP Blacklist	Block data centers, VPNs, proxy IPs
Device Fingerprinting	Track unique devices, block duplicates
Click-to-Conversion Time	Flag conversions <30 seconds (suspicious)
Minimum Dwell Time	Require ≥10 seconds on product page
Email Validation	Block disposable emails (temp-mail, 10minutemail)
Manual Review	Audit top 10% affiliates monthly
Clawback Policy	Revoke commission if refund/chargeback

________________________________________
1.6 THANH TOÁN & TAX COMPLIANCE
A. Payout Schedule
Phương thức	Minimum Payout	Processing Time	Fee
Bank Transfer	500,000 VND	T+3-5 business days	Free
E-wallet (MoMo, ZaloPay)	200,000 VND	Instant - T+1	1-2%
Crypto (USDT)	$50 equivalent	<24 hours	Network fee

Hold Period: 30-45 days (để xử lý returns/refunds)
B. Tax Reporting (Vietnam)
Theo Thông tư 40/2021/TT-BTC & Nghị định 126/2020/NĐ-CP:

1. Affiliate Income Tax:

   - <100M VND/năm: Miễn thuế

   - ≥100M VND/năm: 5% Personal Income Tax (PIT)

   

2. Platform Obligation:

   - Withholding tax at source (5%)

   - Report to tax authority quarterly

   - Issue tax certificates annually

   

3. Business Affiliates (companies):

   - Issue VAT invoice (10%)

   - Platform pays gross amount

   - Affiliate self-declares CIT

Implementation:

-- Tax calculation table

CREATE TABLE affiliate_tax_records (

    record_id UUID PRIMARY KEY,

    affiliate_id UUID REFERENCES affiliates(id),

    period_start DATE,

    period_end DATE,

    gross_commission DECIMAL(12,2),

    tax_rate DECIMAL(5,2),  -- 5% for individuals

    tax_amount DECIMAL(12,2),

    net_payout DECIMAL(12,2),

    tax_withheld BOOLEAN,

    tax_certificate_issued BOOLEAN,

    reporting_status ENUM('pending', 'filed', 'verified')

);

________________________________________
📱 PHẦN 2: SOCIAL COMMERCE PLATFORM - YÊU CẦU & TRIỂN KHAI
2.1 BỐI CẢNH SOCIAL COMMERCE 2025-2026
Nền tảng	Market Share VN	Avg. Conversion Rate
Facebook/Instagram	65% social commerce	1.5-3%
TikTok Shop	25% (tăng nhanh)	3-7%
Zalo	8%	2-4%
Others	2%	-

Xu hướng 2026:


•	Livestream commerce: $12-15B GMV tại VN, tăng 80% YoY
•	Short video (15-60s): 70% thời gian online của Gen Z
•	Shoppable content: Click-to-buy trong video giảm friction 60%

________________________________________
2.2 KIẾN TRÚC HỆ THỐNG SOCIAL COMMERCE
┌──────────────────────────────────────────────────────────┐

│              SOCIAL COMMERCE (acfmart.online)             │

├──────────────────────────────────────────────────────────┤

│  FEATURES                                                 │

│  ├── Short Video Upload (15s - 10min)                     │

│  ├── Livestreaming (real-time shopping)                   │

│  ├── Feed/Posts (image, text, carousel)                   │

│  ├── Showcase Pages (seller/user profiles)                │

│  └── Product Tagging (in-video, in-post)                  │

├──────────────────────────────────────────────────────────┤

│  TECHNICAL STACK                                          │

│  ├── Video Processing: FFmpeg, AWS MediaConvert           │

│  ├── CDN: Cloudflare, Akamai (global edge caching)        │

│  ├── Streaming: WebRTC, HLS, RTMP                         │

│  ├── Storage: S3-compatible (MinIO, AWS S3)               │

│  ├── Database: PostgreSQL (metadata) + Redis (cache)      │

│  ├── Search: Elasticsearch (content discovery)            │

│  └── AI/ML: Content moderation, recommendation engine     │

└──────────────────────────────────────────────────────────┘

________________________________________
2.3 YÊU CẦU CHI TIẾT TỪNG TÍNH NĂNG
A. SHORT VIDEO UPLOAD
Functional Requirements:

Video Specifications:

  formats:

    - MP4 (H.264/H.265)

    - MOV

    - AVI

  resolution:

    min: 480p (640x480)

    recommended: 1080p (1920x1080)

    max: 4K (3840x2160)

  duration:

    min: 3 seconds

    max: 10 minutes (600 seconds)

    optimal: 15-60 seconds (engagement peak)

  file_size:

    max: 500 MB

  aspect_ratio:

    - 9:16 (vertical, mobile-first)

    - 1:1 (square)

    - 16:9 (horizontal)

Processing Pipeline:

  1. Upload (chunked, resumable)

  2. Virus scan (ClamAV)

  3. Transcoding (multiple qualities: 480p, 720p, 1080p)

  4. Thumbnail generation (auto + manual)

  5. AI content moderation

  6. Metadata extraction (duration, resolution, codec)

  7. CDN distribution

  8. Indexing (searchable)

Product Tagging:

  - Max 10 products per video

  - Timestamp-based (product appears at 0:15, 0:30, etc.)

  - Clickable overlay (CTA buttons)

  - Deep link to product page

API Endpoints:

POST   /api/v1/videos/upload              # Initiate upload (get presigned URL)

POST   /api/v1/videos/:id/complete        # Complete upload, trigger processing

GET    /api/v1/videos/:id/status          # Check processing status

PUT    /api/v1/videos/:id                 # Update metadata (title, description, tags)

POST   /api/v1/videos/:id/product-tags    # Tag products in video

DELETE /api/v1/videos/:id/product-tags/:tagId

GET    /api/v1/videos/feed                # Personalized feed

GET    /api/v1/videos/trending            # Trending videos

GET    /api/v1/videos/user/:userId        # User's videos

POST   /api/v1/videos/:id/like            # Like video

DELETE /api/v1/videos/:id/like            # Unlike

POST   /api/v1/videos/:id/comments        # Add comment

GET    /api/v1/videos/:id/comments        # Get comments

POST   /api/v1/videos/:id/share           # Track shares

GET    /api/v1/videos/:id/analytics       # View count, engagement, CTR

Database Schema:

CREATE TABLE videos (

    video_id UUID PRIMARY KEY,

    user_id UUID REFERENCES users(id),

    title VARCHAR(255),

    description TEXT,

    video_url VARCHAR(512),          -- CDN URL

    thumbnail_url VARCHAR(512),

    duration INTEGER,                 -- seconds

    resolution VARCHAR(20),           -- 1080p, 720p, etc.

    file_size BIGINT,                 -- bytes

    status ENUM('processing', 'ready', 'failed', 'removed'),

    visibility ENUM('public', 'private', 'unlisted'),

    view_count BIGINT DEFAULT 0,

    like_count INTEGER DEFAULT 0,

    comment_count INTEGER DEFAULT 0,

    share_count INTEGER DEFAULT 0,

    product_tags_count INTEGER DEFAULT 0,

    created_at TIMESTAMP,

    updated_at TIMESTAMP,

    published_at TIMESTAMP,

    moderation_status ENUM('pending', 'approved', 'rejected'),

    moderated_at TIMESTAMP,

    moderation_reason TEXT

);

CREATE TABLE video_product_tags (

    tag_id UUID PRIMARY KEY,

    video_id UUID REFERENCES videos(video_id),

    product_id UUID REFERENCES products(id),

    timestamp INTEGER,                -- seconds into video

    x_coordinate DECIMAL(5,2),        -- overlay position

    y_coordinate DECIMAL(5,2),

    click_count INTEGER DEFAULT 0,

    conversion_count INTEGER DEFAULT 0,

    created_at TIMESTAMP

);

CREATE TABLE video_analytics (

    analytics_id UUID PRIMARY KEY,

    video_id UUID REFERENCES videos(video_id),

    date DATE,

    views INTEGER,

    unique_viewers INTEGER,

    avg_watch_time INTEGER,           -- seconds

    completion_rate DECIMAL(5,2),     -- percentage

    likes INTEGER,

    comments INTEGER,

    shares INTEGER,

    product_clicks INTEGER,

    conversions INTEGER,

    revenue_generated DECIMAL(12,2)

);

Infrastructure Cost Estimate:

Component	Cost (monthly)	Notes
Storage (S3)	$0.023/GB	1TB = ~$23/month
CDN Egress	$0.085/GB	10TB = ~$850/month
Transcoding	$0.01/min	100K min = $1,000/month
Database	$200-500	PostgreSQL RDS
Total (10K videos, 100K views/day)	~$2-3K/month	Scale with usage

________________________________________
B. LIVESTREAMING
Functional Requirements:

Streaming Specifications:

  protocols:

    - RTMP (ingest from OBS, mobile apps)

    - HLS (playback, adaptive bitrate)

    - WebRTC (low-latency, interactive)

  

  quality:

    - 480p @ 1.5 Mbps (mobile, low bandwidth)

    - 720p @ 3 Mbps (standard)

    - 1080p @ 6 Mbps (HD, recommended)

  

  latency:

    - HLS: 10-30 seconds (standard)

    - WebRTC: <500ms (ultra-low, for Q&A, auctions)

  

  max_duration: 4 hours (extendable)

  

  concurrent_viewers: Scale to 10K+ per stream

Features:

  - Real-time chat (WebSocket)

  - Reactions (emojis, gifts)

  - Product showcase (pin products)

  - Flash sales (countdown timers)

  - Viewer count display

  - Moderation tools (ban, mute, keyword filter)

  - Recording & VOD (video on demand)

  - Co-hosting (multi-streamer)

  - Screen sharing (for tutorials)

Architecture:

┌──────────────┐     ┌──────────────┐     ┌──────────────┐

│   Streamer   │────▶│  Ingest Server│───▶│ Media Server │

│ (OBS/Mobile) │ RTMP│ (NGINX-RTMP) │     │ (Wowza/Media │

└──────────────┘     └──────────────┘     │   Soup/Red5) │

                                           └──────────────┘

                                                  │

                    ┌─────────────────────────────┼─────────────────────────────┐

                    │                             │                             │

                    ▼                             ▼                             ▼

           ┌──────────────┐            ┌──────────────┐            ┌──────────────┐

           │   HLS CDN    │            │  WebSocket   │            │  Recording   │

           │ (playback)   │            │   Server     │            │    (S3)      │

           └──────────────┘            │  (chat,      │            └──────────────┘

                    │                  │   reactions) │                   │

                    │                  └──────────────┘                   │

                    ▼                             │                       ▼

           ┌──────────────┐            ┌──────────────┐            ┌──────────────┐

           │   Viewers    │◀───────────│  Real-time   │            │     VOD      │

           │ (Web/Mobile) │            │   Events     │            │  (Playback)  │

           └──────────────┘            └──────────────┘            └──────────────┘

API Endpoints:

# Stream Management

POST   /api/v1/livestreams                    # Create stream (get stream key)

GET    /api/v1/livestreams/:id                # Get stream details

PUT    /api/v1/livestreams/:id                # Update stream info

DELETE /api/v1/livestreams/:id                # End stream

GET    /api/v1/livestreams/active             # List active streams

GET    /api/v1/livestreams/scheduled          # Upcoming streams

# Stream Interaction

POST   /api/v1/livestreams/:id/start          # Start streaming

POST   /api/v1/livestreams/:id/stop           # Stop streaming

POST   /api/v1/livestreams/:id/pin-product    # Pin product to stream

DELETE /api/v1/livestreams/:id/pin-product/:productId

POST   /api/v1/livestreams/:id/flash-sale     # Create flash sale event

GET    /api/v1/livestreams/:id/viewers        # Current viewer count

GET    /api/v1/livestreams/:id/chat           # Chat history

POST   /api/v1/livestreams/:id/chat           # Send chat message (WebSocket)

POST   /api/v1/livestreams/:id/reaction       # Send emoji reaction

POST   /api/v1/livestreams/:id/gift           # Send virtual gift

# Moderation

POST   /api/v1/livestreams/:id/moderate/ban   # Ban user

POST   /api/v1/livestreams/:id/moderate/mute  # Mute user

POST   /api/v1/livestreams/:id/moderate/timeout # Timeout user

GET    /api/v1/livestreams/:id/moderation-logs

# Analytics

GET    /api/v1/livestreams/:id/analytics      # Views, engagement, sales

GET    /api/v1/livestreams/:id/conversions    # Product sales during stream

Real-time Chat System (WebSocket):

// WebSocket Event Structure

const chatEvents = {

  // Client → Server

  'chat:message': {

    stream_id: UUID,

    user_id: UUID,

    message: String,

    timestamp: ISO8601

  },

  'chat:reaction': {

    stream_id: UUID,

    user_id: UUID,

    emoji: String,

    timestamp: ISO8601

  },

  'chat:gift': {

    stream_id: UUID,

    sender_id: UUID,

    receiver_id: UUID,

    gift_type: String,

    value: Decimal,

    timestamp: ISO8601

  },

  

  // Server → Client

  'chat:new_message': {

    message_id: UUID,

    user_id: UUID,

    username: String,

    avatar: String,

    message: String,

    timestamp: ISO8601,

    is_moderator: Boolean

  },

  'chat:user_joined': {

    user_id: UUID,

    username: String,

    viewer_count: Integer

  },

  'chat:user_left': {

    user_id: UUID,

    viewer_count: Integer

  },

  'chat:viewer_count_update': {

    count: Integer,

    timestamp: ISO8601

  },

  'chat:product_pinned': {

    product_id: UUID,

    product_name: String,

    price: Decimal,

    pinned_by: UUID,

    timestamp: ISO8601

  }

};

Moderation Tools:

class LivestreamModeration:

    def __init__(self):

        self.banned_words = load_banned_words()

        self.spam_detector = SpamDetector()

        self.ai_moderation = AIModerationAPI()

    

    async def moderate_message(self, message: str, user_id: UUID) -> ModerationResult:

        result = ModerationResult(allowed=True, action=None)

        

        # 1. Banned words filter

        if any(word in message.lower() for word in self.banned_words):

            result.allowed = False

            result.action = "BLOCK"

            result.reason = "BANNED_WORD"

            return result

        

        # 2. Spam detection (repeated messages, links)

        if await self.spam_detector.is_spam(user_id, message):

            result.allowed = False

            result.action = "TIMEOUT"

            result.duration = 300  # 5 minutes

            result.reason = "SPAM"

            return result

        

        # 3. AI content moderation (hate speech, harassment)

        ai_result = await self.ai_moderation.analyze(message)

        if ai_result.toxicity_score > 0.8:

            result.allowed = False

            result.action = "BAN"

            result.reason = "TOXIC_CONTENT"

            await self.notify_moderators(user_id, message, ai_result)

            return result

        

        # 4. Rate limiting

        if await self.get_message_count(user_id, window=60) > 20:

            result.allowed = False

            result.action = "RATE_LIMITED"

            return result

        

        return result

Monetization Features:

-- Virtual Gifts

CREATE TABLE virtual_gifts (

    gift_id UUID PRIMARY KEY,

    name VARCHAR(100),

    icon_url VARCHAR(512),

    price DECIMAL(10,2),          -- in VND

    coins_required INTEGER,

    category VARCHAR(50),         -- free, paid, premium

    created_at TIMESTAMP

);

CREATE TABLE gift_transactions (

    transaction_id UUID PRIMARY KEY,

    stream_id UUID REFERENCES livestreams(id),

    sender_id UUID REFERENCES users(id),

    receiver_id UUID REFERENCES users(id),  -- streamer

    gift_id UUID REFERENCES virtual_gifts(id),

    quantity INTEGER,

    total_value DECIMAL(12,2),

    platform_fee DECIMAL(12,2),   -- 30% platform cut

    streamer_earning DECIMAL(12,2), -- 70% to streamer

    created_at TIMESTAMP

);

-- Flash Sales during Livestream

CREATE TABLE livestream_flash_sales (

    sale_id UUID PRIMARY KEY,

    stream_id UUID REFERENCES livestreams(id),

    product_id UUID REFERENCES products(id),

    discount_percentage DECIMAL(5,2),

    flash_price DECIMAL(12,2),

    quantity_available INTEGER,

    quantity_sold INTEGER DEFAULT 0,

    start_time TIMESTAMP,

    end_time TIMESTAMP,

    status ENUM('scheduled', 'active', 'ended', 'cancelled')

);

________________________________________
C. FEED & POSTS
Post Types:

Content Types:

  - Text-only (max 5,000 characters)

  - Image (single, carousel up to 10 images)

  - Video (embedded from video library)

  - Product showcase (product card with CTA)

  - Poll (2-10 options, duration 1-7 days)

  - Link preview (auto-generate preview card)

  - Event (announcement with RSVP)

Engagement Actions:

  - Like/Unlike

  - Comment (nested replies up to 3 levels)

  - Share (to feed, to DM, external)

  - Save/Bookmark

  - Report

  - React (emoji reactions: 👍❤️😂😮😢)

API Endpoints:

POST   /api/v1/posts                          # Create post

GET    /api/v1/posts/:id                      # Get post details

PUT    /api/v1/posts/:id                      # Update post

DELETE /api/v1/posts/:id                      # Delete post

GET    /api/v1/posts/feed                     # Personalized feed

GET    /api/v1/posts/user/:userId             # User's posts

GET    /api/v1/posts/trending                 # Trending posts

POST   /api/v1/posts/:id/like                 # Like post

DELETE /api/v1/posts/:id/like                 # Unlike

POST   /api/v1/posts/:id/react                # Emoji reaction

POST   /api/v1/posts/:id/comment              # Add comment

GET    /api/v1/posts/:id/comments             # Get comments

POST   /api/v1/posts/:id/share                # Track share

POST   /api/v1/posts/:id/save                 # Save to bookmarks

POST   /api/v1/posts/:id/report               # Report post

GET    /api/v1/posts/:id/analytics            # Impressions, engagement

Feed Algorithm:

class FeedRankingAlgorithm:

    """

    Hybrid ranking: collaborative filtering + content-based + recency

    """

    def calculate_score(self, post: Post, user: User) -> float:

        score = 0.0

        

        # 1. Recency decay (newer posts ranked higher)

        hours_old = (now() - post.created_at).total_seconds() / 3600

        recency_score = 1 / (1 + 0.1 * hours_old)  # Exponential decay

        score += recency_score * 0.3  # 30% weight

        

        # 2. Engagement score

        engagement = (

            post.like_count * 1 +

            post.comment_count * 2 +

            post.share_count * 3 +

            post.save_count * 1.5

        )

        engagement_score = log1p(engagement)  # Log scale to prevent viral bias

        score += engagement_score * 0.3  # 30% weight

        

        # 3. User affinity (followed users, past interactions)

        affinity = self.calculate_user_affinity(user.id, post.author_id)

        score += affinity * 0.25  # 25% weight

        

        # 4. Content relevance (categories, tags, search history)

        relevance = self.calculate_content_relevance(user, post)

        score += relevance * 0.1  # 10% weight

        

        # 5. Diversity boost (prevent filter bubble)

        diversity_bonus = self.calculate_diversity_bonus(user, post)

        score += diversity_bonus * 0.05  # 5% weight

        

        # 6. Penalty for low-quality/spam

        if post.quality_score < 0.5:

            score *= 0.5  # 50% penalty

        

        return score

    

    def calculate_user_affinity(self, user_id: UUID, author_id: UUID) -> float:

        # Check if user follows author

        if self.is_following(user_id, author_id):

            return 1.0

        

        # Check past interactions (likes, comments, shares)

        interaction_count = self.get_interaction_count(user_id, author_id, days=30)

        return min(interaction_count / 10, 1.0)  # Cap at 1.0

    

    def calculate_content_relevance(self, user: User, post: Post) -> float:

        # Compare post categories/tags with user interests

        user_interests = set(user.interest_categories)

        post_categories = set(post.categories)

        

        overlap = len(user_interests & post_categories)

        total = len(user_interests | post_categories)

        

        return overlap / total if total > 0 else 0.0

________________________________________
D. SHOWCASE PAGES (PROFILES)
Page Types:

User Profile:

  - Avatar, cover photo

  - Bio, location, website

  - Followers/Following count

  - Posts grid

  - Verified badge (if applicable)

  - Privacy settings (public/private)

Seller Shop Page:

  - Shop logo, banner

  - Shop name, description

  - Business info (verified badge)

  - Product catalog (grid/list view)

  - Ratings & reviews

  - Response time, fulfillment rate

  - Follow shop button

  - Contact seller (chat)

  - Shop policies (shipping, returns)

Brand Page:

  - Brand story, mission

  - Official verification

  - Product collections

  - Campaigns & promotions

  - Brand ambassadors

  - Press mentions

API Endpoints:

# Profile Management

GET    /api/v1/profiles/:userId               # Get user profile

PUT    /api/v1/profiles/me                    # Update own profile

GET    /api/v1/profiles/:userId/followers     # Get followers

GET    /api/v1/profiles/:userId/following     # Get following

POST   /api/v1/profiles/:userId/follow        # Follow user

DELETE /api/v1/profiles/:userId/follow        # Unfollow

# Shop Pages

GET    /api/v1/shops/:shopId                  # Get shop details

PUT    /api/v1/shops/me                       # Update shop

GET    /api/v1/shops/:shopId/products         # Shop's products

GET    /api/v1/shops/:shopId/reviews          # Shop reviews

GET    /api/v1/shops/:shopId/analytics        # Shop performance

POST   /api/v1/shops/me/verification          # Request verification

# Brand Pages

GET    /api/v1/brands/:brandId                # Get brand page

GET    /api/v1/brands/:brandId/products       # Brand's products

GET    /api/v1/brands/:brandId/campaigns      # Active campaigns

________________________________________
E. PRODUCT TAGGING & SHOPPING INTEGRATION
Tagging in Content:

In Videos:

  - Timestamp-based tags (product appears at 0:15)

  - Clickable overlay (CTA button)

  - Product card popup (image, price, CTA)

  - Add to cart without leaving video

In Posts:

  - Product mention (@product_name)

  - Auto-generate product card

  - Swipeable product carousel

  - "Shop the post" button

In Livestreams:

  - Pinned products (always visible)

  - Flash sale countdown

  - One-click purchase

  - Limited-time offers

  - Stock counter (urgency)

API Endpoints:

POST   /api/v1/content/:contentId/tag-product    # Tag product

DELETE /api/v1/content/:contentId/tag-product/:tagId

GET    /api/v1/content/:contentId/tagged-products # Get all tagged products

POST   /api/v1/content/:contentId/product-click   # Track product click

POST   /api/v1/content/:contentId/conversion      # Track conversion

GET    /api/v1/shoppable/content                  # Discover shoppable content

Database Schema:

CREATE TABLE content_product_tags (

    tag_id UUID PRIMARY KEY,

    content_id UUID,                    -- video_id, post_id, or stream_id

    content_type ENUM('video', 'post', 'livestream'),

    product_id UUID REFERENCES products(id),

    tag_metadata JSONB,                 -- timestamp, position, etc.

    click_count INTEGER DEFAULT 0,

    conversion_count INTEGER DEFAULT 0,

    revenue_generated DECIMAL(12,2) DEFAULT 0,

    created_at TIMESTAMP,

    UNIQUE(content_id, content_type, product_id)

);

CREATE TABLE content_analytics (

    analytics_id UUID PRIMARY KEY,

    content_id UUID,

    content_type ENUM('video', 'post', 'livestream'),

    date DATE,

    impressions INTEGER,

    reach INTEGER,                      -- unique viewers

    engagement_rate DECIMAL(5,2),       -- (likes+comments+shares)/impressions

    product_clicks INTEGER,

    add_to_cart INTEGER,

    purchases INTEGER,

    revenue DECIMAL(12,2),

    avg_watch_time INTEGER,             -- for videos/livestreams

    completion_rate DECIMAL(5,2)

);

________________________________________
2.4 CONTENT MODERATION & COMPLIANCE
A. Automated Moderation Pipeline
class ContentModerationPipeline:

    def __init__(self):

        self.vision_api = CloudVisionAPI()      # Image/video analysis

        self.text_api = TextModerationAPI()     # Text analysis

        self.audio_api = AudioModerationAPI()   # Audio/transcript analysis

        self.deepfake_detector = DeepfakeDetector()

    

    async def moderate_content(self, content: Content) -> ModerationResult:

        result = ModerationResult(status='PENDING')

        

        # 1. Image/Video Analysis

        if content.type in ['image', 'video']:

            vision_result = await self.vision_api.analyze(content.url)

            

            # Detect: nudity, violence, drugs, weapons, hate symbols

            if vision_result.adult_score > 0.8:

                result.status = 'REJECTED'

                result.reason = 'ADULT_CONTENT'

                return result

            

            if vision_result.violence_score > 0.7:

                result.status = 'REVIEW_REQUIRED'

                result.reason = 'VIOLENCE_SUSPECTED'

            

            # Detect counterfeit products (logo matching)

            if await self.detect_counterfeit_products(content.url):

                result.status = 'REJECTED'

                result.reason = 'COUNTERFEIT_SUSPECTED'

                await self.notify_seller(content.author_id)

        

        # 2. Text Analysis (captions, comments, descriptions)

        if content.text:

            text_result = await self.text_api.analyze(content.text)

            

            if text_result.toxicity_score > 0.8:

                result.status = 'REJECTED'

                result.reason = 'TOXIC_LANGUAGE'

            

            if text_result.hate_speech_score > 0.7:

                result.status = 'REJECTED'

                result.reason = 'HATE_SPEECH'

            

            # Detect spam/scam patterns

            if self.detect_spam_patterns(content.text):

                result.status = 'REVIEW_REQUIRED'

                result.reason = 'SPAM_SUSPECTED'

        

        # 3. Audio Analysis (for videos/livestreams)

        if content.type in ['video', 'livestream'] and content.audio_url:

            transcript = await self.audio_api.transcribe(content.audio_url)

            audio_result = await self.text_api.analyze(transcript)

            

            if audio_result.toxicity_score > 0.8:

                result.status = 'REVIEW_REQUIRED'

                result.reason = 'AUDIO_TOXICITY'

        

        # 4. Deepfake Detection

        if content.type == 'video':

            deepfake_score = await self.deepfake_detector.analyze(content.url)

            if deepfake_score > 0.7:

                result.status = 'REVIEW_REQUIRED'

                result.reason = 'DEEPFAKE_SUSPECTED'

                result.requires_human_review = True

        

        # 5. Copyright Detection

        if content.type in ['video', 'image']:

            copyright_match = await self.check_copyright(content.url)

            if copyright_match:

                result.status = 'REJECTED'

                result.reason = 'COPYRIGHT_VIOLATION'

                result.copyright_owner = copyright_match.owner

        

        # Auto-approve if no issues

        if result.status == 'PENDING':

            result.status = 'APPROVED'

        

        return result
B. Compliance Requirements (Vietnam)
Legal Framework:

  - Nghị định 72/2013/NĐ-CP: Quản lý internet content

  - Luật An ninh mạng 2018: Content restrictions

  - Nghị định 13/2023/NĐ-CP: Data protection (PDPD)

  - Nghị định 52/2013/NĐ-CP: E-commerce regulations

Prohibited Content:

  - Anti-state propaganda

  - Inciting violence, terrorism

  - Child exploitation

  - Pornography

  - Gambling promotion

  - Fake news, misinformation

  - Defamation, privacy invasion

  - Counterfeit goods promotion

  - Unlicensed pharmaceuticals

  - Illegal substances

User Data Protection:

  - Explicit consent for data collection

  - Right to access, rectify, erase

  - Data portability

  - Breach notification within 72 hours

  - Data localization (store in Vietnam)

  - Cross-border transfer restrictions

Reporting Obligations:

  - Remove illegal content within 24 hours of notice

  - Cooperate with law enforcement

  - Maintain audit logs (3 years)

  - Appoint local representative

  - Annual compliance report

________________________________________
2.5 INFRASTRUCTURE & SCALABILITY
A. Technical Architecture
┌─────────────────────────────────────────────────────────────┐

│                    FRONTEND LAYER                            │

│  ├── Web App (Next.js/React)                                │

│  ├── Mobile Apps (iOS/Android - React Native/Flutter)       │

│  └── PWA (Progressive Web App)                              │

└─────────────────────────────────────────────────────────────┘

                            │

                            ▼

┌─────────────────────────────────────────────────────────────┐

│                    API GATEWAY                               │

│  ├── Kong/APISIX (rate limiting, auth, routing)             │

│  ├── JWT validation                                         │

│  ├── Request validation                                     │

│  └── API versioning                                         │

└─────────────────────────────────────────────────────────────┘

                            │

            ┌───────────────┼───────────────┐

            ▼               ▼               ▼

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐

│  MICROSERVICES   │ │  MICROSERVICES   │ │  MICROSERVICES   │

├──────────────────┤ ├──────────────────┤ ├──────────────────┤

│ User Service     │ │ Content Service  │ │ Social Service   │

│ Auth Service     │ │ Video Service    │ │ Chat Service     │

│ Profile Service  │ │ Stream Service   │ │ Notification Svc │

└──────────────────┘ └──────────────────┘ └──────────────────┘

            │               │               │

            └───────────────┼───────────────┘

                            ▼

┌─────────────────────────────────────────────────────────────┐

│                    DATA LAYER                                │

│  ├── PostgreSQL (primary DB - ACID transactions)            │

│  ├── Redis (caching, sessions, real-time data)              │

│  ├── Elasticsearch (search, analytics)                      │

│  ├── MongoDB (unstructured data, logs)                      │

│  ├── S3/MinIO (object storage - videos, images)             │

│  └── Kafka (event streaming, async processing)              │

└─────────────────────────────────────────────────────────────┘

                            │

                            ▼

┌─────────────────────────────────────────────────────────────┐

│                    INFRASTRUCTURE                            │

│  ├── Kubernetes (container orchestration)                   │

│  ├── Docker (containerization)                              │

│  ├── Terraform (infrastructure as code)                     │

│  ├── Prometheus + Grafana (monitoring)                      │

│  ├── ELK Stack (logging)                                    │

│  └── Jaeger (distributed tracing)                           │

└─────────────────────────────────────────────────────────────┘
B. Scalability Strategy
Horizontal Scaling:

  - Stateless microservices (auto-scale based on CPU/memory)

  - Database read replicas (scale reads)

  - Sharding strategy (user_id modulo for partitioning)

  - CDN edge caching (reduce origin load)

Caching Strategy:

  L1: In-memory cache (Redis) - TTL 5-15 minutes

    - User sessions

    - Feed data

    - Product details

    - User profiles

  

  L2: CDN caching (Cloudflare/Akamai) - TTL 1-24 hours

    - Static assets (images, videos)

    - API responses (cache-control headers)

    - HTML pages (SSR cache)

  

  L3: Browser caching (localStorage, IndexedDB)

    - User preferences

    - Offline content

    - PWA assets

Database Optimization:

  - Indexing strategy (composite indexes on frequently queried fields)

  - Query optimization (avoid N+1 queries, use JOINs)

  - Connection pooling (PgBouncer for PostgreSQL)

  - Partitioning (time-based for analytics tables)

  - Materialized views (for complex aggregations)

Video Streaming Optimization:

  - Adaptive bitrate streaming (HLS/DASH)

  - Multi-CDN strategy (failover, geographic routing)

  - Pre-transcoding (multiple qualities: 480p, 720p, 1080p)

  - Thumbnail sprites (fast seeking)

  - Lazy loading (load videos as user scrolls)
C. Cost Estimation (Monthly)
Component	Scale	Estimated Cost
Cloud Infrastructure		
Compute (K8s cluster)	20 nodes (m5.xlarge)	$3,000
Database (PostgreSQL RDS)	db.r5.2xlarge + replicas	$1,500
Redis (ElastiCache)	cache.r5.xlarge	$400
Storage (S3)	10 TB	$230
CDN Egress	100 TB/month	$8,500
Video Processing		
Transcoding	1M minutes/month	$10,000
Streaming (MediaLive)	1,000 hours/month	$2,500
Third-party Services		
Content Moderation API	1M requests	$1,500
Search (Elasticsearch)	Dedicated cluster	$800
Email/SMS (SendGrid, Twilio)	500K emails, 100K SMS	$500
Monitoring & Tools		
Monitoring (Datadog/New Relic)	Full stack	$1,000
Logging (ELK/Splunk)	500 GB/day	$600
Total (100K DAU, 1M MAU)		~$30,000/month

Note: Costs scale linearly with usage. At 1M DAU, expect ~$150-200K/month.

________________________________________
2.6 METRICS & ANALYTICS
A. Key Performance Indicators (KPIs)
Engagement Metrics:

  - DAU/MAU ratio (target: >20%)

  - Session duration (target: >8 minutes)

  - Sessions per user per day (target: >3)

  - Bounce rate (target: <40%)

  - Scroll depth (target: >60%)

Content Metrics:

  - Videos uploaded per day

  - Avg. video watch time

  - Video completion rate

  - Livestream concurrent viewers

  - Posts per active user

Social Metrics:

  - Followers growth rate

  - Follow-back ratio

  - Comments per post

  - Shares per post

  - User-generated content ratio

Commerce Metrics:

  - Product tag CTR (click-through rate)

  - Add-to-cart rate from content

  - Conversion rate (content → purchase)

  - Revenue per content piece

  - GMV from social commerce

Monetization Metrics:

  - Virtual gifts revenue

  - Affiliate commission

  - Ad revenue (if applicable)

  - ARPU (average revenue per user)

  - LTV (lifetime value)
B. Analytics Dashboard
-- Daily Active Users (DAU)

SELECT 

    DATE(created_at) as date,

    COUNT(DISTINCT user_id) as dau

FROM user_sessions

WHERE created_at >= NOW() - INTERVAL '30 days'

GROUP BY DATE(created_at)

ORDER BY date;

-- Video Engagement Funnel

SELECT 

    v.video_id,

    v.title,

    COUNT(DISTINCT va.user_id) as impressions,

    COUNT(DISTINCT CASE WHEN va.watch_time > 3 THEN va.user_id END) as viewers_3s,

    COUNT(DISTINCT CASE WHEN va.watch_time > 10 THEN va.user_id END) as viewers_10s,

    COUNT(DISTINCT CASE WHEN va.completion_rate > 0.9 THEN va.user_id END) as completions,

    COUNT(DISTINCT vc.user_id) as product_clicks,

    COUNT(DISTINCT vo.user_id) as conversions,

    SUM(vo.revenue) as revenue_generated

FROM videos v

LEFT JOIN video_analytics va ON v.video_id = va.video_id

LEFT JOIN video_product_clicks vc ON v.video_id = vc.video_id

LEFT JOIN video_orders vo ON v.video_id = vo.video_id

WHERE v.created_at >= NOW() - INTERVAL '7 days'

GROUP BY v.video_id, v.title

ORDER BY revenue_generated DESC;

-- Livestream Performance

SELECT 

    ls.stream_id,

    ls.title,

    ls.streamer_id,

    COUNT(DISTINCT lsv.user_id) as peak_viewers,

    AVG(lsv.duration_seconds) as avg_watch_time,

    COUNT(DISTINCT lc.user_id) as chatters,

    COUNT(lg.gift_id) as gifts_received,

    SUM(lg.value) as gift_revenue,

    COUNT(DISTINCT lpc.product_id) as products_showcased,

    SUM(lpc.conversions) as product_conversions,

    SUM(lpc.revenue) as product_revenue

FROM livestreams ls

LEFT JOIN livestream_viewers lsv ON ls.stream_id = lsv.stream_id

LEFT JOIN livestream_chat lc ON ls.stream_id = lc.stream_id

LEFT JOIN livestream_gifts lg ON ls.stream_id = lg.stream_id

LEFT JOIN livestream_product_conversions lpc ON ls.stream_id = lpc.stream_id

WHERE ls.ended_at >= NOW() - INTERVAL '30 days'

GROUP BY ls.stream_id, ls.title, ls.streamer_id

ORDER BY (gift_revenue + product_revenue) DESC;

-- Social Commerce Conversion Funnel

SELECT 

    DATE(created_at) as date,

    COUNT(*) as content_impressions,

    COUNT(DISTINCT CASE WHEN event_type = 'product_click' THEN user_id END) as product_clicks,

    COUNT(DISTINCT CASE WHEN event_type = 'add_to_cart' THEN user_id END) as add_to_cart,

    COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN user_id END) as purchases,

    SUM(CASE WHEN event_type = 'purchase' THEN revenue END) as revenue,

    ROUND(100.0 * COUNT(DISTINCT CASE WHEN event_type = 'product_click' THEN user_id END) / NULLIF(COUNT(*), 0), 2) as ctr_percent,

    ROUND(100.0 * COUNT(DISTINCT CASE WHEN event_type = 'purchase' THEN user_id END) / NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'product_click' THEN user_id END), 0), 2) as conversion_rate_percent

FROM content_events

WHERE created_at >= NOW() - INTERVAL '30 days'

GROUP BY DATE(created_at)

ORDER BY date;

________________________________________
📊 PHẦN 3: KHUYẾN NGHỊ CHIẾN LƯỢC & LỘ TRÌNH
3.1 ƯU TIÊN TRIỂN KHAI (ROADMAP)
Phase 1: MVP (Tháng 1-3)
•	 
Affiliate program cơ bản (link tracking, commission calculation)
•	 
Short video upload (15s-3min, basic editing)
•	 
Feed posts (text, images, product tags)
•	 
User profiles (basic showcase)
•	 
Content moderation (automated + manual review)

Budget: $150-200K
Team: 8-10 people (2 backend, 2 frontend, 1 mobile, 1 DevOps, 1 PM, 1 designer, 1 QA)
Phase 2: Scale (Tháng 4-6)
•	 
Livestreaming (RTMP ingest, HLS playback)
•	 
Real-time chat & reactions
•	 
Virtual gifts & monetization
•	 
Advanced analytics dashboard
•	 
AI-powered recommendations
•	 
Mobile apps (iOS/Android)

Budget: $300-400K
Team: 15-20 people (add 2 mobile, 2 data scientists, 1 ML engineer, 1 content moderator lead)
Phase 3: Optimize (Tháng 7-12)
•	 
Co-hosting, multi-streamer
•	 
Flash sales, auctions
•	 
AR try-on (virtual fitting)
•	 
Advanced fraud detection
•	 
International expansion (SEA markets)
•	 
API marketplace (3rd party integrations)

Budget: $500-700K
Team: 25-30 people (add 3 backend, 2 ML engineers, 1 security engineer, 1 partnerships manager)

________________________________________
3.2 RỦI RO & GIẢM THIỂU
Rủi ro	Mức độ	Biện pháp
Content moderation failure	Cao	Multi-layer moderation (AI + human), 24/7 response team, clear TOS
Copyright infringement	Cao	Automated detection (Content ID), DMCA takedown process, user education
Fraud (fake engagement)	Trung bình-Cao	Device fingerprinting, behavioral analysis, manual audits
Scalability issues	Trung bình	Load testing, auto-scaling, CDN optimization, database sharding
Regulatory compliance	Cao	Legal counsel review, DPO appointment, regular audits, data localization
Competition (TikTok, Facebook)	Cao	Differentiate with anti-counterfeit focus, verified sellers, escrow protection
Monetization challenges	Trung bình	Diversify revenue (commissions, gifts, ads, premium features)

________________________________________
3.3 KPIs MỤC TIÊU (12 THÁNG)
Metric	Tháng 3	Tháng 6	Tháng 12
Users			
MAU	50K	200K	500K
DAU	10K	50K	150K
DAU/MAU ratio	20%	25%	30%
Content			
Videos uploaded/month	5K	25K	100K
Livestreams/month	100	1K	5K
Posts/day	1K	5K	20K
Engagement			
Avg. session duration	5 min	8 min	12 min
Video completion rate	30%	40%	50%
Comments per post	2	5	10
Commerce			
Product tag CTR	1%	2%	3%
Conversion rate	0.5%	1%	2%
GMV from social	$100K	$500K	$2M
Revenue			
Affiliate commission	$5K	$25K	$100K
Virtual gifts	$2K	$15K	$80K
Total revenue	$7K	$40K	$180K

________________________________________
📜 KẾT LUẬN & KHUYẾN NGHỊ
Đầu tư cần thiết:
1.	Nhân sự: 25-30 people (engineering, product, design, content moderation, partnerships)
2.	Hạ tầng: $30-50K/month (scale với usage)
3.	Marketing: $100-200K (user acquisition, influencer partnerships)
4.	Pháp lý: $50-100K (compliance, legal counsel, DPO, audits)
ROI kỳ vọng:
•	Break-even: 18-24 tháng
•	LTV/CAC ratio: Target ≥ 3x
•	Payback period: 12-15 tháng
Critical Success Factors:
✅ Differentiation: Anti-counterfeit positioning (unique value prop)
✅ Trust: Verified sellers, escrow protection, QR traceability
✅ Content Quality: Curated creators, moderation standards
✅ User Experience: Seamless shopping (1-click purchase, low friction)
✅ Community: Engaged users, social proof, UGC incentives
✅ Technology: Scalable infrastructure, low latency, high availability

________________________________________

Tuyên bố miễn trừ: Phân tích này dựa trên dữ liệu thị trường 2025-2026, benchmark ngành, và giả định vận hành. Kết quả thực tế có thể khác biệt do biến động vĩ mô, thay đổi chính sách, cạnh tranh, và khả năng thực thi. Khuyến nghị tham vấn chuyên gia pháp lý, kiểm toán độc lập trước khi ra quyết định đầu tư.

________________________________________

Báo cáo được xây dựng theo chuẩn phân tích đầu tư CFA, kết hợp với thực tiễn thị trường TMĐT Việt Nam và yêu cầu tuân thủ pháp lý hiện hành.

