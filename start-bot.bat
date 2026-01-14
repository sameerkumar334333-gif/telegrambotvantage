@echo off
echo ========================================
echo Starting Telegram Bot...
echo ========================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

echo Building TypeScript...
call npm run build:ts

echo.
echo Starting bot server...
echo Admin Panel: http://localhost:3000/admin
echo Press Ctrl+C to stop the bot
echo ========================================
echo.

call npm run dev

pause

