#!/bin/bash
# Install + start the always-on OLAP static-server LaunchDaemon (com.dnsr.olap).
# Idempotent: re-running reloads cleanly. Run with sudo:
#     sudo bash /Users/david/agentic_software_from_scratch/olap/install_olap_daemon.sh
set -euo pipefail

LABEL="com.dnsr.olap"
SRC="$(cd "$(dirname "$0")" && pwd)/${LABEL}.plist"
DEST="/Library/LaunchDaemons/${LABEL}.plist"

if [ "$(id -u)" -ne 0 ]; then
  echo "ERROR: must run with sudo  ->  sudo bash $0"; exit 1
fi
if [ ! -f "$SRC" ]; then
  echo "ERROR: plist not found at $SRC"; exit 1
fi

echo "1/3  install  $SRC -> $DEST"
install -o root -g wheel -m 644 "$SRC" "$DEST"

echo "2/3  (re)bootstrap into system domain"
launchctl bootout   system "$DEST" 2>/dev/null || true   # no-op if not loaded
launchctl bootstrap system "$DEST"
launchctl enable    "system/${LABEL}" 2>/dev/null || true

echo "3/3  verify"
sleep 1
launchctl print "system/${LABEL}" 2>/dev/null | grep -E "state =|pid =" || echo "  (state unavailable)"
curl -s -o /dev/null -w "  http 127.0.0.1:8787 -> %{http_code}\n" --max-time 3 http://127.0.0.1:8787/ || echo "  not serving yet"
echo "DONE — bookmark http://192.168.1.70:8787/"
