@echo off
echo Freeing up ports and starting all services...
setlocal
set "ports=80 5000"
for %%p in (%ports%) do (
    echo Killing process on port %%p...
    netstat -ano | findstr :%%p >nul
    if %errorlevel%==0 (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p') do (
            taskkill /PID %%a /F >nul 2>&1
            echo Process on port %%p killed.
        )
    ) else (
        echo No process found on port %%p.
    )
)
echo Starting services...
cd /d "%~dp0\src\"
start /B npm run dev
cd /d "%~dp0\src\public"
start /B python -m http.server 80
start chrome "http://virtualxi.com"
pause
