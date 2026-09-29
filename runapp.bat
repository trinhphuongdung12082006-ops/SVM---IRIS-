@echo off
chcp 65001 >nul
title RUNAPP - HE THONG IRIS SVM VA FASTAPI SQL SERVER
color 0A

echo =======================================================================
echo     RUNAPP - KHOI DONG HE THONG IRIS SVM + FASTAPI SQL SERVER
echo =======================================================================
echo.

echo [1/4] Dang giai phong cong 4444 va 8501 (Tranh xung dot cong port)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4444') do (
    taskkill /f /pid %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8501') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [2/4] Dang kiem tra thu vien NumPy an toan...
python -m pip install "numpy<2" email-validator --quiet

echo [3/4] Dang khoi dong Backend FastAPI tai cong 4444 (SQL Server BONG\SQLEXPRESS)...
start "FastAPI SQL Server (Port 4444)" cmd /k "python main.py"

echo [4/4] Dang khoi dong Giao Dien Web Streamlit...
start "Streamlit Web App (Iris SVM)" cmd /k "streamlit run app.py --server.port 8501 --server.headless true"

echo.
echo Dang cho cac server san sang...
timeout /t 3 >nul

echo Dang mo trinh duyet tu dong...
start http://localhost:8501
start http://127.0.0.1:4444/docs

echo.
echo =======================================================================
echo   DA KHOI DONG THANH CONG TOAN BO HE THONG!
echo.
echo   * Giao Dien Web AI (Streamlit):  http://localhost:8501
echo   * API & Test CSDL SQL Server:   http://127.0.0.1:4444/docs
echo   * CSDL SQL Server 2022:          BONG\SQLEXPRESS (DataManagementDB)
echo =======================================================================
echo   (Ban co the giu cua so nay hoac dong lai tuy y)
pause
