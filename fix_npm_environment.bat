@echo off
setlocal

echo Fixing npm offline/proxy environment for this Command Prompt...
set NPM_CONFIG_OFFLINE=
set HTTP_PROXY=
set HTTPS_PROXY=
set npm_config_offline=
set http_proxy=
set https_proxy=

echo.
echo Removing persistent user environment variables if present...
reg delete HKCU\Environment /v NPM_CONFIG_OFFLINE /f >nul 2>nul
reg delete HKCU\Environment /v HTTP_PROXY /f >nul 2>nul
reg delete HKCU\Environment /v HTTPS_PROXY /f >nul 2>nul
reg delete HKCU\Environment /v npm_config_offline /f >nul 2>nul
reg delete HKCU\Environment /v http_proxy /f >nul 2>nul
reg delete HKCU\Environment /v https_proxy /f >nul 2>nul

echo.
echo Updating npm configuration...
call npm config set offline false
call npm config delete proxy >nul 2>nul
call npm config delete https-proxy >nul 2>nul

echo.
echo Verifying npm cache...
call npm cache verify

echo.
echo Testing npm registry connectivity...
call npm ping

echo.
echo Current npm offline value:
call npm config get offline

echo.
echo Done. Close and reopen terminals so removed user environment variables are fully refreshed.
echo If npm ping failed and you are behind a corporate proxy, configure the real proxy URL instead.
pause

