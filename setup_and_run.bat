@echo off
setlocal enabledelayedexpansion

echo 🌌 Initializing GravityLab...

:: Check for Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed.
    echo 👉 Please install Node.js (v16 or higher) from https://nodejs.org/
    pause
    exit /b
)

echo ✅ Node.js found.

:: Install dependencies if node_modules is missing
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
) else (
    echo ✅ Dependencies already installed.
)

:: Start the application
echo 🚀 Launching GravityLab...
echo 🌐 Open your browser to the URL shown below (usually http://localhost:5173)
call npm run dev
pause
