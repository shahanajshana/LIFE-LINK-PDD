@echo off
title LifeLink Expo Mobile App
color 0B

echo.
echo  ======================================================
echo     LifeLink - Starting Expo React Native Mobile App
echo  ======================================================
echo.

cd /d "%~dp0lifelink_mobile"

if not exist node_modules (
    echo [*] Installing dependencies for lifelink_mobile...
    call npm install
)

echo.
echo [*] Starting Expo Development Server...
echo [*] You can press:
echo       [a] -> Open in Android Emulator / Connected Device
echo       [w] -> Open in Web Browser
echo       [r] -> Reload App
echo       [c] -> Show QR code to scan with Expo Go App
echo.
call npx expo start -c

pause
