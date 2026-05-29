@echo off
REM ========================================
REM ACFMart - Secure Release Keystore Generator
REM ========================================
echo.
echo ========================================
echo  ACFMart Release Keystore Generator
echo ========================================
echo.
echo This will create a SECURE keystore for Google Play Store
echo.
echo IMPORTANT:
echo - You will be prompted to enter your OWN secure password
echo - Use a STRONG password (min 8 characters)
echo - BACK UP this keystore - you CANNOT update app without it!
echo - NEVER lose or share this file
echo.
pause

REM Create keystore directory
if not exist "..\keystore" mkdir "..\keystore"

echo.
echo Generating secure keystore...
echo You will be prompted to enter passwords.
echo.

REM Generate keystore with INTERACTIVE password prompt
keytool -genkeypair -v ^
  -keystore "..\keystore\acfmart-release-key.jks" ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000 ^
  -alias acfmart-key ^
  -dname "CN=ACF Mart, OU=Mobile Development, O=ACF Mart Co Ltd, L=Ho Chi Minh City, ST=Ho Chi Minh, C=VN"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Keystore generation failed!
    echo Please try again.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  SUCCESS! Keystore generated
echo ========================================
echo.
echo Location: ..\keystore\acfmart-release-key.jks
echo Alias: acfmart-key
echo Validity: 10000 days (27 years)
echo.
echo NEXT STEPS:
echo 1. Update keystore.properties with your new password
echo 2. BACK UP the keystore file to a secure location
echo 3. NEVER commit keystore files to Git
echo.
echo Press any key to open keystore folder...
pause > nul

REM Open keystore folder
if exist "..\keystore" explorer "..\keystore"
