@echo off
echo ================================================
echo   Smart Library Assistant - Starting...
echo ================================================
echo.

REM Check Java
java -version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Java is not installed. Please install Java 17+.
    pause
    exit /b 1
)

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set LOCAL_IP=%%a
)
set LOCAL_IP=%LOCAL_IP: =%

echo Starting Smart Library Assistant...
echo.
echo Once started, access the app at:
echo   Local:   http://localhost:8080
echo   Network: http://%LOCAL_IP%:8080
echo.
echo Login credentials:
echo   Librarian: librarian@smartlibrary.com / librarian123
echo   Student:   student@smartlibrary.com / student123
echo.
echo Press Ctrl+C to stop the server.
echo ================================================
echo.

java -jar target/smart-library-backend-1.0.0.jar
