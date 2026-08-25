@echo off
setlocal
title HORIZ Website - Local Server
cd /d "%~dp0"

echo ========================================
echo          HORIZ WEBSITE LAUNCHER
echo ========================================
echo.

where node.exe >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed.
  echo Install Node.js from https://nodejs.org then try again.
  echo.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm.cmd was not found.
  echo Reinstall Node.js then try again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\.bin\vite.cmd" (
  echo Installing website libraries. Please wait...
  call npm.cmd install
  if errorlevel 1 goto :error
)

echo Starting HORIZ...
echo The browser will open automatically.
echo Keep this window open while using the website.
echo Press Ctrl+C to stop the website.
echo.

call "node_modules\.bin\vite.cmd" "apps\storefront" --host 127.0.0.1 --open
if errorlevel 1 goto :error
exit /b 0

:error
echo.
echo ERROR: The website could not start.
echo Take a screenshot of this window and send it to Codex.
echo.
pause
exit /b 1
