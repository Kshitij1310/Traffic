@echo off
echo ============================================================
echo Smart Traffic Optimization System - Setup Script
echo B.Tech Final Year Project 2026
echo ============================================================
echo.

echo Step 1: Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH!
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)
echo Python found!
echo.

echo Step 2: Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    echo Virtual environment created!
) else (
    echo Virtual environment already exists!
)
echo.

echo Step 3: Activating virtual environment...
call venv\Scripts\activate.bat
echo.

echo Step 4: Upgrading pip...
python -m pip install --upgrade pip
echo.

echo Step 5: Installing dependencies...
echo This may take 5-10 minutes for first-time installation...
pip install -r requirements.txt
echo.

echo Step 6: Creating uploads directory...
if not exist "static\uploads" mkdir static\uploads
echo.

echo ============================================================
echo Setup Complete!
echo ============================================================
echo.
echo NEXT STEPS:
echo.
echo 1. Setup MySQL database:
echo    mysql -u root -p ^< database.sql
echo.
echo 2. Update database credentials in app.py
echo.
echo 3. Run the application:
echo    python app.py
echo.
echo 4. Access at: http://localhost:5000
echo.
echo ============================================================
pause
