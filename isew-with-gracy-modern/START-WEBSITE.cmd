@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 20 or newer, then run this file again.
  pause
  exit /b 1
)
echo Open http://localhost:5173 in your browser after the server starts.
echo Do not open dist HTML files by double-clicking them.
node scripts/dev-server.mjs
pause
