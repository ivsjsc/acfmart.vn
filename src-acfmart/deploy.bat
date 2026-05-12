@echo off
REM ACFMart Deployment Script for Windows

echo 🚀 Starting ACFMart deployment process...

REM Navigate to the project directory
cd /d "%~dp0"

echo 📦 Installing dependencies...
call npm install --legacy-peer-deps

echo 🔨 Building the application...
call npm run build

if %errorlevel% neq 0 (
  echo ❌ Build failed!
  pause
  exit /b 1
)

echo ✅ Build successful!

echo 🌐 Deploying to Firebase Hosting...
call firebase deploy --only hosting

if %errorlevel% neq 0 (
  echo ❌ Deployment failed!
  pause
  exit /b 1
)

echo ✅ Deployment completed successfully!
echo You can now access your application at: https://acfmart.web.app
pause