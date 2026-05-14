@echo off
REM Script để xây dựng và triển khai ứng dụng lên Firebase Hosting

echo Bắt đầu xây dựng ứng dụng...

REM Xây dựng ứng dụng
npm run build

if %errorlevel% == 0 (
  echo Xây dựng thành công!
  echo Bắt đầu triển khai lên Firebase Hosting...
  
  REM Triển khai lên Firebase Hosting
  firebase deploy --only hosting
  
  if %errorlevel% == 0 (
    echo Triển khai thành công!
    echo Ứng dụng đã được cập nhật tại: https://acfmart.web.app
  ) else (
    echo Lỗi khi triển khai lên Firebase Hosting
    pause
    exit /b 1
  )
) else (
  echo Lỗi khi xây dựng ứng dụng
  pause
  exit /b 1
)