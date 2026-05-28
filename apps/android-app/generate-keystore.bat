@echo off
REM ACFMart Release Keystore Generator
REM This script creates a new release keystore for signing the app

echo ========================================
echo ACFMart Release Keystore Generator
echo ========================================
echo.

REM Create keystore directory
if not exist "..\keystore" mkdir "..\keystore"

echo Generating new release keystore...
echo.

REM Generate keystore with keytool
keytool -genkeypair -v ^
  -keystore "..\keystore\acfmart-release-key.jks" ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000 ^
  -alias acfmart-key ^
  -storepass acfmart2024secure ^
  -keypass acfmart2024secure ^
  -dname "CN=ACF Mart, OU=Mobile Development, O=ACF Mart, L=Ho Chi Minh City, ST=Ho Chi Minh, C=VN"

echo.
echo ========================================
echo Keystore generated successfully!
echo ========================================
echo.
echo Location: ..\keystore\acfmart-release-key.jks
echo Alias: acfmart-key
echo Validity: 10000 days (27 years)
echo.
echo IMPORTANT:
echo 1. Keep this keystore file SAFE and BACKED UP
echo 2. NEVER lose it - you can't update your app on Play Store without it
echo 3. NEVER share it publicly
echo 4. Add keystore/ to .gitignore
echo.
pause
