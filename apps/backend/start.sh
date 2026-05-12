#!/bin/bash

# ACFMart Backend Startup Script

echo "Starting ACFMart Backend..."

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run migrations
echo "Running migrations..."
npm run migrate

# Start the application
echo "Starting application..."
npm run start