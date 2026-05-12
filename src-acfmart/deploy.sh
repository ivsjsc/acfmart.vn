#!/bin/bash

# ACFMart Deployment Script

echo "🚀 Starting ACFMart deployment process..."

# Navigate to the project directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

echo "🔨 Building the application..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful!"
  
  echo "🌐 Deploying to Firebase Hosting..."
  firebase deploy --only hosting
  
  if [ $? -eq 0 ]; then
    echo "🎉 Deployment completed successfully!"
    echo "You can now access your application at: https://acfmart.web.app"
  else
    echo "❌ Deployment failed!"
    exit 1
  fi
else
  echo "❌ Build failed!"
  exit 1
fi