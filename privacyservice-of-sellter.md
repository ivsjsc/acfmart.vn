# 📜 ĐIỀU KHOẢN SỬ DỤNG DÀNH CHO NGƯỜI BÁN
## Sàn Thương Mại Điện Tử Chống Hàng Giả ACF
*(Ban hành kèm Quyết định nội bộ số …/QĐ-ACF ngày …/…/2026 của IVS JSC)*

> **Hiệu lực:** Kể từ ngày Người bán nhấp chọn "Tôi đồng ý" trong Seller Center hoặc thực hiện niêm yết sản phẩm đầu tiên trên hệ thống ACF.

---

## I. ĐỊNH NGHĨA & GIẢI THÍCH TỪ NGỮ

| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| **Sàn ACF** | Nền tảng TMĐT chuyên biệt chống hàng giả, vận hành bởi **IVS JSC**, tích hợp 3 trụ cột: Marketplace – Logistics – Escrow. |
| **Người bán (Seller)** | Thương nhân/tổ chức/cá nhân đã hoàn tất xác thực VNeID Mức 2, ký hợp đồng điện tử và niêm yết hàng hóa trên Sàn ACF. |
| **Seller Pro/Mall** | Phân hạng Người bán đạt tiêu chuẩn cao: có thương hiệu, giấy phép phân phối chính hãng, cam kết tỷ lệ hàng giả <0.1%. |
| **Mã QR ACF** | Mã định danh duy nhất do hệ thống ACF cấp, gắn với từng SKU, cho phép truy xuất nguồn gốc và xác minh tính chính hãng qua Blockchain. |
| **Cơ chế Escrow** | Phương thức thanh toán ký quỹ: tiền của Người mua được giữ tại tài khoản ngân hàng đối tác (được NHNN cấp phép), chỉ giải ngân cho Người bán khi Người mua xác nhận "Đã nhận đúng hàng". |
| **QR Checkpoint** | Quy trình 5 bước quét mã bắt buộc trong hành trình logistics: (1) Xuất kho → (2) Pickup → (3) Kiểm định Hub → (4) Giao hàng → (5) Xác nhận bởi Buyer. |
| **Hàng giả/Hàng nhái** | Sản phẩm vi phạm Nghị định 98/2020/NĐ-CP, bao gồm: giả hình thức, chất lượng, nguồn gốc, nhãn hiệu, hoặc không đúng mô tả niêm yết. |
| **Affiliate** | Cá nhân/tổ chức tiếp thị sản phẩm của Người bán thông qua link tracking, nhận hoa hồng khi phát sinh giao dịch thành công. |

---

## II. PHẠM VI ÁP DỤNG & CHẤP THUẬN

1. Điều khoản này điều chỉnh quyền, nghĩa vụ của Người bán khi: đăng ký tài khoản, niêm yết sản phẩm, xử lý đơn hàng, tham gia chương trình khuyến mãi/affiliate, và giải quyết khiếu nại trên Sàn ACF.

2. Việc hoàn tất đăng ký Seller Center, tải lên giấy phép kinh doanh, hoặc nhấp nút "Đăng sản phẩm" được xem là sự **chấp thuận đầy đủ và không điều kiện** đối với bản Điều khoản này, theo đúng quy định về hợp đồng điện tử tại Luật Giao dịch điện tử 2023.

3. Sàn ACF có quyền sửa đổi Điều khoản này. Thay đổi sẽ được thông báo trước **15 ngày** qua email đăng ký và thông báo trong Seller Center. Việc tiếp tục sử dụng dịch vụ sau thời hạn thông báo được xem là đồng ý với phiên bản mới.

---

## III. ĐĂNG KÝ TÀI KHOẢN & XÁC THỰC DANH TÍNH

### 3.1 Điều kiện đăng ký
- **Cá nhân kinh doanh**: Từ 18 tuổi trở lên, có CCCD/CMND hợp lệ, đã xác thực VNeID Mức 2.
- **Tổ chức/Doanh nghiệp**: Có Giấy phép đăng ký kinh doanh còn hiệu lực, người đại diện pháp luật đã xác thực VNeID Mức 2.
- **Ngành hàng đặc thù** (dược mỹ phẩm, TPCN, thiết bị y tế, hàng hiệu): Phải cung cấp thêm giấy chứng nhận lưu hành, giấy ủy quyền phân phối, hoặc chứng từ nhập khẩu hợp pháp.

### 3.2 Quy trình xác thực 3 lớp (ACF Verification Standard)
```
Lớp 1: Xác thực danh tính điện tử
├─ VNeID L2 API integration
├─ So khớp khuôn mặt + CCCD
└─ Kết quả: < 5 phút

Lớp 2: Xác thực pháp lý
├─ OCR giấy phép kinh doanh + chữ ký số
├─ Kiểm tra mã số thuế trên hệ thống Tổng cục Thuế
└─ Kết quả: 24–48 giờ làm việc

Lớp 3: Audit ngẫu nhiên (Random Audit)
├─ Phỏng vấn video với đại diện seller
├─ Yêu cầu mẫu sản phẩm + chứng từ nguồn gốc
└─ Tần suất: 10–20% seller mới, 2–5% seller hiện hữu
```

### 3.3 Trách nhiệm bảo mật tài khoản
- Người bán cam kết bảo mật thông tin đăng nhập Seller Center, API Key, và chữ ký số.
- Mọi hoạt động phát sinh từ tài khoản được xem là do Người bán thực hiện, trừ khi chứng minh được hệ thống ACF bị xâm nhập trái phép có xác nhận từ DPO ACF.
- ACF có quyền tạm khóa tài khoản nếu phát hiện hành vi đăng nhập bất thường (IP lạ, device mới) để bảo vệ.

---

## IV. NIÊM YẾT SẢN PHẨM & KIỂM DUYỆT NỘI DUNG

### 4.1 Yêu cầu bắt buộc khi đăng sản phẩm
✅ **Thông tin sản phẩm**: Tên, mô tả, thông số kỹ thuật, hình ảnh/video thực tế, giá niêm yết (đã bao gồm VAT nếu áp dụng).  
✅ **Chứng từ nguồn gốc**: Hóa đơn nhập khẩu, giấy ủy quyền phân phối, công bố chất lượng (tùy ngành hàng).  
✅ **Phân loại ngành hàng**: Chọn đúng danh mục để áp dụng chính sách hoa hồng, logistics và kiểm duyệt phù hợp.  
✅ **Cam kết chống hàng giả**: Tick xác nhận "Sản phẩm này là chính hãng, đúng mô tả, sẵn sàng chịu chế tài nếu vi phạm".

### 4.2 Cơ chế kiểm duyệt AI + Human-in-the-loop
| Bước | Mô tả | SLA |
|------|-------|-----|
| **AI Scan (Automated)** | Gemini/Claude API quét caption, hình ảnh, video: phát hiện từ khóa nhạy cảm, sai công dụng, hình ảnh vi phạm bản quyền | < 30 giây |
| **Moderator Review** | Đội ngũ kiểm duyệt ACF xem xét sản phẩm flagged bởi AI hoặc thuộc ngành nhạy cảm | < 4 giờ làm việc |
| **QR Assignment** | Sản phẩm được duyệt → Hệ thống cấp mã QR ACF độc bản, gắn vào ledger blockchain | Tự động |
| **Publish** | Sản phẩm hiển thị trên Marketplace, sẵn sàng cho buyer tìm kiếm và affiliate gắn link | Immediate |

### 4.3 Hành vi bị nghiêm cấm khi niêm yết
❌ Đăng sản phẩm giả, nhái, không rõ nguồn gốc, hoặc vi phạm sở hữu trí tuệ.  
❌ Sử dụng hình ảnh/logo thương hiệu khi không có ủy quyền hợp pháp.  
❌ Mô tả sai công dụng, thổi phồng hiệu quả (đặc biệt với ngành sức khỏe, mỹ phẩm).  
❌ Đăng cùng 1 SKU với nhiều mức giá khác nhau để thao túng thuật toán.  
❌ Tạo sản phẩm "ảo" để hút traffic, không có khả năng giao hàng.

> ⚠️ **Chế tài**: Vi phạm lần 1 → Cảnh báo + gỡ sản phẩm; Lần 2 → Khóa gian hàng 7–30 ngày + phạt 10–50% doanh thu đơn vi phạm; Lần 3 → Khóa vĩnh viễn + chuyển hồ sơ cho QLTT/Công an.

---

## V. GIÁ CẢ, HOA HỒNG AFFILIATE & THANH TOÁN ESCROW

### 5.1 Chính sách giá & phí sàn
- **Giá niêm yết**: Do Người bán tự quyết định, phải bao gồm VAT (trừ khi có thỏa thuận khác). ACF không can thiệp giá, nhưng có quyền đề xuất điều chỉnh nếu phát hiện cạnh tranh không lành mạnh.
- **Phí dịch vụ sàn (Take rate)**: 
  - Ngành hàng thông thường: **3–5%** trên GMV thành công.
  - Ngành hàng chiến lược (mỹ phẩm, TPCN, hàng hiệu): **5–8%** (bao gồm phí xác thực QR, bảo hiểm chống giả).
  - Seller Pro/Mall: Được ưu đãi phí theo thỏa thuận riêng.

### 5.2 Cơ chế Affiliate – Chia sẻ lợi nhuận linh hoạt
Người bán có thể **tùy chọn tham gia** chương trình Affiliate của ACF với cấu trúc hoa hồng phân tầng:

```
🔹 Theo giá trị đơn hàng:
• Đơn <500k: 3–5% hoa hồng cho Affiliate
• Đơn 500k–2 triệu: 5–8%
• Đơn >2 triệu: 8–12%

🔹 Theo cấp độ Affiliate:
• Cơ bản: 3–5% | Pro: 5–8% + bonus | Verified Creator: 8–12% + fixed fee

🔹 Bonus đặc biệt (Seller có thể kích hoạt):
• +2% nếu buyer quét QR xác thực thành công
• +1.5% nếu buyer là khách hàng mới (first-time)
• +1% nếu đơn thuộc ngành hàng chiến lược
```

> 💡 **Lưu ý**: Hoa hồng Affiliate được trừ vào doanh thu Người bán **chỉ khi đơn hàng thành công**. Người bán có thể điều chỉnh tỷ lệ hoa hồng theo từng sản phẩm trong Seller Center.

### 5.3 Thanh toán Escrow – Cơ chế giải ngân minh bạch
```
🔄 Quy trình dòng tiền:
1️⃣ Buyer thanh toán → Tiền giữ tại tài khoản Escrow (ngân hàng đối tác được NHNN cấp phép)
2️⃣ Seller giao hàng → Buyer nhận + quét QR xác thực thành công
3️⃣ Hệ thống kiểm tra: QR khớp? Buyer xác nhận? Không khiếu nại 24h?
4️⃣ Nếu ĐỦ điều kiện → Giải ngân tự động theo rule:
   • T+0: Seller Pro/Mall, đơn <2 triệu, buyer có lịch sử tốt
   • T+1: Seller thường, đơn đã có QR scan tại ≥3 checkpoint
   • T+3: Đơn giá trị cao, ngành nhạy cảm, hoặc buyer mới
5️⃣ Nếu KHÔNG đủ → Kích hoạt dispute, tiền vẫn được giữ an toàn
```

- **Phí xử lý Escrow**: Đã bao gồm trong Take rate, không thu thêm.
- **Sao kê & đối soát**: Seller có thể xuất báo cáo real-time trong Seller Center, đối chiếu với email xác nhận giải ngân hàng ngày.

---

## VI. XỬ LÝ ĐƠN HÀNG & TUÂN THỦ QR CHECKPOINT

### 6.1 Nghĩa vụ giao hàng của Người bán
- Đóng gói sản phẩm đúng tiêu chuẩn ACF: có tem niêm phong, ảnh đóng gói upload lên hệ thống.
- Bàn giao cho đơn vị vận chuyển (3PL tích hợp hoặc ACF Logistics) trong vòng **24 giờ** kể từ khi đơn được xác nhận.
- **Quét QR bắt buộc tại bước "Xuất kho"**: Seller phải quét mã QR ACF trên sản phẩm trước khi bàn giao cho shipper. Hành động này được ghi nhận trên blockchain và là điều kiện tiên quyết để kích hoạt giải ngân Escrow.

### 6.2 Quy trình QR Checkpoint 5 bước (Bắt buộc với mọi đơn hàng)
```
1️⃣ [Seller] Đóng gói → Quét QR "Xuất kho" + upload ảnh niêm phong
2️⃣ [Shipper] Nhận hàng → Quét QR "Pickup" + GPS timestamp
3️⃣ [Hub ACF] Kiểm định → Quét QR "Kiểm định" + xác nhận tình trạng
4️⃣ [Shipper] Giao hàng → Quét QR "Delivery" + OTP buyer
5️⃣ [Buyer] Nhận hàng → Quét QR "Xác nhận" → Kích hoạt giải ngân Escrow
```

> ⚠️ **Nếu bất kỳ checkpoint nào không khớp hoặc thiếu**: Hệ thống tự động flag incident, tạm khóa giải ngân, yêu cầu điều tra trong vòng 24h. Seller có thể bị phạt nếu lỗi thuộc về khâu đóng gói/bàn giao.

### 6.3 KPI giao hàng bắt buộc theo dõi
| Chỉ số | Mục tiêu Phase 1 | Tần suất | Hậu quả nếu không đạt |
|--------|-----------------|----------|---------------------|
| Tỷ lệ đơn giao đúng hạn | ≥90% | Daily | Cảnh báo → Giảm hiển thị sản phẩm |
| Tỷ lệ QR scan compliance | ≥95% checkpoint | Real-time | Khóa tính năng đăng sản phẩm mới |
| Tỷ lệ hàng hoàn/đổi do lỗi seller | ≤2% | Weekly | Phạt 5–10% doanh thu đơn vi phạm |
| Thời gian xử lý đơn trung bình | <24 giờ | Weekly | Hạ cấp hạng seller (Pro → Thường) |

---

## VII. CHÍNH SÁCH ĐỔI TRẢ, HOÀN TIỀN & TRÁCH NHIỆM VỚI HÀNG GIẢ

### 7.1 Nghĩa vụ của Người bán khi phát sinh đổi trả
- Tiếp nhận yêu cầu đổi trả từ hệ thống trong vòng **24 giờ**.
- Phối hợp với ACF Moderator để xác minh: cung cấp chứng từ, ảnh sản phẩm gốc, hoặc chấp nhận kết quả giám định độc lập.
- Chịu 100% phí vận chuyển 2 chiều nếu lỗi thuộc về: hàng giả, sai mô tả, giao nhầm, lỗi kỹ thuật.

### 7.2 Cơ chế bồi thường 200% – Trách nhiệm liên đới
Khi sản phẩm của Người bán được kết luận là **hàng giả** thông qua quy trình xác thực ACF (QR + Blockchain + Giám định độc lập):

```
✅ Người mua được:
• Hoàn tiền 100% qua Escrow
• Bồi thường thêm 100% từ "Quỹ Bảo vệ NTD ACF"
• Hỗ trợ pháp lý miễn phí nếu có thiệt hại sức khỏe/tài sản

⛔ Người bán phải chịu:
• Hoàn trả 100% giá trị đơn hàng cho Quỹ Bảo vệ NTD
• Phạt vi phạm hợp đồng: 200–500% giá trị đơn hàng (tùy mức độ)
• Khóa vĩnh viễn gian hàng, thu hồi toàn bộ hoa hồng chưa giải ngân
• Chuyển hồ sơ cho Quản lý thị trường/Công an để xử lý hình sự (nếu đủ yếu tố cấu thành tội phạm)
• Đưa vào "Danh sách đen liên sàn" – không được onboard lại trên các nền tảng đối tác của ACF
```

> 📌 **Lưu ý**: Chính sách 200% là cam kết riêng của ACF với người tiêu dùng. Trách nhiệm tài chính cuối cùng thuộc về Người bán vi phạm. ACF có quyền truy thu từ số dư tài khoản seller, hoặc khởi kiện dân sự nếu cần.

---

## VIII. QUYỀN & NGHĨA VỤ CỦA NGƯỜI BÁN

### ✅ Quyền lợi của Người bán
1. Được cung cấp dashboard real-time: theo dõi GMV, đơn hàng, hoa hồng affiliate, tỷ lệ chuyển đổi, CSAT.
2. Được bảo vệ bởi cơ chế Escrow: giảm thiểu rủi ro chargeback fraud, buyer "bomb hàng".
3. Được hỗ trợ pháp lý và kỹ thuật 24/7 qua kênh Seller Support.
4. Được tham gia các chương trình marketing, flash sale, livestream do ACF tổ chức (có/không phí tùy chiến dịch).
5. Được xuất dữ liệu giao dịch (đã ẩn danh buyer) để phục vụ báo cáo nội bộ, tuân thủ kế toán.

### 📌 Nghĩa vụ của Người bán
1. Cung cấp thông tin đăng ký, chứng từ nguồn gốc **trung thực, chính xác, đầy đủ**.
2. Niêm yết sản phẩm đúng mô tả, không vi phạm sở hữu trí tuệ, không quảng cáo sai công dụng.
3. Tuân thủ quy trình QR Checkpoint, đóng gói đúng chuẩn, bàn giao hàng đúng hạn.
4. Phối hợp giải quyết khiếu nại trong SLA quy định (≤48 giờ cho phản hồi đầu tiên).
5. Không tạo đơn ảo, tự mua hàng của mình, hoặc thao túng đánh giá/review.
6. Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân: không thu thập, sử dụng thông tin buyer ngoài mục đích giao dịch trên ACF.
7. Chịu trách nhiệm pháp lý về chất lượng, bảo hành, và nguồn gốc sản phẩm mình bán.

---

## IX. VAI TRÒ CỦA SÀN ACF & GIỚI HẠN TRÁCH NHIỆM

### 9.1 Vai trò trung gian công nghệ
- ACF đóng vai trò **nền tảng kết nối**, cung cấp hạ tầng kỹ thuật: marketplace, logistics orchestration, escrow payment, AI moderation, blockchain traceability.
- ACF **không trực tiếp** sản xuất, nhập khẩu, sở hữu, hoặc bán hàng hóa niêm yết trên sàn.
- Trách nhiệm về chất lượng, bảo hành, và nghĩa vụ với người tiêu dùng thuộc về **Người bán**.

### 9.2 Trường hợp ACF chịu trách nhiệm
ACF chỉ chịu trách nhiệm bồi thường khi có lỗi trực tiếp từ hệ thống:
- Lỗi bảo mật dẫn đến rò rỉ dữ liệu cá nhân của seller/buyer (vi phạm NĐ 13/2023).
- Lỗi thuật toán phân phối đơn dẫn đến thiệt hại tài chính có thể định lượng được.
- Không thực hiện nghĩa vụ kiểm duyệt theo cam kết (ví dụ: duyệt sản phẩm vi phạm rõ ràng mà AI đã flag).

### 9.3 Giới hạn bồi thường
- Trong mọi trường hợp, tổng mức bồi thường của ACF **không vượt quá giá trị đơn hàng phát sinh tranh chấp**, trừ khi có quy định pháp luật khác hoặc lỗi cố ý từ phía ACF.
- ACF miễn trừ trách nhiệm với thiệt hại phát sinh từ: lỗi thiết bị cá nhân của seller, đường truyền internet, bất khả kháng, hoặc việc seller bỏ qua cảnh báo hệ thống.

---

## X. BẢO VỆ DỮ LIỆU & TUÂN THỦ PHÁP LUẬT

### 10.1 Tuân thủ Nghị định 13/2023/NĐ-CP
- Dữ liệu cá nhân của Người bán (thông tin pháp lý, tài khoản ngân hàng, log giao dịch) được thu thập trên cơ sở **đồng ý rõ ràng** và **mục đích giới hạn**: xác thực danh tính, vận hành escrow, cấp QR, hỗ trợ khiếu nại.
- Người bán có quyền: truy cập, chỉnh sửa, xóa, chuyển dữ liệu, rút đồng ý, hoặc khiếu nại. Yêu cầu được xử lý trong vòng **07 ngày làm việc** qua email `dpo@ecommerceacf.web.app`.
- Dữ liệu được mã hóa **AES-256**, lưu trữ tại máy chủ đặt tại Việt Nam, tuân thủ nguyên tắc tối thiểu hóa (data minimization).

### 10.2 Lưu trữ chứng cứ điện tử
- Mọi log giao dịch, chấp thuận điều khoản, escrow, QR scan, và quyết định giải ngân được **băm SHA-256** và lưu trữ kép: (1) Firestore (Việt Nam) + (2) Blockchain Audit Layer (immutable log).
- Thời gian lưu trữ tối thiểu: **02 năm** theo Nghị định 98/2020/NĐ-CP, hoặc dài hơn theo yêu cầu của cơ quan nhà nước.

### 10.3 Xử lý sự cố dữ liệu
- Trường hợp xảy ra sự cố rò rỉ dữ liệu, ACF sẽ: (1) Thông báo cho Người bán trong vòng **24 giờ**; (2) Báo cáo Cục An ninh mạng & Cục Bảo vệ dữ liệu cá nhân trong vòng **72 giờ** theo NĐ 13/2023; (3) Hỗ trợ khắc phục hậu quả và pháp lý nếu cần.

---

## XI. THAM GIA CHƯƠNG TRÌNH AFFILIATE (TÙY CHỌN)

### 11.1 Cơ chế hoạt động
- Người bán có thể **bật/tắt** tính năng cho phép affiliate tiếp thị sản phẩm của mình trong Seller Center.
- Khi bật, sản phẩm sẽ xuất hiện trong "Affiliate Feed", cho phép creator gắn link tracking và nhận hoa hồng khi phát sinh đơn thành công.
- Người bán **không trực tiếp thanh toán** cho affiliate: ACF đóng vai trò trung gian tính toán, khấu trừ hoa hồng từ doanh thu seller, và giải ngân cho affiliate theo chu kỳ T+3/T+7.

### 11.2 Kiểm soát chất lượng affiliate
Để bảo vệ thương hiệu, Người bán có quyền:
- **Danh sách trắng/đen**: Chỉ cho phép affiliate cụ thể tiếp thị sản phẩm, hoặc chặn affiliate có lịch sử vi phạm.
- **Duyệt nội dung trước**: Yêu cầu affiliate gửi preview content (caption/video) trước khi đăng (áp dụng với sản phẩm giá trị cao).
- **Report vi phạm**: Báo cáo affiliate quảng cáo sai công dụng, nguồn gốc để ACF xử lý (cảnh báo, khóa tài khoản, thu hồi hoa hồng).

### 11.3 Dữ liệu & báo cáo
- Seller có thể theo dõi real-time trong dashboard: số click affiliate, tỷ lệ chuyển đổi, GMV theo từng creator, CAC ước tính.
- Dữ liệu được ẩn danh buyer để tuân thủ NĐ 13/2023, nhưng đủ chi tiết để tối ưu chiến lược marketing.

---

## XII. CHỈ SỐ HIỆU SUẤT & CHẾ TÀI VI PHẠM

### 12.1 KPI bắt buộc theo dõi (Seller Scorecard)
| Nhóm chỉ số | KPI cụ thể | Ngưỡng cảnh báo | Hậu quả nếu vi phạm |
|------------|-----------|----------------|-------------------|
| **Chất lượng sản phẩm** | Tỷ lệ hàng giả/nhái bị phát hiện | >0.1% tổng SKU | Khóa gian hàng + phạt tài chính |
| **Dịch vụ khách hàng** | Tỷ lệ phản hồi khiếu nại <48h | <90% | Hạ điểm uy tín, giảm hiển thị |
| **Giao hàng** | Tỷ lệ đơn giao đúng hạn | <85% | Phạt 1–2% doanh thu tuần vi phạm |
| **Tuân thủ QR** | Tỷ lệ checkpoint scan đầy đủ | <95% | Tạm khóa tính năng đăng sản phẩm mới |
| **Uy tín cộng đồng** | CSAT trung bình từ buyer | <4.0/5.0 | Yêu cầu cải thiện trong 30 ngày, không đạt → hạ hạng |

### 12.2 Cơ chế cảnh báo & xử lý vi phạm
```
🟡 Cảnh báo cấp 1 (Minor):
• Vi phạm lần đầu, mức độ nhẹ (ví dụ: mô tả chưa chuẩn)
• Hành động: Email cảnh báo + yêu cầu sửa trong 48h

🟠 Cảnh báo cấp 2 (Major):
• Tái phạm hoặc vi phạm mức độ trung bình (ví dụ: giao chậm nhiều đơn)
• Hành động: Khóa gian hàng 3–7 ngày + phạt 5–10% doanh thu đơn vi phạm

🔴 Xử lý nghiêm (Critical):
• Hàng giả, gian lận đơn ảo, vi phạm pháp luật
• Hành động: Khóa vĩnh viễn + phạt 200–500% + chuyển cơ quan chức năng
```

> 💡 Seller có quyền **khiếu nại quyết định xử lý** trong vòng 07 ngày qua kênh `legal@ecommerceacf.web.app`. ACF sẽ xem xét lại bởi Hội đồng Độc lập (gồm đại diện Legal, Compliance, và bên thứ 3 nếu cần).

---

## XIII. GIẢI QUYẾT TRANH CHẤP & PHÁP LUẬT ÁP DỤNG

1. **Ưu tiên hòa giải nội bộ**: Mọi tranh chấp giữa Seller và ACF, hoặc giữa Seller và Buyer, sẽ được ưu tiên giải quyết thông qua cơ chế hòa giải trên nền tảng ACF. Thời hạn hòa giải: **≤15 ngày**.

2. **Trọng tài/Tòa án**: Nếu không đạt thỏa thuận, tranh chấp sẽ được đưa ra:
   - (a) **Trung tâm Trọng tài Quốc tế Việt Nam (VIAC)**; hoặc
   - (b) **Tòa án nhân dân có thẩm quyền tại tỉnh Đồng Nai, Việt Nam**.

3. **Pháp luật áp dụng**: Pháp luật nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.

4. **Ngôn ngữ văn bản**: Tiếng Việt là ngôn ngữ chính thức có giá trị pháp lý cao nhất. Bản dịch sang ngôn ngữ khác (nếu có) chỉ mang tính tham khảo.

---

## XIV. CHẤM DỨT TÀI KHOẢN & HIỆU LỰC

### 14.1 Quyền chấm dứt của Người bán
- Người bán có quyền yêu cầu **khóa tạm thời** hoặc **xóa vĩnh viễn** tài khoản bất kỳ lúc nào qua Seller Center hoặc email hỗ trợ.
- Khi yêu cầu xóa tài khoản: (1) Dữ liệu giao dịch sẽ được **ẩn danh hóa** hoặc lưu trữ theo quy định pháp luật; (2) Các nghĩa vụ tài chính tồn đọng (phí sàn, phạt vi phạm) vẫn phải được thanh toán trước khi đóng tài khoản.

### 14.2 Quyền chấm dứt của ACF
ACF có quyền tạm khóa/vĩnh viễn khóa tài khoản Người bán nếu:
- Phát hiện hành vi gian lận, bán hàng giả, vi phạm nghiêm trọng Điều khoản này.
- Seller không hoạt động trong vòng **180 ngày** liên tiếp (có thông báo trước 30 ngày).
- Có yêu cầu bằng văn bản từ cơ quan nhà nước có thẩm quyền.

### 14.3 Hiệu lực sau chấm dứt
Điều khoản này vẫn có hiệu lực liên tục đối với các nghĩa vụ: bảo mật dữ liệu, bồi thường thiệt hại, giải quyết tranh chấp phát sinh trước thời điểm chấm dứt tài khoản.

---

## XV. THÔNG TIN LIÊN HỆ & HỖ TRỢ

| Kênh | Thông tin | Mục đích |
|------|----------|----------|
| **Tổng đài Seller Support** | 1900 066 689 (24/7) | Hỗ trợ kỹ thuật, xử lý đơn, khiếu nại nhanh |
| **Email vận hành** | `seller@ecommerceacf.web.app` | Tra cứu chính sách, yêu cầu xuất dữ liệu |
| **Email pháp lý & DPO** | `dpo@ecommerceacf.web.app` | Khiếu nại bảo mật, yêu cầu xóa dữ liệu, DPIA |
| **Cổng tra cứu minh bạch** | `https://verify.acf.market` | Kiểm tra trạng thái QR, escrow, audit log |
| **Trụ sở pháp lý** | [Điền địa chỉ IVS JSC] | Nhận văn bản pháp lý, công văn chính thức |

---

## XVI. CƠ CHẾ CHẤP THUẬN ĐIỆN TỬ

```markdown
☐ Tôi đã đọc, hiểu rõ và đồng ý toàn bộ nội dung Điều khoản Dịch vụ Người bán, 
  Chính sách Bảo mật Dữ liệu Cá nhân, và Quy chế Hoạt động Sàn ACF.

☐ Tôi cam kết thông tin đăng ký là trung thực, chịu trách nhiệm pháp lý về 
  chất lượng, nguồn gốc sản phẩm và giao dịch thực hiện từ tài khoản này.

☐ Tôi hiểu rằng Sàn ACF là nền tảng trung gian công nghệ, không trực tiếp bán hàng, 
  và cam kết tuân thủ cơ chế Escrow, QR Checkpoint, và chính sách chống hàng giả.

Thời gian chấp thuận: __ / __ / 2026  __ : __ : __ (UTC+7)
IP/Device ID: ________________________
Chữ ký điện tử: [HỆ THỐNG GHI NHẬN TỰ ĐỘNG – BĂM SHA-256]
```

---

## XVII. PHỤ LỤC THAM CHIẾU

1. [Chính sách Phí & Hoa hồng Chi tiết theo Ngành hàng]  
2. [Hướng dẫn Tích hợp API Seller Center & Webhook]  
3. [Quy trình Xác thực QR & Blockchain cho Người bán]  
4. [Biểu mẫu Khiếu nại & Tranh chấp Điện tử]  
5. [Danh mục Ngành hàng Bị Hạn chế & Yêu cầu Giấy phép Đặc thù]  

---

## XVIII. LƯU Ý PHÁP LÝ & TRIỂN KHAI KỸ THUẬT

| Hạng mục | Yêu cầu thực thi | Căn cứ pháp lý / Ghi chú |
|----------|-----------------|-------------------------|
| **Hình thức hợp đồng** | Bắt buộc checkbox đồng ý + log timestamp/IP trước khi kích hoạt nút "Đăng sản phẩm" | Điều 16 NĐ 52/2013; Điều 21 Luật GDĐT 2023 |
| **Cập nhật điều khoản** | Thông báo push/email trước 15 ngày; lưu version history để đối chiếu tranh chấp | NĐ 85/2021 về TMĐT |
| **Tích hợp Escrow UI** | Hiển thị rõ trạng thái "Tiền đang giữ tại ngân hàng đối tác [Tên NH]" trong Order Detail | TT 40/2024/NHNN về ví điện tử |
| **Tuân thủ NĐ 13/2023** | Cung cấp nút "Yêu cầu xóa dữ liệu" trong Seller Setting; tự động ẩn danh hóa sau 24 tháng | Điều 25–27 NĐ 13/2023 |
| **Lưu trữ chứng cứ** | Log chấp thuận, đơn hàng, escrow, QR scan được băm SHA-256, lưu Firestore + Blockchain Audit (≥ 2 năm) | NĐ 98/2020; NĐ 13/2023 |
| **Anti-fraud monitoring** | Hệ thống tự động flag: IP cluster, self-referral, behavior bất thường → yêu cầu xác minh bổ sung | Best practice + Risk engine nội bộ |
| **Dispute SLA tracking** | Dashboard nội bộ cảnh báo đỏ nếu yêu cầu >48h chưa có quyết định Moderator → auto-escalation | Quy chế nội bộ ACF |

---

> 📌 **Lưu ý triển khai**:  
> - Văn bản này cần được **ký số bởi đại diện pháp luật IVS JSC** trước khi ban hành.  
> - Bản PDF có chữ ký điện tử và mã QR xác thực sẽ được lưu trữ làm bản gốc pháp lý.  
> - Seller có quyền yêu cầu bản in có đóng dấu xác nhận tại trụ sở ACF.

---
*Trân trọng,*  
**Nguyễn Minh Triết**  
*Giám đốc Tăng trưởng & Vận hành Affiliate*  
**IVS JSC – Đơn vị vận hành Sàn ACF**  
*Ngày … tháng … năm 2026*