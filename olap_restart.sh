#!/bin/bash
# olap_restart.sh — restart ONLY the OLAP dashboard daemon (com.dnsr.olap).
#
# The OLAP runs as a system LaunchDaemon (root), so managing it needs root. This script is
# deliberately SINGLE-PURPOSE — it kickstarts (or bootstraps) the OLAP service and nothing
# else — so it is safe to grant a passwordless sudoers entry, mirroring the agent's
# dnsr_agent_management.sh pattern.
#
# Run:   sudo /Users/david/agentic_software_from_scratch/olap/olap_restart.sh
#
# Passwordless setup (one time, via `sudo visudo`):
#   david ALL=(root) NOPASSWD: /Users/david/agentic_software_from_scratch/olap/olap_restart.sh
# After that, `sudo /Users/david/agentic_software_from_scratch/olap/olap_restart.sh` runs
# without a prompt. (Keep the script owned by root and not group/world-writable, or sudo will
# refuse to honor the NOPASSWD rule.)
set -uo pipefail

SERVICE="system/com.dnsr.olap"
PLIST="/Library/LaunchDaemons/com.dnsr.olap.plist"
PORT=8787

info(){ printf "[olap] %s\n" "$*"; }

# Must run as root (via sudo) so launchctl can manage the system daemon.
if [ "$(id -u)" -ne 0 ]; then
  info "must run as root:  sudo $0"
  exit 1
fi

if launchctl print "$SERVICE" >/dev/null 2>&1; then
  info "restarting $SERVICE (kickstart -k)…"
  launchctl kickstart -k "$SERVICE"
else
  info "service not loaded — bootstrapping from $PLIST"
  launchctl bootstrap system "$PLIST" 2>/dev/null || true
fi

# Verify it came back (poll briefly — kickstart returns before the new process is ready).
for _ in 1 2 3 4 5; do
  sleep 1
  if launchctl print "$SERVICE" 2>/dev/null | grep -q "state = running"; then
    PID=$(launchctl print "$SERVICE" 2>/dev/null | awk -F'= ' '/^[[:space:]]*pid =/{print $2; exit}')
    info "OLAP daemon running (pid ${PID:-?}) on :$PORT — Load 3F endpoint live."
    exit 0
  fi
done

info "WARNING: OLAP daemon not confirmed running — check:  sudo launchctl print $SERVICE"
exit 1
