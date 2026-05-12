@echo off
echo Starting ACFMart Backend...

REM Check if node_modules exists, if not install dependencies
IF NOT EXIST node_modules (
    echo Installing dependencies...
    npm install
)

REM Run migrations
echo Running migrations...
npm run migrate

REM Start the application
echo Starting application...
npm run start