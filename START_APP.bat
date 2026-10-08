@echo off
title LifeLink Dev Server
color 0A

echo.
echo  ============================================
echo   LifeLink - Starting Dev Server + USB Setup
echo  ============================================
echo.

:: Step 1 - Kill any old node processes on port 3000
echo [1/4] Clearing old server instances...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 "') do (
    taskkill /PID %%a /F >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: Step 2 - Start the React dev server in a new window
echo [2/4] Starting React dev server on port 3000...
start "LifeLink Server" cmd /k "cd /d C:\Users\Chand\OneDrive\Desktop\LifeLink\frontend && npm run start:network"

:: Step 3 - Wait for server to be ready
echo [3/4] Waiting for server to compile (30 seconds)...
timeout /t 30 /nobreak >nul

:: Step 4 - ADB reverse port forward
echo [4/4] Setting up USB port forwarding...
adb reverse tcp:3000 tcp:3000
if %errorlevel% == 0 (
    echo      USB port forward SUCCESS - port 3000 forwarded to phone
) else (
    echo      WARNING: ADB failed - make sure phone is connected with USB Debugging on
)

:: Step 5 - Print QR code
echo.
echo  ============================================
echo   Scan QR below in Chrome on your phone:
echo  ============================================
echo.
node -e "var q=require('C:/Users/Chand/OneDrive/Desktop/LifeLink/frontend/node_modules/qrcode-terminal');q.generate('http://localhost:3000',{small:true},function(r){console.log(r);})"

echo.
echo  ============================================
echo   App URL:  http://localhost:3000
echo   Network:  http://192.168.43.204:3000
echo  ============================================
echo.
echo  Server is running in the other window.
echo  Keep BOTH windows open while using the app.
echo.
pause
