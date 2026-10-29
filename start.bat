@echo off
echo ========================================================
echo   Starting OnboardIQ (React + Express + Node.js)
echo ========================================================
echo Starting Express Backend on port 5000...
start "OnboardIQ Server" cmd /k "cd server && npm start"
echo Starting Vite React Frontend on port 5173...
start "OnboardIQ Client" cmd /k "cd client && npm run dev"
echo.
echo Both services are booting!
echo App will be available at: http://localhost:5173
echo API will be available at: http://localhost:5000/api
echo ========================================================
pause
