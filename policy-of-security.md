# 📜 CHÍNH SÁCH BẢO MẬT DỮ LIỆU CÁ NHÂN
## Sàn Thương Mại Điện Tử Chống Hàng Giả ACF
*(Ban hành kèm Quyết định nội bộ số …/QĐ-ACF ngày …/…/2026 của IVS JSC)*

> **Hiệu lực:** Áp dụng kể từ ngày công bố và được cập nhật định kỳ theo quy định pháp luật.  
> **Căn cứ pháp lý:** Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân; Luật An ninh mạng 2018; Luật Giao dịch điện tử 2023; Nghị định 52/2013/NĐ-CP & 85/2021/NĐ-CP về thương mại điện tử.

---

## I. ĐỊNH NGHĨA & PHẠM VI ÁP DỤNG

### 1.1 Thuật ngữ quan trọng
| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| **Dữ liệu cá nhân** | Thông tin dưới dạng ký hiệu, chữ viết, hình ảnh, âm thanh hoặc dạng điện tử gắn liền với một con người cụ thể hoặc giúp xác định một con người cụ thể (theo NĐ 13/2023). |
| **Dữ liệu cá nhân nhạy cảm** | Thông tin về quan điểm chính trị, tôn giáo, sức khỏe, đời sống tình dục, dữ liệu sinh trắc học, dữ liệu di truyền, dữ liệu về vị trí, dữ liệu tài chính. |
| **Chủ thể dữ liệu** | Cá nhân được xác định hoặc có thể xác định được thông qua dữ liệu cá nhân (Người mua, Người bán, Affiliate, nhân sự vận hành). |
| **Bên Kiểm soát & Xử lý dữ liệu** | IVS JSC – đơn vị vận hành Sàn ACF, quyết định mục đích và phương tiện xử lý dữ liệu. |
| **Bên thứ ba được ủy quyền** | Ngân hàng đối tác (Escrow), đơn vị vận chuyển (3PL), nhà cung cấp AI/cloud, cơ quan nhà nước có thẩm quyền. |

### 1.2 Phạm vi áp dụng
Chính sách này áp dụng cho mọi hoạt động thu thập, lưu trữ, sử dụng, xử lý và chia sẻ dữ liệu cá nhân phát sinh trên:
- Ứng dụng di động ACF (iOS/Android) và website `acf.market`
- Seller Center, Affiliate Dashboard, Admin Portal
- Hệ thống logistics, Escrow, QR Checkpoint và Blockchain Audit
- Kênh hỗ trợ khách hàng: Hotline, email, chatbot, mạng xã hội chính thức

---

## II. MỤC ĐÍCH THU THẬP & XỬ LÝ DỮ LIỆU

ACF thu thập và xử lý dữ liệu cá nhân **chỉ khi có sự đồng ý rõ ràng** của Chủ thể dữ liệu, nhằm các mục đích hợp pháp sau:

| Mục đích | Loại dữ liệu thu thập | Căn cứ pháp lý |
|----------|----------------------|---------------|
| **Xác thực danh tính (KYC)** | Họ tên, CCCD/CMND, VNeID L2, khuôn mặt, số điện thoại, email | Điều 17 NĐ 13/2023; NĐ 52/2013 về TMĐT |
| **Vận hành giao dịch Escrow** | Thông tin tài khoản ngân hàng, lịch sử thanh toán, địa chỉ giao hàng | Hợp đồng điện tử; TT 40/2024/NHNN |
| **Cấp & xác thực mã QR ACF** | Dữ liệu sản phẩm, hành trình logistics, GPS timestamp, ảnh niêm phong | NĐ 98/2020 về quản lý hàng giả |
| **Hỗ trợ khiếu nại & giải quyết tranh chấp** | Ảnh/video bằng chứng, nội dung chat, log giao dịch, kết quả giám định | Luật Bảo vệ quyền lợi NTD 2023 |
| **Phòng chống gian lận & rửa tiền** | IP address, device fingerprint, behavior pattern, scoring rủi ro | Luật Phòng chống rửa tiền 2022 |
| **Cải thiện trải nghiệm & AI recommendation** | Lịch sử tìm kiếm, lượt xem, đánh giá, cohort hành vi (đã ẩn danh) | Đồng ý tự nguyện; nguyên tắc tối thiểu hóa |
| **Tuân thủ nghĩa vụ báo cáo cơ quan nhà nước** | Dữ liệu giao dịch, log audit, báo cáo DPIA khi có yêu cầu bằng văn bản | Luật An ninh mạng; NĐ 13/2023 Điều 26 |

> ⚠️ **Nguyên tắc xử lý:** ACF cam kết tuân thủ 5 nguyên tắc cốt lõi của NĐ 13/2023: (1) Minh bạch; (2) Mục đích giới hạn; (3) Tối thiểu hóa; (4) Chính xác; (5) Bảo mật & toàn vẹn.

---

## III. LOẠI DỮ LIỆU THU THẬP

### 3.1 Dữ liệu do Chủ thể cung cấp trực tiếp
```
👤 Thông tin định danh:
• Họ tên, ngày sinh, giới tính
• Số CCCD/CMND, mã số thuế (với seller/doanh nghiệp)
• Ảnh chân dung, video xác thực khuôn mặt (qua VNeID API)

📍 Thông tin liên hệ & giao hàng:
• Số điện thoại, email chính
• Địa chỉ thường trú, địa chỉ giao hàng (tỉnh/thành, quận/huyện, xã/phường, số nhà)

💳 Thông tin tài chính:
• Số tài khoản ngân hàng, tên ngân hàng, chi nhánh
• Lịch sử giao dịch Escrow (chỉ lưu mã tham chiếu, không lưu số thẻ đầy đủ)

📦 Thông tin giao dịch:
• Đơn hàng, sản phẩm đã mua, giá trị, thời gian
• Kết quả quét QR, checkpoint logistics, xác nhận nhận hàng
```

### 3.2 Dữ liệu tự động thu thập (Passive Collection)
| Loại dữ liệu | Công nghệ thu thập | Mục đích sử dụng |
|--------------|-------------------|-----------------|
| **Device & Network** | IP address, User-Agent, OS version, screen resolution | Fraud detection, analytics, responsive UI |
| **Behavioral Log** | Clickstream, session duration, search query, cart abandonment | Tối ưu UX, AI recommendation, cohort analysis |
| **Location (approximate)** | IP geolocation, GPS (chỉ khi người dùng bật & đồng ý) | Tính cước vận chuyển, gợi ý kho gần nhất |
| **Cookie & Tracking ID** | First-party cookie, affiliate tracking token | Duy trì session, attribution hoa hồng |

> 🔐 **Lưu ý:** ACF **không** thu thập: mật khẩu thẻ tín dụng đầy đủ (chỉ dùng token hóa qua Payment Gateway), dữ liệu sinh trắc học ngoài khuôn mặt phục vụ eKYC, hoặc nội dung tin nhắn cá nhân ngoài nền tảng.

---

## IV. CƠ CHẾ ĐỒNG Ý & RÚT LẠI ĐỒNG Ý

### 4.1 Đồng ý rõ ràng (Explicit Consent)
- Mọi lần thu thập dữ liệu cá nhân đều được thực hiện sau khi Chủ thể dữ liệu **chủ động tick checkbox** hoặc **nhấp nút xác nhận** với nội dung rõ ràng về: loại dữ liệu, mục đích, thời gian lưu trữ, bên thứ ba tiếp cận.
- Ví dụ tại Checkout:
  ```
  ☐ Tôi đồng ý cho ACF thu thập và xử lý thông tin giao hàng, thanh toán 
    nhằm mục đích: (1) Vận chuyển đơn hàng; (2) Kích hoạt Escrow; 
    (3) Hỗ trợ đổi trả nếu phát sinh. 
    [Xem chi tiết Chính sách Bảo mật]
  ```

### 4.2 Quyền rút lại đồng ý
Chủ thể dữ liệu có quyền rút lại đồng ý bất kỳ lúc nào bằng cách:
1. Vào **Cài đặt tài khoản → Quyền riêng tư → Quản lý đồng ý**
2. Gửi yêu cầu qua email `dpo@ecommerceacf.web.app` với tiêu đề "[RÚT ĐỒNG Ý] + [Số điện thoại/Email đăng ký]"
3. Gọi hotline 1900 066 689 và yêu cầu kết nối bộ phận DPO

> ⏱️ **Thời hạn xử lý:** ACF cam kết xử lý yêu cầu rút đồng ý trong vòng **07 ngày làm việc**. Việc rút đồng ý không ảnh hưởng đến tính hợp pháp của hoạt động xử lý đã thực hiện trước thời điểm rút.

### 4.3 Trường hợp không cần đồng ý
Theo Điều 17 NĐ 13/2023, ACF có thể xử lý dữ liệu mà không cần đồng ý trong các trường hợp:
- Để thực hiện nghĩa vụ theo hợp đồng đã ký với Chủ thể dữ liệu
- Để bảo vệ tính mạng, sức khỏe của Chủ thể dữ liệu hoặc người khác trong tình huống khẩn cấp
- Để thực hiện nghĩa vụ pháp lý theo yêu cầu của cơ quan nhà nước có thẩm quyền (bằng văn bản)
- Dữ liệu đã được công khai hợp pháp hoặc Chủ thể dữ liệu tự nguyện công khai

---

## V. CHIA SẺ & CHUYỂN GIAO DỮ LIỆU

### 5.1 Bên thứ ba được chia sẻ dữ liệu
ACF chỉ chia sẻ dữ liệu cá nhân với bên thứ ba khi: (1) Có sự đồng ý của Chủ thể; hoặc (2) Cần thiết để thực hiện dịch vụ đã cam kết; hoặc (3) Theo yêu cầu pháp luật.

| Bên tiếp nhận | Loại dữ liệu chia sẻ | Mục đích | Biện pháp bảo vệ |
|--------------|---------------------|----------|-----------------|
| **Ngân hàng đối tác (Escrow)** | Họ tên, số TK, giá trị giao dịch, mã đơn hàng | Giữ tiền ký quỹ, giải ngân, đối soát | Hợp đồng bảo mật; mã hóa TLS 1.3; audit định kỳ |
| **Đơn vị vận chuyển (GHN/GHTK/Viettel Post)** | Tên, SĐT, địa chỉ giao hàng, ghi chú đơn | Giao nhận, cập nhật trạng thái logistics | API giới hạn scope; log truy cập; DPA ký kết |
| **Nhà cung cấp Cloud/AI (Google Cloud, Gemini API)** | Dữ liệu đã ẩn danh/mã hóa cho AI moderation, analytics | Kiểm duyệt nội dung, gợi ý sản phẩm | Data Processing Agreement; vùng lưu trữ Singapore/VN; encryption at rest |
| **Cơ quan nhà nước (QLTT, C06, NHNN, Bộ Công Thương)** | Dữ liệu giao dịch, log audit, báo cáo DPIA | Thanh tra, điều tra vi phạm, giám sát tuân thủ | Chỉ cung cấp khi có văn bản yêu cầu hợp lệ; ghi nhận log xuất dữ liệu |
| **Đối tác Affiliate (chỉ khi Seller bật tính năng)** | Dữ liệu hiệu suất campaign (đã aggregate & ẩn danh buyer) | Tính hoa hồng, báo cáo ROI cho Seller | Không chia sẻ PII của buyer; giới hạn access theo role |

### 5.2 Chuyển dữ liệu ra nước ngoài
- Dữ liệu cá nhân của người dùng Việt Nam **ưu tiên lưu trữ tại máy chủ đặt trong lãnh thổ Việt Nam** (Firestore region: `asia-southeast1` – Singapore chỉ dùng cho backup disaster recovery).
- Trường hợp bắt buộc chuyển ra nước ngoài (ví dụ: AI API, cloud provider), ACF cam kết:
  1. Đánh giá tác động bảo vệ dữ liệu (DPIA) trước khi chuyển
  2. Ký kết Standard Contractual Clauses (SCC) hoặc cơ chế tương đương
  3. Thông báo cho Chủ thể dữ liệu về quốc gia tiếp nhận và biện pháp bảo vệ
  4. Báo cáo Cục Bảo vệ dữ liệu cá nhân theo Điều 26 NĐ 13/2023 nếu thuộc trường hợp bắt buộc

---

## VI. BIỆN PHÁP BẢO MẬT KỸ THUẬT & TỔ CHỨC

### 6.1 Bảo mật kỹ thuật (Technical Safeguards)
```
🔐 Mã hóa dữ liệu:
• Dữ liệu nhạy cảm (PII, tài chính): AES-256 at rest + TLS 1.3 in transit
• Mật khẩu: Băm bcrypt với salt ngẫu nhiên, không lưu plaintext
• API key, token: Quản lý qua HashiCorp Vault, rotation 90 ngày

🛡️ Kiểm soát truy cập:
• Nguyên tắc least-privilege: Nhân sự chỉ truy cập dữ liệu cần cho công việc
• Multi-factor authentication (MFA) bắt buộc với admin, DPO, finance role
• Session timeout 15 phút với thiết bị không tin cậy

🔍 Giám sát & phát hiện xâm nhập:
• SIEM (Security Information & Event Management) real-time alert
• WAF (Web Application Firewall) chặn SQLi, XSS, DDoS
• Immutable audit log: Mọi thao tác với PII được log + băm SHA-256 lên Blockchain Audit

🧪 Kiểm định định kỳ:
• Penetration test 6 tháng/lần bởi bên thứ 3 độc lập (certified OSCP/CISSP)
• Vulnerability scan hàng tuần với OWASP ZAP/Burp Suite
• Red team exercise 1 lần/năm cho hệ thống Escrow & KYC
```

### 6.2 Bảo mật tổ chức (Organizational Safeguards)
| Biện pháp | Mô tả | Tần suất |
|-----------|-------|----------|
| **Đào tạo nhận thức bảo mật** | Tất cả nhân sự mới phải hoàn thành module "Data Privacy 101" trước khi truy cập hệ thống | Onboarding + refresh 6 tháng/lần |
| **Chính sách phân quyền RACI** | Ma trận RACI rõ ràng cho từng hoạt động xử lý dữ liệu; chỉ 1 người Accountable | Cập nhật khi có thay đổi quy trình |
| **Quy trình xử lý sự cố (Incident Response)** | War Room ảo kích hoạt trong 15 phút; báo cáo DPO + cơ quan chức năng trong 72h | Diễn tập 2 lần/năm |
| **Kiểm toán nội bộ** | Đánh giá tuân thủ NĐ 13/2023, chính sách nội bộ, hợp đồng với bên thứ ba | Hàng quý, báo cáo HĐQT |
| **Thỏa thuận bảo mật (NDA)** | Tất cả nhân sự, cộng tác viên, đối tác kỹ thuật phải ký NDA trước khi tiếp cận dữ liệu | Bắt buộc trước onboarding |

---

## VII. THỜI GIAN LƯU TRỮ & XÓA DỮ LIỆU

### 7.1 Thời gian lưu trữ tối thiểu
| Loại dữ liệu | Thời gian lưu trữ | Căn cứ pháp lý |
|--------------|------------------|---------------|
| Log giao dịch Escrow, đơn hàng | ≥ 02 năm | NĐ 98/2020 Điều 15 |
| Dữ liệu KYC (CCCD, VNeID) | ≥ 05 năm kể từ khi tài khoản đóng | NĐ 13/2023 Điều 21 |
| Audit log bảo mật, truy cập PII | ≥ 02 năm | Luật An ninh mạng Điều 26 |
| Dữ liệu phục vụ khiếu nại, tranh chấp | Đến khi kết thúc giải quyết + 01 năm | Luật Tố tụng dân sự 2015 |
| Cookie, behavioral log (đã ẩn danh) | 13 tháng (theo best practice) | Nguyên tắc tối thiểu hóa |

### 7.2 Quyền yêu cầu xóa dữ liệu (Right to Erasure)
Chủ thể dữ liệu có quyền yêu cầu xóa dữ liệu cá nhân khi:
- Dữ liệu không còn cần thiết cho mục đích đã thu thập
- Rút lại đồng ý và không có căn cứ pháp lý khác để tiếp tục xử lý
- Dữ liệu được xử lý trái pháp luật

**Cách thực hiện:**
1. Đăng nhập Seller/Buyer Center → Cài đặt → "Yêu cầu xóa dữ liệu"
2. Gửi email xác thực đến `dpo@ecommerceacf.web.app`
3. ACF xác minh danh tính trong 03 ngày làm việc → Xử lý trong 07 ngày làm việc

> ⚠️ **Ngoại lệ:** ACF có quyền từ chối xóa nếu dữ liệu cần thiết cho: (1) Thực hiện nghĩa vụ pháp lý; (2) Giải quyết tranh chấp đang diễn ra; (3) Bảo vệ quyền lợi hợp pháp của ACF hoặc bên thứ ba.

### 7.3 Ẩn danh hóa & Giả danh hóa
- Sau thời gian lưu trữ tối thiểu, dữ liệu cá nhân sẽ được **ẩn danh hóa (anonymization)** hoặc **giả danh hóa (pseudonymization)** trước khi dùng cho mục đích nghiên cứu, AI training.
- Kỹ thuật áp dụng: Tokenization, k-anonymity, differential privacy cho dataset analytics.

---

## VIII. QUYỀN CỦA CHỦ THỂ DỮ LIỆU

Theo Điều 25–27 Nghị định 13/2023/NĐ-CP, Chủ thể dữ liệu có các quyền sau:

| Quyền | Cách thực hiện trên ACF | Thời hạn phản hồi |
|-------|------------------------|------------------|
| **Quyền được biết** | Xem "Trung tâm minh bạch" trong App: loại dữ liệu thu thập, mục đích, bên chia sẻ | Real-time |
| **Quyền truy cập** | Xuất bản sao dữ liệu cá nhân (machine-readable format: JSON/CSV) qua Setting | ≤ 07 ngày làm việc |
| **Quyền chỉnh sửa** | Cập nhật thông tin cá nhân trực tiếp trong Profile; yêu cầu DPO hỗ trợ với dữ liệu hệ thống | ≤ 03 ngày làm việc |
| **Quyền xóa** | Như Mục 7.2 | ≤ 07 ngày làm việc |
| **Quyền hạn chế xử lý** | Tạm khóa tài khoản → dừng xử lý dữ liệu mới, vẫn lưu trữ theo pháp luật | Immediate + xác nhận 24h |
| **Quyền chuyển dữ liệu** | Yêu cầu xuất dữ liệu sang nền tảng khác (portability) qua email DPO | ≤ 15 ngày làm việc |
| **Quyền phản đối** | Từ chối xử lý cho mục đích marketing, profiling qua Preference Center | ≤ 03 ngày làm việc |
| **Quyền không bị quyết định tự động** | Yêu cầu xem xét lại quyết định AI (ví dụ: fraud flag, credit scoring) bởi con người | ≤ 05 ngày làm việc |
| **Quyền khiếu nại** | Gửi khiếu nại đến DPO ACF → Cục Bảo vệ dữ liệu cá nhân → Tòa án | Theo luật định |

> 📬 **Kênh liên hệ DPO:**  
> - Email: `dpo@ecommerceacf.web.app`  
> - Hotline: 1900 066 689 (nhánh 3 – Pháp lý & Bảo mật)  
> - Địa chỉ: [Trụ sở IVS JSC]  
> - Form online: `acf.market/privacy-request`

---

## IX. XỬ LÝ SỰ CỐ RÒ RỈ DỮ LIỆU

### 9.1 Quy trình ứng phó sự cố (Incident Response)
```
🚨 Bước 1: Phát hiện & Cô lập (0–1 giờ)
• Hệ thống SIEM alert / Báo cáo từ user / Audit log bất thường
• Cô lập hệ thống bị ảnh hưởng, khóa tài khoản nghi ngờ

🔍 Bước 2: Đánh giá & Phân loại (1–4 giờ)
• Xác định loại dữ liệu bị ảnh hưởng, số lượng chủ thể, nguyên nhân
• Phân loại mức độ: Low / Medium / High / Critical theo DPIA framework

📢 Bước 3: Thông báo (trong 72 giờ theo NĐ 13/2023)
• Với Chủ thể dữ liệu: Email/SMS thông báo sự cố, loại dữ liệu, biện pháp khắc phục, kênh hỗ trợ
• Với Cục Bảo vệ dữ liệu cá nhân: Báo cáo bằng văn bản điện tử qua cổng dịch vụ công
• Với HĐQT & cơ quan chức năng liên quan (nếu Critical)

🛠️ Bước 4: Khắc phục & Phòng ngừa (7–30 ngày)
• Sửa lỗ hổng kỹ thuật, cập nhật policy, đào tạo lại nhân sự
• Rà soát toàn hệ thống, pen-test bổ sung
• Cập nhật DPIA và báo cáo kết quả cho cơ quan quản lý

📋 Bước 5: Tổng kết & Lưu trữ (sau 30 ngày)
• Báo cáo sự cố chi tiết, bài học kinh nghiệm, kế hoạch cải tiến
• Lưu trữ hồ sơ sự cố ≥ 05 năm để phục vụ thanh tra, kiểm toán
```

### 9.2 Cam kết bồi thường
- Trong trường hợp rò rỉ dữ liệu do lỗi bảo mật của ACF (đã được xác định bởi cơ quan có thẩm quyền hoặc bên giám định độc lập), ACF cam kết:
  1. Hỗ trợ pháp lý miễn phí cho Chủ thể dữ liệu bị thiệt hại
  2. Bồi thường thiệt hại trực tiếp theo quy định của Bộ luật Dân sự 2015
  3. Công khai biện pháp khắc phục trên Cổng minh bạch `verify.acf.market`

---

## X. CẬP NHẬT CHÍNH SÁCH & LIÊN HỆ

### 10.1 Cập nhật chính sách
- ACF có quyền điều chỉnh Chính sách Bảo mật này để phù hợp với thay đổi pháp luật, công nghệ hoặc mô hình kinh doanh.
- Mọi thay đổi sẽ được:
  1. Thông báo trước **07 ngày** qua email, in-app notification, và banner trên website
  2. Hiển thị rõ "Lịch sử phiên bản" với nội dung thay đổi, ngày hiệu lực
  3. Yêu cầu Người dùng xác nhận đồng ý lại với phiên bản mới tại lần đăng nhập tiếp theo (đối với thay đổi trọng yếu)

### 10.2 Liên hệ & Khiếu nại
| Mục đích | Kênh liên hệ | Thời gian phản hồi |
|----------|-------------|-------------------|
| Hỏi đáp chung về bảo mật | `privacy@ecommerceacf.web.app` | ≤ 03 ngày làm việc |
| Yêu cầu thực thi quyền (truy cập, xóa, chuyển dữ liệu) | `dpo@ecommerceacf.web.app` | ≤ 07 ngày làm việc |
| Báo cáo lỗ hổng bảo mật (Bug Bounty) | `security@ecommerceacf.web.app` | ≤ 24 giờ (xác nhận) |
| Khiếu nại pháp lý về xử lý dữ liệu | `legal@ecommerceacf.web.app` + Hotline 1900 066 689 (nhánh 3) | ≤ 05 ngày làm việc |
| Tra cứu trạng thái yêu cầu | `acf.market/privacy-status` (đăng nhập để xem) | Real-time |

---

## XI. PHỤ LỤC & TÀI LIỆU THAM CHIẾU

1. [Biểu mẫu Yêu cầu Thực thi Quyền Chủ thể Dữ liệu]  
2. [Hướng dẫn Kỹ thuật Ẩn danh hóa Dữ liệu cho AI Training]  
3. [Danh sách Bên thứ ba Được ủy quyền Xử lý Dữ liệu (cập nhật hàng quý)]  
4. [Báo cáo Đánh giá Tác động Bảo vệ Dữ liệu (DPIA) – Phiên bản rút gọn công khai]  
5. [Quy trình Ứng phó Sự cố Rò rỉ Dữ liệu (Internal – Tóm tắt)]  

> 📌 **Lưu ý triển khai kỹ thuật:**  
> - Checkbox đồng ý chính sách bảo mật phải là **bắt buộc** trước khi kích hoạt nút "Đăng ký"/"Thanh toán" (tuân thủ Điều 16 NĐ 52/2013).  
> - Log chấp thuận phải bao gồm: timestamp (UTC+7), IP address, device fingerprint, version chính sách – được băm SHA-256 và lưu kép: Firestore + Blockchain Audit.  
> - Cung cấp API endpoint `/api/v1/privacy/export` cho phép user xuất dữ liệu cá nhân machine-readable format (JSON), tuân thủ nguyên tắc data portability.

---

*Văn bản này có giá trị pháp lý cao nhất bằng tiếng Việt. Bản dịch sang ngôn ngữ khác (nếu có) chỉ mang tính tham khảo.*  
*Trân trọng,*  
**Nguyễn Minh Triết**  
*Giám đốc Tăng trưởng & Vận hành Affiliate*  
**IVS JSC – Đơn vị vận hành Sàn ACF**  
*Ngày … tháng … năm 2026*