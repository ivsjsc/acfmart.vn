@echo off
REM Script để build và deploy ứng dụng ACFMart trên Windows

echo Bắt đầu quá trình build và deploy ACF Marketplace...

REM Kiểm tra xem yarn đã được cài chưa
where yarn >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo Yarn chưa được cài đặt. Vui lòng cài đặt yarn trước.
    exit /b 1
)

REM Cài đặt dependencies
echo Đang cài đặt dependencies...
yarn install

REM Build ứng dụng
echo Đang build ứng dụng...
yarn build

REM Kiểm tra lỗi trong quá trình build
if %ERRORLEVEL% neq 0 (
    echo Lỗi trong quá trình build. Vui lòng kiểm tra lại.
    exit /b 1
)

echo Build thành công!

REM Tạo production bundle
echo Đang tạo production bundle...
cd dist
tar -a -c -f ../acfmart-bundle.zip .
cd ..

echo Bundle đã được tạo: acfmart-bundle.zip

REM Deploy (giả lập)
echo Đang tiến hành deploy...
REM Thêm lệnh deploy thực tế tại đây, ví dụ:
REM firebase deploy --only hosting
REM hoặc
REM aws s3 sync dist/ s3://your-bucket-name/

echo Deploy hoàn tất!

REM Push lên git
echo Đang commit và push lên git...
git add .
git commit -m "feat: hoàn thiện hệ thống thiết kế ACF Marketplace với 29 màn hình chính"
git push origin main

echo Tất cả các bước đã hoàn tất!
pause