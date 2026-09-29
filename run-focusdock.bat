@echo off
title FocusDock
cd /d "%~dp0"
set "ELECTRON_OVERRIDE_DIST_PATH=%~dp0node_modules\electron\dist"
start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0dist\main\index.js"
