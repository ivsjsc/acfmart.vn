#!/bin/bash

# Script để build và deploy ứng dụng ACFMart

echo "Bắt đầu quá trình build và deploy ACF Marketplace..."

# Kiểm tra xem yarn đã được cài chưa
if ! command -v yarn &> /dev/null; then
    echo "Yarn chưa được cài đặt. Vui lòng cài đặt yarn trước."
    exit 1
fi

# Cài đặt dependencies
echo "Đang cài đặt dependencies..."
yarn install

# Build ứng dụng
echo "Đang build ứng dụng..."
yarn build

# Kiểm tra lỗi trong quá trình build
if [ $? -ne 0 ]; then
    echo "Lỗi trong quá trình build. Vui lòng kiểm tra lại."
    exit 1
fi

echo "Build thành công!"

# Tạo production bundle
echo "Đang tạo production bundle..."
cd dist
zip -r ../acfmart-bundle.zip .

echo "Bundle đã được tạo: acfmart-bundle.zip"

# Deploy (giả lập)
echo "Đang tiến hành deploy..."
# Thêm lệnh deploy thực tế tại đây, ví dụ:
# firebase deploy --only hosting
# hoặc
# aws s3 sync dist/ s3://your-bucket-name/

echo "Deploy hoàn tất!"

# Push lên git
echo "Đang commit và push lên git..."
git add .
git commit -m "feat: hoàn thiện hệ thống thiết kế ACF Marketplace với 29 màn hình chính"
git push origin main

echo "Tất cả các bước đã hoàn tất!"