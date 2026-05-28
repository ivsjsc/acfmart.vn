@echo off
REM ACFMart Release Build Script
REM Builds a signed release APK ready for distribution

echo ========================================
echo ACFMart Release Build
echo ========================================
echo.

REM Check if keystore exists
if not exist "..\keystore\acfmart-release-key.jks" (
    echo ERROR: Release keystore not found!
    echo.
    echo Please run generate-keystore.bat first to create a signing key.
    echo.
    pause
    exit /b 1
)

echo Building signed release APK...
echo.

REM Clean previous builds
call .\gradlew.bat clean

REM Build release APK
call .\gradlew.bat assembleRelease

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.

REM Check if APK was generated
if exist "app\build\outputs\apk\release\app-release.apk" (
    echo Release APK generated successfully!
    echo.
    echo Location: app\build\outputs\apk\release\app-release.apk
    echo.
    
    REM Show file size
    for %%A in ("app\build\outputs\apk\release\app-release.apk") do (
        echo File size: %%~zA bytes
    )
    
    echo.
    echo Next steps:
    echo 1. Test the APK on a real device
    echo 2. Verify all features work correctly
    echo 3. Upload to Google Play Console
    echo.
    
    REM Optionally copy to desktop for easy access
    set /p COPY="Copy APK to Desktop? (Y/N): "
    if /i "%COPY%"=="Y" (
        if not exist "%USERPROFILE%\Desktop\ACFMart-Releases" mkdir "%USERPROFILE%\Desktop\ACFMart-Releases"
        copy "app\build\outputs\apk\release\app-release.apk" "%USERPROFILE%\Desktop\ACFMart-Releases\ACFMart-v1.0.0.apk"
        echo.
        echo APK copied to Desktop\ACFMart-Releases\
    )
) else (
    echo ERROR: Build failed! Check the output above for errors.
)

echo.
pause
