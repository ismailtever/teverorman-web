@echo off
echo Starting Local Development Server...
echo Press Ctrl+C to stop the server (but you can just close this window).
echo.
start http://localhost:8000
python -m http.server 8000
pause
