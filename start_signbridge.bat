@echo off
echo =====================================================================
echo                SIGNBRIDGE AI - HACKATHON MVP
echo      AI-Powered Two-Way Communication Bridge for Indian Sign Language
echo =====================================================================
echo.

echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "SignBridge AI - Backend API" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Vite Frontend on http://127.0.0.1:5173 ...
start "SignBridge AI - Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --host 127.0.0.1 --port 5173"

timeout /t 3 /nobreak >nul

echo [3/3] Opening SignBridge AI in your default web browser...
start http://127.0.0.1:5173

echo.
echo =====================================================================
echo  SignBridge AI is now running!
echo  - Frontend Workspace: http://127.0.0.1:5173
echo  - Backend API Docs:   http://127.0.0.1:8000/docs
echo =====================================================================
pause
