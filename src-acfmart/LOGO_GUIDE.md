# Hướng dẫn tích hợp Logo cho ACF Marketplace

## Tổng quan
Tài liệu này mô tả cách tích hợp và sử dụng logo trong ứng dụng ACF Marketplace, bao gồm cả trên web và ứng dụng di động.

## Vị trí Logo

### Web
- Thư mục: `/public/`
- File chính: `logo.png`
- Kích thước khuyến nghị: 200x200 pixels trở lên

### Ứng dụng di động (React Native)
- Thư mục: `/assets/images/`
- File: `logo.png`
- Kích thước: Nên có nhiều kích thước khác nhau (200x200, 400x400, 800x800)

## Cách sử dụng trong ứng dụng

### Trong React Components
```jsx
import Logo from '../../../components/Logo';

// Sử dụng với kích thước mặc định (80x80)
<Logo />

// Sử dụng với kích thước tùy chỉnh
<Logo size={100} />
```

### Trong các màn hình chính
Logo được hiển thị trong:
- Màn hình đăng nhập (`LoginScreen`)
- Màn hình chính (`HomeScreen`)
- Tiêu đề ứng dụng

## Thiết kế logo
- Màu sắc: Sử dụng màu đỏ truyền thống của quốc kỳ Việt Nam (#dc2626) kết hợp với màu vàng kim (#f59e0b)
- Biểu tượng: Nên có hình ảnh liên quan đến việc xác thực chính hãng (ví dụ: dấu kiểm, shield)
- Văn bản: "ACF Marketplace" hoặc "ACF" nếu là logo rút gọn

## Tối ưu hóa hiệu suất
- Nén hình ảnh để giảm kích thước file
- Sử dụng định dạng PNG cho hình ảnh có nền trong suốt
- Thêm bộ nhớ đệm cho hình ảnh trong ứng dụng

## Triển khai
Khi triển khai ứng dụng lên Firebase Hosting, logo sẽ được lưu trữ trong thư mục `public` và được phân phối thông qua CDN để tăng tốc độ tải.

## Cập nhật logo
Để cập nhật logo:
1. Thay thế file `public/logo.png` bằng phiên bản mới
2. Nếu cần, cập nhật file `assets/images/logo.png` cho ứng dụng di động
3. Kiểm tra lại tất cả các nơi sử dụng logo để đảm bảo hiển thị đúng
4. Triển khai lại ứng dụng

## Lưu ý
- Luôn giữ tỷ lệ khung hình ban đầu của logo
- Không kéo giãn logo gây méo mó
- Kiểm tra hiển thị trên nhiều kích thước màn hình khác nhau