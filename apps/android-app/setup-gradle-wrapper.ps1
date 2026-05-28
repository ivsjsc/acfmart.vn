# ACFMart - Download Gradle Wrapper

# This script downloads the missing gradle-wrapper.jar file

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ACFMart - Gradle Wrapper Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$wrapperJarPath = "$PSScriptRoot\gradle\wrapper\gradle-wrapper.jar"

# Check if already exists
if (Test-Path $wrapperJarPath) {
    Write-Host "✓ gradle-wrapper.jar already exists!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run: .\gradlew.bat assembleDebug" -ForegroundColor Yellow
    pause
    exit 0
}

Write-Host "Downloading gradle-wrapper.jar..." -ForegroundColor Yellow
Write-Host ""

# Download gradle-wrapper.jar from official source
$downloadUrl = "https://github.com/gradle/gradle/raw/v8.5.0/gradle/wrapper/gradle-wrapper.jar"

try {
    # Create directory if it doesn't exist
    $wrapperDir = "$PSScriptRoot\gradle\wrapper"
    if (-not (Test-Path $wrapperDir)) {
        New-Item -ItemType Directory -Force -Path $wrapperDir | Out-Null
    }

    # Download the file
    Invoke-WebRequest -Uri $downloadUrl -OutFile $wrapperJarPath -UseBasicParsing

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ Success! gradle-wrapper.jar downloaded" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Location: $wrapperJarPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Now you can build the app:" -ForegroundColor Yellow
    Write-Host "  .\gradlew.bat assembleDebug" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "✗ Download failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative solutions:" -ForegroundColor Yellow
    Write-Host "1. Open project in Android Studio (it will auto-download)" -ForegroundColor White
    Write-Host "2. Download manually from:" -ForegroundColor White
    Write-Host "   https://github.com/gradle/gradle/raw/v8.5.0/gradle/wrapper/gradle-wrapper.jar" -ForegroundColor Cyan
    Write-Host "   Save to: gradle\wrapper\gradle-wrapper.jar" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
pause
