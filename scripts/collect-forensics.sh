#!/usr/bin/env bash

# Collects forensic artifacts from a quarantine run into the repo and commits them
# Usage: scripts/collect-forensics.sh <quarantine_forensics_dir>

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <quarantine_forensics_dir>" >&2
  exit 1
fi

SRC_DIR="$1"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST_DIR="$REPO_ROOT/forensics"

if [[ ! -d "$SRC_DIR" ]]; then
  echo "ERROR: Source forensics directory not found: $SRC_DIR" >&2
  exit 2
fi

mkdir -p "$DEST_DIR"
rsync -a "$SRC_DIR/" "$DEST_DIR/"

cd "$REPO_ROOT"
git add forensics/
git commit -m "forensics(cursor): import migration forensics from quarantine run" -m "Source: $SRC_DIR" -m "Signed-off-by: Cursor AI <cursor@novaxe.local>" || true
git push || true

echo "Forensics collected into $DEST_DIR and committed."


