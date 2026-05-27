@echo off
echo ==========================================
echo    DANG BUILD APK ACF MART (RELEASE)
echo ==========================================
echo 1. Dang don dep (Cleaning)...
call flutter clean
echo.
echo 2. Dang lay thu vien (Pub get)...
call flutter pub get
echo.
echo 3. Dang tao Icon (Generating Icons)...
call flutter pub run flutter_launcher_icons
echo.
echo 4. Dang build tep APK (Building APK)...
call flutter build apk --release
echo.
echo ==========================================
echo    BUILD THANH CONG!
echo ==========================================
echo Dang mo thu muc chua file APK...
start "" "D:\IVS\Apps\DEVELOPER\acfmart\apps\mobile\build\app\outputs\flutter-apk\"
echo.
pause
