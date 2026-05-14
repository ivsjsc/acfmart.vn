#!/bin/bash

# Script để xây dựng và triển khai ứng dụng lên Firebase Hosting
echo "Bắt đầu xây dựng ứng dụng..."

# Xây dựng ứng dụng
npm run build

if [ $? -eq 0 ]; then
  echo "Xây dựng thành công!"
  echo "Bắt đầu triển khai lên Firebase Hosting..."
  
  # Triển khai lên Firebase Hosting
  firebase deploy --only hosting
  
  if [ $? -eq 0 ]; then
    echo "Triển khai thành công!"
    echo "Ứng dụng đã được cập nhật tại: https://acfmart.web.app"
  else
    echo "Lỗi khi triển khai lên Firebase Hosting"
    exit 1
  fi
else
  echo "Lỗi khi xây dựng ứng dụng"
  exit 1
fi