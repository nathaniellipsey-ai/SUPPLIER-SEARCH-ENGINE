@echo off
REM Walmart Supplier Portal - Server Launcher
REM Starts all three servers needed for the dashboard

echo.
echo ====================================================
echo  Walmart Supplier Portal - Starting Servers
echo ====================================================
echo.

cd /d "%~dp0"

REM Start Data Server (Port 3001) in a new window
echo Starting Data Server on port 3001...
start "Data Server" cmd /k python data_server.py
timeout /t 2 /nobreak

REM Start Backend API (Port 3000) in a new window
echo Starting Backend API on port 3000...
start "Backend API" cmd /k python backend_api.py
timeout /t 2 /nobreak

REM Start Frontend Server (Port 3002) in a new window
echo Starting Frontend Server on port 3002...
start "Frontend Server" cmd /k python frontend_server.py

echo.
echo ====================================================
echo  All servers started!
echo  Open in browser: http://localhost:3002
echo ====================================================
echo.
pause
