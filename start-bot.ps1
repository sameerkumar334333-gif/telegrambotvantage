# Telegram Bot Startup Script
# Double-click this file or run: .\start-bot.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Telegram Bot..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Build TypeScript
Write-Host "Building TypeScript..." -ForegroundColor Yellow
npm run build:ts

# Start the bot
Write-Host ""
Write-Host "Starting bot server..." -ForegroundColor Green
Write-Host "Admin Panel: http://localhost:3000/admin" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the bot" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev

