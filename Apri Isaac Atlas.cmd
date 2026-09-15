@echo off
chcp 65001 >nul
title Isaac Atlas
cd /d "%~dp0"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 launch.py
  goto end
)
where python >nul 2>nul
if not errorlevel 1 (
  python launch.py
  goto end
)
echo Installa Python 3.10 o successivo da https://www.python.org/downloads/
echo Durante l'installazione abilita "Add Python to PATH".
pause
exit /b 1
:end
if errorlevel 1 pause
