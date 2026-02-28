@echo off
echo ============================================================
echo Smart Traffic Optimization System
echo B.Tech Final Year Project 2026
echo ============================================================
echo.

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Starting Flask application...
echo.
echo Access the application at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ============================================================

python app.py

pause
