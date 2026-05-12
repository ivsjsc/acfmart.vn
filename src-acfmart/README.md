# ACF Marketplace - Hệ thống thương mại điện tử xác thực chính hãng

## Giới thiệu

ACF (Anti-Counterfeit) Marketplace là nền tảng thương mại điện tử tại Việt Nam tập trung vào việc xác thực sản phẩm chính hãng thông qua hệ thống quét mã QR và AI. Dự án này bao gồm 29 màn hình chính với hệ thống thiết kế hoàn chỉnh, tuân thủ các tiêu chuẩn UX/UI hiện đại và tập trung vào việc ngăn chặn hàng giả.

## Tính năng chính

- Xác thực sản phẩm chính hãng qua mã QR
- Hệ thống đánh giá và xác minh người bán
- Giao diện thân thiện với người dùng Việt Nam
- Tích hợp AI để phát hiện hàng giả
- Hỗ trợ live commerce
- Chương trình affiliate
- Quản lý đơn hàng toàn diện

## Công nghệ sử dụng

- React Native với Expo
- TypeScript cho kiểm tra kiểu mạnh mẽ
- Hệ thống thiết kế token hóa
- React Navigation cho điều hướng
- Native Base hoặc React Native Elements cho UI components

## Cấu trúc thư mục

```
src-acfmart/
├── design-system/           # Hệ thống thiết kế token
├── features/               # Các tính năng chính
│   ├── auth/              # Xác thực
│   ├── home/              # Trang chủ
│   ├── product/           # Sản phẩm
│   ├── search/            # Tìm kiếm
│   ├── cart/              # Giỏ hàng
│   ├── order/             # Đơn hàng
│   ├── qr-verify/         # Xác thực QR
│   ├── account/           # Tài khoản
│   ├── affiliate/         # Chương trình affiliate
│   ├── live/              # Live commerce
│   └── checkout/          # Thanh toán
├── components/             # Component chung
├── services/               # Dịch vụ backend
├── utils/                  # Hàm tiện ích
└── types/                  # Định nghĩa kiểu
```

## Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd acfmart/src-acfmart
```

2. Cài đặt dependencies:

```bash
yarn install
```

## Phát triển

Để chạy ứng dụng ở chế độ phát triển:

```bash
yarn dev
```

## Build

Để build ứng dụng cho production:

```bash
yarn build
```

## Deploy

Sử dụng script có sẵn để build, tạo bundle và deploy:

### Trên Linux/Mac:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Trên Windows:
```cmd
scripts\deploy.bat
```

## Đóng góp

Chúng tôi luôn hoan nghênh sự đóng góp từ cộng đồng. Vui lòng đọc [CONTRIBUTING.md](../../CONTRIBUTING.md) để biết thêm chi tiết.

## Giấy phép

Dự án này được cấp phép theo giấy phép MIT - xem tệp [LICENSE](../../LICENSE) để biết thêm chi tiết.