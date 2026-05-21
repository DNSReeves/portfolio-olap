@echo off
setlocal

cd /d "%~dp0"

echo Portfolio OLAP workspace
echo %CD%
echo.

echo Key files:
echo - OLAP Portfolio Dashboard v2.0 SPA React.txt
echo - custom_sleeve_definitions.json
echo - USER_MANUAL.md
echo - fixtures\
echo.

echo Clearing npm offline/proxy variables for this window only...
set NPM_CONFIG_OFFLINE=
set HTTP_PROXY=
set HTTPS_PROXY=
set npm_config_offline=
set http_proxy=
set https_proxy=

echo.
echo Running app validation...
call npm run build
if errorlevel 1 (
  echo.
  echo Build validation failed. Review the output above.
  pause
  exit /b 1
)

echo.
echo Starting local app server in a new window...
start "Portfolio OLAP Local Server" cmd /k "cd /d ""%~dp0"" && npm run dev"

echo.
echo App URL:
echo http://127.0.0.1:4173/
echo.
echo Design document:
echo %CD%\OLAP Portfolio Dashboard v2.0 SPA React.txt
echo.
echo If the browser does not open automatically, paste the app URL into your browser.
start "" "http://127.0.0.1:4173/"

pause
