@echo off
title Agri-Connect SIH 2026 PS-132 Prototype
echo ===================================================
echo     Agri-Connect Multi-Tenant Marketplace SaaS
echo              SIH 2026 Problem Statement 132
echo ===================================================
echo.
echo Initializing database and starting server on http://127.0.0.1:8000 ...
echo Press Ctrl+C to stop.
echo.

cd /d "%~dp0backend"
"C:\Program Files\Python314\python.exe" -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload
pause
