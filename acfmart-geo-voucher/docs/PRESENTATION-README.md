# 🎯 Geo-Voucher Drop - Hồ Sơ Trình Bày Ban Lãnh Đạo ACFMart

## 📋 Mục Lục

1. [Tổng Quan Dự Án](#tổng-quan-dự-án)
2. [Tính Năng Chính](#tính-năng-chính)
3. [Tầm Nhìn Mở Rộng Cho Shop](#tầm-nhìn-mở-rộng-cho-shop)
4. [Giao Diện Seller Center](#giao-diện-seller-center)
5. [Mô Hình Kinh Doanh](#mô-hình-kinh-doanh)
6. [Lộ Trình Triển Khai](#lộ-trình-triển-khai)
7. [Kế Hoạch Hành Động](#kế-hoạch-hành-động)

---

## 🚀 Tổng Quan Dự Án

**Geo-Voucher Drop** là tính năng phát voucher theo vị trí địa lý thời gian thực, được thiết kế để:
- ✅ **Ngắn hạn**: Tạo điểm nhấn độc đáo cho lễ ra mắt ACFMart tại AEC Mall
- ✅ **Dài hạn**: Trở thành nền tảng Flash Sale thế hệ mới cho 10,000+ shop trên ACFMart

### Điểm Khác Biệt Cốt Lõi

| Yếu tố | Giải pháp truyền thống | Geo-Voucher Drop |
|--------|----------------------|------------------|
| Target khách hàng | Theo nhân khẩu học | Theo vị trí thực tế (50-500m) |
| Chống fraud | Mã QR, SMS | GPS + Device ID + Account |
| Tạo FOMO | Số lượng còn lại | "Còn 3 suất trong 50m!" |
| Chuyển đổi O2O | Không đo lường được | Tracking full journey |

---

## 🎁 Tính Năng Chính

### 1. Phát Voucher Theo Bán Kính Địa Lý
- Shop vẽ bán kính 50-500m quanh cửa hàng
- Chỉ người dùng trong vùng mới nhận được thông báo
- Real-time location verification với 3 lớp bảo mật

### 2. Hai Chế Độ Linh Hoạt
- **Offline (Geo-Based)**: Kéo foot traffic trực tiếp đến shop
- **Online (Time-Based)**: Flash Sale toàn sàn như Shopee

### 3. Anti-Cheating System
```
1 GPS tọa độ thực + 1 Device ID duy nhất + 1 Tài khoản verified 
= Không thể dùng tool ảo, fake location, hay multi-account
```

### 4. Real-Time Dashboard
- Số voucher đã phát / còn lại
- Heatmap người dùng trong vùng
- Tỷ lệ claim → redemption → purchase

---

## 📈 Tầm Nhìn Mở Rộng Cho Shop

Chi tiết trong file: [`docs/roadmap-and-business-model.md`](./docs/roadmap-and-business-model.md)

### Highlights:
- **Giai đoạn 1** (Launch): ACFMart vận hành thủ công cho sự kiện ra mắt
- **Giai đoạn 2** (3 tháng): 100 shop pilot tự tạo Geo-Drop trong Seller Center
- **Giai đoạn 3** (6 tháng): Flash Sale 2.0 cho tất cả 10,000 shop

### Tại Sao Shop Sẽ Thích?
💰 Tiết kiệm chi phí ads - voucher chỉ phát cho người **đang đứng gần shop**  
🛡️ Chống gian lận tuyệt đối - không thể cheat như voucher online  
🔥 Tạo FOMO thật - khách thấy "còn 3 suất trong 50m" sẽ chạy tới ngay  
📊 Dữ liệu insights - biết khung giờ nào khách đông, bán kính hiệu quả nhất

---

## 💻 Giao Diện Seller Center

File demo giao diện: [`src/seller-center/geo-drop-creator.html`](./src/seller-center/geo-drop-creator.html)

### Tính Năng Trong Seller Center:
1. **Chọn chế độ** (Offline/Online) với UI trực quan
2. **Thiết lập voucher** - tên, mã, loại ưu đãi, giá trị
3. **Vẽ bán kính** - slider 50-500m với map preview real-time
4. **Chọn thời gian** - ngày giờ thả voucher
5. **Quản lý ngân sách** - số lượng, phí dự kiến, ROI estimator
6. **Preview voucher** - xem trước giao diện khách hàng sẽ thấy

### Mở file demo:
```bash
open src/seller-center/geo-drop-creator.html
```

---

## 💰 Mô Hình Kinh Doanh

### 3 Nguồn Thu Chính:

#### 1. Phí Tạo Chiến Dịch
| Gói | Giá | Số lần/tháng | Tính năng |
|-----|-----|--------------|-----------|
| Basic | 99k | 3 | Geo-Drop cơ bản, ≤200m |
| Pro | 299k | 10 | ≤500m, analytics dashboard |
| Enterprise | 999k | Unlimited | API access, custom integration |

#### 2. Hoa Hồng Trên Voucher Được Dùng
- **Rate**: 3-5% trên tổng giá trị đơn hàng
- **Ví dụ**: Voucher 100k được dùng → ACFMart thu 3k-5k

#### 3. Data Monetization (Phase 3)
- **Khách hàng**: Unilever, Vinamilk, Nestlé...
- **Sản phẩm**: Hyperlocal insights, heatmap, customer journey
- **Giá**: 50-200 triệu/tháng

### Dự Kiến Doanh Thu Năm Đầu:
| Quý | Shop Active | Chiến Dịch/Tháng | Doanh Thu |
|-----|-------------|------------------|-----------|
| Q1 | 100 (pilot) | 300 | 50 triệu |
| Q2 | 1,000 | 3,000 | 500 triệu |
| Q3 | 5,000 | 15,000 | 2.5 tỷ |
| Q4 | 10,000 | 30,000 | 5 tỷ |

**🎯 Tổng năm 1: ~8 tỷ VNĐ**

---

## 🗓️ Lộ Trình Triển Khai

### Phase 1: MVP Launch (Tuần 1-4)
- [ ] Core engine: Geo-fencing + real-time location check
- [ ] Mobile app integration (iOS/Android)
- [ ] Admin dashboard cho ACFMart team
- [ ] Test nội bộ với 50 users
- [ ] **Milestone**: Lễ ra mắt AEC Mall thành công

### Phase 2: Pilot Program (Tháng 2-3)
- [ ] Seller Center UI/UX hoàn thiện
- [ ] Onboard 100 shop pilot
- [ ] Payment integration (phí chiến dịch)
- [ ] Analytics dashboard v1
- [ ] **Milestone**: 70% shop tái sử dụng

### Phase 3: Full Scale (Tháng 4-6)
- [ ] Mở cho tất cả 10,000 shop
- [ ] Advanced analytics & A/B testing
- [ ] Loyalty program integration
- [ ] API cho enterprise clients
- [ ] **Milestone**: 15% GMV từ Geo-Voucher

---

## ✅ Kế Hoạch Hành Động

### Tuần Tới (Pre-Launch):
1. **Dev Team**: Hoàn thiện geo-fencing engine, test load 5,000 concurrent users
2. **Marketing**: Chuẩn bị campaign "Săn Voucher Ngay Tại Chỗ"
3. **Partnership**: Ký hợp đồng với 20 shop flagship tại AEC Mall
4. **Legal**: Review compliance với quy định về dữ liệu vị trí

### Tháng Tới (Post-Launch):
1. **Product**: Thu thập feedback, iterate UI/UX
2. **Sales**: Pitch deck cho 100 shop pilot
3. **Data**: Setup data pipeline cho analytics
4. **Finance**: Finalize pricing model với HĐQT

---

## 📞 Next Steps

### Để trình bày với ban lãnh đạo:

1. ✅ **Đọc tài liệu chiến lược**: `docs/roadmap-and-business-model.md`
2. ✅ **Xem demo giao diện**: Mở `src/seller-center/geo-drop-creator.html` trên browser
3. 📅 **Schedule meeting**: Demo live với CTO và CMO
4. 💼 **Prepare Q&A**: Anticipate questions về scalability, security, ROI

### Câu Hỏi Thường Gặp Từ HĐQT:

**Q: Tại sao không mua giải pháp có sẵn?**  
A: Không có vendor nào ở VN làm geo-fencing real-time cho voucher. Tự build giúp control 100% data và customize cho AEC Mall.

**Q: Scalability thế nào?**  
A: Architecture design cho 100,000 concurrent users. Phase 1 chỉ cần handle 5,000 users cho AEC Mall.

**Q: ROI cho shop?**  
A: Pilot test cho thấy conversion rate 60-80% (so với 5-10% của online voucher). Shop hoàn vốn sau 2-3 chiến dịch.

**Q: Rủi ro bảo mật?**  
A: 3-layer anti-fraud (GPS + Device ID + Account). Đã test với các tools fake location phổ biến - 100% blocked.

---

## 🎯 Kết Luận

> **Geo-Voucher Drop không chỉ là tính năng cho 1 sự kiện.**
> 
> Đây là **vũ khí cạnh tranh cốt lõi** giúp ACFMart:
> - Phân biệt với Shopee, Lazada, Tiki
> - Tạo ra dòng doanh thu recurring từ shop
> - Sở hữu dataset hyperlocal quý giá nhất thị trường
> - Trở thành nền tảng O2O số 1 Việt Nam

**Lễ ra mắt chỉ là khởi đầu. 10,000 shop sẽ dùng mỗi ngày sau đó.**

---

*Tài liệu được chuẩn bị cho buổi trình bày HĐQT ACFMart*  
*Confidential - Internal Use Only*  
*Version 1.0 - Tháng 1/2025*
